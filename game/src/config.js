// Velvet Vault — level data and tuning.
// One clear job: what the game is. No logic here, only numbers and layouts.
export const TILE = 40;
export const VIEW_W = 1280;
export const VIEW_H = 720;
export const COLS = 32;
export const ROWS = 18;

export const SEED = 1337;

export const TUNING = {
  walkSpeed: 165,
  sneakSpeed: 92,
  guardSpeed: 62,
  guardRange: 230,
  guardHalfAngle: Math.PI / 5.2,
  cameraRange: 270,
  cameraHalfAngle: Math.PI / 6,
  guardDetect: 62,
  cameraDetect: 85,
  alarmDecay: 14,
  alarmMax: 100,
  coinRadius: 170,
  smokeRadius: 95,
  smokeTime: 5,
  hackTime: 1.6,
  playerRadius: 13,
};

export const LOOT_VALUE = { gold: 100, gem: 250, core: 500 };

// Rects are [tileX, tileY, tilesW, tilesH]. The border walls are implicit:
// the playable interior is tiles x 1..30, y 1..16.
// Every level has three lanes (left / middle gap / right) so there is
// always more than one route to the loot.
export const LEVELS = [
  {
    name: 'The Lobby',
    par: 75,
    walls: [
      [10, 2, 1, 6], [10, 10, 1, 6],
      [21, 2, 1, 6], [21, 10, 1, 6],
      [14, 13, 4, 1],
    ],
    crates: [[5, 5, 2, 1], [24, 12, 2, 1], [15, 4, 2, 1]],
    player: [2, 15],
    exit: [29, 1],
    guards: [
      { path: [[3, 4], [28, 4]] },
      { path: [[16, 3], [16, 14]] },
    ],
    cameras: [{ tx: 16, ty: 1, base: Math.PI / 2, sweep: 0.7, period: 6 }],
    loot: [
      { tx: 4, ty: 14, kind: 'gold' },
      { tx: 27, ty: 3, kind: 'gold' },
      { tx: 16, ty: 8, kind: 'gem' },
    ],
    terminals: [{ tx: 28, ty: 15, camera: 0 }],
    coins: 3,
    smokes: 2,
  },
  {
    name: 'The Gallery',
    par: 90,
    walls: [
      [8, 2, 1, 5], [8, 11, 1, 5],
      [23, 2, 1, 5], [23, 11, 1, 5],
      [13, 8, 6, 1],
    ],
    crates: [[4, 8, 2, 1], [27, 8, 2, 1], [15, 3, 2, 1], [15, 14, 2, 1]],
    player: [2, 15],
    exit: [29, 1],
    guards: [
      { path: [[3, 5], [28, 5]] },
      { path: [[12, 3], [12, 14]] },
      { path: [[19, 3], [19, 14]] },
    ],
    cameras: [
      { tx: 16, ty: 1, base: Math.PI / 2, sweep: 0.7, period: 6 },
      { tx: 1, ty: 9, base: 0, sweep: 0.6, period: 7 },
    ],
    loot: [
      { tx: 3, ty: 3, kind: 'gold' },
      { tx: 16, ty: 12, kind: 'gem' },
      { tx: 28, ty: 14, kind: 'gold' },
    ],
    terminals: [
      { tx: 29, ty: 16, camera: 0 },
      { tx: 1, ty: 16, camera: 1 },
    ],
    coins: 3,
    smokes: 2,
  },
  {
    name: 'The Vault',
    par: 110,
    walls: [
      [10, 2, 1, 6], [10, 10, 1, 6],
      [21, 2, 1, 6], [21, 10, 1, 6],
      [14, 5, 4, 1], [14, 12, 4, 1],
    ],
    crates: [[5, 8, 2, 1], [26, 8, 2, 1]],
    player: [15, 16],
    exit: [29, 1],
    guards: [
      { path: [[3, 4], [28, 4]] },
      { path: [[3, 13], [28, 13]] },
      { path: [[16, 3], [16, 14]] },
      { path: [[26, 3], [26, 14]] },
    ],
    cameras: [
      { tx: 16, ty: 1, base: Math.PI / 2, sweep: 0.8, period: 5 },
      { tx: 30, ty: 9, base: Math.PI, sweep: 0.6, period: 7 },
    ],
    loot: [
      { tx: 16, ty: 9, kind: 'core' },
      { tx: 3, ty: 15, kind: 'gold' },
      { tx: 28, ty: 2, kind: 'gem' },
    ],
    terminals: [
      { tx: 2, ty: 2, camera: 0 },
      { tx: 29, ty: 15, camera: 1 },
    ],
    coins: 3,
    smokes: 2,
  },
];
