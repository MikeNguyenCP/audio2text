"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Upload, FileAudio, Loader2, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { FileValidation, TranscriptionResponse, CompressionStatus, CompressionProgress, CompressionStats } from "@/lib/types"
import { compressAudioFile, formatFileSize } from "@/lib/audio-compression"
import { CompressionStatus as CompressionStatusComponent } from "@/components/compression-status"

interface FileUploadProps {
  onTranscriptionComplete: (transcript: string) => void
  onError: (error: string) => void
  disabled?: boolean
}

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB (Azure Whisper limit)
const ALLOWED_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/m4a", "audio/ogg", "audio/webm", "audio/opus"]

export function FileUpload({ onTranscriptionComplete, onError, disabled = false }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [compressedFile, setCompressedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const [compressionStatus, setCompressionStatus] = useState<CompressionStatus>("idle")
  const [compressionProgress, setCompressionProgress] = useState<CompressionProgress | null>(null)
  const [compressionStats, setCompressionStats] = useState<CompressionStats | null>(null)
  const [compressionError, setCompressionError] = useState<Error | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): FileValidation => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: "Please select an audio file (MP3, WAV, M4A, OGG, WebM, Opus)",
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

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    setUploadStatus("idle")
    setCompressionError(null)
    setCompressionStatus("idle")
    setCompressionProgress(null)
    setCompressionStats(null)
    setCompressedFile(null)

    const validation = validateFile(file)
    if (!validation.isValid) {
      setError(validation.error || "Invalid file")
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
    
    // Automatically start compression for all files
    await startCompression(file)
  }

  const startCompression = async (file: File) => {
    setCompressionStatus("compressing")
    
    try {
      const result = await compressAudioFile(file, (progress) => {
        setCompressionProgress(progress)
      })

      setCompressedFile(result.compressedFile)
      setCompressionStats(result.stats)
      setCompressionStatus("complete")
      
      // Validate compressed file is under limit
      if (result.compressedFile.size > MAX_FILE_SIZE) {
        throw new Error('File too large even after compression. Please use a shorter recording or split into parts.')
      }

    } catch (error) {
      setCompressionStatus("error")
      setCompressionError(error instanceof Error ? error : new Error('Compression failed'))
      console.error('Compression failed:', error)
    }
  }

  const handleUpload = async () => {
    // Always use compressed file if available, otherwise use original
    const fileToTranscribe = compressedFile || selectedFile
    if (!fileToTranscribe) return

    setIsUploading(true)
    setUploadStatus("uploading")
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", fileToTranscribe)

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
    setCompressedFile(null)
    setError(null)
    setUploadStatus("idle")
    setCompressionStatus("idle")
    setCompressionProgress(null)
    setCompressionStats(null)
    setCompressionError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRetryCompression = () => {
    if (selectedFile) {
      startCompression(selectedFile)
    }
  }

  const handleCancelCompression = () => {
    setCompressionStatus("idle")
    setCompressionProgress(null)
    setCompressionError(null)
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

  const isTranscriptionEnabled = (): boolean => {
    return (
      selectedFile !== null &&
      (compressionStatus === 'complete' || compressionStatus === 'skipped') &&
      !isUploading
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-sm border border-gray-200 bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
            {getStatusIcon()}
          </div>
          Audio Transcription
        </CardTitle>
        <CardDescription className="text-base text-gray-600">
          Upload an audio file to automatically optimize and transcribe
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
            className="flex-1 h-11 md:h-12 text-sm md:text-base font-medium"
            variant="outline"
            aria-label={selectedFile ? "Change selected audio file" : "Select audio file for transcription"}
          >
            <Upload className="h-4 w-4 md:h-5 md:w-5 mr-2" />
            <span className="hidden sm:inline">{selectedFile ? "Change File" : "Select Audio File"}</span>
            <span className="sm:hidden">{selectedFile ? "Change" : "Select File"}</span>
          </Button>

          {isTranscriptionEnabled() && (
            <Button
              onClick={handleUpload}
              disabled={disabled || isUploading}
              className="flex-1 h-11 md:h-12 text-sm md:text-base font-medium bg-blue-600 hover:bg-blue-700"
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

        {/* Compression Status */}
        {selectedFile && (
          <CompressionStatusComponent
            originalFile={selectedFile}
            compressedFile={compressedFile}
            progress={compressionProgress}
            status={compressionStatus}
            stats={compressionStats}
            error={compressionError}
            onCancel={handleCancelCompression}
            onRetry={handleRetryCompression}
          />
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
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
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
