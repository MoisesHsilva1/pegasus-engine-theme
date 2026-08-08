import { execFile } from 'child_process'
import { promises as fs, existsSync } from 'fs'
import path from 'path'
import os from 'os'
import type { ThemeApplyResult, ThemeOperationResult } from '@shared/types'
import { THEME_MANIFESTS, type ThemeId } from '../../../themes'
import { WallpaperService } from './wallpaper'

export class ThemeApplicationService {
  private wallpaperService = new WallpaperService()

  private getHomeDir(): string {
    return os.homedir()
  }

  private getPegasusConfigDir(): string {
    return path.join(this.getHomeDir(), '.config', 'pegasus')
  }

  private getBackupDir(): string {
    return path.join(this.getPegasusConfigDir(), 'backups')
  }

  public getThemesDir(): string {
    const baseDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd()
    const candidatePaths = [
      path.resolve(baseDir, '../../../src/themes'),
      path.resolve(baseDir, '../../src/themes'),
      path.resolve(baseDir, '../src/themes'),
      path.resolve(process.cwd(), 'src/themes'),
      path.resolve(process.cwd(), 'resources/themes'),
    ]

    for (const p of candidatePaths) {
      if (existsSync(p)) {
        return p
      }
    }
    return path.resolve(process.cwd(), 'src/themes')
  }

  private getPegasusPath(): string {
    return path.dirname(this.getThemesDir())
  }

  /**
   * Prevents path traversal and validates theme existence
   */
  public validateTheme(themeId: string): ThemeId {
    if (typeof themeId !== 'string' || !themeId.trim()) {
      throw new Error('Invalid themeId provided.')
    }

    const sanitized = path.basename(themeId) as ThemeId
    if (sanitized !== themeId || !(sanitized in THEME_MANIFESTS)) {
      throw new Error(`Theme '${themeId}' does not exist or is invalid. Path traversal blocked.`)
    }

    return sanitized
  }

  /**
   * Securely runs a shell script (.sh) using execFile with arguments and timeout
   */
  private runScript(
    scriptPath: string,
    args: string[] = [],
    envExtra: Record<string, string> = {}
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    return new Promise((resolve) => {
      const pegasusPath = this.getPegasusPath()
      const env = {
        ...process.env,
        PEGASUS_PATH: pegasusPath,
        ...envExtra,
      }

      execFile('/bin/bash', [scriptPath, ...args], { env, timeout: 5000 }, (error, stdout, stderr) => {
        const exitCode = error && typeof error.code === 'number' ? error.code : error ? 1 : 0
        resolve({
          stdout: stdout.toString(),
          stderr: stderr.toString(),
          exitCode,
        })
      })
    })
  }

  /**
   * Safely creates a backup of target files before modifying them
   */
  public async createBackup(targetPaths: string[]): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFolder = path.join(this.getBackupDir(), `backup-${timestamp}`)
    await fs.mkdir(backupFolder, { recursive: true })

    for (const targetPath of targetPaths) {
      if (existsSync(targetPath)) {
        try {
          const relativePath = targetPath.replace(this.getHomeDir(), '').replace(/^[/\\]/, '')
          const destPath = path.join(backupFolder, relativePath)
          await fs.mkdir(path.dirname(destPath), { recursive: true })
          await fs.copyFile(targetPath, destPath)
        } catch {
          // Non-fatal if single backup file fails
        }
      }
    }

