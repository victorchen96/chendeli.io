"""
Civ6 AI Bridge - Game State Parser
===================================
解析 Civ6 游戏状态数据（模拟格式）。

在真实集成中，状态数据来自 Mod 通过 Game:SetProperty() 写入的持久化数据，
由外部解析 .Civ6Save 文件或读取 FireTuner 输出获得。
本模块使用模拟数据来演示完整流程。
"""

import json
from dataclasses import dataclass, field, asdict
from typing import Optional
from pathlib import Path

# --- 数据模型 ---

@dataclass
class City:
    name: str
    population: int
    production_focus: str  # "science", "culture", "military", "gold", "faith"
    current_production: str
    districts: list[str] = field(default_factory=list)
    buildings: list[str] = field(default_factory=list)
    yields: dict = field(default_factory=dict)  # {food, production, gold, science, culture, faith}

@dataclass
class Technology:
    name: str
    researched: bool
    turns_remaining: int = 0
    era: str = ""

@dataclass
class DiplomaticRelation:
    civ_name: str
    relationship: str  # "friendly", "neutral", "unfriendly", "hostile", "war"
    has_open_borders: bool = False
    has_alliance: bool = False
    grievances: int = 0

@dataclass
class MilitaryUnit:
    unit_type: str
    strength: int
    location: tuple = (0, 0)
    health: int = 100

@dataclass
class GameState:
    """Civ6 游戏状态的完整表示"""
    turn: int
    era: str
    civ_name: str
    leader: str
    cities: list[City] = field(default_factory=list)
    techs_researched: list[str] = field(default_factory=list)
    techs_available: list[Technology] = field(default_factory=list)
    civics_researched: list[str] = field(default_factory=list)
    diplomacy: list[DiplomaticRelation] = field(default_factory=list)
    military: list[MilitaryUnit] = field(default_factory=list)
    gold: int = 0
    gold_per_turn: int = 0
    science_per_turn: int = 0
    culture_per_turn: int = 0
    faith: int = 0
    great_people_points: dict = field(default_factory=dict)
    victory_progress: dict = field(default_factory=dict)  # {science: %, culture: %, domination: %, ...}
    current_research: Optional[str] = None
    current_civic: Optional[str] = None

    def to_json(self) -> str:
        return json.dumps(asdict(self), ensure_ascii=False, indent=2)

    def to_prompt_text(self) -> str:
        """将游戏状态转化为 LLM 可理解的自然语言描述"""
        lines = [
            f"## 当前局势概要（回合 {self.turn}，{self.era}时代）",
            f"文明：{self.civ_name}（领袖：{self.leader}）",
            f"",
            f"### 经济状况",
            f"- 金币：{self.gold}（每回合 +{self.gold_per_turn}）",
            f"- 科研产出：{self.science_per_turn}/回合",
            f"- 文化产出：{self.culture_per_turn}/回合",
            f"- 信仰：{self.faith}",
            f"",
            f"### 城市（{len(self.cities)} 座）",
        ]
        for city in self.cities:
            districts_str = "、".join(city.districts) if city.districts else "无"
            lines.append(f"- **{city.name}**（人口 {city.population}）")
            lines.append(f"  - 正在建造：{city.current_production}")
            lines.append(f"  - 区域：{districts_str}")
            yields_str = ", ".join(f"{k}:{v}" for k, v in city.yields.items())
            lines.append(f"  - 产出：{yields_str}")

        if self.current_research:
            lines.append(f"\n### 科研")
            lines.append(f"- 当前研究：{self.current_research}")
            available = [t.name for t in self.techs_available if not t.researched]
            if available:
                lines.append(f"- 可选科技：{', '.join(available[:8])}")

        if self.diplomacy:
            lines.append(f"\n### 外交关系")
            for rel in self.diplomacy:
                status = rel.relationship
                extras = []
                if rel.has_alliance:
                    extras.append("同盟")
                if rel.has_open_borders:
                    extras.append("开放边境")
                if rel.grievances > 0:
                    extras.append(f"积怨{rel.grievances}")
                extra_str = f"（{'，'.join(extras)}）" if extras else ""
                lines.append(f"- {rel.civ_name}：{status}{extra_str}")

        if self.military:
            lines.append(f"\n### 军事力量（{len(self.military)} 个单位）")
            unit_counts = {}
            for u in self.military:
                unit_counts[u.unit_type] = unit_counts.get(u.unit_type, 0) + 1
            for utype, count in unit_counts.items():
                lines.append(f"- {utype} x{count}")

        if self.victory_progress:
            lines.append(f"\n### 胜利进度")
            for vtype, progress in self.victory_progress.items():
                lines.append(f"- {vtype}胜利：{progress}%")

        return "\n".join(lines)


