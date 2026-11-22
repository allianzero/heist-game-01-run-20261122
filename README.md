# Velvet Vault

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/allianzero/heist-game-01-run-20261122/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/allianzero/heist-game-01-run-20261122/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

**Velvet Vault** is a top-down stealth heist game: sneak through three guarded
rooms — The Lobby, The Gallery, and The Vault — pocket every piece of loot,
and reach the EXIT before the alarm meter fills. One frame shows the whole
room: the thief, patrolling guards with vision cones, sweeping cameras, the
loot, and the alarm meter.

## How it plays

- **Move** with WASD or arrow keys. **SHIFT** sneaks: slower, but guards
  notice you half as fast.
- **Read the patrols first.** Guards walk fixed routes (shown as faint dashed
  lines) and stare where they walk. Cameras sweep their cones. Walls and
  crates block sight.
- **Tools cost you.** Click (or press Q) to throw a coin — nearby guards go
  investigate the noise. Press F to puff smoke that vision cannot cross.
  Both are limited per room, so spend them where they buy the most.
- **Hack cameras.** Stand by a terminal and hold E to switch its camera off
  for the rest of the room.
- **The alarm.** Being seen fills the meter; breaking sight lets it drain.
  Fill it and you are BUSTED — the room resets and you lose a life.
- **The getaway.** Grab all the loot, then reach the EXIT. Finish a room
  unseen for the **GHOST bonus** (+300), plus a time bonus against the par.

Three rooms, three lives, one score. Deterministic: the same seed always
plays the same patrols.

## Run it

No build step, no network. Serve the `game/` folder with any static server
and open `index.html` in a desktop browser:

```sh
node serve.ts   # serves game/ on http://localhost:8080
```

Or open `game/index.html` straight from disk — every script, image and sound
is a local file or synthesized in code.

## Structure

- `game/index.html` — the page and the canvas
- `game/src/config.js` — tuning and the three room layouts
- `game/src/world.js` — level state, collision, line of sight, vision cones
- `game/src/guards.js` — patrols, coin investigation, alert stares
- `game/src/cameras.js` — sweeping cameras and hacking
- `game/src/player.js` — movement, loot, terminals, coins, smoke
- `game/src/alarm.js` — the alarm meter and detections
- `game/src/render.js` — all drawing: room, cones, HUD, screens
- `game/src/input.js` — keyboard and mouse
- `game/src/audio.js` — synthesized WebAudio bleeps (no audio files)
- `game/src/shots.js` — deterministic screenshot poses (`?shot=start|play|vault|end`)
- `game/src/main.js` — game loop and state machine
- `main.ts` — the make.fun program: copies `game/` + `screenshots/` to
  `/output` and writes `dossier.json` with the vendored library

Built as an entry for the
[make.fun best heist game bounty](https://make.fun/bounty/best-heist-game-20261122-0559).
