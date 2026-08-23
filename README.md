<p align="center">
  <img src="docs/readme/demo.gif" width="220" alt="小鲸鱼待机、游走、按扁、下潜思考，再衔着战利品浮上来">
</p>

<h1 align="center">XY DeepSeek Pet</h1>

<p align="center">
  中文 · <a href="./README.en.md">English</a>
</p>

<p align="center">
  <img alt="version" src="https://img.shields.io/badge/version-0.1.1-4EA8FF?style=flat-square">
  <img alt="license" src="https://img.shields.io/badge/license-MIT-2ea44f?style=flat-square">
  <img alt="node" src="https://img.shields.io/badge/Node.js-22%2B-43853d?style=flat-square">
  <img alt="harness" src="https://img.shields.io/badge/Harness-0.1.0--rc.6-1688f8?style=flat-square">
  <img alt="macos" src="https://img.shields.io/badge/macOS-verified-111827?style=flat-square">
  <img alt="windows" src="https://img.shields.io/badge/Windows-source%20ready-111827?style=flat-square">
  <img alt="petdex" src="https://img.shields.io/badge/Petdex-v1%20%2F%20v2-7c3aed?style=flat-square">
</p>

<p align="center">
  <b>非官方、开源的 DeepSeek Harness 桌面伴随与开放交互底座。</b><br>
  主打「好用（方便）、好玩（有趣）、开放（可组装）」：开箱即用，同时也为所有愿意折腾的极客与创作者留足自由定制的接口。
</p>

<p align="center">
  <a href="#为什么做它">为什么做它</a> ·
  <a href="#好用方便省心">好用</a> ·
  <a href="#好玩有趣鲜活">好玩</a> ·
  <a href="#开放自由折腾">开放</a> ·
  <a href="#安装">安装</a> ·
  <a href="#使用与手势">使用</a> ·
  <a href="#二开指南">二开指南</a>
</p>

<p align="center">
  <img src="docs/readme/gallery.png" alt="小鲸鱼待机、睡觉、游走、下潜、按扁和失败动作预览" width="720">
</p>

---

## 为什么做它

一句话：**在单屏做音乐、写文档或写代码时，不再为了看一眼进度、说两句话或点个审批而频繁全屏切大窗。**

当你沉浸在 DAW（如 REAPER）里整理音频轨道、在编辑器里写代码，或在飞书里写文档时，偶尔需要叫 Agent 跑一步或改个东西。过去你需要切到全屏网页端，打完字再切回来，心流被反复打断。

XY Pet 是桌面上那只小鲸鱼：
- 随时用 `Cmd+Shift+P` 唤出到光标旁；
- 长按 0.5 秒直接用本机系统语音输入；
- 遇到审批直接在气泡里点「允许 / 拒绝」；
- 用完随时关闭，主工作台无需让路。

| 核心维度 | 你的体验 |
| :--- | :--- |
| **好用（方便）** | 单屏免切大窗，快捷键随叫随到，长按 0.5s 原生语音输入，气泡内单步审批 |
| **好玩（有趣）** | 真实下潜作业防假死，按扁形变，甩飞碰撞，完成一声鲸叫，随机战利品与 0.1% 罕见宝箱 |
| **开放（折腾）** | 换皮肤（兼容 Petdex）、换语音模型（`VoiceTranscriber`）、换提示音，Agent 还能一句话帮你改 |

> 🔒 **纯本地安全底线**：全部运行在用户本机，无外部云端中转；进程间仅绑定 `127.0.0.1` 环回临时凭据；本地语音识别录完即删；隐藏思维链（`reasoning-delta`）与私密 Token 不出桌面；主题包仅解析静态图片与 JSON，不执行任何外部脚本。

---

## 好用（方便省心）

事情在桌面上 5–10 秒内就能干脆利落地做完。

<p align="center">
  <img src="docs/readme/长按语音输入.png" width="400" alt="长按 0.5 秒触发系统语音录入与物理压扁反馈">
  <img src="docs/readme/打字对话.png" width="400" alt="伴随气泡展开与快速打字交互">
