// Velvet Vault — keyboard and mouse.
// One clear job: turn raw events into game questions (which way? sneaking?
// hacking? where did the player click?). The game never reads events itself.
export function makeInput(canvas) {
  const keys = new Set();
  let throwQueue = null;
  let smokeQueued = false;
  let mouse = { x: 0, y: 0 };

  function canvasPos(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((clientX - r.left) / r.width) * canvas.width,
      y: ((clientY - r.top) / r.height) * canvas.height,
    };
  }

  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }
    keys.add(e.key.length === 1 ? e.key.toLowerCase() : e.key);
    if (e.key === 'q' || e.key === 'Q') throwQueue = { ...mouse };
    if (e.key === 'f' || e.key === 'F') smokeQueued = true;
  });
  window.addEventListener('keyup', (e) => {
    keys.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key);
  });
  canvas.addEventListener('mousemove', (e) => {
    mouse = canvasPos(e.clientX, e.clientY);
  });
  canvas.addEventListener('mousedown', (e) => {
    mouse = canvasPos(e.clientX, e.clientY);
    throwQueue = { ...mouse };
  });

  return {
    axisX() {
      let x = 0;
      if (keys.has('a') || keys.has('ArrowLeft')) x -= 1;
      if (keys.has('d') || keys.has('ArrowRight')) x += 1;
      return x;
    },
    axisY() {
      let y = 0;
      if (keys.has('w') || keys.has('ArrowUp')) y -= 1;
      if (keys.has('s') || keys.has('ArrowDown')) y += 1;
      return y;
    },
    sneak() {
      return keys.has('Shift');
    },
    interact() {
      return keys.has('e');
    },
    confirm() {
      return keys.has('Enter') || keys.has(' ');
    },
    consumeThrow() {
      const t = throwQueue;
      throwQueue = null;
      return t;
    },
    consumeSmoke() {
      const s = smokeQueued;
      smokeQueued = false;
      return s;
    },
    mouse() {
      return mouse;
    },
  };
}
