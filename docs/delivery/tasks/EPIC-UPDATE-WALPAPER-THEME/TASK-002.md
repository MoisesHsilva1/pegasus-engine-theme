# TASK-002 — Update Wallpaper Persistent Cache Logic

## Parent Epic

EPIC-UPDATE-WALPAPER-THEME — update-walpaper-theme

## Objective

Update the wallpaper application pipeline to use the content-based hash instead of the static file metadata for the cache version.

## Scope

### In Scope

- Update `getWallpaperInfo` and `copyWallpaperToPersistentLocation` in `WallpaperService` to use the new hashing utility.
- Update the cache cleanup logic to safely delete stale wallpaper cache files for the theme.

### Out of Scope

- Changing how themes are resolved.
- Altering the core behavior of `gsettings` execution.

## Implementation Context

- Modify `src/main/engine/themes/wallpaper.ts`.
- Replace the `version` generation `\${Math.floor(statSrc.mtimeMs)}-\${statSrc.size}` with the content hash.

## Expected Result

- The persistent copy of the wallpaper incorporates the content hash in its filename.
- Applying an updated packaged theme correctly applies the new wallpaper without freezing the UI.

## Acceptance Criteria

- [ ] `WallpaperService` generates the persistent path using the file hash.
- [ ] Old wallpaper files for the same theme are cleaned up from the cache directory.
- [ ] Packaged apps successfully reflect the new wallpaper upon theme application.

## Verification

- Run integration/unit tests for `WallpaperService`.
- Manually test applying a theme with an updated wallpaper in a packaged build or simulated static metadata environment.

## Dependencies

### Depends On

- TASK-001

### Blocks

- None

## Traceability

Parent Epic:
EPIC-UPDATE-WALPAPER-THEME

PRD traceability:
Inherited through EPIC-UPDATE-WALPAPER-THEME.

## Status

Completed
