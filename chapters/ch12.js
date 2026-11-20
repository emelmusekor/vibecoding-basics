VB.ch('ch12', root => {
  const $ = s => VB.$(root, s);
  const msg = $('.c12-msg');
  const stage = $('.c12-stage');
  const now = () => new Date().toTimeString().slice(0, 8);
  let gen = 0;

  // 봉투가 from 에서 to 로 날아가는 모습
  function fly(from, to, label, kind) {
    return new Promise(res => {
      const h = stage.getBoundingClientRect();
      const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
      const el = document.createElement('div');
      el.className = 'c12-fly' + (kind ? ' ' + kind : '');
      el.textContent = label;
      stage.appendChild(el);
      const x0 = a.left - h.left + a.width / 2, y0 = a.top - h.top + a.height / 2;
      const x1 = b.left - h.left + b.width / 2, y1 = b.top - h.top + b.height / 2;
      const anim = el.animate([
        { left: x0 + 'px', top: y0 + 'px', opacity: 0 },
        { left: x0 + 'px', top: y0 + 'px', opacity: 1, offset: 0.12 },
        { left: x1 + 'px', top: y1 + 'px', opacity: 1, offset: 0.88 },
        { left: x1 + 'px', top: y1 + 'px', opacity: 0 }
      ], { duration: 650, easing: 'ease-in-out' });
      let done = false;
      const fin = () => { if (done) return; done = true; el.remove(); res(); };
      anim.onfinish = fin;
      setTimeout(fin, 650 + 80);
    });
  }
  function pop(el) { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
  async function blink(view, ms) {
    view.classList.add('c12-blank');
    await VB.wait(ms);
    view.classList.remove('c12-blank');
  }

  /* A: 홀만 있는 앱 */
  const A = $('.app-a');
  const aScoreEl = VB.$(A, '.c12-score'), aDesk = VB.$(A, '.c12-desk b'), aView = VB.$(A, '.browser-view'), aPhone = VB.$(A, '.c12-phone');
  let aScore = 0;
  function renderA() { aScoreEl.textContent = aScore; aDesk.textContent = aScore + '점'; }
  VB.$(A, '.c12-plus').addEventListener('click', () => {
    aScore += 10; renderA(); pop(aScoreEl); pop(aDesk);
    VB.msg(msg, 'A 앱의 점수가 올랐습니다. 이 점수는 <b>내 브라우저(책상 위)</b>에만 적혀 있습니다. 주방으로 가는 주문서는 없습니다.');
  });
  VB.$(A, '.reload').addEventListener('click', async e => {
    const btn = e.currentTarget;
    btn.classList.remove('spin'); void btn.offsetWidth; btn.classList.add('spin');
    const had = aScore;
    await blink(aView, 450);
    aScore = 0; renderA();
    VB.msg(msg, had
      ? `A 앱이 <b>${had}점에서 0점</b>으로 돌아갔습니다. 새로고침은 화면을 가게에서 처음 상태로 다시 받아 오는 일입니다. 책상 위에 적어 둔 점수는 함께 치워졌습니다.`
      : 'A 앱을 새로고침했습니다. 점수를 먼저 올린 다음 새로고침해 보세요.', had ? 'bad' : '');
  });
  VB.$(A, '.c12-other').addEventListener('click', () => {
    aPhone.hidden = false;
    aPhone.innerHTML = `<div class="c12-ph-bar">다른 기기 · quiz-a.example.com</div><div class="c12-ph-body"><div class="c12-qz-name">나의 점수</div><div class="c12-score">0</div><p>이 기기의 책상에는 아무것도 적혀 있지 않습니다.</p></div>`;
    pop(aPhone);
    VB.msg(msg, `다른 기기에서 A 앱을 열면 <b>0점</b>입니다. 내 기기에서 올린 ${aScore}점은 내 책상 위에만 있어서 다른 기기는 알 길이 없습니다.`, 'bad');
  });

  /* B: 주방과 장부가 있는 앱 */
  const B = $('.app-b');
  const bScoreEl = VB.$(B, '.c12-score'), bView = VB.$(B, '.browser-view'), bPhone = VB.$(B, '.c12-phone');
  const tbody = VB.$(B, '.c12-ledger tbody'), wrap = VB.$(B, '.c12-ledger-wrap');
  const others = ['가온', '나래', '다솜', '라온', '마루'];
  let ledger = [], myScore = 0, phoneOpen = false, phoneStale = false;

  function latest(name) {
    for (let i = ledger.length - 1; i >= 0; i--) if (ledger[i].name === name) return ledger[i].score;
    return 0;
  }
  function renderLedger(fresh) {
    if (!ledger.length) { tbody.innerHTML = '<tr class="empty"><td colspan="3">아직 적힌 기록이 없습니다.</td></tr>'; return; }
    tbody.innerHTML = ledger.map((r, i) =>
      `<tr class="${r.name === '나' ? 'me' : ''}${i === fresh ? ' new' : ''}"><td>${r.name}</td><td>${r.score}점</td><td>${r.time}</td></tr>`).join('');
    wrap.scrollTop = wrap.scrollHeight;
  }
  function write(name, score) {
    ledger.push({ name, score, time: now() });
    renderLedger(ledger.length - 1);
    if (phoneOpen) phoneStale = true;
  }

  VB.$(B, '.c12-plus').addEventListener('click', async () => {
    const g = gen;
    myScore += 10; bScoreEl.textContent = myScore; pop(bScoreEl);
    const s = myScore;
    VB.msg(msg, 'B 앱은 점수를 올릴 때마다 <b>주문서</b>를 주방으로 보냅니다. 주방이 장부에 한 줄 적는 것을 보세요.');
    await fly(VB.$(B, '.c12-plus'), wrap, '주문서');
    if (g !== gen) return;
    write('나', s);
    if (phoneStale) VB.msg(msg, '장부에는 새로 적혔지만, 이미 열어 둔 다른 기기 화면은 그대로입니다. 다른 기기가 다시 물어봐야 바뀝니다. 이 이야기는 13장에서 이어집니다.', 'warn');
  });

  VB.$(B, '.reload').addEventListener('click', async e => {
    const g = gen;
    const btn = e.currentTarget;
    btn.classList.remove('spin'); void btn.offsetWidth; btn.classList.add('spin');
    bView.classList.add('c12-blank');
    await fly(bView, wrap, '점수 주세요');
    if (g !== gen) return;
    await fly(wrap, bView, latest('나') + '점', 'back');
    if (g !== gen) return;
    bView.classList.remove('c12-blank');
    myScore = latest('나'); bScoreEl.textContent = myScore; pop(bScoreEl);
    VB.msg(msg, myScore
      ? `B 앱은 새로고침해도 <b>${myScore}점</b> 그대로입니다. 화면이 처음 상태로 돌아온 뒤 주방에 "제 점수 주세요" 하고 물었고, 주방이 장부에서 찾아 알려 주었습니다.`
      : 'B 앱을 새로고침했습니다. 장부에 내 기록이 없어서 0점입니다. 점수를 올린 다음 다시 해 보세요.', myScore ? 'ok' : '');
  });

  function renderPhone() {
    const names = ['나', ...others].filter(n => ledger.some(r => r.name === n));
    const rows = names.map(n => ({ n, s: latest(n) })).sort((x, y) => y.s - x.s);
    bPhone.innerHTML = `<div class="c12-ph-bar">다른 기기 · quiz-b.example.com</div><div class="c12-ph-body"><div class="c12-qz-name">학급 점수판</div>${
      rows.length ? '<ol>' + rows.map(r => `<li class="${r.n === '나' ? 'me' : ''}"><span>${r.n}</span><b>${r.s}점</b></li>`).join('') + '</ol>'
        : '<p>장부가 비어 있습니다.</p>'}</div>`;
  }
  VB.$(B, '.c12-other').addEventListener('click', async e => {
    const g = gen;
    const btn = e.currentTarget;
    btn.disabled = true;
    bPhone.hidden = false;
    bPhone.innerHTML = '<div class="c12-ph-bar">다른 기기 · quiz-b.example.com</div><div class="c12-ph-body"><p>불러오는 중</p></div>';
    await fly(bPhone, wrap, '점수판 주세요');
    if (g !== gen) return;
    await fly(wrap, bPhone, '장부 내용', 'back');
    if (g !== gen) return;
    btn.disabled = false;
    btn.textContent = '다른 기기에서 다시 보기';
    phoneOpen = true; phoneStale = false;
    renderPhone(); pop(bPhone);
    VB.msg(msg, `다른 기기에서도 <b>내 점수 ${latest('나')}점</b>이 보입니다. 다른 기기도 같은 주방에 물어보고, 같은 장부를 읽어 왔기 때문입니다.`, 'ok');
  });

  VB.$(B, '.c12-many').addEventListener('click', async e => {
    const g = gen;
    const btn = e.currentTarget;
    btn.disabled = true;
    VB.msg(msg, '다른 학생 다섯 명이 각자 자기 폰에서 점수를 올립니다. 주문서가 한꺼번에 주방으로 들어옵니다.');
    const jobs = others.map(async (n, i) => {
      await VB.wait(i * 160);
      if (g !== gen) return;
      const s = latest(n) + 10 * (1 + Math.floor(Math.random() * 3));
      await fly(btn, wrap, n);
      if (g !== gen) return;
      write(n, s);
    });
    await Promise.all(jobs);
    if (g !== gen) return;
    btn.disabled = false;
    VB.msg(msg, phoneStale
      ? '장부에 여러 줄이 쌓였습니다. 그런데 이미 열어 둔 다른 기기 화면은 그대로입니다. [다른 기기에서 다시 보기]를 눌러야 바뀝니다. 왜 그런지는 13장에서 봅니다.'
      : '장부에 여러 줄이 쌓였습니다. 여러 사람이 같은 장부에 적으니 [다른 기기에서 보기]로 학급 전체 점수를 한눈에 볼 수 있습니다.', phoneStale ? 'warn' : 'ok');
  });

  /* 처음으로 */
  function reset() {
    gen++;
    VB.$$(stage, '.c12-fly').forEach(x => x.remove());
    aScore = 0; renderA();
    ledger = []; myScore = 0; phoneOpen = false; phoneStale = false;
    bScoreEl.textContent = 0; renderLedger();
    aView.classList.remove('c12-blank'); bView.classList.remove('c12-blank');
    [aPhone, bPhone].forEach(p => { p.hidden = true; p.innerHTML = ''; });
    VB.$$(root, '.c12-other').forEach(b => { b.disabled = false; b.textContent = '다른 기기에서 보기'; });
    VB.$(B, '.c12-many').disabled = false;
    VB.msg(msg, '양쪽 앱에서 [맞혔어요 +10]을 몇 번 눌러 보세요.');
  }
  VB.$(root, '.reset').addEventListener('click', reset);
  reset();
});
