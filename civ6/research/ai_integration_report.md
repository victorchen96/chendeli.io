# Civ6 AI + LLM 集成可行性调研

> 调研时间：2026-05-26 | 版本：V3 Iter 1 | 状态：调研完成

---

## 1. Civ6 AI 架构分析

### 1.1 整体架构

Civilization 6 的 AI 系统采用分层架构，由以下几个核心层组成：

| 层次 | 职责 | 实现方式 |
|------|------|----------|
| Grand Strategy AI | 高层战略决策（追求哪种胜利条件） | C++ 硬编码 + XML/SQL 配置 |
| Tactical AI | 军事单位战术调度、战斗决策 | C++ 硬编码 |
| Economic AI | 城市建设、区域规划、资源管理 | C++ + SQL 权重表 |
| Diplomatic AI | 外交关系、议程系统、交易评估 | C++ + XML 配置 |
| Operational AI | 军事行动（攻城、防御、探索） | C++ + AiOperations 表 |

### 1.2 关键技术细节

**C++ 核心层（不可修改）：**
- AI 的核心决策逻辑编写在 C++ DLL 中
- **Firaxis 未开放 Civ6 的 DLL 源码**（与 Civ5 不同，Civ5 开放了 gameplay DLL）
- 这是 Civ6 AI 模改的最大限制

**数据库配置层（可修改）：**
- XML/SQL 定义了 AI 的权重参数和策略条件
- 关键数据库表：
  - `AiListTypes` - AI 策略列表类型定义
  - `AiLists` - AI 优先级列表条目
  - `AiFavoredItems` - AI 偏好项（单位、建筑、科技等）
  - `Strategies` - AI 策略定义
  - `StrategyConditions` - 策略触发条件
  - `AiOperationDefs` - 军事/其他 AI 操作定义
  - `Strategy_Priorities` - 策略优先级权重

**Lua 脚本层（可扩展）：**
- Gameplay Scripts：通过 `<AddGameplayScripts>` 注入自定义逻辑
- 可 hook 的游戏事件（GameEvents）
- 但 Lua 无法直接控制所有 AI 决策，只能间接影响

### 1.3 AI 决策流程

```
每回合 AI 处理流程：
1. Grand Strategy 评估 → 确定胜利路线权重
2. 城市产出评估 → 决定每个城市的生产队列
3. 科研/市政选择 → 基于策略优先级
4. 军事操作 → 根据 AiOperations 执行攻防
5. 外交决策 → 基于 Agenda 系统和关系值
6. 单位战术 → 逐个单位移动和攻击决策
```

### 1.4 AI 回合耗时

根据社区反馈，AI 回合处理时间：
- **早期**（远古-古典）：5-15 秒/回合循环
- **中期**（中世纪-工业）：15-45 秒
- **晚期**（大地图）：1-3+ 分钟/回合循环

这意味着每个 AI 文明的单次决策时间约为 2-10 秒（取决于游戏阶段和地图大小），这为 LLM 调用提供了一定的时间窗口。

---

## 2. 社区 AI Mod 技术方案

### 2.1 主要 AI 改进 Mod

| Mod 名称 | 主要功能 | 技术手段 |
|----------|----------|----------|
| **Real Strategy** | 让 AI 根据文明特性选择合适的胜利路线 | SQL 修改策略权重 + Lua 动态调整 |
| **AI+** | 全面改善 AI 的城市规划、军事组成、外交决策 | SQL 数据库修改 + Lua GameEvents |
| **Smoother AI** | 让 AI 难度缩放更合理，减少"作弊感" | SQL 修改收益加成和策略表 |

### 2.2 Real Strategy 技术分析

Real Strategy 是最具代表性的 AI Mod，其核心机制：

1. **策略分配系统**：
   - 根据文明的 Unique Ability/Unit/District 评估最适合的胜利条件
   - 例：军事型文明（如蒙古）→ 征服胜利；科学型文明（如韩国）→ 科技胜利

