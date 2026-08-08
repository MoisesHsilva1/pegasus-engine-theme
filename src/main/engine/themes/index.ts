import type { ThemeApplyResult, ThemeProfile } from '@shared/types'
import { THEME_MANIFESTS } from '../../../themes'
import { ThemeApplicationService } from './application'

export class ThemeService {
  private applicationService = new ThemeApplicationService()

  private themes: ThemeProfile[] = Object.values(THEME_MANIFESTS).map((manifest) => ({
    id: manifest.id,
    name: manifest.name,
    description: manifest.description,
    active: manifest.id === 'matte-black',
    accentColor: manifest.accentColor,
  }))

  async listThemes(): Promise<ThemeProfile[]> {
    return this.themes
  }

  async getActiveTheme(): Promise<ThemeProfile | null> {
    return this.themes.find((t) => t.active) || null
  }

  async applyTheme(themeId: string): Promise<ThemeApplyResult> {
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

export { ThemeApplicationService }
