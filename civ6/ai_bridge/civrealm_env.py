"""Simplified Civ-like Environment - CivRealm-compatible API."""
import random
from typing import Optional
from civrealm_data import TECH_TREE, UNIT_TYPES, BUILDINGS, Unit, City, CivState


class CivEnv:
    """Simplified Civilization environment with gymnasium-style API."""

    def __init__(self, map_size=20, num_ai_civs=2, max_turns=100, seed=None, fast_research=False, victory_score=200):
        self.map_size, self.num_ai_civs, self.max_turns = map_size, num_ai_civs, max_turns
        self.victory_score = victory_score
        self.fast_research = fast_research
        self.rng = random.Random(seed)
        self.player: Optional[CivState] = None
        self.ai_civs: list[CivState] = []
        self.turn, self.done = 0, False
        self.history: list[dict] = []
        self.milestones: list[dict] = []
        self._production_set_this_turn: set = set()  # city indices locked this turn

    def _tech_cost(self, n_techs):
        base, incr = (30, 12) if self.fast_research else (50, 20)
        return base + n_techs * incr

    def reset(self) -> dict:
        self.turn, self.done, self.history, self.milestones = 0, False, [], []
        self._production_set_this_turn = set()
        px, py = self.rng.randint(2, self.map_size-3), self.rng.randint(2, self.map_size-3)
        sci, prod = (5, 5) if self.fast_research else (3, 4)
        self.player = CivState(
            civ_name="China",
            cities=[City("Xi'an", x=px, y=py, population=1, food_yield=5,
                        prod_yield=prod, gold_yield=3, science_yield=sci, culture_yield=2)],
            units=[Unit("Warrior", x=px+1, y=py), Unit("Warrior", x=px, y=py+1),
                   Unit("Builder", x=px, y=py)],
            techs_researched=["Mining", "Pottery"], gold=80)
        self.ai_civs = []
        ai_names = ["Rome", "Egypt", "Sumeria", "Scythia", "Greece"]
        for i in range(self.num_ai_civs):
            ax, ay = self.rng.randint(2, self.map_size-3), self.rng.randint(2, self.map_size-3)
            self.ai_civs.append(CivState(
                civ_name=ai_names[i % len(ai_names)],
                cities=[City(f"{ai_names[i%len(ai_names)]}_Capital", x=ax, y=ay)],
                units=[Unit("Warrior", x=ax+1, y=ay), Unit("Archer", x=ax, y=ay+1)],
                techs_researched=["Mining", "AnimalHusbandry"], gold=60))
        return self._get_observation()

    def step(self, action: str) -> tuple[dict, float, bool, dict]:
        if self.done:
            return self._get_observation(), 0.0, True, {"error": "Game already ended"}
        reward, info = 0.0, {"action": action, "valid": True, "message": ""}
        parts = action.strip().split()
        cmd = parts[0] if parts else ""
        try:
            if cmd == "research" and len(parts) >= 2: reward += self._do_research(parts[1], info)
            elif cmd == "build" and len(parts) >= 3: reward += self._do_build(int(parts[1]), parts[2], info)
            elif cmd == "train" and len(parts) >= 3: reward += self._do_train(int(parts[1]), parts[2], info)
            elif cmd == "change_production" and len(parts) >= 3:
                reward += self._do_change_production(int(parts[1]), parts[2], info)
            elif cmd == "move" and len(parts) >= 4: reward += self._do_move(int(parts[1]), int(parts[2]), int(parts[3]), info)
            elif cmd == "settle" and len(parts) >= 2: reward += self._do_settle(int(parts[1]), info)
            elif cmd == "end_turn": reward += self._end_turn(info)
            else: info["valid"], info["message"] = False, f"Invalid: {action}"; reward -= 1.0
        except (ValueError, IndexError) as e:
            info["valid"], info["message"] = False, f"Parse error: {e}"; reward -= 1.0
        self.history.append({"turn": self.turn, "action": action, "reward": reward})
        if self.turn >= self.max_turns:
            self.done, info["message"] = True, "Max turns reached"
        elif self.player.score >= self.victory_score:
            self.done, reward, info["message"] = True, reward + 50.0, "Victory! Score target reached."
        return self._get_observation(), reward, self.done, info

    def _do_research(self, tech_name, info):
        all_techs = [t for era in TECH_TREE.values() for t in era]
        if tech_name in self.player.techs_researched:
            info["message"] = f"Already researched: {tech_name}"; return -0.5
        if tech_name not in all_techs:
            info["valid"], info["message"] = False, f"Unknown tech: {tech_name}"; return -1.0
        self.player.current_research = tech_name
        info["message"] = f"Now researching: {tech_name}"; return 1.0

    def _do_build(self, city_idx, item, info):
        if city_idx >= len(self.player.cities):
            info["valid"], info["message"] = False, f"Bad city idx: {city_idx}"; return -1.0
        if item not in BUILDINGS:
            info["valid"], info["message"] = False, f"Unknown building: {item}"; return -1.0
        city = self.player.cities[city_idx]
        if item in city.buildings: info["message"] = f"{item} already built"; return -0.5
        # Production lock: don't override ongoing production
        if city.current_build and (city.production_progress > 0 or city_idx in self._production_set_this_turn):
            cost = self._get_production_cost(city.current_build)
            info["message"] = (f"{city.name} already producing {city.current_build} "
                              f"({city.production_progress}/{cost}). Use change_production to override.")
            return 0.0  # Not a penalty - Agent should learn to not repeat
        city.current_build, city.production_progress = item, 0
        self._production_set_this_turn.add(city_idx)
        info["message"] = f"{city.name} building: {item}"; return 1.0

    def _do_train(self, city_idx, unit_type, info):
        if city_idx >= len(self.player.cities):
            info["valid"], info["message"] = False, f"Bad city idx: {city_idx}"; return -1.0
        if unit_type not in UNIT_TYPES:
            info["valid"], info["message"] = False, f"Unknown unit: {unit_type}"; return -1.0
        city = self.player.cities[city_idx]
        # Production lock: don't override ongoing production
        if city.current_build and (city.production_progress > 0 or city_idx in self._production_set_this_turn):
            cost = self._get_production_cost(city.current_build)
            info["message"] = (f"{city.name} already producing {city.current_build} "
                              f"({city.production_progress}/{cost}). Use change_production to override.")
            return 0.0
        city.current_build, city.production_progress = f"unit:{unit_type}", 0
        self._production_set_this_turn.add(city_idx)
        info["message"] = f"{city.name} training: {unit_type}"; return 1.0

    def _do_change_production(self, city_idx, new_item, info):
        """Force-change production (loses progress). For urgent overrides only."""
        if city_idx >= len(self.player.cities):
            info["valid"], info["message"] = False, f"Bad city idx: {city_idx}"; return -1.0
        city = self.player.cities[city_idx]
        if new_item in UNIT_TYPES:
            city.current_build, city.production_progress = f"unit:{new_item}", 0
        elif new_item in BUILDINGS:
            if new_item in city.buildings: info["message"] = f"{new_item} already built"; return -0.5
            city.current_build, city.production_progress = new_item, 0
        else:
            info["valid"], info["message"] = False, f"Unknown item: {new_item}"; return -1.0
        self._production_set_this_turn.add(city_idx)
        info["message"] = f"{city.name} CHANGED to: {new_item} (lost progress)"; return 0.5

    def _get_production_cost(self, build_str):
        """Get the production cost of current build item."""
        if build_str.startswith("unit:"):
            utype = build_str[5:]
            return UNIT_TYPES.get(utype, {}).get("cost", 100)
        return BUILDINGS.get(build_str, {}).get("cost", 100)

    def _do_move(self, unit_idx, dx, dy, info):
        if unit_idx >= len(self.player.units):
            info["valid"], info["message"] = False, f"Bad unit idx: {unit_idx}"; return -1.0
        unit = self.player.units[unit_idx]
        if abs(dx) + abs(dy) > 2: info["message"] = "Move too far"; return -0.5
        unit.x = max(0, min(self.map_size-1, unit.x + dx))
        unit.y = max(0, min(self.map_size-1, unit.y + dy))
        info["message"] = f"{unit.unit_type} -> ({unit.x},{unit.y})"; return 0.5

    def _do_settle(self, unit_idx, info):
        if unit_idx >= len(self.player.units):
            info["valid"], info["message"] = False, f"Bad unit idx: {unit_idx}"; return -1.0
        unit = self.player.units[unit_idx]
        if unit.unit_type != "Settler": info["message"] = "Only Settlers settle"; return -1.0
        for city in self.player.cities:
            if abs(city.x - unit.x) + abs(city.y - unit.y) < 4:
                info["message"] = "Too close to city"; return -0.5
        names = ["Luoyang", "Chengdu", "Nanjing", "Beijing", "Hangzhou", "Guangzhou"]
        idx = len(self.player.cities) - 1
        name = names[idx] if idx < len(names) else f"City_{len(self.player.cities)}"
        self.player.cities.append(City(name, x=unit.x, y=unit.y, population=1))
        self.player.units.pop(unit_idx)
        self.player.score += 15
        self.milestones.append({"turn": self.turn, "type": "city_founded", "detail": name})
        info["message"] = f"Founded: {name} at ({unit.x},{unit.y})"; return 10.0

    def _end_turn(self, info):
        self.turn += 1
        self._production_set_this_turn = set()  # Unlock production for next turn
        reward, total_sci, total_cul, total_gold = 0.0, 0, 0, 0
        for city in self.player.cities:
            city.food += city.food_yield
            if city.food >= city.population * 15:
                city.population += 1
                city.food, city.food_yield, city.prod_yield = 0, city.food_yield+1, city.prod_yield+1
                self.player.score += 2; reward += 2.0
            if city.current_build:
                city.production_progress += city.prod_yield
                if city.current_build.startswith("unit:"):
                    utype = city.current_build[5:]
                    if city.production_progress >= UNIT_TYPES.get(utype, {}).get("cost", 100):
                        self.player.units.append(Unit(utype, x=city.x, y=city.y))
                        city.current_build, city.production_progress = None, 0
                        self.player.score += 3; reward += 3.0
                else:
                    bldg = city.current_build
                    if city.production_progress >= BUILDINGS.get(bldg, {}).get("cost", 100):
                        city.buildings.append(bldg)
                        b = BUILDINGS[bldg]
                        city.science_yield += b.get("science", 0)
                        city.culture_yield += b.get("culture", 0)
                        city.gold_yield += b.get("gold", 0)
                        city.food_yield += b.get("food", 0)
                        city.prod_yield += b.get("production", 0)
                        city.current_build, city.production_progress = None, 0
                        self.player.score += 5; reward += 5.0
            total_sci += city.science_yield; total_cul += city.culture_yield; total_gold += city.gold_yield
        self.player.science_per_turn, self.player.culture_per_turn = total_sci, total_cul
        self.player.gold_per_turn = total_gold
        self.player.gold += total_gold; self.player.science += total_sci; self.player.culture += total_cul
        if self.player.current_research:
            self.player.research_progress += total_sci
            if self.player.research_progress >= self._tech_cost(len(self.player.techs_researched)):
                completed = self.player.current_research
                self.player.techs_researched.append(completed)
                self.player.current_research, self.player.research_progress = None, 0
                self.player.score += 8; reward += 8.0
                old_era = self.player.era
                self._check_era()
                self.milestones.append({"turn": self.turn, "type": "tech_complete", "detail": completed})
                if self.player.era != old_era:
                    self.milestones.append({"turn": self.turn, "type": "era_advance", "detail": self.player.era})
        self._ai_turn()
        self.player.score += 1; self.player.turn = self.turn
        info["message"] = f"Turn {self.turn}. Score: {self.player.score}"; return reward + 1.0

    def _check_era(self):
        era_thresholds = [("renaissance", 12), ("medieval", 8), ("classical", 4)]
        era_order = ["ancient", "classical", "medieval", "renaissance"]
        n = len(self.player.techs_researched)
        for era, thresh in era_thresholds:
            if n >= thresh and era_order.index(era) > era_order.index(self.player.era):
                self.player.era, self.player.score = era, self.player.score + 10; break
    def _ai_turn(self):
        all_techs = [t for era in TECH_TREE.values() for t in era]
        for ai in self.ai_civs:
            for city in ai.cities:
                city.food += city.food_yield
                if city.food >= city.population * 15:
                    city.population += 1; city.food = 0; city.science_yield += 1
                if self.turn % 8 == 0 and len(ai.units) < 5:
                    ai.units.append(Unit(self.rng.choice(["Warrior", "Archer"]),
                        x=city.x+self.rng.randint(-1,1), y=city.y+self.rng.randint(-1,1)))
            ai_sci = sum(c.science_yield for c in ai.cities)
            if ai.current_research is None:
                avail = [t for t in all_techs if t not in ai.techs_researched]
                if avail: ai.current_research = self.rng.choice(avail[:4])
            if ai.current_research:
                ai.research_progress += ai_sci
                if ai.research_progress >= self._tech_cost(len(ai.techs_researched)):
                    ai.techs_researched.append(ai.current_research)
                    ai.current_research, ai.research_progress = None, 0; ai.score += 5
            for u in ai.units:
                u.x = max(0, min(self.map_size-1, u.x+self.rng.randint(-1,1)))
                u.y = max(0, min(self.map_size-1, u.y+self.rng.randint(-1,1)))

    def _get_observation(self) -> dict:
        p = self.player
        obs = {"turn": self.turn, "era": p.era, "civ": p.civ_name, "score": p.score,
            "gold": p.gold, "gold_per_turn": p.gold_per_turn,
            "science_per_turn": p.science_per_turn, "culture_per_turn": p.culture_per_turn,
            "current_research": p.current_research,
            "research_progress": f"{p.research_progress}/{self._tech_cost(len(p.techs_researched))}",
            "techs_researched": p.techs_researched, "available_techs": self._get_available_techs(),
            "cities": [], "units": [], "known_civs": [], "valid_actions": self._get_valid_actions()}
        for i, c in enumerate(p.cities):
            prod_info = None
            if c.current_build:
                cost = self._get_production_cost(c.current_build)
                turns_left = max(1, (cost - c.production_progress + c.prod_yield - 1) // c.prod_yield)
                prod_info = {"item": c.current_build, "progress": int(c.production_progress),
                            "cost": cost, "turns_left": turns_left}
            obs["cities"].append({"idx": i, "name": c.name, "population": c.population,
                "current_build": c.current_build, "production_info": prod_info,
                "buildings": c.buildings, "yields": {"food": c.food_yield, "production": c.prod_yield,
                    "gold": c.gold_yield, "science": c.science_yield, "culture": c.culture_yield},
                "position": (c.x, c.y)})
        for i, u in enumerate(p.units):
            unit_info = {"idx": i, "type": u.unit_type, "hp": u.hp, "position": (u.x, u.y)}
            if u.unit_type == "Settler":
                min_dist = min(abs(u.x - c.x) + abs(u.y - c.y) for c in p.cities)
                unit_info["dist_to_nearest_city"] = min_dist
                unit_info["can_settle"] = min_dist >= 4
            obs["units"].append(unit_info)
        for ai in self.ai_civs:
            obs["known_civs"].append({"name": ai.civ_name, "cities_count": len(ai.cities),
                "techs_count": len(ai.techs_researched), "score": ai.score,
                "military_strength": sum(UNIT_TYPES.get(u.unit_type, {}).get("strength", 0) for u in ai.units)})
        return obs

    def _get_available_techs(self) -> list[str]:
        return [t for era in TECH_TREE.values() for t in era if t not in self.player.techs_researched][:8]

    def _get_valid_actions(self) -> list[str]:
        actions = ["end_turn"]
        for tech in self._get_available_techs()[:4]:
            actions.append(f"research {tech}")
        for i, city in enumerate(self.player.cities):
            has_production = city.current_build and (city.production_progress > 0 or i in self._production_set_this_turn)
            if has_production:
                # City has ongoing production - only offer change_production
                for utype in ["Warrior", "Archer", "Settler", "Builder"]:
                    actions.append(f"change_production {i} {utype}")
                for bldg in list(BUILDINGS.keys())[:4]:
                    if bldg not in city.buildings:
                        actions.append(f"change_production {i} {bldg}")
            else:
                # City idle - offer normal build/train
                for bldg in list(BUILDINGS.keys())[:4]:
                    if bldg not in city.buildings: actions.append(f"build {i} {bldg}")
                for utype in ["Warrior", "Archer", "Settler", "Builder"]:
                    actions.append(f"train {i} {utype}")
        for i, unit in enumerate(self.player.units):
            actions.append(f"move {i} 1 0"); actions.append(f"move {i} 0 1")
            if unit.unit_type == "Settler":
                # Settlers need more directions to navigate away from cities
                actions.append(f"move {i} -1 0"); actions.append(f"move {i} 0 -1")
                actions.append(f"move {i} 1 1")  # diagonal fast-move
                actions.append(f"settle {i}")
        return actions

    def get_text_observation(self) -> str:
        obs = self._get_observation()
        lines = [f"Turn {obs['turn']} | {obs['era'].title()} Era | Score: {obs['score']}",
            f"Gold: {obs['gold']} (+{obs['gold_per_turn']}/t) | Sci: +{obs['science_per_turn']}/t | Cul: +{obs['culture_per_turn']}/t",
            f"Research: {obs['current_research'] or 'None'} ({obs['research_progress']})",
            f"Techs: {', '.join(obs['techs_researched'])}"]
        for c in obs["cities"]:
            if c["production_info"]:
                pi = c["production_info"]
                status = f"{pi['item']} ({pi['progress']}/{pi['cost']}, {pi['turns_left']}t left)"
            else:
                status = "IDLE"
            lines.append(f"City[{c['idx']}] {c['name']} pop={c['population']} producing={status} built=[{','.join(c['buildings'])}]")
        for u in obs["units"]:
            extra = ""
            if u["type"] == "Settler":
                dist = u.get("dist_to_nearest_city", 0)
                extra = f" dist_to_city={dist} {'CAN_SETTLE!' if u.get('can_settle') else 'MOVE_FURTHER'}"
            lines.append(f"Unit[{u['idx']}] {u['type']} at ({u['position'][0]},{u['position'][1]}){extra}")
        for r in obs["known_civs"]:
            lines.append(f"Rival: {r['name']} cities={r['cities_count']} techs={r['techs_count']} mil={r['military_strength']}")
        return "\n".join(lines)

    def get_snapshot(self) -> dict:
        p = self.player
        return {"turn": self.turn, "era": p.era, "score": p.score,
            "cities": len(p.cities), "city_names": [c.name for c in p.cities],
            "total_population": sum(c.population for c in p.cities),
            "units": len(p.units), "unit_types": [u.unit_type for u in p.units],
            "techs_count": len(p.techs_researched), "techs_researched": list(p.techs_researched),
            "current_research": p.current_research, "gold": p.gold,
            "science_per_turn": p.science_per_turn, "culture_per_turn": p.culture_per_turn,
            "milestones": list(self.milestones),
            "ai_scores": [{"name": ai.civ_name, "score": ai.score, "techs": len(ai.techs_researched)}
                         for ai in self.ai_civs]}


if __name__ == "__main__":
    env = CivEnv(seed=42, fast_research=True)
    env.reset()
    print(env.get_text_observation())
