# MapPoster Requirements (Reverse Engineered)

## 1. Product Overview
MapPoster is a web app for creating high-resolution printable map posters.
Users can search for a location, style the map and labels, preview the result at print proportions, and export the final poster.

## 2. Goals
- Generate aesthetically pleasing map posters for print and digital use.
- Provide a WYSIWYG-style preview that reflects export output.
- Support simple customization without design expertise.

## 3. Target Users
- Home decor customers.
- Gift creators.
- Social media creators.
- Print studios needing quick location poster generation.

## 4. Functional Requirements

### 4.1 Location Search
- User can type a location query in a search box.
- Search should begin only after minimum 3 characters.
- Search input should be debounced.
- User can select a result to center the map.
- On selection, title/subtitle should auto-populate from selected place name.

### 4.2 Map Rendering
- App must render an interactive vector map.
- User can pan/zoom map.
- Current camera state (center, zoom) must sync to app state.
- User can switch map themes.

### 4.3 Poster Layout
- User can choose predefined layout presets.
- User can choose output resolution preset (A4, A3, Square).
- User can override layout padding (default/none/small/medium/large).
- Preview should scale to available viewport while preserving poster ratio.

### 4.4 Label Customization
- User can edit title and subtitle text.
- User can toggle coordinate visibility.
- User can toggle location pin visibility.
- User can choose title/subtitle/coordinate colors.
- User can toggle italic and underline styles.
- User can choose font family.
- User can adjust letter spacing.
- User can adjust title size and subtitle size.

### 4.5 Pin Customization
- User can choose pin icon type (pin/heart/home).
- User can choose pin color.

### 4.6 Export
- User can trigger poster export.
- Export formats presented in UI: PNG, JPEG, PDF, SVG.
- Exported file must include map, frame/padding, labels, and optional pin.
- Exported output must use selected resolution dimensions.

## 5. Data Requirements
- Theme definitions loaded from JSON.
- Layout definitions loaded from JSON.
- Theme contains map palette and UI palette fields.
- Layout contains padding, border width, label position.

## 6. Non-Functional Requirements

### 6.1 Performance
- UI interactions should remain responsive during map manipulation.
- Search requests should be throttled/debounced.
- Export should complete within practical time for high-resolution posters.

### 6.2 Reliability
- Export failures should surface clear user feedback.
- Search failures should fail gracefully and not crash UI.

### 6.3 Usability
- Controls should be understandable with minimal onboarding.
- Preview should be visually close to exported result.

### 6.4 Maintainability
- Core domain types should be strongly typed (avoid any).
- Lint should pass without errors.
- Key export/search logic should be testable.

## 7. Constraints
- Frontend stack: Next.js App Router + React + TypeScript.
- Map rendering: MapLibre GL.
- Search provider: Nominatim endpoint.
- Export pipeline: Canvas + jsPDF.

## 8. Out of Scope (Current)
- User accounts and saved projects.
- Multi-language UI.
- E-commerce checkout flow.
- Collaboration or shared editing.

## 9. Known Gaps Discovered During Reverse Engineering
- SVG is exposed in UI/types but export handling is not implemented.
- Coordinate visibility toggle is respected in preview but not in export.
- Geocoding request currently runs client-side with restricted header usage.
- Type-safety and lint debt exists in multiple files.

## 10. Acceptance Criteria (Baseline)
- User can search and select a place.
- Map updates to selected location.
- User can customize labels/theme/layout/pin.
- User sees scaled poster preview.
- User can export PNG/JPEG/PDF successfully.
- App handles network/export failures without crashing.
