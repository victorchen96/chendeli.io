# Civ6 无 GUI 模拟器调研报告

> 调研日期：2026-05-26

## 一、核心问题：有没有现成可用的 Civ6 无 GUI 模拟器？

**结论：没有。** Civilization VI 不存在官方或社区维护的无 GUI 模拟器。

### 1.1 Civ6 官方能力

| 方式 | 说明 | 是否真正 headless |
|------|------|-------------------|
| AutoPlay Lua 命令 | `Game.SetAutoPlay(0, 10)` 或 `AutoplayManager.SetActive(true)` 可让 AI 接管回合 | 否，需要完整游戏运行 |
| FireTuner (Tuner) | SDK 调试工具，可实时执行 Lua 命令、操纵游戏状态 | 否，需要游戏图形客户端 |
| Observer/Spectator 模式 | 所有文明交由 AI，人类观看 | 否，仍需 GUI |
| Xvfb 虚拟显示 | Linux 下用 `xvfb-run` 启动游戏，模拟显示 | 半 headless：进程运行但无物理屏幕，仍需完整游戏引擎 |
| Steam `-autoplay` 启动参数 | 社区提到的启动参数 | 未经证实，仍启动图形应用 |

**关键限制：** Civ6 的游戏逻辑与渲染引擎紧密耦合（Firaxis 自研引擎），无法将逻辑层独立运行。存档文件虽可解析/修改，但无法在游戏引擎外推进回合。

### 1.2 Civ6 存档操作

- 存档为二进制格式，可解压读取游戏状态（金币、单位、地图等）
- 可修改存档数值
- **不可能** 在游戏引擎外模拟回合推进（游戏规则计算逻辑未公开）
- PYDT (Play Your Damn Turn) 服务只做存档中转，不做模拟

---

## 二、最接近的替代品

### 2.1 CivRealm（推荐首选）

| 属性 | 详情 |
|------|------|
| **GitHub** | https://github.com/bigai-ai/civrealm |
| **基础** | 基于 FreeCiv（开源 Civilization 克隆） |
| **语言** | Python（Gymnasium 兼容接口） |
| **安装** | `pip install civrealm`，需 Docker 运行 FreeCiv 服务器 |
| **headless** | 完全支持，FreeCiv 服务器原生支持无 GUI 运行 |
| **API 风格** | OpenAI Gym 标准：`reset()`, `step()`, `observe()` |
| **观察空间** | 地图地形、资源、单位位置/类型/血量、城市产出/人口/建筑、科技树、外交状态 |
| **动作空间** | 单位动作（移动/攻击/建城）、城市动作（切换产出/购买）、玩家动作（研究科技/外交/税率） |
| **多智能体** | 支持多 AI 同时对弈 |
| **LLM 集成** | 已有 LLM baseline（`civrealm-llm-baseline`），专为 LLM Agent 设计 |
| **学术论文** | "CivRealm: A Learning and Reasoning Odyssey in Civilization" |
| **Civ6 规则覆盖** | ~60%（FreeCiv 基于 Civ1/2 规则，缺少区域、政策卡、总督等 Civ6 特色机制） |
| **适合度** | 最适合 AI 决策测试，已有成熟生态 |

### 2.2 Unciv（Civ5 开源克隆）

| 属性 | 详情 |
|------|------|
| **GitHub** | https://github.com/yairm210/Unciv |
| **基础** | 开源重制 Civilization V |
| **语言** | Kotlin + LibGDX |
| **headless** | 通过 LibGDX `HeadlessBackend` 可无 GUI 运行；有 `UncivServer` 多人服务器 |
| **架构** | 游戏逻辑（`core` 模块）与 UI 明确分离 |
| **AI 自动化** | `com.unciv.logic.automation` 包：城市自动化、单位自动化、文明级 AI |
| **API** | 无原生 REST/Gym API，但架构允许外部封装 |
| **Civ6 规则覆盖** | ~50%（Civ5 规则，缺少 Civ6 的区域、政策卡、环境灾害等） |
| **Mod 扩展** | JSON 模组系统，可自定义文明、单位、建筑、科技树 |
| **适合度** | 若需更接近 Civ5/6 的完整 4X 体验，可作为 CivRealm 的补充 |

### 2.3 FreeCiv（原版）

| 属性 | 详情 |
|------|------|
| **GitHub** | https://github.com/freeciv/freeciv |
| **语言** | C |
| **headless** | 原生支持：`freeciv-server` 可纯命令行运行 |
| **网络协议** | TCP-based 客户端-服务器协议，AI Agent 可作为客户端连接 |
| **AI 接入** | 通过网络协议自定义客户端，或用 CivRealm 封装 |
| **规则集** | 可切换规则集（civ1/civ2/civ2civ3/multiplayer），模拟不同版本 |
| **适合度** | 底层引擎成熟，但直接使用需理解 C 网络协议，建议通过 CivRealm |

### 2.4 其他环境对比

| 项目 | 类型 | 语言 | 复杂度 | 与 Civ6 相似度 | AI 接口 |
|------|------|------|--------|----------------|---------|
| **Lux AI** | 简化策略对战 | Python/TS | 中 | 低（资源+城市，无科技树/外交） | Kaggle 竞赛 API |
| **microRTS** | 极简 RTS | Java | 低 | 极低（实时制） | Gym-microRTS |
| **OpenSpiel** (DeepMind) | 通用博弈框架 | C++/Python | 高 | 无（无 4X 游戏） | 标准 RL API |
| **Tribes** (GAIG) | Polytopia-like | Java | 中 | 中（简化 4X） | Java API |
| **CivJS** | 浏览器 Civ | JavaScript | 低 | 低（极简实现） | 无 |

---

