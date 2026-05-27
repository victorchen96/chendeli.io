-- =============================================================================
-- AIAdvisor.lua - Civ6 LLM AI Bridge Mod (Gameplay Script)
-- =============================================================================
-- 每回合收集游戏状态，通过持久化接口导出给外部 Python Bridge，
-- 然后读取 Bridge 写回的 LLM 战略建议并应用到 AI 决策权重中。
--
-- 通信方案：
--   方案1 [已验证]: Game:SetProperty/GetProperty - 数据随存档，需解析存档
--   方案2 [需验证]: Modding.OpenSaveData() - Mod专属持久化，路径可能可访问
--   方案3 [已验证]: FireTuner + EnableTuner - 开发模式实时Lua执行
-- =============================================================================

-- 配置常量
local CONFIG = {
    MOD_ID = "LLM_AI_ADVISOR",
    VERSION = "0.1.0-poc",
    -- 每隔 N 回合请求一次完整战略更新
    STRATEGY_UPDATE_INTERVAL = 10,
    -- 关键事件触发即时更新
    INSTANT_UPDATE_EVENTS = {
        "WAR_DECLARED",
        "WONDER_CAPTURED",
        "ERA_CHANGED",
        "ALLIANCE_FORMED",
        "ALLIANCE_BROKEN",
    },
    -- 状态数据的 Property Key 前缀
    PROP_PREFIX = "LLM_AI_",
    -- 建议数据的 Property Key
    ADVICE_KEY = "LLM_AI_ADVICE",
    STATE_KEY = "LLM_AI_STATE",
}

-- =============================================================================
-- 游戏状态收集
-- =============================================================================

-- [已验证] 以下函数使用标准 Gameplay Lua API
local function CollectPlayerState(playerID)
    local pPlayer = Players[playerID]
    if pPlayer == nil or not pPlayer:IsAlive() then
        return nil
    end

    local pTreasury = pPlayer:GetTreasury()
    local pTechs = pPlayer:GetTechs()
    local pCulture = pPlayer:GetCulture()

    local state = {
        turn = Game.GetCurrentGameTurn(),
        era = pPlayer:GetEra(),
        playerID = playerID,
        civType = PlayerConfigurations[playerID]:GetCivilizationTypeName(),
        leaderType = PlayerConfigurations[playerID]:GetLeaderTypeName(),
        -- 经济数据
        gold = pTreasury:GetGoldBalance(),
        goldPerTurn = pTreasury:GetGoldYield() - pTreasury:GetTotalMaintenance(),
        sciencePerTurn = pPlayer:GetTechs():GetScienceYield(),
        culturePerTurn = pPlayer:GetCulture():GetCultureYield(),
        faith = pPlayer:GetReligion():GetFaithBalance(),
        -- 科研状态
        currentResearch = pTechs:GetResearchingTech(),
        turnsToResearch = pTechs:GetTurnsToResearch(),
    }

    -- 城市数据
    state.cities = {}
    local pCities = pPlayer:GetCities()
    for i, pCity in pCities:Members() do
        local cityData = {
            name = pCity:GetName(),
            population = pCity:GetPopulation(),
            -- [已验证] CityManager 标准 API
            districts = {},
            buildings = {},
        }
        -- 收集区域信息
        local pDistricts = pCity:GetDistricts()
        for _, pDistrict in pDistricts:Members() do
            if pDistrict:IsComplete() then
                table.insert(cityData.districts,
                    GameInfo.Districts[pDistrict:GetType()].DistrictType)
            end
        end
        table.insert(state.cities, cityData)
    end

    -- 外交关系
    -- [已验证] DiplomacyManager 标准 API
    state.diplomacy = {}
    local pDiplomacy = pPlayer:GetDiplomacy()
    for _, otherPlayerID in ipairs(PlayerManager.GetAlive()) do
        if otherPlayerID ~= playerID and Players[otherPlayerID]:IsMajor() then
            local relation = {
                targetPlayer = otherPlayerID,
                targetCiv = PlayerConfigurations[otherPlayerID]:GetCivilizationTypeName(),
                isAtWar = pDiplomacy:IsAtWarWith(otherPlayerID),
                hasOpenBorders = pDiplomacy:HasOpenBordersFrom(otherPlayerID),
                -- [需验证] GetDiplomaticState 具体返回值
                diplomaticState = pDiplomacy:GetDiplomaticState(otherPlayerID),
            }
            table.insert(state.diplomacy, relation)
        end
    end

    -- 军事力量
    state.military = {}
    local pUnits = pPlayer:GetUnits()
    for i, pUnit in pUnits:Members() do
        local unitData = {
            type = GameInfo.Units[pUnit:GetType()].UnitType,
            combat = pUnit:GetCombat(),
            maxHP = pUnit:GetMaxDamage(),
            currentHP = pUnit:GetMaxDamage() - pUnit:GetDamage(),
            x = pUnit:GetX(),
            y = pUnit:GetY(),
        }
        table.insert(state.military, unitData)
    end

    return state
