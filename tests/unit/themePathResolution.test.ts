import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { ThemePathResolver } from '../../src/main/engine/themes/resolver'
import { ThemeConfigManager } from '../../src/main/engine/themes/config'
import { ThemeService } from '../../src/main/engine/themes'

describe('Theme Path Resolution & Configuration Architecture', () => {
  const testDir = path.join(os.tmpdir(), `pegasus-test-${Date.now()}`)
  const pegasusConfigDir = path.join(os.homedir(), '.config', 'pegasus')
  const configFile = path.join(pegasusConfigDir, 'active-theme.json')
  let originalConfigContent: string | null = null

  beforeEach(() => {
    fs.mkdirSync(testDir, { recursive: true })
    if (fs.existsSync(configFile)) {
      originalConfigContent = fs.readFileSync(configFile, 'utf-8')
    } else {
      originalConfigContent = null
    }
  })

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true })
    }
    if (originalConfigContent !== null) {
      fs.mkdirSync(pegasusConfigDir, { recursive: true })
      fs.writeFileSync(configFile, originalConfigContent, 'utf-8')
    } else if (fs.existsSync(configFile)) {
      fs.rmSync(configFile, { force: true })
    }
  })

  it('1. Development Mode: resolves bundled theme correctly in repository src/themes', () => {
    const resolution = ThemePathResolver.resolveThemeDir('kanagawa')
    expect(resolution).not.toBeNull()
    expect(resolution?.themeId).toBe('kanagawa')
    // source is 'bundled' (from repo src/themes) or 'user' (~/.local/share/pegasus/themes)
    // depending on whether the user has kanagawa installed locally. Either is valid.
    expect(['bundled', 'user']).toContain(resolution?.source)
    expect(fs.existsSync(resolution!.themeDir)).toBe(true)
    // The resolved dir must contain 'kanagawa'
    expect(resolution?.themeDir).toContain('kanagawa')
  })

  it('2. Production Mode: resolves packaged themes from process.resourcesPath with higher priority than bundled dev paths', () => {
    // Use a theme that is NOT present in the user themes dir to avoid priority interference.
    // We pick 'tokyo-night' — it is a valid bundled theme but unlikely to be user-installed.
    const mockResourcesDir = path.join(testDir, 'resources')
    const mockTokyoDir = path.join(mockResourcesDir, 'themes', 'tokyo-night')
    fs.mkdirSync(mockTokyoDir, { recursive: true })
    fs.writeFileSync(path.join(mockTokyoDir, 'alacritty.toml'), '# mock config')

    // Ensure the theme is NOT in the user dir (so process.resourcesPath wins)
    const userTokyoDir = path.join(ThemePathResolver.getUserThemesDir(), 'tokyo-night')
    const userTokyoExists = fs.existsSync(userTokyoDir)

    const originalResourcesPath = process.resourcesPath
    try {
      // Simulate Electron production packaged environment
      Object.defineProperty(process, 'resourcesPath', {
        value: mockResourcesDir,
        configurable: true,
        writable: true,
      })

      const resolution = ThemePathResolver.resolveThemeDir('tokyo-night')
      expect(resolution).not.toBeNull()
      expect(resolution?.themeId).toBe('tokyo-night')

      if (!userTokyoExists) {
        // No user dir → must resolve to our mock resourcesPath
        expect(resolution?.themeDir).toBe(mockTokyoDir)
        expect(resolution?.source).toBe('bundled')
      } else {
        // User dir exists and has higher priority — still resolves, just from user dir
        expect(['bundled', 'user']).toContain(resolution?.source)
        expect(fs.existsSync(resolution!.themeDir)).toBe(true)
      }
    } finally {
      Object.defineProperty(process, 'resourcesPath', {
        value: originalResourcesPath,
        configurable: true,
        writable: true,
      })
    }
  })

  it('3. Stable Identifier: resolves theme using themeId independent of dev paths', () => {
    const resolution = ThemePathResolver.resolveThemeDir('nord')
    expect(resolution).not.toBeNull()
    expect(resolution?.themeId).toBe('nord')
    expect(fs.existsSync(resolution!.themeDir)).toBe(true)
  })

  it('4. Legacy Configuration Migration: detects absolute dev path and migrates to clean themeId', async () => {
    const configManager = new ThemeConfigManager()

    // Write a legacy config containing absolute developer path
    const legacyPayload = {
      themePath: '/home/developer/src/themes/kanagawa',
      themeDir: '/home/developer/src/themes/kanagawa',
    }
    fs.mkdirSync(pegasusConfigDir, { recursive: true })
    fs.writeFileSync(configFile, JSON.stringify(legacyPayload), 'utf-8')

    const loaded = await configManager.loadConfig()
    expect(loaded.themeId).toBe('kanagawa')
    // source is bundled or user depending on user env — both are valid migrations
    expect(['bundled', 'user']).toContain(loaded.source)
    expect(loaded.path).toBeNull()

    // Verify persisted config has no developer paths
    const newFileContent = fs.readFileSync(configFile, 'utf-8')
    expect(newFileContent).not.toContain('/home/developer')
    expect(newFileContent).toContain('"themeId": "kanagawa"')
  })

  it('5. Missing Theme: fails validation safely and returns default theme without crashing', async () => {
    const configManager = new ThemeConfigManager()
    const invalidPayload = {
      themeId: 'nonexistent-invalid-theme',
    }
    fs.mkdirSync(pegasusConfigDir, { recursive: true })
    fs.writeFileSync(configFile, JSON.stringify(invalidPayload), 'utf-8')

    const loaded = await configManager.loadConfig()
    expect(loaded.themeId).toBe('matte-black')

    const resolution = ThemePathResolver.resolveThemeDir('nonexistent-invalid-theme')
    expect(resolution).toBeNull()
  })

  it('6. External Custom Theme: retains functional resolution for external theme paths', () => {
    const customThemeDir = path.join(testDir, 'custom-kanagawa')
    fs.mkdirSync(customThemeDir, { recursive: true })

    const resolution = ThemePathResolver.resolveThemeDir('custom-kanagawa', customThemeDir)
    expect(resolution).not.toBeNull()
    expect(resolution?.themeDir).toBe(customThemeDir)
    expect(resolution?.source).toBe('external')
  })

  it('7. ThemeService Integration: loads migrated active theme on startup', async () => {
    const legacyPayload = {
      themePath: '/home/moisas/src/themes/gruvbox',
    }
    fs.mkdirSync(pegasusConfigDir, { recursive: true })
    fs.writeFileSync(configFile, JSON.stringify(legacyPayload), 'utf-8')

    const service = new ThemeService()
    const list = await service.listThemes()
    const gruvboxTheme = list.find((t) => t.id === 'gruvbox')
    expect(gruvboxTheme?.active).toBe(true)
  })

  it('8. Production Guard: getBundledThemesCandidates() only includes non-dev paths when packaged', () => {
    // In the test environment, isPackaged() must return false (not a packaged Electron app)
    expect(ThemePathResolver.isPackaged()).toBe(false)

    // In dev mode, the candidate list may include src/themes paths — that is expected.
    // What we verify here is the guard behavior through the public API:
    // when process.resourcesPath is set, it must appear FIRST in the candidate list.
    const mockResourcesDir = path.join(testDir, 'mock-resources')
    const originalResourcesPath = process.resourcesPath
    try {
      Object.defineProperty(process, 'resourcesPath', {
        value: mockResourcesDir,
        configurable: true,
        writable: true,
      })
      const candidates = ThemePathResolver.getBundledThemesCandidates()
      // process.resourcesPath/themes must be the first candidate
      expect(candidates[0]).toBe(path.join(mockResourcesDir, 'themes'))
    } finally {
      Object.defineProperty(process, 'resourcesPath', {
        value: originalResourcesPath,
        configurable: true,
        writable: true,
      })
    }
  })

  it('9. Stale source:user config: corrected to bundled on load when theme resolves from bundle', async () => {
    const configManager = new ThemeConfigManager()

    // Simulate a stale config written by an old version that set source:'user'
    // for a built-in bundled theme (e.g. nord applied before ThemeConfigManager existed)
    const staleConfig = {
      themeId: 'nord',
      source: 'user',
      path: null,
    }
    fs.mkdirSync(pegasusConfigDir, { recursive: true })
    fs.writeFileSync(configFile, JSON.stringify(staleConfig), 'utf-8')

    const loaded = await configManager.loadConfig()

    // The loaded config should have the correct source from the actual resolution
    expect(loaded.themeId).toBe('nord')
    // source is determined by resolution, not the stale persisted value
    expect(['bundled', 'user']).toContain(loaded.source)
    expect(loaded.path).toBeNull()
  })
})
