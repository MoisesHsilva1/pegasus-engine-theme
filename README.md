# Pegasus Theme

**Pegasus Theme** is a native Fedora-focused Linux desktop application that provides a graphical management interface for the Pegasus environment (themes, terminal profiles, icons, fonts, wallpapers, configurations, and packages).

---

## 1. Core Architecture

Pegasus Theme strictly enforces process separation and security boundaries between the user interface and system privilege operations.

```text
┌─────────────────────────────┐
│       React Renderer        │
│      TypeScript + UI        │
└──────────────┬──────────────┘
               │
               │ Typed Electron IPC
               ▼
┌─────────────────────────────┐
│       Electron Preload      │
│       Secure API Bridge     │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│       Electron Main         │
│                             │
│       Pegasus Engine        │
│                             │
│  Services / System Access   │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│           Fedora            │
│                             │
│ gsettings / dnf / flatpak   │
│ filesystem / systemctl etc  │
└─────────────────────────────┘
```

- **No Remote Backend**: Everything executes locally on the user's Fedora system.
- **No HTTP Server / REST / gRPC**: Pure local Electron IPC bridge.
- **No Database**: Pure filesystem and native system configuration management.

---

## 2. Technology Stack

- **Desktop Runtime**: Electron 34+
- **Frontend UI**: React 19, Vite 6, TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Package Manager**: pnpm
- **Testing**: Vitest, React Testing Library
- **Code Quality**: ESLint v9 (Flat config), Prettier, EditorConfig
- **Fedora Packaging**: Electron Builder (RPM target)

---

## 3. Security Model

1. **Context Isolation**: Always enabled (`contextIsolation: true`).
2. **Disabled Node Integration**: The React renderer cannot access Node.js APIs (`nodeIntegration: false`).
3. **Sandboxed Renderer**: Renderer window runs with `sandbox: true`.
4. **Minimal Preload Bridge**: Preload script exposes explicitly named, typed functions via `contextBridge`. No generic `ipcRenderer` or `require` handles are accessible to the window.
5. **No Shell Interpolation**: All native system interactions pass through `SafeCommandRunner` using process argument arrays rather than string concatenated shell invocation.

---

## 4. Development Workflow

### Prerequisites

- Node.js v22+
- pnpm v10/11+
- Fedora Linux Workstation (for native execution testing)

### Installation

```bash
pnpm install
```

### Development

Start both Vite dev server and Electron process with hot reloading:

```bash
pnpm dev
```

### Type Checking

```bash
pnpm typecheck
```

### Code Formatting & Linting

```bash
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:check
```

### Unit & Component Testing

```bash
pnpm test
```

### Production Build & RPM Packaging

```bash
pnpm build
pnpm package
```

Built packages will be output to `release/` (including `.rpm` packages for Fedora).

---

## 5. Architectural Directory Layout

```text
pegasus-engineer/
├── src/
│   ├── main/           # Privileged Electron main process
│   │   ├── engine/     # Pegasus Engine services (Themes, System, Terminal, Packages)
│   │   ├── ipc/        # Thin IPC handlers mapping IPC channels to Engine services
│   │   └── index.ts    # Electron app entry & BrowserWindow security config
│   ├── preload/        # Secure contextBridge API definition
│   ├── renderer/       # React UI (Vite, Tailwind, shadcn/ui)
│   │   ├── app/        # App desktop shell
│   │   ├── components/ # UI primitives (shadcn) and layout components
│   │   ├── features/   # Feature views (home, themes)
│   │   ├── lib/        # UI helpers
│   │   └── types/      # Renderer TypeScript declarations
│   └── shared/         # Shared IPC channel constants & DTO interfaces
├── tests/              # Unit & integration test suites
│   ├── setup.ts
│   └── unit/
│       ├── engine.test.ts
│       └── app.test.tsx
├── components.json
├── eslint.config.js
├── prettier.config.js
├── tsconfig.json
├── vite.config.ts
├── package.json
└── GEMINI.md
```
