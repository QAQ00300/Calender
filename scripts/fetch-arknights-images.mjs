#!/usr/bin/env node
/**
 * 为 data/growth/arknights.json 补充本地头像和材料图标。
 * 图标按“精确名称”从 PRTS 文件接口获取，名称对不上就不使用，避免错图。
 * 用法：node scripts/fetch-arknights-images.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const API = 'https://prts.wiki/api.php';
const ROOT = path.resolve(import.meta.dirname, '..');
const JSON_PATH = path.join(ROOT, 'data', 'growth', 'arknights.json');
const IMG_ROOT = path.join(ROOT, 'data', 'images', 'growth', 'arknights');
const AVATAR_DIR = path.join(IMG_ROOT, 'avatars');
const MATERIAL_DIR = path.join(IMG_ROOT, 'materials');
const UA = 'GameCalendarGrowth/1.0 (local; PRTS image index)';
const CONCURRENCY = 6;

fs.mkdirSync(AVATAR_DIR, { recursive: true });
fs.mkdirSync(MATERIAL_DIR, { recursive: true });

const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
const operators = data.operators || [];

function hash(s) {
  return crypto.createHash('sha1').update(s).digest('hex').slice(0, 10);
}
function norm(title) {
  return String(title)
    .replace(/^(File|文件)\s*:\s*/i, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function extOf(url) {
  const m = String(url).match(/\.(png|jpe?g|webp|gif)(?:\?|$)/i);
  return m ? m[1].toLowerCase().replace('jpeg', 'jpg') : 'png';
}
function chunks(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function imageInfo(titles) {
  const result = new Map();
  for (const batch of chunks(titles, 50)) {
    const url = API + '?' + new URLSearchParams({
      action: 'query', titles: batch.join('|'), prop: 'imageinfo',
      iiprop: 'url', format: 'json', formatversion: '2', redirects: '1'
    });
    const res = await fetch(url, { headers: { 'user-agent': UA } });
    if (!res.ok) throw new Error(`imageinfo HTTP ${res.status}`);
    const j = await res.json();
    for (const p of j.query?.pages || []) {
      const info = p.imageinfo && p.imageinfo[0];
      if (info && info.url) result.set(norm(p.title), info.url);
    }
    await new Promise((r) => setTimeout(r, 120));
  }
  return result;
}

async function download(url, dest) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) return true;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'user-agent': UA, referer: 'https://prts.wiki/' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (!buf.length) throw new Error('空文件');
      fs.writeFileSync(dest, buf);
      return true;
    } catch (err) {
      if (attempt === 1) return false;
      await new Promise((r) => setTimeout(r, 300));
    }
  }
  return false;
}

async function mapLimit(items, limit, worker) {
  let i = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      await worker(items[idx], idx);
    }
  });
  await Promise.all(runners);
}

async function main() {
  const operatorNames = operators.map((o) => o.name).filter(Boolean);
  const materialNames = Array.from(new Set(
    operators.flatMap((o) => {
      const out = [];
      for (const k of ['精1', '精2']) (o.elite?.[k] || []).forEach((m) => out.push(m.name));
      Object.values(o.skills || {}).forEach((arr) => arr.forEach((m) => out.push(m.name)));
      return out;
    }).filter(Boolean)
  ));

  console.log(`读取干员 ${operatorNames.length} 名，材料 ${materialNames.length} 种`);

  // 头像：精确使用“头像 <干员名>.png”
  const avatarTitles = operatorNames.map((n) => `File:头像 ${n}.png`);
  const avatarInfo = await imageInfo(avatarTitles);
  const avatarUrlByName = new Map();
  for (const name of operatorNames) {
    const url = avatarInfo.get(norm(`头像 ${name}.png`));
    if (url) avatarUrlByName.set(name, url);
  }
  console.log(`头像命中 ${avatarUrlByName.size} / ${operatorNames.length}`);

  let avatarDownloaded = 0;
  let avatarFailed = 0;
  await mapLimit(operatorNames, CONCURRENCY, async (name) => {
    const url = avatarUrlByName.get(name);
    if (!url) return;
    const ext = extOf(url);
    const rel = `data/images/growth/arknights/avatars/op-${hash(name)}.${ext}`;
    const ok = await download(url, path.join(ROOT, rel));
    if (ok) { avatarDownloaded++; avatarUrlByName.set(name, rel); }
    else { avatarFailed++; avatarUrlByName.set(name, ''); }
  });
  for (const o of operators) o.avatar = avatarUrlByName.get(o.name) || '';

  // 材料：优先“道具 带框 <名称>.png”，缺失再试“道具 <名称>.png”
  const preferred = materialNames.map((n) => `File:道具 带框 ${n}.png`);
  const preferredInfo = await imageInfo(preferred);
  const iconUrlByName = new Map();
  const missing = [];
  for (const name of materialNames) {
    const url = preferredInfo.get(norm(`道具 带框 ${name}.png`));
    if (url) iconUrlByName.set(name, url);
    else missing.push(name);
  }
  if (missing.length) {
    const fallbackInfo = await imageInfo(missing.map((n) => `File:道具 ${n}.png`));
    for (const name of missing) {
      const url = fallbackInfo.get(norm(`道具 ${name}.png`));
      if (url) iconUrlByName.set(name, url);
    }
  }
  console.log(`材料图标命中 ${iconUrlByName.size} / ${materialNames.length}`);

  let matDownloaded = 0;
  let matFailed = 0;
  const finalIcon = new Map();
  await mapLimit(Array.from(iconUrlByName.keys()), CONCURRENCY, async (name) => {
    const url = iconUrlByName.get(name);
    const ext = extOf(url);
    const rel = `data/images/growth/arknights/materials/mat-${hash(name)}.${ext}`;
    const ok = await download(url, path.join(ROOT, rel));
    if (ok) { matDownloaded++; finalIcon.set(name, rel); }
    else { matFailed++; }
  });

  for (const o of operators) {
    for (const k of ['精1', '精2']) {
      (o.elite?.[k] || []).forEach((m) => { if (finalIcon.has(m.name)) m.icon = finalIcon.get(m.name); });
    }
    Object.values(o.skills || {}).forEach((arr) => arr.forEach((m) => {
      if (finalIcon.has(m.name)) m.icon = finalIcon.get(m.name);
    }));
  }

  data.imageUpdated = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2) + '\n');

  console.log(`头像下载 ${avatarDownloaded}，失败 ${avatarFailed}；材料图标下载 ${matDownloaded}，失败 ${matFailed}`);
  const sample = operators.find((o) => o.name === '阿米娅');
  if (sample) {
    console.log('示例：', sample.name, '头像', sample.avatar,
      '精2', (sample.elite['精2'] || []).map((m) => m.name + (m.icon ? '✓' : '✗')).join('、'));
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
