"use client"

import React, { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Message, ChatRequest, ChatResponse } from "@/lib/types"
import { ChatCanvas } from "@/components/chat-canvas"
import { ChatInput } from "@/components/chat-input"

interface ChatInterfaceProps {
  transcript: string
  onError: (error: string) => void
  disabled?: boolean
  isExpanded?: boolean
}

export function ChatInterface({ transcript, onError, disabled = false, isExpanded = false }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<{ scrollToBottom: () => void }>(null)

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || disabled) return

    const userMessage: Message = {
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)
    setError(null)

    // Always scroll to bottom when sending a message
    setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.scrollToBottom()
      }
    }, 100)

    try {
      const requestBody: ChatRequest = {
        message: userMessage.content,
        transcript: transcript
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to get response")
      }

      const data: ChatResponse = await response.json()
      
      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
        timestamp: new Date(data.timestamp)
      }

      setMessages(prev => [...prev, assistantMessage])

      // Always scroll to bottom when receiving a response
      setTimeout(() => {
        if (canvasRef.current) {
          canvasRef.current.scrollToBottom()
        }
      }, 100)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      onError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <Card className={cn(
      "w-full mx-auto flex flex-col shadow-sm border border-gray-200 bg-white",
      isExpanded ? "max-w-5xl h-[600px] md:h-[700px]" : "max-w-4xl h-[500px] md:h-[600px]"
    )}>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Chat Canvas - Completely separated from input */}
        <ChatCanvas
          ref={canvasRef}
          messages={messages}
          isLoading={isLoading}
          error={error}
        />

        {/* Chat Input - Completely separated from canvas */}
        <ChatInput
          value={inputMessage}
          onChange={setInputMessage}
          onSend={handleSendMessage}
          disabled={disabled}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  )
}
