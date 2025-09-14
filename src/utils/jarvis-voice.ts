// Utility for consistent Jarvis-like voice configuration across the app

export interface JarvisVoiceConfig {
  rate: number
  pitch: number
  volume: number
}

export const JARVIS_VOICE_CONFIG: JarvisVoiceConfig = {
  rate: 0.9,    // Optimized rate for natural flow
  pitch: 0.75,  // Deeper pitch for authoritative British male voice
  volume: 0.95  // Clear and confident volume
}

// Text preprocessing for better pronunciation and flow
export const preprocessJarvisText = (text: string): string => {
  let processedText = text
  
  // Ensure "Jarvis" is pronounced as a word, not spelled out
  processedText = processedText.replace(/J\.A\.R\.V\.I\.S\./gi, 'Jarvis')
  processedText = processedText.replace(/J\s*A\s*R\s*V\s*I\s*S/gi, 'Jarvis')
  
  // Add natural pauses for better flow
  processedText = processedText.replace(/\.\s+/g, '. ')
  processedText = processedText.replace(/,\s*/g, ', ')
  processedText = processedText.replace(/;\s*/g, '; ')
  processedText = processedText.replace(/:\s*/g, ': ')
  
  // Replace common abbreviations for better pronunciation
  processedText = processedText.replace(/\bAI\b/g, 'artificial intelligence')
  processedText = processedText.replace(/\bAPI\b/g, 'A P I')
  processedText = processedText.replace(/\bTTS\b/g, 'text to speech')
  processedText = processedText.replace(/\bSTT\b/g, 'speech to text')
  
  // Improve timing markers pronunciation
  processedText = processedText.replace(/(\d+)\s*minutes?/gi, '$1 minute$2')
  processedText = processedText.replace(/(\d+)\s*hours?/gi, '$1 hour$2')
  processedText = processedText.replace(/(\d+)\s*seconds?/gi, '$1 second$2')
  
  // Add slight emphasis to important phrases
  processedText = processedText.replace(/\b(excellent|outstanding|well done|congratulations)\b/gi, (match) => 
    match + '.')
  
  return processedText.trim()
}

export const selectJarvisVoice = (): SpeechSynthesisVoice | null => {
  const voices = window.speechSynthesis.getVoices()
  
  // Enhanced priority order for the most natural Jarvis-like voice selection
  const jarvisVoice = 
    // Priority 1: Look for specific high-quality British English male voices
    voices.find(voice => 
      voice.lang.includes('en-GB') && 
      (voice.name.toLowerCase().includes('daniel') || 
       voice.name.toLowerCase().includes('oliver') ||
       voice.name.toLowerCase().includes('arthur') ||
       voice.name.toLowerCase().includes('male'))
    ) ||
    // Priority 2: Look for premium/natural British voices
    voices.find(voice => 
      voice.lang.includes('en-GB') && 
      (voice.name.toLowerCase().includes('premium') ||
       voice.name.toLowerCase().includes('enhanced') ||
       voice.name.toLowerCase().includes('neural'))
    ) ||
    // Priority 3: Any British English voice
    voices.find(voice => voice.lang.includes('en-GB')) ||
    // Priority 4: High-quality US English male voices with deeper tone
    voices.find(voice => 
      voice.lang.startsWith('en-US') && 
      (voice.name.toLowerCase().includes('alex') ||
       voice.name.toLowerCase().includes('daniel') ||
       voice.name.toLowerCase().includes('fred') ||
       voice.name.toLowerCase().includes('male'))
    ) ||
    // Priority 5: Premium US English voices
    voices.find(voice => 
      voice.lang.startsWith('en-US') && 
      (voice.name.toLowerCase().includes('premium') ||
       voice.name.toLowerCase().includes('enhanced') ||
       voice.name.toLowerCase().includes('neural'))
    ) ||
    // Priority 6: Any authoritative English voice (avoid obviously female voices)
    voices.find(voice => 
      voice.lang.startsWith('en') && 
      !voice.name.toLowerCase().includes('female') &&
      !voice.name.toLowerCase().includes('woman') &&
      !voice.name.toLowerCase().includes('sara') &&
      !voice.name.toLowerCase().includes('susan') &&
      !voice.name.toLowerCase().includes('karen') &&
      !voice.name.toLowerCase().includes('samantha') &&
      !voice.name.toLowerCase().includes('victoria') &&
      !voice.name.toLowerCase().includes('allison')
    ) ||
    // Priority 7: Last resort - any English voice
    voices.find(voice => voice.lang.startsWith('en'))
  
  if (jarvisVoice) {
    console.log(`Selected Jarvis voice: ${jarvisVoice.name} (${jarvisVoice.lang})`)
  }
  
  return jarvisVoice || null
}