2. **实现方式**：
   - `.modinfo` 文件使用 `<AddGameplayScripts>` 注入 Lua
   - SQL 文件修改 `AiFavoredItems`、`Strategy_Priorities` 等表
   - Lua 通过 `Events.PlayerTurnStarted` 等事件动态调整参数

3. **局限**：
   - 无法改变 C++ 层的核心逻辑（如战术 AI 的单位移动算法）
   - 只能通过调整权重参数来"引导"AI，不能"替代"决策

### 2.3 AI+ Mod 技术分析

AI+ 采用更激进的方法：
- 大量修改 `AiOperationDefs` 改变军事行动阈值
- 修改区域建造优先级和城市规划评估
- 通过 Lua 在回合开始时动态评估局势并调整参数
- 结合 SQL（静态值）和 Lua（动态值）的双重修改

### 2.4 可用的 Modding 接口

```lua
-- 关键 GameEvents（Gameplay Context）
GameEvents.PlayerTurnStarted      -- AI 回合开始
GameEvents.CityProductionCompleted -- 城市生产完成
GameEvents.UnitMoveComplete        -- 单位移动完成

-- 关键 Events（UI Context）
Events.DiplomacyMeet              -- 外交会面
Events.PlayerTurnStarted          -- 回合开始

-- 跨 Context 通信
ExposedMembers                    -- UI ↔ Gameplay 数据共享
LuaEvents                         -- 自定义跨 Context 事件
```

---

## 3. Modding 技术能力与限制

### 3.1 Mod 可以修改的内容

| 类别 | 可修改程度 | 方法 |
|------|-----------|------|
| AI 策略权重/优先级 | 高 | SQL/XML |
| AI 偏好项（科技/建筑/单位） | 高 | SQL/XML |
| AI 操作定义（军事行动） | 中 | SQL + Lua 触发 |
| 外交行为/议程 | 中 | XML + Lua Events |
| 城市产出选择 | 中 | 间接通过权重 |
| 战术单位移动 | 低 | 不可直接修改 |
| 战斗计算 | 无 | C++ 硬编码 |

### 3.2 Lua 环境限制（核心问题）

**Civ6 的 Lua 运行在严格的沙盒环境中：**

| 标准库 | 状态 | 说明 |
|--------|------|------|
| `io` | 禁用 | 无法读写文件 |
| `os` | 禁用 | 无法执行系统命令 |
| `socket` | 不存在 | 未包含 LuaSocket 库 |
| `debug` | 受限 | 部分功能禁用 |
| `loadfile`/`dofile` | 受限 | 不能加载任意文件 |
| `require` | 受限 | 只能加载注册的模块 |

**结论：Civ6 的 Lua 环境无法进行任何形式的网络通信或文件系统操作。**

### 3.3 可能的变通方案

由于 Lua 沙盒的严格限制，直接从 Mod 内调用外部 API 是不可能的。以下是可能的变通路径：

#### 方案 A：外部进程监控（推荐评估）
```
架构：
Civ6 游戏进程 → 游戏存档/日志文件 → Python 监控程序 → DeepSeek API
                                      ↓
                              修改游戏配置文件 → 游戏重载
```
- **原理**：通过外部程序监控 Civ6 的存档文件或日志，提取游戏状态，调用 LLM 生成决策建议
- **问题**：无法实时注入决策回游戏内部

#### 方案 B：内存注入 / DLL Hook（高风险）
```
架构：
外部 DLL → 注入 Civ6 进程 → Hook AI 决策函数 → 调用 LLM API → 返回决策
```
- **原理**：通过 DLL 注入修改游戏运行时行为
- **问题**：
  - 反作弊可能检测（虽然 Civ6 是单机）
  - 需要逆向工程 AI 决策函数
  - 维护成本极高（每次游戏更新可能失效）
  - 法律/道德灰色地带

#### 方案 C：自动存档操纵 + AutoHotkey（可行但粗糙）
```
架构：
Civ6 自动存档 → Python 解析存档 → DeepSeek API 生成建议 → 
→ 修改存档中的 AI 参数 → 游戏加载修改后的存档
```
- **原理**：在回合间隙修改存档文件中的 AI 配置
- **问题**：需要解析存档格式；需要游戏暂停/重载

