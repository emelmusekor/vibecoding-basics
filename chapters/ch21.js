VB.ch('ch21', root => {
  const DPR = () => Math.min(2, window.devicePixelRatio || 1);
  const isCur = () => root.classList.contains('cur') && !document.hidden;

  /* ---------------- 체험 1: 2D와 3D ---------------- */
  const lab1 = VB.$(root, '.c21-lab1');
  const cv = VB.$(lab1, '.c21-view');
  const ctx = cv.getContext('2d');
  const yawIn = VB.$(lab1, '.c21-yaw'), pitchIn = VB.$(lab1, '.c21-pitch'), sunIn = VB.$(lab1, '.c21-sun');
  const yawOut = VB.$(lab1, '.c21-yaw-out'), pitchOut = VB.$(lab1, '.c21-pitch-out'), sunOut = VB.$(lab1, '.c21-sun-out');
  const wireIn = VB.$(lab1, '.c21-wire');
  const stat = VB.$(lab1, '.c21-stat');
  const msg1 = VB.$(lab1, '.c21-msg1');
  const viewBtns = VB.$$(lab1, '.c21-modes button');
  let view = '2d';

  const v = (x, y, z) => ({ x, y, z });
  const sub = (a, b) => v(a.x - b.x, a.y - b.y, a.z - b.z);
  const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
  const cross = (a, b) => v(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
  const norm = a => { const l = Math.hypot(a.x, a.y, a.z) || 1; return v(a.x / l, a.y / l, a.z / l); };
  const avg = ps => v(ps.reduce((s, p) => s + p.x, 0) / ps.length, ps.reduce((s, p) => s + p.y, 0) / ps.length, ps.reduce((s, p) => s + p.z, 0) / ps.length);

  // 면 하나: 점들, 색, 바깥쪽을 향하는 방향
  function face(pts, col, center) {
    let n = norm(cross(sub(pts[1], pts[0]), sub(pts[2], pts[0])));
    if (dot(n, sub(avg(pts), center)) < 0) n = v(-n.x, -n.y, -n.z);
    return { pts, col, n };
  }
  function box(x0, x1, y0, y1, z0, z1, col) {
    const c = v((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    const P = (x, y, z) => v(x, y, z);
    return [
      face([P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)], col, c),
      face([P(x0, y0, z1), P(x1, y0, z1), P(x1, y1, z1), P(x0, y1, z1)], col, c),
      face([P(x0, y0, z0), P(x1, y0, z0), P(x1, y1, z0), P(x0, y1, z0)], col, c),
      face([P(x0, y0, z0), P(x0, y0, z1), P(x0, y1, z1), P(x0, y1, z0)], col, c),
      face([P(x1, y0, z0), P(x1, y0, z1), P(x1, y1, z1), P(x1, y1, z0)], col, c)
    ];
  }
  // 장면: 집, 지붕, 문, 나무, 사람
  const H = { x0: -4.2, x1: -0.6, z0: -3.4, z1: -0.8, h: 2.2, top: 3.7 };
  function buildScene() {
    const objs = [];
    const zm = (H.z0 + H.z1) / 2, o = 0.3;
    const houseC = v((H.x0 + H.x1) / 2, 1.6, zm);
    const roofC = v(houseC.x, H.h + 0.5, zm);
    const house = box(H.x0, H.x1, 0, H.h, H.z0, H.z1, '#e9c79a').filter(f => f.n.y < 0.5);
    const roof = [
      face([v(H.x0 - o, H.h - .15, H.z1 + o), v(H.x1 + o, H.h - .15, H.z1 + o), v(H.x1 + o, H.top, zm), v(H.x0 - o, H.top, zm)], '#c2692a', roofC),
      face([v(H.x0 - o, H.h - .15, H.z0 - o), v(H.x1 + o, H.h - .15, H.z0 - o), v(H.x1 + o, H.top, zm), v(H.x0 - o, H.top, zm)], '#c2692a', roofC),
      face([v(H.x0, H.h, H.z0), v(H.x0, H.h, H.z1), v(H.x0, H.top - .1, zm)], '#e9c79a', roofC),
      face([v(H.x1, H.h, H.z0), v(H.x1, H.h, H.z1), v(H.x1, H.top - .1, zm)], '#e9c79a', roofC)
    ];
    const door = face([v(-2.0, 0, H.z1 + .02), v(-1.2, 0, H.z1 + .02), v(-1.2, 1.4, H.z1 + .02), v(-2.0, 1.4, H.z1 + .02)], '#7d5a35', v(-1.6, .7, H.z1 - 1));
    const win = face([v(-3.7, 1.0, H.z1 + .02), v(-2.7, 1.0, H.z1 + .02), v(-2.7, 1.8, H.z1 + .02), v(-3.7, 1.8, H.z1 + .02)], '#9cc7ec', v(-3.2, 1.4, H.z1 - 1));
    objs.push({ name: '집', faces: house.concat(roof), decal: [door, win], shadowPts: [v(H.x0, H.h, H.z0), v(H.x1, H.h, H.z0), v(H.x0, H.h, H.z1), v(H.x1, H.h, H.z1), v(H.x0, H.top, zm), v(H.x1, H.top, zm), v(H.x0, 0, H.z0), v(H.x1, 0, H.z0), v(H.x0, 0, H.z1), v(H.x1, 0, H.z1)] });

    // 나무
    const tx = 2.8, tz = -1.6;
    const trunk = box(tx - .25, tx + .25, 0, 1.3, tz - .25, tz + .25, '#7d5a35').filter(f => f.n.y < 0.5);
    const cC = v(tx, 2.2, tz), r = 1.2, yb = 1.1, apex = v(tx, 4.2, tz);
    const b = [v(tx - r, yb, tz - r), v(tx + r, yb, tz - r), v(tx + r, yb, tz + r), v(tx - r, yb, tz + r)];
    const crown = [0, 1, 2, 3].map(i => face([b[i], b[(i + 1) % 4], apex], '#5fae64', cC));
    crown.push(face([b[0], b[1], b[2], b[3]], '#4a944f', v(tx, 3, tz)));
    objs.push({ name: '나무', faces: trunk.concat(crown), shadowPts: b.concat([apex, v(tx - .25, 0, tz - .25), v(tx + .25, 0, tz + .25)]) });

    // 사람
    const px = 0.6, pz = 2.0;
    const body = box(px - .35, px + .35, 0, 1.1, pz - .22, pz + .22, '#2f6fb0');
    const head = box(px - .28, px + .28, 1.15, 1.7, pz - .28, pz + .28, '#f2c9a0');
    objs.push({ name: '사람', faces: body.concat(head), shadowPts: [v(px - .35, 1.7, pz - .28), v(px + .35, 1.7, pz - .28), v(px - .35, 1.7, pz + .28), v(px + .35, 1.7, pz + .28), v(px - .35, 0, pz - .22), v(px + .35, 0, pz + .22)] });
    return objs;
  }
  const scene = buildScene();
  const GROUND = 6.5;
  const pathQuad = [v(-1.6, 0, H.z1), v(-1.6, 0, GROUND), v(-.9, 0, GROUND), v(-.9, 0, H.z1)].map(p => p);

  function shade(hex, k) {
    const n = parseInt(hex.slice(1), 16);
    const f = c => Math.max(0, Math.min(255, Math.round(c * k)));
    return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
  }
  function hull(pts) {
    const p = pts.slice().sort((a, b) => a.x - b.x || a.y - b.y);
    const cr = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
    const lo = [], up = [];
    for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  }

  let W1 = 0, H1 = 0;
  function size1() {
    const w = cv.parentElement.clientWidth;
    if (!w) return false;
    const h = Math.round(Math.max(240, Math.min(380, w * 0.6)));
    if (w !== W1 || h !== H1) {
      W1 = w; H1 = h;
      cv.width = w * DPR(); cv.height = h * DPR(); cv.style.height = h + 'px';
    }
    ctx.setTransform(DPR(), 0, 0, DPR(), 0, 0);
    return true;
  }

  function poly(pts, fill, stroke, lw) {
    ctx.beginPath();
    pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); }
  }

  function draw2d() {
    const W = W1, Hh = H1;
    ctx.fillStyle = '#f4f1ea'; ctx.fillRect(0, 0, W, Hh);
    const s = Math.min(W, Hh) / (GROUND * 2 + 1.2);
    const X = x => W / 2 + x * s, Y = z => Hh / 2 + z * s;
    const R = (x0, z0, x1, z1, fill, stroke) => poly([{ x: X(x0), y: Y(z0) }, { x: X(x1), y: Y(z0) }, { x: X(x1), y: Y(z1) }, { x: X(x0), y: Y(z1) }], fill, stroke, 2);
    R(-GROUND, -GROUND, GROUND, GROUND, '#a9d39b', '#7fb46f');
    R(-1.6, H.z1, -.9, GROUND, '#e6d9bf');
    const zm = (H.z0 + H.z1) / 2, o = .3;
    R(H.x0 - o, H.z0 - o, H.x1 + o, zm, '#a8551f', '#7d3d15');
    R(H.x0 - o, zm, H.x1 + o, H.z1 + o, '#c2692a', '#7d3d15');
    ctx.beginPath(); ctx.arc(X(2.8), Y(-1.6), 1.2 * s, 0, Math.PI * 2); ctx.fillStyle = '#5fae64'; ctx.fill(); ctx.strokeStyle = '#3f8a45'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.arc(X(0.6), Y(2.0), .36 * s, 0, Math.PI * 2); ctx.fillStyle = '#2f6fb0'; ctx.fill();
    ctx.beginPath(); ctx.arc(X(0.6), Y(2.0), .2 * s, 0, Math.PI * 2); ctx.fillStyle = '#f2c9a0'; ctx.fill();
    ctx.font = '600 14px Pretendard, "Malgun Gothic", sans-serif'; ctx.fillStyle = '#1d2433'; ctx.textAlign = 'center';
    ctx.fillText('집', X(-2.4), Y(H.z0 - .7));
    ctx.fillText('나무', X(2.8), Y(-1.6 + 1.2) + 18);
    ctx.fillText('사람', X(0.6), Y(2.0) + .36 * s + 16);
    ctx.fillStyle = '#8a93a6'; ctx.textAlign = 'left'; ctx.font = '13px Pretendard, "Malgun Gothic", sans-serif';
    ctx.fillText('위에서 내려다본 그림', 10, 20);
    stat.innerHTML = '그린 도형 <b>8개</b> · 평면 그림 한 장이라 돌릴 카메라가 없습니다.';
  }

  function draw3d() {
    const W = W1, Hh = H1;
    const yaw = +yawIn.value * Math.PI / 180, pitch = +pitchIn.value * Math.PI / 180;
    const sun = +sunIn.value * Math.PI / 180, el = 50 * Math.PI / 180;
    const L = v(Math.cos(el) * Math.sin(sun), Math.sin(el), Math.cos(el) * Math.cos(sun));
    const T = v(0, 1, 0), D = 15;
    const cam = v(T.x + D * Math.cos(pitch) * Math.sin(yaw), T.y + D * Math.sin(pitch), T.z + D * Math.cos(pitch) * Math.cos(yaw));
    const f = norm(sub(T, cam));
    const r = norm(cross(f, v(0, 1, 0)));
    const u = cross(r, f);
    const F = Math.min(W, Hh * 1.5) * 1.15;
    const proj = p => { const d = sub(p, cam); const z = dot(d, f); return { x: W / 2 + F * dot(d, r) / z, y: Hh * 0.56 - F * dot(d, u) / z, z }; };
    const wire = wireIn.checked;

    // 하늘
    const g = ctx.createLinearGradient(0, 0, 0, Hh);
    g.addColorStop(0, '#dbe9f6'); g.addColorStop(1, '#f4f1ea');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, Hh);

    // 바닥
    const G = GROUND;
    const gq = [v(-G, 0, -G), v(G, 0, -G), v(G, 0, G), v(-G, 0, G)].map(proj);
    poly(gq, wire ? null : shade('#a9d39b', 0.75 + 0.25 * L.y), wire ? '#7fb46f' : '#7fb46f', 1.5);
    if (!wire) poly(pathQuad.map(proj), '#e6d9bf');
    ctx.strokeStyle = 'rgba(60,110,60,.18)'; ctx.lineWidth = 1;
    for (let i = -G + 1; i < G; i++) {
      const a = proj(v(i, 0, -G)), b = proj(v(i, 0, G)), c = proj(v(-G, 0, i)), d = proj(v(G, 0, i));
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.moveTo(c.x, c.y); ctx.lineTo(d.x, d.y); ctx.stroke();
    }
    // 그림자
    if (!wire) {
      ctx.fillStyle = 'rgba(30,40,30,.2)';
      scene.forEach(o => {
        const sp = o.shadowPts.map(p => { const t = p.y / L.y; return proj(v(p.x - L.x * t, 0, p.z - L.z * t)); });
        poly(hull(sp));
      });
    }

    // 면 모으기
    let all = [], pts = 0;
    scene.forEach(o => {
      o.faces.forEach(fc => all.push(fc));
      (o.decal || []).forEach(fc => all.push(Object.assign({ decal: true }, fc)));
    });
    pts = all.reduce((s, fc) => s + fc.pts.length, 0);
    const items = all.map(fc => {
      const c = avg(fc.pts);
      const vis = dot(fc.n, sub(cam, c)) > 0;
      const sp = fc.pts.map(proj);
      const depth = sp.reduce((s, p) => s + p.z, 0) / sp.length - (fc.decal ? 0.05 : 0);
      return { fc, vis, sp, depth };
    });
    items.sort((a, b) => b.depth - a.depth);
    let shown = 0;
    items.forEach(it => {
      if (wire) { poly(it.sp, null, it.vis ? '#1d2433' : 'rgba(29,36,51,.28)', it.vis ? 1.4 : 1); return; }
      if (!it.vis) return;
      shown++;
      const k = 0.68 + 0.5 * Math.max(0, dot(it.fc.n, L));
      poly(it.sp, shade(it.fc.col, k), 'rgba(40,30,20,.35)', 1);
    });
    if (wire) shown = items.filter(i => i.vis).length;
    ctx.font = '13px Pretendard, "Malgun Gothic", sans-serif'; ctx.fillStyle = '#4a5468'; ctx.textAlign = 'left';
    ctx.fillText('카메라로 찍은 무대', 10, 20);
    stat.innerHTML = `점 <b>${pts}개</b>의 위치를 계산하고, 면 <b>${all.length}장</b> 가운데 카메라 쪽을 향한 <b>${shown}장</b>을 ${wire ? '선으로' : '밝기를 따져 칠해'} 그렸습니다. 카메라가 조금만 움직여도 전부 다시 합니다.`;
  }

  function draw1() {
    if (!size1()) return;
    if (view === '2d') draw2d(); else draw3d();
  }
  function setView(vw, say) {
    view = vw;
    viewBtns.forEach(b => b.setAttribute('aria-pressed', b.dataset.v === vw ? 'true' : 'false'));
    VB.$$(lab1, '.c21-ctrls .slider, .c21-wire-sw').forEach(el => el.classList.toggle('off', vw === '2d'));
    VB.$$(lab1, '.c21-ctrls input').forEach(el => { el.disabled = vw === '2d'; });
    draw1();
    if (!say) return;
    if (vw === '2d') VB.msg(msg1, '2D는 종이 위 그림입니다. 위에서 본 모습 한 장만 있어서 돌려 볼 수 없습니다. 집의 옆면이나 나무의 높이는 이 그림에 들어 있지 않습니다.');
    else VB.msg(msg1, '3D는 무대를 카메라로 찍은 모습입니다. <b>카메라 돌리기</b>를 움직이면 집 뒤쪽과 옆면이 보입니다. 같은 장면인데 그려야 할 면이 훨씬 많아졌습니다.', 'ok');
  }
  viewBtns.forEach(b => b.addEventListener('click', () => setView(b.dataset.v, true)));
  const outs = () => { yawOut.textContent = yawIn.value + '°'; pitchOut.textContent = pitchIn.value + '°'; sunOut.textContent = sunIn.value + '°'; };
  [yawIn, pitchIn].forEach(el => el.addEventListener('input', () => { outs(); draw1(); }));
  sunIn.addEventListener('input', () => { outs(); draw1(); VB.msg(msg1, '조명을 옮기면 밝은 면과 어두운 면, 그림자 방향이 함께 바뀝니다. 3D에서는 이것도 그릴 때마다 계산합니다.'); });
  wireIn.addEventListener('change', () => {
    draw1();
    if (wireIn.checked) VB.msg(msg1, '선만 보면 인형이 납작한 면 여러 장을 붙여 만든 것임을 알 수 있습니다. 흐린 선은 카메라 반대쪽이라 칠하지 않는 면입니다. 실제 게임의 인형 하나는 이런 면이 수천 장이 넘기도 합니다.', 'warn');
    else VB.msg(msg1, '면을 다시 칠했습니다.');
  });
  // 끌어서 돌리기
  let drag = null;
  cv.addEventListener('pointerdown', e => {
    if (view !== '3d') { VB.msg(msg1, '2D 그림은 돌릴 수 없습니다. 위의 <b>3D</b> 단추를 눌러 보세요.', 'warn'); return; }
    drag = { x: e.clientX, y: e.clientY, yaw: +yawIn.value, pitch: +pitchIn.value };
    cv.setPointerCapture(e.pointerId); cv.classList.add('drag');
  });
  cv.addEventListener('pointermove', e => {
    if (!drag) return;
    yawIn.value = ((Math.round(drag.yaw - (e.clientX - drag.x) * 0.5) % 360) + 360) % 360;
    pitchIn.value = Math.max(8, Math.min(80, Math.round(drag.pitch + (e.clientY - drag.y) * 0.3)));
    outs(); draw1();
  });
  const endDrag = () => { drag = null; cv.classList.remove('drag'); };
  cv.addEventListener('pointerup', endDrag);
  cv.addEventListener('pointercancel', endDrag);

  VB.$(lab1, '.reset').addEventListener('click', () => {
    yawIn.value = 35; pitchIn.value = 28; sunIn.value = 220; wireIn.checked = false; outs();
    setView('2d', false);
    VB.msg(msg1, '위의 두 단추를 번갈아 눌러 보세요.');
  });

  /* ---------------- 체험 2: 가게를 거치는 봉투 ---------------- */
  const lab2 = VB.$(root, '.c21-lab2');
  const nc = VB.$(lab2, '.c21-net');
  const nx = nc.getContext('2d');
  const lagIn = VB.$(lab2, '.c21-lag'), rateIn = VB.$(lab2, '.c21-rate');
  const lagOut = VB.$(lab2, '.c21-lag-out'), rateOut = VB.$(lab2, '.c21-rate-out');
  const rateRow = VB.$(lab2, '.c21-rate-row');
  const srvIn = VB.$(lab2, '.c21-server'), ghostIn = VB.$(lab2, '.c21-ghost'), smoothIn = VB.$(lab2, '.c21-smooth');
  const modeBtns = VB.$$(lab2, '.c21-net-modes button');
  const cntEl = VB.$(lab2, '.c21-cnt'), minEl = VB.$(lab2, '.c21-min'), lateEl = VB.$(lab2, '.c21-late');
  const msg2 = VB.$(lab2, '.c21-msg2');
  const padBtns = VB.$$(lab2, '.c21-pad button');
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const KEYMAP = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right' };
  const POLL = 2000;
  const cell = c => 10 + 20 * c;

  let S, running = false, raf = 0, last = 0, mode = 'real';
  function fresh() {
    const t = performance.now();
    S = {
      a: { x: 25, y: 50 }, b: { x: 75, y: 50 },
      keys: new Set(), target: null,
      packets: [], sent: 0, sendAcc: 0,
      srvA: null, srvB: null,
      bBuf: [], bViewA: { x: 25, y: 50 }, aViewB: { x: 75, y: 50 },
      // 턴제
      ac: { c: 1, r: 2 }, bc: { c: 3, r: 2 },
      turn: 'A', srvTurn: 'A', srvVer: 0, aVer: 0, bVer: 0,
      bKnowA: { c: 1, r: 2 }, aKnowB: { c: 3, r: 2 },
      aPollAt: t + POLL, bPollAt: t + POLL / 2, bMoveAt: 0,
      start: t
    };
  }
  fresh();

  let NW = 0, NH = 0, LY = null;
  function layout() {
    const w = nc.parentElement.clientWidth;
    if (!w) return false;
    let h, A, Sv, B;
    if (w >= 600) {
      const gap = 26, sw = Math.max(110, Math.round(w * 0.16));
      const side = Math.min(270, Math.floor((w - 24 - 2 * gap - sw) / 2));
      const total = side * 2 + sw + gap * 2;
      const x0 = Math.round((w - total) / 2);
      A = { x: x0, y: 34, w: side, h: side };
      Sv = { x: x0 + side + gap, y: 34 + side / 2 - 60, w: sw, h: 120 };
      B = { x: x0 + side + gap * 2 + sw, y: 34, w: side, h: side };
      h = side + 50;
    } else {
      const side = Math.min(300, w - 24);
      const x0 = Math.round((w - side) / 2);
      A = { x: x0, y: 30, w: side, h: side };
      Sv = { x: Math.round(w / 2 - 90), y: 30 + side + 26, w: 180, h: 84 };
      B = { x: x0, y: Sv.y + Sv.h + 50, w: side, h: side };
      h = B.y + side + 14;
    }
    if (w !== NW || h !== NH) { NW = w; NH = h; nc.width = w * DPR(); nc.height = h * DPR(); nc.style.height = h + 'px'; }
    nx.setTransform(DPR(), 0, 0, DPR(), 0, 0);
    LY = { A, S: Sv, B, horiz: w >= 600 };
    return true;
  }
  const mid = r => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });
  function edge(fromR, toR) {
    // 두 상자 사이의 선: 가로 배치면 옆면, 세로 배치면 위아래 면
    const a = mid(fromR), b = mid(toR);
    if (LY.horiz) return [{ x: a.x < b.x ? fromR.x + fromR.w : fromR.x, y: a.y }, { x: a.x < b.x ? toR.x : toR.x + toR.w, y: b.y }];
    return [{ x: a.x, y: a.y < b.y ? fromR.y + fromR.h : fromR.y }, { x: b.x, y: a.y < b.y ? toR.y : toR.y + toR.h }];
  }

  const lag = () => +lagIn.value;
  function sendPkt(from, to, col, label, data, onArrive) {
    const t = performance.now();
    S.packets.push({ from, to, col, label, data, t0: t, t1: t + lag() / 2, onArrive });
    if (from === 'A') S.sent++;
  }

  /* 실시간 */
  function sendA() {
    if (!srvIn.checked) return;
    const snap = { x: S.a.x, y: S.a.y, t: performance.now() };
    sendPkt('A', 'S', '#2f6fb0', '', snap, p => {
      S.srvA = p.data;
      sendPkt('S', 'B', '#2f6fb0', '', p.data, q => {
        S.bBuf.push(Object.assign({ at: performance.now() }, q.data));
        if (S.bBuf.length > 80) S.bBuf.shift();
        S.bViewA = { x: q.data.x, y: q.data.y };
      });
    });
  }
  function bShownA(now) {
    if (!smoothIn.checked || S.bBuf.length < 2) return S.bViewA;
    const rt = now - lag() - 1000 / +rateIn.value;
    const buf = S.bBuf;
    if (rt <= buf[0].t) return buf[0];
    for (let i = buf.length - 1; i > 0; i--) {
      const p0 = buf[i - 1], p1 = buf[i];
      if (rt >= p0.t && rt <= p1.t) { const k = (rt - p0.t) / (p1.t - p0.t || 1); return { x: p0.x + (p1.x - p0.x) * k, y: p0.y + (p1.y - p0.y) * k }; }
    }
    return buf[buf.length - 1];
  }

  /* 턴제 */
  function stepA(d) {
    if (S.turn !== 'A') { VB.msg(msg2, '지금은 친구 B의 차례입니다. B 화면이 가게에서 소식을 받아 움직일 때까지 기다립니다.', 'warn'); return; }
    const [dx, dy] = DIRS[d];
    const c = Math.max(0, Math.min(4, S.ac.c + dx)), r = Math.max(0, Math.min(4, S.ac.r + dy));
    if (c === S.ac.c && r === S.ac.r) return;
    if (c === S.aKnowB.c && r === S.aKnowB.r) { VB.msg(msg2, '친구가 있는 칸으로는 갈 수 없습니다. 다른 방향을 눌러 보세요.', 'warn'); return; }
    S.ac = { c, r }; S.turn = 'waitB';
    if (!srvIn.checked) { VB.msg(msg2, '가게를 거치지 않으니 A가 한 칸 움직인 사실이 A 책상 위에만 있습니다. B는 계속 A를 기다립니다. 차례가 영영 넘어가지 않습니다.', 'bad'); return; }
    sendPkt('A', 'S', '#2f6fb0', '', { c, r }, p => { S.srvA = p.data; S.srvTurn = 'B'; S.srvVer++; });
    VB.msg(msg2, 'A가 한 칸 움직이고 봉투 하나를 보냈습니다. B 화면은 2초마다 가게에 "새 소식 있어요?" 하고 물어봅니다. 다음 물음에서 A가 움직인 것을 알게 됩니다.');
  }
  function pollFrom(who) {
    if (!srvIn.checked) return;
    sendPkt(who, 'S', '#8a93a6', '?', null, () => {
      const snap = { a: S.srvA, b: S.srvB, turn: S.srvTurn, ver: S.srvVer };
      sendPkt('S', who, '#c2692a', '', snap, q => {
        const d = q.data;
        if (who === 'B') {
          if (d.a) S.bKnowA = d.a;
          if (d.turn === 'B' && d.ver !== S.bVer && S.turn === 'waitB') { S.bVer = d.ver; S.turn = 'B'; S.bMoveAt = performance.now() + 900; }
        } else {
          if (d.b) S.aKnowB = d.b;
          if (d.turn === 'A' && d.ver !== S.aVer && S.turn === 'waitA') {
            S.aVer = d.ver; S.turn = 'A';
            VB.msg(msg2, 'A 화면이 물어보고 나서야 B가 움직인 것을 알았습니다. 다시 A의 차례입니다. 지연을 크게 바꿔도 게임은 그대로 됩니다. 차례가 조금 늦게 넘어갈 뿐입니다.', 'ok');
          }
        }
      });
    });
  }
  function moveB() {
    const opts = Object.values(DIRS).map(([dx, dy]) => ({ c: S.bc.c + dx, r: S.bc.r + dy }))
      .filter(p => p.c >= 0 && p.c <= 4 && p.r >= 0 && p.r <= 4 && !(p.c === S.bKnowA.c && p.r === S.bKnowA.r));
    const p = opts[Math.floor(Math.random() * opts.length)] || S.bc;
    S.bc = p; S.turn = 'waitA';
    sendPkt('B', 'S', '#e3632b', '', p, q => { S.srvB = q.data; S.srvTurn = 'A'; S.srvVer++; });
  }

  function update(dt, now) {
    if (mode === 'real') {
      let vx = 0, vy = 0;
      S.keys.forEach(k => { vx += DIRS[k][0]; vy += DIRS[k][1]; });
      if (vx || vy) S.target = null;
      else if (S.target) {
        const dx = S.target.x - S.a.x, dy = S.target.y - S.a.y, dd = Math.hypot(dx, dy);
        if (dd < 1.5) S.target = null; else { vx = dx / dd; vy = dy / dd; }
      }
      const l = Math.hypot(vx, vy);
      if (l) { const sp = 48 * dt / 1000; S.a.x = Math.max(6, Math.min(94, S.a.x + vx / l * sp)); S.a.y = Math.max(6, Math.min(94, S.a.y + vy / l * sp)); }
      S.sendAcc += dt;
      const iv = 1000 / +rateIn.value;
      if (S.sendAcc >= iv) { S.sendAcc %= iv; sendA(); }
    } else {
      if (now >= S.aPollAt) { S.aPollAt = now + POLL; pollFrom('A'); }
      if (now >= S.bPollAt) { S.bPollAt = now + POLL; pollFrom('B'); }
      if (S.turn === 'B' && S.bMoveAt && now >= S.bMoveAt) { S.bMoveAt = 0; moveB(); }
    }
    // 봉투 도착
    const done = S.packets.filter(p => now >= p.t1);
    S.packets = S.packets.filter(p => now < p.t1);
    done.forEach(p => p.onArrive && p.onArrive(p));
  }

  /* 그리기 */
  const FONT = (w, s) => `${w} ${s}px Pretendard, "Malgun Gothic", sans-serif`;
  function panel(r, title, col, sub) {
    nx.fillStyle = '#fff'; nx.strokeStyle = col; nx.lineWidth = 2;
    nx.beginPath(); nx.roundRect ? nx.roundRect(r.x, r.y, r.w, r.h, 10) : nx.rect(r.x, r.y, r.w, r.h); nx.fill(); nx.stroke();
    nx.fillStyle = col; nx.font = FONT(800, 14); nx.textAlign = 'left';
    nx.fillText(title, r.x + 2, r.y - 10);
    if (sub) { nx.fillStyle = '#8a93a6'; nx.font = FONT(500, 13); nx.textAlign = 'right'; nx.fillText(sub, r.x + r.w - 2, r.y - 10); }
  }
  function toPx(r, p) { return { x: r.x + p.x / 100 * r.w, y: r.y + p.y / 100 * r.h }; }
  function piece(r, p, col, letter, opt = {}) {
    const q = toPx(r, p), rad = Math.max(10, r.w * 0.055);
    nx.beginPath(); nx.arc(q.x, q.y, rad, 0, Math.PI * 2);
    if (opt.ghost) { nx.setLineDash([4, 4]); nx.strokeStyle = col; nx.lineWidth = 2; nx.stroke(); nx.setLineDash([]); return; }
    nx.fillStyle = col; nx.fill();
    nx.fillStyle = '#fff'; nx.font = FONT(800, Math.round(rad * 1.1)); nx.textAlign = 'center'; nx.textBaseline = 'middle';
    nx.fillText(letter, q.x, q.y + 1); nx.textBaseline = 'alphabetic';
  }
  function grid(r) {
    nx.strokeStyle = '#eceef2'; nx.lineWidth = 1;
    for (let i = 1; i < 5; i++) {
      nx.beginPath(); nx.moveTo(r.x + r.w * i / 5, r.y + 4); nx.lineTo(r.x + r.w * i / 5, r.y + r.h - 4);
      nx.moveTo(r.x + 4, r.y + r.h * i / 5); nx.lineTo(r.x + r.w - 4, r.y + r.h * i / 5); nx.stroke();
    }
  }
  const cp = p => ({ x: cell(p.c), y: cell(p.r) });
  function envelope(x, y, col, label) {
    nx.fillStyle = '#fff'; nx.strokeStyle = col; nx.lineWidth = 1.8;
    nx.beginPath(); nx.rect(x - 9, y - 6.5, 18, 13); nx.fill(); nx.stroke();
    nx.beginPath(); nx.moveTo(x - 9, y - 6.5); nx.lineTo(x, y + 1); nx.lineTo(x + 9, y - 6.5); nx.stroke();
    if (label) { nx.fillStyle = col; nx.font = FONT(800, 11); nx.textAlign = 'center'; nx.fillText(label, x, y + 5); }
  }

  function drawNet(now) {
    if (!layout()) return;
    const { A, S: Sv, B } = LY;
    nx.fillStyle = '#f4f1ea'; nx.fillRect(0, 0, NW, NH);
    const on = srvIn.checked;
    // 도로
    [[A, Sv], [Sv, B]].forEach(([p, q]) => {
      const [a, b] = edge(p, q);
      nx.strokeStyle = on ? '#c9ccd3' : '#e2c3c3'; nx.lineWidth = 6; nx.setLineDash(on ? [] : [6, 6]);
      nx.beginPath(); nx.moveTo(a.x, a.y); nx.lineTo(b.x, b.y); nx.stroke(); nx.setLineDash([]);
    });
    const turnSub = who => mode !== 'turn' ? '' : (S.turn === who ? '내 차례' : '기다리는 중');
    panel(A, 'A 화면 (내가 조작)', '#2f6fb0', turnSub('A'));
    panel(B, 'B 화면 (친구)', '#e3632b', turnSub('B'));
    // 가게
    nx.fillStyle = on ? '#fbe7d6' : '#eceef2'; nx.strokeStyle = on ? '#c2692a' : '#b0b6c3'; nx.lineWidth = 2;
    nx.beginPath(); nx.roundRect ? nx.roundRect(Sv.x, Sv.y, Sv.w, Sv.h, 10) : nx.rect(Sv.x, Sv.y, Sv.w, Sv.h); nx.fill(); nx.stroke();
    nx.textAlign = 'center';
    nx.fillStyle = on ? '#c2692a' : '#8a93a6'; nx.font = FONT(800, 15);
    nx.fillText('가게(서버)', Sv.x + Sv.w / 2, Sv.y + 22);
    nx.font = FONT(500, 13); nx.fillStyle = '#4a5468';
    if (!on) { nx.fillText('거치지 않음', Sv.x + Sv.w / 2, Sv.y + 44); }
    else if (mode === 'real') {
      const sa = S.srvA;
      nx.fillText('받은 A 위치', Sv.x + Sv.w / 2, Sv.y + 44);
      nx.font = FONT(700, 13); nx.fillStyle = '#2f6fb0';
      nx.fillText(sa ? `(${Math.round(sa.x)}, ${Math.round(sa.y)})` : '아직 없음', Sv.x + Sv.w / 2, Sv.y + 62);
    } else {
      nx.fillText('지금 차례', Sv.x + Sv.w / 2, Sv.y + 44);
      nx.font = FONT(700, 13); nx.fillStyle = S.srvTurn === 'A' ? '#2f6fb0' : '#e3632b';
      nx.fillText(S.srvTurn + ' 차례', Sv.x + Sv.w / 2, Sv.y + 62);
    }
    if (Sv.h > 100) { nx.font = FONT(500, 12.5); nx.fillStyle = '#8a93a6'; nx.fillText('모아서 나눠 줌', Sv.x + Sv.w / 2, Sv.y + Sv.h - 14); }

    if (mode === 'real') {
      piece(A, S.b, '#e3632b', 'B');
      piece(A, S.a, '#2f6fb0', 'A');
      piece(B, S.b, '#e3632b', 'B');
      if (ghostIn.checked) piece(B, S.a, '#2f6fb0', '', { ghost: true });
      piece(B, on ? bShownA(now) : { x: 25, y: 50 }, '#2f6fb0', 'A');
      if (S.target) { const q = toPx(A, S.target); nx.strokeStyle = '#2f6fb0'; nx.lineWidth = 1.5; nx.beginPath(); nx.arc(q.x, q.y, 5, 0, Math.PI * 2); nx.stroke(); }
    } else {
      grid(A); grid(B);
      piece(A, cp(S.aKnowB), '#e3632b', 'B');
      piece(A, cp(S.ac), '#2f6fb0', 'A');
      piece(B, cp(S.bKnowA), '#2f6fb0', 'A');
      if (ghostIn.checked && (S.ac.c !== S.bKnowA.c || S.ac.r !== S.bKnowA.r)) piece(B, cp(S.ac), '#2f6fb0', '', { ghost: true });
      piece(B, cp(S.bc), '#e3632b', 'B');
    }
    // 봉투
    S.packets.forEach(p => {
      const R = { A, S: Sv, B };
      const [a, b] = edge(R[p.from], R[p.to]);
      const k = Math.max(0, Math.min(1, (now - p.t0) / Math.max(1, p.t1 - p.t0)));
      envelope(a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k, p.col, p.label);
    });
    if (!running) {
      nx.fillStyle = 'rgba(255,255,255,.72)'; nx.fillRect(0, 0, NW, NH);
      const c = mid(A);
      nx.fillStyle = '#b8406a';
      const bw = 168, bh = 44;
      nx.beginPath(); nx.roundRect ? nx.roundRect(c.x - bw / 2, c.y - bh / 2, bw, bh, 22) : nx.rect(c.x - bw / 2, c.y - bh / 2, bw, bh); nx.fill();
      nx.fillStyle = '#fff'; nx.font = FONT(800, 16); nx.textAlign = 'center'; nx.textBaseline = 'middle';
      nx.fillText('눌러서 시작', c.x, c.y + 1); nx.textBaseline = 'alphabetic';
    }
  }

  function meters() {
    cntEl.textContent = S.sent.toLocaleString() + '개';
    const L = lag();
    if (mode === 'real') {
      const r = +rateIn.value;
      minEl.textContent = srvIn.checked ? `${(r * 60).toLocaleString()}개 · 30명이면 ${(r * 60 * 30).toLocaleString()}개` : '0개 (보내지 않음)';
      lateEl.textContent = srvIn.checked ? `약 ${Math.round(L + (smoothIn.checked ? 1000 / r : 500 / r))}ms` : '전혀 안 따라옴';
    } else {
      minEl.textContent = srvIn.checked ? '물어보기 30개 + 움직일 때마다 1개' : '0개 (보내지 않음)';
      lateEl.textContent = srvIn.checked ? `차례마다 약 ${((L + POLL / 2) / 1000).toFixed(1)}초` : '차례가 넘어가지 않음';
    }
  }

  let meterAcc = 0;
  function frame(t) {
    if (!isCur()) { running = false; raf = 0; drawNet(performance.now()); return; }
    const dt = Math.min(50, t - last); last = t;
    const now = performance.now();
    update(dt, now);
    drawNet(now);
    meterAcc += dt; if (meterAcc > 200) { meterAcc = 0; meters(); }
    raf = requestAnimationFrame(frame);
  }
  function start() {
    if (running) return;
    running = true; last = performance.now();
    if (mode === 'turn') { const t = performance.now(); S.aPollAt = t + POLL; S.bPollAt = t + POLL / 2; }
    raf = requestAnimationFrame(frame);
    if (mode === 'real') VB.msg(msg2, '방향키나 화살표 단추로 A를 움직여 보세요. A 화면을 눌러도 그쪽으로 갑니다. B 화면의 A는 봉투가 도착한 뒤에야 따라옵니다.');
    else VB.msg(msg2, '방향키나 화살표 단추로 A를 한 칸 움직여 보세요. 움직이면 봉투 하나가 가게로 갑니다.');
  }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

  nc.addEventListener('click', e => {
    nc.focus();
    if (!running) { start(); return; }
    if (!LY) return;
    const b = nc.getBoundingClientRect();
    const x = e.clientX - b.left, y = e.clientY - b.top, A = LY.A;
    if (x < A.x || x > A.x + A.w || y < A.y || y > A.y + A.h) return;
    const wx = (x - A.x) / A.w * 100, wy = (y - A.y) / A.h * 100;
    if (mode === 'real') S.target = { x: Math.max(6, Math.min(94, wx)), y: Math.max(6, Math.min(94, wy)) };
    else {
      const dx = wx - cell(S.ac.c), dy = wy - cell(S.ac.r);
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      stepA(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    }
  });
  nc.addEventListener('keydown', e => {
    const d = KEYMAP[e.key];
    if (!d && e.key !== ' ' && e.key !== 'Enter') return;
    e.preventDefault();
    if (!running) { start(); if (!d) return; }
    if (!d) return;
    if (mode === 'real') S.keys.add(d);
    else if (!e.repeat) stepA(d);
  });
  nc.addEventListener('keyup', e => { const d = KEYMAP[e.key]; if (d) S.keys.delete(d); });
  nc.addEventListener('blur', () => S.keys.clear());

  padBtns.forEach(btn => {
    const d = btn.dataset.d;
    btn.addEventListener('pointerdown', e => {
      e.preventDefault();
      if (!running) start();
      btn.classList.add('on');
      if (mode === 'real') S.keys.add(d); else stepA(d);
    });
    const up = () => { btn.classList.remove('on'); S.keys.delete(d); };
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => btn.addEventListener(ev, up));
    btn.addEventListener('contextmenu', e => e.preventDefault());
  });

  function setMode(m, say) {
    mode = m;
    modeBtns.forEach(b => b.setAttribute('aria-pressed', b.dataset.m === m ? 'true' : 'false'));
    rateRow.classList.toggle('off', m === 'turn');
    rateIn.disabled = m === 'turn';
    smoothIn.disabled = m === 'turn';
    smoothIn.closest('.switch').style.opacity = m === 'turn' ? .35 : '';
    fresh(); meters(); drawNet(performance.now());
    if (!say) return;
    if (m === 'turn') VB.msg(msg2, '턴제에서는 A가 한 칸 움직일 때만 봉투를 하나 보냅니다. 두 화면은 2초마다 가게에 새 소식을 물어봅니다(13장의 몇 초마다 물어보기). ' + (running ? '방향키로 A를 움직여 보세요.' : 'A 화면을 눌러 시작하세요.'));
    else VB.msg(msg2, '실시간에서는 A가 움직이는 동안 1초에 정해진 횟수만큼 위치 봉투를 계속 보냅니다. 가게는 받는 대로 B에게 먼저 알려 줍니다(실시간 연결). ' + (running ? '' : 'A 화면을 눌러 시작하세요.'));
  }
  modeBtns.forEach(b => b.addEventListener('click', () => setMode(b.dataset.m, true)));

  lagIn.addEventListener('input', () => {
    const L = lag(); lagOut.textContent = L + 'ms'; meters();
    if (mode === 'turn') VB.msg(msg2, `지연 ${L}ms. 턴제에서는 원래 상대를 기다리는 시간이 있어서 이 정도 늦어도 크게 티가 나지 않습니다.`);
    else if (L >= 500) VB.msg(msg2, `지연 ${L}ms. B 화면의 A가 한참 뒤에서 따라옵니다. 점선(실제 위치)과의 거리를 보세요. 술래잡기라면 B는 이미 지나간 자리를 잡으러 가게 됩니다.`, 'bad');
    else if (L === 0) VB.msg(msg2, '지연 0ms는 실제 도로에서는 있을 수 없습니다. 그래도 보내는 횟수가 적으면 뚝뚝 끊깁니다.');
    else VB.msg(msg2, `지연 ${L}ms. 국내에 있는 가게라면 보통 수십 ms, 먼 나라의 가게라면 수백 ms까지 걸리기도 합니다.`);
  });
  rateIn.addEventListener('input', () => {
    const r = +rateIn.value; rateOut.textContent = r + '번'; meters();
    if (r <= 3) VB.msg(msg2, `1초에 ${r}번만 보내면 봉투 사이에 B 화면은 A가 어디 있는지 모릅니다. 그래서 가만히 있다가 다음 봉투가 오면 휙 옮겨 갑니다. 순간이동처럼 보이는 이유입니다.`, 'warn');
    else if (r >= 20) VB.msg(msg2, `1초에 ${r}번이면 부드럽지만 봉투 수가 크게 늘어납니다. 아래 1분 동안의 봉투 수를 보세요. 무료 서비스의 한도(13장)에 금방 닿습니다.`, 'warn');
    else VB.msg(msg2, `1초에 ${r}번 보냅니다. 보내는 횟수와 지연을 함께 바꿔 보세요.`);
  });
  srvIn.addEventListener('change', () => {
    meters();
    if (!srvIn.checked) {
      S.packets = [];
      VB.msg(msg2, '가게를 거치지 않으면 A의 위치는 A 책상 위에만 있습니다. A를 아무리 움직여도 B 화면의 A는 처음 자리에 그대로 있습니다. 화면 파일만 배포한 게임에서 "같은 방인데 서로 안 보이는" 이유입니다.', 'bad');
    } else VB.msg(msg2, '다시 가게를 거칩니다. 봉투가 오가기 시작합니다.', 'ok');
  });
  smoothIn.addEventListener('change', () => {
    S.bBuf = [];
    if (smoothIn.checked) VB.msg(msg2, '사이 채우기를 켜면 B 화면은 받은 봉투 두 개 사이를 이어서 그립니다. 보내는 횟수를 1~3번으로 줄여도 부드럽게 보입니다. 대신 다음 봉투를 기다리는 만큼 조금 더 늦게 보입니다.', 'ok');
    else VB.msg(msg2, '사이 채우기를 껐습니다. B 화면은 마지막으로 받은 봉투의 자리에 A를 그립니다.');
  });
  ghostIn.addEventListener('change', () => { if (!running) drawNet(performance.now()); });

  VB.$(lab2, '.reset').addEventListener('click', () => {
    stop();
    lagIn.value = 150; lagOut.textContent = '150ms';
    rateIn.value = 10; rateOut.textContent = '10번';
    srvIn.checked = true; ghostIn.checked = true; smoothIn.checked = false;
    setMode('real', false);
    VB.msg(msg2, 'A 화면을 눌러 시작하세요.');
  });

  // 처음 그리기와 크기 바뀔 때
  setView('2d', false); outs();
  setMode('real', false);
  const ro = new ResizeObserver(() => { draw1(); if (!running) drawNet(performance.now()); });
  ro.observe(cv.parentElement); ro.observe(nc.parentElement);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else if (!running) drawNet(performance.now()); });
  window.addEventListener('hashchange', () => { if (!isCur()) stop(); });
});
