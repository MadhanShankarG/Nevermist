import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // TODO: Fetch user's accessible Notion pages for onboarding
  return NextResponse.json({ message: 'Not implemented' }, { status: 501 })
}
