import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { ChatRequest, ChatResponse, ErrorResponse } from "@/lib/types"

// Helper function to create Azure OpenAI client
function createAzureOpenAIClient() {
  const apiKey = process.env.AZURE_OPENAI_API_KEY
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT
  const gptDeployment = process.env.AZURE_OPENAI_GPT_DEPLOYMENT

  if (!apiKey || !endpoint || !gptDeployment) {
    throw new Error("Missing required Azure OpenAI environment variables")
  }

  return new OpenAI({
    apiKey,
    baseURL: `${endpoint}/openai/deployments/${gptDeployment}`,
    defaultQuery: { 'api-version': "2024-02-15-preview" },
    defaultHeaders: {
      'api-key': apiKey,
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    // Create Azure OpenAI client
    const client = createAzureOpenAIClient()

    // Parse request body with timeout
    let body: ChatRequest
    try {
      const bodyPromise = request.json()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      )
      body = await Promise.race([bodyPromise, timeoutPromise]) as ChatRequest
    } catch (parseError) {
      return NextResponse.json<ErrorResponse>(
        { error: "Invalid JSON", details: "Request body must be valid JSON" },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!body.message || !body.transcript) {
      return NextResponse.json<ErrorResponse>(
        { 
          error: "Missing required fields", 
          details: "Both 'message' and 'transcript' are required" 
        },
        { status: 400 }
      )
    }

    // Validate message is not empty
    if (body.message.trim().length === 0) {
      return NextResponse.json<ErrorResponse>(
        { 
          error: "Empty message", 
          details: "Message cannot be empty" 
        },
        { status: 400 }
      )
    }

    // Validate transcript is not empty
    if (body.transcript.trim().length === 0) {
      return NextResponse.json<ErrorResponse>(
        { 
          error: "No transcript available", 
          details: "Please upload and transcribe an audio file first" 
        },
        { status: 400 }
      )
    }

    // Create system prompt with transcript context
    const systemPrompt = `You are a helpful assistant that can answer questions about audio transcripts. 
The user has uploaded an audio file that has been transcribed. You should answer their questions based on the content of the transcript.

Transcript:
${body.transcript}

Instructions:
- Answer questions based on the transcript content
- If the question cannot be answered from the transcript, politely explain that the information is not available in the audio
- Be helpful and conversational
- Provide specific details from the transcript when relevant
- If asked to summarize, provide a clear and concise summary`

    // Call Azure OpenAI GPT API with retry logic
    let completion: any
    let retryCount = 0
    const maxRetries = 3
    
    while (retryCount < maxRetries) {
      try {
        completion = await client.chat.completions.create({
          model: process.env.AZURE_OPENAI_GPT_DEPLOYMENT!,
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: body.message
            }
          ],
          temperature: 0.7, // Balanced creativity and consistency
          max_tokens: 1000, // Reasonable response length
          top_p: 0.9,
          frequency_penalty: 0.0,
          presence_penalty: 0.0,
        })
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

    // Extract response content
    const responseContent = completion.choices[0]?.message?.content

    if (!responseContent) {
      return NextResponse.json<ErrorResponse>(
        { 
          error: "No response generated", 
          details: "The AI model did not generate a response" 
        },
        { status: 500 }
      )
    }

    // Return successful response
    return NextResponse.json<ChatResponse>({
      message: responseContent,
      timestamp: new Date()
    })

  } catch (error) {
    console.error("Chat API Error:", error)

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
            details: "Chat service is currently unavailable" 
          },
          { status: 503 }
        )
      }

      if (error.message.includes("token")) {
        return NextResponse.json<ErrorResponse>(
          { 
            error: "Request too long", 
            details: "The transcript or message is too long. Please try with shorter content." 
          },
          { status: 400 }
        )
      }
    }

    // Generic error response
    return NextResponse.json<ErrorResponse>(
      { 
        error: "Chat request failed", 
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
