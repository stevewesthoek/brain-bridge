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
      try {
        const sourceFiles = globSync(patterns, {
          cwd: source.path,
          ignore: ignorePatterns,
          absolute: false
        })

        for (const filePath of sourceFiles) {
          try {
            const fullPath = path.join(source.path, filePath)
            const stat = fs.statSync(fullPath)
            const content = fs.readFileSync(fullPath, 'utf-8')

            let title = path.basename(filePath, path.extname(filePath))
            let tags: string[] = []

            if (filePath.endsWith('.md')) {
              const { data } = matter(content)
              title = data.title || title
              tags = data.tags || []
            }

            const doc: IndexedDoc = {
              sourceId: source.id,
              id: `${source.id}:${filePath}`,
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
            console.warn(`Failed to index ${filePath} from ${source.id}:`, err)
          }
        }
      } catch (err) {
        console.warn(`Failed to index source ${source.id}:`, err)
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
