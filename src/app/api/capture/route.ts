import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // TODO: Main AI capture endpoint — calls Claude, returns structured JSON
  return NextResponse.json({ message: 'Not implemented' }, { status: 501 })
}
