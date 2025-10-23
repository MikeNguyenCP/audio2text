import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { TranscriptionResponse, ErrorResponse } from "@/lib/types"

// Initialize Azure OpenAI client
const client = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_WHISPER_DEPLOYMENT}`,
  defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview" },
  defaultHeaders: {
    'api-key': process.env.AZURE_OPENAI_API_KEY!,
  },
})

// File validation constants
const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB
const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/mp4',
  'audio/m4a',
  'audio/ogg',
  'audio/webm'
]

export async function POST(request: NextRequest) {
  try {
    // Parse the multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    // Validate file exists
    if (!file) {
      return NextResponse.json<ErrorResponse>(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
      return NextResponse.json<ErrorResponse>(
        { 
          error: "Invalid file type", 
          details: `Supported formats: ${ALLOWED_AUDIO_TYPES.join(', ')}` 
        },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json<ErrorResponse>(
        { 
          error: "File too large", 
          details: `Maximum file size is ${MAX_FILE_SIZE / 1024 / 1024}MB` 
        },
        { status: 400 }
      )
    }

    // Convert file to buffer for Azure OpenAI
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Call Azure OpenAI Whisper API
    const transcription = await client.audio.transcriptions.create({
      file: new File([buffer], file.name, { type: file.type }),
      model: process.env.AZURE_OPENAI_WHISPER_DEPLOYMENT!,
      response_format: "text",
      language: "en", // Default to English, can be made configurable
      temperature: 0.0, // Use deterministic output
      prompt: "" // Optional: provide context to improve accuracy
    })

    // Return successful transcription
    return NextResponse.json<TranscriptionResponse>({
      transcript: transcription || "",
      duration: undefined // Azure doesn't provide duration in response
    })

  } catch (error) {
    console.error("Transcription API Error:", error)

    // Handle specific Azure OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes("quota")) {
        return NextResponse.json<ErrorResponse>(
          { 
            error: "Service quota exceeded", 
            details: "Please try again later or contact support" 
          },
          { status: 429 }
        )
      }
      
      if (error.message.includes("unauthorized")) {
        return NextResponse.json<ErrorResponse>(
          { 
            error: "Authentication failed", 
            details: "Invalid API credentials" 
          },
          { status: 401 }
        )
      }

      if (error.message.includes("not found")) {
        return NextResponse.json<ErrorResponse>(
          { 
            error: "Service not available", 
            details: "Transcription service is currently unavailable" 
          },
          { status: 503 }
        )
      }
    }

    // Generic error response
    return NextResponse.json<ErrorResponse>(
      { 
        error: "Transcription failed", 
        details: "An unexpected error occurred. Please try again." 
      },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json<ErrorResponse>(
    { error: "Method not allowed" },
    { status: 405 }
  )
}
