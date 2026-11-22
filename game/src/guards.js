// Velvet Vault — guard patrols.
// One clear job: how guards walk, investigate a thrown coin, and stare at the
// thief when they spot one. Guards never decide the alarm; alarm.js does that.
import { TUNING } from './config.js';
import { moveCircle, inVisionCone } from './world.js';

function faceToward(g, tx, ty) {
  g.angle = Math.atan2(ty - g.y, tx - g.x);
}

export function guardSeesPlayer(level, g) {
  return inVisionCone(
    level, g.x, g.y, g.angle,
    TUNING.guardRange, TUNING.guardHalfAngle,
    level.player.x, level.player.y,
  );
}

export function updateGuards(level, dt) {
  for (const g of level.guards) {
    if (g.mode === 'wait') {
      g.waitT -= dt;
      if (g.waitT <= 0) g.mode = 'patrol';
      continue;
    }
    if (g.mode === 'alert') {
      // Stand still, staring at the thief, while the alarm climbs.
      faceToward(g, level.player.x, level.player.y);
      g.alertT -= dt;
      if (g.alertT <= 0) g.mode = 'patrol';
      continue;
    }
    let tx;
    let ty;
    if (g.mode === 'investigate' && g.target) {
      tx = g.target.x;
      ty = g.target.y;
    } else {
      g.mode = 'patrol';
      const p = g.path[g.wp];
      tx = p.x;
      ty = p.y;
    }
    const dx = tx - g.x;
    const dy = ty - g.y;
    const d = Math.hypot(dx, dy);
    const step = g.speed * dt;
    if (d <= Math.max(step, 4)) {
      g.x = tx;
      g.y = ty;
      if (g.mode === 'investigate') {
        g.mode = 'wait';
        g.waitT = 3;
        g.target = null;
      } else {
        // Ping-pong along the patrol path.
        g.wp += g.dir;
        if (g.wp >= g.path.length) {
          g.wp = g.path.length - 2;
          g.dir = -1;
        } else if (g.wp < 0) {
          g.wp = 1;
          g.dir = 1;
        }
      }
    } else {
      const vx = (dx / d) * step;
      const vy = (dy / d) * step;
      // Move a throwaway body so the guard keeps its own fields.
      const body = { x: g.x, y: g.y, r: 14 };
      moveCircle(level, body, vx, 0);
      moveCircle(level, body, 0, vy);
      g.x = body.x;
      g.y = body.y;
      g.angle = Math.atan2(dy, dx);
    }
  }
}

// A landed coin pulls every guard in earshot toward it.
export function investigateCoin(level, coin) {
  for (const g of level.guards) {
    if (g.mode === 'alert') continue;
    const d = Math.hypot(g.x - coin.x, g.y - coin.y);
    if (d < TUNING.coinRadius) {
      g.mode = 'investigate';
      g.target = { x: coin.x, y: coin.y };
    }
  }
}
