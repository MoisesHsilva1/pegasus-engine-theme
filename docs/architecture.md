# Pegasus Engine Theme — Architectural Overview

This document describes the architectural layout, security design, process boundaries, and module responsibilities of **Pegasus Engine Theme**.

---

## 1. Process Separation & Boundary Diagram

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
└─────────────────────────────────────────────────────────┘
```

---

## 2. Layer Responsibilities

### Renderer Layer (`src/renderer`)
- **Framework**: React 19, Vite 6, Tailwind CSS v4, shadcn/ui.
- **Responsibilities**: Visual rendering, user interaction, theme previews, settings forms, localization switching (`LanguageContext`).
- **Strict Constraints**:
  - **No Node.js Access**: Never imports `fs`, `path`, `child_process`, or Electron modules.
  - **No Shell Execution**: All system operations are requested strictly through `window.pegasus`.

### Preload Layer (`src/preload`)
- **Technology**: Electron `contextBridge`.
- **Responsibilities**: Exposes a minimal, strongly typed API (`window.pegasus`) to the renderer process.
- **Strict Constraints**:
  - Exposes explicitly defined functions only.
  - Never exposes raw `ipcRenderer`, `desktopCapturer`, or EventEmitter instances to `window`.

### Main Process Layer (`src/main`)
- **Technology**: Electron Main Process (`src/main/index.ts`).
- **Responsibilities**: Application lifecycle management, native `BrowserWindow` creation, application menu control, native dark theme enforcement, registering IPC handlers (`src/main/ipc`).
- **Security Defaults**:
  - `contextIsolation: true`
  - `nodeIntegration: false`
  - `sandbox: true`
  - `webSecurity: true`

### Pegasus Engine Layer (`src/main/engine`)
- **Domain Services**:
  - `ThemeService`: Discovers, validates, applies, and persists desktop themes.
  - `SystemService`: Queries system environment, Fedora version, GNOME version, and system metrics.
  - `TerminalService`: Generates and syncs terminal profiles (Alacritty, GNOME Terminal).
  - `PackageService`: Interfaces with Fedora native package management (`dnf`, `flatpak`).
- **Execution Safety**: Executes native system calls via `SafeCommandRunner` using argument arrays rather than string-concatenated shell commands to prevent shell injection vulnerabilities.

---

## 3. Shared Contracts (`src/shared`)

The `@shared` layer defines all IPC channel names, payload interfaces, and response types shared between Main, Preload, and Renderer layers.

- `channels.ts`: Constant strings for IPC communication channels.
- `types.ts`: DTO definitions for themes, system metrics, configurations, and settings.
