# Audio Chat Demo App - Requirements & Implementation Guide

## 📋 Overview

A web-based chatbot application that allows users to upload MP3 files, transcribe them using Azure OpenAI's Whisper API, and interact with the transcribed content through an intelligent Q&A chat interface.

**Technology**: Next.js 14+ with TypeScript, shadcn/ui components, and Tailwind CSS  
**Backend**: Next.js API Routes (secure server-side API key handling)  
**Presentation Duration**: 30 minutes

---

## ⚡ Quick Start Guide

### Prerequisites

- Node.js 18+ installed
- Azure OpenAI account with Whisper and GPT deployments
- Basic knowledge of React and TypeScript

### 5-Minute Setup

```bash
# 1. Create Next.js project
npx create-next-app@latest audio-chat-demo --typescript --tailwind --app

# 2. Navigate to project
cd audio-chat-demo

# 3. Initialize shadcn/ui
npx shadcn@latest init

# 4. Install components
npx shadcn@latest add button card input scroll-area alert toast

# 5. Install additional dependencies
npm install lucide-react

# 6. Create .env.local file with your Azure credentials
echo "AZURE_OPENAI_ENDPOINT=your-endpoint" > .env.local
echo "AZURE_OPENAI_API_KEY=your-key" >> .env.local
echo "AZURE_WHISPER_DEPLOYMENT=whisper" >> .env.local
echo "AZURE_GPT_DEPLOYMENT=gpt-4" >> .env.local

# 7. Start development server
npm run dev
```

### Project Structure at a Glance

```
audio-chat-demo/
├── app/
│   ├── api/
│   │   ├── transcribe/route.ts    # Transcription endpoint
│   │   └── chat/route.ts          # Chat endpoint
│   ├── page.tsx                   # Main UI page
│   └── layout.tsx
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── file-upload.tsx           # Upload component
│   └── chat-interface.tsx        # Chat component
└── .env.local                     # Azure credentials (never commit!)
```

---

## 🎯 High-Level Requirements

### 1. Technology Stack

- **Frontend Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **API Provider**: Azure OpenAI Service
- **File Format**: MP3 audio files
- **Deployment**: Vercel or similar hosting

### 2. Core Features

#### Feature 1: File Upload

- Accept MP3 audio file uploads
- Display file information (name, size)
- Validate file format
- User-friendly upload interface

#### Feature 2: Audio Transcription

- Send MP3 to Azure OpenAI Whisper API
- Convert audio to text
- Display transcription results
- Show loading state during processing
- Handle transcription errors

#### Feature 3: Chat Interface

- Display transcribed text
- Accept user questions
- Maintain conversation history
- Show message timestamps
- Distinguish between user and assistant messages

#### Feature 4: Intelligent Q&A

- Route questions to Azure OpenAI GPT API
- Include transcript as context
- Generate relevant responses
- Handle multiple questions
- Provide conversational responses

---

## 🔧 Azure OpenAI Services Required

### Service 1: Whisper (Audio Transcription)

- **Model**: Whisper
- **Purpose**: Convert MP3 audio to text
- **API Version**: 2024-02-01 or later
- **Deployment Name**: Custom (e.g., "whisper", "whisper-1")

### Service 2: GPT Model (Chat Completion)

- **Model Options**: GPT-4, GPT-4-turbo, or GPT-3.5-turbo
- **Purpose**: Answer questions based on transcript context
- **API Version**: 2024-02-01 or later
- **Deployment Name**: Custom (e.g., "gpt-4", "gpt-35-turbo")

### Required Credentials

- Azure OpenAI Endpoint URL
- Azure OpenAI API Key
- Whisper Deployment Name
- GPT Deployment Name

---

## 📝 Step-by-Step Implementation

### Step 1: Azure OpenAI Setup (15-20 minutes)

#### 1.1 Create Azure OpenAI Resource

