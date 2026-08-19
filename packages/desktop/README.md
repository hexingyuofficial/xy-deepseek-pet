# xy-deepseek-desktop

`xy-deepseek-pet` 使用的 Electron 桌面运行时。普通用户无需单独安装；主 Cordis 插件会自动依赖它。首次安装 npm 元数据包后，还会下载约 120-150 MB 的当前平台 Electron 运行时。

运行时包含沙箱 renderer、透明无边框窗口、默认鲸鱼主题、主题 schema 和本地桥客户端。拖动支持可调阻力的无重力抛掷惯性，并限制在松手所在显示器内；macOS 可按设置加入或避开全屏 Space。它只连接 `127.0.0.1`，桥接凭据不会进入渲染进程、设置或日志。

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

0.1.0 已验证 macOS 本地运行；Windows 共用源码并有构建与进程参数测试，但交互式 GUI 烟测尚未完成。当前包未签名、未公证。

---

Electron runtime used by `xy-deepseek-pet`. Users normally install the main Cordis plugin, which pulls this package automatically. It ships the sandboxed renderer, transparent window, default whale theme, theme schema, and loopback-only bridge client.

Version 0.1.0 is locally verified on macOS. Windows build and fixed-argument process paths are covered, while interactive Windows GUI smoke testing remains pending. Unsigned and unnotarized.
