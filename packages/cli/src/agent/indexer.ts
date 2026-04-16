import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { globSync } from 'fast-glob'
import { getVaultPath } from './config'
import { getIndexPath } from '../utils/paths'
import { IndexedDoc } from '@brainbridge/shared'

export class Indexer {
  private vaultPath: string
  private docs: IndexedDoc[] = []

  constructor() {
    this.vaultPath = getVaultPath()
    this.loadFromDisk()
  }

  async buildIndex(): Promise<void> {
    this.docs = []
    const vaultPath = this.vaultPath

    const patterns = ['**/*.md', '**/*.txt']
    const ignorePatterns = ['.git/**', '.obsidian/**', 'node_modules/**', '.*/**']

    const files = globSync(patterns, {
      cwd: vaultPath,
      ignore: ignorePatterns,
      absolute: false
    })

    for (const filePath of files) {
      try {
        const fullPath = path.join(vaultPath, filePath)
        const stat = fs.statSync(fullPath)
        const content = fs.readFileSync(fullPath, 'utf-8')

        let title = path.basename(filePath, path.extname(filePath))
        let tags: string[] = []

        // Extract frontmatter if present
        if (filePath.endsWith('.md')) {
          const { data } = matter(content)
          title = data.title || title
          tags = data.tags || []
        }

        const doc: IndexedDoc = {
          id: filePath,
          path: filePath,
          title,
          extension: path.extname(filePath),
          modifiedAt: stat.mtime.toISOString(),
          size: stat.size,
          tags,
          contentPreview: content.slice(0, 200),
          content
        }

        this.docs.push(doc)
      } catch (err) {
        console.warn(`Failed to index ${filePath}:`, err)
      }
    }

    this.saveToDisk()
  }

  private saveToDisk(): void {
    try {
      const indexPath = getIndexPath()
      const dir = path.dirname(indexPath)

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      fs.writeFileSync(indexPath, JSON.stringify(this.docs, null, 2))
    } catch (err) {
      console.warn('Failed to save index:', err)
    }
  }

  private loadFromDisk(): void {
    try {
      const indexPath = getIndexPath()
      if (fs.existsSync(indexPath)) {
        const content = fs.readFileSync(indexPath, 'utf-8')
        this.docs = JSON.parse(content)
      }
    } catch (err) {
      console.warn('Failed to load index:', err)
    }
  }

  getDocs(): IndexedDoc[] {
    return this.docs
  }
}
