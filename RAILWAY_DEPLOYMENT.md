# Railway Deployment Guide for Audio2Text

## Overview

This guide covers deploying the Audio2Text application to Railway, a modern cloud platform that provides seamless deployment for Next.js applications.

## Prerequisites

- Railway account (sign up at [railway.app](https://railway.app))
- Azure OpenAI resource with deployed Whisper and GPT models
- Git repository with your code
- Railway CLI (optional but recommended)

## Quick Start

### 1. Install Railway CLI (Optional)

```bash
# Install Railway CLI globally
npm install -g @railway/cli

# Login to Railway
railway login
```

### 2. Deploy from GitHub

1. **Connect GitHub Repository**:
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your Audio2Text repository

2. **Configure Environment Variables**:
   - In Railway dashboard, go to your project
   - Click on "Variables" tab
   - Add the following environment variables:

```env
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_WHISPER_DEPLOYMENT=whisper
AZURE_OPENAI_GPT_DEPLOYMENT=gpt-4
AZURE_OPENAI_API_VERSION=2024-02-15-preview
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

3. **Deploy**:
   - Railway will automatically detect it's a Next.js app
   - The deployment will start automatically
   - Monitor the build logs in the Railway dashboard

### 3. Deploy with Railway CLI

```bash
# Initialize Railway project
railway init

# Link to existing project (if you created one in dashboard)
railway link

# Set environment variables
railway variables set AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
railway variables set AZURE_OPENAI_API_KEY=your-api-key-here
railway variables set AZURE_OPENAI_WHISPER_DEPLOYMENT=whisper
railway variables set AZURE_OPENAI_GPT_DEPLOYMENT=gpt-4
railway variables set AZURE_OPENAI_API_VERSION=2024-02-15-preview

# Deploy
railway up
```

## Configuration Files

### railway.json

The `railway.json` file configures Railway-specific settings:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm run start",
    "healthcheckPath": "/",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### next.config.ts

Updated with Railway-optimized settings:

```typescript
const nextConfig: NextConfig = {
  // Enable standalone output for Railway deployment
  output: 'standalone',
  
  // Optimize for production
  compress: true,
  
  // Configure experimental features
  experimental: {
    serverComponentsExternalPackages: ['@azure/openai'],
  },
  
  // Configure headers for API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI endpoint URL | `https://your-resource.openai.azure.com/` |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key | `your-api-key-here` |
| `AZURE_OPENAI_WHISPER_DEPLOYMENT` | Whisper deployment name | `whisper` |
| `AZURE_OPENAI_GPT_DEPLOYMENT` | GPT deployment name | `gpt-4` |
| `AZURE_OPENAI_API_VERSION` | API version | `2024-02-15-preview` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Node environment | `production` |
| `NEXT_TELEMETRY_DISABLED` | Disable Next.js telemetry | `1` |
| `PORT` | Server port | `3000` (Railway sets automatically) |

## Deployment Process

### 1. Build Process

Railway uses Nixpacks to automatically detect and build your Next.js application:

1. **Dependency Installation**: Installs Node.js dependencies
2. **Build Step**: Runs `npm run build`
3. **Optimization**: Creates optimized production build
4. **Standalone Output**: Generates standalone server

### 2. Runtime Configuration

- **Port**: Railway automatically sets the `PORT` environment variable
- **Health Checks**: Configured to check `/` endpoint
- **Restart Policy**: Automatically restarts on failure
- **Logging**: All logs are available in Railway dashboard

### 3. File Size Limits

Railway has different limits than Vercel:
- **Request Body**: Up to 50MB
- **Function Timeout**: Up to 5 minutes
- **Memory**: Up to 8GB (depending on plan)

## Monitoring and Logs

### Railway Dashboard

1. **Deployment Logs**: View real-time build and deployment logs
2. **Runtime Logs**: Monitor application logs and errors
3. **Metrics**: CPU, memory, and network usage
4. **Environment Variables**: Manage configuration

### Railway CLI Commands

```bash
# View deployment logs
railway logs

# Check deployment status
railway status

# View environment variables
railway variables

# Connect to project
railway link

# Deploy latest changes
railway up
```

## Custom Domain (Pro Plan)

1. **Add Custom Domain**:
   - Go to Railway dashboard → Settings → Domains
   - Add your domain name
   - Configure DNS records as instructed

2. **SSL Certificate**:
   - Railway automatically provides SSL certificates
   - HTTPS is enabled by default

## Troubleshooting

### Common Issues

1. **Build Failures**:
   ```bash
   # Check build logs in Railway dashboard
   # Ensure all dependencies are in package.json
   # Verify Node.js version compatibility
   ```

2. **Environment Variables**:
   ```bash
   # Verify all required variables are set
   railway variables
   
   # Check variable names match exactly
   # Ensure no trailing spaces or quotes
   ```

3. **API Errors**:
   ```bash
   # Check Azure OpenAI service status
   # Verify API keys are valid
   # Check deployment names match
   ```

4. **File Upload Issues**:
   ```bash
   # Railway supports larger files than Vercel
   # Check file size limits (up to 50MB)
   # Verify supported file formats
   ```

### Debug Commands

```bash
# Test production build locally
npm run build && npm run start

# Check TypeScript compilation
npm run type-check

# Run linting
npm run lint

# View Railway logs
railway logs --follow
```

## Performance Optimization

### Railway-Specific Optimizations

1. **Standalone Output**: Reduces bundle size and startup time
2. **Compression**: Enabled for better performance
3. **Caching**: Railway provides built-in caching
4. **CDN**: Static assets served via Railway's CDN

### File Upload Optimization

- **Maximum File Size**: 50MB (Railway limit)
- **Supported Formats**: MP3, WAV, M4A, MP4, OGG, WEBM
- **Client-side Validation**: Prevents unnecessary uploads
- **Progress Indicators**: Better user experience

## Security Considerations

### Environment Variables
- ✅ Never expose API keys to client-side code
- ✅ Use server-side API routes only
- ✅ Store sensitive data in Railway environment variables
- ✅ Use different keys for different environments

### Input Validation
- ✅ File type validation (audio files only)
- ✅ File size limits (50MB maximum)
- ✅ Message content validation
- ✅ Error handling for all API routes

### Rate Limiting
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

## Cost Management

### Railway Pricing
- **Hobby Plan**: $5/month (512MB RAM, 1GB storage)
- **Pro Plan**: $20/month (8GB RAM, 100GB storage)
- **Team Plan**: $99/month (8GB RAM, 100GB storage)

### Azure OpenAI Costs
- **Whisper**: ~$0.006 per minute of audio
- **GPT-4**: ~$0.03 per 1K input tokens, $0.06 per 1K output tokens
- **GPT-3.5-turbo**: ~$0.0015 per 1K input tokens, $0.002 per 1K output tokens

### Optimization Tips
- Set usage quotas in Azure
- Monitor usage regularly
- Implement request caching where appropriate
- Use appropriate model tiers for your needs

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
- [ ] Check Railway logs for errors
- [ ] Test custom domain (if applicable)

## Support and Resources

### Railway Resources
- [Railway Documentation](https://docs.railway.app/)
- [Railway Discord](https://discord.gg/railway)
- [Railway Status](https://status.railway.app/)

### Next.js Resources
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)

### Azure OpenAI Resources
- [Azure OpenAI Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
- [Azure OpenAI Pricing](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/openai-service/)

---

**Last Updated**: 2025-01-27  
**Version**: 1.0.0  
**Platform**: Railway
