export interface MarkdownHeading {
  id: string
  text: string
  level: number
}

function normalizeMarkdownContent(content: string): string {
  if (!content) return ''

  let normalized = content.replace(/\r\n/g, '\n')

  if (!normalized.includes('\n') && normalized.includes(String.raw`\n`)) {
    normalized = normalized
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\r/g, '')
  }

  return normalized
}

function generateBaseSlug(text: string): string {
  const normalized = text
    .toLowerCase()
    .replace(/[^\w\s가-힣-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

  return normalized || 'section'
}

function cleanHeadingText(text: string): string {
  return text
    .replace(/\s+#+\s*$/, '')
    .trim()
}

export function extractMarkdownHeadings(markdown: string): MarkdownHeading[] {
  const normalizedMarkdown = normalizeMarkdownContent(markdown)
  const headings: MarkdownHeading[] = []
  const slugCount = new Map<string, number>()
  const lines = normalizedMarkdown.split('\n')

  let order = 0
  let inFencedCodeBlock = false
  let currentFenceMarker: '```' | '~~~' | null = null

  for (const line of lines) {
    const trimmedLine = line.trimStart()

    if (trimmedLine.startsWith('```') || trimmedLine.startsWith('~~~')) {
      const fenceMarker = trimmedLine.startsWith('```') ? '```' : '~~~'

      if (!inFencedCodeBlock) {
        inFencedCodeBlock = true
        currentFenceMarker = fenceMarker
      } else if (currentFenceMarker === fenceMarker) {
        inFencedCodeBlock = false
        currentFenceMarker = null
      }

      continue
    }

    if (inFencedCodeBlock) {
      continue
    }

    const match = /^(#{1,3})\s+(.+?)\s*$/.exec(trimmedLine)
    if (!match) {
      continue
    }

    const level = match[1].length
    const text = cleanHeadingText(match[2])
    if (!text) {
      continue
    }

    const baseSlug = generateBaseSlug(text)
    const currentCount = slugCount.get(baseSlug) ?? 0
    slugCount.set(baseSlug, currentCount + 1)
    order += 1

    const uniqueSlug = currentCount === 0 ? baseSlug : `${baseSlug}-${currentCount + 1}`

    headings.push({
      id: `heading-${order}-${uniqueSlug}`,
      text,
      level,
    })
  }

  return headings
}
