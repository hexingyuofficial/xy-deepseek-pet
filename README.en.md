<p align="center">
  <img src="docs/readme/demo.gif" width="220" alt="The whale idles, wanders, gets squashed, dives to think, then surfaces with fries">
</p>

<h1 align="center">XY DeepSeek Pet</h1>

<p align="center">
  <a href="./README.md">中文</a> · English
</p>

<p align="center">
  <img alt="version" src="https://img.shields.io/badge/version-0.1.1-4EA8FF?style=flat-square">
  <img alt="license" src="https://img.shields.io/badge/license-MIT-2ea44f?style=flat-square">
  <img alt="node" src="https://img.shields.io/badge/Node.js-22%2B-43853d?style=flat-square">
  <img alt="harness" src="https://img.shields.io/badge/Harness-0.1.0--rc.6-1688f8?style=flat-square">
  <img alt="macos" src="https://img.shields.io/badge/macOS-verified-111827?style=flat-square">
  <img alt="windows" src="https://img.shields.io/badge/Windows-source%20ready-111827?style=flat-square">
  <img alt="petdex" src="https://img.shields.io/badge/Petdex-v1%20%2F%20v2-7c3aed?style=flat-square">
</p>

<p align="center">
  An unofficial open-source desktop pet for DeepSeek Harness.<br>
  It finishes real work on the desktop, plays with you, and lets you replace the skin.
</p>

<p align="center">
  <a href="#a-practical-pet">Practical</a> ·
  <a href="#a-playful-pet">Playful</a> ·
  <a href="#an-open-pet">Open</a> ·
  <a href="#install">Install</a> ·
  <a href="#use">Use</a> ·
  <a href="#development">Development</a>
</p>

<p align="center">
  <img src="docs/readme/gallery.png" alt="Preview of idle, sleep, walk, dive, squash, and failure poses" width="720">
</p>

The Chinese README is the main document. This English page follows the same three ideas in shorter form.

## What it is

A whale that lives on the real Harness task. It dives when work starts, stays underwater during tool calls, and brings the question or approval to a desktop bubble. You can reply to the exact session, tap **Allow once / Reject** in the bubble, or long-press the whale to dictate with the system speech recognizer. When the turn finishes, it surfaces with a different find.

That is the product: not a browser ornament, and not a skin-only toy.

