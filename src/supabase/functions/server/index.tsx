import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js'
import * as kv from './kv_store.tsx'

const app = new Hono()

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.use('*', logger(console.log))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Health check
app.get('/make-server-7c72c08c/health', (c) => {
  return c.json({ status: 'healthy' })
})

// Get user tasks and projects
app.get('/make-server-7c72c08c/tasks/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    // Get all tasks (both manual and classroom)
    const manualTasks = await kv.getByPrefix(`tasks:${userId}`)
    const classroomTasks = await kv.getByPrefix(`classroom:${userId}`)
    const allTasks = [...manualTasks, ...classroomTasks].map(t => t.value)
    
    const projects = await kv.getByPrefix(`projects:${userId}`)
    
    // If no data exists, create some demo data
    if (allTasks.length === 0 && projects.length === 0) {
      console.log('Creating demo data for user:', userId)
      
      // Create demo projects
      const demoProjects = [
        {
          id: `projects:${userId}:demo1`,
          name: 'School Assignments',
          description: 'Track all your coursework and assignments',
          color: '#3B82F6',
          tasks: [],
          createdAt: new Date().toISOString()
        },
        {
          id: `projects:${userId}:demo2`,
          name: 'Study Goals',
          description: 'Personal learning objectives and milestones',
          color: '#10B981',
          tasks: [],
          createdAt: new Date().toISOString()
        }
      ]
      
      // Create demo tasks
      const demoTasks = [
        {
          id: `tasks:${userId}:demo1`,
          title: 'Complete Math Problem Set',
          description: 'Finish exercises 1-20 from Chapter 5',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'high',
          project: 'School Assignments',
          completed: false,
          estimatedTime: 2,
          createdAt: new Date().toISOString(),
          type: 'manual'
        },
        {
          id: `tasks:${userId}:demo2`,
          title: 'Review Study Notes',
          description: 'Go through all notes from this week\'s lectures',
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'medium',
          project: 'Study Goals',
          completed: false,
          estimatedTime: 1,
          createdAt: new Date().toISOString(),
          type: 'manual'
        },
        {
          id: `tasks:${userId}:demo3`,
          title: 'History Essay Draft',
          description: 'Write first draft of Industrial Revolution essay',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'medium',
          project: 'School Assignments',
          completed: false,
          estimatedTime: 3,
          createdAt: new Date().toISOString(),
          type: 'manual'
        },
        {
          id: `tasks:${userId}:demo4`,
          title: 'Practice Presentation',
          description: 'Rehearse final presentation for science project',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'low',
          project: 'Study Goals',
          completed: true,
          estimatedTime: 1,
          createdAt: new Date().toISOString(),
          type: 'manual'
        }
      ]
      
      // Store demo data
      for (const project of demoProjects) {
        await kv.set(project.id, project)
      }
      
      for (const task of demoTasks) {
        await kv.set(task.id, task)
      }
      
      return c.json({ 
        tasks: demoTasks,
        projects: demoProjects
      })
    }
    
    return c.json({ 
      tasks: allTasks,
      projects: projects.map(p => p.value)
    })
  } catch (error) {
    console.log('Error fetching user data:', error)
    return c.json({ error: 'Failed to fetch user data' }, 500)
  }
})

// Save task
app.post('/make-server-7c72c08c/tasks', async (c) => {
  try {
    const { userId, task } = await c.req.json()
    const taskId = `tasks:${userId}:${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newTask = { 
      ...task, 
      id: taskId, 
      createdAt: new Date().toISOString(),
      completed: task.completed || false,
      type: task.type || 'manual'
    }
    
    await kv.set(taskId, newTask)
    console.log('Task saved successfully:', taskId)
    
    return c.json({ success: true, taskId, task: newTask })
  } catch (error) {
    console.log('Error saving task:', error)
    return c.json({ error: 'Failed to save task' }, 500)
  }
})

// Save project
app.post('/make-server-7c72c08c/projects', async (c) => {
  try {
    const { userId, project } = await c.req.json()
    const projectId = `projects:${userId}:${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newProject = { 
      ...project, 
      id: projectId, 
      createdAt: new Date().toISOString(),
      tasks: project.tasks || []
    }
    
    await kv.set(projectId, newProject)
    console.log('Project saved successfully:', projectId)
    
    return c.json({ success: true, projectId, project: newProject })
  } catch (error) {
    console.log('Error saving project:', error)
    return c.json({ error: 'Failed to save project' }, 500)
  }
})

// Google Classroom integration (simulated)
app.get('/make-server-7c72c08c/classroom/assignments/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const apiKey = Deno.env.get('GOOGLE_CLASSROOM_API_KEY')
    
    if (!apiKey) {
      return c.json({ error: 'Google Classroom API key not configured' }, 500)
    }

    // Simulate Google Classroom assignments for demo
    const mockAssignments = [
      {
        id: 'assignment_1',
        title: 'Math Problem Set Chapter 5',
        description: 'Complete problems 1-25 on page 142',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        course: 'Mathematics',
        priority: 'high'
      },
      {
        id: 'assignment_2',
        title: 'History Essay: Industrial Revolution',
        description: 'Write a 5-page essay on the impact of the Industrial Revolution',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        course: 'History',
        priority: 'medium'
      },
      {
        id: 'assignment_3',
        title: 'Science Lab Report',
        description: 'Submit lab report on chemical reactions experiment',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        course: 'Chemistry',
        priority: 'high'
      }
    ]

    // Store assignments as tasks
    for (const assignment of mockAssignments) {
      const taskId = `classroom:${userId}:${assignment.id}`
      await kv.set(taskId, {
        ...assignment,
        id: taskId,
        type: 'classroom',
        completed: false,
        estimatedTime: Math.floor(Math.random() * 3) + 1,
        createdAt: new Date().toISOString()
      })
    }
    
    return c.json({ assignments: mockAssignments })
  } catch (error) {
    console.log('Error fetching classroom assignments:', error)
    return c.json({ error: 'Failed to fetch classroom assignments' }, 500)
  }
})