#### 方案 D：Civ6 Multiplayer Protocol Hook（实验性）
```
架构：
Civ6 多人游戏模式 → 本地代理服务器 → LLM 决策 → 以"人类玩家"身份执行
```
- **原理**：让 LLM 作为多人游戏中的一个"玩家"参与
- **问题**：需要解析/模拟多人游戏协议

#### 方案 E：完整 AI 框架（最优但工程量大）
```
架构：
自定义 Civ6 AI Mod（Lua/SQL）→ 日志/状态输出到特定目录
                                       ↕（文件系统轮询）
Python Bridge 进程 → DeepSeek API → 决策写入文件
                                       ↕
Mod 下回合读取决策文件 → 通过权重调整执行
```
- **关键发现**：虽然 Civ6 Lua 禁用了 `io` 库，但某些 Mod 通过 `Modding.OpenSaveData()` 或特定的游戏内数据持久化 API 可以读写有限的数据
- **可行性**：需要进一步验证 Civ6 是否提供任何形式的持久化数据接口

---

## 4. LLM 集成可行性评估

### 4.1 适合 LLM 增强的 AI 决策

| 决策类型 | LLM 适合度 | 原因 |
|----------|-----------|------|
| **外交谈判策略** | 高 | 多因素博弈，需要"理解"对手意图 |
| **长期战略规划** | 高 | 需要综合评估全局形势，制定多步计划 |
| **联盟/背叛时机** | 高 | 复杂的信任/利益计算 |
| **城市规划布局** | 中 | 需要空间推理+长期收益评估 |
| **科研路线选择** | 中 | 需要根据局势动态调整 |
| **战术单位移动** | 低 | 需要实时性，LLM 延迟不可接受 |
| **单次攻击决策** | 低 | 计算密集型，传统算法更优 |

### 4.2 延迟分析

| 操作 | 典型延迟 | 说明 |
|------|----------|------|
| DeepSeek API 调用 | 1-5 秒 | 取决于 prompt 长度和并发 |
| Civ6 AI 回合（中期） | 15-45 秒 | 所有 AI 文明合计 |
| 单个 AI 文明决策 | 2-8 秒 | 平均每文明 |

**结论**：如果 LLM 调用仅在高层战略决策时触发（每回合 1-2 次），1-5 秒的延迟在 15-45 秒的回合时间中是可以接受的。但如果每个决策都调用 LLM，延迟会累积到不可接受的程度。

### 4.3 推荐的 LLM 使用模式

```
模式：异步建议 + 缓存策略

1. 每 N 回合（如每 10 回合）调用一次 LLM，生成"战略计划"
2. 战略计划缓存在本地，指导后续 N 回合的具体决策
3. 仅在关键事件（战争宣战、奇观被抢、联盟变动）时触发即时调用
4. 具体的战术执行仍由原生 AI 系统处理
```

### 4.4 技术可行性评分

| 方案 | 可行性 | 难度 | 用户体验 | 推荐度 |
|------|--------|------|----------|--------|
| A：存档监控 | 中 | 中 | 差（需要重载） | 2/5 |
| B：DLL 注入 | 中 | 极高 | 好 | 2/5 |
| C：存档操纵 | 中 | 高 | 差 | 1/5 |
| D：多人协议 | 低 | 极高 | 中 | 1/5 |
| E：文件系统桥接 | **高** | **中** | **中** | **4/5** |

---

## 5. 推荐方案与路线图

### 5.1 推荐方案：方案 E - 文件系统桥接 AI

**核心思路**：利用 Civ6 的数据持久化机制（如 `ModSettings` 或游戏内建系统）实现 Mod 与外部程序的异步通信。

**架构设计**：

