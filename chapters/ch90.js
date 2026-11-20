VB.ch('ch90', root => {
  // 화면 지도
  const info = VB.$(root, '.ch90-info');
  const zones = {
    explorer: ['탐색기 · 서랍장과 서류철', '열어 둔 프로젝트 폴더 안의 서류와 서류철이 보입니다. 조수가 파일을 만들면 여기에 새로 나타납니다.', [['ch01', '1장 서류와 양식'], ['ch02', '2장 폴더와 경로']]],
    editor: ['편집기 · 책상 위에 펼친 서류', '탐색기에서 고른 서류의 내용이 펼쳐집니다. 조수가 고친 줄은 색으로 표시되고, 받아들일지 거절할지 고를 수 있습니다.', [['ch03', '3장 서랍장과 책상'], ['ch06', '6장 코드는 서류'], ['ch17', '17장 세이브 포인트']]],
    terminal: ['터미널 · 조수가 글자로 일하는 창', '조수가 명령을 실행하는 곳입니다. 진열장(localhost)도 여기서 켭니다. 이 창을 닫으면 미리보기가 꺼집니다.', [['ch15', '15장 조수에게 글자로 시키는 창'], ['ch16', '16장 빨간 글씨가 떴을 때']]],
    agent: ['에이전트 패널 · AI 조수', '조수에게 말로 부탁하는 칸입니다. 조수의 답, 바뀐 파일 목록, 실행 허락 요청이 여기에 나옵니다. 편집기 화면에서는 오른쪽에 있습니다.', [['ch15', '15장 허락하기'], ['ch16', '16장 오류 알려 주기'], ['ch17', '17장 되돌리기']]],
    browser: ['크롬 창 · 내 방 진열장', '만든 앱은 크롬 같은 브라우저에서 localhost 주소로 확인합니다. 조수가 크롬을 직접 열어 눌러 보며 확인하기도 합니다. 고친 뒤에는 새로고침합니다.', [['ch11', '11장 localhost와 배포'], ['ch07', '7장 저장과 새로고침']]]
  };
  const zEls = VB.$$(root, '.ch90-zone');
  function pick(k) {
    zEls.forEach(z => z.classList.toggle('on', z.dataset.k === k));
    const [t, d, links] = zones[k];
    VB.msg(info, `<b>${t}</b><br>${d}<div class="ch90-links">${links.map(([id, n]) => `<a href="#${id}">${n}</a>`).join('')}</div>`, 'ok');
  }
  zEls.forEach(z => {
    z.addEventListener('click', () => pick(z.dataset.k));
    z.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(z.dataset.k); } });
  });

  // 체크리스트 (이 브라우저에만 저장)
  const KEY = 'vb-ch90-check';
  const items = [
    ['프로젝트용 빈 폴더를 영어 이름으로 만들었다', '예: <code>C:\\vibe\\seat-app</code>. 한글이나 띄어쓰기가 있으면 일부 도구가 경로를 잘못 읽습니다.', 'ch02'],
    ['파일 확장명 보기를 켰다', '탐색기 <b>보기 → 표시 → 파일 확장명</b>', 'ch01'],
    ['안티그래비티에서 그 폴더를 열었다', '조수는 열어 둔 폴더 안에서 일합니다.', 'ch02'],
    ['명령 실행 전에 허락을 묻는 설정인지 확인했다', '처음에는 매번 묻게 두는 것이 안전합니다.', 'ch15'],
    ['첫 요청 문장을 준비했다', '아래 예시를 참고하세요.', null],
    ['세이브 포인트를 만들 방법을 정했다', '폴더 복사 또는 git 커밋', 'ch17']
  ];
  let saved = [];
  try { saved = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { saved = []; }
  const box = VB.$(root, '.ch90-check');
  const count = VB.$(root, '.ch90-count');
  box.innerHTML = items.map(([t, d, ch], i) => `
    <label class="ch90-item"><input type="checkbox" data-i="${i}" ${saved[i] ? 'checked' : ''}>
      <span><b>${t}</b><small>${d}${ch ? ` <a href="#${ch}">${parseInt(ch.slice(2), 10)}장</a>` : ''}</small></span></label>`).join('');
  function upd() {
    const v = VB.$$(box, 'input').map(x => x.checked);
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {}
    const n = v.filter(Boolean).length;
    VB.msg(count, n === items.length ? `${items.length}개 모두 확인했습니다. 시작할 준비가 되었습니다.` : `${items.length}개 중 ${n}개 확인했습니다. 체크 상태는 이 브라우저에만 남습니다.`, n === items.length ? 'ok' : '');
  }
  box.addEventListener('change', upd);
  upd();

  // 복사 버튼
  VB.$$(root, '.ch90-copy').forEach(b => b.addEventListener('click', () => {
    const t = b.closest('.ch90-ask').querySelector('.ch90-q').textContent.trim();
    const done = () => { b.textContent = '복사됨'; setTimeout(() => { b.textContent = '복사'; }, 1500); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(t).then(done, () => fallback(t, done));
    } else fallback(t, done);
  }));
  function fallback(t, done) {
    const ta = document.createElement('textarea');
    ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) {}
    ta.remove();
  }
});
