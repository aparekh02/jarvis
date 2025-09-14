import React, { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Progress } from './ui/progress'
import { Separator } from './ui/separator'
import { toast } from 'sonner@2.0.3'
import { motion } from 'motion/react'
import { 
  Calendar, 
  Clock, 
  Target, 
  BookOpen,
  Edit3,
  Save,
  X,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Users,
  Volume2,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string
  dueDate: string
  priority: 'low' | 'medium' | 'high'
  project?: string
  course?: string
  type?: 'manual' | 'classroom'
  completed: boolean
  estimatedTime?: number
  createdAt: string
}

interface TaskDetailModalProps {
  task: Task
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export function TaskDetailModal({ task, isOpen, onClose, onUpdate }: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTask, setEditedTask] = useState(task)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeUntilDue = (dueDate: string) => {
    const now = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-600', urgency: 'high' }
    if (diffDays === 0) return { text: 'Due today', color: 'text-orange-600', urgency: 'high' }
    if (diffDays === 1) return { text: 'Due tomorrow', color: 'text-yellow-600', urgency: 'medium' }
    if (diffDays <= 3) return { text: `Due in ${diffDays} days`, color: 'text-yellow-600', urgency: 'medium' }
    if (diffDays <= 7) return { text: `Due in ${diffDays} days`, color: 'text-blue-600', urgency: 'low' }
    return { text: `Due in ${diffDays} days`, color: 'text-gray-600', urgency: 'low' }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getProgressColor = (priority: string, timeInfo: any) => {
    if (timeInfo.urgency === 'high') return 'bg-red-500'
    if (timeInfo.urgency === 'medium') return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const speakTaskDetails = () => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true)
      
      const text = `Task: ${task.title}. ${task.description ? `Description: ${task.description}.` : ''} Priority: ${task.priority}. Due date: ${formatDate(task.dueDate)}. ${task.course ? `Course: ${task.course}.` : ''} ${task.estimatedTime ? `Estimated time: ${task.estimatedTime} hours.` : ''}`
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8
      
      utterance.onend = () => {
        setIsSpeaking(false)
      }
      
      speechSynthesis.speak(utterance)
      toast.success('Reading task details aloud')
    } else {
      toast.error('Text-to-speech not supported in this browser')
    }
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const handleSave = () => {
    // In a real app, this would make an API call to update the task
    toast.success('Task updated successfully!')
    setIsEditing(false)
    onUpdate()
  }

  const toggleComplete = () => {
    // In a real app, this would update the task completion status
    toast.success(`Task marked as ${task.completed ? 'incomplete' : 'complete'}!`)
    onUpdate()
  }

