"use client"

import React, { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Send, Loader2 } from "lucide-react"
import { SpeechButton } from "@/components/speech-button"
import { useSpeechRecognition } from "@/lib/hooks/useSpeechRecognition"

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  disabled?: boolean
  isLoading?: boolean
  placeholder?: string
  enableSpeech?: boolean
}

export function ChatInput({ 
  value, 
  onChange, 
  onSend, 
  disabled = false, 
  isLoading = false,
  placeholder = "Ask a question about the audio content...",
  enableSpeech = true
}: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Speech recognition hook
  const {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition()

  // Update input when speech recognition completes
  useEffect(() => {
    if (transcript) {
      onChange(transcript)
      resetTranscript()
    }
  }, [transcript, onChange, resetTranscript])

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus()
    }
  }, [disabled])

  // Show interim results while speaking
  const displayValue = interimTranscript || value

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      onSend()
    }
  }

  const handleSend = () => {
    if (!displayValue.trim() || isLoading || disabled) return
    onSend()
  }

  return (
    <div className="border-t border-gray-200 p-2 md:p-6 bg-gray-50 flex flex-col justify-center flex-shrink-0">
      {/* Speech recognition error alert */}
      {speechError && (
        <Alert variant="destructive" className="mb-3">
          <AlertDescription>
            {speechError}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex gap-1 md:gap-3">
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            value={displayValue}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            className="flex-1 h-9 md:h-12 text-xs md:text-base border-gray-200 focus:border-blue-500 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-none pr-16 md:pr-20"
            aria-label="Type your question about the audio content"
            aria-describedby="input-help-text"
          />
          
          {/* Speech recognition indicator */}
          {isListening && (
            <div className="absolute right-1 md:right-2 top-1/2 transform -translate-y-1/2">
              <div className="flex items-center space-x-1 text-red-500">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs hidden md:inline">Listening...</span>
              </div>
            </div>
          )}
        </div>

        {/* Speech Button */}
        {enableSpeech && isSupported && (
          <SpeechButton
            onStart={startListening}
            onStop={stopListening}
            isListening={isListening}
            isProcessing={isLoading}
            error={speechError}
            disabled={disabled}
          />
        )}

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={disabled || isLoading || !displayValue.trim()}
          size="icon"
          className="h-9 w-9 md:h-12 md:w-12 bg-blue-600 hover:bg-blue-700 flex-shrink-0"
          aria-label={isLoading ? "Sending message" : "Send message"}
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 md:h-5 md:w-5 animate-spin" />
          ) : (
            <Send className="h-3 w-3 md:h-5 md:w-5" />
          )}
        </Button>
      </div>
      <p id="input-help-text" className="text-xs text-gray-500 mt-2 md:mt-3 text-center">
        Press Enter to send, Shift+Enter for new line{enableSpeech && isSupported ? ", or click microphone to speak" : ""}
      </p>
    </div>
  )
}
