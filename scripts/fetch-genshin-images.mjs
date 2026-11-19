#!/usr/bin/env node
/**
 * 为 data/growth/genshin.json 下载角色头像与材料图标，并改写为本地路径。
 * 用法：node scripts/fetch-genshin-images.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = path.resolve(import.meta.dirname, '..');
const JSON_PATH = path.join(ROOT, 'data', 'growth', 'genshin.json');
const IMG_ROOT = path.join(ROOT, 'data', 'images', 'growth', 'genshin');
const AVATAR_DIR = path.join(IMG_ROOT, 'avatars');
const MATERIAL_DIR = path.join(IMG_ROOT, 'materials');
const TALENT_DIR = path.join(IMG_ROOT, 'talents');
const UA = 'GameCalendarGrowth/1.0 (local; miyoushe obc)';
const CONCURRENCY = 6;

fs.mkdirSync(AVATAR_DIR, { recursive: true });
fs.mkdirSync(MATERIAL_DIR, { recursive: true });
fs.mkdirSync(TALENT_DIR, { recursive: true });

const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));

function hash(s) {
  return crypto.createHash('sha1').update(s).digest('hex').slice(0, 10);
}
function extOf(url, type) {
  const m = String(url).match(/\.(png|jpe?g|webp|gif)(?:\?|$)/i);
  if (m) return m[1].toLowerCase().replace('jpeg', 'jpg');
  if (type && type.includes('png')) return 'png';
  if (type && type.includes('webp')) return 'webp';
  return 'jpg';
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
  const stats = { avatars: 0, materials: 0, talents: 0, failed: 0 };
  const operators = data.operators || [];

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

  await mapLimit(operators, CONCURRENCY, async (op) => {
    const local = await localize(op.avatar, AVATAR_DIR, 'gs-avatar');
    if (local) {
      op.avatar = local;
      stats.avatars++;
    } else {
      op.avatar = '';
      stats.failed++;
    }
    await localizeMats(op.ascension);
    for (const phase of op.ascensions || []) await localizeMats(phase.materials);
    for (const talent of op.talents || []) {
      const talentIcon = await localize(talent.icon, TALENT_DIR, 'gs-talent');
      if (talentIcon) {
        talent.icon = talentIcon;
        stats.talents++;
      } else {
        delete talent.icon;
        stats.failed++;
      }
      await localizeMats(talent.materials);
      for (const level of talent.levels || []) await localizeMats(level.materials);
    }
  });

  fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`完成：头像 ${stats.avatars} 个，天赋图标 ${stats.talents} 个，材料图标引用 ${stats.materials} 次，失败 ${stats.failed} 次`);
  console.log(`目录：${IMG_ROOT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
