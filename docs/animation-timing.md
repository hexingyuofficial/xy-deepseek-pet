# Animation timing

## Measured Codex reference

The public [OpenAI Pets documentation](https://developers.openai.com/codex/pets) defines status behavior and reduced-motion handling but does not publish animation timing. The bundled `hatch-pet` contract in ChatGPT desktop `26.803.61601` defines variable per-frame durations for an 8-column sprite atlas:

| Codex row | Total duration |
| --- | ---: |
| idle | 1100 ms |
| running right/left | 1060 ms |
| waving | 700 ms |
| jumping | 840 ms |
| failed | 1220 ms |
| waiting for input | 1010 ms |
| running/processing | 820 ms |
| review | 1030 ms |

These totals are implementation reference measurements, not a promise in the public OpenAI product contract. Codex also uses nonuniform frame durations, usually holding the final or neutral frame longer.

## Harness Pet decision

Use a 2-4 second authored loop as the default visual rhythm. State changes still happen immediately; the renderer never waits for the current loop to finish before showing a higher-priority state. Fast motion can repeat inside the longer authored loop.

- Use 3-4 seconds for idle and offline compositions that mostly hold still.
- Author walk as a 2-3 second loop containing two or three 0.8-1.2 second gait cycles, so the feet do not read as slow motion.
- Keep thinking around 2.4-3.2 seconds and working around 2.0-2.8 seconds.
- Give needs-input around 2.4-3.2 seconds with a held attention pose.
- Give complete and error around 2.2-3.2 seconds once, including their settle frame.
- Use explicit `frameDurationsMs` whenever anticipation or a held pose matters.

The default whale should start from these ranges and be tuned by previewing it at actual desktop size. Long loops should get their duration from held frames, breathing, or anticipation rather than uniformly slowing every drawing. The theme schema permits either even `fps` timing or one duration per frame.
