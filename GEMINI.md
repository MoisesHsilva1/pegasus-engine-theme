# GEMINI.md — Pegasus Engine Theme

> Strict engineering principles, architecture rules, security constraints, Git workflow, and execution rules for AI coding agents working on the Pegasus Engine Theme codebase.

---

# 1. Core Engineering Principles

## 1.1 Read Before Modifying

Before changing anything:

* Inspect the relevant files.
* Understand the existing architecture and data flow.
* Identify existing services, utilities, types, and conventions.
* Reuse existing implementations when appropriate.
* Never modify code based only on filenames or assumptions.

Do not start coding until you understand where the change belongs.

---

## 1.2 Think Before Coding

**Do not assume. Do not hide uncertainty.**

Before implementation:

* State important assumptions.
* Identify ambiguities.
* If multiple interpretations are possible, make them explicit.
* If requirements conflict with the existing architecture, point that out.
* Prefer the simplest valid interpretation.
* Ask for clarification when ambiguity materially affects the implementation.

Never silently invent requirements.

---

## 1.3 Simplicity First

Implement the **minimum code necessary** to solve the requested problem.

Do not introduce:

* speculative features
* unnecessary abstractions
* premature design patterns
* generic frameworks
* configuration systems that were not requested
* wrappers used only once
* unnecessary dependencies

Ask:

> "Would a senior engineer consider this over-engineered?"

If yes, simplify it.

---

## 1.4 Surgical Changes

Only modify code directly related to the task.

Do not:

* refactor unrelated code
* rewrite working implementations
* change formatting unnecessarily
* rename unrelated variables
* reorganize unrelated files
* remove unrelated dead code
* "clean up" adjacent code

Every changed line should have a clear relationship to the requested task.

### Exception

If your changes create unused:

* imports
* variables
* functions
* types
* files

remove those orphans.

Do not remove pre-existing dead code unless explicitly requested.

---

# 2. Architecture

Pegasus follows a layered Electron architecture:

```text
Renderer
   ↓
Preload
   ↓
IPC
   ↓
Main
   ↓
Pegasus Engine
   ↓
Fedora / GNOME / System
```

Responsibilities must remain inside their appropriate layer.

---

# 3. Renderer Rules

Location:

```text
src/renderer
```

The Renderer is responsible exclusively for UI and presentation logic.

## MUST NOT

Never:

* import Node.js core modules
* access the filesystem directly
* execute shell commands
* access `process` for system operations
* import files from `src/main`
* import files from `src/preload`
* use Electron privileged APIs directly
* execute Fedora commands
* manipulate system configuration directly

Examples of forbidden imports:

```ts
import fs from "fs";
import path from "path";
import { exec } from "child_process";
```

## System Communication

All system interaction must happen through:

```ts
window.pegasus
```

The Renderer communicates with the operating system exclusively through the typed Preload bridge.

---

# 4. Preload Rules

Location:

```text
src/preload
```

Preload is a **thin security boundary**.

## MUST

Use:

```ts
contextBridge.exposeInMainWorld(...)
```

Expose only explicitly approved and strongly typed APIs.

## MUST NOT

Never expose:

```ts
ipcRenderer
desktopCapturer
shell
process
```

or any other raw Electron object directly to the Renderer.

Do not create generic APIs such as:

```ts
exec(command)
readFile(path)
writeFile(path)
runShell(command)
```

The bridge must expose domain-specific operations instead.

### Good

```ts
theme.apply(themeId)
wallpaper.set(path)
system.getInfo()
```

### Bad

```ts
execute(command)
readFile(path)
run(command)
```

The goal is to keep the attack surface small and the API intentional.

---

# 5. Main Process Rules

Location:

```text
src/main
```

The Main process owns privileged Electron and Node.js operations.

## Responsibilities

Main may handle:

* Node.js APIs
* filesystem access
* child processes
* Electron APIs
* IPC registration
* OS-level operations

## IPC Handlers

IPC handlers must remain thin.

They should:

1. Validate the incoming payload.
2. Call the appropriate Engine service.
3. Return a typed result.

Example:

```ts
ipcMain.handle("theme:apply", async (_, payload) => {
  const input = validateThemePayload(payload);

  return themeService.apply(input);
});
```

Do not put business logic inside IPC handlers.

## MUST NOT

Main must not contain:

* React components
* UI state
* DOM manipulation
* presentation logic
* large business workflows

Delegate business logic to Pegasus Engine services.

---

# 6. Pegasus Engine

Location:

```text
src/main/engine
```

The Pegasus Engine contains the application's domain and system-management logic.

Examples:

```text
ThemeService
WallpaperService
SystemService
TerminalService
PackageService
```

## Engine Rules

Engine code must:

* be independent from React
* be independent from the DOM
* be independent from Renderer code
* be unit testable without creating an Electron window
* encapsulate Fedora-specific operations
* expose clear domain-oriented APIs

Example:

