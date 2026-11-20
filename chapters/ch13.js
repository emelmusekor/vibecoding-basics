VB.ch('ch13', root => {
  const $ = s => VB.$(root, s), $$ = s => VB.$$(root, s);
  const lab = $('.lab'), stage = $('.c13-stage'), msg = $('.c13-msg');
  const input = $('.c13-input'), sendBtn = $('.c13-send'), fiveBtn = $('.c13-five');
  const book = $('.c13-book'), kitList = $('.c13-kit-list'), link = $('.c13-link');
  const teaView = $('.c13-tea .browser-view'), teaList = $('.c13-tea-list'), teaN = $('.c13-n');
  const status = $('.c13-status'), checkBtn = $('.c13-check'), errBox = $('.c13-err'), reloadBtn = $('.c13-tea .reload');
  const slider = $('.c13-int'), sliderOut = $('.c13-int-out'), sliderRow = $('.c13-slider');
  const cntEl = $('.c13-cnt'), limBar = $('.c13-lim .bar i'), estEl = $('.c13-est'), lagEl = $('.c13-lag');
  const LIMIT = 100, FLY = 380;
  const names = ['가온', '나래', '다솜', '라온', '마루', '보미', '새롬', '아라'];
  const answers = ['물은 0도에서 얼어요', '분수는 나누기와 같아요', '식물은 햇빛으로 양분을 만들어요', '세종대왕이 한글을 만들었어요', '자석은 같은 극끼리 밀어요', '삼각형 세 각을 더하면 180도', '지구는 하루에 한 바퀴 돌아요', '비는 구름에서 내려요'];
  let S, ans = 0;

  /* 봉투 */
  function fly(from, to, label, kind) {
    return new Promise(res => {
      const h = stage.getBoundingClientRect();
      const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
      const el = document.createElement('div');
      el.className = 'c13-fly' + (kind ? ' ' + kind : '');
      el.textContent = label;
      stage.appendChild(el);
      const x0 = a.left - h.left + a.width / 2, y0 = a.top - h.top + Math.min(a.height / 2, 60);
      const x1 = b.left - h.left + b.width / 2, y1 = b.top - h.top + Math.min(b.height / 2, 60);
      const anim = el.animate([
        { left: x0 + 'px', top: y0 + 'px', opacity: 0 },
        { left: x0 + 'px', top: y0 + 'px', opacity: 1, offset: 0.1 },
        { left: x1 + 'px', top: y1 + 'px', opacity: 1, offset: 0.9 },
        { left: x1 + 'px', top: y1 + 'px', opacity: 0 }
      ], { duration: FLY, easing: 'ease-in-out' });
      let done = false;
      const fin = () => { if (done) return; done = true; el.remove(); res(); };
      anim.onfinish = fin;
      setTimeout(fin, FLY + 80);
    });
  }
  const fmt = n => Math.round(n).toLocaleString('ko-KR');
  const sec = t => (t < 10 ? t.toFixed(1) : Math.round(t)) + '초';

  /* 그리기 */
  function li(p, fresh) { return `<li class="${fresh ? 'new' : ''}"><b>${p.name}</b> ${p.text}</li>`; }
  function renderKit(freshId) {
    kitList.innerHTML = S.posts.map(p => li(p, p.id === freshId)).join('');
    kitList.scrollTop = kitList.scrollHeight;
  }
  function renderTea(freshIds) {
    const shown = S.posts.filter(p => S.shown.has(p.id));
    teaList.innerHTML = shown.map(p => li(p, freshIds && freshIds.includes(p.id))).join('');
    teaList.scrollTop = teaList.scrollHeight;
    teaN.textContent = shown.length;
  }
  function renderCount() {
    cntEl.textContent = S.orders + '회';
    const r = Math.min(1, S.orders / LIMIT);
    limBar.style.width = (r * 100) + '%';
    limBar.style.background = r >= 1 ? 'var(--bad)' : r > 0.75 ? 'var(--warn)' : '';
  }
  function renderEst() {
    if (S.mode === 'poll') estEl.textContent = '약 ' + fmt(30 * 3600 / S.int) + '회';
    else if (S.mode === 'push') estEl.textContent = '연결할 때 30회';
    else estEl.textContent = '사람이 누를 때만';
  }
  function renderStatus() {
    if (S.blocked) { status.innerHTML = '<span class="c13-dot off"></span>멈춤'; return; }
    if (S.mode === 'none') status.innerHTML = '<span class="c13-dot off"></span>처음 열 때 받아 온 그대로';
    else if (S.mode === 'button') status.innerHTML = '<span class="c13-dot off"></span>[새 글 확인]을 누를 때만 물어봄';
    else if (S.mode === 'poll') {
      const left = Math.max(0, S.next - S.t);
      status.innerHTML = `<span class="c13-dot on"></span>${S.int}초마다 물어봄 · 다음까지 ${Math.ceil(left)}초`;
    } else status.innerHTML = S.connected ? '<span class="c13-dot live"></span>가게와 전화 연결됨' : '<span class="c13-dot off"></span>연결하는 중';
  }

  /* 선생님 화면이 주방에 물어보기 */
  async function ask(kind) {
    if (S.blocked) { blockedMsg(); return; }
    const g = S.gen;
    S.inflight = true;
    S.orders++; renderCount();
    if (S.orders > LIMIT) { S.orders = LIMIT + 1; block(); S.inflight = false; return; }
    if (kind === 'reload') teaView.classList.add('c13-blank');
    await fly(teaView, book, kind === 'reload' ? '화면 전체 주세요' : '새 소식 있어요?');
    if (g !== S.gen) return;
    const fresh = S.posts.filter(p => !S.shown.has(p.id));
    await fly(book, teaView, kind === 'reload' ? '화면 전체' : fresh.length ? `새 글 ${fresh.length}개` : '없어요', fresh.length ? 'yes' : 'no');
    if (g !== S.gen) return;
    S.inflight = false;
    S.lastAsk = S.t;
    if (kind === 'reload') teaView.classList.remove('c13-blank');
    show(fresh, kind);
  }
  function show(fresh, kind) {
    fresh.forEach(p => S.shown.add(p.id));
    renderTea(fresh.map(p => p.id));
    if (!fresh.length) {
      if (kind === 'button') VB.msg(msg, '물어봤지만 새 글이 없어서 "없어요"라는 답이 왔습니다. 주문 횟수는 그래도 1회 늘었습니다.');
      if (kind === 'reload') VB.msg(msg, '화면 전체를 다시 받아 왔습니다. 새 글은 없었습니다.');
      return;
    }
    const last = fresh[fresh.length - 1];
    const lag = S.t - last.t;
    lagEl.textContent = sec(lag);
    const how = {
      reload: `사람이 브라우저 새로고침을 눌러서 화면 전체를 다시 주문했고, 그제야 새 글 ${fresh.length}개가 보였습니다. 화면이 잠깐 깜빡인 것은 전체를 다시 받았기 때문입니다.`,
      button: `[새 글 확인]을 누르자 주방에 물어보고 새 글 ${fresh.length}개를 받아 왔습니다. 화면 전체가 아니라 목록만 바뀌었습니다.`,
      poll: `아무것도 누르지 않았는데 새 글이 나타났습니다. 선생님 화면이 ${S.int}초마다 몰래 물어보고 있기 때문입니다. 제출하고 <b>${sec(lag)}</b> 뒤에 보였습니다. 간격을 바꿔 보세요.`,
      push: `주방이 장부에 적자마자 먼저 알려 주었습니다. 제출하고 <b>${sec(lag)}</b> 뒤에 보였습니다. 그사이 선생님 화면이 보낸 주문은 늘지 않았습니다.`,
      connect: `전화를 연결하면서 그동안 쌓인 새 글 ${fresh.length}개를 한 번에 받아 왔습니다.`
    }[kind];
    if (how) VB.msg(msg, how, 'ok');
  }
  function block() {
    S.blocked = true; S.connected = false;
    renderCount(); renderStatus();
    errBox.hidden = false;
    link.hidden = true;
    blockedMsg();
  }
  function blockedMsg() {
    VB.msg(msg, '체험용 무료 한도 100회를 다 썼습니다. 가게가 더 이상 주문을 받지 않아 선생님 화면이 멈췄습니다. 학생 글은 장부에 계속 쌓이지만 화면에는 보이지 않습니다. 실제 무료 서비스도 하루나 한 달 단위로 주문 횟수에 한도가 있습니다. [처음으로]를 눌러 다시 해 보세요.', 'bad');
  }

  /* 학생이 제출하기 */
  async function submit(name, text, from) {
    const g = S.gen;
    const p = { id: ++S.seq, name, text, t: 0 };
    await fly(from, book, '답 제출');
    if (g !== S.gen) return;
    p.t = S.t;
    S.posts.push(p);
    renderKit(p.id);
    if (S.mode === 'push' && S.connected && !S.blocked) {
      await fly(book, teaView, '새 글 1개', 'yes');
      if (g !== S.gen) return;
      show(S.posts.filter(x => !S.shown.has(x.id)), 'push');
      return;
    }
    if (S.blocked) return;
    const tip = {
      none: '장부에는 적혔지만 선생님 화면은 그대로입니다. 선생님 화면이 물어보지 않으니 알 길이 없습니다. 브라우저의 새로고침(↻)을 눌러 보세요.',
      button: '장부에는 적혔습니다. 선생님 화면의 [새 글 확인]을 눌러야 보입니다.',
      poll: '장부에 적혔습니다. 선생님 화면이 다음에 물어볼 때까지 기다려 보세요.',
      push: '장부에 적혔습니다.'
    }[S.mode];
    VB.msg(msg, tip, S.mode === 'none' ? 'warn' : '');
  }
  sendBtn.addEventListener('click', () => {
    const text = input.value.trim() || answers[ans % answers.length];
    submit('가온', text, sendBtn);
    ans++;
    input.value = answers[ans % answers.length];
  });
  input.addEventListener('keydown', e => { if (e.key === 'Enter') sendBtn.click(); });
  fiveBtn.addEventListener('click', async () => {
    const g = S.gen;
    fiveBtn.disabled = true;
    for (let i = 0; i < 5; i++) {
      if (g !== S.gen) return;
      submit(names[(S.seq + i) % names.length], answers[(ans + i) % answers.length], fiveBtn);
      await VB.wait(450);
    }
    ans += 5;
    if (g === S.gen) fiveBtn.disabled = false;
  });

  /* 방식 바꾸기 */
  async function setMode(m) {
    S.mode = m;
    $$('.c13-modes button').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === m));
    sliderRow.classList.toggle('off', m !== 'poll');
    slider.disabled = m !== 'poll';
    checkBtn.hidden = m !== 'button';
    link.hidden = true;
    S.connected = false;
    renderEst(); renderStatus();
    if (S.blocked) { blockedMsg(); return; }
    const say = {
      none: '이 앱은 처음 열 때 한 번만 주문합니다. 학생이 제출해도 선생님 화면은 그대로입니다.',
      button: '앱 안의 [새 글 확인] 버튼을 누를 때만 주방에 물어봅니다.',
      poll: `선생님 화면이 ${S.int}초마다 스스로 주방에 "새 소식 있어요?" 하고 물어봅니다. 아무것도 누르지 말고 지켜보세요. 아래 주문 횟수가 계속 올라갑니다.`,
      push: '선생님 화면과 주방이 전화를 켜 둔 채로 연결됩니다. 연결할 때 주문이 한 번 나가고, 그 뒤에는 주방이 먼저 알려 줍니다.'
    }[m];
    VB.msg(msg, say);
    if (m === 'poll') S.next = S.t + Math.min(S.int, 1);
    if (m === 'push') {
      const g = S.gen;
      await ask('connect');
      if (g !== S.gen || S.mode !== 'push' || S.blocked) return;
      S.connected = true; link.hidden = false; renderStatus();
      if (!msg.classList.contains('ok')) VB.msg(msg, '연결되었습니다. 이제 학생 폰에서 제출해 보세요. 선생님 화면이 묻지 않아도 곧바로 나타납니다.');
    }
  }
  $$('.c13-modes button').forEach(b => b.addEventListener('click', () => { if (S.mode !== b.dataset.mode) setMode(b.dataset.mode); }));
  slider.addEventListener('input', () => {
    S.int = +slider.value;
    sliderOut.textContent = S.int + '초';
    S.next = Math.min(S.next, S.t + S.int);
    renderEst(); renderStatus();
  });
  checkBtn.addEventListener('click', () => ask('button'));
  reloadBtn.addEventListener('click', () => {
    reloadBtn.classList.remove('spin'); void reloadBtn.offsetWidth; reloadBtn.classList.add('spin');
    if (S.blocked) { blockedMsg(); return; }
    ask('reload');
  });

  /* 시계: 체험이 화면에 보이고 창이 열려 있을 때만 흐름 */
  let onScreen = false;
  new IntersectionObserver(es => { onScreen = es[0].isIntersecting; }, { threshold: 0 }).observe(lab);
  setInterval(() => {
    if (!onScreen || document.hidden) return;
    S.t += 0.1;
    if (S.mode === 'poll' && !S.blocked && S.t >= S.next) {
      S.next = S.t + S.int;
      if (!S.inflight) ask('poll');
    }
    if (S.mode === 'poll') renderStatus();
  }, 100);

  /* 처음으로 */
  function reset() {
    S = { gen: (S ? S.gen : 0) + 1, t: 0, posts: [], shown: new Set(), mode: 'none', int: 3, next: 3, orders: 0, blocked: false, connected: false, seq: 0, inflight: false };
    $$('.c13-fly').forEach(x => x.remove());
    S.posts.push({ id: ++S.seq, name: '아라', text: '비는 구름에서 내려요', t: 0 }, { id: ++S.seq, name: '보미', text: '자석은 같은 극끼리 밀어요', t: 0 });
    S.posts.forEach(p => S.shown.add(p.id));
    ans = 0; input.value = answers[0];
    slider.value = 3; sliderOut.textContent = '3초';
    errBox.hidden = true; teaView.classList.remove('c13-blank');
    fiveBtn.disabled = false;
    lagEl.textContent = '-';
    renderKit(); renderTea(); renderCount();
    setMode('none');
    VB.msg(msg, '지금은 [물어보지 않음] 상태입니다. 학생 폰에서 [제출]을 눌러 보세요.');
  }
  $('.reset').addEventListener('click', reset);
  reset();
});
