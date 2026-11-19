#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
每日定时器（Python 版，长期驻留进程）。

默认每天 12:00 调用 update_pipeline.py --incremental：
先抓取公告并对比发布时间，只有发现新公告才下载图片、构建 data.js；
周一额外刷新养成数据。仅使用标准库，不依赖 schedule / APScheduler。

用法：
  py -3.12 scripts/scheduler.py                 # 每天 12:00
  py -3.12 scripts/scheduler.py --time 12:30
  py -3.12 scripts/scheduler.py --run-now       # 启动后先跑一次
  py -3.12 scripts/scheduler.py --growth-day 2  # 每周三刷新养成

生产环境更推荐用 Windows 任务计划程序直接调用 update_pipeline.py：
  schtasks /Create /SC DAILY /ST 12:00 /TN "GameCalendarUpdate" ^
    /TR "py -3.12 D:\\work\\Calender\\scripts\\update_pipeline.py --only all --incremental"

注意：本脚本不会自动安装系统任务。如果同时启用了 Trae 的每日任务，
请暂停其中一个，避免两个进程同时抓取和构建。
"""

import argparse
import datetime as dt
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOG_DIR = ROOT / "logs"
PIPELINE = ROOT / "scripts" / "update_pipeline.py"


def log(message, log_path):
    line = "[%s] %s" % (dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S"), message)
    print(line, flush=True)
    log_path.parent.mkdir(parents=True, exist_ok=True)
    with log_path.open("a", encoding="utf-8") as f:
        f.write(line + "\n")


def next_run(hour, minute):
    now = dt.datetime.now()
    target = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
    if target <= now:
        target += dt.timedelta(days=1)
    return target


def main():
    parser = argparse.ArgumentParser(description="游戏活动日历每日定时器")
    parser.add_argument("--time", default="12:00", help="每天执行时间 HH:MM（默认 12:00）")
    parser.add_argument("--growth-day", type=int, default=0, choices=range(0, 7),
                        help="每周几刷新养成数据，0=周一（默认 0）")
    parser.add_argument("--run-now", action="store_true", help="启动后立即执行一次")
    parser.add_argument("--log-file", default=None, help="日志文件路径")
    args = parser.parse_args()

    try:
        hour, minute = [int(x) for x in args.time.split(":", 1)]
        assert 0 <= hour <= 23 and 0 <= minute <= 59
    except Exception:
        print("时间格式错误，应为 HH:MM，例如 09:00")
        return 2

    LOG_DIR.mkdir(parents=True, exist_ok=True)
    log_path = Path(args.log_file) if args.log_file else LOG_DIR / "scheduler.log"

    if not PIPELINE.exists():
        log("找不到 %s" % PIPELINE, log_path)
        return 2

    def run_pipeline():
        command = [
            sys.executable,
            str(PIPELINE),
            "--only", "all",
            "--incremental",
            "--growth-day", str(args.growth_day),
        ]
        log("开始执行：%s" % " ".join(command), log_path)
        try:
            proc = subprocess.run(command, cwd=str(ROOT))
            log("执行结束，退出码 %s" % proc.returncode, log_path)
        except Exception as exc:
            log("执行异常：%s" % exc, log_path)

    log("定时器启动，每天 %02d:%02d 执行（增量检测）；养成刷新日=周%s" %
        (hour, minute, "一二三四五六日"[args.growth_day]), log_path)
    log("按 Ctrl+C 退出。生产环境建议改用 Windows 任务计划程序。", log_path)

    if args.run_now:
        run_pipeline()

    try:
        while True:
            target = next_run(hour, minute)
            log("下次执行：%s" % target.strftime("%Y-%m-%d %H:%M"), log_path)
            while True:
                remaining = (target - dt.datetime.now()).total_seconds()
                if remaining <= 0:
                    break
                time.sleep(min(30, max(1, remaining)))
            run_pipeline()
    except KeyboardInterrupt:
        log("收到 Ctrl+C，定时器退出", log_path)
        return 0


if __name__ == "__main__":
    sys.exit(main())