</p>

- **系统级语音即开即用**：长按 `0.5` 秒开始录音，小鲸鱼会呈现被按扁的物理触感反馈；松开后文字直接上屏进最近会话回复框，人工确认后再按回车发送，绝不自动误发。直接调用本机系统自带原生语音识别（macOS Speech Framework / Windows 语言包），**零配置、零 API 成本、极低延迟**。
- **气泡快捷交互与审批闭环**：最多展示 3 个活跃会话气泡。点开即可打字；当 Agent 遇到提问选择或工具权限拦截时，气泡内直接单点决策，无需切回网页端。

<p align="center">
  <img src="docs/readme/选择.png" width="400" alt="场景一：Agent 提问与气泡内直接多选">
  <img src="docs/readme/权限.png" width="400" alt="场景二：工具权限拦截与单步允许/拒绝">
</p>

- **随时自定义快捷键与手势**：全局召唤快捷键 `Cmd+Shift+P` 随时可改可关；长按与双击手势可独立配置为「录音」、「打开最近会话详情」、「打开 Harness 网页端」或「无动作」。
- **一键拉起桌面快捷方式**：设置里可一键生成桌面入口，同时拉起 Harness、网页端与桌面宠物，支持自定义 PNG 图标。

---

## 好玩（有趣鲜活）

它不是死板的静态图标，而是跟着真实任务状态呼吸与动作的桌面伙伴。

<p align="center">
  <img src="docs/readme/思考中.png" width="400" alt="任务启动：扎入水下潜行思考状态">
  <img src="docs/readme/出错了.png" width="400" alt="任务异常：受挫动作与失败提示反馈">
</p>

<p align="center">
  <img src="docs/readme/思考结束简略提示.png" width="400" alt="任务完成：气泡文字简报上浮">
  <img src="docs/readme/结束思考动画（十几个之间抽一个）.png" width="400" alt="结算反馈：浮出水面衔带随机战利品">
</p>

- **任务状态真实下潜（拒绝假死）**：任务一开始小鲸鱼就一头扎进水里潜行思考；工具在跑时持续在水下作业，长耗时任务状态一目了然。
- **清脆鲸叫与丰富战利品随机池**：任务完成时播放一声清脆标志性的鲸鱼叫声；从水下浮出时在香脆薯条、圣光之剑、终结者墨镜、海盗眼罩、海草树枝、靴子等十几种道具中均分随机抽选。
- **固定 0.1% 罕见宝箱惊喜**：底层运行时硬编码锁定固定 `0.1%` 的罕见宝箱真随机掉落机制（约千分之一概率），主题包无法篡改，保证抽奖的真随机与惊喜感。

<p align="center">
  <img src="docs/readme/loot-showcase.png" width="820" alt="每次完成任务浮出水面时随机衔带的战利品图鉴（包含 0.1% 罕见宝箱）">
</p>

- **鼠标追逐与惯性甩飞**：开启后小鲸鱼会跟着指针游动；鼠标拖拽并快速松手会带着惯性滑出，在当前屏幕边缘弹性碰撞反弹并自然停下。
- **打瞌睡与形变触感**：闲置 10 分钟无人理会它会自动打瞌睡；按住录音时会被按扁。大小可在 20% 到 200% 自由缩放。

---

## 开放（自由折腾）

无论你是否擅长写代码，只要你愿意折腾，整套系统所有模块均已解耦为纯数据契约。

