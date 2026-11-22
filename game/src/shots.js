// Velvet Vault — screenshot poses.
// One clear job: put the game into a fixed, deterministic pose for each
// screenshot the maker takes (?shot=start|play|vault|end). The poses use
// fixed coordinates from the level data, never a live playthrough, so the
// same query always renders the same frame.
import { buildLevel, tileCenter } from './world.js';

function place(level, tx, ty) {
  const p = tileCenter(tx, ty);
  level.player.x = p.x;
  level.player.y = p.y;
}

export function applyShot(game, shot) {
  if (shot === 'start') {
    game.level = buildLevel(0);
    game.phase = 'title';
    game.lives = 3;
    game.score = 0;
    return true;
  }
  if (shot === 'play') {
    // Mid-heist in the Lobby: the thief crossing the middle lane, one guard
    // sweeping close by, the camera mid-sweep, the alarm a third full, one
    // gold already pocketed. Room, cones, camera, loot and alarm in one frame.
    const level = buildLevel(0);
    game.level = level;
    game.phase = 'play';
    game.lives = 3;
    game.score = 0;
    place(level, 13, 10);
    level.player.angle = Math.PI / 2;
    level.loot[0].taken = true;
    level.levelScore = 100;
    level.alarm = 38;
    level.spotted = 1;
    const g0 = level.guards[0];
    g0.x = tileCenter(15, 4).x;
    g0.y = tileCenter(15, 4).y;
    g0.angle = Math.PI;
    g0.mode = 'patrol';
    const g1 = level.guards[1];
    g1.x = tileCenter(16, 11).x;
    g1.y = tileCenter(16, 11).y;
    g1.angle = -Math.PI / 2;
    level.cameras[0].t = 1.5;
    level.cameras[0].angle = level.cameras[0].base + 0.7 * Math.sin((Math.PI * 2 * 1.5) / 6);
    return true;
  }
  if (shot === 'vault') {
    // The Vault's core grab: thief on the pink core, alarm past half,
    // two guards closing in, both cameras live.
    const level = buildLevel(2);
    game.level = level;
    game.phase = 'play';
    game.lives = 2;
    game.score = 650;
    place(level, 15, 9);
    level.player.angle = 0;
    level.loot[1].taken = true;
    level.loot[2].taken = true;
    level.levelScore = 350;
    level.alarm = 62;
    level.spotted = 2;
    const g2 = level.guards[2];
    g2.x = tileCenter(16, 12).x;
    g2.y = tileCenter(16, 12).y;
    g2.angle = -Math.PI / 2;
    g2.mode = 'alert';
    const g3 = level.guards[3];
    g3.x = tileCenter(26, 11).x;
    g3.y = tileCenter(26, 11).y;
    g3.angle = Math.PI;
    level.cameras[0].t = 2.2;
    level.cameras[0].angle = level.cameras[0].base + 0.8 * Math.sin((Math.PI * 2 * 2.2) / 5);
    return true;
  }
  if (shot === 'end') {
    const level = buildLevel(2);
    game.level = level;
    game.phase = 'win';
    game.lives = 2;
    game.score = 2140;
    game.breakdown = { loot: 1250, time: 590, ghost: 300, spotted: 0 };
    return true;
  }
  return false;
}
