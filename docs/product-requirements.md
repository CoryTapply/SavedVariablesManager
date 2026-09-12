# SavedVariables Comparator — Product Requirements & Functionality

## 1. What this app is

A desktop app (Electron + React/TypeScript) for World of Warcraft players who run multiple
game accounts and want to keep addon configuration in sync between them. It reads addon
`SavedVariables` Lua files directly out of the WoW install folder, compares the same addon's
file between two accounts, and shows a structured, field-level diff — then optionally copies
one account's file over the other's (with an automatic backup).

The first and primary supported addon is **WeakAuras**, with a generic file-level diff as a
fallback for any other addon, and an extensible architecture for adding addon-specific deep
comparators later (e.g. Plater, MSBT, ZerpyUI, Dominos are already recognized by name/priority
even though they currently only get the generic comparator).

**Primary user:** a WoW player (Classic Era / Anniversary realms today, but any flavor is
supported) who plays the same characters or specs across two Battle.net accounts and wants a
repeatable way to answer "what did I change on my WeakAuras setup since I last synced these
two accounts?" and to then push the newer setup to the other account.

This is a solo-user, fully local, offline desktop tool — no server, no accounts, no network
calls. Everything happens against files already on the player's own disk.

## 2. Core domain concepts

- **WoW root** — the player's WoW installation folder, chosen once via a native folder
  picker and persisted. Either the Battle.net top-level folder (containing one subfolder per
  product/flavor, e.g. `_retail_`, `_classic_era_`) or a single flavor's folder directly
  (containing `WTF` itself) — the app detects which.
