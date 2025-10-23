# Audio2Text - Deployment Guide

## Overview

This guide covers deploying the Audio2Text application to production environments. The application is built with Next.js 15 and integrates with Azure OpenAI services.

## Prerequisites

- Azure OpenAI resource with deployed Whisper and GPT models
- Node.js 18+ and npm
- Git repository access
- Deployment platform account (Vercel recommended)

## Environment Setup

### 1. Azure OpenAI Configuration

Ensure you have the following Azure OpenAI resources:

1. **Azure OpenAI Resource**: Create in Azure Portal
2. **Whisper Deployment**: Deploy Whisper model for audio transcription
3. **GPT Deployment**: Deploy GPT model for chat completion
4. **API Keys**: Generate and securely store API keys

### 2. Environment Variables

Create a `.env.local` file with the following variables:

```env
# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_WHISPER_DEPLOYMENT=whisper
AZURE_OPENAI_GPT_DEPLOYMENT=gpt-4
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

**⚠️ Security Note**: Never commit `.env.local` to version control. It's already in `.gitignore`.

## Local Production Testing

Before deploying, test the production build locally:

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start production server
npm run start
```

Visit `http://localhost:3000` to test the production build.

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel provides seamless Next.js deployment with built-in optimizations.

#### Steps:

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Configure Environment Variables**:
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add all required environment variables
   - Redeploy after adding variables

#### Vercel Configuration

Create `vercel.json` for custom configuration:

```json
{
  "functions": {
    "app/api/transcribe/route.ts": {
      "maxDuration": 60
    },
    "app/api/chat/route.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

### Option 2: Netlify

For Netlify deployment:

1. **Build Command**: `npm run build`
2. **Publish Directory**: `.next`
3. **Environment Variables**: Add all required variables in Netlify dashboard

### Option 3: Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

Build and run:

```bash
docker build -t audio2text .
docker run -p 3000:3000 audio2text
```

## Security Considerations

### 1. Environment Variables
- ✅ Never expose API keys to client-side code
- ✅ Use server-side API routes only
- ✅ Store sensitive data in environment variables
- ✅ Use different keys for different environments

### 2. Input Validation
- ✅ File type validation (MP3, WAV, M4A only)
- ✅ File size limits (25MB maximum)
- ✅ Message content validation
- ✅ Error handling for all API routes

### 3. Rate Limiting
Consider implementing rate limiting for production:

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Implement rate limiting logic here
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
```

## Performance Optimization

### 1. File Upload Optimization
- Maximum file size: 25MB
- Supported formats: MP3, WAV, M4A
- Client-side validation before upload

### 2. API Response Optimization
- Proper error handling
- Timeout configuration
- Retry logic for failed requests

### 3. Caching Strategy
- Static assets cached by CDN
- API responses cached appropriately
- Client-side state management

## Monitoring and Logging

### 1. Error Monitoring
- Implement error tracking (Sentry, LogRocket)
- Monitor API failures
- Track user interactions

### 2. Performance Monitoring
- Monitor API response times
- Track file upload success rates
- Monitor Azure OpenAI usage

### 3. Analytics
- Track user engagement
- Monitor feature usage
- Analyze error patterns

## Troubleshooting

### Common Issues:

1. **Build Failures**:
   ```bash
   npm run build
   npm run lint
   ```

2. **Environment Variables**:
   - Verify all required variables are set
   - Check variable names match exactly
   - Ensure no trailing spaces

3. **API Errors**:
   - Check Azure OpenAI service status
   - Verify API keys are valid
   - Check deployment names

4. **File Upload Issues**:
   - Verify file size limits
   - Check supported file formats
   - Monitor network connectivity

### Debug Commands:

```bash
# Check TypeScript compilation
npm run type-check

# Run linting
npm run lint

# Test production build
npm run build && npm run start

# Check environment variables
node -e "console.log(process.env.AZURE_OPENAI_ENDPOINT)"
```

## Post-Deployment Checklist

- [ ] Test file upload functionality
- [ ] Test transcription with sample audio
- [ ] Test chat interface
- [ ] Verify error handling
- [ ] Check mobile responsiveness
- [ ] Monitor Azure OpenAI usage
- [ ] Set up error tracking
- [ ] Configure monitoring alerts
- [ ] Test production build locally
- [ ] Verify environment variables

## Cost Management

### Azure OpenAI Costs:
- **Whisper**: ~$0.006 per minute of audio
- **GPT-4**: ~$0.03 per 1K input tokens, $0.06 per 1K output tokens
- **GPT-3.5-turbo**: ~$0.0015 per 1K input tokens, $0.002 per 1K output tokens

### Optimization Tips:
- Set usage quotas in Azure
- Monitor usage regularly
- Implement request caching where appropriate
- Use appropriate model tiers for your needs

## Support

For deployment issues:
1. Check this guide first
2. Review error logs
3. Test locally with production build
4. Check Azure OpenAI service status
5. Contact support if needed

---

**Last Updated**: 2025-01-27
**Version**: 1.0.0
