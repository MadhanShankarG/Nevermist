import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

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
    // Fallback: generate simple descriptions from names
    return pages.map((p) => ({
      name: p.name,
      description: `${p.name} — items and tasks`,
    }))
  }
}

/**
 * Builds the system prompt for the capture endpoint.
 * Dynamically includes user's page destinations with descriptions.
 */
export function buildSystemPrompt(
  pages: Array<{ notionPageId: string; name: string; description: string }>,
  currentDatetime: string,
  systemPromptTemplate: string
): string {
  const pageList = pages
    .map((p, i) => `${i + 1}. "${p.name}" (ID: ${p.notionPageId}) — ${p.description}`)
    .join('\n')

  return systemPromptTemplate
    .replace('{{PAGE_LIST}}', pageList)
    .replace('{{CURRENT_DATETIME}}', currentDatetime)
}
