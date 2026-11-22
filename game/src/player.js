// Velvet Vault — the thief.
// One clear job: move the player, grab loot, hack terminals, throw coins and
// puff smoke. The player never decides the alarm or the score; others do.
import { TUNING } from './config.js';
import { moveCircle, tileCenter } from './world.js';
import { investigateCoin } from './guards.js';

export function updatePlayer(level, input, dt, sfx) {
  const p = level.player;
  const ax = input.axisX();
  const ay = input.axisY();
  p.sneak = input.sneak();
  const moving = ax !== 0 || ay !== 0;
  if (moving) {
    const len = Math.hypot(ax, ay);
    const speed = (p.sneak ? TUNING.sneakSpeed : TUNING.walkSpeed) * dt;
    const vx = (ax / len) * speed;
    const vy = (ay / len) * speed;
    moveCircle(level, p, vx, vy);
    p.angle = Math.atan2(vy, vx);
  }

  // Walk over loot to pocket it.
  for (const l of level.loot) {
    if (l.taken) continue;
    if (Math.hypot(p.x - l.x, p.y - l.y) < 30) {
      l.taken = true;
      level.levelScore += l.value;
      sfx.pickup();
    }
  }

  // Hold E beside a terminal to hack its camera.
  let nearTerminal = null;
  for (const t of level.terminals) {
    if (!t.done && Math.hypot(p.x - t.x, p.y - t.y) < 52) nearTerminal = t;
  }
  if (nearTerminal && input.interact()) {
    p.hack += dt;
    if (p.hack >= TUNING.hackTime) {
      nearTerminal.done = true;
      level.cameras[nearTerminal.camera].disabled = true;
      p.hack = 0;
      sfx.hack();
    }
  } else {
    p.hack = 0;
  }

  // Click (or Q) throws a coin toward the mouse; guards go look at the noise.
  const throwAt = input.consumeThrow();
  if (throwAt && p.coins > 0) {
    p.coins -= 1;
    level.coinsFlying.push({
      x0: p.x, y0: p.y, x1: throwAt.x, y1: throwAt.y, t: 0, dur: 0.32,
    });
    sfx.toss();
  }

  // F puffs smoke at the thief's feet; vision cannot cross it.
  if (input.consumeSmoke() && p.smokes > 0) {
    p.smokes -= 1;
    level.smokes.push({ x: p.x, y: p.y, age: 0 });
    sfx.smoke();
  }

  // Flying coins land, then ring out.
  for (let i = level.coinsFlying.length - 1; i >= 0; i--) {
    const c = level.coinsFlying[i];
    c.t += dt;
    if (c.t >= c.dur) {
      level.coinsFlying.splice(i, 1);
      const landed = { x: c.x1, y: c.y1, pingT: 0 };
      level.coinsLanded.push(landed);
      investigateCoin(level, landed);
    }
  }
  for (let i = level.coinsLanded.length - 1; i >= 0; i--) {
    const c = level.coinsLanded[i];
    c.pingT += dt;
    if (c.pingT > 4) level.coinsLanded.splice(i, 1);
  }
  for (let i = level.smokes.length - 1; i >= 0; i--) {
    level.smokes[i].age += dt;
    if (level.smokes[i].age > TUNING.smokeTime) level.smokes.splice(i, 1);
  }
}

export function allLootTaken(level) {
  return level.loot.every((l) => l.taken);
}

export function atExit(level) {
  const p = level.player;
  return Math.hypot(p.x - level.exit.x, p.y - level.exit.y) < 30;
}

export function tileCenterOf(level, tx, ty) {
  return tileCenter(tx, ty);
}
