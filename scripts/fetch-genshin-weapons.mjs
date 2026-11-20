#!/usr/bin/env node
/**
 * 从米游社观测枢抓取原神全武器 1 → 90 总需求与阶段突破材料。
 * 频道：https://baike.mihoyo.com/ys/obc/channel/map/189/5
 * 用法：node scripts/fetch-genshin-weapons.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT_DIR = path.join(ROOT, 'data', 'growth');
const OUT = path.join(OUT_DIR, 'genshin-weapons.json');
const LIST_API = 'https://act-api-takumi-static.mihoyo.com/common/blackboard/ys_obc/v1/home/content/list?app_sn=ys_obc&channel_id=5';
const DETAIL_API = (id) => `https://act-api-takumi-static.mihoyo.com/hoyowiki/genshin/wapi/entry_page?app_sn=ys_obc&entry_page_id=${id}&lang=zh-cn`;
const UA = 'GameCalendarGrowth/1.0 (local; miyoushe obc)';
const CONCURRENCY = 5;
const TYPE_ORDER = ['单手剑', '双手剑', '长柄武器', '弓', '法器'];

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
  try { return JSON.parse(JSON.parse(item.ext).c_5.filter.text); } catch { return []; }
}

function picks(filters, prefix) {
  return filters.filter((x) => x.startsWith(prefix + '/')).map((x) => x.split('/').slice(1).join('/').trim());
}

function starOf(label) {
  const map = { '五星': 5, '四星': 4, '三星': 3, '二星': 2, '一星': 1 };
  return map[String(label || '').trim()] || 0;
}

function materialsOf(list) {
  return (list || []).map((m) => ({
    name: String(m.nickname || '').trim(),
    qty: { text: String(m.amount), num: Number(m.amount) },
    icon: m.img || ''
  })).filter((m) => m.name);
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
  console.log('读取观测枢武器列表…');
  const listJSON = await getJSON(LIST_API);
  const channel = listJSON.data?.list?.[0];
  const items = channel?.list || [];
  if (!items.length) throw new Error('武器列表为空，接口结构可能已变化');

  const seen = new Set();
  const picksList = [];
  for (const item of items) {
    const filters = filtersOf(item);
    const rarity = starOf(picks(filters, '武器星级')[0]);
    const name = String(item.title || '').trim();
    if (!rarity || !name || seen.has(name)) continue;
    seen.add(name);
    picksList.push({
      id: item.content_id,
      name,
      rarity,
      type: picks(filters, '武器类型')[0] || '',
      attribute: picks(filters, '属性加成').join(' / '),
      obtain: picks(filters, '获取途径')[0] || '',
      icon: item.icon || ''
    });
  }
  console.log(`武器条目 ${items.length}，去重后 ${picksList.length}，开始读取详情…`);

  const failures = [];
  const weapons = [];
  await mapLimit(picksList, CONCURRENCY, async (weapon, i) => {
    try {
      const json = await getJSON(DETAIL_API(weapon.id));
      const page = json.data?.page;
      if (!page) throw new Error('没有 page 数据');
      const comps = (page.modules || []).flatMap((m) => m.components || []);
      const comp = (id) => parseJSON((comps.find((c) => c.component_id === id) || {}).data, {});
      const base = comp('equipment_base_info');
      const growth = comp('equipment_growth_info');
      const tabs = growth.list || [];
      const total = materialsOf(tabs[0]?.materials);
      const ascensions = tabs.map((tab) => {
        const m = String(tab.tab_name || '').match(/^(\d+)级$/);
        if (!m || m[1] === '1' || m[1] === '90') return null;
        return { phase: m[1], materials: materialsOf(tab.materials) };
      }).filter(Boolean);

      weapons.push({
        entryId: weapon.id,
        name: weapon.name,
        rarity: weapon.rarity || Number(base.star) || 0,
        type: weapon.type || base.category || '',
        attribute: weapon.attribute,
        obtain: weapon.obtain,
        avatar: weapon.icon || base.image || '',
        url: `https://baike.mihoyo.com/ys/obc/content/${weapon.id}/detail`,
        total,
        ascensions,
        source: '米游社观测枢'
      });
      if ((i + 1) % 20 === 0) console.log(`  已读取 ${i + 1} / ${picksList.length}`);
      await sleep(80);
    } catch (err) {
      failures.push(`${weapon.name}(${weapon.id}): ${err.message}`);
    }
  });

  weapons.sort((a, b) => {
    if (b.rarity !== a.rarity) return b.rarity - a.rarity;
    const ia = TYPE_ORDER.indexOf(a.type);
    const ib = TYPE_ORDER.indexOf(b.type);
    if (ia !== ib) return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    return a.name.localeCompare(b.name, 'zh-Hans-CN');
  });

  const updated = new Date().toISOString().slice(0, 10);
  const doc = {
    game: 'genshin',
    kind: 'weapons',
    source: '米游社观测枢',
    sourceUrl: 'https://baike.mihoyo.com/ys/obc/channel/map/189/5',
    updated,
    count: weapons.length,
    weapons
  };
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(doc, null, 2) + '\n', 'utf8');

  console.log(`已写入 ${path.relative(ROOT, OUT)}：${weapons.length} 把武器，更新于 ${updated}`);
  if (failures.length) {
    console.log(`失败 ${failures.length} 条：`);
    failures.slice(0, 10).forEach((f) => console.log('  - ' + f));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
