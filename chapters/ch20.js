VB.ch('ch20', root => {
  const $ = s => VB.$(root, s), $$ = s => VB.$$(root, s);
  const ACC = '#b8406a';
  const W = 640, H = 360;
  const panels = $$('.c20-panel');
  const tabs = $$('.c20-tabs button');
  let cur = 0;

  /* 캔버스 준비: 내부 좌표는 늘 640 x 360 */
  function setupCanvas(cv) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = W * dpr; cv.height = H * dpr;
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }
  function toLocal(cv, e) {
    const b = cv.getBoundingClientRect();
    return { x: (e.clientX - b.left) / b.width * W, y: (e.clientY - b.top) / b.height * H };
  }
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  // 화면이 좁아도 글자가 13px 아래로 작아지지 않게
  const hudPx = cv => Math.round(Math.max(18, Math.min(34, 13 / ((cv.clientWidth || W) / W))));
  function overlay(stage, text, btn) {
    const ov = VB.$(stage, '.c20-ov');
    if (text == null) { ov.hidden = true; return; }
    ov.hidden = false;
    VB.$(ov, '.c20-ov-t').innerHTML = text;
    VB.$(ov, '.c20-go').textContent = btn;
  }

  /* 게임 루프: 이 장이 보이고, 그 탭이 열려 있고, 창이 가려지지 않았을 때만 */
  let raf = 0, last = 0;
  const canRun = () => root.classList.contains('cur') && !document.hidden;
  function frame(t) {
    raf = 0;
    const g = games[cur];
    if (!g.loop || !g.running) return;
    if (!canRun()) { g.pause(); return; }
    const dt = Math.min(0.05, Math.max(0, (t - last) / 1000));
    last = t;
    g.step(dt); g.draw();
    if (g.running) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  function stopAll() { games.forEach(g => { if (g.loop && g.running) g.pause(); }); }
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopAll(); });
  new MutationObserver(() => { if (!root.classList.contains('cur')) stopAll(); }).observe(root, { attributes: true, attributeFilter: ['class'] });

  /* ---------- 1. 반응 속도 ---------- */
  const react = (() => {
    const p = panels[0], stage = VB.$(p, '.c20-stage'), cv = VB.$(stage, 'canvas'), ctx = setupCanvas(cv);
    const msg = VB.$(p, '.c20-msg'), stay = VB.$(p, '.c20-stay'), stayOut = VB.$(p, '.c20-stay-out');
    const TIME = 20, R = 30;
    let S, best = 0;
    const g = { loop: true, running: false };
    function reset() {
      S = { left: TIME, score: 0, miss: 0, wrong: 0, dot: null, gap: 0.3, pops: [] };
      g.running = false;
      overlay(stage, '20초 동안 나타나는 동그라미를 눌러 보세요.', '시작');
      VB.msg(msg, '[시작]을 누르면 동그라미가 하나씩 나타납니다. 사라지기 전에 누르면 1점입니다.');
      draw();
    }
    function spawn() {
      const life = +stay.value;
      let x, y, n = 0;
      do { x = R + 10 + Math.random() * (W - 2 * R - 20); y = 60 + R + Math.random() * (H - 60 - 2 * R - 10); n++; }
      while (S.lastPos && Math.hypot(x - S.lastPos.x, y - S.lastPos.y) < 140 && n < 20);
      S.dot = { x, y, life, t: life };
      S.lastPos = { x, y };
    }
    g.start = () => {
      if (S.left <= 0) reset();
      g.running = true; overlay(stage, null);
      stage.focus({ preventScroll: true });
      VB.msg(msg, '동그라미가 나타나면 눌러 보세요. 테두리 고리가 줄어들면 곧 사라집니다.');
      kick();
    };
    g.pause = () => {
      if (!g.running) return;
      g.running = false;
      overlay(stage, `멈췄습니다. 남은 시간 ${Math.ceil(S.left)}초 · 점수 ${S.score}`, '이어서 하기');
      draw();
    };
    g.step = dt => {
      S.left -= dt;
      S.pops = S.pops.filter(q => (q.t -= dt) > 0);
      if (S.dot) { S.dot.t -= dt; if (S.dot.t <= 0) { S.dot = null; S.miss++; S.gap = 0.25; } }
      else if ((S.gap -= dt) <= 0) spawn();
      if (S.left <= 0) { S.left = 0; S.dot = null; finish(); }
    };
    function finish() {
      g.running = false;
      const isBest = S.score > best; if (isBest) best = S.score;
      overlay(stage, `끝났습니다. 점수 <b>${S.score}</b>점 · 놓친 것 ${S.miss}개${isBest && S.score ? '<br>이번이 최고 점수입니다.' : `<br>최고 점수 ${best}점`}`, '다시 하기');
      VB.msg(msg, `20초가 지나 끝났습니다. 동그라미가 머무는 시간을 바꿔 다시 해 보세요. 숫자 하나로 쉬워지거나 어려워집니다. 최고 점수는 이 페이지를 닫으면 사라집니다. 남겨 두려면 장부가 필요합니다(12장).`, 'ok');
      draw();
    }
    function hit(e) {
      if (!g.running) return;
      const q = toLocal(cv, e);
      if (S.dot && Math.hypot(q.x - S.dot.x, q.y - S.dot.y) <= R + 8) {
        S.score++; S.pops.push({ x: S.dot.x, y: S.dot.y, t: 0.5 });
        S.dot = null; S.gap = 0.15;
      } else S.wrong++;
    }
    cv.addEventListener('pointerdown', e => { e.preventDefault(); hit(e); });
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#f7f6f2'; ctx.fillRect(0, 0, W, H);
      // 남은 시간 막대
      ctx.fillStyle = '#e6e3da'; rr(ctx, 16, 17, W - 200, 14, 7); ctx.fill();
      const r = S.left / TIME;
      ctx.fillStyle = r < 0.25 ? '#c43d3d' : '#d89a1c';
      if (r > 0) { rr(ctx, 16, 16, Math.max(14, (W - 200) * r), 14, 7); ctx.fill(); }
      const fs = hudPx(cv);
      ctx.fillStyle = '#1d2433'; ctx.font = `700 ${fs}px Pretendard Variable, sans-serif`; ctx.textBaseline = 'middle';
      ctx.textAlign = 'left'; ctx.fillText(`${Math.ceil(S.left)}초`, W - 176, 24);
      ctx.textAlign = 'right'; ctx.fillText(`점수 ${S.score}`, W - 12, 24);
      ctx.strokeStyle = '#e2e0d8'; ctx.beginPath(); ctx.moveTo(0, 46); ctx.lineTo(W, 46); ctx.stroke();
      if (S.dot) {
        const k = S.dot.t / S.dot.life;
        ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(S.dot.x, S.dot.y, R, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#d89a1c'; ctx.lineWidth = 5; ctx.beginPath();
        ctx.arc(S.dot.x, S.dot.y, R + 7, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke(); ctx.lineWidth = 1;
      }
      S.pops.forEach(q => {
        ctx.globalAlpha = q.t / 0.5; ctx.fillStyle = '#2b8a4a'; ctx.textAlign = 'center';
        ctx.font = '800 22px Pretendard Variable, sans-serif'; ctx.fillText('+1', q.x, q.y - 20 - (0.5 - q.t) * 40);
        ctx.strokeStyle = '#2b8a4a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(q.x, q.y, R + (0.5 - q.t) * 40, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1; ctx.lineWidth = 1;
      });
    }
    g.draw = draw; g.reset = reset;
    stay.addEventListener('input', () => { stayOut.textContent = (+stay.value).toFixed(1) + '초'; });
    g.resetAll = () => { stay.value = 1.1; stayOut.textContent = '1.1초'; best = 0; reset(); };
    reset();
    return g;
  })();

  /* ---------- 2. 발판 점프 ---------- */
  const plat = (() => {
    const p = panels[1], stage = VB.$(p, '.c20-stage'), cv = VB.$(stage, 'canvas'), ctx = setupCanvas(cv);
    const msg = VB.$(p, '.c20-msg'), grav = VB.$(p, '.c20-grav'), gravOut = VB.$(p, '.c20-grav-out'), focusTip = VB.$(stage, '.c20-focus');
    const G0 = 1800, JUMP = 640, SPEED = 230, MAXFALL = 900;
    const START = { x: 40, y: 302 };
    const plats = [
      [0, 330, 250, 30], [330, 330, 310, 30],
      [380, 268, 100, 14], [505, 200, 100, 14], [330, 138, 100, 14], [150, 80, 130, 14]
    ];
    const FLAG = { x: 186, y: 30, w: 30, h: 50 };
    const keys = { left: false, right: false, jump: false };
    let S;
    const g = { loop: true, running: false };
    function reset() {
      S = { x: START.x, y: START.y, w: 22, h: 28, vy: 0, ground: true, coyote: 0, buf: 0, t: 0, falls: 0, face: 1, won: false, maxUp: 0 };
      keys.left = keys.right = keys.jump = false;
      g.running = false;
      overlay(stage, '발판을 밟고 올라가 왼쪽 위 깃발에 닿아 보세요.', '시작');
      focusTip.hidden = true;
      VB.msg(msg, '[시작]을 누르고 깃발까지 가 보세요. 그다음 중력 세기를 바꿔 다시 해 보세요.');
      draw();
    }
    const hits = (a, b) => a.x < b[0] + b[2] && a.x + a.w > b[0] && a.y < b[1] + b[3] && a.y + a.h > b[1];
    function sub(dt) {
      const gv = G0 * +grav.value;
      const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
      if (dir) S.face = dir;
      // 가로 이동 후 겹치면 밀어내기
      S.x += dir * SPEED * dt;
      S.x = Math.max(0, Math.min(W - S.w, S.x));
      for (const b of plats) if (hits(S, b)) S.x = dir > 0 ? b[0] - S.w : b[0] + b[2];
      // 점프
      S.coyote = S.ground ? 0.08 : Math.max(0, S.coyote - dt);
      S.buf = Math.max(0, S.buf - dt);
      if (S.buf > 0 && S.coyote > 0) { S.vy = -JUMP; S.buf = 0; S.coyote = 0; S.ground = false; }
      // 세로 이동: 중력, 그다음 발판과 겹치면 위에 세우기
      S.vy = Math.min(MAXFALL, S.vy + gv * dt);
      S.y += S.vy * dt;
      S.ground = false;
      for (const b of plats) if (hits(S, b)) {
        if (S.vy > 0) { S.y = b[1] - S.h; S.vy = 0; S.ground = true; }
        else if (S.vy < 0) { S.y = b[1] + b[3]; S.vy = 0; }
      }
      if (S.y < 0) { S.y = 0; S.vy = 0; }
    }
    g.step = dt => {
      S.t += dt;
      const n = Math.ceil(dt / (1 / 240));
      for (let i = 0; i < n; i++) sub(dt / n);
      S.maxUp = Math.max(S.maxUp, 330 - (S.y + S.h));
      if (S.y > H + 40) {
        S.falls++;
        Object.assign(S, { x: START.x, y: START.y, vy: 0 });
        VB.msg(msg, `틈으로 떨어졌습니다(${S.falls}번째). 처음 자리에서 다시 시작합니다.`, 'warn');
      }
      if (hits(S, [FLAG.x, FLAG.y, FLAG.w, FLAG.h])) win();
    };
    function win() {
      g.running = false; S.won = true;
      keys.left = keys.right = keys.jump = false;
      const gtxt = +grav.value === 1 ? '보통' : (+grav.value < 1 ? '약하게' : '세게');
      overlay(stage, `깃발에 닿았습니다. 걸린 시간 <b>${S.t.toFixed(1)}초</b> · 떨어진 횟수 ${S.falls}번`, '다시 하기');
      VB.msg(msg, `성공했습니다. 중력을 ${gtxt} 둔 상태였습니다. ${+grav.value <= 1.3 ? '이번에는 중력을 1.8 이상으로 올려서 해 보세요. 점프가 낮아져 발판에 오르기 어려워집니다.' : '이번에는 중력을 0.5쯤으로 내려 보세요. 둥실둥실 떠다니는 느낌이 됩니다.'}`, 'ok');
      draw();
    }
    g.start = () => {
      if (S.won) reset();
      g.running = true; overlay(stage, null);
      stage.focus({ preventScroll: true });
      VB.msg(msg, '방향키로 움직이고 스페이스로 점프합니다. 휴대폰에서는 아래 화면 단추를 쓰세요.');
      kick();
    };
    g.pause = () => {
      if (!g.running) return;
      g.running = false;
      keys.left = keys.right = keys.jump = false;
      overlay(stage, '멈췄습니다.', '이어서 하기');
      draw();
    };
    function press(k, down) {
      if (k === 'jump') { if (down && !keys.jump) S.buf = 0.12; keys.jump = down; }
      else keys[k] = down;
    }
    const KEYMAP = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ' ': 'jump', ArrowUp: 'jump', w: 'jump', W: 'jump' };
    stage.addEventListener('keydown', e => {
      const k = KEYMAP[e.key]; if (!k) return;
      e.preventDefault();
      if (!g.running) { if (e.key === ' ' && !e.repeat && e.target === stage) g.start(); return; }
      if (!e.repeat) press(k, true);
    });
    stage.addEventListener('keyup', e => { const k = KEYMAP[e.key]; if (!k) return; e.preventDefault(); press(k, false); });
    stage.addEventListener('pointerdown', () => stage.focus({ preventScroll: true }));
    stage.addEventListener('focus', () => { focusTip.hidden = true; });
    stage.addEventListener('blur', () => {
      keys.left = keys.right = keys.jump = false;
      if (g.running) focusTip.hidden = false;
    });
    // 화면 단추: 누르고 있는 동안만 움직임. 포커스를 가져가지 않게 한다
    $$('.c20-k').forEach(b => {
      const k = b.dataset.k;
      const up = () => { b.classList.remove('on'); if (S) press(k, false); };
      b.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (!g.running) return;
        b.classList.add('on'); press(k, true);
        try { b.setPointerCapture(e.pointerId); } catch (_) {}
      });
      b.addEventListener('pointerup', up);
      b.addEventListener('pointercancel', up);
      b.addEventListener('lostpointercapture', up);
      b.addEventListener('contextmenu', e => e.preventDefault());
    });
    grav.addEventListener('input', () => {
      const v = +grav.value;
      gravOut.textContent = (v === 1 ? '보통 ' : v < 1 ? '약함 ' : '강함 ') + v.toFixed(1);
      const h = Math.round(JUMP * JUMP / (2 * G0 * v));
      VB.msg(msg, `중력 ${v.toFixed(1)}배: 점프 높이는 약 ${h}, 가장 높은 계단은 68입니다(게임 화면 높이 360 기준). ${h < 68 ? '<b>이 중력으로는 위로 올라갈 수 없습니다.</b> 규칙 숫자 하나가 게임을 바꿉니다.' : h > 160 ? '아주 높이 뜹니다. 떨어질 때도 천천히 내려옵니다.' : '올라갈 수 있습니다.'}`, h < 68 ? 'warn' : '');
      if (!g.running) draw();
    });
    function draw() {
      const v = +grav.value;
      ctx.clearRect(0, 0, W, H);
      const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#e7eef7'); sky.addColorStop(1, '#f7f6f2');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
      // 깃발
      ctx.fillStyle = '#4a5468'; ctx.fillRect(FLAG.x, FLAG.y, 4, FLAG.h);
      ctx.fillStyle = ACC; ctx.beginPath(); ctx.moveTo(FLAG.x + 4, FLAG.y); ctx.lineTo(FLAG.x + 34, FLAG.y + 10); ctx.lineTo(FLAG.x + 4, FLAG.y + 20); ctx.closePath(); ctx.fill();
      // 발판
      plats.forEach((b, i) => {
        ctx.fillStyle = i < 2 ? '#8a6f4e' : '#6b8f5e'; rr(ctx, b[0], b[1], b[2], b[3], 4); ctx.fill();
        ctx.fillStyle = i < 2 ? '#6b8f5e' : '#86ab78'; ctx.fillRect(b[0] + 2, b[1], b[2] - 4, 5);
      });
      // 캐릭터
      ctx.fillStyle = '#2f6fb0'; rr(ctx, S.x, S.y, S.w, S.h, 5); ctx.fill();
      const ex = S.face > 0 ? S.x + 12 : S.x + 5;
      ctx.fillStyle = '#fff'; ctx.fillRect(ex, S.y + 8, 5, 7);
      ctx.fillStyle = '#1d2433'; ctx.fillRect(ex + (S.face > 0 ? 2 : 0), S.y + 10, 3, 4);
      // 중력 표시
      const len = 18 + v * 22;
      ctx.strokeStyle = ACC; ctx.fillStyle = ACC; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(612, 60); ctx.lineTo(612, 60 + len); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(602, 56 + len); ctx.lineTo(612, 72 + len); ctx.lineTo(622, 56 + len); ctx.closePath(); ctx.fill();
      ctx.lineWidth = 1;
      const fs = hudPx(cv);
      ctx.font = `700 ${fs}px Pretendard Variable, sans-serif`; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText('중력', 628, 40 - fs / 2);
      // 시간
      ctx.fillStyle = '#1d2433'; ctx.textAlign = 'left';
      ctx.fillText(`${S.t.toFixed(1)}초 · 떨어짐 ${S.falls}`, 12, fs / 2 + 6);
    }
    g.draw = draw; g.reset = reset;
    g.resetAll = () => { grav.value = 1; gravOut.textContent = '보통 1.0'; reset(); };
    reset();
    return g;
  })();

  /* ---------- 3. 짝 맞추기 ---------- */
  const memo = (() => {
    const p = panels[2], grid = VB.$(p, '.c20-mem'), msg = VB.$(p, '.c20-msg');
    const firstEl = VB.$(p, '.c20-first'), triesEl = VB.$(p, '.c20-tries'), pairsEl = VB.$(p, '.c20-pairs');
    const KINDS = [
      ['빨간 동그라미', '#d0453a', '<circle cx="30" cy="30" r="17"/>'],
      ['파란 네모', '#2f6fb0', '<rect x="13" y="13" width="34" height="34" rx="4"/>'],
      ['초록 세모', '#2b8a4a', '<path d="M30 11 L50 47 L10 47 Z"/>'],
      ['노란 별', '#d89a1c', '<path d="M30 9 L35.6 23.3 L50.9 24.2 L39.1 34 L42.9 48.9 L30 40.6 L17.1 48.9 L20.9 34 L9.1 24.2 L24.4 23.3 Z"/>'],
      ['보라 마름모', '#7650aa', '<path d="M30 9 L50 30 L30 51 L10 30 Z"/>'],
      ['하늘색 고리', '#1aa0b8', '<circle cx="30" cy="30" r="15" fill="none" stroke-width="8"/>']
    ];
    let S, gen = 0;
    const g = { loop: false, running: false, pause() {} };
    function reset() {
      gen++;
      const deck = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5];
      for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
      S = { cards: deck.map(k => ({ k, st: 'down' })), first: null, tries: 0, pairs: 0, lock: false };
      grid.innerHTML = S.cards.map((c, i) => {
        const [name, col, shape] = KINDS[c.k];
        return `<button type="button" class="c20-cd" data-i="${i}" aria-label="카드 ${i + 1}, 뒷면"><span class="c20-cd-in"><span class="c20-cd-back"></span><span class="c20-cd-front"><svg viewBox="0 0 60 60" fill="${col}" stroke="${col}" aria-hidden="true">${shape}</svg></span></span></button>`;
      }).join('');
      render();
      VB.msg(msg, '카드를 두 장씩 뒤집어 같은 그림을 찾으세요. 카드는 키보드 <kbd>Tab</kbd>과 <kbd>Enter</kbd>로도 고를 수 있습니다.');
    }
    function render() {
      VB.$$(grid, '.c20-cd').forEach((b, i) => {
        const c = S.cards[i];
        b.dataset.st = c.st;
        b.setAttribute('aria-label', `카드 ${i + 1}, ${c.st === 'down' ? '뒷면' : KINDS[c.k][0] + (c.st === 'done' ? ', 짝 찾음' : '')}`);
      });
      firstEl.textContent = S.first == null ? '없음' : `${S.first + 1}번 카드 · ${KINDS[S.cards[S.first].k][0]}`;
      triesEl.textContent = S.tries + '번';
      pairsEl.textContent = S.pairs + ' / 6';
    }
    grid.addEventListener('click', async e => {
      const b = e.target.closest('.c20-cd'); if (!b || S.lock) return;
      const i = +b.dataset.i, c = S.cards[i];
      if (c.st !== 'down') return;
      c.st = 'up';
      if (S.first == null) { S.first = i; render(); VB.msg(msg, `${KINDS[c.k][0]}입니다. 게임이 이 카드를 기억해 둡니다. 같은 그림을 찾아 한 장 더 뒤집으세요.`); return; }
      const a = S.cards[S.first];
      S.tries++;
      if (a.k === c.k) {
        a.st = c.st = 'done'; S.first = null; S.pairs++;
        render();
        if (S.pairs === 6) VB.msg(msg, `모두 맞췄습니다. <b>${S.tries}번</b> 뒤집어 6쌍을 찾았습니다. 가장 적게 뒤집으면 6번입니다. [처음으로]를 누르면 카드를 새로 섞습니다.`, 'ok');
        else VB.msg(msg, `같은 그림이라 짝 찾음 상태로 바뀌었습니다. 이제 이 두 장은 다시 덮이지 않습니다.`, 'ok');
        return;
      }
      render();
      VB.msg(msg, `${KINDS[a.k][0]}, ${KINDS[c.k][0]}. 서로 다릅니다. 잠시 뒤 다시 뒷면 상태로 돌아갑니다. 위치를 기억해 두세요.`, 'warn');
      S.lock = true;
      const my = gen;
      await VB.wait(900);
      if (my !== gen) return;
      a.st = c.st = 'down'; S.first = null; S.lock = false;
      render();
    });
    g.reset = g.resetAll = reset;
    reset();
    return g;
  })();

  /* ---------- 4. 선택형 이야기 ---------- */
  const story = (() => {
    const p = panels[3], msg = VB.$(p, '.c20-msg');
    const tagEl = VB.$(p, '.c20-sc-tag'), titleEl = VB.$(p, '.c20-sc-title'), textEl = VB.$(p, '.c20-sc-text'), chEl = VB.$(p, '.c20-choices');
    const svg = VB.$(p, '.c20-tree svg'), endsEl = VB.$(p, '.c20-ends b');
    const SC = {
      start: { title: '발표 10분 전', x: 70, y: 140, label: '발표 10분 전',
        text: '오늘은 독서 모임 사람들에게 처음 만든 앱 "한 줄 서재"를 보여 주는 날입니다. 모임 장소인 카페에 일찍 도착해 노트북으로 앱 주소를 열었습니다. 그런데 화면이 하얗게 비어 있습니다.',
        ch: [['AI 조수에게 본 그대로 말한다', 'ask'], ['새로고침을 몇 번 더 눌러 본다', 'retry']] },
      ask: { title: 'AI에게 묻기', x: 232, y: 72, label: 'AI에게 묻기',
        text: '"앱 주소를 열었는데 하얀 화면만 나와. 어제 집에서는 잘 됐어." 하고 적었습니다. AI가 답합니다. "이 앱은 글 목록을 인터넷 너머 창고에서 받아 옵니다. 지금 인터넷에 연결되어 있는지 확인해 보세요." 노트북 구석을 보니 와이파이가 꺼져 있습니다. 카페 와이파이에 연결하자 화면이 나타납니다.',
        ch: [['휴대폰으로도 열어 본다', 'phone'], ['됐으니 발표 준비를 한다', 'go']] },
      retry: { title: '새로고침 다섯 번', x: 232, y: 212, label: '새로고침',
        text: '여러 번 눌러도 여전히 하얗습니다. 시계를 보니 5분 남았습니다. 휴대폰 사진첩에는 어제 찍어 둔 앱 화면 사진이 몇 장 있습니다.',
        ch: [['그래도 AI에게 물어본다', 'ask'], ['사진으로 발표한다', 'photo']] },
      phone: { title: '모두의 손에서', x: 398, y: 44, label: '모두의 손에서', end: true,
        text: '휴대폰으로 열어 보니 글자가 조금 작습니다. 발표 때 이 점을 먼저 말하고 회원들에게 주소를 알려 주었습니다. 모두 자기 휴대폰으로 오늘 읽은 책의 한 줄을 남겼고, 화면에 글이 하나씩 쌓였습니다.' },
      go: { title: '노트북 한 대로', x: 398, y: 132, label: '노트북 한 대로', end: true,
        text: '노트북 화면을 돌려 가며 앱을 보여 주었습니다. 한 회원이 휴대폰으로 열어 보더니 글자가 너무 작다고 했습니다. 집에 가서 AI에게 "휴대폰 화면에 맞게 해 줘"라고 부탁하기로 수첩에 적었습니다. 다음 모임에서 고친 앱을 보여 줄 생각입니다.' },
      photo: { title: '사진 몇 장으로', x: 398, y: 230, label: '사진 몇 장으로', end: true,
        text: '사진을 한 장씩 넘기며 앱을 설명했습니다. 회원들은 직접 눌러 보고 싶어 했습니다. 모임이 끝나고 AI에게 물어보니 와이파이가 꺼져 있던 것이 이유였습니다. 다음 모임에서 다시 보여 드리기로 약속했습니다.' }
    };
    const EDGES = [];
    Object.entries(SC).forEach(([id, s]) => (s.ch || []).forEach(([, to]) => EDGES.push([id, to])));
    let S;
    const seenEnds = new Set();
    const g = { loop: false, running: false, pause() {} };
    function go(id, from) {
      if (from) S.path.push([from, id]);
      S.at = id; S.visited.add(id); S.steps++;
      const s = SC[id];
      if (s.end) seenEnds.add(id);
      tagEl.textContent = s.end ? '결말' : `장면 ${S.steps}`;
      tagEl.classList.toggle('end', !!s.end);
      titleEl.textContent = s.title;
      textEl.textContent = s.text;
      chEl.innerHTML = s.end
        ? '<button type="button" class="btn primary" data-to="start">처음 장면으로</button>'
        : s.ch.map(([t, to]) => `<button type="button" class="btn c20-choice" data-to="${to}">${t}</button>`).join('');
      if (s.end) VB.msg(msg, `결말에 닿았습니다. ${S.steps}개의 장면을 지났습니다. ${seenEnds.size < 3 ? '처음 장면으로 돌아가 다른 선택지를 골라 보세요. 결말은 세 개입니다.' : '세 결말을 모두 보았습니다. 가지 그림에서 "AI에게 묻기" 장면은 두 길에서 모두 들어올 수 있습니다.'}`, 'ok');
      else if (from) VB.msg(msg, '선택에 따라 연결된 다음 장면으로 넘어왔습니다. 오른쪽 가지 그림에서 지나온 길을 확인해 보세요.');
      drawTree();
    }
    chEl.addEventListener('click', e => {
      const b = e.target.closest('button[data-to]'); if (!b) return;
      if (b.dataset.to === 'start' && SC[S.at].end) { start(); return; }
      go(b.dataset.to, S.at);
    });
    function start() {
      S = { at: null, visited: new Set(), path: [], steps: 0 };
      go('start');
      VB.msg(msg, '선택지를 골라 이야기를 진행하세요. 오른쪽 가지 그림에 지나온 길이 표시됩니다.');
    }
    function drawTree() {
      const NW = 134, NH = 44;
      const onPath = (a, b) => S.path.some(([x, y]) => x === a && y === b);
      const anchor = (a, b) => {
        const A = SC[a], B = SC[b];
        if (Math.abs(A.x - B.x) < 5) return [A.x, A.y + (B.y > A.y ? NH / 2 : -NH / 2), B.x, B.y + (B.y > A.y ? -NH / 2 : NH / 2)];
        return [A.x + NW / 2, A.y, B.x - NW / 2, B.y];
      };
      let h = '';
      EDGES.forEach(([a, b]) => {
        const [x1, y1, x2, y2] = anchor(a, b), on = onPath(a, b);
        const mx = (x1 + x2) / 2;
        const d = Math.abs(x1 - x2) < 5 ? `M${x1} ${y1} L${x2} ${y2}` : `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`;
        h += `<path d="${d}" fill="none" stroke="${on ? ACC : '#c9ccd3'}" stroke-width="${on ? 4 : 2.5}" ${on ? '' : 'stroke-dasharray="5 5"'}/>`;
      });
      Object.entries(SC).forEach(([id, s]) => {
        const v = S.visited.has(id), here = S.at === id, seen = seenEnds.has(id);
        const fill = here ? ACC : v ? '#f6e3ea' : '#fff';
        const stroke = v || here ? ACC : (s.end && seen ? '#2b8a4a' : '#c9ccd3');
        h += `<g><rect x="${s.x - NW / 2}" y="${s.y - NH / 2}" width="${NW}" height="${NH}" rx="${s.end ? 20 : 8}" fill="${fill}" stroke="${stroke}" stroke-width="${here ? 3 : 2}"/>`;
        h += `<text x="${s.x}" y="${s.y + 6}" font-size="16" font-weight="700" text-anchor="middle" fill="${here ? '#fff' : '#1d2433'}">${s.label}</text>`;
        if (s.end && seen) h += `<text x="${s.x + NW / 2 - 4}" y="${s.y - NH / 2 - 4}" font-size="15" text-anchor="end" fill="#2b8a4a" font-weight="700">본 결말</text>`;
        h += '</g>';
      });
      svg.innerHTML = h;
      endsEl.textContent = seenEnds.size;
    }
    g.reset = start;
    g.resetAll = () => { seenEnds.clear(); start(); };
    start();
    return g;
  })();

  const games = [react, plat, memo, story];

  /* 탭 */
  function setTab(i) {
    if (i === cur) return;
    const old = games[cur];
    if (old.loop && old.running) old.pause();
    cur = i;
    tabs.forEach(b => b.setAttribute('aria-selected', +b.dataset.g === i));
    panels.forEach(p => { p.hidden = +p.dataset.g !== i; });
    if (games[i].draw) games[i].draw();
  }
  tabs.forEach(b => b.addEventListener('click', () => setTab(+b.dataset.g)));
  $$('.c20-go').forEach(b => b.addEventListener('click', () => {
    const g = games[cur];
    if (!canRun()) return;
    g.start();
  }));

  /* 복사 */
  $$('.c20-copy').forEach(b => b.addEventListener('click', async () => {
    const text = VB.$(b.parentElement, '.c20-prompt').textContent.trim();
    let ok = false;
    try { await navigator.clipboard.writeText(text); ok = true; } catch (_) {
      const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { ok = document.execCommand('copy'); } catch (__) {}
      ta.remove();
    }
    b.textContent = ok ? '복사했습니다' : '복사하지 못했습니다';
    setTimeout(() => { b.textContent = '복사'; }, 1600);
  }));

  /* 처음으로: 네 게임 모두 처음 상태로 */
  $('.reset').addEventListener('click', () => {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    games.forEach(g => g.resetAll());
  });
});
