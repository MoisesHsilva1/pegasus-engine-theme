import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { WallpaperService } from '../../src/main/engine/themes/wallpaper'

describe('Wallpaper Synchronization & File Change Detection', () => {
  const testDir = path.join(os.tmpdir(), `pegasus-wallpaper-sync-test-${Date.now()}`)
  const service = new WallpaperService()

  beforeEach(() => {
    fs.mkdirSync(testDir, { recursive: true })
  })

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true })
    }
  })

  it('1. New Wallpaper Detection: detects newly added wallpaper in theme directory', async () => {
    const themeDir = path.join(testDir, 'new-theme')
    const wallpaperDir = path.join(themeDir, 'wallpaper')
    fs.mkdirSync(wallpaperDir, { recursive: true })

    const bg = path.join(wallpaperDir, 'custom.png')
    fs.writeFileSync(bg, Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))

    const info = await service.getWallpaperInfo('new-theme', themeDir)
    expect(info.hasAsset).toBe(true)
    expect(info.file).toBe('custom.png')
    expect(info.previewUrl).toContain('pegasus-asset://')
    expect(info.version).toBeDefined()
  })

  it('2. Removed Wallpaper Detection: detects when wallpaper is removed from theme directory', async () => {
    const themeDir = path.join(testDir, 'remove-theme')
    const wallpaperDir = path.join(themeDir, 'wallpaper')
    fs.mkdirSync(wallpaperDir, { recursive: true })

    const bg = path.join(wallpaperDir, 'background.jpg')
    fs.writeFileSync(bg, Buffer.from([0xff, 0xd8, 0xff, 0xe0]))

    const infoInitial = await service.getWallpaperInfo('remove-theme', themeDir)
    expect(infoInitial.hasAsset).toBe(true)

    // Remove file
    fs.unlinkSync(bg)

    const infoAfter = await service.getWallpaperInfo('remove-theme', themeDir)
    expect(infoAfter.hasAsset).toBe(false)
    expect(infoAfter.file).toBe('')
  })

  it('3. Modified Content & Same-Name Replacement: produces unique version hash and persistent path', async () => {
    const themeDir = path.join(testDir, 'same-name-theme')
    const wallpaperDir = path.join(themeDir, 'wallpaper')
    fs.mkdirSync(wallpaperDir, { recursive: true })

    const bgPath = path.join(wallpaperDir, 'wallpaper.png')

    // Version A
    fs.writeFileSync(bgPath, Buffer.from('VERSION_A_IMAGE_DATA_12345'))
    const infoA = await service.getWallpaperInfo('same-name-theme', themeDir)
    expect(infoA.hasAsset).toBe(true)

    const persistentA = await service.copyWallpaperToPersistentLocation('same-name-theme', bgPath)

    // Version B (Same filename, different content/size)
    fs.writeFileSync(bgPath, Buffer.from('VERSION_B_IMAGE_DATA_DIFFERENT_CONTENT_67890_EXTENDED'))
    const infoB = await service.getWallpaperInfo('same-name-theme', themeDir)
    expect(infoB.hasAsset).toBe(true)
    expect(infoB.version).not.toBe(infoA.version)

    const persistentB = await service.copyWallpaperToPersistentLocation('same-name-theme', bgPath)
    expect(persistentB).not.toBe(persistentA)
    expect(fs.existsSync(persistentB)).toBe(true)
    // Verify persistentA was cleaned up
    expect(fs.existsSync(persistentA)).toBe(false)
  })

  it('4. Replaced Extension Cleanup: removes old extension wallpaper when extension changes', async () => {
    const themeDir = path.join(testDir, 'ext-change-theme')
    const wallpaperDir = path.join(themeDir, 'wallpaper')
    fs.mkdirSync(wallpaperDir, { recursive: true })

    const jpgBg = path.join(wallpaperDir, 'background.jpg')
    fs.writeFileSync(jpgBg, Buffer.from([0xff, 0xd8, 0xff, 0xe0]))

    const persistentJpg = await service.copyWallpaperToPersistentLocation('ext-change-theme', jpgBg)
    expect(fs.existsSync(persistentJpg)).toBe(true)

    // Remove JPG, add WebP
    fs.unlinkSync(jpgBg)
    const webpBg = path.join(wallpaperDir, 'background.webp')
    fs.writeFileSync(webpBg, Buffer.from('RIFF1234WEBPVP8'))

    const persistentWebp = await service.copyWallpaperToPersistentLocation('ext-change-theme', webpBg)
    expect(fs.existsSync(persistentWebp)).toBe(true)
    expect(fs.existsSync(persistentJpg)).toBe(false)
  })
})
