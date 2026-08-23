# xy-deepseek-desktop

`xy-deepseek-pet` 使用的 Electron 桌面运行时。普通用户无需单独安装；主 Cordis 插件会自动依赖它。首次安装 npm 元数据包后，还会下载约 120-150 MB 的当前平台 Electron 运行时。

运行时包含沙箱 renderer、透明无边框窗口、默认鲸鱼主题、主题 schema 和本地桥客户端。拖动支持可调阻力的无重力抛掷惯性，并限制在松手所在显示器内；macOS 可按设置加入或避开全屏 Space。它只连接 `127.0.0.1`，桥接凭据不会进入渲染进程、设置或日志。

默认启用系统语音输入：长按鲸鱼 `0.5` 秒开始录音，松开后使用 macOS 或 Windows 自带语音识别，并把文字放进最近会话的回复框供用户确认。双击和长按可以分别设置为录音、打开最近会话详情、打开 Harness 或无动作；双击录音时，再双击或点击发送即可停止。首次使用会请求系统麦克风/语音识别权限。录音最长 60 秒，只写入权限为 `0600` 的临时 WAV，识别结束后删除；音频不会进入 Harness bridge。本包不携带语音模型或 API Key。

开发启动：

```sh
pnpm --filter xy-deepseek-desktop build
pnpm --filter xy-deepseek-desktop start
```

失败动画测试：

```sh
pnpm --filter xy-deepseek-desktop dev -- --demo-error
```

审批气泡测试：

```sh
pnpm --filter xy-deepseek-desktop dev -- --demo-approval
```

0.1.1 已验证 macOS 本地运行；Windows 共用源码并已完成安装升级、桌面进程启动与 Harness 健康检查，语音输入仍待 Windows 真机验证。当前包未签名、未公证。

---

Electron runtime used by `xy-deepseek-pet`. Users normally install the main Cordis plugin, which pulls this package automatically. It ships the sandboxed renderer, transparent window, default whale theme, theme schema, and loopback-only bridge client.

System dictation is enabled by default. A `0.5` second long press starts recording; release to transcribe with the macOS or Windows recognizer, then edit the result in the latest session before sending. Double-click and long-press can each be assigned to Record, Open latest session details, Open Harness, or No action. In double-click recording mode, double-click again or use Send to stop. The first use requests OS microphone/speech permissions. Recordings are capped at 60 seconds, stored only in a mode-`0600` temporary WAV, deleted after recognition, and never sent through the Harness bridge. No speech model or API key is bundled.

Version 0.1.1 is verified locally on macOS. Windows installation, upgrade, desktop launch, and Harness health are covered; real-device speech input remains pending. Unsigned and unnotarized.
