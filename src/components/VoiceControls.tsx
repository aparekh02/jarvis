import React, { useState, useRef } from 'react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { toast } from 'sonner@2.0.3'
import { motion, AnimatePresence } from 'motion/react'
import { createJarvisSpeech } from '../utils/jarvis-voice'
import { 
  Mic, 
  Volume2, 
  Sparkles, 
  Loader2,
  Play,
  Pause,
  MicIcon,
  Brain,
  Lightbulb,
  Wand2,
  MessageSquare,
  VolumeX
} from 'lucide-react'
// Using OpenAI API for voice and AI features

interface VoiceControlsProps {
  onTaskOptimized: () => void
}

interface OptimizationSuggestion {
  original: string
  optimized: string
  reasoning: string
  priority: 'low' | 'medium' | 'high'
}

export function VoiceControls({ onTaskOptimized }: VoiceControlsProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [currentText, setCurrentText] = useState('')
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Text-to-Speech function with consistent Jarvis-like voice
  const speakText = async (text: string) => {
    try {
      setIsSpeaking(true)
      
      const env = import.meta.env || {}
      const openaiApiKey = env.VITE_OPENAI_API_KEY
      
      if (!openaiApiKey) {
        // Use the centralized Jarvis voice utility
        try {
          await createJarvisSpeech(text)
          console.log('Jarvis speech completed successfully')
        } catch (error) {
          console.error('Error with Jarvis speech:', error)
          console.log('Speech synthesis unavailable, continuing silently')
        } finally {
          setIsSpeaking(false)
        }
        return
      }

      // Use OpenAI TTS API
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: 'alloy',
          speed: 0.9
        })
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        
        audio.onended = () => {
          setIsSpeaking(false)
          URL.revokeObjectURL(audioUrl)
        }
        
        audio.onerror = () => {
          setIsSpeaking(false)
          URL.revokeObjectURL(audioUrl)
          toast.error('Error playing audio')
        }
        
        await audio.play()
        toast.success('Reading text aloud (OpenAI TTS)')
      } else {
        throw new Error('OpenAI TTS API request failed')
      }
    } catch (error) {
      console.error('Error in text-to-speech:', error)
      toast.error('Text-to-speech service unavailable')
      setIsSpeaking(false)
    }
  }

  // Speech-to-Text function using Web Speech API or OpenAI Whisper
  const startListening = async () => {
    try {
      setIsListening(true)
      setIsProcessing(true)

      const env = import.meta.env || {}
      const openaiApiKey = env.VITE_OPENAI_API_KEY

      if (!openaiApiKey) {
        // Fallback to Web Speech API
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
          toast.error('Speech recognition not supported and OpenAI API key not configured')
          return
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()
        
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'

        recognition.onresult = async (event) => {
          const transcript = event.results[0][0].transcript
          setCurrentText(transcript)
          await optimizeTask(transcript)
          toast.success('Voice input processed successfully (Web Speech API)!')
        }

        recognition.onerror = () => {
          toast.error('Speech recognition failed')
        }

        recognition.onend = () => {
          setIsListening(false)
          setIsProcessing(false)
        }

        recognition.start()
        return
      }

      // Use OpenAI Whisper API (requires audio recording)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream)
        const chunks: BlobPart[] = []

        mediaRecorder.ondataavailable = (e) => {
          chunks.push(e.data)
        }

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(chunks, { type: 'audio/wav' })
          const formData = new FormData()
          formData.append('file', audioBlob, 'audio.wav')
          formData.append('model', 'whisper-1')

          try {
            const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${openaiApiKey}`
              },
              body: formData
            })

            if (response.ok) {
              const data = await response.json()
              setCurrentText(data.text)
              await optimizeTask(data.text)
              toast.success('Voice input processed successfully (OpenAI Whisper)!')
            } else {
              throw new Error('OpenAI Whisper API request failed')
            }
          } catch (error) {
            console.error('Error with OpenAI Whisper:', error)
            toast.error('Speech-to-text failed')
          } finally {
            stream.getTracks().forEach(track => track.stop())
          }
        }

        mediaRecorder.start()
        setTimeout(() => {
          mediaRecorder.stop()
        }, 5000) // Record for 5 seconds

      } catch (error) {
        console.error('Error accessing microphone:', error)
        toast.error('Could not access microphone')
      }

    } catch (error) {
      console.error('Error in speech-to-text:', error)
      toast.error('Speech recognition failed')
    } finally {
      setIsListening(false)
      setIsProcessing(false)
    }
  }

  // Task optimization with prompt engineering using OpenAI
  const optimizeTask = async (taskText: string) => {
    try {
      setIsProcessing(true)
      
      const env = import.meta.env || {}
      const openaiApiKey = env.VITE_OPENAI_API_KEY
      
      if (!openaiApiKey) {
        // Generate mock suggestions if no API key
        const mockSuggestions = [
          {
            original: taskText,
            optimized: `🎯 ${taskText} - Break into 25-minute focused sessions`,
            reasoning: 'Applied Pomodoro technique for better focus and productivity',
            priority: 'medium' as const
          },
          {
            original: taskText,
            optimized: `📋 ${taskText} - Create checklist of subtasks first`,
            reasoning: 'Breaking down complex tasks improves completion rate by 40%',
            priority: 'high' as const
          }
        ]
        
        setSuggestions(mockSuggestions)
        setShowSuggestions(true)
        toast.success('AI optimizations generated (demo mode)')
        return
      }

      // Use OpenAI API for task optimization
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
              content: `You are a productivity expert specializing in student task optimization using advanced prompt engineering techniques. 

Your role is to analyze student tasks and provide 2-3 optimized versions that incorporate:
- Time-blocking strategies
- Priority matrix concepts
- Cognitive load reduction
- Pomodoro technique
- Energy level optimization
- Study science principles

For each optimization, provide:
1. An improved task description with emoji and actionable steps
2. Clear reasoning based on productivity research
3. Priority level (high/medium/low)

Respond in JSON format with an array of suggestions.`
            },
            {
              role: 'user',
              content: `Optimize this student task: "${taskText}"`
            }
          ],
          max_tokens: 800,
          temperature: 0.7
        })
      })

      if (response.ok) {
        const data = await response.json()
        const content = data.choices[0].message.content
        
        try {
          // Try to parse JSON response
          const suggestions = JSON.parse(content)
          setSuggestions(suggestions)
          setShowSuggestions(true)
          toast.success(`AI generated ${suggestions.length} optimization${suggestions.length > 1 ? 's' : ''}`)
        } catch (parseError) {
          // If JSON parsing fails, create suggestions from text
          const suggestions = [{
            original: taskText,
            optimized: content.substring(0, 100) + '...',
            reasoning: 'AI-powered optimization using advanced prompt engineering',
            priority: 'medium' as const
          }]
          setSuggestions(suggestions)
          setShowSuggestions(true)
          toast.success('AI optimization generated')
        }
      } else {
        throw new Error('OpenAI API request failed')
      }
    } catch (error) {
      console.error('Error optimizing task:', error)
      toast.error('Task optimization failed')
    } finally {
      setIsProcessing(false)
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

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      toast.info('Jarvis speech interrupted')
    }
  }

  return (
    <>
      {/* Floating Voice Controls */}
      <div className="fixed bottom-6 right-6 space-y-3 z-50">
        {/* Text-to-Speech Button */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={isSpeaking ? stopSpeaking : () => speakText('Good day, sir. Jarvis is online and ready to assist with your productivity optimization. I can read your tasks aloud and provide intelligent workflow suggestions. How may I be of service?')}
            disabled={isProcessing}
            className={`w-14 h-14 rounded-full shadow-lg ${
              isSpeaking 
                ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                : 'bg-white text-blue-600 border-2 border-blue-200 hover:bg-blue-50'
            } transition-all duration-300 hover:scale-110`}
          >
            {isSpeaking ? (
              <VolumeX className="w-6 h-6" />
            ) : (
              <Volume2 className="w-6 h-6" />
            )}
          </Button>
        </motion.div>

        {/* Speech-to-Text Button */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Button
            onClick={startListening}
            disabled={isListening || isSpeaking || isProcessing}
            className={`w-16 h-16 rounded-full shadow-xl ${
              isListening 
                ? 'bg-gradient-to-br from-red-500 to-red-600 text-white animate-pulse' 
                : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
            } transition-all duration-300 hover:scale-110`}
          >
            {isProcessing ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : isListening ? (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <Mic className="w-7 h-7" />
              </motion.div>
            ) : (
              <Mic className="w-7 h-7" />
            )}
          </Button>
        </motion.div>

        {/* AI Optimization Button */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={() => optimizeTask('Review my current tasks and suggest improvements')}
            disabled={isProcessing}
            className="w-12 h-12 rounded-full shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-300 hover:scale-110"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Brain className="w-5 h-5" />
            )}
          </Button>
        </motion.div>
      </div>

      {/* Voice Status Indicator */}
      <AnimatePresence>
        {(isListening || isSpeaking || isProcessing) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-32 right-6 z-50"
          >
            <Card className="bg-white/90 backdrop-blur-sm border-blue-200 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  {isListening && (
                    <>
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="w-3 h-3 bg-red-500 rounded-full"
                      />
                      <p className="text-sm font-medium text-red-700">Listening...</p>
                    </>
                  )}
                  {isSpeaking && (
                    <>
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="w-3 h-3 bg-blue-500 rounded-full"
                      />
                      <p className="text-sm font-medium text-blue-700">Speaking...</p>
                    </>
                  )}
                  {isProcessing && (
                    <>
                      <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
                      <p className="text-sm font-medium text-purple-700">Processing...</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Suggestions Modal */}
      <Dialog open={showSuggestions} onOpenChange={setShowSuggestions}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center text-blue-700">
              <Sparkles className="w-5 h-5 mr-2" />
              AI Task Optimization
              <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                Prompt Engineering
              </Badge>
            </DialogTitle>
            <DialogDescription>
              AI-powered suggestions to optimize your tasks using advanced prompt engineering techniques.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {currentText && (
              <div className="p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Original Input
                </h4>
                <p className="text-gray-900">{currentText}</p>
              </div>
            )}
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700 flex items-center">
                <Lightbulb className="w-4 h-4 mr-2" />
                Smart Suggestions
              </h4>
              
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border border-blue-200 rounded-lg bg-gradient-to-r from-blue-50 to-white hover:from-blue-100 hover:to-blue-50 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="outline" className={getPriorityColor(suggestion.priority)}>
                      {suggestion.priority} priority
                    </Badge>
                    <Wand2 className="w-4 h-4 text-blue-500" />
                  </div>
                  
                  <h5 className="font-medium text-gray-900 mb-2">{suggestion.optimized}</h5>
                  <p className="text-sm text-gray-600 mb-3">{suggestion.reasoning}</p>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        // In a real app, this would create the optimized task
                        toast.success('Optimized task created!')
                        onTaskOptimized()
                        setShowSuggestions(false)
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Apply Suggestion
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        setIsSpeaking(true)
                        try {
                          await speakText(suggestion.optimized)
                        } finally {
                          setIsSpeaking(false)
                        }
                      }}
                      className="border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      <Volume2 className="w-4 h-4 mr-1" />
                      Read Aloud
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-700 mb-2 flex items-center">
                <Brain className="w-4 h-4 mr-2" />
                Prompt Engineering Applied
              </h4>
              <div className="flex flex-wrap gap-2">
                {['Time-blocking', 'Priority Matrix', 'Cognitive Load Reduction', 'Pomodoro Technique'].map((technique) => (
                  <Badge
                    key={technique}
                    variant="outline"
                    className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-purple-200"
                  >
                    {technique}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}