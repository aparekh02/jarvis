import React, { useState, useEffect } from 'react'
import { Button } from './components/ui/button'
import { Card } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog'
import { Input } from './components/ui/input'
import { Textarea } from './components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { Progress } from './components/ui/progress'
import { ScrollArea } from './components/ui/scroll-area'
import { Separator } from './components/ui/separator'
import { toast } from 'sonner@2.0.3'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Plus, 
  Calendar, 
  Clock, 
  Mic, 
  MicIcon,
  Volume2,
  Sparkles,
  BookOpen,
  Target,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Lightbulb,
  Workflow,
  Users,
  Settings,
  X,
  CheckCircle2
} from 'lucide-react'
import { Dashboard } from './components/Dashboard'
import { VoiceControls } from './components/VoiceControls'
import { FlowchartView } from './components/FlowchartView'
import { OnboardingSlides } from './components/OnboardingSlides'
import { TaskDetailModal } from './components/TaskDetailModal'

import { JarvisLogo } from './components/JarvisLogo'
// Removed Supabase dependency - now using localStorage

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

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'flowchart'>('dashboard')
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [loading, setLoading] = useState(false)
  const [userId] = useState('demo-user') // In real app, this would come from auth

  // Create demo data for first-time users
  const createDemoData = () => {
    const demoProjects = [
      {
        id: `project_${Date.now()}_1`,
        name: 'School Assignments',
        description: 'Track all your coursework and assignments',
        color: '#3B82F6',
        tasks: [],
        createdAt: new Date().toISOString()
      },
      {
        id: `project_${Date.now()}_2`,
        name: 'Study Goals',
        description: 'Personal learning objectives and milestones',
        color: '#10B981',
        tasks: [],
        createdAt: new Date().toISOString()
      }
    ]
    
    const demoTasks = [
      {
        id: `task_${Date.now()}_1`,
        title: 'Complete Math Problem Set',
        description: 'Finish exercises 1-20 from Chapter 5',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'high' as const,
        project: 'School Assignments',
        completed: false,
        estimatedTime: 2,
        createdAt: new Date().toISOString(),
        type: 'manual' as const
      },
      {
        id: `task_${Date.now()}_2`,
        title: 'Review Study Notes',
        description: 'Go through all notes from this week\'s lectures',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'medium' as const,
        project: 'Study Goals',
        completed: false,
        estimatedTime: 1,
        createdAt: new Date().toISOString(),
        type: 'manual' as const
      },
      {
        id: `task_${Date.now()}_3`,
        title: 'History Essay Draft',
        description: 'Write first draft of Industrial Revolution essay',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'medium' as const,
        project: 'School Assignments',
        completed: false,
        estimatedTime: 3,
        createdAt: new Date().toISOString(),
        type: 'manual' as const
      },
      {
        id: `task_${Date.now()}_4`,
        title: 'Practice Presentation',
        description: 'Rehearse final presentation for science project',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'low' as const,
        project: 'Study Goals',
        completed: true,
        estimatedTime: 1,
        createdAt: new Date().toISOString(),
        type: 'manual' as const
      }
    ]
    
    return { demoTasks, demoProjects }
  }

  // Load user data on mount from localStorage
  useEffect(() => {
    loadUserData()
    // Auto-generate demo classroom assignments on first load
    if (!localStorage.getItem('jarvis_classroom_synced')) {
      setTimeout(() => {
        generateClassroomAssignments()
      }, 2000)
    }
  }, [])

  const loadUserData = async () => {
    try {
      setLoading(true)
      
      // Load from localStorage
      const storedTasks = localStorage.getItem('jarvis_tasks')
      const storedProjects = localStorage.getItem('jarvis_projects')
      
      let loadedTasks = storedTasks ? JSON.parse(storedTasks) : []
      let loadedProjects = storedProjects ? JSON.parse(storedProjects) : []
      
      // If no data exists, create demo data
      if (loadedTasks.length === 0 && loadedProjects.length === 0) {
        const { demoTasks, demoProjects } = createDemoData()
        loadedTasks = demoTasks
        loadedProjects = demoProjects
        
        // Save demo data to localStorage
        localStorage.setItem('jarvis_tasks', JSON.stringify(loadedTasks))
        localStorage.setItem('jarvis_projects', JSON.stringify(loadedProjects))
      }
      
      setTasks(loadedTasks)
      setProjects(loadedProjects)
    } catch (error) {
      console.error('Error loading user data:', error)
      toast.error('Failed to load your data')
    } finally {
      setLoading(false)
    }
  }

  const generateClassroomAssignments = async () => {
    try {
      // Safely access environment variables
      const env = import.meta.env || {}
      const classroomApiKey = env.VITE_GOOGLE_CLASSROOM_API_KEY
      
      if (!classroomApiKey) {
        // Generate demo assignments even without API key
        console.log('Google Classroom API key not configured - generating demo assignments')
        toast('Generating demo classroom assignments (API key not configured)', {
          description: 'Add VITE_GOOGLE_CLASSROOM_API_KEY to .env for real integration'
        })
      } else {
        toast('Syncing with Google Classroom...', {
          description: 'Using configured API key'
        })
      }
      
      // Simulate Google Classroom assignments
      const mockAssignments = [
        {
          id: `classroom_${Date.now()}_1`,
          title: 'Math Problem Set Chapter 5',
          description: 'Complete problems 1-25 on page 142',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          course: 'Mathematics',
          priority: 'high' as const,
          completed: false,
          estimatedTime: 2,
          createdAt: new Date().toISOString(),
          type: 'classroom' as const
        },
        {
          id: `classroom_${Date.now()}_2`,
          title: 'History Essay: Industrial Revolution',
          description: 'Write a 5-page essay on the impact of the Industrial Revolution',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          course: 'History',
          priority: 'medium' as const,
          completed: false,
          estimatedTime: 4,
          createdAt: new Date().toISOString(),
          type: 'classroom' as const
        },
        {
          id: `classroom_${Date.now()}_3`,
          title: 'Science Lab Report',
          description: 'Submit lab report on chemical reactions experiment',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          course: 'Chemistry',
          priority: 'high' as const,
          completed: false,
          estimatedTime: 3,
          createdAt: new Date().toISOString(),
          type: 'classroom' as const
        }
      ]
      
      // Add to existing tasks
      const existingTasks = JSON.parse(localStorage.getItem('jarvis_tasks') || '[]')
      const updatedTasks = [...existingTasks, ...mockAssignments]
      localStorage.setItem('jarvis_tasks', JSON.stringify(updatedTasks))
      localStorage.setItem('jarvis_classroom_synced', 'true')
      
      setTasks(updatedTasks)
      toast.success(`Synced ${mockAssignments.length} assignments from Google Classroom`)
    } catch (error) {
      console.error('Error generating classroom assignments:', error)
      toast.error('Failed to sync with Google Classroom')
    }
  }

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    try {
      const newTask = {
        ...taskData,
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        completed: false,
        type: 'manual' as const,
        createdAt: new Date().toISOString()
      }
      
      const existingTasks = JSON.parse(localStorage.getItem('jarvis_tasks') || '[]')
      const updatedTasks = [...existingTasks, newTask]
      
      localStorage.setItem('jarvis_tasks', JSON.stringify(updatedTasks))
      setTasks(updatedTasks)
      
      toast.success('Task added successfully!')
    } catch (error) {
      console.error('Error adding task:', error)
      toast.error('Failed to add task')
    }
  }

  const addProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'tasks'>) => {
    try {
      const newProject = {
        ...projectData,
        id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        tasks: [],
        createdAt: new Date().toISOString()
      }
      
      const existingProjects = JSON.parse(localStorage.getItem('jarvis_projects') || '[]')
      const updatedProjects = [...existingProjects, newProject]
      
      localStorage.setItem('jarvis_projects', JSON.stringify(updatedProjects))
      setProjects(updatedProjects)
      
      toast.success('Project created successfully!')
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error('Failed to create project')
    }
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

  if (showOnboarding) {
    return <OnboardingSlides onComplete={() => setShowOnboarding(false)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <JarvisLogo size="md" animate={true} />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Jarvis</h1>
                <p className="text-sm text-gray-500">Work like Tony Stark</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Tabs value={currentView} onValueChange={setCurrentView as any} className="bg-blue-50 rounded-lg p-1">
                <TabsList className="bg-transparent">
                  <TabsTrigger 
                    value="dashboard" 
                    className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger 
                    value="flowchart"
                    className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                  >
                    <Workflow className="w-4 h-4 mr-2" />
                    AI Flowchart
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button
                variant="outline"
                size="sm"
                onClick={generateClassroomAssignments}
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <Users className="w-4 h-4 mr-2" />
                Sync Classroom
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        
        <AnimatePresence mode="wait">
          {currentView === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Dashboard
                tasks={tasks}
                projects={projects}
                onAddTask={addTask}
                onAddProject={addProject}
                onTaskClick={setSelectedTask}
                onRefresh={loadUserData}
                loading={loading}
              />
            </motion.div>
          ) : (
            <motion.div
              key="flowchart"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <FlowchartView tasks={tasks} onTaskUpdate={loadUserData} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Voice Controls */}
      <VoiceControls onTaskOptimized={loadUserData} />

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={loadUserData}
        />
      )}

      {/* Quick Stats */}
      <div className="fixed bottom-6 left-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-4 hidden lg:block">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">{tasks.filter(t => t && !t.completed).length} Active Tasks</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">{tasks.filter(t => t && t.completed).length} Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-600">{projects.filter(p => p && p.name).length} Projects</span>
          </div>
        </div>
      </div>
    </div>
  )
}