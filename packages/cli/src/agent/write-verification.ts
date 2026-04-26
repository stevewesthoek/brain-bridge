import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

export type VerifiedWriteResult = {
  verified: true
  verifiedAt: string
  bytesOnDisk: number
  contentHash: string
  contentPreview: string
}

export function normalizeArtifactSlug(input: string): string {
  const trimmed = input.trim()
  const withoutExtensions = trimmed.replace(/(\.md)+$/i, '')
  const withoutTrailingDots = withoutExtensions.replace(/[.]+$/g, '')
  const slug = withoutTrailingDots
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'artifact'
}

export function buildArtifactFilename(title: string, providedFilename?: string): string {
  const slugBase = normalizeArtifactSlug(providedFilename || title)
  return `${slugBase}.md`
}

export function verifyWrittenFile(params: {
  fullPath: string
  expectedContent?: string
  expectedContains?: string[]
  expectedNotContains?: string[]
}): VerifiedWriteResult {
  const { fullPath, expectedContent, expectedContains = [], expectedNotContains = [] } = params

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Write verification failed: file not found at ${fullPath}`)
  }

  const stat = fs.statSync(fullPath)
  if (!stat.isFile()) {
    throw new Error(`Write verification failed: not a file at ${fullPath}`)
  }

  const content = fs.readFileSync(fullPath, 'utf8')
  const bytesOnDisk = Buffer.byteLength(content, 'utf8')

  if (typeof expectedContent === 'string' && content !== expectedContent) {
    throw new Error('Write verification failed: content mismatch')
  }

  for (const expected of expectedContains) {
    if (!content.includes(expected)) {
      throw new Error(`Write verification failed: missing expected content "${expected}"`)
    }
  }

  for (const forbidden of expectedNotContains) {
    if (content.includes(forbidden)) {
      throw new Error(`Write verification failed: unexpected residual content "${forbidden}"`)
    }
  }

  return {
    verified: true,
    verifiedAt: new Date().toISOString(),
    bytesOnDisk,
    contentHash: crypto.createHash('sha256').update(content, 'utf8').digest('hex'),
    contentPreview: content.slice(0, 200)
  }
}

export function relativeWritePath(root: string, fullPath: string): string {
  return path.relative(root, fullPath).replace(/\\/g, '/')
}
