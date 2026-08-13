import { app, BrowserWindow, nativeTheme, Menu, protocol } from 'electron'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
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

function getMimeType(filePath: string): string {
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
  // Handle pegasus-asset:// protocol requests for dynamic wallpaper previews
  protocol.handle('pegasus-asset', async (request) => {
    try {
      const url = new URL(request.url)
      const filePath = decodeURIComponent(url.pathname)
      if (!fs.existsSync(filePath)) {
        return new Response('Asset not found', { status: 404 })
      }
      const data = await fs.promises.readFile(filePath)
      return new Response(data, {
        headers: {
          'Content-Type': getMimeType(filePath),
        },
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

