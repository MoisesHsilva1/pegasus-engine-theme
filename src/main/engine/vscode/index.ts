import { promises as fs, existsSync } from 'fs'
import path from 'path'
import os from 'os'

export interface VSCodeThemeApplyResult {
  success: boolean
  status: 'SUCCESS' | 'WARNING' | 'FAILED'
  message: string
}

export class VSCodeService {
  private getHomeDir(): string {
    return os.homedir()
  }

  public async isVSCodeInstalled(): Promise<boolean> {
    const home = this.getHomeDir()
    if (!existsSync(home)) {
      return false
    }
    const configDir = path.join(home, '.config', 'Code')
    const vscodeDir = path.join(home, '.vscode')
    const binaryExists = existsSync('/usr/bin/code') || existsSync('/usr/share/code')
    return existsSync(configDir) || existsSync(vscodeDir) || binaryExists
  }

  public async isThemeInstalled(themeName: string): Promise<boolean> {
    const defaultBuiltInThemes = [
      'cursor dark',
      'default dark+',
      'default light+',
      'monokai',
      'solarized dark',
    ]

    if (defaultBuiltInThemes.includes(themeName.toLowerCase())) {
      return true
    }

    const home = this.getHomeDir()
    const extDir = path.join(home, '.vscode', 'extensions')

    if (!existsSync(extDir)) {
      return false
    }

    try {
      const entries = await fs.readdir(extDir, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const pkgPath = path.join(extDir, entry.name, 'package.json')
          if (existsSync(pkgPath)) {
            try {
              const content = await fs.readFile(pkgPath, 'utf-8')
              const pkg = JSON.parse(content)
              const themes = pkg.contributes?.themes
              if (Array.isArray(themes)) {
                const found = themes.some(
                  (t: { label?: string }) =>
                    t.label && t.label.toLowerCase() === themeName.toLowerCase()
                )
                if (found) {
                  return true
                }
              }
            } catch {
              // Ignore invalid package.json
            }
          }
        }
      }
    } catch {
      return false
    }

    return false
  }

  public async applyVSCodeTheme(themeName: string): Promise<VSCodeThemeApplyResult> {
    const installed = await this.isVSCodeInstalled()
    if (!installed) {
      return {
        success: false,
        status: 'FAILED',
        message: 'VS Code is not installed on this system.',
      }
    }

    const themeInstalled = await this.isThemeInstalled(themeName)
    if (!themeInstalled) {
      return {
        success: false,
        status: 'WARNING',
        message: `VS Code theme '${themeName}' extension is not installed. Please install the required VS Code extension manually.`,
      }
    }

    try {
      const home = this.getHomeDir()
      const userDir = path.join(home, '.config', 'Code', 'User')
      const settingsPath = path.join(userDir, 'settings.json')

      await fs.mkdir(userDir, { recursive: true })

      let settings: Record<string, unknown> = {}
      if (existsSync(settingsPath)) {
        try {
          const raw = await fs.readFile(settingsPath, 'utf-8')
          settings = JSON.parse(raw)
        } catch {
          settings = {}
        }
      }

      settings['workbench.colorTheme'] = themeName
      await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8')

      return {
        success: true,
        status: 'SUCCESS',
        message: `Applied VS Code theme '${themeName}'.`,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return {
        success: false,
        status: 'WARNING',
        message: `Failed to configure VS Code theme: ${message}`,
      }
    }
  }

  public async getVSCodeConfig(): Promise<{ themeName: string; iconTheme: string; fontFamily: string }> {
    const home = this.getHomeDir()
    const settingsPath = path.join(home, '.config', 'Code', 'User', 'settings.json')
    let themeName = 'Pegasus Dark'
    let iconTheme = 'vscode-icons'
    let fontFamily = 'Fira Code'

    if (existsSync(settingsPath)) {
      try {
        const raw = await fs.readFile(settingsPath, 'utf-8')
        const settings = JSON.parse(raw)
        if (typeof settings['workbench.colorTheme'] === 'string') {
          themeName = settings['workbench.colorTheme']
        }
        if (typeof settings['workbench.iconTheme'] === 'string') {
          iconTheme = settings['workbench.iconTheme']
        }
        if (typeof settings['editor.fontFamily'] === 'string') {
          fontFamily = settings['editor.fontFamily']
        }
      } catch {
        // Fallback defaults
      }
    }

    return { themeName, iconTheme, fontFamily }
  }
}