- **海量兼容 Petdex 皮肤包**：设置里直接选择 ZIP 即可导入 [Petdex](https://petdex.dev/) v1 / v2 宠物包，社区数千只精灵图即拖即用。
- **原生 6 态主题制作**：支持按 [`schemas/theme.schema.json`](./schemas/theme.schema.json) 和[主题制作指南](./docs/theme-authoring.md)自己画一套专属 6 态动作包。
- **可插拔语音转写引擎（`VoiceTranscriber`）**：除了系统原生转写，开发者可通过标准接口编写 Provider，接入本地 Whisper（如 whisper.cpp / faster-whisper）或私有 ASR 模型。
- **3 通道提示音自定义**：独立的 `xy-deepseek-sounds` 插件管理任务完成（鲸鱼叫声）、工具成功、工具失败 3 路声音，可导入不超过 10 秒的本地 WAV / MP3 / OGG 音频。
- **Agent 自主协助配置**：大模型自身通过 `xy_pet` 工具知晓所有配置接口，你可以直接对 Agent 说：“帮我把皮肤换成桌面上的 pikachu.zip”或“把完成提示音换成这个文件”。

---

## 安装

需要 DeepSeek Harness `0.1.0-rc.6` 和 Node.js 22 或更高版本（走 Harness 的 `web` profile）。

1. 如果 `dsh web` 正在运行，先回到对应终端按 `Ctrl+C` 退出；
2. 安装插件：

   ```sh
   dsh plugin --profile web add xy-deepseek-pet
   ```

   桌面运行时 `xy-deepseek-desktop` 会自动跟上。首次安装还会下载对应平台的 Electron 运行环境（约 120–150 MB）。

3. 重新启动 Harness：

   ```sh
   dsh web
   ```

启动后侧边栏会出现「打开桌宠」。首次安装可在「设置 > 插件 > 桌面宠物」中开启「随 Harness 启动」。

提示音扩展为可选插件：

```sh
dsh plugin --profile web add xy-deepseek-sounds
```

| 安装内容 | 获得的能力 |
| :--- | :--- |
| `xy-deepseek-pet` | Cordis Host 适配桥、Harness 设置页与 Electron 桌面伴随宠物 |
| `xy-deepseek-sounds` | 任务完成、工具成功与失败 3 通道提示音（不安装 Electron） |
| 两者都装 | 声音设置自动收纳进「桌面宠物」面板中，无缝融合 |

---

## 使用与手势

- **全局唤出**：按下 `Cmd+Shift+P` 将小鲸鱼召唤到光标处；
- **语音输入**：长按小鲸鱼 `0.5` 秒（形变后说话），松开后文字上屏，回车发送；
- **气泡交互**：单击气泡打字，审批直接点击「本次允许 / 拒绝」；
- **右键菜单**：打开 Harness、回复最近会话、打开设置、重新连接或关闭桌宠；
- **偏好设置**：位于 **设置 > 插件 > 桌面宠物**（主题选择、缩放大小、追鼠标、抛掷阻力、手势映射、提示音通道与 ZIP 导入）。

---

## 平台支持状态

- **macOS**：源码构建、npm 安装与桌面全流程交互均已完整验证；
- **Windows**：共用同一套 Electron 源码，安装启动与自动化测试已就绪，语音交互全流程走查中；
- v0.1.1 为开源轻量扩展，未签名公证，暂不提供独立 `.dmg` / `.msi` 安装包，请通过 `dsh plugin` 标准方式安装。

---

## 开发与二次开发

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm test
pnpm verify
```

```sh
# 本地调试桌面伴随进程
pnpm --filter xy-deepseek-desktop start
pnpm --filter xy-deepseek-desktop dev -- --demo-error
pnpm --filter xy-deepseek-desktop dev -- --demo-approval
```

详细技术架构与协议文档：
- [架构设计（Architecture）](./docs/architecture.md)
- [Cordis 插件集成（Cordis Integration）](./docs/cordis-integration.md)
- [插件与 Agent 工具 API（Plugin API）](./docs/plugin-api.md)
- [主题制作指南（Theme Authoring）](./docs/theme-authoring.md)

---

## 开源协议与声明

代码采用 [MIT License](./LICENSE) 开源。

本项目为非官方开源扩展，与 DeepSeek 无官方隶属、合作或背书关系。DeepSeek 名称及相关标识归其权利人所有。
