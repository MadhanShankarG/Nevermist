import { NextRequest, NextResponse } from 'next/server'
import { encrypt } from '@/lib/encrypt'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  // Handle user denying access or other errors
  if (error || !code) {
    const errorMsg = error || 'missing_code'
    return NextResponse.redirect(new URL(`/?error=${errorMsg}`, request.url))
  }

  try {
    const clientId = process.env.NOTION_CLIENT_ID!
    const clientSecret = process.env.NOTION_CLIENT_SECRET!
    const redirectUri = process.env.NOTION_REDIRECT_URI!

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Notion token exchange failed:', errorData)
      return NextResponse.redirect(new URL('/?error=auth_failed', request.url))
    }

    const tokenData = await tokenResponse.json()

    const {
      access_token,
      workspace_id,
      workspace_name,
    } = tokenData

    if (!access_token || !workspace_id) {
      console.error('Missing access_token or workspace_id in response')
      return NextResponse.redirect(new URL('/?error=auth_failed', request.url))
    }

    // Encrypt the access token before storing
    const encryptedToken = encrypt(access_token)

    // Upsert user — match on notionWorkspaceId
    const user = await prisma.user.upsert({
      where: { notionWorkspaceId: workspace_id },
      update: {
        notionToken: encryptedToken,
        notionWorkspaceName: workspace_name || 'My Workspace',
      },
      create: {
        notionToken: encryptedToken,
        notionWorkspaceId: workspace_id,
        notionWorkspaceName: workspace_name || 'My Workspace',
      },
    })

    // Create session
    const session = await getSession()
    session.userId = user.id
    session.isAuthenticated = true
    await session.save()

    // Redirect existing users home, new users to onboarding
    const existingPages = await prisma.pageConfig.count({
      where: { userId: user.id },
    })
    const destination = existingPages > 0 ? '/' : '/onboarding'
    return NextResponse.redirect(new URL(destination, request.url))
  } catch (err) {
    console.error('OAuth callback error:', err)
    return NextResponse.redirect(new URL('/?error=auth_failed', request.url))
  }
}
