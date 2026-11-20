#!/usr/bin/env node
/**
 * 为 data/growth/genshin-weapons.json 下载武器图标与材料图标，并改写为本地路径。
 * 用法：node scripts/fetch-genshin-weapon-images.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = path.resolve(import.meta.dirname, '..');
const JSON_PATH = path.join(ROOT, 'data', 'growth', 'genshin-weapons.json');
const IMG_ROOT = path.join(ROOT, 'data', 'images', 'growth', 'genshin');
const WEAPON_DIR = path.join(IMG_ROOT, 'weapons');
const MATERIAL_DIR = path.join(IMG_ROOT, 'materials');
const UA = 'GameCalendarGrowth/1.0 (local; miyoushe obc)';
const CONCURRENCY = 6;

fs.mkdirSync(WEAPON_DIR, { recursive: true });
fs.mkdirSync(MATERIAL_DIR, { recursive: true });

const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));

function hash(s) {
  return crypto.createHash('sha1').update(s).digest('hex').slice(0, 10);
}
function extOf(url) {
  const m = String(url).match(/\.(png|jpe?g|webp|gif)(?:\?|$)/i);
  return m ? m[1].toLowerCase().replace('jpeg', 'jpg') : 'png';
}
function isRemote(u) {
  return typeof u === 'string' && /^https?:\/\//i.test(u);
}
async function download(url, dest) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) return true;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'user-agent': UA, referer: 'https://baike.mihoyo.com/ys/obc/' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (!buf.length) throw new Error('空文件');
      fs.writeFileSync(dest, buf);
      return true;
    } catch (err) {
      if (attempt === 1) return false;
      await new Promise((r) => setTimeout(r, 400));
    }
  }
  return false;
}

const cache = new Map();
async function localize(url, dir, prefix) {
  if (!isRemote(url)) return url || '';
  if (cache.has(url)) return cache.get(url);
  const ext = extOf(url);
  const name = `${prefix}-${hash(url)}.${ext}`;
  const dest = path.join(dir, name);
  const ok = await download(url, dest);
  const rel = ok ? `data/images/growth/genshin/${path.basename(dir)}/${name}` : '';
  cache.set(url, rel);
  return rel;
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
  const stats = { weapons: 0, materials: 0, failed: 0 };
  const weapons = data.weapons || [];

  async function localizeMats(mats) {
    for (const mat of mats || []) {
      const icon = await localize(mat.icon, MATERIAL_DIR, 'gs-mat');
      if (icon) {
        mat.icon = icon;
        stats.materials++;
      } else {
        delete mat.icon;
        stats.failed++;
      }
    }
  }

  await mapLimit(weapons, CONCURRENCY, async (weapon) => {
    const icon = await localize(weapon.avatar, WEAPON_DIR, 'gs-weapon');
    if (icon) {
      weapon.avatar = icon;
      stats.weapons++;
    } else {
      weapon.avatar = '';
      stats.failed++;
    }
    await localizeMats(weapon.total);
    for (const phase of weapon.ascensions || []) await localizeMats(phase.materials);
  });

  fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`完成：武器图标 ${stats.weapons} 个，材料图标引用 ${stats.materials} 次，失败 ${stats.failed} 次`);
  console.log(`目录：${WEAPON_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
