import { ipcMain } from 'electron'
import { IpcChannels } from '@shared/ipc'
import type { PegasusEngine } from '@main/engine'
import { handleGetSystemInfo } from './handlers/system'
import { handleApplyTheme, handleGetActiveTheme, handleListThemes } from './handlers/themes'
import { handleGetSettings, handleUpdateSettings } from './handlers/settings'

export function registerIpcHandlers(engine: PegasusEngine): void {
  ipcMain.handle(IpcChannels.SYSTEM_GET_INFO, () => handleGetSystemInfo(engine))

  ipcMain.handle(IpcChannels.THEMES_LIST, () => handleListThemes(engine))
  ipcMain.handle(IpcChannels.THEMES_GET_ACTIVE, () => handleGetActiveTheme(engine))
  ipcMain.handle(IpcChannels.THEMES_APPLY, (_, themeId: unknown) =>
    handleApplyTheme(engine, themeId)
  )

  ipcMain.handle(IpcChannels.TERMINAL_GET_CONFIG, async () => {
    try {
      const data = await engine.terminal.getTerminalConfig()
      return { success: true, data }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle(IpcChannels.VSCODE_GET_CONFIG, async () => {
    try {
      const data = await engine.vscode.getVSCodeConfig()
      return { success: true, data }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle(IpcChannels.PACKAGES_LIST, async () => {
    try {
      const data = await engine.packages.listPackages()
      return { success: true, data }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle(IpcChannels.SETTINGS_GET, () => handleGetSettings(engine))
  ipcMain.handle(IpcChannels.SETTINGS_UPDATE, (_, update: unknown) =>
    handleUpdateSettings(engine, update)
  )
}
