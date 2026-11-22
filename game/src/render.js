// Velvet Vault — drawing.
// One clear job: paint the room, the cones, the thief, the HUD and every
// screen of the game on the canvas. It never changes game state.
import { TILE, VIEW_W, VIEW_H, COLS, ROWS, TUNING } from './config.js';
import { cameraSeesPlayer } from './cameras.js';

function cone(ctx, x, y, angle, range, half, color) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - half, angle + half);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function bar(ctx, x, y, w, h, frac, fill, bg) {
  ctx.fillStyle = bg || 'rgba(0,0,0,0.55)';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w * Math.max(0, Math.min(1, frac)), h);
}

function text(ctx, s, x, y, size, color, align, weight) {
  ctx.font = `${weight || 700} ${size}px system-ui, sans-serif`;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color || '#e8ecf4';
  ctx.fillText(s, x, y);
}

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(8, 11, 20, 0.88)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#f5c542';
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
}

function drawFloor(ctx, time) {
  ctx.fillStyle = '#141a26';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  for (let ty = 0; ty < ROWS; ty++) {
    for (let tx = 0; tx < COLS; tx++) {
      if ((tx + ty) % 2 === 0) {
        ctx.fillStyle = '#171e2d';
        ctx.fillRect(tx * TILE, ty * TILE, TILE, TILE);
      }
    }
  }
  // A worn red carpet down the middle lane, the thief's favourite route.
  ctx.fillStyle = 'rgba(122, 42, 58, 0.35)';
  ctx.fillRect(15 * TILE, TILE, 2 * TILE, (ROWS - 2) * TILE);
  void time;
}

function drawWallsAndCrates(ctx, level) {
  for (const s of level.solids) {
    ctx.fillStyle = '#39466b';
    ctx.fillRect(s.x, s.y, s.w, s.h);
    ctx.fillStyle = '#4a5a86';
    ctx.fillRect(s.x, s.y, s.w, 4);
  }
  for (const c of level.crates) {
    ctx.fillStyle = '#6b5433';
    ctx.fillRect(c.x + 3, c.y + 3, c.w - 6, c.h - 6);
    ctx.strokeStyle = '#8a6f45';
    ctx.lineWidth = 2;
    ctx.strokeRect(c.x + 3, c.y + 3, c.w - 6, c.h - 6);
    ctx.beginPath();
    ctx.moveTo(c.x + 3, c.y + 3);
    ctx.lineTo(c.x + c.w - 3, c.y + c.h - 3);
    ctx.moveTo(c.x + c.w - 3, c.y + 3);
    ctx.lineTo(c.x + 3, c.y + c.h - 3);
    ctx.stroke();
  }
}

