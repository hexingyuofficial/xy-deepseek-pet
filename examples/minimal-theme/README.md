# Minimal importable theme

这是一个可以直接导入的最小原生主题。它用同一张项目自有 WebP 覆盖七个必需状态，适合验证 ZIP 结构或作为新主题起点。

将本目录内容压缩成 ZIP，确保 `theme.json` 位于 ZIP 根目录，然后在 Harness 的“通用设置 > 桌面宠物 > 导入宠物包”中拖入或选择它。

制作正式主题时，请为不同状态替换图片，并按照 [`docs/theme-authoring.md`](../../docs/theme-authoring.md) 添加可选的 `sleep`、`tap`、思考进入、完成变体和失败序列。主题只能包含数据和图片。

---

This is a directly importable minimal native theme. It reuses one project-owned WebP for all seven required states, making it useful as a ZIP-structure smoke test or a starting point.

Zip this directory with `theme.json` at the archive root, then drop or choose it under **General settings > Desktop pet > Import pet pack**. Replace the images per state and follow [`docs/theme-authoring.md`](../../docs/theme-authoring.md) for optional V2 animation slots.
