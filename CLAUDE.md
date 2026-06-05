# PackMate — Project Context

## Overview
PackMate is a single-file React packing checklist web app with an "Indiana Jones Grail Diary" visual theme. Users plan trips by selecting an activity, duration, weather, people, and add-ons, then get a fully generated packing checklist they can check off, print, and save. All data persists via localStorage.

The app ships as a PWA (Progressive Web App) that can be installed on Android home screens and works offline.

## File Structure
```
packmate-pwa/
├── index.html       # Standalone PWA HTML (React + Babel via CDN, localStorage shim)
├── manifest.json    # PWA web app manifest
├── sw.js            # Service worker for offline caching
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
└── CLAUDE.md        # This file
```

The source of truth is `packmate.jsx` (React component with `export default function PackMate()`). The `index.html` in the PWA package is a standalone build that wraps the same code with CDN React/Babel and a localStorage shim for `window.storage`.

## Architecture

### Single Component
The entire app is one React function component (`PackMate`) with ~2500 lines. No external state management, no router — screen navigation uses a `screen` state variable (`"home"` | `"setup"` | `"checklist"`).

### Data Constants (top of file, outside component)
- `ACTIVITY_TEMPLATES` — 6 built-in activities (camping, roadtrip, business, cabin, sleepover, other), each with `label`, `icon`, `color`, `groupItems[]`, and `items: { adult[], child[], baby[], pet[] }`
- `WEATHER_ADDITIONS` — 4 weather modifiers (hot, cold, rainy, humid) with extra items
- `FOOD_ITEMS` — per-activity food/drink lists, always included as their own checklist section. Baby/pet food items are filtered by keyword when those person types aren't present
- `ACTIVITY_ADDONS` — optional add-on packs (currently just "swimming") with items per person type + group
- `DURATION_ITEMS` — 4 overnight tiers (1+, 2+, 4+, 7+ nights) with items per person type. Support `{nights}`, `{nightsX2}`, `{nightsX8}` template placeholders
- `PERSON_TYPES` — immutable defaults: Adult 🧭, Child ⭐, Baby 🍼, Pet 🐾

### Storage Keys (localStorage)
| Key | Type | Purpose |
|-----|------|---------|
| `packmate-trips` | array | Saved trip checklists |
| `packmate-custom-addons` | object | User-created add-on packs |
| `packmate-template-overrides` | object | Per-activity/duration item customizations |
| `packmate-custom-activities` | object | User-created activity types |
| `packmate-hidden-activities` | array | Activity keys hidden from setup screen |
| `packmate-custom-icons` | object | Icon overrides for person types, group, food |

Storage is accessed via `saveToStorage(key, value)` and `loadFromStorage(key)` helpers that wrap `window.storage.get/set` (which maps to the Claude artifact API in-app, or localStorage shim in standalone HTML).

### Checklist Data Model
```javascript
{
  id: string,
  name: string,
  activity: string,          // activity key
  weather: string[],         // weather modifier keys
  nights: number,
  addons: string[],          // addon keys
  sections: [{               // one per person
    person: { id, type, name },
    items: [{ id, text, checked, addon?, duration?, weather?, custom? }]
  }],
  groupItems: [{ id, text, checked, addon?, duration?, custom? }],
  foodItems: [{ id, text, checked, activity?, custom? }],
  createdAt: string,
  groupByActivity?: boolean
}
```

### Key Derived State
- `allActivities` — merges `ACTIVITY_TEMPLATES` + `customActivities`
- `visibleActivities` — `allActivities` minus `hiddenActivities` (used on setup screen)
- `allAddons` — merges `ACTIVITY_ADDONS` + `customAddons`
- `personTypes` — `PERSON_TYPES` with `customIcons` applied (used for all rendering)
- `groupIcon` / `foodIcon` — from `customIcons` or defaults (⛺ / 🍽️)
- `getEffectiveActivityTemplate(key)` — merges base template with `templateOverrides`
- `getEffectiveDurationItems()` — merges duration items with overrides

### Key Functions
- `generateChecklist()` — builds full checklist from setup screen selections. Assembles per-person items (activity + weather + duration + addon), group items (for 2+ people), and food items (filtered by baby/pet keywords)
- `applyEdits()` — handles Edit Trip modal saves. Intelligently diffs added/removed people and addons, regenerates duration items when nights change, adds/removes baby/pet food items when party composition changes
- `loadTrip(trip)` — loads saved trip with backward compat (adds `foodItems` if missing from older saves)
- `reuseTrip(trip)` — deep clones a saved trip with fresh IDs and unchecked items
- `printChecklist()` — opens a print-friendly page in a new tab that auto-triggers the browser print dialog

### Food Item Filtering
Food items containing baby-related keywords (`baby|formula|sippy|onesie|infant|toddler`) are excluded when no Baby is in the party. Pet-related keywords (`\bpet\b|dog food|cat food`) are excluded when no Pet is in the party. This filtering runs at generation time, backward-compat loading, and in `applyEdits` when party changes.

