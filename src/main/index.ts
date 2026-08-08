import { app, BrowserWindow, nativeTheme, Menu, protocol } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'
import { ThemePathResolver } from './engine/themes/resolver'
import { ThemeConfigManager } from './engine/themes/config'
import { PegasusEngine } from './engine'
import { registerIpcHandlers } from './ipc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'pegasus-asset',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
      bypassCSP: true,
    },
  },
])

let mainWindow: BrowserWindow | null = null

const engine = new PegasusEngine()

function createWindow(): void {
  const mjsPreload = path.join(__dirname, '../preload/index.mjs')
  const jsPreload = path.join(__dirname, '../preload/index.js')
  const preloadPath = fs.existsSync(mjsPreload) ? mjsPreload : jsPreload

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Pegasus Engine Theme',
    backgroundColor: '#090d16',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // Register IPC handlers
  registerIpcHandlers(engine)

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  // Helper to validate and prevent path traversal vulnerabilities
  async function validateSafePath(filePath: string): Promise<boolean> {
    try {
      const resolvedPath = path.resolve(filePath)

      const allowedDirs = [
        ThemePathResolver.getUserThemesDir(),
        path.join(os.homedir(), '.local', 'share', 'pegasus', 'wallpapers'),
      ]

      const bundledDir = ThemePathResolver.getBundledThemesDir()
      if (bundledDir) {
        allowedDirs.push(bundledDir)
      }

      // Check if there is an active external theme path
      try {
        const configManager = new ThemeConfigManager()
        const config = await configManager.loadConfig()
        if (config && config.source === 'external' && config.path) {
          allowedDirs.push(config.path)
        }
      } catch {
        // Non-fatal if config manager fails
      }

      for (const dir of allowedDirs) {
        const resolvedDir = path.resolve(dir)
        const relative = path.relative(resolvedDir, resolvedPath)
        const isInside = !relative.startsWith('..') && !path.isAbsolute(relative)
        if (isInside) {
          return true
        }
      }
    } catch {
      return false
    }
    return false
  }

  // Handle pegasus-asset:// protocol requests for dynamic wallpaper previews
  protocol.handle('pegasus-asset', async (request) => {
    try {
      const url = new URL(request.url)
      const filePath = decodeURIComponent(url.pathname)

      const isSafe = await validateSafePath(filePath)
      if (!isSafe) {
        return new Response('Access Denied', { status: 403 })
      }

      if (!fs.existsSync(filePath)) {
        return new Response('Asset not found', { status: 404 })
      }
      const buffer = fs.readFileSync(filePath)
      const ext = path.extname(filePath).toLowerCase()
      const mimeTypes: Record<string, string> = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
      }
      const contentType = mimeTypes[ext] || 'application/octet-stream'
      return new Response(buffer, {
        headers: { 'content-type': contentType },
      })
    } catch (err) {
      return new Response(`Error loading asset: ${String(err)}`, { status: 500 })
    }
  })

  // Disable default Electron application menu bar (File, Edit, View, Window, Help)
  Menu.setApplicationMenu(null)

  // Lock theme source to fixed dark mode to disable automatic OS theme synchronization
  nativeTheme.themeSource = 'dark'

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

