# TASK-002 — Remove active theme reading functions from IPC and Preload (Clean-up)

## Parent Epic

EPIC-THEME-STALESS — Stateless Theme Interface

## Objective

Remove the APIs and IPC handlers from the Main process and Preload that provided the "currently active theme" information, since the Renderer will no longer need this information.

## Scope

### In Scope

- Remove methods like `getActiveTheme` (or equivalent) from the Preload file.
- Remove corresponding IPC handlers in the Main process.
- Remove functions for querying the current state from the `ThemeService` in the Engine if they are no longer used internally.

### Out of Scope

- Removal of the functionality to *apply* the theme (`applyTheme`).
- Modifications in the Renderer layer (handled in TASK-001).

## Implementation Context

With the stateless interface, we no longer need to query GNOME/Fedora (or cache) to know which theme is active when the app opens. Removing this API reduces the attack surface in Preload and simplifies `ThemeService`.

## Expected Result

The Preload bridge (`window.pegasus.theme`) will no longer have the capability to query the active theme, exposing only the ability to list available themes and apply a chosen theme.

## Acceptance Criteria

- [ ] Current theme query IPC handler removed from Main.
- [ ] Query function removed from Preload (`contextBridge`).
- [ ] Engine service cleaned of unused functions regarding querying the system's current theme.

## Verification

- `pnpm typecheck` and `pnpm lint` must pass, confirming the removal didn't break anything still depending on this API.
- Unit tests must pass (and tests related to fetching the active theme must be removed).

## Dependencies

### Depends On

- TASK-001

### Blocks

- None

## Traceability

Parent Epic:
EPIC-THEME-STALESS

PRD traceability:
Inherited through EPIC-THEME-STALESS.

## Status

Pending
