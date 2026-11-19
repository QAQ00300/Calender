#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
游戏活动日历 / 养成页更新流水线（单次执行版）。

设计为给 Windows 任务计划程序、cron 或 scheduler.py 调用：
  py -3.12 scripts/update_pipeline.py --only all

如果系统里的 python 命令已正确指向 Python 3.10+，也可以用 python。

它只做机械动作：
  1. 抓取公告候选（fetch.mjs）
  2. 增量检测：按公告发布时间的“水位”判断哪些是新公告
  3. 有新公告时才下载并本地化图片（fetch-images.mjs）、构建 data.js（build.mjs）
  4. 每周刷新明日方舟材料与头像（PRTS）

增量检测的状态保存在 data/inbox/state.json，每次检测结果写到
data/inbox/changes/YYYY-MM-DD.json。首次运行会建立基线。

注意：日历活动的语义更新（新增/修正日期、卡池、兑换码）仍需要人工
或 Trae 定时任务审核；本脚本不会自行编造活动数据。
"""

import argparse
import datetime as dt
import json
import shutil
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOG_DIR = ROOT / "logs"
INBOX_DIR = ROOT / "data" / "inbox"
STATE_PATH = INBOX_DIR / "state.json"
CHANGES_DIR = INBOX_DIR / "changes"
SEEN_RETENTION_DAYS = 180


def log(message, log_path=None):
    line = "[%s] %s" % (dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S"), message)
    print(line, flush=True)
    if log_path:
        log_path.parent.mkdir(parents=True, exist_ok=True)
        with log_path.open("a", encoding="utf-8") as f:
            f.write(line + "\n")


def read_json(path, default):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return default


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    tmp.replace(path)


def detect_new_candidates(log_path):
    """按公告发布时间判断新增，更新水位与已见列表，并写出检测报告。

    返回报告 dict；找不到当天 inbox 时返回 None。
    """
    today = dt.date.today()
    inbox_path = INBOX_DIR / (today.isoformat() + ".json")
    if not inbox_path.exists():
        log("检测跳过：找不到 %s" % inbox_path.relative_to(ROOT), log_path)
        return None

    raw = read_json(inbox_path, {})
    candidates = raw.get("candidates", []) if isinstance(raw, dict) else []
    state = read_json(STATE_PATH, {"version": 1, "sources": {}})
    sources = state.setdefault("sources", {})
    baseline = not any(entry.get("seen") for entry in sources.values())

    new_items, old_items = [], []
    source_max = {}

    for item in candidates:
        src = item.get("source") or item.get("game") or "unknown"
        url = item.get("url") or ""
        published = str(item.get("dateHint") or "").strip()[:10]
        entry = sources.setdefault(src, {"lastPublish": "", "seen": {}})
        seen = entry.setdefault("seen", {})
        watermark = entry.get("lastPublish") or ""

        if url and url in seen:
            old_items.append({"game": item.get("game", ""), "title": item.get("title", ""),
                              "publishedAt": published, "reason": "已处理过"})
        elif watermark and published and published < watermark:
            old_items.append({"game": item.get("game", ""), "title": item.get("title", ""),
                              "publishedAt": published, "reason": "发布时间早于水位 " + watermark})
        else:
            new_items.append({
                "game": item.get("game", ""),
                "source": src,
                "title": item.get("title", ""),
                "url": url,
                "publishedAt": published,
            })
        if url:
            seen[url] = published or today.isoformat()
        if published and published > source_max.get(src, ""):
            source_max[src] = published

    cutoff = (today - dt.timedelta(days=SEEN_RETENTION_DAYS)).isoformat()
    for entry in sources.values():
        entry["seen"] = {
            url: day for url, day in entry.get("seen", {}).items()
            if not day or day >= cutoff
        }
    for src, published in source_max.items():
        entry = sources[src]
        if published > (entry.get("lastPublish") or ""):
            entry["lastPublish"] = published

    now = dt.datetime.now().isoformat(timespec="seconds")
    state["version"] = 1
    state["updatedAt"] = now
    state["lastRun"] = now
    write_json(STATE_PATH, state)

    by_game = {}
    for item in new_items:
        game = item["game"] or "unknown"
        by_game[game] = by_game.get(game, 0) + 1

    report = {
        "checkedAt": now,
        "inbox": str(inbox_path.relative_to(ROOT)).replace("\\", "/"),
        "baseline": baseline,
        "totalCandidates": len(candidates),
        "newCount": len(new_items),
        "oldCount": len(old_items),
        "byGame": by_game,
        "new": new_items,
        "old": old_items,
    }
    write_json(CHANGES_DIR / (today.isoformat() + ".json"), report)

    if baseline:
        log("增量检测：首次运行，建立基线，共 %d 条候选" % len(candidates), log_path)
    else:
        log("增量检测：候选 %d 条，新增 %d 条，跳过旧公告 %d 条" %
            (len(candidates), len(new_items), len(old_items)), log_path)
    if by_game:
        log("  新增分布：" + "、".join("%s %d" % (k, v) for k, v in sorted(by_game.items())), log_path)
    for item in new_items[:12]:
        log("  + [%s] %s %s" % (item["game"], item["publishedAt"] or "无日期", item["title"]), log_path)
    if len(new_items) > 12:
        log("  ... 其余 %d 条见 %s" % (len(new_items) - 12, CHANGES_DIR.relative_to(ROOT)), log_path)
    return report


def run_step(name, command, timeout, log_path, dry_run):
    log("START %s: %s" % (name, " ".join(command)), log_path)
    if dry_run:
        log("DRY-RUN 跳过执行", log_path)
        return True
    started = time.time()
    try:
        proc = subprocess.run(
            command,
            cwd=str(ROOT),
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=timeout,
        )
    except FileNotFoundError:
        log("FAIL %s: 找不到可执行文件 %s" % (name, command[0]), log_path)
        return False
    except subprocess.TimeoutExpired:
        log("FAIL %s: 超时（%ss）" % (name, timeout), log_path)
        return False

    if proc.stdout and proc.stdout.strip():
        for line in proc.stdout.rstrip().splitlines():
            log("  " + line, log_path)
    if proc.stderr and proc.stderr.strip():
        for line in proc.stderr.rstrip().splitlines():
            log("  ! " + line, log_path)

    elapsed = time.time() - started
    if proc.returncode != 0:
        log("FAIL %s: 退出码 %s（%.1fs）" % (name, proc.returncode, elapsed), log_path)
        return False
    log("OK %s（%.1fs）" % (name, elapsed), log_path)
    return True


def main():
    parser = argparse.ArgumentParser(description="游戏活动日历 / 养成页更新流水线")
    parser.add_argument("--only", choices=["all", "calendar", "growth"], default="all",
                        help="只跑日历、只跑养成，或两者都跑（默认 all）")
    parser.add_argument("--with-growth", action="store_true",
                        help="all 模式下强制包含养成数据刷新")
    parser.add_argument("--skip-growth", action="store_true",
                        help="all 模式下跳过养成数据刷新")
    parser.add_argument("--growth-day", type=int, default=0, choices=range(0, 7),
                        help="每周几刷新养成数据，0=周一（默认 0）")
    parser.add_argument("--incremental", action="store_true",
                        help="按公告发布时间检测新增；没有新公告时跳过图片与构建")
    parser.add_argument("--dry-run", action="store_true", help="只打印命令，不执行")
    parser.add_argument("--timeout", type=int, default=900, help="单步超时秒数（默认 900）")
    args = parser.parse_args()

    LOG_DIR.mkdir(parents=True, exist_ok=True)
    log_path = LOG_DIR / ("pipeline-%s.log" % dt.datetime.now().strftime("%Y%m%d"))

    node = shutil.which("node")
    if not node:
        log("FAIL 未找到 node，请先安装 Node.js 并加入 PATH", log_path)
        return 2

    today = dt.datetime.now().weekday()
    if args.only == "calendar":
        include_growth = False
    elif args.only == "growth":
        include_growth = True
    else:
        include_growth = args.with_growth or (today == args.growth_day and not args.skip_growth)
        if args.skip_growth:
            include_growth = False

    log("流水线开始：only=%s，养成=%s，增量=%s，dry_run=%s" %
        (args.only, "是" if include_growth else "否",
         "是" if args.incremental else "否", "是" if args.dry_run else "否"), log_path)

    fetch_cmd = [node, "scripts/fetch.mjs"]
    image_cmd = [node, "scripts/fetch-images.mjs"]
    build_cmd = [node, "scripts/build.mjs"]
    growth_steps = [
        ("抓取原神角色材料", [node, "scripts/fetch-genshin-materials.mjs"], args.timeout),
        ("下载原神头像与材料图标", [node, "scripts/fetch-genshin-images.mjs"], args.timeout),
        ("抓取 PRTS 干员材料", [node, "scripts/fetch-arknights-materials.mjs"], args.timeout),
        ("下载干员头像与材料图标", [node, "scripts/fetch-arknights-images.mjs"], args.timeout),
    ]

    if args.only in ("all", "calendar"):
        if not run_step("抓取公告候选", fetch_cmd, min(args.timeout, 600), log_path, args.dry_run):
            log("流水线中止：抓取公告候选失败", log_path)
            return 1

        run_update = True
        if args.incremental and not args.dry_run:
            report = detect_new_candidates(log_path)
            if report is not None and report["newCount"] == 0:
                log("增量检测：没有新公告，跳过图片本地化与构建", log_path)
                run_update = False
        if run_update:
            if not run_step("下载并本地化图片", image_cmd, args.timeout, log_path, args.dry_run):
                log("流水线中止：下载并本地化图片失败", log_path)
                return 1
            if not run_step("构建 data.js", build_cmd, min(args.timeout, 180), log_path, args.dry_run):
                log("流水线中止：构建 data.js 失败", log_path)
                return 1

    if include_growth:
        for name, command, timeout in growth_steps:
            if not run_step(name, command, timeout, log_path, args.dry_run):
                log("流水线中止：%s 失败" % name, log_path)
                return 1

    if args.only in ("all", "calendar"):
        log("提示：日历活动的语义更新仍需人工或 Trae 定时任务审核；"
            "本脚本负责检测新增候选、图片本地化和构建，不会自行编造活动。", log_path)
    log("流水线完成", log_path)
    return 0


if __name__ == "__main__":
    sys.exit(main())
