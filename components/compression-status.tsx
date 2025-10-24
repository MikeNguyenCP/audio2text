"use client"

import { Loader2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FileInfoCard } from "@/components/file-info-card"
import { CompressionProgress, CompressionStats, CompressionStatus as CompressionStatusType } from "@/lib/types"

interface CompressionStatusProps {
  originalFile: File
  compressedFile: File | null
  progress: CompressionProgress | null
  status: CompressionStatusType
  stats: CompressionStats | null
  error: Error | null
  onCancel?: () => void
  onRetry?: () => void
  onCompress?: () => void
  showSkipOption?: boolean
  onSkipChange?: (skip: boolean) => void
}

export function CompressionStatus({
  originalFile,
  compressedFile,
  progress,
  status,
  stats,
  error,
  onCancel,
  onRetry,
  onCompress,
  showSkipOption = false,
  onSkipChange
}: CompressionStatusProps) {
  
  const renderProgressBar = () => {
    if (!progress || status !== 'compressing') return null

    return (
      <div className="space-y-2 md:space-y-3">
        <div className="flex items-center gap-2">
          <Loader2 className="animate-spin w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
          <span className="text-xs md:text-sm">Optimizing audio for transcription...</span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress.progress}%` }}
          />
        </div>

        <div className="text-xs md:text-sm text-gray-600">
          {progress.message} {progress.progress}%
          {progress.estimatedTimeRemaining && (
            <span> - ~{progress.estimatedTimeRemaining}s remaining</span>
          )}
        </div>
      </div>
    )
  }

  const renderFileCards = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        <FileInfoCard 
          file={originalFile} 
          type="original" 
          stats={stats} 
        />
        {compressedFile && stats && (
          <FileInfoCard
            file={compressedFile}
            type="compressed"
            stats={stats}
            compressionRatio={stats.compressionRatio}
          />
        )}
      </div>
    )
  }

  const renderActionButtons = () => {
    return (
      <div className="flex gap-2">
        {status === 'compressing' && onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}

        {status === 'error' && onRetry && (
          <Button onClick={onRetry}>
            Retry Compression
          </Button>
        )}

        {status === 'skipped' && onCompress && (
          <Button onClick={onCompress}>
            Compress File Instead
          </Button>
        )}
      </div>
    )
  }

  const renderSkipOption = () => {
    if (!showSkipOption || status !== 'idle') return null

    return (
      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
        <input
          type="checkbox"
          onChange={(e) => onSkipChange?.(e.target.checked)}
          className="rounded"
        />
        <span>Skip compression (advanced - may slow down upload)</span>
      </label>
    )
  }

  const renderStatusMessage = () => {
    switch (status) {
      case 'idle':
        return (
          <div className="flex items-start gap-2 p-3 md:p-4 bg-blue-50 border border-blue-200 rounded">
            <Info className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs md:text-sm text-blue-900">
              Files are automatically optimized for faster upload and best transcription quality
            </p>
          </div>
        )
      
      case 'compressing':
        return (
          <div className="space-y-3 md:space-y-4">
            {renderProgressBar()}
            <div className="text-xs md:text-sm text-gray-600">
              💡 This will make your upload much faster!
            </div>
          </div>
        )
      
      case 'complete':
        return (
          <div className="space-y-3 md:space-y-4">
            <div className="text-center text-green-700 font-semibold text-sm md:text-base">
              ✅ Ready to transcribe!
            </div>
            {renderFileCards()}
          </div>
        )
      
      case 'error':
        return (
          <div className="space-y-3 md:space-y-4">
            <div className="text-center text-red-700 font-semibold text-sm md:text-base">
              ❌ Compression Failed
            </div>
            <div className="text-xs md:text-sm text-gray-600">
              Error: {error?.message || 'Unknown error'}
            </div>
            <div className="text-xs md:text-sm text-gray-600">
              Suggestions:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Try uploading a different file</li>
                <li>Ensure file is valid audio format</li>
                <li>Check browser compatibility</li>
              </ul>
            </div>
            {renderActionButtons()}
          </div>
        )
      
      case 'skipped':
        return (
          <div className="space-y-3 md:space-y-4">
            <div className="text-center text-yellow-700 font-semibold text-sm md:text-base">
              ⚠️ Compression Skipped
            </div>
            <div className="text-xs md:text-sm text-gray-600">
              Upload may take longer than compressed files. We recommend compression for faster results.
            </div>
            {renderFileCards()}
            {renderActionButtons()}
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {renderStatusMessage()}
      {renderSkipOption()}
    </div>
  )
}
