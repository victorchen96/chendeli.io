"""
CivRealm Environment Data Definitions
=======================================
Tech tree, unit types, buildings, and data models for the simplified Civ environment.
"""

from dataclasses import dataclass, field
from typing import Optional

# --- Tech Tree (simplified, 4 eras) ---
TECH_TREE = {
    "ancient": ["Mining", "Pottery", "AnimalHusbandry", "Sailing", "Archery", "Writing"],
    "classical": ["Engineering", "Mathematics", "Construction", "IronWorking",
                  "HorsebackRiding", "Currency"],
    "medieval": ["Education", "Machinery", "Castles", "MilitaryTactics",
                 "Stirrups", "Banking"],
    "renaissance": ["Printing", "Gunpowder", "MetalCasting", "Astronomy",
                    "Banking", "Cartography"],
}

UNIT_TYPES = {
    "Warrior": {"strength": 20, "cost": 40, "era": "ancient"},
    "Archer": {"strength": 25, "cost": 60, "era": "ancient"},
    "Settler": {"strength": 0, "cost": 80, "era": "ancient"},
    "Builder": {"strength": 0, "cost": 50, "era": "ancient"},
    "Swordsman": {"strength": 35, "cost": 90, "era": "classical"},
    "Horseman": {"strength": 36, "cost": 80, "era": "classical"},
    "Knight": {"strength": 48, "cost": 120, "era": "medieval"},
    "Crossbowman": {"strength": 40, "cost": 100, "era": "medieval"},
}

BUILDINGS = {
    "Granary": {"food": 2, "cost": 60},
    "Monument": {"culture": 2, "cost": 40},
    "Library": {"science": 3, "cost": 75},
    "Market": {"gold": 4, "cost": 80},
    "Barracks": {"xp_bonus": 25, "cost": 70},
    "Walls": {"defense": 10, "cost": 80},
    "University": {"science": 6, "cost": 150},
    "Workshop": {"production": 3, "cost": 120},
}

# Action space documentation
VALID_ACTIONS = [
    "research <tech_name>",
    "build <city_idx> <item>",
    "train <city_idx> <unit>",
    "move <unit_idx> <dx> <dy>",
    "settle <unit_idx>",
    "attack <unit_idx> <target_unit_idx>",
    "end_turn",
]


@dataclass
class Unit:
    unit_type: str
    hp: int = 100
    x: int = 0
    y: int = 0
    moves_left: int = 2
    veteran: bool = False


@dataclass
class City:
    name: str
    x: int = 0
    y: int = 0
    population: int = 1
    food: float = 0
    production_progress: float = 0
    current_build: Optional[str] = None
    buildings: list = field(default_factory=list)
    food_yield: int = 4
    prod_yield: int = 3
    gold_yield: int = 2
    science_yield: int = 2
    culture_yield: int = 1


@dataclass
class CivState:
    """Complete civilization state."""
    civ_name: str = "China"
    turn: int = 1
    era: str = "ancient"
    gold: int = 50
    science: float = 0
    culture: float = 0
    gold_per_turn: int = 5
    science_per_turn: int = 3
    culture_per_turn: int = 2
    cities: list = field(default_factory=list)
    units: list = field(default_factory=list)
    techs_researched: list = field(default_factory=list)
    current_research: Optional[str] = None
    research_progress: float = 0
    score: int = 0
