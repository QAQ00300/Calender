#!/usr/bin/env node
/**
 * 从米游社观测枢（baike.mihoyo.com）抓取原神全角色突破 / 天赋材料。
 * 数据源：https://baike.mihoyo.com/ys/obc/channel/map/189/25
 * 用法：node scripts/fetch-genshin-materials.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT_DIR = path.join(ROOT, 'data', 'growth');
const OUT = path.join(OUT_DIR, 'genshin.json');
const LIST_API = 'https://act-api-takumi-static.mihoyo.com/common/blackboard/ys_obc/v1/home/content/list?app_sn=ys_obc&channel_id=25';
const DETAIL_API = (id) => `https://act-api-takumi-static.mihoyo.com/hoyowiki/genshin/wapi/entry_page?app_sn=ys_obc&entry_page_id=${id}&lang=zh-cn`;
const UA = 'GameCalendarGrowth/1.0 (local; miyoushe obc)';
const CONCURRENCY = 5;
const BOOK_EXP = 20000;
const LEVEL_PHASES = [
  { range: '1→20', exp: 120175, ascensionMora: 0 },
  { range: '20→40', exp: 578325, ascensionMora: 20000 },
  { range: '40→50', exp: 579100, ascensionMora: 40000 },
  { range: '50→60', exp: 854125, ascensionMora: 60000 },
  { range: '60→70', exp: 1195925, ascensionMora: 80000 },
  { range: '70→80', exp: 1611875, ascensionMora: 100000 },
  { range: '80→90', exp: 3423125, ascensionMora: 120000 }
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getJSON(url, attempt = 0) {
  try {
    const res = await fetch(url, {
      headers: { 'user-agent': UA, referer: 'https://baike.mihoyo.com/ys/obc/' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.retcode !== 0) throw new Error(json.message || `retcode ${json.retcode}`);
    return json;
  } catch (err) {
    if (attempt < 2) {
      await sleep(500 * (attempt + 1));
      return getJSON(url, attempt + 1);
    }
    throw err;
  }
}

function parseJSON(text, fallback) {
  try { return JSON.parse(text || '{}'); } catch { return fallback; }
}

function filtersOf(item) {
  try { return JSON.parse(JSON.parse(item.ext).c_25.filter.text); } catch { return []; }
}

function pick(filters, prefix) {
  const hit = filters.find((x) => x.startsWith(prefix + '/'));
  return hit ? hit.split('/').slice(1).join('/').trim() : '';
}

function starOf(label) {
  if (/五星/.test(label)) return 5;
  if (/四星/.test(label)) return 4;
  return 0;
}

function materialsOf(list) {
  return (list || []).map((m) => ({
    name: String(m.nickname || '').trim(),
    qty: { text: String(m.amount), num: Number(m.amount) },
    icon: m.img || ''
  })).filter((m) => m.name);
}

function addHTMLMaterials(cell, map) {
  for (const match of String(cell || '').matchAll(/<span class="custom-entry-wrapper"([^>]*)>/g)) {
    const attrs = match[1];
    const name = (/data-entry-name="([^"]+)"/.exec(attrs) || [])[1];
    const amount = Number((/data-entry-amount="([^"]+)"/.exec(attrs) || [])[1] || 0);
    const img = (/data-entry-img="([^"]+)"/.exec(attrs) || [])[1] || '';
    if (!name || !amount) continue;
    const current = map.get(name) || { name, qty: { text: '', num: 0 }, icon: img };
    current.qty.num += amount;
    current.qty.text = String(current.qty.num);
    if (img) current.icon = img;
    map.set(name, current);
  }
}

function levelsOf(tab) {
  const row = (tab.attr?.row || []).find((r) => String(r[0]).includes('升级材料'));
  if (!row) return [];
  const header = tab.attr?.header || [];
  const out = [];
  for (let i = 1; i < row.length; i++) {
    const level = Number(String(header[i] || '').replace(/\D/g, ''));
    if (!level || level < 2 || level > 10) continue;
    const map = new Map();
    addHTMLMaterials(row[i], map);
    out.push({ range: `${level - 1}→${level}`, materials: [...map.values()] });
  }
  return out;
}

function ascensionsOf(ascension) {
  return (ascension.list || []).map((tab) => {
    const m = String(tab.tab_name || '').match(/^(\d+)级突破/);
    if (!m) return null;
    return { phase: m[1], materials: materialsOf(tab.materials) };
  }).filter(Boolean);
}

function levelingInfo() {
  let cum = 0;
  let prevBooks = 0;
  const phases = LEVEL_PHASES.map((p) => {
    cum += p.exp;
    const reached = Math.ceil(cum / BOOK_EXP);
    const books = reached - prevBooks;
    prevBooks = reached;
    return {
      range: p.range,
      exp: p.exp,
      mora: Math.round(p.exp * 0.2) + p.ascensionMora,
      books,
      ascensionMora: p.ascensionMora
    };
  });
  return {
    expTotal: cum,
    moraTotal: phases.reduce((sum, p) => sum + p.mora, 0),
    bookExp: BOOK_EXP,
    booksTotal: prevBooks,
    phases
  };
}

function talentsOf(talent) {
  const out = [];
  const tabs = talent.list || [];
  let picked = tabs.filter((t) => /普通攻击|元素战技|元素爆发/.test(String(t.tab_name || '')));
  if (!picked.length) {
    picked = tabs.filter((t) => (t.attr?.row || []).some((r) => String(r[0]).includes('升级材料')));
  }
  for (const tab of picked.slice(0, 3)) {
    const row = (tab.attr?.row || []).find((r) => String(r[0]).includes('升级材料'));
    if (!row) continue;
    const map = new Map();
    const header = tab.attr?.header || [];
    for (let i = 1; i < row.length; i++) {
      const level = Number(String(header[i] || '').replace(/\D/g, ''));
      if (!level || level < 2 || level > 10) continue;
      addHTMLMaterials(row[i], map);
    }
    out.push({
      label: String(tab.tab_name || '').replace(/^天赋\d+（|）$/g, ''),
      name: String(tab.title || '').trim(),
      icon: tab.icon || '',
      materials: [...map.values()],
      levels: levelsOf(tab)
    });
  }
  return out;
}

function releaseOf(timeline) {
  const tabs = (timeline.list || []).map((x) => x.tab_name);
  let tab = tabs.find((x) => /角色登场/.test(x)) || '';
  let approx = false;
  if (!tab && tabs.length) {
    tab = tabs[tabs.length - 1];
    approx = true;
  }
  const m = String(tab).match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
  if (!m) return { date: '', approx: false };
  const p = (n) => String(n).padStart(2, '0');
  return { date: `${m[1]}-${p(m[2])}-${p(m[3])} 00:00`, approx };
}

function releaseTime(o) {
  const m = String(o.release || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? new Date(+m[1], +m[2] - 1, +m[3]).getTime() : 0;
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

async function main() {
  console.log('读取观测枢角色列表…');
  const listJSON = await getJSON(LIST_API);
  const channel = listJSON.data?.list?.[0];
  const items = channel?.list || [];
  if (!items.length) throw new Error('角色列表为空，接口结构可能已变化');

  const seen = new Set();
  const picks = [];
  for (const item of items) {
    const filters = filtersOf(item);
    const rarity = starOf(pick(filters, '星级'));
    if (!rarity) continue;
    const name = String(item.title || '').trim();
    const element = pick(filters, '元素');
    const key = name + '|' + element;
    if (seen.has(key)) continue;
    seen.add(key);
    picks.push({
      id: item.content_id,
      name,
      rarity,
      element,
      weapon: pick(filters, '武器'),
      region: pick(filters, '地区'),
      avatar: item.icon || ''
    });
  }
  console.log(`角色条目 ${items.length}，去重后 ${picks.length}，开始读取详情…`);

  const failures = [];
  const operators = [];
  await mapLimit(picks, CONCURRENCY, async (pickItem, i) => {
    try {
      const json = await getJSON(DETAIL_API(pickItem.id));
      const page = json.data?.page;
      if (!page) throw new Error('没有 page 数据');
      const comps = (page.modules || []).flatMap((m) => m.components || []);
      const comp = (id) => parseJSON((comps.find((c) => c.component_id === id) || {}).data, {});
      const base = comp('role_base_info');
      const ascension = comp('role_ascension');
      const talent = comp('role_talent');
      const timeline = comp('timeline_base_info');

      const attrs = {};
      for (const a of base.attr || []) attrs[a.key] = (a.value || []).join('').trim();
      const tags = [attrs['定位'], attrs['所属'], attrs['称号']].filter(Boolean).join(' · ');
      const release = releaseOf(timeline);

      operators.push({
        entryId: pickItem.id,
        name: pickItem.name,
        rarity: pickItem.rarity || Number(base.star) || 0,
        element: pickItem.element,
        weapon: pickItem.weapon,
        region: pickItem.region,
        release: release.date,
        releaseApprox: release.approx,
        avatar: pickItem.avatar || base.avatar_pc || '',
        url: `https://baike.mihoyo.com/ys/obc/content/${pickItem.id}/detail`,
        tags,
        ascension: materialsOf(ascension.list?.[0]?.materials),
        ascensions: ascensionsOf(ascension),
        talents: talentsOf(talent),
        source: '米游社观测枢'
      });
      if ((i + 1) % 20 === 0) console.log(`  已读取 ${i + 1} / ${picks.length}`);
      await sleep(80);
    } catch (err) {
      failures.push(`${pickItem.name}(${pickItem.id}): ${err.message}`);
    }
  });

  operators.sort((a, b) => {
    const ta = releaseTime(a);
    const tb = releaseTime(b);
    if (!ta && !tb) return b.rarity - a.rarity || a.name.localeCompare(b.name, 'zh-Hans-CN');
    if (!ta) return 1;
    if (!tb) return -1;
    return tb - ta || b.rarity - a.rarity || a.name.localeCompare(b.name, 'zh-Hans-CN');
  });

  const updated = new Date().toISOString().slice(0, 10);
  const doc = {
    game: 'genshin',
    source: '米游社观测枢',
    sourceUrl: 'https://baike.mihoyo.com/ys/obc/channel/map/189/25',
    updated,
    count: operators.length,
    leveling: levelingInfo(),
    operators
  };
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(doc, null, 2) + '\n', 'utf8');

  console.log(`已写入 ${path.relative(ROOT, OUT)}：${operators.length} 名角色，更新于 ${updated}`);
  if (failures.length) {
    console.log(`失败 ${failures.length} 条：`);
    failures.slice(0, 10).forEach((f) => console.log('  - ' + f));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