## 三、自己实现简化版 Civ6 模拟器的工作量评估

### 3.1 如果从零实现

| 模块 | 工作量（人周） | 说明 |
|------|----------------|------|
| 六角地图引擎 | 2-3 | 地形、资源、可见性 |
| 单位系统 | 2-3 | 移动、战斗、升级 |
| 城市系统 | 3-4 | 人口增长、产出、区域（Civ6特色） |
| 科技+市政树 | 1-2 | 两棵树的解锁逻辑 |
| 政策卡系统 | 1-2 | Civ6 特有的政策牌组 |
| 外交系统 | 2-3 | 议程、关系、交易 |
| 胜利条件 | 1 | 科技/文化/征服/宗教/分数 |
| AI 决策接口 | 2-3 | 暴露给外部 Agent 的 API |
| 测试 + 平衡 | 3-5 | 确保规则正确 |
| **总计** | **17-26 人周** | 约 4-6 个月（1人全职） |

### 3.2 如果基于 Unciv 改造

| 工作 | 工作量（人周） | 说明 |
|------|----------------|------|
| 添加 REST/gRPC API 层 | 2-3 | 封装 Unciv 游戏逻辑 |
| 实现 Headless 运行模式 | 1-2 | 使用 LibGDX HeadlessBackend |
| 添加 Civ6 特有规则 | 4-6 | 区域、政策卡、环境灾害、总督 |
| Python 客户端 SDK | 1-2 | 给 AI Agent 用的 Python wrapper |
| 测试 + 调试 | 2-3 | |
| **总计** | **10-16 人周** | 约 2.5-4 个月（1人全职） |

### 3.3 如果基于 CivRealm/FreeCiv 改造

| 工作 | 工作量（人周） | 说明 |
|------|----------------|------|
| 自定义 FreeCiv 规则集 | 3-5 | 模拟 Civ6 机制（区域、政策等） |
| 扩展 CivRealm 观察/动作空间 | 2-3 | 增加 Civ6 特有概念 |
| 验证规则正确性 | 2-3 | |
| **总计** | **7-11 人周** | 约 2-3 个月（1人全职） |

---

## 四、推荐方案

### 最终推荐：CivRealm 作为 AI Bridge 测试环境

**理由：**

1. **即开即用**：`pip install civrealm` + Docker，无需改造即可开始 AI 测试
2. **Gymnasium 标准 API**：与主流 RL/LLM Agent 框架无缝对接
3. **已有 LLM Baseline**：专门为 LLM Agent 设计了接口和 baseline 实现
4. **学术验证**：有正式论文和活跃的研究社区
5. **Headless 原生支持**：FreeCiv server 完全无 GUI 运行，适合服务器部署
6. **多智能体**：天然支持多 AI 同时对弈
7. **扩展性**：FreeCiv 规则集系统允许逐步添加 Civ6 特有机制

### 推荐实施路径

```
阶段1（1-2周）：直接使用 CivRealm
  - 安装 CivRealm，跑通基本 AI Agent
  - 验证 LLM Agent 通过 API 控制游戏的可行性
  - 测试观察空间是否满足决策需求

阶段2（2-4周）：定制 Civ6 规则
  - 创建自定义 FreeCiv 规则集，模拟 Civ6 核心差异
  - 添加区域概念（简化版）
  - 扩展科技树和市政树

阶段3（可选，4-8周）：深度定制
  - 实现政策卡系统
  - 添加环境灾害
  - 完善外交系统
  - 考虑是否需要切换到 Unciv 作为底层
```

### 备选方案

| 场景 | 推荐 |
|------|------|
| 只测试基础 4X 决策 | CivRealm 原版即可 |
| 需要精确复现 Civ6 规则 | 基于 Unciv 改造（加 API + Civ6 规则扩展） |
| 需要 Civ6 原版体验 | Xvfb + Civ6 + Lua AutoPlay（非真正 headless） |
| 极简快速验证 | Tribes (GAIG) 或自写极简模拟器 |

---

## 五、关键资源汇总

| 资源 | URL | 说明 |
|------|-----|------|
| CivRealm | https://github.com/bigai-ai/civrealm | FreeCiv-based RL 环境，LLM Agent 友好 |
| Unciv | https://github.com/yairm210/Unciv | Kotlin 开源 Civ5，架构清晰 |
| FreeCiv | https://github.com/freeciv/freeciv | C 语言原版，headless server |
| FreeCiv-web | https://github.com/freeciv/freeciv-web | 浏览器版 + Docker 部署 |
| Tribes (GAIG) | https://github.com/GAIGResearch/Tribes | Polytopia-like AI 研究环境 |
| Lux AI | Kaggle 竞赛 | 简化策略 AI 对战 |
| microRTS | https://github.com/santiontanon/microrts | 极简 RTS AI 环境 |
| OpenSpiel | https://github.com/google-deepmind/open_spiel | DeepMind 博弈研究框架 |
| CivFanatics 论坛 | https://forums.civfanatics.com/ | Civ6 Mod/Lua 开发社区 |
| Civ6 Lua 知识库 | https://sukritact.github.io/Civilization-VI-Modding-Knowledge-Base/ | Civ6 Mod API 文档 |

---

## 六、总结

**不存在 Civ6 的无 GUI 模拟器。** Firaxis 引擎闭源且逻辑与渲染耦合，无法独立运行游戏逻辑。

**最佳替代方案是 CivRealm**：基于 FreeCiv 的 Python RL 环境，原生 headless、标准 Gym API、已有 LLM Agent baseline，是目前最成熟的 Civilization-like AI 测试平台。若需更接近 Civ6 的规则，可在 CivRealm 基础上扩展 FreeCiv 规则集，或基于 Unciv 构建自定义 API 层。
