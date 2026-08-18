# Packaging and installation

XY DeepSeek Pet 0.1.0 publishes three packages from one pnpm workspace:

| Package | Purpose | Installed directly? |
| --- | --- | --- |
| `xy-deepseek-pet` | Cordis Host, Harness Web client, launcher runtime | Yes |
| `xy-deepseek-pet-desktop` | Electron runtime, schema, default whale theme | Pulled by `xy-deepseek-pet` |
| `xy-deepseek-sounds` | Optional sound-only Cordis bundle | Yes, independently |

## Harness package contract

The release is verified against DeepSeek Harness `0.1.0-rc.6` and `@deepseek-ai/cordis@4.0.1`. Both user-facing plugins export `apply(ctx)`, declare their injected Harness services, and carry a `dsh.bundle` patch plus a prebuilt `dsh.client` entry.

```sh
dsh plugin --profile web add xy-deepseek-pet
dsh plugin --profile web add xy-deepseek-sounds  # optional
```

Harness forwards plugin package operations to the selected profile's pnpm project. Client metadata is process-cached, so restart `dsh web` after installation.

## Desktop runtime

The main plugin depends on the exact matching `xy-deepseek-pet-desktop` version. Its small CLI resolves the package-local Electron executable, then starts `dist/main.js`. The desktop tarball contains:

- sandboxed renderer, preload and main-process bundles;
- native theme schema;
- complete `whale-default` theme and provenance;
- the cross-platform CLI.

Electron is a normal npm dependency and downloads its official platform binary during installation. No native project compilation or arbitrary install script belongs to this repository.

The Host prefers this installed runtime and keeps a source-checkout fallback for contributors. A single-instance lock focuses the existing companion instead of creating duplicates.

## Desktop shortcut

The optional shortcut editor creates `DeepSeek Harness.app` on macOS or `DeepSeek Harness.lnk` on Windows. The launcher runtime and bundled whale icon ship inside `xy-deepseek-pet`; it does not point back to the source checkout.

- Names are sanitized to 1-48 characters.
- Custom icons must be validated PNG files no larger than 5 MiB.
- Existing desktop entries are never overwritten.
- Node, launcher and icon paths are passed as fixed arguments; user text is not assembled into a shell command.
- A one-minute recoverable lock coalesces rapid activation.
- Port 3080 is reused only when its HTML identifies DeepSeek Harness.
- Harness Web opens as soon as it is reachable; the pet starts when the local bridge becomes available.

Bounded credential-free diagnostics go to `~/.xy-deepseek-pet/launcher.log` and Harness output to `~/.xy-deepseek-pet/dsh.log`.

## Release checks

Before publishing:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm test
pnpm verify
pnpm audit --prod --audit-level high
```

Run `pnpm pack` in each public package and install all resulting tarballs into an empty directory. Confirm the desktop tarball contains its CLI, renderer, schema and default theme; confirm the Cordis tarballs contain only their compiled entries, patch, runtime assets and README.

Publish in dependency order:

1. `xy-deepseek-pet-desktop@0.1.0`
2. `xy-deepseek-pet@0.1.0`
3. `xy-deepseek-sounds@0.1.0`

Version 0.1.0 is unsigned and unnotarized. Standalone `.dmg`, `.msi` and `.exe` installers are not part of this release.
