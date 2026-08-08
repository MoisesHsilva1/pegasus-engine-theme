import type {
  AppSettings,
  IpcResult,
  PackageStatus,
  SystemInfo,
  TerminalConfig,
  ThemeApplyResult,
  ThemeProfile,
  VSCodeConfig,
} from './types'

export enum IpcChannels {
  SYSTEM_GET_INFO = 'system:get-info',
  THEMES_LIST = 'themes:list',
  THEMES_GET_ACTIVE = 'themes:get-active',
  THEMES_APPLY = 'themes:apply',
  TERMINAL_GET_CONFIG = 'terminal:get-config',
  VSCODE_GET_CONFIG = 'vscode:get-config',
  PACKAGES_LIST = 'packages:list',
  SETTINGS_GET = 'settings:get',
  SETTINGS_UPDATE = 'settings:update',
}

export interface PegasusApi {
  system: {
    getInfo: () => Promise<IpcResult<SystemInfo>>
  }
  themes: {
    list: () => Promise<IpcResult<ThemeProfile[]>>
    getActive: () => Promise<IpcResult<ThemeProfile | null>>
    apply: (themeId: string) => Promise<IpcResult<ThemeApplyResult>>
  }
  terminal: {
    getConfig: () => Promise<IpcResult<TerminalConfig>>
  }
  vscode: {
    getConfig: () => Promise<IpcResult<VSCodeConfig>>
  }
  packages: {
    list: () => Promise<IpcResult<PackageStatus[]>>
  }
  settings: {
    get: () => Promise<IpcResult<AppSettings>>
    update: (settings: Partial<AppSettings>) => Promise<IpcResult<AppSettings>>
  }
}
