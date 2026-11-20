VB.ch('ch10', root => {
  /* ---------- 체험 1: 원본 vs 줄여서 ---------- */
  const BASE_GB = 4;        // 지메일·사진이 이미 쓰는 양(예시)
  const HOME_MBPS = 50;     // 집 와이파이(대략)
  const cols = VB.$$(root, '.upcol').map(el => ({ el, mb: +el.dataset.mb, used: 0 }));
  const msg1 = VB.$(root, '.msg1');

  const fmtMB = mb => mb >= 1000 ? `약 ${(mb / 1000).toFixed(1)}GB` : `약 ${Math.round(mb)}MB`;
  function fmtT(t) {
    if (t < 10) return `약 ${t.toFixed(1)}초`;
    if (t < 60) return `약 ${Math.round(t)}초`;
    const m = Math.floor(t / 60), s = Math.round(t % 60);
    return s ? `약 ${m}분 ${s}초` : `약 ${m}분`;
  }
  const loadT = mb => mb ? 0.3 + mb * 8 / HOME_MBPS : 0;

  function draw(c) {
    const gb = c.used / 1000;
    VB.$(c.el, '.drive .base').style.width = (BASE_GB / 15 * 100) + '%';
    VB.$(c.el, '.drive .add').style.width = Math.min(100 - BASE_GB / 15 * 100, gb / 15 * 100) + '%';
    VB.$(c.el, '.g-drive').textContent = `${(BASE_GB + gb).toFixed(gb < 0.1 && gb > 0 ? 2 : 1)}GB 사용`;
    const gh = VB.$(c.el, '.gh');
    VB.$(gh, '.add').style.width = Math.min(100, gb * 100) + '%';
    gh.classList.toggle('over', gb > 1);
    VB.$(c.el, '.g-gh').textContent = c.used ? fmtMB(c.used) + (gb > 1 ? ' · 권장 넘음' : '') : '0MB';
    const t = loadT(c.used);
    const tEl = VB.$(c.el, '.g-time');
    tEl.textContent = c.used ? fmtT(t) : '-';
    tEl.className = 'g-time ' + (!c.used ? '' : t < 3 ? 'fast' : t < 10 ? 'mid' : 'slow');
  }
  cols.forEach((c, i) => {
    draw(c);
    VB.$(c.el, '.up-btn').addEventListener('click', () => {
      c.used += c.mb * 100;
      draw(c);
      c.el.classList.remove('bump'); void c.el.offsetWidth; c.el.classList.add('bump');
      const n = Math.round(c.used / (c.mb * 100)) * 100;
      const other = cols[1 - i];
      let h = i === 0
        ? `원본 사진 ${n}장은 ${fmtMB(c.used)}입니다. 이 사진을 모두 보여 주는 페이지는 집 와이파이에서도 ${fmtT(loadT(c.used))} 걸립니다.`
        : `줄인 사진 ${n}장은 ${fmtMB(c.used)}입니다. 화면에서 보기에는 원본과 거의 같고, 페이지는 ${fmtT(loadT(c.used))} 만에 열립니다.`;
      let type = i === 0 ? 'warn' : 'ok';
      if (c.used / 1000 > 1) { h += ' GitHub 저장소 권장 크기(약 1GB)를 넘었습니다. 올리고 내려받는 데 오래 걸리고, 경고를 받을 수 있습니다.'; type = 'bad'; }
      if (other.used) h += `<br>비교: 같은 장수라면 원본은 줄인 사진보다 약 ${Math.round(5 / 0.3)}배 무겁습니다.`;
      VB.msg(msg1, h, type);
    });
  });
  VB.$(root, '.vid-file').addEventListener('click', () => VB.msg(msg1,
    '영상 하나가 약 300MB입니다. GitHub는 파일 하나가 100MB를 넘으면 받지 않으므로 올라가지 않습니다. 다른 곳에 올라가더라도 보는 사람마다 300MB를 택배로 받아야 해서 페이지가 매우 느려집니다.', 'bad'));
  VB.$(root, '.vid-link').addEventListener('click', () => VB.msg(msg1,
    '프로젝트 폴더에는 영상 주소 한 줄만 들어갑니다. 영상은 유튜브의 창고에 있고, 유튜브가 보는 사람의 도로 사정에 맞춰 조금씩 보내 줍니다. 내 창고는 거의 차지 않습니다.', 'ok'));

  /* ---------- 체험 2: 동기화 충돌 ---------- */
  const F = (name, date, place, tag, cls) => ({ name, date, place, tag, cls });
  const orig = () => F('계획서.hwp', '5월 10일', '미정');
  const steps = [
    { a: [true, [orig()]], c: [orig()], b: [true, [orig()]],
      m: ['노트북, 창고, 학교 PC에 같은 계획서가 있습니다. 동기화가 잘 되어 있는 상태입니다.', ''] },
    { a: [false, [orig()]], c: [orig()], b: [false, [orig()]],
      m: ['노트북은 와이파이가 없는 기차 안에 있고, 학교 PC는 인터넷 점검으로 연결이 끊겼습니다. 둘 다 창고로 가는 도로가 끊겼습니다.', 'warn'] },
    { a: [false, [F('계획서.hwp', '5월 17일', '미정', '고침 · 아직 못 올림', 'edit')]], c: [orig()], b: [false, [orig()]],
      m: ['노트북에서 날짜를 5월 17일로 고쳤습니다. 도로가 끊겨 있어 창고에는 아직 옛 서류가 있습니다.', 'warn'] },
    { a: [false, [F('계획서.hwp', '5월 17일', '미정', '고침 · 아직 못 올림', 'edit')]], c: [orig()], b: [false, [F('계획서.hwp', '5월 10일', '과학관', '고침 · 아직 못 올림', 'edit')]],
      m: ['학교 PC에서는 옛 서류에 장소를 과학관으로 적었습니다. 이제 서로 다른 계획서가 두 장 생겼습니다. 각자 자기 것이 최신이라고 생각합니다.', 'warn'] },
    { a: [true, null], c: null, b: [true, null], flow: true,
      m: ['도로가 다시 연결되자 두 계획서가 모두 창고로 올라갔습니다. 창고는 어느 쪽이 맞는지 알 수 없어 둘 다 남깁니다. 한쪽 이름 뒤에 <code>(1)</code>이 붙은 사본이 생겼고, 이 사본이 노트북과 학교 PC에도 내려왔습니다.', 'bad'] },
    { a: [true, null], c: null, b: [true, null], merged: true,
      m: ['두 장을 열어 비교한 뒤 날짜와 장소를 한 장에 합치고 사본은 지웠습니다. 같은 서류는 한 곳에서만 고치거나, 고치기 전에 인터넷이 연결되어 동기화가 끝났는지 확인하면 이런 일이 줄어듭니다.', 'ok'] }
  ];
  const conflictFiles = () => [F('계획서.hwp', '5월 17일', '미정', '노트북에서 온 것'), F('계획서 (1).hwp', '5월 10일', '과학관', '학교 PC에서 온 사본', 'dup')];
  const mergedFiles = () => [F('계획서.hwp', '5월 17일', '과학관', '합친 서류', 'merged')];
  const devA = VB.$(root, '[data-d="a"]'), devB = VB.$(root, '[data-d="b"]'), devC = VB.$(root, '[data-d="c"]');
  const la = VB.$(root, '.la'), lb = VB.$(root, '.lb');
  const nextBtn = VB.$(root, '.next-step'), stepN = VB.$(root, '.step-n'), msg2 = VB.$(root, '.msg2');
  let step = 0;

  const fileHTML = f => `<li class="${f.cls || ''}"><div class="fileicon sm" data-ext="hwp"><b>.hwp</b></div><div><b class="fn">${f.name}</b><span>날짜 ${f.date} · 장소 ${f.place}</span>${f.tag ? `<em>${f.tag}</em>` : ''}</div></li>`;
  function setDev(el, on, files) {
    if (on !== null) {
      el.classList.toggle('off', !on);
      VB.$(el, '.st').textContent = on ? '온라인' : '오프라인';
    }
    VB.$(el, '.files').innerHTML = files.map(fileHTML).join('');
  }
  function render() {
    const s = steps[step];
    const files = s.merged ? mergedFiles() : s.flow ? conflictFiles() : null;
    setDev(devA, s.a[0], s.a[1] || files);
    setDev(devB, s.b[0], s.b[1] || files);
    setDev(devC, null, s.c || files);
    la.classList.toggle('off', !s.a[0]); lb.classList.toggle('off', !s.b[0]);
    la.classList.toggle('flow', !!s.flow); lb.classList.toggle('flow', !!s.flow);
    stepN.textContent = `${step + 1} / ${steps.length}`;
    nextBtn.disabled = step === steps.length - 1;
    nextBtn.textContent = step === steps.length - 1 ? '끝' : ['인터넷 끊기', '노트북에서 고치기', '학교 PC에서 고치기', '다시 연결하기', '정리하기'][step];
    VB.msg(msg2, s.m[0], s.m[1]);
  }
  nextBtn.addEventListener('click', () => { if (step < steps.length - 1) { step++; render(); } });

  VB.$(root, '.reset').addEventListener('click', () => {
    cols.forEach(c => { c.used = 0; draw(c); });
    VB.msg(msg1, '양쪽의 "사진 100장 올리기"를 눌러 보세요.');
    step = 0; render();
  });
  render();
});
