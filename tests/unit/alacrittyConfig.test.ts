import { describe, expect, it } from 'vitest'
import fs from 'fs'
import path from 'path'
import { THEME_MANIFESTS } from '../../src/themes'

describe('Alacritty Theme Configurations', () => {
  const themeIds = Object.keys(THEME_MANIFESTS)

  it('should ensure all themes have Alacritty configurations with disabled window decorations and disabled font zoom', () => {
    const themesDir = path.resolve(__dirname, '../../src/themes')

    for (const id of themeIds) {
      const configPath = path.join(themesDir, id, 'alacritty.toml')
      expect(fs.existsSync(configPath)).toBe(true)

      const content = fs.readFileSync(configPath, 'utf-8')

      // 1. Remove GNOME / Alacritty Window Decorations
      expect(content).toContain('decorations = "None"')

      // 2. Fixed Font Size (if font section exists)
      if (content.includes('[font]')) {
        expect(content).toMatch(/\[font\]\s*\nsize\s*=/m)
      }

      // 3. Disable Keyboard Zoom Bindings (if keyboard section exists)
      if (content.includes('[keyboard]')) {
        expect(content).toContain('action = "None"')
      }

      // 4. Disable Mouse Zoom Bindings (if mouse section exists)
      if (content.includes('[mouse]')) {
        expect(content).toContain('mouse = "WheelUp"')
        expect(content).toContain('mouse = "WheelDown"')
      }
    }
  })
})