```ts
themeService.apply(theme)
```

instead of exposing implementation details such as:

```ts
exec("gsettings ...")
```

through the entire application.

---

# 7. Fedora Environment

Pegasus targets:

```text
Fedora Linux + GNOME
```

Fedora is the primary and assumed environment.

Prefer native mechanisms such as:

```text
gsettings
dnf
flatpak
systemctl
dconf
GNOME configuration files
```

Do not create cross-platform abstraction layers unless explicitly requested.

Do not implement support for other operating systems speculatively.

Fedora-specific behavior should remain isolated inside Engine services.

---

# 8. Security

Security is a mandatory architectural constraint.

## 8.1 Validate IPC Input

Every IPC payload must be validated before reaching Engine services.

Never trust Renderer input.

---

## 8.2 Never Interpolate Shell Arguments

Never build commands using string interpolation.

### Forbidden

```ts
exec(`dnf install ${packageName}`);
```

### Preferred

```ts
execFile("dnf", ["install", packageName]);
```

or:

```ts
spawn("dnf", ["install", packageName]);
```

Arguments must remain separate from the executable command.

---

## 8.3 Electron Security

Never use:

```ts
nodeIntegration: true
contextIsolation: false
sandbox: false
```

Do not weaken Electron security to make an implementation easier.

If an API requires privileged access, expose a narrow capability through Preload.

---

# 9. React UI Architecture

Location:

```text
src/renderer
```

Prefer feature-oriented organization:

```text
features/
components/
  ui/
  shared/
app/
```

## Components

Components should be:

* small
* focused
* reusable when appropriate
* responsible for a single UI concern

Avoid components that simultaneously handle:

* complex system operations
* filesystem access
* IPC
* business logic
* presentation

Move those responsibilities into the appropriate layer.

---

# 10. State Management

Prefer the simplest state mechanism that solves the problem.

Use:

1. local React state when possible
2. React Context when shared state is required
3. existing project state infrastructure when already established

Do not introduce Redux, Zustand, or another state library unless there is a concrete architectural reason.

Do not create global state for local concerns.

---

# 11. UI Libraries

Prefer existing project dependencies.

When using shadcn/ui:

* reuse existing components
* follow existing conventions
* avoid duplicating components
* do not introduce another UI framework without justification

Do not add dependencies simply because they make one component slightly easier.

---

# 12. Dependencies

Do not add external dependencies without justification.

Before adding a dependency:

1. Check whether the project already provides the required functionality.
2. Check whether a small local implementation is sufficient.
3. Check whether an existing dependency can solve the problem.
4. Consider maintenance and security implications.

A dependency must solve a meaningful problem.

---

# 13. Git Workflow

All development tasks must start from the latest `main` branch.

**Never implement a task directly on `main`.**

The required workflow is:

```text
main
  ↓
update from origin
  ↓
create task branch
  ↓
implement
  ↓
verify
  ↓
commit
  ↓
push
```

The agent must not modify source code before the task branch exists.

---

## 13.1 Start From `main`

Before starting any task:

```bash
git checkout main
git pull origin main
```

Verify the working tree:

```bash
git status
```

The working tree must not contain unrelated uncommitted changes.

If unrelated changes exist:

* do not overwrite them
* do not reset them
* do not delete them
* do not stash them automatically

Ask for explicit permission before performing destructive or state-changing Git operations.

---

## 13.2 Create a Task Branch

Every task must have its own branch created from the updated `main`.

Branch naming convention:

```text
<type>/<short-description>
```

Examples:

```text
feature/add-card
feature/theme-selector
feature/wallpaper-sync

fix/wallpaper-not-updating
fix/ipc-validation

refactor/theme-service

test/theme-service

docs/update-readme
```

Create the branch:

```bash
git checkout -b feature/add-card
```

### Branch Rules

Branch names must:

* describe the task
* use lowercase
* use hyphens
* use an appropriate type prefix

Avoid vague names:

```text
changes
test
new
fix
branch1
temp
work
```

---

## 13.3 Implement Only On the Task Branch

All changes for the task must be made exclusively on the task branch.

Never:

* commit task changes directly to `main`
* switch branches and continue the task without reason
* mix unrelated work into the task branch

---

## 13.4 Verify Before Commit

Before creating a commit, run:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

All required checks must pass.

If any check fails:

```text
Fix → Run again → Verify
```

Do not commit broken code unless explicitly instructed.

---

## 13.5 Review the Diff

Before committing:

```bash
git status
git diff
```

Verify:

* only task-related files changed
* no debug code remains
* no unrelated modifications were introduced
* no secrets or credentials are included
* architecture rules are preserved
* security boundaries remain intact

---

## 13.6 Commit

Create focused commits using conventional commit style.

Examples:

```bash
git add .
git commit -m "feat: add card component"
```

```bash
git commit -m "fix: synchronize wallpaper updates"
```

```bash
git commit -m "refactor: simplify theme service"
```

