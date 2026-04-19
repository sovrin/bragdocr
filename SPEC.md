# Bragdoc Platform

## Concept & Vision

Personal brag doc website for **Oleg Kamlowski**. Each markdown file in `brags/` represents one period (e.g. `2026-02.md`). The interface is a light-mode editorial reading experience — professional, typographic, minimal.

## Design Language

**Aesthetic Direction**: Light editorial — premium internal document meets print magazine. Clean, confident, serif-driven.

**Color Palette**:

- Background: `#fafaf9`
- Background secondary: `#f5f5f4`
- Accent: `#c2410c` (burnt orange — highlight, borders, indicators)
- Accent light: `rgba(194, 65, 12, 0.07)`
- Text primary: `#1c1917`
- Text secondary: `#57534e`
- Text muted: `#a8a29e`
- Border: `#e7e5e4`
- Border strong: `#d6d3d1`

**Typography**:

- Display/Body: `Newsreader` (serif, italic weight used for period headlines and section titles)
- UI: `Instrument Sans` (labels, buttons, section title labels in list view)
- Mono: `DM Mono` (eyebrow, section numbers, period metadata, dates)

**Spatial System**:

- Max content width: 720px
- Container padding: 72px 40px 160px (desktop)
- Entry padding: 48px 0
- Section padding: 40px 0

**Motion**:

- Page load: header staggered reveal (opacity + translateY, 800ms cubic-bezier)
- Divider: reveal at 200ms delay
- Entries: staggered by 60ms per item
- Hover: left accent bar fades in via `::before` pseudo-element

## Layout & Structure

**Two views (hash-based routing)**:

1. **Index view** (`#` empty): All periods listed, full content per entry
2. **Detail view** (`#{filename}`, e.g. `#2026-02`): Single period, sections stacked

**Header** (static, always visible):

- Eyebrow: `BRAG DOC` (mono, uppercase, accent color)
- Name: `Oleg Kamlowski` (large display serif, hero element)
- Meta: dynamic — period count in index view; period + role + back button in detail view
- Header has `border-top: 3px solid var(--accent)` on `body` (editorial top rule)

**Responsive**:

- Desktop: centered column, left accent bar on entries
- Mobile (≤480px): full-width, reduced padding, accent bar hidden, section numbers stack above titles

## Markdown Format

One file per period in `brags/`, named `YYYY-MM.md`:

```md
# Brag Doc

**Role:** Senior Software Developer
**Period:** 2026-03

## 1. Key Wins

- Led the redesign of the main dashboard...

## 2. Technical Impact

- Reduced build time by 40%...

## 3. Leadership & Collaboration

- Mentored two junior developers...

## 4. Ownership & Initiative

- Proposed and drove adoption of...

## 5. Growth & Feedback

- Completed advanced TypeScript...

## 6. Evidence (optional)

Links to PRs, documents, metrics...
```

**Parsing Rules** (`src/brags.ts`):

- Name falls back to `'Oleg Kamlowski'` (regex `# Brag Doc — (.+)` optional)
- `**Role:** Value` → role metadata
- `**Period:** Value` → period metadata (e.g. `2026-02`)
- `## N. Section Name` → section with number + title
- `- item` → `<ul class="brag-list"><li>` with accent dash indicator
- `[text](url)` → `<a class="brag-link">` styled anchor
- Files sorted descending by period string

## Features & Interactions

**Index view**:

- Period formatted as `"February 2026"` (via `formatPeriod()` in `app.js`)
- Period shown as large italic display type; role in muted UI font beside it
- Section titles shown as tiny uppercase labels above content
- Left accent bar (`::before`) fades in on entry hover
- Period color shifts to accent on hover
- Click entry → navigates to detail view via hash

**Detail view**:

- Section number (`01`, `02`…) in accent mono, section title in italic serif
- Section content indented 38px (aligned past the number)
- Back button → returns to index

**Page title**: Updates on navigation (`"Oleg Kamlowski — Brag Doc"` / `"February 2026 — Oleg Kamlowski"`)

## API

- `GET /api/docs` — list of `DocMeta[]` (filename, name, role, period)
- `GET /api/docs/full` — list of full `BragDoc[]` with sections (used by frontend)
- `GET /api/docs/:filename` — single `BragDoc` by filename
- `GET /api/doc` — latest doc only (legacy)

```json
{
    "filename": "2026-02.md",
    "title": "Brag Doc — Oleg Kamlowski",
    "name": "Oleg Kamlowski",
    "role": "Senior Software Developer",
    "period": "2026-02",
    "sections": [
        {
            "number": 1,
            "title": "Key Wins",
            "content": "<ul class=\"brag-list\">...</ul>"
        }
    ]
}
```

## Technical Approach

**Stack**: Node.js + Express + TypeScript, served via `tsx`

**File Structure**:

```
src/
├── brags.ts      # MD parsing, file loading
├── server.ts     # Express server (port 3000)
public/
├── index.html    # Static shell — eyebrow + author name hardcoded
├── style.css     # All styles
├── app.js        # Bragdoc class — routing, render, formatPeriod
brags/
└── YYYY-MM.md    # One file per period
```

**Start**: `npm start` → `tsx src/server.ts` → `http://localhost:3000`