1. Log in to [Azure Portal](https://portal.azure.com)
2. Search for "Azure OpenAI"
3. Click "Create" to create a new resource
4. Fill in required details:
   - Subscription
   - Resource Group (create new or use existing)
   - Region (choose available region)
   - Name (unique identifier)
   - Pricing Tier
5. Review and create the resource

#### 1.2 Deploy Whisper Model

1. Navigate to your Azure OpenAI resource
2. Go to "Model deployments" or "Azure OpenAI Studio"
3. Click "Create new deployment"
4. Select "whisper" model
5. Provide deployment name (e.g., "whisper")
6. Configure deployment settings
7. Deploy the model

#### 1.3 Deploy GPT Model

1. In the same resource, create another deployment
2. Select GPT model (GPT-4 or GPT-3.5-turbo)
3. Provide deployment name (e.g., "gpt-4")
4. Configure settings (tokens, rate limits)
5. Deploy the model

#### 1.4 Get API Credentials

1. Go to "Keys and Endpoint" section
2. Copy the following:
   - Endpoint URL (e.g., `https://your-resource.openai.azure.com`)
   - API Key (Key 1 or Key 2)
3. Note down your deployment names

---

### Step 2: Project Setup (15-20 minutes)

#### 2.1 Create Next.js Application

```bash
npx create-next-app@latest audio-chat-demo --typescript --tailwind --app --no-src-dir --import-alias "@/*" --use-npm
cd audio-chat-demo
```

Select the following options when prompted:

- ✅ TypeScript: Yes
- ✅ ESLint: Yes
- ✅ Tailwind CSS: Yes
- ✅ `src/` directory: No
- ✅ App Router: Yes
- ✅ Import alias: @/\*

#### 2.2 Initialize shadcn/ui

```bash
npx shadcn@latest init
```

Select the following options:

- Style: Default
- Base color: Slate (or your preference)
- CSS variables: Yes

#### 2.3 Install shadcn/ui Components

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add scroll-area
npx shadcn@latest add alert
npx shadcn@latest add toast
```

#### 2.4 Install Additional Dependencies

```bash
npm install lucide-react
```

#### 2.5 Project Structure

```
audio-chat-demo/
├── app/
│   ├── api/
│   │   ├── transcribe/
│   │   │   └── route.ts
│   │   └── chat/
│   │       └── route.ts
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/              (shadcn components)
│   ├── file-upload.tsx
│   ├── chat-interface.tsx
│   └── message-bubble.tsx
├── lib/
│   ├── utils.ts
│   └── azure-openai.ts
├── .env.local
└── package.json
```

#### 2.6 Environment Configuration

Create `.env.local` file:

```env
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_WHISPER_DEPLOYMENT=whisper
AZURE_GPT_DEPLOYMENT=gpt-4
```

**⚠️ Security Note**: With Next.js API routes, API keys stay on the server and are never exposed to the client. This is much more secure than client-side API calls.

---

### Step 3: Create Next.js API Routes (30 minutes)

Next.js API routes provide a secure backend where API keys never reach the client.

#### 3.1 Create Transcription API Route

Create `app/api/transcribe/route.ts`:

**Purpose**: Securely handle audio transcription on the server

**Endpoint**: `/api/transcribe`

**Key Features**:

- Receives MP3 file from client
- Forwards to Azure OpenAI Whisper API
- Returns transcribed text
- Handles errors gracefully

**Request Body**: FormData with 'file' field

**Response**:

```json
{
  "text": "Transcribed content..."
}
```

#### 3.2 Create Chat API Route

Create `app/api/chat/route.ts`:

**Purpose**: Handle Q&A requests with transcript context

**Endpoint**: `/api/chat`

**Key Features**:

- Receives user message and transcript
- Sends to Azure OpenAI GPT API with context
- Returns AI-generated response
- Maintains conversation context

**Request Body**:

```json
{
  "message": "User's question",
  "transcript": "Full transcript text"
}
```

**Response**:

```json
{
  "response": "AI assistant's answer"
}
```

#### 3.3 Benefits of Next.js API Routes

- ✅ API keys stay on server (never exposed to client)
- ✅ Secure environment variable access
- ✅ Better error handling and logging
- ✅ Rate limiting capabilities
- ✅ Request validation
- ✅ Production-ready architecture
- ✅ No CORS issues

---

### Step 4: Build File Upload Component with shadcn/ui (30 minutes)

#### 3.1 Component Features

- File input element (hidden, triggered by button)
- Visual upload button
- File validation (MP3 only)
- Display selected file information
- Trigger transcription button

#### 3.2 Validation Rules

- Accept only MP3 files (`audio/mp3`, `audio/mpeg`)
- Maximum file size: 25MB (Azure Whisper limit)
- Show error message for invalid files

#### 3.3 User Feedback

- Show file name and size
- Disable buttons during processing
- Display loading indicator

---

### Step 5: Implement Audio Transcription with Next.js API (30 minutes)

#### 5.1 Client-Side Implementation

Instead of calling Azure directly, call your Next.js API route:

**New Endpoint**: `/api/transcribe` (your Next.js backend)

**Client-Side Code**:

```typescript
const transcribeAudio = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/transcribe", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Transcription failed");
  }

  const data = await response.json();
  return data.text;
};
```

#### 5.2 Benefits Over Direct API Calls

- ✅ No API keys in client code
- ✅ Simplified client-side logic
- ✅ Server-side error handling
- ✅ Can add authentication/rate limiting
- ✅ Better security

#### 5.3 State Management

- `isTranscribing`: Boolean for loading state
- `transcript`: String for transcribed text
- `error`: String for error messages

#### 5.4 Error Handling

- Network failures
- File validation errors
- API errors
- User-friendly error messages

---

### Step 6: Build Chat Interface with shadcn/ui (30 minutes)

#### 6.1 shadcn/ui Components Used

- **Card**: Message container
- **ScrollArea**: Scrollable message list
- **Input**: Message input field
- **Button**: Send button
- **Alert**: Error messages

#### 6.2 UI Components

- Message display area (ScrollArea component)
- User message input field (Input component)
- Send button (Button component)
- Message bubbles with Card components
- Timestamp display
- Loading indicator for processing

#### 6.3 Message Structure (TypeScript)

```typescript
interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}
```

#### 6.4 Features

- Auto-scroll to latest message
- Enter key to send message
- Disable input during processing
- Clear input after sending
- Visual distinction between message types
- Responsive design with Tailwind

---

### Step 7: Implement Q&A with Next.js API (45 minutes)

#### 7.1 Client-Side Implementation

Call your Next.js API route instead of Azure directly:

**Endpoint**: `/api/chat` (your Next.js backend)

**Client-Side Code**:

```typescript
const sendMessage = async (message: string, transcript: string) => {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      transcript,
    }),
  });

  if (!response.ok) {
    throw new Error("Chat request failed");
  }

  const data = await response.json();
  return data.response;
};
```

#### 7.2 Server-Side Context Management

The API route (`app/api/chat/route.ts`) handles:

- Including full transcript in system message
- Formatting the prompt correctly
- Setting appropriate temperature (0.7)
- Managing token limits
- Error handling

#### 7.3 Implementation Flow

1. User enters question in Input component
2. Add user message to chat state
3. Call `/api/chat` with message and transcript
4. Server processes request with Azure OpenAI
5. Receive response from API route
6. Add assistant message to chat state
7. Update UI with new message

#### 7.4 TypeScript Types

```typescript
interface ChatRequest {
  message: string;
  transcript: string;
}

