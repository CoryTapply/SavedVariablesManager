# Handoff: SavedVariables Comparator — compare screen + results redesign

## Overview

The WoW SavedVariables Comparator is a desktop app that diffs two accounts' addon
SavedVariables files (WeakAuras.lua, Plater.lua, …), and can copy one account's file over
another's. Most of the app is already built. This handoff covers **one screen, redesigned
end to end**: the compare screen and the comparison results it produces.

Two things change:

1. **Selection is a single command bar**, not two stacked "Account A" / "Account B" form
   cards. Flavor, addon, account A, account B, Compare and Copy A → B all live in one
   horizontal toolbar.
2. **Results are a master–detail split**, not a long list of expandable per-aura rows. A
   scrollable list of changed auras on the left, the full field-level diff of the selected
   aura on the right.

A third, smaller change rides along: **accounts can be named and favorited** in settings, so
the app stops asking you to recognise `1234567890#12`. See §3.

They are one flow, not two screens: pressing **Compare** collapses the command bar into a
one-line context strip at the top of the window and opens the master–detail comparison
underneath it, in the same window. **Change selection** expands the bar again.

## About the design files

The files in this bundle are **design references written in HTML** — a prototype of the
intended look and behavior, not production code to paste in. Recreate these designs in the
app's existing environment (its current framework, component layer and styling approach),
following the patterns already established there. The HTML uses a small ad-hoc `.zp-*`
class layer purely so the prototype could be a single file; do not port that layer — map
each class to the equivalent Zerpy component or token usage in the real codebase.

The design system CSS in `design_system/` **is** production-usable: those token files are
the real thing and the values in this README come from them.

## Fidelity

**High fidelity.** Colors, typography, spacing, radii, elevation and motion are final and
all come from Zerpy tokens. Recreate the layout to the pixel where the measurements below
are given, and use the token variables rather than the literal hex values wherever possible.

Content is representative sample data (aura names, byte sizes, field paths). Copy strings in
labels, buttons, empty states, hints and the toast **are final** — use them verbatim.

---

## Screens / views

The redesign is one window with two states: **idle** (selection) and **compared** (results),
plus three overlays (settings dialog, copy toast, reveal-in-explorer dialog).

### Shell — both states

- Window ground: `background: var(--zp-ground)` over `background-color: var(--zp-bg)`.
- Starfield overlay: an absolutely positioned `inset: 0` layer, `pointer-events: none`,
  `opacity: var(--zp-starfield-opacity)` (.3), `background-image: var(--zp-starfield)`.
  One per window, above the ground, below all content.
- Body text defaults to `font: var(--zp-text-md)`, `color: var(--zp-text)`.
- Prototype frame width 1180px; the real window is resizable — everything below reflows.
  The results split has a fixed 360px left list and a flexible detail pane.

---

### 1. Idle state — selection

**Purpose:** choose a flavor, an addon, and two accounts, then compare or copy.

**Layout:** a single column, `padding: var(--zp-space-7) var(--zp-space-7) var(--zp-space-8)`
(32 / 32 / 40px), `display: flex; flex-direction: column; gap: var(--zp-space-6)` (24px).

**1.1 Header row** — `display: flex; align-items: flex-start; justify-content: space-between; gap: var(--zp-space-5)`.

Left column:
- Eyebrow (optional, shown on the standalone compare screen): "WoW Addon Comparator" —
  `font: var(--zp-text-micro)`, uppercase, `letter-spacing: var(--zp-tracking-micro)`,
  `color: var(--zp-accent-300)`.
- Title: **"Compare SavedVariables files"** — `font: var(--zp-text-h1)` (500 30px/1.16
  Instrument Sans), `color: var(--zp-text)`, `margin: 2px 0 0`.
- Description: **"Pick two accounts to see what changed between their SavedVariables files."**
  — `font: var(--zp-text-sm)`, `color: var(--zp-text-3)`, `margin: 6px 0 0`.

