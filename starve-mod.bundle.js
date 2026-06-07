/* Starve.io mod bundle — 2026-06-07T07-46-19-591Z — node build-loader.js / serve.js */
try{window.__SM_BUILD__="2026-06-07T07-46-19-591Z";}catch(_e){}
try{window.__SM_API_BASE__="https://raw.githubusercontent.com/Russlgg/ss/main";}catch(_e){}

/* ===== src/core/state.js ===== */
/**
 * core/state.js — общий namespace, настройки, бинды, лог, хранилище, шина событий.
 * Каждый модуль — самодостаточный IIFE, получающий общий объект SM.
 */
;(function (SM) {
  'use strict';

  SM.MOD = {
    id: 'starve-mod',
    version: '0.9.15',
    ready: false,
  };

  // Тумблеры функций (Misc / Visual / combat enable-флаги).
  SM.settings = {
    debugLog: true,
    showFps: false,
    showPing: false,
    aimbot: false,
    autoSpike: false,
    autoWall: false,
    autofarm: false,
    autofarmMaxOffset: 30,
    // Worm Farm (авто-принос червей из пустыни)
    wormFarm: false,
    wormTarget: 22,          // сколько червей собрать (из 30 в пустыни)
    wormAggroDist: 160,      // дистанция, на которой червь считается заагренным
    wormRoof: true,          // ставить крыши при аггре грифа
    wormDeliveryPoint: { x: -1, y: -1 }, // точка отдачи
    // Token Logger (TokenJoiner): starve_token + starve_token_id
    token: '',
    tokenId: '',
    autofarmPoints: [
      { x: -1, y: -1 },
      { x: -1, y: -1 },
      { x: -1, y: -1 },
      { x: -1, y: -1 },
    ],
    netSniffer: false,
    /** Подробные отчёты инвентаря в консоль (Net → Inv debug). */
    invDebug: true,
    /** Color Spike: замена текстур построек (spike/spike-door/door) по ally/enemy. */
    colorSpike: false,
    /** Выбранный пак текстур (id из SM.texturePacks.PACKS). */
    colorSpikePack: 'type1',

    // --- новые функции (Binds), enable-тумблеры ---
    autosteal: false,   // забирать предметы из чужих сундуков/печей/мельниц/экстракторов рядом
    autobuild: false,   // продолжать ставить последний поставленный тип постройки
    autofire: false,    // ставить костёр в тайминг (держать тепло ~100%)
    autoBook: true,     // перед крафтом автоматически использовать книгу
    autoFoodFix: true,  // при спавне «прокликать» R-автофуд (4× вкл/выкл, оставить вкл)
    autoFood: false,    // свой автофуд: HP/еда/жажда ~50%
    autoIce: false,     // есть лёд — охлаждать при перегреве
    autoFoodTarget: 0.5,    // порог (0..1), ниже — есть/пить
    autoFoodWithCraft: true, // автофуд во время AutoCraft даже если autoFood выкл
    spectator: false,   // свободная камера (WASD), персонаж стоит
    autocraft: false,   // авто-крафт выбранного рецепта
    autorecycle: false, // авто-переработка выбранного предмета у верстака
    smartCraft: false,  // NVX SmartCraft — цепочка крафта к цели
    smartCraftTargetName: 'Reidite Spike',
    smartCraftCount: 1,
    xray: false,        // прозрачные стены/крыши (видно сквозь)
    dropSword: false,   // (момент. действие) выбросить оружие из правой руки
    hideScript: false,  // (момент. действие) спрятать UI мода

    // --- параметры новых функций ---
    xrayOpacity: 0.4,       // прозрачность построек в xray (0..1)
    spectatorSpeed: 50,     // скорость свободной камеры, px/тик

    // --- Visual (порт из oldscript), рисуются на собственном overlay-canvas ---
    // HUD
    hudPercents: false,     // % жизни/еды/тепла/жажды
    hudTimers: false,       // число HP + отсчёт реген/голод
    daysCounter: false,     // номер дня
    betterQuestTime: false, // формат таймера квеста: Xd Ym Zs
    // World ESP
    totemInfo: false,       // владелец/цвет над тотемами
    boxInfo: false,         // метки мёртвых ящиков/крейтов/подарков
    buildInfo: false,       // ресурс экстракторов/мельниц/печей
    chestInfo: false,       // предпросмотр выбранного слота сундука
    showNamesPlus: false,   // ник+уровень над игроками
    mobHp: false,           // HP над мобами (сердечко + число)
    // On top (oldscript): порядок отрисовки поверх построек
    playerOnTop: true,
    boxOnTop: true,
    totemOnTop: true,
    chestOnTop: true,
    // Map (угловой радар)
    totemOnMap: false,
    playersOnMap: false,
    lastDeath: false,
    /** Трейсеры на животных: tracers.WOLF, tracers.SPIDER, … */
    tracers: {},
  };

  // Какие клавиши активируют функции (code из KeyboardEvent.code).
  SM.binds = {
    toggleMenu: 'Insert',
    aimbot: 'KeyV',
    autoSpike: 'KeyF',
    autoWall: 'KeyG',
    autofarm: 'KeyN',
    wormFarm: 'KeyM',
    // новые (дефолты подобраны без конфликтов с игрой/существующими биндами)
    autosteal: 'KeyE',
    autobuild: 'KeyB',
    autofire: 'KeyR',
    spectator: 'KeyY',
    autocraft: 'KeyK',
    autorecycle: 'KeyL',
    xray: 'KeyQ',
    dropSword: 'KeyX',
    hideScript: 'KeyH',
  };

  // Режим активации: 'hold' (пока зажата), 'toggle' (переключатель),
  // 'press' (одноразовое действие по нажатию).
  SM.bindMode = {
    aimbot: 'toggle',
    autoSpike: 'hold',
    autoWall: 'hold',
    autofarm: 'toggle',
    wormFarm: 'toggle',
    autosteal: 'hold',
    autobuild: 'toggle',
    autofire: 'toggle',
    spectator: 'toggle',
    autocraft: 'toggle',
    autorecycle: 'toggle',
    xray: 'toggle',
    dropSword: 'press',
    hideScript: 'press',
  };

  // Привязка предметов на хотбаре (какую клавишу слать для экипировки).
  SM.itemKeys = {
    spike: 'Digit3',
    wall: 'Digit2',
  };

  const STORAGE_KEY = 'starve-mod:v1';

  SM.log = function () {
    if (!SM.settings.debugLog) return;
    console.log.apply(console, ['[' + SM.MOD.id + ']'].concat([].slice.call(arguments)));
  };

  SM.warn = function () {
    console.warn.apply(console, ['[' + SM.MOD.id + ']'].concat([].slice.call(arguments)));
  };

  SM.storage = {
    load: function () {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (data.settings) Object.assign(SM.settings, data.settings);
        if (data.binds) Object.assign(SM.binds, data.binds);
        if (data.bindMode) Object.assign(SM.bindMode, data.bindMode);
        if (data.itemKeys) Object.assign(SM.itemKeys, data.itemKeys);
      } catch (err) {
        SM.warn('storage load failed', err);
      }
    },
    save: function () {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            settings: SM.settings,
            binds: SM.binds,
            bindMode: SM.bindMode,
            itemKeys: SM.itemKeys,
          })
        );
      } catch (err) {
        SM.warn('storage save failed', err);
      }
    },
  };

  // Минимальная шина событий: SM.bus.on('net:in', cb); SM.bus.emit('net:in', data)
  const handlers = Object.create(null);
  SM.bus = {
    on: function (event, cb) {
      (handlers[event] || (handlers[event] = [])).push(cb);
      return function off() {
        const arr = handlers[event];
        if (!arr) return;
        const i = arr.indexOf(cb);
        if (i >= 0) arr.splice(i, 1);
      };
    },
    emit: function (event, payload) {
      const arr = handlers[event];
      if (!arr) return;
      for (let i = 0; i < arr.length; i++) {
        try {
          arr[i](payload);
        } catch (err) {
          SM.warn('handler error for', event, err);
        }
      }
    },
  };
})(window.__SM__ = window.__SM__ || {});


/* ===== src/core/keys.js ===== */
/**
 * core/keys.js — рантайм-резолвер обфусцированных ключей сущности/игрока.
 *
 * ЗАЧЕМ: клиент starve.io обфусцируется заново каждые 2-3 дня (автообновление).
 * Имена полей вроде unit.<PID> (владелец), user.<UID> (свой uid), user.<TEAM>
 * (массив союзников) меняются при каждом обновлении. Раньше они были захардкожены
 * строковыми константами в каждой фиче — поэтому после обновления клиента
 * autosteal / color-spike / ESP / aimbot разом умирали (uid не число → self=null,
 * pid не число → постройки не опознаются).
 *
 * РЕШЕНИЕ: находим ключи СТРУКТУРНО по живым объектам __SV_USER__/__SV_WORLD__,
 * не завязываясь на конкретные обфусцированные имена. Результат кэшируется и
 * перепроверяется (TTL + само-валидация). Старые значения остаются как fallback,
 * ручной оверрайд — через window.__SV_KEYS__ = { uid, pid, team }.
 *
 * СИГНАТУРЫ (подтверждены реверсом клиента):
 *   UID  — числовое поле user, такое что fast[user.UID] === self-юнит, и при этом
 *          self-юнит хранит собственный uid под тем же ключом (self[UID] === uid).
 *          Само-референс делает находку однозначной.
 *   PID  — числовое поле, присутствующее на ВСЕХ юнитах (владелец; мобы=0); у
 *          self-юнита PID === user.id (id игрока не обфусцирован).
 *   TEAM — массив целых на user, чьи элементы — валидные pid (есть среди владельцев
 *          в мире). Берём только провалидированный непустой массив (иначе null —
 *          в соло команда пуста, ally = только свой id).
 */
;(function (SM) {
  'use strict';

  // Последняя известная обфускация — fallback, если дискавери не отработала
  // (например, ещё не в игре). Рантайм-находка всегда имеет приоритет.
  const FALLBACK = { uid: 'α︈̄', pid: 'Іᄃᴎ', team: 'ϲᚂᄅ' };

  const TTL_MS = 4000;
  const resolved = { uid: null, pid: null, team: null };
  let lastOk = 0;

  function getUser() {
    try { const u = window.__SV_USER__; return u && typeof u === 'object' ? u : null; } catch (_) { return null; }
  }
  function getWorld() {
    try { const w = window.__SV_WORLD__; return w && typeof w === 'object' ? w : null; } catch (_) { return null; }
  }

  function isUnit(o) {
    return (
      o && typeof o === 'object' && !Array.isArray(o) &&
      typeof o.x === 'number' && typeof o.y === 'number' &&
      typeof o.type === 'number' && typeof o.id === 'number'
    );
  }

  // Самый длинный массив юнитов в world (fast_units, индексируется по uid).
  function findFast(world) {
    let fast = null, fastLen = -1;
    const keys = Object.getOwnPropertyNames(world);
    for (let i = 0; i < keys.length; i++) {
      let v; try { v = world[keys[i]]; } catch (_) { continue; }
      if (!Array.isArray(v)) continue;
      let el = null;
      for (let j = 0; j < v.length; j++) { if (v[j] != null) { el = v[j]; break; } }
      if (isUnit(el) && v.length > fastLen) { fast = v; fastLen = v.length; }
    }
    return fast;
  }

  function override(name) {
    try {
      const o = window.__SV_KEYS__;
      return o && typeof o[name] === 'string' && o[name] ? o[name] : null;
    } catch (_) { return null; }
  }

  // Текущие ключи ещё валидны? (быстрая проверка без полного перебора)
  function stillValid(user, fast) {
    if (!resolved.uid || !resolved.pid) return false;
    const uid = user[resolved.uid];
    if (typeof uid !== 'number' || uid < 0 || uid >= fast.length) return false;
    const self = fast[uid];
    if (!isUnit(self)) return false;
    if (typeof self[resolved.pid] !== 'number') return false;
    return true;
  }

  function discover() {
    const user = getUser();
    const world = getWorld();
    if (!user || !world) return false;
    const fast = findFast(world);
    if (!fast) return false;

    // быстрый путь: уже найденные ключи держатся
    if (stillValid(user, fast)) { lastOk = Date.now(); return true; }

    const ukeys = Object.getOwnPropertyNames(user);

    // 1) UID: user[K] = v (целое), fast[v] — self-юнит, и self[K] === v (само-uid)
    let uidKey = null, self = null;
    for (let i = 0; i < ukeys.length; i++) {
      const K = ukeys[i];
      let v; try { v = user[K]; } catch (_) { continue; }
      if (typeof v !== 'number' || !Number.isInteger(v) || v < 0 || v >= fast.length) continue;
      const cand = fast[v];
      if (!isUnit(cand)) continue;
      let sv; try { sv = cand[K]; } catch (_) { continue; }
      if (sv === v) { uidKey = K; self = cand; break; }
    }
    if (!uidKey || !self) return false;

    // 2) PID: числовое поле self со значением === user.id, присутствующее на всех юнитах.
    const sample = [];
    for (let i = 0; i < fast.length && sample.length < 60; i++) {
      if (isUnit(fast[i])) sample.push(fast[i]);
    }
    let pidKey = null, pidScore = -1;
    const skeys = Object.getOwnPropertyNames(self);
    for (let i = 0; i < skeys.length; i++) {
      const P = skeys[i];
      if (P === 'id' || P === 'type' || P === 'x' || P === 'y' || P === uidKey) continue;
      let pv; try { pv = self[P]; } catch (_) { continue; }
      if (typeof pv !== 'number' || !Number.isInteger(pv)) continue;
      let cov = 0;
      for (let j = 0; j < sample.length; j++) {
        const w = sample[j][P];
        if (typeof w === 'number' && Number.isInteger(w)) cov++;
      }
      let score = sample.length ? cov / sample.length : 0;
      if (typeof user.id === 'number' && pv === user.id) score += 2; // владелец self = мой id
      if (score > pidScore) { pidScore = score; pidKey = P; }
    }
    if (pidScore < 1.5) pidKey = null; // требуем и покрытие, и совпадение с user.id

    // 3) TEAM: массив целых на user, элементы которого — реальные pid из мира.
    let teamKey = null;
    if (pidKey) {
      const pidSet = Object.create(null);
      if (typeof user.id === 'number') pidSet[user.id] = 1;
      for (let j = 0; j < sample.length; j++) {
        const p = sample[j][pidKey];
        if (typeof p === 'number') pidSet[p] = 1;
      }
      for (let i = 0; i < ukeys.length; i++) {
        const K = ukeys[i];
        if (K === uidKey || K === pidKey) continue;
        let v; try { v = user[K]; } catch (_) { continue; }
        if (!Array.isArray(v) || v.length === 0 || v.length > 64) continue;
        let allPid = true;
        for (let j = 0; j < v.length; j++) {
          if (!Number.isInteger(v[j]) || !pidSet[v[j]]) { allPid = false; break; }
        }
        if (allPid) { teamKey = K; break; }
      }
    }

    resolved.uid = uidKey;
    resolved.pid = pidKey;
    resolved.team = teamKey; // может быть null (соло) — это нормально
    lastOk = Date.now();
    try {
      window.__SV_KEYS_RESOLVED__ = { uid: uidKey, pid: pidKey, team: teamKey, at: lastOk };
    } catch (_) {}
    return true;
  }

  // Гарантирует свежий резолв (с TTL). Возвращает true, если ключи готовы.
  function ensure() {
    const user = getUser();
    const world = getWorld();
    if (resolved.uid && resolved.pid && Date.now() - lastOk < TTL_MS) {
      if (user && world) {
        const fast = findFast(world);
        if (fast && stillValid(user, fast)) return true;
      } else if (!user && !world) {
        return true;
      }
      lastOk = 0;
    }
    return discover();
  }

  // Текущий ключ: оверрайд → найденный → fallback.
  function keyOf(name) {
    return override(name) || resolved[name] || (name === 'team' ? FALLBACK.team : FALLBACK[name]);
  }

  const keys = {
    uid: function () { ensure(); return override('uid') || resolved.uid || FALLBACK.uid; },
    pid: function () { ensure(); return override('pid') || resolved.pid || FALLBACK.pid; },
    // team может легитимно отсутствовать (соло) → возвращаем найденный/оверрайд/fallback.
    team: function () { ensure(); return override('team') || resolved.team || FALLBACK.team; },

    getUid: function (user) {
      if (!user) return undefined;
      const v = user[keys.uid()];
      return typeof v === 'number' ? v : undefined;
    },
    getPid: function (unit) {
      if (!unit) return undefined;
      const v = unit[keys.pid()];
      return typeof v === 'number' ? v : undefined;
    },
    getTeam: function (user) {
      if (!user) return null;
      const v = user[keys.team()];
      return Array.isArray(v) ? v : null;
    },

    // self-юнит из fast_units по uid (или null).
    selfUnit: function () {
      const user = getUser();
      const world = getWorld();
      if (!user || !world) return null;
      const fast = findFast(world);
      if (!fast) return null;
      if (!resolved.uid || !stillValid(user, fast)) discover();
      if (!resolved.uid) return null;
      const uid = user[resolved.uid];
      if (typeof uid !== 'number') return null;
      const self = fast[uid];
      return isUnit(self) ? self : null;
    },

    // Свой/враг по pid (как сам клиент: мой id или член команды).
    isAlly: function (pid) {
      if (typeof pid !== 'number') return false;
      const user = getUser();
      if (!user) return false;
      try { if (pid === user.id) return true; } catch (_) {}
      const team = keys.getTeam(user);
      if (team && team.indexOf(pid) !== -1) return true;
      return false;
    },

    refresh: function () { lastOk = 0; resolved.uid = resolved.pid = resolved.team = null; return ensure(); },

    probe: function () {
      const ok = keys.refresh();
      const user = getUser();
      const self = keys.selfUnit();
      const rep =
        'keys.probe: resolved=' + ok +
        ' uid=' + (resolved.uid || '(fallback ' + FALLBACK.uid + ')') +
        ' pid=' + (resolved.pid || '(fallback ' + FALLBACK.pid + ')') +
        ' team=' + (resolved.team || '(none/fallback)') +
        ' user=' + (user ? 'yes' : 'NO') +
        ' self=' + (self ? 'yes id=' + self.id + ' type=' + self.type : 'NO');
      console.log(rep);
      try { window.__SM_KEYS_PROBE__ = rep; } catch (_) {}
      return rep;
    },
  };

  SM.keys = keys;
})(window.__SM__ = window.__SM__ || {});


/* ===== src/core/gauge-keys.js ===== */
/**
 * core/gauge-keys.js — рантайм-резолвер полей gauges (l/h/c/t/wa).
 * Клиент обфусцируется каждые 2–3 дня → хардкод имён ломается.
 * Находим ключи по сигнатуре + корреляции с шириной баров (bar probe).
 */
;(function (SM) {
  'use strict';

  const ROLES = ['l', 'h', 'c', 't', 'wa'];
  const ROLE_ALIAS = {
    l: ['l', 'life'],
    h: ['h', 'food', 'hunger'],
    c: ['c', 'cold'],
    t: ['t', 'thirst', 'water'],
    wa: ['wa', 'warm'],
  };

  const FALLBACK = {
    l: 'ᴘ̂ᄉ',
    h: 'ᴑᚉࠂ',
    c: 'c',
    t: 'ոߓ๑',
    wa: 'ᴄᚇо',
  };

  let gaugeObjKey = null;
  const resolved = { l: null, h: null, c: null, t: null, wa: null };
  let lastCorrelateAt = 0;

  function getUser() {
    try {
      const u = window.__SV_USER__;
      return u && typeof u === 'object' ? u : null;
    } catch (_) {
      return null;
    }
  }

  function visOverride(name) {
    try {
      const o = window.__SV_VIS_KEYS__;
      return o && o.gauges && o.gauges[name];
    } catch (_) {
      return null;
    }
  }

  function looksLikeCoords(g) {
    let big = 0;
    const ks = Object.getOwnPropertyNames(g);
    for (let i = 0; i < ks.length; i++) {
      const k = ks[i], v = g[k];
      if (typeof v === 'number' && (k === 'x' || k === 'y' || k === 'w' || k === 'h') && Math.abs(v) > 200) big++;
    }
    return big >= 2;
  }

  function gaugeScore(g) {
    if (!g || typeof g !== 'object' || Array.isArray(g)) return 0;
    if (looksLikeCoords(g)) return 0;
    let flat = 0, anim = 0;
    const gk = Object.getOwnPropertyNames(g);
    for (let j = 0; j < gk.length; j++) {
      let v; try { v = g[gk[j]]; } catch (_) { continue; }
      if (typeof v === 'number' && v >= 0 && v <= 1.0001) flat++;
      else if (v && typeof v === 'object' && !Array.isArray(v) && typeof v.x === 'number' && v.x >= 0 && v.x <= 1.0001) anim++;
    }
    return flat + 3 * anim;
  }

  function fieldVal(v) {
    if (typeof v === 'number') return v;
    if (v && typeof v === 'object' && !Array.isArray(v) && typeof v.x === 'number') return v.x;
    return null;
  }

  const ROLE_BAR = { l: 'life', h: 'food', c: 'cold', t: 'thirst', wa: 'warm' };

  const ROLE_EXCLUDE = {
    l: ['oxygen', 'o2', 'warm', 'food', 'hunger', 'thirst', 'cold'],
    h: ['oxygen', 'life', 'warm', 'thirst', 'cold'],
    t: ['oxygen', 'life', 'warm', 'food', 'cold'],
    c: ['oxygen', 'life', 'warm', 'food', 'thirst'],
    wa: ['oxygen', 'life', 'food', 'thirst', 'cold'],
  };

  function fieldValFlat(v) {
    if (typeof v === 'number') return v;
    return null;
  }

  function barRoleVal(role, bars) {
    if (!bars) return null;
    const bk = ROLE_BAR[role];
    return bk && bars[bk] != null ? bars[bk] : null;
  }

  function isExcludedKey(role, k) {
    if (role === 'c' && k === 'c') return false;
    const kl = String(k).toLowerCase();
    const ex = ROLE_EXCLUDE[role];
    if (!ex) return false;
    for (let i = 0; i < ex.length; i++) {
      const h = ex[i];
      if (kl === h) return true;
      if (h.length > 2 && kl.indexOf(h) >= 0) return true;
    }
    return false;
  }

  function invalidateBarMismatch(g, bars) {
    if (!g || !bars) return;
    for (let r = 0; r < ROLES.length; r++) {
      const role = ROLES[r];
      const bv = barRoleVal(role, bars);
      if (bv == null) continue;
      const k = resolved[role];
      if (!k) continue;
      const gv = fieldValCorrelate(g, k);
      if (gv != null && Math.abs(gv - bv) > 0.04) resolved[role] = null;
    }
  }

  function findGaugeObject(user) {
    if (!user) return null;
    const ovr = visOverride('obj');
    if (typeof ovr === 'string' && user[ovr]) return user[ovr];
    if (gaugeObjKey && user[gaugeObjKey]) return user[gaugeObjKey];
    gaugeObjKey = null;
    const keys = Object.getOwnPropertyNames(user);
    let best = null, bestScore = 0;
    for (let i = 0; i < keys.length; i++) {
      let g; try { g = user[keys[i]]; } catch (_) { continue; }
      const s = gaugeScore(g);
      if (s > bestScore) { bestScore = s; best = keys[i]; }
    }
    if (best && bestScore >= 3) {
      gaugeObjKey = best;
      return user[best];
    }
    return null;
  }

  function hintDiscover(g) {
    const ks = Object.getOwnPropertyNames(g);
    for (let r = 0; r < ROLES.length; r++) {
      const role = ROLES[r];
      if (resolved[role]) continue;
      const hints = ROLE_ALIAS[role];
      for (let j = 0; j < hints.length; j++) {
        const a = hints[j];
        if (fieldValFlat(g[a]) != null) { resolved[role] = a; break; }
      }
      if (resolved[role]) continue;
      for (let i = 0; i < ks.length; i++) {
        const k = ks[i];
        if (isExcludedKey(role, k)) continue;
        const kl = k.toLowerCase();
        for (let j = 0; j < hints.length; j++) {
          if (kl === hints[j] || (hints[j].length > 1 && kl.indexOf(hints[j]) >= 0)) {
            if (fieldValFlat(g[k]) != null) { resolved[role] = k; break; }
            if (fieldVal(g[k]) != null) { resolved[role] = k; break; }
          }
        }
      }
    }
    if (!resolved.c && fieldValFlat(g.c) != null) resolved.c = 'c';
  }

  function fieldValCorrelate(g, k) {
    const flat = fieldValFlat(g[k]);
    if (flat != null) return flat;
    return fieldVal(g[k]);
  }

  function readFlatAliases(g, role) {
    const hints = ROLE_ALIAS[role];
    for (let j = 0; j < hints.length; j++) {
      const flat = fieldValFlat(g[hints[j]]);
      if (flat != null) return flat;
    }
    return null;
  }

  function readAnimAliases(g, role) {
    const hints = ROLE_ALIAS[role];
    for (let j = 0; j < hints.length; j++) {
      const anim = fieldVal(g[hints[j]]);
      if (anim != null) return anim;
    }
    return null;
  }

  function readRoleDisplay(g, role, bars) {
    const flat = readFlatAliases(g, role);
    if (flat != null) return flat;

    const k = keyFor(role);
    if (k) {
      const nFlat = fieldValFlat(g[k]);
      if (nFlat != null) return nFlat;
      const anim = fieldVal(g[k]);
      if (anim != null) return anim;
    }

    const anim = readAnimAliases(g, role);
    if (anim != null) return anim;

    if (role === 'l') {
      const life = fieldVal(g.life);
      if (life != null) return life;
    }

    const bv = barRoleVal(role, bars);
    if (bv != null && barFresh(bars)) return bv;
    return null;
  }

  function correlate(g, bars) {
    if (!g || !bars) return;
    const now = Date.now();
    if (now - lastCorrelateAt < 50) return;
    lastCorrelateAt = now;
    const map = { l: bars.life, h: bars.food, c: bars.cold, t: bars.thirst, wa: bars.warm };
    const ks = Object.getOwnPropertyNames(g);
    for (let r = 0; r < ROLES.length; r++) {
      const role = ROLES[r];
      const target = map[role];
      if (target == null) continue;
      if ((role === 'c' || role === 'wa') && map.l === target && target > 0.98) continue;
      let bestK = null;
      let bestD = 0.04;
      for (let i = 0; i < ks.length; i++) {
        const k = ks[i];
        if (isExcludedKey(role, k)) continue;
        const v = fieldValCorrelate(g, k);
        if (v == null) continue;
        const d = Math.abs(v - target);
        if (d < bestD) { bestD = d; bestK = k; }
      }
      if (bestK && fieldValFlat(g[bestK]) != null) resolved[role] = bestK;
      else if (bestK && !resolved[role]) resolved[role] = bestK;
    }
  }

  function keyFor(role) {
    const o = visOverride(role);
    if (typeof o === 'string' && o) return o;
    if (resolved[role]) return resolved[role];
    return FALLBACK[role] || null;
  }

  function barFresh(bars) {
    return bars && bars._at && Date.now() - bars._at < 400;
  }

  function readRole(g, role, bars, opts) {
    opts = opts || {};
    if (!g) return null;

    if (opts.flatOnly) {
      const flat = readFlatAliases(g, role);
      if (flat != null) return flat;
      const k = keyFor(role);
      if (k) {
        const n = fieldValFlat(g[k]);
        if (n != null) return n;
      }
      return null;
    }

    if (opts.preferBar) {
      const bv = barRoleVal(role, bars);
      if (bv != null && barFresh(bars)) return bv;
    }

    return readRoleDisplay(g, role, bars);
  }

  const gaugeKeys = {
    obj: function () {
      return findGaugeObject(getUser());
    },

    refresh: function () {
      gaugeObjKey = null;
      for (let i = 0; i < ROLES.length; i++) resolved[ROLES[i]] = null;
      const g = findGaugeObject(getUser());
      if (g) hintDiscover(g);
      return g;
    },

    correlate: correlate,

    read: function (g, role, bars, opts) {
      if (!g) g = findGaugeObject(getUser());
      if (g) hintDiscover(g);
      return readRole(g, role, bars, opts);
    },

    readAll: function (g, bars, opts) {
      opts = opts || {};
      if (!g) g = findGaugeObject(getUser());
      if (g) {
        hintDiscover(g);
        if (bars && opts.discover) {
          invalidateBarMismatch(g, bars);
          correlate(g, bars);
        }
      }
      const readOpts = {
        preferBar: !!opts.preferBar,
        flatOnly: !!opts.flatOnly,
      };
      return {
        life: readRole(g, 'l', bars, readOpts),
        food: readRole(g, 'h', bars, readOpts),
        cold: readRole(g, 'c', bars, readOpts),
        thirst: readRole(g, 't', bars, readOpts),
        warm: readRole(g, 'wa', bars, readOpts),
      };
    },

    getResolved: function () {
      const out = { obj: gaugeObjKey };
      for (let i = 0; i < ROLES.length; i++) {
        const role = ROLES[i];
        out[role] = resolved[role] || keyFor(role);
      }
      return out;
    },

    probe: function () {
      const g = gaugeKeys.refresh();
      const bars = gaugeKeys._lastBars || null;
      const all = gaugeKeys.readAll(g, bars, { discover: true });
      const rep = 'gaugeKeys.probe: obj=' + (gaugeObjKey || '?') +
        ' resolved=' + JSON.stringify(gaugeKeys.getResolved()) +
        ' values=' + JSON.stringify(all);
      console.log(rep);
      try { window.__SM_GAUGE_PROBE__ = rep; } catch (_) {}
      return rep;
    },

    _lastBars: null,
    setBarSnapshot: function (bars) {
      gaugeKeys._lastBars = bars;
    },
  };

  SM.gaugeKeys = gaugeKeys;
})(window.__SM__ = window.__SM__ || {});


/* ===== src/core/bar-gauges.js ===== */
/**
 * core/bar-gauges.js — значения HUD-баров с canvas (fillRect).
 * Быстрый фильтр: 99% fillRect отсекаются до getTransform().
 */
;(function (SM) {
  'use strict';

  const BAR_X = [37, 277, 517, 757];
  const BAR_W = 178;
  const BAR_H = 18;
  const SLOT_TOL = 28;
  const STALE_MS = 8000;

  const SLOT_KIND = { life: 0, food: 1, cold: 2, warm: 2, thirst: 3 };

  const COLOR_KIND = {
    '#69a148': 'life',
    'rgb(105, 161, 72)': 'life',
    '#af352a': 'food',
    'rgb(175, 53, 42)': 'food',
    '#669bb1': 'cold',
    'rgb(102, 155, 177)': 'cold',
    '#9c4036': 'warm',
    'rgb(156, 64, 54)': 'warm',
    '#074a87': 'thirst',
    'rgb(7, 74, 135)': 'thirst',
  };

  const S = {
    us: 0,
    hpLeft: null,
    barTop: null,
    foodLeft: null,
    life: null,
    food: null,
    cold: null,
    warm: null,
    thirst: null,
    lifeAt: 0,
    foodAt: 0,
    coldAt: 0,
    warmAt: 0,
    thirstAt: 0,
  };

  function normColor(fillStyle) {
    if (!fillStyle || typeof fillStyle !== 'string') return null;
    const s = fillStyle.length === 7 && fillStyle.charCodeAt(0) === 35
      ? fillStyle.toLowerCase()
      : fillStyle.trim().toLowerCase();
    if (COLOR_KIND[s]) return COLOR_KIND[s];
    if (s.charCodeAt(0) === 114) {
      const m = s.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
      if (m) return COLOR_KIND['rgb(' + m[1] + ', ' + m[2] + ', ' + m[3] + ')'] || null;
    }
    return null;
  }

  function fresh(at) {
    return at > 0 && Date.now() - at < STALE_MS;
  }

  function pick(at, v) {
    return fresh(at) ? v : null;
  }

  function nearestSlot(logicalX) {
    let best = -1;
    let bestD = SLOT_TOL + 1;
    for (let i = 0; i < BAR_X.length; i++) {
      const d = Math.abs(logicalX - BAR_X[i]);
      if (d < bestD) { bestD = d; best = i; }
    }
    return bestD <= SLOT_TOL ? best : -1;
  }

  function logicalX(left, us) {
    if (S.hpLeft == null || !(us > 0)) return null;
    return (left - S.hpLeft) / us + BAR_X[0];
  }

  function isGameCanvas(c) {
    if (!c) return false;
    if (c.id === 'game_canvas') return true;
    return typeof c.width === 'number' && typeof c.height === 'number' &&
      c.width >= 600 && c.height >= 400;
  }

  function slotKindFromIndex(slot) {
    if (slot === 0) return 'life';
    if (slot === 1) return 'food';
    if (slot === 2) return 'cold';
    if (slot === 3) return 'thirst';
    return null;
  }

  function touch(kind, frac, us, left, top) {
    const now = Date.now();
    S.us = us;
    if (kind === 'life') {
      S.hpLeft = left;
      S.barTop = top;
      S.life = frac;
      S.lifeAt = now;
      return;
    }
    if (kind === 'food') {
      S.foodLeft = left;
      if (S.barTop == null) S.barTop = top;
      S.food = frac;
      S.foodAt = now;
      return;
    }
    if (kind === 'cold') { S.cold = frac; S.coldAt = now; return; }
    if (kind === 'warm') { S.warm = 1 - frac; S.warmAt = now; return; }
    if (kind === 'thirst') { S.thirst = frac; S.thirstAt = now; }
  }

  function onFillRect(ctx, x, y, w, h) {
    if (h < 4 || h > 28 || w < 2 || w > 400) return;
    const c = ctx.canvas;
    if (!isGameCanvas(c)) return;

    const fill = ctx.fillStyle;
    let kind = typeof fill === 'string' ? normColor(fill) : null;
    if (!kind && S.hpLeft == null) return;

    const t = ctx.getTransform();
    const barH = Math.hypot(t.c * h, t.d * h);
    if (barH < 4 || barH > 80) return;

    const us = barH / BAR_H;
    const deviceW = Math.hypot(t.a * w, t.b * w);
    const maxW = BAR_W * us;
    if (deviceW > maxW * 1.05) return;

    const left = t.a * x + t.c * y + t.e;
    const top = t.b * x + t.d * y + t.f;
    const frac = Math.max(0, Math.min(1, deviceW / maxW));

    if (!kind && S.hpLeft != null) {
      const lx = logicalX(left, us);
      const slot = lx != null ? nearestSlot(lx) : -1;
      kind = slotKindFromIndex(slot);
    }

    if (!kind) return;

    if (S.hpLeft != null && kind !== 'life') {
      const lx = logicalX(left, us);
      if (lx != null && nearestSlot(lx) !== SLOT_KIND[kind]) return;
    }

    touch(kind, frac, us, left, top);
  }

  function install() {
    if (install.done) return;
    install.done = true;
    const orig = CanvasRenderingContext2D.prototype.fillRect;
    CanvasRenderingContext2D.prototype.fillRect = function (x, y, w, h) {
      const ret = orig.apply(this, arguments);
      try { onFillRect(this, x, y, w, h); } catch (_) {}
      return ret;
    };
  }

  const barGauges = {
    install: install,
    read: function () {
      return {
        life: pick(S.lifeAt, S.life),
        food: pick(S.foodAt, S.food),
        cold: pick(S.coldAt, S.cold),
        warm: pick(S.warmAt, S.warm),
        thirst: pick(S.thirstAt, S.thirst),
      };
    },
    layout: function () {
      if (!(S.us > 0) || S.barTop == null) return null;
      return {
        us: S.us,
        hpLeft: S.hpLeft,
        barTop: S.barTop,
        foodLeft: S.foodLeft,
        fresh: fresh(S.lifeAt) || fresh(S.foodAt) || fresh(S.thirstAt),
      };
    },
    foodPct: function () {
      if (!fresh(S.foodAt) || S.food == null) return null;
      return Math.floor(S.food * 100);
    },
    reset: function () {
      S.hpLeft = null;
      S.barTop = null;
      S.foodLeft = null;
      S.life = S.food = S.cold = S.warm = S.thirst = null;
      S.lifeAt = S.foodAt = S.coldAt = S.warmAt = S.thirstAt = 0;
    },
    _debug: function () { return JSON.parse(JSON.stringify(S)); },
  };

  install();
  SM.barGauges = barGauges;
})(window.__SM__ = window.__SM__ || {});


/* ===== src/core/zoom-fix.js ===== */
/**
 * core/zoom-fix.js — зум/resize как в oldscript (var_367).
 *
 * Без патча при browser zoom (Ctrl+/-) игра ставит cam.w/h по innerWidth, а
 * видимая область меньше — справа чанки не подгружаются. oldscript чинит это:
 *   scale = devicePixelRatio / backingStoreRatio  (или input_ratio из настроек)
 *   canvas backing = scale * cssW, style = cssW
 *   cam viewport (w/h и obf. поля) = cssW/cssH
 */
;(function (SM) {
  'use strict';

  let installed = false;
  let origResize = null;
  let camKey = null;
  let vwKey = null;
  let vhKey = null;
  let customScale = -1; // -1 = auto (как var_1895 === -1 в oldscript)

  function canvasEl() {
    return document.getElementById('game_canvas');
  }

  function bodyEl() {
    return document.getElementById('game_body');
  }

  function getUser() {
    try {
      const u = window.__SV_USER__;
      return u && typeof u === 'object' ? u : null;
    } catch (_) {
      return null;
    }
  }

  function backingRatio(ctx) {
    return (
      ctx.webkitBackingStorePixelRatio ||
      ctx.mozBackingStorePixelRatio ||
      ctx.msBackingStorePixelRatio ||
      ctx.oBackingStorePixelRatio ||
      ctx.backingStorePixelRatio ||
      1
    );
  }

  function loadCustomScale() {
    try {
      const s = localStorage.getItem('starve_scale');
      if (s != null && s !== '') {
        const n = Number(s);
        if (Number.isFinite(n) && n > 0) {
          customScale = n;
          return;
        }
      }
    } catch (_) {}
    customScale = -1;
  }

  function ratioFromInput(ctx) {
    const el = document.getElementById('input_ratio');
    if (!el || el.value === '' || el.value == null) return null;
    const v = Number(el.value);
    if (!Number.isFinite(v) || v <= 0) return null;
    const dpr = window.devicePixelRatio || 1;
    return v * (dpr / backingRatio(ctx));
  }

  function findCam(user) {
    if (!user) return null;
    if (camKey) {
      const c = user[camKey];
      if (c && typeof c.x === 'number' && typeof c.y === 'number') return c;
      camKey = null;
    }
    const keys = Object.getOwnPropertyNames(user);
    for (let i = 0; i < keys.length; i++) {
      let c;
      try { c = user[keys[i]]; } catch (_) { continue; }
      if (!c || typeof c !== 'object' || Array.isArray(c)) continue;
      if (typeof c.x !== 'number' || typeof c.y !== 'number') continue;
      camKey = keys[i];
      return c;
    }
    return null;
  }

  function resolveViewportKeys(cam, cssW, cssH) {
    if (!cam) return;
    const keys = Object.getOwnPropertyNames(cam);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (k === 'x' || k === 'y' || k === 'w' || k === 'h') continue;
      let v;
      try { v = cam[k]; } catch (_) { continue; }
      if (typeof v !== 'number' || !Number.isFinite(v)) continue;
      if (v > 80 && v < 16000) {
        if (!vwKey && (Math.abs(v - cssW) < 8 || Math.abs(v - window.innerWidth) < 8 || (typeof cam.w === 'number' && Math.abs(v - cam.w) < 8))) {
          vwKey = k;
        }
        if (!vhKey && (Math.abs(v - cssH) < 8 || Math.abs(v - window.innerHeight) < 8 || (typeof cam.h === 'number' && Math.abs(v - cam.h) < 8))) {
          vhKey = k;
        }
      }
    }
  }

  function syncCam(cssW, cssH) {
    const user = getUser();
    const cam = findCam(user);
    if (!cam) return;

    resolveViewportKeys(cam, cssW, cssH);

    try {
      if (typeof cam.w === 'number') cam.w = cssW;
      if (typeof cam.h === 'number') cam.h = cssH;
      if (vwKey) cam[vwKey] = cssW;
      if (vhKey) cam[vhKey] = cssH;
    } catch (_) {}
  }

  function applyFix() {
    const canvas = canvasEl();
    if (!canvas) return false;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    loadCustomScale();

    const cssW = window.innerWidth;
    const cssH = window.innerHeight;

    const dpr = window.devicePixelRatio || 1;
    const ratio = backingRatio(ctx);
    let scale;
    const fromInput = ratioFromInput(ctx);
    if (fromInput != null) {
      scale = fromInput;
      customScale = fromInput;
    } else if (customScale >= 0) {
      scale = customScale * (dpr / ratio);
    } else {
      scale = dpr / ratio;
    }

    const backW = Math.round(scale * cssW);
    const backH = Math.round(scale * cssH);

    canvas.width = backW;
    canvas.height = backH;
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    ctx.setTransform(scale, 0, 0, scale, 0, 0);

    syncCam(cssW, cssH);
    if (SM.visuals && SM.visuals.invalidate) {
      try { SM.visuals.invalidate(); } catch (_) {}
    }
    return true;
  }

  function onResize() {
    if (typeof origResize === 'function') {
      try { origResize.call(bodyEl()); } catch (_) {}
    }
    applyFix();
  }

  function hookRatioInput() {
    const el = document.getElementById('input_ratio');
    if (!el || el.__smZoomHook) return;
    el.__smZoomHook = true;
    el.addEventListener('input', function () {
      try {
        localStorage.setItem('starve_scale', String(el.value));
      } catch (_) {}
      applyFix();
    }, false);
  }

  function wrapBodyResize() {
    const body = bodyEl();
    if (!body) return false;
    if (body.onresize === onResize) return true;
    origResize = body.onresize;
    body.onresize = onResize;
    return true;
  }

  function install() {
    if (!wrapBodyResize() && !canvasEl()) return false;

    if (!installed) {
      window.addEventListener('resize', onResize, false);
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', onResize, false);
      }
      installed = true;
      SM.log('zoom-fix: установлен (browser zoom + cam viewport)');
    }

    hookRatioInput();
    loadCustomScale();
    applyFix();
    return true;
  }

  function tryInstall() {
    if (install()) {
      // игра может позже перезаписать game_body.onresize — перехватываем снова
      setInterval(function () { wrapBodyResize(); }, 3000);
      return;
    }
    let n = 0;
    const t = setInterval(function () {
      n++;
      if (install() || n > 120) clearInterval(t);
    }, 500);
  }

  SM.zoomFix = {
    install: install,
    apply: applyFix,
    syncCam: syncCam,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInstall);
  } else {
    tryInstall();
  }
})(window.__SM__ = window.__SM__ || {});


/* ===== src/data/items.js ===== */
/**
 * data/items.js — выбор id по приоритету tier из inventory.
 */
;(function (SM) {
  'use strict';

  // id из items.txt (актуальная нумерация клиента starve.io).
  const WALL_TIERS = [
    { tier: 'wood', id: 264, label: 'Wood wall' },     // WALL
    { tier: 'stone', id: 265, label: 'Stone wall' },   // STONE_WALL
    { tier: 'gold', id: 266, label: 'Gold wall' },     // GOLD_WALL
    { tier: 'diamond', id: 267, label: 'Diamond wall' }, // DIAMOND_WALL
    { tier: 'amethyst', id: 213, label: 'Amethyst wall' }, // AMETHYST_WALL
    { tier: 'reidite', id: 327, label: 'Reidite wall' }, // REIDITE_WALL
  ];

  const SPIKE_TIERS = [
    { tier: 'wood', id: 262, label: 'Wood spike' },     // SPIKE
    { tier: 'stone', id: 270, label: 'Stone spike' },   // STONE_SPIKE
    { tier: 'gold', id: 271, label: 'Gold spike' },     // GOLD_SPIKE
    { tier: 'diamond', id: 272, label: 'Diamond spike' }, // DIAMOND_SPIKE
    { tier: 'amethyst', id: 214, label: 'Amethyst spike' }, // AMETHYST_SPIKE
    { tier: 'reidite', id: 329, label: 'Reidite spike' }, // REIDITE_SPIKE
  ];

  const WALL_PICK_ORDER = ['wood', 'stone', 'gold', 'diamond', 'amethyst', 'reidite'];
  const SPIKE_PICK_ORDER = ['reidite', 'amethyst', 'diamond', 'gold', 'stone', 'wood'];

  const WALL_ID_SET = new Set(WALL_TIERS.map(function (t) { return t.id; }));
  const SPIKE_ID_SET = new Set(SPIKE_TIERS.map(function (t) { return t.id; }));
  const WALL_BY_TIER = tierMap(WALL_TIERS);
  const SPIKE_BY_TIER = tierMap(SPIKE_TIERS);

  function tierMap(list) {
    const m = Object.create(null);
    list.forEach(function (t) { m[t.tier] = t; });
    return m;
  }

  function pickFromList(category, list) {
    if (!list || !list.length) return null;
    const order = category === 'wall' ? WALL_PICK_ORDER : SPIKE_PICK_ORDER;
    const byTier = category === 'wall' ? WALL_BY_TIER : SPIKE_BY_TIER;
    const byId = Object.create(null);
    for (let i = 0; i < list.length; i++) byId[list[i].id] = list[i];
    for (let i = 0; i < order.length; i++) {
      const entry = byTier[order[i]];
      if (entry && byId[entry.id]) return entry.id;
    }
    return list[0].id;
  }

  function pickByPriority(category) {
    const inv = SM.inventory;
    if (!inv) return null;

    if (inv.pickByFindItem) {
      const fromFind = inv.pickByFindItem(category);
      if (fromFind != null) return fromFind;
    }

    const avail = inv.available(category);
    const fromAvail = pickFromList(category, avail);
    if (fromAvail != null) return fromAvail;

    if (inv.lastPlacedId) {
      const last = inv.lastPlacedId(category);
      if (last != null) return last;
    }

    return null;
  }

  const items = {
    WALL_TIERS: WALL_TIERS,
    SPIKE_TIERS: SPIKE_TIERS,
    WALL_PICK_ORDER: WALL_PICK_ORDER,
    SPIKE_PICK_ORDER: SPIKE_PICK_ORDER,
    WALL_BY_TIER: WALL_BY_TIER,
    SPIKE_BY_TIER: SPIKE_BY_TIER,
    WALL_ID_SET: WALL_ID_SET,
    SPIKE_ID_SET: SPIKE_ID_SET,

    isWallId: function (id) { return WALL_ID_SET.has(id); },
    isSpikeId: function (id) { return SPIKE_ID_SET.has(id); },

    pickPlaceId: function (category) {
      return pickByPriority(category);
    },
  };

  SM.items = items;
})(window.__SM__ = window.__SM__ || {});


/* ===== src/data/texture-packs.js ===== */
/**
 * data/texture-packs.js — реестр паков текстур для Color Spike и стандарт имён.
 *
 * СТАНДАРТ ИМЁН ФАЙЛОВ В РЕПОЗИТОРИИ ПАКА
 * ---------------------------------------
 * Каждый файл называется по схеме:
 *
 *     <tier>-<category>-<variant>.png
 *
 *   tier     ∈ wood | stone | gold | diamond | amethyst | reidite
 *   category ∈ spike | spike_door | door            (spike_door = спайк-дверь)
 *   variant  ∈ ally | enemy
 *
 * Примеры: gold-spike-enemy.png, reidite-door-ally.png, diamond-spike_door-ally.png
 *
 * Полный пак = 6 tier × 3 category × 2 variant = 36 файлов.
 * Если какого-то файла нет — для этой постройки остаётся ванильная текстура.
 *
 * НОЧНОЙ ВАРИАНТ (необязательно)
 *   По умолчанию одна и та же картинка используется и днём, и ночью.
 *   Чтобы задать отдельную ночную текстуру, добавьте файл с суффиксом `-night`:
 *       <tier>-<category>-<variant>-night.png
 *
 * Базовый URL пака — это raw-каталог репозитория (ветка main), куда дописывается имя файла.
 */
;(function (SM) {
  'use strict';

  const TIERS = ['wood', 'stone', 'gold', 'diamond', 'amethyst', 'reidite'];
  const CATEGORIES = ['spike', 'spike_door', 'door'];
  const VARIANTS = ['ally', 'enemy'];

  // Список паков (порядок = тип1, тип2, …). base — raw-каталог репозитория.
  // ВАЖНО: показываем только паки, где файлы уже названы по стандарту
  // <tier>-<category>-<variant>.png. Сейчас это только `new-texture-str` (Тип 1).
  // Репозитории type2–type5 существуют, но файлы в них НЕ переименованы под
  // стандарт → отдают 404. Чтобы вернуть их в список: переименуй файлы в репе
  // по схеме (см. шапку файла) ЛИБО задай pack.files = { 'tier|category|variant': 'имя.png' }
  // с фактическими именами, и раскомментируй строку ниже.
  const PACKS = [
    { id: 'type1', label: 'Тип 1', base: 'https://raw.githubusercontent.com/Russlgg/new-texture-str/main/' },
    // { id: 'type2', label: 'Тип 2', base: 'https://raw.githubusercontent.com/Russlgg/texture-ggg-starve-bbb/main/' },
    // { id: 'type3', label: 'Тип 3', base: 'https://raw.githubusercontent.com/Russlgg/privet-nubi/main/' },
    // { id: 'type4', label: 'Тип 4', base: 'https://raw.githubusercontent.com/Russlgg/sosososososo/main/' },
    // { id: 'type5', label: 'Тип 5', base: 'https://raw.githubusercontent.com/Russlgg/asdldla-asd-lasd-lsad-ldas-das-sda/main/' },
  ];

  // Ключ текстуры внутри пака: tier|category|variant.
  function keyOf(tier, category, variant) {
    return tier + '|' + category + '|' + variant;
  }

  // Имя файла по стандарту.
  function fileName(tier, category, variant, night) {
    return tier + '-' + category + '-' + variant + (night ? '-night' : '') + '.png';
  }

  // Все 36 дескрипторов текстур (tier × category × variant).
  function entries() {
    const out = [];
    for (let i = 0; i < TIERS.length; i++) {
      for (let c = 0; c < CATEGORIES.length; c++) {
        for (let v = 0; v < VARIANTS.length; v++) {
          const tier = TIERS[i], category = CATEGORIES[c], variant = VARIANTS[v];
          out.push({
            key: keyOf(tier, category, variant),
            tier: tier,
            category: category,
            variant: variant,
            day: fileName(tier, category, variant, false),
            night: fileName(tier, category, variant, true),
          });
        }
      }
    }
    return out;
  }

  function getPack(id) {
    for (let i = 0; i < PACKS.length; i++) if (PACKS[i].id === id) return PACKS[i];
    return null;
  }

  // Абсолютный URL текстуры пака: base + filename. Если у пака есть manifest с
  // переопределениями (manifest.files[key] = "имя файла"), берём его.
  function urlFor(pack, entry, night) {
    if (!pack) return null;
    const override = pack.files && pack.files[entry.key];
    const name = override || (night ? entry.night : entry.day);
    return pack.base + encodeURIComponent(name);
  }

  SM.texturePacks = {
    TIERS: TIERS,
    CATEGORIES: CATEGORIES,
    VARIANTS: VARIANTS,
    PACKS: PACKS,
    keyOf: keyOf,
    fileName: fileName,
    entries: entries,
    getPack: getPack,
    urlFor: urlFor,
  };
})(window.__SM__ = window.__SM__ || {});


/* ===== src/world/inventory.js ===== */
/**
 * world/inventory.js — чтение инвентаря клиента через пропатченный global
 * `window.__SV_USER__` (см. build-loader).
 *
 * Реальная структура клиента (обфусцированные имена слетают при обновлении бандла,
 * поэтому инвентарь ищем ПО СИГНАТУРЕ, а не по именам):
 *   user[<inv>] = {
 *     <counts>: Array  // индекс = id предмета, значение = количество (растёт по max id)
 *     <slots>:  Array  // ~10 слотов хотбара
 *     max:      number // вместимость
 *     ...
 *   }
 * Количество тира: counts[itemId].
 */
;(function (SM) {
  'use strict';

  // Сигнатура массива счётчиков: длинный числовой массив (индекс = id).
  const COUNT_MIN_LEN = 50;
  const COUNT_MAX_LEN = 4000;
  // Слоты хотбара — короткий массив.
  const SLOT_MIN_LEN = 4;
  const SLOT_MAX_LEN = 24;

  const shadow = Object.create(null);
  const equipHintAt = Object.create(null);
  const lastPlaceAt = Object.create(null);
  const lastCategoryId = { wall: null, spike: null, at: { wall: 0, spike: 0 } };

  // invObj -> { counts: Array, slots: Array|null, max: number|null, invKey: string }
  const invMeta = new WeakMap();
  let cachedInv = null;
  let bound = false;

  const discoveryMeta = {
    method: 'none',
    userKey: null,
    at: 0,
    hasFindItem: false,
    nKeyCount: 0,
    nSample: [],
    slotArrays: [],
    score: 0,
  };

  function notifyDiscover() {
    if (SM.inventoryDebug && SM.inventoryDebug.onDiscover) {
      SM.inventoryDebug.onDiscover(discoveryMeta);
    }
  }

  function setDiscovery(inv, method, userKey, score) {
    discoveryMeta.method = method;
    discoveryMeta.userKey = userKey || null;
    discoveryMeta.at = Date.now();
    discoveryMeta.score = score || 0;
    discoveryMeta.hasFindItem = false;
    discoveryMeta.slotArrays = [];

    if (!inv) {
      discoveryMeta.nKeyCount = 0;
      discoveryMeta.nSample = [];
      notifyDiscover();
      return;
    }

    const sample = [];
    let nCount = 0;
    iterCounts(inv, function (id, c) {
      nCount++;
      if (sample.length < 20) sample.push({ key: String(id), count: c });
    });
    discoveryMeta.nKeyCount = nCount;
    discoveryMeta.nSample = sample;
    notifyDiscover();
  }

  function isTracked(id) {
    return SM.items && (SM.items.isWallId(id) || SM.items.isSpikeId(id));
  }

  // ---------------------------------------------------------------------------
  // Обнаружение инвентаря по сигнатуре
  // ---------------------------------------------------------------------------

  /** Длинный числовой массив (count[id]): почти все заданные элементы — неотрицательные целые. */
  function isCountArray(arr) {
    if (!Array.isArray(arr)) return false;
    if (arr.length < COUNT_MIN_LEN || arr.length > COUNT_MAX_LEN) return false;
    let defined = 0;
    let numeric = 0;
    for (let i = 0; i < arr.length && defined < 80; i++) {
      const v = arr[i];
      if (v === undefined || v === null) continue;
      defined++;
      if (typeof v === 'number' && Number.isFinite(v) && v >= 0 && v < 1e7 && Math.floor(v) === v) {
        numeric++;
      }
    }
    return defined >= 3 && numeric === defined;
  }

  /** Анализ кандидата-объекта: ищем counts + (slots | max). */
  function analyzeInv(obj) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;
    let keys;
    try {
      keys = Object.getOwnPropertyNames(obj);
    } catch (_) {
      return null;
    }

    let counts = null;
    let slots = null;
    let max = null;

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      let v;
      try {
        v = obj[k];
      } catch (_) {
        continue;
      }
      if (Array.isArray(v)) {
        if (!counts && isCountArray(v)) counts = v;
        else if (!slots && v.length >= SLOT_MIN_LEN && v.length <= SLOT_MAX_LEN) slots = v;
      } else if (k === 'max' && typeof v === 'number' && v > 0 && v < 1000) {
        max = v;
      }
    }

    if (counts && (slots || max != null)) {
      return { counts: counts, slots: slots, max: max };
    }
    return null;
  }

  /** Сколько отслеживаемых (wall/spike) id с count>0 в массиве — для дизамбигуации кандидатов. */
  function trackedHits(counts) {
    if (!SM.items) return 0;
    let hits = 0;
    const tiers = SM.items.WALL_TIERS.concat(SM.items.SPIKE_TIERS);
    for (let i = 0; i < tiers.length; i++) {
      const v = counts[tiers[i].id];
      if (typeof v === 'number' && v > 0) hits++;
    }
    return hits;
  }

  function scoreCandidate(meta) {
    let score = 1;
    if (meta.max != null) score += 2;
    if (meta.slots) score += 1;
    score += trackedHits(meta.counts) * 4;
    return score;
  }

  /** Нативный инвентарь на user.inv (find_item / can_select), как в oldscript. */
  function userInvObject() {
    const user = resolveUser();
    if (user && user.inv && typeof user.inv === 'object' && !Array.isArray(user.inv)) {
      return user.inv;
    }
    return null;
  }

  function findItemPresent(inv, itemId) {
    if (!inv || typeof inv.find_item !== 'function') return false;
    try {
      const r = inv.find_item(itemId);
      return r !== -1 && r != null && r !== false;
    } catch (_) {
      return false;
    }
  }

  function countViaCanSelect(inv, itemId) {
    if (!inv || !Array.isArray(inv.can_select)) return 0;
    for (let i = 0; i < inv.can_select.length; i++) {
      const e = inv.can_select[i];
      if (e && e.id === itemId) return 1;
    }
    return 0;
  }

  /** Источник user-объекта: приоритет — пропатченный global из бандла. */
  function resolveUser() {
    try {
      if (window.__SV_USER__ && typeof window.__SV_USER__ === 'object') return window.__SV_USER__;
    } catch (_) {}
    try {
      if (window.__STARVE_USER__ && typeof window.__STARVE_USER__ === 'object') return window.__STARVE_USER__;
    } catch (_) {}
    try {
      if (typeof user !== 'undefined' && user && typeof user === 'object') return user;
    } catch (_) {}
    try {
      if (window.user && typeof window.user === 'object') return window.user;
    } catch (_) {}
    return null;
  }

  /** Находит лучший объект-инвентарь среди собственных свойств user (глубина 1). */
  function findInvObject(user) {
    if (!user || typeof user !== 'object') return null;

    let keys;
    try {
      keys = Object.getOwnPropertyNames(user);
    } catch (_) {
      return null;
    }

    let best = null;
    let bestMeta = null;
    let bestKey = null;
    let bestScore = 0;

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      let obj;
      try {
        obj = user[k];
      } catch (_) {
        continue;
      }
      const meta = analyzeInv(obj);
      if (!meta) continue;
      const s = scoreCandidate(meta);
      if (s > bestScore) {
        bestScore = s;
        best = obj;
        bestMeta = meta;
        bestKey = k;
      }
    }

    // Иногда сам user может оказаться инвентарём.
    if (!best) {
      const selfMeta = analyzeInv(user);
      if (selfMeta) {
        best = user;
        bestMeta = selfMeta;
        bestKey = '(self)';
      }
    }

    if (best && bestMeta) {
      bestMeta.invKey = bestKey;
      invMeta.set(best, bestMeta);
      return best;
    }
    return null;
  }

  /** Метаданные инвентаря (из кэша или повторный анализ). */
  function metaFor(inv) {
    if (!inv || typeof inv !== 'object') return null;
    const cached = invMeta.get(inv);
    if (cached && Array.isArray(cached.counts)) return cached;
    const meta = analyzeInv(inv);
    if (meta) invMeta.set(inv, meta);
    return meta;
  }

  function isValidGameInv(inv) {
    return !!metaFor(inv);
  }

  // ---------------------------------------------------------------------------
  // Чтение количеств
  // ---------------------------------------------------------------------------

  function clientCount(inv, itemId) {
    const meta = metaFor(inv);
    if (!meta) return 0;
    const v = meta.counts[itemId];
    return typeof v === 'number' && v > 0 ? v : 0;
  }

  /** Совместимость с inventory-debug: то же, что clientCount. */
  function countFromN(inv, itemId) {
    return clientCount(inv, itemId);
  }

  function iterCounts(inv, fn) {
    const meta = metaFor(inv);
    if (!meta) return;
    const arr = meta.counts;
    for (let id = 0; id < arr.length; id++) {
      const c = arr[id];
      if (typeof c === 'number' && c > 0) fn(id, c);
    }
  }

  function buildClientMap(inv) {
    const map = Object.create(null);
    iterCounts(inv, function (id, c) {
      map[id] = c;
    });
    return map;
  }

  /** Совместимость с inventory-debug: вместо find_item — чтение counts[id]. */
  function findItemRaw(inv, itemId) {
    const c = clientCount(inv, itemId);
    return { ok: c > 0, raw: c };
  }

  // ---------------------------------------------------------------------------
  // Кэш / refresh
  // ---------------------------------------------------------------------------

  function invalidateBadCache() {
    if (cachedInv && !isValidGameInv(cachedInv)) {
      cachedInv = null;
      window.__STARVE_INV__ = null;
      window.__STARVE_USER__ = null;
    }
  }

  function getClientInv() {
    invalidateBadCache();
    if (cachedInv && isValidGameInv(cachedInv)) return cachedInv;

    const nativeInv = userInvObject();
    if (nativeInv && isValidGameInv(nativeInv)) {
      cachedInv = nativeInv;
      window.__STARVE_USER__ = resolveUser();
      window.__STARVE_INV__ = nativeInv;
      const meta = invMeta.get(nativeInv);
      setDiscovery(nativeInv, 'user.inv', meta ? meta.invKey : 'inv', 100);
      return nativeInv;
    }

    const user = resolveUser();
    const inv = findInvObject(user);
    if (inv) {
      cachedInv = inv;
      window.__STARVE_USER__ = user;
      window.__STARVE_INV__ = inv;
      const meta = invMeta.get(inv);
      const method = (window.__SV_USER__ && user === window.__SV_USER__) ? '__SV_USER__' : 'global';
      setDiscovery(inv, method, meta ? meta.invKey : null, 100);
      return inv;
    }

    cachedInv = null;
    setDiscovery(null, 'miss', null, 0);
    return null;
  }

  function refreshClient() {
    return getClientInv();
  }

  function scanForInv() {
    const user = resolveUser();
    const inv = findInvObject(user);
    if (!inv) return null;
    const meta = invMeta.get(inv);
    return { inv: inv, user: user, key: meta ? meta.invKey : '?', score: 100 };
  }

  // ---------------------------------------------------------------------------
  // Packet shadow (резерв на случай, если global недоступен)
  // ---------------------------------------------------------------------------

  function shadowCount(itemId) {
    return shadow[itemId] || 0;
  }

  function packetCount(itemId) {
    let sh = shadowCount(itemId);
    if (SM.inventoryPackets) {
      const pk = SM.inventoryPackets.count(itemId);
      if (pk > sh) sh = pk;
    }
    if (sh <= 0) return 0;
    const hintAt = equipHintAt[itemId];
    if (hintAt && performance.now() - hintAt > 120000) return 0;
    return sh;
  }

  function onOut(frame) {
    try {
      if (frame.text == null) return;
      const v = JSON.parse(frame.text);
      if (!Array.isArray(v) || v.length < 2) return;

      const op = v[0];
      const id = v[1];
      if (typeof id !== 'number' || !isTracked(id)) return;

      if (op === 6) {
        shadow[id] = Math.max(shadowCount(id), 1);
        equipHintAt[id] = performance.now();
        lastPlaceAt[id] = performance.now();
      } else if (op === 25) {
        shadow[id] = Math.max(0, Math.max(shadowCount(id), 1) - 1);
        delete equipHintAt[id];
        lastPlaceAt[id] = performance.now();
        if (SM.items) {
          if (SM.items.isWallId(id)) {
            lastCategoryId.wall = id;
            lastCategoryId.at.wall = performance.now();
          } else if (SM.items.isSpikeId(id)) {
            lastCategoryId.spike = id;
            lastCategoryId.at.spike = performance.now();
          }
        }
      }
    } catch (_) {}
  }

  // ---------------------------------------------------------------------------
  // Доступность по категориям / выбор тира
  // ---------------------------------------------------------------------------

  function idsForCategory(category) {
    if (!SM.items) return [];
    const list = category === 'wall' ? SM.items.WALL_TIERS : SM.items.SPIKE_TIERS;
    return list.map(function (t) { return t.id; });
  }

  function idSetForCategory(category) {
    if (!SM.items) return new Set();
    return category === 'wall' ? SM.items.WALL_ID_SET : SM.items.SPIKE_ID_SET;
  }

  function getLastPlacedId(category) {
    const id = lastCategoryId[category];
    const at = lastCategoryId.at[category];
    if (id == null || !at || performance.now() - at > 600000) return null;
    return id;
  }

  function mergeAvailable(category, inv) {
    const idSet = idSetForCategory(category);
    const tierIds = idsForCategory(category);
    const out = Object.create(null);

    if (isValidGameInv(inv)) {
      for (let i = 0; i < tierIds.length; i++) {
        const id = tierIds[i];
        const c = clientCount(inv, id);
        if (c > 0) out[id] = c;
      }
    }

    for (let j = 0; j < tierIds.length; j++) {
      const tid = tierIds[j];
      if (out[tid] > 0) continue;
      const pc = packetCount(tid);
      if (pc > 0) out[tid] = pc;
    }

    const lastId = getLastPlacedId(category);
    if (lastId != null && !out[lastId]) {
      out[lastId] = Math.max(packetCount(lastId), 1);
    }

    return tierIds
      .filter(function (id) { return idSet.has(id) && out[id] > 0; })
      .map(function (id) { return { id: id, count: out[id] }; });
  }

  // ---------------------------------------------------------------------------
  // Публичный API
  // ---------------------------------------------------------------------------

  const inventory = {
    refresh: refreshClient,
    isValidGameInv: isValidGameInv,
    countFromN: countFromN,
    findItemRaw: findItemRaw,
    clientCount: clientCount,
    scanForInv: scanForInv,

    getDiscoveryMeta: function () {
      return Object.assign({}, discoveryMeta);
    },

    getPacketShadow: function () {
      return Object.assign({}, shadow);
    },

    hasClient: function () {
      return isValidGameInv(refreshClient());
    },

    source: function () {
      const inv = refreshClient();
      if (isValidGameInv(inv)) {
        const w = mergeAvailable('wall', inv);
        const s = mergeAvailable('spike', inv);
        if (w.length || s.length) return 'client';
        return 'client-empty';
      }
      const all = idsForCategory('wall').concat(idsForCategory('spike'));
      for (let i = 0; i < all.length; i++) {
        if (packetCount(all[i]) > 0) return 'packets';
      }
      if (lastCategoryId.wall || lastCategoryId.spike) return 'last-placed';
      return 'none';
    },

    count: function (itemId) {
      const nativeInv = userInvObject();
      if (nativeInv) {
        if (findItemPresent(nativeInv, itemId)) return 1;
        const cs = countViaCanSelect(nativeInv, itemId);
        if (cs > 0) return cs;
        if (isValidGameInv(nativeInv)) {
          const c = clientCount(nativeInv, itemId);
          if (c > 0) return c;
        }
      }

      const inv = refreshClient();
      if (isValidGameInv(inv)) {
        const c = clientCount(inv, itemId);
        if (c > 0) return c;
      }
      const pc = packetCount(itemId);
      if (pc > 0) return pc;
      return 0;
    },

    has: function (itemId) {
      return inventory.count(itemId) > 0;
    },

    available: function (category) {
      return mergeAvailable(category, refreshClient());
    },

    /** Выбор тира по приоритету напрямую из counts (имя метода сохранено для совместимости). */
    pickByFindItem: function (category) {
      const inv = refreshClient();
      if (!isValidGameInv(inv) || !SM.items) return null;

      const order = category === 'wall' ? SM.items.WALL_PICK_ORDER : SM.items.SPIKE_PICK_ORDER;
      const byTier = category === 'wall' ? SM.items.WALL_BY_TIER : SM.items.SPIKE_BY_TIER;

      for (let i = 0; i < order.length; i++) {
        const entry = byTier[order[i]];
        if (!entry) continue;
        if (clientCount(inv, entry.id) > 0) return entry.id;
      }
      return null;
    },

    clientMap: function () {
      return buildClientMap(refreshClient());
    },

    lastPlacedId: function (category) {
      return getLastPlacedId(category);
    },

    getLastPlaced: function () {
      return {
        wall: lastCategoryId.wall,
        spike: lastCategoryId.spike,
        at: Object.assign({}, lastCategoryId.at),
      };
    },

    /** Текущий объект инвентаря (сигнатурный резолв через __SV_USER__). */
    getInv: function () {
      return getClientInv();
    },

    /** Сброс кэша + повторный резолв (для отладки). */
    forceScan: function () {
      cachedInv = null;
      window.__STARVE_INV__ = null;
      window.__STARVE_USER__ = null;
      return getClientInv();
    },

    init: function () {
      if (bound) return;
      bound = true;
      SM.bus.on('net:out', onOut);

      getClientInv();
      setInterval(function () {
        try {
          getClientInv();
        } catch (_) {}
      }, 1000);
    },
  };

  SM.inventory = inventory;
})(window.__SM__ = window.__SM__ || {});


/* ===== src/world/inventory-debug.js ===== */
/**
 * world/inventory-debug.js — диагностика инвентаря в консоли.
 *
 * Команды:
 *   __STARVE_MOD__.inventory.debug.dump()
 *   __STARVE_MOD__.inventory.debug.watch()      // каждые 15с
 *   __STARVE_MOD__.inventory.debug.watch(false)
 */
;(function (SM) {
  'use strict';

  const TAG = '[starve-mod inv]';
  let watchTimer = null;
  let lastDiscoverKey = '';

  function enabled() {
    return SM.settings.invDebug !== false;
  }

  function probeFindItem(inv, itemId) {
    if (!inv || typeof inv.find_item !== 'function') {
      return { ok: false, raw: null, err: 'no find_item' };
    }
    try {
      const raw = inv.find_item(itemId);
      return { ok: raw !== -1 && raw != null && raw !== false, raw: raw };
    } catch (err) {
      return { ok: false, raw: null, err: String(err) };
    }
  }

  function tierRows(category) {
    if (!SM.items || !SM.inventory) return [];
    const tiers = category === 'wall' ? SM.items.WALL_TIERS : SM.items.SPIKE_TIERS;
    const inv = SM.inventory.refresh();
    const validInv = SM.inventory.isValidGameInv && SM.inventory.isValidGameInv(inv);
    const rows = [];

    for (let i = 0; i < tiers.length; i++) {
      const t = tiers[i];
      const find = validInv && SM.inventory.findItemRaw
        ? SM.inventory.findItemRaw(inv, t.id)
        : { ok: false, raw: null, err: 'no inv' };
      const client = validInv && SM.inventory.clientCount ? SM.inventory.clientCount(inv, t.id) : 0;
      rows.push({
        tier: t.tier,
        id: t.id,
        label: t.label,
        inv_n: inv ? SM.inventory.countFromN(inv, t.id) : 0,
        find_item: find.ok ? 'yes' : 'no',
        find_raw: find.raw,
        find_err: find.err || '',
        client: client,
        packet: SM.inventory.getPacketShadow ? SM.inventory.getPacketShadow()[t.id] || 0 : 0,
        total: SM.inventory.count(t.id),
      });
    }
    return rows;
  }

  function scanCandidates() {
    const out = [];
    const skip = { __STARVE_USER__: 1, __STARVE_INV__: 1, __STARVE_GAME_WS__: 1, __STARVE_WS_EARLY__: 1, __STARVE_USER_POLL__: 1 };
    let keys;
    try {
      keys = Reflect.ownKeys(window);
    } catch (_) {
      keys = Object.getOwnPropertyNames(window);
    }

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (typeof k !== 'string' || skip[k] || k.indexOf('__STARVE') === 0) continue;
      try {
        const v = window[k];
        if (!v || typeof v !== 'object') continue;
        if (SM.inventory.isValidGameInv && SM.inventory.isValidGameInv(v)) {
          out.push({ windowKey: k, type: 'direct-inv', score: SM.inventory.scanForInv ? 'see scan' : '?' });
        }
        if (v.inv && SM.inventory.isValidGameInv && SM.inventory.isValidGameInv(v.inv)) {
          out.push({ windowKey: k + '.inv', type: 'player.inv', score: 'valid' });
        }
      } catch (_) {}
    }

    try {
      if (typeof user !== 'undefined' && user) {
        out.push({
          windowKey: 'user (global)',
          type: 'global-user',
          hasFind: !!(user.inv && user.inv.find_item),
        });
      }
    } catch (_) {}

    const scan = SM.inventory.scanForInv ? SM.inventory.scanForInv() : null;
    if (scan) out.unshift({ windowKey: scan.key, type: 'best-scan', score: scan.score });

    return out;
  }

  function buildReport(reason) {
    const inv = SM.inventory ? SM.inventory.refresh() : null;
    const meta = SM.inventory && SM.inventory.getDiscoveryMeta ? SM.inventory.getDiscoveryMeta() : {};
    const ws = window.__STARVE_GAME_WS__;
    const clientMap = SM.inventory ? SM.inventory.clientMap() : {};
    const wallsInMap = {};
    const spikesInMap = {};

    if (SM.items) {
      SM.items.WALL_ID_SET.forEach(function (id) {
        if (clientMap[id] > 0) wallsInMap[id] = clientMap[id];
      });
      SM.items.SPIKE_ID_SET.forEach(function (id) {
        if (clientMap[id] > 0) spikesInMap[id] = clientMap[id];
      });
    }

    return {
      reason: reason || '',
      version: SM.MOD.version,
      at: new Date().toISOString(),
      wsReady: ws ? ws.readyState === 1 : false,
      wsUrl: ws && ws.url ? ws.url : null,
      source: SM.inventory ? SM.inventory.source() : 'no-module',
      discovery: meta,
      candidates: scanCandidates(),
      globalUser: (function () {
        try { return typeof user !== 'undefined' && !!user; } catch (_) { return false; }
      })(),
      cachedStarveUser: !!window.__STARVE_USER__,
      cachedStarveInv: !!window.__STARVE_INV__,
      walls: tierRows('wall'),
      spikes: tierRows('spike'),
      clientMapWalls: wallsInMap,
      clientMapSpikes: spikesInMap,
      clientMapSize: Object.keys(clientMap).length,
      packetShadow: SM.inventory && SM.inventory.getPacketShadow ? SM.inventory.getPacketShadow() : {},
      packetInv: SM.inventoryPackets && typeof SM.inventoryPackets.getAll === 'function' ? SM.inventoryPackets.getAll() : {},
      pickWall: SM.items ? SM.items.pickPlaceId('wall') : null,
      pickSpike: SM.items ? SM.items.pickPlaceId('spike') : null,
      pickFindWall: SM.inventory && SM.inventory.pickByFindItem ? SM.inventory.pickByFindItem('wall') : null,
      pickFindSpike: SM.inventory && SM.inventory.pickByFindItem ? SM.inventory.pickByFindItem('spike') : null,
      lastPlaced: SM.inventory && SM.inventory.getLastPlaced ? SM.inventory.getLastPlaced() : null,
      lastAngle: SM.protocol ? SM.protocol.lastAngle : null,
    };
  }

  function dump(reason, force) {
    const report = buildReport(reason);
    const title = TAG + ' REPORT' + (reason ? ' — ' + reason : '');

    if (force || enabled()) {
      console.groupCollapsed(title);
      console.log('Скопируй и пришли в чат → __STARVE_MOD__.inventory.debug.copy()');
      if (report.walls.length) console.table(report.walls);
      if (report.spikes.length) console.table(report.spikes);
      console.log('discovery', report.discovery);
      console.log('candidates on window', report.candidates);
      console.log('source', report.source, '| pick wall/spike', report.pickWall, report.pickSpike);
      console.log('pickByFindItem wall/spike', report.pickFindWall, report.pickFindSpike);
      console.log('clientMap walls/spikes', report.clientMapWalls, report.clientMapSpikes);
      console.log('packetShadow', report.packetShadow);
      console.log('ws', report.wsReady, report.wsUrl);
      console.log('FULL', report);
      console.groupEnd();
    } else {
      console.warn(title, '→ включи Inv debug в Net или: __STARVE_MOD__.inventory.debug.dump("", true)');
    }

    return report;
  }

  function copy(reason) {
    const report = buildReport(reason);
    const text = JSON.stringify(report, null, 2);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { console.log(TAG, 'отчёт скопирован (' + text.length + ' chars)'); },
        function () { console.log(TAG, 'clipboard blocked — JSON ниже:\n', text); }
      );
    } else {
      console.log(TAG, 'JSON:\n', text);
    }
    return report;
  }

  function watch(on) {
    if (watchTimer) {
      clearInterval(watchTimer);
      watchTimer = null;
    }
    if (on === false) {
      console.log(TAG, 'watch OFF');
      return;
    }
    watchTimer = setInterval(function () {
      const ws = window.__STARVE_GAME_WS__;
      if (!ws || ws.readyState !== 1) return;
      dump('watch 15s', false);
    }, 15000);
    console.log(TAG, 'watch ON — dump каждые 15с (Inv debug)');
    dump('watch start', false);
  }

  function onPlaceFail(name, category) {
    console.warn(TAG, name + ': id=null для "' + category + '" — см. таблицу ниже');
    dump(name + ' / no id', true);
  }

  function onCombatActive(name) {
    if (!enabled()) return;
    dump(name + ' ON', false);
  }

  function onDiscover(meta) {
    if (!meta) return;
    const key = meta.method + '|' + meta.userKey + '|' + meta.nKeyCount + '|' + meta.score;
    if (key === lastDiscoverKey) return;
    lastDiscoverKey = key;
    const found = meta.method === 'global' || meta.method === 'cache' || meta.method === 'deep-scan';
    if (!found) return;
    if (!enabled()) return;
    console.log(TAG, 'inv OK:', meta.method, meta.userKey || '', 'score=' + meta.score, 'nKeys=' + meta.nKeyCount);
  }

  function scan() {
    const found = SM.inventory && SM.inventory.forceScan ? SM.inventory.forceScan() : null;
    if (found) {
      console.log(TAG, 'forceScan → найден инвентарь, find_item=' + (typeof found.find_item === 'function'));
      dump('after forceScan', true);
    } else {
      console.warn(TAG, 'forceScan → инвентарь НЕ найден в графе window (бандл прячет user).');
    }
    return found;
  }

  function isDomLike(o) {
    try {
      if (typeof Node !== 'undefined' && o instanceof Node) return true;
      if (typeof Window !== 'undefined' && o instanceof Window) return true;
      if (o && o.self === o && o.window === o) return true;
    } catch (_) { return true; }
    return false;
  }

  function tracked(id) {
    return SM.items && (SM.items.isWallId(id) || SM.items.isSpikeId(id));
  }

  /** Анализ "карты счётчиков": сколько числовых ключей, есть ли наши id. */
  function analyzeMap(obj) {
    let numeric = 0;
    let trackedHits = [];
    let sample = [];
    let keys;
    try { keys = Object.keys(obj); } catch (_) { return null; }
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (!/^\d+$/.test(k)) continue;
      const v = obj[k];
      if (typeof v !== 'number') continue;
      numeric++;
      if (sample.length < 12) sample.push(k + ':' + v);
      if (v > 0 && tracked(parseInt(k, 10))) trackedHits.push(k + ':' + v);
    }
    return { numeric: numeric, trackedHits: trackedHits, sample: sample };
  }

  /**
   * Разовый глубокий зонд: ищет ВЕЗДЕ в графе window объекты, похожие на инвентарь —
   * объект с .n (карта счётчиков), либо сам объект-карта, либо с find_item.
   * Печатает пути и образцы, чтобы понять структуру/достижимость.
   */
  function probe(opts) {
    opts = opts || {};
    const MAX_NODES = opts.maxNodes || 120000;
    const MAX_DEPTH = opts.maxDepth || 9;
    const seen = new WeakSet();
    const queue = [];
    let nodes = 0;
    const hits = [];

    function enq(obj, path) {
      if (!obj || typeof obj !== 'object') return;
      if (seen.has(obj)) return;
      if (isDomLike(obj)) return;
      seen.add(obj);
      queue.push({ obj: obj, path: path });
    }

    let rootKeys;
    try { rootKeys = Object.getOwnPropertyNames(window); } catch (_) { rootKeys = []; }
    for (let i = 0; i < rootKeys.length; i++) {
      const k = rootKeys[i];
      if (k.indexOf('__STARVE') === 0) continue;
      try {
        const v = window[k];
        if (v && typeof v === 'object') enq(v, k);
      } catch (_) {}
    }

    while (queue.length && nodes < MAX_NODES) {
      const node = queue.shift();
      nodes++;
      const obj = node.obj;
      const depth = node.path.split('.').length + node.path.split('[').length - 1;

      try {
        if (typeof obj.find_item === 'function') {
          hits.push({ path: node.path, kind: 'find_item', info: 'has find_item()' });
        }
      } catch (_) {}

      // obj.n как карта счётчиков
      try {
        if (obj.n && typeof obj.n === 'object') {
          const a = analyzeMap(obj.n);
          if (a && (a.trackedHits.length || a.numeric >= 5)) {
            hits.push({
              path: node.path + '.n',
              kind: 'count-map(.n)',
              numeric: a.numeric,
              tracked: a.trackedHits.join(',') || '—',
              sample: a.sample.join(' '),
            });
          }
        }
      } catch (_) {}

      // сам объект как карта счётчиков
      try {
        const a2 = analyzeMap(obj);
        if (a2 && (a2.trackedHits.length || a2.numeric >= 10)) {
          hits.push({
            path: node.path,
            kind: 'count-map(self)',
            numeric: a2.numeric,
            tracked: a2.trackedHits.join(',') || '—',
            sample: a2.sample.join(' '),
          });
        }
      } catch (_) {}

      if (depth >= MAX_DEPTH) continue;
      let ck;
      try { ck = Object.keys(obj); } catch (_) { continue; }
      if (ck.length > 600) continue;
      for (let j = 0; j < ck.length; j++) {
        let child;
        try { child = obj[ck[j]]; } catch (_) { continue; }
        if (child && typeof child === 'object') enq(child, node.path + '.' + ck[j]);
      }
    }

    console.groupCollapsed(TAG + ' PROBE — nodes=' + nodes + ' hits=' + hits.length);
    if (hits.length) {
      console.table(hits.slice(0, 60));
      const withTracked = hits.filter(function (h) { return h.tracked && h.tracked !== '—'; });
      if (withTracked.length) {
        console.log('%c⮕ Кандидаты с НАШИМИ id (инвентарь тут):', 'color:#30d158;font-weight:bold');
        console.table(withTracked);
      }
    } else {
      console.warn('Ничего похожего на инвентарь не найдено в графе window. ' +
        'Инвентарь недостижим → нужен декод входящих пакетов или инъекция в бандл.');
    }
    console.groupEnd();
    return hits;
  }

  const debugApi = {
    dump: function (reason, force) { return dump(reason || '', !!force); },
    copy: copy,
    watch: watch,
    scan: scan,
    probe: probe,
    buildReport: buildReport,
    onPlaceFail: onPlaceFail,
    onCombatActive: onCombatActive,
    onDiscover: onDiscover,
  };

  SM.inventoryDebug = debugApi;
  if (SM.inventory) SM.inventory.debug = debugApi;

})(window.__SM__ = window.__SM__ || {});


/* ===== src/net/msgpack.js ===== */
/**
 * net/msgpack.js — минимальный best-effort декодер MessagePack.
 * Используется снифером, чтобы попытаться расшифровать кадры WebSocket.
 * Если протокол не msgpack — decode вернёт { ok:false } и мы покажем hex.
 */
;(function (SM) {
  'use strict';

  function Reader(view) {
    this.view = view;
    this.offset = 0;
  }

  Reader.prototype.u8 = function () {
    return this.view.getUint8(this.offset++);
  };

  function decodeValue(r) {
    const b = r.u8();

    if (b <= 0x7f) return b; // positive fixint
    if (b >= 0xe0) return b - 0x100; // negative fixint
    if (b >= 0x80 && b <= 0x8f) return decodeMap(r, b & 0x0f);
    if (b >= 0x90 && b <= 0x9f) return decodeArray(r, b & 0x0f);
    if (b >= 0xa0 && b <= 0xbf) return decodeStr(r, b & 0x1f);

    const v = r.view;
    switch (b) {
      case 0xc0: return null;
      case 0xc2: return false;
      case 0xc3: return true;
      case 0xcc: return r.u8();
      case 0xcd: { const x = v.getUint16(r.offset); r.offset += 2; return x; }
      case 0xce: { const x = v.getUint32(r.offset); r.offset += 4; return x; }
      case 0xcf: { const x = Number(v.getBigUint64(r.offset)); r.offset += 8; return x; }
      case 0xd0: return v.getInt8(r.offset++);
      case 0xd1: { const x = v.getInt16(r.offset); r.offset += 2; return x; }
      case 0xd2: { const x = v.getInt32(r.offset); r.offset += 4; return x; }
      case 0xd3: { const x = Number(v.getBigInt64(r.offset)); r.offset += 8; return x; }
      case 0xca: { const x = v.getFloat32(r.offset); r.offset += 4; return x; }
      case 0xcb: { const x = v.getFloat64(r.offset); r.offset += 8; return x; }
      case 0xd9: { const n = r.u8(); return decodeStr(r, n); }
      case 0xda: { const n = v.getUint16(r.offset); r.offset += 2; return decodeStr(r, n); }
      case 0xdb: { const n = v.getUint32(r.offset); r.offset += 4; return decodeStr(r, n); }
      case 0xc4: { const n = r.u8(); return decodeBin(r, n); }
      case 0xc5: { const n = v.getUint16(r.offset); r.offset += 2; return decodeBin(r, n); }
      case 0xc6: { const n = v.getUint32(r.offset); r.offset += 4; return decodeBin(r, n); }
      case 0xdc: { const n = v.getUint16(r.offset); r.offset += 2; return decodeArray(r, n); }
      case 0xdd: { const n = v.getUint32(r.offset); r.offset += 4; return decodeArray(r, n); }
      case 0xde: { const n = v.getUint16(r.offset); r.offset += 2; return decodeMap(r, n); }
      case 0xdf: { const n = v.getUint32(r.offset); r.offset += 4; return decodeMap(r, n); }
      default:
        throw new Error('unsupported msgpack byte 0x' + b.toString(16));
    }
  }

  function decodeStr(r, len) {
    const bytes = new Uint8Array(r.view.buffer, r.view.byteOffset + r.offset, len);
    r.offset += len;
    try {
      return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    } catch (_) {
      return String.fromCharCode.apply(null, bytes);
    }
  }

  function decodeBin(r, len) {
    const bytes = new Uint8Array(r.view.buffer.slice(r.view.byteOffset + r.offset, r.view.byteOffset + r.offset + len));
    r.offset += len;
    return bytes;
  }

  function decodeArray(r, len) {
    const out = new Array(len);
    for (let i = 0; i < len; i++) out[i] = decodeValue(r);
    return out;
  }

  function decodeMap(r, len) {
    const out = {};
    for (let i = 0; i < len; i++) {
      const k = decodeValue(r);
      out[k] = decodeValue(r);
    }
    return out;
  }

  SM.msgpack = {
    decode: function (buffer) {
      try {
        const view =
          buffer instanceof DataView
            ? buffer
            : new DataView(buffer.buffer || buffer, buffer.byteOffset || 0, buffer.byteLength);
        const r = new Reader(view);
        const value = decodeValue(r);
        return { ok: true, value: value, consumed: r.offset, total: view.byteLength };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    },
  };
})(window.__SM__ = window.__SM__ || {});


/* ===== src/world/inventory-packets.js ===== */
/**
 * world/inventory-packets.js — декодер инвентаря из входящих WS-кадров.
 *
 * Задача: научиться читать реальный инвентарь не из обфусцированного графа
 * объектов клиента (это оказалось невозможно/опасно), а из бинарных пакетов
 * сервера. Делается в два этапа:
 *
 *   1) РЕВЕРС (этот файл, режим «диктофон»):
 *      • слушаем входящие бинарные кадры (net:in);
 *      • когда игрок СТАВИТ стену/шип (исходящий [25,id]) или экипирует ([6,id]),
 *        открываем окно записи ~WINDOW_MS и помечаем его этим id;
 *      • строим гистограмму опкодов и ищем, в каких кадрах после постройки
 *        встречаются байты этого id (u8/u16) — так находим опкод инвентаря и
 *        кодировку id/count.
 *      • report() — текст для анализа человеком, analyze() — авто-гипотеза формата.
 *
 *   2) ЖИВОЙ ДЕКОД:
 *      • после применения формата (setFormat / авто из analyze) каждый входящий
 *        кадр этого опкода разбирается в counts[id];
 *      • count(id) отдаёт актуальное число — его уже использует
 *        inventory.js → packetCount() → autoWall/autoSpike.
 *
 * Слот SM.inventoryPackets уже ожидается inventory.js и bootstrap.js.
 */
;(function (SM) {
  'use strict';

  // --- настройки записи -----------------------------------------------------
  var WINDOW_MS = 1600;        // длительность окна записи после триггера
  var MAX_FRAMES_PER_WIN = 60; // максимум кадров в одном окне
  var MAX_WINDOWS = 25;        // кольцо окон записи
  var MAX_BYTES_STORE = 512;   // сколько байт кадра хранить для анализа

  // --- состояние ------------------------------------------------------------
  var ALL_LIMIT = 600;         // кольцо «всех» входящих кадров (для diff)
  var DIFF_MAX_LEN = 220;      // макс. длина кадра-кандидата на инвентарь

  var counts = Object.create(null);  // id -> count (живой декод)
  var countsAt = Object.create(null);// id -> performance.now() последнего апдейта
  var format = null;                 // применённый формат живого декода
  var windows = [];                  // окна записи (см. openWindow)
  var idleOps = Object.create(null); // op -> count кадров вне окон
  var allFrames = [];                // плоское кольцо входящих кадров (для diff)
  var textFrames = [];               // входящие ТЕКСТОВЫЕ кадры (uniq по содержимому)
  var openWin = null;                // текущее открытое окно записи
  var openWinTimer = 0;
  var bound = false;
  var recording = true;              // запись окон включена (для реверса)

  // --- утилиты --------------------------------------------------------------
  function nowMs() { return performance.now(); }

  function toHex(byte) {
    var h = byte.toString(16);
    return h.length === 1 ? '0' + h : h;
  }

  function hexDump(bytes, max) {
    if (!bytes) return '';
    var n = Math.min(bytes.length, max || bytes.length);
    var out = [];
    for (var i = 0; i < n; i++) out.push(toHex(bytes[i]));
    var s = out.join(' ');
    if (bytes.length > n) s += ' …+' + (bytes.length - n);
    return s;
  }

  function copyBytes(src) {
    if (!src || !src.length) return null;
    var n = Math.min(src.length, MAX_BYTES_STORE);
    var out = new Uint8Array(n);
    for (var i = 0; i < n; i++) out[i] = src[i];
    return out;
  }

  /**
   * Все смещения, где id закодирован как u8 / u16le / u16be.
   * Для id >= 256 u8 не проверяем (нет смысла).
   */
  function findIdOffsets(bytes, id) {
    var hits = [];
    var lo = id & 0xff;
    var hi = (id >> 8) & 0xff;
    if (id < 256) {
      for (var i = 0; i < bytes.length; i++) {
        if (bytes[i] === lo) hits.push({ enc: 'u8', off: i });
      }
    }
    for (var j = 0; j + 1 < bytes.length; j++) {
      if (bytes[j] === lo && bytes[j + 1] === hi) hits.push({ enc: 'u16le', off: j });
      if (bytes[j] === hi && bytes[j + 1] === lo) hits.push({ enc: 'u16be', off: j });
    }
    return hits;
  }

  function readUint(bytes, off, enc) {
    if (enc === 'u8') return bytes[off];
    if (enc === 'u16le') return bytes[off] | (bytes[off + 1] << 8);
    if (enc === 'u16be') return (bytes[off] << 8) | bytes[off + 1];
    return null;
  }

  // --- окна записи ----------------------------------------------------------
  function openWindow(kind, id) {
    if (openWinTimer) { clearTimeout(openWinTimer); openWinTimer = 0; }
    openWin = { kind: kind, id: id, at: nowMs(), frames: [] };
    windows.push(openWin);
    while (windows.length > MAX_WINDOWS) windows.shift();
    var w = openWin;
    openWinTimer = setTimeout(function () {
      if (openWin === w) openWin = null;
      openWinTimer = 0;
    }, WINDOW_MS);
  }

  function recordText(frame) {
    var t = frame.text;
    if (typeof t !== 'string' || !t.length) return;
    for (var i = 0; i < textFrames.length; i++) {
      if (textFrames[i].text === t) { textFrames[i].count++; textFrames[i].at = nowMs(); return; }
    }
    textFrames.push({ text: t.length > 400 ? t.slice(0, 400) + '…' : t, count: 1, at: nowMs() });
    if (textFrames.length > 60) textFrames.shift();
  }

  function recordIncoming(frame) {
    if (!frame) return;
    if (frame.text != null) { if (recording) recordText(frame); return; }
    if (!frame.bytes || !frame.bytes.length) return;
    var bytes = frame.bytes;
    var op = bytes[0];

    if (format && format.op === op) decodeLive(bytes);

    if (!recording) return;

    var stored = copyBytes(bytes);

    // плоское кольцо для diff-анализа
    allFrames.push({ op: op, len: bytes.length, at: nowMs(), bytes: stored });
    while (allFrames.length > ALL_LIMIT) allFrames.shift();

    if (openWin && openWin.frames.length < MAX_FRAMES_PER_WIN) {
      openWin.frames.push({
        op: op,
        len: bytes.length,
        dt: Math.round(nowMs() - openWin.at),
        bytes: stored,
      });
    } else {
      idleOps[op] = (idleOps[op] || 0) + 1;
    }
  }

  function onOut(frame) {
    try {
      if (frame.text == null) return;
      var v = JSON.parse(frame.text);
      if (!Array.isArray(v) || v.length < 2) return;
      var op = v[0];
      var id = v[1];
      if (typeof id !== 'number') return;
      if (op === 25) openWindow('place', id);
      else if (op === 6) openWindow('equip', id);
    } catch (_) {}
  }

  // --- анализ опкодов --------------------------------------------------------
  /**
   * Сводка по опкодам: в скольких окнах встречался opcode и в скольких из них
   * этот кадр НЁС закодированный id окна (сильный признак пакета инвентаря).
   */
  function opcodeStats() {
    var stats = Object.create(null); // op -> { winHits, idCarry, samples }

    windows.forEach(function (w) {
      if (w.id == null) return;
      var seenOp = Object.create(null);   // op -> true (в этом окне)
      var carryOp = Object.create(null);  // op -> true (нёс id в этом окне)

      w.frames.forEach(function (f) {
        if (!f.bytes) return;
        seenOp[f.op] = true;
        var hits = findIdOffsets(f.bytes, w.id).filter(function (h) {
          return h.enc !== 'u8'; // u8 слишком шумный — для признака берём только u16
        });
        if (hits.length) carryOp[f.op] = true;
      });

      Object.keys(seenOp).forEach(function (op) {
        var s = stats[op] || (stats[op] = { op: +op, winHits: 0, idCarry: 0 });
        s.winHits++;
        if (carryOp[op]) s.idCarry++;
      });
    });

    return stats;
  }

  function rankedOps() {
    var stats = opcodeStats();
    return Object.keys(stats)
      .map(function (k) {
        var s = stats[k];
        s.idle = idleOps[s.op] || 0;
        return s;
      })
      .sort(function (a, b) {
        if (b.idCarry !== a.idCarry) return b.idCarry - a.idCarry;
        if (b.winHits !== a.winHits) return b.winHits - a.winHits;
        return a.idle - b.idle;
      });
  }

  /** Примеры кадров заданного опкода (с подсветкой позиций id). */
  function examplesForOp(op, limit) {
    var out = [];
    for (var i = windows.length - 1; i >= 0 && out.length < (limit || 4); i--) {
      var w = windows[i];
      if (w.id == null) continue;
      for (var j = 0; j < w.frames.length; j++) {
        var f = w.frames[j];
        if (f.op !== op || !f.bytes) continue;
        var hits = findIdOffsets(f.bytes, w.id);
        out.push({ id: w.id, kind: w.kind, len: f.len, dt: f.dt, hits: hits, bytes: f.bytes });
        break;
      }
    }
    return out;
  }

  /**
   * Гипотеза формата списка: пакет = [op][header...][пары (id,count) по stride].
   * Подбираем (idEnc, stride, headerLen), при которых смещения известных id
   * по всем окнам ложатся на регулярную сетку header + k*stride.
   */
  function guessListFormat() {
    var best = null;

    ['u16le', 'u16be'].forEach(function (idEnc) {
      // смещения id по окнам (для выбранной кодировки), на кадрах лучшего опкода
      for (var stride = 3; stride <= 10; stride++) {
        for (var header = 1; header <= stride + 2; header++) {
          var fit = 0;
          var total = 0;
          windows.forEach(function (w) {
            if (w.id == null) return;
            var matched = false;
            w.frames.forEach(function (f) {
              if (!f.bytes || matched) return;
              var hits = findIdOffsets(f.bytes, w.id);
              for (var h = 0; h < hits.length; h++) {
                if (hits[h].enc !== idEnc) continue;
                var rel = hits[h].off - header;
                if (rel >= 0 && rel % stride === 0) { matched = true; break; }
              }
            });
            total++;
            if (matched) fit++;
          });
          if (total >= 2 && fit >= 2) {
            var score = fit - stride * 0.01 - header * 0.001;
            if (!best || score > best.score) {
              best = { idEnc: idEnc, stride: stride, header: header, fit: fit, total: total, score: score };
            }
          }
        }
      }
    });

    return best;
  }

  // --- живой декод по применённому формату ----------------------------------
  /**
   * format = { op, header, stride, idEnc, countEnc, countOff }
   *   countOff — смещение count относительно начала id (обычно 2 для u16-id).
   */
  function decodeLive(bytes) {
    if (!format) return;
    try {
      var stride = format.stride;
      var idEnc = format.idEnc;
      var countEnc = format.countEnc || idEnc;
      var countOff = format.countOff != null ? format.countOff : 2;
      var fresh = Object.create(null);
      for (var off = format.header; off + countOff < bytes.length; off += stride) {
        var id = readUint(bytes, off, idEnc);
        var cnt = readUint(bytes, off + countOff, countEnc);
        if (id == null || cnt == null) break;
        fresh[id] = cnt;
      }
      var t = nowMs();
      for (var k in fresh) {
        counts[k] = fresh[k];
        countsAt[k] = t;
      }
    } catch (_) {}
  }

  // --- diff-анализ: ищем «стабильный» пакет с убывающим счётчиком ----------
  /**
   * Пакет инвентаря приходит почти идентичным при каждой постройке: меняется
   * лишь счётчик предмета. Группируем кадры по (op,len), внутри группы ищем
   * смещения с малым числом различий — особенно монотонную последовательность
   * (счётчик 5→4→3). Это находит счётчик БЕЗ знания кодировки id.
   */
  /**
   * Профиль байт-смещений: какой байт — счётчик последовательности (инкремент
   * +1 каждый кадр), а какой — тип пакета (мало различных значений, повторяется).
   */
  function offsetProfile(maxOff) {
    var prof = [];
    var n = maxOff || 6;
    for (var off = 0; off < n; off++) {
      var distinct = Object.create(null);
      var incr = 0, pairs = 0, prev = null;
      for (var i = 0; i < allFrames.length; i++) {
        var b = allFrames[i].bytes;
        if (!b || b.length <= off) continue;
        var v = b[off];
        distinct[v] = true;
        if (prev !== null) {
          pairs++;
          if (((prev + 1) & 0xff) === v) incr++;
        }
        prev = v;
      }
      prof.push({
        off: off,
        distinct: Object.keys(distinct).length,
        incrRatio: pairs ? +(incr / pairs).toFixed(2) : 0,
      });
    }
    return prof;
  }

  /** Автоподбор смещения «типа пакета»: после счётчика, с малым числом значений. */
  function autoTypeOff() {
    var prof = offsetProfile(4);
    // если byte[0] — счётчик (часто инкрементируется), тип ищем дальше
    var seq = prof[0].incrRatio >= 0.6;
    var start = seq ? 1 : 0;
    var best = start;
    var bestScore = -1;
    for (var i = start; i < prof.length; i++) {
      var p = prof[i];
      if (p.distinct < 2) continue;          // константа — не тип
      if (p.incrRatio >= 0.6) continue;      // ещё один счётчик
      // тип: умеренное число различных значений
      var score = 100 - Math.abs(p.distinct - 12);
      if (score > bestScore) { bestScore = score; best = i; }
    }
    return best;
  }

  /** Смещения-счётчики (инкремент каждый кадр) — их игнорируем в diff. */
  function seqOffsets() {
    return offsetProfile(4)
      .filter(function (p) { return p.incrRatio >= 0.6; })
      .map(function (p) { return p.off; });
  }

  function diffCandidates(typeOff) {
    if (typeOff == null) typeOff = autoTypeOff();
    var skip = Object.create(null);
    seqOffsets().forEach(function (o) { skip[o] = true; });

    var groups = Object.create(null); // key type|len -> [bytes,...]
    for (var i = 0; i < allFrames.length; i++) {
      var f = allFrames[i];
      if (!f.bytes || f.len > DIFF_MAX_LEN) continue;
      if (f.bytes.length <= typeOff) continue;
      var key = f.bytes[typeOff] + '|' + f.len;
      (groups[key] || (groups[key] = [])).push(f.bytes);
    }

    var cands = [];
    Object.keys(groups).forEach(function (key) {
      var arr = groups[key];
      if (arr.length < 3) return;
      var sample = arr.slice(-12); // последние до 12 кадров группы
      var len = sample[0].length;
      var diffOffsets = [];
      for (var off = 0; off < len; off++) {
        if (skip[off]) continue; // байт-счётчик пакета — не интересен
        var distinct = Object.create(null);
        var seq = [];
        for (var k = 0; k < sample.length; k++) {
          var v = sample[k][off];
          distinct[v] = true;
          seq.push(v);
        }
        var nd = Object.keys(distinct).length;
        if (nd > 1) diffOffsets.push({ off: off, distinct: nd, seq: seq });
      }
      if (diffOffsets.length === 0 || diffOffsets.length > 8) return;

      var monotonic = diffOffsets.filter(function (d) { return isMonotonicStep(d.seq); });
      cands.push({
        type: sample[0][typeOff],
        typeOff: typeOff,
        len: len,
        frames: arr.length,
        diffOffsets: diffOffsets,
        monotonic: monotonic,
        sampleHex: hexDump(sample[sample.length - 1], DIFF_MAX_LEN),
        firstHex: hexDump(sample[0], DIFF_MAX_LEN),
      });
    });

    cands.sort(function (a, b) {
      if (b.monotonic.length !== a.monotonic.length) return b.monotonic.length - a.monotonic.length;
      if (a.diffOffsets.length !== b.diffOffsets.length) return a.diffOffsets.length - b.diffOffsets.length;
      return b.frames - a.frames;
    });
    return cands;
  }

  /** Последовательность похожа на счётчик: убывает/возрастает шагами 1 (с допусками). */
  function isMonotonicStep(seq) {
    if (seq.length < 3) return false;
    var dec = 0, inc = 0, steps = 0;
    for (var i = 1; i < seq.length; i++) {
      var d = seq[i] - seq[i - 1];
      if (d === 0) continue;
      steps++;
      if (d < 0) dec++; else inc++;
    }
    if (steps < 2) return false;
    return dec >= steps - 1 || inc >= steps - 1; // почти всегда в одну сторону
  }

  /** Гистограмма по байту типа (typeOff): что повторяется. */
  function histogram(typeOff) {
    if (typeOff == null) typeOff = autoTypeOff();
    var h = Object.create(null); // type -> { type, count, lens:{} }
    for (var i = 0; i < allFrames.length; i++) {
      var f = allFrames[i];
      if (!f.bytes || f.bytes.length <= typeOff) continue;
      var ty = f.bytes[typeOff];
      var e = h[ty] || (h[ty] = { type: ty, count: 0, lens: Object.create(null) });
      e.count++;
      e.lens[f.len] = (e.lens[f.len] || 0) + 1;
    }
    return Object.keys(h)
      .map(function (k) { return h[k]; })
      .sort(function (a, b) { return b.count - a.count; });
  }

  function histReport(typeOff) {
    if (typeOff == null) typeOff = autoTypeOff();
    var lines = [];
    lines.push('# histogram по байту типа (typeOff=' + typeOff + ')');
    lines.push('allFrames=' + allFrames.length + ' offsetProfile=' + JSON.stringify(offsetProfile(5)));
    lines.push('  type(hex/dec)  count  lengths{len:count}');
    histogram(typeOff).slice(0, 25).forEach(function (e) {
      lines.push('  0x' + e.type.toString(16) + '/' + e.type + '   ' + e.count + '   ' + JSON.stringify(e.lens));
    });
    return lines.join('\n');
  }

  function diffReport(typeOff) {
    if (typeOff == null) typeOff = autoTypeOff();
    var lines = [];
    lines.push('# inventory diff-report (ищем убывающий/растущий счётчик)');
    lines.push('allFrames=' + allFrames.length + ' textFrames=' + textFrames.length +
      ' typeOff=' + typeOff + ' offsetProfile=' + JSON.stringify(offsetProfile(5)));

    var cands = diffCandidates();
    if (!cands.length) {
      lines.push('кандидатов нет. Поставь ОДНУ И ТУ ЖЕ стену 4-5 раз подряд (стоя на месте), потом снова diffReport().');
    }
    cands.slice(0, 6).forEach(function (c, idx) {
      lines.push('--- cand#' + idx + ' type=0x' + c.type.toString(16) + '@off' + c.typeOff +
        ' len=' + c.len + ' frames=' + c.frames + ' diffOffsets=' + c.diffOffsets.length +
        ' monotonic=' + c.monotonic.length);
      c.diffOffsets.forEach(function (d) {
        var tag = isMonotonicStep(d.seq) ? ' <== счётчик?' : '';
        lines.push('    off ' + d.off + ' seq=[' + d.seq.join(',') + ']' + tag);
      });
      lines.push('    first: ' + c.firstHex);
      lines.push('    last : ' + c.sampleHex);
    });

    if (textFrames.length) {
      lines.push('# входящие ТЕКСТОВЫЕ кадры (uniq):');
      textFrames.slice(-12).forEach(function (t) {
        lines.push('  x' + t.count + ' ' + t.text);
      });
    }
    return lines.join('\n');
  }

  // --- публичный отчёт -------------------------------------------------------
  function report() {
    var lines = [];
    lines.push('# inventory-packets report');
    lines.push('windows=' + windows.length + ' recording=' + recording + ' format=' + (format ? JSON.stringify(format) : 'none'));

    var withId = windows.filter(function (w) { return w.id != null; });
    lines.push('captured windows (последние):');
    withId.slice(-8).forEach(function (w) {
      lines.push('  [' + w.kind + ' id=' + w.id + '] frames=' + w.frames.length +
        ' ops=' + JSON.stringify(uniqueOps(w.frames)));
    });

    lines.push('# opcodes by idCarry (кандидаты на пакет инвентаря):');
    lines.push('  op(hex/dec)  idCarry  winHits  idleHits');
    rankedOps().slice(0, 12).forEach(function (s) {
      lines.push('  0x' + s.op.toString(16) + '/' + s.op +
        '   ' + s.idCarry + '/' + withId.length +
        '   ' + s.winHits +
        '   ' + s.idle);
    });

    var top = rankedOps()[0];
    if (top) {
      lines.push('# примеры кадров top-op 0x' + top.op.toString(16) + ':');
      examplesForOp(top.op, 4).forEach(function (ex) {
        var hitStr = ex.hits.map(function (h) { return h.enc + '@' + h.off; }).join(',');
        lines.push('  id=' + ex.id + ' len=' + ex.len + ' dt=' + ex.dt + 'ms idHits=[' + hitStr + ']');
        lines.push('    ' + hexDump(ex.bytes, 96));
        var mp = SM.msgpack && SM.msgpack.decode(ex.bytes);
        if (mp && mp.ok && mp.consumed === mp.total) {
          lines.push('    msgpack=' + safeJson(mp.value));
        }
      });
    }

    var guess = guessListFormat();
    if (guess) {
      lines.push('# list-format гипотеза: idEnc=' + guess.idEnc +
        ' stride=' + guess.stride + ' header=' + guess.header +
        ' fit=' + guess.fit + '/' + guess.total);
      if (top) {
        lines.push('  применить: __STARVE_MOD__.invDecode.setFormat(' +
          JSON.stringify({ op: top.op, header: guess.header, stride: guess.stride, idEnc: guess.idEnc, countOff: 2 }) + ')');
      }
    } else {
      lines.push('# list-format гипотеза: не найдена (мало данных или иной формат)');
    }

    return lines.join('\n');
  }

  function uniqueOps(frames) {
    var set = Object.create(null);
    frames.forEach(function (f) { set['0x' + f.op.toString(16)] = true; });
    return Object.keys(set);
  }

  function safeJson(v) {
    try { return JSON.stringify(v); } catch (_) { return String(v); }
  }

  // --- API ------------------------------------------------------------------
  SM.inventoryPackets = {
    // живой счёт (используется autoWall/autoSpike через inventory.packetCount)
    count: function (itemId) {
      var c = counts[itemId];
      if (typeof c !== 'number' || c <= 0) return 0;
      // если декод включён и данные свежие — отдаём; иначе 0
      var at = countsAt[itemId] || 0;
      if (format && nowMs() - at > 120000) return 0;
      return c;
    },

    snapshot: function () { return Object.assign(Object.create(null), counts); },

    // --- реверс ---
    report: function () {
      var s = report();
      console.log(s);
      return s;
    },
    analyze: function () { return guessListFormat(); },
    diffReport: function (typeOff) {
      var s = diffReport(typeOff);
      console.log(s);
      return s;
    },
    offsetProfile: offsetProfile,
    diffCandidates: diffCandidates,
    histReport: function (typeOff) {
      var s = histReport(typeOff);
      console.log(s);
      return s;
    },
    histogram: histogram,
    textFrames: function () { return textFrames.slice(); },
    arm: function (ms) {
      recording = true;
      openWindow('manual', null);
      var w = openWin;
      var dur = ms || 3000;
      if (openWinTimer) { clearTimeout(openWinTimer); }
      openWinTimer = setTimeout(function () {
        if (openWin === w) openWin = null;
        openWinTimer = 0;
      }, dur);
      SM.log('[inv-pk] arm: пишу входящие кадры', dur + 'ms (manual, id=null)');
      return 'recording ' + dur + 'ms';
    },
    /** Пометить ближайшее окно известным id (для ручных подборов: подними ресурс). */
    markId: function (id) {
      recording = true;
      openWindow('manual', id);
      SM.log('[inv-pk] markId', id);
      return 'marked id=' + id;
    },
    windows: function () { return windows; },
    rankedOps: rankedOps,
    clear: function () {
      windows.length = 0;
      allFrames.length = 0;
      textFrames.length = 0;
      for (var k in idleOps) delete idleOps[k];
      openWin = null;
      SM.log('[inv-pk] cleared');
    },
    setRecording: function (on) { recording = !!on; return recording; },

    // --- живой декод ---
    setFormat: function (fmt) {
      if (!fmt || typeof fmt.op !== 'number') { SM.warn('[inv-pk] setFormat: нужен {op,...}'); return null; }
      format = {
        op: fmt.op,
        header: fmt.header != null ? fmt.header : 1,
        stride: fmt.stride != null ? fmt.stride : 4,
        idEnc: fmt.idEnc || 'u16le',
        countEnc: fmt.countEnc || fmt.idEnc || 'u16le',
        countOff: fmt.countOff != null ? fmt.countOff : 2,
      };
      for (var k in counts) delete counts[k];
      SM.log('[inv-pk] формат применён, живой декод включён:', JSON.stringify(format));
      return format;
    },
    getFormat: function () { return format ? Object.assign({}, format) : null; },
    clearFormat: function () { format = null; SM.log('[inv-pk] формат сброшен'); },

    init: function () {
      if (bound) return;
      bound = true;
      SM.bus.on('net:in', recordIncoming);
      SM.bus.on('net:out', onOut);
      SM.log('[inv-pk] декодер инвентаря активен — реверс: __STARVE_MOD__.invDecode.report()');
    },
  };

  SM.invDecode = SM.inventoryPackets;
})(window.__SM__ = window.__SM__ || {});


/* ===== src/net/socket.js ===== */
/**
 * net/socket.js — слушатели CustomEvent от раннего хука (loader, document-start).
 * Хук ставится ТОЛЬКО на экземпляр сокета при первом send — без Proxy, без
 * патча onmessage/addEventListener на prototype.
 */
;(function (SM) {
  'use strict';

  const RING_LIMIT = 200;

  SM.net = {
    socket: null,
    frames: [],
    stats: { inCount: 0, outCount: 0, lastInAt: 0, lastOutAt: 0 },
    installed: false,
  };

  function toBytes(data) {
    if (data == null) return null;
    if (typeof data === 'string') return null;
    if (data instanceof ArrayBuffer) return new Uint8Array(data);
    if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    return null;
  }

  function record(dir, data) {
    try {
      const bytes = toBytes(data);
      const frame = {
        dir: dir,
        at: performance.now(),
        bytes: bytes,
        text: typeof data === 'string' ? data : null,
        size: bytes ? bytes.byteLength : typeof data === 'string' ? data.length : 0,
      };
      const ring = SM.net.frames;
      ring.push(frame);
      if (ring.length > RING_LIMIT) ring.shift();
      if (dir === 'in') {
        SM.net.stats.inCount++;
        SM.net.stats.lastInAt = frame.at;
      } else {
        SM.net.stats.outCount++;
        SM.net.stats.lastOutAt = frame.at;
      }
      SM.bus.emit('net:' + dir, frame);
    } catch (_) {}
  }

  // Подмена угла в исходящих пакетах движка (как oldscript: угол к цели вместо
  // угла мыши). Аимбот задаёт SM.net.setAimAngle(byte|null). Переписываем только
  // текстовые [24,x] (поворот) и [7,x] (атака), чтобы движок «смотрел» на врага.
  let aimAngle = null;
  SM.net.setAimAngle = function (b) {
    aimAngle = typeof b === 'number' && isFinite(b) ? ((Math.round(b) % 256) + 256) % 256 : null;
  };

  function aimRewrite(d) {
    if (aimAngle == null || typeof d !== 'string' || d.charCodeAt(0) !== 91 /* [ */) return d;
    try {
      const v = JSON.parse(d);
      if (Array.isArray(v) && v.length >= 2 && (v[0] === 24 || v[0] === 7)) {
        v[1] = aimAngle;
        return JSON.stringify(v);
      }
    } catch (_) {}
    return d;
  }

  function isMovePacket(d) {
    try {
      if (typeof d === 'string') {
        if (d.charCodeAt(0) !== 91 /* [ */) return false;
        const v = JSON.parse(d);
        return Array.isArray(v) && v[0] === 0x25;
      }
      let b = null;
      if (d instanceof ArrayBuffer) b = new Uint8Array(d);
      else if (ArrayBuffer.isView(d)) b = new Uint8Array(d.buffer, d.byteOffset, d.byteLength);
      else return false;
      return b.length >= 1 && b[0] === 0x25;
    } catch (_) { return false; }
  }

  function wrapAim() {
    const ws = SM.net.socket;
    if (!ws || ws.__starveAimWrap__) return;
    const prev = ws.send;
    if (typeof prev !== 'function') return;
    ws.__starveAimWrap__ = true;
    ws.send = function (d) {
      try { if (window.__SV_SPEC__ && isMovePacket(d)) return; } catch (_) {}
      const out = aimRewrite(d);
      return prev.call(ws, out);
    };
  }

  function refreshSocket() {
    SM.net.socket = window.__STARVE_GAME_WS__ || SM.net.socket;
    wrapAim();
  }

  // Отправка через nativeSend — минуя обёртку игры, только на провод.
  SM.net.send = function (data) {
    refreshSocket();
    const ws = SM.net.socket;
    if (!ws || ws.readyState !== 1) {
      SM.warn('net.send: no open socket');
      return false;
    }
    try {
      const fn = ws.__starveNativeSend__;
      if (typeof fn === 'function') fn(data);
      else ws.send(data);
      return true;
    } catch (err) {
      SM.warn('net.send failed', err);
      return false;
    }
  };

  SM.net.ensureInstalled = function () {
    if (SM.net.installed) return;
    SM.net.installed = true;
    refreshSocket();

    window.addEventListener('starve-mod-ws-out', function (e) {
      refreshSocket();
      record('out', e.detail && e.detail.data);
    });
    window.addEventListener('starve-mod-ws-in', function (e) {
      refreshSocket();
      record('in', e.detail && e.detail.data);
    });

    SM.log('WebSocket listeners bound (instance-safe hook)');
  };
})(window.__SM__ = window.__SM__ || {});


/* ===== src/net/analyze.js ===== */
/**
 * net/analyze.js — разбор исходящих кадров для маппинга протокола.
 *
 * Протокол starve.io (по снифингу):
 *   • движение — бинарный кадр [0x25, <битмаска WASD>];
 *   • команды  — текстовые JSON-массивы "[opcode, ...args]" (угол, атака, и т.п.).
 *
 * Модуль ведёт гистограмму опкодов (отдельно текст и бинарь), чтобы можно было
 * изолированно поймать действие: сбросить счётчики → сделать одно действие →
 * увидеть, какой опкод инкрементнулся.
 */
;(function (SM) {
  'use strict';

  const text = Object.create(null); // opcode -> { count, lastArgs }
  const bin = Object.create(null); // firstByte -> { count, lastArgs }
  let bound = false;

  function parseOut(frame) {
    try {
      if (frame.text != null) {
        const v = JSON.parse(frame.text);
        if (Array.isArray(v) && v.length) {
          const op = v[0];
          const e = text[op] || (text[op] = { count: 0, lastArgs: null });
          e.count++;
          e.lastArgs = v.slice(1);
        }
      } else if (frame.bytes && frame.bytes.length) {
        const op = frame.bytes[0];
        const e = bin[op] || (bin[op] = { count: 0, lastArgs: null });
        e.count++;
        e.lastArgs = Array.prototype.slice.call(frame.bytes, 1);
      }
    } catch (_) {}
  }

  SM.netAnalyze = {
    text: text,
    bin: bin,
    bind: function () {
      if (bound) return;
      bound = true;
      SM.bus.on('net:out', parseOut);
    },
    reset: function () {
      for (const k in text) delete text[k];
      for (const k in bin) delete bin[k];
    },
    // Текстовый отчёт для копирования.
    report: function () {
      const lines = [];
      lines.push('# OUT text opcodes [op] count lastArgs');
      Object.keys(text)
        .sort(function (a, b) { return text[b].count - text[a].count; })
        .forEach(function (op) {
          lines.push('[' + op + '] x' + text[op].count + ' args=' + JSON.stringify(text[op].lastArgs));
        });
      lines.push('# OUT binary <firstByte> count lastBytes');
      Object.keys(bin)
        .sort(function (a, b) { return bin[b].count - bin[a].count; })
        .forEach(function (op) {
          const hex = '0x' + Number(op).toString(16);
          lines.push(hex + ' x' + bin[op].count + ' bytes=' + JSON.stringify(bin[op].lastArgs));
        });
      return lines.join('\n');
    },
  };
})(window.__SM__ = window.__SM__ || {});


/* ===== src/net/protocol.js ===== */
/**
 * net/protocol.js — игровой протокол starve.io.
 */
;(function (SM) {
  'use strict';

  const OP = {
    EQUIP: 6,
    USE_ITEM: 6,    // live client: stringify([6, id]) — тот же опкод, что equip (надеть/съесть)
    CRAFT: 21,      // live client: stringify([21, recipeId])
    MOUSE: 15,
    ANGLE: 24,       // поворот (взгляд)
    ANGLE_ALT: 7,    // атака с углом (send_attack) — шлётся, пока игрок бьёт
    PLACE: 25,
    ATTACK: 35,      // фактически СТОП атаки (шлётся при отпускании ЛКМ)
    STOP_ATTACK: 35,
    MOVE_BIN: 0x25,
  };

  const BOOK_ITEM_ID = 46; // items.txt: BOOK

  const screenMouse = { x: 0, y: 0, at: 0 };

  const protocol = {
    OP: OP,
    lastAngle: null,
    lastAngleAt: 0,
    lastMouse: { x: null, y: null },
    bound: false,
  };

  // ---------------------------------------------------------------------------
  // Карта опкодов текущего клиента (SM.opcodes)
  // ---------------------------------------------------------------------------
  // Опкоды получены статическим реверсом starve_client.js (.stringify([op,...])).
  // УВЕРЕННЫЕ (форма аргументов однозначна или подтверждена в игре):
  //   angle=24, attack=7, stop=35, place=25, equip=6, craft=21, useItem=6 (= equip на live),
  //   legacy: craft=22, useItem=16/22/5
  //   giveItem=29 [item,n,pid,iid], takeExtractor=12 [pid,iid,type],
  //   putExtractor=30 [n,pid,iid,type], putFurnace=31 [n,pid,iid].
  // НЕОДНОЗНАЧНЫЕ (одинаковая форма [pid,iid] либо [id]; часть опкодов в клиенте —
  // вычисляемые переменные, не литералы) → null, заполняются «захватом» через GUI:
  //   takeChest, takeOven, takeFlour, recycle, drop, useItem, updateCamera.
  const OPCODE_KEY = 'starve-mod:opcodes:v1';
  const opcodeDefaults = {
    angle: 24,
    attack: 7,
    stop: 35,
    place: 25,
    equip: 6,
    ping: 6,
    craft: 21,
    giveItem: 29,
    takeExtractor: 12,
    putExtractor: 30,
    putFurnace: 31,
    // подтверждены снифером / реверсом live client:
    takeChest: 18,
    recycle: 10,
    drop: 2,
    useItem: 6,
    // ещё требуют подтверждения снифером (1 действие):
    updateCamera: null,
  };

  const opcodes = {
    map: Object.assign({}, opcodeDefaults),
    DEFAULTS: opcodeDefaults,
    // Спам-опкоды, которые игнорируем при захвате (угол/атака/движение/мышь/постройка).
    SPAM: { 7: 1, 15: 1, 24: 1, 25: 1, 35: 1, 37: 1, 0x25: 1 },
    _capturing: null, // { slot, done }
  };

  opcodes.get = function (slot) {
    const v = opcodes.map[slot];
    return typeof v === 'number' && Number.isFinite(v) ? v : null;
  };

  opcodes.set = function (slot, op) {
    if (!(slot in opcodes.map)) return false;
    if (slot === 'useItem' && typeof op === 'number' && isConsumeDenyOp(op)) {
      SM.warn('opcodes: useItem не может быть op=' + op + ' (это drop/recycle, не «съесть»)');
      return false;
    }
    opcodes.map[slot] = (typeof op === 'number' && Number.isFinite(op)) ? op : null;
    opcodes.save();
    return true;
  };

  opcodes.load = function () {
    try {
      const raw = localStorage.getItem(OPCODE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data && typeof data === 'object') {
        Object.keys(opcodeDefaults).forEach(function (k) {
          if (typeof data[k] === 'number') opcodes.map[k] = data[k];
        });
        // migrate старые/неверные значения useItem (16/22/5) → live useItem=6 (= equip)
        if (opcodes.map.craft === 22) {
          opcodes.map.craft = 21;
          opcodes.save();
        }
        if (opcodes.map.useItem === 16 || opcodes.map.useItem === 22 || opcodes.map.useItem === 5) {
          opcodes.map.useItem = 6;
          opcodes.save();
        }
      }
    } catch (_) {}
    sanitizeUseItemOpcode();
  };

  opcodes.save = function () {
    try { localStorage.setItem(OPCODE_KEY, JSON.stringify(opcodes.map)); } catch (_) {}
  };

  // Захват опкода: вооружаемся → следующий НЕ-спам исходящий опкод пишем в slot.
  opcodes.capture = function (slot, done) {
    if (!(slot in opcodes.map)) { if (done) done(null); return; }
    opcodes._capturing = { slot: slot, done: done || null };
    SM.net.ensureInstalled();
    SM.warn('opcodes.capture: жду действие для "' + slot + '" — сделай его 1 раз в игре');
  };

  opcodes.cancelCapture = function () { opcodes._capturing = null; };

  function onCaptureFrame(frame) {
    const cap = opcodes._capturing;
    if (!cap || frame.text == null) return;
    try {
      const v = JSON.parse(frame.text);
      if (!Array.isArray(v) || !v.length) return;
      const op = v[0];
      if (typeof op !== 'number' || opcodes.SPAM[op]) return;
      opcodes._capturing = null;
      opcodes.set(cap.slot, op);
      SM.log('opcodes.capture: "' + cap.slot + '" = ' + op + ' (args ' + JSON.stringify(v.slice(1)) + ')');
      if (cap.done) cap.done(op);
    } catch (_) {}
  }

  protocol.opcodes = opcodes;
  SM.opcodes = opcodes;

  function isValidNum(n) {
    return typeof n === 'number' && Number.isFinite(n);
  }

  function sendArr(arr) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === null || arr[i] === undefined) return false;
      if (typeof arr[i] === 'number' && !Number.isFinite(arr[i])) return false;
    }
    return SM.net.send(JSON.stringify(arr));
  }

  protocol.send = sendArr;
  protocol.attack = function () { return sendArr([OP.ATTACK]); };

  /**
   * Атака с углом (как oldscript send_attack). Живой протокol: [7, angleUint8] —
   * шлётся постоянно, пока игрок атакует; второе значение = направление (0..255).
   */
  protocol.attackAngle = function (byteAngle) {
    if (!isValidNum(byteAngle)) return false;
    const d = ((Math.round(byteAngle) % 256) + 256) % 256;
    return sendArr([OP.ANGLE_ALT, d]);
  };

  /** Стоп-атаки (как oldscript stop_attack): одиночный пакет [35]. */
  protocol.stopAttack = function () { return sendArr([OP.STOP_ATTACK]); };

  protocol.setAngle = function (deg) {
    if (!isValidNum(deg)) return false;
    const d = ((Math.round(deg) % 256) + 256) % 256;
    return sendArr([OP.ANGLE, d]);
  };

  protocol.place = function (itemId, angleDeg) {
    if (!isValidNum(itemId) || !isValidNum(angleDeg)) return false;
    const d = ((Math.round(angleDeg) % 256) + 256) % 256;
    return sendArr([OP.PLACE, itemId, d, 0]);
  };

  protocol.equip = function (itemId) {
    if (!isValidNum(itemId)) return false;
    return sendArr([OP.EQUIP, itemId]);
  };

  /** Постройка — как клиент: только [25, id, angle, 0] (ручная постройка без [6]). */
  protocol.placeBuilding = function (itemId, angleDeg) {
    if (!isValidNum(itemId) || !isValidNum(angleDeg)) return false;
    return protocol.place(itemId, angleDeg);
  };

  /**
   * Веерная постройка (как oldscript AutoSpike): из направления взгляда
   * рассылаем `count` пакетов [25, id, (base - i) mod 255, 0], разворачивая дугой.
   * Это покрывает фронт даже если точный слот угла занят. Возвращает кол-во отправленных.
   */
  protocol.placeFan = function (itemId, baseAngleUint8, count) {
    if (!isValidNum(itemId) || !isValidNum(baseAngleUint8)) return 0;
    const n = isValidNum(count) && count > 0 ? Math.floor(count) : 1;
    const base = ((Math.round(baseAngleUint8) % 255) + 255) % 255;
    let sent = 0;
    for (let i = 0; i < n; i++) {
      const a = (((base - i) % 255) + 255) % 255;
      if (sendArr([OP.PLACE, itemId, a, 0])) sent++;
    }
    return sent;
  };

  protocol.move = function (mask) {
    if (!isValidNum(mask)) return false;
    return SM.net.send(new Uint8Array([OP.MOVE_BIN, mask & 0xff]));
  };

  // ---- пакеты для новых функций (через карту опкодов) -----------------------
  // Забрать содержимое постройки: [op, pid, iid]. iid в этом протоколе = unit.id
  // (как в oldscript: chest.iid=chest.id). slot ∈ takeChest|takeOven|takeFlour.
  protocol.takeFromUnit = function (slot, pid, iid) {
    const op = opcodes.get(slot);
    if (op == null || !isValidNum(pid) || !isValidNum(iid)) return false;
    return sendArr([op, pid, iid]);
  };

  // Экстрактор: [op, pid, iid, type].
  protocol.takeExtractor = function (pid, iid, type) {
    const op = opcodes.get('takeExtractor');
    if (op == null || !isValidNum(pid) || !isValidNum(iid) || !isValidNum(type)) return false;
    return sendArr([op, pid, iid, type]);
  };

  protocol.craft = function (itemId) {
    const op = opcodes.get('craft');
    if (op == null || !isValidNum(itemId)) return false;
    protocol.autoBookBeforeCraft();
    return sendArr([op, itemId]);
  };

  protocol.recycle = function (itemId) {
    const op = opcodes.get('recycle');
    if (op == null || !isValidNum(itemId)) return false;
    return sendArr([op, itemId]);
  };

  protocol.drop = function (itemId) {
    const op = opcodes.get('drop');
    if (op == null || !isValidNum(itemId)) return false;
    return sendArr([op, itemId]);
  };

  protocol._craftSelKey = null;
  protocol._learnedUseOp = null;
  let lastAutoBookAt = 0;

  function findCraftObject(user) {
    if (!user || typeof user !== 'object') return null;
    if (user.craft && typeof user.craft === 'object' && !Array.isArray(user.craft)) {
      return user.craft;
    }
    let keys;
    try { keys = Object.getOwnPropertyNames(user); } catch (_) { return null; }
    for (let i = 0; i < keys.length; i++) {
      let o;
      try { o = user[keys[i]]; } catch (_) { continue; }
      if (!o || typeof o !== 'object' || Array.isArray(o)) continue;
      if (Array.isArray(o.can_craft) && o.can_craft.length > 0) return o;
      let score = 0;
      let sub;
      try { sub = Object.getOwnPropertyNames(o); } catch (_) { continue; }
      for (let j = 0; j < sub.length; j++) {
        const v = o[sub[j]];
        if (typeof v === 'number' && v >= -1 && v <= 400) score++;
        if (Array.isArray(v) && v.length > 8) score += 2;
        if (sub[j] === 'crafting' || sub[j] === 'mode') score++;
      }
      if (score >= 3) return o;
    }
    return null;
  }

  /** Как oldscript перед PACKET_USE_ITEM: user.craft.<selected> = -1 */
  function resetCraftBeforeUse() {
    try {
      const user = window.__SV_USER__;
      const craft = findCraftObject(user);
      if (!craft) return;
      const ovr = window.__SV_VIS_KEYS__ && window.__SV_VIS_KEYS__.craft && window.__SV_VIS_KEYS__.craft.selected;
      if (typeof ovr === 'string' && Object.prototype.hasOwnProperty.call(craft, ovr)) {
        craft[ovr] = -1;
        protocol._craftSelKey = ovr;
        return;
      }
      if (protocol._craftSelKey && typeof craft[protocol._craftSelKey] === 'number') {
        craft[protocol._craftSelKey] = -1;
        return;
      }
      const keys = Object.getOwnPropertyNames(craft);
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (k === 'mode' || k === 'crafting') continue;
        const v = craft[k];
        if (typeof v === 'number' && v >= 0 && v <= 400) {
          protocol._craftSelKey = k;
          craft[k] = -1;
          return;
        }
      }
    } catch (_) {}
  }

  const USE_OP_SKIP = { 7: 1, 15: 1, 24: 1, 25: 1, 35: 1, 37: 1, 0x25: 1, 29: 1 };

  function isCraftOp(op) {
    if (typeof op !== 'number' || !Number.isFinite(op)) return false;
    const craft = opcodes.get('craft');
    if (craft != null && op === craft) return true;
    if (op === 21) return true;
    if (op === 22 && opcodes.get('useItem') !== 22) return true;
    return false;
  }

  /** Исходящий [op, recipeId] — craft (live: 21, legacy: 22). */
  protocol.isCraftPacket = function (v) {
    if (!Array.isArray(v) || v.length !== 2) return false;
    if (typeof v[0] !== 'number' || typeof v[1] !== 'number') return false;
    if (v[1] < 0 || v[1] > 500) return false;
    return isCraftOp(v[0]);
  };

  /** Опкоды [op,id], которые НЕ являются «съесть/выпить» (craft, drop, recycle…).
   *  ВАЖНО: equip (6) НЕ блокируем — на live это тот же опкод, что «использовать»
   *  (надеть книгу / съесть еду). Блокируем только то, что РЕАЛЬНО теряет предмет:
   *  drop и recycle (из-за них автофуд раньше выкидывал всю еду). */
  function isConsumeDenyOp(op) {
    if (typeof op !== 'number' || !Number.isFinite(op)) return true;
    if (isCraftOp(op)) return true;
    if (USE_OP_SKIP[op] || opcodes.SPAM[op]) return true;
    const drop = opcodes.get('drop');
    if (drop != null && op === drop) return true;
    if (op === opcodeDefaults.drop) return true;
    const recycle = opcodes.get('recycle');
    if (recycle != null && op === recycle) return true;
    if (op === opcodeDefaults.recycle) return true;
    return false;
  }

  function sanitizeUseItemOpcode() {
    const cur = opcodes.map.useItem;
    if (cur != null && isConsumeDenyOp(cur)) {
      opcodes.map.useItem = opcodeDefaults.useItem;
      opcodes.save();
    }
    if (protocol._learnedUseOp != null && isConsumeDenyOp(protocol._learnedUseOp)) {
      protocol._learnedUseOp = null;
    }
  }

  function learnConsumeOp(frame) {
    try {
      if (frame.text == null || frame.text.charCodeAt(0) !== 91) return;
      const v = JSON.parse(frame.text);
      if (!Array.isArray(v) || v.length !== 2) return;
      const op = v[0];
      const id = v[1];
      if (typeof op !== 'number' || typeof id !== 'number') return;
      if (isConsumeDenyOp(op)) return;
      const af = SM.features && SM.features.autoFood;
      const isBook = id === BOOK_ITEM_ID;
      if (!isBook && (!af || !af.isEdibleId || !af.isEdibleId(id))) return;
      protocol._learnedUseOp = op;
      if (opcodes.get('useItem') !== op) opcodes.set('useItem', op);
    } catch (_) {}
  }

  function bookUseOpcode() {
    sanitizeUseItemOpcode();
    const explicit = opcodes.get('useItem');
    if (explicit != null && !isConsumeDenyOp(explicit)) return explicit;
    return OP.USE_ITEM;
  }

  protocol.bookUseOpcode = bookUseOpcode;

  function consumeOpcode() {
    sanitizeUseItemOpcode();
    if (protocol._learnedUseOp != null && !isConsumeDenyOp(protocol._learnedUseOp)) {
      return protocol._learnedUseOp;
    }
    const explicit = opcodes.get('useItem');
    if (explicit != null && !isConsumeDenyOp(explicit)) return explicit;
    return OP.USE_ITEM;
  }

  protocol.consumeOpcode = consumeOpcode;

  protocol.useItem = function (itemId) {
    if (!isValidNum(itemId)) return false;
    return sendArr([consumeOpcode(), itemId]);
  };

  /** Съесть/выпить — сброс craft + [useItemOp, id] (как клиент). */
  protocol.consumeItem = function (itemId) {
    if (!isValidNum(itemId)) return false;
    resetCraftBeforeUse();
    return sendArr([consumeOpcode(), itemId]);
  };

  /** AutoBook: [useItem, BOOK] перед craft (oldscript + __SV_PRE_WS_SEND__). */
  protocol.autoBookBeforeCraft = function (ws, sendFn) {
    if (!SM.settings || !SM.settings.autoBook) return false;
    const now = performance.now();
    if (now - lastAutoBookAt < 80) return false;
    try {
      if (SM.features.autoFood && SM.features.autoFood.beforeCraft) {
        SM.features.autoFood.beforeCraft();
      }
      resetCraftBeforeUse();
      const useOp = bookUseOpcode();
      if (useOp == null) return false;
      const payload = JSON.stringify([useOp, BOOK_ITEM_ID]);
      lastAutoBookAt = now;
      if (typeof sendFn === 'function') {
        sendFn.call(ws, payload);
        return true;
      }
      return SM.net.send(payload);
    } catch (_) {
      return false;
    }
  };

  function installPreWsSendHook() {
    if (installPreWsSendHook.done) return;
    installPreWsSendHook.done = true;
    window.__SV_PRE_WS_SEND__ = function (ws, data) {
      try {
        if (!SM.settings || !SM.settings.autoBook) return;
        if (typeof data !== 'string' || data.charCodeAt(0) !== 91) return;
        const v = JSON.parse(data);
        if (!protocol.isCraftPacket(v)) return;
        const native = ws && ws.__starveNativeSend__;
        protocol.autoBookBeforeCraft(ws, typeof native === 'function' ? native : null);
      } catch (_) {}
    };
  }

  protocol.diagnoseAutoBook = function () {
    return {
      autoBook: !!SM.settings.autoBook,
      bookId: BOOK_ITEM_ID,
      craftOp: opcodes.get('craft'),
      useItemOp: bookUseOpcode(),
      consumeOp: consumeOpcode(),
      preHook: typeof window.__SV_PRE_WS_SEND__ === 'function',
      ws: !!(SM.net && SM.net.socket && SM.net.socket.readyState === 1),
      craftObj: !!findCraftObject(window.__SV_USER__),
    };
  };

  protocol.resetCraftBeforeUse = resetCraftBeforeUse;

  protocol.updateCamera = function () {
    const op = opcodes.get('updateCamera');
    if (op == null) return false;
    return sendArr([op]);
  };

  protocol.radToUint8 = function (rad) {
    if (!isValidNum(rad)) return null;
    return Math.round((rad / (Math.PI * 2)) * 256) & 0xff;
  };

  function angleFromScreen() {
    const canvas = document.querySelector('canvas');
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 8 || rect.height < 8) return null;
    const cx = rect.left + rect.width * 0.5;
    const cy = rect.top + rect.height * 0.5;
    const rad = Math.atan2(screenMouse.y - cy, screenMouse.x - cx);
    return protocol.radToUint8(rad);
  }

  protocol.getPlaceAngle = function () {
    if (isValidNum(protocol.lastAngle) && performance.now() - protocol.lastAngleAt <= 5000) {
      return protocol.lastAngle;
    }
    if (performance.now() - screenMouse.at <= 8000) {
      const fb = angleFromScreen();
      if (fb != null) return fb;
    }
    return null;
  };

  protocol.resolvePlaceId = function (category) {
    if (!SM.items) return null;
    return SM.items.pickPlaceId(category);
  };

  function onOut(frame) {
    try {
      if (frame.text == null) return;
      const v = JSON.parse(frame.text);
      if (!Array.isArray(v) || !v.length) return;

      if (v[0] === OP.MOUSE && isValidNum(v[1]) && isValidNum(v[2])) {
        protocol.lastMouse.x = v[1];
        protocol.lastMouse.y = v[2];
      } else if ((v[0] === OP.ANGLE || v[0] === OP.ANGLE_ALT) && isValidNum(v[1])) {
        protocol.lastAngle = v[1];
        protocol.lastAngleAt = performance.now();
      }
      learnConsumeOp(frame);
    } catch (_) {}
  }

  protocol.init = function () {
    if (protocol.bound) return;
    protocol.bound = true;
    opcodes.load();
    installPreWsSendHook();
    SM.bus.on('net:out', onOut);
    SM.bus.on('net:out', onCaptureFrame);
    window.addEventListener(
      'mousemove',
      function (e) {
        screenMouse.x = e.clientX;
        screenMouse.y = e.clientY;
        screenMouse.at = performance.now();
      },
      true
    );
  };

  SM.protocol = protocol;
})(window.__SM__ = window.__SM__ || {});


/* ===== src/net/api.js ===== */
/**
 * net/api.js — мост к нашему серверу через лоадер (GM_xmlhttpRequest).
 *
 * Зачем: код мода живёт в контексте страницы (https://starve.io). Прямой fetch к
 * нашему API (особенно на 127.0.0.1) блокируется Chrome (Local Network Access) и
 * CORS. Лоадер же работает в контексте юзерскрипта, где GM_xmlhttpRequest обходит
 * эти ограничения. Здесь — тонкий клиент: шлём запрос CustomEvent'ом, ждём ответ.
 */
;(function (SM) {
  'use strict';

  const REQ = 'starve-mod-api-req';
  const RES = 'starve-mod-api-res';
  const TIMEOUT_MS = 8000;

  function viaBridge(method, url, headers, body) {
    return new Promise(function (resolve) {
      const id = 'sm_' + Date.now() + '_' + Math.floor(Math.random() * 1e9);
      let done = false;

      function cleanup() {
        if (done) return;
        done = true;
        window.removeEventListener(RES, onRes);
      }

      function onRes(ev) {
        const d = ev && ev.detail;
        if (!d || d.id !== id) return;
        cleanup();
        resolve(d);
      }

      window.addEventListener(RES, onRes);
      try {
        window.dispatchEvent(
          new CustomEvent(REQ, {
            detail: { id: id, method: method, url: url, headers: headers || {}, body: body },
          })
        );
      } catch (e) {
        cleanup();
        resolve({ ok: false, error: String(e) });
        return;
      }
      setTimeout(function () {
        if (!done) {
          cleanup();
          resolve({ ok: false, error: 'timeout' });
        }
      }, TIMEOUT_MS);
    });
  }

  function parse(res) {
    if (!res || !res.ok) return null;
    try {
      return JSON.parse(res.text);
    } catch (_) {
      return null;
    }
  }

  SM.api = {
    getJson: function (url) {
      return viaBridge('GET', url, {}).then(parse);
    },
    postJson: function (url, obj) {
      return viaBridge('POST', url, { 'Content-Type': 'application/json' }, JSON.stringify(obj)).then(parse);
    },
  };
})(window.__SM__ = window.__SM__ || {});


/* ===== src/world/world.js ===== */
/**
 * world/world.js — модель мира + адаптер протокола.
 *
 * Источник данных (позиции игроков/мобов) приходит из net-кадров. Точный формат
 * протокола starve.io определяется снифером (Net-вкладка). Пока парсер не задан,
 * модель остаётся пустой, но API стабилен — combat-фичи работают поверх него.
 *
 * Чтобы «вооружить» модель после снифинга, достаточно задать парсер:
 *   window.__SM__.world.setParser(function (frame) { ... world.upsertEntity(...) });
 */
;(function (SM) {
  'use strict';

  const ENTITY_TTL_MS = 800; // запись считается устаревшей, если давно не обновлялась

  const world = {
    // Локальный игрок. В starve.io камера центрирована на игроке,
    // поэтому угол берётся от центра экрана к цели.
    me: { id: null, x: 0, y: 0, angle: 0, hp: null, known: false },
    entities: new Map(), // id -> { id, x, y, hp, team, kind, updatedAt }
    parser: null,
  };

  world.setParser = function (fn) {
    world.parser = typeof fn === 'function' ? fn : null;
    SM.log('world parser', world.parser ? 'set' : 'cleared');
  };

  world.setMe = function (data) {
    Object.assign(world.me, data, { known: true });
  };

  world.upsertEntity = function (e) {
    if (e == null || e.id == null) return;
    const prev = world.entities.get(e.id) || {};
    world.entities.set(e.id, Object.assign(prev, e, { updatedAt: performance.now() }));
  };

  world.removeEntity = function (id) {
    world.entities.delete(id);
  };

  world.clear = function () {
    world.entities.clear();
  };

  function isFresh(e, now) {
    return now - (e.updatedAt || 0) <= ENTITY_TTL_MS;
  }

  // Список живых записей, отсортированных по дистанции до игрока.
  world.nearby = function (filterFn) {
    const now = performance.now();
    const me = world.me;
    const out = [];
    world.entities.forEach(function (e) {
      if (!isFresh(e, now)) return;
      if (e.id === me.id) return;
      if (filterFn && !filterFn(e)) return;
      const dx = e.x - me.x;
      const dy = e.y - me.y;
      out.push({ entity: e, dist: Math.hypot(dx, dy), dx: dx, dy: dy });
    });
    out.sort(function (a, b) { return a.dist - b.dist; });
    return out;
  };

  // Ближайшая цель для аимбота (по умолчанию — любая чужая сущность).
  world.nearestTarget = function (filterFn) {
    const list = world.nearby(filterFn);
    return list.length ? list[0] : null;
  };

  SM.bus.on('net:in', function (frame) {
    if (!world.parser) return;
    try {
      world.parser(frame, world);
    } catch (err) {
      SM.warn('world parser error', err);
    }
  });

  SM.world = world;
})(window.__SM__ = window.__SM__ || {});


/* ===== src/input/input.js ===== */
/**
 * input/input.js — синтетические события мыши/клавиатуры для игрового canvas.
 * starve.io управляется мышью (направление = курсор) и кликом/клавишами.
 * Эти хелперы не зависят от протокола — работают сразу.
 */
;(function (SM) {
  'use strict';

  function canvas() {
    return document.getElementById('game_canvas');
  }

  function center() {
    const c = canvas();
    if (!c) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const r = c.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  // Радиус, на котором ставим виртуальный курсор от центра — направление важнее длины.
  const POINTER_RADIUS = 200;

  // Реальная позиция мыши пользователя (для авто-постройки по курсору).
  const realMouse = { x: 0, y: 0, known: false };
  window.addEventListener(
    'mousemove',
    function (e) {
      if (!e.isTrusted) return; // игнорируем наши синтетические события
      realMouse.x = e.clientX;
      realMouse.y = e.clientY;
      realMouse.known = true;
    },
    true
  );

  // Виртуальный курсор аимбота — точка, куда «смотрит» прицел.
  const virtualPointer = { x: 0, y: 0, valid: false };

  function fireMouse(type, clientX, clientY, button) {
    const c = canvas();
    if (!c || !isFinite(clientX) || !isFinite(clientY)) return;
    const down = type === 'mousedown' || type === 'pointerdown';
    const opts = {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: clientX,
      clientY: clientY,
      screenX: clientX,
      screenY: clientY,
      button: button || 0,
      buttons: down ? 1 : 0,
    };
    // Дублируем mouse- и pointer-события: клиент может слушать любые.
    c.dispatchEvent(new MouseEvent(type, opts));
    const ptype = type.replace('mouse', 'pointer');
    if (ptype !== type && window.PointerEvent) {
      try {
        c.dispatchEvent(new PointerEvent(ptype, Object.assign({ pointerId: 1, isPrimary: true, pointerType: 'mouse' }, opts)));
      } catch (_) {}
    }
  }

  const CODE_INFO = {
    Digit0: [48, '0'], Digit1: [49, '1'], Digit2: [50, '2'], Digit3: [51, '3'], Digit4: [52, '4'],
    Digit5: [53, '5'], Digit6: [54, '6'], Digit7: [55, '7'], Digit8: [56, '8'], Digit9: [57, '9'],
    KeyQ: [81, 'q'], KeyW: [87, 'w'], KeyE: [69, 'e'], KeyR: [82, 'r'], KeyF: [70, 'f'], KeyG: [71, 'g'],
    KeyV: [86, 'v'], KeyZ: [90, 'z'], KeyX: [88, 'x'], KeyC: [67, 'c'], Space: [32, ' '],
  };

  function defineKeyProps(ev, code, keyCode) {
    try {
      Object.defineProperty(ev, 'keyCode', { get: function () { return keyCode; } });
      Object.defineProperty(ev, 'which', { get: function () { return keyCode; } });
      Object.defineProperty(ev, 'charCode', { get: function () { return keyCode; } });
      Object.defineProperty(ev, 'code', { get: function () { return code; } });
    } catch (_) {}
  }

  SM.input = {
    center: center,

    // Угол (рад) -> позиция виртуального курсора аимбота относительно центра.
    aimAngle: function (angle) {
      const cen = center();
      virtualPointer.x = cen.x + Math.cos(angle) * POINTER_RADIUS;
      virtualPointer.y = cen.y + Math.sin(angle) * POINTER_RADIUS;
      virtualPointer.valid = true;
      fireMouse('mousemove', virtualPointer.x, virtualPointer.y);
    },

    // Удержание атаки в направлении прицела аимбота (а не в центр!).
    pressMouse: function () {
      const p = virtualPointer.valid ? virtualPointer : center();
      fireMouse('mousedown', p.x, p.y, 0);
    },
    releaseMouse: function () {
      const p = virtualPointer.valid ? virtualPointer : center();
      fireMouse('mouseup', p.x, p.y, 0);
    },

    // Клик в точке реального курсора пользователя (авто-постройка по курсору).
    clickAtCursor: function () {
      const p = realMouse.known ? realMouse : center();
      fireMouse('mousemove', p.x, p.y);
      fireMouse('mousedown', p.x, p.y, 0);
      fireMouse('mouseup', p.x, p.y, 0);
    },

    key: function (code, down) {
      const info = CODE_INFO[code] || [0, code];
      const keyCode = info[0];
      const keyChar = info[1];
      function make() {
        const ev = new KeyboardEvent(down ? 'keydown' : 'keyup', {
          bubbles: true,
          cancelable: true,
          view: window,
          key: keyChar,
          code: code,
        });
        defineKeyProps(ev, code, keyCode);
        return ev;
      }
      document.dispatchEvent(make());
      window.dispatchEvent(make());
    },

    tapKey: function (code) {
      SM.input.key(code, true);
      SM.input.key(code, false);
    },

    // Одиночный диспатч клавиши ТОЛЬКО на document (всплывает и до window-слушателей
    // игры). В отличие от key() не дублируется на window — значит игра получает
    // ровно ОДНО событие (важно для тогл-хоткеев вроде автофуда на R). События
    // синтетические (isTrusted=false) — бинды мода их игнорируют (см. ui/binds.js).
    keyOnce: function (code, down) {
      const info = CODE_INFO[code] || [0, code];
      const ev = new KeyboardEvent(down ? 'keydown' : 'keyup', {
        bubbles: true,
        cancelable: true,
        view: window,
        key: info[1],
        code: code,
      });
      defineKeyProps(ev, code, info[0]);
      document.dispatchEvent(ev);
    },

    // Полное «нажатие» клавиши для игрового хоткея: keydown+keyup, один тогл.
    tapGameKey: function (code) {
      SM.input.keyOnce(code, true);
      SM.input.keyOnce(code, false);
    },
  };
})(window.__SM__ = window.__SM__ || {});


/* ===== src/ui/drag.js ===== */
/**
 * ui/drag.js — хелпер перетаскивания для кнопки и панели меню.
 */
;(function (SM) {
  'use strict';

  function makeDraggable(el, handle, options) {
    const opts = options || {};
    const threshold = opts.threshold != null ? opts.threshold : 0;
    let active = false;
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let origLeft = 0;
    let origTop = 0;

    handle.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      if (opts.ignore && opts.ignore(e.target)) return;
      active = true;
      dragging = false;
      startX = e.clientX;
      startY = e.clientY;
      const rect = el.getBoundingClientRect();
      origLeft = rect.left;
      origTop = rect.top;
      e.preventDefault();
    });

    window.addEventListener('mousemove', function (e) {
      if (!active) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (!dragging && Math.hypot(dx, dy) < threshold) return;
      if (!dragging) {
        dragging = true;
        el.style.right = 'auto';
        el.style.bottom = 'auto';
        el.style.left = origLeft + 'px';
        el.style.top = origTop + 'px';
        handle.style.cursor = 'grabbing';
      }
      let left = origLeft + dx;
      let top = origTop + dy;
      const pad = 4;
      left = Math.max(pad, Math.min(left, window.innerWidth - el.offsetWidth - pad));
      top = Math.max(pad, Math.min(top, window.innerHeight - el.offsetHeight - pad));
      el.style.left = left + 'px';
      el.style.top = top + 'px';
    });

    window.addEventListener('mouseup', function () {
      if (!active) return;
      const wasDrag = dragging;
      active = false;
      dragging = false;
      handle.style.cursor = opts.cursor || '';
      if (!wasDrag && opts.onClick) opts.onClick();
      if (wasDrag && opts.onDrop) {
        const rect = el.getBoundingClientRect();
        opts.onDrop(Math.round(rect.left), Math.round(rect.top));
      }
    });
  }

  SM.ui = SM.ui || {};
  SM.ui.makeDraggable = makeDraggable;
})(window.__SM__ = window.__SM__ || {});


/* ===== src/ui/overlay.js ===== */
/**
 * ui/overlay.js — FPS / Ping оверлей. Без canvas-хука (drawImage ломал клиент).
 * Фиксированная позиция от правого верхнего угла canvas.
 */
;(function (SM) {
  'use strict';

  const LAYOUT = {
    right: 295,
    top: 233,
  };

  let root = null;
  const lines = {};

  function ensureRoot() {
    if (root) return root;
    root = document.createElement('div');
    root.id = 'starve-mod-overlay';
    root.style.cssText =
      'position:fixed;display:none;z-index:2147483640;pointer-events:none;' +
      'font-family:"Baloo Paaji",-apple-system,sans-serif;font-weight:400;' +
      'color:#fff;letter-spacing:.02em;white-space:nowrap;line-height:1.15;' +
      'text-align:right;font-size:18px;' +
      'text-shadow:0 1px 2px rgba(0,0,0,.85),0 0 6px rgba(0,0,0,.5);' +
      '-webkit-font-smoothing:antialiased;';
    document.body.appendChild(root);
    window.addEventListener('resize', reposition);
    requestAnimationFrame(loop);
    return root;
  }

  function anyVisible() {
    for (const k in lines) if (lines[k].visible) return true;
    return false;
  }

  function reposition() {
    if (!root || !anyVisible()) {
      if (root) root.style.display = 'none';
      return;
    }
    const canvas = document.getElementById('game_canvas');
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 100 || rect.height < 100) {
      root.style.display = 'none';
      return;
    }

    root.style.left = Math.round(rect.right - LAYOUT.right - root.offsetWidth) + 'px';
    root.style.top = Math.round(rect.top + LAYOUT.top) + 'px';
    root.style.right = 'auto';
    root.style.display = 'block';
  }

  function loop() {
    reposition();
    requestAnimationFrame(loop);
  }

  SM.ui = SM.ui || {};
  SM.ui.overlay = {
    line: function (key, order) {
      ensureRoot();
      if (!lines[key]) {
        const el = document.createElement('div');
        el.dataset.key = key;
        el.style.order = order || 0;
        el.style.display = 'none';
        root.appendChild(el);
        root.style.display = 'flex';
        root.style.flexDirection = 'column';
        root.style.alignItems = 'flex-end';
        lines[key] = { el: el, visible: false };
      }
      const entry = lines[key];
      return {
        set: function (text) { entry.el.textContent = text; },
        show: function (on) {
          entry.visible = !!on;
          entry.el.style.display = on ? 'block' : 'none';
          reposition();
        },
      };
    },
    reposition: reposition,
  };
})(window.__SM__ = window.__SM__ || {});


/* ===== src/ui/active-binds.js ===== */
/**
 * ui/active-binds.js — индикатор активных биндов в левом нижнем углу.
 * Каждый активный бинд — аккуратный «бейдж» (точка-акцент + подпись), а не
 * голый текст. Поллит реальное состояние фич через rAF и привязан к canvas.
 */
;(function (SM) {
  'use strict';

  // Порядок строк снизу вверх. Подписи и акцентные цвета на каждый бинд.
  const ITEMS = [
    { name: 'aimbot', label: 'Aimbot', color: '#ff5a5f' },
    { name: 'autoSpike', label: 'Auto Spike', color: '#ffb020' },
    { name: 'autoWall', label: 'Auto Wall', color: '#3ddc97' },
    { name: 'autofarm', label: 'AutoFarm', color: '#ffd54f' },
    { name: 'wormFarm', label: 'Worm Farm', color: '#fdcb6e' },
    { name: 'autosteal', label: 'Autosteal', color: '#c084fc' },
    { name: 'autobuild', label: 'Autobuild', color: '#60a5fa' },
    { name: 'autofire', label: 'AutoFire', color: '#fb923c' },
    { name: 'autocraft', label: 'AutoCraft', color: '#34d399' },
    { name: 'autorecycle', label: 'AutoRecycle', color: '#2dd4bf' },
    { name: 'spectator', label: 'Spectator', color: '#a3e635' },
    { name: 'xray', label: 'Xray', color: '#f472b6' },
  ];

  const EXTRA_SET = { autosteal: 1, autobuild: 1, autofire: 1, autocraft: 1, autorecycle: 1, spectator: 1, xray: 1 };

  const MARGIN = { left: 16, bottom: 16 };
  const STYLE_ID = 'starve-mod-active-binds-style';

  let root = null;
  const badges = {};

  function isOn(name) {
    if (name === 'aimbot') {
      return !!(SM.features && SM.features.aimbot && SM.features.aimbot.isActive && SM.features.aimbot.isActive());
    }
    if (EXTRA_SET[name]) {
      return !!(SM.features && SM.features.extra && SM.features.extra.isActive && SM.features.extra.isActive(name));
    }
    return !!(SM.features && SM.features.combat && SM.features.combat.isActive && SM.features.combat.isActive(name));
  }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const st = document.createElement('style');
    st.id = STYLE_ID;
    st.textContent =
      '#starve-mod-active-binds{position:fixed;z-index:2147483640;pointer-events:none;' +
      'display:none;flex-direction:column;align-items:flex-start;gap:7px;}' +
      '.sm-ab-badge{display:inline-flex;align-items:center;gap:9px;' +
      'padding:6px 13px 6px 11px;border-radius:10px;' +
      'background:linear-gradient(180deg,rgba(24,27,34,.82),rgba(16,18,23,.82));' +
      'border:1px solid rgba(255,255,255,.10);' +
      'box-shadow:0 4px 14px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.06);' +
      '-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);' +
      'font-family:"Baloo Paaji",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;' +
      'font-weight:600;font-size:14px;line-height:1;letter-spacing:.3px;' +
      'color:#f4f6fb;text-shadow:0 1px 2px rgba(0,0,0,.5);white-space:nowrap;' +
      'transform:translateX(-6px);opacity:0;' +
      'transition:opacity .14s ease,transform .14s ease;}' +
      '.sm-ab-badge.sm-ab-on{opacity:1;transform:translateX(0);}' +
      '.sm-ab-dot{width:9px;height:9px;border-radius:50%;flex:0 0 auto;' +
      'box-shadow:0 0 7px currentColor;animation:sm-ab-pulse 1.25s ease-in-out infinite;}' +
      '@keyframes sm-ab-pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.45;transform:scale(.78);}}';
    (document.head || document.documentElement).appendChild(st);
  }

  function ensureRoot() {
    if (root) return root;
    injectStyle();

    root = document.createElement('div');
    root.id = 'starve-mod-active-binds';

    for (let i = 0; i < ITEMS.length; i++) {
      const it = ITEMS[i];
      const badge = document.createElement('div');
      badge.className = 'sm-ab-badge';
      badge.style.order = i;
      badge.style.display = 'none';

      const dot = document.createElement('span');
      dot.className = 'sm-ab-dot';
      dot.style.color = it.color;
      dot.style.background = it.color;

      const text = document.createElement('span');
      text.textContent = it.label;

      badge.appendChild(dot);
      badge.appendChild(text);
      root.appendChild(badge);
      badges[it.name] = badge;
    }

    document.body.appendChild(root);
    window.addEventListener('resize', reposition);
    requestAnimationFrame(loop);
    return root;
  }

  function refreshBadges() {
    let any = false;
    for (let i = 0; i < ITEMS.length; i++) {
      const name = ITEMS[i].name;
      const on = isOn(name);
      if (on) any = true;
      const badge = badges[name];
      if (!badge) continue;
      badge.style.display = on ? 'inline-flex' : 'none';
      if (on) badge.classList.add('sm-ab-on');
      else badge.classList.remove('sm-ab-on');
    }
    return any;
  }

  function reposition() {
    if (!root) return;
    const any = refreshBadges();
    if (!any) { root.style.display = 'none'; return; }

    const canvas = document.getElementById('game_canvas');
    if (!canvas) { root.style.display = 'none'; return; }
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 100 || rect.height < 100) { root.style.display = 'none'; return; }

    root.style.display = 'flex';
    root.style.left = Math.round(rect.left + MARGIN.left) + 'px';
    root.style.top = Math.round(rect.bottom - MARGIN.bottom - root.offsetHeight) + 'px';
  }

  function loop() {
    reposition();
    requestAnimationFrame(loop);
  }

  SM.ui = SM.ui || {};
  SM.ui.activeBinds = {
    init: function () {
      ensureRoot();
    },
  };
})(window.__SM__ = window.__SM__ || {});


/* ===== src/ui/binds.js ===== */
/**
 * ui/binds.js — менеджер горячих клавиш (hold/toggle/press) и захват переназначения.
 *
 * Категории биндов:
 *   COMBAT_BINDS   — aimbot/autoSpike/autoWall (как было; имеют active-состояние);
 *   EXTRA_TOGGLE   — autosteal/autobuild/autofire/spectator/autocraft/autorecycle/xray
 *                    (toggle/hold, имеют active-состояние, живут в features.extra);
 *   PRESS_BINDS    — dropSword/hideScript (одноразовое действие по нажатию).
 *
 * Тумблер в меню (SM.settings[name]) = «разрешение» бинда; клавиша активирует/
 * триггерит. Для toggle/hold нужен включённый тумблер. Для press — тоже (чтобы
 * можно было отключить клавишу).
 */
;(function (SM) {
  'use strict';

  const COMBAT_BINDS = ['aimbot', 'autoSpike', 'autoWall', 'autofarm', 'wormFarm'];
  const EXTRA_TOGGLE = ['autosteal', 'autobuild', 'autofire', 'spectator', 'autocraft', 'autorecycle', 'xray'];
  const PRESS_BINDS = ['dropSword', 'hideScript'];

  // Бинды с active-состоянием (toggle/hold).
  const FEATURE_BINDS = COMBAT_BINDS.concat(EXTRA_TOGGLE);
  // Все управляемые бинды (для рендера/обработки).
  const ALL_BINDS = FEATURE_BINDS.concat(PRESS_BINDS);

  const toggledState = Object.create(null);
  FEATURE_BINDS.forEach(function (n) { toggledState[n] = false; });

  let capturing = null; // { name, done }

  function isTypingTarget(e) {
    const t = e.target;
    if (t) {
      const tag = t.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable) return true;
    }
    // Shadow DOM: target снаружи = host, реальный input — в composedPath / activeElement.
    if (e.composedPath) {
      for (let i = 0; i < e.composedPath.length; i++) {
        const n = e.composedPath[i];
        if (!n || !n.tagName) continue;
        const tag = n.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || n.isContentEditable) return true;
      }
    }
    const guiShadow = SM.ui.guiShadow;
    if (guiShadow) {
      const ae = guiShadow.activeElement;
      if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.tagName === 'SELECT')) return true;
    }
    return false;
  }

  function findBind(code) {
    for (const name in SM.binds) {
      if (SM.binds[name] === code) return name;
    }
    return null;
  }

  function isExtra(name) { return EXTRA_TOGGLE.indexOf(name) >= 0; }
  function isPress(name) { return PRESS_BINDS.indexOf(name) >= 0; }
  function isFeature(name) { return FEATURE_BINDS.indexOf(name) >= 0; }

  // Маршрутизация активации feature-бинда (toggle/hold).
  function setFeature(name, on) {
    if (name === 'aimbot') {
      if (SM.features.aimbot) SM.features.aimbot.setActive(on);
      return;
    }
    if (name === 'autoSpike' || name === 'autoWall' || name === 'autofarm' || name === 'wormFarm') {
      SM.features.combat.setActive(name, on);
      return;
    }
    if (isExtra(name)) {
      if (on && !SM.settings[name]) {
        SM.warn(name + ': включи тумблер в меню → Binds → ' + name);
        return;
      }
      if (SM.features.extra) SM.features.extra.setActive(name, on);
    }
  }

  function onKeyDown(e) {
    // Игнорируем синтетические (нетрастед) клавиши — их шлёт сам мод (напр. автофуд
    // на R через SM.input.tapGameKey). Иначе наше нажатие дёргало бы бинд autofire.
    if (e.isTrusted === false) return;
    if (capturing) {
      e.preventDefault();
      e.stopPropagation();
      const code = e.code;
      const target = capturing;
      capturing = null;
      if (code !== 'Escape') {
        SM.binds[target.name] = code;
        SM.storage.save();
      }
      target.done(code === 'Escape' ? null : code);
      return;
    }

    if (isTypingTarget(e)) return;
    if (e.repeat) return;

    const name = findBind(e.code);
    if (!name) return;

    if (name === 'toggleMenu') {
      e.preventDefault();
      SM.bus.emit('ui:toggleMenu');
      return;
    }

    // Одноразовые действия (press): срабатывают на нажатии.
    if (isPress(name)) {
      if (!SM.settings[name]) return; // тумблер выключен → клавиша неактивна
      e.preventDefault();
      e.stopPropagation();
      if (SM.features.extra) SM.features.extra.trigger(name);
      return;
    }

    if (isFeature(name)) {
      e.preventDefault();
      e.stopPropagation();
      const mode = SM.bindMode[name] || 'hold';
      if (mode === 'toggle') {
        toggledState[name] = !toggledState[name];
        setFeature(name, toggledState[name]);
      } else {
        setFeature(name, true);
      }
    }
  }

  function onKeyUp(e) {
    if (e.isTrusted === false) return;
    if (isTypingTarget(e)) return;
    const name = findBind(e.code);
    if (!name || !isFeature(name)) return;
    if ((SM.bindMode[name] || 'hold') === 'hold') {
      setFeature(name, false);
    }
  }

  SM.ui = SM.ui || {};
  SM.ui.binds = {
    combatBinds: COMBAT_BINDS,
    extraToggleBinds: EXTRA_TOGGLE,
    pressBinds: PRESS_BINDS,
    featureBinds: FEATURE_BINDS,
    allBinds: ALL_BINDS,
    init: function () {
      window.addEventListener('keydown', onKeyDown, true);
      window.addEventListener('keyup', onKeyUp, true);
    },
    // Захватить следующую нажатую клавишу для bind `name`.
    startRebind: function (name, done) {
      capturing = { name: name, done: done };
    },
    // Если функцию выключили тумблером — сбрасываем активность/toggle.
    onSettingChanged: function (name) {
      if (isFeature(name) && !SM.settings[name]) {
        toggledState[name] = false;
        setFeature(name, false);
      }
    },
  };
})(window.__SM__ = window.__SM__ || {});


/* ===== src/features/fps.js ===== */
/**
 * features/fps.js — счётчик FPS в HUD. Тумблер: Visual → Show FPS.
 */
;(function (SM) {
  'use strict';

  let line = null;
  let frames = 0;
  let lastTime = 0;
  let rafId = 0;
  let running = false;

  function tick(now) {
    if (!running) return;
    frames++;
    if (now - lastTime >= 500) {
      line.set(Math.round((frames * 1000) / (now - lastTime)) + ' FPS');
      frames = 0;
      lastTime = now;
    }
    rafId = requestAnimationFrame(tick);
  }

  SM.features = SM.features || {};
  SM.features.fps = {
    init: function () {
      line = SM.ui.overlay.line('fps', 0);
      this.setVisible(SM.settings.showFps);
    },
    setVisible: function (on) {
      running = !!on;
      if (!line) return;
      line.show(running);
      cancelAnimationFrame(rafId);
      if (running) {
        frames = 0;
        lastTime = performance.now();
        line.set('… FPS');
        rafId = requestAnimationFrame(tick);
      }
      SM.log('fps overlay', running ? 'ON' : 'OFF');
    },
  };
})(window.__SM__ = window.__SM__ || {});


/* ===== src/features/ping.js ===== */
/**
 * features/ping.js — RTT в HUD (Visual → Show Ping).
 *
 * Только ping [6] → первый ответ сервера (как vanilla). Очередь out/in убрана:
 * craft/equip/еда давали ложные 130–200 ms на активных серверах (FF).
 */
;(function (SM) {
  'use strict';

  const PING_INTERVAL = 2500;
  const PING_TIMEOUT = 3500;
  const SAMPLE_CAP = 24;
  const PING_OP = 6;

  let line = null;
  let visible = false;
  let timerId = 0;
  let lastPingSentAt = 0;
  let pendingPingAt = 0;
  let lastSocket = null;
  const samples = [];

  function addSample(rtt) {
    if (!Number.isFinite(rtt) || rtt < 4 || rtt > 4000) return;
    samples.push(rtt);
    while (samples.length > SAMPLE_CAP) samples.shift();
  }

  function medianMs() {
    if (!samples.length) return 0;
    const sorted = samples.slice().sort(function (a, b) { return a - b; });
    const mid = Math.floor((sorted.length - 1) * 0.5);
    return Math.round(sorted[mid]);
  }

  function render() {
    if (!line) return;
    const ms = medianMs();
    line.set(ms > 0 ? ms + ' ms' : '… ms');
  }

  function pingOpcode() {
    if (SM.opcodes && typeof SM.opcodes.get === 'function') {
      const v = SM.opcodes.get('ping');
      if (v != null) return v;
    }
    return PING_OP;
  }

  function resetOnSocket(ws) {
    if (ws === lastSocket) return;
    lastSocket = ws;
    samples.length = 0;
    pendingPingAt = 0;
    lastPingSentAt = 0;
  }

  function sendPing() {
    const ws = SM.net.socket;
    if (!ws || ws.readyState !== 1) return;
    resetOnSocket(ws);

    const now = performance.now();
    if (pendingPingAt > 0 && now - pendingPingAt > PING_TIMEOUT) pendingPingAt = 0;
    if (pendingPingAt > 0) return;
    if (now - lastPingSentAt < PING_INTERVAL) return;

    lastPingSentAt = now;
    pendingPingAt = now;
    SM.net.send(JSON.stringify([pingOpcode()]));
  }

  function parseText(data) {
    try {
      if (typeof data !== 'string' || data.charCodeAt(0) !== 91 /* [ */) return null;
      return JSON.parse(data);
    } catch (_) {
      return null;
    }
  }

  function isPingEcho(data) {
    const v = parseText(data);
    return !!(v && Array.isArray(v) && v.length === 1 && v[0] === pingOpcode());
  }

  /** Любой входящий кадр после ping — vanilla меряет RTT до следующего ответа сервера. */
  function isPongCandidate(frame) {
    if (isPingEcho(frame.text)) return true;
    if (frame.bytes && frame.bytes.length > 0) return true;
    const v = parseText(frame.text);
    if (v && Array.isArray(v) && v.length) return true;
    return false;
  }

  function onIn(frame) {
    if (pendingPingAt <= 0) return;
    if (!isPongCandidate(frame)) return;

    const rtt = frame.at - pendingPingAt;
    pendingPingAt = 0;
    addSample(rtt);
    if (visible) render();
  }

  function tick() {
    if (!visible) return;
    SM.net.ensureInstalled();
    sendPing();
    timerId = window.setTimeout(tick, 300);
  }

  SM.features = SM.features || {};
  SM.features.ping = {
    init: function () {
      line = SM.ui.overlay.line('ping', 1);
      SM.bus.on('net:in', onIn);
      this.setVisible(SM.settings.showPing);
    },
    setVisible: function (on) {
      visible = !!on;
      clearTimeout(timerId);
      if (visible) {
        SM.net.ensureInstalled();
        resetOnSocket(SM.net.socket);
        timerId = window.setTimeout(tick, 300);
        render();
      } else if (line) {
        line.show(false);
      }
      if (line) line.show(visible);
      SM.log('ping overlay', visible ? 'ON' : 'OFF');
    },
  };
})(window.__SM__ = window.__SM__ || {});


/* ===== src/features/weather-info.js ===== */
/**
 * features/weather-info.js — индикатор бури/песчаной бури в HUD (как NVX / oldscript).
 * В ваниле иконка видна только в биоме; здесь показываем по глобальному флагу
 * user.<weather>.<flag> === 1, даже если игрок не в зиме/пустыне.
 * Всегда включено, без пункта в меню.
 */
;(function (SM) {
  'use strict';

  const IMG = {
    blizzard: 'https://cdn.jsdelivr.net/gh/XmreLoux/images@main/blizzard.png',
    sandstorm: 'https://cdn.jsdelivr.net/gh/XmreLoux/images@main/sandstorm.png',
  };

  const ICON_H = 52;
  const ICON_GAP = 6;
  const RESOLVE_MS = 5000;
  // Иконки бурь ставим СЛЕВА от блока FPS/Ping (#starve-mod-overlay). GAP — зазор
  // в CSS-px между правым краем иконок и левым краем FPS/Ping.
  // FALLBACK — запасная позиция от правого верхнего угла canvas, если оверлей
  // FPS/Ping скрыт (показатели выключены). Совпадает с якорем оверлея (right:295).
  const GAP = 14;
  const FALLBACK = { right: 360, top: 233 };

  // Длительность бури сервером игры не передаётся (приходит только флаг 0/1).
  // Замеряем сами; завершённые бури шлём на наш сервер (агрегат по всем юзерам),
  // а при старте тянем глобальное среднее — новый игрок сразу видит оценку.
  // localStorage — лишь кэш (фолбэк, если сервер недоступен).
  const STORE_PREFIX = 'starve-mod:storm-avg:';
  const SERVER_CACHE_KEY = 'starve-mod:storm-server';
  const AVG_WINDOW = 6;
  const MIN_VALID_MS = 5000;

  const API_BASE =
    (typeof window !== 'undefined' && window.__SM_API_BASE__
      ? String(window.__SM_API_BASE__)
      : ''
    ).replace(/\/+$/, '');

  // Глобальная статистика с сервера: { blizzard:{avg,count}, sandstorm:{avg,count} }.
  let serverStats = { blizzard: { avg: 0, count: 0 }, sandstorm: { avg: 0, count: 0 } };

  let root = null;
  let blizzardEl = null;
  let sandstormEl = null;
  let refs = null;
  let refsAt = 0;
  let rafId = 0;

  const timers = {
    blizzard: { active: false, startedAt: 0, samples: null },
    sandstorm: { active: false, startedAt: 0, samples: null },
  };

  function resolveUser() {
    try {
      if (window.__SV_USER__ && typeof window.__SV_USER__ === 'object') return window.__SV_USER__;
    } catch (_) {}
    return null;
  }

  function isWeatherCandidate(o) {
    if (!o || typeof o !== 'object' || Array.isArray(o)) return null;
    let hasArr = false;
    let hasAdd = false;
    let fnSrcLen = 0;
    let flagKey = null;
    const keys = Object.getOwnPropertyNames(o);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      let v;
      try {
        v = o[k];
      } catch (_) {
        continue;
      }
      if (Array.isArray(v)) hasArr = true;
      if (typeof v === 'function') {
        try {
          fnSrcLen += Function.prototype.toString.call(v).length;
        } catch (_) {}
        if (k === 'add') hasAdd = true;
      }
      if (flagKey == null && (v === 0 || v === 1)) flagKey = k;
    }
    if (!hasArr || !hasAdd || flagKey == null) return null;
    return { obj: o, flagKey: flagKey, fnSrcLen: fnSrcLen };
  }

  // Якорь иконок = объект user с { enabled, translate:{x,y} }, БЕЗ массива частиц
  // (это не погода) и с самой длинной суммой исходников функций — так выделяем
  // нужный HUD-элемент (у него громоздкая функция автофида) среди нескольких
  // объектов с translate (есть и другие, напр. версия/иконка ниже).
  function findHudTranslate(user) {
    const keys = Object.getOwnPropertyNames(user);
    let best = null;
    let bestScore = -1;
    for (let i = 0; i < keys.length; i++) {
      let v;
      try {
        v = user[keys[i]];
      } catch (_) {
        continue;
      }
      if (!v || typeof v !== 'object' || Array.isArray(v)) continue;
      const t = v.translate;
      if (!t || typeof t.x !== 'number' || typeof t.y !== 'number') continue;
      if (!('enabled' in v)) continue;

      let fnLen = 0;
      let hasArr = false;
      const ks = Object.getOwnPropertyNames(v);
      for (let j = 0; j < ks.length; j++) {
        let vv;
        try {
          vv = v[ks[j]];
        } catch (_) {
          continue;
        }
        if (Array.isArray(vv)) {
          hasArr = true;
          break;
        }
        if (typeof vv === 'function') {
          try {
            fnLen += Function.prototype.toString.call(vv).length;
          } catch (_) {}
        }
      }
      if (hasArr) continue;
      if (fnLen > bestScore) {
        bestScore = fnLen;
        best = t;
      }
    }
    return best;
  }

  function resolveRefs() {
    const user = resolveUser();
    if (!user) return null;

    const weather = [];
    const keys = Object.getOwnPropertyNames(user);
    for (let i = 0; i < keys.length; i++) {
      let v;
      try {
        v = user[keys[i]];
      } catch (_) {
        continue;
      }
      const cand = isWeatherCandidate(v);
      if (cand) weather.push(cand);
    }
    const out = { hud: findHudTranslate(user), blizzard: null, sandstorm: null };
    if (!resolveRefs._logged) {
      resolveRefs._logged = true;
      SM.log(
        'weather-info: refs — hud:',
        out.hud ? 'found' : 'NOT found (fallback)',
        '| weather objs:',
        weather.length,
        out.hud || ''
      );
    }
    if (weather.length < 2) return out;

    // Метель и песчаная буря — два объекта одной формы. Апдейт частиц метели
    // реагирует на движение игрока (больше веток) и потому длиннее.
    weather.sort(function (a, b) {
      return b.fnSrcLen - a.fnSrcLen;
    });
    out.blizzard = weather[0];
    out.sandstorm = weather[1];
    return out;
  }

  function getRefs() {
    const now = Date.now();
    if (!refs || now - refsAt > RESOLVE_MS) {
      refs = resolveRefs();
      refsAt = now;
    }
    return refs;
  }

  function stormOn(entry) {
    if (!entry) return false;
    try {
      return entry.obj[entry.flagKey] === 1;
    } catch (_) {
      return false;
    }
  }

  function loadSamples(type) {
    if (timers[type].samples) return timers[type].samples;
    let arr = [];
    try {
      const raw = window.localStorage.getItem(STORE_PREFIX + type);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) arr = parsed.filter(function (n) { return typeof n === 'number' && n > 0; });
      }
    } catch (_) {}
    timers[type].samples = arr;
    return arr;
  }

  function pushSample(type, ms) {
    const arr = loadSamples(type);
    arr.push(ms);
    while (arr.length > AVG_WINDOW) arr.shift();
    try {
      window.localStorage.setItem(STORE_PREFIX + type, JSON.stringify(arr));
    } catch (_) {}
  }

  function loadServerCache() {
    try {
      const raw = window.localStorage.getItem(SERVER_CACHE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      ['blizzard', 'sandstorm'].forEach(function (t) {
        if (parsed[t] && typeof parsed[t].avg === 'number' && typeof parsed[t].count === 'number') {
          serverStats[t] = { avg: parsed[t].avg, count: parsed[t].count };
        }
      });
    } catch (_) {}
  }

  function applyServerStats(data) {
    if (!data || typeof data !== 'object') return;
    ['blizzard', 'sandstorm'].forEach(function (t) {
      if (data[t] && typeof data[t].avg === 'number' && typeof data[t].count === 'number') {
        serverStats[t] = { avg: data[t].avg, count: data[t].count };
      }
    });
    try {
      window.localStorage.setItem(SERVER_CACHE_KEY, JSON.stringify(serverStats));
    } catch (_) {}
  }

  function fetchServerStats() {
    if (!API_BASE || !SM.api) return;
    SM.api.getJson(API_BASE + '/api/storm-stats').then(function (data) {
      if (data) {
        applyServerStats(data);
        SM.log('weather-info: server stats', serverStats);
      }
    });
  }

  function reportDuration(type, ms) {
    if (!API_BASE || !SM.api) return;
    SM.api.postJson(API_BASE + '/api/storm-report', { type: type, ms: ms }).then(function (data) {
      if (data) applyServerStats(data);
    });
  }

  // Оценка средней длительности: смешиваем глобальную статистику сервера и
  // локальные замеры по их количеству (взвешенное среднее).
  function avgDuration(type) {
    const arr = loadSamples(type);
    let localSum = 0;
    for (let i = 0; i < arr.length; i++) localSum += arr[i];
    const localCount = arr.length;

    const srv = serverStats[type] || { avg: 0, count: 0 };
    const serverSum = srv.avg * srv.count;
    const serverCount = srv.count;

    const totalCount = localCount + serverCount;
    if (totalCount <= 0) return 0;
    return (localSum + serverSum) / totalCount;
  }

  function fmtDot(ms) {
    const total = Math.max(0, Math.round(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return m + '.' + (s < 10 ? '0' + s : s);
  }

  function labelText(type) {
    const t = timers[type];
    if (!t.active) return '';
    const elapsed = Date.now() - t.startedAt;
    const avg = avgDuration(type);
    if (avg > 0) {
      const rem = avg - elapsed;
      return rem > 0 ? '\u2248' + fmtDot(rem) : 'скоро конец';
    }
    // Оценки ещё нет (первая буря) — показываем прошедшее время.
    return fmtDot(elapsed);
  }

  function onStormChange(type, on) {
    const t = timers[type];
    if (on && !t.active) {
      t.active = true;
      t.startedAt = Date.now();
    } else if (!on && t.active) {
      t.active = false;
      const dur = Date.now() - t.startedAt;
      if (dur >= MIN_VALID_MS) {
        pushSample(type, dur);
        reportDuration(type, dur);
      }
    }
  }

  function makeCell(imgSrc) {
    const wrap = document.createElement('div');
    wrap.style.cssText =
      'display:none;flex-direction:column;align-items:center;margin:0 0 ' + ICON_GAP + 'px 0;';
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = '';
    img.draggable = false;
    img.style.cssText = 'height:' + ICON_H + 'px;width:auto;';
    const label = document.createElement('div');
    label.style.cssText =
      'margin-top:2px;font:700 12px/1.1 Arial,sans-serif;color:#fff;white-space:nowrap;' +
      'text-shadow:0 0 3px #000,0 0 3px #000,1px 1px 2px #000;';
    wrap.appendChild(img);
    wrap.appendChild(label);
    return { wrap: wrap, label: label };
  }

  function ensureDom() {
    if (root) return;
    root = document.createElement('div');
    root.id = 'starve-mod-weather';
    root.style.cssText =
      'position:fixed;z-index:2147483639;pointer-events:none;display:none;' +
      'flex-direction:column;align-items:flex-end;';

    blizzardEl = makeCell(IMG.blizzard);
    sandstormEl = makeCell(IMG.sandstorm);

    root.appendChild(blizzardEl.wrap);
    root.appendChild(sandstormEl.wrap);
    document.body.appendChild(root);
  }

  // Возвращает { rightEdge, top } — правый край блока иконок и его верх (CSS-px).
  // Приоритет — слева от блока FPS/Ping; запасной — фикс. позиция от canvas.
  function computePos() {
    const ov = document.getElementById('starve-mod-overlay');
    if (ov) {
      const r = ov.getBoundingClientRect();
      if (r.width > 4 && r.height > 4) {
        return { rightEdge: r.left - GAP, top: r.top };
      }
    }
    const canvas = document.getElementById('game_canvas');
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 80 || rect.height < 80) return null;
    return {
      rightEdge: rect.right - FALLBACK.right,
      top: rect.top + FALLBACK.top,
    };
  }

  function tick() {
    ensureDom();
    const r = getRefs();
    const showBlizzard = stormOn(r && r.blizzard);
    const showSandstorm = stormOn(r && r.sandstorm);

    onStormChange('blizzard', showBlizzard);
    onStormChange('sandstorm', showSandstorm);

    blizzardEl.wrap.style.display = showBlizzard ? 'flex' : 'none';
    sandstormEl.wrap.style.display = showSandstorm ? 'flex' : 'none';
    if (showBlizzard) blizzardEl.label.textContent = labelText('blizzard');
    if (showSandstorm) sandstormEl.label.textContent = labelText('sandstorm');

    if (!showBlizzard && !showSandstorm) {
      root.style.display = 'none';
    } else {
      const pos = computePos();
      if (pos) {
        root.style.display = 'flex';
        // правый край блока = pos.rightEdge → left = rightEdge - ширина блока
        root.style.left = Math.round(pos.rightEdge - root.offsetWidth) + 'px';
        root.style.top = Math.round(pos.top) + 'px';
      } else {
        root.style.display = 'none';
      }
    }
    rafId = requestAnimationFrame(tick);
  }

  SM.features = SM.features || {};
  SM.features.weatherInfo = {
    init: function () {
      if (rafId) return;
      ensureDom();
      loadServerCache();
      fetchServerStats();
      rafId = requestAnimationFrame(tick);
      SM.log('weather-info: global storm HUD on', API_BASE ? '(api ' + API_BASE + ')' : '(no api)');
    },
  };
})(window.__SM__ = window.__SM__ || {});


/* ===== src/features/combat.js ===== */
/**
 * features/combat.js — AutoWall / AutoSpike веером (механика oldscript):
 * раз в PLACE_INTERVAL_MS из направления взгляда рассылаем FAN_COUNT пакетов
 * [25, id, (angle - i) mod 255, 0], разворачивая постройку дугой.
 */
;(function (SM) {
  'use strict';

  // oldscript: setInterval(pidarska, 80) + веер из 30 пакетов на тик.
  const PLACE_INTERVAL_MS = 80;
  const FAN_COUNT = 30;
  const active = { autoSpike: false, autoWall: false, autofarm: false, wormFarm: false };
  const lastPlace = { autoSpike: 0, autoWall: 0 };
  const categoryFor = { autoSpike: 'spike', autoWall: 'wall' };
  const warned = {};
  let rafId = 0;

  function place(name) {
    const category = categoryFor[name];
    const id = SM.protocol.resolvePlaceId(category);
    if (id == null) {
      if (SM.inventoryDebug) SM.inventoryDebug.onPlaceFail(name, category);
      else if (SM.inventory && SM.inventory.debug) SM.inventory.debug.onPlaceFail(name, category);
      if (!warned[name]) {
        warned[name] = true;
        const avail = SM.inventory ? SM.inventory.available(category) : [];
        SM.warn(
          name + ': нет ' + category + ' в инвентаре',
          avail.length ? avail : '(пусто)',
          SM.inventory ? 'source=' + SM.inventory.source() : ''
        );
      }
      return;
    }

    const ang = SM.protocol.getPlaceAngle();
    if (ang == null) {
      if (!warned[name + '_ang']) {
        warned[name + '_ang'] = true;
        SM.warn(name + ': наведи курсор на canvas (нужен угол)');
      }
      return;
    }

    const now = performance.now();
    if (now - lastPlace[name] < PLACE_INTERVAL_MS) return;
    lastPlace[name] = now;

    const sent = SM.protocol.placeFan(id, ang, FAN_COUNT);
    if (!sent && !warned[name + '_send']) {
      warned[name + '_send'] = true;
      SM.warn(name + ': WebSocket не готов — зайди в игру');
    } else if (sent) {
      SM.log(name, 'fan', sent + '/' + FAN_COUNT, 'id', id, 'ang', ang);
    }
  }

  function loop() {
    if (active.autoSpike) place('autoSpike');
    if (active.autoWall) place('autoWall');

    if (active.autoSpike || active.autoWall) {
      rafId = requestAnimationFrame(loop);
    } else {
      rafId = 0;
    }
  }

  function ensureLoop() {
    if (!rafId && (active.autoSpike || active.autoWall)) {
      rafId = requestAnimationFrame(loop);
    }
  }

  SM.features = SM.features || {};
  SM.features.combat = {
    init: function () {
      SM.log('combat: autowall/autospike ready');
    },
    setActive: function (name, on) {
      if (name === 'autofarm') {
        if (SM.features.autofarm) SM.features.autofarm.setActive(on);
        active.autofarm = !!(SM.features.autofarm && SM.features.autofarm.isActive && SM.features.autofarm.isActive());
        return;
      }
      if (name === 'wormFarm') {
        if (SM.features.wormFarm) SM.features.wormFarm.setActive(on);
        active.wormFarm = !!(SM.features.wormFarm && SM.features.wormFarm.isActive && SM.features.wormFarm.isActive());
        return;
      }
      if (!(name in active)) return;

      if (on && !SM.settings[name]) {
        SM.warn(name + ': включи тумблер в меню → Binds → ' + name);
        return;
      }

      if (active[name] === !!on) return;

      active[name] = !!on;
      if (on) {
        SM.net.ensureInstalled();
        warned[name] = false;
        warned[name + '_ang'] = false;
        warned[name + '_send'] = false;
        SM.warn('[starve-mod] ' + name + ' ACTIVE');
        if (SM.inventoryDebug) SM.inventoryDebug.onCombatActive(name);
        else if (SM.inventory && SM.inventory.debug) SM.inventory.debug.onCombatActive(name);
      } else {
        SM.log(name, 'off');
      }
      ensureLoop();
    },
    isActive: function (name) {
      if (name === 'autofarm') {
        return !!(SM.features.autofarm && SM.features.autofarm.isActive());
      }
      if (name === 'wormFarm') {
        return !!(SM.features.wormFarm && SM.features.wormFarm.isActive());
      }
      return !!active[name];
    },
  };
})(window.__SM__ = window.__SM__ || {});


/* ===== src/features/token-logger.js ===== */
/**
 * features/token-logger.js — Token Logger (TokenJoiner из oldscript / NVX):
 *   starve_token + starve_token_id в localStorage, UI в Combat, Respawn (rejoin).
 */
;(function (SM) {
  'use strict';

  const LS_TOKEN = 'starve_token';
  const LS_TOKEN_ID = 'starve_token_id';

  let cachedUser = null;
  let cachedKeys = null;
  let pollTimer = 0;

  function getUser() {
    try {
      const u = window.__SV_USER__;
      return u && typeof u === 'object' ? u : null;
    } catch (_) { return null; }
  }

  function gameObj() {
    try {
      const g = window.__SV_GAME__;
      return g && typeof g === 'object' ? g : null;
    } catch (_) { return null; }
  }

  function excludedKeys(user) {
    const set = new Set(['id', 'uid', 'key', 'beta', 'day']);
    if (SM.keys) {
      try {
        const u = SM.keys.uid && SM.keys.uid();
        if (u) set.add(u);
      } catch (_) {}
    }
    return set;
  }

  function looksLikeToken(v) {
    return typeof v === 'string' && v.length >= 10 && v.length <= 96 &&
      /^[\x21-\x7e]+$/.test(v) && !/\s/.test(v);
  }

  function looksLikeTokenId(v) {
    if (typeof v === 'number' && isFinite(v) && v >= 0 && v < 1e15) return true;
    return typeof v === 'string' && /^\d+$/.test(v) && v.length <= 16;
  }

  function resolveKeys(user, force) {
    if (!user) return { tokenKey: null, idKey: null };
    if (!force && cachedKeys && cachedUser === user) return cachedKeys;

    const lsT = localStorage.getItem(LS_TOKEN) || SM.settings.token || '';
    const lsI = localStorage.getItem(LS_TOKEN_ID);
    const setId = lsI != null ? lsI : (SM.settings.tokenId || '');
    const skip = excludedKeys(user);
    let tokenKey = null;
    let idKey = null;
    const names = Object.getOwnPropertyNames(user);

    for (let i = 0; i < names.length; i++) {
      const k = names[i];
      if (skip.has(k)) continue;
      let v;
      try { v = user[k]; } catch (_) { continue; }
      if (typeof v === 'string') {
        if (lsT && v === lsT) tokenKey = k;
        if (setId !== '' && v === setId) idKey = k;
      } else if (typeof v === 'number' && setId !== '' && String(v) === setId) {
        idKey = k;
      }
    }

    if (!tokenKey) {
      for (let i = 0; i < names.length; i++) {
        const k = names[i];
        if (skip.has(k)) continue;
        let v;
        try { v = user[k]; } catch (_) { continue; }
        if (looksLikeToken(v)) { tokenKey = k; break; }
      }
    }

    if (!idKey) {
      for (let i = 0; i < names.length; i++) {
        const k = names[i];
        if (skip.has(k) || k === tokenKey) continue;
        let v;
        try { v = user[k]; } catch (_) { continue; }
        if (looksLikeTokenId(v)) { idKey = k; break; }
      }
    }

    cachedUser = user;
    cachedKeys = { tokenKey: tokenKey, idKey: idKey };
    return cachedKeys;
  }

  function readFromUser() {
    const user = getUser();
    if (!user) return null;
    const keys = resolveKeys(user);
    let token = SM.settings.token || '';
    let tokenId = SM.settings.tokenId || '';
    if (keys.tokenKey) {
      try {
        const v = user[keys.tokenKey];
        if (typeof v === 'string' && v) token = v;
      } catch (_) {}
    }
    if (keys.idKey) {
      try {
        const v = user[keys.idKey];
        if (v != null && v !== '') tokenId = String(v);
      } catch (_) {}
    }
    return { token: token, tokenId: tokenId };
  }

  function persist(token, tokenId) {
    if (typeof token === 'string') SM.settings.token = token;
    if (typeof tokenId === 'string') SM.settings.tokenId = tokenId;
    try {
      localStorage.setItem(LS_TOKEN, SM.settings.token || '');
      localStorage.setItem(LS_TOKEN_ID, SM.settings.tokenId || '');
    } catch (_) {}
    try { SM.storage.save(); } catch (_) {}
  }

  function applyToUser() {
    const user = getUser();
    if (!user) return false;
    const keys = resolveKeys(user, true);
    persist(SM.settings.token || '', SM.settings.tokenId || '');
    try {
      if (keys.tokenKey) user[keys.tokenKey] = SM.settings.token || '';
      if (keys.idKey) {
        const id = SM.settings.tokenId || '';
        user[keys.idKey] = /^\d+$/.test(id) ? id : id;
      }
    } catch (_) {}
    return true;
  }

  function syncFromUser() {
    const data = readFromUser();
    if (!data) return false;
    const prevT = SM.settings.token || '';
    const prevI = SM.settings.tokenId || '';
    if (data.token === prevT && data.tokenId === prevI) return false;
    persist(data.token, data.tokenId);
    SM.bus.emit('tokenLogger:update', data);
    SM.log('TokenLogger: captured token_id=' + data.tokenId);
    return true;
  }

  function loadFromStorage() {
    try {
      const t = localStorage.getItem(LS_TOKEN);
      const i = localStorage.getItem(LS_TOKEN_ID);
      if (t != null) SM.settings.token = t;
      if (i != null) SM.settings.tokenId = i;
    } catch (_) {}
  }

  function findRunCallback(user) {
    if (user) {
      const names = Object.getOwnPropertyNames(user);
      for (let i = 0; i < names.length; i++) {
        let o;
        try { o = user[names[i]]; } catch (_) { continue; }
        if (!o || typeof o !== 'object') continue;
        if (typeof o.run === 'function') return o.run.bind(o);
      }
    }
    try {
      if (typeof ui !== 'undefined' && ui && typeof ui.run === 'function') return ui.run.bind(ui);
    } catch (_) {}
    return null;
  }

  function findQuitFn() {
    const game = gameObj();
    if (game) {
      if (typeof game.quit === 'function') return { fn: game.quit.bind(game), via: 'game.quit' };
      const keys = Object.getOwnPropertyNames(game);
      for (let i = 0; i < keys.length; i++) {
        let fn;
        try { fn = game[keys[i]]; } catch (_) { continue; }
        if (typeof fn !== 'function') continue;
        let src = '';
        try { src = Function.prototype.toString.call(fn); } catch (_) {}
        if (src.length < 1500 && (/\.run\s*\(/.test(src) || /ui\[/.test(src))) {
          return { fn: fn.bind(game), via: 'game.' + keys[i] };
        }
      }
    }
    try {
      if (typeof scoreboard !== 'undefined' && scoreboard && typeof scoreboard.quit === 'function') {
        return { fn: scoreboard.quit.bind(scoreboard), via: 'scoreboard.quit' };
      }
    } catch (_) {}
    return null;
  }

  function rejoin() {
    applyToUser();
    const user = getUser();
    const run = findRunCallback(user);
    const quit = findQuitFn();
    try { if (user && 'alive' in user) user.alive = false; } catch (_) {}

    if (quit && run) {
      try {
        quit.fn(run);
        SM.log('TokenLogger: Respawn via', quit.via);
        return true;
      } catch (err) {
        SM.warn('TokenLogger: quit failed', err);
      }
    }

    if (run) {
      try {
        setTimeout(function () {
          try { run(); } catch (_) {}
        }, 200);
        SM.log('TokenLogger: Respawn via ui.run');
        return true;
      } catch (_) {}
    }

    SM.warn('TokenLogger: Respawn — не найден game.quit (зайди в игру)');
    return false;
  }

  function copyText(text) {
    if (!text) return false;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function () {});
      return true;
    }
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;left:-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    } catch (_) { return false; }
  }

  function copy(which) {
    const token = SM.settings.token || '';
    const tokenId = SM.settings.tokenId || '';
    if (which === 'token') return copyText(token);
    if (which === 'tokenId') return copyText(tokenId);
    if (which === 'both') return copyText(token + '\n' + tokenId);
    return false;
  }

  function setFields(token, tokenId) {
    persist(token != null ? String(token) : SM.settings.token,
      tokenId != null ? String(tokenId) : SM.settings.tokenId);
    applyToUser();
    SM.bus.emit('tokenLogger:update');
  }

  function startPoll() {
    if (pollTimer) return;
    pollTimer = setInterval(function () {
      if (getUser()) syncFromUser();
    }, 1500);
  }

  SM.features = SM.features || {};
  SM.features.tokenLogger = {
    init: function () {
      loadFromStorage();
      startPoll();
      SM.bus.on('net:in', function () {
        setTimeout(syncFromUser, 100);
      });
      SM.log('tokenLogger: ready');
    },
    get: function () {
      return { token: SM.settings.token || '', tokenId: SM.settings.tokenId || '' };
    },
    set: setFields,
    apply: applyToUser,
    sync: syncFromUser,
    rejoin: rejoin,
    copy: copy,
    invalidateKeys: function () {
      cachedUser = null;
      cachedKeys = null;
    },
  };
})(window.__SM__ = window.__SM__ || {});


/* ===== src/features/aimbot.js ===== */
/**
 * features/aimbot.js — порт аимбота из oldscript (углы/дальности/тайминги 1:1).
 *
 * Логика oldscript (pidarska, setInterval 80мс):
 *   - myPlayer = world.fast_units[user.uid]; players = world.units[PLAYERS]
 *   - дальность по оружию (HoldWeapon): меч 157.6/196.8(fly), копьё 227.6/291.8 ...
 *   - Enemy = ближайший не-союзник в том же fly-состоянии, не ghost
 *   - если dist ≤ range: send_angle(atan2(enemy.r - me.r)); если dist ≤ range-22: send_attack
 *   - иначе: stop_attack
 *
 * В живом движке поля world/игрока обфусцированы, поэтому резолвим по сигнатуре
 * (как инвентарь). Пока структура не подтверждена дампом — aimbot не стреляет.
 */
;(function (SM) {
  'use strict';

  const TICK_MS = 80;

  let timer = 0;
  let refs = null;
  let refsAt = 0;
  const RESOLVE_MS = 3000;

  function getWorld() {
    try {
      const w = window.__SV_WORLD__;
      return w && typeof w === 'object' ? w : null;
    } catch (_) {
      return null;
    }
  }

  function getUser() {
    try {
      const u = window.__SV_USER__;
      return u && typeof u === 'object' ? u : null;
    } catch (_) {
      return null;
    }
  }

  // ---- Зонд: дамп структуры world/user в консоль для построения резолвера ----
  function describe(v, depth) {
    if (v === null) return 'null';
    const t = typeof v;
    if (t !== 'object') return t + (t === 'number' ? '(' + v + ')' : '');
    if (Array.isArray(v)) {
      let sample = null;
      for (let i = 0; i < v.length; i++) {
        if (v[i] != null) { sample = v[i]; break; }
      }
      return 'Array[' + v.length + ']' + (sample && depth > 0 ? ' of ' + describe(sample, depth - 1) : '');
    }
    if (depth <= 0) return 'object';
    const keys = Object.getOwnPropertyNames(v).slice(0, 24);
    const parts = [];
    for (let i = 0; i < keys.length; i++) {
      let vv;
      try { vv = v[keys[i]]; } catch (_) { continue; }
      const tv = typeof vv;
      if (tv === 'number') parts.push(keys[i] + ':num');
      else if (tv === 'function') parts.push(keys[i] + ':fn');
      else if (Array.isArray(vv)) parts.push(keys[i] + ':Arr[' + vv.length + ']');
      else if (tv === 'object' && vv) parts.push(keys[i] + ':{}');
      else parts.push(keys[i] + ':' + tv);
    }
    return '{ ' + parts.join(', ') + ' }';
  }

  function dump() {
    // Печатаем напрямую в консоль (SM.log заглушён без debugLog) и возвращаем текст.
    const lines = [];
    const log = function (s) { lines.push(s); console.log(s); };

    const world = getWorld();
    const user = getUser();
    log('aimbot.dump: __SV_WORLD__ = ' + (world ? 'present' : 'MISSING'));
    log('aimbot.dump: __SV_USER__  = ' + (user ? 'present' : 'MISSING'));
    if (!world) {
      const msg = 'aimbot.dump: world НЕ выставлен. Переустанови лоадер (v1.0.6+) в Tampermonkey и Ctrl+F5.';
      console.warn(msg);
      try { window.__SM_AIM_DUMP__ = msg; } catch (_) {}
      return msg;
    }
    const keys = Object.getOwnPropertyNames(world);
    log('aimbot.dump: world keys (' + keys.length + '):');
    for (let i = 0; i < keys.length; i++) {
      let v;
      try { v = world[keys[i]]; } catch (_) { continue; }
      if (Array.isArray(v)) {
        // Сколько непустых, и пример вложенного элемента (units = массив массивов).
        let nonNull = 0;
        let firstArr = null;
        let firstArrIdx = -1;
        let firstObj = null;
        for (let j = 0; j < v.length; j++) {
          if (v[j] == null) continue;
          nonNull++;
          if (Array.isArray(v[j]) && firstArr == null && v[j].length) { firstArr = v[j]; firstArrIdx = j; }
          else if (typeof v[j] === 'object' && firstObj == null) firstObj = v[j];
        }
        log(
          '  ' + keys[i] + ': Array[' + v.length + '] nonNull=' + nonNull +
          (firstArr ? ' | inner[' + firstArrIdx + '][0] = ' + describe(firstArr[0], 1) : '') +
          (firstObj ? ' | obj = ' + describe(firstObj, 1) : '')
        );
      } else if (v && typeof v === 'object') {
        log('  ' + keys[i] + ': ' + describe(v, 1));
      } else {
        log('  ' + keys[i] + ': ' + describe(v, 0));
      }
    }
    if (user) {
      log('aimbot.dump: user keys: ' + Object.getOwnPropertyNames(user).slice(0, 60).join(','));
    }
    log('aimbot.dump: скопируй ВЕСЬ текст ниже сюда — по нему построю резолвер.');
    const report = lines.join('\n');
    try { window.__SM_AIM_DUMP__ = report; } catch (_) {}
    return report;
  }

  // ---- Снифер исходящих пакетов: ловим опкоды угла/атаки по реальным действиям ----
  function sniff(seconds) {
    const secs = typeof seconds === 'number' && seconds > 0 ? seconds : 8;
    const counts = {};
    const samples = {};
    function onOut(frame) {
      try {
        if (frame.text == null) return;
        const v = JSON.parse(frame.text);
        if (!Array.isArray(v) || !v.length) return;
        const op = v[0];
        counts[op] = (counts[op] || 0) + 1;
        if (!samples[op]) samples[op] = JSON.stringify(v);
      } catch (_) {}
    }
    const unsub = SM.bus.on('net:out', onOut);
    console.warn(
      'aimbot.sniff: запись ' + secs + 'с. СЕЙЧАС: 1) подвигай мышью (это угол), ' +
      '2) сделай ЛКМ-атаку по пустому месту пару раз. По окончании выведу опкоды.'
    );
    setTimeout(function () {
      unsub();
      const ops = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; });
      console.log('aimbot.sniff: опкоды (op: count | пример):');
      for (let i = 0; i < ops.length; i++) {
        console.log('  op=' + ops[i] + '  x' + counts[ops[i]] + '  ' + samples[ops[i]]);
      }
      console.log('aimbot.sniff: частый при движении мыши = угол; редкий при ЛКМ = атака. Скопируй сюда.');
    }, secs * 1000);
    return 'sniffing ' + secs + 's...';
  }

  // ---- Глубокий зонд: значения полей юнитов, объект r, поиск uid ----
  function isUnit(o) {
    return (
      o && typeof o === 'object' && !Array.isArray(o) &&
      typeof o.x === 'number' && typeof o.y === 'number' &&
      typeof o.angle === 'number' && typeof o.type === 'number' &&
      typeof o.id === 'number'
    );
  }

  // fast_units: разреженный массив юнитов по uid; units: массив массивов юнитов по типам.
  function findArrays(world) {
    let fast = null, fastKey = null, fastLen = -1;
    let units = null, unitsKey = null;
    const keys = Object.getOwnPropertyNames(world);
    for (let i = 0; i < keys.length; i++) {
      let v; try { v = world[keys[i]]; } catch (_) { continue; }
      if (!Array.isArray(v)) continue;
      let el = null;
      for (let j = 0; j < v.length; j++) { if (v[j] != null) { el = v[j]; break; } }
      if (isUnit(el)) {
        if (v.length > fastLen) { fast = v; fastKey = keys[i]; fastLen = v.length; }
      } else if (Array.isArray(el) && el.length && isUnit(el[0])) {
        if (!units) { units = v; unitsKey = keys[i]; }
      }
    }
    return { fast: fast, fastKey: fastKey, units: units, unitsKey: unitsKey };
  }

  function valStr(v) {
    if (v === null) return 'null';
    const t = typeof v;
    if (t === 'number' || t === 'boolean') return String(v);
    if (t === 'string') return JSON.stringify(v.length > 16 ? v.slice(0, 16) + '…' : v);
    if (t === 'function') return 'fn';
    if (Array.isArray(v)) return 'Arr[' + v.length + ']';
    if (t === 'object') {
      const ks = Object.getOwnPropertyNames(v).slice(0, 8);
      return '{' + ks.map(function (k) {
        const vv = v[k];
        return k + ':' + (typeof vv === 'number' ? vv : typeof vv);
      }).join(',') + '}';
    }
    return t;
  }

  function dumpObj(o) {
    const ks = Object.getOwnPropertyNames(o);
    const parts = [];
    for (let i = 0; i < ks.length; i++) {
      let vv; try { vv = o[ks[i]]; } catch (_) { parts.push(ks[i] + '=?'); continue; }
      parts.push(ks[i] + '=' + valStr(vv));
    }
    return parts.join(', ');
  }

  function probe() {
    const lines = [];
    const log = function (s) { lines.push(s); console.log(s); };
    const world = getWorld();
    const user = getUser();
    if (!world) { const m = 'aimbot.probe: world MISSING'; console.warn(m); return m; }

    const f = findArrays(world);
    log('aimbot.probe: fast_units key=' + f.fastKey + ' len=' + (f.fast ? f.fast.length : '-') +
        ' | units key=' + f.unitsKey + ' len=' + (f.units ? f.units.length : '-'));

    // Живые юниты в fast_units (uid -> unit). Печатаем все поля со значениями.
    const live = [];
    if (f.fast) {
      for (let i = 0; i < f.fast.length; i++) {
        if (f.fast[i] != null) live.push(i);
      }
    }
    log('aimbot.probe: live fast_units uid=' + JSON.stringify(live.slice(0, 30)) + ' (всего ' + live.length + ')');

    // Поиск uid: какие числовые поля user указывают на непустой fast_units[u].
    if (user && f.fast) {
      const uk = Object.getOwnPropertyNames(user);
      const cand = [];
      for (let i = 0; i < uk.length; i++) {
        let val; try { val = user[uk[i]]; } catch (_) { continue; }
        if (typeof val === 'number' && val >= 0 && val < f.fast.length && Number.isInteger(val) && f.fast[val] != null) {
          cand.push(uk[i] + '=' + val);
        }
      }
      log('aimbot.probe: uid-кандидаты (user.key=value, value -> непустой fast_unit): ' + (cand.join(', ') || 'нет'));
      // user.id для сверки
      try { log('aimbot.probe: user.id=' + user.id); } catch (_) {}
    }

    // Полный дамп каждого живого юнита + его объекта r.
    for (let i = 0; i < live.length && i < 12; i++) {
      const u = f.fast[live[i]];
      log('--- fast_unit[' + live[i] + '] type=' + u.type + ' id=' + u.id + ' ---');
      log('  ' + dumpObj(u));
      if (u.r && typeof u.r === 'object') log('  r = ' + dumpObj(u.r));
    }

    log('aimbot.probe: КОНЕЦ. Скопируй весь текст (copy(__SM__.features.aimbot.probe())).');
    const report = lines.join('\n');
    try { window.__SM_AIM_PROBE__ = report; } catch (_) {}
    return report;
  }

  // Чистый снифер атаки: пишет последовательность опкодов (без шума угла 24/7,
  // мыши 15, движения 37) с относительным временем — чтобы увидеть down/up атаки.
  function sniffAttack(seconds) {
    const secs = typeof seconds === 'number' && seconds > 0 ? seconds : 6;
    const IGNORE = { 7: 1, 15: 1, 24: 1, 37: 1 };
    const seq = [];
    const t0 = performance.now();
    function onOut(frame) {
      try {
        if (frame.text == null) return;
        const v = JSON.parse(frame.text);
        if (!Array.isArray(v) || !v.length) return;
        if (IGNORE[v[0]]) return;
        seq.push('+' + Math.round(performance.now() - t0) + 'ms ' + JSON.stringify(v));
      } catch (_) {}
    }
    const unsub = SM.bus.on('net:out', onOut);
    console.warn('aimbot.sniffAttack: ' + secs + 'с. НАЖМИ и УДЕРЖИ атаку (ЛКМ) ~2с, потом ОТПУСТИ. Мышь не двигай.');
    setTimeout(function () {
      unsub();
      const rep = 'aimbot.sniffAttack:\n' + (seq.length ? seq.join('\n') : '(пусто — ничего кроме угла/мыши)');
      console.log(rep);
      try { window.__SM_AIM_ATK__ = rep; } catch (_) {}
    }, secs * 1000);
    return 'sniffAttack ' + secs + 's...';
  }

  // ---- Резолвер ссылок (по подтверждённой структуре движка) ----
  // Обфусцированные ключи (uid игрока, pid-владелец) резолвятся в рантайме
  // (SM.keys) — переживают автообновление клиента. Fallback на старые значения.
  function UID_KEY() { return (SM.keys && SM.keys.uid()) || 'α︈̄'; }
  function PID_KEY() { return (SM.keys && SM.keys.pid()) || 'Іᄃᴎ'; }

  function resolveRefs() {
    const world = getWorld();
    const user = getUser();
    if (!world || !user) return null;

    const f = findArrays(world);
    if (!f.fast || !f.units) return null;

    const uid = user[UID_KEY()];
    if (typeof uid !== 'number') return null;
    const self = f.fast[uid];
    if (!isUnit(self)) return null;

    return {
      fast: f.fast,
      units: f.units,
      uid: uid,
      playerType: self.type, // тип игроков (у self type=0)
      pid: typeof self[PID_KEY()] === 'number' ? self[PID_KEY()] : null,
    };
  }

  function getRefs() {
    const now = Date.now();
    if (!refs || now - refsAt > RESOLVE_MS) {
      refs = resolveRefs();
      refsAt = now;
    }
    return refs;
  }

  // ---- Оружие → дальность (oldscript HoldWeapon). type: 1=меч/молот, 2=копьё, 6=топор. ----
  // id всех копий из items.txt (включая питчфорк — он длиннее меча, дальность копья).
  const SPEAR_IDS = new Set([
    12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, // wood..aquamarine spear
    60, 61, // amethyst, reidite spear
    99, 100, // pitchfork, pitchfork2
  ]);
  // Топоры (items.txt 167..181): дальность чуть меньше меча.
  const AXE_IDS = new Set([
    167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181,
  ]);

  function weaponType(rightId) {
    if (SPEAR_IDS.has(rightId)) return 2;
    if (AXE_IDS.has(rightId)) return 6;
    return 1; // дефолт: melee (меч/молот) — короткая дальность
  }

  function rangeFor(type, fly) {
    switch (type) {
      case 1: return fly ? 196.8 : 157.6;
      case 2: return fly ? 291.8 : 227.6;
      case 3: return 620;
      case 4: return fly ? 140 : 125;
      case 5: return fly ? 120.8 : 97.6;
      case 6: return fly ? 180 : 144; // топор: чуть меньше меча
      default: return fly ? 196.8 : 157.6;
    }
  }

  // EnemyToAttack (oldscript): ближайший враг-игрок, не свой pid/uid и НЕ союзник
  // по команде (тотем); для копья пропускаем слишком близких (d^2 < 330).
  // oldscript: `if (obj.pid === myPlayer.pid || cleverUtils.isAlly(obj.pid)) continue;`
  // где cleverUtils.isAlly(pid) = pid входит в user.team (или === user.id).
  function isTeammate(pid) {
    if (typeof pid !== 'number') return false;
    if (SM.keys && SM.keys.isAlly) return SM.keys.isAlly(pid);
    return false;
  }

  function pickEnemy(players, self, holdingSpear) {
    let nearest = null;
    let best = -1;
    const uk = UID_KEY();
    const pk = PID_KEY();
    for (let i = 0; i < players.length; i++) {
      const o = players[i];
      if (!o || o === self) continue;
      if (o[uk] === self[uk]) continue;            // это я
      const opid = o[pk];
      if (refs.pid != null && opid === refs.pid) continue; // мои юниты (постройки/петы)
      if (isTeammate(opid)) continue;              // союзник по тотему — НЕ бьём
      const dx = self.x - o.x;
      const dy = self.y - o.y;
      const dSq = dx * dx + dy * dy;
      if (holdingSpear && dSq < 330) continue;
      if (best === -1 || dSq < best) { best = dSq; nearest = o; }
    }
    return nearest;
  }

  // Одноразовый снимок: диагностика готовности + ближайшие юниты для отладки целей.
  function snap() {
    const diag = [];
    const dlog = function (s) { diag.push(s); console.log(s); };
    const world = getWorld();
    const user = getUser();
    dlog('aimbot.snap: __SV_WORLD__=' + (world ? 'yes' : 'NO') + ' __SV_USER__=' + (user ? 'yes' : 'NO'));
    if (!world || !user) { const rep = diag.join('\n'); try { window.__SM_AIM_SNAP__ = rep; } catch (_) {} return rep; }
    const fa = findArrays(world);
    dlog('aimbot.snap: fastKey=' + fa.fastKey + ' fastLen=' + (fa.fast ? fa.fast.length : '-') +
      ' unitsKey=' + fa.unitsKey + ' unitsLen=' + (fa.units ? fa.units.length : '-'));
    const uidv = user[UID_KEY()];
    dlog('aimbot.snap: user[uid]=' + uidv + ' (' + typeof uidv + ')');
    const selfDiag = fa.fast && typeof uidv === 'number' ? fa.fast[uidv] : null;
    dlog('aimbot.snap: self.isUnit=' + isUnit(selfDiag) + (isUnit(selfDiag) ? ' type=' + selfDiag.type + ' pid=' + selfDiag[PID_KEY()] : ''));

    const r = resolveRefs();
    if (!r) { const rep = diag.join('\n') + '\naimbot.snap: resolveRefs=null (не в игре/не возродился?)'; console.warn(rep); try { window.__SM_AIM_SNAP__ = rep; } catch (_) {} return rep; }
    const self = r.fast[r.uid];
    if (!isUnit(self)) { const m = 'aimbot.snap: self нет (жив?)'; console.warn(m); return m; }
    const arr = [];
    for (let i = 0; i < r.fast.length; i++) {
      const o = r.fast[i];
      if (!isUnit(o) || o === self) continue;
      const opid = o[PID_KEY()];
      const dx = self.x - o.x, dy = self.y - o.y;
      arr.push({
        uid: i, type: o.type, pid: opid,
        ally: (r.pid != null && opid === r.pid) || isTeammate(opid),
        dist: Math.round(Math.sqrt(dx * dx + dy * dy)), action: o.action,
      });
    }
    arr.sort(function (a, b) { return a.dist - b.dist; });
    const lines = [];
    const players = r.units[r.playerType] || [];
    const team = SM.keys && SM.keys.getTeam ? SM.keys.getTeam(getUser()) : null;
    lines.push('aimbot.snap: self uid=' + r.uid + ' type=' + self.type + ' pid=' + r.pid +
      ' right=' + self.right + ' pos=' + Math.round(self.x) + ',' + Math.round(self.y));
    lines.push('aimbot.snap: команда (user.team)=' + (team ? JSON.stringify(team) : 'нет/соло'));
    lines.push('aimbot.snap: playerType=' + r.playerType + ' units[playerType].len=' + players.length);
    lines.push('aimbot.snap: ближайшие юниты (uid/type/pid/ally/dist/action):');
    for (let i = 0; i < arr.length && i < 14; i++) {
      const a = arr[i];
      lines.push('  uid=' + a.uid + ' type=' + a.type + ' pid=' + a.pid +
        ' ally=' + (a.ally ? 'ДА(не бью)' : 'нет') + ' dist=' + a.dist + ' action=' + a.action);
    }
    const rep = lines.join('\n');
    console.log(rep);
    try { window.__SM_AIM_SNAP__ = rep; } catch (_) {}
    return rep;
  }

  let attacking = false;

  // Сброс наведения: перестаём подменять угол и, если били — шлём стоп [35].
  function clearAim() {
    if (SM.net && SM.net.setAimAngle) SM.net.setAimAngle(null);
    // снять локальный поворот персонажа (движок снова берёт угол от мыши)
    try { window.__SV_AIM_ANGLE__ = null; } catch (_) {}
    if (attacking) {
      SM.protocol.stopAttack();
      attacking = false;
    }
  }

  function tick() {
    const r = getRefs();
    if (!r) return clearAim();

    const self = r.fast[r.uid];
    if (!isUnit(self)) return clearAim(); // умер/нет — стоп

    const players = r.units[r.playerType];
    if (!players || !players.length) return clearAim();

    const type = weaponType(self.right);
    const fly = false; // поле fly пока не резолвлено — считаем «на земле»
    const myRange = rangeFor(type, fly);

    const enemy = pickEnemy(players, self, type === 2);
    if (!enemy) return clearAim();

    const dx = self.x - enemy.x;
    const dy = self.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    try { window.__SM_AIM_LAST__ = { right: self.right, type: type, range: myRange, dist: Math.round(dist) }; } catch (_) {}

    // oldscript: в радиусе — поворот; в радиусе-22 — атака; вне радиуса — стоп.
    if (dist <= myRange) {
      // Угол по интерполированным координатам r (как oldscript calcAngle(..., true)).
      const rad = Math.atan2(enemy.r.y - self.r.y, enemy.r.x - self.r.x);
      const byte = SM.protocol.radToUint8(rad);
      if (byte == null) return;
      // Локальный поворот персонажа на экране: движок (control.update) читает это
      // значение и подставляет его вместо угла мыши — как oldscript `aimbot.a`.
      try { window.__SV_AIM_ANGLE__ = rad; } catch (_) {}
      if (SM.net && SM.net.setAimAngle) SM.net.setAimAngle(byte); // подмена угла движка → на врага
      SM.protocol.setAngle(byte);                                 // [24] поворот
      if (dist <= myRange - 22) {
        SM.protocol.attackAngle(byte);                            // [7] атака
        attacking = true;
      }
    } else {
      clearAim();
    }
  }

  SM.features = SM.features || {};
  SM.features.aimbot = {
    init: function () {
      SM.log('aimbot: модуль загружен. Зайди в игру с игроками рядом и выполни в консоли: __SM__.features.aimbot.dump()');
    },
    dump: dump,
    probe: probe,
    snap: snap,
    sniff: sniff,
    sniffAttack: sniffAttack,
    setActive: function (on) {
      if (on && !getRefs()) {
        SM.warn('aimbot: структура world ещё не разобрана — зайди в игру (нужен __SV_WORLD__).');
        return;
      }
      if (on && !timer) {
        if (SM.net && SM.net.ensureInstalled) SM.net.ensureInstalled();
        timer = setInterval(tick, TICK_MS);
        SM.log('aimbot: ON');
      } else if (!on && timer) {
        clearInterval(timer);
        timer = 0;
        clearAim(); // снять подмену угла и остановить атаку
        SM.log('aimbot: OFF');
      }
    },
    isActive: function () { return !!timer; },
  };
})(window.__SM__ = window.__SM__ || {});


/* ===== src/features/extra.js ===== */
/**
 * features/extra.js — функции для вкладки Binds (порт по смыслу из oldscript на
 * опкоды текущего клиента):
 *   Autosteal   — забирать из чужих сундуков/печей/мельниц/экстракторов рядом
 *   Autobuild   — продолжать ставить последний поставленный тип постройки
 *   AutoFire    — ставить костёр в тайминг (держать тепло), работает в движении
 *   AutoCraft   — авто-крафт выбранного рецепта
 *   AutoRecycle — авто-переработка выбранного предмета у верстака
 *   DropSword   — (по нажатию) выбросить оружие из правой руки
 *   Spectator   — свободная камера (WASD), персонаж стоит (см. патч лоадера)
 *   Xray        — прозрачные стены/крыши (см. патч лоадера)
 *   HideScript  — спрятать/показать UI мода
 *
 * Источник мира/игрока — пропатченные globals __SV_WORLD__/__SV_USER__ (как в
 * aimbot). Свой/враг и iid — по соглашению oldscript (iid = unit.id).
 */
;(function (SM) {
  'use strict';

  // Обфусцированные ключи резолвятся в рантайме (SM.keys) — переживают
  // автообновление клиента. Fallback на случай отсутствия резолвера.
  function UID_KEY() { return (SM.keys && SM.keys.uid()) || 'α︈̄'; }
  function PID_KEY() { return (SM.keys && SM.keys.pid()) || 'Іᄃᴎ'; }

  // World-type построек (= индекс world.units[type]); из world_ids.txt (НЕ item-id!).
  const T_CHEST = 11;         // CHEST
  const T_OVEN = 43;          // BREAD_OVEN (oldscript: ovens = units[BREAD_OVEN])
  const T_WINDMILL = 41;      // WINDMILL
  const T_EXTRACTOR_MIN = 24; // EXTRACTOR_MACHINE_STONE
  const T_EXTRACTOR_MAX = 37; // EXTRACTOR_MACHINE_AQUAMARINE

  const TICK_MS = 80;        // как в oldscript: pidarska() крутится setInterval(...,80)
  const CRAFT_MS = 350;      // троттл авто-крафта/переработки
  const FIRE_PERIOD_MS = 5000; // холод падает раз в 5с — ставим костёр в этот тайминг
  const STEAL_RADIUS = 300;  // как в oldscript (getDist <= 300)
  const FIRE_IDS = [209, 204]; // BIG_FIRE, FIRE — что найдём в инвентаре, то и ставим

  const active = {
    autosteal: false,
    autobuild: false,
    autofire: false,
    autocraft: false,
    autorecycle: false,
    spectator: false,
  };

  let timer = 0;
  const lastAt = { autofire: 0, autocraft: 0, autorecycle: 0, autobuild: 0 };
  let lastBuildId = -1;       // последний поставленный тип (для Autobuild)
  let lastCraftId = -1;       // последний скрафченный (для AutoCraft)
  let lastRecycleId = -1;     // последний разобранный (для AutoRecycle)
  const warned = Object.create(null);

  // ---- AutoFoodFix: «раскачка» игрового автофуда (R) при спавне --------------
  // В самой игре R включает автофуд (еда/вода/лёд), но он начинает работать
  // корректно только если его несколько раз вкл/выкл и оставить включённым.
  // Делаем это автоматически при появлении своего юнита (спавн/респавн).
  const AUTOFOOD_KEY = 'KeyR';      // игровой хоткей автофуда
  const AUTOFOOD_BLINKS = 4;        // сколько раз вкл/выкл
  const AUTOFOOD_STEP_MS = 160;     // пауза между нажатиями
  const AUTOFOOD_SPAWN_DELAY = 600; // задержка после спавна перед раскачкой
  let autofoodBusy = false;
  let wasAlive = false;
  let autofoodPollTimer = 0;

  function getWorld() { try { const w = window.__SV_WORLD__; return w && typeof w === 'object' ? w : null; } catch (_) { return null; } }
  function getUser() { try { const u = window.__SV_USER__; return u && typeof u === 'object' ? u : null; } catch (_) { return null; } }

  function isUnit(o) {
    return (
      o && typeof o === 'object' && !Array.isArray(o) &&
      typeof o.x === 'number' && typeof o.y === 'number' &&
      typeof o.type === 'number' && typeof o.id === 'number'
    );
  }

  // fast_units (по uid) + units (по типу) — по сигнатуре, как в aimbot.
  function findArrays(world) {
    let fast = null, fastLen = -1, units = null;
    const keys = Object.getOwnPropertyNames(world);
    for (let i = 0; i < keys.length; i++) {
      let v; try { v = world[keys[i]]; } catch (_) { continue; }
      if (!Array.isArray(v)) continue;
      let el = null;
      for (let j = 0; j < v.length; j++) { if (v[j] != null) { el = v[j]; break; } }
      if (isUnit(el)) {
        if (v.length > fastLen) { fast = v; fastLen = v.length; }
      } else if (Array.isArray(el) && el.length && isUnit(el[0])) {
        if (!units) units = v;
      }
    }
    return { fast: fast, units: units };
  }

  function getSelf() {
    const world = getWorld();
    const user = getUser();
    if (!world || !user) return null;
    const f = findArrays(world);
    if (!f.fast || !f.units) return null;
    const uid = user[UID_KEY()];
    if (typeof uid !== 'number') return null;
    const self = f.fast[uid];
    if (!isUnit(self)) return null;
    return { fast: f.fast, units: f.units, uid: uid, self: self, user: user };
  }

  function dist2(a, b) {
    const dx = a.x - b.x, dy = a.y - b.y;
    return dx * dx + dy * dy;
  }

  // ---- Autosteal -------------------------------------------------------------
  function doAutosteal(refs) {
    const r2 = STEAL_RADIUS * STEAL_RADIUS;
    const self = refs.self;
    const units = refs.units;

    function sweep(type, slot) {
      const arr = units[type];
      if (!Array.isArray(arr)) return;
      for (let i = 0; i < arr.length; i++) {
        const u = arr[i];
        if (!isUnit(u)) continue;
        if (dist2(self, u) > r2) continue;
        const pid = u[PID_KEY()];
        if (typeof pid !== 'number') continue;
        SM.protocol.takeFromUnit(slot, pid, u.id);
      }
    }
    sweep(T_CHEST, 'takeChest');
    sweep(T_OVEN, 'takeOven');
    sweep(T_WINDMILL, 'takeFlour');

    if (!warned.autostealInfo) {
      warned.autostealInfo = true;
      const arr = units[T_CHEST];
      let near = 0;
      if (Array.isArray(arr)) for (let i = 0; i < arr.length; i++) {
        const u = arr[i];
        if (isUnit(u) && dist2(self, u) <= r2) near++;
      }
      SM.log('Autosteal: сундуков рядом=' + near + ' (всего units[' + T_CHEST + ']=' + (Array.isArray(arr) ? arr.length : 'нет') + ')');
    }

    for (let t = T_EXTRACTOR_MIN; t <= T_EXTRACTOR_MAX; t++) {
      const arr = units[t];
      if (!Array.isArray(arr)) continue;
      for (let i = 0; i < arr.length; i++) {
        const u = arr[i];
        if (!isUnit(u)) continue;
        if (dist2(self, u) > r2) continue;
        const pid = u[PID_KEY()];
        if (typeof pid !== 'number') continue;
        SM.protocol.takeExtractor(pid, u.id, u.type);
      }
    }
  }

  // ---- Autobuild / AutoFire (постановка по курсору) --------------------------
  function placeIdAtCursor(id) {
    const ang = SM.protocol.getPlaceAngle();
    if (ang == null) return false;
    return SM.protocol.place(id, ang);
  }

  function doAutobuild(now) {
    if (lastBuildId < 0) {
      if (!warned.autobuild) { warned.autobuild = true; SM.warn('Autobuild: сначала поставь любую постройку (запомню тип)'); }
      return;
    }
    if (now - lastAt.autobuild < TICK_MS) return;
    lastAt.autobuild = now;
    placeIdAtCursor(lastBuildId);
  }

  // что ставить: первый костёр, который есть в инвентаре (BIG_FIRE → FIRE)
  function pickFireId() {
    if (!SM.inventory) return FIRE_IDS[0];
    for (let i = 0; i < FIRE_IDS.length; i++) {
      try { if (SM.inventory.count(FIRE_IDS[i]) > 0) return FIRE_IDS[i]; } catch (_) {}
    }
    return null;
  }

  function doAutofire(now) {
    // ставим точно в тайминг падения холода (раз в 5с)
    if (now - lastAt.autofire < FIRE_PERIOD_MS) return;
    const id = pickFireId();
    if (id == null) {
      if (!warned.autofire) { warned.autofire = true; SM.warn('AutoFire: в инвентаре нет костра (FIRE/BIG_FIRE)'); }
      return;
    }
    if (placeIdAtCursor(id)) {
      lastAt.autofire = now;
      warned.autofire = false;
    } else if (!warned.autofire) {
      warned.autofire = true;
      SM.warn('AutoFire: наведи курсор на canvas (нужен угол постановки)');
    }
  }

  // ---- AutoCraft / AutoRecycle (последний предмет) --------------------------
  function doAutocraft(now) {
    if (lastCraftId < 0) {
      if (!warned.autocraft) { warned.autocraft = true; SM.warn('AutoCraft: сначала скрафти что-нибудь вручную (запомню рецепт)'); }
      return;
    }
    if (now - lastAt.autocraft < CRAFT_MS) return;
    lastAt.autocraft = now;
    if (SM.features.autoFood && SM.features.autoFood.beforeCraft) {
      SM.features.autoFood.beforeCraft();
    }
    SM.protocol.craft(lastCraftId);
  }

  function doAutorecycle(now) {
    if (lastRecycleId < 0) {
      if (!warned.autorecycle) { warned.autorecycle = true; SM.warn('AutoRecycle: сначала разбери что-нибудь вручную (запомню предмет)'); }
      return;
    }
    if (now - lastAt.autorecycle < CRAFT_MS) return;
    lastAt.autorecycle = now;
    SM.protocol.recycle(lastRecycleId);
  }

  // ---- DropSword (одноразовое действие) -------------------------------------
  function dropSword() {
    const refs = getSelf();
    if (!refs) { SM.warn('DropSword: не в игре'); return; }
    const right = refs.self.right;
    if (typeof right !== 'number' || right <= 0) { SM.warn('DropSword: в руке нет оружия'); return; }
    if (SM.protocol.opcodes.get('drop') == null) {
      SM.warn('DropSword: опкод drop не задан — захвати его (Net → Capture: drop)');
      return;
    }
    SM.protocol.drop(right);
    SM.log('DropSword: выброшено оружие id=' + right);
  }

  // ---- Spectator (свободная камера, WASD) -----------------------------------
  // Как в oldscript (57246+): user.cam.x/y += speed; ease/focus глушатся в спектаторе.
  // Прямая запись cam.x/y без зеркалирования полей (ломало viewport и чанки).
  const specKeys = { KeyW: 0, KeyA: 0, KeyS: 0, KeyD: 0 };
  let specCam = null;       // ссылка на объект камеры (user.<cam>)
  let specFocusKey = null;  // имя метода разового центрирования (focus, с Math.min)
  let specEaseKey = null;   // имя покадрового метода слежения (ease, с `+=`)
  let specRAF = 0;
  let specUserRef = null;
  let gatesInstalled = false;

  // Объект камеры: числовые x/y + два метода:
  //   focus  — `this.x=-Math.min(Math.max(` (разовый, спавн/телепорт)
  //   ease   — `this.x = start + (target-start)*k` c аккумулятором `+=` (покадровый
  //            follow за персонажем). Именно ease дёргает камеру в спектаторе.
  function findCamObject() {
    const user = getUser();
    if (!user) return null;
    const ks = Object.getOwnPropertyNames(user);
    for (let i = 0; i < ks.length; i++) {
      let o; try { o = user[ks[i]]; } catch (_) { continue; }
      if (!o || typeof o !== 'object' || typeof o.x !== 'number' || typeof o.y !== 'number') continue;
      const fks = Object.getOwnPropertyNames(o);
      let focusKey = null, easeKey = null;
      for (let j = 0; j < fks.length; j++) {
        let fn; try { fn = o[fks[j]]; } catch (_) { continue; }
        if (typeof fn !== 'function') continue;
        let src = ''; try { src = Function.prototype.toString.call(fn); } catch (_) {}
        if (!/this\.x\s*=/.test(src)) continue;
        if (/Math\.min\(Math\.max/.test(src)) focusKey = fks[j];
        else if (/\+=/.test(src) && /\*/.test(src)) easeKey = fks[j];
      }
      if (focusKey || easeKey) {
        specCam = o; specFocusKey = focusKey; specEaseKey = easeKey;
        return o;
      }
    }
    return null;
  }

  function wrapCamMethod(key) {
    if (!specCam || !key) return false;
    const orig = specCam[key];
    if (typeof orig !== 'function') return false;
    if (orig.__svGate) return true;
    const self = specCam;
    const gated = function () {
      if (window.__SV_SPEC__ && this === self) return;
      return orig.apply(this, arguments);
    };
    gated.__svGate = true;
    gated.__svOrig = orig;
    try { specCam[key] = gated; } catch (_) {}
    if (specCam[key] !== gated) {
      try { Object.defineProperty(specCam, key, { value: gated, writable: true, configurable: true }); } catch (_) {}
    }
    return specCam[key] === gated;
  }

  function ensureSpecGates() {
    if (!specCam) return false;
    if (gatesInstalled) return true;
    let ok = false;
    if (specEaseKey) ok = wrapCamMethod(specEaseKey) || ok;
    if (specFocusKey && specFocusKey !== specEaseKey) ok = wrapCamMethod(specFocusKey) || ok;
    gatesInstalled = ok;
    return ok;
  }

  function refreshSpecCam(force) {
    const user = getUser();
    if (!user) return null;
    if (!force && specCam && specUserRef === user) return specCam;
    specUserRef = user;
    const prev = specCam;
    findCamObject();
        if (specCam !== prev) gatesInstalled = false;
    if (specCam) {
      ensureSpecGates();
      try { window.__SV_SPEC_CAM__ = specCam; } catch (_) {}
    }
    return specCam;
  }

  function callOrigFocus(cam, x, y) {
    if (!cam || !specFocusKey) return false;
    const fn = cam[specFocusKey];
    const orig = (fn && fn.__svOrig) || fn;
    if (typeof orig !== 'function') return false;
    try { orig.call(cam, x, y); return true; } catch (_) {}
    try { orig.call(cam, { x: x, y: y }); return true; } catch (_) {}
    return false;
  }

  function specStep() {
    if (!active.spectator) { specRAF = 0; return; }
    if (!specCam || specUserRef !== getUser()) refreshSpecCam(true);
    if (!specCam) {
      specRAF = requestAnimationFrame(specStep);
      return;
    }
    const s = SM.settings.spectatorSpeed || 60;
    if (specKeys.KeyA) specCam.x += s;
    if (specKeys.KeyD) specCam.x -= s;
    if (specKeys.KeyS) specCam.y -= s;
    if (specKeys.KeyW) specCam.y += s;
    specRAF = requestAnimationFrame(specStep);
  }

  function specKeyHandler(e) {
    if (!active.spectator) return;
    if (e.code in specKeys) specKeys[e.code] = (e.type === 'keydown') ? 1 : 0;
  }

  function snapCamToPlayer() {
    refreshSpecCam(true);
    if (!specCam) return false;
    const refs = getSelf();
    if (!refs || !refs.self) return false;
    return callOrigFocus(specCam, refs.self.x, refs.self.y);
  }

  function setSpectator(on) {
    const wasOn = active.spectator;
    // oldscript: UPDATE_CAMERA отправляется, пока спектатор ещё включён
    if (!on && wasOn) {
      try { SM.protocol.updateCamera(); } catch (_) {}
    }

    if (active.spectator && !on) {
      specKeys.KeyW = specKeys.KeyA = specKeys.KeyS = specKeys.KeyD = 0;
      if (specRAF) { cancelAnimationFrame(specRAF); specRAF = 0; }
      try { window.__SV_SPEC_DX__ = 0; window.__SV_SPEC_DY__ = 0; } catch (_) {}
      active.spectator = false;
      try { window.__SV_SPEC__ = false; } catch (_) {}
      try { window.__SV_SPEC_CAM__ = null; } catch (_) {}
      snapCamToPlayer();
      try { SM.protocol.updateCamera(); } catch (_) {}
      try { if (SM.visuals && SM.visuals.invalidate) SM.visuals.invalidate(); } catch (_) {}
      requestAnimationFrame(function () {
        if (active.spectator) return;
        snapCamToPlayer();
        try { SM.protocol.updateCamera(); } catch (_) {}
      });
      SM.log('Spectator OFF');
      return;
    }

    active.spectator = !!on;
    try { window.__SV_SPEC__ = active.spectator; } catch (_) {}
    if (active.spectator) {
      SM.net.ensureInstalled();
      refreshSpecCam(true);
      if (!specRAF) specRAF = requestAnimationFrame(specStep);
      SM.log('Spectator ON (WASD — камера)');
    }
  }

  // ---- HideScript ------------------------------------------------------------
  let hidden = false;
  function setHidden(on) {
    hidden = !!on;
    try { window.__SM_HIDDEN__ = hidden; } catch (_) {}
    const ids = ['starve-mod-root', 'starve-mod-active-binds'];
    for (let i = 0; i < ids.length; i++) {
      const el = document.getElementById(ids[i]);
      if (el) el.style.display = hidden ? 'none' : '';
    }
    SM.bus.emit('ui:hidden', hidden);
    SM.log('HideScript', hidden ? 'спрятан' : 'показан');
  }
  function toggleHidden() { setHidden(!hidden); }

  // ---- AutoFoodFix -----------------------------------------------------------
  // Состояние автофуда читаем по индикатору настройки Auto Eat (R включает группу
  // eat/drink/ice вместе): если картинка-«галочка» скрыта (display:none) — выключено.
  function autofoodOn() {
    const img = document.getElementById('auto_eat_agree_ing');
    if (!img) return null;
    return img.style.display !== 'none';
  }

  // Один игровой тогл автофуда (синтетический R, мод его игнорирует — см. binds).
  function tapAutofood() {
    if (SM.input && SM.input.tapGameKey) SM.input.tapGameKey(AUTOFOOD_KEY);
  }

  // Прокликать автофуд: AUTOFOOD_BLINKS раз вкл/выкл, затем гарантированно оставить
  // включённым (читаем индикатор и при необходимости дожимаем).
  function runAutofoodKick() {
    if (autofoodBusy) return;
    if (!SM.settings.autoFoodFix) return;
    autofoodBusy = true;
    const taps = AUTOFOOD_BLINKS * 2; // полный «мигаю» цикл = 2 нажатия
    let i = 0;
    function step() {
      if (i < taps) {
        tapAutofood();
        i++;
        setTimeout(step, AUTOFOOD_STEP_MS);
        return;
      }
      // финал: убедиться, что автофуд включён
      setTimeout(function () {
        const on = autofoodOn();
        if (on === false) tapAutofood();
        autofoodBusy = false;
        SM.log('AutoFoodFix: автофуд прокликан при спавне (итог: включён)');
      }, AUTOFOOD_STEP_MS);
    }
    step();
  }

  // Поллер спавна: ловим переход «нет своего юнита → есть» (спавн/респавн).
  function autofoodPoll() {
    if (!SM.settings.autoFoodFix) { wasAlive = false; return; }
    const alive = !!getSelf();
    if (alive && !wasAlive) {
      wasAlive = true;
      setTimeout(runAutofoodKick, AUTOFOOD_SPAWN_DELAY);
    } else if (!alive && wasAlive) {
      wasAlive = false; // умер/вышел — перевзведём триггер для следующего спавна
    }
  }

  // ---- главный цикл ----------------------------------------------------------
  function tick() {
    const now = performance.now();
    if (active.autobuild) doAutobuild(now);
    if (active.autofire) doAutofire(now);

    const needRefs = active.autosteal;
    if (needRefs) {
      const refs = getSelf();
      if (refs) {
        if (active.autosteal) doAutosteal(refs);
      }
    }
    if (active.autocraft) doAutocraft(now);
    if (active.autorecycle) doAutorecycle(now);

    if (active.autobuild || active.autofire || active.autosteal || active.autocraft || active.autorecycle) {
      timer = setTimeout(tick, TICK_MS);
    } else {
      timer = 0;
    }
  }

  function ensureLoop() {
    const any = active.autobuild || active.autofire || active.autosteal || active.autocraft || active.autorecycle;
    if (any && !timer) timer = setTimeout(tick, TICK_MS);
  }

  // запоминаем последние действия игрока (для Autobuild/AutoCraft/AutoRecycle).
  // Игнорируем кадры, которые шлёт сам мод в авто-режиме, чтобы «последним» не
  // считался наш же повтор (хотя это и безопасно — id тот же).
  function onOut(frame) {
    try {
      if (frame.text == null) return;
      const v = JSON.parse(frame.text);
      if (!Array.isArray(v) || v.length < 2) return;
      if (typeof v[1] !== 'number') return;
      const op = v[0];
      const ops = SM.protocol.opcodes;
      if (op === ops.get('place')) { lastBuildId = v[1]; }
      else if (op === ops.get('craft') && !active.autocraft) { lastCraftId = v[1]; }
      else if (op === ops.get('recycle') && !active.autorecycle) { lastRecycleId = v[1]; }
    } catch (_) {}
  }

  // ---- публичный API ---------------------------------------------------------
  const LOOP_NAMES = { autosteal: 1, autobuild: 1, autofire: 1, autocraft: 1, autorecycle: 1 };

  function setActive(name, on) {
    if (name === 'spectator') { setSpectator(on); return; }
    if (name === 'xray') { try { window.__SV_XRAY__ = !!on; window.__SV_XRAY_O__ = SM.settings.xrayOpacity; } catch (_) {} return; }
    if (!(name in LOOP_NAMES)) return;
    if (active[name] === !!on) return;
    active[name] = !!on;
    if (on) {
      SM.net.ensureInstalled();
      warned[name] = false;
      if (name === 'autosteal') warned.autostealInfo = false;
      ensureLoop();
      SM.warn('[starve-mod] ' + name + ' ON');
    } else {
      SM.log(name, 'off');
    }
  }

  function trigger(name) {
    if (name === 'dropSword') { dropSword(); return; }
    if (name === 'hideScript') { toggleHidden(); return; }
  }

  function isActive(name) {
    if (name === 'spectator') return active.spectator;
    if (name === 'xray') { try { return !!window.__SV_XRAY__; } catch (_) { return false; } }
    if (name === 'hideScript') return hidden;
    return !!active[name];
  }

  SM.features = SM.features || {};
  SM.features.extra = {
    init: function () {
      SM.bus.on('net:out', onOut);
      window.addEventListener('keydown', specKeyHandler, true);
      window.addEventListener('keyup', specKeyHandler, true);
      // синхронизируем xray-параметры
      setInterval(function () {
        try { if (window.__SV_XRAY__) window.__SV_XRAY_O__ = SM.settings.xrayOpacity; } catch (_) {}
      }, 500);
      // AutoFoodFix: ловим спавн и раскачиваем игровой автофуд (R).
      if (!autofoodPollTimer) autofoodPollTimer = setInterval(autofoodPoll, 500);
      SM.log('extra: модуль загружен');
    },
    setActive: setActive,
    trigger: trigger,
    isActive: isActive,
    setHidden: setHidden,
  };
})(window.__SM__ = window.__SM__ || {});


/* ===== src/features/auto-food.js ===== */
/**
 * features/auto-food.js — свой автофуд (oldscript / NVX):
 *   держит HP/еду/жажду около 50%; AutoIce — лёд при перегреве.
 *   Перед каждым craft-пакетом (в т.ч. AutoCraft) — приоритетная проверка.
 */
;(function (SM) {
  'use strict';

  const TICK_MS = 220;
  const MIN_ACTION_MS = 160;
  const ICE_ID = 235;
  const BANDAGE_ID = 297;

  /** Приоритет еды — berry=110 (INV id; в items.txt имя EMERALD_SWORD — ошибка дампа). */
  const FOOD_IDS = [
    110, // BERRY
    317, 319, 291, 315, 294, 298, 299, 343, 321, 348,
    229, 238, 226, 236,
    207, 230, 302, 208, 231, 201,
  ];
  const FOOD_ID_SET = Object.create(null);
  for (let i = 0; i < FOOD_IDS.length; i++) FOOD_ID_SET[FOOD_IDS[i]] = 1;

  const WATER_IDS = [218, 219, 220];
  const WATER_SET = Object.create(null);
  for (let w = 0; w < WATER_IDS.length; w++) WATER_SET[WATER_IDS[w]] = 1;

  const EDIBLE_NAME = /berry|berr|meat|bread|cake|cookie|sandwich|fish|garlic|carrot|tomato|pumpkin|cactus|juice|crab|stick|watermelon|aloe|potion|bandage|ice|food|comida|еда|ягод/i;

  let pollTimer = 0;
  let lastActionAt = 0;
  let lastTickAt = 0;
  const warned = Object.create(null);
  let canSelectCache = { inv: null, key: null };

  function getUser() {
    try {
      const u = window.__SV_USER__;
      return u && typeof u === 'object' ? u : null;
    } catch (_) {
      return null;
    }
  }

  /** Инвентарь: SM.inventory (сигнатура counts[]) или legacy user.inv. */
  function resolveInv() {
    try {
      if (window.__STARVE_INV__ && typeof window.__STARVE_INV__ === 'object') {
        return window.__STARVE_INV__;
      }
    } catch (_) {}
    if (SM.inventory && SM.inventory.getInv) {
      try {
        const inv = SM.inventory.getInv();
        if (inv) return inv;
      } catch (_) {}
    }
    const user = getUser();
    if (user && user.inv && typeof user.inv === 'object' && !Array.isArray(user.inv)) {
      return user.inv;
    }
    return null;
  }

  function looksLikeCanSelect(arr) {
    if (!Array.isArray(arr) || arr.length === 0 || arr.length > 50) return false;
    let ok = 0;
    for (let i = 0; i < arr.length && i < 12; i++) {
      const e = arr[i];
      if (e && typeof e === 'object' && typeof e.id === 'number') ok++;
    }
    return ok >= 1;
  }

  /** can_select на live-клиенте под обфусцированным ключом (не literal can_select). */
  function discoverCanSelect(inv) {
    if (!inv || typeof inv !== 'object') return [];
    if (canSelectCache.inv === inv && canSelectCache.key && Array.isArray(inv[canSelectCache.key])) {
      return inv[canSelectCache.key];
    }
    if (Array.isArray(inv.can_select)) return inv.can_select;
    let keys;
    try { keys = Object.getOwnPropertyNames(inv); } catch (_) { return []; }
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      let v;
      try { v = inv[k]; } catch (_) { continue; }
      if (looksLikeCanSelect(v)) {
        canSelectCache = { inv: inv, key: k };
        return v;
      }
    }
    return [];
  }

  function itemLabel(e) {
    if (!e) return '';
    const info = e.info;
    if (info && info.name) return String(info.name);
    if (info && info.n) return String(info.n);
    return '';
  }

  function isEdibleId(id, entry) {
    if (typeof id !== 'number') return false;
    if (WATER_SET[id] || id === ICE_ID || id === BANDAGE_ID) return true;
    if (FOOD_ID_SET[id]) return true;
    if (entry) {
      const name = itemLabel(entry).toLowerCase();
      if (name && EDIBLE_NAME.test(name)) return true;
    }
    return false;
  }

  function isFoodId(id, entry) {
    if (WATER_SET[id] || id === ICE_ID || id === BANDAGE_ID) return false;
    return isEdibleId(id, entry);
  }

  function canSelectEntries() {
    return discoverCanSelect(resolveInv());
  }

  function findCanSelect(id) {
    const list = canSelectEntries();
    for (let i = 0; i < list.length; i++) {
      if (list[i] && list[i].id === id) return list[i];
    }
    return null;
  }

  function clamp01(v) {
    return Math.max(0, Math.min(1, v));
  }

  function parseGaugeObject(g) {
    if (!g || typeof g !== 'object') return null;
    const out = {};
    if (typeof g.l === 'number') out.life = clamp01(g.l);
    if (typeof g.h === 'number') out.food = clamp01(g.h);
    if (typeof g.t === 'number') out.thirst = clamp01(g.t);
    if (typeof g.wa === 'number') out.warm = clamp01(g.wa);
    if (typeof g.c === 'number') out.cold = clamp01(g.c);
    if (out.life != null || out.food != null || out.thirst != null) return out;

    const pairs = [];
    let keys;
    try { keys = Object.getOwnPropertyNames(g); } catch (_) { return null; }
    for (let i = 0; i < keys.length; i++) {
      const v = g[keys[i]];
      if (typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1.05) {
        pairs.push({ k: keys[i], v: clamp01(v) });
      }
    }
    if (pairs.length < 3) return null;
    if (pairs.length >= 5) {
      out.life = pairs[0].v;
      out.food = pairs[1].v;
      out.cold = typeof g.c === 'number' ? clamp01(g.c) : pairs[2].v;
      out.thirst = pairs[3].v;
      out.warm = pairs[4].v;
    } else if (pairs.length === 4) {
      out.life = pairs[0].v;
      out.food = pairs[1].v;
      out.cold = typeof g.c === 'number' ? clamp01(g.c) : pairs[2].v;
      out.thirst = pairs[3].v;
    } else {
      out.life = pairs[0].v;
      out.food = pairs[1].v;
      out.thirst = pairs[2].v;
    }
    return out;
  }

  function gaugeObjectScore(g) {
    if (!g || typeof g !== 'object' || Array.isArray(g)) return 0;
    let score = 0;
    if (typeof g.l === 'number') score += 3;
    if (typeof g.h === 'number') score += 3;
    if (typeof g.t === 'number') score += 2;
    if (typeof g.c === 'number') score += 2;
    if (typeof g.wa === 'number') score += 1;
    let nums = 0;
    let keys;
    try { keys = Object.getOwnPropertyNames(g); } catch (_) { return score; }
    for (let i = 0; i < keys.length; i++) {
      const v = g[keys[i]];
      if (typeof v === 'number' && v >= 0 && v <= 1.05) nums++;
    }
    if (nums >= 3) score += nums;
    return score;
  }

  /** gauges на live-клиенте — вложенный объект на user (не literal user.gauges). */
  function discoverGaugesOnUser(user) {
    if (!user || typeof user !== 'object') return null;
    if (user.gauges && typeof user.gauges === 'object') {
      const direct = parseGaugeObject(user.gauges);
      if (direct) return direct;
    }
    let best = null;
    let bestScore = 0;
    let keys;
    try { keys = Object.getOwnPropertyNames(user); } catch (_) { return null; }
    for (let i = 0; i < keys.length; i++) {
      const o = user[keys[i]];
      if (!o || typeof o !== 'object' || Array.isArray(o)) continue;
      const sc = gaugeObjectScore(o);
      if (sc > bestScore) {
        bestScore = sc;
        best = o;
      }
    }
    if (best && bestScore >= 4) return parseGaugeObject(best);
    return null;
  }

  function readGauges() {
    const bars = SM.barGauges && SM.barGauges.read ? SM.barGauges.read() : null;
    if (SM.gaugeKeys && SM.gaugeKeys.readAll) {
      const fromKeys = SM.gaugeKeys.readAll(null, bars, { discover: true, preferBar: true });
      if (fromKeys && (fromKeys.life != null || fromKeys.food != null || fromKeys.thirst != null)) {
        return fromKeys;
      }
    }

    const user = getUser();
    const fromUser = discoverGaugesOnUser(user);
    if (fromUser) return fromUser;

    if (bars && (bars.life != null || bars.food != null || bars.thirst != null)) return bars;
    return null;
  }

  function target() {
    const t = SM.settings.autoFoodTarget;
    return typeof t === 'number' && t > 0 && t < 1 ? t : 0.5;
  }

  function isAlive() {
    const user = getUser();
    if (!user) return false;
    if (user.alive === false) return false;
    return true;
  }

  function invCount(id) {
    if (!SM.inventory || !SM.inventory.count) return 0;
    try { return SM.inventory.count(id) || 0; } catch (_) { return 0; }
  }

  function hasItem(id) {
    if (invCount(id) > 0) return true;
    const inv = resolveInv();
    if (!inv) return false;
    if (typeof inv.find_item === 'function') {
      try {
        const r = inv.find_item(id);
        if (r !== -1 && r != null && r !== false) return true;
      } catch (_) {}
    }
    const list = discoverCanSelect(inv);
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      if (e && e.id === id) return true;
    }
    return false;
  }

  function pickFromCanSelect() {
    const list = canSelectEntries();
    for (let f = 0; f < FOOD_IDS.length; f++) {
      const want = FOOD_IDS[f];
      for (let i = 0; i < list.length; i++) {
        const e = list[i];
        if (e && e.id === want) return want;
      }
    }
    for (let j = 0; j < list.length; j++) {
      const e = list[j];
      if (e && typeof e.id === 'number' && isFoodId(e.id, e)) return e.id;
    }
    return null;
  }

  function pickFromCounts() {
    if (!SM.inventory || !SM.inventory.clientMap) return null;
    let map;
    try { map = SM.inventory.clientMap(); } catch (_) { return null; }
    if (!map) return null;
    for (let k = 0; k < FOOD_IDS.length; k++) {
      if (map[FOOD_IDS[k]] > 0) return FOOD_IDS[k];
    }
    const ids = Object.keys(map);
    for (let i = 0; i < ids.length; i++) {
      const id = +ids[i];
      if (!(map[id] > 0) || !Number.isFinite(id)) continue;
      if (isFoodId(id, findCanSelect(id))) return id;
    }
    return null;
  }

  function pickFoodId() {
    const list = canSelectEntries();
    for (let j = 0; j < list.length; j++) {
      const e = list[j];
      if (e && isFoodId(e.id, e)) return e.id;
    }
    const fromSelect = pickFromCanSelect();
    if (fromSelect != null) return fromSelect;
    for (let i = 0; i < FOOD_IDS.length; i++) {
      if (hasItem(FOOD_IDS[i])) return FOOD_IDS[i];
    }
    return pickFromCounts();
  }

  function pickWaterId() {
    for (let i = 0; i < WATER_IDS.length; i++) {
      if (hasItem(WATER_IDS[i])) return WATER_IDS[i];
    }
    return null;
  }

  function tempScore(g) {
    const c = typeof g.cold === 'number' ? g.cold : 0;
    const wa = typeof g.warm === 'number' ? g.warm : 0;
    return Math.floor(c * 100) + Math.floor((1 - wa) * 100);
  }

  function foodEnabled() {
    if (SM.settings.autoFood) return true;
    if (SM.settings.autoFoodWithCraft === false) return false;
    const ex = SM.features && SM.features.extra;
    return !!(ex && ex.isActive && ex.isActive('autocraft'));
  }

  function shouldRun() {
    return foodEnabled() || !!SM.settings.autoIce;
  }

  function foodNeeds(thr, value) {
    if (value == null) return false;
    return value < thr + 0.004;
  }

  function consume(id, opts) {
    opts = opts || {};
    if (!SM.protocol || !SM.protocol.consumeItem) return false;
    if (!opts.force && performance.now() - lastActionAt < MIN_ACTION_MS) return false;
    if (!hasItem(id)) return false;
    if (!SM.protocol.consumeItem(id)) return false;
    lastActionAt = performance.now();
    return true;
  }

  function buildActions(gauges, thr, doFood, doIce) {
    const actions = [];
    if (doFood) {
      if (gauges.life != null && foodNeeds(thr, gauges.life) && hasItem(BANDAGE_ID)) {
        actions.push({ id: BANDAGE_ID, kind: 'bandage' });
      }
      if (foodNeeds(thr, gauges.food)) {
        const food = pickFoodId();
        if (food != null) actions.push({ id: food, kind: 'food' });
        else if (!warned.food) {
          warned.food = true;
          SM.warn('AutoFood: еда ниже ' + Math.round(thr * 100) + '%, в инвентаре нет еды');
        }
      } else {
        warned.food = false;
      }
      if (foodNeeds(thr, gauges.thirst)) {
        const water = pickWaterId();
        if (water != null) actions.push({ id: water, kind: 'water' });
        else if (!warned.water) {
          warned.water = true;
          SM.warn('AutoFood: жажда ниже ' + Math.round(thr * 100) + '%, нет воды (BOTTLE_FULL)');
        }
      } else {
        warned.water = false;
      }
    }
    if (doIce && hasItem(ICE_ID)) {
      const temp = tempScore(gauges);
      const tempTarget = Math.round(thr * 200);
      const warm = gauges.warm;
      if (temp > tempTarget + 4 || (typeof warm === 'number' && warm > thr + 0.04)) {
        actions.push({ id: ICE_ID, kind: 'ice' });
      }
    }
    return actions;
  }

  /** Одна итерация автофуда. Возвращает true, если что-то использовали. */
  function tick(opts) {
    opts = opts || {};
    const forced = !!opts.force;

    if (!forced && !shouldRun()) return false;
    if (!isAlive()) return false;

    const now = performance.now();
    if (!forced && now - lastTickAt < TICK_MS) return false;
    lastTickAt = now;

    if (SM.barGauges && SM.barGauges.install) SM.barGauges.install();

    const gauges = readGauges();
    if (!gauges) {
      if (!warned.gauges) {
        warned.gauges = true;
        SM.warn('AutoFood: нет gauges (зайди в игру, дождись HUD-баров)');
      }
      return false;
    }
    warned.gauges = false;

    const thr = target();
    const doFood = forced || foodEnabled();
    const doIce = !forced && !!SM.settings.autoIce;
    const actions = buildActions(gauges, thr, doFood, doIce || (forced && !!SM.settings.autoIce));

    if (!actions.length) return false;

    let used = false;
    for (let i = 0; i < actions.length; i++) {
      if (consume(actions[i].id, opts)) used = true;
    }
    return used;
  }

  function craftInfo() {
    const user = getUser();
    const craft = user && user.craft;
    if (!craft) return null;
    const key = SM.protocol && SM.protocol._craftSelKey;
    const out = { key: key || null, value: key ? craft[key] : undefined };
    if (out.value === undefined) {
      const keys = Object.getOwnPropertyNames(craft);
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (k === 'mode' || k === 'crafting') continue;
        const v = craft[k];
        if (typeof v === 'number' && v >= -1 && v <= 400) {
          out.key = k;
          out.value = v;
          break;
        }
      }
    }
    return out;
  }

  function diagnose() {
    const gauges = readGauges();
    const thr = target();
    const ws = SM.net && SM.net.socket;
    const inv = resolveInv();
    const list = canSelectEntries();
    const edible = [];
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      if (!e || typeof e.id !== 'number') continue;
      if (isEdibleId(e.id, e)) edible.push({ id: e.id, name: itemLabel(e) });
    }
    let invMap = null;
    if (SM.inventory && SM.inventory.clientMap) {
      try { invMap = SM.inventory.clientMap(); } catch (_) {}
    }
    return {
      autoFood: !!SM.settings.autoFood,
      autoIce: !!SM.settings.autoIce,
      shouldRun: shouldRun(),
      foodEnabled: foodEnabled(),
      alive: isAlive(),
      target: thr,
      gauges: gauges,
      foodLow: gauges ? foodNeeds(thr, gauges.food) : null,
      pickFood: pickFoodId(),
      berryCount: invCount(110),
      invResolved: !!inv,
      invDiscovery: SM.inventory && SM.inventory.getDiscoveryMeta ? SM.inventory.getDiscoveryMeta() : null,
      edibleInSelect: edible,
      ownedEdible: invMap ? FOOD_IDS.filter(function (id) { return invMap[id] > 0; }) : [],
      craft: craftInfo(),
      wsReady: ws ? ws.readyState === 1 : false,
      useItemOp: SM.protocol && SM.protocol.consumeOpcode ? SM.protocol.consumeOpcode() : null,
      learnedUseOp: SM.protocol && SM.protocol._learnedUseOp,
      previewActions: gauges ? buildActions(gauges, thr, true, false) : [],
      barGauges: SM.barGauges && SM.barGauges._debug ? SM.barGauges._debug() : null,
    };
  }

  function beforeCraft() {
    if (!shouldRun()) return;
    tick({ force: true });
  }

  function syncPoll() {
    if (!shouldRun()) return;
    tick();
  }

  function ensurePoll() {
    if (pollTimer) return;
    pollTimer = setInterval(syncPoll, TICK_MS);
  }

  SM.features = SM.features || {};
  SM.features.autoFood = {
    init: function () {
      ensurePoll();
      SM.log('auto-food: модуль загружен (target=' + Math.round(target() * 100) + '%)');
    },
    tick: tick,
    beforeCraft: beforeCraft,
    readGauges: readGauges,
    pickFoodId: pickFoodId,
    hasItem: hasItem,
    isEdibleId: function (id) {
      return isEdibleId(id, findCanSelect(id));
    },
    diagnose: diagnose,
  };
})(window.__SM__ = window.__SM__ || {});


/* ===== src/features/smart-craft.js ===== */
/**
 * features/smart-craft.js — SmartCraft (как NVX):
 *   крафт цепочки рецептов к выбранной цели; remaining уменьшается по факту в инвентаре.
 */
;(function (SM) {
  'use strict';

  const TICK_MS = 120;
  const SEND_GAP_MS = 200;
  const MAX_DEPTH = 8;

  /** Запасной список целей (id из items.txt), если рецепты игры ещё не найдены. */
  const FALLBACK_NAME_TO_ID = {
    'Wood Spike': 262, 'Stone Spike': 270, 'Gold Spike': 271, 'Diamond Spike': 272,
    'Amethyst Spike': 214, 'Reidite Spike': 329,
    'Wood Door Spike': 322, 'Stone Door Spike': 323, 'Gold Door Spike': 324,
    'Diamond Door Spike': 325, 'Amethyst Door Spike': 326, 'Reidite Door Spike': 330,
    'Wood Wall': 264, 'Stone Wall': 265, 'Gold Wall': 266, 'Diamond Wall': 267,
    'Amethyst Wall': 213, 'Reidite Wall': 327,
    'Wood Door': 268, 'Stone Door': 273, 'Gold Door': 274, 'Diamond Door': 275,
    'Amethyst Door': 215, 'Reidite Door': 328,
    'Wood Sword': 103, 'Stone Sword': 0, 'Gold Sword': 5, 'Diamond Sword': 6,
    'Amethyst Sword': 48, 'Reidite Sword': 28,
    'Wood Spear': 12, 'Stone Spear': 13, 'Gold Spear': 14, 'Diamond Spear': 15,
    'Reidite Spear': 61,
  };

  let pollTimer = 0;
  let recipesCache = undefined;
  let nameToIdCache = null;
  let lastTargetCount = null;
  let lastSendAt = 0;
  let lastTargetKey = '';

  function getUser() {
    try {
      const u = window.__SV_USER__;
      return u && typeof u === 'object' ? u : null;
    } catch (_) {
      return null;
    }
  }

  function isCrafting(user) {
    if (!user) return false;
    if (user.crafting) return true;
    const craft = user.craft;
    return !!(craft && craft.crafting);
  }

  function invCounts(user) {
    const inv = user && user.inv;
    return inv && inv.n && typeof inv.n === 'object' ? inv.n : null;
  }

  function invCount(user, id) {
    const n = invCounts(user);
    if (n && typeof n[id] === 'number') return n[id];
    if (SM.inventory && SM.inventory.count) {
      try { return SM.inventory.count(id) || 0; } catch (_) {}
    }
    return 0;
  }

  function canCraftList(user) {
    const craft = user && user.craft;
    return craft && Array.isArray(craft.can_craft) ? craft.can_craft : [];
  }

  function looksLikeRecipes(arr) {
    if (!Array.isArray(arr) || arr.length < 15) return false;
    let ok = 0;
    for (let i = 0; i < Math.min(arr.length, 40); i++) {
      const e = arr[i];
      if (e && typeof e.id === 'number' && Array.isArray(e.r) && e.r.length && Array.isArray(e.r[0])) ok++;
    }
    return ok >= 8;
  }

  function findRecipesArray() {
    if (recipesCache !== undefined) return recipesCache;
    recipesCache = null;
    try {
      const game = window.__SV_GAME__;
      if (game && typeof game === 'object') {
        const keys = Object.getOwnPropertyNames(game);
        for (let i = 0; i < keys.length; i++) {
          const v = game[keys[i]];
          if (looksLikeRecipes(v)) { recipesCache = v; return v; }
        }
      }
    } catch (_) {}
    try {
      const keys = Object.getOwnPropertyNames(window);
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (k.indexOf('__') === 0) continue;
        let v;
        try { v = window[k]; } catch (_) { continue; }
        if (looksLikeRecipes(v)) { recipesCache = v; return v; }
      }
    } catch (_) {}
    return null;
  }

  function itemDisplayName(id) {
    try {
      const game = window.__SV_GAME__;
      if (!game) return null;
      const keys = Object.getOwnPropertyNames(game);
      for (let i = 0; i < keys.length; i++) {
        const bucket = game[keys[i]];
        if (!bucket || typeof bucket !== 'object') continue;
        const e = bucket[id];
        if (!e) continue;
        if (e.info && e.info.name) return String(e.info.name);
        if (typeof e.name === 'string') return e.name;
      }
    } catch (_) {}
    return null;
  }

  function buildNameMap() {
    if (nameToIdCache) return nameToIdCache;
    const map = Object.assign(Object.create(null), FALLBACK_NAME_TO_ID);
    const recipes = findRecipesArray();
    if (recipes) {
      for (let i = 0; i < recipes.length; i++) {
        const rec = recipes[i];
        if (!rec || typeof rec.id !== 'number' || !Array.isArray(rec.r)) continue;
        const name = itemDisplayName(rec.id);
        if (name && !map[name]) map[name] = rec.id;
      }
    }
    nameToIdCache = map;
    return map;
  }

  function getOptions() {
    const map = buildNameMap();
    return Object.keys(map).sort(function (a, b) {
      return a.localeCompare(b, undefined, { sensitivity: 'base' });
    });
  }

  function getTargetId() {
    const map = buildNameMap();
    const name = SM.settings.smartCraftTargetName;
    if (name && map[name] != null) return map[name];
    return map['Reidite Spike'] != null ? map['Reidite Spike'] : null;
  }

  function findRecipe(id) {
    const recipes = findRecipesArray();
    if (!recipes) return null;
    for (let i = 0; i < recipes.length; i++) {
      const rec = recipes[i];
      if (!rec || !Array.isArray(rec.r)) continue;
      if (rec.id === id || rec.var_6044 === id) return rec;
    }
    return null;
  }

  function computeLeafCost(itemId, qty, depth, out) {
    if (!out) out = Object.create(null);
    if (depth == null) depth = 0;
    if (depth > MAX_DEPTH) return out;
    const rec = findRecipe(itemId);
    if (!rec) {
      out[itemId] = (out[itemId] || 0) + qty;
      return out;
    }
    for (let i = 0; i < rec.r.length; i++) {
      const pair = rec.r[i];
      if (!pair || pair.length < 2) continue;
      computeLeafCost(pair[0], pair[1] * qty, depth + 1, out);
    }
    return out;
  }

  function formatCostHtml() {
    const targetId = getTargetId();
    if (targetId == null) return '—';
    const want = Math.max(1, Number(SM.settings.smartCraftCount) || 1);
    const cost = computeLeafCost(targetId, want);
    const user = getUser();
    const parts = [];
    const keys = Object.keys(cost);
    for (let i = 0; i < keys.length; i++) {
      const id = Number(keys[i]);
      const need = cost[id];
      const have = invCount(user, id);
      const label = itemDisplayName(id) || ('#' + id);
      const line = label + ': ' + need;
      parts.push(have < need ? '<span style="color:#f87171">' + line + '</span>' : line);
    }
    return parts.length ? parts.join(', ') : '—';
  }

  function resetProgress() {
    lastTargetCount = null;
    lastSendAt = 0;
  }

  function targetKey() {
    return String(SM.settings.smartCraftTargetName || '') + '|' + String(SM.settings.smartCraftCount || 0);
  }

  function buildDependencyDepths(rootId) {
    const depths = new Map();
    const queue = [[rootId, 0]];
    while (queue.length) {
      const pair = queue.shift();
      const id = pair[0];
      const depth = pair[1];
      if (depths.has(id)) continue;
      if (depth > MAX_DEPTH) continue;
      depths.set(id, depth);
      const rec = findRecipe(id);
      if (!rec) continue;
      for (let i = 0; i < rec.r.length; i++) {
        const ing = rec.r[i];
        if (!ing || ing.length < 2) continue;
        queue.push([ing[0], depth + 1]);
      }
    }
    return depths;
  }

  function pickNextCraft(depths, user) {
    const list = canCraftList(user);
    let bestId = null;
    let bestDepth = Infinity;
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      if (!e || typeof e.id !== 'number') continue;
      if (!depths.has(e.id)) continue;
      const d = depths.get(e.id);
      if (d < bestDepth) {
        bestDepth = d;
        bestId = e.id;
      }
    }
    return bestId;
  }

  function tick() {
    if (!SM.settings.smartCraft) return false;
    const user = getUser();
    if (!user || !user.inv) return false;

    const targetId = getTargetId();
    if (targetId == null) return false;

    const key = targetKey();
    if (key !== lastTargetKey) {
      lastTargetKey = key;
      resetProgress();
    }

    let remaining = Math.max(0, Number(SM.settings.smartCraftCount) | 0);
    if (remaining <= 0) return false;

    const haveTarget = invCount(user, targetId);
    if (lastTargetCount == null) {
      lastTargetCount = haveTarget;
    } else {
      const delta = haveTarget - lastTargetCount;
      if (delta > 0) {
        remaining = Math.max(0, remaining - delta);
        SM.settings.smartCraftCount = remaining;
        SM.storage.save();
        SM.bus.emit('smartCraft:update');
      }
      lastTargetCount = haveTarget;
    }

    if (SM.settings.smartCraftCount <= 0) return false;
    if (isCrafting(user)) return false;

    const now = Date.now();
    if (now - lastSendAt < SEND_GAP_MS) return false;

    const depths = buildDependencyDepths(targetId);
    const nextId = pickNextCraft(depths, user);
    if (nextId == null) return false;

    if (SM.features.autoFood && SM.features.autoFood.beforeCraft) {
      SM.features.autoFood.beforeCraft();
    }

    if (!SM.protocol || !SM.protocol.craft) return false;
    if (!SM.protocol.craft(nextId)) return false;

    lastSendAt = now;
    SM.net.ensureInstalled();
    return true;
  }

  function syncPoll() {
    tick();
  }

  function ensurePoll() {
    if (pollTimer) return;
    pollTimer = setInterval(syncPoll, TICK_MS);
  }

  function invalidateRecipes() {
    recipesCache = undefined;
    nameToIdCache = null;
  }

  SM.features = SM.features || {};
  SM.features.smartCraft = {
    init: function () {
      ensurePoll();
      SM.log('smart-craft: модуль загружен');
    },
    tick: tick,
    getOptions: getOptions,
    getTargetId: getTargetId,
    formatCostHtml: formatCostHtml,
    resetProgress: resetProgress,
    invalidateRecipes: invalidateRecipes,
    findRecipe: findRecipe,
    computeLeafCost: computeLeafCost,
  };
})(window.__SM__ = window.__SM__ || {});


/* ===== src/features/color-spike.js ===== */
/**
 * features/color-spike.js — замена текстур построек (spike / spike_door / door)
 * ally/enemy из выбранного пака.
 *
 * МЕХАНИЗМ (исправленный): один хук __SV_CS__ на чтении реестра спрайтов.
 *   Лоадер оборачивает каждое чтение IMG = REG[id][..][WORLD.time] в
 *       IMG = (window.__SV_CS__ && window.__SV_CS__(this, id, IMG_DEFAULT)) || IMG_DEFAULT
 *   То есть наш хук получает (unit, spriteId, дефолтная_картинка) и может ВЕРНУТЬ
 *   готовую картинку — она подставляется ВМЕСТО финального значения. За счёт этого
 *   работает и для 2-индексных спайков (REG[id][time]), и для 3-индексных дверей
 *   (REG[id][info][time]) — мы подменяем итоговую картинку, не трогая средние индексы.
 *
 *   DT-подмена sprite-id (__SV_CS_DT__) НЕ используется намеренно: она перезаписывала
 *   spriteId на кастомный слот, из-за чего этот хук переставал узнавать постройку,
 *   а кастомные слоты ломались на 3-индексных дверях.
 *
 * ИДЕНТИФИКАЦИЯ ПОСТРОЙКИ — только WORLD_TYPE_META[entity.type] (world_ids.txt).
 *   Хук REG общий для всех unit.draw (в т.ч. мобов), поэтому НЕ используем
 *   __SV_ENTDEFS__[type].id: индекс манифеста ≠ мировой type → мобы ошибочно
 *   получали текстуры amethyst/reidite spike. Дополнительно: pid>0 (владелец).
 *
 * СВОЙ/ВРАГ — ровно как сам клиент: unit.<PID> === user.id || user.<TEAM>.includes(unit.<PID>).
 */
;(function (SM) {
  'use strict';

  // Ключи полей сущности/игрока резолвятся в рантайме (SM.keys) — переживают
  // автообновление клиента. user.id — НЕ обфусцирован (клиент сравнивает unit.<PID> !== user.id).
  function PID_KEY() { return (SM.keys && SM.keys.pid()) || 'Іᄃᴎ'; }
  function TEAM_KEY() { return (SM.keys && SM.keys.team()) || 'ϲᚂᄅ'; }

  // Карта построек по ЧИСЛОВОМУ инвентарному item-id (его берём из манифеста,
  // см. itemIdOf). Мапим напрямую по числам — надёжнее обфусцированных ключей и
  // переживает переобфускацию клиента (item-id в items.txt стабильны).
  //
  // Источник истины — items.txt:
  //   спайки:      SPIKE 262, STONE 270, GOLD 271, DIAMOND 272, AMETHYST 214, REIDITE 329
  //   спайк-двери: WOOD_DOOR_SPIKE 322, STONE 323, GOLD 324, DIAMOND 325, AMETHYST 326, REIDITE 330
  //   двери:       WOOD_DOOR 268, STONE 273, GOLD 274, DIAMOND 275, AMETHYST 215, REIDITE 328
  // Мировой unit.type (world_ids.txt) → tier/category. Надёжнее item-id из манифеста:
  // индексы протокола стабильны, а defs[type].id может не совпасть с items.txt.
  const WORLD_TYPE_META = {
    5:  { tier: 'wood',     category: 'spike' },
    12: { tier: 'stone',    category: 'spike' },
    13: { tier: 'gold',     category: 'spike' },
    14: { tier: 'diamond',  category: 'spike' },
    20: { tier: 'amethyst', category: 'spike' },
    61: { tier: 'reidite',  category: 'spike' },
    54: { tier: 'wood',     category: 'spike_door' },
    55: { tier: 'stone',    category: 'spike_door' },
    56: { tier: 'gold',     category: 'spike_door' },
    57: { tier: 'diamond',  category: 'spike_door' },
    58: { tier: 'amethyst', category: 'spike_door' },
    62: { tier: 'reidite',  category: 'spike_door' },
    10: { tier: 'wood',     category: 'door' },
    15: { tier: 'stone',    category: 'door' },
    16: { tier: 'gold',     category: 'door' },
    17: { tier: 'diamond',  category: 'door' },
    21: { tier: 'amethyst', category: 'door' },
    60: { tier: 'reidite',  category: 'door' },
    11: { tier: 'wood',     category: 'chest' },
  };

  // ---- числовые коды для бесаллокационного горячего пути -------------------
  // Раньше onDraw собирал строковый ключ кэша на КАЖДЫЙ спайк В КАЖДОМ кадре
  // (t+':'+tier+':'+...). На большой базе это тысячи строк/кадр → GC → просадка
  // FPS. Теперь tier/category закодированы числами, текстуры лежат в плоском
  // массиве texArr[idx] — ноль аллокаций в горячем пути.
  const TIER_CODE = { wood: 0, stone: 1, gold: 2, diamond: 3, amethyst: 4, reidite: 5 };
  const CAT_SPIKE = 0, CAT_DOOR = 1, CAT_SPIKE_DOOR = 2, CAT_CHEST = 3;
  const CAT_CODE = { spike: CAT_SPIKE, door: CAT_DOOR, spike_door: CAT_SPIKE_DOOR, chest: CAT_CHEST };
  const CAT_NAME = ['spike', 'door', 'spike_door', 'chest'];

  // type → код тира/категории (только постройки colorSpike, не стены/мобы)
  const TYPE_TIER = Object.create(null);
  const TYPE_CAT = Object.create(null);
  (function () {
    for (const t in WORLD_TYPE_META) {
      const m = WORLD_TYPE_META[t];
      TYPE_TIER[t] = TIER_CODE[m.tier];
      TYPE_CAT[t] = CAT_CODE[m.category];
    }
  })();

  // texArr[((tierCode*3 + catCode)*2 + ally)] = Image (категории 0..2: spike/door/spike_door)
  const texArr = new Array(36).fill(null);
  function rebuildTexArr() {
    for (const tier in TIER_CODE) {
      const tc = TIER_CODE[tier];
      for (let cc = 0; cc <= 2; cc++) {
        const cat = CAT_NAME[cc];
        for (let ally = 0; ally < 2; ally++) {
          const img = texTable[tier + '|' + cat + '|' + (ally ? 'ally' : 'enemy')];
          texArr[((tc * 3 + cc) * 2 + ally)] = img || null;
        }
      }
    }
  }

  const SPRITE_ID_META = {
    // спайки
    262: { tier: 'wood',     category: 'spike' },
    270: { tier: 'stone',    category: 'spike' },
    271: { tier: 'gold',     category: 'spike' },
    272: { tier: 'diamond',  category: 'spike' },
    214: { tier: 'amethyst', category: 'spike' },
    329: { tier: 'reidite',  category: 'spike' },

    // спайк-двери (DOOR_SPIKE)
    322: { tier: 'wood',     category: 'spike_door' },
    323: { tier: 'stone',    category: 'spike_door' },
    324: { tier: 'gold',     category: 'spike_door' },
    325: { tier: 'diamond',  category: 'spike_door' },
    326: { tier: 'amethyst', category: 'spike_door' },
    330: { tier: 'reidite',  category: 'spike_door' },

    // двери
    268: { tier: 'wood',     category: 'door' },
    273: { tier: 'stone',    category: 'door' },
    274: { tier: 'gold',     category: 'door' },
    275: { tier: 'diamond',  category: 'door' },
    215: { tier: 'amethyst', category: 'door' },
    328: { tier: 'reidite',  category: 'door' },
  };

  // Эталонные средние цвета тиров (для авто-определения в дискавери). Грубо.
  const TIER_COLORS = {
    wood:     [124, 86, 52],
    stone:    [136, 138, 142],
    gold:     [222, 178, 64],
    diamond:  [110, 205, 222],
    amethyst: [150, 92, 196],
    reidite:  [206, 70, 96],
  };

  // Сундук: spriteId == инвентарный id (items.txt: CHEST=269). Перекрашиваем его
  // текстуру (зелёная/красная обводка по силуэту) в зависимости от доступности —
  // как NVX подменяет текстуру. Работает независимо от colorSpike, по тумблеру
  // ChestInfo. Доступность 1:1 как oldscript: открыт | мой | тиммейт(в тотеме).
  const CHEST_SPRITE_ID = 269;
  const CHEST_COL_GREEN = '#3df06a'; // доступен
  const CHEST_COL_RED = '#ff3b3b';   // заперт чужой

  function chestColorOn() { try { return !!SM.settings.chestInfo; } catch (_) { return false; } }

  // Кэш сгенерированных обводок: исходная картинка → { '#color': canvas }.
  // Ключ — сам объект картинки (день/ночь = разные объекты), поэтому WeakMap.
  const _outlineCache = (typeof WeakMap !== 'undefined') ? new WeakMap() : null;

  function outlinedImage(img, color) {
    const w = img.width || img.naturalWidth;
    const h = img.height || img.naturalHeight;
    if (!w || !h) return null;
    let rec = _outlineCache && _outlineCache.get(img);
    if (rec && rec[color]) return rec[color];
    let can, cx, sil, sc;
    try {
      can = document.createElement('canvas'); can.width = w; can.height = h;
      cx = can.getContext('2d');
      // тонированный силуэт картинки (source-in заливает непрозрачные пиксели цветом)
      sil = document.createElement('canvas'); sil.width = w; sil.height = h;
      sc = sil.getContext('2d');
      sc.drawImage(img, 0, 0, w, h);
      sc.globalCompositeOperation = 'source-in';
      sc.fillStyle = color;
      sc.fillRect(0, 0, w, h);
      // штампуем силуэт со смещением в 8 направлениях → обводка
      const o = Math.max(2, Math.round(Math.min(w, h) * 0.05));
      const dirs = [[-o, 0], [o, 0], [0, -o], [0, o], [-o, -o], [o, -o], [-o, o], [o, o]];
      for (let i = 0; i < dirs.length; i++) cx.drawImage(sil, dirs[i][0], dirs[i][1], w, h);
      // оригинальная текстура поверх
      cx.drawImage(img, 0, 0, w, h);
    } catch (_) { return null; }
    if (_outlineCache) {
      if (!rec) { rec = Object.create(null); _outlineCache.set(img, rec); }
      rec[color] = can;
    }
    return can;
  }

  function chestRecolor(entity, defaultImg) {
    if (!defaultImg || !(defaultImg.width | defaultImg.naturalWidth)) return null;
    const accessible = !entity.lock || isAllyPid(ownerPid(entity));
    return outlinedImage(defaultImg, accessible ? CHEST_COL_GREEN : CHEST_COL_RED);
  }

  const state = {
    enabled: false,
    packId: 'type1',
    installed: false,
    mapsReady: false,
  };

  const images = Object.create(null);
  let loadedPackId = null;
  const SPRITE_ID_MAP = Object.create(null);

  // Быстрый lookup текстур пака (tier|category|ally|enemy → Image).
  const texTable = Object.create(null);
  let _pidK = null;
  let csOn = 0;
  let chestOn = 0; // кэш chestColorOn(), обновляется в syncCsSkipFlag

  // Кэш ally/enemy по pid (сбрасывается раз в ~кадр по timestamp).
  let allyCache = Object.create(null);
  let allyCacheMs = 0;

  const diag = {
    hookRaw: 0,
    calls: 0,
    recolored: 0,
    buildingCalls: 0,
    skippedNoInfo: 0,
    skippedNoPid: 0,
    skippedNoTex: 0,
    mappedHits: Object.create(null),
  };
  // дискавери: spriteId -> { count, color, tier, hasPid }
  const discovery = Object.create(null);

  function getWorld() { try { return window.__SV_WORLD__ || null; } catch (_) { return null; } }
  function getUser() { try { return window.__SV_USER__ || null; } catch (_) { return null; } }
  function discoverOn() { try { return !!window.__SV_CS_DISCOVER__; } catch (_) { return false; } }

  // ---- пак текстур ----------------------------------------------------------
  function loadPack(packId) {
    if (!SM.texturePacks) { SM.warn('colorSpike: texturePacks не загружен'); return; }
    const pack = SM.texturePacks.getPack(packId);
    if (!pack) { SM.warn('colorSpike: пак не найден', packId); return; }
    for (const k in images) delete images[k];
    for (const k in texTable) delete texTable[k];
    SM.texturePacks.entries().forEach(function (e) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = SM.texturePacks.urlFor(pack, e, false);
      images[e.key] = img;
      texTable[e.key] = img;
    });
    rebuildTexArr();
    loadedPackId = packId;
    SM.log('colorSpike: пак загружается', packId, '(' + Object.keys(images).length + ' текстур)');
  }

  function ensurePackLoaded() {
    if (loadedPackId !== state.packId) loadPack(state.packId);
  }

  function pidKey() {
    if (_pidK == null) _pidK = (SM.keys && SM.keys.pid()) || PID_KEY();
    return _pidK;
  }

  function ownerPid(entity) {
    if (!entity) return -1;
    if (SM.keys) {
      const p = SM.keys.getPid(entity);
      if (typeof p === 'number') return p;
    }
    const v = entity[pidKey()];
    return typeof v === 'number' ? v : -1;
  }

  function resetAllyCacheIfNeeded() {
    const now = performance.now() | 0;
    if (now === allyCacheMs) return;
    allyCacheMs = now;
    allyCache = Object.create(null);
  }

  function isAllyPid(owner) {
    if (owner <= 0) return false;
    resetAllyCacheIfNeeded();
    const hit = allyCache[owner];
    if (hit !== undefined) return hit;
    let r = false;
    if (SM.keys) r = SM.keys.isAlly(owner);
    else {
      const user = getUser();
      if (user) {
        try { if (owner === user.id) r = true; } catch (_) {}
        if (!r) {
          try {
            const team = user[TEAM_KEY()];
            if (Array.isArray(team) && team.indexOf(owner) !== -1) r = true;
          } catch (_) {}
        }
      }
    }
    allyCache[owner] = r;
    return r;
  }

  function isUnitLike(o) {
    return (
      o && typeof o === 'object' && !Array.isArray(o) &&
      typeof o.type === 'number' && typeof o.x === 'number' && typeof o.y === 'number'
    );
  }

  function getOwnerPid(entity) {
    if (!entity) return undefined;
    if (SM.keys) {
      const p = SM.keys.getPid(entity);
      if (typeof p === 'number') return p;
    }
    const v = entity[PID_KEY()];
    return typeof v === 'number' ? v : undefined;
  }

  // ---- свой/враг (как в клиенте) --------------------------------------------
  function isAlly(entity) {
    const owner = getOwnerPid(entity);
    if (typeof owner !== 'number') return false;
    if (SM.keys) return SM.keys.isAlly(owner);
    const user = getUser();
    if (!user) return false;
    try { if (owner === user.id) return true; } catch (_) {}
    try {
      const team = user[TEAM_KEY()];
      if (Array.isArray(team) && team.indexOf(owner) !== -1) return true;
    } catch (_) {}
    return false;
  }

  // ---- карта spriteId -> постройка ------------------------------------------
  function buildSpriteMaps() {
    for (const k in SPRITE_ID_MAP) delete SPRITE_ID_MAP[k];
    let mapped = 0;
    Object.keys(SPRITE_ID_META).forEach(function (idStr) {
      const e = SPRITE_ID_META[idStr];
      SPRITE_ID_MAP[Number(idStr)] = { tier: e.tier, category: e.category };
      mapped++;
    });
    // ручной оверрайд по числовым id: { "123": "gold|spike", ... }
    try {
      const ov = window.__SV_CS_IDS__;
      if (ov && typeof ov === 'object') {
        Object.keys(ov).forEach(function (idStr) {
          const parts = String(ov[idStr]).split('|');
          if (parts.length === 2) {
            SPRITE_ID_MAP[Number(idStr)] = { tier: parts[0], category: parts[1] };
            mapped++;
          }
        });
      }
    } catch (_) {}
    state.mapsReady = mapped > 0;
    SM.log('colorSpike: SPRITE map', mapped, 'типов, ids', Object.keys(SPRITE_ID_MAP).join(','));
    return state.mapsReady;
  }

  function ensureMaps() {
    if (state.mapsReady) return true;
    return buildSpriteMaps();
  }

  // ---- дискавери: средний цвет ванильной текстуры ---------------------------
  function isDrawable(x) {
    return !!x && (typeof x.getContext === 'function' ||
      (typeof HTMLImageElement !== 'undefined' && x instanceof HTMLImageElement) ||
      (typeof x.naturalWidth === 'number' && x.naturalWidth > 0) ||
      (typeof x.width === 'number' && typeof x.height === 'number' && !Array.isArray(x)));
  }

  let _probeCanvas = null;

  function nearestTier(color) {
    if (!color) return '?';
    let best = '?', bestD = Infinity;
    for (const tier in TIER_COLORS) {
      const c = TIER_COLORS[tier];
      const d = (c[0] - color[0]) ** 2 + (c[1] - color[1]) ** 2 + (c[2] - color[2]) ** 2;
      if (d < bestD) { bestD = d; best = tier; }
    }
    return best;
  }

  // средний цвет прямо из ФАКТИЧЕСКОЙ картинки (defaultImg), а не из реестра —
  // надёжнее, т.к. индекс реестра в этом клиенте не равен item-id.
  function avgColorOfImg(node) {
    while (node && Array.isArray(node)) node = node[0];
    if (!isDrawable(node)) return null;
    try {
      if (!_probeCanvas) _probeCanvas = document.createElement('canvas');
      _probeCanvas.width = 16; _probeCanvas.height = 16;
      const ctx = _probeCanvas.getContext('2d', { willReadFrequently: true });
      ctx.clearRect(0, 0, 16, 16);
      ctx.drawImage(node, 0, 0, 16, 16);
      const d = ctx.getImageData(0, 0, 16, 16).data;
      let r = 0, g = 0, b = 0, n = 0;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] < 40) continue;
        r += d[i]; g += d[i + 1]; b += d[i + 2]; n++;
      }
      if (!n) return null;
      return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
    } catch (_) { return null; }
  }

  // ключ дискавери — МИРОВОЙ type юнита (0=игрок, 11=сундук…). Храним пример
  // сущности (для дампа полей) и средний цвет ванильной текстуры.
  function recordDiscovery(typeId, entity, defaultImg) {
    let rec = discovery[typeId];
    if (!rec) {
      const color = avgColorOfImg(defaultImg);
      rec = discovery[typeId] = { count: 0, color: color, tier: nearestTier(color), sample: entity };
    }
    rec.count++;
  }

  // ---- рантайм-резолвер item-id постройки через МАНИФЕСТ ----------------------
  // На самом юните item-id (262 спайк, 269 сундук, …) НЕ хранится — там только
  // entity.type = КОМПАКТНЫЙ мировой тип (индекс world.units: 0=игрок, 11=сундук…).
  // Инвентарный item-id берём из манифеста определений сущностей, который лоадер
  // выставляет на window.__SV_ENTDEFS__ (патч _entDefsPatch). Индекс манифеста
  // совпадает с entity.type, поэтому:
  //     itemId = __SV_ENTDEFS__[entity.type].id
  // Имя поля с id внутри элемента манифеста определяем один раз (обычно литерал
  // 'id'; если переобфусцируется — находим голосованием по известным building-id).
  function getEntDefs() { try { return window.__SV_ENTDEFS__ || null; } catch (_) { return null; } }

  let _defIdKey = null;

  function isKnownBuildingId(v) {
    return typeof v === 'number' && (SPRITE_ID_META[v] !== undefined || v === CHEST_SPRITE_ID);
  }

  // Определяем имя поля item-id внутри элемента манифеста (defs[type][KEY] = id).
  function resolveDefIdKey(defs) {
    if (_defIdKey) return _defIdKey;
    if (!defs || !defs.length) return null;
    // частый случай: поле названо литералом 'id'
    for (let t = 0; t < defs.length; t++) {
      const d = defs[t];
      if (d && typeof d === 'object' && isKnownBuildingId(d.id)) { _defIdKey = 'id'; break; }
    }
    if (_defIdKey) return _defIdKey;
    // запасной: голосование по полям элементов манифеста (НЕ юнита)
    const votes = Object.create(null);
    for (let t = 0; t < defs.length; t++) {
      const d = defs[t];
      if (!d || typeof d !== 'object') continue;
      for (const k in d) {
        let v; try { v = d[k]; } catch (_) { continue; }
        if (isKnownBuildingId(v)) votes[k] = (votes[k] || 0) + 1;
      }
    }
    let bestK = null, best = 0;
    for (const k in votes) if (votes[k] > best) { best = votes[k]; bestK = k; }
    if (bestK) { _defIdKey = bestK; SM.log('colorSpike: manifest id-поле = "' + bestK + '" (' + best + ')'); }
    return _defIdKey;
  }

  function itemIdOf(entity) {
    const t = entity && entity.type;
    if (typeof t !== 'number') return null;
    const defs = getEntDefs();
    if (!defs) return null;
    const key = resolveDefIdKey(defs);
    if (!key) return null;
    const d = defs[t];
    if (d && typeof d[key] === 'number') return d[key];
    return null;
  }

  // Только явные мировые типы построек (world_ids.txt). Без fallback по
  // __SV_ENTDEFS__[type].id — индекс манифеста ≠ type, из-за этого мобы (wolf 71,
  // spider 72) получали item-id чужих построек (amethyst/reidite spike).
  function isBuildingType(t) {
    return typeof t === 'number' && WORLD_TYPE_META[t] != null;
  }

  function buildingInfoOf(entity) {
    const t = entity && entity.type;
    if (!isBuildingType(t)) return null;
    return WORLD_TYPE_META[t];
  }

  // Двери/спайк-двери: bit0 в info = открыта (oldscript рисует кастом только когда
  // !(info & 1); открытая — отдельным проходом с ванильным open-sprite).
  function isDoorOpen(entity) {
    return typeof entity.info === 'number' && (entity.info & 1) !== 0;
  }

  // ---- основной хук на чтении реестра ---------------------------------------
  let _skipFlag = -1;

  function syncCsSkipFlag() {
    csOn = state.enabled ? 1 : 0;
    chestOn = chestColorOn() ? 1 : 0;
    // __SV_CS_ON__ — единственный гейт горячего пути в движке (см. safeCsWrap).
    // Когда он ложный, обёртка спрайта сводится к голому чтению реестра без вызова
    // нашего хука — нулевая стоимость на ваниле.
    const on = !!(state.enabled || chestOn || discoverOn());
    const v = on ? 1 : 0;
    if (_skipFlag === v) return;
    _skipFlag = v;
    try {
      window.__SV_CS_ON__ = on;
      window.__SV_CS_SKIP__ = !on; // совместимость со старым лоадером
      // Старые ключи фильтра лоадера (убраны) — сбрасываем на всякий случай.
      window.__SV_CS_TYPES__ = null;
      window.__SV_CS_SPRITES__ = null;
    } catch (_) {}
  }

  // Горячий путь. Вызывается на каждое чтение спрайта движком. Никаких
  // строковых ключей/аллокаций: tier/category — числа, текстуры — плоский массив.
  // КОНТРАКТ (NVX): возвращает картинку, которую движок нарисует. На любом пути
  // «без перекраски» возвращаем defaultImg (то, что пришло из реестра) — движок
  // получает ровно ванильное значение. null НЕ возвращаем: обёртка в движке
  // подставляет результат напрямую (без `|| default`), поэтому возврат defaultImg
  // обязателен. Сама onDraw бронированная: обёртка больше не оборачивает вызов в
  // try/catch (ради скорости), весь риск ловим здесь — иначе исключение убьёт кадр.
  function onDraw(entity, spriteId, defaultImg) {
    if (!entity) return defaultImg;
    if (!defaultImg || !(defaultImg.width | defaultImg.naturalWidth)) return defaultImg;
    try {
      const t = entity.type;

      // Сундук (ChestInfo): по spriteId или мировому типу 11.
      if (chestOn && (spriteId === CHEST_SPRITE_ID || t === 11)) {
        const tinted = chestRecolor(entity, defaultImg);
        if (tinted && (tinted.width | tinted.naturalWidth)) return tinted;
      }

      if (!csOn) {
        if (WORLD_TYPE_META[t] && discoverOn()) recordDiscovery(t, entity, defaultImg);
        return defaultImg;
      }

      // Постройка colorSpike? (быстрый отсев стен/мобов/ресурсов одним lookup'ом)
      const cat = TYPE_CAT[t];
      if (cat === undefined || cat === CAT_CHEST) return defaultImg;

      // Открытая дверь — ванильная текстура (кастом только для закрытых).
      if ((cat === CAT_DOOR || cat === CAT_SPIKE_DOOR) && (entity.info & 1)) return defaultImg;

      const owner = ownerPid(entity);
      if (owner <= 0) return defaultImg;

      const ally = isAllyPid(owner) ? 1 : 0;
      const img = texArr[((TYPE_TIER[t] * 3 + cat) * 2 + ally)];
      return (img && img.complete && img.naturalWidth > 0) ? img : defaultImg;
    } catch (_) {
      return defaultImg;
    }
  }

  function install() {
    if (state.installed) { syncCsSkipFlag(); return; }
    try {
      window.__SV_CS__ = onDraw;
      // __SV_CS_DT__ намеренно НЕ ставим: DT-подмена sprite-id не используется, а
      // заглушка `return null` вхолостую вызывалась бы на КАЖДЫЙ юнит (draw_transition).
      // Без неё хук лоадера `if(window.__SV_CS_DT__)` — просто ложная проверка.
      try { window.__SV_CS_DT__ = null; } catch (_e2) {}
      state.installed = true;
      syncCsSkipFlag();
      SM.log('colorSpike: хук __SV_CS__ установлен');
    } catch (err) {
      SM.warn('colorSpike: не удалось установить хук', err);
    }
  }

  // ---- публичные действия ----------------------------------------------------
  function setActive(on) {
    state.enabled = !!on;
    SM.settings.colorSpike = state.enabled;
    install();
    if (state.enabled) {
      ensurePackLoaded();
      if (!state.mapsReady) buildSpriteMaps();
    }
    syncCsSkipFlag();
    SM.log('colorSpike', state.enabled ? 'ON' : 'OFF', 'pack=' + state.packId);
  }

  function setPack(packId) {
    if (!packId || packId === state.packId) return;
    state.packId = packId;
    SM.settings.colorSpikePack = packId;
    if (state.enabled) loadPack(packId);
    else loadedPackId = null;
  }

  function isActive() { return state.enabled; }

  function probe() {
    const lines = [];
    const log = function (s) { lines.push(s); console.log(s); };
    log('colorSpike.probe: enabled=' + state.enabled + ' mapsReady=' + state.mapsReady +
        ' __SV_SPRITE__=' + (typeof window.__SV_SPRITE__ === 'object') +
        ' __SV_SPR_REG__=' + (typeof window.__SV_SPR_REG__ === 'object') +
        ' __SV_CS__=' + (typeof window.__SV_CS__ === 'function'));
    const user = getUser();
    log('colorSpike.probe: user.id=' + (user ? user.id : 'нет') +
        ' team=' + (user && Array.isArray(user[TEAM_KEY()]) ? user[TEAM_KEY()].length + ' чел.' : 'нет'));
    log('colorSpike.probe: SPRITE_ID_MAP (' + Object.keys(SPRITE_ID_MAP).length + '): ' +
        Object.keys(SPRITE_ID_MAP).map(function (id) {
          return id + '=' + SPRITE_ID_MAP[id].tier + '/' + SPRITE_ID_MAP[id].category;
        }).join(', '));
    const defs = getEntDefs();
    log('colorSpike.probe: pidKey=' + (SM.keys ? SM.keys.pid() : PID_KEY()) +
        ' __SV_ENTDEFS__=' + (defs ? ('массив[' + defs.length + ']') : 'НЕТ (нужен патч лоадера)') +
        ' defIdKey=' + (defs ? (resolveDefIdKey(defs) || 'НЕ найден') : '—'));
    const rep = lines.join('\n');
    try { window.__SM_CS_PROBE__ = rep; } catch (_) {}
    return rep;
  }

  function drawStats() {
    const lines = [];
    const log = function (s) { lines.push(s); console.log(s); };
    log('colorSpike.drawStats: hookRaw=' + diag.hookRaw + ' hookCalls=' + diag.calls + ' buildingCalls=' + diag.buildingCalls +
        ' recolored=' + diag.recolored + ' skipPid=' + diag.skippedNoPid +
        ' skipTex=' + diag.skippedNoTex + ' enabled=' + state.enabled + ' discover=' + discoverOn() +
        ' pidKey=' + (SM.keys ? SM.keys.pid() : PID_KEY()));
    log('colorSpike.drawStats: попадания по id: ' + JSON.stringify(diag.mappedHits));
    const ids = Object.keys(discovery).sort(function (a, b) { return discovery[b].count - discovery[a].count; });
    log('colorSpike.drawStats: ДИСКАВЕРИ непомеченных построек (' + ids.length + '):');
    const defs = getEntDefs();
    log('colorSpike.drawStats: __SV_ENTDEFS__=' + (defs ? ('массив[' + defs.length + ']') : 'НЕТ') +
        ' defIdKey=' + (defs ? (resolveDefIdKey(defs) || 'НЕ найден') : '—'));
    ids.slice(0, 40).forEach(function (id) {
      const r = discovery[id];
      const def = (defs && typeof id !== 'undefined' && defs[Number(id)]) ? defs[Number(id)] : null;
      const defKey = defs ? resolveDefIdKey(defs) : null;
      const itemId = (def && defKey && typeof def[defKey] === 'number') ? def[defKey] : '?';
      log('  worldType=' + id + ' -> item-id=' + itemId + ' count=' + r.count +
          ' цвет=' + (r.color ? 'rgb(' + r.color.join(',') + ')' : '?') +
          ' тир≈' + r.tier);
      // дамп числовых полей примера постройки — чтобы найти поле item-id (262 и т.п.)
      const e = r.sample;
      if (e) {
        const fields = [];
        const ks = Object.getOwnPropertyNames(e);
        for (let i = 0; i < ks.length; i++) {
          let v; try { v = e[ks[i]]; } catch (_) { continue; }
          if (typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 400) {
            fields.push(ks[i] + '=' + v);
          }
        }
        log('     поля(0..400): ' + fields.join(' '));
      }
    });
    if (!discoverOn()) log('  (включи дискавери: window.__SV_CS_DISCOVER__=true, затем построй постройки)');
    const rep = lines.join('\n');
    try { window.__SM_CS_DRAW__ = rep; } catch (_) {}
    return rep;
  }

  function init() {
    state.enabled = !!SM.settings.colorSpike;
    state.packId = SM.settings.colorSpikePack || 'type1';
    install();
    syncCsSkipFlag();
    if (state.enabled) {
      ensurePackLoaded();
      buildSpriteMaps();
    } else {
      buildSpriteMaps();
    }
    SM.log('colorSpike init: enabled=' + state.enabled + ' pack=' + state.packId +
        ' maps=' + state.mapsReady);
  }

  SM.features = SM.features || {};
    SM.features.colorSpike = {
    init: init,
    setActive: setActive,
    setPack: setPack,
    isActive: isActive,
    syncSkip: syncCsSkipFlag,
    probe: probe,
    drawStats: drawStats,
  };
})(window.__SM__ = window.__SM__ || {});


/* ===== src/features/visuals/core.js ===== */
/**
 * features/visuals/core.js — общий слой для визуальных фич (порт из oldscript).
 *
 * Идея: рисуем поверх игры на СВОЁМ полноэкранном canvas (#starve-mod-visuals),
 * который точно накрывает #game_canvas. Координаты мира проецируем как в oldscript:
 *   screen = (worldX + cam.x) * scale,  screen = (worldY + cam.y) * scale
 * где cam — объект камеры на __SV_USER__, scale = backingW / cssW (≈ devicePixelRatio).
 *
 * Никаких патчей движка здесь нет — только чтение __SV_WORLD__/__SV_USER__ и canvas.
 * Обфусцированные ключи (камера/гейджи/день/ник) резолвим в рантайме по сигнатуре
 * с возможностью ручного оверрайда через window.__SV_VIS_KEYS__.
 *
 * Регистрация рисующих фич: SM.visuals.register(name, drawFn) — drawFn(ctx, env)
 * вызывается каждый кадр, если включена соответствующая настройка.
 */
;(function (SM) {
  'use strict';

  // Индексы типов в world.units[type] (из world_ids.txt; не путать с инвентарными id).
  const T = {
    PLAYERS: 0,
    CHEST: 11,
    FURNACE: 18,
    EMERALD_MACHINE: 23,
    EXTRACTOR_MIN: 24,
    EXTRACTOR_MAX: 37,
    TOTEM: 38,
    WINDMILL: 41,
    BREAD_OVEN: 43,
    WELL: 44,
    TREASURE_CHEST: 97,
    DEAD_BOX: 98,
    CRATE: 102,
    GIFT: 103,
    // animals (world_ids.txt)
    WOLF: 71,
    SPIDER: 72,
    FOX: 73,
    BEAR: 74,
    DRAGON: 75,
    PIRANHA: 76,
    KRAKEN: 77,
    FLAME: 79,
    LAVA_DRAGON: 80,
    BOAR: 81,
    CRAB_BOSS: 82,
    BABY_DRAGON: 83,
    BABY_LAVA: 84,
    HAWK: 85,
    VULTURE: 86,
    SAND_WORM: 87,
    BABY_MAMMOTH: 88,
    MAMMOTH: 89,
    PARROT: 90,
    PENGUIN: 92,
    HEN: 93,
    GOLDEN_CHICKEN: 94,
    RABBIT: 96,
    FIREFLY: 106,
  };

  // Обфусцированные ключи сущности/игрока резолвятся в рантайме (SM.keys) —
  // переживают автообновление клиента. Fallback на случай отсутствия резолвера.
  function PID_KEY() { return (SM.keys && SM.keys.pid()) || 'Іᄃᴎ'; }
  function UID_KEY() { return (SM.keys && SM.keys.uid()) || 'α︈̄'; }
  function TEAM_KEY() { return (SM.keys && SM.keys.team()) || 'ϲᚂᄅ'; }
  // pid юнита (число) или undefined — для ESP/мапы.
  function pidOf(unit) { return unit ? unit[PID_KEY()] : undefined; }

  function getWorld() { try { const w = window.__SV_WORLD__; return w && typeof w === 'object' ? w : null; } catch (_) { return null; } }
  function getUser() { try { const u = window.__SV_USER__; return u && typeof u === 'object' ? u : null; } catch (_) { return null; } }

  function isUnit(o) {
    return (
      o && typeof o === 'object' && !Array.isArray(o) &&
      typeof o.x === 'number' && typeof o.y === 'number' &&
      typeof o.type === 'number' && typeof o.id === 'number'
    );
  }

  // ---- резолв массивов мира (как aimbot) ------------------------------------
  let arrCache = null, arrAt = 0, worldRef = null;
  let typeIndex = null, typeIndexFast = null;
  let loadSpikeUntil = 0;
  let loopFrame = 0;
  let fastLenPrev = 0;

  function markLoadSpike() {
    loadSpikeUntil = Date.now() + 3000;
    typeIndex = null;
    typeIndexFast = null;
  }

  function inLoadSpike() {
    return Date.now() < loadSpikeUntil;
  }

  function invalidateCaches() {
    arrCache = null;
    arrAt = 0;
    worldRef = null;
    camKey = null;
    camAt = 0;
    gKey = null;
    typeIndex = null;
    typeIndexFast = null;
  }

  function buildTypeIndex(fast) {
    const byType = Object.create(null);
    for (let i = 0; i < fast.length; i++) {
      const u = fast[i];
      if (!u || typeof u.type !== 'number' || !isUnit(u)) continue;
      const t = u.type;
      let list = byType[t];
      if (!list) { list = []; byType[t] = list; }
      list.push(u);
    }
    return byType;
  }

  function ensureTypeIndex() {
    const arr = arrCache;
    if (!arr || !arr.fast) return null;
    if (typeIndex && typeIndexFast === arr.fast) return typeIndex;
    typeIndex = buildTypeIndex(arr.fast);
    typeIndexFast = arr.fast;
    return typeIndex;
  }

  function scoreUnitsArray(v) {
    if (!Array.isArray(v)) return 0;
    let score = 0;
    for (let j = 0; j < v.length; j++) {
      const inner = v[j];
      if (!Array.isArray(inner) || !inner.length) continue;
      if (isUnit(inner[0])) score++;
    }
    return score;
  }

  function resolveArrays() {
    const now = Date.now();
    const world = getWorld();
    if (!world) {
      invalidateCaches();
      return null;
    }
    if (world !== worldRef) {
      arrCache = null;
      worldRef = world;
      arrAt = 0;
      camKey = null;
      markLoadSpike();
    }
    const spike = inLoadSpike();
    const ttl = spike ? 2000 : (arrCache && getSelfQuick() ? 4000 : 800);
    if (arrCache && now - arrAt < ttl) return arrCache;
    let fast = null, fastLen = -1, units = null, unitsScore = -1;
    const keys = Object.getOwnPropertyNames(world);
    for (let i = 0; i < keys.length; i++) {
      let v; try { v = world[keys[i]]; } catch (_) { continue; }
      if (!Array.isArray(v)) continue;
      for (let j = 0; j < v.length; j++) {
        if (isUnit(v[j])) {
          if (v.length > fastLen) { fast = v; fastLen = v.length; }
          break;
        }
      }
      const us = scoreUnitsArray(v);
      if (us > unitsScore) { units = v; unitsScore = us; }
    }
    if (!fast) return null;
    if (unitsScore < 3) units = null;
    arrCache = { fast: fast, units: units };
    arrAt = now;
    const prevLen = fastLenPrev;
    fastLenPrev = fast.length;
    if (prevLen > 0 && (fast.length > prevLen * 1.35 || fast.length - prevLen > 60)) markLoadSpike();
    typeIndex = null;
    typeIndexFast = null;
    return arrCache;
  }

  function getSelfQuick() {
    if (SM.keys) {
      try {
        const s = SM.keys.selfUnit();
        if (s) return s;
      } catch (_) {}
    }
    const arr = arrCache;
    const user = getUser();
    if (!arr || !user) return null;
    const uid = user[UID_KEY()];
    if (typeof uid !== 'number') return null;
    const self = arr.fast[uid];
    return isUnit(self) ? self : null;
  }

  function getSelf() {
    if (SM.keys) {
      try {
        const s = SM.keys.selfUnit();
        if (s) return s;
      } catch (_) {}
    }
    const arr = resolveArrays();
    const user = getUser();
    if (!arr || !user) return null;
    const uid = user[UID_KEY()];
    if (typeof uid !== 'number') return null;
    const self = arr.fast[uid];
    return isUnit(self) ? self : null;
  }

  function unitsOfType(type) {
    const arr = resolveArrays();
    if (!arr) return null;
    if (arr.units) {
      const list = arr.units[type];
      if (Array.isArray(list)) return list;
    }
    const idx = ensureTypeIndex();
    if (!idx) return null;
    const list = idx[type];
    return list && list.length ? list : null;
  }

  function selfPid() {
    const user = getUser();
    if (!user) return null;
    try { if (typeof user.id === 'number') return user.id; } catch (_) {}
    const self = getSelf();
    return self && typeof self[PID_KEY()] === 'number' ? self[PID_KEY()] : null;
  }

  function isAlly(pid) {
    if (typeof pid !== 'number') return false;
    if (SM.keys) return SM.keys.isAlly(pid);
    const user = getUser();
    if (!user) return false;
    try { if (pid === user.id) return true; } catch (_) {}
    try { const team = user[TEAM_KEY()]; if (Array.isArray(team) && team.indexOf(pid) !== -1) return true; } catch (_) {}
    return false;
  }

  // ---- override-ключи (ручная коррекция после probe) ------------------------
  function override(name) {
    try { const o = window.__SV_VIS_KEYS__; return o && o[name]; } catch (_) { return undefined; }
  }

  // ---- камера ----------------------------------------------------------------
  // Камера — объект на user с числовыми x,y, для которого self попадает на экран:
  //   (self.x + cam.x) ∈ [0..cssW], (self.y + cam.y) ∈ [0..cssH].
  let camKey = null, camAt = 0;
  function resolveCam(cssW, cssH) {
    const user = getUser();
    if (!user) return null;

    if (window.__SV_SPEC__) {
      try {
        const sc = window.__SV_SPEC_CAM__;
        if (sc && typeof sc.x === 'number' && typeof sc.y === 'number') return sc;
      } catch (_) {}
    }

    const self = getSelf();
    if (!self) return null;

    const ovr = override('cam');
    if (typeof ovr === 'string') { const c = user[ovr]; if (c && typeof c.x === 'number') return c; }

    // быстрый путь: ранее найденный ключ ещё валиден
    if (camKey) {
      const c = user[camKey];
      if (c && typeof c.x === 'number' && typeof c.y === 'number') return c;
      camKey = null;
    }
    const keys = Object.getOwnPropertyNames(user);
    let best = null, bestScore = Infinity;
    for (let i = 0; i < keys.length; i++) {
      let c; try { c = user[keys[i]]; } catch (_) { continue; }
      if (!c || typeof c !== 'object' || Array.isArray(c)) continue;
      if (typeof c.x !== 'number' || typeof c.y !== 'number') continue;
      const sx = self.x + c.x, sy = self.y + c.y;
      if (sx < -200 || sx > cssW + 200 || sy < -200 || sy > cssH + 200) continue;
      // ближе к центру = лучше (камера обычно центрирует игрока)
      const score = Math.abs(sx - cssW / 2) + Math.abs(sy - cssH / 2);
      if (score < bestScore) { bestScore = score; best = keys[i]; }
    }
    if (best) { camKey = best; camAt = Date.now(); return user[best]; }
    return null;
  }

  // ---- overlay canvas --------------------------------------------------------
  let canvas = null, ctx = null, raf = 0;
  const drawers = []; // { name, fn }

  function ensureCanvas() {
    if (canvas) return canvas;
    canvas = document.createElement('canvas');
    canvas.id = 'starve-mod-visuals';
    canvas.style.cssText =
      'position:fixed;left:0;top:0;z-index:2147483630;pointer-events:none;display:none;';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    requestAnimationFrame(loop);
    return canvas;
  }

  function drawerOn(d) {
    if (d.enabledFn) {
      try { return !!d.enabledFn(); } catch (_) { return false; }
    }
    for (let i = 0; i < d.keys.length; i++) if (SM.settings[d.keys[i]]) return true;
    return false;
  }

  function anyEnabled() {
    for (let i = 0; i < drawers.length; i++) if (drawerOn(drawers[i])) return true;
    return false;
  }

  let env = { scale: 1, cam: null, cssW: 0, cssH: 0 };

  function syncToGame() {
    const game = document.getElementById('game_canvas');
    if (!game) return false;
    const rect = game.getBoundingClientRect();
    if (rect.width < 50 || rect.height < 50) return false;
    // backing store = как у игры (device px), CSS = поверх игры
    if (canvas.width !== game.width) canvas.width = game.width;
    if (canvas.height !== game.height) canvas.height = game.height;
    canvas.style.left = Math.round(rect.left) + 'px';
    canvas.style.top = Math.round(rect.top) + 'px';
    canvas.style.width = Math.round(rect.width) + 'px';
    canvas.style.height = Math.round(rect.height) + 'px';
    env.scale = game.width / rect.width || 1;
    env.cssW = rect.width;
    env.cssH = rect.height;
    return true;
  }

  let lastRuntimeNudge = 0;
  function loop() {
    raf = requestAnimationFrame(loop);
    loopFrame++;
    if (window.__SM_HIDDEN__) { if (canvas) canvas.style.display = 'none'; return; }
    if (!anyEnabled()) { if (canvas) canvas.style.display = 'none'; return; }
    if (!syncToGame()) { canvas.style.display = 'none'; return; }
    canvas.style.display = 'block';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const now = Date.now();
    const spike = inLoadSpike();
    if (getUser() && getWorld() && !getSelfQuick() && now - lastRuntimeNudge > 2500) {
      lastRuntimeNudge = now;
      if (SM.keys) try { SM.keys.refresh(); } catch (_) {}
    }

    resolveArrays();
    env.cam = resolveCam(env.cssW, env.cssH);
    env.loadSpike = spike;
    env.frame = loopFrame;

    // Тяжёлые overlay прореживаем только во время всплеска загрузки (чанки),
    // иначе ESP/инфо моргают. Viewport-culling в самих drawer'ах уже отсекает
    // off-screen юниты, поэтому в спектаторе отдельно резать кадры не нужно.
    const skipHeavy = spike && (loopFrame & 1) === 0;

    for (let i = 0; i < drawers.length; i++) {
      const d = drawers[i];
      if (!drawerOn(d)) continue;
      if (skipHeavy && d.heavy) continue;
      try { d.fn(ctx, env); } catch (_) {}
    }
  }

  // мир → device-координаты нашего canvas
  function project(worldX, worldY) {
    if (!env.cam) return null;
    return { x: (worldX + env.cam.x) * env.scale, y: (worldY + env.cam.y) * env.scale };
  }

  // текст с обводкой по центру (как cleverUtils.createText), x,y — device-координаты
  function text(c, str, x, y, opts) {
    opts = opts || {};
    const size = (opts.size || 18) * env.scale;
    c.save();
    c.font = (opts.bold ? 'bold ' : '') + size + 'px "Baloo Paaji", sans-serif';
    c.textBaseline = opts.baseline || 'alphabetic';
    c.lineWidth = (opts.lineWidth || 4) * env.scale;
    c.strokeStyle = opts.stroke || 'black';
    c.fillStyle = opts.color || '#fff';
    const w = opts.left ? 0 : c.measureText(str).width / 2;
    c.strokeText(str, x - w, y);
    c.fillText(str, x - w, y);
    c.restore();
  }

  function register(name, fn, opts) {
    const keys = Array.isArray(name) ? name : [name];
    const heavy = opts === true || (opts && opts.heavy);
    drawers.push({ keys: keys, fn: fn, heavy: !!heavy });
    ensureCanvas();
  }

  /** Регистрация drawer с произвольным предикатом включённости (для nested settings). */
  function registerEnabled(enabledFn, fn, heavy) {
    drawers.push({ keys: [], enabledFn: enabledFn, fn: fn, heavy: !!heavy });
    ensureCanvas();
  }

  // ---- probe: дамп структуры для фиксации обфусцированных ключей -------------
  function valStr(v) {
    if (v === null) return 'null';
    const t = typeof v;
    if (t === 'number') return 'num(' + (Math.abs(v) < 1000 ? v : Math.round(v)) + ')';
    if (t === 'string') return 'str(' + JSON.stringify(v.slice(0, 14)) + ')';
    if (t === 'boolean') return String(v);
    if (Array.isArray(v)) return 'Arr[' + v.length + ']';
    if (t === 'object') {
      const ks = Object.getOwnPropertyNames(v).slice(0, 10);
      return '{' + ks.map(function (k) { const x = v[k]; return k + ':' + (typeof x === 'number' ? Math.round(x * 100) / 100 : typeof x); }).join(',') + '}';
    }
    return t;
  }

  function probe() {
    const lines = [];
    const log = function (s) { lines.push(s); console.log(s); };
    const user = getUser();
    const self = getSelf();
    log('visuals.probe: user=' + (user ? 'yes' : 'NO') + ' self=' + (self ? 'yes' : 'NO') +
        ' cam=' + (env.cam ? 'resolved key=' + camKey : 'NOT resolved') + ' scale=' + env.scale);
    if (user) {
      log('visuals.probe: user.id=' + user.id + ' day?=' + user.day);
      const ks = Object.getOwnPropertyNames(user);
      log('visuals.probe: user props (' + ks.length + '):');
      for (let i = 0; i < ks.length; i++) {
        let v; try { v = user[ks[i]]; } catch (_) { continue; }
        log('  ' + ks[i] + ' = ' + valStr(v));
      }
    }
    log('visuals.probe: КОНЕЦ. Скопируй вывод (copy(__SM__.visuals.probe())).');
    const rep = lines.join('\n');
    try { window.__SM_VIS_PROBE__ = rep; } catch (_) {}
    return rep;
  }

  // ---- gauges-резолвер (общий, по «больше всего полей в [0..1]») -------------
  let gKey = null;
  function gaugesObj() {
    const user = getUser();
    if (!user) return null;
    const ovr = override('gauges');
    if (ovr && typeof ovr === 'object' && typeof ovr.obj === 'string' && user[ovr.obj]) return user[ovr.obj];
    if (gKey && user[gKey]) return user[gKey];
    const keys = Object.getOwnPropertyNames(user);
    let best = null, bestScore = 0;
    for (let i = 0; i < keys.length; i++) {
      let g; try { g = user[keys[i]]; } catch (_) { continue; }
      const s = gaugeScore(g);
      if (s > bestScore) { bestScore = s; best = keys[i]; }
    }
    if (best && bestScore >= 3) { gKey = best; return user[best]; }
    return null;
  }

  // объект похож на камеру/translate (содержит крупные координаты x/y/w)
  function looksLikeCoords(g) {
    let big = 0;
    const ks = Object.getOwnPropertyNames(g);
    for (let i = 0; i < ks.length; i++) {
      const k = ks[i], v = g[k];
      if (typeof v === 'number' && (k === 'x' || k === 'y' || k === 'w' || k === 'h' || k === 'rx' || k === 'ry') && Math.abs(v) > 200) big++;
    }
    return big >= 2;
  }

  // Оценка «похожести на объект гейджей»: число полей в [0..1] + сильный бонус
  // за вложенные анимированные шкалы (объект с числовым .x в [0..1]).
  function gaugeScore(g) {
    if (!g || typeof g !== 'object' || Array.isArray(g)) return 0;
    if (looksLikeCoords(g)) return 0;
    let flat = 0, anim = 0;
    const gk = Object.getOwnPropertyNames(g);
    for (let j = 0; j < gk.length; j++) {
      let v; try { v = g[gk[j]]; } catch (_) { continue; }
      if (typeof v === 'number' && v >= 0 && v <= 1.0001) flat++;
      else if (v && typeof v === 'object' && !Array.isArray(v) && typeof v.x === 'number' && v.x >= 0 && v.x <= 1.0001) anim++;
    }
    return flat + 3 * anim;
  }

  // Полный дамп: гейджи (ВСЕ поля), кандидаты дня, реестр игроков (ник/уровень).
  function probe2() {
    const lines = [];
    const log = function (s) { lines.push(s); console.log(s); };
    const user = getUser();
    const world = getWorld();

    // 1) гейджи целиком
    const g = gaugesObj();
    log('visuals.probe2: gaugesKey=' + gKey);
    if (g) {
      const gk = Object.getOwnPropertyNames(g);
      log('visuals.probe2: gauges ВСЕ поля (' + gk.length + '):');
      for (let i = 0; i < gk.length; i++) {
        const v = g[gk[i]];
        if (typeof v === 'number') log('  num ' + gk[i] + ' = ' + (Math.round(v * 1000) / 1000));
        else if (v && typeof v === 'object' && typeof v.x === 'number') log('  anim ' + gk[i] + '.x = ' + (Math.round(v.x * 1000) / 1000));
        else log('  ? ' + gk[i] + ' = ' + (typeof v));
      }
    } else { log('visuals.probe2: gauges НЕ найдены'); }

    // 2) кандидаты "день" (целое 0..400) в user
    if (user) {
      const cand = [];
      const ks = Object.getOwnPropertyNames(user);
      for (let i = 0; i < ks.length; i++) {
        let v; try { v = user[ks[i]]; } catch (_) { continue; }
        if (typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 400) cand.push(ks[i] + '=' + v);
      }
      log('visuals.probe2: day-кандидаты(user 0..400): ' + cand.join(', '));
    }

    // 3) реестр игроков в world (объект объектов со строковым полем — ник)
    if (world) {
      const ks = Object.getOwnPropertyNames(world);
      for (let i = 0; i < ks.length; i++) {
        let v; try { v = world[ks[i]]; } catch (_) { continue; }
        if (!v || typeof v !== 'object') continue;
        let sample = null;
        if (Array.isArray(v)) { for (let j = 0; j < v.length; j++) if (v[j] && typeof v[j] === 'object' && !Array.isArray(v[j])) { sample = v[j]; break; } }
        else { const sk = Object.getOwnPropertyNames(v); for (let j = 0; j < sk.length; j++) { const e = v[sk[j]]; if (e && typeof e === 'object' && !Array.isArray(e)) { sample = e; break; } } }
        if (!sample) continue;
        if (typeof sample.x === 'number' && typeof sample.type === 'number' && typeof sample.id === 'number') continue; // это юниты
        const hasStr = Object.getOwnPropertyNames(sample).some(function (k) { const s = sample[k]; return typeof s === 'string' && s.length > 0 && s.length < 40; });
        if (hasStr) {
          log('visuals.probe2: возможный реестр игроков world.' + ks[i] + ' (' + (Array.isArray(v) ? 'Arr[' + v.length + ']' : 'obj') + '), пример:');
          const sk = Object.getOwnPropertyNames(sample);
          for (let j = 0; j < sk.length; j++) { const s = sample[sk[j]]; log('    ' + sk[j] + ' = ' + valStr(s)); }
        }
      }
    }
    log('visuals.probe2: КОНЕЦ. Скопируй (copy(__SM__.visuals.probe2())).');
    const rep = lines.join('\n');
    try { window.__SM_VIS_PROBE2__ = rep; } catch (_) {}
    return rep;
  }

  // Живой вотчер гейджей: печатает строку при изменении любого числового поля.
  // Запуск/стоп — повторным вызовом. Нужен, чтобы по реакции (урон/еда/питьё)
  // однозначно сопоставить обфусцированные имена гейджей.
  let gwId = null, gwPrev = {}, gwLog = [];
  function gwatch() {
    if (gwId) {
      clearInterval(gwId); gwId = null;
      const rep = gwLog.join('\n') || 'GW: изменений не зафиксировано (gauges не найдены или ничего не менялось)';
      try {
        window.__SM_GW__ = rep;
        const cp = navigator.clipboard && navigator.clipboard.writeText(rep);
        if (cp && cp.catch) cp.catch(function () {});
      } catch (_) {}
      console.warn('visuals.gwatch: OFF — лог скопирован в буфер, вставь сюда');
      return rep;
    }
    gwPrev = {}; gwLog = [];
    console.warn('visuals.gwatch: ON — НЕ выключай сразу: 20-30 сек нанеси урон / поешь / попей; повторный вызов = стоп+лог');
    const tick = function (force) {
      const g = gaugesObj();
      if (!g) { if (force) gwLog.push('GW gauges НЕ найдены'); return; }
      const ks = Object.getOwnPropertyNames(g);
      let changed = false;
      const parts = [];
      for (let i = 0; i < ks.length; i++) {
        const v = g[ks[i]];
        if (typeof v !== 'number') continue;
        parts.push(ks[i] + '=' + (Math.round(v * 100) / 100));
        if (gwPrev[ks[i]] === undefined || Math.abs(gwPrev[ks[i]] - v) > 0.005) changed = true;
        gwPrev[ks[i]] = v;
      }
      if (changed || force) { const line = 'GW ' + parts.join('  '); gwLog.push(line); console.warn(line); }
    };
    tick(true); // стартовый снимок сразу
    gwId = setInterval(function () { tick(false); }, 200);
    return 'on';
  }

  SM.visuals = {
    T: T,
    pidOf: pidOf,
    getWorld: getWorld,
    getUser: getUser,
    getSelf: getSelf,
    unitsOfType: unitsOfType,
    selfPid: selfPid,
    isAlly: isAlly,
    project: project,
    text: text,
    register: register,
    registerEnabled: registerEnabled,
    override: override,
    env: function () { return env; },
    probe: probe,
    probe2: probe2,
    gwatch: gwatch,
    invalidate: invalidateCaches,
    inLoadSpike: inLoadSpike,
    init: function () {
      ensureCanvas();
      SM.log('visuals.core: загружен');
    },
  };
})(window.__SM__ = window.__SM__ || {});


/* ===== src/features/visuals/hud-stats.js ===== */
/**
 * features/visuals/hud-stats.js — HUD-числа из oldscript.
 * Значения % и HP берём с canvas-баров (SM.barGauges) — не зависит от обфускации gauges.
 */
;(function (SM) {
  'use strict';

  const V = SM.visuals;
  if (!V) return;

  const STRIP_W = 950;
  const BAR_X = [37, 277, 517, 757];
  const BAR_Y = 17;
  const TEXT_DY = 17;
  const PCT_DY = -17;
  const HP_LEFT_DX = -120;
  const TIMER_MID_DX = 185;
  const TIMER_EXTRA_LOGICAL = 0;
  const PCT_DX = 60;
  const BAR_H_LOGICAL = 18;
  const FONT_PX = 34;
  const STROKE_PX = 7;
  const TIMER_FONT_PX = 28;
  const TIMER_STROKE_PX = 6;
  const TIMER_HEAL_COLOR = '#69A148';
  const TIMER_STARVE_COLOR = 'red';
  const INV_STRIP_DY = 140;

  let gameGaugesKey = null;
  let starveAt = Date.now();
  let healAt = Date.now();
  // Бары HP/еды в игре АНИМИРОВАНЫ (плавно ползут к новому значению), поэтому
  // мгновенный % с бара дёргается каждый кадр. Ловим ДИСКРЕТНОЕ значение
  // показателя как то, на котором бар «замер» дольше STABLE_MS, и только смену
  // этого значения считаем реальным событием (тик голода / хил).
  const STABLE_MS = 140;
  let rawLife = -1, rawLifeAt = 0, settledLife = -1;
  let rawFood = -1, rawFoodAt = 0, settledFood = -1;

  function pct(x) { return x == null ? '–' : Math.floor(x * 100) + '%'; }

  function barAnchor() {
    return SM.barGauges && SM.barGauges.layout ? SM.barGauges.layout() : null;
  }

  function readStats() {
    return SM.barGauges && SM.barGauges.read ? SM.barGauges.read() : null;
  }

  function gameObj() {
    try { const g = window.__SV_GAME__; return g && typeof g === 'object' ? g : null; } catch (_) { return null; }
  }

  function gameGaugesPanel() {
    const game = gameObj();
    if (!game) return null;
    const ovr = V.override('game_gauges');
    if (typeof ovr === 'string' && game[ovr]) return game[ovr];
    if (gameGaugesKey && game[gameGaugesKey]) return game[gameGaugesKey];
    const keys = Object.getOwnPropertyNames(game);
    for (let i = 0; i < keys.length; i++) {
      let v; try { v = game[keys[i]]; } catch (_) { continue; }
      if (!v || typeof v !== 'object' || Array.isArray(v)) continue;
      if (v.translate && typeof v.translate.x === 'number' && typeof v.translate.y === 'number' &&
          v.img && typeof v.img.height === 'number') {
        gameGaugesKey = keys[i];
        return v;
      }
    }
    return null;
  }

  function hudLayout(env) {
    const el = document.getElementById('game_canvas');
    const devW = el ? el.width : env.cssW * env.scale;
    const devH = el ? el.height : env.cssH * env.scale;
    const us = devH / 720;
    let ox = (devW - us * STRIP_W) / 2;
    const invOy = devH - us * INV_STRIP_DY;
    let oy = invOy;

    const panel = gameGaugesPanel();
    if (panel) {
      if (typeof panel.y === 'number') oy = panel.y;
      else if (panel.translate && typeof panel.translate.y === 'number') oy = invOy + panel.translate.y;
      if (panel.translate && typeof panel.translate.x === 'number') ox += panel.translate.x;
    }

    const ovr = V.override('hud_origin');
    if (ovr && typeof ovr === 'object') {
      if (typeof ovr.ox === 'number') ox = ovr.ox;
      if (typeof ovr.oy === 'number') oy = ovr.oy;
      if (typeof ovr.us === 'number') return { ox: ox, oy: oy, us: ovr.us };
    }

    const anchor = barAnchor();
    if (anchor && anchor.fresh && typeof anchor.barTop === 'number') {
      const u = anchor.us > 0 ? anchor.us : us;
      oy = anchor.barTop - BAR_Y * u;
    }

    return { ox: ox, oy: oy, us: us };
  }

  function uiScale(lay) {
    const anchor = barAnchor();
    if (anchor && anchor.us > 0) return anchor.us;
    return lay.us;
  }

  function barTopY(lay) {
    const anchor = barAnchor();
    if (anchor && typeof anchor.barTop === 'number') return anchor.barTop;
    return lay.oy + BAR_Y * uiScale(lay);
  }

  function barLeftX(lay, i) {
    const u = uiScale(lay);
    const anchor = barAnchor();
    if (anchor) {
      if (i === 1 && typeof anchor.foodLeft === 'number') return anchor.foodLeft;
      if (typeof anchor.hpLeft === 'number') return anchor.hpLeft + (BAR_X[i] - BAR_X[0]) * u;
    }
    return lay.ox + BAR_X[i] * u;
  }

  function timerTextY(lay) {
    const anchor = barAnchor();
    if (anchor && typeof anchor.barTop === 'number') {
      const u = anchor.us;
      const barH = u * BAR_H_LOGICAL;
      return anchor.barTop + barH * (TEXT_DY / BAR_H_LOGICAL) + TIMER_EXTRA_LOGICAL * u;
    }
    const u = uiScale(lay);
    return barTopY(lay) + BAR_H_LOGICAL * u * (TEXT_DY / BAR_H_LOGICAL) + TIMER_EXTRA_LOGICAL * u;
  }

  function hpTextPos(lay) {
    const u = uiScale(lay);
    const y = timerTextY(lay);
    if (y == null) return null;
    const anchor = barAnchor();
    const left = (anchor && typeof anchor.hpLeft === 'number') ? anchor.hpLeft : barLeftX(lay, 0);
    return { x: left + HP_LEFT_DX * u, y: y };
  }

  function timerTextPos(lay, barIndex) {
    const u = uiScale(lay);
    const y = timerTextY(lay);
    if (y == null) return null;
    return { x: barLeftX(lay, barIndex) + TIMER_MID_DX * u, y: y };
  }

  function pctTextPos(lay, barIndex) {
    const u = uiScale(lay);
    return {
      x: barLeftX(lay, barIndex) + PCT_DX * u,
      y: barTopY(lay) + PCT_DY * u,
    };
  }

  function hudText(c, str, x, y, fill, us, compact) {
    const k = us || 1;
    c.save();
    c.font = ((compact ? TIMER_FONT_PX : FONT_PX) * k) + 'px "Baloo Paaji", sans-serif';
    c.textBaseline = 'alphabetic';
    c.textAlign = 'left';
    c.lineWidth = (compact ? TIMER_STROKE_PX : STROKE_PX) * k;
    c.strokeStyle = 'black';
    c.fillStyle = fill || 'red';
    c.strokeText(str, x, y);
    c.fillText(str, x, y);
    c.restore();
  }

  // Сброс таймеров по РЕАЛЬНЫМ событиям, а не по анимации бара:
  //   • хил-таймер (зелёный) — сброс, когда HP реально вырос (произошёл хил);
  //   • старв-таймер (красный) — сброс ТОЛЬКО когда еда упала (тик голода),
  //     поэтому при поедании еды (рост) он НЕ сбрасывается.
  // Значение считаем «настоящим», когда бар простоял на нём ≥ STABLE_MS —
  // это отсекает промежуточные кадры анимации (мерцание 10↔11) и дрожание.
  function tickTimers(stats) {
    if (!stats) return;
    const now = Date.now();
    const lifePct = stats.life != null ? Math.round(stats.life * 100) : -1;
    const foodPct = stats.food != null ? Math.round(stats.food * 100) : -1;

    if (lifePct !== rawLife) { rawLife = lifePct; rawLifeAt = now; }
    if (foodPct !== rawFood) { rawFood = foodPct; rawFoodAt = now; }

    if (rawLife >= 0 && rawLife !== settledLife && now - rawLifeAt >= STABLE_MS) {
      const up = settledLife >= 0 && rawLife > settledLife;
      settledLife = rawLife;
      if (up) healAt = now;
    }
    if (rawFood >= 0 && rawFood !== settledFood && now - rawFoodAt >= STABLE_MS) {
      const down = settledFood >= 0 && rawFood < settledFood;
      settledFood = rawFood;
      if (down) starveAt = now;
    }
  }

  function showStarveSec() {
    return Math.max(0, Math.floor(6 - (Date.now() - starveAt) / 1000));
  }

  function showHealSec() {
    return Math.max(0, Math.floor(11 - (Date.now() - healAt) / 1000));
  }

  function hudReady() {
    const anchor = barAnchor();
    return !!(anchor && anchor.fresh && anchor.us > 0 && typeof anchor.barTop === 'number');
  }

  function draw(ctx, env) {
    if (SM.barGauges) SM.barGauges.install();
    const stats = readStats() || {};
    tickTimers(stats);

    const showStats = SM.settings.hudPercents;
    const showTimers = SM.settings.hudTimers;
    const showDay = SM.settings.daysCounter;
    if (!showStats && !showTimers && !showDay) return;

    const life = stats.life;
    const food = stats.food;
    const warm = stats.warm;
    const thirst = stats.thirst;
    const cold = stats.cold;

    const lay = hudLayout(env);
    const u = uiScale(lay);
    const fill = showTimers ? 'red' : '#ffffff';
    const ready = hudReady();

    ctx.save();

    if (showTimers && ready) {
      if (life != null) {
        const hp = hpTextPos(lay);
        if (hp) hudText(ctx, Math.floor(life * 200) + 'hp', hp.x, hp.y, fill, u, true);
      }
      // На полном HP хил-таймер прячем (восстанавливать нечего).
      const hpFull = life != null && life >= 0.999;
      const heal = hpFull ? null : timerTextPos(lay, 0);
      const starve = timerTextPos(lay, 1);
      if (heal) hudText(ctx, showHealSec() + 's', heal.x, heal.y, TIMER_HEAL_COLOR, u, true);
      if (starve) hudText(ctx, showStarveSec() + 's', starve.x, starve.y, TIMER_STARVE_COLOR, u, true);
    }

    if (showStats && ready) {
      if (life != null) {
        const p = pctTextPos(lay, 0);
        hudText(ctx, pct(life), p.x, p.y, fill, u);
      }
      if (food != null) {
        const p = pctTextPos(lay, 1);
        hudText(ctx, pct(food), p.x, p.y, fill, u);
      }
      if (cold != null || warm != null) {
        const p = pctTextPos(lay, 2);
        const c = cold != null ? cold : 0;
        const wa = warm != null ? warm : 1;
        const tp = Math.max(0, Math.min(100, Math.floor(c * 100 + (1 - wa) * 100)));
        hudText(ctx, tp + '%', p.x, p.y, fill, u);
      }
      if (thirst != null) {
        const p = pctTextPos(lay, 3);
        hudText(ctx, pct(thirst), p.x, p.y, fill, u);
      }
    }

    if (showDay) {
      const user = V.getUser();
      let day = null;
      const dovr = V.override('day');
      try { day = (typeof dovr === 'string') ? user[dovr] : user.day; } catch (_) {}
      if (typeof day === 'number') {
        hudText(ctx, 'D: ' + day, lay.ox - 40 * u, lay.oy + 8 * u, '#5f57ff', u);
      }
    }

    ctx.restore();
  }

  V.register(['hudPercents', 'hudTimers', 'daysCounter'], draw);

  function fmt(totalSec) {
    totalSec = Math.max(0, Math.floor(totalSec));
    const d = Math.floor(totalSec / 86400);
    const h = Math.floor((totalSec % 86400) / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const out = [];
    if (d) out.push(d + 'd');
    if (h) out.push(h + 'h');
    if (m) out.push(m + 'm');
    out.push(s + 's');
    return out.join(' ');
  }

  function parseToSec(str) {
    str = String(str).trim();
    const colon = str.match(/^(\d+):(\d{1,2})(?::(\d{1,2}))?$/);
    if (colon) {
      if (colon[3] != null) return (+colon[1]) * 3600 + (+colon[2]) * 60 + (+colon[3]);
      return (+colon[1]) * 60 + (+colon[2]);
    }
    const min = str.match(/(\d+)\s*min/i);
    if (min) return (+min[1]) * 60;
    const sec = str.match(/(\d+)\s*sec/i);
    if (sec) return +sec[1];
    return null;
  }

  let questTimer = 0;
  // Игра обновляет textContent элемента каждую секунду. Раньше мы кэшировали
  // ПЕРВОЕ значение в data-sv-raw и потом подставляли его же → таймер застывал.
  // Теперь парсим ЖИВОЙ текст: если это игровой формат (M:SS / "5 min") —
  // переформатируем; наш собственный формат parseToSec вернёт null → не трогаем.
  function questTick() {
    if (!SM.settings.betterQuestTime) return;
    document.querySelectorAll('[id^="timeremain_"]').forEach(function (el) {
      const cur = el.textContent;
      const sec = parseToSec(cur);
      if (sec == null) return;
      const out = fmt(sec);
      if (out !== cur) el.textContent = out;
    });
  }

  SM.features = SM.features || {};
  SM.features.hudStats = {
    ensureBarProbe: function () {
      if (SM.barGauges) SM.barGauges.install();
    },
    init: function () {
      if (SM.barGauges) SM.barGauges.install();
      if (questTimer) return;
      questTimer = setInterval(questTick, 1000);
      SM.log('visuals.hud: загружен (bar-gauges)');
    },
    probe: function () {
      const s = readStats();
      const rep = 'hudStats.barGauges: stats=' + JSON.stringify(s) +
        ' layout=' + JSON.stringify(barAnchor()) +
        ' debug=' + JSON.stringify(SM.barGauges && SM.barGauges._debug ? SM.barGauges._debug() : null);
      console.log(rep);
      return rep;
    },
  };
})(window.__SM__ = window.__SM__ || {});


/* ===== src/features/visuals/on-top.js ===== */
/**
 * features/visuals/on-top.js — On top как oldscript.
 * Лоадер дублирует игровые циклы отрисовки в конце render; здесь — фильтры прохода.
 */
;(function (SM) {
  'use strict';

  const T = {
    PLAYERS: 0,
    CHEST: 11,
    TOTEM: 38,
    DEAD_BOX: 98,
    CRATE: 102,
    GIFT: 103,
  };

  function classify(unit) {
    if (!unit || typeof unit.type !== 'number') return null;
    switch (unit.type) {
      case T.PLAYERS: return 'player';
      case T.CHEST: return 'chest';
      case T.TOTEM: return 'totem';
      case T.DEAD_BOX:
      case T.CRATE:
      case T.GIFT: return 'box';
      default: return null;
    }
  }

  function settingOn(kind) {
    if (!kind) return false;
    const s = SM.settings;
    switch (kind) {
      case 'player': return !!s.playerOnTop;
      case 'box': return !!s.boxOnTop;
      case 'totem': return !!s.totemOnTop;
      case 'chest': return !!s.chestOnTop;
      default: return false;
    }
  }

  function install() {
    window.__SV_OT_LATE_PASS__ = false;

    window.__SV_OT_EARLY__ = function (kind) {
      if (!settingOn(kind)) return true;
      return false;
    };

    window.__SV_OT_LATE__ = function (kind) {
      if (!settingOn(kind)) return false;
      return true;
    };

    window.__SV_OT_PRE__ = function (unit) {
      if (window.__SV_OT_LATE_PASS__) return true;
      const kind = classify(unit);
      if (!kind || !settingOn(kind)) return true;
      return false;
    };

    window.__SV_OT_PLAYER_DRAW__ = function (mode) {
      if (!SM.settings.playerOnTop) return mode === 'early';
      return mode === 'late';
    };

    // Фолбэк: если цикл не продублировался патчем, перерисовать через draw_transition.
    // onlyKind — опционально один kind ('chest'|'totem'|'box').
    window.__SV_OT_RUN_LATE__ = function (onlyKind) {
      if (!window.__SV_DRAW_TR__) return;
      const V = SM.visuals;
      if (!V || !V.unitsOfType) return;
      const wasLate = window.__SV_OT_LATE_PASS__;
      window.__SV_OT_LATE_PASS__ = true;
      try {
        const dt = window.__SV_DRAW_TR__;
        const spr = window.__SV_SPRITE__;
        const items = window.__SV_ITEMS__;
        function drawType(type, kind) {
          if (onlyKind && onlyKind !== kind) return;
          if (!settingOn(kind)) return;
          const list = V.unitsOfType(type);
          if (!list) return;
          const env = V.env();
          const sc = env && env.scale ? env.scale : 1;
          const m = 96 * sc;
          const vw = env && env.cssW ? env.cssW * sc : 0;
          const vh = env && env.cssH ? env.cssH * sc : 0;
          let sk = null;
          if (items && typeof items === 'object') {
            const ks = Object.getOwnPropertyNames(items);
            for (let i = 0; i < ks.length; i++) {
              if (items[ks[i]] === type) { sk = ks[i]; break; }
            }
          }
          for (let i = 0; i < list.length; i++) {
            const u = list[i];
            if (!u || typeof u.x !== 'number') continue;
            if (vw > 0 && V.project) {
              const p = V.project(u.x, u.y);
              if (!p || p.x < -m || p.x > vw + m || p.y < -m || p.y > vh + m) continue;
            }
            try {
              if (sk && spr && spr[sk] != null) dt(u, spr[sk]);
              else dt(u);
            } catch (_) {}
          }
        }
        if (SM.settings.boxOnTop) {
          drawType(T.CRATE, 'box');
          drawType(T.DEAD_BOX, 'box');
          drawType(T.GIFT, 'box');
        }
        if (SM.settings.totemOnTop) drawType(T.TOTEM, 'totem');
        if (SM.settings.chestOnTop) drawType(T.CHEST, 'chest');
      } finally {
        window.__SV_OT_LATE_PASS__ = wasLate;
      }
    };
  }

  function init() {
    install();
    SM.log('visuals.on-top: hooks installed');
  }

  function probe() {
    const rep = {
      pre: typeof window.__SV_OT_PRE__,
      early: typeof window.__SV_OT_EARLY__,
      late: typeof window.__SV_OT_LATE__,
      runLate: typeof window.__SV_OT_RUN_LATE__,
      drawTr: typeof window.__SV_DRAW_TR__,
      items: !!window.__SV_ITEMS__,
      sprite: !!window.__SV_SPRITE__,
      settings: {
        playerOnTop: SM.settings.playerOnTop,
        boxOnTop: SM.settings.boxOnTop,
        totemOnTop: SM.settings.totemOnTop,
        chestOnTop: SM.settings.chestOnTop,
      },
    };
    console.log('[starve-mod] onTop.probe', rep);
    return rep;
  }

  SM.features = SM.features || {};
  SM.features.onTop = { init: init, install: install, probe: probe };

  install();
})(window.__SM__ = window.__SM__ || {});


/* ===== src/features/visuals/world-esp.js ===== */
/**
 * features/visuals/world-esp.js — ESP-текст в мире (порт идей oldscript):
 *   TotemInfo  — над тотемами: владелец (если резолвится) + ally/enemy цвет
 *   boxInfo    — над DEAD_BOX/CRATE/GIFT/TREASURE_CHEST: метка + ник владельца
 *   BuildInfo  — над экстракторами/мельницей/печью: ресурсы из unit.info (битовые поля)
 *   ShowNames+ — над игроками: ник + [уровень] (если резолвится реестр игроков)
 *
 * Рисуем на overlay-canvas (SM.visuals) через проекцию камеры — без патчей движка.
 * Координаты x/y/type/id юнита НЕ обфусцированы. Ник/уровень владельца берём из
 * реестра игроков мира (резолвим по сигнатуре; оверрайд __SV_VIS_KEYS__).
 */
;(function (SM) {
  'use strict';

  const V = SM.visuals;
  if (!V) return;
  const T = V.T;

  const COL_ALLY = '#71d36a';
  const COL_ENEMY = '#ff5a5a';
  const COL_NEUTRAL = '#ffffff';

  // ---- реестр игроков (pid -> { nickname, level }) --------------------------
  let playersKey = null, nickKey = null, levelKey = null;

  function resolvePlayers() {
    const world = V.getWorld();
    if (!world) return null;

    const ovr = V.override('players');
    if (ovr && typeof ovr === 'string' && world[ovr]) {
      const reg = world[ovr];
      ensureNickLevel(reg);
      return reg;
    }
    if (world.players && typeof world.players === 'object') {
      playersKey = 'players';
      let sample = null;
      try {
        const sk = Object.getOwnPropertyNames(world.players);
        for (let j = 0; j < sk.length; j++) {
          const e = world.players[sk[j]];
          if (e && typeof e === 'object' && !Array.isArray(e)) { sample = e; break; }
        }
      } catch (_) {}
      ensureNickLevel(sample);
      return world.players;
    }
    if (playersKey && world[playersKey]) return world[playersKey];

    // ищем коллекцию объектов со строковым полем (ник) и небольшим числовым (уровень)
    const keys = Object.getOwnPropertyNames(world);
    for (let i = 0; i < keys.length; i++) {
      let v; try { v = world[keys[i]]; } catch (_) { continue; }
      if (!v || typeof v !== 'object') continue;
      let sample = null;
      if (Array.isArray(v)) {
        for (let j = 0; j < v.length; j++) { if (v[j] && typeof v[j] === 'object' && !Array.isArray(v[j])) { sample = v[j]; break; } }
      } else {
        const sk = Object.getOwnPropertyNames(v);
        for (let j = 0; j < sk.length; j++) { const e = v[sk[j]]; if (e && typeof e === 'object' && !Array.isArray(e)) { sample = e; break; } }
      }
      if (!sample) continue;
      // не должен быть юнитом (у юнита есть x,y,type,id)
      if (typeof sample.x === 'number' && typeof sample.type === 'number' && typeof sample.id === 'number') continue;
      const hasStr = Object.getOwnPropertyNames(sample).some(function (k) { const s = sample[k]; return typeof s === 'string' && s.length > 0 && s.length < 40; });
      if (hasStr) { playersKey = keys[i]; ensureNickLevel(sample); return v; }
    }
    return null;
  }

  function ensureNickLevel(sample) {
    const ovr = V.override('players_fields');
    if (ovr && typeof ovr === 'object') { if (ovr.nick) nickKey = ovr.nick; if (ovr.level) levelKey = ovr.level; }
    if (!sample || typeof sample !== 'object') return;
    if (typeof sample.nickname === 'string') nickKey = nickKey || 'nickname';
    if (typeof sample.level === 'number') levelKey = levelKey || 'level';
    if (!nickKey) {
      const ks = Object.getOwnPropertyNames(sample);
      for (let i = 0; i < ks.length; i++) { const s = sample[ks[i]]; if (typeof s === 'string' && s.length > 0 && s.length < 40) { nickKey = ks[i]; break; } }
    }
    if (!levelKey) {
      const ks = Object.getOwnPropertyNames(sample);
      for (let i = 0; i < ks.length; i++) { const n = sample[ks[i]]; if (typeof n === 'number' && n >= 0 && n < 2000 && Number.isInteger(n)) { levelKey = ks[i]; break; } }
    }
  }

  function ownerMeta(pid) {
    if (typeof pid !== 'number') return null;
    const reg = resolvePlayers();
    if (!reg) return null;
    let p = null;
    try { p = reg[pid]; } catch (_) {}
    if (!p || typeof p !== 'object') return null;
    return {
      nick: nickKey && typeof p[nickKey] === 'string' ? p[nickKey] : null,
      level: levelKey && typeof p[levelKey] === 'number' ? p[levelKey] : null,
    };
  }

  function allyColor(pid) {
    if (typeof pid !== 'number' || pid <= 0) return COL_NEUTRAL;
    return V.isAlly(pid) ? COL_ALLY : COL_ENEMY;
  }

  // ---- проход по типу с отрисовкой (только видимые на экране) ----------------
  function onScreen(p, margin) {
    const e = V.env();
    if (!e || !e.cssW) return true;
    const sc = e.scale || 1;
    const m = margin != null ? margin : 80 * sc;
    const w = e.cssW * sc;
    const h = e.cssH * sc;
    return p.x >= -m && p.x <= w + m && p.y >= -m && p.y <= h + m;
  }

  function each(type, fn) {
    const arr = V.unitsOfType(type);
    if (!arr) return;
    for (let i = 0; i < arr.length; i++) {
      const u = arr[i];
      if (!u || typeof u.x !== 'number') continue;
      const p = V.project(u.x, u.y);
      if (!p || !onScreen(p)) continue;
      fn(u, p);
    }
  }

  // ---- TotemInfo (oldscript: renderName + info team count + Lock/Open) -------
  function renderOwnerName(ctx, p, m, sc, offY) {
    if (!m || !m.nick) return;
    const y = p.y + offY * sc;
    const size = 20;
    V.text(ctx, m.nick, p.x, y, { size: size, color: '#ffffff', lineWidth: 7 });
    if (m.level == null) return;
    ctx.save();
    ctx.font = size * sc + 'px "Baloo Paaji", sans-serif';
    const nameW = ctx.measureText(m.nick).width;
    const lvl = '[' + m.level + ']';
    const lvlW = ctx.measureText(lvl).width;
    ctx.restore();
    V.text(ctx, lvl, p.x + nameW / 2 + lvlW + 5 * sc, y, { size: size, color: 'gold', lineWidth: 7 });
  }

  function drawTotems(ctx) {
    const sc = V.env().scale;
    each(T.TOTEM, function (u, p) {
      const pid = V.pidOf(u);
      const info = typeof u.info === 'number' ? u.info : 0;
      const locked = info >= 16;
      const members = locked ? (info % 16) : info;

      V.text(ctx, '🤵' + members, p.x, p.y - 20 * sc, { size: 20, color: '#ffffff', lineWidth: 7 });
      V.text(ctx, locked ? 'Lock' : 'Open', p.x, p.y + 5 * sc, { size: 20, color: '#ffffff', lineWidth: 7 });
      renderOwnerName(ctx, p, ownerMeta(pid), sc, 25);
    });
  }

  // ---- boxInfo (мёртвые ящики / крейты / подарки / клады) --------------------
  function drawBoxes(ctx) {
    const sc = V.env().scale;
    function label(type, name) {
      each(type, function (u, p) {
        const pid = V.pidOf(u);
        const m = ownerMeta(pid);
        const who = m && m.nick ? m.nick : name;
        V.text(ctx, who, p.x, p.y - 38 * sc, { size: 15, color: allyColor(pid), lineWidth: 4 });
        // доп. число (hits/таймер) если есть осмысленное поле
        const extra = (typeof u.info === 'number') ? u.info : (typeof u.action === 'number' ? u.action : null);
        if (extra != null && extra > 0) V.text(ctx, String(extra), p.x, p.y - 20 * sc, { size: 13, color: '#ffd76a', lineWidth: 3 });
      });
    }
    label(T.DEAD_BOX, 'Dead box');
    label(T.CRATE, 'Crate');
    label(T.GIFT, 'Gift');
    label(T.TREASURE_CHEST, 'Treasure');
  }

  // ---- BuildInfo (экстракторы/мельница/печь) ---------------------------------
  // unit.info — упакованные счётчики (как oldscript buildingInfo):
  //   экстрактор/мельница: lo = info & 0xFF, hi = (info & 0xFF00) >> 8
  //   печь: wood = info & 0x1F, flour = (info & 0x3E0) >> 5, bread = (info & 0x7C00) >> 10
  function drawBuildInfo(ctx) {
    const sc = V.env().scale;
    const col = COL_NEUTRAL;

    function drawPair(u, p, topOff, botOff) {
      if (typeof u.info !== 'number') return;
      const lo = u.info & 0xFF;
      const hi = (u.info & 0xFF00) >> 8;
      V.text(ctx, lo + 'x', p.x, p.y + topOff * sc, { size: 20, color: col, lineWidth: 7 });
      V.text(ctx, hi + 'x', p.x, p.y + botOff * sc, { size: 20, color: col, lineWidth: 7 });
    }

    for (let t = T.EXTRACTOR_MIN; t <= T.EXTRACTOR_MAX; t++) {
      each(t, function (u, p) { drawPair(u, p, -10, 10); });
    }
    each(T.WINDMILL, function (u, p) { drawPair(u, p, -5, 15); });
    each(T.BREAD_OVEN, function (u, p) {
      if (typeof u.info !== 'number') return;
      V.text(ctx, (u.info & 0x1F) + 'x w', p.x, p.y - 15 * sc, { size: 20, color: col, lineWidth: 7 });
      V.text(ctx, ((u.info & 0x3E0) >> 5) + 'x f', p.x, p.y + 5 * sc, { size: 20, color: col, lineWidth: 7 });
      V.text(ctx, ((u.info & 0x7C00) >> 10) + 'x b', p.x, p.y + 25 * sc, { size: 20, color: col, lineWidth: 7 });
    });
    each(T.EMERALD_MACHINE, function (u, p) {
      const pid = V.pidOf(u);
      const m = ownerMeta(pid);
      const label = m && m.nick ? m.nick + (m.level != null ? ' [' + m.level + ']' : '') : 'Emerald';
      V.text(ctx, label, p.x, p.y + 10 * sc, { size: 20, color: allyColor(pid), lineWidth: 7 });
    });
  }

  // ---- ShowNames+ (игроки) ---------------------------------------------------
  function drawNames(ctx) {
    const sc = V.env().scale;
    const selfPid = V.selfPid();
    each(T.PLAYERS, function (u, p) {
      const pid = V.pidOf(u);
      const m = ownerMeta(pid);
      if (!m || !m.nick) return; // без реестра имён — пропускаем (нативные ники остаются)
      const lvl = m.level != null ? ' [' + m.level + ']' : '';
      const col = pid === selfPid ? '#ffffff' : allyColor(pid);
      V.text(ctx, m.nick + lvl, p.x, p.y - 70 * sc, { size: 16, color: col, lineWidth: 5 });
    });
  }

  // ---- drawInChest: предпросмотр содержимого сундука -------------------------
  // У сундука .action (выбранный слот*2 = id предмета) и .info (количество).
  // Картинку предмета берём из game.chest_buttons[id] (как oldscript:
  // game.chest_buttons[action/2-1].info.img[0]). game выставлен лоадером на
  // window.__SV_GAME__; ключи (массив кнопок / поле с картинками) резолвим по форме.

  function isImg(v) {
    return (
      v && typeof v === 'object' && !Array.isArray(v) &&
      typeof v.width === 'number' && typeof v.height === 'number' && v.width > 0 && v.height > 0 &&
      (
        (typeof HTMLImageElement !== 'undefined' && v instanceof HTMLImageElement) ||
        (typeof HTMLCanvasElement !== 'undefined' && v instanceof HTMLCanvasElement) ||
        typeof v.getContext === 'function' || 'src' in v || typeof v.complete === 'boolean'
      )
    );
  }

  // Рекурсивный поиск картинки внутри объекта-кнопки. Картинка может лежать как
  // entry.<img>, entry.info.<img>, entry.<arr>[0], entry.info.img[0][0] и т.п.
  // (структура зависит от версии клиента), поэтому ищем вглубь до depth уровней.
  function findImageIn(o, depth) {
    if (isImg(o)) return o;
    if (depth <= 0 || !o || typeof o !== 'object') return null;
    if (Array.isArray(o)) {
      const lim = Math.min(o.length, 8);
      for (let i = 0; i < lim; i++) { const r = findImageIn(o[i], depth - 1); if (r) return r; }
      return null;
    }
    const ks = Object.getOwnPropertyNames(o);
    for (let i = 0; i < ks.length; i++) {
      const k = ks[i];
      if (k === 'translate' || k === 'state' || k === 'callback' || k === 'position') continue;
      let v; try { v = o[k]; } catch (_) { continue; }
      if (typeof v === 'function' || typeof v === 'number' || typeof v === 'string') continue;
      const r = findImageIn(v, depth - 1);
      if (r) return r;
    }
    return null;
  }

  // chest_buttons: массив на game (game.І̵︅), индексируется id предмета; элементы —
  // объекты-кнопки, содержащие спрайт предмета. Кэшируем найденный ключ массива.
  let cbKey = null, cbAt = 0;
  function gameObj() { try { const g = window.__SV_GAME__; return g && typeof g === 'object' ? g : null; } catch (_) { return null; } }

  function looksLikeButtons(arr) {
    if (!Array.isArray(arr) || arr.length < 50 || arr.length > 600) return false;
    let ok = 0, idMatch = 0, checked = 0;
    for (let i = 0; i < arr.length && checked < 12; i++) {
      const e = arr[i];
      if (!e || typeof e !== 'object' || Array.isArray(e) || isImg(e)) continue; // нужен объект-обёртка
      checked++;
      if (findImageIn(e, 4)) ok++;
      if (typeof e.id === 'number' && e.id === i) idMatch++; // сигнатура chest_buttons (.id===index)
    }
    return ok >= 3 ? (idMatch > 0 ? 2 : 1) : 0; // 2 — точное совпадение, 1 — годится
  }

  function resolveChestButtons() {
    const game = gameObj();
    if (!game) return null;
    const now = Date.now();
    if (cbKey && Array.isArray(game[cbKey]) && now - cbAt < 8000) return game[cbKey];
    cbKey = null;

    const ovr = V.override('chest_buttons');
    if (typeof ovr === 'string' && Array.isArray(game[ovr])) { cbKey = ovr; cbAt = now; return game[ovr]; }

    const keys = Object.getOwnPropertyNames(game);
    let best = null, bestScore = 0;
    for (let i = 0; i < keys.length; i++) {
      let arr; try { arr = game[keys[i]]; } catch (_) { continue; }
      const sc = looksLikeButtons(arr);
      if (sc > bestScore) { bestScore = sc; best = keys[i]; if (sc >= 2) break; }
    }
    if (best) { cbKey = best; cbAt = now; return game[best]; }
    return null;
  }

  function chestItemImage(slot) {
    if (typeof slot !== 'number' || slot < 0) return null;
    const cb = resolveChestButtons();
    if (!cb) return null;
    const entry = cb[slot];
    if (!entry || typeof entry !== 'object') return null;
    return findImageIn(entry, 4);
  }

  function drawChests(ctx) {
    const sc = V.env().scale;
    each(T.CHEST, function (u, p) {
      if (typeof u.action !== 'number' || u.action <= 0) return;
      const slot = u.action / 2 - 1;
      const cnt = (typeof u.info === 'number') ? u.info : null;
      const img = chestItemImage(slot);

      if (img) {
        // иконка предмета над сундуком (фикс. css-размер с сохранением пропорций)
        const cssH = 38;
        const h = cssH * sc;
        const w = h * (img.width / img.height);
        ctx.save();
        ctx.globalAlpha = 0.95;
        try { ctx.imageSmoothingEnabled = false; } catch (_) {}
        try { ctx.drawImage(img, p.x - w / 2, p.y - h / 2 - 8 * sc, w, h); } catch (_) {}
        ctx.restore();
        if (cnt != null && cnt > 0) {
          V.text(ctx, 'x' + cnt, p.x, p.y + 18 * sc, { size: 13, color: '#ffe08a', lineWidth: 4, bold: true });
        }
      } else {
        // фолбэк (game ещё не выставлен / картинка не нашлась): как раньше — текст
        const label = '#' + slot + (cnt != null ? ' x' + cnt : '');
        V.text(ctx, label, p.x, p.y - 16 * sc, { size: 14, color: '#ffe08a', lineWidth: 4 });
      }
      if (typeof u.lock !== 'undefined') {
        V.text(ctx, u.lock ? 'Cl' : 'Op', p.x + 22 * sc, p.y - 14 * sc, { size: 12, color: u.lock ? '#ff8a8a' : '#9ad6ff', lineWidth: 3 });
      }
    });
  }

  function draw(ctx) {
    if (SM.settings.totemInfo) drawTotems(ctx);
    if (SM.settings.boxInfo) drawBoxes(ctx);
    if (SM.settings.buildInfo) drawBuildInfo(ctx);
    if (SM.settings.chestInfo) drawChests(ctx);
    if (SM.settings.showNamesPlus) drawNames(ctx);
  }

  V.register(['totemInfo', 'boxInfo', 'buildInfo', 'chestInfo', 'showNamesPlus'], draw, { heavy: true });

  SM.features = SM.features || {};
  SM.features.worldEsp = {
    init: function () { SM.log('visuals.world-esp: загружен'); },
  };
})(window.__SM__ = window.__SM__ || {});


/* ===== src/features/visuals/map-esp.js ===== */
/**
 * features/visuals/map-esp.js — радар в углу (порт идей Map-папки oldscript):
 *   TotemOnMap   — точки тотемов (ally/enemy цвет)
 *   PlayersOnMap — точки игроков (self белый, ally зелёный, enemy красный)
 *   LastDeath    — отметка последней своей смерти
 *
 * Вместо патча обфусцированной миникарты рисуем собственный радар на overlay-canvas.
 * Размер мира определяем по наблюдаемому максимуму координат (starve-координаты
 * положительные 0..mapSize); можно задать вручную __SV_VIS_KEYS__.mapSize.
 */
;(function (SM) {
  'use strict';

  const V = SM.visuals;
  if (!V) return;
  const T = V.T;

  let seenMax = 12000; // нижняя граница; растёт по факту
  function mapSize() {
    const ovr = V.override('mapSize');
    if (typeof ovr === 'number' && ovr > 0) return ovr;
    return seenMax;
  }
  function track(x, y) {
    const m = Math.max(x, y);
    if (m > seenMax) seenMax = Math.ceil(m / 1000) * 1000;
  }

  // ---- последняя смерть ------------------------------------------------------
  let lastDeath = null;
  let hadSelf = false;
  function updateDeath() {
    const self = V.getSelf();
    if (self && typeof self.x === 'number') {
      hadSelf = true;
      lastDeath = lastDeath || null; // ничего
      _lastSelf = { x: self.x, y: self.y };
    } else if (hadSelf && _lastSelf) {
      lastDeath = { x: _lastSelf.x, y: _lastSelf.y };
      hadSelf = false;
    }
  }
  let _lastSelf = null;

  function dot(ctx, rx, ry, x, y, w, h, color, r) {
    const px = rx + (x / mapSize()) * w;
    const py = ry + (y / mapSize()) * h;
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
    return { px: px, py: py };
  }

  function draw(ctx, env) {
    updateDeath();
    const sc = env.scale;
    const W = 190 * sc, H = 190 * sc;
    const rx = env.cssW * sc - W - 16 * sc; // правый верх, под FPS-блоком
    const ry = 16 * sc;

    // фон радара
    ctx.save();
    ctx.fillStyle = 'rgba(20,24,30,0.45)';
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 2 * sc;
    ctx.fillRect(rx, ry, W, H);
    ctx.strokeRect(rx, ry, W, H);
    ctx.restore();

    const selfPid = V.selfPid();

    if (SM.settings.totemOnMap) {
      const arr = V.unitsOfType(T.TOTEM);
      if (arr) for (let i = 0; i < arr.length; i++) {
        const u = arr[i]; if (!u || typeof u.x !== 'number') continue;
        track(u.x, u.y);
        dot(ctx, rx, ry, u.x, u.y, W, H, V.isAlly(V.pidOf(u)) ? '#71d36a' : '#ff5a5a', 3.5 * sc);
      }
    }

    if (SM.settings.playersOnMap) {
      const arr = V.unitsOfType(T.PLAYERS);
      if (arr) for (let i = 0; i < arr.length; i++) {
        const u = arr[i]; if (!u || typeof u.x !== 'number') continue;
        track(u.x, u.y);
        const pid = V.pidOf(u);
        const col = pid === selfPid ? '#ffffff' : (V.isAlly(pid) ? '#71d36a' : '#ff5a5a');
        dot(ctx, rx, ry, u.x, u.y, W, H, col, pid === selfPid ? 4 * sc : 3 * sc);
      }
    }

    if (SM.settings.lastDeath && lastDeath) {
      const d = dot(ctx, rx, ry, lastDeath.x, lastDeath.y, W, H, '#ffd76a', 0);
      V.text(ctx, '\u2620', d.px, d.py + 6 * sc, { size: 16, color: '#ffd76a', lineWidth: 3 });
    }
  }

  V.register(['totemOnMap', 'playersOnMap', 'lastDeath'], draw, { heavy: true });

  SM.features = SM.features || {};
  SM.features.mapEsp = {
    init: function () { SM.log('visuals.map-esp: загружен'); },
  };
})(window.__SM__ = window.__SM__ || {});


/* ===== src/features/visuals/mob-tracers.js ===== */
/**
 * features/visuals/mob-tracers.js — трейсеры на животных (линии от игрока + счётчик слева).
 * Группы по биомам как в NVX. Рисуем на overlay-canvas через SM.visuals.
 */
;(function (SM) {
  'use strict';

  const LABELS = {
    WOLF: 'Wolf',
    SPIDER: 'Spider',
    BOAR: 'Boar',
    RABBIT: 'Rabbit',
    HAWK: 'Hawk',
    MAMMOTH: 'Mammoth',
    BABY_MAMMOTH: 'Baby Mammoth',
    PENGUIN: 'Penguin',
    VULTURE: 'Vulture',
    SAND_WORM: 'Sand Worm',
    LAVA_DRAGON: 'Lava Dragon',
    BABY_LAVA: 'Baby Lava',
    BABY_DRAGON: 'Baby Dragon',
    FLAME: 'Flame',
    PIRANHA: 'Piranha',
    KRAKEN: 'Kraken',
    CRAB_BOSS: 'Crab Boss',
    PARROT: 'Parrot',
    HEN: 'Hen',
    GOLDEN_CHICKEN: 'Golden Chicken',
  };

  const COLORS = {
    WOLF: '#e8e8e8',
    SPIDER: '#b565ff',
    BOAR: '#c49a6c',
    RABBIT: '#ffd6e7',
    HAWK: '#74b9ff',
    MAMMOTH: '#dfe6e9',
    BABY_MAMMOTH: '#b2bec3',
    PENGUIN: '#81ecec',
    VULTURE: '#636e72',
    SAND_WORM: '#fdcb6e',
    LAVA_DRAGON: '#ff6b6b',
    BABY_LAVA: '#ff7675',
    BABY_DRAGON: '#fab1a0',
    FLAME: '#ff4757',
    PIRANHA: '#0984e3',
    KRAKEN: '#6c5ce7',
    CRAB_BOSS: '#e17055',
    PARROT: '#00b894',
    HEN: '#fd79a8',
    GOLDEN_CHICKEN: '#fdcb6e',
  };

  /** Биом → список id мобов (каждый моб только в одном биоме). */
  const BIOMES = [
    { id: 'forest', label: 'Forest', mobs: ['WOLF', 'SPIDER', 'BOAR', 'RABBIT', 'HAWK', 'PARROT', 'HEN', 'GOLDEN_CHICKEN'] },
    { id: 'winter', label: 'Winter', mobs: ['MAMMOTH', 'BABY_MAMMOTH', 'PENGUIN'] },
    { id: 'desert', label: 'Desert', mobs: ['VULTURE', 'SAND_WORM'] },
    { id: 'lava', label: 'Lava', mobs: ['LAVA_DRAGON', 'BABY_LAVA', 'BABY_DRAGON', 'FLAME'] },
    { id: 'ocean', label: 'Ocean', mobs: ['PIRANHA', 'KRAKEN', 'CRAB_BOSS'] },
  ];

  function mobIdsFromBiomes() {
    const ids = [];
    for (let i = 0; i < BIOMES.length; i++) {
      const m = BIOMES[i].mobs;
      for (let j = 0; j < m.length; j++) ids.push(m[j]);
    }
    return ids;
  }

  let MOBS = null;

  function ensureSettings() {
    if (!SM.settings.tracers || typeof SM.settings.tracers !== 'object') {
      SM.settings.tracers = {};
    }
    const t = SM.settings.tracers;
    const ids = MOBS ? Object.keys(MOBS) : mobIdsFromBiomes();
    for (let i = 0; i < ids.length; i++) {
      if (typeof t[ids[i]] !== 'boolean') t[ids[i]] = false;
    }
  }

  function anyEnabled() {
    ensureSettings();
    const t = SM.settings.tracers;
    const ids = MOBS ? Object.keys(MOBS) : mobIdsFromBiomes();
    for (let i = 0; i < ids.length; i++) {
      if (t[ids[i]]) return true;
    }
    return false;
  }

  // GUI читает BIOMES сразу — не зависит от visuals.core.
  SM.tracers = {
    BIOMES: BIOMES,
    MOBS: null,
    LABELS: LABELS,
    ensureSettings: ensureSettings,
    anyEnabled: anyEnabled,
  };

  const V = SM.visuals;
  if (!V) {
    SM.warn('mob-tracers: visuals.core не загружен');
    SM.features = SM.features || {};
    SM.features.mobTracers = { init: function () { ensureSettings(); } };
    return;
  }

  const T = V.T;
  MOBS = {
    WOLF: T.WOLF,
    SPIDER: T.SPIDER,
    BOAR: T.BOAR,
    RABBIT: T.RABBIT,
    HAWK: T.HAWK,
    MAMMOTH: T.MAMMOTH,
    BABY_MAMMOTH: T.BABY_MAMMOTH,
    PENGUIN: T.PENGUIN,
    VULTURE: T.VULTURE,
    SAND_WORM: T.SAND_WORM,
    LAVA_DRAGON: T.LAVA_DRAGON,
    BABY_LAVA: T.BABY_LAVA,
    BABY_DRAGON: T.BABY_DRAGON,
    FLAME: T.FLAME,
    PIRANHA: T.PIRANHA,
    KRAKEN: T.KRAKEN,
    CRAB_BOSS: T.CRAB_BOSS,
    PARROT: T.PARROT,
    HEN: T.HEN,
    GOLDEN_CHICKEN: T.GOLDEN_CHICKEN,
  };
  SM.tracers.MOBS = MOBS;

  function isOnScreen(x, y, w, h) {
    return x > 0 && x < w && y > 0 && y < h;
  }

  const MAX_TRACER_LINES = 40;

  function draw(ctx) {
    if (!anyEnabled()) return;
    const self = V.getSelf();
    const user = V.getUser();
    if (!self || !user || !env.cam) return;

    const sc = env.scale;
    const cssW = env.cssW;
    const cssH = env.cssH;
    const cam = env.cam;
    const px = cam.x + self.x;
    const py = cam.y + self.y;
    const pxDev = px * sc;
    const pyDev = py * sc;

    const counts = [];
    const mobIds = Object.keys(MOBS);
    let linesDrawn = 0;

    for (let m = 0; m < mobIds.length; m++) {
      const id = mobIds[m];
      if (!SM.settings.tracers[id]) continue;

      const type = MOBS[id];
      const arr = V.unitsOfType(type);
      if (!arr) continue;

      const color = COLORS[id] || '#ffffff';
      let visible = 0;

      for (let i = 0; i < arr.length; i++) {
        const u = arr[i];
        if (!u || typeof u.x !== 'number' || typeof u.y !== 'number') continue;

        const sx = u.x + cam.x;
        const sy = u.y + cam.y;
        if (!isOnScreen(sx, sy, cssW, cssH)) continue;

        visible++;
        if (linesDrawn < MAX_TRACER_LINES) {
          linesDrawn++;
          ctx.save();
          ctx.beginPath();
          ctx.lineWidth = 2 * sc;
          ctx.strokeStyle = color;
          ctx.globalAlpha = 0.85;
          ctx.moveTo(pxDev, pyDev);
          ctx.lineTo(sx * sc, sy * sc);
          ctx.stroke();
          ctx.restore();
        }
      }

      if (visible > 0) {
        counts.push({ id: id, label: LABELS[id] || id, count: visible, color: color });
      }
    }

    if (!counts.length) return;

    const lineH = 22 * sc;
    const startY = (cssH / 2 - (counts.length * lineH) / 2) * sc;
    const x = 12 * sc;
    const fontSize = 16 * sc;

    ctx.save();
    ctx.font = 'bold ' + fontSize + 'px "Baloo Paaji", sans-serif';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.lineWidth = 4 * sc;

    for (let i = 0; i < counts.length; i++) {
      const c = counts[i];
      const text = c.label + ': ' + c.count;
      const y = startY + i * lineH;
      ctx.strokeStyle = 'black';
      ctx.fillStyle = c.color;
      ctx.strokeText(text, x, y);
      ctx.fillText(text, x, y);
    }
    ctx.restore();
  }

  let env = { scale: 1, cam: null, cssW: 0, cssH: 0 };
  V.registerEnabled(anyEnabled, function (ctx, e) {
    env = e;
    draw(ctx);
  }, true);

  ensureSettings();

  SM.features = SM.features || {};
  SM.features.mobTracers = {
    init: function () {
      ensureSettings();
      SM.log('visuals.mob-tracers: загружен');
    },
  };
})(window.__SM__ = window.__SM__ || {});


/* ===== src/features/visuals/mob-hp.js ===== */
/**
 * features/visuals/mob-hp.js — HP над мобами (как NVX MobHealth / oldscript).
 *
 * РАНЬШЕ урон считался по СВОИМ исходящим атакам [7, angle] с дугой/радиусом и
 * кулдауном — это давало рассинхрон (хп падало с задержкой), пропуски ударов
 * («через раз») и фантомный урон (паук < 600 на полном хп).
 *
 * ТЕПЕРЬ урон снимается по ВХОДЯЩЕМУ серверному сигналу, как в оригинальном
 * клиенте: у юнита есть числовое поле `action` (битовая маска состояний); бит
 * STATE.HURT (=2) выставляется ровно в тот тик, когда сервер засчитал попадание
 * (красная вспышка урона). Ловим фронт этого бита и вычитаем урон атакующего(их)
 * игрока(ов) рядом — точно синхронно с игрой, без задержек и пропусков.
 */
;(function (SM) {
  'use strict';

  const V = SM.visuals;
  if (!V) return;
  const T = V.T;

  const DRAGON_HELMET = 105;
  // Биты STATE из протокола (стабильны: задаются сервером). HURT — вспышка урона,
  // ATTACK — игрок в фазе замаха. Подтверждено по oldscript (var_5253=2, ATTACK=16)
  // и живому клиенту (this.action & STATE.*).
  const STATE_HURT = 2;
  const STATE_ATTACK = 16;
  // Запас к дальности оружия при сопоставлении атакующего с мобом (радиус тела
  // моба + неточности позиций). Попадание уже подтверждено битом HURT — здесь лишь
  // определяем КТО и СКОЛЬКО, поэтому можно быть щедрым.
  const RANGE_MARGIN = 90;
  const FACE_TOLERANCE = 1.0;
  const DEFAULT_DMG = 10;

  const MOBS = (SM.tracers && SM.tracers.MOBS) || {
    WOLF: T.WOLF,
    SPIDER: T.SPIDER,
    FOX: T.FOX,
    BEAR: T.BEAR,
    DRAGON: T.DRAGON,
    BOAR: T.BOAR,
    RABBIT: T.RABBIT,
    HAWK: T.HAWK,
    MAMMOTH: T.MAMMOTH,
    BABY_MAMMOTH: T.BABY_MAMMOTH,
    PENGUIN: T.PENGUIN,
    VULTURE: T.VULTURE,
    SAND_WORM: T.SAND_WORM,
    LAVA_DRAGON: T.LAVA_DRAGON,
    BABY_LAVA: T.BABY_LAVA,
    BABY_DRAGON: T.BABY_DRAGON,
    FLAME: T.FLAME,
    FIREFLY: T.FIREFLY,
    PIRANHA: T.PIRANHA,
    KRAKEN: T.KRAKEN,
    CRAB_BOSS: T.CRAB_BOSS,
    PARROT: T.PARROT,
    HEN: T.HEN,
    GOLDEN_CHICKEN: T.GOLDEN_CHICKEN,
  };

  const ANIMAL_TYPES = new Set(Object.values(MOBS));

  /** Макс. HP по type (world_ids / NVX getHealthByType). */
  const MAX_HP = {
    [T.RABBIT]: 60,
    [T.PENGUIN]: 90,
    [T.SPIDER]: 120,
    [T.PARROT]: 200,
    [T.FIREFLY]: 240,
    [T.HAWK]: 250,
    [T.DRAGON]: 1000,
    [T.KRAKEN]: 6000,
    [T.WOLF]: 300,
    [T.FOX]: 300,
    [T.VULTURE]: 300,
    [T.BEAR]: 600,
    [T.BOAR]: 600,
    [T.SAND_WORM]: 600,
    [T.MAMMOTH]: 900,
    [T.BABY_MAMMOTH]: 900,
    [T.BABY_DRAGON]: 900,
    [T.LAVA_DRAGON]: 3000,
    [T.FLAME]: 1500,
    [T.BABY_LAVA]: 1500,
    [T.CRAB_BOSS]: 1500,
    [T.PIRANHA]: 1500,
    [T.HEN]: 60,
    [T.GOLDEN_CHICKEN]: 90,
  };

  const SPEAR_IDS = new Set([
    12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
    60, 61, 99, 100,
  ]);
  const AXE_IDS = new Set([
    167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181,
  ]);

  /** Урон по id предмета в правой руке (NVX getPlayerDamage + items.txt). */
  const WEAPON_DMG = {
    0: 10, 5: 12, 6: 14, 9: 10, 48: 19, 103: 12,
    28: 30, 108: 24, 109: 24, 110: 24, 111: 24, 112: 24, 113: 24,
    114: 24, 115: 27, 116: 27, 117: 27, 118: 33,
    12: 12, 13: 12, 14: 15, 15: 17, 16: 24, 17: 24, 18: 14, 19: 19,
    20: 19, 21: 19, 22: 22, 23: 22, 24: 24, 25: 24, 26: 24, 27: 24,
    60: 19, 61: 22,
    167: 14, 168: 22, 169: 24, 170: 27, 171: 30, 172: 33,
    173: 27, 174: 27, 175: 27, 176: 27, 177: 27, 178: 30, 179: 30, 180: 30, 181: 33,
    62: 2, 63: 3, 64: 4, 65: 5, 66: 6, 72: 6, 73: 5, 74: 5, 75: 5, 76: 5, 77: 5, 78: 5, 79: 5, 80: 5, 81: 5,
    82: 2, 86: 3, 87: 4, 88: 5, 89: 6, 90: 5, 91: 5, 92: 5, 93: 5, 94: 5, 95: 5, 96: 5, 97: 5, 98: 5,
    1: 2, 3: 3, 4: 4, 8: 2, 49: 5, 50: 6, 51: 5, 52: 5, 53: 5, 54: 5, 55: 5, 56: 5, 57: 5, 58: 5, 59: 5,
  };

  /** Урон топоров по мобам (клиент: отдельно от PvP-урона, wood=24). */
  const MOB_AXE_DMG = {
    167: 24, 168: 32, 169: 34, 170: 37, 171: 40, 172: 43,
    173: 37, 174: 37, 175: 37, 176: 37, 177: 37, 178: 40, 179: 40, 180: 40, 181: 43,
  };

  const hpStore = new Map();
  // Предыдущее состояние бита HURT по юниту — для детекта фронта (0→2 = новый удар).
  const prevHurt = new Map();

  function maxHp(type) {
    return MAX_HP[type] || 0;
  }

  function unitKey(u) {
    return u.type + ':' + u.id;
  }

  function getPlayerDamage(self) {
    if (!self || typeof self.right !== 'number') return 0;
    const r = self.right;
    const c = self.clothe;
    if (r === 16 && c === DRAGON_HELMET) return 24;
    if (r === 28 && c === DRAGON_HELMET) return 33;
    if (Object.prototype.hasOwnProperty.call(WEAPON_DMG, r)) return WEAPON_DMG[r];
    if (SPEAR_IDS.has(r)) return 17;
    if (AXE_IDS.has(r)) return 22;
    if (r >= 0 && r < 200) return 10;
    return 0;
  }

  function getMobDamage(self) {
    if (!self || typeof self.right !== 'number') return 0;
    const r = self.right;
    if (Object.prototype.hasOwnProperty.call(MOB_AXE_DMG, r)) return MOB_AXE_DMG[r];
    return getPlayerDamage(self);
  }

  function weaponType(rightId) {
    if (SPEAR_IDS.has(rightId)) return 2;
    if (AXE_IDS.has(rightId)) return 6;
    return 1;
  }

  function weaponRange(rightId) {
    switch (weaponType(rightId)) {
      case 2: return 227.6;
      case 6: return 144;
      default: return 157.6;
    }
  }

  function normAngle(a) {
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    return a;
  }

  function ensureHp(u) {
    const max = maxHp(u.type);
    if (!max) return 0;
    const k = unitKey(u);
    if (!hpStore.has(k)) hpStore.set(k, max);
    return hpStore.get(k);
  }

  /**
   * Сколько урона нанёс только что подтверждённый сервером удар по мобу.
   * Как oldscript getAttackers / NVX: суммируем урон игроков, которые сейчас в
   * фазе замаха (action & ATTACK), смотрят на моба и в пределах дальности оружия.
   * Если таких нет (флаг замаха уже снят анимацией) — берём урон ближайшего
   * игрока в радиусе; в крайнем случае — дефолт, чтобы хп всё же убавилось.
   */
  function damageForHit(mob) {
    const players = V.unitsOfType(T.PLAYERS);
    if (!players) return DEFAULT_DMG;

    let total = 0;
    let nearest = null;
    let nearestDist = Infinity;

    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      if (!p || typeof p.x !== 'number' || typeof p.y !== 'number') continue;
      const dx = mob.x - p.x;
      const dy = mob.y - p.y;
      const dist = Math.hypot(dx, dy);
      const reach = weaponRange(p.right) + RANGE_MARGIN;
      if (dist > reach) continue;

      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = p;
      }

      if (typeof p.action === 'number' && (p.action & STATE_ATTACK)) {
        const facing = typeof p.angle === 'number'
          ? Math.abs(normAngle(Math.atan2(dy, dx) - p.angle)) <= FACE_TOLERANCE
          : true;
        if (facing) total += getMobDamage(p);
      }
    }

    if (total > 0) return total;
    if (nearest) {
      const d = getMobDamage(nearest);
      return d > 0 ? d : DEFAULT_DMG;
    }
    return DEFAULT_DMG;
  }

  /**
   * Сэмплируем поле action всех мобов и ловим фронт бита HURT (0→2). На фронте =
   * сервер засчитал попадание этот тик → вычитаем урон. Движок сам гасит бит после
   * анимации вспышки, поэтому к следующему удару он снова обнуляется.
   */
  function trackHits() {
    const alive = new Set();
    ANIMAL_TYPES.forEach(function (type) {
      if (!maxHp(type)) return;
      const arr = V.unitsOfType(type);
      if (!arr) return;
      for (let i = 0; i < arr.length; i++) {
        const u = arr[i];
        if (!u || typeof u.id !== 'number') continue;
        const k = unitKey(u);
        alive.add(k);

        const hurtNow = typeof u.action === 'number' && (u.action & STATE_HURT) ? 1 : 0;
        const hurtPrev = prevHurt.get(k);
        // Первый показ юнита: фиксируем базу без вычета (могли увидеть мид-вспышки).
        if (hurtPrev === undefined) {
          ensureHp(u);
          prevHurt.set(k, hurtNow);
          continue;
        }
        if (hurtNow && !hurtPrev) {
          const hp = Math.max(0, ensureHp(u) - damageForHit(u));
          hpStore.set(k, hp);
        }
        prevHurt.set(k, hurtNow);
      }
    });

    // GC: убираем исчезнувших (смерть/уход из зоны видимости).
    hpStore.forEach(function (_, k) {
      if (!alive.has(k)) { hpStore.delete(k); prevHurt.delete(k); }
    });
    prevHurt.forEach(function (_, k) {
      if (!alive.has(k)) prevHurt.delete(k);
    });
  }

  function draw(ctx, e) {
    if (!SM.settings.mobHp) return;
    trackHits();
    if (!e.cam) return;

    ANIMAL_TYPES.forEach(function (type) {
      const max = maxHp(type);
      if (!max) return;
      const arr = V.unitsOfType(type);
      if (!arr) return;
      for (let i = 0; i < arr.length; i++) {
        const u = arr[i];
        if (!u || typeof u.x !== 'number' || typeof u.y !== 'number') continue;
        const hp = ensureHp(u);
        const p = V.project(u.x, u.y - 22);
        if (!p) continue;
        V.text(ctx, hp + '\u2764\uFE0F', p.x, p.y, {
          size: 16,
          color: '#ffffff',
          stroke: '#000000',
          lineWidth: 7,
        });
      }
    });
  }

  V.register('mobHp', draw, { heavy: true });

  SM.features = SM.features || {};
  SM.features.mobHp = {
    init: function () {
      SM.log('visuals.mob-hp: загружен (детект урона по action&HURT)');
    },
  };
})(window.__SM__ = window.__SM__ || {});


/* ===== src/features/autofarm.js ===== */
/**
 * features/autofarm.js — AutoFarm по 4 точкам (как NVX AutoFarm mode=square):
 *   задать point1..point4 → персонаж ходит по кругу и бьёт на каждой точке.
 */
;(function (SM) {
  'use strict';

  const TICK_MS = 80;
  const ARRIVAL_DIST = 100;
  const POINT_COUNT = 4;

  let active = false;
  let timer = 0;
  let currentPoint = 1;
  let offset = 0;
  let lockedAngle = 0;
  const warned = Object.create(null);

  function ensurePoints() {
    if (!Array.isArray(SM.settings.autofarmPoints)) {
      SM.settings.autofarmPoints = [];
    }
    const pts = SM.settings.autofarmPoints;
    for (let i = 0; i < POINT_COUNT; i++) {
      if (!pts[i] || typeof pts[i] !== 'object') pts[i] = { x: -1, y: -1 };
      if (typeof pts[i].x !== 'number') pts[i].x = -1;
      if (typeof pts[i].y !== 'number') pts[i].y = -1;
    }
    if (pts.length > POINT_COUNT) pts.length = POINT_COUNT;
    if (typeof SM.settings.autofarmMaxOffset !== 'number' || !Number.isFinite(SM.settings.autofarmMaxOffset)) {
      SM.settings.autofarmMaxOffset = 30;
    }
  }

  function getSelf() {
    return SM.visuals && SM.visuals.getSelf ? SM.visuals.getSelf() : null;
  }

  function allPointsSet() {
    ensurePoints();
    const pts = SM.settings.autofarmPoints;
    for (let i = 0; i < POINT_COUNT; i++) {
      if (pts[i].x === -1 || pts[i].y === -1) return false;
    }
    return true;
  }

  /** Угол к цели (NVX calcAngle, useInterpolated=false). */
  function calcAngle(self, target) {
    return Math.atan2(target.y - self.y, target.x - self.x);
  }

  /** NVX angle → WASD битмаска для [0x25, mask]. */
  function angleToMoveMask(rad) {
    if (rad == null || !Number.isFinite(rad)) return 0;
    const deg = rad * (180 / Math.PI);
    let mask = 0;
    if (deg > -67.5 && deg < 67.5) mask |= 0x2;
    else if (deg > 112.5 || deg < -112.5) mask |= 0x1;
    if (deg > 22.5 && deg < 157.5) mask |= 0x4;
    else if (deg < -22.5 && deg > -157.5) mask |= 0x8;
    return mask;
  }

  function targetPoint() {
    ensurePoints();
    return SM.settings.autofarmPoints[currentPoint - 1];
  }

  function tick() {
    if (!active) return;

    if (SM.features.extra && SM.features.extra.isActive && SM.features.extra.isActive('spectator')) {
      return;
    }

    const self = getSelf();
    if (!self) return;

    if (!allPointsSet()) {
      if (!warned.points) {
        warned.points = true;
        SM.warn('AutoFarm: задай все 4 точки (Combat → Set Point #1..#4)');
      }
      return;
    }
    warned.points = false;

    const target = targetPoint();
    const angle = calcAngle(self, target);
    const dist = Math.hypot(self.x - target.x, self.y - target.y);
    const maxOff = Math.max(0, SM.settings.autofarmMaxOffset || 0);

    if (dist < ARRIVAL_DIST + offset) {
      currentPoint = currentPoint >= POINT_COUNT ? 1 : currentPoint + 1;
      offset = Math.random() * maxOff;
    }

    let delta = angle - lockedAngle;
    while (delta < -Math.PI) delta += Math.PI * 2;
    while (delta > Math.PI) delta -= Math.PI * 2;
    const step = Math.random() * 0.2 + 0.35;
    if (Math.abs(delta) > step) delta = (Math.abs(delta) / delta) * step;
    lockedAngle += delta;
    if (lockedAngle > Math.PI) lockedAngle -= Math.PI * 2;
    if (lockedAngle < -Math.PI) lockedAngle += Math.PI * 2;

    const byte = SM.protocol.radToUint8(lockedAngle);
    if (byte != null) {
      SM.protocol.setAngle(byte);
      SM.protocol.attackAngle(byte);
    }
    SM.protocol.move(angleToMoveMask(angle));
  }

  function ensureLoop() {
    if (active && !timer) timer = setTimeout(loop, TICK_MS);
  }

  function loop() {
    timer = 0;
    tick();
    if (active) timer = setTimeout(loop, TICK_MS);
  }

  function stopMotion() {
    SM.protocol.stopAttack();
    SM.protocol.move(0);
  }

  function setActive(on) {
    if (on && !SM.settings.autofarm) {
      SM.warn('AutoFarm: включи тумблер в меню → Combat → AutoFarm');
      return;
    }
    if (active === !!on) return;
    active = !!on;
    if (on) {
      SM.net.ensureInstalled();
      warned.points = false;
      SM.warn('[starve-mod] AutoFarm ACTIVE');
      ensureLoop();
    } else {
      stopMotion();
      SM.log('AutoFarm off');
    }
  }

  function setPoint(index) {
    ensurePoints();
    const self = getSelf();
    if (!self) {
      SM.warn('AutoFarm: зайди в игру, чтобы поставить точку #' + index);
      return false;
    }
    const i = index - 1;
    SM.settings.autofarmPoints[i].x = Math.floor(self.x);
    SM.settings.autofarmPoints[i].y = Math.floor(self.y);
    SM.storage.save();
    SM.log('AutoFarm point#' + index, SM.settings.autofarmPoints[i]);
    SM.bus.emit('autofarm:points');
    return true;
  }

  function clearPoints() {
    ensurePoints();
    for (let i = 0; i < POINT_COUNT; i++) {
      SM.settings.autofarmPoints[i].x = -1;
      SM.settings.autofarmPoints[i].y = -1;
    }
    currentPoint = 1;
    offset = 0;
    SM.storage.save();
    SM.bus.emit('autofarm:points');
    SM.log('AutoFarm: точки сброшены');
  }

  function draw(ctx, env) {
    ensurePoints();
    const pts = SM.settings.autofarmPoints;
    const cam = env.cam;
    if (!cam) return;

    const sc = env.scale;
    const drawn = [];
    for (let i = 0; i < POINT_COUNT; i++) {
      const p = pts[i];
      if (p.x === -1 || p.y === -1) continue;
      drawn.push({ n: i + 1, sx: (p.x + cam.x) * sc, sy: (p.y + cam.y) * sc });
    }
    if (!drawn.length) return;

    ctx.save();
    ctx.lineWidth = 2 * sc;
    ctx.strokeStyle = 'rgba(255, 220, 80, 0.85)';
    ctx.fillStyle = 'rgba(255, 220, 80, 0.95)';
    ctx.font = 'bold ' + 14 * sc + 'px "Baloo Paaji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (drawn.length > 1) {
      ctx.beginPath();
      for (let i = 0; i < drawn.length; i++) {
        const d = drawn[i];
        if (i === 0) ctx.moveTo(d.sx, d.sy);
        else ctx.lineTo(d.sx, d.sy);
      }
      if (drawn.length === POINT_COUNT) ctx.closePath();
      ctx.stroke();
    }

    for (let j = 0; j < drawn.length; j++) {
      const d = drawn[j];
      ctx.beginPath();
      ctx.arc(d.sx, d.sy, 6 * sc, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3 * sc;
      ctx.strokeText(String(d.n), d.sx, d.sy);
      ctx.fillText(String(d.n), d.sx, d.sy);
      ctx.strokeStyle = 'rgba(255, 220, 80, 0.85)';
      ctx.lineWidth = 2 * sc;
    }
    ctx.restore();
  }

  ensurePoints();

  if (SM.visuals && SM.visuals.registerEnabled) {
    SM.visuals.registerEnabled(function () {
      ensurePoints();
      const pts = SM.settings.autofarmPoints;
      for (let i = 0; i < POINT_COUNT; i++) {
        const p = pts[i];
        if (p && p.x !== -1 && p.y !== -1) return true;
      }
      return false;
    }, draw);
  }

  SM.features = SM.features || {};
  SM.features.autofarm = {
    init: function () {
      ensurePoints();
      SM.log('autofarm: ready (4 points, NVX square mode)');
    },
    setActive: setActive,
    isActive: function () { return active; },
    setPoint: setPoint,
    clearPoints: clearPoints,
    allPointsSet: allPointsSet,
    ensurePoints: ensurePoints,
  };
})(window.__SM__ = window.__SM__ || {});


/* ===== src/features/worm-collector.js ===== */
/**
 * features/worm-collector.js — авто-принос червей из пустыни (Worm Farm).
 *
 * Логика (по ТЗ):
 *   1. Персонаж бегает ПО ВСЕЙ пустыни (wander по карте) и ищет песчаных червей.
 *   2. Увидел червя → бежит к нему; как только червь заагрился (дистанция <=
 *      wormAggroDist) → червь засчитан, бежим к следующему.
 *   3. Набрал минимум wormTarget (дефолт 22 из 30) → идёт на точку отдачи.
 *   4. На точке отдачи ждёт, пока червей заберут (деаггр) → бежит собирать заново.
 *
 * PATHFINDER (steering, как NVX/oldscript):
 *   • Препятствие = ВСЁ рядом, кроме игроков, червей и грифов (так ловим даже
 *     кактусы/камни/деревья с обфусцированным type).
 *   • Радиус объезда зависит от типа: шипы — маленький (проходим между ними),
 *     стены/машины — средний, ресурсы/кактусы — большой (чтобы не задеть рукой).
 *   • Если прямой проход свободен — идём прямо (не ищем обходы зря).
 *   • Тупик → уходим по вектору отталкивания от препятствий (анти-залипание),
 *     курс движения сглажен (без резких метаний влево-вправо).
 *   • Удар рукой блокируется, если по направлению взгляда в зоне досягаемости
 *     есть препятствие (кактус/стена) — не бьём и не получаем урон.
 *   • Гриф (VULTURE) → ставим крыши (ROOF) перед собой и обязательно бежим.
 */
;(function (SM) {
  'use strict';

  const V = SM.visuals;

  const TICK_MS = 80;
  const ARRIVAL_DIST = 120;
  const SAND_WORM = 87;
  const VULTURE = 86;
  const ROOF_ID = 292;
  const STONE_ROOF_ID = 360;

  // --- steering / обход препятствий -----------------------------------------
  const LOOKAHEAD = 220;          // длина «прощупывающего» луча
  const RAY_STEPS = 7;
  const HAND_REACH = 92;          // на этой дистанции рука/оружие достаёт цель
  const MAX_TURN = 0.6;           // макс. поворот курса за тик (рад) — анти-метания
  const STEER_DEVIATIONS = buildDeviations();

  // Радиусы объезда по категориям типа.
  const R_SPIKE = 40;             // шипы тонкие — проходим в щель между ними
  const R_WALL = 52;
  const R_MACHINE = 58;
  const R_ANIMAL = 52;
  const R_RESOURCE = 100;         // кактусы/камни/деревья: держим дистанцию (не бить рукой)

  // --- защита крышами от грифов ---------------------------------------------
  const VULTURE_DANGER = 650;
  const ROOF_INTERVAL_MS = 280;

  // --- роуминг / анти-залипание ---------------------------------------------
  const WANDER_DIST = 1600;
  const STUCK_DIST = 24;          // сдвинулись меньше за окно → застряли
  const STUCK_MS = 450;
  const ESCAPE_MS = 900;          // столько держим фиксированный курс побега

  // --- доставка / детект «забрали» ------------------------------------------
  const FOLLOW_RADIUS = 540;
  const TAKEN_CONFIRM_MS = 1100;

  // Несолидные постройки (world_ids 1..70) — проходимы, не объезжаем.
  const NON_SOLID = new Set([3, 39, 40, 42, 45, 46, 47, 48, 49, 50, 51, 52, 53, 63, 64, 66, 67, 68]);

  // Известные категории мировых типов (world_ids.txt) для подбора радиуса.
  const SPIKE_TYPES = new Set([5, 12, 13, 14, 20, 61, 54, 55, 56, 57, 58, 62]);
  const WALL_TYPES = new Set([4, 7, 8, 9, 19, 59, 10, 15, 16, 17, 21, 60, 69, 70]);
  const MACHINE_TYPES = new Set([1, 2, 6, 11, 18, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 41, 43, 44, 65]);
  const ANIMAL_TYPES = new Set([71, 72, 73, 74, 75, 76, 77, 79, 80, 81, 82, 83, 84, 85, 88, 89, 90, 92, 93, 94, 96, 106]);

  const OBSTACLE_TYPES = buildObstacleTypes();
  const GATHER_R = LOOKAHEAD + R_RESOURCE + 10;

  function buildDeviations() {
    const out = [0];
    for (let d = 12; d <= 168; d += 12) {
      out.push(d * (Math.PI / 180));
      out.push(-d * (Math.PI / 180));
    }
    return out;
  }

  function buildObstacleTypes() {
    const list = [];
    // Всё в 1..110, кроме проходимого, грифа (86) и наших червей (87).
    for (let t = 1; t <= 110; t++) {
      if (t === VULTURE || t === SAND_WORM) continue;
      if (NON_SOLID.has(t)) continue;
      list.push(t);
    }
    return list;
  }

  function radiusForType(t) {
    if (SPIKE_TYPES.has(t)) return R_SPIKE;
    if (WALL_TYPES.has(t)) return R_WALL;
    if (MACHINE_TYPES.has(t)) return R_MACHINE;
    if (ANIMAL_TYPES.has(t)) return R_ANIMAL;
    return R_RESOURCE; // обфусцированные ресурсы/декор (кактус/камень/дерево)
  }

  let active = false;
  let timer = 0;
  let phase = 'collect';          // 'collect' | 'deliver' | 'wait'
  let lastRoofAt = 0;
  let wanderHeading = 0;
  let lockedMove = null;          // сглаженный курс движения
  let stuckPos = null;
  let stuckSince = 0;
  let escapeUntil = 0;
  let escapeAngle = 0;
  let escalations = 0;
  let lastEscapeAt = 0;
  let takenSince = 0;
  const collected = new Set();
  const warned = Object.create(null);

  function ensureSettings() {
    if (typeof SM.settings.wormTarget !== 'number' || !Number.isFinite(SM.settings.wormTarget)) {
      SM.settings.wormTarget = 22;
    }
    if (typeof SM.settings.wormAggroDist !== 'number' || !Number.isFinite(SM.settings.wormAggroDist)) {
      SM.settings.wormAggroDist = 160;
    }
    if (typeof SM.settings.wormRoof !== 'boolean') SM.settings.wormRoof = true;
    const dp = SM.settings.wormDeliveryPoint;
    if (!dp || typeof dp !== 'object') {
      SM.settings.wormDeliveryPoint = { x: -1, y: -1 };
    } else {
      if (typeof dp.x !== 'number') dp.x = -1;
      if (typeof dp.y !== 'number') dp.y = -1;
    }
  }

  function getSelf() {
    return V && V.getSelf ? V.getSelf() : null;
  }

  function deliveryPoint() {
    ensureSettings();
    const dp = SM.settings.wormDeliveryPoint;
    if (!dp || dp.x === -1 || dp.y === -1) return null;
    return dp;
  }

  function target() {
    ensureSettings();
    return Math.max(1, Math.floor(SM.settings.wormTarget));
  }

  function calcAngle(self, tx, ty) {
    return Math.atan2(ty - self.y, tx - self.x);
  }

  function dist2(ax, ay, bx, by) {
    const dx = ax - bx;
    const dy = ay - by;
    return dx * dx + dy * dy;
  }

  function wrapAngle(a) {
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    return a;
  }

  function smoothAngle(cur, tgt, maxStep) {
    if (cur == null || !Number.isFinite(cur)) return tgt;
    let d = wrapAngle(tgt - cur);
    if (Math.abs(d) > maxStep) d = (d < 0 ? -1 : 1) * maxStep;
    return wrapAngle(cur + d);
  }

  /** NVX angle → WASD-битмаска для бинарного move [0x25, mask]. */
  function angleToMoveMask(rad) {
    if (rad == null || !Number.isFinite(rad)) return 0;
    const deg = rad * (180 / Math.PI);
    let mask = 0;
    if (deg > -67.5 && deg < 67.5) mask |= 0x2;        // right
    else if (deg > 112.5 || deg < -112.5) mask |= 0x1; // left
    if (deg > 22.5 && deg < 157.5) mask |= 0x4;        // down
    else if (deg < -22.5 && deg > -157.5) mask |= 0x8; // up
    return mask;
  }

  // ---- pathfinder -----------------------------------------------------------
  function nearbyObstacles(self) {
    const out = [];
    if (!V || !V.unitsOfType) return out;
    const r2 = GATHER_R * GATHER_R;
    for (let i = 0; i < OBSTACLE_TYPES.length; i++) {
      const t = OBSTACLE_TYPES[i];
      const arr = V.unitsOfType(t);
      if (!arr) continue;
      const rad = radiusForType(t);
      for (let j = 0; j < arr.length; j++) {
        const u = arr[j];
        if (!u || typeof u.x !== 'number' || typeof u.y !== 'number') continue;
        if (dist2(u.x, u.y, self.x, self.y) <= r2) out.push({ x: u.x, y: u.y, r: rad });
      }
    }
    return out;
  }

  /** Свободен ли луч из self под углом angle на dist. */
  function rayClear(self, angle, dist, obstacles) {
    const cx = Math.cos(angle);
    const cy = Math.sin(angle);
    for (let s = 1; s <= RAY_STEPS; s++) {
      const d = (dist * s) / RAY_STEPS;
      const px = self.x + cx * d;
      const py = self.y + cy * d;
      for (let i = 0; i < obstacles.length; i++) {
        const o = obstacles[i];
        if (dist2(o.x, o.y, px, py) < o.r * o.r) return false;
      }
    }
    return true;
  }

  /** Возвращает {angle, clear}: курс ближайший к desired и свободен ли он. */
  function steer(self, desired, obstacles) {
    if (!obstacles.length) return { angle: desired, clear: true };
    for (let i = 0; i < STEER_DEVIATIONS.length; i++) {
      const a = desired + STEER_DEVIATIONS[i];
      if (rayClear(self, a, LOOKAHEAD, obstacles)) return { angle: a, clear: true };
    }
    for (let i = 0; i < STEER_DEVIATIONS.length; i++) {
      const a = desired + STEER_DEVIATIONS[i];
      if (rayClear(self, a, LOOKAHEAD * 0.5, obstacles)) return { angle: a, clear: true };
    }
    return { angle: desired, clear: false };
  }

  /** Курс «прочь от препятствий» (сумма векторов отталкивания). */
  function repulsionAngle(self, obstacles, fallback) {
    let vx = 0, vy = 0;
    for (let i = 0; i < obstacles.length; i++) {
      const o = obstacles[i];
      const dx = self.x - o.x;
      const dy = self.y - o.y;
      const d = Math.hypot(dx, dy) || 1;
      const range = o.r + 90;
      if (d >= range) continue;
      const w = range - d; // ближе → сильнее
      vx += (dx / d) * w;
      vy += (dy / d) * w;
    }
    if (Math.abs(vx) < 1e-3 && Math.abs(vy) < 1e-3) {
      return fallback + (Math.random() * 1.6 - 0.8);
    }
    return Math.atan2(vy, vx);
  }

  /** Есть ли препятствие в зоне удара рукой по направлению взгляда. */
  function obstacleInAimReach(self, aim, obstacles) {
    if (aim == null || !Number.isFinite(aim)) return false;
    const ca = Math.cos(aim);
    const sa = Math.sin(aim);
    const reach2 = HAND_REACH * HAND_REACH;
    for (let i = 0; i < obstacles.length; i++) {
      const o = obstacles[i];
      const dx = o.x - self.x;
      const dy = o.y - self.y;
      const d2 = dx * dx + dy * dy;
      // достанем рукой, если центр ближе, чем reach + радиус препятствия
      const reach = HAND_REACH + o.r;
      if (d2 > reach * reach) continue;
      const dot = dx * ca + dy * sa;
      if (dot <= 0) continue; // не перед нами
      const d = Math.sqrt(d2) || 1;
      if (dot / d > 0.25) return true; // в секторе ~±75° от взгляда
      if (d2 < reach2) return true;     // вплотную — блокируем в любом случае
    }
    return false;
  }

  // ---- черви ----------------------------------------------------------------
  function visibleWorms() {
    if (!V || !V.unitsOfType) return null;
    return V.unitsOfType(SAND_WORM);
  }

  function pickWorm(self, aggro) {
    const worms = visibleWorms();
    if (!worms) return null;
    const aggro2 = aggro * aggro;
    let best = null;
    let bestD = Infinity;
    for (let i = 0; i < worms.length; i++) {
      const w = worms[i];
      if (!w || typeof w.x !== 'number' || typeof w.id !== 'number') continue;
      const d2 = dist2(w.x, w.y, self.x, self.y);
      if (d2 <= aggro2) collected.add(w.id);
      if (collected.has(w.id)) continue;
      if (d2 < bestD) { bestD = d2; best = w; }
    }
    return best;
  }

  function nearestWorm(self) {
    const worms = visibleWorms();
    if (!worms) return null;
    let best = null;
    let bestD = Infinity;
    for (let i = 0; i < worms.length; i++) {
      const w = worms[i];
      if (!w || typeof w.x !== 'number') continue;
      const d2 = dist2(w.x, w.y, self.x, self.y);
      if (d2 < bestD) { bestD = d2; best = w; }
    }
    return best;
  }

  function followingCount(self) {
    const worms = visibleWorms();
    if (!worms) return 0;
    const r2 = FOLLOW_RADIUS * FOLLOW_RADIUS;
    let n = 0;
    for (let i = 0; i < worms.length; i++) {
      const w = worms[i];
      if (!w || typeof w.x !== 'number' || typeof w.id !== 'number') continue;
      if (!collected.has(w.id)) continue;
      if (dist2(w.x, w.y, self.x, self.y) <= r2) n++;
    }
    return n;
  }

  // ---- защита крышами от грифов ---------------------------------------------
  function vultureThreat(self) {
    if (!V || !V.unitsOfType) return false;
    const vults = V.unitsOfType(VULTURE);
    if (!vults) return false;
    const d2 = VULTURE_DANGER * VULTURE_DANGER;
    for (let i = 0; i < vults.length; i++) {
      const v = vults[i];
      if (!v || typeof v.x !== 'number') continue;
      if (dist2(v.x, v.y, self.x, self.y) <= d2) return true;
    }
    return false;
  }

  function roofItemId() {
    if (!SM.inventory) return ROOF_ID;
    if (SM.inventory.count(ROOF_ID) > 0) return ROOF_ID;
    if (SM.inventory.count(STONE_ROOF_ID) > 0) return STONE_ROOF_ID;
    return null;
  }

  function defendWithRoof(self, moveAngle) {
    if (!SM.settings.wormRoof) return;
    if (!vultureThreat(self)) return;
    const now = performance.now();
    if (now - lastRoofAt < ROOF_INTERVAL_MS) return;
    const id = roofItemId();
    if (id == null) {
      if (!warned.roof) {
        warned.roof = true;
        SM.warn('Worm Farm: нет крыш (ROOF) в инвентаре — гриф может убить');
      }
      return;
    }
    warned.roof = false;
    lastRoofAt = now;
    const base = SM.protocol.radToUint8(moveAngle);
    if (base == null) return;
    SM.protocol.place(id, base);
    SM.protocol.place(id, (base + 8) & 0xff);
    SM.protocol.place(id, (base - 8 + 256) & 0xff);
  }

  // ---- анти-залипание -------------------------------------------------------
  function updateStuck(self, obstacles) {
    const now = performance.now();
    if (!stuckPos) { stuckPos = { x: self.x, y: self.y }; stuckSince = now; return; }
    const moved = Math.hypot(self.x - stuckPos.x, self.y - stuckPos.y);
    if (moved > STUCK_DIST) { stuckPos.x = self.x; stuckPos.y = self.y; stuckSince = now; return; }
    if (now - stuckSince > STUCK_MS) {
      // эскалация при повторных застреваниях подряд
      if (now - lastEscapeAt < 2500) escalations = Math.min(escalations + 1, 4);
      else escalations = 0;
      lastEscapeAt = now;
      escapeAngle = repulsionAngle(self, obstacles, wanderHeading + Math.PI);
      // при эскалации добавляем случайный разброс, чтобы вырваться из ловушки
      escapeAngle += (Math.random() - 0.5) * (0.6 + escalations * 0.5);
      escapeUntil = now + ESCAPE_MS + escalations * 300;
      wanderHeading = escapeAngle;
      stuckPos.x = self.x; stuckPos.y = self.y; stuckSince = now;
    }
  }

  function wanderDest(self) {
    return {
      x: self.x + Math.cos(wanderHeading) * WANDER_DIST,
      y: self.y + Math.sin(wanderHeading) * WANDER_DIST,
    };
  }

  // ---- общий «движитель» ----------------------------------------------------
  function drive(self, destX, destY, aimAngle, obstacles) {
    const now = performance.now();
    let moveAngle;

    if (now < escapeUntil) {
      // режим побега: держим фиксированный курс прочь от препятствий
      moveAngle = escapeAngle;
    } else {
      const desired = calcAngle(self, destX, destY);
      const res = steer(self, desired, obstacles);
      if (res.clear) {
        moveAngle = res.angle;
        wanderHeading = res.angle;
      } else {
        // тупик — уходим по отталкиванию (а не плющимся в стену)
        moveAngle = repulsionAngle(self, obstacles, desired);
        wanderHeading = moveAngle;
      }
    }

    // сглаживаем курс, чтобы не метаться влево-вправо
    lockedMove = smoothAngle(lockedMove, moveAngle, MAX_TURN);
    const finalMove = lockedMove;

    // удар рукой — только если не заденем кактус/стену
    const aim = aimAngle != null ? aimAngle : finalMove;
    if (!obstacleInAimReach(self, aim, obstacles)) {
      const aimByte = SM.protocol.radToUint8(aim);
      if (aimByte != null) {
        SM.protocol.setAngle(aimByte);
        SM.protocol.attackAngle(aimByte);
      }
    } else {
      // всё равно поворачиваемся куда бьём бы, но не машем
      const aimByte = SM.protocol.radToUint8(aim);
      if (aimByte != null) SM.protocol.setAngle(aimByte);
    }

    defendWithRoof(self, finalMove);
    SM.protocol.move(angleToMoveMask(finalMove));
  }

  function tick() {
    if (!active) return;
    if (SM.features.extra && SM.features.extra.isActive && SM.features.extra.isActive('spectator')) {
      return;
    }
    const self = getSelf();
    if (!self) return;

    const need = target();
    const obstacles = nearbyObstacles(self);
    updateStuck(self, obstacles);
    const now = performance.now();
    const escaping = now < escapeUntil;
    const threat = vultureThreat(self);

    // ===== фаза 1: сбор =====
    if (phase === 'collect' && collected.size >= need) phase = 'deliver';

    if (phase === 'collect') {
      const worm = (escaping) ? null : pickWorm(self, SM.settings.wormAggroDist || 160);
      if (worm) {
        drive(self, worm.x, worm.y, calcAngle(self, worm.x, worm.y), obstacles);
      } else {
        const dest = wanderDest(self);
        drive(self, dest.x, dest.y, aimAtHerd(self), obstacles);
      }
      return;
    }

    // ===== фаза 2: доставка =====
    if (phase === 'deliver') {
      const dp = deliveryPoint();
      if (!dp) {
        if (!warned.point) {
          warned.point = true;
          SM.warn('Worm Farm: собрано ' + collected.size + ', но точка отдачи не задана (Combat → Worm Farm → Set)');
        }
        if (threat || escaping) { const d = wanderDest(self); drive(self, d.x, d.y, aimAtHerd(self), obstacles); }
        else holdHerd(self, obstacles);
        return;
      }
      warned.point = false;
      const d = Math.hypot(self.x - dp.x, self.y - dp.y);
      if (d <= ARRIVAL_DIST && !escaping) {
        phase = 'wait';
        takenSince = 0;
        SM.warn('[starve-mod] Worm Farm: на точке отдачи, доставлено ' + collected.size + ' — жду, пока заберут');
        SM.bus.emit('wormfarm:delivered', collected.size);
        return;
      }
      drive(self, dp.x, dp.y, aimAtHerd(self), obstacles);
      return;
    }

    // ===== фаза 3: ждём отдачи =====
    if (phase === 'wait') {
      const following = followingCount(self);
      if (following <= 0) {
        if (takenSince === 0) takenSince = now;
        else if (now - takenSince >= TAKEN_CONFIRM_MS) {
          collected.clear();
          phase = 'collect';
          takenSince = 0;
          SM.warn('[starve-mod] Worm Farm: стадо забрали — иду собирать заново');
          SM.bus.emit('wormfarm:resume');
          return;
        }
      } else {
        takenSince = 0;
      }
      if (threat || escaping) {
        const d = wanderDest(self);
        drive(self, d.x, d.y, aimAtHerd(self), obstacles);
      } else {
        holdHerd(self, obstacles);
      }
      return;
    }
  }

  function aimAtHerd(self) {
    const w = nearestWorm(self);
    return w ? calcAngle(self, w.x, w.y) : null;
  }

  function holdHerd(self, obstacles) {
    SM.protocol.move(0);
    const aim = aimAtHerd(self);
    if (aim != null && !obstacleInAimReach(self, aim, obstacles)) {
      const aimByte = SM.protocol.radToUint8(aim);
      if (aimByte != null) {
        SM.protocol.setAngle(aimByte);
        SM.protocol.attackAngle(aimByte);
      }
    }
    defendWithRoof(self, aim != null ? aim : wanderHeading);
  }

  function loop() {
    timer = 0;
    try { tick(); } catch (err) { SM.warn('Worm Farm tick error', err); }
    if (active) timer = setTimeout(loop, TICK_MS);
  }

  function ensureLoop() {
    if (active && !timer) timer = setTimeout(loop, TICK_MS);
  }

  function stopMotion() {
    try { SM.protocol.stopAttack(); } catch (_) {}
    try { SM.protocol.move(0); } catch (_) {}
  }

  function setActive(on) {
    on = !!on;
    if (on && !SM.settings.wormFarm) {
      SM.warn('Worm Farm: включи тумблер в меню → Binds → Worm Farm');
      return;
    }
    if (active === on) return;
    active = on;
    if (on) {
      SM.net.ensureInstalled();
      collected.clear();
      phase = 'collect';
      takenSince = 0;
      stuckPos = null;
      escapeUntil = 0;
      escalations = 0;
      lockedMove = null;
      wanderHeading = Math.random() * Math.PI * 2;
      warned.point = false;
      warned.roof = false;
      SM.warn('[starve-mod] Worm Farm ACTIVE — цель ' + target() + ' червей');
      ensureLoop();
    } else {
      if (timer) { clearTimeout(timer); timer = 0; }
      stopMotion();
      SM.log('Worm Farm off (собрано ' + collected.size + ')');
    }
  }

  function setDeliveryPoint() {
    ensureSettings();
    const self = getSelf();
    if (!self) {
      SM.warn('Worm Farm: зайди в игру, чтобы поставить точку отдачи');
      return false;
    }
    SM.settings.wormDeliveryPoint.x = Math.floor(self.x);
    SM.settings.wormDeliveryPoint.y = Math.floor(self.y);
    SM.storage.save();
    SM.log('Worm Farm delivery point', SM.settings.wormDeliveryPoint);
    SM.bus.emit('wormfarm:point');
    return true;
  }

  function clearDeliveryPoint() {
    ensureSettings();
    SM.settings.wormDeliveryPoint.x = -1;
    SM.settings.wormDeliveryPoint.y = -1;
    SM.storage.save();
    SM.bus.emit('wormfarm:point');
    SM.log('Worm Farm: точка отдачи сброшена');
  }

  // ---- overlay --------------------------------------------------------------
  function draw(ctx, env) {
    const cam = env.cam;
    if (!cam) return;
    const sc = env.scale;
    const self = getSelf();

    const dp = deliveryPoint();
    if (dp) {
      const sx = (dp.x + cam.x) * sc;
      const sy = (dp.y + cam.y) * sc;
      ctx.save();
      ctx.beginPath();
      ctx.arc(sx, sy, 9 * sc, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(120, 220, 120, 0.95)';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3 * sc;
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      V.text(ctx, 'Отдача', sx, sy - 14 * sc, { size: 13, color: '#9fe6a0', lineWidth: 4 });
    }

    if (self) {
      const px = (self.x + cam.x) * sc;
      const py = (self.y + cam.y) * sc;
      const worms = visibleWorms();
      if (worms) {
        ctx.save();
        ctx.lineWidth = 1.5 * sc;
        for (let i = 0; i < worms.length; i++) {
          const w = worms[i];
          if (!w || typeof w.x !== 'number') continue;
          const wx = (w.x + cam.x) * sc;
          const wy = (w.y + cam.y) * sc;
          ctx.beginPath();
          ctx.strokeStyle = collected.has(w.id) ? 'rgba(120,220,120,0.5)' : 'rgba(253,203,110,0.75)';
          ctx.moveTo(px, py);
          ctx.lineTo(wx, wy);
          ctx.stroke();
        }
        ctx.restore();
      }
      const phaseLabel = phase === 'wait' ? ' (жду отдачи)' : (phase === 'deliver' ? ' (несу)' : '');
      const label = 'Черви: ' + collected.size + '/' + target() + phaseLabel;
      V.text(ctx, label, px, py - 64 * sc, { size: 16, color: '#fdcb6e', lineWidth: 5, bold: true });
    }
  }

  ensureSettings();

  if (V && V.registerEnabled) {
    V.registerEnabled(function () { return active; }, draw, true);
  }

  SM.features = SM.features || {};
  SM.features.wormFarm = {
    init: function () {
      ensureSettings();
      SM.log('worm-collector: ready (target ' + target() + ', steering v2)');
    },
    setActive: setActive,
    isActive: function () { return active; },
    setDeliveryPoint: setDeliveryPoint,
    clearDeliveryPoint: clearDeliveryPoint,
    collectedCount: function () { return collected.size; },
    hasDeliveryPoint: function () { return !!deliveryPoint(); },
  };
})(window.__SM__ = window.__SM__ || {});


/* ===== src/ui/gui.js ===== */
/**
 * ui/gui.js — панель меню (Shadow DOM): вкладки Misc / Visual / Binds / Net.
 */
;(function (SM) {
  'use strict';

  const BIND_LABELS = {
    aimbot: 'Aimbot',
    autoSpike: 'Auto Spike',
    autoWall: 'Auto Wall',
    autofarm: 'AutoFarm',
    wormFarm: 'Worm Farm',
    autosteal: 'Autosteal',
    autobuild: 'Autobuild',
    autofire: 'AutoFire',
    spectator: 'Spectator',
    autocraft: 'AutoCraft',
    autorecycle: 'AutoRecycle',
    xray: 'Xray',
    dropSword: 'Drop Sword',
    hideScript: 'Hide Script',
  };

  // Опкоды, требующие подтверждения снифером (показываем в Net → Opcodes).
  const CAPTURE_SLOTS = [
    { slot: 'takeChest', label: 'take chest', hint: 'открой/тапни чужой сундук' },
    { slot: 'takeOven', label: 'take oven', hint: 'забери из печи' },
    { slot: 'takeFlour', label: 'take flour', hint: 'забери из мельницы' },
    { slot: 'recycle', label: 'recycle', hint: 'переработай предмет у верстака' },
    { slot: 'drop', label: 'drop item', hint: 'выброси предмет' },
    { slot: 'useItem', label: 'use item', hint: 'съешь/используй предмет' },
    { slot: 'updateCamera', label: 'update camera', hint: 'выйди из режима камеры' },
  ];

  // Wireframe ClickGUI: чистый чёрный фон, тонкие белые рамки 1px, острые углы,
  // моно-палитра, вкладки (активная в рамке), квадратные тогглы (вкл = залитый квадрат).
  function styles() {
    const B = 'rgba(255,255,255,.55)';     // основная рамка
    const BD = 'rgba(255,255,255,.22)';    // тусклая рамка / разделитель
    const TX = 'rgba(255,255,255,.86)';    // основной текст
    const DIM = 'rgba(255,255,255,.42)';   // тусклый текст
    return (
      '*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}' +
      ':host{all:initial;font-family:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;' +
      'font-size:12px;-webkit-font-smoothing:antialiased}' +
      // открыть/перетащить
      '.toggle{position:fixed;top:12px;right:12px;z-index:2147483646;width:30px;height:30px;border-radius:0;' +
      'border:1px solid ' + B + ';cursor:grab;background:#000;display:flex;align-items:center;justify-content:center;' +
      'transition:border-color .12s,background .12s}' +
      '.toggle:hover{border-color:#fff;background:#0d0d0d}' +
      '.toggle:active{cursor:grabbing}' +
      '.toggle svg{width:15px;height:15px;opacity:.9}' +
      // панель
      '.panel{position:fixed;top:52px;right:12px;z-index:2147483646;width:568px;max-width:calc(100vw - 24px);' +
      'background:#000;border:1px solid ' + B + ';border-radius:0;color:' + TX + ';' +
      'box-shadow:0 18px 50px rgba(0,0,0,.6);overflow:hidden;transition:opacity .15s,transform .15s}' +
      '.panel.hidden{opacity:0;pointer-events:none;transform:translateY(-6px)}' +
      // титулбар (ручка перетаскивания)
      '.titlebar{display:flex;align-items:center;justify-content:space-between;padding:6px 9px;cursor:grab;' +
      'user-select:none;border-bottom:1px solid ' + BD + '}' +
      '.titlebar:active{cursor:grabbing}.titlebar-left{display:flex;align-items:center;gap:8px}' +
      '.titlebar h1{font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase}' +
      '.badge{font-size:9px;padding:1px 5px;border:1px solid ' + BD + ';color:' + DIM + '}' +
      '.close-btn{width:20px;height:20px;border:1px solid ' + BD + ';border-radius:0;cursor:pointer;background:transparent;' +
      'color:' + DIM + ';font-size:13px;line-height:1;display:flex;align-items:center;justify-content:center}' +
      '.close-btn:hover{border-color:#fff;color:#fff}' +
      // вкладки-категории
      '.tabs{display:flex;align-items:center;gap:10px;padding:8px 10px;border-bottom:1px solid ' + BD + '}' +
      '.tab{padding:4px 9px;border:1px solid transparent;border-radius:0;cursor:pointer;font-size:11px;' +
      'background:transparent;color:' + DIM + ';transition:.12s;white-space:nowrap}' +
      '.tab:hover{color:rgba(255,255,255,.8)}' +
      '.tab.active{color:#fff;border-color:rgba(255,255,255,.7)}' +
      '.search{margin-left:auto;width:108px;background:#000;border:1px solid ' + DIM + ';border-radius:0;color:#fff;' +
      'font-size:11px;padding:4px 7px;outline:none}' +
      '.search:focus{border-color:#fff}.search::placeholder{color:rgba(255,255,255,.3)}' +
      // тело
      '.tab-body{padding:10px;min-height:170px;max-height:64vh;overflow-y:auto}' +
      // горизонтальная сетка карточек: 2 модуля в ряд
      '.section{display:none}' +
      '.section.active{display:grid;grid-template-columns:1fr 1fr;gap:8px;align-content:start;align-items:start}' +
      '[data-binds-root],[data-opcaps]{display:contents}' +
      // элементы во всю ширину сетки
      '.subhead,.empty,.net-bar,.sniffer,.biome-group{grid-column:1 / -1}' +
      '.panel.searching .tab{opacity:.45;pointer-events:none}' +
      '.panel.searching .section{display:grid;grid-template-columns:1fr 1fr;gap:8px;align-content:start;align-items:start;' +
      'margin-bottom:12px;padding-top:8px;border-top:1px solid rgba(255,255,255,.12)}' +
      '.panel.searching .section:first-of-type{border-top:none;padding-top:0}' +
      '.panel.searching .section::before{content:attr(data-label);grid-column:1 / -1;display:block;font-size:10px;' +
      'letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.45);margin:0}' +
      // подзаголовок группы
      '.subhead{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:' + DIM + ';' +
      'margin:8px 0 1px;padding-bottom:4px;border-bottom:1px solid ' + BD + ';' +
      'display:flex;justify-content:space-between;align-items:baseline}' +
      '.subhead:first-child{margin-top:0}' +
      '.subhead small{text-transform:none;letter-spacing:0;color:rgba(255,255,255,.28);font-size:9px}' +
      // collapsible biome groups (Tracers)
      '.biome-group{grid-column:1 / -1;border:1px solid ' + BD + '}' +
      '.biome-head{width:100%;display:flex;align-items:center;justify-content:space-between;gap:8px;' +
      'padding:8px 9px;border:none;background:#000;color:' + TX + ';cursor:pointer;font-size:13px;text-align:left}' +
      '.biome-head:hover{background:#0d0d0d}' +
      '.biome-chev{font-size:10px;color:' + DIM + ';transition:transform .15s}' +
      '.biome-group.open .biome-chev{transform:rotate(90deg)}' +
      '.biome-body{display:none;padding:0 0 2px}' +
      '.biome-group.open .biome-body{display:block}' +
      '.biome-body .row{border-left:none;border-right:none;border-top:none;margin:0}' +
      '.biome-body .row:last-child{border-bottom:none}' +
      // карточка-модуль
      '.row{display:flex;align-items:center;justify-content:space-between;padding:8px 9px;gap:8px;' +
      'border:1px solid ' + BD + '}' +
      '.row:hover{border-color:rgba(255,255,255,.4)}' +
      '.row label{font-size:13.5px;cursor:pointer;flex:1;min-width:0;line-height:1.3}' +
      '.row small{display:block;font-size:10.5px;color:rgba(255,255,255,.4);margin-top:3px;line-height:1.35}' +
      // квадратный тоггл (вкл = залитый квадрат)
      '.switch{position:relative;width:16px;height:16px;flex-shrink:0}' +
      '.switch input{opacity:0;width:0;height:0}' +
      '.slider{position:absolute;inset:0;border:1px solid ' + B + ';border-radius:0;cursor:pointer;background:transparent;transition:.15s}' +
      '.slider::before{content:"";position:absolute;inset:3px;background:#fff;transform:scale(0);transition:transform .15s}' +
      '.switch input:checked+.slider{border-color:#fff}.switch input:checked+.slider::before{transform:scale(1)}' +
      // pill-тоггл (бинды) — как переключатель в примере
      '.mini-switch{position:relative;width:30px;height:16px;flex-shrink:0}' +
      '.mini-switch input{opacity:0;width:0;height:0}' +
      '.mini-slider{position:absolute;inset:0;border:1px solid ' + B + ';border-radius:8px;cursor:pointer;background:transparent;transition:.15s}' +
      '.mini-slider::before{content:"";position:absolute;width:10px;height:10px;left:2px;top:2px;border-radius:50%;' +
      'background:' + B + ';transition:.15s}' +
      '.mini-switch input:checked+.mini-slider{border-color:#fff;background:#fff}' +
      '.mini-switch input:checked+.mini-slider::before{transform:translateX(14px);background:#000}' +
      // бинды — карточка-модуль с шапкой и низом
      '.bind{display:flex;flex-direction:column;gap:7px;padding:8px 9px;border:1px solid ' + BD + '}' +
      '.bind:hover{border-color:rgba(255,255,255,.4)}' +
      '.bind-head{display:flex;align-items:center;justify-content:flex-start;gap:8px}' +
      '.bind-foot{display:flex;align-items:center;gap:6px}' +
      '.bind .name{flex:1;min-width:0;font-size:13.5px;line-height:1.3}' +
      '.keycap{font-size:11px;padding:4px 8px;border:1px solid ' + DIM + ';border-radius:0;font-family:ui-monospace,monospace;' +
      'cursor:pointer;background:transparent;color:' + TX + ';min-width:50px;text-align:center}' +
      '.keycap:hover{border-color:#fff;color:#fff}.keycap.capturing{border-color:#fff;background:rgba(255,255,255,.12);color:#fff}' +
      // селекты / числа
      '.mode{font-size:11px;background:#000;color:' + TX + ';border:1px solid ' + DIM + ';border-radius:0;' +
      'padding:4px 6px;cursor:pointer;outline:none}' +
      '.mode:hover,.mode:focus{border-color:#fff;color:#fff}' +
      '.tl-in{width:100%;max-width:220px;font-size:10px;font-family:ui-monospace,Consolas,monospace;cursor:text}' +
      '.combat-col-left,.combat-col-right{min-width:0;display:flex;flex-direction:column}' +
      '[data-combat-root]{display:contents}' +
      '.combat-col-left .subhead:first-child,.combat-col-right .subhead:first-child{margin-top:0}' +
      '.combat-col-left .net-bar,.combat-col-right .net-bar{flex-wrap:wrap;margin:4px 0 6px}' +
      '.combat-col-left .tl-in,.combat-col-right .tl-in{max-width:100%}' +
      '.combat-col-left .net-stat,.combat-col-right .net-stat{margin-left:0;margin-top:2px;font-size:9.5px;line-height:1.35}' +
      '.combat-col-left .row label,.combat-col-right .row label{min-width:0}' +
      '.tl-block{grid-column:1/-1}' +
      '.numin{font-family:ui-monospace,monospace}' +
      // net
      '.net-bar{display:flex;gap:6px;align-items:center;margin:6px 0 8px}' +
      '.net-btn{font-size:10px;padding:4px 9px;border:1px solid ' + DIM + ';border-radius:0;background:#000;color:' + TX + ';cursor:pointer}' +
      '.net-btn:hover{border-color:#fff;color:#fff}' +
      '.net-stat{font-size:10px;color:' + DIM + ';margin-left:auto}' +
      '.sniffer{font-family:ui-monospace,monospace;font-size:10px;line-height:1.4;white-space:pre-wrap;word-break:break-all;' +
      'max-height:200px;overflow-y:auto;background:#000;border:1px solid ' + BD + ';border-radius:0;padding:7px;color:rgba(255,255,255,.7)}' +
      '.sniffer .o{color:#fff}.sniffer .i{color:rgba(255,255,255,.5)}' +
      // пусто / футер
      '.empty{color:rgba(255,255,255,.3);font-size:11px;text-align:center;padding:16px 8px;line-height:1.5}' +
      '.foot{padding:7px 10px;border-top:1px solid ' + BD + ';font-size:10px;color:' + DIM + '}' +
      // скроллбары
      '.tab-body::-webkit-scrollbar,.sniffer::-webkit-scrollbar{width:8px}' +
      '.tab-body::-webkit-scrollbar-thumb,.sniffer::-webkit-scrollbar-thumb{background:rgba(255,255,255,.18)}' +
      '.tab-body::-webkit-scrollbar-track,.sniffer::-webkit-scrollbar-track{background:transparent}'
    );
  }

  function bodyHtml() {
    return (
      '<button class="toggle" type="button" title="Starve Mod — drag / click">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round">' +
      '<line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/>' +
      '</svg></button>' +
      '<div class="panel hidden">' +
      '<div class="titlebar"><div class="titlebar-left"><h1>Starve Mod</h1>' +
      '<span class="badge">v' + SM.MOD.version + '</span></div>' +
      '<button class="close-btn" type="button" title="Close">&times;</button></div>' +
      '<div class="tabs">' +
      '<button class="tab active" data-tab="misc" type="button">Misc</button>' +
      '<button class="tab" data-tab="visual" type="button">Visual</button>' +
      '<button class="tab" data-tab="combat" type="button">Combat</button>' +
      '<button class="tab" data-tab="binds" type="button">Binds</button>' +
      '<button class="tab" data-tab="net" type="button">Net</button>' +
      '<input class="search" data-search type="text" placeholder="Search"></div>' +
      '<div class="tab-body">' +
      '<div class="section active" data-section="misc" data-label="Misc">' +
      row('Debug log', 'Console output', 'debugLog') +
      row('Auto Book', 'При крафте автоматически надевает книгу', 'autoBook') +
      row('Auto Food fix', 'При спавне 4× вкл/выкл R-автофуд, оставляет вкл', 'autoFoodFix') +
      row('Auto Food', 'HP/еда/жажда ~50% (свой, не R)', 'autoFood') +
      row('Auto Ice', 'есть лёд — охлаждение при перегреве', 'autoIce') +
      row('Food with craft', 'автофуд во время AutoCraft', 'autoFoodWithCraft') +
      '<div class="empty">More misc soon…</div></div>' +
      '<div class="section" data-section="visual" data-label="Visual">' +
      row('Show FPS', 'Слева от компаса', 'showFps') +
      row('Show Ping', 'RTT (ping [6])', 'showPing') +
      '<div class="subhead">Color Spike</div>' +
      row('Color Spike', 'Текстуры построек ally/enemy', 'colorSpike') +
      csPackRow() +
      '<div class="subhead">HUD</div>' +
      row('Percents', '% жизни/еды/тепла/жажды', 'hudPercents') +
      row('Timers', 'HP + отсчёт реген/голод', 'hudTimers') +
      row('Days counter', 'номер дня', 'daysCounter') +
      row('Better quest time', 'формат Xd Ym Zs', 'betterQuestTime') +
      '<div class="subhead">World ESP</div>' +
      row('Totem info', 'владелец/цвет над тотемом', 'totemInfo') +
      row('Box info', 'мёртвые ящики/крейты/подарки', 'boxInfo') +
      row('Build info', 'экстракторы/мельницы/печи', 'buildInfo') +
      row('Chest info', 'выбранный слот сундука', 'chestInfo') +
      row('Show names+', 'ник+уровень над игроками', 'showNamesPlus') +
      row('Mob HP', 'сердечко + HP над мобами', 'mobHp') +
      '<div class="subhead">On top</div>' +
      row('Player on top', 'игроки поверх построек', 'playerOnTop') +
      row('Box on top', 'крейты/мёртвые ящики поверх', 'boxOnTop') +
      row('Totem on top', 'тотемы поверх', 'totemOnTop') +
      row('Chest on top', 'сундуки поверх', 'chestOnTop') +
      '<div class="subhead">Tracers</div>' +
      tracersHtml() +
      '<div class="subhead">Map (радар)</div>' +
      row('Totems on map', '', 'totemOnMap') +
      row('Players on map', 'ally/enemy цвет', 'playersOnMap') +
      row('Last death', 'отметка смерти', 'lastDeath') +
      '<div class="net-bar"><button class="net-btn" data-vis="probe">Probe user</button>' +
      '<span class="net-stat" data-vis-stat>дамп для фикса ключей</span></div>' +
      '</div>' +
      '<div class="section" data-section="combat" data-label="Combat"><div data-combat-root></div></div>' +
      '<div class="section" data-section="binds" data-label="Binds"><div data-binds-root></div></div>' +
      '<div class="section" data-section="net" data-label="Net">' +
      row('Inv debug', 'Отчёт инвентаря в консоль', 'invDebug') +
      row('Packet sniffer', 'Лог WebSocket-кадров', 'netSniffer') +
      '<div class="net-bar"><button class="net-btn" data-net="inv-dump">Dump inv</button>' +
      '<button class="net-btn" data-net="inv-copy">Copy inv</button></div>' +
      '<div class="subhead">Out opcodes <small style="text-transform:none">сбрось → сделай 1 действие → смотри что выросло</small></div>' +
      '<div class="net-bar"><button class="net-btn" data-net="reset-ops">Reset ops</button>' +
      '<button class="net-btn" data-net="copy-ops">Copy ops</button></div>' +
      '<div class="sniffer" data-ops style="max-height:120px"><div class="empty">Включи sniffer…</div></div>' +
      '<div class="subhead">Opcodes (capture) <small style="text-transform:none">жми capture → сделай 1 действие</small></div>' +
      '<div data-opcaps></div>' +
      '<div class="subhead">Raw frames</div>' +
      '<div class="net-bar"><button class="net-btn" data-net="clear">Clear</button>' +
      '<button class="net-btn" data-net="copy">Copy</button>' +
      '<span class="net-stat" data-net-stat>in 0 · out 0</span></div>' +
      '<div class="sniffer" data-sniffer><div class="empty">Включи sniffer и зайди в игру…</div></div>' +
      '</div>' +
      '</div><div class="foot"><span data-status>Game: …</span></div></div>'
    );
  }

  function row(label, sub, key) {
    return (
      '<div class="row"><label>' + label + '<small>' + sub + '</small></label>' +
      '<label class="switch"><input type="checkbox" data-key="' + key + '"><span class="slider"></span></label></div>'
    );
  }

  function tracerRow(mobId, label) {
    return (
      '<div class="row" data-tracer-row="' + mobId + '"><label>' + label + '</label>' +
      '<label class="switch"><input type="checkbox" data-tracer="' + mobId + '"><span class="slider"></span></label></div>'
    );
  }

  function tracersHtml() {
    const biomes = (SM.tracers && SM.tracers.BIOMES) || [];
    if (!biomes.length) {
      return '<div class="empty">Tracers module loading…</div>';
    }
    const labels = (SM.tracers && SM.tracers.LABELS) || {};
    let html = '';
    biomes.forEach(function (b) {
      html +=
        '<div class="biome-group" data-biome="' + b.id + '">' +
        '<button class="biome-head" type="button" data-biome-toggle="' + b.id + '">' +
        '<span>' + b.label + '</span><span class="biome-chev">▸</span></button>' +
        '<div class="biome-body">';
      b.mobs.forEach(function (mobId) {
        html += tracerRow(mobId, labels[mobId] || mobId);
      });
      html += '</div></div>';
    });
    return html;
  }

  function csPackRow() {
    const packs = (SM.texturePacks && SM.texturePacks.PACKS) || [];
    const opts = packs
      .map(function (p) { return '<option value="' + p.id + '">' + p.label + '</option>'; })
      .join('');
    return (
      '<div class="row"><label>Texture pack<small>какой пак использовать</small></label>' +
      '<select class="mode" data-cs-pack style="min-width:84px">' + opts + '</select></div>'
    );
  }

  function bindRowToggle(name) {
    return (
      '<div class="bind" data-bind-name="' + name + '">' +
      '<div class="bind-head"><label class="mini-switch"><input type="checkbox" data-feat="' + name + '"><span class="mini-slider"></span></label>' +
      '<span class="name">' + (BIND_LABELS[name] || name) + '</span></div>' +
      '<div class="bind-foot"><select class="mode" data-mode="' + name + '" style="flex:1">' +
      '<option value="hold">hold</option><option value="toggle">toggle</option></select>' +
      '<span class="keycap" data-key-for="' + name + '"></span></div></div>'
    );
  }

  function bindRowPress(name) {
    return (
      '<div class="bind" data-bind-name="' + name + '">' +
      '<div class="bind-head"><label class="mini-switch"><input type="checkbox" data-feat="' + name + '"><span class="mini-slider"></span></label>' +
      '<span class="name">' + (BIND_LABELS[name] || name) + '</span></div>' +
      '<div class="bind-foot"><span class="mode" style="flex:1;opacity:.5;cursor:default">press</span>' +
      '<span class="keycap" data-key-for="' + name + '"></span></div></div>'
    );
  }

  function numRow(label, sub, key, step, min) {
    return (
      '<div class="row"><label>' + label + '<small>' + sub + '</small></label>' +
      '<input class="mode numin" type="number" data-num="' + key + '" step="' + step + '" ' +
      (min != null ? 'min="' + min + '" ' : '') + 'style="width:74px;text-align:right"></div>'
    );
  }

  function bindControls(rootEl) {
    rootEl.querySelectorAll('[data-num]').forEach(function (input) {
      const key = input.dataset.num;
      if (key in SM.settings) input.value = SM.settings[key];
      input.addEventListener('change', function () {
        const v = parseFloat(input.value);
        if (Number.isFinite(v)) {
          SM.settings[key] = v;
          SM.storage.save();
          SM.log('cfg', key, '=', v);
        }
      });
    });

    rootEl.querySelectorAll('[data-feat]').forEach(function (input) {
      const name = input.dataset.feat;
      input.checked = !!SM.settings[name];
      input.addEventListener('change', function () {
        SM.settings[name] = input.checked;
        SM.storage.save();
        SM.ui.binds.onSettingChanged(name);
        if ((name === 'chestInfo' || name === 'colorSpike') && SM.features.colorSpike && SM.features.colorSpike.syncSkip) {
          SM.features.colorSpike.syncSkip();
        }
        SM.log('feature', name, '=', input.checked);
      });
    });

    rootEl.querySelectorAll('[data-mode]').forEach(function (sel) {
      const name = sel.dataset.mode;
      sel.value = SM.bindMode[name] || 'hold';
      sel.addEventListener('change', function () {
        SM.bindMode[name] = sel.value;
        SM.storage.save();
      });
    });

    rootEl.querySelectorAll('[data-key-for]').forEach(function (cap) {
      const name = cap.dataset.keyFor;
      cap.textContent = SM.binds[name] || '—';
      cap.addEventListener('click', function () {
        cap.classList.add('capturing');
        cap.textContent = 'press…';
        SM.ui.binds.startRebind(name, function () {
          cap.classList.remove('capturing');
          cap.textContent = SM.binds[name] || '—';
        });
      });
    });
  }

  function autofarmPointCoord(n) {
    if (!SM.features.autofarm) return '—';
    SM.features.autofarm.ensurePoints();
    const p = SM.settings.autofarmPoints[n - 1];
    if (!p || p.x === -1 || p.y === -1) return 'не задана';
    return p.x + ', ' + p.y;
  }

  function tokenLoggerHtml() {
    return (
      '<div class="subhead">Token Logger <small style="text-transform:none">TokenJoiner — заход на токены</small></div>' +
      '<div class="row"><label>Token<small>localStorage starve_token</small></label>' +
      '<input class="mode tl-in" type="text" data-tl="token" spellcheck="false" autocomplete="off"></div>' +
      '<div class="row"><label>Token ID<small>starve_token_id с сервера</small></label>' +
      '<input class="mode tl-in" type="text" data-tl="tokenId" spellcheck="false" autocomplete="off"></div>' +
      '<div class="net-bar">' +
      '<button class="net-btn" type="button" data-tl-copy="token">Copy Token</button>' +
      '<button class="net-btn" type="button" data-tl-copy="tokenId">Copy ID</button>' +
      '<button class="net-btn" type="button" data-tl-copy="both">Copy both</button>' +
      '<button class="net-btn" type="button" data-tl-respawn>Respawn</button></div>' +
      '<div class="net-stat" data-tl-stat>авто-сохранение при спавне на токен-сервере</div>'
    );
  }

  function autofarmHtml() {
    let html =
      '<div class="subhead">AutoFarm <small style="text-transform:none">4 точки по кругу, как NVX</small></div>' +
      numRow('Arrival offset', 'случайный разброс у точки (max)', 'autofarmMaxOffset', '1', '0');

    for (let n = 1; n <= 4; n++) {
      html +=
        '<div class="row" data-af-row="' + n + '">' +
        '<label>Point #' + n + '<small data-af-coord="' + n + '">' + autofarmPointCoord(n) + '</small></label>' +
        '<button class="net-btn" type="button" data-af-set="' + n + '">Set</button></div>';
    }

    html +=
      '<div class="net-bar">' +
      '<button class="net-btn" type="button" data-af-clear>Clear points</button>' +
      '<span class="net-stat">встань на угол и жми Set</span></div>';
    return html;
  }

  function wormDeliveryCoord() {
    if (!SM.features.wormFarm) return '—';
    const p = SM.settings.wormDeliveryPoint;
    if (!p || p.x === -1 || p.y === -1) return 'не задана';
    return p.x + ', ' + p.y;
  }

  function wormFarmHtml() {
    return (
      '<div class="subhead">Worm Farm <small style="text-transform:none">авто-принос червей из пустыни</small></div>' +
      numRow('Target worms', 'сколько собрать (из 30)', 'wormTarget', '1', '1') +
      numRow('Aggro dist', 'дистанция аггра червя', 'wormAggroDist', '5', '50') +
      row('Auto roof', 'крыши при аггре грифа', 'wormRoof') +
      '<div class="row" data-wf-row><label>Delivery point<small data-wf-coord>' + wormDeliveryCoord() + '</small></label>' +
      '<button class="net-btn" type="button" data-wf-set>Set</button></div>' +
      '<div class="net-bar">' +
      '<button class="net-btn" type="button" data-wf-clear>Clear point</button>' +
      '<span class="net-stat">встань на точку отдачи и жми Set</span></div>'
    );
  }

  function smartCraftHtml() {
    return (
      '<div class="subhead">SmartCraft <small style="text-transform:none">цепочка крафта к цели, как NVX</small></div>' +
      row('SmartCraft', 'авто-крафт промежуточных рецептов', 'smartCraft') +
      '<div class="row"><label>Target<small>что крафтить в итоге</small></label>' +
      '<select class="mode" data-sc-target style="min-width:140px;max-width:220px"></select></div>' +
      '<div class="row"><label>Remaining<small>сколько штук осталось</small></label>' +
      '<input class="mode numin" type="number" data-sc-count min="0" max="99999" step="1" style="width:72px"></div>' +
      '<div class="row"><label>Cost<small>листья рецепта × remaining</small></label>' +
      '<span class="net-stat" data-sc-cost style="margin-left:0;text-align:right;max-width:220px">—</span></div>'
    );
  }

  function renderCombat(rootEl) {
    rootEl.innerHTML =
      '<div class="combat-col-left">' + smartCraftHtml() + autofarmHtml() + '</div>' +
      '<div class="combat-col-right">' + tokenLoggerHtml() + wormFarmHtml() + '</div>';
    bindControls(rootEl);
    bindSmartCraft(rootEl);
    bindTokenLogger(rootEl);
    bindWormFarm(rootEl);

    function refreshCoords() {
      rootEl.querySelectorAll('[data-af-coord]').forEach(function (el) {
        const n = parseInt(el.dataset.afCoord, 10);
        if (n >= 1 && n <= 4) el.textContent = autofarmPointCoord(n);
      });
    }

    rootEl.querySelectorAll('[data-af-set]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const n = parseInt(btn.dataset.afSet, 10);
        if (SM.features.autofarm && SM.features.autofarm.setPoint(n)) refreshCoords();
      });
    });

    const clearBtn = rootEl.querySelector('[data-af-clear]');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (SM.features.autofarm) SM.features.autofarm.clearPoints();
        refreshCoords();
      });
    }

    SM.bus.on('autofarm:points', refreshCoords);
  }

  function bindWormFarm(rootEl) {
    const wf = SM.features.wormFarm;

    function refreshCoord() {
      const el = rootEl.querySelector('[data-wf-coord]');
      if (el) el.textContent = wormDeliveryCoord();
    }

    const setBtn = rootEl.querySelector('[data-wf-set]');
    if (setBtn) {
      setBtn.addEventListener('click', function () {
        if (wf && wf.setDeliveryPoint()) refreshCoord();
      });
    }

    const clearBtn = rootEl.querySelector('[data-wf-clear]');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (wf) wf.clearDeliveryPoint();
        refreshCoord();
      });
    }

    SM.bus.on('wormfarm:point', refreshCoord);
  }

  function bindTokenLogger(rootEl) {
    const tl = SM.features.tokenLogger;
    if (!tl) return;

    const tokenIn = rootEl.querySelector('[data-tl="token"]');
    const idIn = rootEl.querySelector('[data-tl="tokenId"]');
    const stat = rootEl.querySelector('[data-tl-stat]');

    function refreshFields() {
      if (tokenIn) tokenIn.value = SM.settings.token || '';
      if (idIn) idIn.value = SM.settings.tokenId || '';
    }

    function onEdit() {
      if (!tl) return;
      tl.set(
        tokenIn ? tokenIn.value : SM.settings.token,
        idIn ? idIn.value : SM.settings.tokenId
      );
      if (stat) stat.textContent = 'сохранено в localStorage';
    }

    refreshFields();
    if (tokenIn) {
      tokenIn.value = SM.settings.token || '';
      tokenIn.addEventListener('change', onEdit);
      tokenIn.addEventListener('blur', onEdit);
    }
    if (idIn) {
      idIn.value = SM.settings.tokenId || '';
      idIn.addEventListener('change', onEdit);
      idIn.addEventListener('blur', onEdit);
    }

    rootEl.querySelectorAll('[data-tl-copy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (onEdit) onEdit();
        const which = btn.dataset.tlCopy;
        if (tl.copy(which) && stat) stat.textContent = 'скопировано: ' + which;
      });
    });

    const respawnBtn = rootEl.querySelector('[data-tl-respawn]');
    if (respawnBtn) {
      respawnBtn.addEventListener('click', function () {
        onEdit();
        if (tl.rejoin() && stat) stat.textContent = 'Respawn — возврат в меню сервера';
      });
    }

    SM.bus.on('tokenLogger:update', function () {
      refreshFields();
      if (stat) stat.textContent = 'обновлено с сервера · ' + new Date().toLocaleTimeString();
    });
  }

  function bindSmartCraft(rootEl) {
    const sc = SM.features.smartCraft;
    if (!sc) return;

    const sel = rootEl.querySelector('[data-sc-target]');
    const countIn = rootEl.querySelector('[data-sc-count]');
    const costEl = rootEl.querySelector('[data-sc-cost]');

    function refreshCost() {
      if (!costEl) return;
      costEl.innerHTML = sc.formatCostHtml ? sc.formatCostHtml() : '—';
    }

    function fillTargets() {
      if (!sel) return;
      const opts = sc.getOptions ? sc.getOptions() : [];
      const cur = SM.settings.smartCraftTargetName || 'Reidite Spike';
      let html = '';
      for (let i = 0; i < opts.length; i++) {
        html += '<option value="' + opts[i].replace(/"/g, '&quot;') + '">' + opts[i] + '</option>';
      }
      sel.innerHTML = html;
      if (opts.indexOf(cur) >= 0) sel.value = cur;
      else if (opts.length) sel.value = opts[0];
    }

    fillTargets();
    if (countIn) countIn.value = String(SM.settings.smartCraftCount != null ? SM.settings.smartCraftCount : 1);
    refreshCost();

    if (sel) {
      sel.value = SM.settings.smartCraftTargetName || sel.value || 'Reidite Spike';
      sel.addEventListener('change', function () {
        SM.settings.smartCraftTargetName = sel.value;
        SM.storage.save();
        if (sc.resetProgress) sc.resetProgress();
        refreshCost();
      });
    }

    if (countIn) {
      countIn.addEventListener('change', function () {
        const n = Math.max(0, parseInt(countIn.value, 10) || 0);
        SM.settings.smartCraftCount = n;
        countIn.value = String(n);
        SM.storage.save();
        if (sc.resetProgress) sc.resetProgress();
        refreshCost();
      });
    }

    SM.bus.on('smartCraft:update', refreshCost);
    setInterval(refreshCost, 1500);
  }

  function renderBinds(rootEl, shadow) {
    let html = '<div class="subhead">Combat <small style="text-transform:none">сначала включи тумблер слева</small></div>';
    SM.ui.binds.combatBinds.forEach(function (name) { html += bindRowToggle(name); });

    html += '<div class="subhead">Functions <small style="text-transform:none">тумблер = разрешить, клавиша = вкл/выкл</small></div>';
    SM.ui.binds.extraToggleBinds.forEach(function (name) { html += bindRowToggle(name); });

    html += '<div class="subhead">Actions <small style="text-transform:none">по нажатию клавиши</small></div>';
    SM.ui.binds.pressBinds.forEach(function (name) { html += bindRowPress(name); });

    html += '<div class="subhead">Function config</div>';
    html += numRow('Xray opacity', 'прозрачность построек 0..1', 'xrayOpacity', '0.05', '0');
    html += numRow('Spectator speed', 'скорость камеры', 'spectatorSpeed', '5', '5');

    html += '<div class="subhead">Menu</div>';
    html +=
      '<div class="bind"><div class="bind-head"><span class="name">Toggle menu</span>' +
      '<span class="keycap" data-key-for="toggleMenu"></span></div></div>';
    rootEl.innerHTML = html;
    bindControls(rootEl);
  }

  function frameLine(frame) {
    const dir = frame.dir === 'out' ? 'o' : 'i';
    const arrow = frame.dir === 'out' ? '▲' : '▼';
    let body;
    if (frame.text != null) {
      body = '"' + frame.text.slice(0, 80) + '"';
    } else if (frame.bytes) {
      const dec = SM.msgpack.decode(frame.bytes);
      if (dec.ok) {
        let json;
        try { json = JSON.stringify(dec.value); } catch (_) { json = String(dec.value); }
        body = json.slice(0, 120);
      } else {
        let hex = '';
        for (let i = 0; i < Math.min(frame.bytes.length, 20); i++) {
          hex += frame.bytes[i].toString(16).padStart(2, '0') + ' ';
        }
        body = 'hex ' + hex.trim();
      }
    } else {
      body = '(empty)';
    }
    return '<span class="' + dir + '">' + arrow + ' ' + frame.size + 'b ' + body + '</span>';
  }

  function renderOps(opsView) {
    const t = SM.netAnalyze.text;
    const b = SM.netAnalyze.bin;
    const rows = [];
    Object.keys(t)
      .sort(function (a, c) { return t[c].count - t[a].count; })
      .forEach(function (op) {
        rows.push('<span class="o">[' + op + '] ×' + t[op].count + ' ' + JSON.stringify(t[op].lastArgs) + '</span>');
      });
    Object.keys(b)
      .sort(function (a, c) { return b[c].count - b[a].count; })
      .forEach(function (op) {
        rows.push('<span class="i">0x' + Number(op).toString(16) + ' ×' + b[op].count + ' ' + JSON.stringify(b[op].lastArgs) + '</span>');
      });
    opsView.innerHTML = rows.length ? rows.join('\n') : '<div class="empty">нет данных</div>';
  }

  function setupSniffer(shadow) {
    const view = shadow.querySelector('[data-sniffer]');
    const opsView = shadow.querySelector('[data-ops]');
    const stat = shadow.querySelector('[data-net-stat]');
    const buffer = [];
    let dirty = false;
    let bound = false;

    SM.netAnalyze.bind();

    shadow.querySelector('[data-net="reset-ops"]').addEventListener('click', function () {
      SM.netAnalyze.reset();
      renderOps(opsView);
    });
    shadow.querySelector('[data-net="copy-ops"]').addEventListener('click', function () {
      try { navigator.clipboard.writeText(SM.netAnalyze.report()); SM.log('ops report copied'); }
      catch (e) { SM.warn('clipboard failed', e); }
    });

    setupOpcodeCaptures(shadow);

    shadow.querySelector('[data-net="inv-dump"]').addEventListener('click', function () {
      if (SM.inventory && SM.inventory.debug) SM.inventory.debug.dump('GUI dump', true);
      else SM.warn('inventory.debug not loaded');
    });
    shadow.querySelector('[data-net="inv-copy"]').addEventListener('click', function () {
      if (SM.inventory && SM.inventory.debug) SM.inventory.debug.copy('GUI copy');
      else SM.warn('inventory.debug not loaded');
    });

    function onFrame(frame) {
      if (!SM.settings.netSniffer) return;
      buffer.push(frameLine(frame));
      if (buffer.length > 60) buffer.shift();
      dirty = true;
    }

    function flush() {
      if (dirty) {
        dirty = false;
        view.innerHTML = buffer.join('\n') || '<div class="empty">…</div>';
        view.scrollTop = view.scrollHeight;
        renderOps(opsView);
      }
      stat.textContent = 'in ' + SM.net.stats.inCount + ' · out ' + SM.net.stats.outCount;
      setTimeout(flush, 250);
    }

    function ensureBound() {
      if (bound) return;
      bound = true;
      SM.bus.on('net:in', onFrame);
      SM.bus.on('net:out', onFrame);
    }

    shadow.querySelector('[data-net="clear"]').addEventListener('click', function () {
      buffer.length = 0;
      SM.net.frames.length = 0;
      view.innerHTML = '<div class="empty">cleared</div>';
    });

    shadow.querySelector('[data-net="copy"]').addEventListener('click', function () {
      const dump = SM.net.frames.map(function (f) {
        if (f.bytes) {
          let hex = '';
          for (let i = 0; i < f.bytes.length; i++) hex += f.bytes[i].toString(16).padStart(2, '0');
          const dec = SM.msgpack.decode(f.bytes);
          return f.dir + ' ' + f.size + ' ' + hex + (dec.ok ? ' | ' + JSON.stringify(dec.value) : '');
        }
        return f.dir + ' text ' + (f.text || '');
      }).join('\n');
      try { navigator.clipboard.writeText(dump); SM.log('sniffer copied', SM.net.frames.length, 'frames'); }
      catch (e) { SM.warn('clipboard failed', e); }
    });

    ensureBound();
    flush();
  }

  function setupOpcodeCaptures(shadow) {
    const host = shadow.querySelector('[data-opcaps]');
    if (!host || !SM.opcodes) return;

    function curVal(slot) {
      const v = SM.opcodes.get(slot);
      return v == null ? '—' : String(v);
    }

    let html = '';
    CAPTURE_SLOTS.forEach(function (c) {
      html +=
        '<div class="bind" data-opcap="' + c.slot + '">' +
        '<div class="bind-head"><span class="name">' + c.label + '<small style="display:block;font-size:9px;color:rgba(255,255,255,.3)">' + c.hint + '</small></span></div>' +
        '<div class="bind-foot"><span class="keycap" data-opval="' + c.slot + '" style="flex:1">' + curVal(c.slot) + '</span>' +
        '<button class="net-btn" data-opbtn="' + c.slot + '">capture</button></div></div>';
    });
    host.innerHTML = html;

    host.querySelectorAll('[data-opbtn]').forEach(function (btn) {
      const slot = btn.dataset.opbtn;
      btn.addEventListener('click', function () {
        btn.textContent = 'жду…';
        const valEl = host.querySelector('[data-opval="' + slot + '"]');
        SM.opcodes.capture(slot, function (op) {
          btn.textContent = 'capture';
          if (valEl) valEl.textContent = op == null ? '—' : String(op);
        });
      });
    });
  }

  function createGui() {
    const host = document.createElement('div');
    host.id = 'starve-mod-root';
    const shadow = host.attachShadow({ mode: 'closed' });
    shadow.innerHTML = '<style>' + styles() + '</style>' + bodyHtml();
    document.documentElement.appendChild(host);

    const toggle = shadow.querySelector('.toggle');
    const panel = shadow.querySelector('.panel');
    const titlebar = shadow.querySelector('.titlebar');
    const closeBtn = shadow.querySelector('.close-btn');
    const statusEl = shadow.querySelector('[data-status]');
    const tabs = shadow.querySelectorAll('.tab');
    const sections = shadow.querySelectorAll('.section');

    function togglePanel(force) {
      const open = force !== undefined ? force : panel.classList.contains('hidden');
      panel.classList.toggle('hidden', !open);
    }

    const searchInput = shadow.querySelector('[data-search]');

    function sectionHasVisible(sec) {
      let vis = false;
      sec.querySelectorAll('.row,.bind').forEach(function (el) {
        if (el.style.display !== 'none') vis = true;
      });
      return vis;
    }

    function updateBiomeGroups(sec, q) {
      sec.querySelectorAll('.biome-group').forEach(function (grp) {
        let any = false;
        grp.querySelectorAll('.row[data-tracer-row]').forEach(function (row) {
          if (row.style.display !== 'none') any = true;
        });
        if (q && any) grp.classList.add('open');
        grp.style.display = (!q || any) ? '' : 'none';
      });
    }

    function updateSubheads(sec, q) {
      sec.querySelectorAll('.subhead').forEach(function (head) {
        let vis = false;
        let n = head.nextElementSibling;
        while (n && !n.classList.contains('subhead')) {
          if (n.classList.contains('biome-group')) {
            if (n.style.display !== 'none') { vis = true; break; }
          } else if ((n.classList.contains('row') || n.classList.contains('bind')) && n.style.display !== 'none') {
            vis = true;
            break;
          }
          n = n.nextElementSibling;
        }
        head.style.display = (!q || vis) ? '' : 'none';
      });
    }

    // Глобальный поиск: при непустом запросе показываем все вкладки сразу.
    function applySearch() {
      const q = (searchInput && searchInput.value || '').trim().toLowerCase();
      const global = q.length > 0;
      panel.classList.toggle('searching', global);

      sections.forEach(function (sec) {
        sec.querySelectorAll('.row,.bind').forEach(function (el) {
          const hit = !q || el.textContent.toLowerCase().indexOf(q) !== -1;
          el.style.display = hit ? '' : 'none';
        });
        updateBiomeGroups(sec, q);
        updateSubheads(sec, q);
        // Управляем только видимостью: 'none' прячет, '' возвращает раскладку из CSS
        // (.section.active / .panel.searching .section → display:grid). НЕ ставим 'block',
        // иначе перекроем grid и колонки схлопнутся в один столбец.
        if (global) {
          sec.style.display = sectionHasVisible(sec) ? '' : 'none';
        } else {
          sec.style.display = '';
        }
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.toggle('active', t === tab); });
        sections.forEach(function (s) { s.classList.toggle('active', s.dataset.section === tab.dataset.tab); });
        applySearch();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', applySearch);
      // Не даём клавишам из поиска уходить в игровые бинды (E → autoSpike).
      searchInput.addEventListener('keydown', function (e) { e.stopPropagation(); });
      searchInput.addEventListener('keyup', function (e) { e.stopPropagation(); });
    }

    // Числовые поля и прочие input/select в GUI — тоже блокируем бинды.
    panel.addEventListener('keydown', function (e) {
      const tag = e.target && e.target.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') e.stopPropagation();
    }, true);
    panel.addEventListener('keyup', function (e) {
      const tag = e.target && e.target.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') e.stopPropagation();
    }, true);

    closeBtn.addEventListener('click', function () { togglePanel(false); });
    SM.ui.makeDraggable(toggle, toggle, { threshold: 4, cursor: 'grab', onClick: togglePanel });
    SM.ui.makeDraggable(panel, titlebar, { threshold: 0, cursor: 'grab' });

    shadow.querySelectorAll('input[data-key]').forEach(function (input) {
      const key = input.dataset.key;
      if (key in SM.settings) input.checked = SM.settings[key];
      input.addEventListener('change', function () {
        SM.settings[key] = input.checked;
        SM.storage.save();
        if (key === 'showFps') SM.features.fps.setVisible(input.checked);
        if (key === 'showPing') SM.features.ping.setVisible(input.checked);
        if (key === 'netSniffer' && input.checked) SM.net.ensureInstalled();
        if (key === 'colorSpike' && SM.features.colorSpike) SM.features.colorSpike.setActive(input.checked);
        if ((key === 'chestInfo' || key === 'colorSpike') && SM.features.colorSpike && SM.features.colorSpike.syncSkip) {
          SM.features.colorSpike.syncSkip();
        }
        SM.log('setting', key, '=', input.checked);
      });
    });

    if (SM.tracers) SM.tracers.ensureSettings();
    shadow.querySelectorAll('input[data-tracer]').forEach(function (input) {
      const mobId = input.dataset.tracer;
      if (SM.settings.tracers && mobId in SM.settings.tracers) {
        input.checked = !!SM.settings.tracers[mobId];
      }
      input.addEventListener('change', function () {
        if (!SM.settings.tracers) SM.settings.tracers = {};
        SM.settings.tracers[mobId] = input.checked;
        SM.storage.save();
        SM.log('tracer', mobId, '=', input.checked);
      });
    });

    shadow.querySelectorAll('[data-biome-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const grp = btn.closest('.biome-group');
        if (grp) grp.classList.toggle('open');
      });
    });

    const csPackSel = shadow.querySelector('[data-cs-pack]');
    if (csPackSel) {
      csPackSel.value = SM.settings.colorSpikePack || 'type1';
      csPackSel.addEventListener('change', function () {
        SM.settings.colorSpikePack = csPackSel.value;
        SM.storage.save();
        if (SM.features.colorSpike) SM.features.colorSpike.setPack(csPackSel.value);
      });
    }

    const probeBtn = shadow.querySelector('[data-vis="probe"]');
    if (probeBtn) {
      probeBtn.addEventListener('click', function () {
        if (!SM.visuals) { SM.warn('visuals не загружены'); return; }
        const rep = SM.visuals.probe();
        try { navigator.clipboard.writeText(rep); } catch (_) {}
        const stat = shadow.querySelector('[data-vis-stat]');
        if (stat) stat.textContent = 'скопировано → пришли мне';
      });
    }

    renderCombat(shadow.querySelector('[data-combat-root]'));
    renderBinds(shadow.querySelector('[data-binds-root]'), shadow);
    setupSniffer(shadow);

    SM.bus.on('ui:toggleMenu', function () { togglePanel(); });

    function updateStatus() {
      const ver = document.getElementById('version');
      const verText = ver && ver.textContent ? ver.textContent.trim() : '—';
      const sock = SM.net.socket ? '· ws✓' : '· ws✗';
      statusEl.textContent = 'Game v' + verText + ' ' + sock;
    }
    setInterval(updateStatus, 1000);
    updateStatus();

    SM.ui.guiShadow = shadow;
    return { togglePanel: togglePanel, shadow: shadow };
  }

  SM.ui = SM.ui || {};
  SM.ui.createGui = createGui;
})(window.__SM__ = window.__SM__ || {});


/* ===== src/bootstrap.js ===== */
/**
 * bootstrap.js — точка входа: загрузка настроек, хук сети, инициализация фич и GUI.
 * Подключается последним в сборке.
 */
;(function (SM) {
  'use strict';

  // Изолированный запуск шага инициализации: ошибка одной фичи не должна рушить
  // остальные (особенно binds/GUI). Логируем и продолжаем.
  function safeInit(label, fn) {
    try {
      if (typeof fn === 'function') fn();
    } catch (err) {
      SM.warn('init failed: ' + label, err);
    }
  }

  function runtimeSync() {
    let lastUserAt = 0;
    let lastWorld = null;
    let lastUser = null;
    setInterval(function () {
      const user = window.__SV_USER__;
      const world = window.__SV_WORLD__;
      const userAt = window.__SV_USER_AT__ || 0;
      const globalsChanged = userAt !== lastUserAt || world !== lastWorld;
      if (globalsChanged && user && world) {
        lastUserAt = userAt;
        lastWorld = world;
        if (SM.keys) try { SM.keys.refresh(); } catch (_) {}
        if (user !== lastUser) {
          lastUser = user;
          if (SM.barGauges) try { SM.barGauges.reset(); } catch (_) {}
          if (SM.features.tokenLogger) try { SM.features.tokenLogger.invalidateKeys(); } catch (_) {}
        }
        if (SM.visuals && SM.visuals.invalidate) try { SM.visuals.invalidate(); } catch (_) {}
      }
      if (user && world && SM.keys) {
        try {
          if (!SM.keys.selfUnit()) SM.keys.refresh();
        } catch (_) {}
      }
    }, 1000);
  }

  function start() {
    if (SM.MOD.ready) return;
    SM.MOD.ready = true;
    SM.log('bootstrap v' + SM.MOD.version + ' build=' + (window.__SM_BUILD__ || '?'));
    if (!SM.barGauges) {
      SM.warn('[starve-mod] barGauges НЕ загружен — перезагрузи страницу, проверь node serve.js');
    } else {
      try { SM.barGauges.install(); } catch (_) {}
    }
    if (SM.zoomFix) {
      try { SM.zoomFix.install(); } catch (_) {}
    }

    if (SM.features && SM.features.hudStats && SM.features.hudStats.ensureBarProbe) {
      try { SM.features.hudStats.ensureBarProbe(); } catch (_) {}
    }

    safeInit('protocol', function () { SM.protocol.init(); });
    safeInit('inventory', function () {
      if (SM.inventory) {
        SM.inventory.init();
        if (SM.inventoryPackets) SM.inventoryPackets.init();
        if (SM.inventoryDebug && SM.inventory) SM.inventory.debug = SM.inventoryDebug;
      }
    });
    safeInit('fps', function () { SM.features.fps.init(); });
    safeInit('ping', function () { SM.features.ping.init(); });
    safeInit('weatherInfo', function () { if (SM.features.weatherInfo) SM.features.weatherInfo.init(); });
    safeInit('combat', function () { SM.features.combat.init(); });
    safeInit('tokenLogger', function () {
      if (SM.features.tokenLogger) SM.features.tokenLogger.init();
    });
    safeInit('autofarm', function () { if (SM.features.autofarm) SM.features.autofarm.init(); });
    safeInit('wormFarm', function () { if (SM.features.wormFarm) SM.features.wormFarm.init(); });
    safeInit('aimbot', function () { if (SM.features.aimbot) SM.features.aimbot.init(); });
    safeInit('extra', function () { if (SM.features.extra) SM.features.extra.init(); });
    safeInit('autoFood', function () { if (SM.features.autoFood) SM.features.autoFood.init(); });
    safeInit('smartCraft', function () { if (SM.features.smartCraft) SM.features.smartCraft.init(); });
    safeInit('colorSpike', function () { if (SM.features.colorSpike) SM.features.colorSpike.init(); });
    safeInit('visuals', function () { if (SM.visuals) SM.visuals.init(); });
    safeInit('hudStats', function () { if (SM.features.hudStats) SM.features.hudStats.init(); });
    safeInit('worldEsp', function () { if (SM.features.worldEsp) SM.features.worldEsp.init(); });
    safeInit('onTop', function () {
      if (SM.features.onTop) {
        SM.features.onTop.init();
        SM.features.onTop.install();
      }
    });
    safeInit('mapEsp', function () { if (SM.features.mapEsp) SM.features.mapEsp.init(); });
    safeInit('mobTracers', function () { if (SM.features.mobTracers) SM.features.mobTracers.init(); });
    safeInit('mobHp', function () { if (SM.features.mobHp) SM.features.mobHp.init(); });
    safeInit('binds', function () { SM.ui.binds.init(); });
    safeInit('activeBinds', function () { if (SM.ui.activeBinds) SM.ui.activeBinds.init(); });
    safeInit('gui', function () { SM.gui = SM.ui.createGui(); });

    SM.log('ready — sniffer на Net-вкладке, combat-бинды в Binds');
    SM.warn('[starve-mod] v' + SM.MOD.version + ' ready — Insert = меню');
    console.warn(
      '[starve-mod inv] debug: __STARVE_MOD__.inventory.debug.dump() | .copy() | .watch()'
    );
    console.warn(
      '[starve-mod inv] decode: ставь стены/шипы → __STARVE_MOD__.invDecode.report()'
    );
    if (SM.inventory && SM.inventory.debug) {
      setTimeout(function () {
        if (window.__STARVE_GAME_WS__ && window.__STARVE_GAME_WS__.readyState === 1) {
          SM.inventory.debug.dump('mod ready in game', false);
        }
      }, 3000);
    }

    runtimeSync();
  }

  // По умолчанию глобально не патчим prototype после загрузки клиента.
  // Ранний WS-хук ставится loader'ом на document-start; здесь только слушатели.
  SM.storage.load();
  SM.net.ensureInstalled(); // слушатели раннего WS-хука (безопасно)

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  window.__STARVE_MOD__ = SM;
})(window.__SM__ = window.__SM__ || {});
