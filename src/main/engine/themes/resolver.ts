import { existsSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { THEME_MANIFESTS, type ThemeId } from '../../../themes'

import { app as electronApp } from 'electron'

export interface ThemeResolutionResult {
  themeId: ThemeId
  themeDir: string
  source: 'bundled' | 'user' | 'external'
}

export class ThemePathResolver {
  /**
   * Safely retrieves Electron app instance if running inside Electron runtime
   */
  private static getElectronApp(): { getAppPath(): string; isPackaged: boolean } | undefined {
    try {
      if (electronApp && typeof electronApp.getAppPath === 'function') {
        return electronApp as { getAppPath(): string; isPackaged: boolean }
      }
      return undefined
    } catch {
      return undefined
    }
  }

  /**
   * Returns true when running inside a packaged Electron production application.
   * Never returns true during development or unit tests.
   */
  public static isPackaged(): boolean {
    const electronApp = this.getElectronApp()
    return electronApp?.isPackaged === true
  }

  /**
   * Returns standard user themes directory (~/.local/share/pegasus/themes)
   */
  public static getUserThemesDir(): string {
    return path.join(os.homedir(), '.local', 'share', 'pegasus', 'themes')
  }

  /**
   * Discovers candidate root directories for bundled themes.
   *
   * When running as a packaged application, ONLY production-safe paths are
   * considered (process.resourcesPath, app.getAppPath). Developer-specific
   * paths (process.cwd(), __dirname-relative src/themes) are intentionally
   * excluded in production to prevent resolution of developer machine paths.
   *
   * When running in development mode (npm run dev / vitest), the full
   * candidate list including repository src/themes is checked.
   */
  public static getBundledThemesCandidates(): string[] {
    const candidates: string[] = []
    const electronApp = this.getElectronApp()
    const packaged = electronApp?.isPackaged === true

    // ── Priority 1: Electron production package resources ──────────────────
    // Available as process.resourcesPath only in a packaged Electron app.
    // Points to /opt/pegasus-engine-theme/resources (RPM) or equivalent.
    if (typeof process !== 'undefined' && process.resourcesPath) {
      // extraResources copies src/themes → resources/themes
      candidates.push(path.join(process.resourcesPath, 'themes'))
    }

    // ── Priority 2: app.getAppPath() ───────────────────────────────────────
    // The directory containing the app's package.json / app.asar.
    // In an ASAR package this is inside the ASAR; themes land next to it.
    if (electronApp) {
      try {
        const appPath = electronApp.getAppPath()
        // Themes are placed as a sibling of the app directory (extraResources)
        candidates.push(path.join(path.dirname(appPath), 'themes'))
        // Also check inside app path (for non-ASAR builds)
        candidates.push(path.join(appPath, 'themes'))
      } catch {
        // Ignore errors in non-standard contexts
      }
    }

    // ── Priority 3: Development-only paths (skipped when packaged) ─────────
    // These paths resolve correctly during `pnpm dev` and `vitest` runs but
    // must NEVER be used in a production installation, because __dirname and
    // process.cwd() point to the developer's source repository in production.
    if (!packaged) {
      const baseDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd()
      candidates.push(path.resolve(baseDir, '../../../src/themes'))
      candidates.push(path.resolve(baseDir, '../../src/themes'))
      candidates.push(path.resolve(baseDir, '../src/themes'))
      candidates.push(path.resolve(baseDir, './src/themes'))

      // process.cwd() candidate is only added when the directory actually
      // exists, to prevent accidental resolution in production.
      const cwdThemes = path.resolve(process.cwd(), 'src/themes')
      if (existsSync(cwdThemes)) {
        candidates.push(cwdThemes)
      }
    }

    return Array.from(new Set(candidates))
  }

  /**
   * Resolves the primary directory containing bundled themes if it exists on disk.
   * Returns null if no candidate directory is found.
   */
  public static getBundledThemesDir(): string | null {
    const candidates = this.getBundledThemesCandidates()
    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        return candidate
      }
    }
    return null
  }

  /**
   * Environment-aware path resolution for a specific theme.
   * Resolution priority:
   *   1. Explicit external custom path (if provided and exists)
   *   2. User-installed theme (~/.local/share/pegasus/themes/{themeId})
   *   3. Bundled application theme (production resources or dev src/themes)
   *
   * Returns ThemeResolutionResult if the theme directory exists, null otherwise.
   */
  public static resolveThemeDir(
    themeId: string,
    customPath?: string | null
  ): ThemeResolutionResult | null {
    if (!themeId || typeof themeId !== 'string') {
      return null
    }

    const sanitizedId = path.basename(themeId)

    // 1. Explicit external custom path
    if (customPath && existsSync(customPath)) {
      return {
        themeId: sanitizedId as ThemeId,
        themeDir: customPath,
        source: 'external',
      }
    }

    // 2. User-installed theme directory (~/.local/share/pegasus/themes/{themeId})
    const userThemeDir = path.join(this.getUserThemesDir(), sanitizedId)
    if (existsSync(userThemeDir)) {
      return {
        themeId: sanitizedId as ThemeId,
        themeDir: userThemeDir,
        source: 'user',
      }
    }

    // 3. Bundled application theme
    const bundledThemesDir = this.getBundledThemesDir()
    if (bundledThemesDir) {
      const candidateDir = path.join(bundledThemesDir, sanitizedId)
      if (existsSync(candidateDir)) {
        return {
          themeId: sanitizedId as ThemeId,
          themeDir: candidateDir,
          source: 'bundled',
        }
      }
    }

    return null
  }

  /**
   * Checks if themeId is a valid known built-in theme manifest
   */
  public static isValidThemeId(themeId: string): themeId is ThemeId {
    return typeof themeId === 'string' && themeId in THEME_MANIFESTS
  }
}