    return backupFolder
  }

  /**
   * Restores configuration files from a backup folder
   */
  public async rollback(backupFolder: string): Promise<boolean> {
    if (!existsSync(backupFolder)) return false

    try {
      const restoreDir = async (currentDir: string) => {
        const entries = await fs.readdir(currentDir, { withFileTypes: true })
        for (const entry of entries) {
          const fullPath = path.join(currentDir, entry.name)
          if (entry.isDirectory()) {
            await restoreDir(fullPath)
          } else if (entry.isFile()) {
            const relPath = fullPath.substring(backupFolder.length)
            const targetPath = path.join(this.getHomeDir(), relPath)
            await fs.mkdir(path.dirname(targetPath), { recursive: true })
            await fs.copyFile(fullPath, targetPath)
          }
        }
      }
      await restoreDir(backupFolder)
      return true
    } catch {
      return false
    }
  }

  /**
   * Delegated GNOME Wallpaper Handler
   */
  public async applyWallpaper(themeId: string, themeDir: string): Promise<ThemeOperationResult> {
    return this.wallpaperService.applyWallpaper(themeId, themeDir)
  }

  /**
   * Applies all available theme configuration assets to the user's environment
   */
  public async applyTheme(rawThemeId: string): Promise<ThemeApplyResult> {
    const operations: ThemeOperationResult[] = []
    let backupFolder: string | undefined

    try {
      // 1. Validation & Resolution
      const themeId = this.validateTheme(rawThemeId)
      const manifest = THEME_MANIFESTS[themeId]
      const themeDir = path.join(this.getThemesDir(), themeId)

      if (!existsSync(themeDir)) {
        return {
          status: 'FAILED',
          themeId: rawThemeId,
          operations: [
            {
              name: 'Theme Validation',
              status: 'FAILED',
              message: `Theme folder '${themeDir}' not found.`,
            },
          ],
          error: `Theme folder for '${themeId}' not found.`,
        }
      }

      operations.push({
        name: 'Theme Resolution',
        status: 'SUCCESS',
        message: `Validated theme '${manifest.name}' assets directory.`,
      })

      // 2. Backup Creation
      const home = this.getHomeDir()
      const backupTargets = [
        path.join(home, '.config', 'alacritty', 'alacritty.toml'),
        path.join(home, '.config', 'zellij', 'config.kdl'),
      ]
      backupFolder = await this.createBackup(backupTargets)
      operations.push({
        name: 'Backup System',
        status: 'SUCCESS',
        message: `Created configuration backup in ${path.basename(backupFolder)}.`,
      })

      // 3. Apply GNOME Configuration
      const gnomeScript = path.join(themeDir, 'gnome.sh')
      if (existsSync(gnomeScript)) {
        const res = await this.runScript(gnomeScript, [], {
          PEGASUS_THEME_COLOR: manifest.accentColor,
        })
        if (res.exitCode === 0) {
          operations.push({
            name: 'GNOME Desktop',
            status: 'SUCCESS',
            message: `Applied GNOME desktop theme settings and accent color (${manifest.accentColor}).`,
          })
        } else {
          operations.push({
            name: 'GNOME Desktop',
            status: 'WARNING',
            message: `GNOME script executed with warning: ${res.stderr || 'non-zero exit code'}`,
          })
        }
      } else {
        operations.push({
          name: 'GNOME Desktop',
          status: 'SKIPPED',
          message: 'No gnome.sh script found for this theme.',
        })
      }

      // 4. Apply Wallpaper via Dedicated WallpaperService
      const wallpaperResult = await this.wallpaperService.applyWallpaper(themeId, themeDir)
      operations.push(wallpaperResult)

      // 5. Apply Alacritty Terminal Theme
      const alacrittyConfig = path.join(themeDir, 'alacritty.toml')
      if (existsSync(alacrittyConfig)) {
        try {
          const destDir = path.join(home, '.config', 'alacritty')
          await fs.mkdir(destDir, { recursive: true })
          await fs.copyFile(alacrittyConfig, path.join(destDir, 'alacritty.toml'))
          operations.push({
            name: 'Alacritty Terminal',
            status: 'SUCCESS',
            message: 'Applied Alacritty color theme configuration.',
          })
        } catch (err) {
          operations.push({
            name: 'Alacritty Terminal',
            status: 'WARNING',
            message: `Failed applying Alacritty theme: ${err instanceof Error ? err.message : String(err)}`,
          })
        }
      } else {
        operations.push({
          name: 'Alacritty Terminal',
          status: 'SKIPPED',
          message: 'No alacritty.toml configuration found.',
        })
      }

      // 6. Apply Zellij Theme
      const zellijKdl = path.join(themeDir, 'zellij.kdl')
      if (existsSync(zellijKdl)) {
        try {
          const zellijDir = path.join(home, '.config', 'zellij', 'themes')
          await fs.mkdir(zellijDir, { recursive: true })
          await fs.copyFile(zellijKdl, path.join(zellijDir, `${themeId}.kdl`))
          operations.push({
            name: 'Zellij Multiplexer',
            status: 'SUCCESS',
            message: `Applied Zellij theme configuration (${themeId}.kdl).`,
          })
        } catch (err) {
          operations.push({
            name: 'Zellij Multiplexer',
            status: 'WARNING',
            message: `Failed applying Zellij theme: ${err instanceof Error ? err.message : String(err)}`,
          })
        }
      } else {
        operations.push({
          name: 'Zellij Multiplexer',
          status: 'SKIPPED',
          message: 'No zellij.kdl configuration found.',
        })
      }

      // Determine overall status
      const hasFailures = operations.some((o) => o.status === 'FAILED')
      const hasWarnings = operations.some((o) => o.status === 'WARNING')
      const successCount = operations.filter((o) => o.status === 'SUCCESS').length

      let status: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED' = 'SUCCESS'
      if (hasFailures || successCount === 0) {
        status = 'FAILED'
        if (backupFolder) {
          await this.rollback(backupFolder)
        }
      } else if (hasWarnings) {
        status = 'PARTIAL_SUCCESS'
      }

      return {
        status,
        themeId,
        operations,
        backupPath: backupFolder,
      }
    } catch (err) {
      if (backupFolder) {
        await this.rollback(backupFolder)
      }

      const errorMsg = err instanceof Error ? err.message : String(err)
      return {
        status: 'FAILED',
        themeId: rawThemeId,
        operations: [
          ...operations,
          {
            name: 'System Theme Execution',
            status: 'FAILED',
            message: `Fatal error: ${errorMsg}`,
          },
        ],
        error: errorMsg,
      }
    }
  }
}
