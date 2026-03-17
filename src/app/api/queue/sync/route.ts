import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // TODO: Process offline queue items on reconnect
  return NextResponse.json({ message: 'Not implemented' }, { status: 501 })
}
