import { NextResponse } from 'next/server'

export async function GET() {
  const clientId = process.env.NOTION_CLIENT_ID
  const redirectUri = process.env.NOTION_REDIRECT_URI

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: 'Notion OAuth is not configured' },
      { status: 500 }
    )
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    owner: 'user',
  })

  const notionAuthUrl = `https://api.notion.com/v1/oauth/authorize?${params.toString()}`

  return NextResponse.redirect(notionAuthUrl)
}
