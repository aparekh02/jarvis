import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ChevronRight, ChevronLeft, BookOpen, MessageSquare, Settings, CheckCircle } from 'lucide-react';
import { JarvisLogo } from './JarvisLogo';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: <div className="w-16 h-16 flex items-center justify-center"><JarvisLogo size="lg" animate={true} /></div>,
      title: "Welcome to Jarvis",
      description: "Work like Tony Stark with your AI-powered productivity companion designed to help students organize tasks, manage deadlines, and optimize study workflows.",
      content: "Jarvis combines task management with AI-powered insights to create the perfect study environment for students."
    },
    {
      icon: <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
        <div className="w-3 h-3 bg-white rounded-full"></div>
      </div>,
      title: "AI-Powered Flowcharts",
      description: "Our intelligent flowchart generator analyzes your tasks and creates optimal study timelines with smart scheduling recommendations.",
      content: "The AI considers deadlines, task complexity, and your study patterns to suggest the best order and timeframes for completing assignments."
    },
    {
      icon: <MessageSquare className="w-16 h-16 text-blue-600" />,
      title: "Voice AI Agents",
      description: "Use voice commands to add tasks, get task summaries read aloud, and receive AI-optimized suggestions for better productivity.",
      content: "Our prompt engineering technology helps rephrase and optimize your tasks for maximum clarity and actionability."
    },
    {
      icon: <Settings className="w-16 h-16 text-blue-600" />,
      title: "Environment Setup",
      description: "Configure your .env file with API keys for Google Classroom integration and AI services to unlock the full potential of Jarvis.",
      content: "Add your GOOGLE_CLASSROOM_API_KEY, OPENAI_API_KEY, and SPEECH_API_KEY to enable all features. Don't worry - we'll guide you through the setup!"
    },
    {
      icon: <CheckCircle className="w-16 h-16 text-green-600" />,
      title: "You're All Set!",
      description: "Start by adding your first task or project. Jarvis will learn from your patterns and provide increasingly helpful suggestions.",
      content: "Remember: This app is designed to enhance your productivity while maintaining simplicity and focus."
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            {slides[currentSlide].icon}
          </div>
          <CardTitle className="text-2xl mb-2">{slides[currentSlide].title}</CardTitle>
          <p className="text-blue-600 font-medium">{slides[currentSlide].description}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center text-gray-700 leading-relaxed">
            {slides[currentSlide].content}
          </div>
          
          {/* Progress indicators */}
          <div className="flex justify-center space-x-2">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-blue-600' : 'bg-blue-200'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <Button
              onClick={nextSlide}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <span>{currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {currentSlide === slides.length - 2 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Sample .env Configuration:</h4>
              <pre className="text-sm text-blue-700 bg-white p-2 rounded border overflow-x-auto">
{`GOOGLE_CLASSROOM_API_KEY=your_classroom_api_key
OPENAI_API_KEY=your_openai_api_key
SPEECH_API_KEY=your_speech_api_key`}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}