import { CardThemeProps } from '@/components/ui/cardTheme'
import { THEME_MANIFESTS } from '../../../../themes'

export interface ThemeDefinition extends Omit<CardThemeProps, 'isApplied' | 'onApply'> {
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
    vscode: manifest.vscode,
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