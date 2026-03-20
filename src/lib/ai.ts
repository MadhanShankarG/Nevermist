import Anthropic from '@anthropic-ai/sdk'
import { readFileSync } from 'fs'
import { join } from 'path'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const SYSTEM_PROMPT_TEMPLATE = readFileSync(
  join(process.cwd(), 'nevermist-system-prompt.txt'),
  'utf-8'
)

interface PageInput {
  name: string
  type: 'database' | 'page'
  properties?: string[]
}

interface PageDescription {
  name: string
  description: string
}

/**
 * Generates 1-sentence routing descriptions for each Notion page.
 * Single Claude API call — sends all pages at once.
 */
export async function generatePageDescriptions(
  pages: PageInput[]
): Promise<PageDescription[]> {
  const pageList = pages
    .map((p, i) => {
      const props = p.properties?.length
        ? ` [Properties: ${p.properties.join(', ')}]`
        : ''
      return `${i + 1}. "${p.name}" (${p.type})${props}`
    })
    .join('\n')

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: `You generate 1-sentence descriptions for Notion pages. These descriptions help an AI route tasks to the right page.

Rules:
- Each description should be a short phrase describing what kind of tasks/content belong there
- Use the page name and property list to infer the purpose
- Format: "Category — what goes here"
- Examples:
  - "Sprint Planning" with properties [Sprint, Story Points, Assignee] → "Work tasks — sprint items, deliverables, and team assignments"
  - "Groceries" → "Shopping — grocery and household items to buy"
  - "Reading List" → "Reading — articles, books, and links to read later"
  - "Personal" → "Personal — general personal tasks, errands, and reminders"

Return valid JSON only. No markdown. No explanation.
Return format: [{ "name": "page name", "description": "generated description" }]`,
    messages: [
      {
        role: 'user',
        content: `Generate routing descriptions for these Notion pages:\n\n${pageList}`,
      },
    ],
  })

  try {
    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    const parsed = JSON.parse(content.text) as PageDescription[]
    return parsed
  } catch (err) {
    console.error('Failed to parse AI descriptions:', err)
    return pages.map((p) => ({
      name: p.name,
      description: `${p.name} — items and tasks`,
    }))
  }
}

/**
 * Builds the system prompt for the capture endpoint.
 * Reads nevermist-system-prompt.txt as the base template.
 * Injects user's pages, current datetime, and textPolish setting.
 */
export function buildSystemPrompt(
  pages: Array<{ notionPageId: string; name: string; description: string }>,
  currentDatetime: string,
  textPolish: boolean
): string {
  const pageList = pages
    .map((p, i) => `${i + 1}. "${p.name}" (ID: ${p.notionPageId}) — ${p.description}`)
    .join('\n')

  let prompt = SYSTEM_PROMPT_TEMPLATE
    .replace('{{PAGE_LIST}}', pageList)
    .replace('{{CURRENT_DATETIME}}', currentDatetime)

  if (!textPolish) {
    prompt += '\n\nReturn the raw input unchanged as cleanedTask — do not rephrase.'
  }

  return prompt
}

/**
 * Calls Claude with the given system prompt and user message.
 * For text/voice: userMessage is a plain string.
 * For photo: userMessage is an array with image + text content blocks.
 */
export async function callClaude(
  systemPrompt: string,
  userMessage: Anthropic.MessageParam['content'],
  options?: { timeout?: number }
): Promise<string> {
  const message = await anthropic.messages.create(
    {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    },
    options?.timeout ? { timeout: options.timeout } : undefined
  )

  const block = message.content[0]
  if (block.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  return block.text
}

/**
 * Fetches URL metadata (title + description) server-side.
 * 3-second timeout. Falls back to domain name if fetch fails.
 */
export async function fetchUrlMeta(url: string): Promise<{ title: string; description: string }> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 3000)

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Nevermist/1.0' },
    })

    const html = await res.text()
    const head = html.slice(0, 10000)

    const titleMatch = head.match(/<title[^>]*>([^<]*)<\/title>/i)
    const descMatch =
      head.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
      head.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i)

    const title = titleMatch?.[1]?.trim() || new URL(url).hostname
    const description = descMatch?.[1]?.trim() || ''

    return { title, description }
  } catch {
    try {
      return { title: new URL(url).hostname, description: '' }
    } catch {
      return { title: url, description: '' }
    }
  } finally {
    clearTimeout(timeout)
  }
}
