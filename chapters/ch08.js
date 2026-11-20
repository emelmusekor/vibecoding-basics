VB.ch('ch08', root => {
  /* ---------- 체험 1: 와이파이를 끄면 ---------- */
  const ic = {
    memo: '<svg viewBox="0 0 40 40"><rect x="9" y="6" width="22" height="28" rx="3" fill="#fff"/><path d="M13 14h14M13 20h14M13 26h9" stroke="#6d778b" stroke-width="2.5"/></svg>',
    calc: '<svg viewBox="0 0 40 40"><rect x="10" y="6" width="20" height="28" rx="3" fill="#fff"/><rect x="13" y="9" width="14" height="6" rx="1" fill="#9fd3b8"/><g fill="#4a5468"><circle cx="15" cy="20" r="1.8"/><circle cx="20" cy="20" r="1.8"/><circle cx="25" cy="20" r="1.8"/><circle cx="15" cy="25" r="1.8"/><circle cx="20" cy="25" r="1.8"/><circle cx="25" cy="25" r="1.8"/><circle cx="15" cy="30" r="1.8"/><circle cx="20" cy="30" r="1.8"/><circle cx="25" cy="30" r="1.8"/></g></svg>',
    photo: '<svg viewBox="0 0 40 40"><rect x="6" y="9" width="28" height="22" rx="3" fill="#fff"/><circle cx="27" cy="15" r="3" fill="#f6c945"/><path d="M8 29l8-9 6 6 4-4 6 7z" fill="#5fae64"/></svg>',
    hwp: '<svg viewBox="0 0 40 40"><rect x="9" y="6" width="22" height="28" rx="3" fill="#fff"/><text x="20" y="26" font-size="13" font-weight="800" text-anchor="middle" fill="#2f6fb0">한</text></svg>',
    yt: '<svg viewBox="0 0 40 40"><rect x="6" y="10" width="28" height="20" rx="6" fill="#fff"/><path d="M17 15v10l9-5z" fill="#e33"/></svg>',
    map: '<svg viewBox="0 0 40 40"><path d="M20 7c-6 0-10 4-10 10 0 7 10 16 10 16s10-9 10-16c0-6-4-10-10-10z" fill="#fff"/><circle cx="20" cy="17" r="4" fill="#03c75a"/></svg>',
    kakao: '<svg viewBox="0 0 40 40"><ellipse cx="20" cy="18" rx="13" ry="10" fill="#3c1e1e"/><path d="M13 25l-2 7 7-5z" fill="#3c1e1e"/><text x="20" y="22" font-size="9" font-weight="800" text-anchor="middle" fill="#fee500">TALK</text></svg>',
    search: '<svg viewBox="0 0 40 40"><text x="20" y="28" font-size="22" font-weight="900" text-anchor="middle" fill="#fff">N</text></svg>'
  };
  const offErr = `<div class="noconn"><svg viewBox="0 0 60 44" width="60" height="44"><path d="M6 16a34 34 0 0 1 48 0M14 24a22 22 0 0 1 32 0M22 32a10 10 0 0 1 16 0" fill="none" stroke="#b5bac4" stroke-width="4" stroke-linecap="round"/><circle cx="30" cy="39" r="3.5" fill="#b5bac4"/><path d="M8 4l44 38" stroke="#c43d3d" stroke-width="4" stroke-linecap="round"/></svg><b>인터넷에 연결되어 있지 않습니다</b><span>네트워크 연결을 확인하세요.</span></div>`;
  const apps = [
    { id: 'memo', name: '메모장', bg: '#6d778b',
      view: () => `<div class="memo">오늘 할 일<br>· 가정통신문 확인<br>· 3교시 과학실 예약<br>· 학부모 상담 일정 정리</div>`,
      on: ['메모장은 내 서랍장에 있는 서류만 씁니다. 도로를 쓰지 않습니다.', 'ok'],
      off: ['와이파이가 꺼져도 그대로 됩니다. 메모장은 내 방 안에서만 일하기 때문입니다.', 'ok'] },
    { id: 'calc', name: '계산기', bg: '#2b8a6c',
      view: () => `<div class="calc"><div>12 + 30</div><b>42</b></div>`,
      on: ['계산기는 내 컴퓨터 안에서 바로 계산합니다. 택배가 필요 없습니다.', 'ok'],
      off: ['계산은 내 컴퓨터가 혼자 합니다. 도로가 끊겨도 아무 상관이 없습니다.', 'ok'] },
    { id: 'photo', name: '저장된 사진', bg: '#3f9fd6',
      view: () => `<div class="photos">${['#bfe0f5', '#f6dcc3', '#d5ecd0'].map((c, i) => `<svg viewBox="0 0 90 64"><rect width="90" height="64" rx="4" fill="${c}"/><circle cx="${70 - i * 18}" cy="16" r="7" fill="#f6c945"/><path d="M0 64 L${26 + i * 8} 30 L50 50 L66 36 L90 64z" fill="#5fae64"/></svg>`).join('')}</div><p class="cap">내 사진 폴더 · 운동회</p>`,
      on: ['이미 내 서랍장에 저장해 둔 사진입니다. 꺼내 보기만 하면 됩니다.', 'ok'],
      off: ['서랍장에 있는 사진이라 도로 없이도 열립니다.', 'ok'] },
    { id: 'hwp', name: '한글 문서', bg: '#2f6fb0',
      view: () => `<div class="doc"><b>가정통신문</b><p>학부모님께 알려 드립니다. 11월 넷째 주는 학부모 상담 주간입니다.</p></div>`,
      on: ['내 컴퓨터에 저장된 한글 파일입니다. 한글 프로그램도 내 컴퓨터에 깔려 있습니다.', 'ok'],
      off: ['파일도 프로그램도 내 방 안에 있으니 오프라인에서도 열립니다.', 'ok'] },
    { id: 'yt', name: '유튜브', bg: '#e33', net: true,
      view: () => `<div class="yt"><div class="yt-screen"><svg viewBox="0 0 40 40" width="44"><circle cx="20" cy="20" r="18" fill="rgba(0,0,0,.45)"/><path d="M16 12v16l12-8z" fill="#fff"/></svg></div><div class="yt-bar"><i></i></div><p class="cap">과학 실험 영상 · 재생 중</p></div>`,
      on: ['영상은 유튜브 가게에 있습니다. 재생하는 동안 영상을 조금씩 택배로 받아 옵니다.', 'ok'],
      off: ['영상은 내 서랍이 아니라 유튜브 가게에 있습니다. 도로가 끊겨 주문을 보낼 수 없으니 볼 수 없습니다.', 'bad'] },
    { id: 'map', name: '네이버 지도', bg: '#03c75a', net: true,
      view: () => `<svg class="mapv" viewBox="0 0 300 140"><rect width="300" height="140" fill="#eef3e8"/><path d="M0 90 C80 70 140 110 300 60" stroke="#fff" stroke-width="12" fill="none"/><path d="M120 0 L150 140" stroke="#fff" stroke-width="9"/><rect x="200" y="86" width="60" height="34" fill="#cfe4c4"/><path d="M0 20 h90 v30 h-90z" fill="#bcd9f0"/><path d="M150 50c-8 0-13 5-13 12 0 9 13 20 13 20s13-11 13-20c0-7-5-12-13-12z" fill="#03c75a"/><circle cx="150" cy="62" r="4" fill="#fff"/><text x="168" y="58" font-size="13" fill="#1d2433">우리학교</text></svg>`,
      on: ['지도 그림은 전국 것을 모두 내 컴퓨터에 두기에는 너무 큽니다. 보고 있는 부분만 그때그때 주문해서 받습니다.', 'ok'],
      off: ['지도 그림은 지도 가게에 있습니다. 도로가 끊기면 보고 싶은 부분을 주문할 수 없습니다.', 'bad'] },
    { id: 'kakao', name: '카카오톡', bg: '#fee500', partial: true,
      view: on => `<div class="kk">${on ? '' : '<div class="kk-warn">인터넷 연결을 확인해 주세요.</div>'}<div class="kk-b">어제 보낸 회의 자료 확인 부탁드려요.</div><div class="kk-b me">네, 확인했습니다.</div>${on ? '<div class="kk-b new">내일 회의는 2시로 바뀌었어요.<small>방금</small></div><div class="kk-b me">알겠습니다.</div>' : '<div class="kk-b me fail">알겠습니다.<small>전송 실패</small></div>'}</div>`,
      on: ['옛날 대화는 이미 받아서 서랍에 넣어 두었습니다. 새 메시지는 도로를 통해 방금 도착했습니다.', 'ok'],
      off: ['옛날 대화는 이미 받아서 내 서랍에 넣어 두었기 때문에 보입니다. 하지만 새 메시지는 도로가 있어야 오가므로 보내지 못했습니다.', 'warn'] },
    { id: 'search', name: '네이버 검색', bg: '#03c75a', net: true,
      view: () => `<div class="srch"><div class="srch-box">학부모 상담 주간</div><div class="srch-r"><b>2026 학부모 상담 안내</b><span>교육청 누리집 · 상담 신청 방법</span></div><div class="srch-r"><b>상담 주간 준비하기</b><span>블로그 · 질문 목록 정리</span></div></div>`,
      on: ['검색 결과는 내 컴퓨터에 없습니다. 검색어를 주문서에 적어 보내면 네이버 가게가 결과를 찾아 보내 줍니다.', 'ok'],
      off: ['검색은 네이버 가게에 주문을 보내야 하는 일입니다. 도로가 끊기면 주문이 나가지 못합니다.', 'bad'] }
  ];

  const appsEl = VB.$(root, '.apps');
  const win = VB.$(root, '.appwin');
  const winTitle = VB.$(root, '.appwin-title');
  const winBody = VB.$(root, '.appwin-body');
  const wifi1 = VB.$(root, '.wifi1');
  const wifiLabel = VB.$(root, '.wifi-label');
  const netState = VB.$(root, '.net-state');
  const msg1 = VB.$(root, '.msg1');
  let openApp = null;

  appsEl.innerHTML = apps.map((a, i) =>
    `<button type="button" class="app" data-i="${i}"><span class="app-ic" style="background:${a.bg}">${ic[a.id]}</span><span class="app-name">${a.name}</span></button>`
  ).join('');

  function showApp(i) {
    const a = apps[i];
    const on = wifi1.checked;
    openApp = i;
    win.hidden = false;
    winTitle.textContent = a.name;
    winBody.innerHTML = (a.net && !on) ? offErr : a.view(on);
    const [t, k] = on ? a.on : a.off;
    const tag = a.net ? '<span class="tag need">택배 필요</span>' : (a.partial ? '<span class="tag half">받아 둔 것 + 택배</span>' : '<span class="tag mine">내 서랍만</span>');
    VB.msg(msg1, `${tag} <b>${a.name}</b> · ${t}`, k);
  }
  appsEl.addEventListener('click', ev => {
    const b = ev.target.closest('.app'); if (!b) return;
    showApp(+b.dataset.i);
  });
  VB.$(root, '.appwin-x').addEventListener('click', () => { win.hidden = true; openApp = null; VB.msg(msg1, '앱을 눌러 보세요.'); });
  function setNet1() {
    const on = wifi1.checked;
    wifiLabel.textContent = on ? '와이파이 켜짐' : '와이파이 꺼짐';
    netState.textContent = on ? '온라인' : '오프라인';
    netState.classList.toggle('on', on);
    root.querySelector('.desk').classList.toggle('offline', !on);
    if (openApp !== null) showApp(openApp);
    else VB.msg(msg1, on ? '다시 온라인입니다. 앱을 눌러 보세요.' : '오프라인이 되었습니다. 이제 앱을 하나씩 눌러 보세요. 어떤 앱이 그대로 되나요?', on ? '' : 'warn');
  }
  wifi1.addEventListener('change', setNet1);

  /* ---------- 체험 2: 주문 보내기 ---------- */
  const wifi2 = VB.$(root, '.wifi2');
  const wifi2Label = VB.$(root, '.wifi2-label');
  const pick = VB.$(root, '.addr-pick');
  const goBtn = VB.$(root, '.go');
  const reload = VB.$(root, '.b2 .reload');
  const addr = VB.$(root, '.b2 .addr');
  const view = VB.$(root, '.b2 .browser-view');
  const track = VB.$(root, '.track2');
  const env = VB.$(root, '.t-env');
  const box = VB.$(root, '.t-box');
  const msg2 = VB.$(root, '.msg2');
  let cur = null, count = 0, run = 0, failed = false, busy = false;

  const pages = {
    'www.우리학교.kr': () => `<div class="pg school"><div class="pg-h">우리학교 홈페이지</div><ul><li>11월 학부모 상담 주간 안내</li><li>겨울방학 방과후 수업 신청</li><li>급식 식단표</li></ul></div>`,
    'www.naver.com': () => `<div class="pg naver"><div class="pg-logo">NAVER</div><div class="pg-search">검색어를 입력해 주세요</div><div class="pg-news"><span>오늘의 날씨 · 맑음</span><span>주요 소식</span></div></div>`,
    'www.youtube.com': () => `<div class="pg yt2"><div class="pg-yt">YouTube</div><div class="pg-thumbs"><i></i><i></i><i></i></div></div>`
  };
  const stamp = () => { const d = new Date(); return [d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2, '0')).join(':'); };

  function place(el, left, show) { el.style.left = left + '%'; el.style.opacity = show ? 1 : 0; }
  function moveAnim(el, from, to, ms) {
    el.style.opacity = 1;
    const a = el.animate([{ left: from + '%' }, { left: to + '%' }], { duration: ms, easing: 'ease-in-out', fill: 'forwards' });
    return a.finished.then(() => { el.style.left = to + '%'; a.cancel(); });
  }

  async function order(isReload) {
    if (busy) return;
    const target = isReload && cur ? cur : pick.value;
    const my = ++run; busy = true;
    goBtn.disabled = true;
    cur = target; count++;
    addr.textContent = 'https://' + target;
    reload.classList.remove('spin'); void reload.offsetWidth; reload.classList.add('spin');
    view.innerHTML = '<div class="bv-wait"><i></i>주문을 보내는 중입니다</div>';
    track.classList.remove('blocked', 'shop-on');
    place(env, 9, false); place(box, 86, false);
    VB.msg(msg2, `${isReload ? '새로고침: 같은 주문을 한 번 더 보냅니다.' : '주문서(요청)를 도로로 내보냅니다.'} 받을 서류: <code>${target}</code>의 첫 화면`);
    if (!wifi2.checked) {
      await moveAnim(env, 9, 15.5, 500);
      if (my !== run) return;
      track.classList.add('blocked');
      env.animate([{ transform: 'translateX(-50%)' }, { transform: 'translateX(-62%)' }, { transform: 'translateX(-40%)' }, { transform: 'translateX(-50%)' }], { duration: 380 });
      await VB.wait(500);
      if (my !== run) return;
      view.innerHTML = offErr.replace('네트워크 연결을 확인하세요.', 'ERR_INTERNET_DISCONNECTED');
      VB.msg(msg2, '주문서가 문 앞에서 멈췄습니다. 도로로 나가는 문(와이파이)이 닫혀 있어 가게까지 갈 수 없습니다. 그래서 상자도 오지 않습니다.', 'bad');
      failed = true;
    } else {
      await moveAnim(env, 9, 88, 1100);
      if (my !== run) return;
      place(env, 88, false);
      track.classList.add('shop-on');
      await VB.wait(450);
      if (my !== run) return;
      track.classList.remove('shop-on');
      await moveAnim(box, 88, 9, 1100);
      if (my !== run) return;
      place(box, 9, false);
      view.innerHTML = pages[target]() + `<div class="pg-foot">이 화면을 받은 시각 ${stamp()} · ${count}번째 주문</div>`;
      VB.msg(msg2, (failed ? '도로가 다시 열려 있어서 이번 주문은 가게까지 갔습니다. 새 상자를 받아 화면이 바뀌었습니다. ' : '') +
        '상자(응답)가 돌아왔고, 브라우저가 안의 서류를 읽어 화면으로 펼쳤습니다. 화면 아래 시각을 보세요. 새로고침할 때마다 새로 받은 시각으로 바뀝니다.', 'ok');
      failed = false;
      place(env, 9, false);
    }
    busy = false; goBtn.disabled = false;
  }
  goBtn.addEventListener('click', () => order(false));
  reload.addEventListener('click', () => order(true));
  wifi2.addEventListener('change', () => {
    wifi2Label.textContent = wifi2.checked ? '와이파이 켜짐' : '와이파이 꺼짐';
    track.classList.toggle('closed', !wifi2.checked);
    if (busy) return;
    if (wifi2.checked && failed) {
      VB.msg(msg2, '도로는 다시 열렸지만 화면은 여전히 "연결되어 있지 않습니다"입니다. 브라우저는 실패한 주문을 스스로 다시 보내지 않습니다. 새로고침 단추를 눌러 주문을 한 번 더 보내 보세요.', 'warn');
    } else if (!wifi2.checked) {
      VB.msg(msg2, '문이 닫혔습니다. 지금 보이는 화면은 이미 받아 둔 것이라 그대로 남아 있습니다. 이 상태로 이동이나 새로고침을 눌러 보세요.', 'warn');
    } else {
      VB.msg(msg2, '문이 열렸습니다. 주소를 고르고 이동을 눌러 보세요.');
    }
  });

  VB.$(root, '.reset').addEventListener('click', () => {
    wifi1.checked = true; win.hidden = true; openApp = null; setNet1();
    VB.msg(msg1, '앱을 눌러 보세요.');
    run++; busy = false; goBtn.disabled = false; cur = null; count = 0; failed = false;
    wifi2.checked = true; wifi2Label.textContent = '와이파이 켜짐';
    track.classList.remove('blocked', 'shop-on', 'closed');
    env.getAnimations().forEach(a => a.cancel()); box.getAnimations().forEach(a => a.cancel());
    place(env, 9, false); place(box, 9, false);
    pick.selectedIndex = 0;
    addr.textContent = '주소를 고르고 이동을 누르세요';
    view.innerHTML = '<div class="bv-empty">아직 아무것도 주문하지 않았습니다.</div>';
    VB.msg(msg2, '주소를 고르고 이동을 눌러 보세요.');
  });
  place(env, 9, false); place(box, 9, false);
});
