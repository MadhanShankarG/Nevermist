import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'
import { prisma } from '@/lib/prisma'
import { decrypt } from '@/lib/encrypt'

// ── Helpers ──────────────────────────────────────────────────────────────────

function toIcalDate(dateStr: string): string {
  return dateStr.replace(/-/g, '')
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

/**
 * Converts a Notion datetime string (ISO 8601 with offset, e.g. "2026-06-17T08:00:00+05:30")
 * to a UTC iCal datetime string (e.g. "20260617T023000Z").
 * JS Date correctly parses ISO 8601 with timezone offsets, so no manual arithmetic needed.
 */
function notionDateToUtcIcal(notionDateStr: string): string {
  const d = new Date(notionDateStr)
  const y = d.getUTCFullYear()
  const mo = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  const h = String(d.getUTCHours()).padStart(2, '0')
  const mi = String(d.getUTCMinutes()).padStart(2, '0')
  return `${y}${mo}${day}T${h}${mi}00Z`
}

/**
 * Adds `minutes` to a UTC iCal string ("20260617T023000Z") and returns the result.
 * Used to compute DTEND for timed events when Notion has no end time.
 */
function addMinutesToUtcIcal(utcIcal: string, minutes: number): string {
  // Parse back from "YYYYMMDDTHHmmssZ"
  const year = parseInt(utcIcal.slice(0, 4))
  const month = parseInt(utcIcal.slice(4, 6)) - 1
  const day = parseInt(utcIcal.slice(6, 8))
  const hour = parseInt(utcIcal.slice(9, 11))
  const min = parseInt(utcIcal.slice(11, 13))
  const d = new Date(Date.UTC(year, month, day, hour, min))
  d.setUTCMinutes(d.getUTCMinutes() + minutes)
  const y = d.getUTCFullYear()
  const mo = String(d.getUTCMonth() + 1).padStart(2, '0')
  const da = String(d.getUTCDate()).padStart(2, '0')
  const h = String(d.getUTCHours()).padStart(2, '0')
  const mi = String(d.getUTCMinutes()).padStart(2, '0')
  return `${y}${mo}${da}T${h}${mi}00Z`
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

  // Preserve the raw Notion string — it carries the offset (e.g. "+05:30")
  const rawStart: string = dateProp.date.start
  const rawEnd: string | null = dateProp.date.end ?? null
  const hasTime = rawStart.includes('T')

  // For all-day events we still need a plain date string
  const dueDate: string = hasTime ? rawStart.split('T')[0] : rawStart

  const notionPageId: string = page.id

  return { title, rawStart, rawEnd, dueDate, hasTime, notionPageId }
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

        if (data.hasTime) {
          // Timed event — convert raw Notion ISO string (with offset) to UTC
          const dtStart = notionDateToUtcIcal(data.rawStart)
          // Use Notion end time if present; otherwise default to +1 hour
          const dtEnd = data.rawEnd
            ? notionDateToUtcIcal(data.rawEnd)
            : addMinutesToUtcIcal(dtStart, 60)

          events.push(
            [
              'BEGIN:VEVENT',
              `UID:${uid}`,
              `DTSTAMP:${dtstamp}`,
              `DTSTART:${dtStart}`,
              `DTEND:${dtEnd}`,
              `SUMMARY:${summary}`,
              `URL:${notionUrl}`,
              'END:VEVENT',
            ].join('\r\n'),
          )
        } else {
          // All-day event — date-only values have no timezone issue
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