// Voice warm-up to ensure consistent voice selection and synthesis engine readiness
let voiceWarmedUp = false
const warmUpVoice = async (): Promise<void> => {
  if (voiceWarmedUp) return
  
  return new Promise((resolve) => {
    try {
      const warmUpUtterance = new SpeechSynthesisUtterance('')
      warmUpUtterance.volume = 0
      warmUpUtterance.rate = 1
      warmUpUtterance.pitch = 1
      
      warmUpUtterance.onend = () => {
        voiceWarmedUp = true
        resolve()
      }
      
      warmUpUtterance.onerror = () => {
        voiceWarmedUp = true
        resolve()
      }
      
      // Warm up timeout
      setTimeout(() => {
        voiceWarmedUp = true
        resolve()
      }, 500)
      
      window.speechSynthesis.speak(warmUpUtterance)
    } catch (error) {
      voiceWarmedUp = true
      resolve()
    }
  })
}

export const createJarvisSpeech = async (text: string): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Speech synthesis not supported'))
      return
    }
    
    try {
      // Warm up the voice synthesis engine for consistency
      await warmUpVoice()
      
      // Cancel any ongoing speech to prevent overlap
      window.speechSynthesis.cancel()
      
      // Preprocess text for better pronunciation and flow
      const processedText = preprocessJarvisText(text)
      
      // Slight delay to ensure cancellation is processed and engine is ready
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(processedText)
        
        // Apply optimized Jarvis voice configuration for smoothness
        utterance.rate = JARVIS_VOICE_CONFIG.rate
        utterance.pitch = JARVIS_VOICE_CONFIG.pitch
        utterance.volume = JARVIS_VOICE_CONFIG.volume
        
        // Enhanced language setting for better pronunciation
        utterance.lang = 'en-GB'
        
        let hasResolved = false
        
        utterance.onend = () => {
          if (!hasResolved) {
            hasResolved = true
            resolve()
          }
        }
        
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event)
          if (!hasResolved) {
            hasResolved = true
            // Don't reject for speech errors, just resolve silently for UX
            resolve()
          }
        }
        
        // Set the optimal Jarvis-like voice with error handling
        const setVoiceAndSpeak = () => {
          try {
            const jarvisVoice = selectJarvisVoice()
            if (jarvisVoice) {
              utterance.voice = jarvisVoice
              console.log(`Using voice: ${jarvisVoice.name} for smooth Jarvis speech`)
            }
            
            // Enhanced timeout with better error handling for smoother experience
            const speechTimeout = setTimeout(() => {
              if (!hasResolved) {
                hasResolved = true
                console.warn('Speech synthesis timeout - resolving gracefully')
                resolve()
              }
            }, Math.max(processedText.length * 100, 5000)) // Dynamic timeout based on text length
            
            utterance.onstart = () => {
              clearTimeout(speechTimeout)
              console.log('Jarvis speech started successfully')
            }
            
            // Speak with enhanced error handling
            window.speechSynthesis.speak(utterance)
            
          } catch (error) {
            console.error('Error setting up Jarvis speech:', error)
            if (!hasResolved) {
              hasResolved = true
              resolve()
            }
          }
        }
        
        // Enhanced voice loading with better fallback handling
        const voices = window.speechSynthesis.getVoices()
        if (voices.length === 0) {
          let voicesLoadAttempts = 0
          const maxAttempts = 3
          
          const voicesChangedHandler = () => {
            voicesLoadAttempts++
            const currentVoices = window.speechSynthesis.getVoices()
            
            if (currentVoices.length > 0 || voicesLoadAttempts >= maxAttempts) {
              window.speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler)
              setVoiceAndSpeak()
            }
          }
          
          window.speechSynthesis.addEventListener('voiceschanged', voicesChangedHandler)
          
          // Enhanced fallback timeout for better reliability
          setTimeout(() => {
            window.speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler)
            if (!hasResolved) {
              console.log('Voice loading timeout - proceeding with default voice')
              setVoiceAndSpeak()
            }
          }, 2000)
        } else {
          setVoiceAndSpeak()
        }
      }, 150) // Increased delay for better consistency
      
    } catch (error) {
      console.error('Error in createJarvisSpeech:', error)
      resolve() // Always resolve to prevent blocking the UI
    }
  })
}