import { NextRequest, NextResponse } from 'next/server'
import { checkActionAuth } from '@/lib/actionAuth'
import { executeAction, ActionTransportError } from '@/lib/actions/transport'

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

    const data = await executeAction('/api/create', { path, content })
    const dataObj = data as Record<string, unknown>
    return NextResponse.json({
      path,
      status: 'created',
      ...dataObj
    })
  } catch (err) {
    if (err instanceof ActionTransportError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.statusCode }
      )
    }
    return NextResponse.json(
      { error: `Create error: ${String(err)}` },
      { status: 500 }
    )
  }
}
