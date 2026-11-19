#!/usr/bin/env node
/**
 * 自动抓取官方公告列表，输出待人工/AI 审核的候选清单。
 * 用法：
 *   node scripts/fetch.mjs
 *   node scripts/fetch.mjs --game=genshin
 *   node scripts/fetch.mjs --print
 *
 * 输出：data/inbox/YYYY-MM-DD.json
 * 这里只负责「找公告」，不会直接改 data/<游戏>.json；确认后再改数据并运行 build。
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const INBOX_DIR = path.join(DATA_DIR, 'inbox');
const CONFIG_PATH = path.join(import.meta.dirname, 'sources.json');

const args = process.argv.slice(2);
const onlyGame = (args.find((a) => a.startsWith('--game=')) || '').split('=')[1] || '';
const printMode = args.includes('--print');

const KEYWORDS = /版本|更新|活动|祈愿|跃迁|频段|寻访|前瞻|兑换码|庆典|危机合约|赛季|复刻|签到|卡池|唤取/i;
const DATE_RE = /20\d{2}\s*[-/.年]\s*\d{1,2}\s*[-/.月]\s*\d{1,2}/;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36';

const config = JSON.parse(await fs.readFile(CONFIG_PATH, 'utf8'));
const sources = config.sources.filter((s) => s.enabled !== false && (!onlyGame || s.game === onlyGame));

function decodeEntities(text) {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(parseInt(num, 10)))
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");
}

function toText(html) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim();
}

function extractLinks(html, baseUrl) {
  const links = [];
  const re = /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = re.exec(html))) {
    const title = toText(match[2]);
    if (title.length < 4 || title.length > 90) continue;
    if (!KEYWORDS.test(title)) continue;
    let url;
    try {
      url = new URL(match[1], baseUrl).href;
    } catch {
      continue;
    }
    if (!/^https?:/i.test(url)) continue;
    const context = toText(html.slice(Math.max(0, match.index - 260), match.index + match[0].length + 260));
    const dateMatch = context.match(DATE_RE);
    links.push({ title, url, dateHint: dateMatch ? dateMatch[0] : '' });
  }
  return links;
}

/* 鹰角官网公告接口：明日方舟 / 终末地共用 */
async function fetchHypergryph(source, signal) {
  const api = `https://web-news.hypergryph.com/api/bulletin?lang=zh-cn&code=${source.code}&page=1&pageSize=20`;
  const res = await fetch(api, {
    signal,
    headers: { 'user-agent': UA, accept: 'application/json' }
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (json.code !== 0) throw new Error(json.msg || `code ${json.code}`);

  const list = (json.data && json.data.list) || [];
  const links = list.map((item) => {
    const cid = String(item.cid || '');
    const url = source.code === 'endfield_web'
      ? `https://endfield.hypergryph.com/news/${cid}`
      : `https://ak.hypergryph.com/news/${cid.padStart(4, '0')}`;
    return {
      title: item.title || '',
      url,
      dateHint: item.displayTime
        ? new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(new Date(Number(item.displayTime) * 1000))
        : '',
      content: String(item.brief || '').slice(0, 2000),
      images: item.cover ? [item.cover] : []
    };
  }).filter((p) => p.title && KEYWORDS.test(p.title));

  return { source, status: res.status, bytes: JSON.stringify(json).length, links, error: '' };
}

/* 库街区：需要登录 token；未配置时跳过，不视为抓取失败 */
async function fetchKurobbs(source, signal) {
  const token = process.env.KUROBBS_TOKEN;
  const uid = process.env.KUROBBS_UID || '';
  if (!token) {
    return {
      source,
      status: 0,
      bytes: 0,
      links: [],
      error: '未配置 KUROBBS_TOKEN，已跳过（可配置后启用自动抓取）',
      skipped: true
    };
  }

  const res = await fetch('https://api.kurobbs.com/forum/companyEvent/findEventList', {
    method: 'POST',
    signal,
    headers: {
      'user-agent': UA,
      'content-type': 'application/json',
      accept: 'application/json',
      token,
      uid
    },
    body: JSON.stringify({
      pageSize: 20,
      gameId: source.gameId,
      pageNo: 1,
      eventType: source.eventType || 1
    })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (json.code !== 200 && json.code !== 0) throw new Error(json.msg || `code ${json.code}`);

  const list = (json.data && json.data.list) || [];
  const links = list.map((item) => {
    const ts = Number(item.publishTime);
    return {
      title: item.postTitle || '',
      url: `https://www.kurobbs.com/mc/post/${item.postId}`,
      dateHint: ts
        ? new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(new Date(ts < 1e12 ? ts * 1000 : ts))
        : '',
      content: String(item.brief || '').slice(0, 2000),
      images: item.coverUrl ? [item.coverUrl] : []
    };
  }).filter((p) => p.title && KEYWORDS.test(p.title));

  return { source, status: res.status, bytes: JSON.stringify(json).length, links, error: '' };
}

/* 米游社官方论坛：直接读官方账号发布的帖子 */
async function fetchMiyoushe(source, signal) {
  const api = `https://bbs-api.miyoushe.com/post/wapi/getForumPostList?forum_id=${source.forumId}&is_good=true&is_hot=false&page_size=20`;
  const res = await fetch(api, {
    signal,
    headers: { 'user-agent': UA, accept: 'application/json' }
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (json.retcode !== 0) throw new Error(json.message || `retcode ${json.retcode}`);

  const list = (json.data && json.data.list) || [];
  const authors = source.officialAuthors || [];
  let picked = authors.length
    ? list.filter((item) => authors.includes(item.user && item.user.nickname))
    : list;
  if (!picked.length) {
    picked = list.filter((item) =>
      /公告|版本更新|活动预告|限定寻访|祈愿|跃迁|频段|前瞻|兑换码/.test((item.post && item.post.subject) || '')
    );
  }

  const links = picked.map((item) => {
    const post = item.post || {};
    return {
      title: post.subject || '',
      url: `https://www.miyoushe.com/${source.path}/article/${post.post_id}`,
      dateHint: post.created_at
        ? new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(new Date(Number(post.created_at) * 1000))
        : '',
      content: String(post.content || '').slice(0, 2000),
      images: (post.images || []).slice(0, 3)
    };
  }).filter((p) => p.title && KEYWORDS.test(p.title));

  return {
    source,
    status: res.status,
    bytes: JSON.stringify(json).length,
    links,
    error: ''
  };
}

async function fetchSource(source) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    if (source.mode === 'miyoushe') {
      return await fetchMiyoushe(source, controller.signal);
    }
    if (source.mode === 'hypergryph') {
      return await fetchHypergryph(source, controller.signal);
    }
    if (source.mode === 'kurobbs') {
      return await fetchKurobbs(source, controller.signal);
    }
    const res = await fetch(source.url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': UA,
        accept: 'text/html,application/xhtml+xml'
      }
    });
    const html = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const links = extractLinks(html, source.url);
    return {
      source,
      status: res.status,
      bytes: Buffer.byteLength(html),
      links,
      error: ''
    };
  } catch (err) {
    return {
      source,
      status: 0,
      bytes: 0,
      links: [],
      error: err.name === 'AbortError' ? '请求超时（15s）' : err.message
    };
  } finally {
    clearTimeout(timer);
  }
}

const results = [];
for (const source of sources) {
  process.stdout.write(`抓取 ${source.name} ... `);
  const result = await fetchSource(source);
  results.push(result);
  console.log(result.error
    ? (result.skipped ? `跳过：${result.error}` : `失败：${result.error}`)
    : `数据 ${result.bytes} 字节，候选 ${result.links.length} 条`);
}

const seen = new Set();
const candidates = [];
for (const result of results) {
  for (const link of result.links) {
    if (seen.has(link.url)) continue;
    seen.add(link.url);
    candidates.push({
      game: result.source.game,
      source: result.source.name,
      title: link.title,
      url: link.url,
      dateHint: link.dateHint,
      content: link.content || '',
      images: link.images || []
    });
  }
}

await fs.mkdir(INBOX_DIR, { recursive: true });
const day = new Date();
const stamp = day.getFullYear() + '-' + String(day.getMonth() + 1).padStart(2, '0') + '-' + String(day.getDate()).padStart(2, '0');
const outFile = path.join(INBOX_DIR, stamp + '.json');
const report = {
  fetchedAt: new Date().toISOString(),
  total: candidates.length,
  sources: results.map((r) => ({
    game: r.source.game,
    name: r.source.name,
    url: r.source.url,
    status: r.status,
    bytes: r.bytes,
    candidates: r.links.length,
    skipped: !!r.skipped,
    error: r.error
  })),
  candidates
};
await fs.writeFile(outFile, JSON.stringify(report, null, 2) + '\n', 'utf8');

console.log('');
console.log(`已写入 ${path.relative(ROOT, outFile)}，共 ${candidates.length} 条候选`);
for (const item of report.sources) {
  console.log(`- ${item.name}: ${item.skipped
    ? '跳过 ' + item.error
    : (item.error ? '失败 ' + item.error : item.candidates + ' 条')}`);
}

if (printMode) {
  console.log('');
  for (const c of candidates) {
    console.log(`[${c.game}] ${c.title} ${c.dateHint ? '(' + c.dateHint + ')' : ''}`);
    console.log('  ' + c.url);
  }
}
