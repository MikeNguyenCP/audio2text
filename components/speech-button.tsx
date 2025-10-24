"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Mic, MicOff, Loader2, AlertCircle } from 'lucide-react'

interface SpeechButtonProps {
  onStart: () => void
  onStop: () => void
  isListening: boolean
  isProcessing: boolean
  error: string | null
  disabled?: boolean
  className?: string
}

// Button styles for different states
const buttonStyles = {
  idle: {
    icon: Mic,
    color: "text-gray-600",
    background: "bg-gray-100 hover:bg-gray-200",
    animation: ""
  },
  listening: {
    icon: MicOff,
    color: "text-white",
    background: "bg-red-500 hover:bg-red-600",
    animation: "animate-pulse"
  },
  processing: {
    icon: Loader2,
    color: "text-white",
    background: "bg-blue-500",
    animation: "animate-spin"
  },
  error: {
    icon: AlertCircle,
    color: "text-white",
    background: "bg-red-500 hover:bg-red-600",
    animation: ""
  }
}

// ARIA labels for accessibility
const ariaLabels = {
  idle: "Start voice input",
  listening: "Stop voice input",
  processing: "Processing speech",
  error: "Speech recognition error"
}

export const SpeechButton: React.FC<SpeechButtonProps> = ({
  onStart,
  onStop,
  isListening,
  isProcessing,
  error,
  disabled = false,
  className
}) => {
  const handleClick = () => {
    if (isListening) {
      onStop()
    } else {
      onStart()
    }
  }

  const getButtonState = () => {
    if (error) return 'error'
    if (isProcessing) return 'processing'
    if (isListening) return 'listening'
    return 'idle'
  }

  const buttonState = getButtonState()
  const styles = buttonStyles[buttonState]
  const Icon = styles.icon

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={disabled || isProcessing}
      className={cn(
        "h-10 w-10 md:h-12 md:w-12 flex-shrink-0",
        styles.background,
        styles.animation,
        className
      )}
      aria-label={ariaLabels[buttonState]}
      title={ariaLabels[buttonState]}
    >
      <Icon 
        className={cn(
          "h-4 w-4 md:h-5 md:w-5", 
          styles.color,
          buttonState === 'processing' && styles.animation
        )}
      />
    </Button>
  )
}
