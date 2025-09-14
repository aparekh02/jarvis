import React from 'react'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { Calendar, Clock, BookOpen, Volume2 } from 'lucide-react'
import { motion } from 'motion/react'
import { toast } from 'sonner@2.0.3'

interface Task {
  id: string
  title: string
  description: string
  dueDate: string
  priority: 'low' | 'medium' | 'high'
  completed: boolean
  projectId?: string
  courseName?: string
}

interface TaskCardProps {
  task: Task
  onClick: () => void
  onDataChange: () => void
}

export function TaskCard({ task, onClick, onDataChange }: TaskCardProps) {
  const handleCompleteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-7c72c08c/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          completed: !task.completed
        })
      })
      
      if (response.ok) {
        toast.success(task.completed ? 'Task marked as incomplete' : 'Task completed! 🎉')
        onDataChange()
      }
    } catch (error) {
      console.log('Error updating task:', error)
      toast.error('Failed to update task')
    }
  }

  const handleSpeak = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-7c72c08c/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          text: `${task.title}. ${task.description}. Due ${formatDate(task.dueDate)}.`
        })
      })
      
      if (response.ok) {
        // Use Web Speech API as fallback for demo
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(
            `${task.title}. ${task.description}. Due ${formatDate(task.dueDate)}.`
          )
          utterance.rate = 0.9
          utterance.pitch = 1
          speechSynthesis.speak(utterance)
          toast.success('Reading task aloud')
        }
      }
    } catch (error) {
      console.log('Error with text-to-speech:', error)
      // Fallback to Web Speech API
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(
          `${task.title}. ${task.description}. Due ${formatDate(task.dueDate)}.`
        )
        speechSynthesis.speak(utterance)
      } else {
        toast.error('Text-to-speech not available')
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays === -1) return 'Yesterday'
    if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`
    if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200'
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-50 text-green-700 border-green-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const isDueSoon = () => {
    const dueDate = new Date(task.dueDate)
    const now = new Date()
    const diffTime = dueDate.getTime() - now.getTime()
    const diffDays = diffTime / (1000 * 60 * 60 * 24)
    return diffDays <= 3 && diffDays >= 0
  }

  const isOverdue = () => {
    const dueDate = new Date(task.dueDate)
    const now = new Date()
    return dueDate < now && !task.completed
  }

  return (
    <motion.div
      whileHover={{ y: -2, shadow: '0 10px 25px rgba(0,0,0,0.1)' }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg border-l-4 ${
          task.completed 
            ? 'opacity-75 border-l-green-400 bg-green-50/30' 
            : isOverdue()
            ? 'border-l-red-400 bg-red-50/30'
            : isDueSoon()
            ? 'border-l-orange-400 bg-orange-50/30'
            : 'border-l-blue-400 bg-white hover:bg-blue-50/30'
        }`}
        onClick={onClick}
      >
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <Checkbox
                checked={task.completed}
                onCheckedChange={handleCompleteToggle}
                className="mt-1 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
              />
              <div className="flex-1 min-w-0">
                <h3 className={`font-medium text-slate-800 ${
                  task.completed ? 'line-through text-slate-500' : ''
                }`}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className={`text-sm text-slate-600 mt-1 line-clamp-2 ${
                    task.completed ? 'line-through text-slate-400' : ''
                  }`}>
                    {task.description}
                  </p>
                )}
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSpeak}
              className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 p-2"
            >
              <Volume2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Course Name */}
          {task.courseName && (
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                {task.courseName}
              </span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-sm text-slate-500">
                <Calendar className="w-4 h-4" />
                <span className={
                  isOverdue() && !task.completed 
                    ? 'text-red-600 font-medium' 
                    : isDueSoon() && !task.completed
                    ? 'text-orange-600 font-medium'
                    : ''
                }>
                  {formatDate(task.dueDate)}
                </span>
              </div>
              
              {(isDueSoon() || isOverdue()) && !task.completed && (
                <div className="flex items-center space-x-1 text-sm">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-orange-600 font-medium">
                    {isOverdue() ? 'Overdue' : 'Due Soon'}
                  </span>
                </div>
              )}
            </div>
            
            <Badge 
              variant="outline" 
              className={`text-xs ${getPriorityColor(task.priority)}`}
            >
              {task.priority}
            </Badge>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}