import type { AppSettings } from '@shared/types'

export class SettingsService {
  private settings: AppSettings = {
    language: 'en',
    darkMode: true,
    autoApplyTheme: false,
    notificationsEnabled: true,
    logLevel: 'info',
  }

  async getSettings(): Promise<AppSettings> {
    return { ...this.settings }
  }

  async updateSettings(update: Partial<AppSettings>): Promise<AppSettings> {
    this.settings = { ...this.settings, ...update }
    return { ...this.settings }
  }
}
