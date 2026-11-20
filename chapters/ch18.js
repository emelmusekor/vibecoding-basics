VB.ch('ch18', root => {
  const $ = s => VB.$(root, s), $$ = s => VB.$$(root, s);
  const active = () => root.classList.contains('cur') && !document.hidden;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  function setupCanvas(cv, w, h) {
    cv.width = w * dpr; cv.height = h * dpr;
    const c = cv.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    return c;
  }

  /* ───────── 체험 1: 공 튀기기 ───────── */
  const W1 = 640, H1 = 260, R1 = 16, SPEED = 240;
  const FPS = [1, 5, 15, 30, 60];
  const cv1 = $('.c18-cv1'), c1 = setupCanvas(cv1, W1, H1);
  const over1 = $('.c18-over1'), go1 = $('.c18-go1'), pause1 = $('.c18-pause1');
  const fpsIn = $('.c18-fps-in'), fpsOut = $('.c18-fps-out'), nodrawIn = $('.c18-nodraw');
  const ncEl = $('.c18-nc'), ndEl = $('.c18-nd'), posEl = $('.c18-pos'), lamp = $('.c18-lamp');
  const msg1 = $('.c18-msg1'), msg2 = $('.c18-msg2');
  let A, raf1 = 0;

  function draw1() {
    const c = c1;
    c.fillStyle = '#fbfaf7'; c.fillRect(0, 0, W1, H1);
    c.strokeStyle = '#ece8df'; c.lineWidth = 1;
    for (let x = 40; x < W1; x += 40) { c.beginPath(); c.moveTo(x + .5, 0); c.lineTo(x + .5, H1); c.stroke(); }
    for (let y = 40; y < H1; y += 40) { c.beginPath(); c.moveTo(0, y + .5); c.lineTo(W1, y + .5); c.stroke(); }
    c.fillStyle = '#2f6fb0';
    c.beginPath(); c.arc(A.x, A.y, R1, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(255,255,255,.55)';
    c.beginPath(); c.arc(A.x - 5, A.y - 5, 5, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#4a5468'; c.font = '600 14px "Pretendard Variable", "Malgun Gothic", sans-serif';
    c.fillText('그린 장 ' + A.nd, 12, 22);
  }
  function move1(sec) {
    A.x += A.vx * sec; A.y += A.vy * sec;
    // 벽에 닿으면 반사
    const lo = R1, hx = W1 - R1, hy = H1 - R1;
    for (let i = 0; i < 4; i++) {
      if (A.x < lo) { A.x = 2 * lo - A.x; A.vx = Math.abs(A.vx); }
      if (A.x > hx) { A.x = 2 * hx - A.x; A.vx = -Math.abs(A.vx); }
      if (A.y < lo) { A.y = 2 * lo - A.y; A.vy = Math.abs(A.vy); }
      if (A.y > hy) { A.y = 2 * hy - A.y; A.vy = -Math.abs(A.vy); }
    }
  }
  function readout1() {
    ncEl.textContent = A.nc.toLocaleString('ko-KR');
    ndEl.textContent = A.nd.toLocaleString('ko-KR');
    posEl.textContent = `x=${Math.round(A.x)}, y=${Math.round(A.y)}`;
  }
  function step1() {
    const fps = FPS[A.fi];
    // 시간 방식: 한 장 사이에 흐른 시간만큼 / 장 방식: 한 장마다 1/60초 만큼(60장일 때 기준)
    move1(A.mode === 'time' ? 1 / fps : 1 / 60);
    A.nc++;
    if (!A.nodraw) {
      A.nd++; draw1();
      lamp.classList.remove('on'); void lamp.offsetWidth; lamp.classList.add('on');
    }
    readout1();
  }
  function loop1(t) {
    if (!A.run || !active()) { raf1 = 0; return; }
    const dt = Math.min(1000, t - A.last); A.last = t;
    A.acc += dt;
    const iv = 1000 / FPS[A.fi];
    if (A.acc >= iv - 1) {
      A.acc = Math.min(A.acc - iv, iv);
      if (A.acc < 0) A.acc = 0;
      step1();
    }
    raf1 = requestAnimationFrame(loop1);
  }
  function kick1() {
    if (A.run && active() && !raf1) { A.last = performance.now(); raf1 = requestAnimationFrame(loop1); }
  }
  function fpsText() {
    const f = FPS[A.fi];
    const t = {
      60: '1초에 60장입니다. 공이 부드럽게 움직입니다.',
      30: '1초에 30장입니다. 대부분 사람 눈에는 여전히 자연스럽게 보입니다.',
      15: '1초에 15장입니다. 조금씩 끊겨 보이기 시작합니다.',
      5: '1초에 5장입니다. 공이 뚝뚝 건너뜁니다. 플립북을 천천히 넘길 때와 같습니다.',
      1: '1초에 1장입니다. 공이 순간이동하듯 자리를 옮깁니다. 그사이에도 공은 계속 움직였지만 그 모습은 그려지지 않았습니다.'
    }[f];
    const slow = A.mode === 'frame' && f < 60 ? ` 공이 느려지기도 했습니다. 지금은 한 장마다 같은 거리만큼 옮기는 방식이라 장 수가 줄면 1초에 가는 거리도 줄어듭니다. 지금 빠르기는 60장일 때의 약 ${Math.round(f / 60 * 100)}%입니다.` : '';
    return t + slow;
  }
  fpsIn.addEventListener('input', () => {
    A.fi = +fpsIn.value; fpsOut.textContent = FPS[A.fi] + '장';
    A.acc = 0;
    if (!A.started) return;
    VB.msg(msg1, fpsText(), FPS[A.fi] <= 5 ? 'warn' : '');
  });
  nodrawIn.addEventListener('change', () => {
    A.nodraw = nodrawIn.checked;
    if (!A.started) { VB.msg(msg1, '먼저 [시작]을 눌러 보세요.'); return; }
    if (A.nodraw) VB.msg(msg1, '계산한 횟수와 공 위치 숫자는 계속 바뀌는데 그림판은 멈춰 있습니다. 공은 계산 속에서만 움직이고 있습니다. 13장에서 본 것처럼 화면은 다시 그려야 바뀝니다.', 'warn');
    else VB.msg(msg1, '다시 그리기 시작하자 공이 계산해 둔 자리로 한 번에 옮겨 갔습니다. 그리지 않는 동안에도 계산은 계속되고 있었습니다.', 'ok');
  });
  go1.addEventListener('click', () => {
    A.started = true; A.run = true; over1.hidden = true;
    pause1.textContent = '멈춤'; pause1.disabled = false;
    VB.msg(msg1, '공이 움직입니다. 그림판은 1초에 60번 지워지고 다시 그려지고 있습니다. 오른쪽 위 작은 불이 한 장 그릴 때마다 깜빡입니다. 이제 막대를 왼쪽으로 옮겨 보세요.');
    kick1();
  });
  pause1.addEventListener('click', () => {
    if (!A.started) return;
    A.run = !A.run;
    pause1.textContent = A.run ? '멈춤' : '이어서';
    if (A.run) kick1();
    else VB.msg(msg1, '루프를 멈췄습니다. 계산도 그리기도 일어나지 않아 숫자와 그림 모두 그대로입니다.');
  });
  function setMode(m) {
    A.mode = m;
    $$('.c18-modes button').forEach(b => b.setAttribute('aria-pressed', b.dataset.m === m));
    if (m === 'frame') VB.msg(msg2, '[한 장마다 같은 거리만큼] 방식입니다. 1초에 그리는 장 수를 15장이나 5장으로 낮춰 보세요. 끊길 뿐 아니라 공이 눈에 띄게 느려집니다. 느린 기기에서 캐릭터가 느려지는 까닭이 이것입니다.', 'warn');
    else VB.msg(msg2, '[흐른 시간만큼] 방식입니다. 장 수를 낮추면 끊겨 보이기는 해도 공이 1초에 가는 거리는 같습니다. 기기마다 속도를 같게 만드는 방법입니다.', 'ok');
    if (A.started && FPS[A.fi] < 60) VB.msg(msg1, fpsText(), FPS[A.fi] <= 5 ? 'warn' : '');
  }
  $$('.c18-modes button').forEach(b => b.addEventListener('click', () => setMode(b.dataset.m)));

  function reset1() {
    A = { run: false, started: false, fi: 4, nodraw: false, mode: 'time', x: 120, y: 80, vx: SPEED, vy: SPEED * 0.7, nc: 0, nd: 0, acc: 0, last: 0 };
    fpsIn.value = 4; fpsOut.textContent = '60장'; nodrawIn.checked = false;
    over1.hidden = false; pause1.textContent = '멈춤'; pause1.disabled = true;
    draw1(); readout1();
    setMode('time');
    VB.msg(msg2, '지금은 [흐른 시간만큼] 방식입니다. 위 체험을 해 본 뒤 [한 장마다 같은 거리만큼]을 눌러 비교해 보세요.');
    VB.msg(msg1, '[시작]을 눌러 보세요.');
  }
  $('.c18-lab1 .reset').addEventListener('click', reset1);
  reset1();

  /* ───────── 체험 2: 루프의 세 단계 ───────── */
  const W2 = 420, H2 = 280, R2 = 16, SP2 = 170, STAR = 11;
  const cv2 = $('.c18-cv2'), c2 = setupCanvas(cv2, W2, H2);
  const over2 = $('.c18-over2'), go2 = $('.c18-go2');
  const logEl = $('.c18-log'), msg3 = $('.c18-msg3');
  const stEls = $$('.c18-st'), vIn = $('.c18-v-in'), vCalc = $('.c18-v-calc'), vDraw = $('.c18-v-draw');
  const cells = {}; $$('.c18-state tr').forEach(tr => { cells[tr.dataset.k] = tr.querySelector('td'); });
  const ARROW = { up: '↑', down: '↓', left: '←', right: '→' };
  const KEYMAP = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right' };
  const SLOW_IV = 500, PH = [0, 170, 340];
  let G, raf2 = 0;
  const held = new Set(), tapped = new Set();

  function newStar() {
    for (let i = 0; i < 40; i++) {
      const s = { x: 30 + Math.random() * (W2 - 60), y: 40 + Math.random() * (H2 - 70) };
      if (Math.hypot(s.x - G.x, s.y - G.y) > 70 && G.stars.every(o => Math.hypot(s.x - o.x, s.y - o.y) > 50)) return s;
    }
    return { x: 40 + Math.random() * (W2 - 80), y: 50 + Math.random() * (H2 - 90) };
  }
  function starPath(c, x, y, r) {
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
      c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    c.closePath();
  }
  function draw2() {
    const c = c2;
    c.fillStyle = '#f6f8fb'; c.fillRect(0, 0, W2, H2);
    c.strokeStyle = '#e6eaf1'; c.lineWidth = 1;
    for (let x = 30; x < W2; x += 30) { c.beginPath(); c.moveTo(x + .5, 0); c.lineTo(x + .5, H2); c.stroke(); }
    for (let y = 30; y < H2; y += 30) { c.beginPath(); c.moveTo(0, y + .5); c.lineTo(W2, y + .5); c.stroke(); }
    G.stars.forEach(s => { c.fillStyle = '#f2b632'; starPath(c, s.x, s.y, STAR); c.fill(); c.strokeStyle = '#c98f12'; c.lineWidth = 1.5; c.stroke(); });
    // 주인공: 분홍 동그라미
    c.fillStyle = '#b8406a';
    c.beginPath(); c.arc(G.x, G.y, R2, 0, Math.PI * 2); c.fill();
    const ex = G.face === 'left' ? -4 : G.face === 'right' ? 4 : 0, ey = G.face === 'up' ? -3 : G.face === 'down' ? 3 : 0;
    c.fillStyle = '#fff';
    c.beginPath(); c.arc(G.x - 6 + ex, G.y - 3 + ey, 4.2, 0, Math.PI * 2); c.arc(G.x + 6 + ex, G.y - 3 + ey, 4.2, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#1d2433';
    c.beginPath(); c.arc(G.x - 6 + ex * 1.4, G.y - 3 + ey * 1.3, 2, 0, Math.PI * 2); c.arc(G.x + 6 + ex * 1.4, G.y - 3 + ey * 1.3, 2, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(255,255,255,.9)'; c.fillRect(8, 8, 92, 26);
    c.fillStyle = '#1d2433'; c.font = '700 15px "Pretendard Variable", "Malgun Gothic", sans-serif';
    c.fillText('점수 ' + G.score, 16, 27);
  }
  function setCell(k, v) {
    const td = cells[k];
    if (td.textContent === String(v)) return;
    td.textContent = v;
    if (G.mode === 'slow' || k === 'score') { td.classList.remove('flash'); void td.offsetWidth; td.classList.add('flash'); }
  }
  function showState() {
    setCell('x', Math.round(G.x)); setCell('y', Math.round(G.y));
    setCell('score', G.score); setCell('frame', G.frame);
  }
  function lampOn(p) { stEls.forEach((e, i) => e.classList.toggle('on', i === p)); }

  // 1 입력
  function phaseInput() {
    const ks = new Set([...held, ...tapped]); tapped.clear();
    G.inp = ['up', 'down', 'left', 'right'].filter(k => ks.has(k));
    G.cur = { n: G.frame + 1, inp: G.inp.length ? G.inp.map(k => ARROW[k]).join(' ') : '없음' };
    vIn.textContent = G.cur.inp;
    lampOn(0);
  }
  // 2 계산
  function phaseCalc(sec) {
    let dx = 0, dy = 0;
    G.inp.forEach(k => { if (k === 'left') dx--; if (k === 'right') dx++; if (k === 'up') dy--; if (k === 'down') dy++; });
    if (dx && dy) { dx *= Math.SQRT1_2; dy *= Math.SQRT1_2; }
    if (dx < 0) G.face = 'left'; else if (dx > 0) G.face = 'right'; else if (dy < 0) G.face = 'up'; else if (dy > 0) G.face = 'down';
    const nx = G.x + dx * SP2 * sec, ny = G.y + dy * SP2 * sec;
    const cx = Math.max(R2, Math.min(W2 - R2, nx)), cy = Math.max(R2, Math.min(H2 - R2, ny));
    const wall = (dx || dy) && (cx !== nx || cy !== ny);
    G.x = cx; G.y = cy;
    let note = '';
    G.stars = G.stars.map(s => {
      if (Math.hypot(s.x - G.x, s.y - G.y) < R2 + STAR - 2) { G.score++; note = '별에 닿음, 점수 +1'; return null; }
      return s;
    }).filter(Boolean);
    while (G.stars.length < 3) G.stars.push(newStar());
    if (!note && wall) note = '벽에 막힘';
    G.cur.calc = `x=${Math.round(G.x)}, y=${Math.round(G.y)}` + (note ? ' · ' + note : '');
    vCalc.textContent = G.cur.calc;
    lampOn(1);
    if (note.startsWith('별')) {
      G.got++;
      if (G.got === 1) VB.msg(msg3, G.mode === 'slow'
        ? '별을 먹었습니다. <b>2 계산</b> 단계에서 동그라미와 별이 겹쳤는지 확인하고 상태 표의 점수를 1 올렸습니다. 그림판의 점수 글자는 그다음 <b>3 그리기</b> 단계에서야 바뀝니다. 잘 보면 표가 먼저, 그림이 나중에 바뀝니다.'
        : '별을 먹었습니다. 계산 단계에서 동그라미와 별이 겹쳤는지 확인하고 점수를 올렸습니다. 이렇게 두 그림이 겹쳤는지 확인하는 일을 <b>충돌 판정</b>이라고 합니다.', 'ok');
    }
  }
  // 3 그리기
  function phaseDraw() {
    G.frame++;
    draw2();
    vDraw.textContent = G.frame + '번째 장 완성';
    lampOn(2);
    showState();
    const li = document.createElement('li');
    li.innerHTML = `<span class="c18-n">${G.frame}</span><i class="a">입력 ${G.cur.inp}</i><i class="b">계산 ${G.cur.calc}</i><i class="c">그리기</i>`;
    logEl.prepend(li);
    while (logEl.children.length > 6) logEl.lastChild.remove();
  }

  function loop2(t) {
    if (!G.run || !active()) { raf2 = 0; return; }
    const dt = Math.min(250, t - G.last); G.last = t;
    if (G.mode === 'fast') {
      G.acc += dt;
      if (G.acc >= 1000 / 60 - 1) {
        G.acc = Math.min(G.acc - 1000 / 60, 1000 / 60); if (G.acc < 0) G.acc = 0;
        phaseInput(); phaseCalc(1 / 60); phaseDraw();
      }
    } else {
      G.ph += dt;
      if (G.stage === 0 && G.ph >= PH[0]) { phaseInput(); G.stage = 1; }
      if (G.stage === 1 && G.ph >= PH[1]) { phaseCalc(SLOW_IV / 1000); G.stage = 2; }
      if (G.stage === 2 && G.ph >= PH[2]) { phaseDraw(); G.stage = 3; }
      if (G.ph >= SLOW_IV) { G.ph -= SLOW_IV; G.stage = 0; }
    }
    raf2 = requestAnimationFrame(loop2);
  }
  function kick2() {
    if (G.run && active() && !raf2) { G.last = performance.now(); raf2 = requestAnimationFrame(loop2); }
  }
  function start2() {
    if (!G.run) {
      G.run = true; over2.hidden = true;
      VB.msg(msg3, G.mode === 'slow'
        ? '루프가 돌기 시작했습니다. 지금은 1초에 2장만 그립니다. 오른쪽의 <b>1 입력 → 2 계산 → 3 그리기</b>가 차례로 켜지는 것을 보며 방향키를 눌러 보세요. 키를 누르고 있어도 동그라미는 3번이 켜질 때만 옮겨진 모습으로 나타납니다.'
        : '루프가 돌기 시작했습니다. 방향키나 화면 단추로 움직여 보세요.');
      kick2();
    }
    cv2.focus({ preventScroll: true });
  }
  function setSpeed(s) {
    G.mode = s; G.ph = 0; G.stage = 0; G.acc = 0;
    root.querySelector('.c18-g2').classList.toggle('fast', s === 'fast');
    $$('.c18-speed button').forEach(b => b.setAttribute('aria-pressed', b.dataset.s === s));
  }
  $$('.c18-speed button').forEach(b => b.addEventListener('click', () => {
    if (G.mode === b.dataset.s) return;
    setSpeed(b.dataset.s);
    if (b.dataset.s === 'fast') VB.msg(msg3, '1초에 60장입니다. 세 단계가 너무 빨리 지나가서 셋 다 켜져 있는 것처럼 보이고, 기록은 눈으로 따라갈 수 없을 만큼 빠르게 쌓입니다. 실제 게임은 늘 이 속도로 돌고 있습니다.');
    else VB.msg(msg3, '1초에 2장입니다. 입력, 계산, 그리기가 차례로 켜집니다. 동그라미가 한 번에 크게 건너뛰는 것은 그리는 장 수가 적기 때문입니다.');
    if (G.run) cv2.focus({ preventScroll: true });
  }));
  go2.addEventListener('click', start2);
  cv2.addEventListener('pointerdown', () => { if (!G.run) start2(); });
  cv2.addEventListener('keydown', e => {
    const k = KEYMAP[e.key];
    if (k || e.key === ' ') e.preventDefault();
    if (!k) return;
    if (!G.run) start2();
    held.add(k); tapped.add(k);
  });
  cv2.addEventListener('keyup', e => { const k = KEYMAP[e.key]; if (k) held.delete(k); });
  cv2.addEventListener('blur', () => held.clear());
  $$('.c18-pad button').forEach(b => {
    const k = b.dataset.k;
    const up = () => { held.delete(k); b.classList.remove('down'); };
    b.addEventListener('pointerdown', e => {
      e.preventDefault();
      if (!G.run) start2();
      held.add(k); tapped.add(k); b.classList.add('down');
      try { b.setPointerCapture(e.pointerId); } catch (err) {}
    });
    b.addEventListener('pointerup', up);
    b.addEventListener('pointercancel', up);
    b.addEventListener('lostpointercapture', up);
    b.addEventListener('contextmenu', e => e.preventDefault());
  });
  $('.c18-f5').addEventListener('click', () => {
    const had = G.score;
    G.x = W2 / 2; G.y = H2 / 2; G.score = 0; G.frame = 0; G.face = 'down';
    G.stars = []; while (G.stars.length < 3) G.stars.push(newStar());
    logEl.innerHTML = ''; draw2(); showState();
    VB.msg(msg3, had
      ? `점수 ${had}점이 0점이 되었습니다. 점수와 위치 같은 상태는 책상 위(브라우저가 일하는 공간)에만 있었기 때문입니다. 새로고침하면 책상이 치워지고 게임은 처음부터 다시 시작합니다. 남기려면 어딘가에 적어 두어야 합니다(12장).`
      : '상태가 처음으로 돌아갔습니다. 별을 몇 개 모은 뒤 다시 눌러 보세요.', had ? 'bad' : '');
  });

  function reset2() {
    G = { run: false, mode: 'slow', x: W2 / 2, y: H2 / 2, face: 'down', score: 0, frame: 0, got: 0, stars: [], inp: [], cur: null, last: 0, acc: 0, ph: 0, stage: 0 };
    held.clear(); tapped.clear();
    while (G.stars.length < 3) G.stars.push(newStar());
    setSpeed('slow');
    logEl.innerHTML = '';
    vIn.textContent = '-'; vCalc.textContent = '-'; vDraw.textContent = '-';
    lampOn(-1);
    over2.hidden = false;
    draw2(); showState();
    VB.msg(msg3, '게임 화면의 [눌러서 시작]을 누르세요.');
  }
  $('.c18-lab2 .reset').addEventListener('click', reset2);
  reset2();

  /* 다른 장에 갔다 오거나 창을 다시 보면 이어서 */
  function resume() { kick1(); kick2(); }
  window.addEventListener('hashchange', () => setTimeout(resume, 0));
  document.addEventListener('visibilitychange', resume);
});
