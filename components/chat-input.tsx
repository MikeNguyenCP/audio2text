"use client"

import React, { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2 } from "lucide-react"

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  disabled?: boolean
  isLoading?: boolean
  placeholder?: string
}

export function ChatInput({ 
  value, 
  onChange, 
  onSend, 
  disabled = false, 
  isLoading = false,
  placeholder = "Ask a question about the audio content..."
}: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus()
    }
  }, [disabled])

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      onSend()
    }
  }

  const handleSend = () => {
    if (!value.trim() || isLoading || disabled) return
    onSend()
  }

  return (
    <div className="border-t border-gray-200 p-4 md:p-6 bg-gray-50 min-h-[80px] md:min-h-[100px] flex flex-col justify-center">
      <div className="flex gap-2 md:gap-3">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className="flex-1 h-10 md:h-12 text-sm md:text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-none"
          aria-label="Type your question about the audio content"
          aria-describedby="input-help-text"
        />
        <Button
          onClick={handleSend}
          disabled={disabled || isLoading || !value.trim()}
          size="icon"
          className="h-10 w-10 md:h-12 md:w-12 bg-blue-600 hover:bg-blue-700 flex-shrink-0"
          aria-label={isLoading ? "Sending message" : "Send message"}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
          ) : (
            <Send className="h-4 w-4 md:h-5 md:w-5" />
          )}
        </Button>
      </div>
      <p id="input-help-text" className="text-xs text-gray-500 mt-2 md:mt-3 text-center">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  )
}
