# Pegasus Engine Theme — Theme System Guide

This document describes how the theme engine, color palettes, terminal configurations, wallpapers,
and desktop themes are structured, managed, applied, and expanded.

---

## 1. Theme Data Architecture

Themes in Pegasus Engine Theme are defined declaratively with structured metadata, color definitions,
wallpaper definitions, and terminal profile mappings.

### Location of Theme Definitions

| Context | Location |
| :--- | :--- |
| Theme Metadata & System Manifests | `src/themes/index.ts` |
| Native Theme Assets (scripts, configs) | `src/themes/{themeId}/` |
| Renderer UI Palette Data | `src/renderer/features/themes/data/themes.ts` |
| User-Installed Themes | `~/.local/share/pegasus/themes/{themeId}/` |
| Bundled Themes (installed package) | `/opt/pegasus-engine-theme/resources/themes/{themeId}/` |

---

## 2. Theme Object Structure

Each theme entry in `src/themes/index.ts` exports a `SystemThemeManifest`:

```typescript
export interface SystemThemeManifest {
  id: ThemeId
  name: string
  description: string
  accentColor: string
  tokens: ThemeTokens    // Background, foreground, primary, accent, border colors
  wallpaper: WallpaperMetadata
}
```

---

## 3. Supported Built-in Themes

| Theme ID | Name | Style |
| :--- | :--- | :--- |
| `matte-black` | Matte Black | Monochrome dark OLED |
| `kanagawa` | Kanagawa | Warm Japanese-inspired dark |
| `nord` | Nord | Arctic ice blue |
| `gruvbox` | Gruvbox | Retro warm dark |
| `catppuccin` | Catppuccin | Soothing pastel |
| `tokyo-night` | Tokyo Night | Cyberpunk vibrant dark |
| `everforest` | Everforest | Natural green dark |
| `rose-pine` | Rosé Pine | Warm pastel muted |
| `osaka-jade` | Osaka Jade | Deep emerald dark |
| `ristretto` | Ristretto | Espresso dark |

---

## 4. Theme Resolution — Development vs. Production

The `ThemePathResolver` class (`src/main/engine/themes/resolver.ts`) resolves a theme ID to its
actual directory on disk. Resolution follows a strict priority order:

### Priority Order

```
1. Explicit external custom path (if provided and exists on disk)
   ↓
2. User-installed theme  (~/.local/share/pegasus/themes/{themeId}/)
   ↓
3. Bundled application theme — resolved environment-aware:
   a. process.resourcesPath/themes/       ← production (RPM / AppImage)
   b. app.getAppPath()/../themes/         ← production (ASAR builds)
   c. src/themes/ (relative to __dirname) ← development only (pnpm dev)
   d. process.cwd()/src/themes/           ← development only (vitest)
```

### Key guarantee

When `app.isPackaged === true` (i.e., the app is running as an installed package), the resolver
**skips all development-only paths** (`__dirname`-relative and `process.cwd()`-relative `src/themes`
lookups). Only `process.resourcesPath` and `app.getAppPath()` are checked.

This prevents the installed app from ever generating paths like:

```
/home/developer/src/themes/kanagawa   ← NEVER happens in production
```

---

## 5. Theme Configuration Persistence

The active theme is saved to `~/.config/pegasus/active-theme.json` using a stable identifier:

```json
{
  "themeId": "kanagawa",
  "source": "bundled",
  "path": null
}
```

| Field | Purpose |
| :--- | :--- |
| `themeId` | Stable built-in theme ID (resolved at runtime) |
| `source` | `"bundled"` / `"user"` / `"external"` — informational |
| `path` | Filesystem path — only set for `source: "external"` themes |

The `path` field is **never populated** for bundled or user-installed themes, preventing
developer-specific paths from being persisted.

---

## 6. Legacy Configuration Migration

Existing users who have a configuration written by an older version of the app (which stored
absolute filesystem paths) are automatically migrated on the next launch.

### Migration Rules

| Old format | Migration result |
| :--- | :--- |
| `{ "themePath": "/home/dev/src/themes/kanagawa" }` | `{ "themeId": "kanagawa", "source": "bundled" }` |
| `{ "themeDir": "/home/dev/src/themes/nord" }` | `{ "themeId": "nord", "source": "bundled" }` |
| `{ "themeId": "nonexistent" }` | `{ "themeId": "matte-black", "source": "bundled" }` (safe default) |

Migration is **atomic and safe**:
1. A timestamped backup is created in `~/.config/pegasus/backups/`
2. The legacy config is migrated and validated
3. The new config is only written after successful validation
4. If migration fails, the backup is restored

---

## 7. Theme Application & Persistence Flow

```
User selects theme in UI
       ↓
window.pegasus.themes.apply(themeId)   [Renderer → IPC]
       ↓
ThemeService.applyTheme(themeId)        [Main Process]
       ↓
ThemePathResolver.resolveThemeDir(themeId)
       ↓
Resolved theme directory (bundled / user / external)
       ↓
Apply: GNOME gsettings, Alacritty config, Zellij config, Wallpaper
       ↓
ThemeConfigManager.saveConfig({ themeId, source, path: null })
       ↓
~/.config/pegasus/active-theme.json updated
```

On application restart, `ThemeService.ensureInitialized()` calls `ThemeConfigManager.loadConfig()`
which reads the persisted `themeId` and re-resolves the active theme.

---

## 8. User-Installed Themes

Users can install custom themes by placing a theme directory at:

```
~/.local/share/pegasus/themes/{themeId}/
```

User-installed themes take priority over bundled themes but yield to explicitly configured external
paths. They must follow the same directory structure as bundled themes.

---

## 9. External Themes

An external theme is a theme with an explicit filesystem path stored in the configuration:

```json
{
  "themeId": "my-custom-theme",
  "source": "external",
  "path": "/home/user/my-themes/my-custom-theme"
}
```

External paths are only stored when the user explicitly provides a custom path. Built-in and
user-installed themes never store an absolute path.

---

## 10. Adding a New Built-in Theme

1. **Register theme metadata** in `src/themes/index.ts`:

```typescript
export type ThemeId = ... | 'my-new-theme'

export const THEME_MANIFESTS: Record<ThemeId, SystemThemeManifest> = {
  ...
  'my-new-theme': {
    id: 'my-new-theme',
    name: 'My New Theme',
    description: 'Description.',
    accentColor: '#rrggbb',
    tokens: { background, foreground, primary, accent, border },
    wallpaper: { file: 'background.jpg', enabled: true },
  },
}
```

2. **Create the theme asset directory** at `src/themes/my-new-theme/` with:
   - `gnome.sh` — GNOME desktop settings script
   - `alacritty.toml` — Alacritty terminal color scheme
   - `zellij.kdl` — Zellij multiplexer theme
   - `wallpaper/background.jpg` — Desktop wallpaper

3. **Register the UI palette** in `src/renderer/features/themes/data/themes.ts`

4. **Run validation**:
```bash
pnpm typecheck
pnpm lint
pnpm test
```

5. **Rebuild the package** — bundled themes are automatically included in the production package
   via the `extraResources` configuration in `package.json`.

---

## 11. Theme Packaging

Bundled themes are included in the production package via `electron-builder`'s `extraResources`:

```json
"extraResources": [
  { "from": "src/themes", "to": "themes" }
]
```

This copies the entire `src/themes/` directory into the package at `resources/themes/`.

In an installed RPM, themes are located at:
```
/opt/pegasus-engine-theme/resources/themes/{themeId}/
```

In an AppImage, themes are accessible via `process.resourcesPath`:
```
{AppImage mount}/resources/themes/{themeId}/
```
