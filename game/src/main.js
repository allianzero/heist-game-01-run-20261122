// Velvet Vault — the game loop and the state machine.
// One clear job: own the phases (title / play / clear / busted / over / win),
// wire the modules together, and keep the score. No drawing or rules here.
import { VIEW_W, VIEW_H, SEED, LEVELS } from './config.js';
import { mulberry32 } from './random.js';
import { buildLevel } from './world.js';
import { updateGuards } from './guards.js';
import { updateCameras } from './cameras.js';
import { updatePlayer, allLootTaken, atExit } from './player.js';
import { updateAlarm } from './alarm.js';
import { makeInput } from './input.js';
import { makeSfx } from './audio.js';
import { render } from './render.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
canvas.width = VIEW_W;
canvas.height = VIEW_H;
const ctx = canvas.getContext('2d');

const params = new URLSearchParams(location.search);
const seed = Number(params.get('seed') || SEED) || SEED;
const rng = mulberry32(seed);
void rng;

const input = makeInput(canvas);
const sfx = makeSfx();

const game = {
  level: buildLevel(0),
  levelIndex: 0,
  phase: 'title',
  phaseT: 0,
  lives: 3,
  score: 0,
  clearBonus: 0,
  breakdown: { loot: 0, time: 0, ghost: 0, spotted: 0 },
};

function startGame() {
  game.levelIndex = 0;
  game.level = buildLevel(0);
  game.lives = 3;
  game.score = 0;
  game.breakdown = { loot: 0, time: 0, ghost: 0, spotted: 0 };
  game.phase = 'play';
  game.phaseT = 0;
}

function levelBonus(level) {
  const timeBonus = Math.max(0, Math.round((level.def.par - level.elapsed) * 5));
  const ghostBonus = level.spotted === 0 ? 300 : 0;
  return { timeBonus, ghostBonus };
}

function finishLevel() {
  const level = game.level;
  const { timeBonus, ghostBonus } = levelBonus(level);
  game.clearBonus = timeBonus + ghostBonus;
  game.score += level.levelScore + game.clearBonus;
  game.breakdown.loot += level.levelScore;
  game.breakdown.time += timeBonus;
  game.breakdown.ghost += ghostBonus;
  game.breakdown.spotted += level.spotted;
  game.phase = 'clear';
  game.phaseT = 0;
  sfx.win();
}

function nextLevel() {
  game.levelIndex += 1;
  if (game.levelIndex >= LEVELS.length) {
    game.phase = 'win';
    game.phaseT = 0;
    return;
  }
  game.level = buildLevel(game.levelIndex);
  game.phase = 'play';
  game.phaseT = 0;
}

function bust() {
  game.lives -= 1;
  game.phase = 'busted';
  game.phaseT = 0;
  sfx.caught();
}

function retryLevel() {
  if (game.lives <= 0) {
    game.phase = 'over';
    game.phaseT = 0;
    return;
  }
  game.level = buildLevel(game.levelIndex);
  game.phase = 'play';
  game.phaseT = 0;
}

let last = performance.now();
let time = 0;

function frame(now) {
  // Screenshot mode: freeze the world on the posed frame so the same query
  // always renders the same pixels.
  if (SHOT_MODE) {
    render(ctx, game, 1.25);
    requestAnimationFrame(frame);
    return;
  }
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  time += dt;
  const level = game.level;

  if (game.phase === 'play') {
    level.elapsed += dt;
    updatePlayer(level, input, dt, sfx);
    updateGuards(level, dt);
    updateCameras(level, dt);
    const caught = updateAlarm(level, dt, sfx);
    if (caught) {
      bust();
    } else if (allLootTaken(level) && atExit(level)) {
      finishLevel();
    }
  } else if (game.phase === 'title') {
    updateCameras(level, dt);
    if (input.confirm()) {
      sfx.unlock();
      startGame();
    }
  } else if (game.phase === 'clear') {
    game.phaseT += dt;
    if (game.phaseT > 2.4) nextLevel();
  } else if (game.phase === 'busted') {
    game.phaseT += dt;
    if (game.phaseT > 2.2) retryLevel();
  } else if (game.phase === 'over' || game.phase === 'win') {
    if (input.confirm()) startGame();
  }

  render(ctx, game, time);
  requestAnimationFrame(frame);
}

// Click also starts / restarts, and unlocks sound on the first gesture.
canvas.addEventListener('mousedown', () => {
  sfx.unlock();
  if (game.phase === 'title' || game.phase === 'over' || game.phase === 'win') {
    startGame();
  }
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'm' || e.key === 'M') sfx.toggleMute();
});

// A ?shot= pose renders one deterministic frame for screenshots.
const shot = params.get('shot');
const SHOT_MODE = !!shot;
if (shot) {
  if (applyShot(game, shot)) {
    render(ctx, game, 1.25);
  }
}

requestAnimationFrame(frame);

// Debug handle for automated checks; not part of the game.
window.__velvet = game;
