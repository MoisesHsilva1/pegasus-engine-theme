# EPIC-THEME-STALESS — Stateless Theme Interface

## Goal

Make the Pegasus Engine Theme selection interface stateless by removing indicators of which theme is "active". The goal is to ensure visual consistency and prevent the UI from showing incorrect information if the system theme is changed externally, improving the reliability of the customization experience.

## Scope

### Included

- Removal of "active" or "selected" state visual indicators from the theme list.
- Maintenance of the functionality to apply a theme immediately upon clicking.

### Excluded

- Real-time synchronization or detection of GNOME/Fedora theme settings to reflect in the application interface.
- Addition of a persistent theme history notification system.
- Other UI changes not related to theme selection and display.

## Included Behavior

- When opening the theme list, no theme should be marked as active.
- When clicking a theme, the change is applied to the system, but the clicked theme does not receive any "active" styling in the list.
- The experience should always feel like a fresh selection.

## Epic-Level Acceptance Criteria

- [ ] The application interface does not store or display the state of which theme is selected/active.
- [ ] Users can click on themes and see the immediate result applied to the system without the interface marking them as "active".
- [ ] Visual consistency and interface clarity remain intact.

## Dependencies

### Depends On

- None

### Blocks

- None

## Traceability

### PRD Requirements

- REQ-001
- REQ-002

### Unmapped Requirements

- None

## Non-Functional Requirements

- Aesthetic consistency: The UI should not look "broken" due to the absence of the active indicator; it should look like an intentional and clean behavior.
- Technical limitation respected: The state removal meets the constraint of not being able to perfectly observe the GNOME state in a simple way.

## Status

Proposed