| It is | You get |
| --- | --- |
| A practical pet | Reply, approve, jump back to the page, and pin a desktop shortcut without hunting for the browser window |
| A playful pet | Pointer chasing, throw inertia, a real dive, and a different souvenir on the way up |
| An open pet | Replace the skin, the sounds, and the shortcut icon, including [Petdex](https://petdex.dev/) packs |

The companion only streams public assistant text and activity such as thinking, tool use, questions, and approvals. Hidden `reasoning-delta` content, full transcripts, raw tool arguments, approval reasons, and bridge credentials stay off the desktop bridge.

## A practical pet

<p align="center">
  <img src="docs/readme/useful.png" alt="Reply, approve, open Harness, and create a desktop shortcut" width="820">
</p>

- Up to three session bubbles. Click to type; `Enter` sends to the exact session.
- Questions and approvals come to the front. **Allow once / Reject** lives in the bubble.
- System dictation starts after a `0.5` second long press by default and inserts the transcript into the latest session's reply box for review; double-click opens Harness. Either gesture can independently be assigned to **Record**, **Open latest session details**, **Open Harness**, or **No action**. In double-click recording mode, double-click again or use Send to stop. Dictation never sends automatically.
- Settings can create a desktop shortcut that starts Harness, the web client, and the pet. The icon can be the bundled whale or your own PNG.

**Open pet / Close pet** in the sidebar is a real toggle. Closing the pet does not stop Harness.

## A playful pet

<p align="center">
  <img src="docs/readme/playful.png" alt="Pointer chase, throw inertia, dive, and completion loot" width="820">
</p>

- Chase the pointer at a tunable speed. Direct interaction pauses the chase.
- A fast drag-and-release throws the pet; it bounces only inside the current display.
- A real DeepSeek dive starts with the turn. Tool work stays underwater.
- Regular completions share fries, a blindfold, branches, a boot, and other finds. Treasure is a separate `0.1%` jackpot, about once every thousand completions. Themes cannot change that probability.

<p align="center">
  <img src="docs/readme/dive.png" alt="Idle, dive, think underwater, then surface with a find" width="820">
</p>

<p align="center">
  <img src="docs/readme/loot.png" alt="Completion finds, with treasure highlighted at 0.1 percent" width="820">
</p>

It wanders when idle, naps after ten quiet minutes, and squashes when pressed. Scale is 20% to 200%.

## An open pet

<p align="center">
  <img src="docs/readme/open.png" alt="Petdex skins, native themes, notification sounds, and custom shortcut icons" width="820">
</p>

- Import [Petdex](https://petdex.dev/) v1 / v2 ZIPs from settings. Packs are validated and mapped; they never run scripts.
- Native themes start from [`examples/minimal-theme`](./examples/minimal-theme/). See [theme authoring](./docs/theme-authoring.md) and [`schemas/theme.schema.json`](./schemas/theme.schema.json).
- Optional `xy-deepseek-sounds` covers completion, tool success, and tool failure, including short local WAV / MP3 / OGG files. It works without the desktop pet.
- Shortcut artwork is separate from the pet skin.

Themes are image-and-JSON data only. Compatibility notes live in [theme compatibility](./docs/theme-compatibility.md). After install, a Harness agent can switch a local pack or sound when you ask.

## Install

DeepSeek Harness `0.1.0-rc.6` and Node.js 22+ are required. Use the `web` profile.

1. If `dsh web` is running, press `Ctrl+C` in that terminal and wait for it to exit.
2. Install the plugin:

   ```sh
   dsh plugin --profile web add xy-deepseek-pet
   ```

   This pulls `xy-deepseek-desktop`. The first install also downloads the platform Electron runtime, about 120-150 MB.
3. Start Harness again:

   ```sh
   dsh web
   ```

Use **Open pet** in the sidebar. Automatic startup is off until you enable it. Do not start another `dsh web` while port 3080 is still taken.

Sounds are optional:

```sh
dsh plugin --profile web add xy-deepseek-sounds
```

| Package | Result |
| --- | --- |
| `xy-deepseek-pet` | Cordis Host bridge, Harness settings, and the Electron companion |
| `xy-deepseek-sounds` | Completion and tool-result sounds without Electron |
| Both | Sound controls merge into Settings > Plugins > Desktop pet |

If an install unexpectedly reports `workspace:`, confirm it came from the npm registry:

```sh
npm view xy-deepseek-pet@0.1.1 dependencies
dsh plugin --profile web list xy-deepseek-pet xy-deepseek-desktop
```

Published `0.1.1` depends on `xy-deepseek-desktop: 0.1.1`. If pnpm blocked Electron's install script, run `pnpm approve-builds` in the profile directory named by the log, allow `electron`, and reinstall.

### GitHub offline packages

Each version's [GitHub Release](https://github.com/hexingyuofficial/xy-deepseek-pet/releases) includes the three npm tarballs and `SHA256SUMS`. Most users should use the Harness command above. Release assets are the fallback for offline installs, pinned versions, and troubleshooting:

```sh
dsh plugin --profile web add ./xy-deepseek-pet-0.1.1.tgz
dsh plugin --profile web add ./xy-deepseek-sounds-0.1.1.tgz  # optional
```

The desktop package is installed automatically by the main plugin. Install `xy-deepseek-desktop-0.1.1.tgz` first only when an offline install reports that the desktop package is missing. Release 0.1.1 is unsigned and unnotarized; standalone `.dmg`, `.msi`, and `.exe` installers are not included yet.

## Use

- The sidebar toggle only hides the pet.
- Click a bubble to reply; approve from the same bubble.
- Right-click to open Harness, reply, open settings, reconnect, or hide the pet.
- **Settings > Plugins > Desktop pet** owns theme, scale, motion, chase, throw resistance, full-screen visibility, ZIP import, and the shortcut.

## Platform status

- macOS: source build, clean npm-tarball install, and desktop launch are verified.
- Windows: clean/upgrade installation, desktop launch, and Harness health have been exercised; real-device speech input remains unverified.
- 0.1.1 is unsigned and unnotarized, with no standalone `.dmg`, `.msi`, or `.exe`.

## Development

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm test
pnpm verify
```

```sh
pnpm --filter xy-deepseek-desktop start
pnpm --filter xy-deepseek-desktop dev -- --demo-error
pnpm --filter xy-deepseek-desktop dev -- --demo-approval
```

See [architecture](./docs/architecture.md), [Cordis integration](./docs/cordis-integration.md), and the [plugin API](./docs/plugin-api.md).

## License and security

[MIT License](./LICENSE). Theme and menu interfaces are data-only. Report vulnerabilities privately via [SECURITY.md](./SECURITY.md).

This project is not affiliated with, endorsed by, or sponsored by DeepSeek.
