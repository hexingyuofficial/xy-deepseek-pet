# Theme compatibility

Harness Pet has one native, data-only theme format. Compatibility with other pet ecosystems is implemented by importers that validate and convert source assets into that format. The renderer never executes source-package code or carries multiple runtime state models.

## Recommended compatibility target

The first compatibility target is the Codex/Petdex sprite package format. It is the closest existing ecosystem to an agent desktop pet and has a large public catalog. Petdex's public manifest reported more than 4,500 pets when this decision was recorded. Petdex describes the package format and its HTTP manifest as stable builder surfaces, so this is the strongest current de facto compatibility target, not an industry or standards-body specification.

Codex/Petdex compatibility is an importer contract, not part of the Harness Pet theme schema. OpenAI documents pet behavior publicly, but does not promise the current atlas or package layout as a stable third-party API. Keeping the importer isolated lets it evolve without breaking native themes.

### Recognized package metadata

The initial importer recognizes local v1 and v2 packages with metadata shaped like:

```json
{
  "id": "varsity-bear",
  "displayName": "Varsity Bear",
  "description": "...",
  "spriteVersionNumber": 2,
  "spritesheetPath": "spritesheet.webp"
}
```

Known atlas layouts use `192 x 208` cells:

| Version | Atlas size | Grid |
| --- | ---: | ---: |
| v1 | `1536 x 1872` | 8 columns x 9 rows |
| v2 | `1536 x 2288` | 8 columns x 11 rows |

Classic packages created before `spriteVersionNumber` was introduced may omit the field. Matching Petdex's own parser, omission means v1; explicit unsupported values such as `null` or `3` remain invalid.

The importer must reject inconsistent dimensions, missing images, unknown required metadata, path traversal, archive bombs, and unsupported file types with an actionable error. It must never infer executable behavior from package contents.

### State mapping

The first nine semantic rows map deterministically as follows:

| Harness Pet state | Codex/Petdex source |
| --- | --- |
| `idle` | `idle` |
| `walk` | `running-right` or `running-left`, selected by direction |
| `thinking` | `running` |
| `working` | `running` |
| `needsInput` | `waiting` |
| `complete` | `review`, falling back to `jumping` |
| `error` | `failed` |
| `offline` | static `idle` plus the Harness Pet disconnect badge |

Directional movement is preserved: Petdex `running-right` maps to `walkRight` and `running-left` maps to `walkLeft`. Native themes may provide both overrides, or provide only `walk` plus `walkBaseFacing`; the renderer mirrors that base animation when travel changes direction.

Imported animations keep the source ecosystem's quicker timing, normally about 0.7-1.2 seconds per loop. Harness Pet's first-party whale keeps its authored 2-4 second timelines. Theme import must not rewrite every source into the whale's slower motion language.

### V2 phase fallback contract

The richer V2 whale theme adds entry, persistent, exit, and direct-reaction slots, but accepted existing pets must remain immediately usable after drag-and-drop import. Importers produce the strongest available native mapping and the renderer applies this fixed fallback table; users are never asked to manufacture missing animations before activation.

| V2 behavior | Native v1 fallback | Codex/Petdex v1/v2 fallback |
| --- | --- | --- |
| `idle` | Existing `idle` | Row 0 `idle` |
| `sleep` | Existing optional `sleep`, otherwise `idle` | Row 0 `idle` |
| `walkRight` | Existing override, otherwise mirrored `walk` | Row 1 `running-right` |
| `walkLeft` | Existing override, otherwise mirrored `walk` | Row 2 `running-left` |
| `thinkingEnter` | Start `thinking` immediately | No separate entry; start row 7 `running` |
| `thinking` | Existing `thinking` | Row 7 `running` |
| `working` | Existing `working`, otherwise `thinking` | Row 7 `running` |
| Regular completion pool | Existing `complete` as its sole member | Row 8 `review`, falling back to `jumping` when supported by the source version |
| Jackpot completion pool | Empty; no jackpot roll | Empty; no jackpot roll |
| `errorEnter` | Existing `error` once | Row 5 `failed` once |
| `errorLoop` | Hold the final `error` frame | Hold the final frame of row 5 `failed` |
| `errorExit` | Switch directly to the aggregate state | Switch directly to the aggregate state |
| `needsInput` | Existing animation, otherwise `idle` plus badge | Row 6 `waiting` |
| `tap` | Restart one short `idle` reaction | Restart one row 0 `idle` cycle |
| `offline` | Existing animation, otherwise static `idle` plus badge | Static row 0 `idle` plus disconnect badge |

An accepted package therefore never fails because it lacks a whale-specific transition. A source asset is reused only according to this table; the importer does not invent semantic success, failure, or attention behavior from filenames. Unsupported formats are rejected with an actionable explanation instead of being partially activated.

Native V2 packs may declare any number of regular completion animations, jackpot completion animations, and correlated failure sequences within the global archive size and file-count safety limits. The theme declares membership only: product code fixes the jackpot tier at `0.1%`, divides each tier evenly, and selects failure sequences evenly. Neither imported metadata nor the theme UI can override those probabilities.

## User flow

Theme selection and ZIP import are exposed under Harness Settings > Plugins > Desktop pet. The managed importer validates native and Codex/Petdex packages before activation and does not introduce a second desktop settings dialog.

Local discovery of conventional Codex or Petdex folders may be offered after the user opens the import flow. The application does not scan home directories silently at startup. Imported source locations are not watched, and an invalid update cannot replace the active theme.

## Compatibility matrix

| Ecosystem/format | MVP decision | Reason |
| --- | --- | --- |
| Harness Pet native theme | Read directly | Stable public contract for this project; frames and sprite sheets are data-only. |
| Codex/Petdex v1 and v2 | Import ZIP | Closest semantic match and largest relevant catalog. |
| Generic GIF/APNG | Later conversion tool | Easy image input, but carries no agent-state mapping or complete theme metadata. |
| VS Code Pets | Later, image-only feasibility | Uses separate GIFs and TypeScript-coded state machines rather than a portable pack contract. |
| Shimeji | Deferred | PNG/XML packs can encode complex behaviors; an image-only importer needs a separate security review. |
| Lottie, Rive, Live2D | Out of MVP | Renderer formats, not agent-pet state standards; they add runtime and authoring complexity. |

## Licensing and provenance

Importer support does not grant redistribution rights. Petdex software can be MIT-licensed while individual submitted pets retain different or unclear asset rights. Therefore:

- community pets are never bundled, mirrored, or republished by Harness Pet without an explicit compatible asset license;
- the importer preserves source name, author, source URL when present, declared license, and an import timestamp;
- missing or unknown license metadata is shown to the user and recorded as `unknown`, not guessed;
- exported or shared themes include the preserved provenance record;
- the first-party whale has its own explicit asset license and provenance file.

## Security policy

All imported themes are treated as untrusted data. Import enforces archive-entry, compressed-size, expanded-size, file-count, extension, and path limits. Petdex WebP atlases also require the exact dimensions defined by their format version. Symlinks, absolute paths, parent traversal, URLs, HTML, scripts, binaries, XML behavior definitions, and unknown files are ignored or rejected. Only declared image files and allowlisted metadata fields cross into the managed native theme.

## Public references

- [Petdex repository and package-format documentation](https://github.com/crafter-station/petdex#pet-package-format)
- [Petdex public gallery](https://petdex.dev/)
- [VS Code Pets repository](https://github.com/tonybaloney/vscode-pets)
- [Shimeji desktop-pet reference implementation](https://github.com/asdfman/linux-shimeji)