interface ChatResponse {
  response: string;
  error?: string;
}
```

#### 7.5 Error Handling

- Network failures
- API errors (handled on server)
- Invalid responses
- Timeout scenarios
- User-friendly error display with Alert component

---

### Step 8: Polish & Testing with shadcn/ui (30 minutes)

#### 7.1 UI/UX Enhancements

- Add loading spinners
- Implement smooth animations
- Improve color scheme
- Add icons for better visual communication
- Responsive design for different screen sizes

#### 7.2 Error Handling

- User-friendly error messages
- Retry mechanisms
- Graceful degradation
- Clear instructions for fixing issues

#### 8.3 Testing Checklist

- [ ] Upload valid MP3 file
- [ ] Upload invalid file format
- [ ] Upload oversized file (>25MB)
- [ ] Transcription success
- [ ] Transcription with network error
- [ ] Ask simple question
- [ ] Ask complex question
- [ ] Ask multiple questions in sequence
- [ ] Send empty message (should be prevented)
- [ ] Long transcript handling
- [ ] Long conversation handling
- [ ] TypeScript type checking (`npm run build`)
- [ ] Next.js API routes working correctly
- [ ] Environment variables loaded properly
- [ ] Mobile responsive design
- [ ] shadcn/ui components rendering correctly

#### 7.4 Sample Test MP3

Prepare a short MP3 file (1-2 minutes) with clear speech about a specific topic for demo purposes.

---

## 🎤 Demo Presentation Flow (30 minutes)

### Minute 0-2: Introduction

- Welcome and overview
- Explain the problem being solved
- Mention Azure OpenAI integration

### Minute 2-5: Upload & Transcription Demo

- Show the application interface
- Upload sample MP3 file
- Demonstrate transcription process
- Display transcribed text

### Minute 5-20: Interactive Q&A Demo

- Ask simple factual questions
- Ask complex analytical questions
- Show real-time response generation
- Demonstrate conversation flow
- Highlight context awareness

### Minute 20-25: Technical Architecture

- Explain system components
- Show Azure OpenAI integration points
- Discuss Whisper and GPT models
- Mention API endpoints used

### Minute 25-28: Use Cases & Applications

- Discuss practical applications
- Meeting transcription and Q&A
- Educational content interaction
- Podcast/interview analysis
- Accessibility features

### Minute 28-30: Q&A and Wrap-up

- Answer audience questions
- Provide resources
- Thank the audience

---

## 🚀 Next.js Specific Features

### Server-Side Benefits

1. **API Routes**: Built-in backend API
2. **Environment Variables**: Secure server-side only vars
3. **TypeScript**: Full type safety
4. **App Router**: Modern React patterns
5. **Optimizations**: Automatic code splitting

### Development Commands

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Deployment Options

1. **Vercel** (Recommended - made by Next.js creators)

   - Automatic deployments
   - Environment variable management
   - Free tier available

2. **Other Platforms**
   - Netlify
   - AWS Amplify
   - Docker + any cloud provider

---

## 🔍 Technical Details

### API Rate Limits

- Whisper API: Varies by deployment
- GPT API: Varies by deployment and tier
- Monitor usage in Azure Portal
- Implement retry logic for rate limit errors

### File Size Considerations

- Azure Whisper limit: 25MB per file
- Typical MP3 file: ~1MB per minute at 128kbps
- Maximum duration: ~25 minutes for standard MP3

### Token Limits

- GPT-4: 8,192 or 32,768 tokens (depending on version)
- GPT-3.5-turbo: 4,096 or 16,384 tokens
- Reserve tokens for transcript + question + response
- Truncate long transcripts if necessary

### Cost Estimation (Approximate)

- Whisper: $0.006 per minute of audio
- GPT-4: $0.03 per 1K input tokens, $0.06 per 1K output tokens
- GPT-3.5-turbo: $0.0015 per 1K input tokens, $0.002 per 1K output tokens

Example for 30-minute demo:

- 5-minute audio transcription: ~$0.03
- 10 Q&A interactions: ~$0.20-$1.00 (depending on model)

---

## ⚠️ Important Considerations

### Security

1. **API Keys Protection with Next.js**

   - Store API keys in `.env.local` (never committed to git)
   - Access only in API routes via `process.env`
   - Keys never exposed to client browser
   - Use `AZURE_` prefix for clarity

2. **Data Privacy**

   - Transcripts may contain sensitive information
   - Follow data retention policies
   - Implement user data deletion
   - Consider encryption at rest

3. **Access Control**

   - Add authentication to API routes if needed
   - Implement rate limiting with middleware
   - Monitor usage patterns
   - Set up alerts for unusual activity

4. **Next.js Security Best Practices**
   - Keep dependencies updated
   - Use Content Security Policy headers
   - Validate all inputs on API routes
   - Sanitize user-generated content

### Performance

1. **Loading States**

   - Always show loading indicators
   - Provide progress feedback
   - Set reasonable timeouts

2. **Error Recovery**

   - Implement retry logic
   - Cache transcripts locally
   - Allow re-transcription if needed

3. **Optimization**
   - Compress audio files if possible
   - Limit conversation history length
   - Implement pagination for long chats

### Backup Plan for Demo

1. **Pre-transcribed Content**

   - Have backup transcripts ready
   - Test all features beforehand
   - Prepare for network issues

2. **Demo Script**

   - Write sample questions
   - Test responses in advance
   - Have alternative examples ready

3. **Technical Issues**
   - Know common error solutions
   - Have Azure portal open for monitoring
   - Keep API documentation handy

---

## 📚 Resources

### Next.js & React

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### shadcn/ui

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [shadcn/ui Components](https://ui.shadcn.com/docs/components)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Azure OpenAI Documentation

- [Azure OpenAI Service Overview](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
- [Whisper API Reference](https://learn.microsoft.com/en-us/azure/ai-services/openai/whisper-quickstart)
- [Chat Completion API Reference](https://learn.microsoft.com/en-us/azure/ai-services/openai/reference)

### Testing Tools

- Sample MP3 files for testing
- API testing tools (Postman, Insomnia, Thunder Client)
- Browser developer tools
- React DevTools

---

## ✅ Pre-Demo Checklist

### One Week Before

- [ ] Azure OpenAI resource created
- [ ] Whisper model deployed
- [ ] GPT model deployed
- [ ] Application developed and tested
- [ ] Sample MP3 files prepared

### One Day Before

- [ ] Test complete user flow
- [ ] Verify API keys are working
- [ ] Check Azure service status
- [ ] Test on presentation computer
- [ ] Prepare backup content
- [ ] Charge laptop fully

### One Hour Before

- [ ] Test internet connection
- [ ] Open application in browser
- [ ] Have Azure portal ready
- [ ] Test audio/video if needed
- [ ] Review presentation notes

---

## 🎯 Success Criteria

Your demo will be successful if:

1. ✅ MP3 file uploads smoothly
2. ✅ Transcription completes without errors
3. ✅ Transcribed text is accurate and readable
4. ✅ Users can ask questions naturally
5. ✅ Responses are relevant and contextual
6. ✅ UI is responsive and intuitive
7. ✅ No technical errors during demo
8. ✅ Audience understands the value proposition

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue 1: Transcription Fails**

- Check API key validity
- Verify deployment name
- Confirm file is valid MP3
- Check file size (< 25MB)

**Issue 2: Chat Not Working**

- Verify GPT deployment is running
- Check API endpoint URL
- Ensure transcript exists
- Review error messages

**Issue 3: Slow Responses**

- Check internet connection
- Verify Azure service status
- Reduce max_tokens parameter
- Consider shorter transcripts

**Issue 4: CORS Errors**

- Implement backend proxy
- Use proper headers
- Check Azure CORS settings

---

## 🚀 Next Steps & Enhancements

### Post-Demo Improvements

1. ✅ Backend security already implemented (Next.js API routes)
2. Add user authentication (NextAuth.js)
3. Store conversation history in database
4. Support multiple file formats (WAV, M4A)
5. Add export functionality (PDF, TXT)
6. Implement conversation sharing with unique URLs
7. Add multi-language support with i18n
8. Create mobile-optimized version
9. Add server-side caching with Redis
10. Implement WebSocket for real-time updates

### Advanced Features

1. Real-time transcription (streaming)
2. Speaker diarization
3. Sentiment analysis visualization
4. Automatic summary generation
5. Keyword extraction and tagging
6. Timestamp-based navigation
7. Highlight important sections
8. Compare multiple transcripts
9. Voice input for questions
10. Text-to-speech for responses

### Next.js Specific Enhancements

1. Server-side rendering for SEO
2. Incremental Static Regeneration
3. Middleware for authentication
4. API route rate limiting
5. Edge functions for global distribution
6. Image optimization (if adding user avatars)
7. Progressive Web App (PWA) support
8. Analytics integration

---

## 📄 License & Credits

This implementation guide is for educational and demonstration purposes. Ensure compliance with Azure OpenAI Service terms and conditions.

**Created for**: 30-minute technical presentation  
**Last Updated**: 2025  
**Version**: 1.0

---

Good luck with your presentation! 🎉
