/**
 * Audio compression utilities using ffmpeg.wasm for client-side compression
 * Automatically compresses all audio files to optimal Whisper settings
 */

import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { CompressionSettings, CompressionProgress, CompressionStats, CompressionResult } from './types'

// Global ffmpeg instance
let ffmpeg: FFmpeg | null = null
let isInitialized = false

/**
 * Initialize ffmpeg.wasm
 */
async function initializeFFmpeg(): Promise<void> {
  if (isInitialized && ffmpeg) return

  try {
    ffmpeg = new FFmpeg()
    
    // Set up progress callback
    ffmpeg.on('progress', ({ progress }) => {
      // Progress is 0-1, convert to 0-100
      const progressPercent = Math.round(progress * 100)
      console.log(`FFmpeg progress: ${progressPercent}%`)
    })

    // Load ffmpeg from CDN
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    })

    isInitialized = true
  } catch (error) {
    console.error('Failed to initialize ffmpeg:', error)
    throw new Error('Failed to initialize audio compression engine. Please try again.')
  }
}

/**
 * Get optimal compression settings based on file size
 */
export function getCompressionSettings(fileSize: number): CompressionSettings {
  // Default: Optimal balance of quality and size for Whisper
  const defaultSettings: CompressionSettings = {
    sampleRate: 16000,  // Whisper's native sample rate
    bitrate: 48,        // Good quality, reasonable size
    channels: 1,        // Mono sufficient for speech
    format: 'opus'      // Best compression for speech
  }

  // For very large files, use more aggressive compression
  if (fileSize > 150 * 1024 * 1024) { // >150MB
    return {
      sampleRate: 16000,
      bitrate: 32,      // More aggressive for very large files
      channels: 1,
      format: 'opus'
    }
  }

  return defaultSettings
}

/**
 * Extract audio metadata from file
 */
async function extractAudioMetadata(file: File): Promise<Partial<CompressionStats>> {
  try {
    // Create audio element to get basic info
    const audio = new Audio()
    const url = URL.createObjectURL(file)
    
    return new Promise((resolve) => {
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(url)
        resolve({
          duration: audio.duration,
          originalFormat: file.type || 'unknown'
        })
      }
      
      audio.onerror = () => {
        URL.revokeObjectURL(url)
        resolve({
          originalFormat: file.type || 'unknown'
        })
      }
      
      audio.src = url
    })
  } catch (error) {
    console.warn('Could not extract audio metadata:', error)
    return {
      originalFormat: file.type || 'unknown'
    }
  }
}

/**
 * Compress audio file using ffmpeg.wasm
 */
