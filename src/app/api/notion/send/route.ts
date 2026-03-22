import { NextRequest, NextResponse } from 'next/server'
import { Client, APIResponseError } from '@notionhq/client'
import { requireAuth, isAuthenticated } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { decrypt } from '@/lib/encrypt'

interface SendBody {
  cleanedTask: string
  destinationPageId: string
  priority: 'P1' | 'P2' | 'P3'
  dueDate: string | null
  isRecurring: boolean
  recurringPattern: string | null
  isUrl: boolean
  sourceUrl: string | null
  // Photo mode: array of tasks to batch-send
  tasks?: Array<{
    cleanedTask: string
    destinationPageId: string
    priority: 'P1' | 'P2' | 'P3'
    dueDate: string | null
  }>
}

function formatDueDateDisplay(dueDate: string): string {
  const d = new Date(dueDate + 'T00:00:00')
  const currentYear = new Date().getFullYear()
  const opts: Intl.DateTimeFormatOptions =
    d.getFullYear() === currentYear
      ? { month: 'short', day: 'numeric' }
      : { month: 'short', day: 'numeric', year: 'numeric' }
  return d.toLocaleDateString('en-US', opts)
}

async function sendSingleTask(
  notion: Client,
  task: {
    cleanedTask: string
    destinationPageId: string
    priority: 'P1' | 'P2' | 'P3'
    dueDate: string | null
    isUrl?: boolean
    sourceUrl?: string | null
  },
  pageConfig: { isDatabase: boolean; databaseProps: string | null }
): Promise<string | null> {
  if (pageConfig.isDatabase) {
    // Parse stored property mapping
    let props: Record<string, string> = {}
    if (pageConfig.databaseProps) {
      try {
        props = JSON.parse(pageConfig.databaseProps) as Record<string, string>
      } catch {
        // fall through with empty props — use defaults below
      }
    }

    // Fetch the live database schema — resolves title property name and
    // guards against setting properties that don't exist in this database.
    const dbSchema = await notion.databases.retrieve({
      database_id: task.destinationPageId,
    })
    const schemaProps = dbSchema.properties

    const titleProp =
      Object.entries(schemaProps).find(([, prop]) => prop.type === 'title')?.[0] ??
      props.titlePropName ??
      'Name'

    // Priority: custom prop name from config, or fall back to "Priority"
    const priorityPropName = props.priorityPropName ?? 'Priority'
    // Due date: custom prop name from config, or fall back to "Due Date"
    const dueDatePropName = props.dueDatePropName ?? 'Due Date'

    // Only set a property if it actually exists in the schema — prevents
    // validation errors on databases with non-standard schemas.
    const hasPriorityProp = priorityPropName in schemaProps
    const hasDueDateProp = dueDatePropName in schemaProps

    // Map internal codes to the option names used in the Nevermist Captures template
    const priorityOptionName =
      task.priority === 'P1'
        ? 'P1 — Urgent'
        : task.priority === 'P2'
          ? 'P2 — Important'
          : 'P3 — Someday'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const properties: Record<string, any> = {
      [titleProp]: {
        title: [{ text: { content: task.cleanedTask } }],
      },
    }

    if (hasPriorityProp) {
      properties[priorityPropName] = { select: { name: priorityOptionName } }
    }

    if (hasDueDateProp && task.dueDate) {
      properties[dueDatePropName] = { date: { start: task.dueDate } }
    }

    if (task.isUrl && task.sourceUrl && 'URL' in schemaProps) {
      properties['URL'] = { url: task.sourceUrl }
    }

    const response = await notion.pages.create({
      parent: { database_id: task.destinationPageId },
      properties,
    })

    return 'url' in response ? response.url : null
  } else {
    // Plain page — to_do block with a nested paragraph for metadata
    const priorityColor =
      task.priority === 'P1' ? 'red' : task.priority === 'P2' ? 'orange' : 'gray'

    // Build the metadata rich_text array
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const metaRichText: any[] = [
      {
        type: 'text',
        text: { content: task.priority },
        annotations: { color: priorityColor, bold: false },
      },
    ]

    if (task.dueDate) {
      metaRichText.push(
        { type: 'text', text: { content: '  ·  ' } },
        {
          type: 'text',
          text: { content: `Due ${formatDueDateDisplay(task.dueDate)}` },
          annotations: { color: 'gray' },
        }
      )
    }

    const recurringPattern = (task as { recurringPattern?: string | null }).recurringPattern
    const isRecurring = (task as { isRecurring?: boolean }).isRecurring
    if (isRecurring && recurringPattern) {
      metaRichText.push(
        { type: 'text', text: { content: '  ·  ' } },
        {
          type: 'text',
          text: { content: recurringPattern },
          annotations: { color: 'gray', italic: true },
        }
      )
    }

    await notion.blocks.children.append({
      block_id: task.destinationPageId,
      children: [
        {
          type: 'to_do',
          to_do: {
            rich_text: [{ type: 'text', text: { content: task.cleanedTask } }],
            checked: false,
            children: [
              {
                object: 'block',
                type: 'paragraph',
                paragraph: { rich_text: metaRichText },
              },
            ],
          },
        },
      ],
    })

    return `https://notion.so/${task.destinationPageId.replace(/-/g, '')}`
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth()
  if (!isAuthenticated(auth)) return auth

  try {
    const body = (await request.json()) as SendBody

    // Fetch user with encrypted token
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { notionToken: true },
    })

    if (!user?.notionToken) {
      return NextResponse.json({ error: 'Notion token not found' }, { status: 401 })
    }

    const token = decrypt(user.notionToken)
    const notion = new Client({ auth: token })

    // Photo mode — batch send multiple tasks
    if (body.tasks && body.tasks.length > 0) {
      const results: string[] = []

      for (const task of body.tasks) {
        const pageConfig = await prisma.pageConfig.findFirst({
          where: { userId: auth.userId, notionPageId: task.destinationPageId },
          select: { isDatabase: true, databaseProps: true },
        })

        if (!pageConfig) continue

        try {
          const url = await sendSingleTask(notion, { ...task, isUrl: false, sourceUrl: null }, pageConfig)
          if (url) results.push(url)
        } catch (taskErr) {
          console.error('Failed to send task in batch:', task.cleanedTask, taskErr)
        }
      }

      return NextResponse.json({ success: true, count: results.length })
    }

    // Single task send
    const pageConfig = await prisma.pageConfig.findFirst({
      where: { userId: auth.userId, notionPageId: body.destinationPageId },
      select: { isDatabase: true, databaseProps: true },
    })

    if (!pageConfig) {
      return NextResponse.json(
        { error: 'Destination page not found in your config' },
        { status: 404 }
      )
    }

    const notionUrl = await sendSingleTask(
      notion,
      {
        cleanedTask: body.cleanedTask,
        destinationPageId: body.destinationPageId,
        priority: body.priority,
        dueDate: body.dueDate,
        isUrl: body.isUrl,
        sourceUrl: body.sourceUrl,
      },
      pageConfig
    )

    return NextResponse.json({ success: true, notionUrl })
  } catch (err) {
    if (err instanceof APIResponseError) {
      const status = err.status

      if (status === 401) {
        return NextResponse.json(
          { error: 'Notion token expired — please reconnect' },
          { status: 401 }
        )
      }

      if (status === 404) {
        return NextResponse.json(
          { error: 'Notion page not found — it may have been deleted' },
          { status: 404 }
        )
      }

      if (status === 429) {
        return NextResponse.json(
          { error: 'Notion rate limit — please try again in a moment' },
          { status: 429 }
        )
      }
    }

    console.error('Notion send error:', err)
    return NextResponse.json({ error: 'Failed to send to Notion' }, { status: 500 })
  }
}