- **Flavor** — a WoW product install (Retail, Classic, Classic Era / Anniversary, PTR/Beta
  variants, …). Not a fixed list: any folder containing `WTF` counts, since Blizzard adds new
  ones over time. The app remembers the player's last-chosen flavor as a preference and
  defaults to Classic Era/Anniversary the very first time (this player's main flavor), only
  showing a flavor switcher at all when more than one flavor is present on disk.
- **Account** — a Battle.net account folder under `WTF/Account/<accountName>` within a
  flavor. Account folders are opaque/numbered (e.g. `1234567890#5`); the app doesn't rename
  or relabel them. An account with zero addon files yet is still listed (e.g. a brand-new
  account) so it can be picked as a copy *destination* even though it can't be a comparison
  side.
- **Addon** — identified by its SavedVariables filename (e.g. `WeakAuras.lua` → addon id
  `weakauras`). Every `.lua` file found under an account's `SavedVariables` folder is a
  candidate. A small set of well-known addons (WeakAuras, Plater, MSBT, ZerpyUI, Dominos) get
  priority placement in the addon picker; anything else discovered on disk is still fully
  usable, just tucked behind a "More…" list, sorted alphabetically.
- **Analyzer depth** — each addon is either:
  - **`deep`** — addon-aware structural comparison. WeakAuras is the only deep analyzer
    today: it understands that the file is a flat map of aura name → aura table, matches
    entries primarily by their stable `uid` (survives renames, and survives across accounts
    when an aura was shared via WeakAuras' own export/import), falls back to matching by
    display name (`id`) for anything not matched by uid, and only then falls back to treating
    leftovers as pure additions/removals. Produces per-aura status (added/removed/changed/
    unchanged) plus full field-level diffs within changed auras, and separately calls out
    other top-level saved data outside of `displays` that differs between the two files
    without expanding it entry-by-entry.
  - **`basic`** — generic whole-file structural diff, no per-item identity, used
    automatically for any addon that doesn't have a dedicated deep analyzer. This is what
    makes "every addon works, some just work better" true without extra effort per addon.
- **Field diff** — the atomic unit of a comparison result: a path (e.g. `region › color`), an
  old value, a new value, and a kind (`added`/`removed`/`changed`). Values can be strings,
  numbers, booleans, nested tables, or `nil`. WeakAuras stores custom trigger/action code as
  Lua source inside string fields, so a field diff's value can itself be a multi-line code
  blob.

## 3. Current screens & flows

The app is a single window with three mutually-exclusive full-screen views (no persistent nav
chrome beyond a window drag region): **Compare** (home), **Results**, **Settings**. Settings
and Results both return to Compare via a "← Back" action; there's no deep-linking or
multi-window support today.

### 3.1 Compare (home) screen

Purpose: pick two accounts and an addon, and either compare or copy between them.

Elements today:
- Page header: app eyebrow/title/description, plus (top-right) a flavor selector — only
  shown when more than one flavor is detected — and a settings gear icon button.
- An empty-state prompt ("No WoW folder set") in place of everything else when no WoW root
  has been configured yet, with a CTA straight into Settings.
- An **addon picker**: priority addons as a segmented-control row (only the ones actually
  present on disk are shown as segments), plus a trailing "More…" segment that opens a
  small popover list of every other discovered addon. One addon selection applies to *both*
  sides — comparing different addons across two accounts is not a supported use case, so
  there is intentionally only one control, not two.
- Two side-by-side **account pickers** ("Account A" / "Account B"), each just a dropdown of
  discovered accounts (filtered to the selected flavor) for that side. Once an account and the
  shared addon are both chosen, that side's file is resolved automatically — there is no
  manual file browsing UI in the current build. Each side shows inline feedback when the
  account has no file for the chosen addon, or when no addon is chosen yet.
- Primary action: **Compare** button — enabled once both sides resolve to a real file;
  shows a loading state while parsing/diffing runs, and surfaces any comparison error inline
  (e.g. a malformed file) in a dismiss-free inline error panel above the actions.
- Secondary action: **Copy account A → account B** — enabled once account A has a real file
  and account B is chosen (account B does not need to already have a file — the destination
  path is computed from where that file *would* live). Disabled when source and destination
  already resolve to the same path. Runs a backup-then-overwrite copy (see 3.4) and reports
  the outcome via a toast that can be clicked to reveal the resulting file (the backup if one
  was made, otherwise the freshly copied file) in the OS file browser.

### 3.2 Results screen

Purpose: show what differs between the two chosen files for the chosen addon.

Elements today:
- Header: addon display name as eyebrow, "Comparison results" title, both file paths as
  description, and a "← Back" action (discards the result — there's no history/persistence of
  past comparisons).
- Summary stat cards: Added / Removed / Changed counts always; an Unchanged count only for
  `deep` results (a `basic` diff has no concept of "unchanged items", only field diffs).
- For a **deep** result: a segmented filter (All/Added/Removed/Changed — "All" excludes
  Unchanged) over a list of per-aura rows. Each row shows a status badge, the aura's key
  name, its parent group name if it belongs to one, and — if it has field-level changes — an
  expand toggle revealing every field diff for that aura. A field diff renders as inline
  old→new text for short scalar values, or as a full before/after view for long/multi-line
  values: pure add/remove fields get two side-by-side read-only code panels (one empty), and
  *changed* fields get a proper line-level diff view (aligned two-column, per-line
  added/removed tinting, syntax highlighting for embedded Lua source, and a +N/−N line-count
  summary in the panel header). A footnote panel calls out any other top-level saved keys
  that differ between the files (outside of the addon's per-item data) without itemizing them.
  An empty-state appears when the current filter matches nothing.
- For a **basic** result: just a flat list of field-diff panels (no filter, no per-item
  grouping, since there's no addon-specific identity to group by), or an empty state if the
  files are identical.

### 3.3 Settings screen

Purpose: the only place to change app-level configuration.

Elements today:
- **WoW folder** — path display + "Choose…/Change…" button opening a native folder picker;
  changing it re-runs account discovery immediately.
- **Backups folder** — path display (defaults to an app-managed folder, shown once loaded) +
  "Choose…/Change…" button; this is where a Copy action's overwritten file is preserved.

There is currently no in-app way to change the persisted flavor preference outside of using
the flavor selector on the Compare screen, and no destructive/reset actions (e.g. "forget WoW
folder") beyond re-choosing a new one.

### 3.4 Copy & backup behavior (cross-cutting, not its own screen)

- Copying account A's file over account B's is only ever done through the addon-aware "Copy
  account A → account B" action (there is a separate, currently-unused-by-the-UI raw
  `file:copy` capability with an explicit overwrite flag, kept for potential future direct
  file-to-path copying).
- Before an overwrite, if account B's destination file already exists, it is copied into the
  configured backups folder first, named
  `<addonId>_<accountNumberSuffix>_<local-timestamp>.lua` (e.g.
  `weakauras_5_2026-09-11_14-30-05.lua`) — human-sortable, Windows-filename-safe, and legible
  enough that the player recognizes which account and which addon a given backup came from
  without opening it.
- If account B has no prior file (fresh account/addon), the destination folder is created as
  needed and no backup is made — the success toast reflects this ("no prior file to back
  up") instead of implying a backup exists.
- A failed copy reports the underlying OS error message directly in a danger-toned toast
  rather than a generic failure message.

## 4. Non-functional requirements & constraints

- **Fully local/offline.** No network access, no telemetry, no accounts/auth. All state is
  either read live from the filesystem or persisted locally (`electron-store`, e.g. WoW root
  path, flavor preference, backups folder path).
- **No implicit filesystem scanning.** The app never scans arbitrary drives/folders looking
  for a WoW install — the player points it at one folder, once (changeable later in
  Settings), and everything else is discovered strictly under that root.
- **Large-file performance.** Real SavedVariables files can be tens of MB (a real sample is
  ~25MB with thousands of auras). Parsing happens off the main/UI thread (a worker thread
  running a hand-rolled recursive-descent Lua-table-literal parser scoped to the exact
  subset Ace3/WeakAuras' serializer emits) so the UI never freezes; real-world parse+diff of
  two 25MB files completes in about a second combined today.
- **No fabricated data.** Notably, there is no per-item "last modified" timestamp anywhere in
  the UI, because WeakAuras' SavedVariables format doesn't store one (only a session-uptime
  counter and whole-file mtime exist) — the app deliberately does not invent one.
- **Addon extensibility.** Adding real deep-comparison support for a new addon (vs. the
  automatic generic/basic fallback every addon already gets) should not require touching the
  UI layer — it's a registry-driven main-process concept (`addonRegistry`) that the picker
  and account discovery already consume generically.

## 5. Explicit non-goals (as of today)

- No in-app aura/config editing — this is a read-only comparator plus whole-file copy, never
  a merge or partial-apply tool.
- No cloud sync, multi-device sync, or any account system of its own.
- No history of past comparisons across app restarts — a comparison result lives only until
  "Back" is pressed or the app closes.
- No distributable build has been produced yet (packaging config exists, `npm run dist` has
  not been run).

## 6. Current visual/UI system (context for the redesign)

The renderer is built entirely on an existing in-house component/token library ("Zerpy
Design System" — dark, WoW-flavored aesthetic: a subtle animated starfield background, glassy
panels, accent-tinted status badges, a monospace "data" font for file paths/code/diff text).
Layout today is a single centered column (max-width page shell) per screen, card-style
panels, and a segmented-control pattern reused for both the addon picker and the results
filter. This document intentionally describes *functionality*, not final visual direction —
see the accompanying Claude Design project for the actual layout/visual redesign work.