Right column — `display: flex; gap: var(--zp-space-3)`:
- Flavor pill: "Classic Era ▾" — pill control, `height: var(--zp-control-h-sm)` (30px),
  `padding: 0 var(--zp-space-4)`, `border-radius: var(--zp-radius-pill)`,
  `background: var(--zp-surface-2)`, `1px solid var(--zp-line)`, `font: var(--zp-text-sm)`,
  `color: var(--zp-text-2)`. Opens the flavor menu.
- Settings icon button: `⚙`, 38×38 (`var(--zp-control-h)`), `var(--zp-radius)`,
  `background: var(--zp-surface-2)`, `1px solid var(--zp-line)`, glyph 20px,
  `color: var(--zp-text-3)`. Opens the settings dialog.

**1.2 Command bar** — the core change. One `Panel`:
`background: var(--zp-surface-panel)`, `1px solid var(--zp-line)`,
`border-radius: var(--zp-radius)` (4px), `backdrop-filter: blur(var(--zp-blur-md))`,
`box-shadow: var(--zp-elev-panel)`, `padding: var(--zp-space-4)` (16px),
`display: flex; align-items: center; gap: var(--zp-space-4); flex-wrap: wrap`.

Contents, left to right:

| # | Element | Spec |
| --- | --- | --- |
| 1 | Addon select — "◆ WeakAuras" | 190px wide, `height: var(--zp-control-h)` (38px), `background: var(--zp-surface-field)`, `1px solid var(--zp-line)`, `var(--zp-radius)`, `padding: 0 var(--zp-space-4)`, label left / `▾` right in `var(--zp-text-4)`. No label above it — the addon glyph and name are self-evident. |
| 2 | Vertical divider | 1px × 28px, `background: var(--zp-line)` |
| 3 | Account A group | `flex-direction: column; gap: 4px`. Label "Account A" — `font: var(--zp-text-label)` at 10px, uppercase, `letter-spacing: var(--zp-tracking-micro)`, `color: var(--zp-text-3)`. Select 220px wide, same spec as (1), value `1234567890#5`. |
| 4 | Swap glyph | `⇄`, 18px, `color: var(--zp-text-4)`, `padding-top: 14px` to sit on the selects' centerline. Clicking it swaps A and B. |
| 5 | Account B group | Same as (3), value `1234567890#12`. |
| 6 | Spacer | `flex: 1` |
| 7 | **Compare** | Primary button: `height: var(--zp-control-h)`, `padding: 0 var(--zp-space-5)`, `var(--zp-radius)`, `background: var(--zp-accent)` (#9184d9), `color: var(--zp-text-on-accent)` (#0c0a18), `box-shadow: var(--zp-accent-glow)`, `font: var(--zp-text-label)`. Disabled when either account has no file for the selected addon. |
| 8 | **Copy A → B** | Ghost button: transparent, `1px solid var(--zp-line-strong)`, `color: var(--zp-text-2)`; hover `border-color: var(--zp-line-accent)`. |

**1.3 File summary row** (keep from today's screen, restated as pills) —
`display: flex; gap: var(--zp-space-4)`: pill · `WeakAuras.lua` in `var(--zp-text-data)` ·
"24.8 MB · account 5" in `var(--zp-text-sm)`/`var(--zp-text-4)`; a `→` in `var(--zp-text-4)`;
the same pill for B. When an account has no file for the addon, that pill shows
"no WeakAuras file yet" in `var(--zp-text-4)` at `opacity: .55` — this is where today's
inline "no file for this addon" feedback lives now.

**1.4 Results placeholder** — flat panel (`background: var(--zp-surface-1)`,
`1px solid var(--zp-line)`, `var(--zp-radius)`, **no blur** — it is inside the page, not a
second glass layer), `padding: var(--zp-space-8)`, centered,
`font: var(--zp-text-sm)`, `color: var(--zp-text-4)`, copy: **"Press Compare — this area
becomes the comparison"**. It occupies the space the results take, so nothing jumps.

---

### 2. Compared state — results

**Purpose:** scan which auras changed, then read one aura's full diff.

**2.1 Collapsed context strip** — replaces the command bar in place.
`flex-direction: column; padding: var(--zp-space-5) var(--zp-space-7); gap: var(--zp-space-4)`.

Row 1 (`display: flex; gap: var(--zp-space-4); flex-wrap: wrap`), 26px-tall pills:
- "Classic Era"
- "◆ WeakAuras"
- A pill: an `A` badge (success variant, 16px tall, `padding: 0 5px`) + `…#5` in
  `var(--zp-text-data)` + "24.8 MB" in `var(--zp-text-sm)`/`var(--zp-text-4)`
- `⇄` in `var(--zp-text-4)`
- B pill: a `B` badge (warning variant) + `…#12` + "24.1 MB"
- spacer, then a small ghost button **"Change selection"** (`height: var(--zp-control-h-sm)`,
  `padding: 0 var(--zp-space-4)`, 11.5px) → returns to the idle state.

Divider: `height: 1px; background: var(--zp-rule-fade)` (fades at both ends).

Row 2 — stat filter pills, one per change kind, each a real toggle:
- `● 8 added` (success dot #5ec48a) · `● 12 removed` (danger #e8636b) ·
  `● 116 changed` (warning #e8a44c). Dot is 7px, `border-radius: 999px`.
- Pill base: `height: var(--zp-control-h-sm); padding: 0 var(--zp-space-4); font: var(--zp-text-sm); color: var(--zp-text-2)`.
- Active pill: `background: var(--zp-accent-tint); border-color: var(--zp-line-accent); color: var(--zp-accent-200)`.
- Then "3417 unchanged, hidden" — `var(--zp-text-sm)`/`var(--zp-text-4)`, not a pill, not
  clickable (unchanged entries are never listed).
- When a filter is active, a **"Clear filter"** small ghost button appears at the end.

Full-width 1px `var(--zp-line)` divider below the strip.

**2.2 The split** — `display: flex; align-items: stretch`, fills the remaining window
height (560px in the prototype).

**Left: aura list** — `width: 360px; flex: none; border-right: 1px solid var(--zp-line); overflow-y: auto`.
- Sticky list toolbar: `padding: var(--zp-space-3) var(--zp-space-4)`,
  `border-bottom: 1px solid var(--zp-line)`, `background: var(--zp-bg-raised)`. Holds a
  filter field (`flex: 1`, `height: var(--zp-control-h-sm)`, `background: var(--zp-surface-field)`,
  `1px solid var(--zp-line)`, `padding: 0 10px`, placeholder "⌕ Filter…" in `var(--zp-text-4)`)
  and a segmented control showing the active kind ("All" / "Added" / "Removed" / "Changed"):
  `padding: 3px`, `background: var(--zp-surface-field)`, `1px solid var(--zp-line)`,
  `var(--zp-radius)`; active segment `background: var(--zp-accent-tint)`,
  `color: var(--zp-accent-200)`, `box-shadow: inset 0 0 0 1px var(--zp-accent-tint-strong)`,
  `border-radius: var(--zp-radius-xs)`.
- Row: `justify-content: space-between; padding: 10px var(--zp-space-4); border-bottom: 1px solid var(--zp-line); border-left: 2px solid transparent; cursor: pointer`.
  Left column (`gap: 2px`): aura name in `var(--zp-text-2)`; if the aura has a parent group,
  a second line "in Cooldowns" in `var(--zp-text-sm)`/`var(--zp-text-4)`. Right: a badge —
  for changed auras the **field count as a bare number** (warning variant), for added/removed
  the word "added" / "removed" (success / danger variant).
- Selected row: `border-left: 2px solid var(--zp-accent); background: var(--zp-accent-tint)`,
  name becomes `font: var(--zp-text-label); color: var(--zp-text)`.
- Hover (unselected): `background: var(--zp-surface-2)`, `border-left-color: var(--zp-line-accent)`.
- Footer row: "… 131 more" in `var(--zp-text-sm)`/`var(--zp-text-4)`,
  `padding: 10px var(--zp-space-4)`. In the real app the list is long — virtualize it; the
  count reflects the active filter (all 131 / added 7 / removed 11 / changed 113).

**Right: detail pane** — `flex: 1; overflow-y: auto; padding: var(--zp-space-5) var(--zp-space-6); gap: var(--zp-space-4)`.
- Head row: kind badge ("changed" / "added" / "removed") + aura name in
  `font: var(--zp-text-h3)` + "in Cooldowns" in `var(--zp-text-sm)`/`var(--zp-text-4)`;
  right-aligned summary "4 fields changed" (or "Only in account 12") in the same muted style.
- 1px `var(--zp-line)` divider.
- One block per changed field, `gap: var(--zp-space-2)`:
  - Header: a "changed" warning badge + the field path in `var(--zp-text-data)`,
    `color: var(--zp-text-3)`, written with `›` separators — e.g. `load › class`,
    `actions › init › custom`, `trigger › 1 › spellName`.
  - **Scalar values** render inline: before in `var(--zp-danger)`, a `→` in
    `var(--zp-text-4)`, after in `var(--zp-success)`, all `font: var(--zp-text-data)`,
    `gap: var(--zp-space-3)`, `padding-left: 4px`.
  - **Multi-line / code values** render as a two-column diff grid:
    `1px solid var(--zp-line)`, `var(--zp-radius)`, `overflow: hidden`. Header strip —
    `padding: 6px var(--zp-space-3)`, `background: var(--zp-surface-1)`,
    `border-bottom: 1px solid var(--zp-line)`, `font: var(--zp-text-micro)`, uppercase,
    `letter-spacing: var(--zp-tracking-micro)`, `color: var(--zp-text-4)`: "Before → After"
    on the left, the line counts on the right (`+2` in `var(--zp-success)`, `-1` in
    `var(--zp-danger)`). Body — `display: grid; grid-template-columns: 1fr 1fr`; each cell
    `padding: 8px var(--zp-space-3)`, `font: var(--zp-text-data)`, `color: var(--zp-text-2)`,
    `white-space: pre`; left cell `background: var(--zp-danger-tint)`, right cell
    `background: var(--zp-success-tint); border-left: 1px solid var(--zp-line)`.
- **Added / removed auras have no field list.** Instead a flat panel note,
  `padding: var(--zp-space-4)`, `var(--zp-text-sm)`/`var(--zp-text-4)`, stating the
  consequence of copying:
  - added: "This aura exists only in account 12. Copy A → B will not remove it; run Copy B → A to bring it across."
  - removed: "This aura exists only in account 5. Copy A → B will recreate it in account 12."
- Pinned at the bottom of the pane (after a `flex: 1` spacer), the existing footnote as a
  flat panel, `padding: var(--zp-space-3) var(--zp-space-4)`: "Other saved data outside of
  auras also differs (not shown above): only in A: `migrationVersion`." — key names in
  `var(--zp-text-data)`.

---

### 3. Settings dialog

Trigger: the `⚙` icon button. Scrim: `position: absolute; inset: 0; z-index: 60`,
`background: rgba(6,6,14,.62)`, `backdrop-filter: blur(6px)`, centered content.

Dialog: 620px wide, `border-radius: var(--zp-radius-lg)`,
`background: var(--zp-surface-overlay)`, `1px solid var(--zp-line-strong)`,
`box-shadow: var(--zp-elev-overlay)`, `overflow: hidden`.

- Head: `padding: var(--zp-space-6) var(--zp-space-6) var(--zp-space-4); gap: 6px` —
  "Settings" in `var(--zp-text-h3)`, then "Tell the comparator where World of Warcraft lives
  and where to keep backups." in `var(--zp-text-sm)`/`var(--zp-text-4)`.
- 1px divider, then body `padding: var(--zp-space-6); gap: var(--zp-space-6)`.
- Two identical field groups (`gap: 8px`): an uppercase `var(--zp-text-label)` label; a row
  with a read-only path field (`flex: 1`, `height: var(--zp-control-h)`,
  `background: var(--zp-surface-field)`, `1px solid var(--zp-line)`,
  `padding: 0 var(--zp-space-4)`, path in `var(--zp-font-data)` 12px, `white-space: nowrap`,
  `overflow: hidden`) and a ghost **"Browse…"** button; then a one-line hint in
  `var(--zp-text-sm)`/`var(--zp-text-4)`.
  1. "Game folder" — default `C:\\Program Files\\World of Warcraft`.
     Hint: "Accounts are read from WTF\\Account inside each flavor folder found here."
  2. "Backup location" — default `C:\\Users\\Zerpy\\Documents\\SavedVariables backups`.
     Hint: "The target file is copied here before Copy A → B overwrites it."
**Accounts section** (third group in the dialog body, after Backup location):
- Label "Accounts" in `var(--zp-text-label)`, uppercase.
- A bordered list (`1px solid var(--zp-line)`, `var(--zp-radius)`, `max-height: 196px`,
  scrolls) with one row per detected account:
  `display: flex; gap: var(--zp-space-3); padding: 8px var(--zp-space-3); border-bottom: 1px solid var(--zp-line)`.
  - Favorite toggle — a 28×28 borderless button, glyph `★` when on (`var(--zp-accent-300)`)
    and `☆` when off (`var(--zp-text-4)`), 15px. Tooltip "Sort to the top".
  - Account id, 128px fixed, `var(--zp-font-data)` 12px, `var(--zp-text-3)` — always shown,
    so the folder it maps to is never ambiguous.
  - Name input — `flex: 1`, `height: var(--zp-control-h-sm)`, `background: var(--zp-surface-field)`,
    `1px solid var(--zp-line)`, `padding: 0 10px`, `font: var(--zp-text-sm)`,
    `color: var(--zp-text)`, placeholder "Add a name". Focus takes the standard treatment
    (`--zp-focus-line` + `--zp-focus-shadow`).
- Hint: "Names are shown instead of the account number when you pick an account. Star an
  account to sort it to the top. Nothing on disk is renamed."

**Behavior.** Names and favorites are **app-local metadata keyed by account id** — no folder
is ever renamed or moved. A named account shows its name as the primary label everywhere an
account is picked or displayed (the A/B selects, the collapsed context strip) with the id
kept beside it in `var(--zp-text-4)`; an unnamed account falls back to its raw id. Favorites
sort to the top of every account list, favorites first then the existing order. Persist
`accountMeta: { [accountId]: { name, favorite } }` alongside the folder settings.

- Footer row, `justify-content: space-between`: detection summary "3 flavors detected ·
  4 accounts" in `var(--zp-text-sm)`/`var(--zp-text-4)`; right side ghost **Cancel** +
  primary **Save**.

### 4. Copy toast

Fires on **Copy A → B**. `position: absolute; right: var(--zp-space-6); bottom: var(--zp-space-6); z-index: 40`;
stack is a column with `gap: var(--zp-space-3)`.

Toast: 380px, `display: flex; gap: var(--zp-space-4); padding: var(--zp-space-4)`,
`var(--zp-radius)`, `background: var(--zp-surface-overlay)`,
`1px solid var(--zp-line-strong)`, `box-shadow: var(--zp-elev-overlay)`,
`backdrop-filter: blur(var(--zp-blur-lg))`, `cursor: pointer`.
- A 7px success dot, `margin-top: 7px`.
- Title: "Copied WeakAuras.lua to account 12" — `font: var(--zp-text-label)`, `var(--zp-text)`.
- Path: the full destination in `var(--zp-text-data)` at 11.5px, `var(--zp-text-3)`,
  `word-break: break-all`.
- Affordance line: "Click to open the folder in File Explorer" in `var(--zp-text-sm)`,
  `color: var(--zp-accent-300)`.
- Dismiss `✕` top-right, `var(--zp-text-4)`, 13px; stops propagation.
- Auto-dismiss after 8s. Clicking the body reveals the file in the OS file manager.
- Past tense and specific, per the Zerpy voice — never "Success!".

### 5. Reveal-in-explorer dialog

This exists in the prototype only to demonstrate the toast's click target. In the real app,
**call the OS shell** (`explorer /select,<path>` on Windows, `open -R` on macOS) and drop
this dialog entirely.

---

## Interactions & behavior

| Trigger | Result |
| --- | --- |
| **Compare** | Command bar collapses to the context strip; results open below it. Bar and strip animate; the panel does not unmount the window. |
| **Change selection** | Back to the idle state. The active stat filter resets to "All"; the A/B/addon/flavor selection is preserved. |
| **Stat pill click** | Toggles that kind as the list filter; clicking the active pill returns to "All". The segmented label, the "… N more" count and the visible list all follow. |
| **Clear filter** | Filter back to "All". Only rendered while a filter is active. |
| **List row click** | Selects that aura; the detail pane swaps. If the current selection is filtered out, fall back to the first visible row. |
| **Swap glyph** | Swaps account A and B. |
| **Copy A → B** | Back up the target, copy, then show the toast. Re-firing resets the 8s timer. |
| **Toast body click** | Reveal the copied file in the OS file manager, dismiss the toast. |
| **⚙** | Settings dialog. Cancel discards, Save persists. |
| **★ in settings** | Toggles favorite; the account list re-sorts immediately, favorites first. |
| **Name field in settings** | Renames the account *label only*. Empty falls back to the raw id. Applies everywhere an account appears. |

**Animation** — one easing curve, `cubic-bezier(.2,.7,.3,1)`, throughout.

- Context strip entering: `zp-collapse-in` — 180ms, from `opacity: 0; translateY(-6px)` to
  rest. Applied to each of the three strip rows.
- Results split entering: `zp-open-below` — 280ms with a **100ms delay**, from
  `opacity: 0; translateY(10px)`. The stagger is what makes it read as the bar collapsing
  and the results opening underneath, rather than a screen swap.
- Dialogs and toasts: `zp-collapse-in`, 180ms.
- Hover transitions: 180ms. Never a scale, never a bounce, never opacity as a hover state.
- All of it wrapped in `@media (prefers-reduced-motion: reduce) { animation: none }`.

**Empty and error states**
- No file for the selected addon on one side: that file pill reads "no WeakAuras file yet"
  at `opacity: .55`; **Compare** disables.
- No differences at all: show the context strip with all three stat counts at 0 and, in place
  of the split, a flat panel stating the two files are identical. (Not drawn — needs a copy
  decision.)
- Filter yields nothing: the list shows a single muted row, the detail pane keeps the last
  selection.

**Responsive** — the window is resizable. The command bar wraps (`flex-wrap: wrap`) as it
narrows; the context strip pills wrap too. The split's 360px list is fixed; below roughly
820px total width, stack the list above the detail pane instead of side by side.

## State

```
flavor         'classic_era' | 'retail' | …          selection, persisted
addon          'WeakAuras' | …                        selection, persisted
accountA       account id                             selection, persisted
accountB       account id                             selection, persisted
compared       boolean                                idle vs results
filter         'all' | 'added' | 'removed' | 'changed'
query          string                                 list filter field
selectedAuraId string                                 detail pane subject
settingsOpen   boolean
accountMeta    { [accountId]: { name: string, favorite: boolean } }   persisted, app-local
toast          { path, addon, account } | null        auto-clears after 8s
gameFolder     path                                   persisted
backupFolder   path                                   persisted
```

Data the results need per aura: `id`, `name`, `group` (parent name or empty),
`kind` ('added' | 'removed' | 'changed'), `fields[]` of
`{ path, kind: 'value' | 'code', before, after, counts }`. Plus totals for the stat pills
(added / removed / changed / unchanged) and the list of non-aura top-level keys that differ,
for the footnote.

Diffing a 25 MB Lua table is not instant — do it off the UI thread and show a skeleton that
holds the exact boxes of the strip and the split while it runs. Per Zerpy's loading rules:
frames are real from the first paint, only values shimmer, and nothing is left shimmering
after a failure.

## Design tokens

All from Zerpy. Use the CSS variables; the literals are listed for reference only.

**Ground and surfaces** — `--zp-bg` #08080f · `--zp-bg-raised` #0b0c14 ·
`--zp-bg-lifted` #0d0e18 · `--zp-ground` (two radial washes over a vertical gradient) ·
`--zp-starfield` at `--zp-starfield-opacity` .3 · `--zp-surface-1` rgba(255,255,255,.028) ·
`--zp-surface-2` .045 · `--zp-surface-3` .070 ·
`--zp-surface-panel` linear-gradient(180deg, rgba(255,255,255,.045), rgba(255,255,255,.012)) ·
`--zp-surface-overlay` linear-gradient(160deg, rgba(30,28,62,.90), rgba(12,11,26,.93)) ·
`--zp-surface-field` rgba(10,9,24,.60).

**Lines** — `--zp-line` rgba(150,145,200,.14) · `--zp-line-strong` .24 ·
`--zp-line-accent` rgba(169,156,240,.55) · `--zp-rule-fade` (fades at both ends).

**Text** — `--zp-text` #f2f1fb · `--zp-text-2` rgba(214,211,238,.78) ·
`--zp-text-3` rgba(206,203,232,.60) · `--zp-text-4` rgba(190,186,220,.45) ·
`--zp-text-on-accent` #0c0a18.

**Accent** — `--zp-accent` #9184d9 · `--zp-accent-200` #d8d2ff · `--zp-accent-300` #c4bbff ·
`--zp-accent-400` #a99cf0 · `--zp-accent-900` #2b2649 ·
`--zp-accent-tint` rgba(145,132,217,.16) · `--zp-accent-tint-strong` .28 ·
`--zp-accent-glow` 0 0 16px rgba(145,132,217,.28).

**Status** — success #5ec48a · warning #e8a44c · danger #e8636b · info #6ea8fe, each with a
`-tint` at 16% and a `-line` at 40% (danger 55%).

**Type** — Instrument Sans 400/500/600 for UI and copy, Roboto Mono 400/500 for data and
micro-labels (both from Google Fonts; self-host if the app must work offline).
h1 500 30px/1.16 · h2 500 22px/1.24 · h3 500 18px/1.34 · md 400 14px/1.6 · sm 400 12.5px/1.5 ·
label 500 12.5px/1.3 · data 500 13.5px/1.4 mono · micro 500 10.5px/1.3 mono with
`letter-spacing: .14em`. Every size multiplies by `--zp-scale-type`, which steps up above
2000px of logical viewport width — don't hardcode px sizes past that.

**Space** — 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 56 · 72px (`--zp-space-1`…`-10`), each
times `--zp-scale-space`.

**Radius** — 2px inner segments · **4px default** (controls, cards, panels) · 8px overlays ·
12px full-page shells · 999px pills. The sharpness is identity; do not round these up.

**Control heights** — 30 / 38 / 46px (`--zp-control-h-sm` / `-h` / `-h-lg`).

**Depth** — three steps, never nested: flat rows `--zp-elev-flat` (no blur) · panels
`--zp-elev-panel` with `blur(14px)` · overlays `--zp-elev-overlay` with `blur(22px)`;
fields blur 8px. A panel inside a panel is flat.

**Focus** — one treatment everywhere: the control's own border goes to `--zp-focus-line`
and it picks up `--zp-focus-shadow` (1px accent edge + accent glow). Nothing outside the
control, no layout shift. **Disabled** is 45% opacity with the glow removed, never a grey fill.

## Assets

None. No images, icons or illustrations. Every glyph in this design is a Unicode character
set in the UI or mono font at 15px or below: `⚙ ⇄ ⌕ ✕ → ▾ ◆ ⋯ ●`. Identity and state are
carried by 2px left rails, 7px colored dots and colored badges — that is Zerpy's substitute
for an icon set. If the app already ships an icon library, keep using it at 1.5px stroke;
otherwise do not add one for this screen.

## Files

```
redesign.dc.html        the prototype. Three turns, newest first:
                          #t3 / #3a — THE DESIGN TO BUILD (interactive: Compare,
                                      Change selection, stat filters, list selection,
                                      Copy A → B toast, settings dialog)
                          #t2 / #2a, #2b — results-screen alternatives that led to 3a
                          #t1 / #1a, #1b, #1c — selection-screen alternatives
design_system/          Zerpy tokens and component CSS, production-usable as-is.
                          tokens/*.css   colors, type, space, depth, dataviz, wow, light theme
                          components/controls.css   pseudo-state layer
                          styles.css     entry point (@import lines only)
```

Open `redesign.dc.html` in a browser and interact with **3a** — the state transitions and the
animation stagger are easier to feel than to read. Turns 1 and 2 are kept for context on why
the layout is what it is; they are **not** to be built.
