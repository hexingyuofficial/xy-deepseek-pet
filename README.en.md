<p align="center">
  <img src="packages/harness-plugin/assets/whale-calm.png" width="160" alt="XY DeepSeek Pet whale">
</p>

# XY DeepSeek Pet

English | [中文](./README.md)

An unofficial open-source desktop whale for DeepSeek Harness. It reacts to real task state, shows bounded session notifications, and can reply to the correct session without finding the browser window first.

## Highlights

- Idle, sleep, walk, thinking, tool-working, needs-input, completion, failure, and offline animations.
- Up to three prioritized session bubbles with exact-session inline replies and clear question or approval attention.
- Dragging, press-and-rebound interaction, selectable long-press or double-click navigation, and 40%-200% scaling.
- Safe import of native theme ZIPs and Petdex v1/v2 packs. Themes are image-and-JSON data only.
- One compact group in Harness General settings and a deliberately small desktop context menu.
- Optional `xy-deepseek-sounds` package for turn completion, tool success, and tool failure sounds, usable without the desktop pet.
- Bounded agent tools let an installed Harness agent inspect settings, select or import validated themes, and manage sounds after an explicit user request.

The companion never surfaces hidden reasoning, full transcripts, raw tool arguments, or bridge credentials. Bubbles contain only bounded public status and assistant text.

## Install

DeepSeek Harness `0.1.0-rc.6` and Node.js 22 or newer are required. For the standard `web` profile:

```sh
dsh plugin --profile web add xy-deepseek-pet
dsh web
```

Restart Harness, then use **Open pet** in the sidebar. Automatic startup is off by default and can be enabled under **General settings > Desktop pet**. The `xy-deepseek-pet-desktop` runtime is installed automatically with the main plugin.

Sounds are optional and independently installable:

```sh
dsh plugin --profile web add xy-deepseek-sounds
```

| Package choice | Result |
| --- | --- |
| `xy-deepseek-pet` | Cordis Host bridge, Harness settings, and Electron companion |
| `xy-deepseek-sounds` | Completion and tool-result sounds without Electron |
| Both | Sound controls merge into the Desktop pet group with one event listener path |

## Use

- The sidebar **Open pet / Close pet** item is a real toggle. Closing the pet does not stop Harness.
- Click a session bubble to turn it into an inline reply. `Enter` sends, `Shift+Enter` inserts a newline, and clicking elsewhere dismisses it.
- Right-click the pet to open Harness, reply to the latest active session, open settings, reconnect, or hide the pet.
- General settings control theme, scale, motion, activation gesture, ZIP import, and the optional desktop shortcut.
- Imported ZIPs are validated before activation. See [theme compatibility](./docs/theme-compatibility.md) for supported mappings.

To create a theme, start with the importable [`examples/minimal-theme`](./examples/minimal-theme/), then read [theme authoring](./docs/theme-authoring.md) and [`schemas/theme.schema.json`](./schemas/theme.schema.json).

## Platform status

- macOS: source build, clean npm-tarball install, and desktop process launch are verified.
- Windows: shares the Electron codebase and has automated coverage for fixed-argument launch, PowerShell playback, and build paths. Interactive Windows GUI verification is still pending for 0.1.0.
- Version 0.1.0 is unsigned and unnotarized, with no standalone `.dmg`, `.msi`, or `.exe` installer yet.

## Development

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm test
pnpm verify
```

Run the desktop companion locally:

```sh
pnpm --filter xy-deepseek-pet-desktop start
```

Preview the deterministic failure enter, loop, and exit sequence:

```sh
pnpm --filter xy-deepseek-pet-desktop dev -- --demo-error
```

See [architecture](./docs/architecture.md), [Cordis integration](./docs/cordis-integration.md), and the [plugin API](./docs/plugin-api.md) for implementation and extension details.

## License and security

Code is released under the [MIT License](./LICENSE). Default whale and sound provenance, licenses, and hashes are recorded beside their assets. Theme and menu interfaces are data-only and reject arbitrary JavaScript, URLs, and shell commands. Report vulnerabilities privately as described in [SECURITY.md](./SECURITY.md).

This project is not affiliated with, endorsed by, or sponsored by DeepSeek. DeepSeek names and marks belong to their respective owners.
