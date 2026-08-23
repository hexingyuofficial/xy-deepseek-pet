# Changelog

All notable changes are documented here. This project follows semantic versioning.

## [0.1.1] - 2026-08-24

### Added

- System dictation on macOS and Windows, assignable independently to long press or double-click, with local recording cues and review-before-send behavior.
- Rich recent-session details with Markdown, inline replies, questions, and approval actions, plus configurable global summon shortcuts and a macOS Finder Quick Action.
- Pointer chase controls, diagonal wandering, throw inertia and collision physics, movable session bubbles, full-screen visibility controls, and treasure statistics.
- User-selectable accent color, improved sound controls, and project-owner-provided default notification sounds.

### Changed

- Desktop-pet settings now live under Harness **Settings > Plugins** and use the official plugin settings extension point.
- Session bubbles follow the latest public assistant update while preserving the final answer; active thinking and tool animations remain uninterrupted by interaction or approvals.
- Petdex imports accept compatible legacy packs with missing version metadata and hold sparse frames instead of flashing blank frames.
- Desktop launch and upgrade handling now reject mismatched runtimes, clean inherited Electron host variables, reconnect cleanly, and avoid stale resident processes.

### Fixed

- Approval and question state ordering, multi-session reply routing, lost pointer releases, multi-display positioning, edge collision clipping, bubble recentering, IME layering, and context-menu focus behavior.
- macOS microphone capture now explicitly uses the system-default input without Chromium processing that could suppress nearby speech.

### Security

- File and image attachments remain bounded and explicit; imported themes and menu extensions stay data-only.
- Voice diagnostics record device and signal metadata only. Audio and recognized text are not retained.

## [0.1.0] - 2026-08-18

### Added

- Cordis Host and Harness Web plugin with a real open/close desktop-pet toggle and compact General settings.
- Sandboxed Electron companion for macOS and Windows with original whale animations, 20%-200% scaling, movement, sleep, press, thinking, completion, failure, and offline states.
- Up to three prioritized session bubbles, bounded public status text, question/approval attention, exact-session inline replies, and a reconnect action.
- Native schema-v1/v2 and Petdex v1/v2 ZIP import with bounded archive validation and data-only themes.
- Data-only `xyPetMenu` extension service and bounded `xy_pet` agent capability.
- Independently installable `xy-deepseek-sounds` bundle with completion and tool-result channels, validated local audio import, and `xy_pet_sounds` agent capability.
- Optional fixed-argument desktop shortcut that starts or focuses Harness Web and the pet.
- Chinese-first and English documentation, an importable minimal theme, asset provenance, and cross-platform automated tests.

### Security

- Loopback-only authenticated bridge with credentials excluded from renderer, settings, logs, snapshots, and model tools.
- Hidden reasoning, full transcripts, question arguments, approval reasons, raw tool payloads, and executable theme/menu content are never surfaced.

[0.1.1]: https://github.com/hexingyuofficial/xy-deepseek-pet/releases/tag/v0.1.1
[0.1.0]: https://github.com/hexingyuofficial/xy-deepseek-pet/releases/tag/v0.1.0
