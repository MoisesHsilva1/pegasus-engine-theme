import { PackageService } from './packages'
import { SettingsService } from './settings'
import { SystemService } from './system'
import { TerminalService } from './terminal'
import { ThemeService } from './themes'

export class PegasusEngine {
  public readonly system: SystemService
  public readonly themes: ThemeService
  public readonly terminal: TerminalService
  public readonly packages: PackageService
  public readonly settings: SettingsService

  constructor() {
    this.system = new SystemService()
    this.themes = new ThemeService()
    this.terminal = new TerminalService()
    this.packages = new PackageService()
    this.settings = new SettingsService()
  }
}

export {
  SystemService,
  ThemeService,
  TerminalService,
  PackageService,
  SettingsService,
}

