import { CardThemeProps } from '@/components/ui/cardTheme'
import { THEME_MANIFESTS } from '../../../../themes'
import type { ThemeProfile } from '@shared/types'

export interface ThemeDefinition extends Omit<CardThemeProps, 'onApply'> {
  id: string
}

const wallpaperMap = import.meta.glob<string>('/src/themes/*/wallpaper/*', {
  eager: true,
  query: '?url',
  import: 'default',
})

export const themes: ThemeDefinition[] = Object.values(THEME_MANIFESTS).map((manifest) => {
  const assetKey = `/src/themes/${manifest.id}/wallpaper/${manifest.wallpaper.file}`
  const resolvedUrl = wallpaperMap[assetKey]

  return {
    id: manifest.id,
    name: manifest.name,
    description: manifest.description,
    palette: [
      { label: 'Background', color: manifest.tokens.background },
      { label: 'Foreground', color: manifest.tokens.foreground },
      { label: 'Primary', color: manifest.tokens.primary },
      { label: 'Accent', color: manifest.tokens.accent },
      { label: 'Border', color: manifest.tokens.border },
    ],
    wallpaper: {
      name: `${manifest.name} Background`,
      resolution: manifest.wallpaper.resolution || '3840x2160',
      previewUrl: resolvedUrl,
      gradient: `linear-gradient(135deg, ${manifest.tokens.background} 0%, ${manifest.tokens.accent} 50%, ${manifest.tokens.primary} 100%)`,
    },
  }
})

export function profileToThemeDefinition(
  profile: ThemeProfile,
  fallback?: ThemeDefinition
): ThemeDefinition {
  const manifest = THEME_MANIFESTS[profile.id as keyof typeof THEME_MANIFESTS]
  const tokens = profile.tokens || manifest?.tokens

  const palette = tokens
    ? [
        { label: 'Background', color: tokens.background },
        { label: 'Foreground', color: tokens.foreground },
        { label: 'Primary', color: tokens.primary },
        { label: 'Accent', color: tokens.accent },
        { label: 'Border', color: tokens.border },
      ]
    : fallback?.palette || []

  const fallbackPreviewUrl =
    typeof fallback?.wallpaper === 'object' ? fallback.wallpaper.previewUrl : undefined
  const fallbackGradient =
    typeof fallback?.wallpaper === 'object' ? fallback.wallpaper.gradient : undefined

  const previewUrl =
    profile.wallpaper?.hasAsset && profile.wallpaper.previewUrl
      ? profile.wallpaper.previewUrl
      : profile.wallpaper?.hasAsset === false
        ? undefined
        : fallbackPreviewUrl

  return {
    id: profile.id,
    name: profile.name || manifest?.name || profile.id,
    description: profile.description || manifest?.description || '',
    palette,
    wallpaper: {
      name: `${profile.name || manifest?.name || profile.id} Background`,
      resolution: profile.wallpaper?.resolution || manifest?.wallpaper.resolution || '3840x2160',
      previewUrl,
      gradient: tokens
        ? `linear-gradient(135deg, ${tokens.background} 0%, ${tokens.accent} 50%, ${tokens.primary} 100%)`
        : fallbackGradient,
    },
  }
}