// Velvet Vault — the alarm meter.
// One clear job: turn "being seen" into a rising meter, count clean
// detections, and say when the thief is caught. It never moves anyone.
import { TUNING } from './config.js';
import { guardSeesPlayer } from './guards.js';
import { cameraSeesPlayer } from './cameras.js';

export function updateAlarm(level, dt, sfx) {
  let rate = 0;
  let seen = false;
  const p = level.player;
  for (const g of level.guards) {
    if (guardSeesPlayer(level, g)) {
      seen = true;
      const d = Math.hypot(p.x - g.x, p.y - g.y);
      const near = 1 - (d / TUNING.guardRange) * 0.5;
      rate += TUNING.guardDetect * near * (p.sneak ? 0.45 : 1);
      g.mode = 'alert';
      g.alertT = 1.2;
    }
  }
  for (const c of level.cameras) {
    if (cameraSeesPlayer(level, c)) {
      seen = true;
      const d = Math.hypot(p.x - c.x, p.y - c.y);
      const near = 1 - (d / TUNING.cameraRange) * 0.5;
      rate += TUNING.cameraDetect * near * (p.sneak ? 0.45 : 1);
    }
  }
  if (seen) {
    if (level.spottedCooldown <= 0) {
      level.spotted += 1;
      level.spottedCooldown = 2;
      sfx.spotted();
    }
    level.alarm = Math.min(TUNING.alarmMax, level.alarm + rate * dt);
  } else {
    level.alarm = Math.max(0, level.alarm - TUNING.alarmDecay * dt);
  }
  if (level.spottedCooldown > 0) level.spottedCooldown -= dt;
  return level.alarm >= TUNING.alarmMax;
}
