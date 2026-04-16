import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/api-key'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const userId = await validateApiKey(request.headers.get('authorization'))
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get first online device for user
    const device = await prisma.device.findFirst({
      where: {
        userId,
        status: 'online'
      }
    })

    return NextResponse.json({
      online: !!device,
      deviceName: device?.name,
      vaultConnected: !!device
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
