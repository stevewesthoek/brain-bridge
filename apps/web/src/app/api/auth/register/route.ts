import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const user = await createUser(email)
    return NextResponse.json(user)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