end


-- =============================================================================
-- 数据持久化（通信层）
-- =============================================================================

-- 方法1: 使用 Game:SetProperty [已验证可行]
-- 数据保存在存档中，但外部程序需要解析存档才能读取
local function WriteStateViaProperty(state)
    -- [已验证] Game:SetProperty 可以存储 table（会自动序列化）
    -- 注意：大数据可能有性能问题，建议精简
    local serialized = {}
    -- 手动序列化为字符串（Property 对复杂嵌套 table 支持有限）
    -- [需运行时验证] 复杂嵌套 table 是否能正确存储
    serialized.turn = state.turn
    serialized.era = state.era
    serialized.gold = state.gold
    serialized.sciencePerTurn = state.sciencePerTurn
    serialized.numCities = #state.cities
    serialized.numUnits = #state.military

    Game:SetProperty(CONFIG.STATE_KEY, serialized)
    print("[AIAdvisor] State written via Game:SetProperty, turn=" .. state.turn)
end

-- 方法2: Modding.OpenSaveData [需运行时验证]
-- 存储路径可能在 Documents/My Games/Civ6/ModSaveData/ 下，如果可外部访问则为最优方案
--[[
local function WriteStateViaSaveData(state)
    local saveData = Modding.OpenSaveData()
    if saveData then
        saveData.SetValue("game_state_json", SerializeToJSON(state))
        saveData.SetValue("last_update_turn", state.turn)
        print("[AIAdvisor] State written via Modding.OpenSaveData()")
    else
        print("[AIAdvisor] ERROR: Modding.OpenSaveData() returned nil")
    end
end
--]]


-- =============================================================================
-- 读取 LLM 建议
-- =============================================================================

local function ReadAdvice()
    -- 从 Game:GetProperty 读取建议（由外部程序在存档修改后注入）
    -- [需验证] 外部程序修改存档后，游戏重载是否能读到新数据
    local advice = Game:GetProperty(CONFIG.ADVICE_KEY)
    if advice then
        print("[AIAdvisor] Advice loaded: victory_path=" .. (advice.victory_path or "unknown"))
        return advice
    end
    return nil
end

-- 备选方案：通过 FireTuner 注入
-- 在开发阶段，可以通过 FireTuner 直接执行 Lua 来写入建议：
-- Game:SetProperty("LLM_AI_ADVICE", {victory_path="science", ...})
-- 这不需要修改存档，但需要 FireTuner 保持连接


-- =============================================================================
-- 应用建议到 AI 决策
-- =============================================================================

