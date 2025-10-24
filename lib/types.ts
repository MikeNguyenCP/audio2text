// Message interface for chat functionality
export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// Chat request interface for API calls
export interface ChatRequest {
  message: string
  transcript: string
}

// Chat response interface from API
export interface ChatResponse {
  message: string
  timestamp: Date
}

// Transcription response interface
export interface TranscriptionResponse {
  transcript: string
  duration?: number
}

// Error response interface
export interface ErrorResponse {
  error: string
  details?: string
}

// File upload validation interface
export interface FileValidation {
  isValid: boolean
  error?: string
  fileSize?: number
  fileName?: string
}

// Compression-related interfaces
export interface CompressionSettings {
  sampleRate: number
  bitrate: number
  channels: number
  format: 'opus' | 'mp3' | 'wav'
}

export interface CompressionProgress {
  progress: number // 0-100
  stage: 'loading' | 'processing' | 'finalizing'
  message: string
  estimatedTimeRemaining?: number // seconds
}

export interface CompressionStats {
  originalSize: number
  compressedSize: number
  originalFormat: string
  compressedFormat: string
  originalBitrate?: number
  compressedBitrate: number
  compressionRatio: number // Percentage
  duration?: number // in seconds
  uploadTimeSaved: number // estimated seconds
}

export type CompressionStatus = 'idle' | 'compressing' | 'complete' | 'error' | 'skipped'

export interface CompressionResult {
  compressedFile: File
  stats: CompressionStats
}