```
┌─────────────────────────────────────────────────────┐
│                    Civ6 游戏进程                       │
│                                                      │
│  ┌──────────────────┐    ┌───────────────────────┐  │
│  │  LLM AI Mod      │    │  原生 AI 系统          │  │
│  │  (Lua/SQL)       │    │  (C++)                 │  │
│  │                  │    │                        │  │
│  │  - 收集游戏状态   │───→│  - 接收权重调整        │  │
│  │  - 写入持久化数据 │    │  - 执行具体决策        │  │
│  │  - 读取 LLM 建议  │    │                        │  │
│  └────────┬─────────┘    └───────────────────────┘  │
│           │ (持久化数据/存档)                          │
└───────────┼──────────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────┐
│         Python Bridge (外部进程)            │
│                                            │
│  - 监控持久化数据目录                        │
│  - 解析游戏状态                             │
│  - 构造 Prompt                             │
│  - 调用 DeepSeek API                       │
│  - 将决策写回文件                           │
└───────────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────┐
│         DeepSeek API                       │
│                                            │
│  - 分析局势                                │
│  - 生成战略建议                             │
│  - 输出结构化决策 JSON                      │
└───────────────────────────────────────────┘
```

### 5.2 分阶段路线图

#### Phase 1：验证通信可行性（V3 Iter 2-3）
- [ ] 验证 Civ6 Mod 是否能通过 `Modding.OpenSaveData()` 或类似 API 持久化数据
- [ ] 测试数据写入路径和读取时机
- [ ] 构建最小可用的 Lua ↔ 文件系统 ↔ Python 通信原型
- [ ] 确认可以在回合间隙完成一次完整的数据交换

#### Phase 2：游戏状态提取（V3 Iter 4-5）
- [ ] 设计游戏状态的序列化格式（JSON）
- [ ] 从 Lua 提取关键信息：地图、资源、城市、单位、外交关系
- [ ] 构建 Python 端的状态解析器
- [ ] 设计 Prompt 模板，将游戏状态转化为 LLM 可理解的文本

#### Phase 3：LLM 决策生成（V3 Iter 6-7）
- [ ] 设计决策输出格式（结构化 JSON）
- [ ] 实现 DeepSeek API 调用逻辑
- [ ] 处理延迟优化（缓存、批量决策、优先级队列）
- [ ] 实现"每 N 回合更新战略"的调度逻辑

#### Phase 4：决策注入与执行（V3 Iter 8-10）
- [ ] 将 LLM 决策转化为 Civ6 AI 权重调整
- [ ] 通过 SQL 动态修改 `AiFavoredItems`、`Strategy_Priorities`
- [ ] 测试决策效果和游戏平衡性
- [ ] 实现用户界面（显示 LLM 的"思考过程"）

#### Phase 5：优化与发布（V3 Iter 11-12）
- [ ] 性能优化（减少延迟、降低 API 调用频率）
- [ ] 用户体验打磨（配置界面、API Key 设置）
- [ ] 多场景测试（不同地图大小、文明数量）
- [ ] 打包为 Steam Workshop Mod

### 5.3 关键风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Lua 无法持久化数据到文件系统 | 致命 | Phase 1 即验证；备选用存档解析 |
| LLM 延迟过高 | 高 | 异步模式 + 缓存 + 批量决策 |
| AI 权重调整效果有限 | 中 | 扩大可调参数范围；结合 SQL 动态修改 |
| 游戏更新破坏兼容性 | 中 | Civ6 已停止重大更新（2021），风险较低 |
| DeepSeek API 成本 | 低 | 减少调用频率（每10回合一次） |

### 5.4 备选方案：辅助工具（非 Mod 集成）

如果 Phase 1 验证通信不可行，退而求其次的方案：

```
方案 F：AI 顾问助手（独立应用）
- 玩家手动截图/输入游戏状态
- LLM 生成策略建议
- 以"教练/顾问"形式辅助人类玩家决策
- 不直接修改游戏 AI
```

这个方案技术上完全可行，但不符合"提升游戏 AI"的目标。

---

## 6. 参考资料

