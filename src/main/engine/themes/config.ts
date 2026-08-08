import { promises as fs, existsSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { type ThemeId } from '../../../themes'
import { ThemePathResolver } from './resolver'

export interface PersistedThemeConfig {
  themeId: ThemeId
  source: 'bundled' | 'user' | 'external'
  path?: string | null
}

export interface LegacyThemeConfig {
  themePath?: string
  themeDir?: string
  themeFolder?: string
  themeId?: string
  source?: string
  path?: string
}

export class ThemeConfigManager {
  private getHomeDir(): string {
    return os.homedir()
  }

  public getPegasusConfigDir(): string {
    return path.join(this.getHomeDir(), '.config', 'pegasus')
  }

  public getBackupDir(): string {
    return path.join(this.getPegasusConfigDir(), 'backups')
  }

  public getConfigFilePath(): string {
    return path.join(this.getPegasusConfigDir(), 'active-theme.json')
  }

  /**
   * Creates an atomic timestamped backup folder and saves target file or config directory
   */
  public async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFolder = path.join(this.getBackupDir(), `backup-${timestamp}`)
    await fs.mkdir(backupFolder, { recursive: true })

    const configFile = this.getConfigFilePath()
    if (existsSync(configFile)) {
      await fs.copyFile(configFile, path.join(backupFolder, 'active-theme.json'))
    }

    return backupFolder
  }

  /**
   * Restores active-theme.json from backup folder
   */
  public async restoreBackup(backupFolder: string): Promise<boolean> {
    const backupFile = path.join(backupFolder, 'active-theme.json')
    if (!existsSync(backupFile)) return false

    try {
      const configFile = this.getConfigFilePath()
      await fs.mkdir(path.dirname(configFile), { recursive: true })
      await fs.copyFile(backupFile, configFile)
      return true
    } catch {
      return false
    }
  }

  /**
   * Detects whether configuration contains legacy absolute or developer-specific paths
   */
  public isLegacyConfig(data: Record<string, unknown>): boolean {
    if ('themePath' in data || 'themeDir' in data || 'themeFolder' in data) {
      return true
    }

    if (typeof data.path === 'string') {
      const p = data.path
      if (p.includes('/home/') || p.includes('/src/themes/') || p.includes('/workspace/')) {
        return true
      }
    }

    return false
  }

  /**
   * Migrates legacy configuration format to stable themeId representation
   */
  public extractThemeIdFromLegacy(data: LegacyThemeConfig): ThemeId {
    if (data.themeId && ThemePathResolver.isValidThemeId(data.themeId)) {
      return data.themeId as ThemeId
    }

    const legacyPath = data.themePath || data.themeDir || data.themeFolder || data.path
    if (typeof legacyPath === 'string' && legacyPath.trim()) {
      const baseName = path.basename(legacyPath)
      if (ThemePathResolver.isValidThemeId(baseName)) {
        return baseName as ThemeId
      }
    }

    return 'matte-black'
  }

  /**
   * Loads current theme configuration, automatically performing safe migration if legacy format detected
   */
  public async loadConfig(): Promise<PersistedThemeConfig> {
    const configFile = this.getConfigFilePath()
    const defaultConfig: PersistedThemeConfig = {
      themeId: 'matte-black',
      source: 'bundled',
      path: null,
    }

    if (!existsSync(configFile)) {
      await this.saveConfig(defaultConfig)
      return defaultConfig
    }

    try {
      const rawContent = await fs.readFile(configFile, 'utf-8')
      const parsed = JSON.parse(rawContent)

      if (this.isLegacyConfig(parsed)) {
        return await this.migrateConfig(parsed)
      }

      if (parsed && typeof parsed.themeId === 'string') {
        const themeId = parsed.themeId as ThemeId
        const customPath = parsed.path || null

        // Validate resolved path
        const resolved = ThemePathResolver.resolveThemeDir(themeId, customPath)
        if (resolved) {
          return {
            themeId: resolved.themeId,
            source: resolved.source,
            path: customPath,
          }
        }
      }

      // If configuration is invalid or missing theme cannot be found, fall back to default safely
      return defaultConfig
    } catch {
      return defaultConfig
    }
  }

  /**
   * Safely migrates legacy config to new format with backup and validation
   */
  public async migrateConfig(legacyData: LegacyThemeConfig): Promise<PersistedThemeConfig> {
    let backupFolder: string | undefined
    try {
      backupFolder = await this.createBackup()

      const themeId = this.extractThemeIdFromLegacy(legacyData)
      const legacyPath = legacyData.themePath || legacyData.themeDir || legacyData.path

      let resolved = ThemePathResolver.resolveThemeDir(themeId)
      let source: 'bundled' | 'user' | 'external' = 'bundled'
      let finalPath: string | null = null

      if (!resolved && legacyPath && existsSync(legacyPath)) {
        resolved = ThemePathResolver.resolveThemeDir(themeId, legacyPath)
        if (resolved) {
          source = 'external'
          finalPath = legacyPath
        }
      }

      const targetThemeId = resolved ? resolved.themeId : 'matte-black'
      const migrated: PersistedThemeConfig = {
        themeId: targetThemeId,
        source: resolved ? resolved.source : source,
        path: finalPath,
      }

      await this.saveConfig(migrated)
      return migrated
    } catch {
      if (backupFolder) {
        await this.restoreBackup(backupFolder)
      }
      return {
        themeId: 'matte-black',
        source: 'bundled',
        path: null,
      }
    }
  }

  /**
   * Persists configuration atomically to disk
   */
  public async saveConfig(config: PersistedThemeConfig): Promise<void> {
    const configFile = this.getConfigFilePath()
    await fs.mkdir(path.dirname(configFile), { recursive: true })
    const payload = JSON.stringify(
      {
        themeId: config.themeId,
        source: config.source,
        path: config.path || null,
      },
      null,
      2
    )
    await fs.writeFile(configFile, payload, 'utf-8')
  }
}
