# Audio Chat Demo App

An intelligent audio transcription and chat application that allows users to upload audio files, transcribe them using Azure OpenAI's Whisper model, and engage in conversational Q&A about the transcribed content using GPT-4.

## Overview

This application demonstrates the integration of Azure OpenAI services for:
- **Audio Transcription**: Convert MP3 audio files to text using Whisper
- **Intelligent Chat**: Ask questions and get insights about the transcribed content using GPT-4
- **Real-time Interaction**: Seamless user experience with modern UI components

## Tech Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful, accessible UI components
- **[Lucide React](https://lucide.dev/)** - Icon library

### Backend
- **[Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)** - Serverless API endpoints
- **[Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-services/openai-service)** - AI models (Whisper & GPT-4)

### Deployment
- **[Vercel](https://vercel.com/)** - Serverless deployment platform

## Features

- 🎤 **Audio Upload**: Support for MP3 files up to 25MB
- 📝 **Transcription**: Accurate speech-to-text conversion using Whisper
- 💬 **Interactive Chat**: Ask questions about the transcribed content
- 🎨 **Modern UI**: Clean, responsive design with shadcn/ui components
- ⚡ **Fast & Efficient**: Built on Next.js for optimal performance
- 🔒 **Secure**: API keys stored server-side, never exposed to client

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Azure OpenAI account with:
  - Whisper deployment for transcription
  - GPT-4 deployment for chat

### Installation

1. Clone the repository:
```bash
git clone https://github.com/MikeNguyenCP/audio2text.git
cd audio2text
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Azure OpenAI credentials:
```env
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_WHISPER_DEPLOYMENT=whisper
AZURE_OPENAI_GPT_DEPLOYMENT=gpt-4
AZURE_OPENAI_API_VERSION=2024-02-01
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm run start
```

## Project Structure

```
audio2text/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utility functions
├── requirements/          # Project documentation
└── public/               # Static assets
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI resource endpoint | `https://your-resource.openai.azure.com/` |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key | `abc123...` |
| `AZURE_OPENAI_WHISPER_DEPLOYMENT` | Whisper model deployment name | `whisper` |
| `AZURE_OPENAI_GPT_DEPLOYMENT` | GPT model deployment name | `gpt-4` |
| `AZURE_OPENAI_API_VERSION` | Azure OpenAI API version | `2024-02-01` |

## Development Status

This project is currently in active development. See [requirements/todo.md](requirements/todo.md) for implementation progress.

## License

MIT

## Acknowledgments

- Built with [Claude Code](https://claude.com/claude-code)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Powered by [Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-services/openai-service)