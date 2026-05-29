"""
Civ6 AI Bridge - Main Loop
============================
监听 Mod 输出的游戏状态文件，调用 LLM API 生成决策建议，
将建议写回让 Mod 读取。

通信协议：
  1. Mod 每回合将游戏状态写入 data/game_state.json
  2. Bridge 检测到文件更新后读取并解析
  3. Bridge 调用 LLM API 获取建议
  4. Bridge 将建议写入 data/advice.json
  5. Mod 下回合开始时读取 advice.json 并应用

在真实环境中：
  - Mod 通过 Game:SetProperty() 保存数据到 .Civ6Save
  - 外部程序通过解析存档或 FireTuner 获取数据
  - 本原型使用文件系统模拟这一过程
"""

import json
import time
import sys
from pathlib import Path
from datetime import datetime

# 添加当前目录到路径
sys.path.insert(0, str(Path(__file__).parent))

from game_state import GameState, load_state_from_file, save_state_to_file, create_demo_scenario
from advisor import call_llm_api, generate_fallback_advice, StrategicAdvice


class AIBridge:
    """Civ6 AI Bridge 主控制器"""

    def __init__(self, data_dir: str = None, model: str = "llm-default",
                 poll_interval: float = 2.0, use_api: bool = True):
        """
        Args:
            data_dir: 数据交换目录路径
            model: LLM 模型名称
            poll_interval: 轮询间隔（秒）
            use_api: 是否使用真实 API（False 则使用规则备选）
        """
        if data_dir is None:
            data_dir = str(Path(__file__).parent / "data")
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.model = model
        self.poll_interval = poll_interval
        self.use_api = use_api

        self.state_file = self.data_dir / "game_state.json"
        self.advice_file = self.data_dir / "advice.json"
        self.log_file = self.data_dir / "bridge_log.jsonl"
        self.last_modified = 0
        self.turn_count = 0

    def log(self, level: str, message: str):
        """记录日志"""
        entry = {
            "timestamp": datetime.now().isoformat(),
            "level": level,
            "message": message,
            "turn_count": self.turn_count,
        }
        print(f"[{level}] {message}")
        with open(self.log_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")

    def check_state_update(self) -> bool:
        """检查游戏状态文件是否有更新"""
        if not self.state_file.exists():
            return False
        mtime = self.state_file.stat().st_mtime
        if mtime > self.last_modified:
            self.last_modified = mtime
            return True
        return False

    def process_turn(self) -> StrategicAdvice:
        """处理一个回合的决策"""
        self.turn_count += 1
        self.log("INFO", f"Processing turn (cycle #{self.turn_count})")

        # 1. 读取游戏状态
        state = load_state_from_file(str(self.state_file))
        self.log("INFO", f"Game state loaded: Turn {state.turn}, {state.civ_name}")

        # 2. 调用 LLM 获取建议
        if self.use_api:
            advice = call_llm_api(state, model=self.model)
            if advice is None:
                self.log("WARN", "API call failed, using fallback rules")
                advice = generate_fallback_advice(state)
        else:
            advice = generate_fallback_advice(state)

        # 3. 写回建议文件
        with open(self.advice_file, "w", encoding="utf-8") as f:
            f.write(advice.to_json())
        self.log("INFO", f"Advice written: victory_path={advice.victory_path}, "
                        f"confidence={advice.confidence:.0%}")

        return advice

    def run_once(self) -> StrategicAdvice:
        """单次运行：处理当前状态文件（适合演示）"""
        if not self.state_file.exists():
            self.log("INFO", "No state file found, creating demo scenario...")
            demo_state = create_demo_scenario()
            save_state_to_file(demo_state, str(self.state_file))
        self.last_modified = self.state_file.stat().st_mtime
        return self.process_turn()

    def run_loop(self, max_turns: int = None):
        """
        持续轮询模式：监听状态文件变化并响应。
        在真实环境中，这个循环会在游戏运行期间持续执行。

        Args:
            max_turns: 最大处理回合数（None = 无限）
        """
        self.log("INFO", f"Bridge started. Watching: {self.state_file}")
        self.log("INFO", f"Model: {self.model}, Poll interval: {self.poll_interval}s")
        self.log("INFO", f"Use API: {self.use_api}")
        print(f"\n{'='*50}")
        print(f"Civ6 AI Bridge - Listening Mode")
        print(f"State file: {self.state_file}")
        print(f"Advice file: {self.advice_file}")
        print(f"Press Ctrl+C to stop")
        print(f"{'='*50}\n")

        try:
            while True:
                if self.check_state_update():
                    self.process_turn()
                    if max_turns and self.turn_count >= max_turns:
                        self.log("INFO", f"Reached max turns ({max_turns}), stopping.")
                        break
                time.sleep(self.poll_interval)
        except KeyboardInterrupt:
            self.log("INFO", "Bridge stopped by user.")


def demo_full_flow(use_api: bool = True):
    """
    演示完整的决策流程：
    1. 创建模拟游戏场景
    2. 调用 LLM API
    3. 输出建议
    """
    print("=" * 60)
    print("  Civ6 AI Bridge - Full Decision Flow Demo")
    print("=" * 60)

    bridge = AIBridge(use_api=use_api)

    # 创建模拟场景
    print("\n[Step 1] Creating simulated game scenario...")
    demo_state = create_demo_scenario()
    save_state_to_file(demo_state, str(bridge.state_file))
    print(f"  State saved to: {bridge.state_file}")
    print(f"  Turn: {demo_state.turn}, Civ: {demo_state.civ_name}")

    # 处理决策
    print(f"\n[Step 2] Processing decision (model: {bridge.model})...")
    advice = bridge.run_once()

    # 展示结果
    print(f"\n[Step 3] Strategic Advice Generated:")
    print("-" * 50)
    print(advice.to_readable())
    print("-" * 50)

    print(f"\n[Summary]")
    print(f"  State file: {bridge.state_file}")
    print(f"  Advice file: {bridge.advice_file}")
    print(f"  Log file: {bridge.log_file}")
    print(f"  Victory path: {advice.victory_path}")
    print(f"  Confidence: {advice.confidence:.0%}")

    return advice


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Civ6 AI Bridge")
    parser.add_argument("--mode", choices=["demo", "listen", "once"],
                       default="demo", help="运行模式")
    parser.add_argument("--model", default="llm-default",
                       help="LLM 模型名称")
    parser.add_argument("--no-api", action="store_true",
                       help="不调用 API，使用规则备选")
    parser.add_argument("--data-dir", default=None,
                       help="数据交换目录")
    args = parser.parse_args()

    if args.mode == "demo":
        demo_full_flow(use_api=not args.no_api)
    elif args.mode == "listen":
        bridge = AIBridge(data_dir=args.data_dir, model=args.model,
                         use_api=not args.no_api)
        bridge.run_loop()
    elif args.mode == "once":
        bridge = AIBridge(data_dir=args.data_dir, model=args.model,
                         use_api=not args.no_api)
        bridge.run_once()
