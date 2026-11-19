#!/usr/bin/env node
/**
 * 把 data/*.json 里的远程活动图下载到 data/images/，并把字段改写为本地相对路径。
 * 同时处理 data/inbox/*.json 里抓取候选的 images（保存到 data/images/inbox/）。
 * 用法：node scripts/fetch-images.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DATA = path.join(ROOT, 'data');
const IMAGE_DIR = path.join(DATA, 'images');
const INBOX_IMAGE_DIR = path.join(IMAGE_DIR, 'inbox');
const GAMES = new Set(['genshin', 'hsr', 'zzz', 'endfield', 'arknights', 'wuwa']);

fs.mkdirSync(IMAGE_DIR, { recursive: true });

function hash(url) {
  return crypto.createHash('sha1').update(url).digest('hex').slice(0, 8);
}

function extOf(url, type) {
  const m = new URL(url).pathname.match(/\.(jpe?g|png|webp|gif)$/i);
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
  const host = new URL(url).host;
  const referer = host.includes('hycdn.cn') ? 'https://endfield.hypergryph.com/' : 'https://www.miyoushe.com/';
  const res = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36',
      referer
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (!buf.length) throw new Error('空文件');
  fs.writeFileSync(dest, buf);
  return true;
}

function localPath(name) {
  return 'data/images/' + name;
}

async function processEventImages(game, ev, stats) {
  const urls = [];
  if (isRemote(ev.image)) urls.push(ev.image);
  (ev.gallery || []).forEach((u) => { if (isRemote(u) && !urls.includes(u)) urls.push(u); });
  if (!urls.length) return;

  const saved = [];
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const ext = extOf(url);
    const name = `${game}-${ev.id}-${i + 1}-${hash(url)}.${ext}`;
    const dest = path.join(IMAGE_DIR, name);
    try {
      await download(url, dest);
      saved.push(localPath(name));
      stats.downloaded++;
    } catch (err) {
      console.warn(`  ! 下载失败 ${ev.id}: ${err.message}`);
      stats.failed++;
      saved.push(url);
    }
  }
  if (saved.length) {
    ev.image = saved[0];
    ev.gallery = saved;
  }
}

async function processInbox(file) {
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  const items = Array.isArray(raw) ? raw : (raw.candidates || raw.items || []);
  if (!items.length) return 0;
  let count = 0;
  fs.mkdirSync(INBOX_IMAGE_DIR, { recursive: true });
  for (const item of items) {
    const imgs = item.images || [];
    if (!imgs.length) continue;
    const local = [];
    for (let i = 0; i < imgs.length; i++) {
      const url = imgs[i];
      if (!isRemote(url)) { local.push(url); continue; }
      const ext = extOf(url);
      const name = `${item.game || 'unknown'}-${item.postId || hash(url)}-${i + 1}.${ext}`;
      const dest = path.join(INBOX_IMAGE_DIR, name);
      try {
        await download(url, dest);
        local.push('data/images/inbox/' + name);
        count++;
      } catch {
        local.push(url);
      }
    }
    item.localImages = local;
  }
  fs.writeFileSync(file, JSON.stringify(raw, null, 2) + '\n');
  return count;
}

async function main() {
  const stats = { downloaded: 0, failed: 0, events: 0 };
  for (const file of fs.readdirSync(DATA)) {
    if (!file.endsWith('.json')) continue;
    const game = file.replace(/\.json$/, '');
    if (!GAMES.has(game)) continue;
    const full = path.join(DATA, file);
    const data = JSON.parse(fs.readFileSync(full, 'utf8'));
    if (!Array.isArray(data.events)) continue;
    for (const ev of data.events) {
      const before = ev.image;
      await processEventImages(game, ev, stats);
      if (ev.image !== before) stats.events++;
    }
    fs.writeFileSync(full, JSON.stringify(data, null, 2) + '\n');
  }

  let inboxCount = 0;
  const inboxDir = path.join(DATA, 'inbox');
  if (fs.existsSync(inboxDir)) {
    for (const file of fs.readdirSync(inboxDir)) {
      if (!file.endsWith('.json')) continue;
      try { inboxCount += await processInbox(path.join(inboxDir, file)); }
      catch (err) { console.warn(`  ! inbox 处理失败 ${file}: ${err.message}`); }
    }
  }

  console.log(`完成：事件图 ${stats.events} 个、文件 ${stats.downloaded} 张，失败 ${stats.failed} 张，候选图 ${inboxCount} 张`);
  console.log(`目录：${IMAGE_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