Preferred commit prefixes:

```text
feat
fix
refactor
test
docs
chore
```

Do not create commits containing unrelated changes.

---

## 13.7 Push

Push the task branch:

```bash
git push -u origin feature/add-card
```

Never push task changes directly to `main`.

---

## 13.8 Pull Requests

When the task is complete, the expected integration path is:

```text
feature/add-card
       ↓
Pull Request
       ↓
main
```

Do not merge directly into `main` unless explicitly requested and authorized.

---

# 14. Goal-Driven Execution

Every task must have a clear definition of success.

Convert vague goals into verifiable outcomes.

Example:

```text
"Add validation"
```

becomes:

```text
1. Identify invalid inputs.
2. Add tests covering them.
3. Implement validation.
4. Verify tests pass.
```

For a bug:

```text
1. Reproduce the bug.
2. Create or identify a regression test.
3. Implement the smallest fix.
4. Verify the regression test.
5. Run the complete verification workflow.
```

Do not declare a task complete because the code "looks right."

---

# 15. Implementation Workflow

For every non-trivial task:

## Step 1 — Understand

Inspect:

* relevant files
* architecture
* existing implementations
* types
* tests
* related services

## Step 2 — Git Setup

Ensure the task starts from the latest `main`:

```bash
git checkout main
git pull origin main
git checkout -b <type>/<short-description>
```

Do not modify source code before creating the task branch.

## Step 3 — Plan

Create a short implementation plan.

Example:

```text
1. Update ThemeService.
2. Add IPC endpoint.
3. Expose typed Preload API.
4. Connect Renderer feature.
5. Add tests.
6. Run verification.
```

Do not create unnecessary plans for trivial changes.

## Step 4 — Implement

Make the smallest change that satisfies the requirement.

Follow existing project conventions.

## Step 5 — Verify

Run:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Step 6 — Fix

If verification fails:

* identify the actual cause
* fix it
* rerun verification

Do not ignore failures.

## Step 7 — Review

Inspect:

```bash
git status
git diff
```

Verify that the final diff is focused and intentional.

## Step 8 — Commit

Create a focused conventional commit.

## Step 9 — Push

Push the task branch:

```bash
git push -u origin <branch-name>
```

## Step 10 — Complete

The task is complete only after the implementation is verified and the branch has been pushed.

---

# 16. Mandatory Verification

After making code changes, always run:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

All four commands must pass before declaring the task complete.

If a command fails:

```text
Fix → Run again → Verify
```

Do not report success while required verification is failing.

---

# 17. Change Scope Rules

Before finishing, ask:

> Did every changed line contribute directly to the requested task?

If not, revert the unrelated change.

The preferred diff is:

```text
small
focused
reviewable
testable
```

Not:

```text
large
clever
architecturally "improved"
unrelated
```

---

# 18. AI Agent Behavior

AI agents working on Pegasus must behave as engineering collaborators, not autonomous refactoring tools.

## Do

* inspect before editing
* question unclear requirements
* identify assumptions
* preserve architecture
* reuse existing code
* make minimal changes
* write or update tests when appropriate
* verify all changes
* report relevant tradeoffs
* report limitations honestly
* follow the Git workflow
* create a dedicated branch for every task

## Do Not

* invent requirements
* silently change architecture
* refactor unrelated code
* add speculative features
* add unnecessary dependencies
* bypass security restrictions
* ignore failing tests
* modify code directly on `main`
* commit directly to `main`
* claim completion without verification

---

# 19. Completion Criteria

A task is complete only when:

* The requested behavior is implemented.
* The implementation follows the existing architecture.
* The work was performed on a dedicated task branch.
* The branch was created from the latest `main`.
* No unrelated code was changed.
* Security boundaries remain intact.
* Relevant tests exist or were updated when necessary.
* Type checking passes.
* Lint passes.
* Tests pass.
* Build passes.
* The final diff was reviewed.
* The task branch was pushed to the remote repository.

Mandatory verification:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Only after all required checks pass should the task be considered complete.

---

# 20. Engineering Priority

When making decisions, prioritize in this order:

```text
1. Correctness
2. Security
3. Simplicity
4. Maintainability
5. Testability
6. Performance
7. Convenience
```

Do not sacrifice architecture or security merely to make an implementation faster to write.

---

# 21. Final Rule

> **Understand first. Branch from `main`. Change minimally. Verify everything.**

When requirements are unclear, stop and clarify.

When the architecture already provides a solution, use it.

When a simple solution works, do not build a framework.

When something fails, investigate the cause instead of hiding the failure.

When starting a task, always:

```text
main
  ↓
git pull
  ↓
feature/<task>
  ↓
implement
  ↓
test
  ↓
review
  ↓
commit
  ↓
push
  ↓
Pull Request
  ↓
dev
```

The goal is not to produce the most code.

The goal is to produce the **smallest correct, secure, maintainable, and verifiable change that solves the requested problem.**
