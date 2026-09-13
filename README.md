# SavedVariableManager

A desktop app (Electron + React/TypeScript) for World of Warcraft players who run
multiple game accounts and want to keep addon configuration in sync between them. It
reads addon `SavedVariables` Lua files directly out of the WoW install folder, compares
the same addon's file between two accounts, and shows a structured, field-level diff —
then optionally copies one account's file over the other's (with an automatic backup).

The first and primary supported addon is **WeakAuras**, with a generic file-level diff
as a fallback for any other addon.

This is a solo-user, fully local, offline desktop tool — no server, no accounts, no
network calls. Everything happens against files already on your own disk.

## Local development

```bash
npm install
npm run dev        # launch the app in dev mode (electron-vite)
npm run typecheck  # type-check main + renderer
npm test           # run the vitest suite
```

## Building locally

```bash
npm run dist
```

Produces an unsigned build for your own machine in `dist/`. This does not publish
anywhere — it's just a local package/install step.

## Releasing a new version

Releases are built by GitHub Actions (`.github/workflows/release.yml`) and published as
GitHub Releases whenever a version tag is pushed. macOS and Windows installers are built
natively, one on each OS's runner.

```bash
npm version 1.0.0 --no-git-tag-version
git add package.json package-lock.json
git commit -m "Bump version to 1.0.0"
git push origin main

git tag v1.0.0
git push origin v1.0.0
```

Pushing the tag triggers the workflow (watch it under the repo's **Actions** tab). Once
it finishes, both installers are attached to the release at:

`https://github.com/CoryTapply/SavedVariablesManager/releases/tag/v1.0.0`

Expected assets: `SavedVariableManager-<version>.dmg` (mac) and
`SavedVariableManager Setup <version>.exe` (win).

## Installing an unsigned build

The app isn't code-signed on either platform, so your OS will show a one-time warning
the first time you open it:

- **macOS**: Gatekeeper blocks it ("cannot be opened because the developer cannot be
  verified", or "is damaged and can't be opened" on newer macOS). Right-click the app in
  Finder → **Open** → confirm, or run:
  ```bash
  xattr -cr "/Applications/SavedVariableManager.app"
  ```
- **Windows**: SmartScreen flags it ("Windows protected your PC"). Click **More info** →
  **Run anyway**.

Neither is a sign anything's wrong — it's just what happens with an unsigned installer.
