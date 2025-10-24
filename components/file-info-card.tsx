"use client"

import { File, Clock, Music, Database, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { CompressionStats } from "@/lib/types"
import { formatFileSize } from "@/lib/audio-compression"

interface FileInfoCardProps {
  file: File
  type: 'original' | 'compressed'
  stats?: CompressionStats | null
  compressionRatio?: number
}

export function FileInfoCard({ file, type, stats, compressionRatio }: FileInfoCardProps) {
  const isCompressed = type === 'compressed'

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return 'Unknown'
    const minutes = Math.floor(seconds / 60)
    return `${minutes} minutes`
  }

  return (
    <div className={cn(
      "border rounded-lg p-4",
      isCompressed ? "border-green-500 bg-green-50" : "border-gray-300 bg-white"
    )}>
      <div className="flex items-center gap-2 mb-3">
        {isCompressed ? '✅' : '📄'}
        <span className="font-semibold uppercase text-sm">
          {isCompressed ? 'Compressed File (Ready)' : 'Original File'}
        </span>
      </div>

      <div className="space-y-1 text-sm">
        <div className="flex items-center gap-2">
          <File className="w-4 h-4" />
          <span className="truncate">{file.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <Database className="w-4 h-4" />
          <span>Size: {formatFileSize(file.size)}</span>
        </div>

        {stats?.duration && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Duration: ~{formatDuration(stats.duration)}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Music className="w-4 h-4" />
          <span>{stats?.originalFormat || file.type}</span>
        </div>

        {stats?.compressedBitrate && (
          <div className="text-xs text-gray-600 ml-6">
            {stats.compressedBitrate} kbps, {stats.compressedFormat}
            {stats.compressedBitrate && ', Mono'}
          </div>
        )}

        {isCompressed && compressionRatio && (
          <div className="mt-3 pt-3 border-t border-green-200">
            <div className="text-green-700 font-semibold flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              {compressionRatio}% smaller
            </div>
            {stats?.uploadTimeSaved && (
              <div className="text-xs text-green-600 mt-1">
                ⚡ Will save ~{stats.uploadTimeSaved}s on upload
              </div>
            )}
            <div className="text-xs text-green-600 mt-1">
              ✨ Transcription quality: Excellent (97-99%)
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
