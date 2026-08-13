import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { SystemService } from '../../src/main/engine/system'
import { ThemeService } from '../../src/main/engine/themes'

describe('Pegasus Engine Services (Independent Unit Tests)', () => {
  const pegasusConfigDir = path.join(os.homedir(), '.config', 'pegasus')
  const configFile = path.join(pegasusConfigDir, 'active-theme.json')
  let originalConfigContent: string | null = null

  beforeEach(() => {
    // Preserve real config and reset to known state for predictable test results
    if (fs.existsSync(configFile)) {
      originalConfigContent = fs.readFileSync(configFile, 'utf-8')
    } else {
      originalConfigContent = null
    }
    // Remove config so ThemeService initializes with its hardcoded default (matte-black)
    if (fs.existsSync(configFile)) {
      fs.rmSync(configFile, { force: true })
    }
  })

  afterEach(() => {
    // Restore original config
    if (originalConfigContent !== null) {
      fs.mkdirSync(pegasusConfigDir, { recursive: true })
      fs.writeFileSync(configFile, originalConfigContent, 'utf-8')
    } else if (fs.existsSync(configFile)) {
      fs.rmSync(configFile, { force: true })
    }
  })

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

    const applied = await themeService.applyTheme('nord')
    expect(applied.status).not.toBe('FAILED')
    expect(applied.themeId).toBe('nord')
  })
})
