"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Send, Loader2, User, Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import { Message, ChatRequest, ChatResponse } from "@/lib/types"
import { renderFormattedText } from "@/lib/text-formatting"

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
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive (but not during typing)
  useEffect(() => {
    if (scrollAreaRef.current && messages.length > 0) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        // Use requestAnimationFrame to ensure DOM is updated
        requestAnimationFrame(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight
        })
      }
    }
  }, [messages.length]) // Only trigger on message count change, not message content

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus()
    }
  }, [disabled])

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

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      onError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  const formatTimestamp = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const MessageBubble = React.memo(({ message }: { message: Message }) => {
    const isUser = message.role === "user"
    
    return (
      <div className={cn(
        "flex gap-3 md:gap-4 mb-4 md:mb-6 animate-in slide-in-from-bottom-2 duration-300",
        isUser ? "justify-end" : "justify-start"
      )}>
        <div className={cn(
          "flex gap-3 md:gap-4 max-w-[90%] md:max-w-[85%]",
          isUser ? "flex-row-reverse" : "flex-row"
        )}>
          {/* Avatar */}
          <div className={cn(
            "flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center",
            isUser 
              ? "bg-blue-600" 
              : "bg-gray-100"
          )}>
            {isUser ? (
              <User className="h-4 w-4 md:h-5 md:w-5 text-white" />
            ) : (
              <Bot className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
            )}
          </div>

          {/* Message content */}
          <div className="space-y-1 md:space-y-2">
            <Card className={cn(
              "p-3 md:p-4 shadow-sm border border-gray-200",
              isUser 
                ? "bg-blue-600 text-white" 
                : "bg-white text-gray-900"
            )} role="article" aria-label={`Message from ${isUser ? 'user' : 'assistant'}`}>
              <CardContent className="p-0">
                <div className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {isUser ? (
                    message.content
                  ) : (
                    renderFormattedText(message.content)
                  )}
                </div>
              </CardContent>
            </Card>
            <div className={cn(
              "text-xs text-gray-500 font-medium",
              isUser ? "text-right" : "text-left"
            )} aria-label={`Message sent at ${formatTimestamp(message.timestamp)}`}>
              {formatTimestamp(message.timestamp)}
            </div>
          </div>
        </div>
      </div>
    )
  })
  
  MessageBubble.displayName = "MessageBubble"

  return (
    <Card className={cn(
      "w-full mx-auto flex flex-col shadow-sm border border-gray-200 bg-white",
      isExpanded ? "max-w-5xl h-[600px] md:h-[700px]" : "max-w-4xl h-[500px] md:h-[600px]"
    )}>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages area */}
        <div className="flex-1 p-4 md:p-6 min-h-0">
          <ScrollArea ref={scrollAreaRef} className="h-full">
            <div className="space-y-4 md:space-y-6 pr-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8 md:py-12">
                  <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-lg mb-4 md:mb-6">
                    <Bot className="h-6 w-6 md:h-8 md:w-8 text-gray-600" />
                  </div>
                  <p className="text-lg md:text-xl font-semibold mb-2 md:mb-3 text-gray-700">Start a conversation</p>
                  <p className="text-sm md:text-base text-gray-500 max-w-md mx-auto px-4">
                    Ask questions about your transcribed audio content. Try asking for a summary, key points, or specific details.
                  </p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <MessageBubble key={index} message={message} />
                ))
              )}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Bot className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                  </div>
                  <Card className="bg-white p-3 md:p-4 border border-gray-200 shadow-sm">
                    <CardContent className="p-0">
                      <div className="flex items-center gap-2 md:gap-3">
                        <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin text-gray-600" />
                        <span className="text-sm md:text-base text-gray-700 font-medium">Thinking...</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Error display */}
        {error && (
          <div className="px-4 pb-2">
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Input area - Fixed height to prevent layout shifts */}
        <div className="border-t border-gray-200 p-4 md:p-6 bg-gray-50 min-h-[80px] md:min-h-[100px] flex flex-col justify-center">
          <div className="flex gap-2 md:gap-3">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about the audio content..."
              disabled={disabled || isLoading}
              className="flex-1 h-10 md:h-12 text-sm md:text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-none"
              aria-label="Type your question about the audio content"
              aria-describedby="input-help-text"
            />
            <Button
              onClick={handleSendMessage}
              disabled={disabled || isLoading || !inputMessage.trim()}
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
      </CardContent>
    </Card>
  )
}
