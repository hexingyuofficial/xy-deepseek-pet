# xy-deepseek-sounds

DeepSeek Harness 的可选提示音插件，可独立安装，不需要 Electron 桌宠。

```sh
dsh plugin --profile web add xy-deepseek-sounds
dsh web
```

一个插件统一管理三个通道：任务完成默认开启，工具成功和工具失败默认关闭。每个通道可单独开关、调音量、试听，并导入不超过 10 MiB、解码后不超过 10 秒的 WAV、MP3 或 OGG。事件会去重、限流并顺序播放，避免同时响多个声音。

只安装声音包时，控制项出现在 Harness 设置中；和 `xy-deepseek-pet` 一起安装时，它们会收进“桌面宠物”区域。`xy_pet_sounds` agent 工具支持查看、选择、开关和导入已验证的本地声音，不返回文件内容或路径。

内置短音由项目生成并按 CC0 提供，哈希与来源记录在 `assets/provenance.json`。本项目非 DeepSeek 官方产品。

---

Optional sound notifications for DeepSeek Harness, independently installable without Electron. One coordinated plugin owns turn-complete, tool-success, and tool-failure channels with deduplication, rate limiting, bounded queueing, per-channel settings, previews, and validated local audio import.

Built-in tones are project-generated CC0 assets with recorded provenance and hashes. MIT licensed. Not affiliated with or endorsed by DeepSeek.