function drawLoot(ctx, level, time) {
  for (const l of level.loot) {
    if (l.taken) continue;
    const pulse = 1 + 0.12 * Math.sin(time * 4 + l.x);
    ctx.save();
    ctx.translate(l.x, l.y);
    ctx.scale(pulse, pulse);
    if (l.kind === 'gold') {
      ctx.fillStyle = '#f5c542';
      ctx.beginPath();
      ctx.moveTo(0, -12); ctx.lineTo(10, 0); ctx.lineTo(0, 12); ctx.lineTo(-10, 0);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#8a6d1f';
      ctx.fillRect(-2, -3, 4, 6);
    } else if (l.kind === 'gem') {
      ctx.fillStyle = '#59d8ff';
      ctx.beginPath();
      ctx.moveTo(0, -13); ctx.lineTo(11, -3); ctx.lineTo(7, 11); ctx.lineTo(-7, 11); ctx.lineTo(-11, -3);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#eaf9ff';
      ctx.beginPath();
      ctx.moveTo(0, -13); ctx.lineTo(11, -3); ctx.lineTo(-11, -3);
      ctx.closePath(); ctx.fill();
    } else {
      // The vault core: a big pink diamond ringed by its own glow.
      ctx.strokeStyle = '#ff5d8f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 20 + 3 * Math.sin(time * 3), 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ff5d8f';
      ctx.beginPath();
      ctx.moveTo(0, -14); ctx.lineTo(12, 0); ctx.lineTo(0, 14); ctx.lineTo(-12, 0);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-4, -5, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawExit(ctx, level, time) {
  const open = level.loot.every((l) => l.taken);
  const pulse = open ? 1 + 0.15 * Math.sin(time * 5) : 1;
  ctx.save();
  ctx.translate(level.exit.x, level.exit.y);
  ctx.scale(pulse, pulse);
  ctx.fillStyle = open ? '#2fbf71' : '#274d38';
  ctx.fillRect(-18, -18, 36, 36);
  ctx.strokeStyle = open ? '#a9f5cd' : '#4a7a5e';
  ctx.lineWidth = 2;
  ctx.strokeRect(-18, -18, 36, 36);
  ctx.restore();
  text(ctx, 'EXIT', level.exit.x, level.exit.y - 30, 13, open ? '#a9f5cd' : '#6b8a76', 'center');
}

function drawTerminals(ctx, level) {
  for (const t of level.terminals) {
    ctx.fillStyle = t.done ? '#1f3a2e' : '#123043';
    ctx.fillRect(t.x - 12, t.y - 12, 24, 24);
    ctx.strokeStyle = t.done ? '#2fbf71' : '#59d8ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(t.x - 12, t.y - 12, 24, 24);
    text(ctx, t.done ? 'OFF' : 'CAM', t.x, t.y, 9, t.done ? '#7fd6a4' : '#9be4ff', 'center');
    if (!t.done) {
      const p = level.player;
      const near = Math.hypot(p.x - t.x, p.y - t.y) < 52;
      if (near && p.hack > 0) {
        ctx.strokeStyle = '#59d8ff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 20, -Math.PI / 2, -Math.PI / 2 + (p.hack / TUNING.hackTime) * Math.PI * 2);
        ctx.stroke();
      } else if (near) {
        text(ctx, 'hold E to hack', t.x, t.y - 28, 12, '#9be4ff', 'center');
      }
    }
  }
}

function drawCameras(ctx, level) {
  for (const c of level.cameras) {
    const seeing = !c.disabled && cameraSeesPlayer(level, c);
    cone(ctx, c.x, c.y, c.angle, TUNING.cameraRange, TUNING.cameraHalfAngle,
      c.disabled ? 'rgba(120,120,120,0.06)' : seeing ? 'rgba(255,70,70,0.20)' : 'rgba(255,220,90,0.13)');
    ctx.fillStyle = '#9aa4b8';
    ctx.beginPath();
    ctx.arc(c.x, c.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.disabled ? '#555' : '#ffdf5e';
    ctx.beginPath();
    ctx.arc(c.x + Math.cos(c.angle) * 7, c.y + Math.sin(c.angle) * 7, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGuards(ctx, level) {
  for (const g of level.guards) {
    // Faint dashed patrol route, so the player can read the patrol first.
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.setLineDash([4, 8]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(g.path[0].x, g.path[0].y);
    for (let i = 1; i < g.path.length; i++) ctx.lineTo(g.path[i].x, g.path[i].y);
    ctx.stroke();
    ctx.setLineDash([]);

    const alert = g.mode === 'alert';
    cone(ctx, g.x, g.y, g.angle, TUNING.guardRange, TUNING.guardHalfAngle,
      alert ? 'rgba(255,60,60,0.24)' : 'rgba(255,190,60,0.14)');
    ctx.fillStyle = alert ? '#ff5252' : '#e2574c';
    ctx.beginPath();
    ctx.arc(g.x, g.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7c1d16';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Facing tick: a little nose showing where the guard looks.
    ctx.strokeStyle = '#ffd9d4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(g.x, g.y);
    ctx.lineTo(g.x + Math.cos(g.angle) * 18, g.y + Math.sin(g.angle) * 18);
    ctx.stroke();
    if (alert) text(ctx, '!', g.x, g.y - 26, 20, '#ff6b6b', 'center');
  }
}

function drawPlayer(ctx, level, time) {
  const p = level.player;
  ctx.fillStyle = p.sneak ? 'rgba(47,214,163,0.25)' : 'rgba(47,214,163,0.12)';
  ctx.beginPath();
  ctx.arc(p.x, p.y, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2fd6a3';
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0e5c42';
  ctx.lineWidth = 2;
  ctx.stroke();
  // The mask band.
  ctx.strokeStyle = '#123b2d';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(p.x - 9, p.y - 3);
  ctx.lineTo(p.x + 9, p.y - 3);
  ctx.stroke();
  // Facing tick.
  ctx.strokeStyle = '#d9fff2';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x + Math.cos(p.angle) * 17, p.y + Math.sin(p.angle) * 17);
  ctx.stroke();
  void time;
}

function drawCoinsAndSmoke(ctx, level, time) {
  for (const c of level.coinsFlying) {
    const t = c.t / c.dur;
    const x = c.x0 + (c.x1 - c.x0) * t;
    const y = c.y0 + (c.y1 - c.y0) * t - 26 * Math.sin(t * Math.PI);
    ctx.fillStyle = '#f5c542';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const c of level.coinsLanded) {
    const r = 8 + c.pingT * 26;
    ctx.strokeStyle = `rgba(245,197,66,${Math.max(0, 0.7 - c.pingT * 0.18)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#f5c542';
    ctx.beginPath();
    ctx.arc(c.x, c.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const s of level.smokes) {
    const fade = 1 - s.age / TUNING.smokeTime;
    ctx.fillStyle = `rgba(160,165,175,${0.5 * fade})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, TUNING.smokeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(200,205,215,${0.35 * fade})`;
    ctx.beginPath();
    ctx.arc(s.x - 24, s.y + 12, 40, 0, Math.PI * 2);
    ctx.arc(s.x + 26, s.y - 10, 44, 0, Math.PI * 2);
    ctx.fill();
  }
  void time;
}

function drawHud(ctx, game) {
  const level = game.level;
  ctx.fillStyle = 'rgba(8, 11, 20, 0.72)';
  ctx.fillRect(0, 0, VIEW_W, 52);
  text(ctx, `VELVET VAULT · ${level.def.name}`, 16, 26, 17, '#f5c542');
  // Loot pips.
  let lx = 330;
  for (const l of level.loot) {
    ctx.fillStyle = l.taken ? (l.kind === 'core' ? '#ff5d8f' : l.kind === 'gem' ? '#59d8ff' : '#f5c542') : 'rgba(255,255,255,0.18)';
    ctx.beginPath();
    ctx.moveTo(lx, 18); ctx.lineTo(lx + 8, 26); ctx.lineTo(lx, 34); ctx.lineTo(lx - 8, 26);
    ctx.closePath(); ctx.fill();
    lx += 24;
  }
  text(ctx, `◉ ${level.player.coins}   ☁ ${level.player.smokes}`, 470, 26, 15, '#e8ecf4');
  // Alarm meter, dead centre.
  const a = level.alarm / TUNING.alarmMax;
  const alarmColor = a < 0.4 ? '#2fbf71' : a < 0.7 ? '#f5c542' : '#ff5252';
  text(ctx, 'ALARM', 600, 26, 14, '#ff8a8a');
  bar(ctx, 665, 14, 240, 24, a, alarmColor);
  ctx.strokeStyle = '#ff8a8a';
  ctx.lineWidth = 1;
  ctx.strokeRect(665, 14, 240, 24);
  if (level.spotted === 0) text(ctx, 'GHOST', 925, 26, 14, '#59d8ff');
  text(ctx, `♥ ${game.lives}`, 1000, 26, 15, '#ff8a8a');
  const t = Math.floor(level.elapsed);
  text(ctx, `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`, 1075, 26, 15, '#e8ecf4');
  text(ctx, `SCORE ${game.score + level.levelScore}`, 1150, 26, 15, '#e8ecf4', 'left');
  // Controls reminder, faint, at the bottom.
  text(ctx, 'WASD move · SHIFT sneak · CLICK / Q throw coin · F smoke · E hold to hack · M mute', VIEW_W / 2, VIEW_H - 14, 12, 'rgba(232,236,244,0.45)', 'center');
}

function overlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(5, 7, 12, 0.62)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  const w = 640;
  const h = 120 + lines.length * 30;
  const x = (VIEW_W - w) / 2;
  const y = (VIEW_H - h) / 2;
  panel(ctx, x, y, w, h);
  text(ctx, title, VIEW_W / 2, y + 46, 34, accent || '#f5c542', 'center');
  lines.forEach((line, i) => {
    text(ctx, line, VIEW_W / 2, y + 96 + i * 30, 16, '#e8ecf4', 'center', 400);
  });
}

export function render(ctx, game, time) {
  const level = game.level;
  drawFloor(ctx, time);
  drawWallsAndCrates(ctx, level);
  drawExit(ctx, level, time);
  drawLoot(ctx, level, time);
  drawTerminals(ctx, level);
  drawCameras(ctx, level);
  drawGuards(ctx, level);
  drawCoinsAndSmoke(ctx, level, time);
  drawPlayer(ctx, level, time);

  if (game.phase === 'play') {
    drawHud(ctx, game);
    return;
  }
  if (game.phase === 'title') {
    drawHud(ctx, game);
    overlay(ctx, 'VELVET VAULT', [
      'A three-room heist. Pocket every loot, dodge the cones, reach the EXIT.',
      'WASD / arrows move · SHIFT sneak · CLICK or Q throw a coin · F smoke · hold E to hack cameras',
      'Never let the ALARM meter fill. Finish unseen for the GHOST bonus.',
      'Press ENTER or click to start the heist',
    ]);
    return;
  }
  if (game.phase === 'clear') {
    drawHud(ctx, game);
    overlay(ctx, `${level.def.name} CLEARED`, [
      `Loot $${level.levelScore} · time bonus $${game.clearBonus} · ${level.spotted === 0 ? 'GHOST bonus $300' : `spotted ${level.spotted}× — no GHOST bonus`}`,
      'Next room opening…',
    ], '#2fbf71');
    return;
  }
  if (game.phase === 'busted') {
    drawHud(ctx, game);
    overlay(ctx, 'BUSTED!', [
      'A guard got a good look at you and the alarm went all the way.',
      game.lives > 0 ? `${game.lives} ${game.lives === 1 ? 'life' : 'lives'} left — the room resets…` : 'That was your last life.',
    ], '#ff5252');
    return;
  }
  if (game.phase === 'over') {
    overlay(ctx, 'THE CREW WALKS AWAY', [
      `Final score: ${game.score}`,
      'Press ENTER or click to plan the next heist',
    ], '#ff5252');
    return;
  }
  if (game.phase === 'win') {
    const b = game.breakdown;
    overlay(ctx, 'CLEAN GETAWAY!', [
      `Loot $${b.loot} · time bonus $${b.time} · GHOST bonus $${b.ghost}`,
      `Final score: ${game.score}   —   ${b.ghost > 0 ? 'GHOST: never spotted once' : `spotted ${b.spotted} times`}`,
      'Press ENTER or click to run it back',
    ], '#2fbf71');
  }
}
