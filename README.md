<p align="center">
  <img src="packages/harness-plugin/assets/whale-calm.png" width="160" alt="XY DeepSeek Pet 小鲸鱼">
</p>

# XY DeepSeek Pet

[English](./README.en.md) | 中文

一个非官方、开源的 DeepSeek Harness 桌面小鲸鱼。它会跟着真实任务待机、思考、调用工具、等待你回答、完成或失败，也能直接回复对应会话。

## 有什么

- 小鲸鱼会游动、打瞌睡、被按扁和喷水；思考时会扎进水里，完成时可能随机带回薯条、眼罩、树枝或宝箱。
- 最多显示三个会话提醒。提问和审批会明确提示，单击气泡即可回复原会话，回车发送。
- 默认长按鲸鱼打开 Harness，也可改成双击；拖动跟手，大小可在 40%-200% 之间调整。
- 可导入本项目主题 ZIP 和 Petdex v1/v2 宠物包。主题只含图片和 JSON，不执行脚本。
- 所有设置都在 Harness 的“通用设置 > 桌面宠物”中；右键菜单只保留常用动作。
- 可选的 `xy-deepseek-sounds` 提供任务完成、工具成功和工具失败提示音，不装桌宠也能单独使用。
- 安装后 Harness agent 会知道桌宠、主题和声音接口。你可以直接说“帮我换一个本地宠物包”或“把任务完成提示音换成这个文件”。

桌宠不会显示隐藏思考过程、完整对话、原始工具参数或桥接凭据。气泡里只出现有限长度的公开状态和助手回复。

## 安装

需要 DeepSeek Harness `0.1.0-rc.6` 和 Node.js 22 或更高版本。当前使用 Harness 的 `web` profile：

```sh
dsh plugin --profile web add xy-deepseek-pet
dsh web
```

重启 Harness 后，侧边栏会出现“打开桌宠”。首次安装不会自动弹出桌宠；可在通用设置里开启“启动 Harness 时自动打开”。桌面运行时 `xy-deepseek-pet-desktop` 会随主插件自动安装，不需要单独添加。

提示音是可选的，可单独安装，也可和桌宠一起安装：

```sh
dsh plugin --profile web add xy-deepseek-sounds
```

| 安装内容 | 你会得到什么 |
| --- | --- |
| `xy-deepseek-pet` | Cordis Host 桥、Harness 设置页和 Electron 桌宠 |
| `xy-deepseek-sounds` | 独立的完成/工具结果提示音，不安装 Electron |
| 两者都装 | 声音设置会收进“桌面宠物”区域，不重复监听事件 |

## 使用

- 侧边栏“打开桌宠/关闭桌宠”是真实开关，只关闭桌宠不会停止 Harness。
- 单击会话气泡会原地变成输入框；`Enter` 发送，`Shift+Enter` 换行，点击其他地方收起。
- 右键可打开 Harness、回复最近活跃会话、打开设置、重新连接或关闭桌宠。
- 在“通用设置 > 桌面宠物”中可换主题、缩放、关闭游动、选择打开手势、导入 ZIP，并创建可选桌面快捷方式。
- 拖入或选择 ZIP 后会先验证再激活。兼容范围和状态映射见[主题兼容说明](./docs/theme-compatibility.md)。

想制作自己的主题，从可直接导入的 [`examples/minimal-theme`](./examples/minimal-theme/) 开始，再看[主题制作指南](./docs/theme-authoring.md)和 [`schemas/theme.schema.json`](./schemas/theme.schema.json)。

## 平台状态

- macOS：源码构建、npm tarball 干净安装和桌面进程启动已验证。
- Windows：共用同一套 Electron 源码，固定参数启动、PowerShell 播放和构建路径有自动化测试；0.1.0 尚未完成交互式 Windows GUI 全流程验证。
- 0.1.0 未签名、未公证，也没有独立 `.dmg`、`.msi` 或 `.exe` 安装器。系统若拦截未知应用，请优先通过 npm/Harness 安装，不要绕过来源不明的安全警告。

## 开发

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm test
pnpm verify
```

本地启动桌宠：

```sh
pnpm --filter xy-deepseek-pet-desktop start
```

确定性预览失败进入、停留和退场：

```sh
pnpm --filter xy-deepseek-pet-desktop dev -- --demo-error
```

架构、Cordis 接入和安全扩展接口分别见[架构](./docs/architecture.md)、[Cordis 集成](./docs/cordis-integration.md)和[插件 API](./docs/plugin-api.md)。

## 开源与安全

代码使用 [MIT License](./LICENSE)。默认鲸鱼和内置声音的来源、许可与哈希记录在各自的 provenance 文件中。主题和菜单扩展都是数据接口：不接受主题脚本、任意 JavaScript、URL 或 shell 命令。安全问题请按 [SECURITY.md](./SECURITY.md) 私下报告。

本项目与 DeepSeek 无隶属、合作或背书关系；DeepSeek 名称及相关标识归其权利人所有。
