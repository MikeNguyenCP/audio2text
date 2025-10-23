"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Upload, FileAudio, Loader2, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { FileValidation, TranscriptionResponse } from "@/lib/types"

interface FileUploadProps {
  onTranscriptionComplete: (transcript: string) => void
  onError: (error: string) => void
  disabled?: boolean
}

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB
const ALLOWED_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/m4a"]

export function FileUpload({ onTranscriptionComplete, onError, disabled = false }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): FileValidation => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: "Please select an audio file (MP3, WAV, or M4A)",
        fileName: file.name,
        fileSize: file.size
      }
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        fileName: file.name,
        fileSize: file.size
      }
    }

    return {
      isValid: true,
      fileName: file.name,
      fileSize: file.size
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    setUploadStatus("idle")

    const validation = validateFile(file)
    if (!validation.isValid) {
      setError(validation.error || "Invalid file")
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadStatus("uploading")
    setError(null)

    try {
      const formData = new FormData()
      formData.append("audio", selectedFile)

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Transcription failed")
      }

      const data: TranscriptionResponse = await response.json()
      setUploadStatus("success")
      onTranscriptionComplete(data.transcript)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      setUploadStatus("error")
      onError(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setError(null)
    setUploadStatus("idle")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case "uploading":
        return <Loader2 className="h-4 w-4 animate-spin" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <FileAudio className="h-4 w-4" />
    }
  }

  const getStatusText = () => {
    switch (uploadStatus) {
      case "uploading":
        return "Transcribing audio..."
      case "success":
        return "Transcription completed successfully"
      case "error":
        return "Transcription failed"
      default:
        return "Select an audio file to transcribe"
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
            {getStatusIcon()}
          </div>
          Audio Transcription
        </CardTitle>
        <CardDescription className="text-base text-gray-600">
          Upload an audio file (MP3, WAV, M4A) up to 25MB to get started
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
          aria-label="Select audio file for transcription"
        />

        {/* File selection button */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="flex-1 h-11 md:h-12 text-sm md:text-base font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            variant="outline"
            aria-label={selectedFile ? "Change selected audio file" : "Select audio file for transcription"}
          >
            <Upload className="h-4 w-4 md:h-5 md:w-5 mr-2" />
            <span className="hidden sm:inline">{selectedFile ? "Change File" : "Select Audio File"}</span>
            <span className="sm:hidden">{selectedFile ? "Change" : "Select File"}</span>
          </Button>

          {selectedFile && (
            <Button
              onClick={handleUpload}
              disabled={disabled || isUploading}
              className="flex-1 h-11 md:h-12 text-sm md:text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-[1.02] hover:shadow-md focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              aria-label={isUploading ? "Transcribing audio file" : "Start transcription of selected audio file"}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 md:h-5 md:w-5 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Transcribing...</span>
                  <span className="sm:hidden">Processing...</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Start Transcription</span>
                  <span className="sm:hidden">Transcribe</span>
                </>
              )}
            </Button>
          )}
        </div>

        {/* Selected file info */}
        {selectedFile && (
          <div className="p-3 md:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200/50 transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-full">
                  <FileAudio className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-gray-900 text-sm md:text-base block truncate">{selectedFile.name}</span>
                  <div className="text-xs md:text-sm text-gray-500">{formatFileSize(selectedFile.size)}</div>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-xs md:text-sm font-medium text-gray-700">
                  {getStatusText()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Reset button */}
        {selectedFile && uploadStatus !== "uploading" && (
          <div className="flex justify-center pt-2">
            <Button
              onClick={handleReset}
              variant="ghost"
              size="sm"
              disabled={disabled}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              aria-label="Upload another audio file"
            >
              Upload Another File
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
