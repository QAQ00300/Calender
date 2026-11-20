#!/usr/bin/env node
/**
 * 抓取 FGO 国服官网公告，生成活动 / 卡池日历数据。
 * 来源：https://game.bilibili.com/fgo/news.html
 * 列表：https://api.biligame.com/news/list.action?gameExtensionId=45...
 * 用法：node scripts/fetch-fgo.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'data', 'fgo.json');
const IMG_DIR = path.join(ROOT, 'data', 'images', 'fgo');
const UA = 'GameCalendarFGO/1.0 (local; bilibili fgo news)';
const REFERER = 'https://game.bilibili.com/fgo/';
const PAGES = 4;
const PAGE_SIZE = 50;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function stripHTML(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&middot;/gi, '·')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function classify(title) {
  if (/维护公告/.test(title)) return 'maintenance';
  if (/维护|概率公示|问卷|调查|封禁|处罚|客服|客户端|安装包|更新公告/.test(title)) return '';
  if (/推荐召唤|召唤.*卡池|卡池.*召唤/.test(title)) return 'banner';
  if (/活动|举办|开幕|纪念|兑换券|登录奖励|特别企划/.test(title)) return 'event';
  return '';
}

function cleanTitle(title) {
  return String(title || '')
    .replace(/^【[^】]*】/, '')
    .replace(/[『』]/g, '')
    .replace(/！$/, '')
    .replace(/举办$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function iso(date, time) {
  return `${date}T${time}:00+08:00`;
}

function dateKey(y, m, d) {
  return `${y}-${pad(m)}-${pad(d)}`;
}

const RANGE_RE = /(\d{4})年(\d{1,2})月(\d{1,2})日(?:（[^）]*）|\([^)]*\))?\s*(维护后|\d{1,2}:\d{2})?[^。]{0,20}?[~～\-—–至][^。]{0,30}?(?:(\d{4})年)?(\d{1,2})月(\d{1,2})日(?:（[^）]*）|\([^)]*\))?\s*(\d{1,2}:\d{2})?/g;

function extractRange(text, maintenanceMap) {
  RANGE_RE.lastIndex = 0;
  const m = RANGE_RE.exec(text);
  if (!m) return null;
  const sy = Number(m[1]);
  const sm = Number(m[2]);
  const sd = Number(m[3]);
  const startRaw = m[4] || '';
  const ey = Number(m[5] || sy);
  let em = Number(m[6]);
  const ed = Number(m[7]);
  let endTime = m[8] || '23:59';
  let startTime = '00:00';
  let afterMaintenance = false;
  const startDate = dateKey(sy, sm, sd);

  if (/^\d{1,2}:\d{2}$/.test(startRaw)) {
    const [h, mi] = startRaw.split(':');
    startTime = `${pad(Number(h))}:${mi}`;
  } else if (startRaw === '维护后') {
    afterMaintenance = true;
    startTime = maintenanceMap.get(startDate) || '00:00';
  }

  if (endTime && !/^\d{1,2}:\d{2}$/.test(endTime)) endTime = '23:59';
  if (endTime && /^\d{1,2}:\d{2}$/.test(endTime)) {
    const [h, mi] = endTime.split(':');
    endTime = `${pad(Number(h))}:${mi}`;
  }

  let start = iso(startDate, startTime);
  let end = iso(dateKey(ey, em, ed), endTime);
  if (new Date(end) < new Date(start)) {
    end = iso(dateKey(ey + 1, em, ed), endTime);
  }
  return { start, end, afterMaintenance, startDate };
}

function imageURLs(content) {
  const out = [];
  const seen = new Set();
  for (const m of String(content || '').matchAll(/<img[^>]+(?:data-src|src)="([^"]+)"/gi)) {
    let u = m[1].trim();
    if (!u || u.startsWith('data:') || /\.svg(\?|$)/i.test(u) || /\.gif(\?|$)/i.test(u)) continue;
    if (u.startsWith('//')) u = 'https:' + u;
    else if (u.startsWith('/')) u = 'https://game.bilibili.com' + u;
    else if (!/^https?:/i.test(u)) continue;
    if (seen.has(u)) continue;
    seen.add(u);
    out.push(u);
    if (out.length >= 3) break;
  }
  return out;
}

function extOf(url) {
  const m = String(url).match(/\.(png|jpe?g|webp)(?:\?|$)/i);
  return m ? m[1].toLowerCase().replace('jpeg', 'jpg') : 'png';
}

async function download(url, dest) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) return true;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': UA, referer: REFERER } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const buf = Buffer.from(await res.arrayBuffer());
      if (!buf.length) throw new Error('空文件');
      fs.writeFileSync(dest, buf);
      return true;
    } catch (err) {
      if (attempt === 1) return false;
      await sleep(400);
    }
  }
  return false;
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let index = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const i = index++;
      if (i >= items.length) break;
      out[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return out;
}

async function getJSON(url) {
  const res = await fetch(url, { headers: { 'user-agent': UA, referer: REFERER } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.json();
}

async function main() {
  fs.mkdirSync(IMG_DIR, { recursive: true });

  const listItems = new Map();
  for (let page = 1; page <= PAGES; page++) {
    const url = `https://api.biligame.com/news/list.action?gameExtensionId=45&positionId=2&pageNum=${page}&pageSize=${PAGE_SIZE}&typeId=1`;
    const json = await getJSON(url);
    const rows = json.data || [];
    for (const row of rows) {
      if (!listItems.has(row.id)) listItems.set(row.id, row);
    }
    console.log(`列表第 ${page} 页：${rows.length} 条，累计 ${listItems.size}`);
    if (rows.length < PAGE_SIZE) break;
  }

  const all = [...listItems.values()];
  const candidates = all.filter((row) => classify(row.title));
  console.log(`公告 ${all.length} 条，活动 / 卡池候选 ${candidates.length} 条，读取详情…`);

  const details = [];
  const failures = [];
  await mapLimit(candidates, 5, async (row, i) => {
    try {
      const json = await getJSON(`https://api.biligame.com/news/${row.id}.action`);
      if (json.code !== 0 || !json.data) throw new Error('详情返回异常');
      const data = json.data;
      const content = String(data.content || '');
      details.push({
        row,
        title: String(data.title || row.title || ''),
        content,
        text: stripHTML(content)
      });
    } catch (err) {
      failures.push(`${row.id} ${row.title}: ${err.message}`);
    }
    if ((i + 1) % 20 === 0) console.log(`  详情 ${i + 1} / ${candidates.length}`);
    await sleep(60);
  });

  const maintenanceMap = new Map();
  for (const d of details) {
    if (!/维护公告/.test(d.title)) continue;
    const m = d.text.match(/(\d{4})年(\d{1,2})月(\d{1,2})日\s*(\d{1,2}):(\d{2})\s*[~～]\s*(?:(\d{4})年)?(\d{1,2})月(\d{1,2})日\s*(\d{1,2}):(\d{2})/);
    if (!m) continue;
    const key = dateKey(Number(m[1]), Number(m[2]), Number(m[3]));
    maintenanceMap.set(key, `${pad(Number(m[9]))}:${m[10]}`);
  }
  if (maintenanceMap.size) console.log(`维护结束时间：${[...maintenanceMap.entries()].map(([k, v]) => k + ' ' + v).join('、')}`);

  const now = Date.now();
  const minEnd = now - 45 * 86400000;
  const maxStart = now + 180 * 86400000;
  const events = [];

  for (const d of details) {
    const type = classify(d.title);
    if (!type || type === 'maintenance') continue;
    const picked = extractRange(d.text, maintenanceMap);
    if (!picked) continue;
    const startMs = new Date(picked.start).getTime();
    const endMs = new Date(picked.end).getTime();
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) continue;
    if (endMs < minEnd || startMs > maxStart) continue;

    const title = cleanTitle(d.title);
    if (!title) continue;

    const names = [];
    for (const m of d.text.matchAll(/「★5（SSR）([^」]+)」/g)) {
      const n = m[1].trim();
      if (n && !names.includes(n)) names.push(n);
    }
    for (const m of d.text.matchAll(/★5（SSR）\s*([^\s，。；、]{2,24})/g)) {
      const n = m[1].trim();
      if (n && !/从者|卡牌|以上|对象/.test(n) && !names.includes(n)) names.push(n);
    }

    const banners = type === 'banner' ? names.slice(0, 4).map((name) => ({ name, tag: '5★ SSR' })) : [];
    const detailsArr = [
      `时间：${picked.start.slice(0, 16).replace('T', ' ')} – ${picked.end.slice(0, 16).replace('T', ' ')}`,
      picked.afterMaintenance && !maintenanceMap.has(picked.startDate) ? '公告写“维护后”开始，未找到对应维护结束时间，暂按 00:00 记录。' : '',
      `公告发布时间：${d.row.createTime || ''}`
    ].filter(Boolean);

    const urls = imageURLs(d.content);
    const gallery = [];
    for (let i = 0; i < urls.length; i++) {
      const ext = extOf(urls[i]);
      const file = path.join(IMG_DIR, `fgo-${d.row.id}-${i + 1}.${ext}`);
      if (await download(urls[i], file)) {
        gallery.push(`data/images/fgo/${path.basename(file)}`);
      }
    }

    const event = {
      id: `fgo-${d.row.id}`,
      game: 'fgo',
      type,
      title,
      subtitle: type === 'banner'
        ? (names.length ? names.slice(0, 3).join(' · ') : '国服推荐召唤')
        : '国服限时活动',
      start: picked.start,
      end: picked.end,
      banners,
      details: detailsArr,
      note: 'FGO 国服官网公告；具体时间以官方为准。',
      source: `https://game.bilibili.com/fgo/news.html#!news/0/1/${d.row.id}`
    };
    if (gallery.length) {
      event.image = gallery[0];
      event.gallery = gallery;
    }
    events.push(event);
  }

  events.sort((a, b) => new Date(a.start) - new Date(b.start));
  const updated = new Date().toISOString().slice(0, 10);
  const doc = { game: 'fgo', updated, events };
  fs.writeFileSync(OUT, JSON.stringify(doc, null, 2) + '\n', 'utf8');

  const counts = events.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {});
  console.log(`已写入 ${path.relative(ROOT, OUT)}：${events.length} 条（${JSON.stringify(counts)}）`);
  if (failures.length) {
    console.log(`详情失败 ${failures.length} 条：`);
    failures.slice(0, 8).forEach((f) => console.log('  - ' + f));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
