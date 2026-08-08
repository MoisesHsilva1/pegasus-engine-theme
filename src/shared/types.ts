/**
 * Generic IPC response container to ensure type-safe error handling
 */
export interface IpcResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * System Information DTO
 */
export interface SystemInfo {
  osName: string
  osVersion: string
  kernelVersion: string
  hostname: string
  architecture: string
  pegasusVersion: string
}

/**
 * Wallpaper metadata DTO
 */
export interface WallpaperInfo {
  file: string
  resolution?: string
  previewUrl?: string
  version?: string
  hasAsset: boolean
  filePath?: string
}

/**
 * Theme information placeholder DTO
 */
export interface ThemeProfile {
  id: string
  name: string
  description: string
  active: boolean
  accentColor: string
  tokens?: {
    background: string
    foreground: string
    primary: string
    accent: string
    border: string
    surface?: string
    card?: string
    muted?: string
  }
  wallpaper?: WallpaperInfo
}

/**
 * Operation result for individual system configuration steps
 */
export interface ThemeOperationResult {
  name: string
  status: 'SUCCESS' | 'WARNING' | 'FAILED' | 'SKIPPED'
  message: string
}

/**
 * Overall theme application result
 */
export interface ThemeApplyResult {
  status: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED'
  themeId: string
  operations: ThemeOperationResult[]
  backupPath?: string
  error?: string
}

/**
 * Terminal configuration placeholder DTO
 */
export interface TerminalConfig {
  fontFamily: string
  fontSize: number
  themeName: string
  opacity: number
}


/**
 * Package status placeholder DTO
 */
export interface PackageStatus {
  name: string
  installed: boolean
  source: 'dnf' | 'flatpak'
  version?: string
}

export type Language = 'en' | 'pt-BR'

/**
 * Application Settings DTO
 */
export interface AppSettings {
  language: Language
  darkMode: boolean
  autoApplyTheme: boolean
  notificationsEnabled: boolean
  logLevel: 'debug' | 'info' | 'warn' | 'error'
}
