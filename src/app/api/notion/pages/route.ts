import { NextResponse } from 'next/server'
import { requireAuth, isAuthenticated } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { decrypt } from '@/lib/encrypt'
import { Client } from '@notionhq/client'

interface NotionPageResult {
  id: string
  name: string
  type: 'database' | 'page'
  icon?: string | null
  properties?: string[]
}

export async function GET() {
  const auth = await requireAuth()
  if (!isAuthenticated(auth)) return auth

  try {
    // Get user's encrypted Notion token
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const notionToken = decrypt(user.notionToken)
    const notion = new Client({ auth: notionToken })

    // Search for all pages and databases the integration can access
    const searchResponse = await notion.search({
      filter: { property: 'object', value: 'page' },
      page_size: 50,
    })

    const dbSearchResponse = await notion.search({
      filter: { property: 'object', value: 'database' },
      page_size: 50,
    })

    const results: NotionPageResult[] = []

    // Process databases
    for (const item of dbSearchResponse.results) {
      if (item.object === 'database') {
        const db = item as Record<string, unknown>
        const titleArray = (db.title as Array<{ plain_text: string }>) || []
        const name = titleArray.map((t) => t.plain_text).join('') || 'Untitled'
        const icon = getIcon(db.icon as Record<string, unknown> | null)

        // Get property names
        const properties = db.properties as Record<string, { type: string; name: string }> | undefined
        const propNames = properties
          ? Object.values(properties).map((p) => p.name)
          : []

        results.push({
          id: item.id,
          name,
          type: 'database',
          icon,
          properties: propNames,
        })
      }
    }

    // Process pages (only top-level pages, not database entries)
    for (const item of searchResponse.results) {
      if (item.object === 'page') {
        const page = item as Record<string, unknown>
        const parent = page.parent as Record<string, unknown> | undefined

        // Skip pages that are inside a database (they are entries, not destinations)
        if (parent && parent.type === 'database_id') continue

        const properties = page.properties as Record<string, unknown> | undefined
        const titleProp = properties
          ? Object.values(properties).find(
              (p: unknown) => (p as Record<string, unknown>).type === 'title'
            )
          : null

        let name = 'Untitled'
        if (titleProp) {
          const titleArray = (titleProp as Record<string, unknown>).title as
            | Array<{ plain_text: string }>
            | undefined
          if (titleArray && titleArray.length > 0) {
            name = titleArray.map((t) => t.plain_text).join('')
          }
        }

        const icon = getIcon(page.icon as Record<string, unknown> | null)

        results.push({
          id: item.id,
          name,
          type: 'page',
          icon,
        })
      }
    }

    return NextResponse.json({ pages: results })
  } catch (err) {
    console.error('Error fetching Notion pages:', err)
    return NextResponse.json(
      { error: 'Failed to fetch Notion pages' },
      { status: 500 }
    )
  }
}

function getIcon(icon: Record<string, unknown> | null): string | null {
  if (!icon) return null
  if (icon.type === 'emoji') return icon.emoji as string
  if (icon.type === 'external') return (icon.external as Record<string, string>)?.url || null
  if (icon.type === 'file') return (icon.file as Record<string, string>)?.url || null
  return null
}
