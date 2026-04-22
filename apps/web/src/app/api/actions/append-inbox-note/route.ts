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
    const inboxSourceId = 'mind'
    const notePath = `${inboxSourceId}/01-inbox/${filename}`
    const frontmatter = `---\ncreated: ${new Date().toISOString()}\nsource: buildflow\ntype: note\n---\n\n`
    await executeAction('/api/create-inbox-note', {
      path: `01-inbox/${filename}`,
      sourceId: inboxSourceId,
      content: frontmatter + content
    })
    return NextResponse.json({
      path: notePath,
      status: 'created'
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
