# Pegasus Engine Theme — Release Packaging & Distribution Guide

This document describes the production build pipeline, packaging scripts, artifact generation, and release verification process for **Pegasus Engine Theme**.

---

## 1. Overview of Packaging Pipeline

```text
┌─────────────────────────────────────────────────────────┐
│                 1. Static Validation                    │
│      pnpm typecheck && pnpm lint && pnpm test           │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                 2. Production Build                     │
│               tsc && vite build (pnpm build)            │
│       Output: dist/ (renderer) & dist-electron/ (main)  │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                 3. Linux Packaging                      │
│             electron-builder --linux AppImage           │
│         Generates: release/linux-unpacked/ & AppImage   │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│              4. Native Fedora RPM Generation            │
│                 node scripts/build-rpm.js               │
│     Generates: release/Pegasus-Engine-Theme-0.1.0.rpm  │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Available Packaging Commands

The project includes composer scripts in `package.json` for reproducible builds:

| Command | Purpose | Generated Artifacts |
| :--- | :--- | :--- |
| `pnpm package` | Full production build + AppImage + RPM | `release/*.rpm`, `release/*.AppImage` |
| `pnpm package:linux` | Full Linux build (AppImage + RPM) | `release/*.rpm`, `release/*.AppImage` |
| `pnpm package:rpm` | Build unpacked bundle + Fedora RPM | `release/Pegasus-Engine-Theme-<ver>.x86_64.rpm` |
| `pnpm package:appimage` | Build portable AppImage | `release/Pegasus-Engine-Theme-<ver>.AppImage` |

---

## 3. Output Artifacts Directory

All release packages are placed in the root `release/` directory:

```text
release/
├── Pegasus-Engine-Theme-0.1.0.x86_64.rpm   # Native Fedora RPM package (~105MB)
├── Pegasus-Engine-Theme-0.1.0.AppImage     # Portable AppImage executable (~107MB)
├── linux-unpacked/                          # Unpacked Linux Electron application bundle
└── builder-effective-config.yaml           # Effective electron-builder YAML configuration
```

---

## 4. Automatic Versioning

Artifact filenames derive their version automatically from `package.json`:

```json
{
  "name": "pegasus-engine-theme",
  "version": "0.1.0"
}
```

No hardcoded versions are used in packaging scripts. Updating `version` in `package.json` automatically renames output artifacts on the next build (e.g. `Pegasus-Engine-Theme-0.2.0.x86_64.rpm`).

---

## 5. Desktop & Icon Integration

The generated RPM package includes:

- **Desktop File**: Installs to `/usr/share/applications/pegasus-engine-theme.desktop`
- **Application Icon**: 512x512 PNG installed to `/usr/share/icons/hicolor/512x512/apps/pegasus-engine-theme.png`
- **System Symlink**: `/usr/bin/pegasus-engine-theme` -> `/opt/pegasus-engine-theme/pegasus-engine-theme`

---

## 6. Verifying Built Release Packages

### Inspecting RPM Metadata & Files

```bash
rpm -qip release/Pegasus-Engine-Theme-0.1.0.x86_64.rpm
rpm -qlp release/Pegasus-Engine-Theme-0.1.0.x86_64.rpm
```

### Verifying Bundle Security (No Secrets or Dev Assets)

```bash
npx -y asar list release/linux-unpacked/resources/app.asar
```

Confirm that no `.env`, `.git`, or test files are included in the bundle.

---

## 7. Theme Resources in the Production Package

Bundled themes are included in the production package via `electron-builder`'s `extraResources`
configuration in `package.json`:

```json
"extraResources": [
  { "from": "src/themes", "to": "themes" }
]
```

This copies `src/themes/` → `resources/themes/` inside the packaged application.

### Installed Package Theme Locations

| Package format | Theme path |
| :--- | :--- |
| **RPM** (installed) | `/opt/pegasus-engine-theme/resources/themes/{themeId}/` |
| **AppImage** (mounted) | `{mount}/resources/themes/{themeId}/` |
| **linux-unpacked** (dev) | `release/linux-unpacked/resources/themes/{themeId}/` |

The application resolves these paths at runtime via `process.resourcesPath`, which Electron sets
automatically to the `resources/` directory of the installed package.

### Verifying Themes Are Included

After running `pnpm package:rpm` or `pnpm package:appimage`, verify themes were bundled:

```bash
ls release/linux-unpacked/resources/themes/
# Expected output: catppuccin  everforest  gruvbox  kanagawa  matte-black  nord  osaka-jade  ristretto  rose-pine  set-gnome-theme.sh  tokyo-night
```

