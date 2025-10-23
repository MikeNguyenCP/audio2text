"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Send, Loader2, User, Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import { Message, ChatRequest, ChatResponse } from "@/lib/types"

interface ChatInterfaceProps {
  transcript: string
  onError: (error: string) => void
  disabled?: boolean
}

export function ChatInterface({ transcript, onError, disabled = false }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

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

  const MessageBubble = ({ message }: { message: Message }) => {
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
            "flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-sm",
            isUser 
              ? "bg-gradient-to-r from-blue-600 to-purple-600" 
              : "bg-gradient-to-r from-gray-100 to-gray-200"
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
              "p-3 md:p-4 shadow-sm border-0",
              isUser 
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" 
                : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900"
            )} role="article" aria-label={`Message from ${isUser ? 'user' : 'assistant'}`}>
              <CardContent className="p-0">
                <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
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
  }

  return (
    <Card className="w-full max-w-4xl mx-auto h-[500px] md:h-[600px] flex flex-col shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages area */}
        <div className="flex-1 p-4 md:p-6">
          <ScrollArea ref={scrollAreaRef} className="h-full">
            <div className="space-y-4 md:space-y-6">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8 md:py-12">
                  <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-green-100 to-blue-100 rounded-full mb-4 md:mb-6">
                    <Bot className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
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
                  <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                    <Bot className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                  </div>
                  <Card className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 md:p-4 border-0 shadow-sm">
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

        {/* Input area */}
        <div className="border-t border-gray-200/50 p-4 md:p-6 bg-gradient-to-r from-gray-50/50 to-white/50">
          <div className="flex gap-2 md:gap-3">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about the audio content..."
              disabled={disabled || isLoading}
              className="flex-1 h-10 md:h-12 text-sm md:text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
              aria-label="Type your question about the audio content"
              aria-describedby="input-help-text"
            />
            <Button
              onClick={handleSendMessage}
              disabled={disabled || isLoading || !inputMessage.trim()}
              size="icon"
              className="h-10 w-10 md:h-12 md:w-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105 shadow-md focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
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
