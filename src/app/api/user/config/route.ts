import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAuthenticated } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const auth = await requireAuth()
  if (!isAuthenticated(auth)) return auth

  const pages = await prisma.pageConfig.findMany({
    where: { userId: auth.userId },
    orderBy: { sortOrder: 'asc' },
  })

  return NextResponse.json({ pages })
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth()
  if (!isAuthenticated(auth)) return auth

  try {
    const body = await request.json()
    const { pages } = body

    if (!pages || !Array.isArray(pages)) {
      return NextResponse.json(
        { error: 'pages array is required' },
        { status: 400 }
      )
    }

    // Enforce max 6 pages
    if (pages.length > 6) {
      return NextResponse.json(
        { error: 'Maximum 6 pages allowed' },
        { status: 400 }
      )
    }

    // Delete existing page configs for this user (full replace on onboarding)
    await prisma.pageConfig.deleteMany({
      where: { userId: auth.userId },
    })

    // Create new page configs
    const created = await prisma.pageConfig.createMany({
      data: pages.map(
        (
          page: {
            notionPageId: string
            name: string
            description: string
            isDatabase?: boolean
            databaseProps?: string | null
            sortOrder?: number
          },
          index: number
        ) => ({
          userId: auth.userId,
          notionPageId: page.notionPageId,
          name: page.name,
          description: page.description,
          isDatabase: page.isDatabase ?? false,
          databaseProps: page.databaseProps ?? null,
          sortOrder: page.sortOrder ?? index,
        })
      ),
    })

    return NextResponse.json({ success: true, count: created.count })
  } catch (err) {
    console.error('Error saving config:', err)
    return NextResponse.json(
      { error: 'Failed to save config' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth()
  if (!isAuthenticated(auth)) return auth

  try {
    const body = await request.json()
    const { pages, textPolish, nudgeTime } = body

    // Update user settings if provided
    if (textPolish !== undefined || nudgeTime !== undefined) {
      await prisma.user.update({
        where: { id: auth.userId },
        data: {
          ...(textPolish !== undefined && { textPolish }),
          ...(nudgeTime !== undefined && { nudgeTime }),
        },
      })
    }

    // Update page configs if provided
    if (pages && Array.isArray(pages)) {
      for (const page of pages) {
        await prisma.pageConfig.upsert({
          where: { id: page.id || '' },
          update: {
            name: page.name,
            description: page.description,
            sortOrder: page.sortOrder ?? 0,
            isDatabase: page.isDatabase ?? false,
            databaseProps: page.databaseProps ?? null,
          },
          create: {
            userId: auth.userId,
            notionPageId: page.notionPageId,
            name: page.name,
            description: page.description,
            sortOrder: page.sortOrder ?? 0,
            isDatabase: page.isDatabase ?? false,
            databaseProps: page.databaseProps ?? null,
          },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error updating config:', err)
    return NextResponse.json(
      { error: 'Failed to update config' },
      { status: 500 }
    )
  }
}
