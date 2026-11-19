(function () {
  'use strict';

  var DAY = 86400000;
  var MONTH_EN = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  var MONTH_TINTS = [
    '#7c9dff', '#b388ff', '#ff9ec4', '#ffb27a', '#ffd166', '#8ee08a',
    '#4fd9a8', '#4ec9ff', '#7aa2ff', '#ffa94d', '#a48cff', '#5ad1e6'
  ];
  var WEEK_CN = ['日', '一', '二', '三', '四', '五', '六'];
  var TYPE_ORDER = { preview: 0, banner: 1, version: 2, event: 3 };

  /* 类型图标：版本 = 立方体，卡池 = 星，活动 = 星光，前瞻 = 屏幕播放 */
  var TYPE_ICONS = {
    version: '<svg viewBox="0 0 16 16"><path d="M8 1.8 13.8 5v6L8 14.2 2.2 11V5L8 1.8Z"/><path d="M2.2 5 8 8.2 13.8 5M8 8.2v6"/></svg>',
    banner: '<svg viewBox="0 0 16 16"><path d="M8 1.7l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.5l-3.8 2 .7-4.3-3.1-3 4.3-.6L8 1.7Z" fill="currentColor" stroke="none"/></svg>',
    event: '<svg viewBox="0 0 16 16"><path d="M8 1.8l.9 2.5 2.5.9-2.5.9L8 8.6l-.9-2.5-2.5-.9 2.5-.9L8 1.8Z" fill="currentColor" stroke="none"/><path d="M12.4 8.9l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6.6-1.6Z" fill="currentColor" stroke="none"/><path d="M4.1 8.5l.5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5.5-1.3Z" fill="currentColor" stroke="none"/></svg>',
    preview: '<svg viewBox="0 0 16 16"><rect x="1.8" y="2.9" width="12.4" height="8.5" rx="1.7"/><path d="M6.6 5.5l3.1 1.9-3.1 1.9V5.5Z" fill="currentColor" stroke="none"/><path d="M5.6 13.8h4.8"/></svg>'
  };

  /* 起止标记：开始 = 播放圆点，结束 = 旗帜，单日 = 菱形 */
  var MARK_ICONS = {
    start: '<svg viewBox="0 0 12 12"><circle cx="6" cy="6" r="4.5"/><path d="M5 4.2 7.7 6 5 7.8V4.2Z" fill="currentColor" stroke="none"/></svg>',
    end: '<svg viewBox="0 0 12 12"><path d="M3.2 10.6V1.6"/><path d="M3.2 2.2h5.5L7.6 4.2l1.1 2H3.2"/></svg>',
    single: '<svg viewBox="0 0 12 12"><path d="M6 1.6 10.4 6 6 10.4 1.6 6 6 1.6Z" fill="currentColor" stroke="none"/></svg>'
  };

  function typeIcon(type) {
    return '<i class="ticon">' + (TYPE_ICONS[type] || TYPE_ICONS.event) + '</i>';
  }
  function typeBadge(type) {
    return '<span class="tbadge">' + typeIcon(type) + TYPES[type].label + '</span>';
  }

  var gameMap = {};
  GAMES.forEach(function (g) { gameMap[g.id] = g; });

  /* ---------------- local data layer（兜底：浏览器内改数据） ---------------- */
  var BASE_EVENTS = (typeof EVENTS !== 'undefined' ? EVENTS : []).slice();
  var LOCAL_KEY = 'game-calendar-local-v1';
  var ARCHIVE_KEY = 'game-calendar-code-archive-v1';
  var local = loadLocal();
  var codeArchive = loadCodeArchive();
  var allEvents = [];
  rebuildEvents();

  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
  function loadLocal() {
    try {
      var raw = localStorage.getItem(LOCAL_KEY);
      if (!raw) return { added: [], updated: {}, removed: [] };
      var d = JSON.parse(raw);
      return {
        added: Array.isArray(d.added) ? d.added : [],
        updated: (d.updated && typeof d.updated === 'object') ? d.updated : {},
        removed: Array.isArray(d.removed) ? d.removed : []
      };
    } catch (err) {
      return { added: [], updated: {}, removed: [] };
    }
  }
  function saveLocal() {
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(local)); } catch (err) { /* 隐私模式写入失败时静默 */ }
  }
  function rebuildEvents() {
    var removed = {};
    local.removed.forEach(function (id) { removed[id] = true; });
    var out = [];
    BASE_EVENTS.forEach(function (e) {
      if (removed[e.id]) return;
      out.push(clone(local.updated[e.id] || e));
    });
    local.added.forEach(function (e) {
      out.push(clone(e));
    });
    allEvents = out;
  }
  function localDirty() {
    return local.added.length > 0 || local.removed.length > 0 || Object.keys(local.updated).length > 0;
  }
  function allCodes() {
    var out = [];
    allEvents.forEach(function (e) {
      (e.codes || []).forEach(function (c) {
        out.push({
          game: e.game,
          eventId: e.id,
          label: c.label || (TYPES[e.type] || TYPES.event).label,
          code: c.code,
          reward: c.reward,
          expires: c.expires || null
        });
      });
    });
    return out;
  }

  function loadCodeArchive() {
    try {
      var raw = localStorage.getItem(ARCHIVE_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (err) {
      return [];
    }
  }
  function saveCodeArchive() {
    try { localStorage.setItem(ARCHIVE_KEY, JSON.stringify(codeArchive)); } catch (err) { /* 隐私模式忽略 */ }
  }
  /* 把带有效期的兑换码快照到本地：即使数据源后续删除，过期后仍能在存档中找到 */
  function syncCodeArchive() {
    var current = {};
    allCodes().forEach(function (c) {
      if (c.expires) current[c.game + '|' + c.code] = c;
    });
    var seen = {};
    var changed = false;

    codeArchive.forEach(function (a) {
      var key = a.game + '|' + a.code;
      seen[key] = true;
      var cur = current[key];
      if (!cur) return;
      if (a.reward !== cur.reward || a.label !== cur.label || a.expires !== cur.expires) {
        a.reward = cur.reward;
        a.label = cur.label;
        a.expires = cur.expires;
        changed = true;
      }
      var ev = null;
      for (var i = 0; i < allEvents.length; i++) {
        if (allEvents[i].id === cur.eventId) { ev = allEvents[i]; break; }
      }
      if (ev && a.eventTitle !== ev.title) { a.eventTitle = ev.title; changed = true; }
    });

    Object.keys(current).forEach(function (key) {
      if (seen[key]) return;
      var c = current[key];
      var ev = null;
      for (var i = 0; i < allEvents.length; i++) {
        if (allEvents[i].id === c.eventId) { ev = allEvents[i]; break; }
      }
      codeArchive.push({
        game: c.game,
        code: c.code,
        label: c.label,
        reward: c.reward,
        expires: c.expires,
        eventTitle: ev ? ev.title : '',
        archivedAt: new Date().toISOString()
      });
      changed = true;
    });

    if (codeArchive.length > 400) {
      codeArchive.sort(function (a, b) { return new Date(a.expires) - new Date(b.expires); });
      codeArchive = codeArchive.slice(-400);
      changed = true;
    }
    if (changed) saveCodeArchive();
  }

  var now = new Date();
  var state = {
    year: now.getFullYear(),
    month: now.getMonth(),
    dir: 0,
    games: new Set(GAMES.map(function (g) { return g.id; })),
    type: 'all',
    view: 'month',
    sideTab: 'ongoing'
  };

  /* ---------------- utils ---------------- */
  function startOfDay(d) {
    var x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }
  function addDays(d, n) {
    var x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
  }
  function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function fmtMD(d) { return (d.getMonth() + 1) + '/' + d.getDate(); }
  function fmtHM(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function fmtFull(d) {
    return d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate()) + ' ' + fmtHM(d);
  }
  function dayKey(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function rgba(hex, a) {
    var h = hex.replace('#', '');
    var r = parseInt(h.slice(0, 2), 16);
    var g = parseInt(h.slice(2, 4), 16);
    var b = parseInt(h.slice(4, 6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }
  function rangeText(e) {
    var s = new Date(e.start);
    if (!e.end) return fmtMD(s) + ' ' + fmtHM(s) + ' 起 · 持续中';
    var en = new Date(e.end);
    var prefixS = s.getFullYear() !== en.getFullYear() ? s.getFullYear() + '/' : '';
    var prefixE = s.getFullYear() !== en.getFullYear() ? en.getFullYear() + '/' : '';
    return prefixS + fmtMD(s) + ' ' + fmtHM(s) + ' → ' + prefixE + fmtMD(en) + ' ' + fmtHM(en);
  }

  /* ---------------- filters / data ---------------- */
  function visibleEvents() {
    return allEvents.filter(function (e) {
      return state.games.has(e.game) && (state.type === 'all' || e.type === state.type);
    });
  }
  function isOngoing(e, t) {
    var s = new Date(e.start);
    var en = e.end ? new Date(e.end) : null;
    return s <= t && (!en || en >= t);
  }
  function isUpcoming(e, t) {
    return new Date(e.start) > t;
  }
  function activeOn(e, day) {
    var s = startOfDay(new Date(e.start));
    var en = e.end ? startOfDay(new Date(e.end)) : null;
    return s <= day && (!en || en >= day);
  }

  /* ---------------- render: filters ---------------- */
  function renderFilters() {
    var allOn = state.games.size === GAMES.length;
    var gameHTML = '<span class="group-label">游戏</span>' +
      '<button class="chip-btn plain' + (allOn ? ' on' : '') + '" data-game="all">全部</button>' +
      GAMES.map(function (g) {
        var on = state.games.has(g.id);
        return '<button class="chip-btn' + (on ? ' on' : '') + '" style="--c:' + g.color + '" data-game="' + g.id + '">' +
          '<i class="gdot"></i>' + esc(g.short) + '</button>';
      }).join('');
    document.getElementById('gameFilter').innerHTML = gameHTML;

    var types = [
      { id: 'all', label: '全部' },
      { id: 'version', label: '版本' },
      { id: 'banner', label: '卡池' },
      { id: 'event', label: '活动' },
      { id: 'preview', label: '前瞻' }
    ];
    document.getElementById('typeFilter').innerHTML =
      '<span class="group-label">类型</span>' +
      types.map(function (t) {
        var ico = t.id === 'all' ? '' : typeIcon(t.id);
        return '<button class="chip-btn plain' + (state.type === t.id ? ' on' : '') + '" data-type="' + t.id + '">' + ico + t.label + '</button>';
      }).join('');
  }

  /* ---------------- render: month ---------------- */
  function renderMonthStrip() {
    var el = document.getElementById('monthStrip');
    if (!el) return;
    var base = state.year * 12 + state.month;
    var thisYear = new Date().getFullYear();
    var html = '';
    for (var d = -2; d <= 2; d++) {
      var idx = base + d;
      var y = Math.floor(idx / 12);
      var m = ((idx % 12) + 12) % 12;
      var tint = MONTH_TINTS[m];
      var active = d === 0;
      var hasEvents = allEvents.some(function (e) {
        var s = new Date(e.start);
        return s.getFullYear() === y && s.getMonth() === m;
      });
      var label = (y !== thisYear ? y + '年' : '') + (m + 1) + '月';
      html += '<button class="mstrip-btn' + (active ? ' on' : '') + '" style="--mc:' + tint + '"' +
        ' data-y="' + y + '" data-m="' + m + '" title="' + y + '年' + (m + 1) + '月">' +
        (hasEvents ? '<i class="mstrip-dot"></i>' : '') + label + '</button>';
    }
    html += '<span class="mstrip-hint">滚轮切换月份</span>';
    el.innerHTML = html;
  }

  function milestonesOn(evs, day) {
    return evs.filter(function (e) {
      var s = startOfDay(new Date(e.start));
      var en = e.end ? startOfDay(new Date(e.end)) : null;
      return sameDay(s, day) || (en && sameDay(en, day));
    }).sort(function (a, b) {
      return (TYPE_ORDER[a.type] - TYPE_ORDER[b.type]) || (new Date(a.start) - new Date(b.start));
    });
  }

  function chipHTML(e, day) {
    var g = gameMap[e.game];
    var isStart = sameDay(new Date(e.start), day);
    var isEnd = e.end ? sameDay(new Date(e.end), day) : false;
    var marker = isStart && isEnd ? 'single' : (isStart ? 'start' : (isEnd ? 'end' : ''));
    var markerText = marker === 'single' ? '单日' : (marker === 'start' ? '开始' : '结束');
    return '<button class="mchip" style="--c:' + g.color + ';--cbg:' + rgba(g.color, .15) + '"' +
      ' data-id="' + e.id + '"' +
      ' title="' + esc(g.name + ' · ' + e.title + '（' + rangeText(e) + '）') + '">' +
      typeIcon(e.type) +
      '<span class="txt">' + esc(e.title) + '</span>' +
      (marker ? '<em class="edge" title="' + markerText + '" aria-label="' + markerText + '">' + MARK_ICONS[marker] + '</em>' : '') +
      '</button>';
  }

  function renderMonth() {
    var y = state.year, m = state.month;
    var first = new Date(y, m, 1);
    var offset = (first.getDay() + 6) % 7;
    var gridStart = addDays(first, -offset);
    var last = new Date(y, m + 1, 0);
    var tail = (last.getDay() + 6) % 7;
    var gridEnd = addDays(last, 6 - tail);
    var today = startOfDay(new Date());
    var evs = visibleEvents();
    var html = '';
    var cursor = new Date(gridStart);

    while (cursor <= gridEnd) {
      html += '<div class="week">';
      for (var i = 0; i < 7; i++) {
        var day = addDays(cursor, i);
        var out = day.getMonth() !== m;
        var isToday = sameDay(day, today);
        var items = milestonesOn(evs, day);
        var shown = items.slice(0, 4);
        html += '<div class="day' + (out ? ' out' : '') + (isToday ? ' today' : '') + '" data-day="' + dayKey(day) + '">' +
          '<div class="daynum"><b>' + day.getDate() + '</b>' +
          (isToday ? '<em class="today-tag">今天</em>' : '') + '</div>' +
          shown.map(function (e) { return chipHTML(e, day); }).join('') +
          (items.length > 4 ? '<div class="more">+' + (items.length - 4) + ' 项</div>' : '') +
          '</div>';
      }
      html += '</div>';
      cursor = addDays(cursor, 7);
    }
    document.getElementById('weeks').innerHTML = html;
  }

  /* ---------------- render: lane（跨月连续时间轴） ---------------- */
  function renderLane() {
    var y = state.year, m = state.month;
    var rangeStart = startOfDay(new Date(y, m - 2, 1));
    var rangeEnd = startOfDay(new Date(y, m + 3, 0));
    var rangeEndExclusive = addDays(rangeEnd, 1);
    var totalDays = Math.round((rangeEndExclusive - rangeStart) / DAY);
    var today = startOfDay(new Date());
    var todayIdx = Math.round((today - rangeStart) / DAY);
    state._laneStart = rangeStart;
    state._laneDays = totalDays;
    state._laneVisible = null;

    var evs = visibleEvents().filter(function (e) {
      var s = new Date(e.start);
      var en = e.end ? new Date(e.end) : rangeEnd;
      return s < rangeEndExclusive && en >= rangeStart;
    });

    var daysHTML = '';
    for (var i = 0; i < totalDays; i++) {
      var day = addDays(rangeStart, i);
      var dow = day.getDay();
      var cls = (dow === 0 || dow === 6 ? 'we' : '') +
        (sameDay(day, today) ? ' today' : '') +
        (day.getDate() === 1 ? ' month-first' : '');
      daysHTML += '<div class="' + cls.trim() + '">' + day.getDate() + '</div>';
    }

    var monthSegs = [];
    var cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
    while (cursor <= rangeEnd) {
      var yy = cursor.getFullYear();
      var mm = cursor.getMonth();
      monthSegs.push({
        y: yy,
        m: mm,
        days: new Date(yy, mm + 1, 0).getDate(),
        start: Math.round((cursor - rangeStart) / DAY),
        tint: MONTH_TINTS[mm]
      });
      cursor = new Date(yy, mm + 1, 1);
    }
    var monthsHTML = monthSegs.map(function (s) {
      return '<div class="lane-month-seg" style="grid-column:' + (s.start + 1) + ' / span ' + s.days +
        ';--mc:' + s.tint + ';background:' + rgba(s.tint, .08) + '">' +
        s.y + '年' + (s.m + 1) + '月</div>';
    }).join('');

    var bandStops = [];
    monthSegs.forEach(function (s) {
      var a = (s.start / totalDays) * 100;
      var b = ((s.start + s.days) / totalDays) * 100;
      bandStops.push(rgba(s.tint, .06) + ' ' + a + '%', rgba(s.tint, .06) + ' ' + b + '%');
    });
    var monthBand = 'linear-gradient(90deg,' + bandStops.join(',') + ')';

    var rows = '';
    GAMES.forEach(function (g) {
      if (!state.games.has(g.id)) return;
      var list = evs.filter(function (e) { return e.game === g.id; });
      var laneEnds = [];
      var placed = [];
      list.sort(function (a, b) { return new Date(a.start) - new Date(b.start); });

      list.forEach(function (e) {
        var s = new Date(e.start);
        var en = e.end ? new Date(e.end) : rangeEnd;
        var col0 = Math.max(0, Math.round((startOfDay(s) - rangeStart) / DAY));
        var col1 = Math.min(totalDays - 1, Math.round((startOfDay(en) - rangeStart) / DAY));
        var lane = -1;
        for (var i = 0; i < laneEnds.length; i++) {
          if (laneEnds[i] < col0) { lane = i; break; }
        }
        if (lane === -1) { lane = laneEnds.length; laneEnds.push(0); }
        laneEnds[lane] = col1 + 1;
        placed.push({
          e: e, col0: col0, col1: col1, lane: lane,
          clipL: s < rangeStart,
          clipR: !e.end || new Date(e.end) > rangeEnd
        });
      });

      var laneCount = Math.max(1, laneEnds.length);
      var trackHeight = laneCount * 26 + 10;
      var todayLine = (todayIdx >= 0 && todayIdx < totalDays)
        ? '<i class="lane-today" style="left:' + (((todayIdx + 0.5) / totalDays) * 100) + '%"></i>'
        : '';

      var bars = placed.map(function (p) {
        var e = p.e;
        var g2 = gameMap[e.game];
        var left = (p.col0 / totalDays) * 100;
        var width = ((p.col1 - p.col0 + 1) / totalDays) * 100;
        var top = 5 + p.lane * 26;
        var cls = 'lane-bar' + (p.clipL ? ' clip-l' : '') + (p.clipR ? ' clip-r' : '');
        return '<button class="' + cls + '" style="left:' + left + '%;width:' + width + '%;top:' + top + 'px;--c:' + g2.color + ';--cbg:' + rgba(g2.color, .2) + '"' +
          ' data-id="' + e.id + '" title="' + esc(g2.name + ' · ' + e.title + '（' + rangeText(e) + '）') + '">' +
          typeIcon(e.type) + '<span class="txt">' + esc(e.title) + '</span>' +
          (p.clipR ? '<span class="arr">›</span>' : '') +
          '</button>';
      }).join('');

      var empty = list.length === 0 ? '<div class="lane-empty-sm">该时段无行程</div>' : '';
      rows += '<div class="lane-row">' +
        '<div class="lane-label" style="--c:' + g.color + '"><i></i><span>' + esc(g.short) +
        '<small>' + list.length + ' 项行程</small></span></div>' +
        '<div class="lane-track" style="--n:' + totalDays + ';height:' + Math.max(44, trackHeight) + 'px;--band:' + monthBand + '">' +
        todayLine + empty + bars + '</div>' +
        '</div>';
    });

    var html = '<div class="lane-topbar">' +
      '<span class="lane-topbar-label">横向拖动</span>' +
      '<div class="lane-scrollbar" id="laneScrollbar"><div class="lane-scrollbar-thumb" id="laneScrollThumb"></div></div>' +
      '</div>' +
      '<div class="lane-scroll" id="laneScroll">' +
      '<div class="lane-canvas" style="--days:' + totalDays + '">' +
      '<div class="lane-head">' +
      '<div class="lane-head-label"><span>' + y + '年' + (m + 1) + '月</span><small>游戏 / 日期</small></div>' +
      '<div class="lane-head-main">' +
      '<div class="lane-months" style="grid-template-columns:repeat(' + totalDays + ',1fr)">' + monthsHTML + '</div>' +
      '<div class="lane-days" style="grid-template-columns:repeat(' + totalDays + ',1fr)">' + daysHTML + '</div>' +
      '</div></div>' +
      rows +
      '</div></div>';

    document.getElementById('laneView').innerHTML = html;

    var anchorIdx = Math.round((new Date(y, m, 1) - rangeStart) / DAY);
    var scroll = document.getElementById('laneScroll');
    if (scroll) {
      scroll.scrollLeft = Math.max(0, anchorIdx * 13);
    }
    initLaneTopbar();
  }

  /* ---------------- render: sidebar ---------------- */
  function remainText(end, t) {
    if (sameDay(end, t)) return '今天结束';
    var d = Math.ceil((end - t) / DAY);
    return d <= 0 ? '已结束' : '剩余 ' + d + ' 天';
  }
  function countdownText(start, t) {
    if (sameDay(start, t)) return '今天开始';
    var d = Math.ceil((start - t) / DAY);
    return d <= 0 ? '即将开始' : d + ' 天后';
  }

  function evCardHTML(e, t) {
    var g = gameMap[e.game];
    var s = new Date(e.start);
    var en = e.end ? new Date(e.end) : null;
    var ongoing = isOngoing(e, t);
    var imgCount = (e.gallery && e.gallery.length) ? e.gallery.length : (e.image ? 1 : 0);
    var metaLeft, metaRight, progress = '';

    if (ongoing) {
      if (en) {
        var pct = Math.max(2, Math.min(100, ((t - s) / (en - s)) * 100));
        metaLeft = '结束 ' + fmtMD(en) + ' ' + fmtHM(en);
        metaRight = remainText(en, t);
        progress = '<div class="progress" style="--c:' + g.color + '"><i style="width:' + pct.toFixed(1) + '%"></i></div>';
      } else {
        metaLeft = '持续至版本更新';
        metaRight = '持续中';
        progress = '<div class="progress open" style="--c:' + g.color + '"><i></i></div>';
      }
    } else {
      metaLeft = '开始 ' + fmtMD(s) + ' ' + fmtHM(s);
      metaRight = countdownText(s, t);
    }

    return '<button class="ev-card" data-id="' + e.id + '">' +
      '<div class="ev-top">' +
      '<span class="gtag" style="--c:' + g.color + '"><i></i>' + esc(g.short) + '</span>' +
      '<span class="ev-tags">' + typeBadge(e.type) +
      (imgCount ? '<span class="img-chip">图 ' + imgCount + '</span>' : '') + '</span>' +
      '</div>' +
      '<h4>' + esc(e.title) + (e.subtitle ? '<small>' + esc(e.subtitle) + '</small>' : '') + '</h4>' +
      '<div class="ev-meta"><span class="left">' + metaLeft + '</span>' +
      '<span class="rest' + (ongoing ? ' live' : '') + '">' + metaRight + '</span></div>' +
      progress +
      '</button>';
  }

  function codeCardHTML(c) {
    var g = gameMap[c.game];
    var active = !c.expires || new Date(c.expires) > new Date();
    var expiry = c.expires
      ? '有效期至 ' + fmtMD(new Date(c.expires)) + ' ' + fmtHM(new Date(c.expires))
      : '长期有效';
    return '<div class="code-card">' +
      '<div class="code-top">' +
      '<span class="gtag" style="--c:' + g.color + '"><i></i>' + esc(g.short) + ' · ' + esc(c.label) + '</span>' +
      '<span class="status ' + (active ? 'ok' : 'off') + '">' + (active ? '有效' : '已过期') + '</span>' +
      '</div>' +
      '<div class="code-val"><span>' + esc(c.code) + '</span>' +
      '<button class="copy" data-copy="' + esc(c.code) + '">复制</button></div>' +
      '<div class="code-reward">' + esc(c.reward) + ' · ' + expiry +
      (c.eventTitle ? '<span class="code-from">' + esc(c.eventTitle) + '</span>' : '') + '</div>' +
      '</div>';
  }

  function renderSidebar() {
    var t = new Date();
    var body = document.getElementById('sideBody');
    var monthStart = new Date(state.year, state.month, 1);
    var monthEnd = new Date(state.year, state.month + 1, 0, 23, 59, 59, 999);
    var list = visibleEvents().filter(function (e) {
      var s = new Date(e.start);
      var en = e.end ? new Date(e.end) : null;
      return s <= monthEnd && (!en || en >= monthStart);
    });
    var monthLabel = (state.year !== t.getFullYear() ? state.year + '年' : '') + (state.month + 1) + '月';
    var ongoing = list.filter(function (e) { return isOngoing(e, t); }).sort(function (a, b) {
      var ea = a.end ? new Date(a.end).getTime() : Infinity;
      var eb = b.end ? new Date(b.end).getTime() : Infinity;
      if (ea === eb) return new Date(a.start) - new Date(b.start);
      return ea - eb;
    });
    var upcoming = list.filter(function (e) { return isUpcoming(e, t); }).sort(function (a, b) {
      return new Date(a.start) - new Date(b.start);
    });
    var codes = allCodes().filter(function (c) { return state.games.has(c.game); });
    var activeCodes = codes.filter(function (c) {
      return !c.expires || new Date(c.expires) > t;
    }).sort(function (a, b) {
      var ea = a.expires ? new Date(a.expires).getTime() : Infinity;
      var eb = b.expires ? new Date(b.expires).getTime() : Infinity;
      return ea - eb;
    });

    var currentKeys = {};
    codes.forEach(function (c) { currentKeys[c.game + '|' + c.code] = true; });
    var expiredCodes = codes.filter(function (c) {
      return c.expires && new Date(c.expires) <= t;
    });
    codeArchive.forEach(function (a) {
      if (!state.games.has(a.game)) return;
      if (currentKeys[a.game + '|' + a.code]) return;
      if (!a.expires || new Date(a.expires) > t) return;
      expiredCodes.push(a);
    });
    expiredCodes.sort(function (a, b) { return new Date(b.expires) - new Date(a.expires); });

    document.getElementById('tabOngoing').textContent = ongoing.length;
    document.getElementById('tabUpcoming').textContent = upcoming.length;

    document.querySelectorAll('.side-tab').forEach(function (btn) {
      btn.classList.toggle('on', btn.getAttribute('data-tab') === state.sideTab);
    });

    var title = document.getElementById('sideTitle');
    var count = document.getElementById('sideCount');

    if (state.sideTab === 'codes') {
      title.textContent = '兑换码';
      count.textContent = activeCodes.length + ' 可用 · ' + expiredCodes.length + ' 存档';
      var codesHTML = '<div class="code-group-title">可用兑换码<span>' + activeCodes.length + '</span></div>' +
        (activeCodes.length
          ? activeCodes.map(codeCardHTML).join('')
          : '<div class="side-empty" style="padding:14px 8px">暂无有效兑换码</div>');
      if (expiredCodes.length) {
        codesHTML += '<div class="archive-title">已过期存档<span>' + expiredCodes.length + '</span></div>' +
          expiredCodes.map(codeCardHTML).join('');
      }
      codesHTML += '<div class="code-hint">带有效期的兑换码会自动留档，过期后归入存档；即使数据源删除也不会丢。</div>';
      body.innerHTML = codesHTML;
      return;
    }

    if (state.sideTab === 'upcoming') {
      title.textContent = monthLabel + '即将开始';
      count.textContent = upcoming.length + ' 项';
      body.innerHTML = upcoming.length
        ? upcoming.map(function (e) { return evCardHTML(e, t); }).join('')
        : '<div class="side-empty">该月份没有即将开始的行程</div>';
      return;
    }

    title.textContent = monthLabel + '进行中';
    count.textContent = ongoing.length + ' 项';
    body.innerHTML = ongoing.length
      ? ongoing.map(function (e) { return evCardHTML(e, t); }).join('')
      : '<div class="side-empty">该月份没有进行中的行程</div>';
  }

  /* ---------------- modal ---------------- */
  var modal = document.getElementById('modal');
  var modalCard = document.getElementById('modalCard');

  function openModal(html, wide) {
    modalCard.className = 'modal-card' + (wide ? ' wide' : '');
    modalCard.innerHTML = html;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  function openEvent(id) {
    var e = allEvents.find(function (x) { return x.id === id; });
    if (!e) return;
    var g = gameMap[e.game];
    var s = new Date(e.start);
    var en = e.end ? new Date(e.end) : null;
    var t = new Date();
    var codes = e.codes || [];
    var duration = en ? Math.max(1, Math.round((en - s) / DAY)) : null;
    var progressLine = '';

    if (en) {
      if (s <= t && en >= t) {
        var passed = Math.max(0, Math.round((t - s) / DAY));
        var left = Math.max(0, Math.round((en - t) / DAY));
        progressLine = '共 ' + duration + ' 天 · 已进行 ' + passed + ' 天 · 剩余 ' + left + ' 天';
      } else {
        progressLine = '共 ' + duration + ' 天';
      }
    } else {
      progressLine = '官方未公布结束时间 · 持续中';
    }

    var bannersHTML = (e.banners && e.banners.length)
      ? '<div class="section-title">卡池 / 角色</div><div class="banner-chips">' +
        e.banners.map(function (b) {
          return '<span class="bchip">' + esc(b.name) + (b.tag ? '<small>' + esc(b.tag) + '</small>' : '') + '</span>';
        }).join('') + '</div>'
      : '';

    var codesHTML = codes.length
      ? '<div class="section-title">相关兑换码</div><div class="d-code-list">' +
        codes.map(function (c) {
          var active = !c.expires || new Date(c.expires) > t;
          var expiry = c.expires
            ? '有效期至 ' + fmtMD(new Date(c.expires)) + ' ' + fmtHM(new Date(c.expires))
            : '长期有效';
          return '<div class="code-card">' +
            '<div class="code-top"><span class="gtag" style="--c:' + g.color + '"><i></i>' + esc(c.label) + '</span>' +
            '<span class="status ' + (active ? 'ok' : 'off') + '">' + (active ? '有效' : '已过期') + '</span></div>' +
            '<div class="code-val"><span>' + esc(c.code) + '</span>' +
            '<button class="copy" data-copy="' + esc(c.code) + '">复制</button></div>' +
            '<div class="code-reward">' + esc(c.reward) + ' · ' + expiry + '</div>' +
            '</div>';
        }).join('') + '</div>'
      : '';

    var imgs = (e.gallery && e.gallery.length ? e.gallery : (e.image ? [e.image] : [])).filter(Boolean);
    var imagesHTML = imgs.length
      ? '<div class="section-title">官方活动图</div>' +
        '<a class="d-image" href="' + esc(imgs[0]) + '" target="_blank" rel="noopener" data-zoom="' + esc(imgs[0]) + '">' +
        '<img loading="lazy" referrerpolicy="no-referrer" src="' + esc(imgs[0]) + '" alt="官方活动图"></a>' +
        (imgs.length > 1
          ? '<div class="d-gallery">' + imgs.slice(1).map(function (url) {
            return '<a href="' + esc(url) + '" target="_blank" rel="noopener" data-zoom="' + esc(url) + '">' +
              '<img loading="lazy" referrerpolicy="no-referrer" src="' + esc(url) + '" alt="活动图"></a>';
          }).join('') + '</div>'
          : '') +
        '<div class="d-image-cap">点击图片放大查看 · 图源：官方公告</div>'
      : '';
    var detailsHTML = (e.details && e.details.length)
      ? '<div class="section-title">活动详情</div><ul class="d-bullets">' +
        e.details.map(function (line) { return '<li>' + esc(line) + '</li>'; }).join('') + '</ul>'
      : '';
    var rewardsHTML = e.rewards
      ? '<div class="section-title">主要奖励</div><div class="d-note">' + esc(e.rewards) + '</div>'
      : '';
    var requirementsHTML = e.requirements
      ? '<div class="section-title">参与条件</div><div class="d-note">' + esc(e.requirements) + '</div>'
      : '';

    var html = '<button class="modal-close" aria-label="关闭">×</button>' +
      '<div class="d-eyebrow">' +
      '<span class="gpill" style="--c:' + g.color + ';--cbg:' + rgba(g.color, .14) + '"><i></i>' + esc(g.name) + '</span>' +
      typeBadge(e.type) +
      '</div>' +
      '<h2 class="d-title">' + esc(e.title) + '</h2>' +
      (e.subtitle ? '<div class="d-sub">' + esc(e.subtitle) + '</div>' : '') +
      '<div class="d-times">' +
      '<div class="d-time"><label>开始</label><div>' + fmtFull(s) + '<small>周' + WEEK_CN[s.getDay()] + '</small></div></div>' +
      '<div class="d-time"><label>结束</label><div>' +
      (en ? fmtFull(en) + '<small>周' + WEEK_CN[en.getDay()] + '</small>' : '<span style="color:#7fe3b4">持续中</span>') +
      '</div></div>' +
      '</div>' +
      '<div class="d-count">' + progressLine + '</div>' +
      imagesHTML +
      detailsHTML +
      rewardsHTML +
      requirementsHTML +
      bannersHTML +
      codesHTML +
      (e.note ? '<div class="section-title">备注</div><div class="d-note">' + esc(e.note) + '</div>' : '') +
      (e.source ? '<a class="d-source" href="' + esc(e.source) + '" target="_blank" rel="noopener">查看官方公告 ↗</a>' : '');

    openModal(html);
  }

  function openDay(key) {
    var parts = key.split('-');
    var day = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    var evs = visibleEvents().filter(function (e) { return activeOn(e, day); })
      .sort(function (a, b) { return new Date(a.start) - new Date(b.start); });

    var listHTML = evs.length
      ? '<div class="day-list">' + evs.map(function (e) {
        var g = gameMap[e.game];
        var s = new Date(e.start);
        var en = e.end ? new Date(e.end) : null;
        var isStart = sameDay(s, day);
        var isEnd = en ? sameDay(en, day) : false;
        var edge = isStart && isEnd ? '单日' : (isStart ? '开始' : (isEnd ? '结束' : '进行中'));
        return '<div class="day-item" style="--c:' + g.color + '" data-id="' + e.id + '">' +
          '<i></i><div class="di-main"><b>' + esc(e.title) + '</b>' +
          '<span>' + esc(g.short) + ' · ' + edge + ' · ' + rangeText(e) + '</span></div>' +
          '<span class="di-type">' + typeIcon(e.type) + TYPES[e.type].label + '</span></div>';
      }).join('') + '</div>'
      : '<div class="side-empty">这一天没有安排，休息一下吧</div>';

    var html = '<button class="modal-close" aria-label="关闭">×</button>' +
      '<div class="d-eyebrow"><span class="tbadge">当日行程</span></div>' +
      '<h2 class="d-title">' + (day.getMonth() + 1) + '月' + day.getDate() + '日 · 周' + WEEK_CN[day.getDay()] + '</h2>' +
      '<div class="d-sub">' + evs.length + ' 项行程（含进行中）</div>' +
      '<div class="section-title">时间线</div>' + listHTML;

    openModal(html);
  }

  /* ---------------- 数据维护（手动兜底） ---------------- */
  function toInput(v) {
    if (!v) return '';
    var d = new Date(v);
    if (isNaN(d)) return '';
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function toISO(d) {
    var off = -d.getTimezoneOffset();
    var sign = off >= 0 ? '+' : '-';
    var abs = Math.abs(off);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' +
      pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':00' +
      sign + pad(Math.floor(abs / 60)) + ':' + pad(abs % 60);
  }
  function parseLocalDate(str) {
    if (!str) return null;
    var s = String(str).trim().replace(' ', 'T');
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) s += 'T23:59:00';
    else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) s += ':00';
    var d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }
  function codeToInput(c) {
    return [c.code, c.reward || '', c.expires ? toInput(c.expires).replace('T', ' ') : ''].join(' | ');
  }
  function download(filename, text, mime) {
    var blob = new Blob([text], { type: mime + ';charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 800);
  }

  function openAdmin() {
    var t = new Date();
    var updated = (typeof DATA_UPDATED !== 'undefined') ? DATA_UPDATED : '';
    var days = updated ? Math.floor((startOfDay(t) - startOfDay(new Date(updated + 'T00:00:00'))) / DAY) : null;
    var stale = days !== null && days > 7;
    var list = allEvents.slice().sort(function (a, b) { return new Date(b.start) - new Date(a.start); });

    var rows = list.map(function (e) {
      var g = gameMap[e.game];
      var en = e.end ? fmtMD(new Date(e.end)) + ' ' + fmtHM(new Date(e.end)) : '持续中';
      return '<div class="admin-item">' +
        '<i class="adot" style="--c:' + g.color + '"></i>' +
        '<div class="ai-main"><b>' + esc(e.title) + '</b>' +
        '<span>' + esc(g.short) + ' · ' + TYPES[e.type].label + ' · ' +
        fmtMD(new Date(e.start)) + ' ' + fmtHM(new Date(e.start)) + ' → ' + en + '</span></div>' +
        '<button class="iconbtn admin-edit" data-id="' + e.id + '">编辑</button>' +
        '<button class="iconbtn danger admin-del" data-id="' + e.id + '">删除</button>' +
        '</div>';
    }).join('');

    var html = '<button class="modal-close" aria-label="关闭">×</button>' +
      '<div class="d-eyebrow"><span class="tbadge">数据维护</span>' +
      (localDirty() ? '<span class="status ok">本地修改已生效</span>' : '') +
      (stale ? '<span class="status warn">数据可能过期</span>' : '') + '</div>' +
      '<h2 class="d-title">数据更新与手动兜底</h2>' +
      '<div class="d-sub">基础数据更新于 <b style="color:var(--muted)">' + esc(updated || '未知') + '</b>' +
      (days !== null ? '（' + (days <= 0 ? '今天' : days + ' 天前') + '）' : '') +
      '；每日定时任务会自动检查官方公告。</div>' +
      '<div class="admin-stats">' +
      '<span>基础 ' + BASE_EVENTS.length + ' 条</span>' +
      '<span>当前 ' + allEvents.length + ' 条</span>' +
      '<span>本地新增 ' + local.added.length + '</span>' +
      '<span>修改 ' + Object.keys(local.updated).length + '</span>' +
      '<span>隐藏 ' + local.removed.length + '</span>' +
      '</div>' +
      '<div class="admin-actions">' +
      '<button class="btn primary" id="adminAdd">+ 新增行程</button>' +
      '<button class="btn" id="adminImport">导入 JSON</button>' +
      '<button class="btn" id="adminExportJson">导出 JSON</button>' +
      '<button class="btn" id="adminExportJs">导出 data.js（快照）</button>' +
      (localDirty() ? '<button class="btn danger" id="adminReset">清除本地修改</button>' : '') +
      '<input type="file" id="adminFile" accept=".json,application/json" hidden>' +
      '</div>' +
      '<div class="section-title">全部行程（' + allEvents.length + '）</div>' +
      '<div class="admin-list">' + rows + '</div>' +
      '<div class="hint" style="margin-top:10px">修改只保存在当前浏览器；正式数据源为 data/&lt;游戏&gt;.json，自动更新会用它们重新构建 data.js。需要固化手动修改时，导出 JSON 后按游戏合并到对应文件，再运行 node scripts/build.mjs。</div>';

    openModal(html, true);
  }

  function openAdminForm(id) {
    var src = id ? allEvents.find(function (x) { return x.id === id; }) : null;
    var e = src ? clone(src) : {
      id: '', game: 'genshin', type: 'event', title: '', subtitle: '',
      start: '', end: null, banners: [], codes: [], note: '', source: ''
    };
    var gameOpts = GAMES.map(function (g) {
      return '<option value="' + g.id + '"' + (g.id === e.game ? ' selected' : '') + '>' + esc(g.name) + '</option>';
    }).join('');
    var typeOpts = Object.keys(TYPES).map(function (k) {
      return '<option value="' + k + '"' + (k === e.type ? ' selected' : '') + '>' + TYPES[k].label + '</option>';
    }).join('');
    var bannersText = (e.banners || []).map(function (b) {
      return b.name + (b.tag ? ' | ' + b.tag : '');
    }).join('\n');
    var codesText = (e.codes || []).map(codeToInput).join('\n');
    var imagesText = (e.gallery && e.gallery.length ? e.gallery : (e.image ? [e.image] : [])).join('\n');
    var detailsText = (e.details || []).join('\n');

    var html = '<button class="modal-close" aria-label="关闭">×</button>' +
      '<div class="d-eyebrow"><span class="tbadge">' + (src ? '编辑行程' : '新增行程') + '</span></div>' +
      '<h2 class="d-title">' + (src ? esc(e.title) : '新增一条行程') + '</h2>' +
      '<form id="adminForm" style="margin-top:16px">' +
      '<input type="hidden" name="id" value="' + esc(e.id) + '">' +
      '<div class="form-grid">' +
      '<div class="field"><label>游戏</label><select name="game">' + gameOpts + '</select></div>' +
      '<div class="field"><label>类型</label><select name="type">' + typeOpts + '</select></div>' +
      '<div class="field full"><label>标题</label><input name="title" required maxlength="60" value="' + esc(e.title) + '" placeholder="例：8.0 上半祈愿"></div>' +
      '<div class="field full"><label>副标题 / 卡池角色简述</label><input name="subtitle" maxlength="80" value="' + esc(e.subtitle || '') + '" placeholder="例：「万象繁织」米提亚 · 芙宁娜"></div>' +
      '<div class="field"><label>开始时间</label><input type="datetime-local" name="start" required value="' + toInput(e.start) + '"></div>' +
      '<div class="field"><label>结束时间（留空 = 持续中）</label><input type="datetime-local" name="end" value="' + toInput(e.end) + '"></div>' +
      '<div class="field full"><label>卡池 / 角色（每行：名称 | 标签）</label><textarea name="banners" placeholder="米提亚 | 5★ 雷&#10;芙宁娜 | 5★ 水">' + esc(bannersText) + '</textarea></div>' +
      '<div class="field full"><label>兑换码（每行：兑换码 | 奖励 | 有效期，可留空）</label><textarea name="codes" placeholder="ABC123 | 原石 ×100 | 2026-12-01 12:00">' + esc(codesText) + '</textarea></div>' +
      '<div class="field full"><label>备注</label><textarea name="note" placeholder="活动说明、上下半时间、专武等">' + esc(e.note || '') + '</textarea></div>' +
      '<div class="field full"><label>官方公告链接</label><input name="source" value="' + esc(e.source || '') + '" placeholder="https://"></div>' +
      '<div class="field full"><label>官方活动图（每行一个 URL，第一张为主图）</label><textarea name="images" placeholder="https://...">' + esc(imagesText) + '</textarea></div>' +
      '<div class="field full"><label>活动详情（每行一条）</label><textarea name="details" placeholder="11/20 10:00 开启，11/30 03:59 结束">' + esc(detailsText) + '</textarea></div>' +
      '<div class="field"><label>主要奖励</label><input name="rewards" value="' + esc(e.rewards || '') + '" placeholder="原石、摩拉等"></div>' +
      '<div class="field"><label>参与条件</label><input name="requirements" value="' + esc(e.requirements || '') + '" placeholder="冒险等阶≥20"></div>' +
      '</div>' +
      '<div class="form-actions"><button type="button" class="btn" id="adminCancel">取消</button>' +
      '<button type="submit" class="btn primary">保存</button></div>' +
      '</form>';

    openModal(html, true);
    var first = document.querySelector('#adminForm input[name="title"]');
    if (first) first.focus();
  }

  function parseBanners(text) {
    return text.split('\n').map(function (line) { return line.trim(); }).filter(Boolean).map(function (line) {
      var p = line.split('|');
      return { name: (p[0] || '').trim(), tag: (p[1] || '').trim() };
    }).filter(function (b) { return b.name; });
  }
  function parseLines(text) {
    return String(text || '').split('\n').map(function (line) { return line.trim(); }).filter(Boolean);
  }
  function parseCodes(text) {
    return text.split('\n').map(function (line) { return line.trim(); }).filter(Boolean).map(function (line) {
      var p = line.split('|').map(function (x) { return x.trim(); });
      var ex = p[2] ? parseLocalDate(p[2]) : null;
      return {
        label: (p.length > 3 ? p[3] : ''),
        code: p[0] || '',
        reward: p[1] || '',
        expires: ex ? toISO(ex) : null
      };
    }).filter(function (c) { return c.code; });
  }

  function saveAdminForm() {
    var f = document.getElementById('adminForm');
    if (!f) return;
    var el = f.elements;
    var title = el.namedItem('title').value.trim();
    var start = parseLocalDate(el.namedItem('start').value);
    var end = el.namedItem('end').value ? parseLocalDate(el.namedItem('end').value) : null;
    if (!title) { alert('请填写标题'); return; }
    if (!start) { alert('请填写开始时间'); return; }
    if (end && end <= start) { alert('结束时间需要晚于开始时间'); return; }

    var id = el.namedItem('id').value || ('local-' + Date.now());
    var imgs = parseLines(el.namedItem('images').value);
    var obj = {
      id: id,
      game: el.namedItem('game').value,
      type: el.namedItem('type').value,
      title: title,
      subtitle: el.namedItem('subtitle').value.trim(),
      start: toISO(start),
      end: end ? toISO(end) : null,
      banners: parseBanners(el.namedItem('banners').value),
      codes: parseCodes(el.namedItem('codes').value),
      image: imgs[0] || '',
      gallery: imgs,
      details: parseLines(el.namedItem('details').value),
      rewards: el.namedItem('rewards').value.trim(),
      requirements: el.namedItem('requirements').value.trim(),
      note: el.namedItem('note').value.trim(),
      source: el.namedItem('source').value.trim()
    };

    var addedIndex = local.added.findIndex(function (a) { return a.id === id; });
    var isBase = BASE_EVENTS.some(function (b) { return b.id === id; });
    if (isBase && addedIndex === -1) {
      local.updated[id] = obj;
    } else if (addedIndex >= 0) {
      local.added[addedIndex] = obj;
    } else {
      local.added.push(obj);
    }
    local.removed = local.removed.filter(function (x) { return x !== id; });

    saveLocal();
    rebuildEvents();
    renderAll();
    openAdmin();
  }

  function deleteEvent(id) {
    if (!confirm('确定删除这条行程吗？删除后可通过「清除本地修改」恢复基础数据。')) return;
    var addedIndex = local.added.findIndex(function (a) { return a.id === id; });
    if (addedIndex >= 0) {
      local.added.splice(addedIndex, 1);
    } else if (local.removed.indexOf(id) === -1) {
      local.removed.push(id);
    }
    delete local.updated[id];
    saveLocal();
    rebuildEvents();
    renderAll();
    openAdmin();
  }

  function resetLocal() {
    if (!confirm('确定清除所有本地新增、修改和隐藏吗？将恢复为 data.js 的基础数据。')) return;
    local = { added: [], updated: {}, removed: [] };
    saveLocal();
    rebuildEvents();
    renderAll();
    openAdmin();
  }

  function exportJson() {
    download('calendar-events.json', JSON.stringify({
      exportedAt: new Date().toISOString(),
      events: allEvents
    }, null, 2), 'application/json');
  }

  function exportDataJs() {
    var today = dayKey(new Date());
    var text = '/* 游戏活动日历 · 数据\n' +
      ' * 时间均为北京时间（UTC+8），整理自各游戏官方公告与社区汇总。\n' +
      ' * 由页面「数据维护」导出：' + today + '\n' +
      ' * end 为 null 表示官方未公布结束时间，按「持续中」处理。\n' +
      ' */\n\n' +
      'const DATA_UPDATED = ' + JSON.stringify(today) + ';\n\n' +
      'const GAMES = ' + JSON.stringify(GAMES, null, 2) + ';\n\n' +
      'const TYPES = ' + JSON.stringify(TYPES, null, 2) + ';\n\n' +
      'const EVENTS = ' + JSON.stringify(allEvents, null, 2) + ';\n';
    download('data.js', text, 'text/javascript');
  }

  function importJson(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var parsed = JSON.parse(String(reader.result));
        var arr = Array.isArray(parsed) ? parsed : (parsed.events || []);
        if (!Array.isArray(arr) || !arr.length) { alert('文件里没有可识别的 events 数组'); return; }
        arr = arr.filter(function (e) { return e && e.id && e.game && e.title && e.start; });
        if (!arr.length) { alert('事件数据缺少 id / game / title / start 字段'); return; }

        var updated = {};
        var added = [];
        arr.forEach(function (e) {
          if (BASE_EVENTS.some(function (b) { return b.id === e.id; })) updated[e.id] = e;
          else added.push(e);
        });
        local = { added: added, updated: updated, removed: [] };
        saveLocal();
        rebuildEvents();
        renderAll();
        openAdmin();
        alert('已导入 ' + arr.length + ' 条行程（与基础数据合并）。');
      } catch (err) {
        alert('导入失败：' + err.message);
      }
    };
    reader.readAsText(file);
  }

  /* ---------------- events ---------------- */
  function copyText(text, btn) {
    function done() {
      btn.textContent = '已复制';
      btn.classList.add('done');
      setTimeout(function () {
        btn.textContent = '复制';
        btn.classList.remove('done');
      }, 1600);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(); });
    } else {
      fallback();
    }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (err) { btn.textContent = '复制失败'; }
      document.body.removeChild(ta);
    }
  }

  document.getElementById('gameFilter').addEventListener('click', function (ev) {
    var btn = ev.target.closest('[data-game]');
    if (!btn) return;
    var id = btn.getAttribute('data-game');
    if (id === 'all') {
      state.games = new Set(GAMES.map(function (g) { return g.id; }));
    } else if (state.games.has(id)) {
      if (state.games.size === 1) return;
      state.games.delete(id);
    } else {
      state.games.add(id);
    }
    renderAll();
  });

  document.getElementById('typeFilter').addEventListener('click', function (ev) {
    var btn = ev.target.closest('[data-type]');
    if (!btn) return;
    state.type = btn.getAttribute('data-type');
    renderAll();
  });

  document.getElementById('viewToggle').addEventListener('click', function (ev) {
    var btn = ev.target.closest('[data-view]');
    if (!btn) return;
    state.view = btn.getAttribute('data-view');
    document.querySelectorAll('#viewToggle button').forEach(function (b) {
      b.classList.toggle('on', b === btn);
    });
    renderAll();
  });

  document.getElementById('sideTabs').addEventListener('click', function (ev) {
    var btn = ev.target.closest('[data-tab]');
    if (!btn) return;
    state.sideTab = btn.getAttribute('data-tab');
    renderSidebar();
  });

  document.getElementById('prevMonth').addEventListener('click', function () {
    var idx = state.year * 12 + state.month - 1;
    switchMonth(Math.floor(idx / 12), ((idx % 12) + 12) % 12);
  });
  document.getElementById('nextMonth').addEventListener('click', function () {
    var idx = state.year * 12 + state.month + 1;
    switchMonth(Math.floor(idx / 12), ((idx % 12) + 12) % 12);
  });
  document.getElementById('todayBtn').addEventListener('click', function () {
    var t = new Date();
    switchMonth(t.getFullYear(), t.getMonth());
  });

  function switchMonth(y, m) {
    if (y === state.year && m === state.month) return;
    var cur = state.year * 12 + state.month;
    var next = y * 12 + m;
    var dir = next > cur ? 1 : -1;
    var isLane = state.view === 'lane';
    var reduce = (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) || isLane;
    var stage = document.getElementById('viewStage');
    var active = state.view === 'month'
      ? document.getElementById('monthView')
      : document.getElementById('laneView');
    var ghost = null;

    if (!reduce && stage && active && active.offsetHeight > 0) {
      var oldTint = MONTH_TINTS[state.month];
      ghost = active.cloneNode(true);
      ghost.removeAttribute('id');
      ghost.querySelectorAll('[id]').forEach(function (el) { el.removeAttribute('id'); });
      ghost.classList.remove('hidden', 'anim-left', 'anim-right');
      ghost.classList.add('view-ghost');
      ghost.style.height = active.offsetHeight + 'px';
      ghost.style.setProperty('--mt', oldTint);
      ghost.style.setProperty('--mt-soft', rgba(oldTint, .16));
      ghost.style.setProperty('--mt-faint', rgba(oldTint, .05));
      stage.appendChild(ghost);
      void ghost.offsetWidth;
    }

    state.dir = isLane ? 0 : dir;
    state.year = y;
    state.month = m;
    renderAll();

    if (ghost) {
      ghost.style.transform = 'translateX(' + (dir > 0 ? -100 : 100) + '%)';
      ghost.style.opacity = '.55';
      setTimeout(function () { ghost.remove(); }, 340);
    }
  }

  document.getElementById('monthStrip').addEventListener('click', function (ev) {
    var btn = ev.target.closest('[data-y]');
    if (!btn) return;
    var y = Number(btn.getAttribute('data-y'));
    var m = Number(btn.getAttribute('data-m'));
    if (state.view === 'lane' && state._laneStart) {
      var scroll = document.getElementById('laneScroll');
      var idx = Math.round((new Date(y, m, 1) - state._laneStart) / DAY);
      if (scroll && idx >= 0 && idx < state._laneDays) {
        scroll.scrollTo({ left: Math.max(0, idx * 13), behavior: 'smooth' });
        return;
      }
    }
    switchMonth(y, m);
  });

  /* 在月份条或泳道区域滚动滚轮，切换到前/后一个月 */
  var wheelLock = 0;
  function onMonthWheel(ev) {
    var t = Date.now();
    if (t - wheelLock < 450) { ev.preventDefault(); return; }
    var delta = Math.abs(ev.deltaY) >= Math.abs(ev.deltaX) ? ev.deltaY : ev.deltaX;
    if (Math.abs(delta) < 5) return;
    ev.preventDefault();
    wheelLock = t;
    var idx = state.year * 12 + state.month + (delta > 0 ? 1 : -1);
    switchMonth(Math.floor(idx / 12), ((idx % 12) + 12) % 12);
  }
  document.getElementById('monthStrip').addEventListener('wheel', onMonthWheel, { passive: false });
  document.getElementById('laneView').addEventListener('wheel', function (ev) {
    var sc = document.getElementById('laneScroll');
    if (!sc) return;
    var horizontal = Math.abs(ev.deltaX) > Math.abs(ev.deltaY);
    if (!horizontal && !ev.shiftKey) return; // 垂直滚轮交给页面滚动
    var delta = horizontal ? ev.deltaX : ev.deltaY;
    if (!delta) return;
    ev.preventDefault();
    sc.scrollLeft += delta;
  }, { passive: false });

  /* 横向滚动时间轴时，同步左上角月份和月份条高亮 */
  function onLaneScroll(ev) {
    if (!ev.target || ev.target.id !== 'laneScroll' || !state._laneStart) return;
    updateLaneTopbar();
    var sc = ev.target;
    var idx = Math.round(sc.scrollLeft / 13);
    idx = Math.max(0, Math.min(state._laneDays - 1, idx));
    var d = addDays(state._laneStart, idx);
    var y = d.getFullYear();
    var m = d.getMonth();
    if (state._laneVisible && state._laneVisible.y === y && state._laneVisible.m === m) return;
    state._laneVisible = { y: y, m: m };

    var label = document.querySelector('.lane-head-label span');
    if (label) label.textContent = y + '年' + (m + 1) + '月';
    document.querySelectorAll('#monthStrip .mstrip-btn').forEach(function (b) {
      b.classList.toggle('on', Number(b.getAttribute('data-y')) === y && Number(b.getAttribute('data-m')) === m);
    });
    var tint = MONTH_TINTS[m];
    var root = document.documentElement;
    root.style.setProperty('--mt', tint);
    root.style.setProperty('--mt-soft', rgba(tint, .16));
    root.style.setProperty('--mt-faint', rgba(tint, .05));
  }
  document.getElementById('laneView').addEventListener('scroll', onLaneScroll, true);

  function updateLaneTopbar() {
    var sc = document.getElementById('laneScroll');
    var track = document.getElementById('laneScrollbar');
    var thumb = document.getElementById('laneScrollThumb');
    if (!sc || !track || !thumb || sc.clientWidth === 0) return;
    var trackW = track.clientWidth;
    var maxScroll = sc.scrollWidth - sc.clientWidth;
    var thumbW = maxScroll > 0
      ? Math.min(trackW, Math.max(40, trackW * (sc.clientWidth / sc.scrollWidth)))
      : trackW;
    var left = maxScroll > 0 ? (sc.scrollLeft / maxScroll) * (trackW - thumbW) : 0;
    thumb.style.width = thumbW + 'px';
    thumb.style.left = Math.max(0, Math.min(trackW - thumbW, left)) + 'px';
  }

  function initLaneTopbar() {
    var sc = document.getElementById('laneScroll');
    var track = document.getElementById('laneScrollbar');
    var thumb = document.getElementById('laneScrollThumb');
    if (!sc || !track || !thumb) return;
    updateLaneTopbar();

    var drag = null;
    thumb.addEventListener('pointerdown', function (ev) {
      ev.preventDefault();
      drag = { x: ev.clientX, scroll: sc.scrollLeft, trackW: track.clientWidth, thumbW: thumb.offsetWidth };
      thumb.classList.add('dragging');
      thumb.setPointerCapture(ev.pointerId);
    });
    thumb.addEventListener('pointermove', function (ev) {
      if (!drag) return;
      var maxScroll = sc.scrollWidth - sc.clientWidth;
      var range = drag.trackW - drag.thumbW;
      if (range <= 0 || maxScroll <= 0) return;
      sc.scrollLeft = drag.scroll + ((ev.clientX - drag.x) / range) * maxScroll;
      updateLaneTopbar();
    });
    function endDrag() {
      drag = null;
      thumb.classList.remove('dragging');
    }
    thumb.addEventListener('pointerup', endDrag);
    thumb.addEventListener('pointercancel', endDrag);

    track.addEventListener('pointerdown', function (ev) {
      if (ev.target === thumb) return;
      var maxScroll = sc.scrollWidth - sc.clientWidth;
      if (maxScroll <= 0) return;
      var rect = track.getBoundingClientRect();
      var ratio = (ev.clientX - rect.left) / rect.width;
      sc.scrollLeft = Math.max(0, Math.min(maxScroll, ratio * maxScroll - sc.clientWidth / 2));
      updateLaneTopbar();
    });
  }

  window.addEventListener('resize', function () { updateLaneTopbar(); });

  document.getElementById('monthView').addEventListener('click', function (ev) {
    var chip = ev.target.closest('.mchip');
    if (chip) { openEvent(chip.getAttribute('data-id')); return; }
    var day = ev.target.closest('.day');
    if (day) openDay(day.getAttribute('data-day'));
  });

  document.getElementById('laneView').addEventListener('click', function (ev) {
    var bar = ev.target.closest('.lane-bar');
    if (bar) openEvent(bar.getAttribute('data-id'));
  });

  document.getElementById('sideBody').addEventListener('click', function (ev) {
    var copyBtn = ev.target.closest('[data-copy]');
    if (copyBtn) {
      ev.stopPropagation();
      copyText(copyBtn.getAttribute('data-copy'), copyBtn);
      return;
    }
    var card = ev.target.closest('[data-id]');
    if (card) openEvent(card.getAttribute('data-id'));
  });

  modalCard.addEventListener('click', function (ev) {
    var copyBtn = ev.target.closest('[data-copy]');
    if (copyBtn) { copyText(copyBtn.getAttribute('data-copy'), copyBtn); return; }
    if (ev.target.closest('#adminAdd')) { openAdminForm(); return; }
    if (ev.target.closest('#adminCancel')) { openAdmin(); return; }
    if (ev.target.closest('#adminReset')) { resetLocal(); return; }
    if (ev.target.closest('#adminExportJson')) { exportJson(); return; }
    if (ev.target.closest('#adminExportJs')) { exportDataJs(); return; }
    if (ev.target.closest('#adminImport')) {
      var fileInput = document.getElementById('adminFile');
      if (fileInput) fileInput.click();
      return;
    }
    var editBtn = ev.target.closest('.admin-edit');
    if (editBtn) { openAdminForm(editBtn.getAttribute('data-id')); return; }
    var delBtn = ev.target.closest('.admin-del');
    if (delBtn) { deleteEvent(delBtn.getAttribute('data-id')); return; }
    if (ev.target.closest('.modal-close')) { closeModal(); return; }
    var item = ev.target.closest('.day-item');
    if (item) openEvent(item.getAttribute('data-id'));
  });
  modalCard.addEventListener('submit', function (ev) {
    if (ev.target && ev.target.getAttribute('id') === 'adminForm') {
      ev.preventDefault();
      saveAdminForm();
    }
  });
  modalCard.addEventListener('change', function (ev) {
    if (ev.target && ev.target.id === 'adminFile' && ev.target.files && ev.target.files[0]) {
      importJson(ev.target.files[0]);
    }
  });
  document.getElementById('adminBtn').addEventListener('click', openAdmin);
  modal.addEventListener('click', function (ev) {
    if (ev.target === modal) closeModal();
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  /* ---------------- header / render all ---------------- */
  function updateHeader() {
    var t = new Date();
    document.getElementById('monthTitle').textContent = state.year + '年' + (state.month + 1) + '月';
    document.getElementById('monthEn').textContent = MONTH_EN[state.month];
    document.getElementById('nowText').textContent =
      t.getFullYear() + '年' + (t.getMonth() + 1) + '月' + t.getDate() + '日 周' + WEEK_CN[t.getDay()] +
      ' · ' + fmtHM(t);

    var tint = MONTH_TINTS[state.month];
    var root = document.documentElement;
    root.style.setProperty('--mt', tint);
    root.style.setProperty('--mt-soft', rgba(tint, .16));
    root.style.setProperty('--mt-faint', rgba(tint, .05));

    var duEl = document.getElementById('dataUpdated');
    if (duEl) {
      var du = (typeof DATA_UPDATED !== 'undefined') ? DATA_UPDATED : '';
      duEl.textContent = du || '未知';
      var overdue = du ? Math.floor((startOfDay(t) - startOfDay(new Date(du + 'T00:00:00'))) / DAY) > 7 : true;
      duEl.classList.toggle('stale', overdue);
      duEl.title = overdue ? '数据超过 7 天未更新，建议在「数据维护」中校准' : '每日定时任务会自动检查官方公告';
    }
    var dot = document.getElementById('localDot');
    if (dot) dot.classList.toggle('hidden', !localDirty());
  }

  function renderAll() {
    syncCodeArchive();
    updateHeader();
    renderFilters();
    renderMonthStrip();

    var isMonth = state.view === 'month';
    document.getElementById('monthView').classList.toggle('hidden', !isMonth);
    document.getElementById('laneView').classList.toggle('hidden', isMonth);

    if (isMonth) renderMonth(); else renderLane();

    var dir = state.dir;
    state.dir = 0;
    var animTarget = isMonth ? document.getElementById('monthView') : document.getElementById('laneView');
    animTarget.classList.remove('anim-left', 'anim-right');
    void animTarget.offsetWidth;
    if (dir > 0) animTarget.classList.add('anim-right');
    else if (dir < 0) animTarget.classList.add('anim-left');

    var hint = document.getElementById('boardHint');
    if (isMonth) {
      hint.innerHTML = '月历标记每个行程的<b>开始</b>与<b>结束</b>日，点击日期可查看当天全部行程；月份条上滚动滚轮可切换月份';
    } else {
      hint.innerHTML = '泳道是跨月连续时间轴：拖动底部滚动条、横向滑动触控板或 <b>Shift + 滚轮</b> 查看前后日期，垂直滚轮仍可正常滚动页面';
    }

    renderSidebar();
  }

  document.querySelectorAll('[data-marker]').forEach(function (el) {
    var key = el.getAttribute('data-marker');
    if (MARK_ICONS[key]) el.innerHTML = MARK_ICONS[key];
  });

  var lightbox = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbOpen = document.getElementById('lbOpen');
  function openLightbox(url) {
    if (!lightbox || !url) return;
    lbImg.src = url;
    lbOpen.href = url;
    lightbox.classList.add('open');
    document.body.classList.add('lb-lock');
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lbImg.removeAttribute('src');
    document.body.classList.remove('lb-lock');
  }
  document.addEventListener('click', function (ev) {
    var z = ev.target.closest('[data-zoom]');
    if (!z) return;
    ev.preventDefault();
    openLightbox(z.getAttribute('data-zoom') || z.getAttribute('href'));
  }, true);
  if (lightbox) {
    lightbox.addEventListener('click', function (ev) {
      if (ev.target === lightbox || ev.target.closest('#lbClose')) closeLightbox();
    });
  }
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && lightbox && lightbox.classList.contains('open')) closeLightbox();
  });

  renderAll();
  setInterval(function () { updateHeader(); }, 30000);
})();