### Civ6 AI 架构
- CivFanatics Forums - Civ6 Creation & Customization: https://forums.civfanatics.com/forums/civ6-creation-customization.541/
- CivFanatics Forums - Civ6 Modding: https://forums.civfanatics.com/forums/civ6-creation-modding.702/
- Civilization 6 Modding SDK (via Steam Tools)
- Hemmelfort Civ6 Modding Notes: https://github.com/Hemmelfort/Civ6ModdingNotes

### 社区 AI Mod
- Real Strategy Mod (Steam Workshop): https://steamcommunity.com/app/289070/workshop/
- AI+ Mod (CivFanatics/Steam Workshop)
- Smoother AI Mod (Steam Workshop)
- Civ5 Community Patch Project (参考): https://github.com/LoneGazebo/Community-Patch-DLL

### Lua 环境与限制
- Sukritact's Modding Guide (CivFanatics)
- DB's Civ6 Modding Guide (Steam)
- LeeS's Gameplay Scripting posts (CivFanatics)

### LLM 游戏 AI 案例
- **Voyager** (NVIDIA/Caltech, 2023): LLM 驱动的 Minecraft 自主 Agent
  - 项目页: https://voyager.minedojo.org/
  - GitHub: https://github.com/MineDojo/Voyager
  - 关键创新：自动课程 + 技能库 + 迭代 Prompting
  
- **Cicero** (Meta AI, 2022): 在 Diplomacy 游戏中达到人类水平
  - 结合 LLM（自然语言外交）+ 搜索算法（策略规划）
  - 论文: "Human-level play in the game of Diplomacy by combining language models with strategic reasoning" (Science, 2022)

- **Mantella** (Skyrim Mod): ChatGPT 驱动的 NPC 对话
  - 架构: Skyrim (SKSE) → Python Bridge → OpenAI API → xVASynth TTS → 游戏
  - Nexus Mods 平台发布
  - 支持多种 LLM 后端（OpenAI、本地模型等）
  - NPC 具有上下文感知（位置、时间、事件）

- **Inworld AI** (2024-2025): 商业化 AI NPC 平台
  - Unity/Unreal 插件
  - 与 Microsoft/Xbox、NetEase 合作
  - 自定义 LLM 优化延迟

### 延迟与性能
- Civ6 AI 回合时间讨论 (Reddit/Steam Community)
- DeepSeek API 文档: https://platform.deepseek.com/

---

## 附录 A：关键技术验证点

在进入 Phase 2 之前，必须在 Phase 1 验证以下问题：

1. **Civ6 Lua 是否有任何数据持久化能力？**
   - `Modding.OpenSaveData()` 是否可用？
   - `GameConfiguration` 或 `PlayerConfiguration` 是否可以存储自定义数据？
   - 存档文件中是否有 Mod 可写入的区域？

2. **外部程序能否在游戏运行时读取这些数据？**
   - 数据存储位置在哪里？
   - 是否有文件锁定问题？

3. **数据交换的时序是否可控？**
   - Mod 能否在 AI 回合开始前读取外部数据？
   - 写入/读取的时机是否可以通过 Events 精确控制？

## 附录 B：Mantella 架构参考（对 Civ6 方案的启示）

Mantella (Skyrim LLM Mod) 的架构值得参考：

```
Skyrim + SKSE (Script Extender)
    ↓ (Papyrus 脚本 → SKSE 提供文件/网络能力)
    ↓
Python Server (本地运行)
    ↓
LLM API (OpenAI/本地模型)
    ↓
TTS 引擎
    ↓
返回 Skyrim (播放语音 + 设置动画)
```

**关键区别**：
- Skyrim 有 SKSE (Script Extender) 提供了完整的文件/网络能力
- Civ6 没有类似的 Script Extender
- Civ6 的 Lua 沙盒比 Skyrim 的 Papyrus 限制更严格

**启示**：
- 如果能找到 Civ6 的等效"Script Extender"或任何突破沙盒的方式，整个方案会大大简化
- 否则需要依赖更间接的通信方式（存档操纵、内存注入等）

---

*报告完成。建议下一步（V3 Iter 2）：搭建实验环境，实际测试 Civ6 Mod 的数据持久化能力。*