## Screens

### Home Screen
- Settings gear (⚙️) → opens Settings modal
- "New Packing List" button → navigates to setup
- Saved trips list with progress rings, left-border accent in activity color
- Delete confirmation modal for saved trips

### Setup Screen
- Trip name input (handwritten Caveat font, underline-only style)
- Duration (nights) counter with +/− buttons and tier hints
- Activity grid (3-column, uses `visibleActivities`)
- Weather modifier toggles (multi-select)
- Add-on selection with custom add-on builder
- Person (expedition party) manager — add/remove/rename per type
- "Begin the Expedition" generate button

### Checklist Screen
- Print button + Edit button in header
- Overall progress bar
- Activity organization toggle (group add-on items by their source activity)
- Per-person sections with check/uncheck, delete, add custom items
- Food & Drinks section — its own collapsible section with activity icon badges
- Shared Gear section — group items for 2+ people
- Auto-saves to localStorage on every state change

## Settings Modal
- **Customize Default Lists** → two-level template editor (category picker → item editor with tabbed person types). Activities show visibility toggles (checkbox) and "+ New Activity" creator with icon/color picker
- **Customize Icons** → expandable icon picker for Adult, Child, Baby, Pet, Group, Food
- **Custom Add-ons** → expandable list with individual delete buttons + "Clear All"
- **Saved Trips** → count display + "Clear All"
- **Template Customizations** → "Reset All" (only shown if overrides exist)
- **Reset Everything to Factory Defaults** — nuclear option

All destructive actions use inline confirmation (Cancel/Confirm buttons appear in-place).

## Visual Design — "Grail Diary" Theme

### Colors
- Primary dark: `#3B2510` (dark leather brown)
- Secondary: `#5C3D1E` (warm brown)
- Muted text: `#8B5A2B` (sepia)
- Parchment background: gradient from `#F5E6C8` → `#D9B87A`
- Card backgrounds: `rgba(253,243,220,0.55–0.7)`
- Border color base: `rgba(139,90,43,...)` at various opacities
- Accent muted: `#A8895A`
- Each activity has its own `color` used for accents, progress bars, checkboxes

### Typography
- **Caveat** (cursive) — all headings, section labels, trip name input, modal titles
- **Crimson Pro** (serif) — body text, checklist items, descriptive text
- **DM Sans** (sans-serif) — small UI elements, buttons, badges, counts

### Decorative Elements
- Parchment texture overlay: repeating linear gradients simulating aged paper grid
- Globe/cartography SVG overlay: inline data URI SVG with latitude/longitude circles, compass rose, rhumb lines, coordinate markers — all at very low sepia opacity
- Ink divider lines under headings: `linear-gradient(90deg, rgba(139,90,43,0.4), transparent)`
- Dashed borders on section separators (`border-bottom: 1px dashed`)
- Left-border accents on cards (3px solid in activity color)

### Fonts loaded via Google Fonts
```
Caveat:wght@400;500;600;700
Crimson Pro:wght@300;400;500;600;700
Playfair Display:wght@700;800;900
DM Sans:wght@400;500;600
```

### Modals
All modals use `alignItems: "flex-start"` (top-aligned, not centered) with `padding: "40px 16px"` and `overflowY: "auto"` so they always appear at the top of the viewport.

## Deduplication Rules
Item lists have been carefully deduplicated across layers. When adding new items, check against:
1. **Activity person items** vs **group items** (no overlap within same activity)
2. **Activity items** vs **food items** (all food/drink/water bottles/snacks live in FOOD_ITEMS)
3. **Activity items** vs **duration items** (e.g., "Pajamas" only in duration, not activity-specific)
4. **Activity items** vs **weather items** (e.g., "Rain jacket" only in rainy weather modifier)
5. **Within the same list** (no internal duplicates)

Items common to ALL trips (e.g., "DSLR Camera" in groupItems, "Sunglasses" for all adults/children) are added to every activity template's list rather than handled by a separate mechanism.

## PWA Details
- `manifest.json`: standalone display, portrait orientation, theme `#3B2510`, background `#E8CFA0`
- `sw.js`: cache-first strategy, caches index.html + CDN scripts + fonts on install, serves from cache with network fallback, auto-caches successful fetches
- Icons: 192px and 512px PNGs with compass/parchment design and "P" monogram
- Service worker registered on page load in a `<script>` block after the Babel script

## Conventions
- All IDs generated via `Math.random().toString(36).substr(2, 9)`
- Inline styles throughout (no CSS modules/styled-components) — this is intentional for single-file simplicity
- `PERSON_TYPES` is the immutable constant; `personTypes` (lowercase p) is the runtime version with custom icons applied — always use `personTypes` in rendering
- Screen transitions use a simple `animateIn` state with CSS transition on opacity/transform
- Adventure-themed language: "Expedition," "Base camp," "Shared Gear," "Expedition Progress"
