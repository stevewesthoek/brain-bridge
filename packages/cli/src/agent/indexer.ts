import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { globSync } from 'fast-glob'
import { getEnabledSources } from './config'
import { getIndexPath } from '../utils/paths'
import { IndexedDoc } from '@buildflow/shared'

export class Indexer {
  private docs: IndexedDoc[] = []

  constructor() {
    this.loadFromDisk()
  }

  async buildIndex(): Promise<void> {
    this.docs = []

    const sources = getEnabledSources()
    const patterns = ['**/*']
    const ignorePatterns = ['.git/**', '.obsidian/**', 'node_modules/**', '.*/**']

    for (const source of sources) {
      await this.buildIndexForSource(source.id, source.path, patterns, ignorePatterns)
    }

    this.saveToDisk()
  }

  async buildIndexForSource(sourceId: string, sourcePath?: string, patterns: string[] = ['**/*'], ignorePatterns: string[] = ['.git/**', '.obsidian/**', 'node_modules/**', '.*/**']): Promise<number> {
    const source = getEnabledSources().find(item => item.id === sourceId)
    if (!source && !sourcePath) {
      throw new Error(`Source not found or disabled: ${sourceId}`)
    }

    const rootPath = sourcePath || source?.path
    if (!rootPath) {
      throw new Error(`Source path missing for: ${sourceId}`)
    }

    const nextDocs = this.docs.filter(doc => doc.sourceId !== sourceId)

    let indexedFiles = 0
    try {
      const sourceFiles = globSync(patterns, {
        cwd: rootPath,
        ignore: ignorePatterns,
        absolute: false
      })

      for (const filePath of sourceFiles) {
        try {
          const fullPath = path.join(rootPath, filePath)
          const stat = fs.statSync(fullPath)
          if (!stat.isFile()) continue
          const content = fs.readFileSync(fullPath, 'utf-8')

          let title = path.basename(filePath, path.extname(filePath))
          let tags: string[] = []

          if (filePath.endsWith('.md')) {
            const { data } = matter(content)
            title = data.title || title
            tags = data.tags || []
          }

          const doc: IndexedDoc = {
            sourceId,
            id: `${sourceId}:${filePath}`,
            path: filePath,
            title,
            extension: path.extname(filePath),
            modifiedAt: stat.mtime.toISOString(),
            size: stat.size,
            tags,
            contentPreview: content.slice(0, 200),
            content
          }

          nextDocs.push(doc)
          indexedFiles++
        } catch (err) {
          console.warn(`Failed to index ${filePath} from ${sourceId}:`, err)
        }
      }
    } catch (err) {
      console.warn(`Failed to index source ${sourceId}:`, err)
      throw err
    }

    this.docs = nextDocs
    this.saveToDisk()
    return indexedFiles
  }

  removeSourceDocs(sourceId: string): number {
    const before = this.docs.length
    this.docs = this.docs.filter(doc => doc.sourceId !== sourceId)
    const removed = before - this.docs.length
    this.saveToDisk()
    return removed
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
