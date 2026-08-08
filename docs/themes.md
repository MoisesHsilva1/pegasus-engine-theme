# Pegasus Engine Theme — Theme System Guide

This document describes how the theme engine, color palettes, terminal configurations, wallpapers, and desktop themes are structured, managed, applied, and expanded.

---

## 1. Theme Data Architecture

Themes in Pegasus Engine Theme are defined declaratively with structured metadata, color definitions, wallpaper definitions, and terminal profile mappings.

### Location of Theme Definitions

- **Theme Metadata & UI Palettes**: `src/renderer/features/themes/data/themes.ts`
- **Native Theme Configurations**: `src/themes/` (Catppuccin, Everforest, Gruvbox, Kanagawa, Matte Black, Nord, Osaka Jade, Ristretto, Rosé Pine, Tokyo Night)
- **GNOME Shell Script**: `src/themes/set-gnome-theme.sh`

---

## 2. Theme Object Structure

Each theme contains:

```typescript
export interface Theme {
  id: string
  name: string
  description: string
  author: string
  category: 'dark' | 'light' | 'oled'
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string
    text: string
    accent: string
  }
  terminal: {
    foreground: string
    background: string
    cursor: string
    ansiColors: string[]
  }
  wallpaper?: string
}
```

---

## 3. Supported Built-in Themes

- **Catppuccin Mocha**: Soothing pastel theme for high-contrast dark environments.
- **Tokyo Night**: Vibrant cyberpunk-inspired dark palette.
- **Nord**: Arctic nord-frost inspired clean aesthetic.
- **Gruvbox Dark**: Retro groove dark palette with warm contrast.
- **Everforest**: Comfortable, natural green-tinted dark theme.
- **Kanagawa**: Elegant dark palette inspired by traditional Japanese art.
- **Rosé Pine**: All natural pine, faux fur, and warm gold palette.
- **Matte Black**: Deep OLED dark black minimalist theme.
- **Osaka Jade**: High-tech emerald & jade dark palette.
- **Ristretto**: Rich dark coffee espresso palette.

---

## 4. Theme Application & Persistence Flow

1. User selects a theme card in the UI (`src/renderer/features/themes/ThemeGrid.tsx`).
2. The renderer calls `window.pegasus.theme.applyTheme(themeId)`.
3. Electron Main receives the IPC message and invokes `ThemeService.applyTheme(themeId)`.
4. `ThemeService`:
   - Updates GNOME desktop options (`gsettings set org.gnome.desktop.interface gtk-theme`).
   - Updates terminal configuration files (`~/.config/alacritty/alacritty.toml`).
   - Sets background wallpaper if specified.
   - Saves active theme choice to `~/.config/pegasus/active-theme.json`.

---

## 5. Adding a New Theme

To add a new theme to Pegasus Engine Theme:

1. **Add Theme Metadata**:
   Open `src/renderer/features/themes/data/themes.ts` and add your theme object to the `THEMES` array:

   ```typescript
   {
     id: 'custom-theme',
     name: 'Custom Theme',
     description: 'My custom dark theme for Fedora',
     author: 'Your Name',
     category: 'dark',
     colors: {
       primary: '#3b82f6',
       secondary: '#64748b',
       background: '#0f172a',
       surface: '#1e293b',
       text: '#f8fafc',
       accent: '#60a5fa',
     },
     terminal: {
       foreground: '#f8fafc',
       background: '#0f172a',
       cursor: '#60a5fa',
       ansiColors: [ ... ]
     }
   }
   ```

2. **Add Native Assets** (Optional):
   Create a folder under `src/themes/custom-theme/` containing any relevant CSS/GNOME assets or wallpapers.

3. **Run Validation**:
   ```bash
   pnpm typecheck
   pnpm test
   ```
