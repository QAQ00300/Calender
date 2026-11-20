(function () {
  'use strict';

  var GAME_META = [
    { id: 'genshin', name: '原神', short: '原神', color: '#f2c14e', source: 'https://www.miyoushe.com/ys/' },
    { id: 'hsr', name: '崩坏：星穹铁道', short: '星铁', color: '#8ba4ff', source: 'https://www.miyoushe.com/sr/' },
    { id: 'zzz', name: '绝区零', short: '绝区零', color: '#ffd166', source: 'https://www.miyoushe.com/zzz/' },
    { id: 'arknights', name: '明日方舟', short: '明日方舟', color: '#8b8b8b', source: 'https://prts.wiki/' },
    { id: 'wuwa', name: '鸣潮', short: '鸣潮', color: '#9fb4c9', source: 'https://www.kurobbs.com/mc/home/9' },
    { id: 'endfield', name: '明日方舟：终末地', short: '终末地', color: '#7fd6c2', source: 'https://www.skland.com/game/endfield' }
  ];
  var GAME_MAP = {};
  GAME_META.forEach(function (g) { GAME_MAP[g.id] = g; });

  var NOTICES = {
    hsr: {
      title: '星铁：没找到可用的角色材料频道',
      reason: '米游社星铁 wiki 接口可访问，但未定位到能返回全角色培养材料的频道，因此没有生成数据。',
      checked: ['米游社星铁社区', '米游社星铁 wiki']
    },
    zzz: {
      title: '绝区零：官方 wiki 未返回角色材料',
      reason: '米游社绝区零 wiki 接口未返回角色材料数据，无法确认全角色材料来源。',
      checked: ['米游社绝区零社区', '米游社绝区零 wiki']
    },
    wuwa: {
      title: '鸣潮：库街区需要登录令牌',
      reason: '库街区官方接口需要登录 token / uid，未配置时无法批量读取全角色材料；没有用社区数据补猜。',
      checked: ['库街区鸣潮官方社区']
    },
    endfield: {
      title: '终末地：没有公开的全角色材料接口',
      reason: '森空岛页面未提供可匿名批量读取的角色材料接口，无法可靠生成全角色材料表。',
      checked: ['森空岛终末地页面']
    }
  };

  var RARITY_COLOR = {
    6: '#ffb54d', 5: '#ffd76a', 4: '#c89bff', 3: '#6fb4ff', 2: '#8ee08a', 1: '#aab3c7'
  };
  var CLASS_ORDER = ['先锋', '近卫', '重装', '狙击', '术师', '医疗', '辅助', '特种'];
  var ELEMENT_ORDER = ['火', '水', '风', '雷', '草', '冰', '岩'];
  var ELEMENT_COLOR = {
    '火': '#ff7a5c', '水': '#4ec9ff', '风': '#7fe0c3', '雷': '#b98cff',
    '草': '#8ee08a', '冰': '#9fe6ff', '岩': '#f2c14e'
  };
  var WEAPON_ORDER = ['单手剑', '双手剑', '长柄武器', '弓', '法器'];
  var TALENT_MORA = {
    '1→2': 12500, '2→3': 17500, '3→4': 25000, '4→5': 37500, '5→6': 50000,
    '6→7': 62500, '7→8': 125000, '8→9': 200000, '9→10': 300000
  };
  var ASCENSION_MORA = { 20: 20000, 40: 40000, 50: 60000, 60: 80000, 70: 100000, 80: 120000 };
  var LEVEL_EXP = [
    0, 1000, 2325, 4025, 6175, 8800, 11950, 15675, 20025, 25025,
    30725, 37175, 44400, 52450, 61375, 71200, 81950, 93675, 106400, 120175,
    135050, 151850, 169850, 189100, 209650, 231525, 254775, 279425, 305525, 333100,
    362200, 392850, 425100, 458975, 494525, 531775, 570750, 611500, 654075, 698500,
    744800, 795425, 848125, 902900, 959800, 1018875, 1080150, 1143675, 1209475, 1277600,
    1348075, 1424575, 1503625, 1585275, 1669550, 1756500, 1846150, 1938550, 2033725, 2131725,
    2232600, 2341550, 2453600, 2568775, 2687100, 2808625, 2933400, 3061475, 3192875, 3327650,
    3465825, 3614525, 3766900, 3922975, 4082800, 4246400, 4413825, 4585125, 4760350, 4939525,
    5122700, 5338925, 5581950, 5855050, 6161850, 6506450, 6893400, 7327825, 7815450, 8362650
  ];

  var state = {
    game: 'arknights', q: '', rarity: 'all', cls: 'all',
    element: 'all', weapon: 'all', selected: '', sort: 'release-desc',
    genshinMode: 'characters', weaponRarity: 'all', weaponType: 'all', weaponSort: 'rarity-desc'
  };
  var DATA = {};
  var ERRORS = {};
  var WEAPONS = null;
  var WEAPON_ERROR = '';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }
  function rarityColor(r) { return RARITY_COLOR[r] || '#aab3c7'; }
  function stars(r) { return r ? '★'.repeat(Math.max(0, Math.min(6, r))) : ''; }
  function isMobile() {
    return window.GROWTH_MODE === 'h5' || window.matchMedia('(max-width: 900px)').matches;
  }

  function avatarHTML(o, cls, color) {
    var rc = color || rarityColor(o.rarity);
    return '<span class="' + cls + '" style="--rc:' + rc + '">' +
      '<span class="g-avatar-fallback">' + esc(o.name.slice(0, 1)) + '</span>' +
      (o.avatar
        ? '<img src="' + esc(o.avatar) + '" alt="' + esc(o.name) + '" loading="lazy" onerror="this.remove()">'
        : '') +
      '</span>';
  }

  function renderTabs() {
    document.getElementById('gTabs').innerHTML = GAME_META.map(function (g) {
      var count = DATA[g.id] ? DATA[g.id].count : 0;
      return '<button class="g-tab' + (state.game === g.id ? ' on' : '') + (count ? '' : ' off') +
        '" style="--c:' + g.color + '" data-game="' + g.id + '"><i></i>' + esc(g.short) +
        '<span class="cnt">' + (count ? count + ' 名' : '未收录') + '</span></button>';
    }).join('');
  }

  function renderNotice(gameId) {
    var g = GAME_MAP[gameId];
    var n = NOTICES[gameId];
    return '<article class="g-notice">' +
      '<div class="eyebrow">未找到可靠数据 · 未生成材料表</div>' +
      '<h2>' + esc(n.title) + '</h2>' +
      '<p>' + esc(n.reason) + '</p>' +
      '<ul><li>已检查：' + n.checked.map(esc).join('、') + '</li>' +
      '<li>没有使用猜测数据；不完整的表比错表更危险。</li></ul>' +
      '<div class="actions"><a href="' + g.source + '" target="_blank" rel="noopener">打开' + esc(g.name) + '官方站点 ↗</a>' +
      '<a href="https://baike.mihoyo.com/ys/obc/channel/map/189/25" target="_blank" rel="noopener">查看原神全量材料 ↗</a>' +
      '<a href="https://prts.wiki/" target="_blank" rel="noopener">查看明日方舟全量材料 ↗</a></div>' +
      '<div class="hint">如果你有该游戏可访问的角色 wiki 页面或材料接口，把链接发我，可以按原神 / 明日方舟同样的方式补全。</div>' +
      '</article>';
  }

  function classes() {
    var set = {};
    DATA.arknights.operators.forEach(function (o) { if (o.class) set[o.class] = 1; });
    return Object.keys(set).sort(function (a, b) {
      var ia = CLASS_ORDER.indexOf(a), ib = CLASS_ORDER.indexOf(b);
      if (ia < 0) ia = 99;
      if (ib < 0) ib = 99;
      return ia - ib || a.localeCompare(b, 'zh-Hans-CN');
    });
  }

  function renderArknights() {
    var main = document.getElementById('gMain');
    var cls = classes();
    main.innerHTML = '<div class="g-layout">' +
      '<aside class="g-side"><div class="g-tools">' +
      '<input class="g-search" id="gSearch" placeholder="搜索干员名…" autocomplete="off">' +
      '<div class="g-sort-row"><button class="g-sort" id="gSort">上线时间 ↓ 新→旧</button><span class="g-count" id="gCount"></span></div>' +
      '<div class="g-filters" id="gRarity"></div>' +
      '<div class="g-filters" id="gClass"></div>' +
      '</div><div class="g-list" id="gList"></div></aside>' +
      '<section class="g-detail" id="gDetail"></section>' +
      '</div><div class="g-backdrop" id="gBackdrop2"></div>';

    document.getElementById('gSearch').addEventListener('input', function (ev) {
      state.q = ev.target.value.trim();
      renderList();
    });
    document.getElementById('gSort').addEventListener('click', function () {
      state.sort = state.sort === 'release-desc' ? 'release-asc' : 'release-desc';
      renderSort();
      renderList();
    });
    document.getElementById('gRarity').addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-rarity]');
      if (!b) return;
      state.rarity = b.getAttribute('data-rarity');
      renderFilters();
      renderList();
    });
    document.getElementById('gClass').addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-cls]');
      if (!b) return;
      state.cls = b.getAttribute('data-cls');
      renderFilters();
      renderList();
    });
    document.getElementById('gList').addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-op]');
      if (!b) return;
      state.selected = b.getAttribute('data-op');
      markSelected();
      renderDetail();
      if (isMobile()) openDetail();
    });
    document.getElementById('gDetail').addEventListener('click', function (ev) {
      if (ev.target.closest('[data-close-detail]')) closeDetail();
    });
    var bd = document.getElementById('gBackdrop2');
    if (bd) bd.addEventListener('click', closeDetail);

    renderFilters();
    renderSort();
    renderList();
  }

  function renderGenshin() {
    var main = document.getElementById('gMain');
    main.innerHTML = '<div class="g-mode">' +
      '<button class="g-mode-btn' + (state.genshinMode === 'characters' ? ' on' : '') + '" data-mode="characters">角色</button>' +
      '<button class="g-mode-btn' + (state.genshinMode === 'weapons' ? ' on' : '') + '" data-mode="weapons">武器</button>' +
      '</div><div id="gGenshinBody"></div>';
    main.querySelectorAll('[data-mode]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.genshinMode = b.getAttribute('data-mode');
        state.selected = '';
        state.q = '';
        closeDetail();
        renderMain();
      });
    });
    if (state.genshinMode === 'weapons') renderGenshinWeapons();
    else renderGenshinCharacters();
  }

  function renderGenshinCharacters() {
    var main = document.getElementById('gGenshinBody');
    main.innerHTML = '<div class="g-layout">' +
      '<aside class="g-side"><div class="g-tools">' +
      '<input class="g-search" id="gSearch" placeholder="搜索角色名…" autocomplete="off">' +
      '<div class="g-sort-row"><button class="g-sort" id="gSort">上线时间 ↓ 新→旧</button><span class="g-count" id="gCount"></span></div>' +
      '<div class="g-filters" id="gRarity"></div>' +
      '<div class="g-filters" id="gElement"></div>' +
      '<div class="g-filters" id="gWeapon"></div>' +
      '</div><div class="g-list" id="gList"></div></aside>' +
      '<section class="g-detail" id="gDetail"></section>' +
      '</div><div class="g-backdrop" id="gBackdrop2"></div>';

    document.getElementById('gSearch').addEventListener('input', function (ev) {
      state.q = ev.target.value.trim();
      renderGenshinList();
    });
    document.getElementById('gSort').addEventListener('click', function () {
      state.sort = state.sort === 'release-desc' ? 'release-asc' : 'release-desc';
      renderSort();
      renderGenshinList();
    });
    document.getElementById('gRarity').addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-rarity]');
      if (!b) return;
      state.rarity = b.getAttribute('data-rarity');
      renderGenshinFilters();
      renderGenshinList();
    });
    document.getElementById('gElement').addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-element]');
      if (!b) return;
      state.element = b.getAttribute('data-element');
      renderGenshinFilters();
      renderGenshinList();
    });
    document.getElementById('gWeapon').addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-weapon]');
      if (!b) return;
      state.weapon = b.getAttribute('data-weapon');
      renderGenshinFilters();
      renderGenshinList();
    });
    document.getElementById('gList').addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-op]');
      if (!b) return;
      state.selected = b.getAttribute('data-op');
      markSelected();
      renderGenshinDetail();
      if (isMobile()) openDetail();
    });
    document.getElementById('gDetail').addEventListener('click', function (ev) {
      if (ev.target.closest('[data-close-detail]')) {
        closeDetail();
        return;
      }
      var reco = ev.target.closest('[data-reco-weapon]');
      if (reco) {
        state.genshinMode = 'weapons';
        state.selected = reco.getAttribute('data-reco-weapon');
        state.q = '';
        state.weaponRarity = 'all';
        state.weaponType = 'all';
        closeDetail();
        renderMain();
        if (isMobile()) openDetail();
      }
    });
    var bd = document.getElementById('gBackdrop2');
    if (bd) bd.addEventListener('click', closeDetail);

    renderGenshinFilters();
    renderSort();
    renderGenshinList();
  }

  function renderGenshinFilters() {
    var ops = DATA.genshin.operators;
    var rarities = [5, 4].filter(function (r) {
      return ops.some(function (o) { return o.rarity === r; });
    });
    var rEl = document.getElementById('gRarity');
    if (rEl) {
      rEl.innerHTML = '<button class="g-chip' + (state.rarity === 'all' ? ' on' : '') + '" data-rarity="all">全部星级</button>' +
        rarities.map(function (r) {
          return '<button class="g-chip' + (state.rarity === String(r) ? ' on' : '') + '" data-rarity="' + r + '">' + r + '★</button>';
        }).join('');
    }
    var elements = ELEMENT_ORDER.filter(function (e) {
      return ops.some(function (o) { return o.element === e; });
    });
    var eEl = document.getElementById('gElement');
    if (eEl) {
      eEl.innerHTML = '<button class="g-chip' + (state.element === 'all' ? ' on' : '') + '" data-element="all">全部元素</button>' +
        elements.map(function (e) {
          return '<button class="g-chip' + (state.element === e ? ' on' : '') + '" data-element="' + esc(e) + '">' + esc(e) + '</button>';
        }).join('');
    }
    var weapons = WEAPON_ORDER.filter(function (w) {
      return ops.some(function (o) { return o.weapon === w; });
    });
    var wEl = document.getElementById('gWeapon');
    if (wEl) {
      wEl.innerHTML = '<button class="g-chip' + (state.weapon === 'all' ? ' on' : '') + '" data-weapon="all">全部武器</button>' +
        weapons.map(function (w) {
          return '<button class="g-chip' + (state.weapon === w ? ' on' : '') + '" data-weapon="' + esc(w) + '">' + esc(w) + '</button>';
        }).join('');
    }
  }

  function filteredGenshin() {
    var q = state.q.toLowerCase();
    return DATA.genshin.operators.filter(function (o) {
      if (state.rarity !== 'all' && o.rarity !== Number(state.rarity)) return false;
      if (state.element !== 'all' && o.element !== state.element) return false;
      if (state.weapon !== 'all' && o.weapon !== state.weapon) return false;
      if (q && [o.name, o.element, o.weapon, o.region, o.tags].join(' ').toLowerCase().indexOf(q) < 0) return false;
      return true;
    }).sort(sortByRelease);
  }

  function renderGenshinList() {
    var list = filteredGenshin();
    var countEl = document.getElementById('gCount');
    if (countEl) countEl.textContent = list.length + ' 名';
    if (!list.some(function (o) { return o.name === state.selected; })) {
      state.selected = list.length ? list[0].name : '';
    }
    var el = document.getElementById('gList');
    if (!el) return;
    el.innerHTML = list.length ? list.map(function (o) {
      var ec = ELEMENT_COLOR[o.element] || rarityColor(o.rarity);
      return '<button class="g-item' + (o.name === state.selected ? ' on' : '') + '" data-op="' + esc(o.name) + '">' +
        avatarHTML(o, 'g-avatar', ec) +
        '<span class="g-item-main"><b>' + esc(o.name) + '</b><small>' +
        esc(o.element || '未知') + (o.weapon ? ' · ' + esc(o.weapon) : '') +
        '</small></span>' +
        '<span class="g-stars" style="--rc:' + rarityColor(o.rarity) + '">' + stars(o.rarity) + '</span>' +
        '</button>';
    }).join('') : '<div class="g-empty-list">没有匹配的角色<br>试试清空搜索或切换筛选</div>';
    renderGenshinDetail();
  }

  function renderGenshinDetail() {
    var el = document.getElementById('gDetail');
    if (!el) return;
    var o = DATA.genshin.operators.find(function (x) { return x.name === state.selected; });
    if (!o) {
      el.innerHTML = '<div class="g-detail-empty">选择左侧角色查看材料</div>';
      return;
    }
    var ec = ELEMENT_COLOR[o.element] || rarityColor(o.rarity);
    var sub = [o.region, o.tags].filter(Boolean).join(' · ');
    var html = '<div class="g-dhead"><div class="g-dhead-main">' +
      avatarHTML(o, 'g-davatar', ec) +
      '<div>' +
      '<h2><span class="g-rarity" style="--rc:' + rarityColor(o.rarity) + '">' + stars(o.rarity) + '</span>' + esc(o.name) +
      '<span class="g-class" style="color:' + ec + '">' + esc(o.element || '未知') + '</span>' +
      '<span class="g-class">' + esc(o.weapon || '未知') + '</span></h2>' +
      '<div class="sub">' + (sub ? esc(sub) : '暂无标签') + '</div>' +
      '</div></div><div style="display:flex;gap:7px;align-items:center">' +
      '<a class="g-source" href="' + esc(o.url) + '" target="_blank" rel="noopener">观测枢页面 ↗</a>' +
      '<button class="g-close" data-close-detail aria-label="关闭">×</button></div></div>' +
      '<div class="g-meta"><span>角色升级</span><span>角色突破材料</span><span>天赋需求</span>' +
      (o.release ? '<span>' + (o.releaseApprox ? '登场 ' : '上线 ') + esc(o.release.slice(0, 10)) + '</span>' : '') +
      '<span>数据源：观测枢</span></div>' +
      '<div class="g-sec">角色升级（1 → 90）</div>' +
      renderLeveling(o) +
      '<div class="g-sec">角色突破材料（合计）</div>' +
      '<div class="g-mat-group">' + matChips(o.ascension) + '</div>';

    if (o.talents && o.talents.length) {
      var first = o.talents[0];
      var same = o.talents.every(function (t) {
        return materialSig(t.materials) === materialSig(first.materials);
      });
      if (same) {
        var talentMora = (first.levels || []).reduce(function (n, lv) {
          return n + (TALENT_MORA[lv.range] || 0);
        }, 0);
        html += '<div class="g-sec">天赋需求（三个天赋消耗相同）</div>' +
          '<div class="g-mat-group"><div class="g-mat-label">单个天赋 1 → 10 级</div>' +
          matChips(first.materials, talentMora) + '</div>' +
          '<div class="g-mat-label" style="margin:12px 0 4px">逐级需求</div>';
        (first.levels || []).forEach(function (lv) {
          html += '<div class="g-skill-row"><div class="lbl">' + esc(lv.range) + ' 级</div>' +
            matChips(lv.materials, TALENT_MORA[lv.range] || 0) + '</div>';
        });
        if (!(first.levels || []).length) {
          html += '<div class="g-warn">观测枢未提供逐级材料明细。</div>';
        }
      } else {
        html += '<div class="g-sec">单个天赋需求</div>';
        o.talents.forEach(function (t) {
          var lbl = (t.icon
            ? '<img class="g-talent-icon" src="' + esc(t.icon) + '" alt="" loading="lazy" onerror="this.remove()">'
            : '') + '<span>' + esc(t.label) + '</span>';
          html += '<div class="g-skill-row"><div class="lbl" title="' + esc(t.name) + '">' + lbl + '</div>' +
            matChips(t.materials) + '</div>';
        });
      }
    } else {
      html += '<div class="g-sec">天赋升级材料</div>' +
        '<div class="g-warn">观测枢未收录该角色的天赋升级材料，可能是旅行者或特殊条目；这里不做补猜。</div>';
    }
    if (o.recommendedWeapons && o.recommendedWeapons.length) {
      html += '<div class="g-sec">推荐武器</div><div class="g-reco-list">' +
        o.recommendedWeapons.map(function (r) {
          var exists = WEAPONS && WEAPONS.weapons.some(function (w) { return w.name === r.name; });
          return '<div class="g-reco' + (exists ? ' clickable' : '') + '"' +
            (exists ? ' data-reco-weapon="' + esc(r.name) + '"' : '') + '>' +
            (r.icon
              ? '<img class="g-reco-icon" src="' + esc(r.icon) + '" alt="' + esc(r.name) + '" loading="lazy" onerror="this.remove()">'
              : '<span class="g-reco-icon"></span>') +
            '<div class="g-reco-main"><b>' + esc(r.name) + '</b><p>' +
            esc(r.reason || '观测枢未填写推荐理由') + '</p></div></div>';
        }).join('') + '</div>';
    }
    html += '<div class="g-warn" style="margin-top:16px">角色经验按 1 → 90 累计，经验书按大英雄的经验 20,000 经验/本折算；摩拉含升级与突破。天赋材料按 1 → 10 级累计，逐级含摩拉；三个天赋消耗相同，三项都升满则材料与摩拉 ×3；不含命之座。数据来自米游社观测枢。</div>';
    el.innerHTML = html;
  }

  function renderGenshinWeapons() {
    var host = document.getElementById('gGenshinBody');
    if (WEAPON_ERROR) {
      host.innerHTML = '<div class="g-notice"><div class="eyebrow">数据加载失败</div>' +
        '<h2>读取不到 genshin-weapons.json</h2><p>' + esc(WEAPON_ERROR) + '</p></div>';
      return;
    }
    if (!WEAPONS) {
      host.innerHTML = '<div class="g-loading">正在读取武器数据…</div>';
      return;
    }
    host.innerHTML = '<div class="g-layout">' +
      '<aside class="g-side"><div class="g-tools">' +
      '<input class="g-search" id="gSearch" placeholder="搜索武器名…" autocomplete="off">' +
      '<div class="g-sort-row"><button class="g-sort" id="gSort">星级 ↓ 高→低</button><span class="g-count" id="gCount"></span></div>' +
      '<div class="g-filters" id="gRarity"></div>' +
      '<div class="g-filters" id="gWeaponType"></div>' +
      '</div><div class="g-list" id="gList"></div></aside>' +
      '<section class="g-detail" id="gDetail"></section>' +
      '</div><div class="g-backdrop" id="gBackdrop2"></div>';

    document.getElementById('gSearch').addEventListener('input', function (ev) {
      state.q = ev.target.value.trim();
      renderWeaponList();
    });
    document.getElementById('gSort').addEventListener('click', function () {
      state.weaponSort = state.weaponSort === 'rarity-desc' ? 'rarity-asc' : 'rarity-desc';
      renderWeaponSort();
      renderWeaponList();
    });
    document.getElementById('gRarity').addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-rarity]');
      if (!b) return;
      state.weaponRarity = b.getAttribute('data-rarity');
      renderWeaponFilters();
      renderWeaponList();
    });
    document.getElementById('gWeaponType').addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-wtype]');
      if (!b) return;
      state.weaponType = b.getAttribute('data-wtype');
      renderWeaponFilters();
      renderWeaponList();
    });
    document.getElementById('gList').addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-op]');
      if (!b) return;
      state.selected = b.getAttribute('data-op');
      markSelected();
      renderWeaponDetail();
      if (isMobile()) openDetail();
    });
    document.getElementById('gDetail').addEventListener('click', function (ev) {
      if (ev.target.closest('[data-close-detail]')) closeDetail();
    });
    var bd = document.getElementById('gBackdrop2');
    if (bd) bd.addEventListener('click', closeDetail);

    renderWeaponFilters();
    renderWeaponSort();
    renderWeaponList();
  }

  function renderWeaponFilters() {
    var list = WEAPONS.weapons;
    var rarities = [5, 4, 3, 2, 1].filter(function (r) {
      return list.some(function (w) { return w.rarity === r; });
    });
    var rEl = document.getElementById('gRarity');
    if (rEl) {
      rEl.innerHTML = '<button class="g-chip' + (state.weaponRarity === 'all' ? ' on' : '') + '" data-rarity="all">全部星级</button>' +
        rarities.map(function (r) {
          return '<button class="g-chip' + (state.weaponRarity === String(r) ? ' on' : '') + '" data-rarity="' + r + '">' + r + '★</button>';
        }).join('');
    }
    var types = WEAPON_ORDER.filter(function (t) {
      return list.some(function (w) { return w.type === t; });
    });
    var tEl = document.getElementById('gWeaponType');
    if (tEl) {
      tEl.innerHTML = '<button class="g-chip' + (state.weaponType === 'all' ? ' on' : '') + '" data-wtype="all">全部武器</button>' +
        types.map(function (t) {
          return '<button class="g-chip' + (state.weaponType === t ? ' on' : '') + '" data-wtype="' + esc(t) + '">' + esc(t) + '</button>';
        }).join('');
    }
  }

  function renderWeaponSort() {
    var b = document.getElementById('gSort');
    if (b) b.textContent = state.weaponSort === 'rarity-desc' ? '星级 ↓ 高→低' : '星级 ↑ 低→高';
  }

  function filteredWeapons() {
    var q = state.q.toLowerCase();
    return WEAPONS.weapons.filter(function (w) {
      if (state.weaponRarity !== 'all' && w.rarity !== Number(state.weaponRarity)) return false;
      if (state.weaponType !== 'all' && w.type !== state.weaponType) return false;
      if (q && [w.name, w.type, w.attribute, w.obtain].join(' ').toLowerCase().indexOf(q) < 0) return false;
      return true;
    }).sort(function (a, b) {
      var d = state.weaponSort === 'rarity-asc' ? a.rarity - b.rarity : b.rarity - a.rarity;
      if (d) return d;
      var ia = WEAPON_ORDER.indexOf(a.type);
      var ib = WEAPON_ORDER.indexOf(b.type);
      if (ia !== ib) return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
      return a.name.localeCompare(b.name, 'zh-Hans-CN');
    });
  }

  function renderWeaponList() {
    var list = filteredWeapons();
    var countEl = document.getElementById('gCount');
    if (countEl) countEl.textContent = list.length + ' 把';
    if (!list.some(function (w) { return w.name === state.selected; })) {
      state.selected = list.length ? list[0].name : '';
    }
    var el = document.getElementById('gList');
    if (!el) return;
    el.innerHTML = list.length ? list.map(function (w) {
      return '<button class="g-item' + (w.name === state.selected ? ' on' : '') + '" data-op="' + esc(w.name) + '">' +
        avatarHTML(w, 'g-avatar', rarityColor(w.rarity)) +
        '<span class="g-item-main"><b>' + esc(w.name) + '</b><small>' +
        esc(w.type || '未知') + (w.attribute ? ' · ' + esc(w.attribute) : '') +
        '</small></span>' +
        '<span class="g-stars" style="--rc:' + rarityColor(w.rarity) + '">' + stars(w.rarity) + '</span>' +
        '</button>';
    }).join('') : '<div class="g-empty-list">没有匹配的武器<br>试试清空搜索或切换筛选</div>';
    renderWeaponDetail();
  }

  function renderWeaponDetail() {
    var el = document.getElementById('gDetail');
    if (!el) return;
    var w = WEAPONS.weapons.find(function (x) { return x.name === state.selected; });
    if (!w) {
      el.innerHTML = '<div class="g-detail-empty">选择左侧武器查看材料</div>';
      return;
    }
    var rc = rarityColor(w.rarity);
    var sub = [w.attribute, w.obtain].filter(Boolean).join(' · ');
    var html = '<div class="g-dhead"><div class="g-dhead-main">' +
      avatarHTML(w, 'g-davatar', rc) +
      '<div>' +
      '<h2><span class="g-rarity" style="--rc:' + rc + '">' + stars(w.rarity) + '</span>' + esc(w.name) +
      '<span class="g-class">' + esc(w.type || '未知') + '</span></h2>' +
      '<div class="sub">' + (sub ? esc(sub) : '暂无标签') + '</div>' +
      '</div></div><div style="display:flex;gap:7px;align-items:center">' +
      '<a class="g-source" href="' + esc(w.url) + '" target="_blank" rel="noopener">观测枢页面 ↗</a>' +
      '<button class="g-close" data-close-detail aria-label="关闭">×</button></div></div>' +
      '<div class="g-meta"><span>1 → 90 总需求</span><span>突破材料</span><span>数据源：观测枢</span></div>' +
      '<div class="g-sec">武器养成总需求（1 → 90）</div>' +
      '<div class="g-mat-group">' + matChips(w.total) + '</div>' +
      '<div class="g-sec">突破材料（按阶段）</div>';

    if (w.ascensions && w.ascensions.length) {
      html += '<div class="g-level-list">' + w.ascensions.map(function (a) {
        return '<div class="g-level-card"><div class="g-level-head"><b>' + esc(a.phase) + ' 级突破</b></div>' +
          '<div class="g-level-mats">' + matChips(a.materials) + '</div></div>';
      }).join('') + '</div>';
    } else {
      html += '<div class="g-warn">观测枢未提供该武器的阶段突破材料。</div>';
    }
    html += '<div class="g-warn" style="margin-top:16px">总需求包含精锻用魔矿与摩拉；精炼消耗同名武器，未计入。数据来自米游社观测枢。</div>';
    el.innerHTML = html;
  }

  function renderSort() {
    var b = document.getElementById('gSort');
    if (b) b.textContent = state.sort === 'release-desc' ? '上线时间 ↓ 新→旧' : '上线时间 ↑ 旧→新';
  }

  function renderFilters() {
    var rarities = [6, 5, 4, 3, 2, 1].filter(function (r) {
      return DATA.arknights.operators.some(function (o) { return o.rarity === r; });
    });
    var rh = '<button class="g-chip' + (state.rarity === 'all' ? ' on' : '') + '" data-rarity="all">全部星级</button>' +
      rarities.map(function (r) {
        return '<button class="g-chip' + (state.rarity === String(r) ? ' on' : '') + '" data-rarity="' + r + '">' + r + '★</button>';
      }).join('');
    var rEl = document.getElementById('gRarity');
    if (rEl) rEl.innerHTML = rh;

    var ch = '<button class="g-chip' + (state.cls === 'all' ? ' on' : '') + '" data-cls="all">全部职业</button>' +
      classes().map(function (c) {
        return '<button class="g-chip' + (state.cls === c ? ' on' : '') + '" data-cls="' + esc(c) + '">' + esc(c) + '</button>';
      }).join('');
    var cEl = document.getElementById('gClass');
    if (cEl) cEl.innerHTML = ch;
  }

  function releaseTime(o) {
    var m = String(o.release || '').match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2}))?/);
    if (!m) return 0;
    return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0)).getTime();
  }

  function sortByRelease(a, b) {
    var ta = releaseTime(a);
    var tb = releaseTime(b);
    if (!ta && !tb) return (b.rarity || 0) - (a.rarity || 0) || a.name.localeCompare(b.name, 'zh-Hans-CN');
    if (!ta) return 1;
    if (!tb) return -1;
    if (ta !== tb) return state.sort === 'release-asc' ? ta - tb : tb - ta;
    return (b.rarity || 0) - (a.rarity || 0) || a.name.localeCompare(b.name, 'zh-Hans-CN');
  }

  function filtered() {
    var q = state.q.toLowerCase();
    return DATA.arknights.operators.filter(function (o) {
      if (state.rarity !== 'all' && o.rarity !== Number(state.rarity)) return false;
      if (state.cls !== 'all' && o.class !== state.cls) return false;
      if (q && o.name.toLowerCase().indexOf(q) < 0 && (o.branch || '').toLowerCase().indexOf(q) < 0) return false;
      return true;
    }).sort(sortByRelease);
  }

  function renderList() {
    var list = filtered();
    var countEl = document.getElementById('gCount');
    if (countEl) countEl.textContent = list.length + ' 名';
    if (!list.some(function (o) { return o.name === state.selected; })) {
      state.selected = list.length ? list[0].name : '';
    }
    var el = document.getElementById('gList');
    if (!el) return;
    el.innerHTML = list.length ? list.map(function (o) {
      var rc = rarityColor(o.rarity);
      return '<button class="g-item' + (o.name === state.selected ? ' on' : '') + '" data-op="' + esc(o.name) + '">' +
        avatarHTML(o, 'g-avatar') +
        '<span class="g-item-main"><b>' + esc(o.name) + '</b><small>' + esc(o.class || '未知') + (o.branch ? ' · ' + esc(o.branch) : '') + '</small></span>' +
        '<span class="g-stars" style="--rc:' + rc + '">' + stars(o.rarity) + '</span>' +
        '</button>';
    }).join('') : '<div class="g-empty-list">没有匹配的干员<br>试试清空搜索或切换筛选</div>';
    renderDetail();
  }

  function markSelected() {
    document.querySelectorAll('#gList .g-item').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-op') === state.selected);
    });
  }

  function matChips(mats, mora) {
    var chips = (mats || []).map(function (m) {
      var num = m.qty && m.qty.num != null ? ' title="' + m.qty.num + '"' : '';
      var icon = m.icon
        ? '<img class="g-mat-icon" src="' + esc(m.icon) + '" alt="' + esc(m.name) + '" loading="lazy" onerror="this.remove()">'
        : '<i class="g-mat-dot"></i>';
      return '<span class="g-mat"' + num + '>' + icon +
        '<span>' + esc(m.name) + '</span><b>×' + esc(m.qty ? m.qty.text : '') + '</b></span>';
    }).join('');
    if (mora) {
      chips += '<span class="g-mat"><i class="g-mat-dot"></i><span>摩拉</span><b>×' + fmtNum(mora) + '</b></span>';
    }
    return chips ? '<div class="g-mats">' + chips + '</div>' : '<span class="g-none">—</span>';
  }

  function fmtNum(n) {
    return Number(n || 0).toLocaleString('zh-CN');
  }

  function materialSig(mats) {
    return (mats || []).map(function (m) {
      return m.name + ':' + (m.qty && typeof m.qty.num === 'number' ? m.qty.num : 0);
    }).sort().join('|');
  }

  function renderLeveling(o) {
    var lv = DATA.genshin.leveling;
    if (!lv || !lv.phases) return '';
    var html = '<div class="g-level-list">';
    lv.phases.forEach(function (p) {
      var start = String(p.range).split('→')[0];
      var asc = (o.ascensions || []).filter(function (a) { return String(a.phase) === start; })[0];
      html += '<div class="g-level-card">' +
        '<div class="g-level-head"><b>' + esc(p.range) + ' 级</b>' +
        '<span>经验 ' + fmtNum(p.exp) + '</span>' +
        '<span>摩拉 ' + fmtNum(p.mora) + '</span>' +
        '<span>大英雄的经验 ×' + p.books + '</span></div>' +
        (asc && asc.materials.length ? '<div class="g-level-mats">' + matChips(asc.materials) + '</div>' : '') +
        '</div>';
    });
    html += '<div class="g-level-total">合计：经验 ' + fmtNum(lv.expTotal) +
      ' · 摩拉 ' + fmtNum(lv.moraTotal) + ' · 大英雄的经验 ×' + lv.booksTotal + '</div>';
    return html + '</div>';
  }

  function calculatorMora(level) {
    var exp = LEVEL_EXP[Math.max(0, Math.min(LEVEL_EXP.length - 1, level - 1))] || 0;
    var mora = Math.round(exp * 0.2);
    Object.keys(ASCENSION_MORA).forEach(function (gate) {
      if (level > Number(gate)) mora += ASCENSION_MORA[gate];
    });
    return mora;
  }

  function calculateLevel(books, mora) {
    var exp = books * 20000;
    for (var level = LEVEL_EXP.length; level >= 1; level--) {
      if (exp >= LEVEL_EXP[level - 1] && mora >= calculatorMora(level)) return level;
    }
    return 1;
  }

  function runCalculator() {
    var result = document.getElementById('gCalcResult');
    if (!result) return;
    var booksEl = document.getElementById('gCalcBooks');
    var moraEl = document.getElementById('gCalcMora');
    var charEl = document.getElementById('gCalcChar');
    var books = Math.max(0, Math.floor(Number(booksEl && booksEl.value) || 0));
    var mora = Math.max(0, Math.floor(Number(moraEl && moraEl.value) || 0));
    if (!books && !mora) {
      result.innerHTML = '<div class="g-calc-hint">输入大英雄的经验和摩拉后计算。</div>';
      return;
    }
    var level = calculateLevel(books, mora);
    var usedExp = LEVEL_EXP[level - 1];
    var usedMora = calculatorMora(level);
    var usedBooks = Math.ceil(usedExp / 20000);
    var leftBooks = Math.max(0, books - usedBooks);
    var leftMora = Math.max(0, mora - usedMora);
    var html = '<div class="g-calc-level">可达 <b>' + level + '</b> 级</div>' +
      '<div class="g-calc-line">消耗：经验 ' + fmtNum(usedExp) + ' · 大英雄的经验 ' + usedBooks +
      ' 本 · 摩拉 ' + fmtNum(usedMora) + '</div>' +
      '<div class="g-calc-line">剩余：大英雄的经验 ' + leftBooks + ' 本 · 摩拉 ' + fmtNum(leftMora) + '</div>';
    if (level < LEVEL_EXP.length) {
      var nextExp = LEVEL_EXP[level] - LEVEL_EXP[level - 1];
      var nextMora = calculatorMora(level + 1) - usedMora;
      html += '<div class="g-calc-line">升到 ' + (level + 1) + ' 级还需：经验 ' + fmtNum(nextExp) +
        ' · 摩拉 ' + fmtNum(nextMora) + '</div>';
      if ([20, 40, 50, 60, 70, 80].indexOf(level) >= 0) {
        var charName = charEl ? charEl.value : '';
        var char = (DATA.genshin ? DATA.genshin.operators : []).filter(function (o) {
          return o.name === charName;
        })[0];
        var phase = char && (char.ascensions || []).filter(function (a) {
          return Number(a.phase) === level;
        })[0];
        if (phase && phase.materials.length) {
          html += '<div class="g-calc-gate"><div class="g-mat-label">' + level + ' 级突破材料</div>' +
            matChips(phase.materials) + '</div>';
        }
      }
    } else {
      html += '<div class="g-calc-line">已满级。</div>';
    }
    result.innerHTML = html;
  }

  function renderCalculator() {
    var host = document.getElementById('gCalc');
    if (!host) return;
    var chars = DATA.genshin ? DATA.genshin.operators : [];
    host.innerHTML = '<div class="g-calc-head"><div><h2>原神养成计算器</h2>' +
      '<p>输入大英雄的经验和摩拉，估算可达等级；默认突破材料充足，未计入天赋。</p></div></div>' +
      '<div class="g-calc-body">' +
      '<label class="g-calc-field"><span>角色</span><select id="gCalcChar">' +
      chars.map(function (o) {
        return '<option value="' + esc(o.name) + '">' + esc(o.name) + '</option>';
      }).join('') + '</select></label>' +
      '<label class="g-calc-field"><span>大英雄的经验</span><input id="gCalcBooks" type="number" min="0" step="1" placeholder="0"></label>' +
      '<label class="g-calc-field"><span>摩拉</span><input id="gCalcMora" type="number" min="0" step="1000" placeholder="0"></label>' +
      '<button class="g-calc-run" id="gCalcRun">计算</button>' +
      '</div><div class="g-calc-result" id="gCalcResult"><div class="g-calc-hint">输入大英雄的经验和摩拉后计算。</div></div>';
    document.getElementById('gCalcRun').addEventListener('click', runCalculator);
    document.getElementById('gCalcBooks').addEventListener('input', runCalculator);
    document.getElementById('gCalcMora').addEventListener('input', runCalculator);
    document.getElementById('gCalcChar').addEventListener('change', runCalculator);
  }

  function skillOrder(key) {
    if (/^\d+$/.test(key)) return Number(key);
    var m = key.match(/^([一二三])(\d+)$/);
    if (m) {
      var g = { '一': 0, '二': 1, '三': 2 }[m[1]];
      return 100 + g * 10 + Number(m[2]);
    }
    return 999;
  }
  function skillLabel(key) {
    var m = key.match(/^([一二三])(\d+)$/);
    if (m) return '专精' + m[1] + ' Lv' + m[2];
    return '技能 ' + key;
  }

  function renderDetail() {
    var el = document.getElementById('gDetail');
    if (!el) return;
    var o = DATA.arknights.operators.find(function (x) { return x.name === state.selected; });
    if (!o) {
      el.innerHTML = '<div class="g-detail-empty">选择左侧干员查看材料</div>';
      return;
    }
    var rc = rarityColor(o.rarity);
    var elite = o.elite || {};
    var keys = Object.keys(o.skills || {}).sort(function (a, b) { return skillOrder(a) - skillOrder(b); });
    var html = '<div class="g-dhead"><div class="g-dhead-main">' +
      avatarHTML(o, 'g-davatar') +
      '<div>' +
      '<h2><span class="g-rarity" style="--rc:' + rc + '">' + stars(o.rarity) + '</span>' + esc(o.name) +
      '<span class="g-class">' + esc(o.class || '未知') + (o.branch ? ' · ' + esc(o.branch) : '') + '</span></h2>' +
      '<div class="sub">' + (o.tags ? esc(o.tags) : '无标签') + (o.obtain ? ' · 获取：' + esc(o.obtain) : '') + '</div>' +
      '</div></div><div style="display:flex;gap:7px;align-items:center">' +
      '<a class="g-source" href="' + esc(o.url) + '" target="_blank" rel="noopener">PRTS 页面 ↗</a>' +
      '<button class="g-close" data-close-detail aria-label="关闭">×</button></div></div>' +
      '<div class="g-meta"><span>精英化材料</span><span>技能升级材料</span>' +
      (o.release ? '<span>上线 ' + esc(o.release) + '</span>' : '') +
      '<span>数据源：PRTS</span></div>' +
      '<div class="g-sec">精英化材料</div>' +
      '<div class="g-mat-group"><div class="g-mat-label">精英 1</div>' + matChips(elite['精1']) + '</div>' +
      '<div class="g-mat-group"><div class="g-mat-label">精英 2</div>' + matChips(elite['精2']) + '</div>' +
      '<div class="g-sec">技能升级材料</div>';

    if (keys.length) {
      var levelRows = keys.filter(function (k) { return /^\d+$/.test(k); });
      var masterRows = keys.filter(function (k) { return /^[一二三]\d+$/.test(k); });
      if (levelRows.length) {
        html += '<div class="g-mat-label" style="margin:2px 0 4px">技能等级 2 – 7</div>';
        levelRows.forEach(function (k) {
          html += '<div class="g-skill-row"><div class="lbl">' + skillLabel(k) + '</div>' + matChips(o.skills[k]) + '</div>';
        });
      }
      if (masterRows.length) {
        html += '<div class="g-mat-label" style="margin:12px 0 4px">专精一 / 二 / 三</div>';
        masterRows.forEach(function (k) {
          html += '<div class="g-skill-row"><div class="lbl">' + skillLabel(k) + '</div>' + matChips(o.skills[k]) + '</div>';
        });
      }
    } else {
      html += '<div class="g-warn">PRTS 未收录该干员的技能升级材料，可能是特殊/剧情/联动干员，或页面未使用标准材料模板。这里不做补猜。</div>';
    }
    html += '<div class="g-warn" style="margin-top:16px">本页只收录精英化与技能升级材料，未包含模组材料与专精三之后的其他消耗；数量保留 PRTS 原始写法（w = 万）。</div>';
    el.innerHTML = html;
  }

  function openDetail() {
    var d = document.getElementById('gDetail');
    var b = document.getElementById('gBackdrop2');
    if (d) d.classList.add('open');
    if (b) b.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeDetail() {
    var d = document.getElementById('gDetail');
    var b = document.getElementById('gBackdrop2');
    if (d) d.classList.remove('open');
    if (b) b.classList.remove('open');
    document.body.style.overflow = '';
  }

  function renderMain() {
    renderTabs();
    var main = document.getElementById('gMain');
    var calc = document.getElementById('gCalc');
    var showCalc = state.game === 'genshin' && state.genshinMode === 'characters' && !!DATA.genshin;
    if (calc) calc.style.display = showCalc ? '' : 'none';
    if (ERRORS[state.game]) {
      main.innerHTML = '<div class="g-notice"><div class="eyebrow">数据加载失败</div>' +
        '<h2>读取不到 ' + esc(state.game) + '.json</h2>' +
        '<p>' + esc(ERRORS[state.game]) + '</p>' +
        '<p>请通过 node server.mjs 的 8001 / 8002 端口打开本页，不要直接双击 HTML。</p></div>';
      return;
    }
    if (state.game === 'arknights') {
      if (DATA.arknights) renderArknights();
      else main.innerHTML = '<div class="g-loading">正在读取 PRTS 材料数据…</div>';
    } else if (state.game === 'genshin') {
      if (DATA.genshin) {
        if (!document.getElementById('gCalcChar')) renderCalculator();
        renderGenshin();
      } else {
        main.innerHTML = '<div class="g-loading">正在读取观测枢数据…</div>';
      }
    } else {
      main.innerHTML = renderNotice(state.game);
    }
  }

  function updateSummary() {
    var total = 0;
    var updated = '';
    Object.keys(DATA).forEach(function (id) {
      total += DATA[id].count || 0;
      if (DATA[id].updated && DATA[id].updated > updated) updated = DATA[id].updated;
    });
    var c = document.getElementById('gOpCount');
    var u = document.getElementById('gUpdated');
    if (c) c.textContent = total;
    if (u) u.textContent = updated || '—';
  }

  function loadGrowth(id, url) {
    return fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        DATA[id] = data;
      })
      .catch(function (err) {
        ERRORS[id] = err.message;
      });
  }

  function loadWeapons() {
    return fetch('/data/growth/genshin-weapons.json')
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        WEAPONS = data;
      })
      .catch(function (err) {
        WEAPON_ERROR = err.message;
      });
  }

  document.getElementById('gTabs').addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-game]');
    if (!b) return;
    state.game = b.getAttribute('data-game');
    state.q = '';
    state.rarity = 'all';
    state.cls = 'all';
    state.element = 'all';
    state.weapon = 'all';
    state.genshinMode = 'characters';
    state.weaponRarity = 'all';
    state.weaponType = 'all';
    state.weaponSort = 'rarity-desc';
    state.selected = '';
    closeDetail();
    renderMain();
  });

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') closeDetail();
  });

  Promise.all([
    loadGrowth('arknights', '/data/growth/arknights.json'),
    loadGrowth('genshin', '/data/growth/genshin.json'),
    loadWeapons()
  ]).then(function () {
    updateSummary();
    renderCalculator();
    renderMain();
  });
})();
