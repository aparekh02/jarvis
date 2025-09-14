import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VoiceControlsProps {
  onVoiceInput: (text: string) => void;
  onTextToSpeech: (text: string) => void;
}

export function VoiceControls({ onVoiceInput, onTextToSpeech }: VoiceControlsProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Mock speech recognition
  const startListening = () => {
    setIsListening(true);
    setTranscript('');
    
    // Simulate speech recognition
    setTimeout(() => {
      const mockTranscript = "Complete math homework chapter 5 problems 1 through 20";
      setTranscript(mockTranscript);
      processVoiceInput(mockTranscript);
      setIsListening(false);
    }, 3000);
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const processVoiceInput = (text: string) => {
    // AI-powered prompt engineering to optimize the task
    const optimizedSuggestions = [
      "📚 Math Homework: Complete Chapter 5, Problems 1-20 (Est. 45 min)",
      "📊 Break down: Review concepts (10 min) → Solve problems (30 min) → Check answers (5 min)",
      "⏰ Suggested: Schedule for 7:00 PM today with 10-minute break after problem 10"
    ];
    
    setSuggestions(optimizedSuggestions);
    setShowSuggestions(true);
    onVoiceInput(text);
  };

  const speakText = (text: string) => {
    setIsSpeaking(true);
    onTextToSpeech(text);
    
    // Mock text-to-speech duration
    setTimeout(() => {
      setIsSpeaking(false);
    }, 2000);
  };

  const applySuggestion = (suggestion: string) => {
    setShowSuggestions(false);
    // Extract the main task from the suggestion
    const cleanTask = suggestion.replace(/[📚📊⏰]/g, '').split(':')[1]?.trim() || suggestion;
    onVoiceInput(cleanTask);
  };

  return (
    <>
      {/* Floating Voice Controls */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-4 z-40">
        {/* Text-to-Speech Button */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            onClick={() => speakText("Your next task is due in 2 hours. Would you like me to read the details?")}
            className={`w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
              isSpeaking 
                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
            }`}
            disabled={isSpeaking}
          >
            {isSpeaking ? (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <Volume2 className="w-6 h-6" />
              </motion.div>
            ) : (
              <Volume2 className="w-6 h-6" />
            )}
          </Button>
        </motion.div>

        {/* Voice-to-Text Button */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            onClick={isListening ? stopListening : startListening}
            className={`w-16 h-16 rounded-full shadow-xl transition-all duration-300 ${
              isListening 
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
            }`}
          >
            {isListening ? (
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
              >
                <MicOff className="w-7 h-7" />
              </motion.div>
            ) : (
              <Mic className="w-7 h-7" />
            )}
          </Button>
        </motion.div>
      </div>

      {/* Listening Indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-32 right-6 z-40"
          >
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-blue-200">
              <CardContent className="p-4 text-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-8 h-8 bg-red-500 rounded-full mx-auto mb-2"
                />
                <p className="text-sm font-medium text-gray-700">Listening...</p>
                {transcript && (
                  <p className="text-xs text-blue-600 mt-1 max-w-48">{transcript}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Suggestions Panel */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-20 right-6 z-40 max-w-sm"
          >
            <Card className="bg-gradient-to-br from-blue-50 to-white shadow-xl border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-blue-800">AI Optimized Suggestions</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSuggestions(false)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </Button>
                </div>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        className="p-3 cursor-pointer hover:bg-blue-50 transition-colors border-blue-100 bg-white/60 backdrop-blur-sm"
                        onClick={() => applySuggestion(suggestion)}
                      >
                        <p className="text-sm text-gray-700">{suggestion}</p>
                      </Card>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-3 text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-100">
                  💡 Powered by prompt engineering AI
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}