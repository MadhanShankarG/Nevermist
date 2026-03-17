import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // TODO: Send confirmed task to Notion
  return NextResponse.json({ message: 'Not implemented' }, { status: 501 })
}
