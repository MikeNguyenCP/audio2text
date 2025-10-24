"use client"

import { useState, useRef, useCallback, useEffect } from 'react'

// Speech recognition types
interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor
    webkitSpeechRecognition: SpeechRecognitionConstructor
  }
}

export interface SpeechRecognitionHook {
  isSupported: boolean
  isListening: boolean
  transcript: string
  interimTranscript: string
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
  error: string | null
}

// Error messages mapping
const errorMessages: Record<string, string> = {
  'not-allowed': 'Microphone access denied. Please enable microphone permissions.',
  'no-speech': 'No speech detected. Please try speaking again.',
  'network': 'Network error. Please check your connection.',
  'not-supported': 'Speech recognition not supported in this browser.',
  'service-not-allowed': 'Speech recognition service not allowed.',
  'bad-grammar': 'Speech recognition grammar error.',
  'language-not-supported': 'Language not supported for speech recognition.',
  'aborted': 'Speech recognition was aborted.',
  'audio-capture': 'Audio capture failed. Please check your microphone.',
  'audio-not-allowed': 'Audio not allowed. Please check permissions.'
}

export const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)

  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (SpeechRecognition) {
      setIsSupported(true)
      recognitionRef.current = new SpeechRecognition()
      
      // Configure recognition
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'
      recognitionRef.current.maxAlternatives = 1
      
      // Event handlers
      recognitionRef.current.onstart = () => {
        setIsListening(true)
        setError(null)
      }
      
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = ''
        let interimTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }
        
        setTranscript(prev => prev + finalTranscript)
        setInterimTranscript(interimTranscript)
      }
      
      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        const errorMessage = errorMessages[event.error] || `Speech recognition error: ${event.error}`
        setError(errorMessage)
        setIsListening(false)
      }
      
      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    } else {
      setIsSupported(false)
      setError(errorMessages['not-supported'])
    }

    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening && isSupported) {
      setTranscript('')
      setInterimTranscript('')
      setError(null)
      try {
        recognitionRef.current.start()
      } catch (err) {
        setError('Failed to start speech recognition. Please try again.')
      }
    }
  }, [isListening, isSupported])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop()
      } catch (err) {
        setError('Failed to stop speech recognition.')
      }
    }
  }, [isListening])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
    setError(null)
  }, [])

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript
  }
}
