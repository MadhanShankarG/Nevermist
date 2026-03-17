import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // TODO: Push notification subscribe + send
  return NextResponse.json({ message: 'Not implemented' }, { status: 501 })
}
