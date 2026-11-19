#!/usr/bin/env node
/**
 * 从 PRTS 抓取明日方舟全干员的精英化 / 技能升级材料。
 * 数据源：https://prts.wiki/
 * 用法：node scripts/fetch-arknights-materials.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const API = 'https://prts.wiki/api.php';
const ROOT = path.resolve(import.meta.dirname, '..');
const OUT_DIR = path.join(ROOT, 'data', 'growth');
const OUT = path.join(OUT_DIR, 'arknights.json');
const UA = 'GameCalendarGrowth/1.0 (local; PRTS material index)';

async function api(params) {
  const url = API + '?' + new URLSearchParams({ format: 'json', formatversion: '2', ...params });
  const res = await fetch(url, { headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error(`PRTS HTTP ${res.status}`);
  return res.json();
}

async function collectTitles() {
  const pages = new Set();
  const seenCats = new Set();
  const queue = ['Category:干员'];
  while (queue.length) {
    const cat = queue.shift();
    if (seenCats.has(cat)) continue;
    seenCats.add(cat);
    let cont = '';
    do {
      const params = {
        action: 'query', list: 'categorymembers',
        cmtitle: cat, cmtype: 'page|subcat', cmlimit: '500'
      };
      if (cont) params.cmcontinue = cont;
      const j = await api(params);
      for (const m of j.query?.categorymembers || []) {
        if (m.ns === 14) queue.push(m.title);
        else if (m.ns === 0) pages.add(m.title);
      }
      cont = j.continue?.cmcontinue || '';
    } while (cont);
  }
  return Array.from(pages).filter((t) => !t.includes('/') && t !== '干员一览');
}

function field(text, key) {
  const re = new RegExp('\\|\\s*' + key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*=\\s*([^\\n]*)');
  const m = text.match(re);
  return m ? m[1].replace(/<!--[\s\S]*?-->/g, '').trim() : '';
}

function section(text, name) {
  const re = new RegExp('==\\s*' + name + '\\s*==([\\s\\S]*?)(?=\\n==[^=]|$)');
  const m = text.match(re);
  return m ? m[1] : '';
}

function parseQty(s) {
  const m = String(s).trim().match(/^([\d.]+)\s*(w?)$/i);
  if (!m) return { text: String(s).trim(), num: null };
  return { text: String(s).trim(), num: parseFloat(m[1]) * (m[2] ? 10000 : 1) };
}

function normalizeRelease(s) {
  const m = String(s || '').match(/(\d{4})-(\d{1,2})-(\d{1,2})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (!m) return String(s || '').trim();
  const p = (n) => String(n).padStart(2, '0');
  return `${m[1]}-${p(m[2])}-${p(m[3])} ${p(m[4] || 0)}:${m[5] || '00'}`;
}

function parseMats(str) {
  const out = [];
  const re = /\{\{材料消耗\|([^|}]+)\|([^|}]+)\}\}/g;
  let m;
  while ((m = re.exec(str))) {
    out.push({ name: m[1].trim(), qty: parseQty(m[2]) });
  }
  return out;
}

function parseElite(text) {
  const block = section(text, '精英化材料');
  const out = {};
  for (const key of ['精1', '精2']) {
    const m = block.match(new RegExp('\\|\\s*' + key + '\\s*=\\s*([^\\n]*)'));
    out[key] = m ? parseMats(m[1]) : [];
  }
  return out;
}

function parseSkills(text) {
  const block = section(text, '技能升级材料');
  const out = {};
  const re = /\|\s*([^=\n]+?)\s*=\s*([^\n]*)/g;
  let m;
  while ((m = re.exec(block))) {
    const key = m[1].trim();
    if (!m[2].includes('材料消耗')) continue;
    out[key] = parseMats(m[2]);
  }
  return out;
}

function skillLabel(key) {
  const cn = { '一': '一', '二': '二', '三': '三' };
  const m = key.match(/^([一二三])(\d+)$/);
  if (m) return '专精' + cn[m[1]] + ' Lv' + m[2];
  return '技能 ' + key;
}

async function main() {
  console.log('收集 PRTS 干员页面...');
  const titles = await collectTitles();
  console.log(`候选页面 ${titles.length} 个，开始读取 wikitext...`);

  const operators = [];
  let skipped = 0;
  for (let i = 0; i < titles.length; i += 50) {
    const batch = titles.slice(i, i + 50);
    const j = await api({
      action: 'query', prop: 'revisions', rvslots: 'main', rvprop: 'content',
      titles: batch.join('|'), redirects: '1'
    });
    for (const p of j.query?.pages || []) {
      const text = p.revisions?.[0]?.slots?.main?.content || '';
      if (!text || !text.includes('精英化材料')) { skipped++; continue; }
      const rarityRaw = Number(field(text, '稀有度'));
      const name = p.title;
      const skills = parseSkills(text);
      operators.push({
        name,
        rarity: Number.isFinite(rarityRaw) ? rarityRaw + 1 : null,
        class: field(text, '职业') || '',
        branch: field(text, '分支') || '',
        tags: field(text, '标签') || '',
        obtain: (text.match(/\{\{干员获得方式\|获得方式=([^\n|}]+)/) || [])[1] || '',
        release: normalizeRelease((section(text, '获得方式').match(/\|上线时间=([^\n|]+)/) || [])[1] || ''),
        elite: parseElite(text),
        skills,
        url: 'https://prts.wiki/w/' + encodeURIComponent(name)
      });
    }
    console.log(`  已读取 ${Math.min(i + 50, titles.length)} / ${titles.length}`);
    await new Promise((r) => setTimeout(r, 180));
  }

  operators.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'));
  const out = {
    game: 'arknights',
    name: '明日方舟',
    source: 'https://prts.wiki/',
    updated: new Date().toISOString().slice(0, 10),
    count: operators.length,
    operators
  };
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
  console.log(`已生成 ${OUT}：${operators.length} 名干员，跳过 ${skipped} 个非干员页面`);
  const sample = operators.find((o) => o.name === '阿米娅') || operators[0];
  if (sample) {
    console.log('示例：', sample.name, '稀有度', sample.rarity, '精2材料', sample.elite['精2'].map((x) => x.name + '×' + x.qty.text).join('、'));
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
