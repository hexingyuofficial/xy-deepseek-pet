# xy-deepseek-pet

DeepSeek Harness 的非官方开源桌宠插件，包含 Cordis Host 桥、Harness Web 设置界面，并自动安装 `xy-deepseek-desktop` Electron 运行时。

如果 Harness 正在运行，先在原来的 `dsh web` 终端按 `Ctrl+C`。进程退出后再执行：

```sh
dsh plugin --profile web add xy-deepseek-pet
dsh web
```

不能在旧服务仍占用端口时再启动一份。首次安装会下载约 120-150 MB 的 Electron 平台运行时，下载阶段可能暂时没有进度输出。重启后从 Harness 侧边栏打开桌宠，所有偏好都在“设置 > 插件 > 桌面宠物”。支持真实任务状态、最多三个会话气泡、精确会话回复、气泡内审批、20%-200% 缩放、原生/Petdex ZIP 主题导入、可选桌面快捷方式和数据化右键菜单扩展。

插件注册 `xy_pet` agent 工具，用户可直接让 Harness 打开桌宠、查看状态、切换/导入已验证主题或调整大小。它不会把桥接凭据、隐藏推理、完整对话或原始工具参数交给浏览器或模型。

扩展接口见仓库中的 [`docs/plugin-api.md`](https://github.com/hexingyuofficial/xy-deepseek-pet/blob/main/docs/plugin-api.md)。本项目非 DeepSeek 官方产品。

---

Unofficial open-source DeepSeek Harness desktop companion. This package provides the Cordis Host bridge and Harness Web settings, and installs `xy-deepseek-desktop` automatically.

After restarting Harness, use **Open pet** in the sidebar and configure it under **Settings > Plugins > Desktop pet**. The bounded `xy_pet` agent tool can open the pet, inspect status, select or import validated themes, and change scale without exposing credentials, hidden reasoning, transcripts, or raw tool payloads.

MIT licensed. Not affiliated with or endorsed by DeepSeek.
