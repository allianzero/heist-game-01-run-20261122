// Velvet Vault — wall cameras.
// One clear job: how cameras sweep their cone, and when they are blind.
// A hacked terminal switches a camera off for the rest of the level.
import { TUNING } from './config.js';
import { inVisionCone } from './world.js';

export function updateCameras(level, dt) {
  for (const c of level.cameras) {
    if (c.disabled) continue;
    c.t += dt;
    c.angle = c.base + c.sweep * Math.sin((Math.PI * 2 * c.t) / c.period);
  }
}

export function cameraSeesPlayer(level, c) {
  if (c.disabled) return false;
  return inVisionCone(
    level, c.x, c.y, c.angle,
    TUNING.cameraRange, TUNING.cameraHalfAngle,
    level.player.x, level.player.y,
  );
}
