import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // TODO: Initiate Notion OAuth redirect
  return NextResponse.json({ message: 'Not implemented' }, { status: 501 })
}
