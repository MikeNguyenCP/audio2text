"use client"

import React, { useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, User, Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import { Message } from "@/lib/types"
import { renderFormattedText } from "@/lib/text-formatting"

interface ChatCanvasProps {
  messages: Message[]
  isLoading: boolean
  error: string | null
}

export const ChatCanvas = React.forwardRef<
  { scrollToBottom: () => void },
  ChatCanvasProps
>(({ messages, isLoading, error }, ref) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Expose scroll function to parent
  React.useImperativeHandle(ref, () => ({
    scrollToBottom: () => {
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
        if (scrollContainer) {
          requestAnimationFrame(() => {
            scrollContainer.scrollTop = scrollContainer.scrollHeight
          })
        }
      }
    }
  }), [])

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
          "flex gap-2 md:gap-4 max-w-[95%] md:max-w-[85%]",
          isUser ? "flex-row-reverse" : "flex-row"
        )}>
          {/* Avatar */}
          <div className={cn(
            "flex-shrink-0 w-7 h-7 md:w-10 md:h-10 rounded-lg flex items-center justify-center",
            isUser 
              ? "bg-blue-600" 
              : "bg-gray-100"
          )}>
            {isUser ? (
              <User className="h-3 w-3 md:h-5 md:w-5 text-white" />
            ) : (
              <Bot className="h-3 w-3 md:h-5 md:w-5 text-gray-600" />
            )}
          </div>

          {/* Message content */}
          <div className="space-y-1 md:space-y-2">
            <Card className={cn(
              "p-2 md:p-4 shadow-sm border border-gray-200",
              isUser 
                ? "bg-blue-600 text-white" 
                : "bg-white text-gray-900"
            )} role="article" aria-label={`Message from ${isUser ? 'user' : 'assistant'}`}>
              <CardContent className="p-0">
                <div className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
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
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Messages area */}
      <div className="flex-1 p-2 md:p-6 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full w-full">
          <div className="space-y-3 md:space-y-6 pr-2 md:pr-4">
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
              <div className="flex gap-2 md:gap-3 mb-4">
                <div className="flex-shrink-0 w-7 h-7 md:w-10 md:h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Bot className="h-3 w-3 md:h-5 md:w-5 text-gray-600" />
                </div>
                <Card className="bg-white p-2 md:p-4 border border-gray-200 shadow-sm">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-2 md:gap-3">
                      <Loader2 className="h-3 w-3 md:h-5 md:w-5 animate-spin text-gray-600" />
                      <span className="text-xs md:text-base text-gray-700 font-medium">Thinking...</span>
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
        <div className="px-2 md:px-4 pb-2">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="text-xs md:text-sm">{error}</AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  )
})

ChatCanvas.displayName = "ChatCanvas"