  const timeInfo = getTimeUntilDue(task.dueDate)
  const completionPercentage = task.completed ? 100 : Math.max(20, Math.random() * 80)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center text-blue-700">
              <BookOpen className="w-5 h-5 mr-2" />
              Task Details
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={isSpeaking ? stopSpeaking : speakTaskDetails}
                className="text-blue-600 hover:bg-blue-50"
              >
                {isSpeaking ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="text-gray-600 hover:bg-gray-50"
              >
                {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <DialogDescription>
            View and manage detailed information about this task, including progress, schedule, and AI recommendations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Header */}
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-white">
            <CardContent className="p-6">
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    value={editedTask.title}
                    onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                    className="text-xl font-semibold border-blue-200"
                    placeholder="Task title"
                  />
                  <Textarea
                    value={editedTask.description}
                    onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                    placeholder="Task description"
                    className="border-blue-200"
                  />
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{task.title}</h2>
                  {task.description && (
                    <p className="text-gray-700 leading-relaxed">{task.description}</p>
                  )}
                </div>
              )}
              
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <Badge variant="outline" className={getPriorityColor(task.priority)}>
                  {task.priority} priority
                </Badge>
                {task.course && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <Users className="w-3 h-3 mr-1" />
                    {task.course}
                  </Badge>
                )}
                {task.type === 'classroom' && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Google Classroom
                  </Badge>
                )}
                <Badge variant="outline" className={`${timeInfo.color.replace('text-', 'bg-').replace('-600', '-50')} ${timeInfo.color} border-current`}>
                  <Clock className="w-3 h-3 mr-1" />
                  {timeInfo.text}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Progress & Completion */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-700">
                <Target className="w-5 h-5 mr-2" />
                Progress & Completion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Completion</span>
                  <span className="text-sm text-gray-600">{Math.round(completionPercentage)}%</span>
                </div>
                <Progress 
                  value={completionPercentage} 
                  className="h-3"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Button
                  onClick={toggleComplete}
                  variant={task.completed ? "default" : "outline"}
                  className={task.completed 
                    ? "bg-green-600 hover:bg-green-700 text-white" 
                    : "border-green-200 text-green-600 hover:bg-green-50"
                  }
                >
                  {task.completed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Completed
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4 mr-2" />
                      Mark Complete
                    </>
                  )}
                </Button>
                
                {timeInfo.urgency === 'high' && !task.completed && (
                  <div className="flex items-center text-red-600">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">Urgent</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Task Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center text-purple-700">
                  <Calendar className="w-5 h-5 mr-2" />
                  Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isEditing ? (
                  <Input
                    type="datetime-local"
                    value={editedTask.dueDate.slice(0, 16)}
                    onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                    className="border-purple-200"
                  />
                ) : (
                  <>
                    <div>
                      <p className="text-sm text-gray-500">Due Date</p>
                      <p className="font-medium text-gray-900">{formatDate(task.dueDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Due Time</p>
                      <p className="font-medium text-gray-900">{formatTime(task.dueDate)}</p>
                    </div>
                  </>
                )}
                
                {task.estimatedTime && (
                  <div>
                    <p className="text-sm text-gray-500">Estimated Time</p>
                    <p className="font-medium text-gray-900 flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-purple-600" />
                      {task.estimatedTime} hour{task.estimatedTime > 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-700">
                  <Target className="w-5 h-5 mr-2" />
                  Properties
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-500">Priority</label>
                      <Select value={editedTask.priority} onValueChange={(value) => setEditedTask({ ...editedTask, priority: value as any })}>
                        <SelectTrigger className="border-blue-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Estimated Time (hours)</label>
                      <Input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={editedTask.estimatedTime || ''}
                        onChange={(e) => setEditedTask({ ...editedTask, estimatedTime: parseFloat(e.target.value) || undefined })}
                        className="border-blue-200"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="font-medium text-gray-900">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {task.project && (
                      <div>
                        <p className="text-sm text-gray-500">Project</p>
                        <p className="font-medium text-gray-900">{task.project}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="font-medium text-gray-900 capitalize">
                        {task.type === 'classroom' ? 'Google Classroom' : 'Manual Entry'}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* AI Suggestions */}
          <Card className="border-green-200 bg-gradient-to-r from-green-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center text-green-700">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                </motion.div>
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-white rounded-lg border border-green-200">
                <h4 className="font-medium text-green-700 mb-1">Optimal Study Time</h4>
                <p className="text-sm text-green-600">
                  Based on your task priority and deadline, consider working on this between 9-11 AM 
                  when focus levels are typically highest.
                </p>
              </div>
              
              <div className="p-3 bg-white rounded-lg border border-green-200">
                <h4 className="font-medium text-green-700 mb-1">Break Down Strategy</h4>
                <p className="text-sm text-green-600">
                  {task.estimatedTime && task.estimatedTime > 2 
                    ? `Consider breaking this ${task.estimatedTime}-hour task into ${Math.ceil(task.estimatedTime / 2)} smaller sessions of 1-2 hours each.`
                    : 'This task can be completed in a single focused session.'
                  }
                </p>
              </div>
              
              {timeInfo.urgency === 'high' && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-medium text-red-700 mb-1">Urgency Alert</h4>
                  <p className="text-sm text-red-600">
                    This task requires immediate attention. Consider rescheduling other activities to prioritize this work.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="border-gray-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}