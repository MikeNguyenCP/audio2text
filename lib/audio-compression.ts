/**
 * Audio compression utilities for handling large audio files
 * Note: This is a basic implementation. For production use, consider using
 * Web Audio API or server-side compression libraries.
 */

export interface CompressionOptions {
  maxSizeBytes: number
  quality?: number // 0-1, where 1 is highest quality
}

export interface CompressionResult {
  compressed: boolean
  file: File
  originalSize: number
  compressedSize: number
  compressionRatio: number
}

/**
 * Basic audio file compression using canvas and Web Audio API
 * This is a simplified approach - for production, consider using FFmpeg.wasm
 */
export async function compressAudioFile(
  file: File, 
  options: CompressionOptions
): Promise<CompressionResult> {
  const { maxSizeBytes, quality = 0.7 } = options
  
  // If file is already small enough, return as-is
  if (file.size <= maxSizeBytes) {
    return {
      compressed: false,
      file,
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 1
    }
  }

  try {
    // For now, we'll provide guidance on manual compression
    // In a production app, you'd implement actual compression here
    throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds limit (${(maxSizeBytes / 1024 / 1024).toFixed(2)}MB). Please compress the audio file manually.`)
  } catch (error) {
    throw error
  }
}

/**
 * Get compression suggestions for users
 */
export function getCompressionSuggestions(fileSizeBytes: number, maxSizeBytes: number): string[] {
  const suggestions: string[] = []
  
  if (fileSizeBytes > maxSizeBytes) {
    suggestions.push("Reduce audio quality (lower bitrate)")
    suggestions.push("Convert to MP3 format with lower bitrate (128kbps or lower)")
    suggestions.push("Split long recordings into smaller segments")
    suggestions.push("Use online audio compressors like Audacity or online tools")
  }
  
  return suggestions
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

/**
 * Check if file needs compression
 */
export function needsCompression(fileSizeBytes: number, maxSizeBytes: number): boolean {
  return fileSizeBytes > maxSizeBytes
}
