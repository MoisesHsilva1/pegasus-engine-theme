# Pegasus Engine Theme

[![Fedora Focus](https://img.shields.io/badge/Platform-Fedora%20Linux-blue?logo=fedora)](https://getfedora.org)
[![Electron](https://img.shields.io/badge/Electron-34.2+-47848F?logo=electron)](https://electronjs.org)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Pegasus Engine Theme** is a native Fedora-focused Linux desktop application that provides a modern, graphical management interface for configuring your desktop themes, terminal profiles, wallpapers, system configurations, and native packages.

---

## Application Principles

Pegasus is built with the end-user in mind, focusing on the following core principles:

- **Local Execution First**: No remote server or backend is required. Everything runs locally on your Fedora Linux machine, keeping your data secure.
- **Native Integration**: Seamlessly integrates with Fedora system utilities (`gsettings`, `dnf`, `flatpak`, `systemctl`) to provide a unified experience without the need for manual terminal commands.
- **Security by Design**: We enforce strict process separation between the UI and system operations, meaning the application is safe and your system configuration is protected.
- **No Intrusive Telemetry**: We operate directly on native Linux configuration files and system APIs.

---

## Features

- **Desktop Theme Management**: Browse, preview, apply, and persist GTK and GNOME desktop themes with a single click.
- **System Environment Dashboard**: Get a real-time overview of your Fedora distribution version, GNOME version, uptime, kernel details, and hardware resource utilization.
- **Terminal Profile Synchronization**: Generate and apply cohesive color schemes for Alacritty and GNOME Terminal.
- **Multi-language Support**: Full support for English (`en`) and Brazilian Portuguese (`pt-BR`).

### Included Themes
Pegasus comes pre-configured with 10 beautiful dark themes:
1. Catppuccin Mocha | 2. Tokyo Night | 3. Nord | 4. Gruvbox Dark | 5. Everforest
6. Kanagawa | 7. Rosé Pine | 8. Matte Black | 9. Osaka Jade | 10. Ristretto

---

## Installation Guide

### System Requirements
- **Operating System**: Fedora Linux 38+ (Workstation recommended)
- **Desktop Environment**: GNOME 40+
- **Architecture**: x86_64

### Option A: Fedora RPM Package (Recommended)

The easiest way to install Pegasus and get automatic GNOME Application Launcher integration is via our RPM package.

1. Download the generated `.rpm` package from the [Releases](https://github.com/MoisesHsilva1/pegasus-theme/releases) page or the `release/` folder.
2. Install via `dnf`:

```bash
sudo dnf install ./release/Pegasus-Engine-Theme-0.1.0.x86_64.rpm
```

Once installed, you can launch the application from your GNOME App Drawer or by typing `pegasus-engine-theme` in your terminal.

### Option B: AppImage (Portable)

If you prefer a portable solution without system-wide installation:

1. Download the AppImage file.
2. Make it executable and launch it:

```bash
chmod +x ./release/Pegasus-Engine-Theme-0.1.0.AppImage
./release/Pegasus-Engine-Theme-0.1.0.AppImage
```

---

## Configuration & Storage

Your preferences are stored securely in your home directory:
- **Active Theme Settings**: `~/.config/pegasus/active-theme.json`
- **Application State**: `~/.config/Pegasus Engine Theme/`

To completely **Uninstall**, run:
```bash
sudo dnf remove pegasus-engine-theme
```
*(Note: To remove your configuration files entirely, you can safely delete the folders mentioned above.)*

---

##  Developer & Architecture Information

<details>
<summary>Click to expand developer documentation</summary>

### Architecture Overview
Pegasus Engine Theme bridges desktop customization and Fedora system utilities into a unified, secure Electron application. It strictly enforces process separation and security boundaries between the graphical interface and privileged system operations.

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

### Development Setup

1. **Clone & Install Dependencies**
```bash
git clone https://github.com/MoisesHsilva1/pegasus-theme.git
cd pegasus-theme
pnpm install
```

2. **Start Development Server**
```bash
pnpm dev
```

### Available Scripts
| Script | Command | Purpose |
| :--- | :--- | :--- |
| `pnpm dev` | `vite` | Start dev server and hot-reloading Electron app |
| `pnpm build` | `tsc && vite build` | Compile TypeScript and bundle production assets |
| `pnpm package` | `pnpm build && ...` | Generate both AppImage and Fedora RPM release packages |
| `pnpm package:rpm` | `pnpm build && ...` | Generate native Fedora RPM package (`release/*.rpm`) |
| `pnpm package:appimage` | `pnpm build && ...` | Generate portable AppImage (`release/*.AppImage`) |
| `pnpm typecheck` | `tsc --noEmit` | Validate strict TypeScript compilation without output |
| `pnpm lint` | `eslint .` | Run ESLint checks across project |
| `pnpm test` | `vitest run` | Execute unit and integration test suite |

### Project Structure
```text
pegasus-engine-theme/
├── docs/                     # Comprehensive documentation guides
├── resources/                # Application branding & icons
├── scripts/                  # Automated build and packaging scripts
├── src/
│   ├── main/                 # Privileged Electron main process
│   ├── preload/              # Secure contextBridge API bridge
│   ├── renderer/             # React UI (Vite, Tailwind v4, shadcn/ui)
│   ├── shared/               # Shared IPC channel constants & DTO types
│   └── themes/               # Native theme definitions & script templates
├── tests/                    # Vitest unit & integration test suites
├── package.json              # Project metadata, scripts & dependencies
└── GEMINI.md                 # Core engineering principles & guidelines
```

### Contributing
1. Fork the repository & create your feature branch (`git checkout -b feature/my-feature`).
2. Run mandatory static checks before submitting a PR:
   ```bash
   pnpm typecheck
   pnpm lint
   pnpm test
   pnpm build
   ```
3. Commit your changes following repository guidelines.
</details>

---