-- [需验证] 以下函数尝试通过修改 AI 偏好来影响决策
-- Civ6 的 AI 权重在回合开始时读取，动态修改可能不会立即生效
local function ApplyAdvice(playerID, advice)
    if advice == nil then
        return
    end

    -- [实验性] 尝试通过 PlayerConfiguration 影响 AI 行为
    -- 这是最不确定的部分，需要大量运行时测试
    local pPlayer = Players[playerID]

    -- 记录建议已被处理
    Game:SetProperty(CONFIG.PROP_PREFIX .. "LAST_APPLIED_TURN", Game.GetCurrentGameTurn())
    Game:SetProperty(CONFIG.PROP_PREFIX .. "VICTORY_PATH", advice.victory_path or "balanced")

    print("[AIAdvisor] Advice applied for player " .. playerID)

    -- [未来实现] 通过 SQL 动态修改 AiFavoredItems
    -- 这需要 Database.AddRow / Database.UpdateRow 等 API
    -- [需验证] 这些 API 是否在 Gameplay Context 中可用
    --[[
    -- 示例：根据建议调整科技偏好
    if advice.tech_recommendations then
        for _, rec in ipairs(advice.tech_recommendations) do
            -- 尝试动态修改 AI 的科技优先级
            -- DB:Query("UPDATE AiFavoredItems SET Value = ? WHERE ListType = ? AND Item = ?",
            --          rec.priority * 20, "TechListType", rec.tech_name)
        end
    end
    --]]
end


-- =============================================================================
-- 事件回调
-- =============================================================================

-- 每回合开始时触发
local function OnPlayerTurnStarted(playerID)
    -- 只处理 AI 玩家（非人类）
    if Players[playerID]:IsHuman() then
        return
    end

    local currentTurn = Game.GetCurrentGameTurn()

    -- 检查是否需要更新战略
    local lastUpdate = Game:GetProperty(CONFIG.PROP_PREFIX .. "LAST_UPDATE_TURN") or 0
    local shouldUpdate = (currentTurn - lastUpdate) >= CONFIG.STRATEGY_UPDATE_INTERVAL

    if shouldUpdate then
        -- 1. 收集并导出状态
        local state = CollectPlayerState(playerID)
        if state then
            WriteStateViaProperty(state)
            Game:SetProperty(CONFIG.PROP_PREFIX .. "LAST_UPDATE_TURN", currentTurn)
        end

        -- 2. 读取并应用建议（如果有）
        local advice = ReadAdvice()
        if advice then
            ApplyAdvice(playerID, advice)
        end
    end
end

-- 关键事件触发即时更新
local function OnWarDeclared(attackerID, defenderID)
    local currentTurn = Game.GetCurrentGameTurn()
    print("[AIAdvisor] War declared! Triggering immediate state update.")
    -- 为相关 AI 玩家触发即时状态收集
    if not Players[attackerID]:IsHuman() then
        local state = CollectPlayerState(attackerID)
        if state then
            state.trigger_event = "WAR_DECLARED"
            WriteStateViaProperty(state)
        end
    end
    if not Players[defenderID]:IsHuman() then
        local state = CollectPlayerState(defenderID)
        if state then
            state.trigger_event = "WAR_DECLARED_AGAINST"
            WriteStateViaProperty(state)
        end
    end
end


-- =============================================================================
-- 初始化
-- =============================================================================

local function Initialize()
    print("==============================================")
    print("[AIAdvisor] LLM AI Advisor Mod v" .. CONFIG.VERSION)
    print("[AIAdvisor] Strategy update interval: " .. CONFIG.STRATEGY_UPDATE_INTERVAL .. " turns")
    print("==============================================")

    -- 注册事件监听
    -- [已验证] GameEvents.PlayerTurnStarted 是标准 Gameplay 事件
    GameEvents.PlayerTurnStarted.Add(OnPlayerTurnStarted)

    -- [需验证] 战争声明事件的确切签名
    -- 可能是 GameEvents.DiplomacyDeclareWar 或 Events.DiplomacyDeclareWar
    if GameEvents.DiplomacyDeclareWar then
        GameEvents.DiplomacyDeclareWar.Add(OnWarDeclared)
    end
end

-- 执行初始化
Initialize()
