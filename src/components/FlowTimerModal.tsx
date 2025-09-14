import React, { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { toast } from 'sonner@2.0.3'
import { motion, AnimatePresence } from 'motion/react'
import { createJarvisSpeech } from '../utils/jarvis-voice'
import { 
  Play, 
  Pause, 
  SkipForward, 
  CheckCircle2, 
  Clock, 
  Target,
  Volume2,
  X,
  Sparkles
} from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  estimatedTime?: number
}

interface FlowTimerModalProps {
  isOpen: boolean
  onClose: () => void
  tasks: Task[]
  onTaskComplete: (taskId: string) => void
}

interface TimerTask extends Task {
  timeInSeconds: number
  completed: boolean
  order: number
}

export function FlowTimerModal({ isOpen, onClose, tasks, onTaskComplete }: FlowTimerModalProps) {
  const [timerTasks, setTimerTasks] = useState<TimerTask[]>([])
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [allTasksComplete, setAllTasksComplete] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Initialize timer tasks when modal opens
  useEffect(() => {
    if (isOpen && tasks.length > 0) {
      const activeTasks = tasks.filter(t => t && !t.completed)
      const processedTasks: TimerTask[] = activeTasks.map((task, index) => ({
        ...task,
        // Make first task 10 seconds, others use their estimated time in hours converted to seconds
        timeInSeconds: index === 0 ? 10 : (task.estimatedTime || 1) * 60, // Use minutes instead of hours for demo
        completed: false,
        order: index
      }))
      
      setTimerTasks(processedTasks)
      setCurrentTaskIndex(0)
      setTimeRemaining(processedTasks[0]?.timeInSeconds || 10)
      setIsRunning(false)
      setIsPaused(false)
      setAllTasksComplete(false)
    }
  }, [isOpen, tasks])

  // Timer logic
  useEffect(() => {
    if (isRunning && !isPaused && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Task completed
            completeCurrentTask()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, isPaused, timeRemaining])

  // Text-to-speech function with consistent Jarvis-like voice
  const speakText = async (text: string) => {
    try {
      // Check if environment variable exists for TTS API
      const env = import.meta.env || {}
      const ttsApiKey = env.VITE_TEXT_TO_SPEECH_API_KEY
      
      if (!ttsApiKey) {
        console.log('TTS API key not configured - using browser speech synthesis')
      }
      
      // Use the centralized Jarvis voice utility
      await createJarvisSpeech(text)
      console.log('Jarvis speech completed successfully')
      
    } catch (error) {
      console.error('Error with text-to-speech:', error)
      // Don't show error toast, just log it
      console.log('Falling back to silent mode')
    }
  }

  const completeCurrentTask = () => {
    const currentTask = timerTasks[currentTaskIndex]
    if (!currentTask) return

    // Mark current task as completed
    setTimerTasks(prev => prev.map((task, index) => 
      index === currentTaskIndex ? { ...task, completed: true } : task
    ))

    // Call the parent callback
    onTaskComplete(currentTask.id)

    // Move to next task or finish
    const nextIndex = currentTaskIndex + 1
    if (nextIndex < timerTasks.length) {
      setCurrentTaskIndex(nextIndex)
      setTimeRemaining(timerTasks[nextIndex].timeInSeconds)
      
      // Speak transition message
      const nextTask = timerTasks[nextIndex]
      speakText(`Excellent work, sir. Task successfully completed. Proceeding to next objective: ${nextTask.title}. Time allocation: ${Math.ceil(nextTask.timeInSeconds / 60)} minutes. Maintaining productivity momentum.`)
      
      toast.success(`✅ Task completed! Moving to: ${nextTask.title}`)
    } else {
      // All tasks completed
      setAllTasksComplete(true)
      setIsRunning(false)
      speakText('Outstanding performance, sir. All objectives in your optimized workflow have been successfully completed. Productivity metrics are excellent. Well done.')
      toast.success('🎉 All tasks completed! Great work!')
    }
  }

  const startTimer = () => {
    setIsRunning(true)
    setIsPaused(false)
    
    const currentTask = timerTasks[currentTaskIndex]
    if (currentTask) {
      speakText(`Initiating optimized workflow protocol, sir. Your first task: ${currentTask.title}. Duration allocated: ${Math.ceil(timeRemaining / 60)} minutes. I recommend maintaining focused attention for optimal results.`)
    }
  }

  const pauseTimer = () => {
    setIsPaused(true)
    speakText('Workflow temporarily suspended, sir. I recommend a brief respite to maintain optimal cognitive performance. Resume at your discretion.')
  }

  const resumeTimer = () => {
    setIsPaused(false)
    speakText('Resuming workflow protocol, sir. Your focus and determination are commendable. Proceeding with current objective.')
  }

  const skipTask = () => {
    if (currentTaskIndex < timerTasks.length - 1) {
      const nextIndex = currentTaskIndex + 1
      setCurrentTaskIndex(nextIndex)
      setTimeRemaining(timerTasks[nextIndex].timeInSeconds)
      
      const nextTask = timerTasks[nextIndex]
      speakText(`Advancing to next objective, sir: ${nextTask.title}. Adjusting workflow sequence as requested.`)
      toast.info(`Skipped to: ${nextTask.title}`)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'from-red-400 to-red-500'
      case 'medium': return 'from-yellow-400 to-yellow-500'
      case 'low': return 'from-green-400 to-green-500'
      default: return 'from-gray-400 to-gray-500'
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const currentTask = timerTasks[currentTaskIndex]
  const progress = currentTask ? ((currentTask.timeInSeconds - timeRemaining) / currentTask.timeInSeconds) * 100 : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center text-blue-700">
            <Sparkles className="w-5 h-5 mr-2" />
            Optimized Flow Timer
          </DialogTitle>
          <DialogDescription>
            Jarvis will guide you through your optimized task sequence with voice announcements and smart timing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Overview */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Tasks Complete</p>
              <p className="text-2xl font-bold text-green-600">
                {timerTasks.filter(t => t.completed).length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Tasks Remaining</p>
              <p className="text-2xl font-bold text-blue-600">
                {timerTasks.length - timerTasks.filter(t => t.completed).length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-700">
                {timerTasks.length}
              </p>
            </div>
          </div>

          {/* Current Task Card */}
          <AnimatePresence mode="wait">
            {currentTask && !allTasksComplete && (
              <motion.div
                key={currentTask.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {currentTask.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          {currentTask.description}
                        </p>
                        <Badge className={getPriorityBadgeColor(currentTask.priority)}>
                          {currentTask.priority} priority
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600 mb-1">
                          {formatTime(timeRemaining)}
                        </div>
                        <p className="text-sm text-gray-500">remaining</p>
                      </div>
                    </div>

                    <Progress value={progress} className="mb-4" />

                    <div className="flex items-center justify-center space-x-3">
                      {!isRunning ? (
                        <Button
                          onClick={startTimer}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Focus Session
                        </Button>
                      ) : (
                        <>
                          {isPaused ? (
                            <Button
                              onClick={resumeTimer}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Resume
                            </Button>
                          ) : (
                            <Button
                              onClick={pauseTimer}
                              variant="outline"
                              className="border-orange-200 text-orange-600 hover:bg-orange-50"
                            >
                              <Pause className="w-4 h-4 mr-2" />
                              Pause
                            </Button>
                          )}
                          
                          <Button
                            onClick={completeCurrentTask}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Complete Task
                          </Button>
                          
                          {currentTaskIndex < timerTasks.length - 1 && (
                            <Button
                              onClick={skipTask}
                              variant="outline"
                              className="border-gray-200 text-gray-600 hover:bg-gray-50"
                            >
                              <SkipForward className="w-4 h-4 mr-2" />
                              Skip
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Completion Message */}
          <AnimatePresence>
            {allTasksComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                  <CardContent className="p-6 text-center">
                    <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-600" />
                    <h3 className="text-xl font-bold text-green-700 mb-2">
                      Congratulations! 🎉
                    </h3>
                    <p className="text-green-600 mb-4">
                      You've completed all tasks in your optimized flow!
                    </p>
                    <Button
                      onClick={onClose}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Finish Session
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Task Queue */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Task Queue
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {timerTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    index === currentTaskIndex 
                      ? 'border-blue-300 bg-blue-50' 
                      : task.completed 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : index === currentTaskIndex ? (
                      <Clock className="w-5 h-5 text-blue-600" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                    )}
                    <div>
                      <p className={`font-medium ${
                        task.completed ? 'text-green-700 line-through' : 
                        index === currentTaskIndex ? 'text-blue-700' : 'text-gray-700'
                      }`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {task.timeInSeconds < 60 ? 
                          `${task.timeInSeconds}s` : 
                          `${Math.ceil(task.timeInSeconds / 60)}m`
                        }
                      </p>
                    </div>
                  </div>
                  <Badge className={getPriorityBadgeColor(task.priority)} size="sm">
                    {task.priority}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}