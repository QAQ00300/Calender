(function () {
  'use strict';

  var DAY = 86400000;
  var MONTH_TINTS = ['#7c9dff', '#b388ff', '#ff9ec4', '#ffb27a', '#ffd166', '#8ee08a',
    '#4fd9a8', '#4ec9ff', '#7aa2ff', '#ffa94d', '#a48cff', '#5ad1e6'];
  var WEEK_CN = ['日', '一', '二', '三', '四', '五', '六'];
  var TYPE_ORDER = { preview: 0, banner: 1, version: 2, event: 3 };
  var gameMap = {};
  GAMES.forEach(function (g) { gameMap[g.id] = g; });

  var now = new Date();
  var state = {
    year: now.getFullYear(),
    month: now.getMonth(),
    tab: 'feed',
    games: new Set(GAMES.map(function (g) { return g.id; })),
    type: 'all'
  };

  function startOfDay(d) { var x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function fmtMD(d) { return (d.getMonth() + 1) + '/' + d.getDate(); }
  function fmtHM(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function fmtFull(d) {
    return d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate()) + ' ' + fmtHM(d);
  }
  function rgba(hex, a) {
    var h = hex.replace('#', '');
    return 'rgba(' + parseInt(h.slice(0, 2), 16) + ',' + parseInt(h.slice(2, 4), 16) + ',' + parseInt(h.slice(4, 6), 16) + ',' + a + ')';
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }
  function rangeText(e) {
    var s = new Date(e.start);
    var en = e.end ? new Date(e.end) : null;
    return fmtMD(s) + ' ' + fmtHM(s) + ' → ' + (en ? fmtMD(en) + ' ' + fmtHM(en) : '持续中');
  }
  function remainText(end) {
    var t = new Date();
    if (sameDay(end, t)) return '今天结束';
    var d = Math.ceil((end - t) / DAY);
    return d <= 0 ? '已结束' : '剩余 ' + d + ' 天';
  }
  function countdownText(start) {
    var t = new Date();
    if (sameDay(start, t)) return '今天开始';
    var d = Math.ceil((start - t) / DAY);
    return d <= 0 ? '即将开始' : d + ' 天后';
  }
  function visibleEvents() {
    return EVENTS.filter(function (e) {
      return state.games.has(e.game) && (state.type === 'all' || e.type === state.type);
    });
  }
  function monthBounds(y, m) {
    return [new Date(y, m, 1, 0, 0, 0, 0), new Date(y, m + 1, 0, 23, 59, 59, 999)];
  }
  function isOngoing(e) {
    var t = new Date();
    var s = new Date(e.start);
    var en = e.end ? new Date(e.end) : null;
    return s <= t && (!en || en >= t);
  }

  /* ---------------- header / filters ---------------- */
  function renderHeader() {
    var t = new Date();
    document.getElementById('h5Date').textContent =
      t.getFullYear() + '年' + (t.getMonth() + 1) + '月' + t.getDate() + '日 周' + WEEK_CN[t.getDay()];
    document.getElementById('h5Updated').textContent = (typeof DATA_UPDATED !== 'undefined') ? DATA_UPDATED : '';
    var tint = MONTH_TINTS[state.month];
    var root = document.documentElement;
    root.style.setProperty('--mt', tint);
    root.style.setProperty('--mt-soft', rgba(tint, .16));
    root.style.setProperty('--mt-faint', rgba(tint, .05));
  }

  function renderMonths() {
    var base = state.year * 12 + state.month;
    var html = '';
    for (var d = -2; d <= 2; d++) {
      var idx = base + d;
      var y = Math.floor(idx / 12);
      var m = ((idx % 12) + 12) % 12;
      var tint = MONTH_TINTS[m];
      var has = EVENTS.some(function (e) {
        var s = new Date(e.start);
        return s.getFullYear() === y && s.getMonth() === m;
      });
      html += '<button class="mstrip' + (d === 0 ? ' on' : '') + '" style="--mc:' + tint + '"' +
        ' data-y="' + y + '" data-m="' + m + '">' +
        (has ? '<i class="mstrip-dot"></i>' : '') + (m + 1) + '月</button>';
    }
    document.getElementById('h5Months').innerHTML = html;
  }

  function renderFilters() {
    var allOn = state.games.size === GAMES.length;
    var html = '<button class="gchip plain' + (allOn ? ' on' : '') + '" data-game="all">全部</button>' +
      GAMES.map(function (g) {
        return '<button class="gchip' + (state.games.has(g.id) ? ' on' : '') + '" style="--c:' + g.color +
          '" data-game="' + g.id + '"><i class="dot"></i>' + esc(g.short) + '</button>';
      }).join('');
    document.getElementById('h5Games').innerHTML = html;

    var types = [
      { id: 'all', label: '全部' },
      { id: 'version', label: '版本' },
      { id: 'banner', label: '卡池' },
      { id: 'event', label: '活动' },
      { id: 'preview', label: '前瞻' }
    ];
    document.getElementById('h5Types').innerHTML = types.map(function (t) {
      return '<button class="gchip plain' + (state.type === t.id ? ' on' : '') + '" data-type="' + t.id + '">' + t.label + '</button>';
    }).join('');
  }

  /* ---------------- feed ---------------- */
  function statusOf(e) {
    var t = new Date();
    var s = new Date(e.start);
    var en = e.end ? new Date(e.end) : null;
    if (s <= t && (!en || en >= t)) {
      return { text: en ? remainText(en) : '持续中', live: true, pct: en ? Math.max(2, Math.min(100, ((t - s) / (en - s)) * 100)) : null };
    }
    if (s > t) return { text: countdownText(s), live: false, pct: null };
    return { text: '已结束', live: false, pct: null };
  }

  function cardHTML(e) {
    var g = gameMap[e.game];
    var st = statusOf(e);
    var pct = (typeof st.pct === 'number') ? st.pct : null;
    var imgCount = (e.gallery && e.gallery.length) ? e.gallery.length : (e.image ? 1 : 0);
    return '<button class="ecard" style="--c:' + g.color + '" data-id="' + e.id + '">' +
      '<div class="erow"><span class="game"><i></i>' + esc(g.short) + '</span>' +
      '<span class="tags"><span class="type">' + TYPES[e.type].label + '</span>' +
      (imgCount ? '<span class="img-chip">图 ' + imgCount + '</span>' : '') + '</span></div>' +
      '<h3>' + esc(e.title) + '</h3>' +
      (e.subtitle ? '<div class="sub">' + esc(e.subtitle) + '</div>' : '') +
      '<div class="meta"><b>' + rangeText(e) + '</b><span class="status' + (st.live ? ' live' : '') + '">' + st.text + '</span></div>' +
      (pct !== null ? '<div class="progress" style="--c:' + g.color + '"><i style="width:' + pct.toFixed(1) + '%"></i></div>' : '') +
      (pct === null && st.live ? '<div class="progress open" style="--c:' + g.color + '"><i></i></div>' : '') +
      '</button>';
  }

  function renderFeed() {
    var mb = monthBounds(state.year, state.month);
    var list = visibleEvents().filter(function (e) {
      var s = new Date(e.start);
      var en = e.end ? new Date(e.end) : null;
      return s <= mb[1] && (!en || en >= mb[0]);
    });

    var ongoing = [];
    var upcoming = [];
    var ended = [];
    list.forEach(function (e) {
      var t = new Date();
      var s = new Date(e.start);
      var en = e.end ? new Date(e.end) : null;
      if (s <= t && (!en || en >= t)) ongoing.push(e);
      else if (s > t) upcoming.push(e);
      else ended.push(e);
    });
    ongoing.sort(function (a, b) {
      var ea = a.end ? new Date(a.end) : Infinity;
      var eb = b.end ? new Date(b.end) : Infinity;
      return ea === eb ? new Date(a.start) - new Date(b.start) : ea - eb;
    });
    upcoming.sort(function (a, b) { return new Date(a.start) - new Date(b.start); });
    ended.sort(function (a, b) { return new Date(b.start) - new Date(a.start); });

    var html = '';
    if (!list.length) {
      document.getElementById('h5Main').innerHTML = '<div class="empty">这个月没有符合条件的行程<br>试试切换月份或游戏</div>';
      return;
    }
    if (ongoing.length) {
      html += '<div class="section-title"><b>进行中</b><span>' + ongoing.length + '</span></div>' + ongoing.map(cardHTML).join('');
    }
    if (upcoming.length) {
      html += '<div class="section-title"><b>即将开始</b><span>' + upcoming.length + '</span></div>' + upcoming.map(cardHTML).join('');
    }
    if (ended.length) {
      html += '<div class="section-title"><b>本月已结束</b><span>' + ended.length + '</span></div>' + ended.map(cardHTML).join('');
    }
    document.getElementById('h5Main').innerHTML = html;
  }

  /* ---------------- timeline ---------------- */
  function renderLane() {
    var y = state.year;
    var m = state.month;
    var rangeStart = startOfDay(new Date(y, m - 2, 1));
    var rangeEnd = startOfDay(new Date(y, m + 3, 0));
    var rangeEndEx = addDays(rangeEnd, 1);
    var totalDays = Math.round((rangeEndEx - rangeStart) / DAY);
    var today = startOfDay(new Date());
    var todayIdx = Math.round((today - rangeStart) / DAY);
    var evs = visibleEvents().filter(function (e) {
      var s = new Date(e.start);
      var en = e.end ? new Date(e.end) : rangeEnd;
      return s < rangeEndEx && en >= rangeStart;
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

    var segs = [];
    var cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
    while (cursor <= rangeEnd) {
      var yy = cursor.getFullYear();
      var mm = cursor.getMonth();
      segs.push({
        y: yy, m: mm,
        days: new Date(yy, mm + 1, 0).getDate(),
        start: Math.round((cursor - rangeStart) / DAY),
        tint: MONTH_TINTS[mm]
      });
      cursor = new Date(yy, mm + 1, 1);
    }
    var monthsHTML = segs.map(function (s) {
      return '<div class="lane-month-seg" style="grid-column:' + (s.start + 1) + ' / span ' + s.days +
        ';--mc:' + s.tint + ';background:' + rgba(s.tint, .08) + '">' + (s.m + 1) + '月</div>';
    }).join('');
    var stops = [];
    segs.forEach(function (s) {
      var a = (s.start / totalDays) * 100;
      var b = ((s.start + s.days) / totalDays) * 100;
      stops.push(rgba(s.tint, .06) + ' ' + a + '%', rgba(s.tint, .06) + ' ' + b + '%');
    });
    var band = 'linear-gradient(90deg,' + stops.join(',') + ')';

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
        var c0 = Math.max(0, Math.round((startOfDay(s) - rangeStart) / DAY));
        var c1 = Math.min(totalDays - 1, Math.round((startOfDay(en) - rangeStart) / DAY));
        var lane = -1;
        for (var j = 0; j < laneEnds.length; j++) if (laneEnds[j] < c0) { lane = j; break; }
        if (lane === -1) { lane = laneEnds.length; laneEnds.push(0); }
        laneEnds[lane] = c1 + 1;
        placed.push({ e: e, c0: c0, c1: c1, lane: lane, clipL: s < rangeStart, clipR: !e.end || new Date(e.end) > rangeEnd });
      });
      var laneCount = Math.max(1, laneEnds.length);
      var trackH = laneCount * 24 + 8;
      var bars = placed.map(function (p) {
        var e = p.e;
        var g2 = gameMap[e.game];
        var left = (p.c0 / totalDays) * 100;
        var width = ((p.c1 - p.c0 + 1) / totalDays) * 100;
        var top = 4 + p.lane * 24;
        var cls = 'lane-bar' + (p.clipL ? ' clip-l' : '') + (p.clipR ? ' clip-r' : '');
        return '<button class="' + cls + '" style="left:' + left + '%;width:' + width + '%;top:' + top +
          'px;--c:' + g2.color + ';--cbg:' + rgba(g2.color, .22) + '" data-id="' + e.id + '">' +
          '<span class="txt">' + esc(e.title) + '</span></button>';
      }).join('');
      var todayLine = (todayIdx >= 0 && todayIdx < totalDays)
        ? '<i class="lane-today" style="left:' + (((todayIdx + 0.5) / totalDays) * 100) + '%"></i>' : '';
      var empty = !list.length ? '<div class="lane-empty">无行程</div>' : '';
      rows += '<div class="lane-row">' +
        '<div class="lane-label" style="--c:' + g.color + '"><i></i><span><b>' + esc(g.short) + '</b><small>' + list.length + ' 项</small></span></div>' +
        '<div class="lane-track" style="--n:' + totalDays + ';height:' + Math.max(42, trackH) + 'px;--band:' + band + '">' +
        todayLine + empty + bars + '</div></div>';
    });

    document.getElementById('h5Main').innerHTML =
      '<div class="lane-top"><span>左右拖动</span><div class="lane-track-top" id="h5LaneTrack">' +
      '<i class="lane-thumb" id="h5LaneThumb"></i></div></div>' +
      '<div class="lane-scroll" id="h5LaneScroll"><div class="lane-canvas" style="--days:' + totalDays + '">' +
      '<div class="lane-head"><div class="lane-head-label"><b>' + y + '年' + (m + 1) + '月</b><small>游戏 / 日期</small></div>' +
      '<div class="lane-head-main"><div class="lane-months" style="grid-template-columns:repeat(' + totalDays + ',1fr)">' + monthsHTML + '</div>' +
      '<div class="lane-days" style="grid-template-columns:repeat(' + totalDays + ',1fr)">' + daysHTML + '</div></div></div>' +
      rows + '</div></div>' +
      '<div class="lane-hint">左右滑动或拖动上方拉条查看前后月份；11月30日之后直接衔接12月1日。</div>';

    var scroll = document.getElementById('h5LaneScroll');
    var anchorIdx = Math.round((new Date(y, m, 1) - rangeStart) / DAY);
    if (scroll) scroll.scrollLeft = Math.max(0, anchorIdx * 13);
    initLaneTop();
  }

  function updateLaneTop() {
    var sc = document.getElementById('h5LaneScroll');
    var track = document.getElementById('h5LaneTrack');
    var thumb = document.getElementById('h5LaneThumb');
    if (!sc || !track || !thumb || sc.clientWidth === 0) return;
    var tw = track.clientWidth;
    var max = sc.scrollWidth - sc.clientWidth;
    var w = max > 0 ? Math.min(tw, Math.max(34, tw * (sc.clientWidth / sc.scrollWidth))) : tw;
    var left = max > 0 ? (sc.scrollLeft / max) * (tw - w) : 0;
    thumb.style.width = w + 'px';
    thumb.style.left = Math.max(0, Math.min(tw - w, left)) + 'px';
  }

  function initLaneTop() {
    var sc = document.getElementById('h5LaneScroll');
    var track = document.getElementById('h5LaneTrack');
    var thumb = document.getElementById('h5LaneThumb');
    if (!sc || !track || !thumb) return;
    updateLaneTop();

    var drag = null;
    thumb.addEventListener('pointerdown', function (ev) {
      ev.preventDefault();
      drag = { x: ev.clientX, scroll: sc.scrollLeft, tw: track.clientWidth, w: thumb.offsetWidth };
      thumb.classList.add('dragging');
      thumb.setPointerCapture(ev.pointerId);
    });
    thumb.addEventListener('pointermove', function (ev) {
      if (!drag) return;
      var max = sc.scrollWidth - sc.clientWidth;
      var range = drag.tw - drag.w;
      if (range <= 0 || max <= 0) return;
      sc.scrollLeft = drag.scroll + ((ev.clientX - drag.x) / range) * max;
      updateLaneTop();
    });
    function end() { drag = null; thumb.classList.remove('dragging'); }
    thumb.addEventListener('pointerup', end);
    thumb.addEventListener('pointercancel', end);

    track.addEventListener('pointerdown', function (ev) {
      if (ev.target === thumb) return;
      var max = sc.scrollWidth - sc.clientWidth;
      if (max <= 0) return;
      var r = track.getBoundingClientRect();
      var ratio = (ev.clientX - r.left) / r.width;
      sc.scrollLeft = Math.max(0, Math.min(max, ratio * max - sc.clientWidth / 2));
      updateLaneTop();
    });
    sc.addEventListener('scroll', updateLaneTop, { passive: true });
    sc.addEventListener('wheel', function (ev) {
      var h = Math.abs(ev.deltaX) > Math.abs(ev.deltaY);
      if (!h && !ev.shiftKey) return;
      ev.preventDefault();
      sc.scrollLeft += h ? ev.deltaX : ev.deltaY;
    }, { passive: false });
  }

  /* ---------------- codes ---------------- */
  function allCodes() {
    var out = [];
    EVENTS.forEach(function (e) {
      (e.codes || []).forEach(function (c) {
        out.push({
          game: e.game, eventId: e.id, label: c.label || TYPES[e.type].label,
          code: c.code, reward: c.reward, expires: c.expires || null
        });
      });
    });
    return out;
  }

  function renderCodes() {
    var t = new Date();
    var list = allCodes().filter(function (c) { return state.games.has(c.game); });
    list.sort(function (a, b) {
      var aa = !a.expires || new Date(a.expires) > t;
      var ab = !b.expires || new Date(b.expires) > t;
      if (aa !== ab) return aa ? -1 : 1;
      var ea = a.expires ? new Date(a.expires).getTime() : Infinity;
      var eb = b.expires ? new Date(b.expires).getTime() : Infinity;
      return ea - eb;
    });
    if (!list.length) {
      document.getElementById('h5Main').innerHTML = '<div class="empty">当前筛选下没有兑换码</div>';
      return;
    }
    document.getElementById('h5Main').innerHTML = list.map(function (c) {
      var g = gameMap[c.game];
      var active = !c.expires || new Date(c.expires) > t;
      var expiry = c.expires ? '有效期至 ' + fmtMD(new Date(c.expires)) + ' ' + fmtHM(new Date(c.expires)) : '长期有效';
      return '<div class="code-card">' +
        '<div class="code-top"><span class="game" style="--c:' + g.color + '"><i></i>' + esc(g.short) + ' · ' + esc(c.label) + '</span>' +
        '<span class="status ' + (active ? 'ok' : 'off') + '">' + (active ? '有效' : '已过期') + '</span></div>' +
        '<div class="code-line"><span>' + esc(c.code) + '</span><button class="copy" data-copy="' + esc(c.code) + '">复制</button></div>' +
        '<div class="code-reward">' + esc(c.reward) + ' · ' + expiry + '</div>' +
        '</div>';
    }).join('');
  }

  /* ---------------- detail sheet ---------------- */
  var sheet = document.getElementById('h5Sheet');
  var backdrop = document.getElementById('h5Backdrop');

  function openEvent(id) {
    var e = EVENTS.find(function (x) { return x.id === id; });
    if (!e) return;
    var g = gameMap[e.game];
    var s = new Date(e.start);
    var en = e.end ? new Date(e.end) : null;
    var codes = e.codes || [];
    var imgs = (e.gallery && e.gallery.length ? e.gallery : (e.image ? [e.image] : [])).filter(Boolean);

    var html = '<div class="sheet-head"><div>' +
      '<div class="eyebrow"><span class="gpill" style="--c:' + g.color + ';--cbg:' + rgba(g.color, .14) + '"><i></i>' + esc(g.name) + '</span>' +
      '<span class="tbadge">' + TYPES[e.type].label + '</span></div>' +
      '<h2>' + esc(e.title) + '</h2>' +
      (e.subtitle ? '<div class="sub">' + esc(e.subtitle) + '</div>' : '') +
      '</div><button class="sheet-close" data-close>×</button></div>' +
      '<div class="times">' +
      '<div><label>开始</label><b>' + fmtFull(s) + ' 周' + WEEK_CN[s.getDay()] + '</b></div>' +
      '<div><label>结束</label><b>' + (en ? fmtFull(en) + ' 周' + WEEK_CN[en.getDay()] : '持续中') + '</b></div>' +
      '</div>';

    if (imgs.length) {
      html += '<div class="section">官方活动图</div><div class="sheet-images">' +
        imgs.map(function (u) {
          return '<a href="' + esc(u) + '" target="_blank" rel="noopener" data-zoom="' + esc(u) + '"><img loading="lazy" referrerpolicy="no-referrer" src="' + esc(u) + '" alt="活动图"></a>';
        }).join('') + '</div>';
    }
    if (e.details && e.details.length) {
      html += '<div class="section">活动详情</div><ul class="bullets">' +
        e.details.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') + '</ul>';
    }
    if (e.rewards) html += '<div class="section">主要奖励</div><div class="note">' + esc(e.rewards) + '</div>';
    if (e.requirements) html += '<div class="section">参与条件</div><div class="note">' + esc(e.requirements) + '</div>';
    if (e.banners && e.banners.length) {
      html += '<div class="section">卡池 / 角色</div><div class="bchips">' +
        e.banners.map(function (b) {
          return '<span class="bchip">' + esc(b.name) + (b.tag ? '<small>' + esc(b.tag) + '</small>' : '') + '</span>';
        }).join('') + '</div>';
    }
    if (codes.length) {
      html += '<div class="section">相关兑换码</div>';
      html += codes.map(function (c) {
        var active = !c.expires || new Date(c.expires) > new Date();
        var expiry = c.expires ? '有效期至 ' + fmtMD(new Date(c.expires)) + ' ' + fmtHM(new Date(c.expires)) : '长期有效';
        return '<div class="sheet-code">' +
          '<div class="code-top"><span class="game" style="--c:' + g.color + '"><i></i>' + esc(c.label || '兑换码') + '</span>' +
          '<span class="status ' + (active ? 'ok' : 'off') + '">' + (active ? '有效' : '已过期') + '</span></div>' +
          '<div class="code-line"><span>' + esc(c.code) + '</span><button class="copy" data-copy="' + esc(c.code) + '">复制</button></div>' +
          '<div class="code-reward">' + esc(c.reward) + ' · ' + expiry + '</div></div>';
      }).join('');
    }
    if (e.note) html += '<div class="section">备注</div><div class="note">' + esc(e.note) + '</div>';
    if (e.source) html += '<a class="sheet-source" href="' + esc(e.source) + '" target="_blank" rel="noopener">查看官方公告 ↗</a>';

    sheet.innerHTML = html;
    backdrop.classList.add('open');
    sheet.classList.add('open');
    document.body.classList.add('lock');
  }

  function closeSheet() {
    backdrop.classList.remove('open');
    sheet.classList.remove('open');
    document.body.classList.remove('lock');
  }

  function copyText(text, btn) {
    function done() {
      btn.textContent = '已复制';
      btn.classList.add('done');
      setTimeout(function () { btn.textContent = '复制'; btn.classList.remove('done'); }, 1400);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else fallback();
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (err) { /* ignore */ }
      document.body.removeChild(ta);
    }
  }

  /* ---------------- render all / events ---------------- */
  function renderAll() {
    renderHeader();
    renderMonths();
    renderFilters();
    document.querySelectorAll('#h5Tabs button').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-tab') === state.tab);
    });
    if (state.tab === 'feed') renderFeed();
    else if (state.tab === 'lane') renderLane();
    else renderCodes();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.getElementById('h5Tabs').addEventListener('click', function (ev) {
    var btn = ev.target.closest('[data-tab]');
    if (!btn) return;
    state.tab = btn.getAttribute('data-tab');
    renderAll();
  });

  document.getElementById('h5Months').addEventListener('click', function (ev) {
    var btn = ev.target.closest('[data-y]');
    if (!btn) return;
    state.year = Number(btn.getAttribute('data-y'));
    state.month = Number(btn.getAttribute('data-m'));
    renderAll();
  });

  document.getElementById('h5Games').addEventListener('click', function (ev) {
    var btn = ev.target.closest('[data-game]');
    if (!btn) return;
    var id = btn.getAttribute('data-game');
    if (id === 'all') state.games = new Set(GAMES.map(function (g) { return g.id; }));
    else if (state.games.has(id)) {
      if (state.games.size === 1) return;
      state.games.delete(id);
    } else state.games.add(id);
    renderAll();
  });

  document.getElementById('h5Types').addEventListener('click', function (ev) {
    var btn = ev.target.closest('[data-type]');
    if (!btn) return;
    state.type = btn.getAttribute('data-type');
    renderAll();
  });

  document.getElementById('h5Main').addEventListener('click', function (ev) {
    var copy = ev.target.closest('[data-copy]');
    if (copy) { copyText(copy.getAttribute('data-copy'), copy); return; }
    var item = ev.target.closest('[data-id]');
    if (item) openEvent(item.getAttribute('data-id'));
  });

  sheet.addEventListener('click', function (ev) {
    var copy = ev.target.closest('[data-copy]');
    if (copy) { copyText(copy.getAttribute('data-copy'), copy); return; }
    if (ev.target.closest('[data-close]')) closeSheet();
  });
  backdrop.addEventListener('click', closeSheet);
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') closeSheet();
  });

  renderAll();

  var lb = document.getElementById('h5Lightbox');
  var lbImg = document.getElementById('h5LbImg');
  var lbOpen = document.getElementById('h5LbOpen');
  function openLightbox(url) {
    if (!lb || !url) return;
    lbImg.src = url;
    lbOpen.href = url;
    lb.classList.add('open');
    document.body.classList.add('lb-lock');
  }
  function closeLightbox() {
    if (!lb) return;
    lb.classList.remove('open');
    lbImg.removeAttribute('src');
    document.body.classList.remove('lb-lock');
  }
  document.addEventListener('click', function (ev) {
    var z = ev.target.closest('[data-zoom]');
    if (!z) return;
    ev.preventDefault();
    openLightbox(z.getAttribute('data-zoom') || z.getAttribute('href'));
  }, true);
  if (lb) {
    lb.addEventListener('click', function (ev) {
      if (ev.target === lb || ev.target.closest('#h5LbClose')) closeLightbox();
    });
  }
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && lb && lb.classList.contains('open')) closeLightbox();
  });

  window.addEventListener('resize', function () {
    if (state.tab === 'lane') updateLaneTop();
  });
})();