// Text-to-speech endpoint
app.post('/make-server-7c72c08c/tts', async (c) => {
  try {
    const { text } = await c.req.json()
    const apiKey = Deno.env.get('TEXT_TO_SPEECH_API_KEY')
    
    if (!apiKey) {
      return c.json({ error: 'Text-to-speech API key not configured' }, 500)
    }

    // Simulate TTS response
    return c.json({ 
      success: true, 
      audioUrl: `data:audio/mp3;base64,${btoa('simulated-audio-data')}`,
      message: 'Text converted to speech successfully'
    })
  } catch (error) {
    console.log('Error in text-to-speech:', error)
    return c.json({ error: 'Failed to convert text to speech' }, 500)
  }
})

// Speech-to-text endpoint
app.post('/make-server-7c72c08c/stt', async (c) => {
  try {
    const formData = await c.req.formData()
    const audioFile = formData.get('audio')
    const apiKey = Deno.env.get('SPEECH_TO_TEXT_API_KEY')
    
    if (!apiKey) {
      return c.json({ error: 'Speech-to-text API key not configured' }, 500)
    }

    // Simulate STT response
    const mockTranscriptions = [
      'Add a new task for completing my math homework',
      'Create a project for my science fair experiment',
      'Set deadline for history essay to next Friday',
      'Mark chemistry lab as high priority'
    ]
    
    const randomTranscription = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)]
    
    return c.json({ 
      success: true, 
      transcription: randomTranscription,
      optimizedTask: `📚 ${randomTranscription.charAt(0).toUpperCase() + randomTranscription.slice(1)}`
    })
  } catch (error) {
    console.log('Error in speech-to-text:', error)
    return c.json({ error: 'Failed to convert speech to text' }, 500)
  }
})

// AI task optimization with prompt engineering
app.post('/make-server-7c72c08c/optimize-task', async (c) => {
  try {
    const { taskText } = await c.req.json()
    
    // Simulate AI optimization with prompt engineering
    const optimizedSuggestions = [
      {
        original: taskText,
        optimized: `🎯 ${taskText} - Break into 25-minute focused sessions`,
        reasoning: 'Applied Pomodoro technique for better focus',
        priority: 'medium'
      },
      {
        original: taskText,
        optimized: `📋 ${taskText} - Create checklist of subtasks first`,
        reasoning: 'Breaking down complex tasks improves completion rate',
        priority: 'high'
      },
      {
        original: taskText,
        optimized: `⏰ ${taskText} - Schedule for your peak energy time`,
        reasoning: 'Timing tasks with energy levels maximizes efficiency',
        priority: 'medium'
      }
    ]
    
    const randomSuggestion = optimizedSuggestions[Math.floor(Math.random() * optimizedSuggestions.length)]
    
    return c.json({ 
      success: true,
      suggestions: [randomSuggestion],
      promptEngineering: {
        technique: 'Task Optimization Framework',
        applied: ['Time-blocking', 'Priority matrix', 'Cognitive load reduction']
      }
    })
  } catch (error) {
    console.log('Error optimizing task:', error)
    return c.json({ error: 'Failed to optimize task' }, 500)
  }
})

// Generate AI flowchart data
app.post('/make-server-7c72c08c/generate-flowchart', async (c) => {
  try {
    const { tasks } = await c.req.json()
    
    // Simulate AI-generated flowchart with optimal timeframes
    const flowchartData = {
      nodes: tasks.map((task: any, index: number) => ({
        id: task.id || `task_${index}`,
        label: task.title || task.name,
        type: 'task',
        priority: task.priority || 'medium',
        estimatedTime: Math.floor(Math.random() * 4) + 1, // 1-4 hours
        dependencies: index > 0 ? [`task_${index - 1}`] : [],
        position: { x: index * 200, y: Math.floor(index / 3) * 150 }
      })),
      connections: tasks.slice(1).map((_: any, index: number) => ({
        from: `task_${index}`,
        to: `task_${index + 1}`,
        type: 'sequence'
      })),
      recommendations: {
        totalTime: tasks.length * 2.5,
        suggestedSchedule: 'Morning focus sessions work best for complex tasks',
        optimizationTips: ['Group similar tasks together', 'Take breaks between high-priority items']
      }
    }
    
    return c.json({ success: true, flowchartData })
  } catch (error) {
    console.log('Error generating flowchart:', error)
    return c.json({ error: 'Failed to generate flowchart' }, 500)
  }
})

// Delete task
app.delete('/make-server-7c72c08c/tasks/:taskId', async (c) => {
  try {
    const taskId = c.req.param('taskId')
    await kv.del(taskId)
    
    return c.json({ success: true })
  } catch (error) {
    console.log('Error deleting task:', error)
    return c.json({ error: 'Failed to delete task' }, 500)
  }
})

Deno.serve(app.fetch)