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
 * Theme information placeholder DTO
 */
export interface ThemeProfile {
  id: string
  name: string
  description: string
  active: boolean
  accentColor: string
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
 * VSCode configuration placeholder DTO
 */
export interface VSCodeConfig {
  themeName: string
  iconTheme: string
  fontFamily: string
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

/**
 * Application Settings DTO
 */
export interface AppSettings {
  darkMode: boolean
  autoApplyTheme: boolean
  notificationsEnabled: boolean
  logLevel: 'debug' | 'info' | 'warn' | 'error'
}
