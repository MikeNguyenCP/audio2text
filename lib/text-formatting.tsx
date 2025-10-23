import React from "react"

/**
 * Utility functions for formatting text with markdown-like syntax
 */

export interface FormattedTextSegment {
  text: string
  type: 'text' | 'bold' | 'italic' | 'code'
}

/**
 * Parse text with markdown-like formatting
 * Supports:
 * - **text** for bold
 * - *text* for italic
 * - `text` for code
 */
export function parseFormattedText(text: string): FormattedTextSegment[] {
  if (!text) return []
  
  const segments: FormattedTextSegment[] = []
  let remainingText = text

  // Process the text character by character to find formatting markers
  while (remainingText.length > 0) {
    // Check for bold **text** (highest priority)
    const boldMatch = remainingText.match(/^\*\*(.*?)\*\*/)
    if (boldMatch) {
      segments.push({ text: boldMatch[1], type: 'bold' })
      remainingText = remainingText.slice(boldMatch[0].length)
      continue
    }

    // Check for italic *text* (but not **text**)
    const italicMatch = remainingText.match(/^\*(?!\*)(.*?)\*/)
    if (italicMatch) {
      segments.push({ text: italicMatch[1], type: 'italic' })
      remainingText = remainingText.slice(italicMatch[0].length)
      continue
    }

    // Check for code `text`
    const codeMatch = remainingText.match(/^`(.*?)`/)
    if (codeMatch) {
      segments.push({ text: codeMatch[1], type: 'code' })
      remainingText = remainingText.slice(codeMatch[0].length)
      continue
    }

    // If no formatting found, add the next character as regular text
    const nextChar = remainingText[0]
    if (segments.length > 0 && segments[segments.length - 1].type === 'text') {
      // Append to the last text segment
      segments[segments.length - 1].text += nextChar
    } else {
      // Create a new text segment
      segments.push({ text: nextChar, type: 'text' })
    }
    
    remainingText = remainingText.slice(1)
  }

  return segments
}

/**
 * Render formatted text segments as JSX elements
 */
export function renderFormattedText(text: string): React.ReactElement {
  const segments = parseFormattedText(text)
  
  return (
    <span>
      {segments.map((segment, index) => {
        switch (segment.type) {
          case 'bold':
            return <strong key={index}>{segment.text}</strong>
          case 'italic':
            return <em key={index}>{segment.text}</em>
          case 'code':
            return (
              <code 
                key={index} 
                className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-xs font-mono"
              >
                {segment.text}
              </code>
            )
          default:
            return <span key={index}>{segment.text}</span>
        }
      })}
    </span>
  )
}
