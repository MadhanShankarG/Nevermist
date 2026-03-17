import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // TODO: Handle OAuth callback, exchange code for token, create session
  return NextResponse.json({ message: 'Not implemented' }, { status: 501 })
}
