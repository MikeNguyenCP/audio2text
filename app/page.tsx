"use client"

import { useState } from "react"
import { FileUpload } from "@/components/file-upload"
import { ChatInterface } from "@/components/chat-interface"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Mic, MessageSquare, ChevronUp, ChevronDown, Upload } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Home() {
  const [transcript, setTranscript] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isStep1Collapsed, setIsStep1Collapsed] = useState(false)

  const handleTranscriptionComplete = (transcriptText: string) => {
    setTranscript(transcriptText)
    setError(null)
    setIsTranscribing(false)
    // Auto-collapse Step 1 after successful transcription
    setIsStep1Collapsed(true)
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
    setIsTranscribing(false)
  }

  const handleTranscriptionStart = () => {
    setIsTranscribing(true)
    setError(null)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-blue-600 rounded-full mb-4 md:mb-6" role="img" aria-label="Audio Chat Demo Logo">
            <Mic className="h-6 w-6 md:h-8 md:w-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
            Audio Chat Demo
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl md:max-w-3xl mx-auto leading-relaxed px-4">
            Upload an audio file to automatically optimize and transcribe, then chat about its content using AI-powered analysis.
          </p>
        </header>

        {/* Error display */}
        {error && (
          <div className="max-w-4xl mx-auto mb-6">
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Main content */}
        <div className={cn(
          "mx-auto space-y-8 md:space-y-12",
          transcript && isStep1Collapsed ? "max-w-5xl" : "max-w-6xl"
        )}>
          {/* File Upload Section */}
          <section className="relative" aria-labelledby="upload-heading">
            <div className="flex items-center justify-between mb-4 md:mb-6 px-4 md:px-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg" role="img" aria-label="Upload icon">
                  <Mic className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                </div>
                <div>
                  <h2 id="upload-heading" className="text-lg md:text-2xl font-semibold text-gray-900">Step 1: Upload Audio</h2>
                  <p className="text-xs md:text-sm text-gray-500">
                    {transcript ? "Audio transcribed successfully" : "Select and automatically optimize your audio file"}
                  </p>
                </div>
              </div>
              
              {/* Collapse/Expand Button */}
              {transcript && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsStep1Collapsed(!isStep1Collapsed)}
                  className="flex items-center gap-2 text-sm"
                  aria-label={isStep1Collapsed ? "Expand Step 1" : "Collapse Step 1"}
                >
                  {isStep1Collapsed ? (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Show Upload
                    </>
                  ) : (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Hide Upload
                    </>
                  )}
                </Button>
              )}
            </div>
            
            {/* Collapsible File Upload Content */}
            <div className={cn(
              "transition-all duration-300 ease-in-out overflow-hidden",
              isStep1Collapsed ? "max-h-0 opacity-0" : "max-h-[500px] opacity-100"
            )}>
              <FileUpload
                onTranscriptionComplete={handleTranscriptionComplete}
                onError={handleError}
                disabled={isTranscribing}
              />
            </div>
          </section>

          {/* Chat Interface Section */}
          {transcript && (
            <section className="relative" aria-labelledby="chat-heading">
              <div className="flex items-center gap-3 mb-4 md:mb-6 px-4 md:px-0">
                <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-lg" role="img" aria-label="Chat icon">
                  <MessageSquare className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                </div>
                <div>
                  <h2 id="chat-heading" className="text-lg md:text-2xl font-semibold text-gray-900">Step 2: Chat About Your Audio</h2>
                  <p className="text-xs md:text-sm text-gray-500">Ask questions and get AI-powered insights</p>
                </div>
              </div>
              <div className={cn(
                "transition-all duration-300 ease-in-out",
                isStep1Collapsed ? "scale-105" : "scale-100"
              )}>
                <ChatInterface
                  transcript={transcript}
                  onError={handleError}
                  disabled={isTranscribing}
                  isExpanded={isStep1Collapsed}
                />
              </div>
            </section>
          )}

          {/* Instructions */}
          {!transcript && (
            <section className="max-w-3xl mx-auto px-4" aria-labelledby="instructions-heading">
              <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-8 text-center shadow-sm">
                <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-lg mb-4" role="img" aria-label="Instructions icon">
                  <MessageSquare className="h-5 w-5 md:h-6 md:w-6 text-gray-600" />
                </div>
                <h3 id="instructions-heading" className="text-xl md:text-2xl font-semibold text-gray-900 mb-4 md:mb-6">
                  How it works
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-left" role="list" aria-label="Step-by-step instructions">
                  <div className="flex items-start gap-3" role="listitem">
                    <div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 bg-blue-100 rounded-lg flex items-center justify-center" aria-label="Step 1">
                      <span className="text-xs md:text-sm font-semibold text-blue-600">1</span>
                    </div>
                    <p className="text-sm md:text-base text-gray-700">Upload an audio file - automatically optimized for faster upload</p>
                  </div>
                  <div className="flex items-start gap-3" role="listitem">
                    <div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 bg-green-100 rounded-lg flex items-center justify-center" aria-label="Step 2">
                      <span className="text-xs md:text-sm font-semibold text-green-600">2</span>
                    </div>
                    <p className="text-sm md:text-base text-gray-700">Wait for AI transcription to complete</p>
                  </div>
                  <div className="flex items-start gap-3" role="listitem">
                    <div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 bg-purple-100 rounded-lg flex items-center justify-center" aria-label="Step 3">
                      <span className="text-xs md:text-sm font-semibold text-purple-600">3</span>
                    </div>
                    <p className="text-sm md:text-base text-gray-700">Ask questions about the content using natural language</p>
                  </div>
                  <div className="flex items-start gap-3" role="listitem">
                    <div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 bg-orange-100 rounded-lg flex items-center justify-center" aria-label="Step 4">
                      <span className="text-xs md:text-sm font-semibold text-orange-600">4</span>
                    </div>
                    <p className="text-sm md:text-base text-gray-700">Get intelligent responses based on your audio</p>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  )
}
