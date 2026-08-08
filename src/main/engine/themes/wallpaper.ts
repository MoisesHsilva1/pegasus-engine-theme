import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, statSync, createReadStream } from 'node:fs'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import type { ThemeOperationResult, WallpaperInfo } from '@shared/types'
import { ThemePathResolver } from './resolver'

const execFileAsync = promisify(execFile)

export const SUPPORTED_WALLPAPER_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const
export type SupportedWallpaperExtension = (typeof SUPPORTED_WALLPAPER_EXTENSIONS)[number]

export interface WallpaperBackup {
  pictureUri: string
  pictureUriDark: string
}

export class WallpaperService {
  private getHomeDir(): string {
    return process.env.HOME || os.homedir()
  }

  private getWallpapersDir(): string {
    return path.join(this.getHomeDir(), '.local', 'share', 'pegasus', 'wallpapers')
  }

  /**
   * Computes a unique content hash (first 12 characters of SHA-256) for a wallpaper file.
   * Uses streams to process files to ensure a low memory footprint.
   */
  public async computeWallpaperHash(filePath: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (!existsSync(filePath)) {
        return reject(new Error(`File not found: ${filePath}`))
      }

      const hash = createHash('sha256')
      const stream = createReadStream(filePath)

      stream.on('data', (chunk) => {
        hash.update(chunk)
      })

      stream.on('end', () => {
        resolve(hash.digest('hex').substring(0, 12))
      })

      stream.on('error', (err) => {
        reject(err)
      })
    })
  }

  /**
   * Safe binary execution helper preventing shell interpolation injection
   */
  private async execBinary(
    binaryPath: string,
    args: string[]
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    try {
      const { stdout, stderr } = await execFileAsync(binaryPath, args, {
        env: process.env,
      })
      return { stdout: stdout.trim(), stderr: stderr.trim(), exitCode: 0 }
    } catch (err: unknown) {
      const execErr = err as { stdout?: string; stderr?: string; code?: number }
      return {
        stdout: execErr.stdout ? execErr.stdout.trim() : '',
        stderr: execErr.stderr ? execErr.stderr.trim() : String(err),
        exitCode: typeof execErr.code === 'number' ? execErr.code : 1,
      }
    }
  }

  /**
   * Scans theme directory (wallpaper/ subfolder, theme root, or bundled fallback) for supported image files (.jpg, .jpeg, .png, .webp)
   */
  public async resolveWallpaper(themeDir: string): Promise<string | null> {
    // 1. Check themeDir/wallpaper subfolder
    const wallpaperDir = path.join(themeDir, 'wallpaper')
    if (existsSync(wallpaperDir)) {
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
        // Ignore read errors
      }
    }

    // 2. Check themeDir root directory directly (for custom/legacy user theme directories without a wallpaper subfolder)
    if (existsSync(themeDir)) {
      try {
        const entries = await fs.readdir(themeDir, { withFileTypes: true })
        for (const entry of entries) {
          if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase()
            if (SUPPORTED_WALLPAPER_EXTENSIONS.includes(ext as SupportedWallpaperExtension)) {
              const fullPath = path.join(themeDir, entry.name)
              if (this.validateWallpaper(fullPath)) {
                return fullPath
              }
            }
          }
        }
      } catch {
        // Ignore read errors
      }
    }

    // 3. Fallback: If themeDir lacks a wallpaper asset, check the bundled theme resources
    const themeId = path.basename(themeDir)
    const bundledThemesDir = ThemePathResolver.getBundledThemesDir()

    if (bundledThemesDir) {
      const bundledWallpaperDir = path.join(bundledThemesDir, themeId, 'wallpaper')
      if (existsSync(bundledWallpaperDir)) {
        try {
          const entries = await fs.readdir(bundledWallpaperDir, { withFileTypes: true })
          for (const entry of entries) {
            if (entry.isFile()) {
              const ext = path.extname(entry.name).toLowerCase()
              if (SUPPORTED_WALLPAPER_EXTENSIONS.includes(ext as SupportedWallpaperExtension)) {
                const fullPath = path.join(bundledWallpaperDir, entry.name)
                if (this.validateWallpaper(fullPath)) {
                  return fullPath
                }
              }
            }
          }
        } catch {
          // Ignore fallback errors
        }
      }
    }

    return null
  }

  /**
   * Discovers current wallpaper file and computes deterministic version metadata based on filesystem state
   */
  public async getWallpaperInfo(_themeId: string, themeDir: string): Promise<WallpaperInfo> {
    const filePath = await this.resolveWallpaper(themeDir)
    if (!filePath || !this.validateWallpaper(filePath)) {
      return {
        file: '',
        resolution: '3840x2160',
        hasAsset: false,
      }
    }

    try {
      const version = await this.computeWallpaperHash(filePath)
      const previewUrl = `pegasus-asset://${filePath}?v=${version}`

      return {
        file: path.basename(filePath),
        resolution: '3840x2160',
        previewUrl,
        version,
        hasAsset: true,
        filePath,
      }
    } catch {
      return {
        file: path.basename(filePath),
        resolution: '3840x2160',
        hasAsset: false,
      }
    }
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
   * Copies theme wallpaper asset to persistent storage (~/.local/share/pegasus/wallpapers/{themeId}-{version}{ext})
   */
  public async copyWallpaperToPersistentLocation(
    themeId: string,
    srcPath: string
  ): Promise<string> {
    const wallpapersDir = this.getWallpapersDir()
    await fs.mkdir(wallpapersDir, { recursive: true })

    const version = await this.computeWallpaperHash(srcPath)
    const ext = path.extname(srcPath).toLowerCase()
    const targetFileName = `${themeId}-${version}${ext}`
    const targetPath = path.join(wallpapersDir, targetFileName)

    // Remove any stale persistent wallpaper files for this theme
    if (existsSync(wallpapersDir)) {
      try {
        const existingFiles = await fs.readdir(wallpapersDir)
        for (const file of existingFiles) {
          if (file.startsWith(`${themeId}-`) || file.startsWith(`${themeId}.`)) {
            if (file !== targetFileName) {
              try {
                await fs.unlink(path.join(wallpapersDir, file))
              } catch {
                // Non-fatal cleanup
              }
            }
          }
        }
      } catch {
        // Non-fatal cleanup
      }
    }

    await fs.copyFile(srcPath, targetPath)

    const statTarget = await fs.stat(targetPath)
    if (statTarget.size === 0) {
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
    const isProd = ThemePathResolver.isPackaged()
    console.log(
      `[WallpaperService] Resolving wallpaper for themeId '${themeId}' (environment: ${isProd ? 'production' : 'development'}, themeDir: '${themeDir}')`
    )

    // 1. Resolve wallpaper asset inside theme directory or bundled resources
    const wallpaperFile = await this.resolveWallpaper(themeDir)

    if (!wallpaperFile) {
      console.warn(`[WallpaperService] No supported wallpaper asset found for theme '${themeId}'.`)
      return {
        name: 'Wallpaper',
        status: 'SKIPPED',
        message: `No supported wallpaper asset (.jpg, .jpeg, .png, .webp) found for theme '${themeId}'.`,
      }
    }

    // 2. Validate format
    const ext = path.extname(wallpaperFile).toLowerCase()
    if (!SUPPORTED_WALLPAPER_EXTENSIONS.includes(ext as SupportedWallpaperExtension)) {
      console.warn(
        `[WallpaperService] Wallpaper format '${ext}' not supported for theme '${themeId}'.`
      )
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

      // 5. Apply GNOME wallpaper settings with reset toggle to force GNOME background daemon reload
      const wallpaperUri = `file://${persistentPath}`
      console.log(
        `[WallpaperService] Applying wallpaper '${wallpaperFile}' -> persistent location '${persistentPath}' (URI: '${wallpaperUri}')`
      )

      // Reset URI briefly to empty string to ensure dconf fires a change signal even if URI string is identical
      await this.execBinary('/usr/bin/gsettings', [
        'set',
        'org.gnome.desktop.background',
        'picture-uri',
        '',
      ])
      await this.execBinary('/usr/bin/gsettings', [
        'set',
        'org.gnome.desktop.background',
        'picture-uri-dark',
        '',
      ])

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

      console.log(`[WallpaperService] Successfully applied wallpaper for theme '${themeId}'.`)
      return {
        name: 'Wallpaper',
        status: 'SUCCESS',
        message: `Applied desktop wallpaper to GNOME environment (${persistentPath}).`,
      }
    } catch (err) {
      // Rollback on failure
      await this.rollbackWallpaperSettings(backup)

      const reason = err instanceof Error ? err.message : String(err)
      console.warn(`[WallpaperService] Failed to apply wallpaper for theme '${themeId}': ${reason}`)
      return {
        name: 'Wallpaper',
        status: 'WARNING',
        message: `Failed to apply wallpaper: ${reason}`,
      }
    }
  }
}
