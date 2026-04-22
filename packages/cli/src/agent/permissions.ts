import { ALLOWED_EXTENSIONS, IGNORE_PATTERNS } from '@buildflow/shared'

export function isPathAllowed(relativePath: string): boolean {
  // Block path traversal attempts
  if (relativePath.includes('..') || relativePath.startsWith('/')) {
    return false
  }

  // Block hidden files/folders
  const parts = relativePath.split('/')
  if (parts.some(part => part.startsWith('.'))) {
    return false
  }

  // Check ignore patterns
  for (const pattern of IGNORE_PATTERNS) {
    const normalized = pattern.replace('/**', '').replace('/**/', '/')
    if (relativePath.includes(normalized)) {
      return false
    }
  }

  return true
}

export function isExtensionAllowed(filePath: string): boolean {
  return ALLOWED_EXTENSIONS.some(ext => filePath.endsWith(ext))
}

export function validatePath(relativePath: string): { valid: boolean; error?: string } {
  if (!relativePath) {
    return { valid: false, error: 'Path cannot be empty' }
  }

  if (!isPathAllowed(relativePath)) {
    return { valid: false, error: 'Access denied. This file is outside the approved brain folder.' }
  }

  if (!isExtensionAllowed(relativePath)) {
    return { valid: false, error: 'Unsupported file type. MVP only supports .md and .txt files.' }
  }

  return { valid: true }
}
