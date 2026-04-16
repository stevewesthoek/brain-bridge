import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateApiKey } from '@/lib/api-key'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const userId = await validateApiKey(request.headers.get('authorization'))
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name } = await request.json()
    if (!name) {
      return NextResponse.json({ error: 'Device name required' }, { status: 400 })
    }

    const deviceToken = crypto.randomBytes(32).toString('hex')

    const device = await prisma.device.create({
      data: {
        userId,
        name,
        deviceToken,
        status: 'offline'
      }
    })

    return NextResponse.json({
      userId: device.userId,
      deviceId: device.id,
      deviceToken: device.deviceToken
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
