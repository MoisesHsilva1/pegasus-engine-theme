import { execFile } from 'child_process'
import { promises as fs, existsSync, statSync } from 'fs'
import path from 'path'
import os from 'os'
import type { ThemeOperationResult } from '@shared/types'

export const SUPPORTED_WALLPAPER_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const
export type SupportedWallpaperExtension = (typeof SUPPORTED_WALLPAPER_EXTENSIONS)[number]

export interface WallpaperBackup {
  pictureUri: string
  pictureUriDark: string
}

export class WallpaperService {
  private getHomeDir(): string {
    return os.homedir()
  }

  private getWallpapersDir(): string {
    return path.join(this.getHomeDir(), '.local', 'share', 'pegasus', 'wallpapers')
  }

  /**
   * Safely executes an ELF binary directly using execFile (without passing to bash)
   */
  public execBinary(
    binaryPath: string,
    args: string[] = [],
    envExtra: Record<string, string> = {}
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    return new Promise((resolve) => {
      const env = {
        ...process.env,
        ...envExtra,
      }

      execFile(binaryPath, args, { env, timeout: 5000 }, (error, stdout, stderr) => {
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
   * Scans src/themes/{theme}/wallpaper for supported image files (.jpg, .jpeg, .png, .webp)
   */
  public async resolveWallpaper(themeDir: string): Promise<string | null> {
    const wallpaperDir = path.join(themeDir, 'wallpaper')
    if (!existsSync(wallpaperDir)) {
      return null
    }

    try {
      const entries = await fs.readdir(wallpaperDir, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase()
          if (SUPPORTED_WALLPAPER_EXTENSIONS.includes(ext as SupportedWallpaperExtension)) {
            const fullPath = path.join(wallpaperDir, entry.name)
            if (this.validateWallpaper(fullPath)) {
              return fullPath
            }
          }
        }
      }
    } catch {
      return null
    }

    return null
  }

  /**
   * Validates file existence, non-zero size, and extension
   */
  public validateWallpaper(filePath: string): boolean {
    if (!existsSync(filePath)) return false
    const ext = path.extname(filePath).toLowerCase()
    if (!SUPPORTED_WALLPAPER_EXTENSIONS.includes(ext as SupportedWallpaperExtension)) {
      return false
    }

    try {
      const stat = statSync(filePath)
      if (stat.size === 0) return false
    } catch {
      return false
    }

    return true
  }

  /**
   * Copies theme wallpaper asset to persistent storage (~/.local/share/pegasus/wallpapers/{themeId}{ext})
   */
  public async copyWallpaperToPersistentLocation(
    themeId: string,
    srcPath: string
  ): Promise<string> {
    const wallpapersDir = this.getWallpapersDir()
    await fs.mkdir(wallpapersDir, { recursive: true })

    const ext = path.extname(srcPath).toLowerCase()
    const targetPath = path.join(wallpapersDir, `${themeId}${ext}`)

    await fs.copyFile(srcPath, targetPath)

    const stat = await fs.stat(targetPath)
    if (stat.size === 0) {
      throw new Error('Copied wallpaper file is empty (0 bytes).')
    }

    return targetPath
  }

  /**
   * Reads current GNOME background settings for backup/rollback
   */
  public async backupWallpaperSettings(): Promise<WallpaperBackup> {
    const getUri = await this.execBinary('/usr/bin/gsettings', [
      'get',
      'org.gnome.desktop.background',
      'picture-uri',
    ])
    const getDarkUri = await this.execBinary('/usr/bin/gsettings', [
      'get',
      'org.gnome.desktop.background',
      'picture-uri-dark',
    ])

    return {
      pictureUri: getUri.stdout.trim().replace(/^'|'$/g, ''),
      pictureUriDark: getDarkUri.stdout.trim().replace(/^'|'$/g, ''),
    }
  }

  /**
   * Restores GNOME background settings from backup
   */
  public async rollbackWallpaperSettings(backup: WallpaperBackup): Promise<void> {
    if (backup.pictureUri) {
      await this.execBinary('/usr/bin/gsettings', [
        'set',
        'org.gnome.desktop.background',
        'picture-uri',
        backup.pictureUri,
      ])
    }
    if (backup.pictureUriDark) {
      await this.execBinary('/usr/bin/gsettings', [
        'set',
        'org.gnome.desktop.background',
        'picture-uri-dark',
        backup.pictureUriDark,
      ])
    }
  }

  /**
   * Verifies GNOME picture-uri and picture-uri-dark readback match the expected file URI
   */
  public async verifyWallpaper(expectedUri: string): Promise<boolean> {
    const verifyUriRes = await this.execBinary('/usr/bin/gsettings', [
      'get',
      'org.gnome.desktop.background',
      'picture-uri',
    ])
    const verifyDarkUriRes = await this.execBinary('/usr/bin/gsettings', [
      'get',
      'org.gnome.desktop.background',
      'picture-uri-dark',
    ])

    const verifiedUri = verifyUriRes.stdout.trim().replace(/^'|'$/g, '')
    const verifiedDarkUri = verifyDarkUriRes.stdout.trim().replace(/^'|'$/g, '')

    return verifiedUri === expectedUri || verifiedDarkUri === expectedUri
  }

  /**
   * Full pipeline execution: Resolve -> Validate -> Persistent Copy -> GNOME Apply -> Verification
   */
  public async applyWallpaper(themeId: string, themeDir: string): Promise<ThemeOperationResult> {
    // 1. Resolve wallpaper asset inside src/themes/{theme}/wallpaper
    const wallpaperFile = await this.resolveWallpaper(themeDir)

    if (!wallpaperFile) {
      return {
        name: 'Wallpaper',
        status: 'SKIPPED',
        message: `No supported wallpaper asset (.jpg, .jpeg, .png, .webp) found in '${path.join(themeDir, 'wallpaper')}'.`,
      }
    }

    // 2. Validate format
    const ext = path.extname(wallpaperFile).toLowerCase()
    if (!SUPPORTED_WALLPAPER_EXTENSIONS.includes(ext as SupportedWallpaperExtension)) {
      return {
        name: 'Wallpaper',
        status: 'WARNING',
        message: `Wallpaper format '${ext}' not supported. Supported formats: ${SUPPORTED_WALLPAPER_EXTENSIONS.join(', ')}.`,
      }
    }

    let backup: WallpaperBackup = { pictureUri: '', pictureUriDark: '' }

    try {
      // 3. Backup current settings
      backup = await this.backupWallpaperSettings()

      // 4. Copy to persistent storage (~/.local/share/pegasus/wallpapers/{themeId}{ext})
      const persistentPath = await this.copyWallpaperToPersistentLocation(themeId, wallpaperFile)

      // 5. Apply GNOME wallpaper settings
      const wallpaperUri = `file://${persistentPath}`

      const resUri = await this.execBinary('/usr/bin/gsettings', [
        'set',
        'org.gnome.desktop.background',
        'picture-uri',
        wallpaperUri,
      ])
      const resDarkUri = await this.execBinary('/usr/bin/gsettings', [
        'set',
        'org.gnome.desktop.background',
        'picture-uri-dark',
        wallpaperUri,
      ])
      await this.execBinary('/usr/bin/gsettings', [
        'set',
        'org.gnome.desktop.background',
        'picture-options',
        'zoom',
      ])

      if (resUri.exitCode !== 0 && resDarkUri.exitCode !== 0) {
        throw new Error(
          `GNOME session unavailable or gsettings command failed: ${resUri.stderr || resDarkUri.stderr}`
        )
      }

      // 6. Verify readback
      const isVerified = await this.verifyWallpaper(wallpaperUri)
      if (!isVerified) {
        const checkBackup = await this.backupWallpaperSettings()
        throw new Error(
          `GNOME verification failed: expected '${wallpaperUri}', got '${checkBackup.pictureUri}' / '${checkBackup.pictureUriDark}'.`
        )
      }

      return {
        name: 'Wallpaper',
        status: 'SUCCESS',
        message: `Applied desktop wallpaper to GNOME environment (${persistentPath}).`,
      }
    } catch (err) {
      // Rollback on failure
      await this.rollbackWallpaperSettings(backup)

      const reason = err instanceof Error ? err.message : String(err)
      return {
        name: 'Wallpaper',
        status: 'WARNING',
        message: `Failed to apply wallpaper: ${reason}`,
      }
    }
  }
}
