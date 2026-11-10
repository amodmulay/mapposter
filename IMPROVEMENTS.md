# MapPoster Improvements Guide and Change Log

## Purpose
This file is the working guide for iterative improvement of the project and the running log of completed changes.

## How to Use
- Keep backlog prioritized from highest impact to lowest.
- Mark each item status: TODO, IN_PROGRESS, DONE, BLOCKED.
- For every completed change, add a log entry with date, files changed, and validation.

## Improvement Backlog (Prioritized)

1. [DONE] Fix export format mismatch
- Problem: SVG is available in UI/types but export logic does not implement SVG branch.
- Target files: src/components/Sidebar.tsx, src/app/page.tsx, src/lib/export/canvas.ts
- Success: either true SVG export exists or SVG option is removed from UI/types.

2. [TODO] Fix coordinates toggle behavior in export
- Problem: Coordinates are always drawn in export even when hidden in UI.
- Target files: src/app/page.tsx, src/lib/export/canvas.ts
- Success: exported poster respects showCoordinates setting.

3. [TODO] Move geocoding behind server route
- Problem: Browser-side geocoding with User-Agent header is unreliable and policy-sensitive.
- Target files: src/lib/geocoding.ts, src/app/api/*
- Success: client calls internal API route with proper rate-limit/caching handling.

4. [TODO] Resolve lint errors and strengthen types
- Problem: explicit any usage and ts-ignore create maintainability risk.
- Target files: src/components/Sidebar.tsx, src/lib/export/canvas.ts, src/lib/mapStyle.ts, src/components/Map.tsx
- Success: npm run lint returns zero errors.

5. [TODO] Improve export readiness robustness
- Problem: map readiness check may resolve before complete visual render.
- Target files: src/lib/export/canvas.ts
- Success: export waits for stable map render (idle + tile readiness with timeout fallback).

6. [TODO] Harden marker rendering
- Problem: marker SVG is built with innerHTML.
- Target files: src/components/Map.tsx
- Success: marker element built without direct HTML injection.

7. [TODO] Fix theme data quality and add validation
- Problem: invalid hex value exists in theme JSON.
- Target files: src/data/themes.json, optional schema validator module
- Success: all theme values pass validation.

8. [TODO] Remove dead dependencies/imports and add tests
- Problem: unused packages/imports and no tests.
- Target files: package.json, src/lib/mapStyle.ts, test files
- Success: dependency list is minimal and critical flows are test-covered.

9. [TODO] Fix layout and overlay preview rendering
- Problem: overlay layout positioning and gradient rely on utility classes that are not defined or imported, so labels may not overlay the map as intended.
- Target files: src/app/page.tsx, src/app/globals.css
- Success: every layout preset renders its labels and map in the intended positions across supported preview sizes.

10. [TODO] Match PDF page dimensions to print presets
- Problem: pixel dimensions are passed to jsPDF with pixel units, producing pages that do not match the selected physical paper size.
- Target files: src/app/page.tsx, src/lib/export/canvas.ts
- Success: exported PDFs use the correct physical dimensions for A4, A3, and square presets.

11. [TODO] Keep preview and exported poster consistent
- Problem: preview and export differ in label casing and map border/shadow decoration, and coordinate directions are always shown as north/east.
- Target files: src/app/page.tsx, src/components/Map.tsx, src/lib/export/canvas.ts
- Success: preview and exported image/PDF match for label text and map framing, and coordinates use correct hemisphere directions.

12. [TODO] Add print-focused preview confirmation
- Problem: users can edit a scaled poster preview and export, but cannot separately verify physical page dimensions and print margins before downloading.
- Target files: src/app/page.tsx, src/components/Sidebar.tsx, src/app/globals.css
- Success: users can inspect the selected print size and margins in a clear print-preview state before export.

## Change Log

## 2026-06-14
- Completed: Backlog item 1 (Fix export format mismatch).
  - Files: src/components/Sidebar.tsx, src/app/page.tsx, src/lib/export/canvas.ts, IMPROVEMENTS.md
  - Validation: UI format selector now lists PNG/JPEG/PDF only; export types now match implemented branches.

## 2026-06-01
- Added baseline reverse-engineered requirements document.
  - File: REQUIREMENTS.md
  - Validation: manual review of source modules and lint output.
- Added improvements guide and structured backlog with success criteria.
  - File: IMPROVEMENTS.md
  - Validation: backlog aligns with current known issues.
- Added low-token response skill template for user customization.
  - File: skill.md
  - Validation: template includes concise response constraints and output format.
