import { describe, expect, it } from 'vitest'
import { SystemService } from '../../src/main/engine/system'
import { ThemeService } from '../../src/main/engine/themes'

describe('Pegasus Engine Services (Independent Unit Tests)', () => {
  it('should initialize SystemService and retrieve default system info', async () => {
    const service = new SystemService()
    const info = await service.getSystemInfo()

    expect(info.osName).toBe('Fedora Linux')
    expect(info.osVersion).toContain('41')
    expect(info.pegasusVersion).toBe('0.1.0')
  })

  it('should list themes and allow theme switching in ThemeService', async () => {
    const themeService = new ThemeService()
    const list = await themeService.listThemes()

    expect(list.length).toBeGreaterThan(0)
    const active = await themeService.getActiveTheme()
    expect(active?.id).toBe('matte-black')

    const applied = await themeService.applyTheme('nord')
    expect(applied.status).not.toBe('FAILED')
    expect(applied.themeId).toBe('nord')

    const newActive = await themeService.getActiveTheme()
    expect(newActive?.id).toBe('nord')
  })
})
