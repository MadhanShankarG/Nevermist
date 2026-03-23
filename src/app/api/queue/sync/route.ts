import { NextRequest, NextResponse } from 'next/server'
import { Client, APIResponseError } from '@notionhq/client'
import { requireAuth, isAuthenticated } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { decrypt } from '@/lib/encrypt'
import { sendSingleTask } from '@/lib/notion-send'
import type { QueueItem } from '@/types/queue'

export async function POST(request: NextRequest) {
  const auth = await requireAuth()
  if (!isAuthenticated(auth)) {
    return NextResponse.json(
      { error: 'Unauthorized', retryable: false },
      { status: 401 },
    )
  }

  try {
    const item = (await request.json()) as QueueItem

    if (!item.cleanedTask || !item.destinationPageId) {
      return NextResponse.json(
        { error: 'Missing task data', retryable: false },
        { status: 400 },
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { notionToken: true },
    })

    if (!user?.notionToken) {
      return NextResponse.json(
        { error: 'Notion token not found', retryable: false },
        { status: 401 },
      )
    }

    const token = decrypt(user.notionToken)
    const notion = new Client({ auth: token })

    const pageConfig = await prisma.pageConfig.findFirst({
      where: { userId: auth.userId, notionPageId: item.destinationPageId },
      select: { isDatabase: true, databaseProps: true },
    })

    if (!pageConfig) {
      return NextResponse.json(
        { error: 'Destination page not found', retryable: false },
        { status: 404 },
      )
    }

    await sendSingleTask(
      notion,
      {
        cleanedTask: item.cleanedTask,
        destinationPageId: item.destinationPageId,
        priority: item.priority,
        dueDate: item.dueDate,
        isUrl: item.isUrl ?? false,
        sourceUrl: item.sourceUrl ?? null,
      },
      pageConfig,
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof APIResponseError) {
      const status = err.status

      if (status === 401) {
        return NextResponse.json(
          { error: 'Notion token expired', retryable: false },
          { status: 401 },
        )
      }

      if (status === 404) {
        return NextResponse.json(
          { error: 'Notion page not found', retryable: false },
          { status: 404 },
        )
      }

      if (status === 429) {
        return NextResponse.json(
          { error: 'Notion rate limit', retryable: true },
          { status: 429 },
        )
      }
    }

    console.error('Queue sync error:', err)
    return NextResponse.json(
      { error: 'Internal error', retryable: true },
      { status: 500 },
    )
  }
}
