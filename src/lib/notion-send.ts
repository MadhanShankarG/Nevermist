import { Client } from '@notionhq/client'

export interface SingleTaskPayload {
  cleanedTask: string
  destinationPageId: string
  priority: 'P1' | 'P2' | 'P3'
  dueDate: string | null
  dueTime: string | null        // "HH:MM" 24-hour or null
  duration: number              // minutes, 0 if no time
  isUrl?: boolean
  sourceUrl?: string | null
}

export interface PageConfigInfo {
  isDatabase: boolean
  databaseProps: string | null
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

/**
 * Compute end time string given a start time and duration in minutes.
 * Handles day overflow (e.g. 23:00 + 90min = 00:30 next day — capped at 23:59).
 */
function getEndTime(startTime: string, duration: number): string {
  const [hours, mins] = startTime.split(':').map(Number)
  const totalMins = hours * 60 + mins + duration
  const endHours = Math.floor(totalMins / 60) % 24
  const endMins = totalMins % 60
  return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`
}

export async function sendSingleTask(
  notion: Client,
  task: SingleTaskPayload,
  pageConfig: PageConfigInfo,
): Promise<string | null> {
  if (pageConfig.isDatabase) {
    let props: Record<string, string> = {}
    if (pageConfig.databaseProps) {
      try {
        props = JSON.parse(pageConfig.databaseProps) as Record<string, string>
      } catch {
        // fall through with empty props
      }
    }

    const dbSchema = await notion.databases.retrieve({
      database_id: task.destinationPageId,
    })
    const schemaProps = dbSchema.properties

    const titleProp =
      Object.entries(schemaProps).find(([, prop]) => prop.type === 'title')?.[0] ??
      props.titlePropName ??
      'Name'

    const priorityPropName = props.priorityPropName ?? 'Priority'
    const dueDatePropName = props.dueDatePropName ?? 'Due Date'

    const hasPriorityProp = priorityPropName in schemaProps
    const hasDueDateProp = dueDatePropName in schemaProps
    const hasStatusProp = 'Status' in schemaProps

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
      const dateValue = task.dueTime
        ? {
            start: `${task.dueDate}T${task.dueTime}:00`,
            end: `${task.dueDate}T${getEndTime(task.dueTime, task.duration || 60)}:00`,
            
          }
        : { start: task.dueDate }
      properties[dueDatePropName] = { date: dateValue }
    }

    if (hasStatusProp) {
      properties['Status'] = { select: { name: 'To Do' } }
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
    const priorityColor =
      task.priority === 'P1' ? 'red' : task.priority === 'P2' ? 'orange' : 'gray'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const metaRichText: any[] = [
      {
        type: 'text',
        text: { content: task.priority },
        annotations: { color: priorityColor, bold: false },
      },
    ]

    if (task.dueDate) {
      const timeLabel = task.dueTime
        ? ` at ${task.dueTime}${task.duration > 0 ? ` (${task.duration}m)` : ''}`
        : ''
      metaRichText.push(
        { type: 'text', text: { content: '  ·  ' } },
        {
          type: 'text',
          text: { content: `Due ${formatDueDateDisplay(task.dueDate)}${timeLabel}` },
          annotations: { color: 'gray' },
        },
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
        },
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
