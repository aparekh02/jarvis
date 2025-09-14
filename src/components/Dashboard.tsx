import React, { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { Progress } from './ui/progress'
import { motion } from 'motion/react'
import { 
  Plus, 
  Calendar, 
  Clock, 
  BookOpen,
  Target,
  CheckCircle2,
  Circle,
  FolderPlus,
  RefreshCw,
  AlertCircle,
  TrendingUp
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

interface Project {
  id: string
  name: string
  description: string
  color: string
  tasks: string[]
  createdAt: string
}

interface DashboardProps {
  tasks: Task[]
  projects: Project[]
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void
  onAddProject: (project: Omit<Project, 'id' | 'createdAt' | 'tasks'>) => void
  onTaskClick: (task: Task) => void
  onRefresh: () => void
  loading: boolean
}

export function Dashboard({ 
  tasks, 
  projects, 
  onAddTask, 
  onAddProject, 
  onTaskClick, 
  onRefresh, 
  loading 
}: DashboardProps) {
  const [showAddTask, setShowAddTask] = useState(false)
  const [showAddProject, setShowAddProject] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as const,
    project: '',
    estimatedTime: 1
  })
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  })

  const handleAddTask = () => {
    if (!newTask.title.trim()) return
    
    onAddTask({
      title: newTask.title,
      description: newTask.description,
      dueDate: newTask.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      priority: newTask.priority,
      project: newTask.project || undefined,
      estimatedTime: newTask.estimatedTime
    })
    
    setNewTask({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      project: '',
      estimatedTime: 1
    })
    setShowAddTask(false)
  }

  const handleAddProject = () => {
    if (!newProject.name.trim()) return
    
    onAddProject({
      name: newProject.name,
      description: newProject.description,
      color: newProject.color
    })
    
    setNewProject({
      name: '',
      description: '',
      color: '#3B82F6'
    })
    setShowAddProject(false)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'Overdue'
    if (diffDays === 0) return 'Due today'
    if (diffDays === 1) return 'Due tomorrow'
    return `Due in ${diffDays} days`
  }

  const getDateColor = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'text-red-600'
    if (diffDays <= 1) return 'text-orange-600'
    if (diffDays <= 3) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const activeTasks = tasks.filter(t => t && !t.completed)
  const completedTasks = tasks.filter(t => t && t.completed)
  const overdueTasks = activeTasks.filter(t => t && new Date(t.dueDate) < new Date())
  const todayTasks = activeTasks.filter(t => {
    if (!t || !t.dueDate) return false
    const taskDate = new Date(t.dueDate)
    const today = new Date()
    return taskDate.toDateString() === today.toDateString()
  })

  const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Active Tasks</p>
                  <p className="text-3xl font-bold text-blue-700">{activeTasks.length}</p>
                </div>
                <Target className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Due Today</p>
                  <p className="text-3xl font-bold text-orange-700">{todayTasks.length}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Completed</p>
                  <p className="text-3xl font-bold text-green-700">{completedTasks.length}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Completion Rate</p>
                  <p className="text-3xl font-bold text-purple-700">{Math.round(completionRate)}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-blue-700">Create New Task</DialogTitle>
              <DialogDescription>
                Add a new task to your dashboard with details like priority, deadline, and project assignment.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="border-blue-200 focus:border-blue-400"
              />
              <Textarea
                placeholder="Description (optional)"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="border-blue-200 focus:border-blue-400"
              />
              <Input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="border-blue-200 focus:border-blue-400"
              />
              <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value as any })}>
                <SelectTrigger className="border-blue-200 focus:border-blue-400">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newTask.project} onValueChange={(value) => setNewTask({ ...newTask, project: value })}>
                <SelectTrigger className="border-blue-200 focus:border-blue-400">
                  <SelectValue placeholder="Project (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {projects.filter(project => project && project.name).map(project => (
                    <SelectItem key={project.id} value={project.name}>{project.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddTask} className="w-full bg-blue-600 hover:bg-blue-700">
                Create Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showAddProject} onOpenChange={setShowAddProject}>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
              <FolderPlus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-blue-700">Create New Project</DialogTitle>
              <DialogDescription>
                Create a new project to organize and group related tasks together.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Project name"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                className="border-blue-200 focus:border-blue-400"
              />
              <Textarea
                placeholder="Description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="border-blue-200 focus:border-blue-400"
              />
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Color</label>
                <div className="flex gap-2">
                  {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map(color => (
                    <button
                      key={color}
                      onClick={() => setNewProject({ ...newProject, color })}
                      className={`w-8 h-8 rounded-full border-2 ${newProject.color === color ? 'border-gray-800' : 'border-gray-300'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleAddProject} className="w-full bg-blue-600 hover:bg-blue-700">
                Create Project
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={loading}
          className="border-blue-200 text-blue-600 hover:bg-blue-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Tasks List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Tasks */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-700 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Active Tasks
              <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-700">
                {activeTasks.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {activeTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No active tasks</p>
                    <p className="text-sm">Add a task to get started!</p>
                  </div>
                ) : (
                  activeTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => onTaskClick(task)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200 group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 group-hover:text-blue-700">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-3">
                            <Badge variant="outline" className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            {task.course && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {task.course}
                              </Badge>
                            )}
                            {task.type === 'classroom' && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Classroom
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className={`text-sm font-medium ${getDateColor(task.dueDate)}`}>
                            {formatDate(task.dueDate)}
                          </p>
                          {task.estimatedTime && (
                            <p className="text-xs text-gray-500 mt-1">
                              ~{task.estimatedTime}h
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Projects */}
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-700 flex items-center">
              <FolderPlus className="w-5 h-5 mr-2" />
              Projects
              <Badge variant="secondary" className="ml-auto bg-purple-100 text-purple-700">
                {projects.filter(project => project && project.name).length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {projects.filter(project => project && project.name).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FolderPlus className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No projects yet</p>
                    <p className="text-sm">Create a project to organize your tasks!</p>
                  </div>
                ) : (
                  projects.filter(project => project && project.name).map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-all duration-200"
                    >
                      <div className="flex items-start">
                        <div
                          className="w-4 h-4 rounded-full mr-3 mt-1"
                          style={{ backgroundColor: project.color }}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{project.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-gray-500">
                              {tasks.filter(t => t && t.project === project.name).length} tasks
                            </span>
                            <Progress 
                              value={75} 
                              className="w-16 h-2"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Tasks Alert */}
      {overdueTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <div>
              <h4 className="font-medium text-red-800">
                You have {overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''}
              </h4>
              <p className="text-sm text-red-600 mt-1">
                Review and reschedule these tasks to stay on track
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}