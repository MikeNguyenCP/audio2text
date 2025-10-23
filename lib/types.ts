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
