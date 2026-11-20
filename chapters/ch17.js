VB.ch('ch17', root => {
  const view = VB.$(root, '.ch17-view');
  const tl = VB.$(root, '.ch17-tl');
  const msg = VB.$(root, '.lab-msg');
  const kids = ['김민준', '이서연', '박도윤', '최하은', '정지호'];
  const BASE = { title: '3학년 2반 출석 체크', color: '#2f6fb0', all: false, broken: false };
  let st, events, nflag;

  const clone = o => JSON.parse(JSON.stringify(o));

  function draw() {
    const s = st.app;
    if (s.broken) {
      view.innerHTML = `<div class="ch17-app broken">
        <div class="ch17-bar" style="background:linear-gradient(90deg,#ff5fa2,#ffcf3f,#3fd2ff)"><span>${s.title}</span></div>
        <div class="ch17-glitch">undefined</div>
        <div class="ch17-glitch b">학생 목록을 불러오지 못했습니다</div>
      </div>`;
      return;
    }
    view.innerHTML = `<div class="ch17-app">
      <div class="ch17-bar" style="background:${s.color}"><span>${s.title}</span></div>
      <ul>${kids.map((k, i) => `<li><span>${k}</span><button type="button" class="ch17-chk${st.present[i] ? ' on' : ''}" data-i="${i}" style="--c:${s.color}">${st.present[i] ? '출석' : '미확인'}</button></li>`).join('')}</ul>
      ${s.all ? `<button type="button" class="ch17-allbtn" style="background:${s.color}">모두 출석</button>` : ''}
    </div>`;
  }

  function drawTl() {
    if (!events.length) { tl.innerHTML = '<div class="ch17-empty">아직 기록이 없습니다.</div>'; return; }
    tl.innerHTML = events.map((e, i) => {
      if (e.type === 'flag') return `<button type="button" class="ch17-node flag" data-i="${i}" title="이 시점으로 돌아가기"><svg viewBox="0 0 24 30" width="22" height="28"><line x1="4" y1="2" x2="4" y2="28" stroke="#4a5468" stroke-width="2.5"/><path d="M4 3 h16 l-4 5 l4 5 h-16z" fill="#7650aa"/></svg><span>세이브 ${e.n}</span></button>`;
      return `<div class="ch17-node ${e.type}"><i></i><span>${e.label}</span></div>`;
    }).join('<b class="ch17-link"></b>');
    tl.scrollLeft = tl.scrollWidth;
  }

  function add(type, label) { events.push({ type, label }); drawTl(); }

  view.addEventListener('click', ev => {
    const c = ev.target.closest('.ch17-chk');
    if (c) { st.present[c.dataset.i] = !st.present[c.dataset.i]; draw(); return; }
    if (ev.target.closest('.ch17-allbtn')) { st.present = kids.map(() => true); draw(); }
  });

  VB.$(root, '.ch17-ctrl').addEventListener('click', ev => {
    const b = ev.target.closest('button'); if (!b) return;
    const s = st.app;
    if (b.classList.contains('ch17-save')) {
      if (s.broken) {
        VB.msg(msg, '망가진 상태를 저장하면 망가진 화면으로 돌아오는 깃발이 생깁니다. 세이브 포인트는 잘 될 때 만듭니다. 그래도 깃발은 꽂았습니다.', 'warn');
      } else {
        VB.msg(msg, `세이브 포인트 ${nflag}을(를) 만들었습니다. 지금 화면이 그대로 기록되었습니다. git에서는 이것을 커밋 하나라고 합니다.`, 'ok');
      }
      events.push({ type: 'flag', n: nflag++, snap: clone(s) });
      drawTl();
      return;
    }
    const r = b.dataset.r;
    if (r === 'fancy') {
      if (s.broken) { VB.msg(msg, '이미 망가진 화면을 더 꾸미려다 더 엉망이 되었습니다. 이럴 때는 더 부탁하기보다 돌아가는 것이 빠릅니다.', 'bad'); add('bad', '또 망가짐'); return; }
      s.broken = true; draw(); add('bad', '망가짐');
      const hasFlag = events.some(e => e.type === 'flag');
      VB.msg(msg, hasFlag
        ? '조수가 "멋지게" 꾸미다가 학생 목록과 버튼까지 망가뜨렸습니다. 아래 기록에서 <b>깃발</b>을 눌러 잘 되던 때로 돌아가 보세요.'
        : '조수가 "멋지게" 꾸미다가 학생 목록과 버튼까지 망가뜨렸습니다. 그런데 아래 기록에 깃발이 하나도 없습니다. 돌아갈 곳이 없습니다. <b>원래대로 돌려 줘</b>를 눌러 보세요.', 'bad');
      return;
    }
    if (r === 'undo') {
      if (!s.broken) { VB.msg(msg, '지금은 망가진 곳이 없습니다.', ''); return; }
      // 조수의 기억에 의존한 복구: 비슷하게만 돌아온다
      st.app = { title: BASE.title, color: '#5b6b8a', all: false, broken: false };
      st.present = kids.map(() => false);
      draw(); add('chg', '기억으로 복구');
      VB.msg(msg, '조수가 "원래대로 돌려놓았습니다"라고 합니다. 그런데 화면을 보면 제목, 색, 버튼이 망가지기 직전과 다릅니다. 조수가 예전 모습을 정확히 기억하지 못해 비슷하게만 만든 것입니다. 깃발이 있었다면 정확히 그때로 돌아갈 수 있습니다.', 'warn');
      return;
    }
    if (s.broken) { VB.msg(msg, '화면이 망가진 상태라 부탁을 들어줘도 제대로 보이지 않습니다. 먼저 돌아가 보세요.', 'warn'); return; }
    if (r === 'title') {
      if (s.title === '우리 반 아침 출석') { VB.msg(msg, '이미 바뀐 제목입니다.'); return; }
      s.title = '우리 반 아침 출석'; add('chg', '제목 바꿈');
      VB.msg(msg, '제목이 바뀌었습니다. 마음에 들면 세이브 포인트를 만들어 두세요.', 'ok');
    } else if (r === 'color') {
      if (s.color === '#2b8a6c') { VB.msg(msg, '이미 초록색입니다.'); return; }
      s.color = '#2b8a6c'; add('chg', '색 바꿈');
      VB.msg(msg, '색이 바뀌었습니다.', 'ok');
    } else if (r === 'all') {
      if (s.all) { VB.msg(msg, '이미 버튼이 있습니다.'); return; }
      s.all = true; add('chg', '버튼 추가');
      VB.msg(msg, '"모두 출석" 버튼이 생겼습니다. 눌러 보면 실제로 동작합니다.', 'ok');
    }
    draw();
  });

  tl.addEventListener('click', ev => {
    const b = ev.target.closest('.ch17-node.flag'); if (!b) return;
    const e = events[b.dataset.i];
    st.app = clone(e.snap);
    draw(); add('back', `세이브 ${e.n}로 돌아옴`);
    VB.msg(msg, `세이브 포인트 ${e.n}을(를) 만들던 때의 화면으로 정확히 돌아왔습니다. 그 뒤에 한 일은 사라졌지만, 잘 되던 상태는 그대로입니다.`, 'ok');
  });

  function reset() {
    st = { app: clone(BASE), present: kids.map(() => false) };
    events = []; nflag = 1;
    draw(); drawTl();
    VB.msg(msg, '부탁 버튼을 눌러 보세요.');
  }
  VB.$(root, '.reset').addEventListener('click', reset);
  reset();
});
