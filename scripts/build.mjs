#!/usr/bin/env node
/**
 * 把 data/<游戏>.json 合并成页面加载的 data.js。
 * 用法：node scripts/build.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');

const config = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'games.json'), 'utf8'));
const typeIds = new Set(Object.keys(config.types));
const games = config.games;

const events = [];
const seen = new Set();
const summary = [];
let updated = '';

for (const game of games) {
  const file = game.file || `${game.id}.json`;
  const doc = JSON.parse(await fs.readFile(path.join(DATA_DIR, file), 'utf8'));
  if (doc.game && doc.game !== game.id) {
    throw new Error(`${file} 的 game 字段与注册表不一致：${doc.game}`);
  }
  if (!Array.isArray(doc.events)) {
    throw new Error(`${file} 缺少 events 数组`);
  }

  for (const event of doc.events) {
    for (const field of ['id', 'game', 'type', 'title', 'start']) {
      if (!event[field]) throw new Error(`${file} 中的事件缺少 ${field} 字段：${JSON.stringify(event)}`);
    }
    if (event.game !== game.id) {
      throw new Error(`${file} 中 ${event.id} 的 game 应为 ${game.id}，实际为 ${event.game}`);
    }
    if (seen.has(event.id)) throw new Error(`事件 id 重复：${event.id}`);
    if (!typeIds.has(event.type)) throw new Error(`${event.id} 的 type 不存在：${event.type}`);
    if (Number.isNaN(new Date(event.start).getTime())) throw new Error(`${event.id} 的 start 无法解析：${event.start}`);
    if (event.end && Number.isNaN(new Date(event.end).getTime())) throw new Error(`${event.id} 的 end 无法解析：${event.end}`);
    seen.add(event.id);
    events.push(event);
  }

  summary.push(`${game.short}(${doc.events.length})`);
  if (doc.updated && doc.updated > updated) updated = doc.updated;
}

events.sort((a, b) => new Date(a.start) - new Date(b.start));

const publicGames = games.map((g) => ({
  id: g.id,
  name: g.name,
  short: g.short,
  color: g.color
}));

const output = `/* 游戏活动日历 · 构建产物
 * 请勿直接编辑本文件；数据源为 data/<游戏>.json，运行 node scripts/build.mjs 重新生成。
 * 时间均为北京时间（UTC+8）；end 为 null 表示官方未公布结束时间。
 */

const DATA_UPDATED = ${JSON.stringify(updated)};

const GAMES = ${JSON.stringify(publicGames, null, 2)};

const TYPES = ${JSON.stringify(config.types, null, 2)};

const EVENTS = ${JSON.stringify(events, null, 2)};
`;

await fs.writeFile(path.join(ROOT, 'data.js'), output, 'utf8');
console.log(`已生成 data.js：${events.length} 条行程，更新于 ${updated || '未知'}`);
console.log(`游戏：${summary.join('、')}`);
