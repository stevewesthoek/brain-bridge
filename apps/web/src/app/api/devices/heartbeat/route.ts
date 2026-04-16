import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { deviceId } = await request.json()

    if (!deviceId) {
      return NextResponse.json({ error: 'Device ID required' }, { status: 400 })
    }

    const device = await prisma.device.update({
      where: { id: deviceId },
      data: {
        status: 'online',
        lastSeenAt: new Date()
      }
    })

    return NextResponse.json({ status: 'ok' })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
