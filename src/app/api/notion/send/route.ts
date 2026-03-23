import { NextRequest, NextResponse } from 'next/server'
import { APIResponseError } from '@notionhq/client'
import { Client } from '@notionhq/client'
import { requireAuth, isAuthenticated } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { decrypt } from '@/lib/encrypt'
import { sendSingleTask } from '@/lib/notion-send'

interface SendBody {
  cleanedTask: string
  destinationPageId: string
  priority: 'P1' | 'P2' | 'P3'
  dueDate: string | null
  isRecurring: boolean
  recurringPattern: string | null
  isUrl: boolean
  sourceUrl: string | null
  tasks?: Array<{
    cleanedTask: string
    destinationPageId: string
    priority: 'P1' | 'P2' | 'P3'
    dueDate: string | null
  }>
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth()
  if (!isAuthenticated(auth)) return auth

  try {
    const body = (await request.json()) as SendBody

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
        { status: 404 },
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
      pageConfig,
    )

    return NextResponse.json({ success: true, notionUrl })
  } catch (err) {
    if (err instanceof APIResponseError) {
      const status = err.status

      if (status === 401) {
        return NextResponse.json(
          { error: 'Notion token expired — please reconnect' },
          { status: 401 },
        )
      }

      if (status === 404) {
        return NextResponse.json(
          { error: 'Notion page not found — it may have been deleted' },
          { status: 404 },
        )
      }

      if (status === 429) {
        return NextResponse.json(
          { error: 'Notion rate limit — please try again in a moment' },
          { status: 429 },
        )
      }
    }

    console.error('Notion send error:', err)
    return NextResponse.json({ error: 'Failed to send to Notion' }, { status: 500 })
  }
}
