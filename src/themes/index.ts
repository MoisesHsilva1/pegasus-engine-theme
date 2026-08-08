/**
 * Central Theme Registry & Manifest for Pegasus Engine
 *
 * Defines standard theme IDs, design tokens, and metadata for both
 * System/OS theme execution and Renderer application UI themes.
 */

export type ThemeId =
  | 'matte-black'
  | 'gruvbox'
  | 'kanagawa'
  | 'nord'
  | 'osaka-jade'
  | 'ristretto'
  | 'rose-pine'
  | 'catppuccin'
  | 'everforest'
  | 'tokyo-night'

export interface ThemeTokens {
  background: string
  foreground: string
  primary: string
  accent: string
  border: string
  surface?: string
  card?: string
  muted?: string
}

export interface WallpaperMetadata {
  file: string
  enabled: boolean
  resolution?: string
}

export interface SystemThemeManifest {
  id: ThemeId
  name: string
  description: string
  accentColor: string
  tokens: ThemeTokens
  wallpaper: WallpaperMetadata
}

export const THEME_MANIFESTS: Record<ThemeId, SystemThemeManifest> = {
  'matte-black': {
    id: 'matte-black',
    name: 'Matte Black',
    description: 'Monochrome clean dark.',
    accentColor: '#EAEAEA',
    tokens: {
      background: '#101010',
      foreground: '#C8C8C8',
      primary: '#EAEAEA',
      accent: '#303030',
      border: '#1A1A1A',
    },
    wallpaper: {
      file: 'background.jpg',
      enabled: true,
      resolution: '3840x2160',
    },
  },
  gruvbox: {
    id: 'gruvbox',
    name: 'Gruvbox',
    description: 'Retro groove theme profile with warm desaturated palette.',
    accentColor: '#ea6962',
    tokens: {
      background: '#282828',
      foreground: '#d4be98',
      primary: '#ea6962',
      accent: '#a9b665',
      border: '#3c3836',
    },
    wallpaper: {
      file: 'background.jpg',
      enabled: true,
      resolution: '2560x1440',
    },
  },
  kanagawa: {
    id: 'kanagawa',
    name: 'Kanagawa',
    description: 'Warm sunset theme profile inspired by Kagawa landscape.',
    accentColor: '#7e9cd8',
    tokens: {
      background: '#1f1f28',
      foreground: '#dcd7ba',
      primary: '#7e9cd8',
      accent: '#2d4f67',
      border: '#090618',
    },
    wallpaper: {
      file: 'background.jpg',
      enabled: true,
      resolution: '3840x2160',
    },
  },
  nord: {
    id: 'nord',
    name: 'Nord',
    description: 'Arctic ice blue palette with clean cold highlights.',
    accentColor: '#81a1c1',
    tokens: {
      background: '#2e3440',
      foreground: '#d8dee9',
      primary: '#81a1c1',
      accent: '#88c0d0',
      border: '#4c566a',
    },
    wallpaper: {
      file: 'background.png',
      enabled: true,
      resolution: '3840x2160',
    },
  },
  'osaka-jade': {
    id: 'osaka-jade',
    name: 'Osaka Jade',
    description: 'Deep emerald and jade tones for focused coding.',
    accentColor: '#549e6a',
    tokens: {
      background: '#111c18',
      foreground: '#C1C497',
      primary: '#549e6a',
      accent: '#23372B',
      border: '#D7C995',
    },
    wallpaper: {
      file: 'background.jpg',
      enabled: true,
      resolution: '2560x1440',
    },
  },
  ristretto: {
    id: 'ristretto',
    name: 'Ristretto',
    description: 'Rich dark espresso palette with warm magenta accents.',
    accentColor: '#fd6883',
    tokens: {
      background: '#2c2525',
      foreground: '#fff1f3',
      primary: '#fd6883',
      accent: '#a8a9eb',
      border: '#403e41',
    },
    wallpaper: {
      file: 'background.jpg',
      enabled: true,
      resolution: '3840x2160',
    },
  },
  'rose-pine': {
    id: 'rose-pine',
    name: 'Rosé Pine',
    description: 'All natural pine woods, sophisticated muted pastels.',
    accentColor: '#d7827e',
    tokens: {
      background: '#faf4ed',
      foreground: '#575279',
      primary: '#d7827e',
      accent: '#f2e9e1',
      border: '#dfdad9',
    },
    wallpaper: {
      file: 'background.jpg',
      enabled: true,
      resolution: '3840x2160',
    },
  },
  catppuccin: {
    id: 'catppuccin',
    name: 'Catppuccin',
    description: 'Soothing pastel theme profile for high productivity.',
    accentColor: '#f4dbd6',
    tokens: {
      background: '#24273a',
      foreground: '#cad3f5',
      primary: '#f4dbd6',
      accent: '#a5adcb',
      border: '#b8c0e0',
    },
    wallpaper: {
      file: 'background.png',
      enabled: true,
      resolution: '3840x2160',
    },
  },
  everforest: {
    id: 'everforest',
    name: 'Everforest',
    description: 'Warm natural green theme designed to be easy on the eyes.',
    accentColor: '#a7c080',
    tokens: {
      background: '#2b3339',
      foreground: '#d3c6aa',
      primary: '#a7c080',
      accent: '#7fbbb3',
      border: '#475258',
    },
    wallpaper: {
      file: 'background.jpg',
      enabled: true,
      resolution: '2560x1440',
    },
  },
  'tokyo-night': {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    description: 'Clean dark theme celebrating the lights of Downtown Tokyo.',
    accentColor: '#7aa2f7',
    tokens: {
      background: '#1a1b26',
      foreground: '#a9b1d6',
      primary: '#7aa2f7',
      accent: '#bb9af7',
      border: '#444b6a',
    },
    wallpaper: {
      file: 'background.jpg',
      enabled: true,
      resolution: '3840x2160',
    },
  },
}
