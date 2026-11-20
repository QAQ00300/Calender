/* 游戏活动日历 · 构建产物
 * 请勿直接编辑本文件；数据源为 data/<游戏>.json，运行 node scripts/build.mjs 重新生成。
 * 时间均为北京时间（UTC+8）；end 为 null 表示官方未公布结束时间。
 */

const DATA_UPDATED = "2026-11-20";

const GAMES = [
  {
    "id": "genshin",
    "name": "原神",
    "short": "原神",
    "color": "#7aa2ff"
  },
  {
    "id": "hsr",
    "name": "崩坏：星穹铁道",
    "short": "星铁",
    "color": "#b98cff"
  },
  {
    "id": "zzz",
    "name": "绝区零",
    "short": "绝区零",
    "color": "#ffcf5c"
  },
  {
    "id": "endfield",
    "name": "明日方舟：终末地",
    "short": "终末地",
    "color": "#4fd9a8"
  },
  {
    "id": "arknights",
    "name": "明日方舟",
    "short": "明日方舟",
    "color": "#ff8a65"
  },
  {
    "id": "wuwa",
    "name": "鸣潮",
    "short": "鸣潮",
    "color": "#4ec9ff"
  },
  {
    "id": "fgo",
    "name": "Fate/Grand Order",
    "short": "FGO",
    "color": "#d8b26a"
  }
];

const TYPES = {
  "version": {
    "label": "版本",
    "glyph": "◈"
  },
  "banner": {
    "label": "卡池",
    "glyph": "★"
  },
  "event": {
    "label": "活动",
    "glyph": "◆"
  },
  "preview": {
    "label": "前瞻",
    "glyph": "▶"
  }
};

