import { ipcRenderer } from 'electron'
import { IpcChannels, type PegasusApi } from '@shared/ipc'
import type { AppSettings } from '@shared/types'

export const api: PegasusApi = {
  system: {
    getInfo: () => ipcRenderer.invoke(IpcChannels.SYSTEM_GET_INFO),
  },
  themes: {
    list: () => ipcRenderer.invoke(IpcChannels.THEMES_LIST),
    apply: (themeId: string) => ipcRenderer.invoke(IpcChannels.THEMES_APPLY, themeId),
  },
  terminal: {
    getConfig: () => ipcRenderer.invoke(IpcChannels.TERMINAL_GET_CONFIG),
  },
  packages: {
    list: () => ipcRenderer.invoke(IpcChannels.PACKAGES_LIST),
  },
  settings: {
    get: () => ipcRenderer.invoke(IpcChannels.SETTINGS_GET),
    update: (settings: Partial<AppSettings>) =>
      ipcRenderer.invoke(IpcChannels.SETTINGS_UPDATE, settings),
  },
}
