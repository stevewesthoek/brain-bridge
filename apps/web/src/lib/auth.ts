import { prisma } from './db'
import crypto from 'crypto'

export async function createUser(email: string): Promise<{ id: string; apiKey: string }> {
  const apiKey = crypto.randomBytes(32).toString('hex')

  const user = await prisma.user.create({
    data: {
      email,
      apiKey
    }
  })

  return {
    id: user.id,
    apiKey: user.apiKey
  }
}

export async function getUserByApiKey(apiKey: string) {
  return prisma.user.findUnique({
    where: { apiKey }
  })
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId }
  })
}