export async function compressAudio(
  file: File,
  settings: CompressionSettings,
  onProgress?: (progress: CompressionProgress) => void
): Promise<File> {
  try {
    // Initialize ffmpeg if not already done
    await initializeFFmpeg()
    
    if (!ffmpeg) {
      throw new Error('FFmpeg not initialized')
    }

    // Report loading stage
    onProgress?.({
      progress: 0,
      stage: 'loading',
      message: 'Loading compression engine...'
    })

    // Write input file to ffmpeg
    const inputFileName = `input.${getFileExtension(file.name)}`
    const outputFileName = `output.${settings.format}`
    
    await ffmpeg.writeFile(inputFileName, await fetchFile(file))

    // Report processing stage
    onProgress?.({
      progress: 10,
      stage: 'processing',
      message: 'Processing audio...'
    })

    // Build ffmpeg command for compression
    const command = [
      '-i', inputFileName,
      '-ar', settings.sampleRate.toString(),
      '-ac', settings.channels.toString(),
      '-b:a', `${settings.bitrate}k`,
      '-y', // Overwrite output file
      outputFileName
    ]

    // Execute compression
    await ffmpeg.exec(command)

    // Report finalizing stage
    onProgress?.({
      progress: 90,
      stage: 'finalizing',
      message: 'Finalizing compressed file...'
    })

    // Read compressed file
    const compressedData = await ffmpeg.readFile(outputFileName)
    
    // Create new File object - FileData can be Uint8Array or string
    let uint8Data: Uint8Array
    if (compressedData instanceof Uint8Array) {
      // Create a new Uint8Array with proper ArrayBuffer
      uint8Data = new Uint8Array(compressedData.length)
      uint8Data.set(compressedData)
    } else {
      // Convert string to Uint8Array
      uint8Data = new TextEncoder().encode(compressedData)
    }
    
    const compressedBlob = new Blob([uint8Data.buffer.slice(uint8Data.byteOffset, uint8Data.byteOffset + uint8Data.byteLength) as ArrayBuffer], { 
      type: getMimeType(settings.format) 
    })
    
    const compressedFile = new File(
      [compressedBlob], 
      `${getFileNameWithoutExtension(file.name)}-compressed.${settings.format}`,
      { type: getMimeType(settings.format) }
    )

    // Clean up ffmpeg files
    try {
      await ffmpeg.deleteFile(inputFileName)
      await ffmpeg.deleteFile(outputFileName)
    } catch (cleanupError) {
      console.warn('Failed to clean up ffmpeg files:', cleanupError)
    }

    // Report completion
    onProgress?.({
      progress: 100,
      stage: 'finalizing',
      message: 'Compression complete!'
    })

    return compressedFile

  } catch (error) {
    console.error('Audio compression failed:', error)
    throw new Error(`Compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Compress audio file with automatic settings and progress tracking
 */
export async function compressAudioFile(
  file: File,
  onProgress?: (progress: CompressionProgress) => void
): Promise<CompressionResult> {
  try {
    // Extract metadata
    const metadata = await extractAudioMetadata(file)
    
    // Get compression settings
    const settings = getCompressionSettings(file.size)
    
    // Compress the file
    const compressedFile = await compressAudio(file, settings, onProgress)
    
    // Calculate stats
    const compressionRatio = Math.round((1 - compressedFile.size / file.size) * 100)
    const uploadTimeSaved = Math.round((file.size - compressedFile.size) / (1024 * 1024) * 2) // Rough estimate: 2s per MB
    
    const stats: CompressionStats = {
      originalSize: file.size,
      compressedSize: compressedFile.size,
      originalFormat: metadata.originalFormat || file.type || 'unknown',
      compressedFormat: settings.format,
      compressedBitrate: settings.bitrate,
      compressionRatio,
      duration: metadata.duration,
      uploadTimeSaved
    }

    return {
      compressedFile,
      stats
    }

  } catch (error) {
    console.error('Audio compression failed:', error)
    throw error
  }
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || 'mp3'
}

/**
 * Get filename without extension
 */
function getFileNameWithoutExtension(filename: string): string {
  return filename.replace(/\.[^/.]+$/, '')
}

/**
 * Get MIME type for format
 */
function getMimeType(format: string): string {
  const mimeTypes: Record<string, string> = {
    'opus': 'audio/opus',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav'
  }
  return mimeTypes[format] || 'audio/opus'
}

/**
 * Get compression suggestions for users (legacy function - now handled automatically)
 */
export function getCompressionSuggestions(fileSizeBytes: number, maxSizeBytes: number = 25 * 1024 * 1024): string[] {
  const suggestions: string[] = []
  
  if (fileSizeBytes > maxSizeBytes) {
    suggestions.push("File will be automatically compressed for optimal upload speed")
    suggestions.push("Compression maintains excellent transcription quality")
    suggestions.push("Processed files are optimized for Whisper's requirements")
  } else {
    suggestions.push("File will be automatically optimized for faster upload")
    suggestions.push("Compression improves upload speed without quality loss")
    suggestions.push("All files are processed for optimal transcription")
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
 * Check if file needs compression (legacy function - now always true)
 */
export function needsCompression(fileSizeBytes: number, maxSizeBytes: number = 25 * 1024 * 1024): boolean {
  // Always compress for consistency and optimal performance
  return true
}
