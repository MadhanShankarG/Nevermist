import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // TODO: Check session authentication, return user config
  return NextResponse.json({ message: 'Not implemented' }, { status: 501 })
}
