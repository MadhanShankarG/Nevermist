import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'
import { prisma } from '@/lib/prisma'
import { decrypt } from '@/lib/encrypt'

// ── Helpers ──────────────────────────────────────────────────────────────────

function toIcalDate(dateStr: string): string {
  // "2026-06-16" → "20260616"
  return dateStr.replace(/-/g, '')
}

function toIcalDateTime(dateStr: string, timeStr: string): string {
  // "2026-06-16" + "08:00" → "20260616T080000"
  return `${dateStr.replace(/-/g, '')}T${timeStr.replace(':', '')}00`
}

function addMinutes(dateStr: string, timeStr: string, minutes: number): string {
  const [h, m] = timeStr.split(':').map(Number)
  const total = h * 60 + m + minutes
  const endH = Math.floor(total / 60) % 24
  const endM = total % 60
  const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
  return toIcalDateTime(dateStr, endTime)
}

function stamp(): string {
  return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

function escapeIcal(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractPageData(page: any, dueDatePropName: string) {
  // Find title property
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const titleProp = Object.values(page.properties as Record<string, any>).find(
    (p: { type: string }) => p.type === 'title',
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const title: string = (titleProp as any)?.title?.map((t: any) => t.plain_text).join('') ?? 'Untitled'

  // Date property
  const dateProp = page.properties[dueDatePropName]
  if (!dateProp || dateProp.type !== 'date' || !dateProp.date?.start) return null

  const start: string = dateProp.date.start // "2026-06-16" or "2026-06-16T08:00:00.000+05:30"
  const hasTime = start.includes('T')

  let dueDate: string
  let dueTime: string | null = null

  if (hasTime) {
    const dt = new Date(start)
    const pad = (n: number) => String(n).padStart(2, '0')
    dueDate = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`
    dueTime = `${pad(dt.getHours())}:${pad(dt.getMinutes())}`
  } else {
    dueDate = start
  }

  const notionPageId: string = page.id

  return { title, dueDate, dueTime, notionPageId }
}

// ── Route ─────────────────────────────────────────────────────────────────────

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'token is required' }, { status: 400 })
  }

  // Auth: look up user by calendarToken — no session needed
  const user = await prisma.user.findUnique({
    where: { calendarToken: token },
    select: { id: true, notionToken: true },
  })

  if (!user?.notionToken) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const notionToken = decrypt(user.notionToken)
  const notion = new Client({ auth: notionToken })

  // Only database-type pages can be filtered/queried
  const databasePages = await prisma.pageConfig.findMany({
    where: { userId: user.id, isDatabase: true },
  })

  const events: string[] = []
  const dtstamp = stamp()

  for (const pageConfig of databasePages) {
    // Resolve Due Date prop name from databaseProps if customised
    let dueDatePropName = 'Due Date'
    if (pageConfig.databaseProps) {
      try {
        const props = JSON.parse(pageConfig.databaseProps) as Record<string, string>
        dueDatePropName = props.dueDatePropName ?? 'Due Date'
      } catch {
        // fall through
      }
    }

    try {
      const response = await notion.databases.query({
        database_id: pageConfig.notionPageId,
        filter: {
          property: dueDatePropName,
          date: { is_not_empty: true },
        },
        sorts: [{ property: dueDatePropName, direction: 'ascending' }],
        page_size: 100,
      })

      for (const page of response.results) {
        const data = extractPageData(page, dueDatePropName)
        if (!data) continue

        const uid = `${data.notionPageId.replace(/-/g, '')}@nevermist.app`
        const notionUrl = `https://notion.so/${data.notionPageId.replace(/-/g, '')}`
        const summary = escapeIcal(data.title)

        if (data.dueTime) {
          // Timed event — 1 hour block
          const dtStart = toIcalDateTime(data.dueDate, data.dueTime)
          const dtEnd = addMinutes(data.dueDate, data.dueTime, 60)
          events.push(
            [
              'BEGIN:VEVENT',
              `UID:${uid}`,
              `DTSTAMP:${dtstamp}`,
              `DTSTART;TZID=Asia/Kolkata:${dtStart}`,
              `DTEND;TZID=Asia/Kolkata:${dtEnd}`,
              `SUMMARY:${summary}`,
              `URL:${notionUrl}`,
              'END:VEVENT',
            ].join('\r\n'),
          )
        } else {
          // All-day event
          const dateVal = toIcalDate(data.dueDate)
          events.push(
            [
              'BEGIN:VEVENT',
              `UID:${uid}`,
              `DTSTAMP:${dtstamp}`,
              `DTSTART;VALUE=DATE:${dateVal}`,
              `DTEND;VALUE=DATE:${dateVal}`,
              `SUMMARY:${summary}`,
              `URL:${notionUrl}`,
              'END:VEVENT',
            ].join('\r\n'),
          )
        }
      }
    } catch (err) {
      console.error(`[calendar] Failed to query database ${pageConfig.notionPageId}:`, err)
      // Continue with other databases
    }
  }

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Nevermist//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Nevermist Tasks',
    'X-WR-TIMEZONE:Asia/Kolkata',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n')

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="nevermist.ics"',
      'Cache-Control': 'public, max-age=300',
    },
  })
}
