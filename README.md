# Pegasus Engine Theme

[![Fedora Focus](https://img.shields.io/badge/Platform-Fedora%20Linux-blue?logo=fedora)](https://getfedora.org)
[![Electron](https://img.shields.io/badge/Electron-34.2+-47848F?logo=electron)](https://electronjs.org)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Pegasus Engine Theme** is a native Fedora-focused Linux desktop application that provides a modern graphical management interface for the Pegasus Engine Theme environment (desktop themes, terminal profiles, wallpapers, system configurations, and native packages).

---

## Overview

Pegasus Engine Theme bridges desktop customization and Fedora system utilities (`gsettings`, `dnf`, `flatpak`, `systemctl`) into a unified, secure Electron application. It strictly enforces process separation and security boundaries between the graphical interface and privileged system operations.

```text
┌─────────────────────────────────────────────────────────┐
│                    React Renderer                       │
│        (src/renderer: UI, React 19, Tailwind v4)        │
└────────────────────────────┬────────────────────────────┘
                             │
                             │ window.pegasus (Typed API Bridge)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    Electron Preload                     │
│         (src/preload: contextBridge mapping)            │
└────────────────────────────┬────────────────────────────┘
                             │
                             │ Electron IPC Channels (@shared)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                     Electron Main                       │
│        (src/main: Window Management & IPC Routing)      │
└────────────────────────────┬────────────────────────────┘
                             │
                             │ Direct Service Invocations
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    Pegasus Engine                       │
│   (src/main/engine: Theme, System, Terminal Services)   │
└────────────────────────────┬────────────────────────────┘
                             │
                             │ SafeCommandRunner (execFile argument arrays)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    Fedora Subsystem                     │
│         (gsettings, dnf, flatpak, systemctl)            │
└────────────────────────────?────────────────────────────┘
```

- **Local Execution**: No remote server or backend required; executes locally on Fedora Linux.
- **No HTTP/REST Layer**: Pure IPC bridge communication over Electron boundaries.
- **No External Database**: Operates directly on native Linux configuration files and system APIs.

---

## Features

- 🎨 **Desktop Theme Management**: Browse, preview, apply, and persist GTK and GNOME desktop themes (Catppuccin, Everforest, Gruvbox, Kanagawa, Matte Black, Nord, Osaka Jade, Ristretto, Rosé Pine, Tokyo Night).
- 🖥️ **System Environment Dashboard**: Real-time Fedora distribution version, GNOME version, uptime, kernel details, and hardware resource utilization.
- 💻 **Terminal Profile Synchronization**: Generate and apply color schemes for Alacritty and GNOME Terminal.
- 🌐 **Internationalization (i18n)**: Full language support for English (`en`) and Brazilian Portuguese (`pt-BR`).
- 📦 **Native Fedora RPM & AppImage Packaging**: Installable `.rpm` package with full GNOME Application Launcher integration.

---

## System Requirements

- **Operating System**: Fedora Linux 38+ (Workstation recommended)
- **Desktop Environment**: GNOME 40+
- **Architecture**: x86_64
- **Node.js (for development)**: Node.js v22+
- **Package Manager**: `pnpm` v10+

---

## Installation

### Fedora RPM Package (Recommended)

Download the generated `.rpm` package from the `release/` folder or build it locally, then install via `dnf`:

```bash
sudo dnf install ./release/Pegasus-Engine-Theme-0.1.0.x86_64.rpm
```

Installed paths:
- **Executable**: `/usr/bin/pegasus-engine-theme`
- **Application Directory**: `/opt/pegasus-engine-theme/`
- **GNOME Launcher Entry**: `/usr/share/applications/pegasus-engine-theme.desktop`
- **High-Res Icon**: `/usr/share/icons/hicolor/512x512/apps/pegasus-engine-theme.png`

To launch from terminal:
```bash
pegasus-engine-theme
```

### AppImage (Portable)

Make the AppImage executable and launch it:

```bash
chmod +x ./release/Pegasus-Engine-Theme-0.1.0.AppImage
./release/Pegasus-Engine-Theme-0.1.0.AppImage
```

For complete installation details, see [Installation Guide](docs/installation.md).

---

## Uninstallation

To remove the native RPM package:

```bash
sudo dnf remove pegasus-engine-theme
```

> **Data Preservation**: Uninstalling the RPM package removes application binaries and system launchers, but preserves your personal configuration files in `~/.config/pegasus/`. To purge configuration files completely:
> ```bash
> rm -rf ~/.config/pegasus ~/.local/share/pegasus "~/.config/Pegasus Engine Theme"
> ```

---

## Development

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/MoisesHsilva1/pegasus-theme.git
cd pegasus-theme
pnpm install
```

### 2. Start Development Server

Launches Vite dev server and Electron process with hot reloading:

```bash
pnpm dev
```

---

## Available Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `pnpm dev` | `vite` | Start dev server and hot-reloading Electron app |
| `pnpm build` | `tsc && vite build` | Compile TypeScript and bundle production assets |
| `pnpm package` | `pnpm build && ...` | Generate both AppImage and Fedora RPM release packages |
| `pnpm package:rpm` | `pnpm build && ...` | Generate native Fedora RPM package (`release/*.rpm`) |
| `pnpm package:appimage` | `pnpm build && ...` | Generate portable AppImage (`release/*.AppImage`) |
| `pnpm typecheck` | `tsc --noEmit` | Validate strict TypeScript compilation without output |
| `pnpm lint` | `eslint .` | Run ESLint checks across project |
| `pnpm lint:fix` | `eslint . --fix` | Automatically fix fixable linter errors |
| `pnpm test` | `vitest run` | Execute unit and integration test suite |

---

## Production Build & Packaging

To generate release artifacts:

```bash
pnpm package
```

Built artifacts will be placed in `release/`:
- `release/Pegasus-Engine-Theme-0.1.0.x86_64.rpm`
- `release/Pegasus-Engine-Theme-0.1.0.AppImage`

For detailed packaging procedures, see [Packaging Guide](docs/packaging.md).

---

## Project Structure

```text
pegasus-engine-theme/
├── docs/                     # Comprehensive documentation guides
│   ├── architecture.md       # Process boundaries, security & engine services
│   ├── installation.md       # RPM, AppImage, GNOME launcher & uninstall guide
│   ├── localization.md       # i18n structure & adding languages
│   ├── packaging.md          # Production build & Linux release packaging
│   └── themes.md             # Theme metadata, palettes & custom themes
├── resources/                # Application branding & icons
│   └── icons/
│       └── icon.png          # 512x512 PNG application badge
├── scripts/                  # Automated build and packaging scripts
│   └── build-rpm.js          # Native Fedora RPM packaging script
├── src/
│   ├── main/                 # Privileged Electron main process
│   │   ├── engine/           # Pegasus Engine services (Themes, System, Terminal)
│   │   ├── ipc/              # Thin IPC handlers mapping channels to Engine
│   │   └── index.ts          # Electron entry point & window security configuration
│   ├── preload/              # Secure contextBridge API bridge
│   ├── renderer/             # React UI (Vite, Tailwind v4, shadcn/ui)
│   │   ├── app/              # Desktop application shell
│   │   ├── components/       # Layout components & UI primitives
│   │   ├── context/          # React contexts (LanguageContext i18n)
│   │   ├── features/         # Application views (Home, Themes, Settings)
│   │   ├── locales/          # Translation dictionaries (en, pt-BR)
│   │   └── lib/              # UI helper utilities
│   ├── shared/               # Shared IPC channel constants & DTO types
│   └── themes/               # Native theme definitions & script templates
├── tests/                    # Vitest unit & integration test suites
├── package.json              # Project metadata, scripts & dependencies
└── GEMINI.md                 # Core engineering principles & guidelines
```

---

## Themes

Pegasus Engine Theme comes pre-configured with 10 dark themes tailored for Fedora desktop users:

1. **Catppuccin Mocha**
2. **Tokyo Night**
3. **Nord**
4. **Gruvbox Dark**
5. **Everforest**
6. **Kanagawa**
7. **Rosé Pine**
8. **Matte Black**
9. **Osaka Jade**
10. **Ristretto**

For details on adding custom themes, see [Theme System Guide](docs/themes.md).

---

## Localization

Pegasus Engine Theme supports multi-language interfaces with instant runtime switching:

- **English (`en`)**
- **Brazilian Portuguese (`pt-BR`)**

Language preferences persist across sessions. For details on adding new translations, see [Localization Guide](docs/localization.md).

---

## Configuration & Storage

User preferences are stored locally on your Fedora filesystem:

- **Active Theme Settings**: `~/.config/pegasus/active-theme.json`
- **Application State**: `~/.config/Pegasus Engine Theme/`

---

## Troubleshooting

### Application fails to launch after RPM installation

Verify runtime dependencies are satisfied:

```bash
sudo dnf install -y gtk3 libnotify nss xdg-utils at-spi2-core
```

### Icon missing in GNOME launcher

Refresh desktop launcher database:

```bash
sudo update-desktop-database
```

---

## Contributing

1. Fork the repository & create your feature branch (`git checkout -b feature/my-feature`).
2. Run mandatory static checks before submitting a PR:
   ```bash
   pnpm typecheck
   pnpm lint
   pnpm test
   pnpm build
   ```
3. Commit your changes following repository guidelines.

---

## License

This project is licensed under the [MIT License](LICENSE).
