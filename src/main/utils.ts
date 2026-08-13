import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Determines the MIME type based on the file extension.
 */
export function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.png':
      return 'image/png'
    case '.webp':
      return 'image/webp'
    case '.svg':
      return 'image/svg+xml'
    default:
      return 'application/octet-stream'
  }
}

/**
 * Resolves the path to the preload script.
 */
export function getPreloadPath(): string {
  const mjsPreload = path.join(__dirname, '../preload/index.mjs')
  const jsPreload = path.join(__dirname, '../preload/index.js')
  return fs.existsSync(mjsPreload) ? mjsPreload : jsPreload
}
