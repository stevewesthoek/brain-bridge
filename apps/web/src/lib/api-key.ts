import { getUserByApiKey } from './auth'

export async function validateApiKey(authHeader: string | null): Promise<string | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const apiKey = authHeader.slice(7)
  const user = await getUserByApiKey(apiKey)

  return user?.id || null
}
