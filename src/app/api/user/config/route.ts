import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // TODO: Return user's PageConfig entries
  return NextResponse.json({ message: 'Not implemented' }, { status: 501 })
}

export async function PUT(request: NextRequest) {
  // TODO: Update PageConfig (descriptions, order, polish setting)
  return NextResponse.json({ message: 'Not implemented' }, { status: 501 })
}
