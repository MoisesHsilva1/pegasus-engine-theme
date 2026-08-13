# EPIC-UPDATE-WALPAPER-THEME — update-walpaper-theme

## Goal

Ensure that whenever a theme is applied, the most up-to-date wallpaper asset from that theme is correctly loaded and applied to the desktop. This Epic focuses on resolving the issue where the wallpaper remains stuck on a previously cached version in packaged (installed) applications by bypassing any OS or application-level caching via a content-based strategy.

## Scope

### Included

- Implementation of a content-based caching strategy for wallpapers (e.g., file hashing).
- Updating the theme application pipeline to generate and utilize these unique hashes for the persistent cache.
- Ensuring the new caching strategy applies to both built-in (packaged) and custom user themes.
- Verifying the desktop environment (GNOME) receives the new cache-busting URI to force a reload.

### Excluded

- Modifying the way theme colors are applied.
- Support for handling different wallpapers per monitor.
- Support for desktop environments other than GNOME.
- Pre-processing or compressing the wallpaper image formats.

## Included Behavior

- When applying a theme, the system computes a unique hash from the wallpaper file's content.
- The wallpaper is copied to a persistent cache location using a filename that incorporates this hash.
- The OS (GNOME) is instructed to apply the wallpaper using the new unique URI.
- The UI remains responsive during this process.

## Epic-Level Acceptance Criteria

- [ ] When a new version of a packaged theme is installed containing a modified wallpaper, applying the theme correctly sets the new wallpaper on the desktop.
- [ ] When a custom theme's wallpaper is modified by the user, applying the theme correctly sets the new wallpaper.
- [ ] The user interface does not freeze or exhibit noticeable lag while processing and applying the wallpaper.
- [ ] The desktop environment does not display outdated wallpaper images after a theme's wallpaper asset has been updated.

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

- The identification (hashing) process for the wallpaper must be fast enough that it does not freeze or significantly delay the UI during theme application.
- Must work reliably within the Electron packaged environment (e.g. inside an `.asar` archive).
- Must integrate with the existing GNOME gsettings wallpaper mechanism.

## Status

In Progress