def create_demo_scenario() -> GameState:
    """创建一个典型的回合50游戏场景用于演示"""
    state = GameState(
        turn=50,
        era="古典",
        civ_name="中国",
        leader="秦始皇",
        gold=230,
        gold_per_turn=12,
        science_per_turn=28,
        culture_per_turn=22,
        faith=45,
        current_research="工程学",
        current_civic="政治哲学",
        cities=[
            City(
                name="西安",
                population=7,
                production_focus="science",
                current_production="图书馆",
                districts=["学院区", "圣地"],
                buildings=["纪念碑", "粮仓", "水磨坊"],
                yields={"食物": 12, "产能": 8, "金币": 5, "科研": 14, "文化": 6, "信仰": 4},
            ),
            City(
                name="洛阳",
                population=5,
                production_focus="military",
                current_production="弓箭手",
                districts=["军营"],
                buildings=["纪念碑", "粮仓"],
                yields={"食物": 10, "产能": 11, "金币": 4, "科研": 3, "文化": 3, "信仰": 0},
            ),
            City(
                name="成都",
                population=4,
                production_focus="gold",
                current_production="商业中心",
                districts=[],
                buildings=["纪念碑"],
                yields={"食物": 8, "产能": 6, "金币": 8, "科研": 2, "文化": 4, "信仰": 0},
            ),
        ],
        techs_researched=[
            "采矿", "畜牧", "制陶", "灌溉", "射箭", "占星术",
            "书写", "砌砖", "铁器", "数学",
        ],
        techs_available=[
            Technology("工程学", False, 4, "古典"),
            Technology("军事战术", False, 6, "古典"),
            Technology("造船术", False, 5, "古典"),
            Technology("建筑学", False, 8, "古典"),
            Technology("货币", False, 7, "古典"),
            Technology("骑术", False, 5, "古典"),
        ],
        civics_researched=["法典", "外交", "技艺", "神秘主义", "早期帝国", "国家劳动力"],
        diplomacy=[
            DiplomaticRelation("罗马", "friendly", has_open_borders=True, grievances=0),
            DiplomaticRelation("苏美尔", "neutral", grievances=5),
            DiplomaticRelation("斯基泰", "unfriendly", grievances=15),
            DiplomaticRelation("埃及", "friendly", has_open_borders=True),
        ],
        military=[
            MilitaryUnit("战士", 20, (5, 3)),
            MilitaryUnit("战士", 20, (8, 7)),
            MilitaryUnit("弓箭手", 25, (6, 4)),
            MilitaryUnit("弓箭手", 25, (9, 8)),
            MilitaryUnit("侦察兵", 10, (12, 2)),
            MilitaryUnit("长城卫兵", 30, (5, 5)),  # 中国特色单位
        ],
        great_people_points={"大科学家": 12, "大将军": 8, "大商人": 5},
        victory_progress={"科技": 5, "文化": 8, "统治": 3, "宗教": 2, "外交": 4},
    )
    return state


def load_state_from_file(filepath: str) -> GameState:
    """从 JSON 文件加载游戏状态（模拟从 Mod 输出读取）"""
    path = Path(filepath)
    if not path.exists():
        raise FileNotFoundError(f"State file not found: {filepath}")
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    # 重建 dataclass 对象
    cities = [City(**c) for c in data.get("cities", [])]
    techs = [Technology(**t) for t in data.get("techs_available", [])]
    diplo = [DiplomaticRelation(**d) for d in data.get("diplomacy", [])]
    military = [MilitaryUnit(**m) for m in data.get("military", [])]
    return GameState(
        turn=data["turn"], era=data["era"],
        civ_name=data["civ_name"], leader=data["leader"],
        cities=cities, techs_researched=data.get("techs_researched", []),
        techs_available=techs, civics_researched=data.get("civics_researched", []),
        diplomacy=diplo, military=military,
        gold=data.get("gold", 0), gold_per_turn=data.get("gold_per_turn", 0),
        science_per_turn=data.get("science_per_turn", 0),
        culture_per_turn=data.get("culture_per_turn", 0),
        faith=data.get("faith", 0),
        great_people_points=data.get("great_people_points", {}),
        victory_progress=data.get("victory_progress", {}),
        current_research=data.get("current_research"),
        current_civic=data.get("current_civic"),
    )


def save_state_to_file(state: GameState, filepath: str):
    """将游戏状态保存为 JSON 文件（模拟 Mod 输出）"""
    path = Path(filepath)
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(state.to_json())


if __name__ == "__main__":
    # 演示：创建并保存模拟场景
    demo = create_demo_scenario()
    output_path = Path(__file__).parent / "data" / "demo_state.json"
    save_state_to_file(demo, str(output_path))
    print(f"Demo state saved to: {output_path}")
    print(f"\n{'='*60}")
    print(demo.to_prompt_text())
