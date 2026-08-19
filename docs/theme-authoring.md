# Theme authoring

A theme is a directory containing `theme.json`, image assets, a `README.md`, and license/provenance information. It is data-only and cannot run JavaScript.

Authors can build this native format directly. Users with an existing Codex/Petdex v1 or v2 pet can instead use the explicit local importer described in [theme compatibility](./theme-compatibility.md); imported packs are validated and converted into this same native format.

## Required animations

Every theme provides `idle`, `walk`, `thinking`, `working`, `complete`, `error`, and `offline`. A theme may add `needsInput` and `sleep`; the runtime falls back to `idle` when either is absent and keeps the attention badge for `needsInput`. `sleep` is a quiet loop entered after ten minutes without local interaction. `complete` and `error` should normally set `loop: false`. Reduced-motion rendering uses the first frame unless a dedicated static fallback is added in a later schema version.

For movement, set `walkBaseFacing` to `left` or `right` (default: `right`). The renderer mirrors the required `walk` animation when moving the other way. If the character is asymmetric, add optional `walkLeft` and `walkRight` animations; those directional overrides are used without mirroring.

## V2 reactions and replaceable resources

V2 themes may add these optional animation slots:

- `thinkingEnter`: one-shot transition into the thinking loop;
- `tap`: one-shot direct response to a pet press; repeated presses restart it and a hold retains its final frame until release;
- `errorEnter`, `errorLoop`, and `errorExit`: a correlated failure sequence;
- `completionVariants.regular[]` and `completionVariants.jackpot[]`: replaceable completion-find pools.

The V2 runtime fixes completion selection policy. Regular completion assets divide the non-jackpot probability equally. If a jackpot pool exists, that entire pool has a fixed total probability of `0.1%`, divided equally among its assets. If no jackpot pool exists, regular assets divide `100%`. The theme manifest contains no probability field, and the settings UI does not expose probability controls. There is no product-level limit on the number of assets in either pool, although the importer still enforces global compressed-size, expanded-size, file-count, extension, and path safety limits.

Failure animations must be authored as a group so the character does not jump between unrelated poses:

```text
"errorSequences": [
  { "enter": <animation>, "loop": <animation>, "exit": <animation> }
]
```

The runtime picks one sequence evenly, plays `enter` once, holds `loop` until the corresponding session is acknowledged, and then plays `exit` once. If a V1 theme only has `error`, the importer/runtime uses it for `enter`, holds its final frame for `loop`, and returns directly to the next aggregate state for `exit`. See [theme compatibility](./theme-compatibility.md) for every existing-pet fallback.

Assets remain data-only. Replacing PNG/WebP/AVIF files or adding/removing entries in an allowed pool cannot add scripts, shell commands, network calls, or custom probability logic.

## Frame sequence

Use an explicit ordered file list. This avoids filesystem sort ambiguity:

```json
{
  "kind": "frames",
  "files": ["sprites/idle/0001.webp", "sprites/idle/0002.webp"],
  "frameDurationsMs": [900, 1100],
  "loop": true
}
```

Use exactly one timing mode per animation: `fps` for evenly timed frames, or `frameDurationsMs` for an explicit duration per frame. The duration array must contain one value for every declared frame. Explicit timings are preferred for blinks, anticipation, reactions, and settle poses.

An animation may also set `"pacing": "fast-start-showcase"`. This keeps the source asset intact, displays every other frame during the first 55 percent, displays every authored frame after that, and holds the final 20 percent near 28 fps. It is intended for completion reactions with a quick entrance and a readable final reveal. Themes that omit `pacing` retain their authored timing unchanged.

## Sprite sheet

Frames are read left-to-right, then top-to-bottom:

```json
{
  "kind": "sheet",
  "file": "sprites/thinking.webp",
  "frameWidth": 192,
  "frameHeight": 192,
  "frameCount": 12,
  "columns": 4,
  "fps": 10,
  "loop": true
}
```

Validate a theme from the repository root with `pnpm verify`. Release tooling will later expose a dedicated `theme validate` command.

## Recommended timing

| State | Recommended cycle | Behavior |
| --- | ---: | --- |
| `idle` | 3.0-4.0 s | Quiet breathing with one short blink or tail beat; the long part is a held frame. |
| `sleep` | 3.0-4.0 s | Optional low-energy nap loop; missing assets reuse `idle`. |
| `walk` | 2.0-3.0 s | Put two or three brisk gait cycles inside the authored loop. |
| `thinking` | 2.4-3.2 s | Continuous but restrained loop. |
| `working` | 2.0-2.8 s | Slightly quicker than thinking so tool activity reads as progress. |
| `needsInput` | 2.4-3.2 s | Gentle attention gesture, never a constant alarm. |
| `complete` | 2.2-3.0 s | One-shot reaction, short settle, then idle. |
| `error` | 2.4-3.2 s | One-shot readable reaction, then idle with an error indicator. |
| `offline` | 3.0-4.0 s | Very slow low-energy loop. |

These are authored timeline lengths, not state-switch delays. A higher-priority state interrupts the current loop immediately. Four seconds is appropriate only when most of the timeline is a held or subtle frame. See [animation timing](./animation-timing.md) for the measured Codex reference and the rationale.

## Safety and quality

- Relative POSIX paths only; no URL, absolute path, or `..` segment.
- PNG, WebP, and AVIF are the intended release formats.
- Keep every frame at the declared canvas size with consistent transparent padding.
- Test the silhouette at the actual desktop size and on light and dark backgrounds.
- Include ownership, license, generator, prompt, and material-edit notes.
