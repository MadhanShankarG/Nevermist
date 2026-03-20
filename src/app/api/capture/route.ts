import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAuthenticated } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { buildSystemPrompt, callClaude, fetchUrlMeta } from '@/lib/ai'
import type { CaptureResult } from '@/types/capture'

const URL_PATTERN = /^https?:\/\/\S+|^www\.\S+/i

const REQUIRED_FIELDS: (keyof CaptureResult)[] = [
  'cleanedTask',
  'destinationPageId',
  'destinationName',
  'priority',
  'dueDate',
  'isRecurring',
  'recurringPattern',
  'isUrl',
  'sourceUrl',
]

function validateCaptureResult(obj: unknown): obj is CaptureResult {
  if (!obj || typeof obj !== 'object') return false
  const record = obj as Record<string, unknown>
  return REQUIRED_FIELDS.every((field) => field in record)
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth()
  if (!isAuthenticated(auth)) return auth

  try {
    const body = await request.json()
    let { inputMode } = body as { inputMode?: string }
    const { inputValue, imageData } = body as {
      inputValue?: string
      imageData?: string | null
    }

    if (!inputValue && !imageData) {
      return NextResponse.json(
        { error: 'inputValue or imageData is required' },
        { status: 400 }
      )
    }

    // Detect URL in text input
    let urlMeta: { title: string; description: string } | null = null
    if (inputValue && URL_PATTERN.test(inputValue.trim())) {
      inputMode = 'url'
      try {
        urlMeta = await fetchUrlMeta(inputValue.trim())
      } catch (err) {
        console.error('URL meta fetch failed:', err)
      }
    }

    const pages = await prisma.pageConfig.findMany({
      where: { userId: auth.userId },
      orderBy: { sortOrder: 'asc' },
    })

    if (pages.length === 0) {
      return NextResponse.json(
        { error: 'No Notion pages configured. Complete onboarding first.' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { textPolish: true },
    })

    const textPolish = user?.textPolish ?? true
    const currentDatetime = new Date().toISOString()

    const systemPrompt = buildSystemPrompt(
      pages.map((p) => ({
        notionPageId: p.notionPageId,
        name: p.name,
        description: p.description,
      })),
      currentDatetime,
      textPolish
    )

    let userMessage: Parameters<typeof callClaude>[1]

    if (inputMode === 'photo' && imageData) {
      userMessage = [
        {
          type: 'image' as const,
          source: {
            type: 'base64' as const,
            media_type: 'image/jpeg' as const,
            data: imageData,
          },
        },
        {
          type: 'text' as const,
          text: 'Extract all tasks from this image.',
        },
      ]
    } else if (inputMode === 'url' && urlMeta) {
      userMessage = `${inputValue}\n\nPage title: ${urlMeta.title}\nMeta: ${urlMeta.description}`
    } else {
      userMessage = inputValue || ''
    }

    let rawResponse: string
    try {
      rawResponse = await callClaude(systemPrompt, userMessage, { timeout: 10000 })
    } catch (err) {
      if (
        err instanceof Error &&
        (err.name === 'APIConnectionTimeoutError' || err.message.includes('timed out'))
      ) {
        return NextResponse.json(
          { error: 'AI request timed out' },
          { status: 504 }
        )
      }
      throw err
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(rawResponse)
    } catch {
      console.error('Claude returned non-JSON:', rawResponse.slice(0, 500))
      return NextResponse.json(
        { error: 'AI response was not valid JSON' },
        { status: 500 }
      )
    }

    if (inputMode === 'photo') {
      if (!Array.isArray(parsed)) {
        console.error('Photo mode expected array, got:', typeof parsed)
        return NextResponse.json(
          { error: 'AI response for photo must be an array' },
          { status: 500 }
        )
      }

      for (const item of parsed) {
        if (!validateCaptureResult(item)) {
          console.error('Photo task missing required fields:', item)
          return NextResponse.json(
            { error: 'AI response missing required fields in photo task' },
            { status: 500 }
          )
        }
      }

      return NextResponse.json({ tasks: parsed as CaptureResult[] })
    }

    if (!validateCaptureResult(parsed)) {
      console.error('Response missing required fields:', parsed)
      return NextResponse.json(
        { error: 'AI response missing required fields' },
        { status: 500 }
      )
    }

    return NextResponse.json(parsed as CaptureResult)
  } catch (err) {
    console.error('Capture endpoint error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