const EVENTS = [
  {
    "id": "fgo-18232",
    "game": "fgo",
    "type": "event",
    "title": "「Final Order Project [Lostbelt No.1]通关应援纪念活动」",
    "subtitle": "国服限时活动",
    "start": "2026-08-11T19:00:00+08:00",
    "end": "2026-10-31T13:59:00+08:00",
    "banners": [],
    "details": [
      "时间：2026-08-11 19:00 – 2026-10-31 13:59",
      "公告发布时间：2026-08-08 23:00:10"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18232",
    "image": "data/images/fgo/fgo-18232-1.png",
    "gallery": [
      "data/images/fgo/fgo-18232-1.png",
      "data/images/fgo/fgo-18232-2.png",
      "data/images/fgo/fgo-18232-3.png"
    ]
  },
  {
    "id": "fgo-18252",
    "game": "fgo",
    "type": "event",
    "title": "「Final Order Project [Lostbelt No.2]通关应援纪念活动」",
    "subtitle": "国服限时活动",
    "start": "2026-08-18T19:00:00+08:00",
    "end": "2026-10-31T13:59:00+08:00",
    "banners": [],
    "details": [
      "时间：2026-08-18 19:00 – 2026-10-31 13:59",
      "公告发布时间：2026-08-13 17:22:50"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18252",
    "image": "data/images/fgo/fgo-18252-1.png",
    "gallery": [
      "data/images/fgo/fgo-18252-1.png",
      "data/images/fgo/fgo-18252-2.png",
      "data/images/fgo/fgo-18252-3.png"
    ]
  },
  {
    "id": "fgo-18267",
    "game": "fgo",
    "type": "event",
    "title": "「Final Order Project [Lostbelt No.3]通关应援纪念活动」",
    "subtitle": "国服限时活动",
    "start": "2026-08-25T19:00:00+08:00",
    "end": "2026-10-31T13:59:00+08:00",
    "banners": [],
    "details": [
      "时间：2026-08-25 19:00 – 2026-10-31 13:59",
      "公告发布时间：2026-08-21 10:59:49"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18267",
    "image": "data/images/fgo/fgo-18267-1.png",
    "gallery": [
      "data/images/fgo/fgo-18267-1.png",
      "data/images/fgo/fgo-18267-2.png",
      "data/images/fgo/fgo-18267-3.png"
    ]
  },
  {
    "id": "fgo-18289",
    "game": "fgo",
    "type": "event",
    "title": "「Final Order Project [Lostbelt No.4]通关应援纪念活动」",
    "subtitle": "国服限时活动",
    "start": "2026-09-01T19:00:00+08:00",
    "end": "2026-10-31T13:59:00+08:00",
    "banners": [],
    "details": [
      "时间：2026-09-01 19:00 – 2026-10-31 13:59",
      "公告发布时间：2026-08-27 16:22:34"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18289",
    "image": "data/images/fgo/fgo-18289-1.png",
    "gallery": [
      "data/images/fgo/fgo-18289-1.png",
      "data/images/fgo/fgo-18289-2.png",
      "data/images/fgo/fgo-18289-3.png"
    ]
  },
  {
    "id": "fgo-18319",
    "game": "fgo",
    "type": "event",
    "title": "「Final Order Project [Lostbelt No.5]通关应援纪念活动」",
    "subtitle": "国服限时活动",
    "start": "2026-09-08T19:00:00+08:00",
    "end": "2026-10-31T13:59:00+08:00",
    "banners": [],
    "details": [
      "时间：2026-09-08 19:00 – 2026-10-31 13:59",
      "公告发布时间：2026-09-04 14:48:56"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18319",
    "image": "data/images/fgo/fgo-18319-1.png",
    "gallery": [
      "data/images/fgo/fgo-18319-1.png",
      "data/images/fgo/fgo-18319-2.png",
      "data/images/fgo/fgo-18319-3.png"
    ]
  },
  {
    "id": "fgo-18344",
    "game": "fgo",
    "type": "event",
    "title": "「Final Order Project [Lostbelt No.6]通关应援纪念活动」",
    "subtitle": "国服限时活动",
    "start": "2026-09-15T19:00:00+08:00",
    "end": "2026-10-31T13:59:00+08:00",
    "banners": [],
    "details": [
      "时间：2026-09-15 19:00 – 2026-10-31 13:59",
      "公告发布时间：2026-09-11 14:33:44"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18344",
    "image": "data/images/fgo/fgo-18344-1.png",
    "gallery": [
      "data/images/fgo/fgo-18344-1.png",
      "data/images/fgo/fgo-18344-2.png",
      "data/images/fgo/fgo-18344-3.png"
    ]
  },
  {
    "id": "fgo-18384",
    "game": "fgo",
    "type": "event",
    "title": "「Final Order Project [Lostbelt No.7]通关应援纪念活动」",
    "subtitle": "国服限时活动",
    "start": "2026-09-22T19:00:00+08:00",
    "end": "2026-10-31T13:59:00+08:00",
    "banners": [],
    "details": [
      "时间：2026-09-22 19:00 – 2026-10-31 13:59",
      "公告发布时间：2026-09-20 16:17:40"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18384",
    "image": "data/images/fgo/fgo-18384-1.png",
    "gallery": [
      "data/images/fgo/fgo-18384-1.png",
      "data/images/fgo/fgo-18384-2.png",
      "data/images/fgo/fgo-18384-3.png"
    ]
  },
  {
    "id": "fgo-18398",
    "game": "fgo",
    "type": "banner",
    "title": "「唠唠叨叨新选组 THE END 河上彦斋推荐召唤」",
    "subtitle": "河上彦斋 · 京乱怒涛 · 河上彦斋」「★4（SR）藤堂平助」和3种限时概念",
    "start": "2026-09-24T19:00:00+08:00",
    "end": "2026-10-22T13:59:00+08:00",
    "banners": [
      {
        "name": "河上彦斋",
        "tag": "5★ SSR"
      },
      {
        "name": "京乱怒涛",
        "tag": "5★ SSR"
      },
      {
        "name": "河上彦斋」「★4（SR）藤堂平助」和3种限时概念",
        "tag": "5★ SSR"
      },
      {
        "name": "河上彦斋」的简易灵衣「无笠的彦斋」的开放权登场！",
        "tag": "5★ SSR"
      }
    ],
    "details": [
      "时间：2026-09-24 19:00 – 2026-10-22 13:59",
      "公告发布时间：2026-09-22 14:47:01"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18398",
    "image": "data/images/fgo/fgo-18398-1.png",
    "gallery": [
      "data/images/fgo/fgo-18398-1.png",
      "data/images/fgo/fgo-18398-2.png",
      "data/images/fgo/fgo-18398-3.png"
    ]
  },
  {
    "id": "fgo-18397",
    "game": "fgo",
    "type": "event",
    "title": "「幕末武斗神话 唠唠叨叨新选组 THE END REVENGE OF MAKOTO」",
    "subtitle": "国服限时活动",
    "start": "2026-09-24T19:00:00+08:00",
    "end": "2026-10-15T13:59:00+08:00",
    "banners": [],
    "details": [
      "时间：2026-09-24 19:00 – 2026-10-15 13:59",
      "公告发布时间：2026-09-22 14:43:07"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18397",
    "image": "data/images/fgo/fgo-18397-1.png",
    "gallery": [
      "data/images/fgo/fgo-18397-1.png",
      "data/images/fgo/fgo-18397-2.png",
      "data/images/fgo/fgo-18397-3.png"
    ]
  },
  {
    "id": "fgo-18399",
    "game": "fgo",
    "type": "banner",
    "title": "「唠唠叨叨新选组 THE END推荐召唤2」",
    "subtitle": "土方岁三 · 冲田总司（Saber） · 土方岁三」「★5（SSR）冲田总司（Saber）",
    "start": "2026-09-26T19:00:00+08:00",
    "end": "2026-10-15T13:59:00+08:00",
    "banners": [
      {
        "name": "土方岁三",
        "tag": "5★ SSR"
      },
      {
        "name": "冲田总司（Saber）",
        "tag": "5★ SSR"
      },
      {
        "name": "土方岁三」「★5（SSR）冲田总司（Saber）",
        "tag": "5★ SSR"
      },
      {
        "name": "土方岁三」的灵衣「浅葱羽织袴」的开放权登场！",
        "tag": "5★ SSR"
      }
    ],
    "details": [
      "时间：2026-09-26 19:00 – 2026-10-15 13:59",
      "公告发布时间：2026-09-22 15:04:12"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18399",
    "image": "data/images/fgo/fgo-18399-1.png",
    "gallery": [
      "data/images/fgo/fgo-18399-1.png",
      "data/images/fgo/fgo-18399-2.png",
      "data/images/fgo/fgo-18399-3.png"
    ]
  },
  {
    "id": "fgo-18400",
    "game": "fgo",
    "type": "event",
    "title": "「Final Order Project [Ordeal Call I]通关应援纪念活动」",
    "subtitle": "国服限时活动",
    "start": "2026-09-29T19:00:00+08:00",
    "end": "2026-12-20T13:59:00+08:00",
    "banners": [],
    "details": [
      "时间：2026-09-29 19:00 – 2026-12-20 13:59",
      "公告发布时间：2026-09-22 15:07:09"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18400",
    "image": "data/images/fgo/fgo-18400-1.png",
    "gallery": [
      "data/images/fgo/fgo-18400-1.png",
      "data/images/fgo/fgo-18400-2.png",
      "data/images/fgo/fgo-18400-3.png"
    ]
  },
  {
    "id": "fgo-18406",
    "game": "fgo",
    "type": "banner",
    "title": "「唠唠叨叨新选组 THE END 近藤勇推荐召唤」",
    "subtitle": "近藤勇 · 京乱怒涛 · 近藤勇」「★4（SR）藤堂平助」和3种限时概念礼",
    "start": "2026-09-30T19:00:00+08:00",
    "end": "2026-10-15T13:59:00+08:00",
    "banners": [
      {
        "name": "近藤勇",
        "tag": "5★ SSR"
      },
      {
        "name": "京乱怒涛",
        "tag": "5★ SSR"
      },
      {
        "name": "近藤勇」「★4（SR）藤堂平助」和3种限时概念礼",
        "tag": "5★ SSR"
      },
      {
        "name": "近藤勇」的简易灵衣「白之虎彻」的开放权登场！",
        "tag": "5★ SSR"
      }
    ],
    "details": [
      "时间：2026-09-30 19:00 – 2026-10-15 13:59",
      "公告发布时间：2026-09-24 11:04:21"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18406",
    "image": "data/images/fgo/fgo-18406-1.png",
    "gallery": [
      "data/images/fgo/fgo-18406-1.png",
      "data/images/fgo/fgo-18406-2.png",
      "data/images/fgo/fgo-18406-3.png"
    ]
  },
  {
    "id": "fgo-18407",
    "game": "fgo",
    "type": "banner",
    "title": "「唠唠叨叨新选组 THE END推荐召唤4」",
    "subtitle": "织田信长（魔王信长） · 坂本龙马（Lancer） · 魔王信长（织田信长）",
    "start": "2026-10-03T19:00:00+08:00",
    "end": "2026-10-12T13:59:00+08:00",
    "banners": [
      {
        "name": "织田信长（魔王信长）",
        "tag": "5★ SSR"
      },
      {
        "name": "坂本龙马（Lancer）",
        "tag": "5★ SSR"
      },
      {
        "name": "魔王信长（织田信长）",
        "tag": "5★ SSR"
      },
      {
        "name": "织田信长",
        "tag": "5★ SSR"
      }
    ],
    "details": [
      "时间：2026-10-03 19:00 – 2026-10-12 13:59",
      "公告发布时间：2026-09-24 11:15:16"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18407",
    "image": "data/images/fgo/fgo-18407-1.png",
    "gallery": [
      "data/images/fgo/fgo-18407-1.png",
      "data/images/fgo/fgo-18407-2.png",
      "data/images/fgo/fgo-18407-3.png"
    ]
  },
  {
    "id": "fgo-18411",
    "game": "fgo",
    "type": "event",
    "title": "「冠位戴冠战：Assassin」开幕前夕纪念活动",
    "subtitle": "国服限时活动",
    "start": "2026-10-04T19:00:00+08:00",
    "end": "2026-10-22T13:59:00+08:00",
    "banners": [],
    "details": [
      "时间：2026-10-04 19:00 – 2026-10-22 13:59",
      "公告发布时间：2026-09-28 14:31:31"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18411",
    "image": "data/images/fgo/fgo-18411-1.png",
    "gallery": [
      "data/images/fgo/fgo-18411-1.png",
      "data/images/fgo/fgo-18411-2.png",
      "data/images/fgo/fgo-18411-3.png"
    ]
  },
  {
    "id": "fgo-18412",
    "game": "fgo",
    "type": "banner",
    "title": "「冠位戴冠战：Assassin」推荐召唤",
    "subtitle": "雾都弃子 · 谜之女主角X · 酒吞童子（Assassin）",
    "start": "2026-10-04T19:00:00+08:00",
    "end": "2026-10-22T13:59:00+08:00",
    "banners": [
      {
        "name": "雾都弃子",
        "tag": "5★ SSR"
      },
      {
        "name": "谜之女主角X",
        "tag": "5★ SSR"
      },
      {
        "name": "酒吞童子（Assassin）",
        "tag": "5★ SSR"
      },
      {
        "name": "&ldquo;山中老人&rdquo;",
        "tag": "5★ SSR"
      }
    ],
    "details": [
      "时间：2026-10-04 19:00 – 2026-10-22 13:59",
      "公告发布时间：2026-09-28 14:43:04"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18412",
    "image": "data/images/fgo/fgo-18412-1.png",
    "gallery": [
      "data/images/fgo/fgo-18412-1.png",
      "data/images/fgo/fgo-18412-2.png",
      "data/images/fgo/fgo-18412-3.png"
    ]
  },
  {
    "id": "fgo-18413",
    "game": "fgo",
    "type": "event",
    "title": "「Final Order Project [Ordeal Call II]通关应援纪念活动」",
    "subtitle": "国服限时活动",
    "start": "2026-10-06T19:00:00+08:00",
    "end": "2026-12-20T13:59:00+08:00",
    "banners": [],
    "details": [
      "时间：2026-10-06 19:00 – 2026-12-20 13:59",
      "公告发布时间：2026-09-28 14:47:04"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18413",
    "image": "data/images/fgo/fgo-18413-1.png",
    "gallery": [
      "data/images/fgo/fgo-18413-1.png",
      "data/images/fgo/fgo-18413-2.png",
      "data/images/fgo/fgo-18413-3.png"
    ]
  },
  {
    "id": "fgo-18434",
    "game": "fgo",
    "type": "banner",
    "title": "「3300万下载纪念 梅塔特隆·贞德推荐召唤」",
    "subtitle": "梅塔特隆·贞德 · 奔赴战场",
    "start": "2026-10-08T19:00:00+08:00",
    "end": "2026-10-22T13:59:00+08:00",
    "banners": [
      {
        "name": "梅塔特隆·贞德",
        "tag": "5★ SSR"
      },
      {
        "name": "奔赴战场",
        "tag": "5★ SSR"
      }
    ],
    "details": [
      "时间：2026-10-08 19:00 – 2026-10-22 13:59",
      "公告发布时间：2026-09-30 20:00:51"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18434",
    "image": "data/images/fgo/fgo-18434-1.png",
    "gallery": [
      "data/images/fgo/fgo-18434-1.png",
      "data/images/fgo/fgo-18434-2.png",
      "data/images/fgo/fgo-18434-3.png"
    ]
  },
  {
    "id": "fgo-18439",
    "game": "fgo",
    "type": "event",
    "title": "「Final Order Project [Ordeal Call III]通关应援纪念活动」",
    "subtitle": "国服限时活动",
    "start": "2026-10-13T19:00:00+08:00",
    "end": "2026-12-20T13:59:00+08:00",
    "banners": [],
    "details": [
      "时间：2026-10-13 19:00 – 2026-12-20 13:59",
      "公告发布时间：2026-10-09 15:37:01"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18439",
    "image": "data/images/fgo/fgo-18439-1.png",
    "gallery": [
      "data/images/fgo/fgo-18439-1.png",
      "data/images/fgo/fgo-18439-2.png",
      "data/images/fgo/fgo-18439-3.png"
    ]
  },
  {
    "id": "ef-version",
    "game": "endfield",
    "type": "version",
    "title": "「丹青渡」版本",
    "subtitle": "核心章节 · 新干员祀 / 明河",
    "start": "2026-10-15T12:00:00+08:00",
    "end": "2026-11-25T11:59:00+08:00",
    "banners": [
      {
        "name": "祀",
        "tag": "6★ · 10/15 – 11/05"
      },
      {
        "name": "明河",
        "tag": "6★ · 11/05 – 11/25"
      }
    ],
    "image": "data/images/endfield-ef-version-1-594bd4f1.jpg",
    "gallery": [
      "data/images/endfield-ef-version-1-594bd4f1.jpg",
      "data/images/endfield-ef-version-2-5fab9e5b.jpg"
    ],
    "details": [
      "版本维护：2026/10/15 06:00 – 12:00（UTC+8）",
      "核心章节「丹青渡」自 10/29 起陆续开放",
      "版本活动：烟火生缘、百趣演武、归野、星河共我、明河作战演练、理智补给、战争回响、密境行者"
    ],
    "note": "版本维护 10/15 06:00–12:00；核心章节内容自 10/29 起陆续开放。预计 11/25 版本更新，结束时间以官方公告为准。",
    "source": "https://endfield.hypergryph.com/news/6094"
  },
  {
    "id": "ef-wanwu",
    "game": "endfield",
    "type": "banner",
    "title": "特许寻访「万物更新」",
    "subtitle": "6★ 祀",
    "start": "2026-10-15T12:00:00+08:00",
    "end": "2026-11-05T11:59:00+08:00",
    "banners": [
      {
        "name": "祀",
        "tag": "6★ 概率提升"
      }
    ],
    "image": "data/images/endfield-ef-wanwu-1-0a2f2e0b.jpg",
    "gallery": [
      "data/images/endfield-ef-wanwu-1-0a2f2e0b.jpg"
    ],
    "details": [
      "开放时间：2026/10/15 版本更新后 – 11/05 11:59（服务器时间）",
      "6★ 概率提升干员：祀；全部可能出现的 6★：祀 / 提弗洛斯 / 梨诺 / 余烬 / 黎风 / 艾尔黛拉 / 别礼 / 骏卫",
      "累计寻访 30 次额外获得 10 次加急招募，60 次获得寻访情报书 ×1"
    ],
    "requirements": "完成主线任务「第一章 - 进程Ⅰ - 基地解围」",
    "note": "「万物有灵」限时签到及「作战演练」干员试用同期开放。",
    "source": "https://endfield.hypergryph.com/news/8548"
  },
  {
    "id": "ef-sign-ling",
    "game": "endfield",
    "type": "event",
    "title": "「万物有灵」限时签到",
    "subtitle": "累计签到送寻访凭证",
    "start": "2026-10-15T12:00:00+08:00",
    "end": "2026-11-05T11:59:00+08:00",
    "banners": [],
    "codes": [],
    "details": [
      "开放时间：2026/10/15 12:00 – 11/05 11:59（服务器时间）",
      "累计签到可获得「万物有灵寻访凭证」×5 等奖励"
    ],
    "note": "与「万物更新」特许寻访同期开放。",
    "source": "https://endfield.hypergryph.com/news/8548"
  },
  {
    "id": "fgo-18453",
    "game": "fgo",
    "type": "event",
    "title": "「冠位戴冠战：Assassin」开幕",
    "subtitle": "国服限时活动",
    "start": "2026-10-15T19:00:00+08:00",
    "end": "2026-10-22T13:59:00+08:00",
    "banners": [],
    "details": [
      "时间：2026-10-15 19:00 – 2026-10-22 13:59",
      "公告发布时间：2026-10-13 11:03:33"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18453",
    "image": "data/images/fgo/fgo-18453-1.png",
    "gallery": [
      "data/images/fgo/fgo-18453-1.png",
      "data/images/fgo/fgo-18453-2.png",
      "data/images/fgo/fgo-18453-3.png"
    ]
  },
  {
    "id": "fgo-18454",
    "game": "fgo",
    "type": "event",
    "title": "「万圣节2026」开幕前夕纪念活动",
    "subtitle": "国服限时活动",
    "start": "2026-10-17T19:00:00+08:00",
    "end": "2026-10-31T13:59:00+08:00",
    "banners": [],
    "details": [
      "时间：2026-10-17 19:00 – 2026-10-31 13:59",
      "公告发布时间：2026-10-13 11:23:22"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18454",
    "image": "data/images/fgo/fgo-18454-1.png",
    "gallery": [
      "data/images/fgo/fgo-18454-1.png",
      "data/images/fgo/fgo-18454-2.png",
      "data/images/fgo/fgo-18454-3.png"
    ]
  },
  {
    "id": "fgo-18455",
    "game": "fgo",
    "type": "event",
    "title": "「Final Order Project [Ordeal Call IV]通关应援纪念活动」",
    "subtitle": "国服限时活动",
    "start": "2026-10-20T19:00:00+08:00",
    "end": "2026-12-20T13:59:00+08:00",
    "banners": [],
    "details": [
      "时间：2026-10-20 19:00 – 2026-12-20 13:59",
      "公告发布时间：2026-10-13 11:36:10"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18455",
    "image": "data/images/fgo/fgo-18455-1.png",
    "gallery": [
      "data/images/fgo/fgo-18455-1.png",
      "data/images/fgo/fgo-18455-2.png",
      "data/images/fgo/fgo-18455-3.png"
    ]
  },
  {
    "id": "zzz-33-version",
    "game": "zzz",
    "type": "version",
    "title": "3.3「重返天空的旅程」",
    "subtitle": "版本周期 · 两期限时频段",
    "start": "2026-10-21T10:00:00+08:00",
    "end": "2026-12-01T14:59:00+08:00",
    "banners": [
      {
        "name": "菲欧妮",
        "tag": "S · 火 · 异常 · 上期"
      },
      {
        "name": "赛维里安",
        "tag": "S · 风 · 强攻 · 下期"
      }
    ],
    "image": "data/images/zzz-zzz-33-version-1-52aadbe9.png",
    "gallery": [
      "data/images/zzz-zzz-33-version-1-52aadbe9.png",
      "data/images/zzz-zzz-33-version-2-858afd6b.png",
      "data/images/zzz-zzz-33-version-3-5d088df2.png"
    ],
    "details": [
      "下期频段：赛维里安（风·强攻）、诺姆（火·击破）",
      "签到活动「『嗯呢』从天降」11/11 – 12/01",
      "版本活动「修复吧！漂流画集」11/16 – 11/30",
      "版本活动「跛脚乌鸦奇踪记」11/11 – 11/30"
    ],
    "note": "上期频段 10/21 – 11/11 11:59；下期频段 11/11 12:00 – 12/01 14:59。3.4 版本预计 12/02 更新。",
    "source": "https://zzz.mihoyo.com/m/news/166989"
  },
  {
    "id": "zzz-33-p1",
    "game": "zzz",
    "type": "banner",
    "title": "3.3 上期限时频段",
    "subtitle": "「倾掷浮生」菲欧妮",
    "start": "2026-10-21T10:00:00+08:00",
    "end": "2026-11-11T11:59:00+08:00",
    "banners": [
      {
        "name": "菲欧妮",
        "tag": "S · 火 · 异常"
      }
    ],
    "note": "限定 S 级代理人，配套音擎同步调频。",
    "source": "https://zenless.hoyoverse.com/zh-tw/news/166926"
  },
  {
    "id": "zzz-33-login",
    "game": "zzz",
    "type": "event",
    "title": "全新放送 · 登录送 10 母带",
    "subtitle": "累计登录 7 天",
    "start": "2026-10-21T10:00:00+08:00",
    "end": "2026-12-01T03:59:00+08:00",
    "banners": [],
    "note": "绳网等级 ≥5 并解锁「活动」功能后，累计登录 7 天可领取加密母带 ×10。",
    "source": "https://zzz.mihoyo.com/m/news/166989"
  },
  {
    "id": "fgo-18493",
    "game": "fgo",
    "type": "banner",
    "title": "「终结·万圣节 ★5（SSR）伊丽莎白·巴托里推荐召唤」",
    "subtitle": "伊丽莎白·巴托里 · 伊丽莎白·巴托里推荐召唤」◆ · 太空女主人",
    "start": "2026-10-22T19:00:00+08:00",
    "end": "2026-11-13T13:59:00+08:00",
    "banners": [
      {
        "name": "伊丽莎白·巴托里",
        "tag": "5★ SSR"
      },
      {
        "name": "伊丽莎白·巴托里推荐召唤」◆",
        "tag": "5★ SSR"
      },
      {
        "name": "太空女主人",
        "tag": "5★ SSR"
      },
      {
        "name": "伊丽莎白·巴托里」和3种限时概念礼装被推荐召唤！",
        "tag": "5★ SSR"
      }
    ],
    "details": [
      "时间：2026-10-22 19:00 – 2026-11-13 13:59",
      "公告发布时间：2026-10-20 14:17:14"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18493",
    "image": "data/images/fgo/fgo-18493-1.png",
    "gallery": [
      "data/images/fgo/fgo-18493-1.png",
      "data/images/fgo/fgo-18493-2.png",
      "data/images/fgo/fgo-18493-3.png"
    ]
  },
  {
    "id": "fgo-18491",
    "game": "fgo",
    "type": "event",
    "title": "「终结·万圣节2026~于南瓜星闪耀的歌姬~」",
    "subtitle": "国服限时活动",
    "start": "2026-10-22T19:00:00+08:00",
    "end": "2026-11-12T13:59:00+08:00",
    "banners": [],
    "details": [
      "时间：2026-10-22 19:00 – 2026-11-12 13:59",
      "公告发布时间：2026-10-20 14:14:42"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18491",
    "image": "data/images/fgo/fgo-18491-1.png",
    "gallery": [
      "data/images/fgo/fgo-18491-1.png",
      "data/images/fgo/fgo-18491-2.png",
      "data/images/fgo/fgo-18491-3.png"
    ]
  },
  {
    "id": "gi-72-preview",
    "game": "genshin",
    "type": "preview",
    "title": "7.2 前瞻特别节目",
    "subtitle": "「坏灭肇始之时」",
    "start": "2026-10-23T20:00:00+08:00",
    "end": "2026-10-23T23:59:00+08:00",
    "banners": [],
    "codes": [
      {
        "label": "7.2 前瞻",
        "code": "坏灭肇始之时",
        "reward": "原石 ×100 · 精锻用魔矿 ×10",
        "expires": "2026-10-26T12:00:00+08:00"
      },
      {
        "label": "7.2 前瞻",
        "code": "天才少年米提亚登场",
        "reward": "原石 ×100 · 大英雄的经验 ×5",
        "expires": "2026-10-26T12:00:00+08:00"
      },
      {
        "label": "7.2 前瞻",
        "code": "千星奇域一起拍拍拍",
        "reward": "原石 ×100 · 摩拉 ×50000",
        "expires": "2026-10-26T12:00:00+08:00"
      }
    ],
    "note": "前瞻兑换码共 3 组，有效期至 10/26 12:00，已过期。",
    "source": "https://www.miyoushe.com/ys/article/79087188"
  },
  {
    "id": "fgo-18494",
    "game": "fgo",
    "type": "banner",
    "title": "「终结·万圣节2026推荐召唤2」",
    "subtitle": "雅克·德·莫莱 · 阿喀琉斯 · 齐格飞",
    "start": "2026-10-24T19:00:00+08:00",
    "end": "2026-11-12T13:59:00+08:00",
    "banners": [
      {
        "name": "雅克·德·莫莱",
        "tag": "5★ SSR"
      },
      {
        "name": "阿喀琉斯",
        "tag": "5★ SSR"
      },
      {
        "name": "齐格飞",
        "tag": "5★ SSR"
      },
      {
        "name": "彭忒西勒亚（黄金国的Berserker）",
        "tag": "5★ SSR"
      }
    ],
    "details": [
      "时间：2026-10-24 19:00 – 2026-11-12 13:59",
      "公告发布时间：2026-10-20 14:23:44"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18494",
    "image": "data/images/fgo/fgo-18494-1.png",
    "gallery": [
      "data/images/fgo/fgo-18494-1.png",
      "data/images/fgo/fgo-18494-2.png",
      "data/images/fgo/fgo-18494-3.png"
    ]
  },
  {
    "id": "ak-hantu",
    "game": "arknights",
    "type": "event",
    "title": "「冻土与火种」网页活动",
    "subtitle": "网页活动 · 实物奖励",
    "start": "2026-10-24T20:00:00+08:00",
    "end": "2026-11-24T03:59:00+08:00",
    "banners": [],
    "details": [
      "活动时间：10/24 20:00 – 11/24 03:59",
      "通过活动页面参与，有机会获取精美实物奖励"
    ],
    "rewards": "精美实物奖励（抽取）",
    "note": "官网网页活动，活动链接见官方公告。",
    "source": "https://ak.hypergryph.com/news/7353"
  },
  {
    "id": "fgo-18499",
    "game": "fgo",
    "type": "event",
    "title": "「Final Order Project 第2部 终章临近！最终冲刺纪念活动」",
    "subtitle": "国服限时活动",
    "start": "2026-10-27T19:00:00+08:00",
    "end": "2026-12-20T13:59:00+08:00",
    "banners": [],
    "details": [
      "时间：2026-10-27 19:00 – 2026-12-20 13:59",
      "公告发布时间：2026-10-21 14:35:50"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18499",
    "image": "data/images/fgo/fgo-18499-1.png",
    "gallery": [
      "data/images/fgo/fgo-18499-1.png",
      "data/images/fgo/fgo-18499-2.png",
      "data/images/fgo/fgo-18499-3.png"
    ]
  },
  {
    "id": "fgo-18498",
    "game": "fgo",
    "type": "banner",
    "title": "「OVER THE SAME SKY-OCTOBER-」推荐召唤",
    "subtitle": "比肖内 · 女教皇若安 · 夏洛克·福尔摩斯",
    "start": "2026-10-27T19:00:00+08:00",
    "end": "2026-11-10T13:59:00+08:00",
    "banners": [
      {
        "name": "比肖内",
        "tag": "5★ SSR"
      },
      {
        "name": "女教皇若安",
        "tag": "5★ SSR"
      },
      {
        "name": "夏洛克·福尔摩斯",
        "tag": "5★ SSR"
      },
      {
        "name": "布拉达曼特",
        "tag": "5★ SSR"
      }
    ],
    "details": [
      "时间：2026-10-27 19:00 – 2026-11-10 13:59",
      "公告发布时间：2026-10-21 14:30:11"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18498",
    "image": "data/images/fgo/fgo-18498-1.png",
    "gallery": [
      "data/images/fgo/fgo-18498-1.png",
      "data/images/fgo/fgo-18498-2.png",
      "data/images/fgo/fgo-18498-3.png"
    ]
  },
  {
    "id": "fgo-18497",
    "game": "fgo",
    "type": "event",
    "title": "使用特别兑换券交换获得「北海道·东北区域」的「英灵星行」",
    "subtitle": "国服限时活动",
    "start": "2026-10-27T19:00:00+08:00",
    "end": "2026-11-10T13:59:00+08:00",
    "banners": [],
    "details": [
      "时间：2026-10-27 19:00 – 2026-11-10 13:59",
      "公告发布时间：2026-10-21 14:20:37"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18497",
    "image": "data/images/fgo/fgo-18497-1.png",
    "gallery": [
      "data/images/fgo/fgo-18497-1.png",
      "data/images/fgo/fgo-18497-2.png",
      "data/images/fgo/fgo-18497-3.png"
    ]
  },
  {
    "id": "fgo-18513",
    "game": "fgo",
    "type": "banner",
    "title": "「巡灵的祝祭 第14弹」推荐召唤",
    "subtitle": "梵高 · 阿比盖尔·威廉姆斯 · 梵高」「★5（SSR）阿比盖尔·威廉姆斯」的2种",
    "start": "2026-10-28T19:00:00+08:00",
    "end": "2026-11-09T13:59:00+08:00",
    "banners": [
      {
        "name": "梵高",
        "tag": "5★ SSR"
      },
      {
        "name": "阿比盖尔·威廉姆斯",
        "tag": "5★ SSR"
      },
      {
        "name": "梵高」「★5（SSR）阿比盖尔·威廉姆斯」的2种",
        "tag": "5★ SSR"
      },
      {
        "name": "梵高」「★5（SSR）阿比盖尔·威廉姆斯」的卡池",
        "tag": "5★ SSR"
      }
    ],
    "details": [
      "时间：2026-10-28 19:00 – 2026-11-09 13:59",
      "公告发布时间：2026-10-26 14:22:35"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18513",
    "image": "data/images/fgo/fgo-18513-1.png",
    "gallery": [
      "data/images/fgo/fgo-18513-1.png",
      "data/images/fgo/fgo-18513-2.png",
      "data/images/fgo/fgo-18513-3.png"
    ]
  },
  {
    "id": "fgo-18512",
    "game": "fgo",
    "type": "event",
    "title": "「巡灵的祝祭 第14弹」",
    "subtitle": "国服限时活动",
    "start": "2026-10-28T19:00:00+08:00",
    "end": "2026-11-14T13:59:00+08:00",
    "banners": [],
    "details": [
      "时间：2026-10-28 19:00 – 2026-11-14 13:59",
      "公告发布时间：2026-10-26 14:17:49"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18512",
    "image": "data/images/fgo/fgo-18512-1.png",
    "gallery": [
      "data/images/fgo/fgo-18512-1.png",
      "data/images/fgo/fgo-18512-2.png",
      "data/images/fgo/fgo-18512-3.png"
    ]
  },
  {
    "id": "fgo-18514",
    "game": "fgo",
    "type": "event",
    "title": "「Final Order Project第2部 终章将近！最终倒计时纪念活动」",
    "subtitle": "国服限时活动",
    "start": "2026-10-28T19:00:00+08:00",
    "end": "2026-12-20T13:59:00+08:00",
    "banners": [],
    "details": [
      "时间：2026-10-28 19:00 – 2026-12-20 13:59",
      "公告发布时间：2026-10-26 14:29:29"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18514",
    "image": "data/images/fgo/fgo-18514-1.png",
    "gallery": [
      "data/images/fgo/fgo-18514-1.png",
      "data/images/fgo/fgo-18514-2.png",
      "data/images/fgo/fgo-18514-3.png"
    ]
  },
  {
    "id": "fgo-18500",
    "game": "fgo",
    "type": "banner",
    "title": "「终结·万圣节2026推荐召唤3」",
    "subtitle": "刑部姬（Assassin） · 弗拉德三世",
    "start": "2026-10-28T19:00:00+08:00",
    "end": "2026-11-06T13:59:00+08:00",
    "banners": [
      {
        "name": "刑部姬（Assassin）",
        "tag": "5★ SSR"
      },
      {
        "name": "弗拉德三世",
        "tag": "5★ SSR"
      }
    ],
    "details": [
      "时间：2026-10-28 19:00 – 2026-11-06 13:59",
      "公告发布时间：2026-10-21 14:38:43"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18500",
    "image": "data/images/fgo/fgo-18500-1.png",
    "gallery": [
      "data/images/fgo/fgo-18500-1.png",
      "data/images/fgo/fgo-18500-2.png",
      "data/images/fgo/fgo-18500-3.png"
    ]
  },
  {
    "id": "ak-mid",
    "game": "arknights",
    "type": "banner",
    "title": "中坚寻访",
    "subtitle": "中坚干员轮换",
    "start": "2026-10-29T04:00:00+08:00",
    "end": "2026-11-12T03:59:00+08:00",
    "banners": [],
    "note": "仅包含中坚干员，可使用中坚寻访凭证。",
    "source": "https://m.prts.wiki/w/%E5%8D%A1%E6%B1%A0%E4%B8%80%E8%A7%88"
  },
  {
    "id": "ef-tangtang",
    "game": "endfield",
    "type": "banner",
    "title": "复刻寻访「汤汤」",
    "subtitle": "6★ 干员复刻 · 重构寻访",
    "start": "2026-10-29T12:00:00+08:00",
    "end": "2026-11-19T11:59:00+08:00",
    "banners": [
      {
        "name": "汤汤",
        "tag": "6★ 复刻"
      }
    ],
    "image": "data/images/endfield-ef-tangtang-1-0dc33d9f.png",
    "gallery": [
      "data/images/endfield-ef-tangtang-1-0dc33d9f.png"
    ],
    "details": [
      "开放时间：2026/10/29 12:00 – 11/19 11:59（服务器时间）",
      "「祖泉的新流」重构寻访<1>：6★ 干员【汤汤】概率提升，前 120 次寻访必定获得",
      "同期「细枝申领」重构申领<1>：6★ 武器【落草（手铳）】概率提升"
    ],
    "rewards": "累计寻访可获得加急招募、汤汤的信物等",
    "requirements": "完成主线任务「第一章 - 进程Ⅰ - 基地解围」",
    "note": "「祖泉的新流」重构寻访<1>与「细枝申领」重构申领<1>同期开放，11/19 11:59 结束。",
    "source": "https://endfield.hypergryph.com/news/3893"
  },
  {
    "id": "hsr-47-preview",
    "game": "hsr",
    "type": "preview",
    "title": "4.7 前瞻特别节目",
    "subtitle": "「此刻，将群星付之一笑」",
    "start": "2026-10-30T19:30:00+08:00",
    "end": "2026-10-30T23:59:00+08:00",
    "banners": [],
    "codes": [
      {
        "label": "4.7 前瞻",
        "code": "NEVERGONNAGIVE",
        "reward": "星琼 ×100 · 信用点 ×50000",
        "expires": "2026-10-31T23:59:00+08:00"
      },
      {
        "label": "4.7 前瞻",
        "code": "NEVERGONNAMAKE",
        "reward": "星琼 ×100 · 旅情见闻 ×5",
        "expires": "2026-10-31T23:59:00+08:00"
      },
      {
        "label": "4.7 前瞻",
        "code": "AHABLESSYOU",
        "reward": "星琼 ×100 · 提纯以太 ×4",
        "expires": "2026-10-31T23:59:00+08:00"
      }
    ],
    "note": "前瞻兑换码 3 组，有效期至 10/31 23:59，已过期。",
    "source": "https://www.miyoushe.com/sr/article/79218232"
  },
  {
    "id": "fgo-18534",
    "game": "fgo",
    "type": "event",
    "title": "「全世界1亿下载突破纪念活动」",
    "subtitle": "国服限时活动",
    "start": "2026-11-01T04:00:00+08:00",
    "end": "2026-11-08T03:59:00+08:00",
    "banners": [],
    "details": [
      "时间：2026-11-01 04:00 – 2026-11-08 03:59",
      "公告发布时间：2026-10-30 18:48:20"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18534",
    "image": "data/images/fgo/fgo-18534-1.png",
    "gallery": [
      "data/images/fgo/fgo-18534-1.png",
      "data/images/fgo/fgo-18534-2.png",
      "data/images/fgo/fgo-18534-3.png"
    ]
  },
  {
    "id": "ak-thanks",
    "game": "arknights",
    "type": "event",
    "title": "感谢庆典「时间啊，向前！」",
    "subtitle": "SideStory · 2026 感谢庆典",
    "start": "2026-11-01T12:00:00+08:00",
    "end": "2026-11-22T03:59:00+08:00",
    "banners": [],
    "note": "活动关卡分段开放，第三段 11/15 16:00 开启；11/08 16:00 起同步开放「卫戍协议·规程·序列I」。",
    "source": "https://ak.hypergryph.com/news/0787"
  },
  {
    "id": "ak-banner",
    "game": "arknights",
    "type": "banner",
    "title": "限定寻访「将雪投火」",
    "subtitle": "塔露拉【限定】 / 冻河",
    "start": "2026-11-01T12:00:00+08:00",
    "end": "2026-11-15T03:59:00+08:00",
    "banners": [
      {
        "name": "塔露拉",
        "tag": "6★ 限定"
      },
      {
        "name": "冻河",
        "tag": "6★（占 6★ 出率的另一半）"
      }
    ],
    "note": "庆典限定寻访，300 抽保底兑换机制适用。",
    "source": "https://ak.hypergryph.com/news/0787"
  },
  {
    "id": "fgo-18523",
    "game": "fgo",
    "type": "banner",
    "title": "Fate/Grand Order「Road to 终章」第6章篇纪念 摩根推荐召唤",
    "subtitle": "摩根 · 巅峰 · 情人节女巫们",
    "start": "2026-11-03T19:00:00+08:00",
    "end": "2026-11-10T13:59:00+08:00",
    "banners": [
      {
        "name": "摩根",
        "tag": "5★ SSR"
      },
      {
        "name": "巅峰",
        "tag": "5★ SSR"
      },
      {
        "name": "情人节女巫们",
        "tag": "5★ SSR"
      },
      {
        "name": "摩根」",
        "tag": "5★ SSR"
      }
    ],
    "details": [
      "时间：2026-11-03 19:00 – 2026-11-10 13:59",
      "公告发布时间：2026-10-28 14:34:04"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18523",
    "image": "data/images/fgo/fgo-18523-1.png",
    "gallery": [
      "data/images/fgo/fgo-18523-1.png",
      "data/images/fgo/fgo-18523-2.png",
      "data/images/fgo/fgo-18523-3.png"
    ]
  },
  {
    "id": "fgo-18522",
    "game": "fgo",
    "type": "event",
    "title": "「Final Order Project第2部 终章即将到来！第2部回顾纪念活动 ～第6章篇～」",
    "subtitle": "国服限时活动",
    "start": "2026-11-03T19:00:00+08:00",
    "end": "2026-11-10T13:59:00+08:00",
    "banners": [],
    "details": [
      "时间：2026-11-03 19:00 – 2026-11-10 13:59",
      "公告发布时间：2026-10-28 14:32:01"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18522",
    "image": "data/images/fgo/fgo-18522-1.png",
    "gallery": [
      "data/images/fgo/fgo-18522-1.png",
      "data/images/fgo/fgo-18522-2.png",
      "data/images/fgo/fgo-18522-3.png"
    ]
  },
  {
    "id": "gi-72-version",
    "game": "genshin",
    "type": "version",
    "title": "7.2「坏灭肇始之时」",
    "subtitle": "版本周期 · 两期角色祈愿",
    "start": "2026-11-04T06:00:00+08:00",
    "end": "2026-12-16T05:59:00+08:00",
    "banners": [
      {
        "name": "米提亚",
        "tag": "5★ 雷 · 上半"
      },
      {
        "name": "芙宁娜",
        "tag": "5★ 水 · 上半"
      },
      {
        "name": "兹白",
        "tag": "5★ 岩 · 下半"
      },
      {
        "name": "莉奈娅",
        "tag": "5★ 岩 · 下半"
      }
    ],
    "note": "上半祈愿 11/04 06:00 – 11/24 17:59；下半祈愿 11/24 18:00 – 12/15 14:59。7.3 版本预计 12/16 更新。",
    "source": "https://ys.mihoyo.com/main/m/news/detail/167205"
  },
  {
    "id": "gi-72-p1",
    "game": "genshin",
    "type": "banner",
    "title": "7.2 上半祈愿",
    "subtitle": "「万象繁织」米提亚 · 芙宁娜",
    "start": "2026-11-04T06:00:00+08:00",
    "end": "2026-11-24T17:59:00+08:00",
    "banners": [
      {
        "name": "米提亚",
        "tag": "5★ 雷"
      },
      {
        "name": "芙宁娜",
        "tag": "5★ 水"
      }
    ],
    "note": "上半武器池信息以官方公告为准；朏魄含光、霜结的誓金枝为下半武器池。",
    "source": "https://genshin.hoyoverse.com/en/news/detail/167139"
  },
  {
    "id": "gi-72-guard",
    "game": "genshin",
    "type": "event",
    "title": "「全域镇卫·逆捍谬罚」",
    "subtitle": "7.2 版本主题活动 · 自选邀请 4★",
    "start": "2026-11-04T06:00:00+08:00",
    "end": "2026-12-16T05:59:00+08:00",
    "banners": [],
    "codes": [],
    "image": "data/images/genshin-gi-72-guard-1-ccf72283.jpg",
    "gallery": [
      "data/images/genshin-gi-72-guard-1-ccf72283.jpg"
    ],
    "details": [
      "活动时间：7.2 版本期间持续开放",
      "完成「急刻进救」「攻固空权」「定策巡剿」三种驰援行动，削减「圣土化」威胁值",
      "威胁值降至一定程度后可自选邀请 1 名 4★ 角色：安柏 / 香菱 / 托马 / 柯莱 / 琳妮特 / 卡齐娜 / 爱诺 / 阿罗夏"
    ],
    "rewards": "原石、智识之冕、自选邀请 4★ 角色",
    "requirements": "冒险等阶≥20；完成魔神任务第七章·第四幕「往冥府的安魂歌」",
    "note": "与魔神任务关联度较高，可在推进第七章·第六幕途中自然开启。",
    "source": "https://ys.mihoyo.com/main/m/news/detail/167168"
  },
  {
    "id": "gi-72-quest",
    "game": "genshin",
    "type": "event",
    "title": "「坏灭肇始之时」魔神任务限时奖励",
    "subtitle": "完成第七章第五、六幕领取额外奖励",
    "start": "2026-11-04T06:00:00+08:00",
    "end": "2026-12-15T14:59:00+08:00",
    "banners": [],
    "codes": [],
    "image": "data/images/genshin-gi-72-quest-1-edbbe612.jpg",
    "gallery": [
      "data/images/genshin-gi-72-quest-1-edbbe612.jpg"
    ],
    "details": [
      "获取奖励时限：7.2 版本更新后 – 2026/12/15 14:59",
      "版本更新后永久新增魔神任务第七章·第五幕与第六幕",
      "在时限内完成相应魔神任务，可额外获得原石、角色突破素材、角色培养素材、至冬区域特产等奖励"
    ],
    "rewards": "原石、角色突破素材、角色培养素材、至冬区域特产",
    "requirements": "冒险等阶≥18；完成魔神任务第七章·第四幕「往冥府的安魂歌」",
    "note": "魔神任务永久开放，限时奖励仅至 12/15 14:59。",
    "source": "https://ys.mihoyo.com/main/m/news/detail/167169"
  },
  {
    "id": "gi-72-explore",
    "game": "genshin",
    "type": "event",
    "title": "「晶石如林生长之地」区域探索奖励",
    "subtitle": "至冬新区域 · 限时探索奖励",
    "start": "2026-11-04T06:00:00+08:00",
    "end": "2027-01-26T14:59:00+08:00",
    "banners": [],
    "codes": [],
    "image": "data/images/genshin-gi-72-explore-1-a7c0ca1a.jpg",
    "gallery": [
      "data/images/genshin-gi-72-explore-1-a7c0ca1a.jpg"
    ],
    "details": [
      "获取奖励时限：7.2 版本更新后 – 2027/01/26 14:59",
      "版本更新后开启全新至冬区域：新基捷城、如翼之峰",
      "在时限内完成相应探索任务，可额外获得原石 ×400"
    ],
    "rewards": "原石 ×400",
    "note": "区域探索限时奖励，超时后仍可探索但无法领取额外原石。",
    "source": "https://ys.mihoyo.com/main/m/news/detail/167170"
  },
  {
    "id": "ef-minghe",
    "game": "endfield",
    "type": "banner",
    "title": "特许寻访「烟火邀星河」",
    "subtitle": "6★ 明河",
    "start": "2026-11-05T12:00:00+08:00",
    "end": "2026-11-25T11:59:00+08:00",
    "banners": [
      {
        "name": "明河",
        "tag": "6★ 概率提升"
      }
    ],
    "note": "需完成主线「第一章 · 进程Ⅰ · 基地解围」，开放至版本更新维护前（预计 11/25）。",
    "source": "https://endfield.hypergryph.com/news/7204"
  },
  {
    "id": "ef-renyan",
    "game": "endfield",
    "type": "banner",
    "title": "特别寻访「人烟牵天河」",
    "subtitle": "限定特别寻访",
    "start": "2026-11-05T12:00:00+08:00",
    "end": "2026-11-25T11:59:00+08:00",
    "banners": [],
    "note": "开放至版本更新维护前（预计 11/25），具体 UP 内容以游戏内公告为准。",
    "source": "https://endfield.gryphline.com/ja-jp/news/7012"
  },
  {
    "id": "ef-crisis",
    "game": "endfield",
    "type": "event",
    "title": "危机合约「浸蓝测试作战」",
    "subtitle": "第二赛季挑战活动",
    "start": "2026-11-05T12:00:00+08:00",
    "end": "2026-11-25T07:00:00+08:00",
    "banners": [],
    "note": "11/12 12:00 更新活动内容；「机密圣所」同步开放。",
    "source": "https://endfield.hypergryph.com/news/6094"
  },
  {
    "id": "ef-war",
    "game": "endfield",
    "type": "event",
    "title": "战争回响 · 狂热赛季",
    "subtitle": "常驻挑战玩法赛季更新",
    "start": "2026-11-05T12:00:00+08:00",
    "end": "2026-11-25T11:59:00+08:00",
    "banners": [],
    "note": "赛季分 3 个轮换周期、每周期 3 个关卡，开放至版本更新维护前（预计 11/25）。",
    "source": "https://endfield.hypergryph.com/news/6094"
  },
  {
    "id": "ef-sign-star",
    "game": "endfield",
    "type": "event",
    "title": "「星河共我」限时签到",
    "subtitle": "累计签到送寻访凭证",
    "start": "2026-11-05T12:00:00+08:00",
    "end": "2026-11-25T11:59:00+08:00",
    "banners": [],
    "codes": [],
    "details": [
      "开放时间：2026/11/05 12:00 起，开放至版本更新维护前（预计 11/25）",
      "累计签到可获得「星河共我寻访凭证」×5 等奖励"
    ],
    "note": "与「烟火邀星河」特许寻访同期开放。",
    "source": "https://endfield.hypergryph.com/news/7204"
  },
  {
    "id": "fgo-18548",
    "game": "fgo",
    "type": "event",
    "title": "「复刻 从漫画了解！Fate/Grand Order联动活动友情点召唤」",
    "subtitle": "国服限时活动",
    "start": "2026-11-05T19:00:00+08:00",
    "end": "2026-11-13T13:59:00+08:00",
    "banners": [],
    "details": [
      "时间：2026-11-05 19:00 – 2026-11-13 13:59",
      "公告发布时间：2026-11-03 14:05:44"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18548",
    "image": "data/images/fgo/fgo-18548-1.png",
    "gallery": [
      "data/images/fgo/fgo-18548-1.png",
      "data/images/fgo/fgo-18548-2.png",
      "data/images/fgo/fgo-18548-3.png"
    ]
  },
  {
    "id": "fgo-18547",
    "game": "fgo",
    "type": "banner",
    "title": "「岸波白野友情点推荐召唤」",
    "subtitle": "国服推荐召唤",
    "start": "2026-11-05T19:00:00+08:00",
    "end": "2026-11-13T13:59:00+08:00",
    "banners": [],
    "details": [
      "时间：2026-11-05 19:00 – 2026-11-13 13:59",
      "公告发布时间：2026-11-03 14:04:26"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18547",
    "image": "data/images/fgo/fgo-18547-1.png",
    "gallery": [
      "data/images/fgo/fgo-18547-1.png",
      "data/images/fgo/fgo-18547-2.png",
      "data/images/fgo/fgo-18547-3.png"
    ]
  },
  {
    "id": "fgo-18545",
    "game": "fgo",
    "type": "event",
    "title": "「冠位戴冠战：Lancer」&「冠位戴冠战：Extra」风暴罐消耗0！纪念活动",
    "subtitle": "国服限时活动",
    "start": "2026-11-05T19:00:00+08:00",
    "end": "2026-11-13T13:59:00+08:00",
    "banners": [],
    "details": [
      "时间：2026-11-05 19:00 – 2026-11-13 13:59",
      "公告发布时间：2026-11-03 13:58:37"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18545",
    "image": "data/images/fgo/fgo-18545-1.png",
    "gallery": [
      "data/images/fgo/fgo-18545-1.png",
      "data/images/fgo/fgo-18545-2.png",
      "data/images/fgo/fgo-18545-3.png"
    ]
  },
  {
    "id": "fgo-18546",
    "game": "fgo",
    "type": "banner",
    "title": "「冠位戴冠战：Lancer」&「冠位戴冠战：Extra」推荐召唤",
    "subtitle": "梵高 · 阿比盖尔·威廉姆斯 · 雅克·德·莫莱",
    "start": "2026-11-05T19:00:00+08:00",
    "end": "2026-11-13T13:59:00+08:00",
    "banners": [
      {
        "name": "梵高",
        "tag": "5★ SSR"
      },
      {
        "name": "阿比盖尔·威廉姆斯",
        "tag": "5★ SSR"
      },
      {
        "name": "雅克·德·莫莱",
        "tag": "5★ SSR"
      },
      {
        "name": "梅柳齐娜（Lancer）（妖精骑士兰斯洛特）",
        "tag": "5★ SSR"
      }
    ],
    "details": [
      "时间：2026-11-05 19:00 – 2026-11-13 13:59",
      "公告发布时间：2026-11-03 14:02:51"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18546",
    "image": "data/images/fgo/fgo-18546-1.png",
    "gallery": [
      "data/images/fgo/fgo-18546-1.png",
      "data/images/fgo/fgo-18546-2.png",
      "data/images/fgo/fgo-18546-3.png"
    ]
  },
  {
    "id": "fgo-18542",
    "game": "fgo",
    "type": "event",
    "title": "「冠位戴冠战：Archer」开幕前夕纪念活动",
    "subtitle": "国服限时活动",
    "start": "2026-11-05T19:00:00+08:00",
    "end": "2026-11-21T13:59:00+08:00",
    "banners": [],
    "details": [
      "时间：2026-11-05 19:00 – 2026-11-21 13:59",
      "公告发布时间：2026-11-03 13:15:59"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18542",
    "image": "data/images/fgo/fgo-18542-1.png",
    "gallery": [
      "data/images/fgo/fgo-18542-1.png",
      "data/images/fgo/fgo-18542-2.png",
      "data/images/fgo/fgo-18542-3.png"
    ]
  },
  {
    "id": "fgo-18543",
    "game": "fgo",
    "type": "banner",
    "title": "「冠位戴冠战：Archer」推荐召唤",
    "subtitle": "图坦卡蒙 · 图坦卡蒙」的圣肖像和战斗形象变为第2阶段 · 图坦卡蒙」后",
    "start": "2026-11-05T19:00:00+08:00",
    "end": "2026-11-21T13:59:00+08:00",
    "banners": [
      {
        "name": "图坦卡蒙",
        "tag": "5★ SSR"
      },
      {
        "name": "图坦卡蒙」的圣肖像和战斗形象变为第2阶段",
        "tag": "5★ SSR"
      },
      {
        "name": "图坦卡蒙」后",
        "tag": "5★ SSR"
      },
      {
        "name": "图坦卡蒙」的『灵基解放关卡』将在「幕间物语」中登",
        "tag": "5★ SSR"
      }
    ],
    "details": [
      "时间：2026-11-05 19:00 – 2026-11-21 13:59",
      "公告发布时间：2026-11-03 13:49:23"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18543",
    "image": "data/images/fgo/fgo-18543-1.png",
    "gallery": [
      "data/images/fgo/fgo-18543-1.png",
      "data/images/fgo/fgo-18543-2.png",
      "data/images/fgo/fgo-18543-3.png"
    ]
  },
  {
    "id": "wuwa-38-preview",
    "game": "wuwa",
    "type": "preview",
    "title": "3.8 前瞻通讯",
    "subtitle": "「旧梦凋零的百合」",
    "start": "2026-11-06T19:00:00+08:00",
    "end": "2026-11-06T23:59:00+08:00",
    "banners": [],
    "codes": [
      {
        "label": "3.8 前瞻",
        "code": "TRAINOFSOULS",
        "reward": "星声 ×100 · 养成材料 ×5",
        "expires": "2026-11-08T23:59:00+08:00"
      },
      {
        "label": "3.8 前瞻",
        "code": "BLOOMINGFLOWERS",
        "reward": "星声 ×100 · 养成材料 ×2 · 贝币 ×40000",
        "expires": "2026-11-08T23:59:00+08:00"
      },
      {
        "label": "3.8 前瞻",
        "code": "SCHOOLLIFE",
        "reward": "星声 ×100 · 养成材料 ×25",
        "expires": "2026-11-08T23:59:00+08:00"
      }
    ],
    "note": "前瞻兑换码有效期至 11/08 23:59，已过期；永久码 WUTHERINGGIFT 仍可兑换。",
    "source": "https://wuwa.uk/articles/wuwa-3-8-preview-2026"
  },
  {
    "id": "fgo-18566",
    "game": "fgo",
    "type": "event",
    "title": "「全世界1亿下载突破纪念活动」",
    "subtitle": "国服限时活动",
    "start": "2026-11-07T20:00:00+08:00",
    "end": "2026-11-21T13:59:00+08:00",
    "banners": [],
    "details": [
      "时间：2026-11-07 20:00 – 2026-11-21 13:59",
      "公告发布时间：2026-11-06 19:32:29"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18566",
    "image": "data/images/fgo/fgo-18566-1.png",
    "gallery": [
      "data/images/fgo/fgo-18566-1.png",
      "data/images/fgo/fgo-18566-2.png",
      "data/images/fgo/fgo-18566-3.png"
    ]
  },
  {
    "id": "fgo-18567",
    "game": "fgo",
    "type": "banner",
    "title": "「全世界1亿下载纪念推荐召唤」",
    "subtitle": "梅林 · 一夜之梦 · &ldquo;山中老人&rdquo;",
    "start": "2026-11-07T20:00:00+08:00",
    "end": "2026-11-21T13:59:00+08:00",
    "banners": [
      {
        "name": "梅林",
        "tag": "5★ SSR"
      },
      {
        "name": "一夜之梦",
        "tag": "5★ SSR"
      },
      {
        "name": "&ldquo;山中老人&rdquo;",
        "tag": "5★ SSR"
      },
      {
        "name": "埃列什基伽勒（Lancer）",
        "tag": "5★ SSR"
      }
    ],
    "details": [
      "时间：2026-11-07 20:00 – 2026-11-21 13:59",
      "公告发布时间：2026-11-06 19:43:30"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18567",
    "image": "data/images/fgo/fgo-18567-1.png",
    "gallery": [
      "data/images/fgo/fgo-18567-1.png",
      "data/images/fgo/fgo-18567-2.png",
      "data/images/fgo/fgo-18567-3.png"
    ]
  },
  {
    "id": "fgo-18562",
    "game": "fgo",
    "type": "banner",
    "title": "Fate/Grand Order「Road to 终章」第7章篇纪念 特斯卡特利波卡推荐召唤",
    "subtitle": "特斯卡特利波卡 · 变幻莫测 · 夏日小憩",
    "start": "2026-11-10T19:00:00+08:00",
    "end": "2026-11-17T13:59:00+08:00",
    "banners": [
      {
        "name": "特斯卡特利波卡",
        "tag": "5★ SSR"
      },
      {
        "name": "变幻莫测",
        "tag": "5★ SSR"
      },
      {
        "name": "夏日小憩",
        "tag": "5★ SSR"
      },
      {
        "name": "法老巧克力",
        "tag": "5★ SSR"
      }
    ],
    "details": [
      "时间：2026-11-10 19:00 – 2026-11-17 13:59",
      "公告发布时间：2026-11-06 16:05:05"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18562",
    "image": "data/images/fgo/fgo-18562-1.png",
    "gallery": [
      "data/images/fgo/fgo-18562-1.png",
      "data/images/fgo/fgo-18562-2.png",
      "data/images/fgo/fgo-18562-3.png"
    ]
  },
  {
    "id": "fgo-18561",
    "game": "fgo",
    "type": "event",
    "title": "「Final Order Project第2部 终章即将到来！第2部回顾纪念活动 ～第7章篇～」",
    "subtitle": "国服限时活动",
    "start": "2026-11-10T19:00:00+08:00",
    "end": "2026-11-17T18:59:00+08:00",
    "banners": [],
    "details": [
      "时间：2026-11-10 19:00 – 2026-11-17 18:59",
      "公告发布时间：2026-11-06 16:03:20"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18561",
    "image": "data/images/fgo/fgo-18561-1.png",
    "gallery": [
      "data/images/fgo/fgo-18561-1.png",
      "data/images/fgo/fgo-18561-2.png",
      "data/images/fgo/fgo-18561-3.png"
    ]
  },
  {
    "id": "hsr-47-version",
    "game": "hsr",
    "type": "version",
    "title": "4.7「此刻，将群星付之一笑」",
    "subtitle": "版本周期 · 星神阿哈登场",
    "start": "2026-11-11T06:00:00+08:00",
    "end": "2026-12-23T06:00:00+08:00",
    "banners": [
      {
        "name": "星神★阿哈",
        "tag": "5★ 量子 · 欢愉 · 全版本"
      },
      {
        "name": "银狼LV.999",
        "tag": "上半复刻"
      },
      {
        "name": "火花",
        "tag": "上半复刻"
      },
      {
        "name": "爻光",
        "tag": "上半复刻"
      },
      {
        "name": "黄泉",
        "tag": "下半复刻"
      },
      {
        "name": "丹恒·饮月",
        "tag": "下半复刻"
      },
      {
        "name": "景元",
        "tag": "下半复刻"
      }
    ],
    "codes": [
      {
        "label": "4.7 限时",
        "code": "NS4DU8AAGXBP",
        "reward": "星琼 ×50 · 信用点 ×10000",
        "expires": null
      },
      {
        "label": "4.7 限时",
        "code": "AeonAha",
        "reward": "冒险记录 ×3 · 阿哈气球 ×2",
        "expires": "2026-11-17T23:59:00+08:00"
      }
    ],
    "note": "上半跃迁 11/11 – 12/02 15:00；下半跃迁 12/02 15:00 – 12/22 15:00。阿哈贯穿整个版本 UP。",
    "source": "https://hsr.hoyoverse.com/zh-cn/news/167246"
  },
  {
    "id": "hsr-47-p1",
    "game": "hsr",
    "type": "banner",
    "title": "4.7 上半跃迁",
    "subtitle": "阿哈 / 银狼LV.999 / 火花 / 爻光",
    "start": "2026-11-11T06:00:00+08:00",
    "end": "2026-12-02T15:00:00+08:00",
    "banners": [
      {
        "name": "星神★阿哈",
        "tag": "5★ 量子 · 欢愉"
      },
      {
        "name": "银狼LV.999",
        "tag": "复刻"
      },
      {
        "name": "火花",
        "tag": "复刻"
      },
      {
        "name": "爻光",
        "tag": "复刻"
      }
    ],
    "note": "阿哈专武同步开启，四星陪跑：艾丝妲、玲可、驭空。",
    "source": "https://gamingroute.com/honkai-star-rail-4-7-banners/"
  },
  {
    "id": "hsr-47-skin",
    "game": "hsr",
    "type": "event",
    "title": "时装「群星乐透」",
    "subtitle": "幻乐秀场 · 星神阿哈时装",
    "start": "2026-11-11T06:00:00+08:00",
    "end": "2026-12-23T03:59:00+08:00",
    "banners": [],
    "note": "在「寰宇美学·幻乐秀场」消耗时装邀请函抽取，100 星琼 = 1 邀请函；提前获得后剩余奖励自动解锁。",
    "source": "https://www.icy-veins.com/honkai-star-rail/news/honkai-star-rail-special-program-version-4-7-now-lay-laughter-to-all-stars-overview/"
  },
  {
    "id": "hsr-47-event",
    "game": "hsr",
    "type": "event",
    "title": "「万象和鸣」",
    "subtitle": "消耗返利活动",
    "start": "2026-11-11T06:00:00+08:00",
    "end": "2026-12-23T03:59:00+08:00",
    "banners": [],
    "note": "累计消耗星轨专票或时装邀请函，可获得「回响」并领取「奇缘星魂」。",
    "source": "https://sr.mihoyo.com/news/167108"
  },
  {
    "id": "hsr-47-selector",
    "game": "hsr",
    "type": "event",
    "title": "登录自选 5★ 角色",
    "subtitle": "黄泉 / 丹恒·饮月 / 景元",
    "start": "2026-11-11T06:00:00+08:00",
    "end": "2026-12-23T03:59:00+08:00",
    "banners": [],
    "codes": [],
    "details": [
      "4.7 版本期间登录，可在黄泉、丹恒·饮月、景元中任选 1 名 5★ 角色",
      "可再选择上述角色之一的「奇缘星魂」",
      "另有旅伴金灵 ×1 等登录奖励"
    ],
    "note": "登录即领，具体领取入口与时间以游戏内活动页为准。",
    "source": "https://sr.mihoyo.com/news/167107"
  },
  {
    "id": "gi-72-season",
    "game": "genshin",
    "type": "event",
    "title": "幽境危战 第十三期",
    "subtitle": "「鲸波之役」挑战活动",
    "start": "2026-11-11T10:00:00+08:00",
    "end": "2026-12-15T03:59:00+08:00",
    "banners": [],
    "image": "data/images/genshin-gi-72-season-1-d7a14b3a.png",
    "gallery": [
      "data/images/genshin-gi-72-season-1-d7a14b3a.png",
      "data/images/genshin-gi-72-season-2-fa6b1e64.png"
    ],
    "details": [
      "整体活动时间：2026/11/11 10:00 – 2026/12/15 03:59",
      "紊乱爆发期：2026/11/11 10:00 – 2026/11/21 03:59",
      "挑战「紊乱地脉」，按关卡进度领取原石等奖励"
    ],
    "note": "紊乱爆发期 11/11 10:00 – 11/21 03:59；挑战期至 12/15 03:59。",
    "source": "https://www.miyoushe.com/ys/article/73631435"
  },
  {
    "id": "zzz-33-eni",
    "game": "zzz",
    "type": "event",
    "title": "「『嗯呢』从天降」",
    "subtitle": "签到活动",
    "start": "2026-11-11T10:00:00+08:00",
    "end": "2026-12-01T03:59:00+08:00",
    "banners": [],
    "codes": [],
    "image": "data/images/zzz-zzz-33-eni-1-d9efa0a0.png",
    "gallery": [
      "data/images/zzz-zzz-33-eni-1-d9efa0a0.png"
    ],
    "details": [
      "活动时间：2026/11/11 10:00 – 2026/12/01 03:59",
      "累计签到领取菲林等奖励"
    ],
    "requirements": "绳网等级≥5；完成主线序章「兔与绳」并解锁「活动」功能",
    "note": "签到类活动，奖励以游戏内活动页为准。",
    "source": "https://www.miyoushe.com/zzz/article/79450962"
  },
  {
    "id": "zzz-33-crow",
    "game": "zzz",
    "type": "event",
    "title": "「跛脚乌鸦奇踪记」",
    "subtitle": "版本活动",
    "start": "2026-11-11T10:00:00+08:00",
    "end": "2026-11-30T03:59:00+08:00",
    "banners": [],
    "codes": [],
    "image": "data/images/zzz-zzz-33-crow-1-c1a3d6d4.png",
    "gallery": [
      "data/images/zzz-zzz-33-crow-1-c1a3d6d4.png",
      "data/images/zzz-zzz-33-crow-2-52c75793.png"
    ],
    "details": [
      "活动时间：2026/11/11 10:00 – 2026/11/30 03:59",
      "完成活动关卡与任务，领取菲林等奖励"
    ],
    "requirements": "绳网等级≥20；完成主线第一章·幕间",
    "note": "版本限时活动，详情见官方活动图。",
    "source": "https://www.miyoushe.com/zzz/article/79450779"
  },
  {
    "id": "zzz-33-p2",
    "game": "zzz",
    "type": "banner",
    "title": "3.3 下期限时频段",
    "subtitle": "「答案在风中」赛维里安",
    "start": "2026-11-11T12:00:00+08:00",
    "end": "2026-12-01T14:59:00+08:00",
    "banners": [
      {
        "name": "赛维里安",
        "tag": "S · 风 · 强攻"
      }
    ],
    "note": "上期频段 11/11 11:59 结束，12:00 切换下期。",
    "source": "https://zenless.hoyoverse.com/zh-cn/news/167269"
  },
  {
    "id": "wuwa-38-version",
    "game": "wuwa",
    "type": "version",
    "title": "3.8「旧梦凋零的百合」",
    "subtitle": "版本周期 · 两期共鸣者集音",
    "start": "2026-11-12T11:00:00+08:00",
    "end": "2026-12-22T03:59:00+08:00",
    "banners": [
      {
        "name": "莉莉",
        "tag": "5★ · 上半"
      },
      {
        "name": "西格莉卡",
        "tag": "上半复刻"
      },
      {
        "name": "仇远",
        "tag": "上半复刻"
      },
      {
        "name": "秧秧·玄翎",
        "tag": "下半复刻"
      },
      {
        "name": "穗穗",
        "tag": "下半复刻"
      },
      {
        "name": "绯雪",
        "tag": "下半复刻"
      }
    ],
    "codes": [
      {
        "label": "永久兑换码",
        "code": "WUTHERINGGIFT",
        "reward": "星声 ×50 · 贝币 ×15000 · 养成材料",
        "expires": null
      }
    ],
    "note": "上半 11/12 – 12/03 09:59；下半 12/03 10:00 – 12/22 03:59。版本结束时间为社区汇总，官方可能微调。",
    "source": "https://wutheringwaves.kurogames.com/m/en/main/news/detail/5754"
  },
  {
    "id": "wuwa-38-p1",
    "game": "wuwa",
    "type": "banner",
    "title": "3.8 上半集音",
    "subtitle": "莉莉 / 西格莉卡 / 仇远",
    "start": "2026-11-12T11:00:00+08:00",
    "end": "2026-12-03T09:59:00+08:00",
    "banners": [
      {
        "name": "莉莉",
        "tag": "5★ 新角色"
      },
      {
        "name": "西格莉卡",
        "tag": "5★ 复刻"
      },
      {
        "name": "仇远",
        "tag": "5★ 复刻"
      }
    ],
    "note": "莉莉配套专武「安魂」同步开启武器池。",
    "source": "https://wutheringwaves.kurogames.com/m/en/main/news/detail/5754"
  },
  {
    "id": "wuwa-38-solaris",
    "game": "wuwa",
    "type": "event",
    "title": "「第二索拉：未名之梦」",
    "subtitle": "休闲活动 · 校园养成",
    "start": "2026-11-12T11:00:00+08:00",
    "end": "2026-12-21T11:59:00+08:00",
    "banners": [],
    "details": [
      "活动时间：3.8 版本更新后 – 2026/12/21 11:59（服务器时间）",
      "第二索拉系列校园生活模拟玩法：规划日程、培养能力，与同伴共同迎接最终评定"
    ],
    "rewards": "星声 ×1200、羁旅印章「第二索拉毕业季」、头像「课间时光」",
    "note": "3.8 版本主要休闲活动，详细规则见官方公告。",
    "source": "https://wutheringwaves.kurogames.com/m/en/main/news/detail/5783"
  },
  {
    "id": "wuwa-38-gift",
    "game": "wuwa",
    "type": "event",
    "title": "「昔梦赠礼」七日签到",
    "subtitle": "七日签到活动",
    "start": "2026-11-12T11:00:00+08:00",
    "end": "2026-12-21T03:59:00+08:00",
    "banners": [],
    "details": [
      "活动时间：3.8 版本更新后 – 2026/12/21 03:59（服务器时间）",
      "每日登录游戏，即可前往活动界面领取对应天数的签到奖励"
    ],
    "note": "3.8 版本签到活动，奖励以游戏内活动页为准。",
    "source": "https://wutheringwaves.kurogames.com/m/en/main/news/detail/5783"
  },
  {
    "id": "hsr-47-music",
    "game": "hsr",
    "type": "event",
    "title": "「无中生有」音乐活动",
    "subtitle": "听歌领 80 星琼 · QQ音乐 / 酷狗音乐",
    "start": "2026-11-12T12:00:00+08:00",
    "end": "2026-11-29T23:59:00+08:00",
    "banners": [],
    "codes": [],
    "details": [
      "活动时间：2026/11/12 12:00 – 2026/11/29 23:59",
      "在 QQ音乐 / 酷狗音乐完成听歌互动，可领取星琼兑换码（限量 300 万份，每个 UID 限领 1 次）",
      "兑换码有效期至 2026/12/31 23:59"
    ],
    "rewards": "星琼 ×80（QQ音乐 ×40 + 酷狗音乐 ×40）",
    "requirements": "完成开拓任务「湛蓝星」-「宇宙安宁片刻」并开启【邮件】功能",
    "note": "音乐专辑「神说要有笑（下篇）」宣传 H5 活动，奖励先到先得。",
    "source": "https://www.miyoushe.com/sr/article/79519029"
  },
  {
    "id": "fgo-18579",
    "game": "fgo",
    "type": "event",
    "title": "赠送使用「Fate/Grand Order 藤丸立香想不明白」Season4主视觉图的纪念概念礼装",
    "subtitle": "国服限时活动",
    "start": "2026-11-13T19:00:00+08:00",
    "end": "2026-11-21T03:59:00+08:00",
    "banners": [],
    "details": [
      "时间：2026-11-13 19:00 – 2026-11-21 03:59",
      "公告发布时间：2026-11-11 11:23:38"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18579",
    "image": "data/images/fgo/fgo-18579-1.png",
    "gallery": [
      "data/images/fgo/fgo-18579-1.png"
    ]
  },
  {
    "id": "fgo-18578",
    "game": "fgo",
    "type": "event",
    "title": "「冠位戴冠战：Archer」开幕",
    "subtitle": "国服限时活动",
    "start": "2026-11-13T19:00:00+08:00",
    "end": "2026-11-20T13:59:00+08:00",
    "banners": [],
    "details": [
      "时间：2026-11-13 19:00 – 2026-11-20 13:59",
      "公告发布时间：2026-11-11 11:19:23"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18578",
    "image": "data/images/fgo/fgo-18578-1.png",
    "gallery": [
      "data/images/fgo/fgo-18578-1.png",
      "data/images/fgo/fgo-18578-2.png",
      "data/images/fgo/fgo-18578-3.png"
    ]
  },
  {
    "id": "ak-joint24",
    "game": "arknights",
    "type": "banner",
    "title": "联合行动24",
    "subtitle": "限时寻访 · 4 名 6★ 概率提升",
    "start": "2026-11-15T16:00:00+08:00",
    "end": "2026-11-29T03:59:00+08:00",
    "banners": [
      {
        "name": "林",
        "tag": "6★"
      },
      {
        "name": "焰影苇草",
        "tag": "6★"
      },
      {
        "name": "赤刃明霄陈",
        "tag": "6★"
      },
      {
        "name": "可露希尔",
        "tag": "6★"
      }
    ],
    "note": "联合行动寻访，卡池内 6★ 仅包含上述干员；5★ 与 4★ 名单见 PRTS 卡池一览。",
    "source": "https://m.prts.wiki/w/%E5%8D%A1%E6%B1%A0%E4%B8%80%E8%A7%88"
  },
  {
    "id": "fgo-18580",
    "game": "fgo",
    "type": "event",
    "title": "11月16日（周一），上线3700日纪念活动",
    "subtitle": "国服限时活动",
    "start": "2026-11-16T04:00:00+08:00",
    "end": "2026-11-17T03:59:00+08:00",
    "banners": [],
    "details": [
      "时间：2026-11-16 04:00 – 2026-11-17 03:59",
      "公告发布时间：2026-11-11 11:33:05"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18580",
    "image": "data/images/fgo/fgo-18580-1.png",
    "gallery": [
      "data/images/fgo/fgo-18580-1.png",
      "data/images/fgo/fgo-18580-2.png",
      "data/images/fgo/fgo-18580-3.png"
    ]
  },
  {
    "id": "zzz-33-paint",
    "game": "zzz",
    "type": "event",
    "title": "「修复吧！漂流画集」",
    "subtitle": "版本活动",
    "start": "2026-11-16T10:00:00+08:00",
    "end": "2026-11-30T03:59:00+08:00",
    "banners": [],
    "codes": [],
    "image": "data/images/zzz-zzz-33-paint-1-7ddfe5f9.png",
    "gallery": [
      "data/images/zzz-zzz-33-paint-1-7ddfe5f9.png",
      "data/images/zzz-zzz-33-paint-2-555bd261.png"
    ],
    "details": [
      "活动时间：2026/11/16 10:00 – 2026/11/30 03:59",
      "完成画集修复玩法，领取菲林等奖励"
    ],
    "requirements": "绳网等级≥20；完成主线第一章·幕间",
    "note": "版本限时活动，详情见官方活动图。",
    "source": "https://www.miyoushe.com/zzz/article/79539085"
  },
  {
    "id": "fgo-18582",
    "game": "fgo",
    "type": "banner",
    "title": "Fate/Grand Order「Road to 终章」奏章I篇纪念 美杜莎（Saber）推荐召唤",
    "subtitle": "美杜莎（Saber） · 美杜莎（Saber）」",
    "start": "2026-11-17T19:00:00+08:00",
    "end": "2026-11-24T13:59:00+08:00",
    "banners": [
      {
        "name": "美杜莎（Saber）",
        "tag": "5★ SSR"
      },
      {
        "name": "美杜莎（Saber）」",
        "tag": "5★ SSR"
      }
    ],
    "details": [
      "时间：2026-11-17 19:00 – 2026-11-24 13:59",
      "公告发布时间：2026-11-11 11:36:21"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18582",
    "image": "data/images/fgo/fgo-18582-1.png",
    "gallery": [
      "data/images/fgo/fgo-18582-1.png",
      "data/images/fgo/fgo-18582-2.png",
      "data/images/fgo/fgo-18582-3.png"
    ]
  },
  {
    "id": "fgo-18581",
    "game": "fgo",
    "type": "event",
    "title": "「Final Order Project第2部 终章即将到来！第2部回顾纪念活动 ～奏章I篇～」",
    "subtitle": "国服限时活动",
    "start": "2026-11-17T19:00:00+08:00",
    "end": "2026-11-24T13:59:00+08:00",
    "banners": [],
    "details": [
      "时间：2026-11-17 19:00 – 2026-11-24 13:59",
      "公告发布时间：2026-11-11 11:34:37"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18581",
    "image": "data/images/fgo/fgo-18581-1.png",
    "gallery": [
      "data/images/fgo/fgo-18581-1.png",
      "data/images/fgo/fgo-18581-2.png",
      "data/images/fgo/fgo-18581-3.png"
    ]
  },
  {
    "id": "ef-supply",
    "game": "endfield",
    "type": "event",
    "title": "「理智补给」限时活动",
    "subtitle": "限时资源补给",
    "start": "2026-11-18T04:00:00+08:00",
    "end": "2026-11-25T04:00:00+08:00",
    "banners": [],
    "codes": [],
    "details": [
      "活动时间：2026/11/18 04:00 – 11/25 04:00（服务器时间）"
    ],
    "note": "限时资源补给活动，奖励以游戏内活动页为准。",
    "source": "https://www.skland.com/game/endfield"
  },
  {
    "id": "ef-mijing",
    "game": "endfield",
    "type": "event",
    "title": "密境行者「画外遗光」",
    "subtitle": "解谜活动 · 新空间组",
    "start": "2026-11-19T04:00:00+08:00",
    "end": "2026-11-25T11:59:00+08:00",
    "banners": [],
    "note": "11/19 04:00 开放后续 3 个协议空间，开放至版本更新维护前（预计 11/25），累计可领取嵌晶玉 ×1200 等奖励。",
    "source": "https://endfield.hypergryph.com/news/6094"
  },
  {
    "id": "wuwa-38-lahai",
    "game": "wuwa",
    "type": "event",
    "title": "「拉海洛方块・逆转」",
    "subtitle": "休闲活动 · 旋转功能更新",
    "start": "2026-11-19T04:00:00+08:00",
    "end": "2026-12-03T03:59:00+08:00",
    "banners": [],
    "details": [
      "活动时间：2026/11/19 04:00 – 12/03 03:59（服务器时间）",
      "「拉海洛方块」加入旋转功能，并新增隐藏玩法"
    ],
    "rewards": "星声 ×400、特级共鸣促剂 ×9、特级能源核心 ×6、特级密音筒 ×6、凝素高级物资箱・拉海洛 ×14 等",
    "note": "活动今日 04:00 开启，详细规则见官方公告。",
    "source": "https://wutheringwaves.kurogames.com/m/en/main/news/detail/5783"
  },
  {
    "id": "gi-72-block",
    "game": "genshin",
    "type": "event",
    "title": "「压力方块粉碎计划」",
    "subtitle": "挖掘挑战 · 千星奇域",
    "start": "2026-11-20T10:00:00+08:00",
    "end": "2026-11-30T03:59:00+08:00",
    "banners": [],
    "codes": [],
    "image": "data/images/genshin-gi-72-block-1-1bab0b0d.png",
    "gallery": [
      "data/images/genshin-gi-72-block-1-1bab0b0d.png",
      "data/images/genshin-gi-72-block-2-7d21a7c2.png"
    ],
    "details": [
      "活动时间：2026/11/20 10:00 – 2026/11/30 03:59",
      "完成挖掘挑战关卡，领取原石等活动奖励"
    ],
    "requirements": "冒险等阶≥20；完成魔神任务序章·第三幕「巨龙与自由之歌」",
    "note": "千星奇域限时活动，活动图见上方。",
    "source": "https://www.miyoushe.com/ys/article/79640409"
  },
  {
    "id": "zzz-34-preview",
    "game": "zzz",
    "type": "preview",
    "title": "3.4「长日终尽」前瞻节目",
    "subtitle": "官方前瞻特别节目",
    "start": "2026-11-20T18:30:00+08:00",
    "end": "2026-11-20T23:59:00+08:00",
    "banners": [],
    "image": "data/images/zzz-zzz-34-preview-1-f91124b5.jpg",
    "details": [
      "播出时间：2026/11/20 18:30",
      "本期披露「挽昼」「卡芙卡」「知更鸟」的最新情报",
      "节目期间发放兑换码，并抽取幸运绳匠送出神秘礼品"
    ],
    "note": "11/20 18:30 播出，届时公布 3.4 卡池与前瞻兑换码。",
    "source": "https://www.miyoushe.com/zzz/article/79603551",
    "gallery": [
      "data/images/zzz-zzz-34-preview-1-f91124b5.jpg"
    ]
  },
  {
    "id": "fgo-18605",
    "game": "fgo",
    "type": "event",
    "title": "「冠位戴冠战：Rider」&「冠位戴冠战：Assassin」风暴罐消耗0！纪念活动",
    "subtitle": "国服限时活动",
    "start": "2026-11-21T17:00:00+08:00",
    "end": "2026-11-28T13:59:00+08:00",
    "banners": [],
    "details": [
      "时间：2026-11-21 17:00 – 2026-11-28 13:59",
      "公告发布时间：2026-11-17 11:48:45"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18605",
    "image": "data/images/fgo/fgo-18605-1.png",
    "gallery": [
      "data/images/fgo/fgo-18605-1.png",
      "data/images/fgo/fgo-18605-2.png",
      "data/images/fgo/fgo-18605-3.png"
    ]
  },
  {
    "id": "fgo-18606",
    "game": "fgo",
    "type": "banner",
    "title": "「哈贝特洛特友情点推荐召唤」",
    "subtitle": "国服推荐召唤",
    "start": "2026-11-21T17:00:00+08:00",
    "end": "2026-11-28T13:59:00+08:00",
    "banners": [],
    "details": [
      "时间：2026-11-21 17:00 – 2026-11-28 13:59",
      "公告发布时间：2026-11-17 11:51:04"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18606",
    "image": "data/images/fgo/fgo-18606-1.png",
    "gallery": [
      "data/images/fgo/fgo-18606-1.png",
      "data/images/fgo/fgo-18606-2.png",
      "data/images/fgo/fgo-18606-3.png"
    ]
  },
  {
    "id": "fgo-18604",
    "game": "fgo",
    "type": "banner",
    "title": "「冠位戴冠战：Rider」&「冠位戴冠战：Assassin」推荐召唤",
    "subtitle": "武田信玄（武田晴信） · 武田晴信 · 武田信玄",
    "start": "2026-11-21T17:00:00+08:00",
    "end": "2026-11-28T13:59:00+08:00",
    "banners": [
      {
        "name": "武田信玄（武田晴信）",
        "tag": "5★ SSR"
      },
      {
        "name": "武田晴信",
        "tag": "5★ SSR"
      },
      {
        "name": "武田信玄",
        "tag": "5★ SSR"
      },
      {
        "name": "特斯卡特利波卡",
        "tag": "5★ SSR"
      }
    ],
    "details": [
      "时间：2026-11-21 17:00 – 2026-11-28 13:59",
      "公告发布时间：2026-11-17 11:29:21"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18604",
    "image": "data/images/fgo/fgo-18604-1.png",
    "gallery": [
      "data/images/fgo/fgo-18604-1.png",
      "data/images/fgo/fgo-18604-2.png",
      "data/images/fgo/fgo-18604-3.png"
    ]
  },
  {
    "id": "ef-20-preview",
    "game": "endfield",
    "type": "preview",
    "title": "2.0 揭幕前瞻特别节目",
    "subtitle": "全新版本 & 2.0 揭幕",
    "start": "2026-11-21T19:30:00+08:00",
    "end": "2026-11-21T23:59:00+08:00",
    "banners": [],
    "codes": [],
    "details": [
      "11/21 19:30 播出，公布 2.0 版本内容与卡池"
    ],
    "note": "时间来自终末地官方公告 / 森空岛。",
    "source": "https://www.skland.com/game/endfield"
  },
  {
    "id": "ak-rerun",
    "game": "arknights",
    "type": "event",
    "title": "「雪山降临1101」限时复刻",
    "subtitle": "SideStory 复刻 · 喀兰贸易",
    "start": "2026-11-22T04:00:00+08:00",
    "end": "2026-12-06T03:59:00+08:00",
    "banners": [],
    "details": [
      "活动时间：11/22 04:00 – 12/06 03:59",
      "活动关卡「圣巡之旅」「变革之路」「喀兰之心」：11/22 04:00 – 12/02 03:59",
      "「喀兰贸易技术研发部」「神谕谜题」同步开放，观测站后勤处兑换至 12/06 03:59",
      "轻量化复刻，继承此前活动关卡与首次掉落进度；活动结束后关卡于 12/06 04:00 常驻【曲谱】"
    ],
    "rewards": "干员「溯光星源」、喀兰贸易接待室家具（部分）、模组养成材料、寻访凭证、龙门币等",
    "requirements": "通关主线 1-10",
    "note": "活动关卡「圣巡之旅」「变革之路」「喀兰之心」11/22 04:00 – 12/02 03:59 开放，喀兰贸易技术研发部同步开启。",
    "source": "https://ak.hypergryph.com/news/2808"
  },
  {
    "id": "fgo-18618",
    "game": "fgo",
    "type": "event",
    "title": "使用特别兑换券交换获得「关西区域」的「英灵星行」",
    "subtitle": "国服限时活动",
    "start": "2026-11-24T00:00:00+08:00",
    "end": "2026-12-08T13:59:00+08:00",
    "banners": [],
    "details": [
      "时间：2026-11-24 00:00 – 2026-12-08 13:59",
      "公告发布时间：2026-11-20 14:20:07"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18618",
    "image": "data/images/fgo/fgo-18618-1.png",
    "gallery": [
      "data/images/fgo/fgo-18618-1.png",
      "data/images/fgo/fgo-18618-2.png",
      "data/images/fgo/fgo-18618-3.png"
    ]
  },
  {
    "id": "fgo-18619",
    "game": "fgo",
    "type": "banner",
    "title": "「OVER THE SAME SKY-NOVEMBER-」推荐召唤",
    "subtitle": "宫本武藏（Saber） · 伊什塔尔（Archer） · 埃列什基伽勒（Lancer）",
    "start": "2026-11-24T00:00:00+08:00",
    "end": "2026-12-08T13:59:00+08:00",
    "banners": [
      {
        "name": "宫本武藏（Saber）",
        "tag": "5★ SSR"
      },
      {
        "name": "伊什塔尔（Archer）",
        "tag": "5★ SSR"
      },
      {
        "name": "埃列什基伽勒（Lancer）",
        "tag": "5★ SSR"
      },
      {
        "name": "安德洛墨达",
        "tag": "5★ SSR"
      }
    ],
    "details": [
      "时间：2026-11-24 00:00 – 2026-12-08 13:59",
      "公告发布时间：2026-11-20 14:23:09"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18619",
    "image": "data/images/fgo/fgo-18619-1.png",
    "gallery": [
      "data/images/fgo/fgo-18619-1.png",
      "data/images/fgo/fgo-18619-2.png",
      "data/images/fgo/fgo-18619-3.png"
    ]
  },
  {
    "id": "gi-72-p2",
    "game": "genshin",
    "type": "banner",
    "title": "7.2 下半祈愿",
    "subtitle": "「华黍由仪」兹白 · 「呀吼吼博物志」莉奈娅",
    "start": "2026-11-24T18:00:00+08:00",
    "end": "2026-12-15T14:59:00+08:00",
    "banners": [
      {
        "name": "兹白",
        "tag": "5★ 岩"
      },
      {
        "name": "莉奈娅",
        "tag": "5★ 岩"
      }
    ],
    "image": "data/images/genshin-gi-72-p2-1-523c15eb.png",
    "gallery": [
      "data/images/genshin-gi-72-p2-1-523c15eb.png",
      "data/images/genshin-gi-72-p2-2-4bc6017c.png",
      "data/images/genshin-gi-72-p2-3-5007b2f2.png",
      "data/images/genshin-gi-72-p2-4-cdbc01d9.png"
    ],
    "details": [
      "祈愿时间：2026/11/24 18:00 – 2026/12/15 14:59",
      "「华黍由仪」：限定 5★ 兹白（岩·单手剑）概率提升",
      "「呀吼吼博物志」：限定 5★ 莉奈娅（岩·弓）概率提升",
      "4★ 概率提升：叶洛亚（岩）、爱诺（水）、凝光（岩）",
      "同期「神铸赋形」武器池：朏魄含光（单手剑）、霜结的誓金枝（弓）"
    ],
    "note": "上半卡池 11/24 17:59 结束，18:00 切换至下半；两期角色祈愿保底共享。",
    "source": "https://genshin.hoyoverse.com/m/en/news/detail/167370"
  },
  {
    "id": "gi-72-chronicled",
    "game": "genshin",
    "type": "banner",
    "title": "7.2 集录祈愿「炎天铸名」",
    "subtitle": "自选 5★ 定轨 · 纳塔角色与武器",
    "start": "2026-11-24T18:00:00+08:00",
    "end": "2026-12-15T14:59:00+08:00",
    "banners": [
      {
        "name": "瓦雷莎",
        "tag": "5★ 雷"
      },
      {
        "name": "恰斯卡",
        "tag": "5★ 风"
      },
      {
        "name": "希诺宁",
        "tag": "5★ 岩"
      },
      {
        "name": "玛拉妮",
        "tag": "5★ 水"
      },
      {
        "name": "基尼奇",
        "tag": "5★ 草"
      }
    ],
    "image": "data/images/genshin-gi-72-chronicled-1-67c93d33.png",
    "gallery": [
      "data/images/genshin-gi-72-chronicled-1-67c93d33.png",
      "data/images/genshin-gi-72-chronicled-2-ca8bf035.png"
    ],
    "details": [
      "祈愿时间：2026/11/24 18:00 – 2026/12/15 14:59",
      "可从本期所有 5★ 物品中自选并定轨 1 个 5★ 角色或武器",
      "5★ 角色：瓦雷莎 / 恰斯卡 / 希诺宁 / 玛拉妮 / 基尼奇",
      "5★ 武器：溢彩心念 / 星鹫赤羽 / 岩峰巡歌 / 冲浪时光 / 山王长牙",
      "集录祈愿与溯光祈愿的保底次数共享，与其他祈愿相互独立"
    ],
    "note": "「炎天铸名」为集录祈愿，与下半角色祈愿同期开放。",
    "source": "https://www.miyoushe.com/ys/article/79660855"
  },
  {
    "id": "fgo-18621",
    "game": "fgo",
    "type": "banner",
    "title": "Fate/Grand Order「Road to 终章」奏章II篇纪念 岩窟王 基督山推荐召唤",
    "subtitle": "岩窟王 基督山 · 侦探基督山～未来邂逅篇～ · 岩窟王",
    "start": "2026-11-24T19:00:00+08:00",
    "end": "2026-12-01T13:59:00+08:00",
    "banners": [
      {
        "name": "岩窟王 基督山",
        "tag": "5★ SSR"
      },
      {
        "name": "侦探基督山～未来邂逅篇～",
        "tag": "5★ SSR"
      },
      {
        "name": "岩窟王",
        "tag": "5★ SSR"
      },
      {
        "name": "侦探基督山～未来邂逅篇～」为附带语音的概念礼装",
        "tag": "5★ SSR"
      }
    ],
    "details": [
      "时间：2026-11-24 19:00 – 2026-12-01 13:59",
      "公告发布时间：2026-11-20 14:26:15"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18621",
    "image": "data/images/fgo/fgo-18621-1.png",
    "gallery": [
      "data/images/fgo/fgo-18621-1.png",
      "data/images/fgo/fgo-18621-2.png",
      "data/images/fgo/fgo-18621-3.png"
    ]
  },
  {
    "id": "fgo-18620",
    "game": "fgo",
    "type": "event",
    "title": "「Final Order Project第2部 终章即将到来！第2部回顾纪念活动 ～奏章II篇～」",
    "subtitle": "国服限时活动",
    "start": "2026-11-24T19:00:00+08:00",
    "end": "2026-12-01T13:59:00+08:00",
    "banners": [],
    "details": [
      "时间：2026-11-24 19:00 – 2026-12-01 13:59",
      "公告发布时间：2026-11-20 14:24:46"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18620",
    "image": "data/images/fgo/fgo-18620-1.png",
    "gallery": [
      "data/images/fgo/fgo-18620-1.png",
      "data/images/fgo/fgo-18620-2.png",
      "data/images/fgo/fgo-18620-3.png"
    ]
  },
  {
    "id": "fgo-18623",
    "game": "fgo",
    "type": "banner",
    "title": "「冠位戴冠战：Caster」推荐召唤",
    "subtitle": "救世主梣（雨之魔女梣） · 雨之魔女梣 · 救世主梣",
    "start": "2026-11-24T19:00:00+08:00",
    "end": "2026-12-10T13:59:00+08:00",
    "banners": [
      {
        "name": "救世主梣（雨之魔女梣）",
        "tag": "5★ SSR"
      },
      {
        "name": "雨之魔女梣",
        "tag": "5★ SSR"
      },
      {
        "name": "救世主梣",
        "tag": "5★ SSR"
      },
      {
        "name": "小野小町",
        "tag": "5★ SSR"
      }
    ],
    "details": [
      "时间：2026-11-24 19:00 – 2026-12-10 13:59",
      "公告发布时间：2026-11-20 14:31:57"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18623",
    "image": "data/images/fgo/fgo-18623-1.png",
    "gallery": [
      "data/images/fgo/fgo-18623-1.png",
      "data/images/fgo/fgo-18623-2.png",
      "data/images/fgo/fgo-18623-3.png"
    ]
  },
  {
    "id": "fgo-18622",
    "game": "fgo",
    "type": "event",
    "title": "「冠位戴冠战：Caster」开幕前夕纪念活动",
    "subtitle": "国服限时活动",
    "start": "2026-11-24T19:00:00+08:00",
    "end": "2026-12-10T13:59:00+08:00",
    "banners": [],
    "details": [
      "时间：2026-11-24 19:00 – 2026-12-10 13:59",
      "公告发布时间：2026-11-20 14:28:50"
    ],
    "note": "FGO 国服官网公告；具体时间以官方为准。",
    "source": "https://game.bilibili.com/fgo/news.html#!news/0/1/18622",
    "image": "data/images/fgo/fgo-18622-1.png",
    "gallery": [
      "data/images/fgo/fgo-18622-1.png",
      "data/images/fgo/fgo-18622-2.png",
      "data/images/fgo/fgo-18622-3.png"
    ]
  },
  {
    "id": "hsr-47-p2",
    "game": "hsr",
    "type": "banner",
    "title": "4.7 下半跃迁",
    "subtitle": "阿哈 / 黄泉 / 丹恒·饮月 / 景元",
    "start": "2026-12-02T15:00:00+08:00",
    "end": "2026-12-22T15:00:00+08:00",
    "banners": [
      {
        "name": "星神★阿哈",
        "tag": "5★ 量子 · 欢愉"
      },
      {
        "name": "黄泉",
        "tag": "复刻"
      },
      {
        "name": "丹恒·饮月",
        "tag": "复刻"
      },
      {
        "name": "景元",
        "tag": "复刻"
      }
    ],
    "note": "下半卡池与上半同为阿哈主 UP，复刻位轮换。",
    "source": "https://gamingroute.com/honkai-star-rail-4-7-banners/"
  },
  {
    "id": "wuwa-38-p2",
    "game": "wuwa",
    "type": "banner",
    "title": "3.8 下半集音",
    "subtitle": "秧秧·玄翎 / 穗穗 / 绯雪",
    "start": "2026-12-03T10:00:00+08:00",
    "end": "2026-12-22T03:59:00+08:00",
    "banners": [
      {
        "name": "秧秧·玄翎",
        "tag": "5★"
      },
      {
        "name": "穗穗",
        "tag": "5★"
      },
      {
        "name": "绯雪",
        "tag": "5★"
      }
    ],
    "note": "下半与 3.8 版本同期结束，结束时间以官方公告为准。",
    "source": "https://www.taptap.cn/hashtag/%E9%B8%A3%E6%BD%AE%E6%96%B0%E7%89%88%E6%9C%AC%E5%89%8D%E7%9E%BB"
  },
  {
    "id": "wuwa-38-lollo",
    "game": "wuwa",
    "type": "event",
    "title": "「呜呜企划・整备」",
    "subtitle": "限时委托活动",
    "start": "2026-12-03T10:00:00+08:00",
    "end": "2026-12-17T03:59:00+08:00",
    "banners": [],
    "details": [
      "活动时间：2026/12/03 10:00 – 12/17 03:59（服务器时间）",
      "完成每日任务获取「呜呜邮币」，兑换呜呜物流回赠的「助呜为乐」特别邮递"
    ],
    "rewards": "「助呜为乐」特别邮递",
    "note": "3.8 版本限时委托活动，详细规则见官方公告。",
    "source": "https://wutheringwaves.kurogames.com/m/en/main/news/detail/5783"
  },
  {
    "id": "wuwa-38-dreamfield",
    "game": "wuwa",
    "type": "event",
    "title": "「梦野寻奇」",
    "subtitle": "战斗活动 · 荒寂梦野",
    "start": "2026-12-03T10:00:00+08:00",
    "end": "2026-12-21T03:59:00+08:00",
    "banners": [],
    "details": [
      "活动时间：2026/12/03 10:00 – 12/21 03:59（服务器时间）",
      "探索白色守门人指引的「荒寂梦野」，查明门扉出现的原因"
    ],
    "rewards": "活动称号「穿越梦野之旅」等",
    "note": "3.8 版本战斗活动，详细规则见官方公告。",
    "source": "https://wutheringwaves.kurogames.com/m/en/main/news/detail/5783"
  },
  {
    "id": "wuwa-38-wind",
    "game": "wuwa",
    "type": "event",
    "title": "「风之所向」限时签到",
    "subtitle": "限时登录活动",
    "start": "2026-12-07T04:00:00+08:00",
    "end": "2026-12-21T03:59:00+08:00",
    "banners": [],
    "details": [
      "活动时间：2026/12/07 04:00 – 12/21 03:59（服务器时间）",
      "活动期间每日登录游戏，前往活动界面领取对应天数奖励"
    ],
    "note": "3.8 版本后半段登录活动，奖励以游戏内活动页为准。",
    "source": "https://wutheringwaves.kurogames.com/m/en/main/news/detail/5783"
  },
  {
    "id": "wuwa-39-version",
    "game": "wuwa",
    "type": "version",
    "title": "年度篇章「永明的烬焰」",
    "subtitle": "新联邦 · 12/22 开启",
    "start": "2026-12-22T11:00:00+08:00",
    "end": null,
    "banners": [],
    "codes": [],
    "details": [
      "官方公布：年度篇章将于 2026/12/22 开启",
      "预约专题页已上线，完成预约并在新版本开启后登录可领取星声",
      "具体开服时间与版本内容以官方更新维护公告为准"
    ],
    "note": "3.8 版本将于 12/22 03:59 结束；开服时间暂按官方维护惯例记为 11:00，待维护公告确认。",
    "source": "https://newfederation.kurogames-global.com/"
  }
];
