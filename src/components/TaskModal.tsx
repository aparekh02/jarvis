import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Calendar, Trash2, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
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

interface Project {
  id: string
  name: string
  description: string
  color: string
}

interface TaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
  projects: Project[]
  onSuccess: () => void
}

export function TaskModal({ open, onOpenChange, task, projects, onSuccess }: TaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [projectId, setProjectId] = useState('')
  const [courseName, setCourseName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [optimizedPrompt, setOptimizedPrompt] = useState('')

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description)
      setDueDate(task.dueDate.split('T')[0])
      setPriority(task.priority)
      setProjectId(task.projectId || '')
      setCourseName(task.courseName || '')
    } else {
      // Reset form for new task
      setTitle('')
      setDescription('')
      setDueDate('')
      setPriority('medium')
      setProjectId('')
      setCourseName('')
      setAiSuggestions([])
      setOptimizedPrompt('')
    }
  }, [task, open])

  const handleOptimizePrompt = async () => {
    if (!title.trim()) return
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-7c72c08c/optimize-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          prompt: `${title} ${description}`.trim()
        })
      })
      
      const data = await response.json()
      if (data.optimizedPrompt) {
        setOptimizedPrompt(data.optimizedPrompt)
        setAiSuggestions(data.suggestions || [])
        toast.success('AI optimization complete!')
      }
    } catch (error) {
      console.log('Error optimizing prompt:', error)
      toast.error('Failed to optimize task')
    }
  }

  const handleApplyOptimization = () => {
    if (optimizedPrompt) {
      setTitle(optimizedPrompt)
      setOptimizedPrompt('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsLoading(true)
    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        dueDate: new Date(dueDate).toISOString(),
        priority,
        projectId: projectId || undefined,
        courseName: courseName.trim() || undefined,
        completed: task?.completed || false
      }

      const url = task 
        ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-7c72c08c/tasks/${task.id}`
        : `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-7c72c08c/tasks`
      
      const method = task ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(taskData)
      })

      if (response.ok) {
        toast.success(task ? 'Task updated successfully' : 'Task created successfully')
        onSuccess()
        onOpenChange(false)
      } else {
        throw new Error('Failed to save task')
      }
    } catch (error) {
      console.log('Error saving task:', error)
      toast.error('Failed to save task')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!task) return
    
    if (!confirm('Are you sure you want to delete this task?')) return

    setIsLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-7c72c08c/tasks/${task.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      })

      if (response.ok) {
        toast.success('Task deleted successfully')
        onSuccess()
        onOpenChange(false)
      } else {
        throw new Error('Failed to delete task')
      }
    } catch (error) {
      console.log('Error deleting task:', error)
      toast.error('Failed to delete task')
    } finally {
      setIsLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200'
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-50 text-green-700 border-green-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-light text-slate-800">
            {task ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* AI Optimization Section */}
          {!task && (
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  <h3 className="font-medium text-blue-900">AI Task Optimization</h3>
                </div>
                <Button
                  type="button"
                  onClick={handleOptimizePrompt}
                  disabled={!title.trim()}
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  Optimize
                </Button>
              </div>
              
              <AnimatePresence>
                {optimizedPrompt && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <div className="p-3 bg-white rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-600 mb-1">Optimized Task:</p>
                      <p className="text-slate-800">{optimizedPrompt}</p>
                      <Button
                        type="button"
                        onClick={handleApplyOptimization}
                        size="sm"
                        className="mt-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                      >
                        Apply Optimization
                      </Button>
                    </div>
                  </motion.div>
                )}
                
                {aiSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <p className="text-sm text-blue-600">Smart Suggestions:</p>
                    <div className="space-y-2">
                      {aiSuggestions.map((suggestion, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="p-3 bg-white border-blue-100">
                            <p className="text-sm text-slate-700">{suggestion}</p>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          )}

          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              className="border-blue-200 focus:border-blue-400"
              required
            />
          </div>

          {/* Task Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add task details..."
              className="border-blue-200 focus:border-blue-400 min-h-[100px]"
            />
          </div>

          {/* Due Date and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-3 text-blue-500" />
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="pl-10 border-blue-200 focus:border-blue-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
                <SelectTrigger className="border-blue-200 focus:border-blue-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>Low Priority</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span>Medium Priority</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span>High Priority</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Project and Course */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project (Optional)</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="border-blue-200 focus:border-blue-400">
                  <SelectValue placeholder="Select project..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Project</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: project.color }}
                        ></div>
                        <span>{project.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="courseName">Course Name (Optional)</Label>
              <Input
                id="courseName"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g., Mathematics, History..."
                className="border-blue-200 focus:border-blue-400"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              {task && (
                <Button
                  type="button"
                  onClick={handleDelete}
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  disabled={isLoading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                type="button"
                onClick={() => onOpenChange(false)}
                variant="outline"
                className="text-slate-600 border-slate-200 hover:bg-slate-50"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                disabled={isLoading || !title.trim()}
              >
                {isLoading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}