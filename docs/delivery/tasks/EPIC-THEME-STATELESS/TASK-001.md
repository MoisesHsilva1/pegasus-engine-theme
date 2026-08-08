# TASK-001 — Remove "active" state indicators from the user interface (Renderer)

## Parent Epic

EPIC-THEME-STALESS — Stateless Theme Interface

## Objective

Remove the display and state management of the active theme in the Renderer (React) layer, ensuring that the theme list is completely stateless and does not show visual indicators of the current theme.

## Scope

### In Scope

- Modify `ThemesView.tsx`, `CurrentTheme.tsx` (if applicable), and any other React components to remove the logic that determines if a theme is the "active" one.
- Remove visual styles (borders, badges, "Active" texts) linked to the active state.
- Keep the click event that applies the user's chosen theme.

### Out of Scope

- Modifications in `Preload` or the `Main/Engine` process (this will be handled in another task).
- Changes to the general layout of the theme list that do not involve the "active" state.

## Implementation Context

Currently, components like `ThemesView.tsx` fetch and keep the active theme information (`activeTheme`) in the state. This logic should be removed from React. Only the list of available themes should be rendered, and clicking on one should only dispatch the apply command.

## Expected Result

The user interface will list themes normally, allowing the user to click and apply any theme. No theme will have an indicator of being selected, neither at the beginning nor after clicking.

## Acceptance Criteria

- [ ] The themes screen no longer displays the "active" border or badge.
- [ ] The `CurrentTheme` component (if used only to display the current theme on the home screen) is adjusted or removed according to the new stateless approach.
- [ ] Theme application continues to work when clicking a theme's card.

## Verification

- Open the app and navigate to the themes list; no theme should appear selected.
- Click on a theme; the OS must change the theme, but the UI must not add a visual selection state to the card.

## Dependencies

### Depends On

- None

### Blocks

- TASK-002

## Traceability

Parent Epic:
EPIC-THEME-STALESS

PRD traceability:
Inherited through EPIC-THEME-STALESS.

## Status

Pending
