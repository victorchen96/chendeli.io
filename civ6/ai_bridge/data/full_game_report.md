# CivRealm Full Game Report - 50 Turns

**Date:** 2026-05-26
**Model:** deepseek-v4-flash | **Seed:** 42 | **Fast Research:** True
**Final Grade:** A (6/7)

## Summary
- **Turns Played:** 50
- **Final Score:** 96 (vs AI: ~15)
- **Era Reached:** Classical
- **Cities:** 1
- **Techs:** 5 (['Mining', 'Pottery', 'Writing', 'Archery', 'Engineering'])
- **Total Reward:** 210.0
- **API Calls:** 50 | **Tokens:** 75,093 | **Avg Time:** 12.2s

## Game Progression (Every 10 Turns)

| Turn | Era | Score | Cities | Pop | Techs | Sci/t | Milestones |
|------|-----|-------|--------|-----|-------|-------|------------|
| 10 | Ancient | 14 | 1 | 3 | 2 | 5 | - |
| 20 | Ancient | 34 | 1 | 4 | 3 | 5 | tech_complete:Writing |
| 30 | Classical | 64 | 1 | 5 | 4 | 5 | tech_complete:Archery; era_advance:classical |
| 40 | Classical | 76 | 1 | 6 | 4 | 5 | - |
| 50 | Classical | 96 | 1 | 7 | 5 | 5 | tech_complete:Engineering |

## Key Decision Analysis

### Phase 1: Early Game (Turns 1-10)
- Agent immediately started Writing research (correct priority)
- Built Library to boost science output
- Explored with Warriors (consistent move actions)
- Writing completed on Turn 11 (11 turns at 5 sci/turn)

### Phase 2: Growth Phase (Turns 11-25)
- Switched to Archery research after Writing
- Attempted Settler training (8 times) but production kept switching
- Population grew from 1 to 4
- Archery + Era advance to Classical on Turn 25

### Phase 3: Classical Era (Turns 26-50)
- Researched Engineering (completed Turn 41)
- Built infrastructure (Library, Granary attempted)
- Continued unit movement for exploration
- Turns 30-31: Parse fallback grabbed all valid actions (known issue)
- Population reached 7 by end of game

## Strategy Assessment

**Strengths:**
- Correct tech priority (Writing > Archery > Engineering)
- Consistent multi-action turns (avg 4 actions/turn)
- Maintained research queue (no idle turns)
- Score dominance over AI opponents (96 vs 15)

**Weaknesses:**
- Failed to found second city (Settler trained but production overwritten)
- Occasional parse fallback dumping all actions (turns 30-31)
- No buildings completed (Library cost 75 prod, city only had 5 prod/turn = 15 turns)
- Did not adapt strategy based on AI development

## Comparison: LLM Agent vs Rule-Based

| Metric | LLM Agent | Rule-Based |
|--------|-----------|------------|
| Final Score | 96 | 132 |
| Techs | 5 | 6 |
| Era | Classical | Classical |
| Cities | 1 | 1 |
| Population | 7 | 8 |
| Total Reward | 210.0 | 134.0 |

Note: Rule-based has higher score due to building completions (Library+Granary) 
giving +5 score each. LLM has higher reward because it gets +1 for research/build
commands and +0.5 for moves, while rule-based does fewer actions per turn.

## Assessment Criteria

- [PASS] techs_researched_2plus
- [FAIL] cities_2plus
- [PASS] reached_classical
- [PASS] no_crash
- [PASS] positive_reward
- [PASS] ahead_of_ai
- [PASS] score_leader

## Next Steps (Iter 6)
- Fix production queue: prevent build/train from overwriting active production
- Add "do not change production if already building" to system prompt
- Target: 2+ cities by adding explicit Settler-settle action chain
- Try deepseek-v4-pro for more complex strategic reasoning