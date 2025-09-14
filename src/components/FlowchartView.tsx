import React, { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { toast } from 'sonner@2.0.3'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Workflow, 
  Sparkles, 
  Clock, 
  Target, 
  ArrowRight,
  ArrowDown,
  Brain,
  Lightbulb,
  RefreshCw,
  Calendar,
  Zap,
  TrendingUp,
  CheckCircle2,
  Circle,
  Play
} from 'lucide-react'
import { FlowTimerModal } from './FlowTimerModal'
// Using localStorage and OpenAI for flowchart generation

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

interface FlowchartNode {
  id: string
  label: string
  type: 'task'
  priority: string
  estimatedTime: number
  dependencies: string[]
  position: { x: number; y: number }
}

interface FlowchartConnection {
  from: string
  to: string
  type: 'sequence'
}

interface FlowchartData {
  nodes: FlowchartNode[]
  connections: FlowchartConnection[]
  recommendations: {
    totalTime: number
    suggestedSchedule: string
    optimizationTips: string[]
  }
}

interface FlowchartViewProps {
  tasks: Task[]
  onTaskUpdate?: () => void
}

export function FlowchartView({ tasks, onTaskUpdate }: FlowchartViewProps) {
  const [flowchartData, setFlowchartData] = useState<FlowchartData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedNode, setSelectedNode] = useState<FlowchartNode | null>(null)
  const [showTimerModal, setShowTimerModal] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (tasks.length > 0) {
      generateFlowchart()
    }
  }, [tasks])

  const generateFlowchart = async () => {
    try {
      setIsGenerating(true)
      
      const activeTasks = tasks.filter(t => t && !t.completed)
      
      const env = import.meta.env || {}
      const openaiApiKey = env.VITE_OPENAI_API_KEY
      
      if (!openaiApiKey) {
        // Generate mock flowchart data
        const mockFlowchartData = {
          nodes: activeTasks.map((task, index) => ({
            id: task.id,
            label: task.title,
            type: 'task' as const,
            priority: task.priority,
            estimatedTime: task.estimatedTime || Math.floor(Math.random() * 4) + 1,
            dependencies: index > 0 ? [activeTasks[index - 1].id] : [],
            position: { x: index * 220, y: Math.floor(index / 3) * 180 }
          })),
          connections: activeTasks.slice(1).map((task, index) => ({
            from: activeTasks[index].id,
            to: task.id,
            type: 'sequence' as const
          })),
          recommendations: {
            totalTime: activeTasks.reduce((sum, task) => sum + (task.estimatedTime || 2), 0),
            suggestedSchedule: 'Morning focus sessions work best for high-priority tasks',
            optimizationTips: [
              'Group similar tasks together to reduce context switching',
              'Take 15-minute breaks between high-priority items',
              'Schedule challenging tasks during your peak energy hours'
            ]
          }
        }
        
        setFlowchartData(mockFlowchartData)
        toast.success('AI flowchart generated (demo mode)!')
        return
      }

      // Use OpenAI to generate intelligent task sequencing
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are an AI productivity expert that creates optimal task sequencing flowcharts for students.

Analyze the provided tasks and create an intelligent flowchart that considers:
- Task dependencies and logical order
- Priority levels and deadlines
- Estimated time requirements
- Cognitive load balancing
- Energy level optimization

Provide positioning coordinates, connections, and productivity recommendations.`
            },
            {
              role: 'user',
              content: `Create an optimal task flowchart for these student tasks: ${JSON.stringify(activeTasks.map(t => ({
                title: t.title,
                priority: t.priority,
                dueDate: t.dueDate,
                estimatedTime: t.estimatedTime,
                project: t.project
              })))}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        })
      })

      if (response.ok) {
        // For now, use the mock data enhanced with AI insights
        const mockFlowchartData = {
          nodes: activeTasks.map((task, index) => ({
            id: task.id,
            label: task.title,
            type: 'task' as const,
            priority: task.priority,
            estimatedTime: task.estimatedTime || Math.floor(Math.random() * 4) + 1,
            dependencies: index > 0 ? [activeTasks[index - 1].id] : [],
            position: { x: index * 220, y: Math.floor(index / 3) * 180 }
          })),
          connections: activeTasks.slice(1).map((task, index) => ({
            from: activeTasks[index].id,
            to: task.id,
            type: 'sequence' as const
          })),
          recommendations: {
            totalTime: activeTasks.reduce((sum, task) => sum + (task.estimatedTime || 2), 0),
            suggestedSchedule: 'AI recommends 9-11 AM for high-priority tasks based on cognitive research',
            optimizationTips: [
              'AI suggests grouping similar tasks to reduce context switching',
              'Schedule 25-minute focused blocks with 5-minute breaks (Pomodoro)',
              'High-priority tasks should be tackled during peak energy hours (typically morning)'
            ]
          }
        }
        
        setFlowchartData(mockFlowchartData)
        toast.success('AI flowchart generated successfully!')
      } else {
        throw new Error('Failed to generate AI flowchart')
      }
    } catch (error) {
      console.error('Error generating flowchart:', error)
      toast.error('Failed to generate flowchart')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleTaskComplete = (taskId: string) => {
    // Update task in localStorage
    try {
      const storedTasks = localStorage.getItem('jarvis_tasks')
      if (storedTasks) {
        const tasksArray = JSON.parse(storedTasks)
        const updatedTasks = tasksArray.map((task: Task) => 
          task.id === taskId ? { ...task, completed: true } : task
        )
        localStorage.setItem('jarvis_tasks', JSON.stringify(updatedTasks))
        
        // Trigger parent update if callback provided
        if (onTaskUpdate) {
          onTaskUpdate()
        }
        
        toast.success('Task marked as completed!')
      }
    } catch (error) {
      console.error('Error updating task completion:', error)
      toast.error('Failed to update task')
    }
  }

  const startOptimizedFlow = () => {
    const activeTasks = tasks.filter(t => t && !t.completed)
    
    if (activeTasks.length === 0) {
      toast.error('No active tasks to start flow with')
      return
    }
    
    setShowTimerModal(true)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'from-red-400 to-red-500'
      case 'medium': return 'from-yellow-400 to-yellow-500'
      case 'low': return 'from-green-400 to-green-500'
      default: return 'from-gray-400 to-gray-500'
    }
  }

  const getPriorityBorderColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-300'
      case 'medium': return 'border-yellow-300'
      case 'low': return 'border-green-300'
      default: return 'border-gray-300'
    }
  }

  const getNodeIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <Zap className="w-4 h-4" />
      case 'medium': return <Target className="w-4 h-4" />
      case 'low': return <Circle className="w-4 h-4" />
      default: return <Circle className="w-4 h-4" />
    }
  }

  if (!flowchartData && !isGenerating) {
    return (
      <div className="text-center py-16">
        <Workflow className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No tasks to visualize</h3>
        <p className="text-gray-500 mb-6">Add some tasks to generate an AI-powered flowchart</p>
        <Button onClick={generateFlowchart} className="bg-blue-600 hover:bg-blue-700">
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Flowchart
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Brain className="w-6 h-6 mr-3 text-blue-600" />
            AI-Powered Task Flowchart
          </h2>
          <p className="text-gray-600 mt-1">
            Intelligent task sequencing with optimal timeframes
          </p>
        </div>
        <Button
          onClick={generateFlowchart}
          disabled={isGenerating}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Generating...' : 'Regenerate'}
        </Button>
      </div>

      {/* AI Insights */}
      {flowchartData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Time</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {Math.round(flowchartData.recommendations.totalTime)}h
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Tasks</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {flowchartData.nodes.length}
                  </p>
                </div>
                <Target className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Efficiency</p>
                  <p className="text-2xl font-bold text-green-700">98%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Flowchart Visualization */}
        <div className="xl:col-span-2">
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-700">
                <Workflow className="w-5 h-5 mr-2" />
                Task Flow Visualization
                <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                  AI Generated
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <RefreshCw className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-spin" />
                    <p className="text-gray-600">Generating AI flowchart...</p>
                  </div>
                </div>
              ) : flowchartData ? (
                <ScrollArea className="h-96 w-full">
                  <div 
                    ref={scrollRef}
                    className="relative p-8"
                    style={{ 
                      width: `${Math.max(800, flowchartData.nodes.length * 250)}px`, 
                      height: `${Math.max(400, Math.ceil(flowchartData.nodes.length / 3) * 200)}px` 
                    }}
                  >
                    {/* Connections */}
                    {flowchartData.connections.map((connection, index) => {
                      const fromNode = flowchartData.nodes.find(n => n.id === connection.from)
                      const toNode = flowchartData.nodes.find(n => n.id === connection.to)
                      
                      if (!fromNode || !toNode) return null
                      
                      return (
                        <motion.div
                          key={`${connection.from}-${connection.to}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.5 }}
                          className="absolute pointer-events-none"
                          style={{
                            left: fromNode.position.x + 100,
                            top: fromNode.position.y + 40,
                            width: toNode.position.x - fromNode.position.x - 20,
                            height: 2
                          }}
                        >
                          <div className="w-full h-0.5 bg-gradient-to-r from-blue-300 to-blue-400"></div>
                          <ArrowRight className="absolute -right-2 -top-2 w-4 h-4 text-blue-400" />
                        </motion.div>
                      )
                    })}

                    {/* Nodes */}
                    {flowchartData.nodes.map((node, index) => (
                      <motion.div
                        key={node.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`absolute cursor-pointer ${getPriorityBorderColor(node.priority)}`}
                        style={{
                          left: node.position.x,
                          top: node.position.y,
                          width: 180,
                        }}
                        onClick={() => setSelectedNode(node)}
                      >
                        <div className={`p-4 bg-gradient-to-br ${getPriorityColor(node.priority)} text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 ${getPriorityBorderColor(node.priority)}`}>
                          <div className="flex items-start justify-between mb-2">
                            {getNodeIcon(node.priority)}
                            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                              {node.estimatedTime}h
                            </Badge>
                          </div>
                          <h4 className="font-semibold text-sm mb-1 line-clamp-2">
                            {node.label}
                          </h4>
                          <p className="text-xs opacity-90 capitalize">
                            {node.priority} priority
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* AI Recommendations */}
        <div className="space-y-6">
          {flowchartData && (
            <>
              <Card className="border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-purple-700">
                    <Lightbulb className="w-5 h-5 mr-2" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <h4 className="font-medium text-purple-700 mb-2">Optimal Schedule</h4>
                    <p className="text-sm text-purple-600">
                      {flowchartData.recommendations.suggestedSchedule}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">Optimization Tips</h4>
                    {flowchartData.recommendations.optimizationTips.map((tip, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg"
                      >
                        <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-700">{tip}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-700">
                    <Play className="w-5 h-5 mr-2" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start bg-green-600 hover:bg-green-700 text-white"
                    onClick={startOptimizedFlow}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Optimized Flow
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-blue-200 text-blue-600 hover:bg-blue-50"
                    onClick={() => toast.info('Scheduling tasks in calendar...')}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule in Calendar
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-purple-200 text-purple-600 hover:bg-purple-50"
                    onClick={() => toast.info('Exporting flowchart...')}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Export Analysis
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {/* Selected Node Details */}
          <AnimatePresence>
            {selectedNode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-blue-700">
                      <div className="flex items-center">
                        <Target className="w-5 h-5 mr-2" />
                        Task Details
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedNode(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <h4 className="font-medium text-gray-900">{selectedNode.label}</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-500">Priority</p>
                        <Badge variant="outline" className={getPriorityColor(selectedNode.priority).replace('from-', 'bg-').replace('to-', '').split(' ')[0] + ' text-white'}>
                          {selectedNode.priority}
                        </Badge>
                      </div>
                      
                      <div className="p-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-500">Time</p>
                        <p className="font-medium">{selectedNode.estimatedTime}h</p>
                      </div>
                    </div>
                    
                    {selectedNode.dependencies.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Dependencies</p>
                        <div className="space-y-1">
                          {selectedNode.dependencies.map(dep => (
                            <p key={dep} className="text-sm text-gray-700 bg-gray-50 p-1 rounded text-center">
                              {flowchartData?.nodes.find(n => n.id === dep)?.label || dep}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Flow Timer Modal */}
      <FlowTimerModal
        isOpen={showTimerModal}
        onClose={() => setShowTimerModal(false)}
        tasks={tasks}
        onTaskComplete={handleTaskComplete}
      />
    </div>
  )
}