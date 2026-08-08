# TASK-001 — Implement Wallpaper Content Hashing

## Parent Epic

EPIC-UPDATE-WALPAPER-THEME — update-walpaper-theme

## Objective

Create a utility function to reliably compute a unique content hash (e.g. SHA-256) of a wallpaper file to serve as a cache-busting version identifier.

## Scope

### In Scope

- Implement a fast file hashing utility (e.g., using Node's native `crypto` module).
- Expose a method to asynchronously compute the hash given a file path.

### Out of Scope

- Integrating the hash into the theme or wallpaper services.
- Updating `gsettings` or existing caching mechanisms.

## Implementation Context

- The hashing mechanism should use streams to prevent memory issues with large image files.
- Can be added directly in the `WallpaperService` class or as a separate utility within `src/main/engine/themes/`.

## Expected Result

- A utility or class method exists that accepts a file path and returns its hash string (e.g. first 12 chars of SHA-256) efficiently.

## Acceptance Criteria

- [ ] Function returns a consistent hash for identical files.
- [ ] Function returns a different hash when the file content changes, even if the file size is exactly the same.
- [ ] Uses streams to process files to ensure a low memory footprint.

## Verification

- Write a unit test that verifies hashing of small and medium files, ensuring identical content produces identical hashes, and changes produce different hashes.

## Dependencies

### Depends On

- None

### Blocks

- TASK-002

## Traceability

Parent Epic:
EPIC-UPDATE-WALPAPER-THEME

PRD traceability:
Inherited through EPIC-UPDATE-WALPAPER-THEME.

## Status

Completed
