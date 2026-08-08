# GEMINI.md — Engineering Principles & AI Agent Rules

This document defines the strict engineering guidelines for AI agents working on the **Pegasus Theme** codebase.

---

## 1. General Principles

- **Read before modifying**: Always inspect existing code before making modifications.
- **No unrelated changes**: Do not refactor or modify code outside the explicit scope of the task.
- **Keep solutions simple**: Avoid over-engineering, unnecessary design patterns, or premature abstractions.
- **No unjustified dependencies**: Do not introduce npm packages or external dependencies without explicit justification.
- **Preserve architecture**: Respect established process boundaries, module structures, and project conventions.

---

## 2. Renderer Layer Rules (`src/renderer`)

- **Never access Node.js**: Do not import or use Node.js core modules (`fs`, `path`, `child_process`, etc.).
- **Never execute shell commands**: Command execution belongs strictly in the Main process / Engine.
- **Never access the filesystem directly**: Use the typed `window.pegasus` IPC interface.
- **Never import Main or Preload files**: Renderer code must not import modules from `src/main` or `src/preload`.
- **Communicate via Preload bridge**: All system interaction must flow through `window.pegasus`.

---

## 3. Preload Layer Rules (`src/preload`)

- **Expose approved APIs only**: Expose explicitly defined, typed functions through `contextBridge.exposeInMainWorld`.
- **No raw Electron objects**: Never expose `ipcRenderer`, `desktopCapturer`, or raw Electron emitters directly to the window.
- **No shell or file execution**: Do not build generic `exec` or `readFile` helpers in preload.
- **Keep bridge minimal**: The preload script should remain a thin, strongly typed mapping layer.

---

## 4. Main Process Rules (`src/main`)

- **Own privileged operations**: Handle Node.js system calls, child process creation, and OS APIs exclusively in Main.
- **Thin IPC handlers**: IPC handlers must only validate payloads, call Engine services, and return typed results.
- **No UI logic**: Do not write React components, HTML elements, or UI state logic in the Main process.
- **Delegate to Engine**: Delegate all business and Fedora integration logic to Pegasus Engine services.

---

## 5. Pegasus Engine Rules (`src/main/engine`)

- **Domain & Business Logic**: Contains system management services (`ThemeService`, `SystemService`, `TerminalService`, etc.).
- **Independent from React**: Must never import React, DOM, or Renderer code.
- **Independent testing**: Engine modules must be fully unit testable without starting an Electron window.
- **Isolate Fedora operations**: Wrap native Fedora calls in explicit service methods.

---

## 6. Fedora Environment Focus

- **Fedora Desktop Target**: Assume Fedora Linux as the primary operating system.
- **No cross-platform abstractions**: Do not invent platform abstraction layers unless explicitly requested.
- **Use native mechanisms**: Leverage `gsettings`, `dnf`, `flatpak`, `systemctl`, and GNOME configuration files.

---

## 7. Security Rules

- **Validate IPC input**: Validate all parameters arriving at IPC handlers before calling services.
- **No shell interpolation**: Never use string concatenation to build shell commands (e.g. `exec(\`dnf install ${pkg}\`)`).
- **Argument-based execution**: Use argument arrays with `execFile` / `spawn` (`['install', pkg]`).
- **Strict Electron security**: Never set `nodeIntegration: true`, never set `contextIsolation: false`, never disable `sandbox`.

---

## 8. React UI Rules

- **Feature-oriented layout**: Organize code into `features/*`, `components/ui/*`, `components/shared/*`, and `app/*`.
- **Keep components small**: Build focused, single-purpose components.
- **Avoid unnecessary global state**: Prefer local component state and React Context when required. Do not introduce Redux/Zustand prematurely.
- **Reuse shadcn/ui**: Prefer existing shadcn/ui components before adding new UI libraries.

---

## 9. Mandatory Verification Workflow

After making any code changes, always execute:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Fix any errors or warnings before declaring a task complete.
