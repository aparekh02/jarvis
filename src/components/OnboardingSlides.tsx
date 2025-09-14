import React, { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { motion, AnimatePresence } from 'motion/react'
import { 
  ChevronRight, 
  ChevronLeft, 
  BookOpen, 
  Workflow, 
  Mic, 
  Volume2, 
  Brain, 
  Sparkles,
  Users,
  Settings,
  Shield,
  Lightbulb,
  Target,
  Calendar,
  CheckCircle2,
  Play,
  ArrowRight
} from 'lucide-react'
import { JarvisLogo } from './JarvisLogo'

interface OnboardingSlidesProps {
  onComplete: () => void
}

export function OnboardingSlides({ onComplete }: OnboardingSlidesProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      title: "Welcome to Jarvis",
      subtitle: "Work like Tony Stark",
      content: (
        <div className="text-center space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Transform Your Study Experience
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Jarvis combines AI intelligence with intuitive design to help you manage tasks, 
              optimize your workflow, and achieve academic success with less stress.
            </p>
          </div>
          <div className="flex justify-center">
            <JarvisLogo size="lg" animate={true} />
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">Smart Planning</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600">AI Insights</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm text-gray-600">Better Results</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "AI-Powered Flowchart",
      subtitle: "Visualize Your Optimal Path",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Workflow className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Intelligent Task Sequencing
            </h3>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
                  AI Analysis
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                    Optimal task ordering
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                    Time estimation
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                    Priority mapping
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                    Dependency tracking
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <Lightbulb className="w-4 h-4 mr-2 text-yellow-600" />
                  Smart Recommendations
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                    Best study times
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                    Break scheduling
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                    Task grouping
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                    Efficiency tips
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700">
              Powered by Advanced AI
            </Badge>
          </div>
        </div>
      )
    },
    {
      title: "Voice AI Agents",
      subtitle: "Hands-Free Productivity",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mic className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Voice-Powered Assistant
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Volume2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-blue-700">Text-to-Speech</h4>
                </div>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Read tasks aloud</li>
                  <li>• Audio instructions</li>
                  <li>• Hands-free updates</li>
                  <li>• Accessibility support</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <Mic className="w-5 h-5 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-green-700">Speech-to-Text</h4>
                </div>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Voice task creation</li>
                  <li>• Quick notes</li>
                  <li>• Natural language</li>
                  <li>• AI optimization</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-center mb-3">
              <Brain className="w-6 h-6 text-purple-600 mr-2" />
              <h4 className="font-semibold text-purple-700">Prompt Engineering</h4>
            </div>
            <p className="text-sm text-purple-600 text-center">
              Advanced AI transforms your voice input into optimized, actionable tasks 
              using sophisticated prompt engineering techniques.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Google Classroom & API Setup",
      subtitle: "Secure Integration",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Seamless Integration
            </h3>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h4 className="font-semibold text-blue-700 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Secure API Configuration
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                  <span className="text-sm font-semibold text-blue-600">1</span>
                </div>
                <div>
                  <h5 className="font-medium text-gray-800">Google Classroom API</h5>
                  <p className="text-sm text-gray-600">
                    Automatically sync assignments and deadlines from your classes
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                  <span className="text-sm font-semibold text-blue-600">2</span>
                </div>
                <div>
                  <h5 className="font-medium text-gray-800">Voice Services API</h5>
                  <p className="text-sm text-gray-600">
                    Enable text-to-speech and speech-to-text functionality
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h5 className="font-medium text-gray-800">Environment Variables</h5>
                  <p className="text-sm text-gray-600">
                    All API keys are securely stored and never exposed to the frontend
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center">
              <Settings className="w-5 h-5 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-700">
                <strong>Note:</strong> API keys can be configured in your environment settings. 
                The app works with mock data until real APIs are connected.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Ready to Start!",
      subtitle: "Your AI Study Assistant Awaits",
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto">
            <Play className="w-12 h-12 text-white" />
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              You're All Set!
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Jarvis is ready to help you organize your tasks, optimize your workflow, 
              and achieve your academic goals with the power of AI.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-700 mb-2">Quick Start</h4>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Add your first task</li>
                <li>• Try voice commands</li>
                <li>• Generate AI flowchart</li>
                <li>• Sync with Classroom</li>
              </ul>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-700 mb-2">Pro Tips</h4>
              <ul className="text-sm text-purple-600 space-y-1">
                <li>• Use voice for quick notes</li>
                <li>• Check AI recommendations</li>
                <li>• Organize with projects</li>
                <li>• Follow the flowchart</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-4">
            <Badge variant="secondary" className="bg-gradient-to-r from-green-100 to-blue-100 text-green-700 text-sm px-4 py-2">
              ✨ AI-Powered • 🎤 Voice-Enabled • 📚 Student-Focused
            </Badge>
          </div>
        </div>
      )
    }
  ]

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      onComplete()
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const progress = ((currentSlide + 1) / slides.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-4xl border-blue-200 shadow-2xl">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <JarvisLogo size="sm" />
                <div>
                  <h1 className="text-xl font-bold">Jarvis</h1>
                  <p className="text-blue-100 text-sm">Setup & Introduction</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {currentSlide + 1} of {slides.length}
              </Badge>
            </div>
            <Progress value={progress} className="h-2 bg-white/20" />
          </div>

          {/* Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="min-h-[400px] flex flex-col justify-center"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {slides[currentSlide].title}
                  </h2>
                  <p className="text-lg text-gray-600">
                    {slides[currentSlide].subtitle}
                  </p>
                </div>
                
                <div className="flex-1">
                  {slides[currentSlide].content}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 bg-gray-50 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="border-gray-300"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentSlide 
                      ? 'bg-blue-600 w-6' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={nextSlide}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {currentSlide === slides.length - 1 ? (
                <>
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}