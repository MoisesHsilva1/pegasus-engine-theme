import type { ThemeApplyResult, ThemeProfile } from '@shared/types'
import { THEME_MANIFESTS } from '../../../themes'
import { ThemeApplicationService } from './application'
import { ThemeConfigManager } from './config'
import { ThemePathResolver } from './resolver'
import { WallpaperService } from './wallpaper'

export class ThemeService {
  private applicationService = new ThemeApplicationService()
  private wallpaperService = new WallpaperService()
  private configManager = new ThemeConfigManager()
  private initialized = false
  private activeThemeId = 'matte-black'

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return
    this.initialized = true
    try {
      const config = await this.configManager.loadConfig()
      this.activeThemeId = config.themeId
    } catch {
      // Non-fatal if loading config fails
    }
  }

  private async getThemeProfile(id: string): Promise<ThemeProfile> {
    const manifest = THEME_MANIFESTS[id as keyof typeof THEME_MANIFESTS] || {
      id,
      name: id,
      description: '',
      accentColor: '#101010',
    }

    const resolution = ThemePathResolver.resolveThemeDir(id)
    const themeDir = resolution ? resolution.themeDir : ''
    const wallpaper = themeDir
      ? await this.wallpaperService.getWallpaperInfo(id, themeDir)
      : { file: '', resolution: '3840x2160', hasAsset: false }

    return {
      id: manifest.id,
      name: manifest.name,
      description: manifest.description,
      active: manifest.id === this.activeThemeId,
      accentColor: manifest.accentColor,
      tokens: manifest.tokens,
      wallpaper,
    }
  }

  async listThemes(): Promise<ThemeProfile[]> {
    await this.ensureInitialized()
    const profiles: ThemeProfile[] = []
    for (const manifest of Object.values(THEME_MANIFESTS)) {
      profiles.push(await this.getThemeProfile(manifest.id))
    }
    return profiles
  }

  async getActiveTheme(): Promise<ThemeProfile | null> {
    await this.ensureInitialized()
    return this.getThemeProfile(this.activeThemeId)
  }

  async applyTheme(themeId: string): Promise<ThemeApplyResult> {
    await this.ensureInitialized()
    const result = await this.applicationService.applyTheme(themeId)
    if (result.status !== 'FAILED') {
      this.activeThemeId = result.themeId
    }
    return result
  }
}

export { ThemeApplicationService, ThemeConfigManager, ThemePathResolver, WallpaperService }

