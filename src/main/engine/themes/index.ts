import type { ThemeApplyResult, ThemeProfile } from '@shared/types'
import { THEME_MANIFESTS } from '../../../themes'
import { ThemeApplicationService } from './application'
import { ThemeConfigManager } from './config'
import { ThemePathResolver } from './resolver'

export class ThemeService {
  private applicationService = new ThemeApplicationService()
  private configManager = new ThemeConfigManager()
  private initialized = false

  private themes: ThemeProfile[] = Object.values(THEME_MANIFESTS).map((manifest) => ({
    id: manifest.id,
    name: manifest.name,
    description: manifest.description,
    active: manifest.id === 'matte-black',
    accentColor: manifest.accentColor,
  }))

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return
    this.initialized = true
    try {
      const config = await this.configManager.loadConfig()
      this.themes = this.themes.map((t) => ({
        ...t,
        active: t.id === config.themeId,
      }))
    } catch {
      // Non-fatal if loading config fails
    }
  }

  async listThemes(): Promise<ThemeProfile[]> {
    await this.ensureInitialized()
    return this.themes
  }

  async getActiveTheme(): Promise<ThemeProfile | null> {
    await this.ensureInitialized()
    return this.themes.find((t) => t.active) || null
  }

  async applyTheme(themeId: string): Promise<ThemeApplyResult> {
    await this.ensureInitialized()
    const result = await this.applicationService.applyTheme(themeId)
    if (result.status !== 'FAILED') {
      this.themes = this.themes.map((t) => ({
        ...t,
        active: t.id === result.themeId,
      }))
    }
    return result
  }
}

export { ThemeApplicationService, ThemeConfigManager, ThemePathResolver }
