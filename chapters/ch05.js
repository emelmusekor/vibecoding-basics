VB.ch('ch05', root => {
  /* ---------- 1. 꽂기와 뽑기 ---------- */
  const DEV = {
    usb: { label: 'USB 드라이브', size: '약 64GB', used: 30, color: '#2f6fb0' },
    hdd: { label: '외장 하드', size: '약 2TB', used: 55, color: '#4a5468' }
  };
  const FIXED = [['C', '로컬 디스크', '내 서랍장'], ['D', '로컬 디스크', '내 서랍장']];
  const drivesEl = VB.$(root, '.drives');
  const msg1 = VB.$(root, '.msg1');
  let plugged = {};      // dev -> letter
  let lastLetter = {};   // dev -> 지난번 글자

  function freeLetter() {
    const taken = Object.values(plugged);
    return ['E', 'F', 'G', 'H'].find(l => !taken.includes(l));
  }
  function driveIcon(color) {
    return `<svg viewBox="0 0 34 22" width="34" height="22" aria-hidden="true"><rect x="1" y="1" width="32" height="20" rx="4" fill="${color}"/><rect x="6" y="14" width="15" height="3" rx="1.5" fill="#fff"/></svg>`;
  }
  function renderDrives(fresh) {
    const rows = FIXED.map(([l, n, d]) =>
      `<li><span class="ic">${driveIcon('#8a93a6')}</span><span class="dn">${n} (${l}:)</span><span class="dd">${d}</span></li>`);
    Object.entries(plugged)
      .sort((a, b) => a[1].localeCompare(b[1]))
      .forEach(([dev, l]) => {
        const d = DEV[dev];
        rows.push(`<li class="ext${dev === fresh ? ' fresh' : ''}"><span class="ic">${driveIcon(d.color)}</span><span class="dn"><b>${d.label} (${l}:)</b><span class="cap"><i style="width:${d.used}%;background:${d.color}"></i></span></span><span class="dd">${d.size}</span></li>`);
      });
    drivesEl.innerHTML = rows.join('');
  }
  function renderDevs() {
    VB.$$(root, '.dev').forEach(el => {
      const on = !!plugged[el.dataset.dev];
      el.classList.toggle('in', on);
      const b = el.querySelector('button');
      b.textContent = on ? '뽑기' : '꽂기';
      b.classList.toggle('primary', !on);
    });
  }
  VB.$$(root, '.dev button').forEach(b => b.addEventListener('click', () => {
    const dev = b.closest('.dev').dataset.dev;
    const name = dev === 'usb' ? 'USB 메모리' : '외장하드';
    if (plugged[dev]) {
      const l = plugged[dev];
      delete plugged[dev];
      renderDevs(); renderDrives();
      VB.msg(msg1, `${name}를 뽑았습니다. '내 PC'에서 <b>${l}:</b> 서랍이 사라졌습니다. 그 안의 파일은 ${name} 안에 그대로 있고, 다시 꽂으면 보입니다.`);
      return;
    }
    const l = freeLetter();
    plugged[dev] = l;
    renderDevs(); renderDrives(dev);
    const prev = lastLetter[dev];
    lastLetter[dev] = l;
    if (prev && prev !== l) {
      VB.msg(msg1, `${name}가 이번에는 <b>${l}:</b>가 되었습니다. 지난번에는 <b>${prev}:</b>였습니다. 같은 서랍인데 꽂는 순서에 따라 이름이 바뀝니다. 그래서 <code>${prev}:\\우리반앱\\...</code>처럼 서랍 이름으로 시작하는 주소는 다음번에 맞지 않을 수 있습니다.`, 'warn');
    } else {
      const other = Object.keys(plugged).length > 1 ? ' 먼저 꽂힌 서랍이 앞 글자를 차지하고 있어서 다음 글자를 받았습니다.' : ' C:와 D:가 이미 있어서 비어 있는 다음 글자를 받았습니다.';
      VB.msg(msg1, `${name}를 꽂았습니다. '내 PC'에 <b>${l}:</b> 서랍이 생겼습니다.${other}`, 'ok');
    }
  }));

  /* ---------- 2. 복사 중에 뽑기 ---------- */
  const st = { plugged: true, copying: false, safe: false, pct: 0, file: null, timer: null };
  const barI = VB.$(root, '.copy .bar > i');
  const stateEl = VB.$(root, '.cp-state');
  const usbBox = VB.$(root, '.cp-usb');
  const usbFiles = VB.$(root, '.cp-files');
  const msg2 = VB.$(root, '.msg2');
  const bStart = VB.$(root, '.cp-start'), bYank = VB.$(root, '.cp-yank'),
        bSafe = VB.$(root, '.cp-safe'), bPlug = VB.$(root, '.cp-plug');

  function renderCopy() {
    barI.style.width = st.pct + '%';
    barI.style.background = st.file === 'torn' && !st.copying ? 'var(--bad)' : '';
    usbBox.classList.toggle('out', !st.plugged);
    usbBox.classList.toggle('safe', st.plugged && st.safe);
    let files = '';
    if (!st.plugged) files = '<div class="cp-empty">뽑혀 있음</div>';
    else if (st.safe) files = '<div class="cp-empty">이제 뽑아도 됩니다</div>';
    else if (st.copying) files = `<div class="cp-file ing"><div class="fileicon" data-ext="mp4"><b>.mp4</b></div><span>운동회영상.mp4<br><small>들어가는 중</small></span></div>`;
    else if (st.file === 'ok') files = `<div class="cp-file"><div class="fileicon" data-ext="mp4"><b>.mp4</b></div><span>운동회영상.mp4<br><small>약 2GB</small></span></div>`;
    else if (st.file === 'torn') files = `<div class="cp-file"><div class="fileicon torn" data-ext="none"><b>.mp4</b></div><span>운동회영상.mp4<br><small class="bad">열리지 않음</small></span></div>`;
    else files = '<div class="cp-empty">비어 있음</div>';
    usbFiles.innerHTML = files;
    bStart.disabled = st.copying || !st.plugged || st.safe;
    bYank.disabled = !st.plugged;
    bSafe.disabled = !st.plugged || st.safe;
    bPlug.disabled = st.plugged;
  }
  function stopTimer() { clearInterval(st.timer); st.timer = null; }

  bStart.addEventListener('click', () => {
    st.copying = true; st.pct = 0; st.file = null;
    stateEl.textContent = '복사 중 0%';
    VB.msg(msg2, '파일을 USB 서랍에 넣는 중입니다. 막대가 다 차기 전에 <b>그냥 뽑기</b>를 눌러 보세요.');
    renderCopy();
    st.timer = setInterval(() => {
      st.pct = Math.min(100, st.pct + 2);
      stateEl.textContent = `복사 중 ${st.pct}%`;
      barI.style.width = st.pct + '%';
      if (st.pct >= 100) {
        stopTimer(); st.copying = false; st.file = 'ok';
        stateEl.textContent = '복사 끝';
        VB.msg(msg2, '복사가 끝났습니다. 이번에는 <b>안전하게 제거</b>를 누른 뒤 뽑아 보세요.', 'ok');
        renderCopy();
      }
    }, 110);
  });
  bYank.addEventListener('click', () => {
    if (st.copying) {
      stopTimer(); st.copying = false; st.plugged = false; st.file = 'torn';
      stateEl.textContent = `${st.pct}%에서 멈춤`;
      VB.msg(msg2, `복사가 ${st.pct}%까지 되었을 때 뽑았습니다. 서류가 반만 서랍에 들어간 채로 서랍이 빠졌습니다. <b>다시 꽂기</b>를 눌러 보면 파일 이름은 보이지만 열리지 않습니다. 찢어진 서류처럼 내용이 중간에 끊겼기 때문입니다.`, 'bad');
    } else if (st.safe) {
      st.plugged = false; st.safe = false;
      stateEl.textContent = '안전하게 뽑음';
      VB.msg(msg2, st.file === 'ok'
        ? '안전하게 제거한 뒤 뽑았습니다. 다시 꽂아 보면 영상이 멀쩡히 들어 있습니다.'
        : '안전하게 제거한 뒤 뽑았습니다. 서랍 안의 파일은 그대로 지켜집니다.', 'ok');
    } else {
      st.plugged = false;
      stateEl.textContent = '뽑음';
      VB.msg(msg2, st.file === 'ok'
        ? '복사가 끝난 뒤라 이번에는 무사합니다. 다만 화면에서 끝난 것처럼 보여도 안에서 마무리 중일 때가 있습니다. <b>안전하게 제거</b>를 누르고 뽑는 습관을 들이면 안심입니다.'
        : '아무것도 옮기지 않는 중이라 문제는 없습니다. 그래도 뽑기 전에는 안전하게 제거를 누르는 것이 좋습니다.', 'warn');
    }
    renderCopy();
  });
  bSafe.addEventListener('click', () => {
    if (st.copying) {
      VB.msg(msg2, '"장치가 사용 중이라 꺼낼 수 없습니다." 복사가 아직 끝나지 않아 윈도우가 막았습니다. 막대가 다 찰 때까지 기다리세요.', 'warn');
      return;
    }
    st.safe = true;
    stateEl.textContent = '꺼내기 완료';
    VB.msg(msg2, '"이제 하드웨어를 안전하게 제거할 수 있습니다." 윈도우가 서랍에 넣던 일을 모두 마무리했다는 뜻입니다. 이제 <b>그냥 뽑기</b>를 눌러도 됩니다.', 'ok');
    renderCopy();
  });
  bPlug.addEventListener('click', () => {
    st.plugged = true; st.safe = false;
    stateEl.textContent = '대기 중';
    if (st.file === 'torn') {
      VB.msg(msg2, '다시 꽂았습니다. 운동회영상.mp4가 보이지만 반쯤만 들어간 파일이라 열리지 않습니다. 바탕화면에 원본이 남아 있으니 다시 복사하면 됩니다.', 'bad');
    } else {
      VB.msg(msg2, '다시 꽂았습니다. 서랍 안의 파일이 그대로 보입니다.', st.file === 'ok' ? 'ok' : '');
    }
    renderCopy();
  });

  /* ---------- 3. 다른 컴퓨터 ---------- */
  const ot = { where: null, fix: false };
  const whereEl = VB.$(root, '.ot-where');
  const srcEl = VB.$(root, '.ot-src');
  const addrEl = VB.$(root, '.other .addr');
  const viewEl = VB.$(root, '.ot-view');
  const fixEl = VB.$(root, '.ot-fix');
  const msg3 = VB.$(root, '.msg3');
  const bMine = VB.$(root, '.ot-mine'), bSchool = VB.$(root, '.ot-school');
  const logo = `<svg viewBox="0 0 120 80" width="120" height="80" aria-label="우리 반 로고"><rect width="120" height="80" rx="10" fill="#eaf1f9"/><circle cx="60" cy="36" r="20" fill="#f6c945"/><path d="M30 70 Q60 46 90 70" fill="#7cc47f"/><text x="60" y="42" font-size="13" font-weight="700" text-anchor="middle" fill="#8a6312">5-2</text></svg>`;
  const broken = `<div class="ot-broken"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M3 4h18v16H3z" fill="#fff" stroke="#8a93a6"/><path d="M3 15l5-5 4 4 3-3 6 6" fill="none" stroke="#c43d3d" stroke-width="1.6"/><path d="M14 3 l-3 8 4 2 -3 8" fill="none" stroke="#fff" stroke-width="2.4"/></svg><span>우리 반 로고</span></div>`;

  function renderOther() {
    bMine.classList.toggle('primary', ot.where !== 'school');
    bSchool.classList.toggle('primary', ot.where === 'school');
    const src = ot.fix ? 'logo.png' : 'E:\\우리반앱\\logo.png';
    srcEl.textContent = src;
    if (!ot.where) {
      whereEl.innerHTML = '아직 열지 않았습니다.';
      addrEl.textContent = '';
      viewEl.innerHTML = '<div class="ot-blank">열기 버튼을 누르세요</div>';
      return;
    }
    const L = ot.where === 'mine' ? 'E' : 'F';
    whereEl.innerHTML = ot.where === 'mine'
      ? '<b>내 노트북</b><br>USB 서랍 이름: <span class="lt">E:</span>'
      : '<b>학교 컴퓨터</b><br>E:는 이미 다른 서랍이 쓰는 중<br>USB 서랍 이름: <span class="lt bad">F:</span>';
    addrEl.textContent = `file:///${L}:/우리반앱/index.html`;
    const found = ot.fix || L === 'E';
    viewEl.innerHTML = `<div class="ot-page"><h5>우리 반 앱</h5>${found ? logo : broken}<p>오늘의 할 일을 확인하세요.</p></div>`;
    if (found && ot.fix) {
      VB.msg(msg3, `주소를 <code>logo.png</code>로만 적으면 "이 파일과 같은 서류철에 있는 logo.png"라는 뜻이 됩니다. 서랍 이름이 ${L}:여도 그림을 찾습니다. 2장의 주소 이야기와 이어집니다.`, 'ok');
    } else if (found) {
      VB.msg(msg3, '내 노트북에서는 USB가 E:라서 <code>E:\\우리반앱\\logo.png</code>에 그림이 있습니다. 잘 보입니다. 이제 학교 컴퓨터에 꽂아 보세요.', 'ok');
    } else {
      VB.msg(msg3, '학교 컴퓨터에서는 USB가 <b>F:</b>가 되었습니다. 그런데 파일 안에는 여전히 <code>E:\\우리반앱\\logo.png</code>라고 적혀 있습니다. E: 서랍에는 그 그림이 없으니 그림 자리가 깨져 보입니다. 위의 스위치를 켜 보세요.', 'bad');
    }
  }
  bMine.addEventListener('click', () => { ot.where = 'mine'; renderOther(); });
  bSchool.addEventListener('click', () => { ot.where = 'school'; renderOther(); });
  fixEl.addEventListener('change', () => { ot.fix = fixEl.checked; renderOther(); if (!ot.where) VB.msg(msg3, '주소를 바꿨습니다. 이제 열기 버튼을 눌러 보세요.'); });
  VB.$(root, '.other .reload').addEventListener('click', e => {
    e.currentTarget.classList.remove('spin'); void e.currentTarget.offsetWidth; e.currentTarget.classList.add('spin');
    renderOther();
  });

  /* ---------- 처음으로 ---------- */
  function resetAll() {
    plugged = {}; lastLetter = {};
    renderDevs(); renderDrives();
    VB.msg(msg1, '아직 아무것도 꽂지 않았습니다. 서랍장 C:와 D:만 있습니다.');
    stopTimer();
    Object.assign(st, { plugged: true, copying: false, safe: false, pct: 0, file: null });
    stateEl.textContent = '대기 중';
    renderCopy();
    VB.msg(msg2, '복사 시작을 눌러 보세요.');
    ot.where = null; ot.fix = false; fixEl.checked = false;
    renderOther();
    VB.msg(msg3, '내 노트북에서 열기를 눌러 보세요.');
  }
  VB.$(root, '.reset').addEventListener('click', resetAll);
  resetAll();
});
