import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { TranscriptionResponse, ErrorResponse } from "@/lib/types"

// Helper function to create Azure OpenAI client
function createAzureOpenAIClient() {
  const apiKey = process.env.AZURE_OPENAI_API_KEY
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT
  const whisperDeployment = process.env.AZURE_OPENAI_WHISPER_DEPLOYMENT

  if (!apiKey || !endpoint || !whisperDeployment) {
    throw new Error("Missing required Azure OpenAI environment variables")
  }

  return new OpenAI({
    apiKey,
    baseURL: `${endpoint}/openai/deployments/${whisperDeployment}`,
    defaultQuery: { 'api-version': "2024-02-15-preview" },
    defaultHeaders: {
      'api-key': apiKey,
    },
  })
}

// File validation constants - Azure Whisper limit
const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB (Azure Whisper limit)
const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/mp4',
  'audio/m4a',
  'audio/ogg',
  'audio/webm',
  'application/octet-stream' // Common for MP3 files
]

const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.mp4', '.ogg', '.webm']

export async function POST(request: NextRequest) {
  try {
    // Create Azure OpenAI client
    const client = createAzureOpenAIClient()

    // Parse the multipart form data with timeout
    let formData: FormData
    try {
      const formDataPromise = request.formData()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 30000)
      )
      formData = await Promise.race([formDataPromise, timeoutPromise]) as FormData
    } catch (formError) {
      return NextResponse.json<ErrorResponse>(
        { error: "Invalid form data", details: "Request must contain multipart form data" },
        { status: 400 }
      )
    }
    
    const file = formData.get('file') as File

    // Validate file exists
    if (!file) {
      return NextResponse.json<ErrorResponse>(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file type (check both MIME type and file extension)
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    const isValidMimeType = ALLOWED_AUDIO_TYPES.includes(file.type)
    const isValidExtension = ALLOWED_EXTENSIONS.includes(fileExtension)
    
    if (!isValidMimeType && !isValidExtension) {
      return NextResponse.json<ErrorResponse>(
        { 
          error: "Invalid file type", 
          details: `File type '${file.type}' and extension '${fileExtension}' not supported. Supported formats: ${ALLOWED_AUDIO_TYPES.join(', ')}` 
        },
        { status: 400 }
      )
    }

    // Validate file size (Azure Whisper limit)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json<ErrorResponse>(
        { 
          error: "File too large", 
          details: `Maximum file size is ${MAX_FILE_SIZE / 1024 / 1024}MB (Azure Whisper limit)` 
        },
        { status: 400 }
      )
    }

    // Use the original File object directly - Azure OpenAI SDK handles it properly
    // No need for custom File object implementation that causes experimental feature issues

    // Call Azure OpenAI Whisper API with retry logic
    let transcription: string = ""
    let retryCount = 0
    const maxRetries = 3
    
    while (retryCount < maxRetries) {
      try {
        const result = await client.audio.transcriptions.create({
          file: file, // Use the original File object directly
          model: process.env.AZURE_OPENAI_WHISPER_DEPLOYMENT!,
          response_format: "text",
          language: "en", // Default to English, can be made configurable
          temperature: 0.0, // Use deterministic output
          prompt: "" // Optional: provide context to improve accuracy
        })
        transcription = result || ""
        break
      } catch (apiError) {
        retryCount++
        if (retryCount >= maxRetries) {
          throw apiError
        }
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
      }
    }

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

      // Handle payload size errors
      if (error.message.includes("Request Entity Too Large") || 
          error.message.includes("FUNCTION_PAYLOAD_TOO_LARGE") ||
          error.message.includes("413")) {
        return NextResponse.json<ErrorResponse>(
          { 
            error: "File too large for processing", 
            details: `File too large for Azure Whisper processing. Maximum file size is ${MAX_FILE_SIZE / 1024 / 1024}MB. Please compress your audio file or use a shorter recording.` 
          },
          { status: 413 }
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
