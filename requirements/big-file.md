# Handling Large Audio Files (>25MB)

## Problem Statement

Azure OpenAI Whisper API has a hard limit of 25MB per file. Users with longer recordings or high-quality audio files will exceed this limit and cannot use the transcription service.

## Current Limitations

- **Azure OpenAI Whisper API**: 25MB maximum file size
- **Typical file sizes**:
  - 10 minutes of high-quality audio (320kbps MP3): ~24MB
  - 30 minutes of standard audio (128kbps MP3): ~28MB
  - 1 hour of standard audio: ~56MB

## Solution Options

### Option 1: Client-Side Audio Compression (RECOMMENDED)

**Description**: Compress audio files in the browser before upload using reduced bitrate and sample rate optimized for speech transcription.

**Pros**:
- Reduces server processing load
- Faster uploads (smaller file size)
- User sees immediate feedback if file is still too large
- No server-side processing required
- Preserves transcription quality (speech doesn't need high fidelity)

**Cons**:
- Requires WebAssembly/JavaScript audio processing library
- May take time on slower devices
- Browser compatibility concerns

**Implementation**:
```typescript
// Use ffmpeg.wasm or similar library
// Compress to: 16kHz sample rate, 32kbps, mono
ffmpeg -i input.mp3 -ar 16000 -b:a 32k -ac 1 output.opus

// Typical compression results:
// 50MB file → ~8MB (6x reduction)
// 100MB file → ~16MB (6x reduction)
```

**Recommended Settings for Speech Transcription**:
- Sample rate: 16kHz (sufficient for speech)
- Bitrate: 32-64kbps
- Channels: Mono (speech only needs 1 channel)
- Format: Opus or low-bitrate MP3

**Technical Details**:
- Use `ffmpeg.wasm` in the browser (supports all major audio formats)
- Show progress bar during compression
- Validate output size before upload
- Fall back to chunking if compression still exceeds 25MB

**Effort**: Medium (2-3 days)

---

### Option 2: Server-Side Audio Chunking

**Description**: Split large audio files into smaller chunks (<25MB each), transcribe separately, then merge results with adjusted timestamps.

**Pros**:
- Works with any file size
- No quality loss
- Handles very long recordings (hours)
- User doesn't need to do anything

**Cons**:
- Complex timestamp management
- May break mid-sentence (accuracy issues)
- Increased API costs (multiple requests)
- Longer processing time
- Risk of context loss between chunks

**Implementation Approach**:
```typescript
// 1. Split audio file into chunks
const chunkDuration = 10 * 60 // 10 minutes per chunk
const chunks = await splitAudioFile(file, chunkDuration)

// 2. Transcribe each chunk
const transcriptions = await Promise.all(
  chunks.map((chunk, index) =>
    transcribeChunk(chunk, index * chunkDuration)
  )
)

// 3. Merge with adjusted timestamps
const finalTranscript = mergeTranscriptions(transcriptions)
```

**Best Practices**:
- Split on silence detection (avoid breaking mid-sentence)
- Use ffmpeg for splitting: `ffmpeg -i input.mp3 -f segment -segment_time 600 -c copy output%03d.mp3`
- Adjust timestamps: `timestamp_global = timestamp_chunk + (chunk_index * chunk_duration)`
- Add overlap between chunks (5-10 seconds) to preserve context
- Provide progress updates to user (e.g., "Processing chunk 3 of 8...")

**Timestamp Handling**:
```typescript
// Whisper returns timestamps relative to each chunk
// Need to add offset for each chunk
chunk1: [0:05] "Hello" → [0:05] "Hello"
chunk2: [0:03] "world" → [10:03] "world" (10min offset)
```

**Effort**: High (4-5 days)

---

### Option 3: Azure AI Speech Service (Batch Transcription)

**Description**: Use Azure AI Speech Service's Whisper implementation for batch transcription, which supports files up to 1GB.

**Pros**:
- Handles files up to 1GB (much larger than 25MB)
- No chunking or compression needed
- Built-in support for long audio
- Same Whisper model quality
- Better for enterprise use cases

**Cons**:
- Different Azure service (additional setup)
- Different API (code refactoring required)
- May have different pricing model
- Batch processing (not real-time)
- Requires Azure AI Speech resource (in addition to Azure OpenAI)

**Azure AI Speech vs Azure OpenAI Whisper**:

| Feature | Azure OpenAI Whisper | Azure AI Speech (Whisper) |
|---------|---------------------|---------------------------|
| Max file size | 25MB | 1GB |
| Processing | Real-time API | Batch transcription |
| Setup | Azure OpenAI resource | Azure Speech resource |
| Pricing | Per second | Per hour |
| Use case | Quick transcriptions | Large files, enterprise |

**Implementation**:
```typescript
// Azure Speech SDK for batch transcription
import * as sdk from "microsoft-cognitiveservices-speech-sdk"

const speechConfig = sdk.SpeechConfig.fromSubscription(
  process.env.AZURE_SPEECH_KEY!,
  process.env.AZURE_SPEECH_REGION!
)

// Upload to Azure Blob Storage first
const blobUrl = await uploadToBlob(audioFile)

// Create batch transcription job
const transcription = await client.transcriptions.create({
  contentUrls: [blobUrl],
  locale: "en-US",
  displayName: "Large file transcription"
})

// Poll for completion
const result = await waitForCompletion(transcription.self)
```

**Additional Requirements**:
- Azure Speech resource
- Azure Blob Storage (for file upload)
- Polling mechanism for batch job completion

**Effort**: Medium-High (3-4 days)

---

### Option 4: Hybrid Approach (Compression + Chunking)

**Description**: Try compression first, if still >25MB then chunk the compressed file.

**Pros**:
- Handles all file sizes gracefully
- Minimizes number of chunks needed
- Better accuracy than chunking alone
- Cost-effective (fewer API calls)

**Cons**:
- Most complex to implement
- Longer processing time if chunking is needed

**Implementation Flow**:
```
1. Receive file
2. Check size:
   - If <25MB → transcribe directly
   - If 25-150MB → compress, then transcribe
   - If >150MB → compress, then chunk, then transcribe
3. Return result with appropriate processing metadata
```

**Example Logic**:
```typescript
async function processLargeFile(file: File) {
  if (file.size <= MAX_SIZE) {
    // Direct transcription
    return await transcribe(file)
  }

  // Try compression first
  const compressed = await compressAudio(file, {
    sampleRate: 16000,
    bitrate: 32,
    channels: 1
  })

  if (compressed.size <= MAX_SIZE) {
    return await transcribe(compressed)
  }

  // Still too large, need to chunk
  const chunks = await splitIntoChunks(compressed, MAX_SIZE)
  const results = await transcribeChunks(chunks)
  return mergeResults(results)
}
```

**Effort**: High (5-6 days)

---

## Comparison Matrix

| Solution | Max File Size | Quality Loss | Complexity | API Cost | User Wait Time | Recommended For |
|----------|---------------|--------------|------------|----------|----------------|-----------------|
| Client Compression | ~150MB | Minimal | Medium | Low | Medium | Most users |
| Server Chunking | Unlimited | None | High | High | High | Very long recordings |
| Azure AI Speech | 1GB | None | Medium | Medium | High | Enterprise users |
| Hybrid | Unlimited | Minimal | High | Medium | High | Production apps |

---

## Recommendations by Use Case

### For MVP/Demo (Quick Win)
**Choose: Option 1 (Client-Side Compression)**
- Fastest to implement
- Handles 90% of use cases
- Good user experience
- Show compression progress to user

### For Production (Long-term)
**Choose: Option 4 (Hybrid Approach)**
- Covers all scenarios
- Cost-optimized
- Best user experience
- Scalable

### For Enterprise Customers
**Choose: Option 3 (Azure AI Speech Service)**
- Official Azure solution for large files
- No file size worries
- Better SLA and support

---

## Implementation Roadmap

### Phase 1: Client-Side Compression (Week 1-2)
1. Integrate ffmpeg.wasm library
2. Add compression UI with progress indicator
3. Validate compressed file size before upload
4. Update file upload validation logic
5. Add user notification: "Your file is being compressed for optimal processing..."

### Phase 2: Server-Side Chunking Fallback (Week 3-4)
1. Implement audio splitting with ffmpeg (server-side)
2. Add timestamp adjustment logic
3. Implement parallel chunk processing
4. Add merge logic for transcriptions
5. Add progress tracking for multi-chunk processing

### Phase 3: Azure AI Speech Integration (Week 5-6)
1. Set up Azure Speech Service resource
2. Set up Azure Blob Storage for large files
3. Implement batch transcription API
4. Add polling mechanism for job completion
5. Create fallback logic: Try OpenAI Whisper first, use Speech Service if too large

---

## Technical Considerations

### Audio Quality for Transcription

Speech transcription doesn't require high-fidelity audio. Research shows:
- 16kHz sample rate is sufficient (phone quality)
- 32-64kbps bitrate preserves speech intelligibility
- Mono audio works as well as stereo for speech
- Opus codec is better than MP3 for speech at low bitrates

### Chunking Best Practices

1. **Avoid breaking mid-sentence**: Use silence detection (ffmpeg silencedetect filter)
2. **Add overlap**: 5-10 second overlap between chunks helps maintain context
3. **Adjust timestamps**: Add chunk offset to relative timestamps
4. **Handle errors gracefully**: If one chunk fails, retry it independently
5. **Parallel processing**: Process chunks concurrently to reduce total time

### Client-Side Libraries

**ffmpeg.wasm**:
- Full ffmpeg in the browser
- ~31MB initial load (cache it!)
- Works in all modern browsers
- Example: https://github.com/ffmpegwasm/ffmpeg.wasm

**lamejs** (for MP3 only):
- Lightweight (~200KB)
- MP3 encoding only
- Good for simple compression

### Cost Analysis (per 1-hour audio file)

Assuming $0.006/minute for Azure OpenAI Whisper:

| Approach | API Calls | Cost | Processing Time |
|----------|-----------|------|-----------------|
| Direct (fail) | 0 | $0 | N/A (too large) |
| Compression → 1 file | 1 | $0.36 | ~30 seconds |
| 6 chunks (10min each) | 6 | $0.36 | ~45 seconds |
| Azure AI Speech | 1 | ~$0.50 | ~2-5 minutes |

*Cost is similar, but user experience differs*

---

## Testing Scenarios

1. **Small file (5MB)**: Should work without modification
2. **Medium file (30MB)**: Should compress and succeed
3. **Large file (100MB)**: Should compress, possibly chunk
4. **Very large file (500MB)**: Should chunk after compression
5. **Poor quality audio**: Verify compression doesn't degrade further
6. **Various formats**: Test MP3, M4A, WAV, OGG, WebM

---

## User Experience Considerations

### Loading States
```
"Uploading file..."
"Compressing audio for optimal processing..." (0-30s)
"Transcribing... This may take a few moments" (30s-2min)
"Processing part 3 of 8..." (for chunked files)
```

### Error Messages
```
❌ "File too large (150MB). Maximum size is 100MB after compression."
ℹ️ "Your file is large (50MB) and will be automatically compressed. This may take a moment."
✅ "File compressed from 45MB to 8MB. Beginning transcription..."
```

### Progress Indicators
- Compression progress: 0-100%
- Upload progress: 0-100%
- Transcription progress: Indeterminate spinner or chunk count

---

## Security Considerations

- Validate file type after compression (prevent malicious files)
- Limit total processing time (timeout after 5 minutes)
- Clean up temporary files after processing
- Rate limit compression requests (prevent DoS)
- Validate compressed output size before proceeding

---

## References

- [Azure OpenAI Whisper Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/whisper-overview)
- [Azure AI Speech Service](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/whisper-overview)
- [OpenAI Whisper API Limits Discussion](https://community.openai.com/t/whisper-api-how-to-upload-file-that-larger-than-25mb/693285)
- [ffmpeg.wasm GitHub](https://github.com/ffmpegwasm/ffmpeg.wasm)
- [Audio Optimization for Speech-to-Text](https://cloud.google.com/speech-to-text/docs/optimizing-audio-files-for-speech-to-text)
