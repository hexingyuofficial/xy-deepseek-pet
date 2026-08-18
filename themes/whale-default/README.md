# Little Whale default theme

This is the first-party XY DeepSeek Pet whale theme. Version 0.1.0 contains
the project author's idle, sleep, movement, tap, thinking, failure and
completion artwork as lossless WebP sprite sheets on a fixed 192 x 192 canvas.

The current completion pool has eight uniformly selected regular variants:
eating, saint whale, branches, thunder leap, blindfold, boot, terminator and
fries. Treasure is
the jackpot variant selected by the application's fixed 0.1 percent branch.
The probability is intentionally not part of the theme format.

Failure uses one correlated enter, unread loop and exit sequence. `working`
reuses the supplied thinking loop. No separate offline or needs-input artwork
is included: offline explicitly uses idle, and the omitted needs-input slot
uses the renderer's documented idle fallback.

All animations use a common 30 fps playback rate. Loops retain their authored
frame sequences. Long one-shot transitions and completion reactions are
resampled to 61 frames (about 2.03 seconds), always preserving the first and
last source frames. Completion reveals retain their ending frames most densely;
thunder leap is sampled uniformly so its motion keeps the same visual speed.
Failure enter and exit use a faster opening, medium middle, and dense ending.
The six authored tap frames are retained in full, each displayed for two 30 fps
frames for a 0.4-second reaction that still begins immediately on release.
Source renders
are intentionally kept outside the repository and were not modified during
conversion. See `provenance.json` for frame counts and origin details.
