import { NextRequest, NextResponse } from 'next/server'
import { checkActionAuth } from '@/lib/actionAuth'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function POST(request: NextRequest) {
  const authError = checkActionAuth(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const { title, content } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Missing title or content parameter' },
        { status: 400 }
      )
    }

    // Generate filename: timestamp + slugified title
    const timestamp = Date.now()
    const slug = slugify(title)
    const filename = `${timestamp}-${slug}.md`
    const path = `mind/01-inbox/${filename}`

    const localAgentUrl = process.env.LOCAL_AGENT_URL || 'http://127.0.0.1:3052'

    // Forward to local agent create endpoint with fixed inbox path
    const response = await fetch(`${localAgentUrl}/api/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, content })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.error || `Create failed: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      path,
      status: 'created',
      ...data
    })
  } catch (err) {
    return NextResponse.json(
      { error: `Create error: ${String(err)}` },
      { status: 500 }
    )
  }
}
