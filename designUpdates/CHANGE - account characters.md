# Change: expandable characters under each account (settings dialog)

Small addition to the settings dialog's **Accounts** list, on top of the existing handoff
(`README.md` §3). Nothing else on the screen changes.

## What it does

The account id at the right of each account row becomes a **disclosure button**. Clicking it
expands the row to list the servers under that account folder and the characters on each.
The number alone does not tell you which account you are looking at; the characters do. It
also gives the name field an answer — you read the characters, then type the name.

## Markup and styling

- The row container becomes a **column**: the existing star / name / id row on top, the
  expanded body below it. Keep `border-bottom: 1px solid var(--zp-line)` on the container,
  so the divider sits under the expanded content rather than between a row and its own
  characters.
- **Id button** — replaces the static id text, same position and alignment:
  `display: flex; align-items: center; gap: 5px; background: none; border: none;
  padding: 2px 4px; cursor: pointer; font: var(--zp-font-data) 11.5px;
  color: var(--zp-text-4)`. Hover brightens to `var(--zp-text-2)` — one step, no hue change,
  no underline. Focus takes the standard `--zp-focus-line` + `--zp-focus-shadow` on the
  button's own box. Tooltip "Show characters".
- **Caret** — a `›` glyph before the id, `display: inline-block`, rotating `0deg → 90deg` on
  expand, `transition: transform 120ms cubic-bezier(.2,.7,.3,1)`. Collapsed it points right.
  It is the only signal that the id is clickable, so it renders in both states.
- **Expanded body** — `display: flex; flex-direction: column; gap: 8px;
  padding: 2px var(--zp-space-3) 10px 34px`. The 34px left inset aligns the server names
  with the name input, clear of the star.
- **Per server** — `gap: 3px` column of two lines:
  - server name: `font: var(--zp-text-label)` at 10px, uppercase,
    `letter-spacing: var(--zp-tracking-micro)`, `color: var(--zp-text-3)`;
  - characters: one line, `font: var(--zp-text-sm)`, `color: var(--zp-text-3)`,
    `padding-left: 10px`, names joined with ` · `.
- Character lines wrap; never truncate them or scroll horizontally. The list container's
  `max-height: 176px` still applies, so an expanded row scrolls within it.

## Behavior

- Several rows can be open at once — expanding one does not collapse another.
- Not persisted: every open of the settings dialog starts fully collapsed.
- Empty account (folder exists, no server subfolders): expand to one line, "No characters
  found in this account folder.", in `var(--zp-text-sm)` / `var(--zp-text-4)`.
- Data: enumerate the server directories under `WTF\Account\<accountId>\`, then the
  character directories under each. Sort servers alphabetically, and characters
  alphabetically within a server. Read-only — nothing beyond listing directories. Cache per
  account id for the lifetime of the dialog; do not re-stat on every render.

## State

```
openAccounts   { [accountId]: boolean }                      expanded rows, not persisted
accountChars   { [accountId]: { server, characters[] }[] }    listed from disk, cached per dialog
```

The character names in the prototype are placeholder data.
