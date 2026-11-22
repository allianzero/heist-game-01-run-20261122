// Velvet Vault — the room itself.
// One clear job: build a level's state, move circles against walls, and answer
// line-of-sight and vision-cone questions. No drawing, no input here.
import { TILE, COLS, ROWS, TUNING, LEVELS, LOOT_VALUE } from './config.js';

export function tileCenter(tx, ty) {
  return { x: tx * TILE + TILE / 2, y: ty * TILE + TILE / 2 };
}

function rectPx(r) {
  return { x: r[0] * TILE, y: r[1] * TILE, w: r[2] * TILE, h: r[3] * TILE };
}

function pointInRect(px, py, r) {
  return px >= r.x && px < r.x + r.w && py >= r.y && py < r.y + r.h;
}

function circleHitsRect(cx, cy, rad, r) {
  const nx = Math.max(r.x, Math.min(cx, r.x + r.w));
  const ny = Math.max(r.y, Math.min(cy, r.y + r.h));
  const dx = cx - nx;
  const dy = cy - ny;
  return dx * dx + dy * dy < rad * rad;
}

export function buildLevel(index) {
  const def = LEVELS[index];
  const solids = [];
  // Border walls, one tile thick, all around the interior.
  solids.push({ x: 0, y: 0, w: COLS * TILE, h: TILE });
  solids.push({ x: 0, y: (ROWS - 1) * TILE, w: COLS * TILE, h: TILE });
  solids.push({ x: 0, y: 0, w: TILE, h: ROWS * TILE });
  solids.push({ x: (COLS - 1) * TILE, y: 0, w: TILE, h: ROWS * TILE });
  for (const w of def.walls) solids.push(rectPx(w));
  const crates = def.crates.map(rectPx);
  for (const c of crates) solids.push(c);

  const start = tileCenter(def.player[0], def.player[1]);
  const exit = tileCenter(def.exit[0], def.exit[1]);
  return {
    def,
    index,
    solids,
    crates,
    elapsed: 0,
    player: {
      x: start.x, y: start.y, r: TUNING.playerRadius,
      angle: -Math.PI / 2, sneak: false,
      coins: def.coins, smokes: def.smokes, hack: 0,
    },
    exit: { x: exit.x, y: exit.y },
    guards: def.guards.map((g) => {
      const pts = g.path.map(([tx, ty]) => tileCenter(tx, ty));
      return {
        path: pts, wp: 1, dir: 1, x: pts[0].x, y: pts[0].y,
        angle: 0, mode: 'patrol', waitT: 0, alertT: 0,
        target: null, speed: TUNING.guardSpeed,
      };
    }),
    cameras: def.cameras.map((c) => {
      const p = tileCenter(c.tx, c.ty);
      return { x: p.x, y: p.y, base: c.base, sweep: c.sweep, period: c.period, t: 0, angle: c.base, disabled: false };
    }),
    terminals: def.terminals.map((t) => {
      const p = tileCenter(t.tx, t.ty);
      return { x: p.x, y: p.y, camera: t.camera, done: false };
    }),
    loot: def.loot.map((l) => {
      const p = tileCenter(l.tx, l.ty);
      return { x: p.x, y: p.y, kind: l.kind, value: LOOT_VALUE[l.kind], taken: false, bob: 0 };
    }),
    coinsFlying: [],
    coinsLanded: [],
    smokes: [],
    alarm: 0,
    spotted: 0,
    spottedCooldown: 0,
    levelScore: 0,
  };
}

// Axis-separated circle move: slide along a wall instead of sticking to it.
export function moveCircle(level, e, dx, dy) {
  const r = e.r;
  const nx = e.x + dx;
  if (!level.solids.some((s) => circleHitsRect(nx, e.y, r, s))) e.x = nx;
  const ny = e.y + dy;
  if (!level.solids.some((s) => circleHitsRect(e.x, ny, r, s))) e.y = ny;
}

// True when a wall or a crate stands between the two points.
export function losBlocked(level, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  const steps = Math.max(1, Math.ceil(dist / 8));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const px = x1 + dx * t;
    const py = y1 + dy * t;
    for (const s of level.solids) {
      if (pointInRect(px, py, s)) return true;
    }
  }
  return false;
}

export function inSmoke(level, x, y) {
  for (const s of level.smokes) {
    if (Math.hypot(x - s.x, y - s.y) < TUNING.smokeRadius) return true;
  }
  return false;
}

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// Is the player inside this watcher's vision cone, with a clear line of sight?
export function inVisionCone(level, ox, oy, angle, range, halfAngle, px, py) {
  const dx = px - ox;
  const dy = py - oy;
  const dist = Math.hypot(dx, dy);
  if (dist > range) return false;
  if (Math.abs(angleDiff(Math.atan2(dy, dx), angle)) > halfAngle) return false;
  if (inSmoke(level, px, py)) return false;
  if (losBlocked(level, ox, oy, px, py)) return false;
  return true;
}

export function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
