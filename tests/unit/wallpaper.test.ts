import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { WallpaperService } from '../../src/main/engine/themes/wallpaper'

describe('Wallpaper Resource Resolution & Pipeline', () => {
  const testDir = path.join(os.tmpdir(), `pegasus-wallpaper-test-${Date.now()}`)
  const service = new WallpaperService()

  beforeEach(() => {
    fs.mkdirSync(testDir, { recursive: true })
  })

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true })
    }
  })

  it('1. Development: resolves wallpaper from themeDir/wallpaper subfolder', async () => {
    const themeDir = path.join(testDir, 'dev-theme')
    const wallpaperDir = path.join(themeDir, 'wallpaper')
    fs.mkdirSync(wallpaperDir, { recursive: true })
    const dummyImage = path.join(wallpaperDir, 'background.jpg')
    fs.writeFileSync(dummyImage, Buffer.from([0xff, 0xd8, 0xff, 0xe0]))

    const resolved = await service.resolveWallpaper(themeDir)
    expect(resolved).toBe(dummyImage)
  })

  it('2. Root Directory: resolves wallpaper directly inside themeDir root when no wallpaper/ subfolder', async () => {
    const themeDir = path.join(testDir, 'root-theme')
    fs.mkdirSync(themeDir, { recursive: true })
    const dummyImage = path.join(themeDir, 'background.png')
    fs.writeFileSync(dummyImage, Buffer.from([0x89, 0x50, 0x4e, 0x47]))

    const resolved = await service.resolveWallpaper(themeDir)
    expect(resolved).toBe(dummyImage)
  })

  it('3. Bundled Fallback: falls back to bundled resources when themeDir lacks wallpaper', async () => {
    // Pick 'matte-black' which is a known built-in theme
    const userThemeDir = path.join(testDir, 'matte-black')
    fs.mkdirSync(userThemeDir, { recursive: true })
    // No wallpaper inside userThemeDir

    const resolved = await service.resolveWallpaper(userThemeDir)
    expect(resolved).not.toBeNull()
    expect(resolved).toContain('matte-black')
    expect(fs.existsSync(resolved!)).toBe(true)
  })

  it('4. Production: resolves wallpaper correctly when process.resourcesPath is set', async () => {
    const mockResources = path.join(testDir, 'resources')
    const mockThemeDir = path.join(mockResources, 'themes', 'kanagawa', 'wallpaper')
    fs.mkdirSync(mockThemeDir, { recursive: true })
    const mockImage = path.join(mockThemeDir, 'background.jpg')
    fs.writeFileSync(mockImage, Buffer.from([0xff, 0xd8, 0xff]))

    const originalResourcesPath = process.resourcesPath
    try {
      Object.defineProperty(process, 'resourcesPath', {
        value: mockResources,
        configurable: true,
        writable: true,
      })

      const prodThemeDir = path.join(mockResources, 'themes', 'kanagawa')
      const resolved = await service.resolveWallpaper(prodThemeDir)
      expect(resolved).toBe(mockImage)
    } finally {
      Object.defineProperty(process, 'resourcesPath', {
        value: originalResourcesPath,
        configurable: true,
        writable: true,
      })
    }
  })

  it('5. Missing Wallpaper: returns null safely for nonexistent or empty wallpaper', async () => {
    const emptyThemeDir = path.join(testDir, 'empty-theme')
    fs.mkdirSync(emptyThemeDir, { recursive: true })

    const resolved = await service.resolveWallpaper(emptyThemeDir)
    expect(resolved).toBeNull()
  })

  it('6. Empty File Validation: fails validation if wallpaper file size is 0 bytes', () => {
    const emptyFile = path.join(testDir, 'zero.jpg')
    fs.writeFileSync(emptyFile, '')

    const isValid = service.validateWallpaper(emptyFile)
    expect(isValid).toBe(false)
  })

  it('7. Unsupported Format Validation: rejects non-supported image extensions', () => {
    const textFile = path.join(testDir, 'image.txt')
    fs.writeFileSync(textFile, 'not an image')

    const isValid = service.validateWallpaper(textFile)
    expect(isValid).toBe(false)
  })
})
