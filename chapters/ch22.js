VB.ch('ch22', root => {
  const form = VB.$(root, '.c22-form');
  const out = VB.$(root, '.c22-prompt');
  const warnBox = VB.$(root, '.c22-warn');
  const stepsBox = VB.$(root, '.c22-steps');
  const nextBtn = VB.$(root, '.c22-next');
  const copyBtn = VB.$(root, '.c22-copy');
  const msg = VB.$(root, '.lab .lab-msg');
  const wayBtns = VB.$$(root, '.c22-way button');
  const STEP_NAMES = ['1 움직이기', '2 규칙', '3 점수', '4 꾸미기'];
  let way = 'all', step = 0, doneUpTo = 0;

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const PH = '<span class="ph">(아직 안 정함)</span>';
  const val = (v) => v ? esc(v) : PH;

  /* 입력 읽기 */
  function chip(name) { const b = VB.$(form, `.c22-chips[data-name="${name}"] button[aria-pressed="true"]`); return b ? b.dataset.v : ''; }
  function read() {
    const f = n => (form.elements[n].value || '').trim();
    return {
      genre: chip('genre'), device: chip('device'), art: chip('art'), save: chip('save'), multi: chip('multi'),
      title: f('title'), intro: f('intro'), win: f('win'), lose: f('lose'),
      ctrl: VB.$$(form, 'input[name="ctrl"]:checked').map(i => i.value),
      rules: f('rules').split('\n').map(s => s.replace(/^\s*(\d+[.)]|[-*·])\s*/, '').trim()).filter(Boolean),
      score: f('score'), lives: form.elements.lives.value, layout: f('layout'),
      sound: VB.$(form, 'input[name="sound"]').checked
    };
  }

  /* 문장 재료 */
  const DEVICE = {
    pc: 'PC 크롬 브라우저에서 키보드와 마우스로 하는 게임이야.',
    phone: '휴대폰 세로 화면에서 손가락으로 하는 게임이야. 화면 크기에 맞게 보여 줘.',
    both: 'PC와 휴대폰 모두에서 할 수 있게 해 줘. 휴대폰에서는 터치나 화면 단추로도 조작되게 해 줘.'
  };
  const DEVICE_SHORT = { pc: 'PC', phone: '휴대폰', both: 'PC와 휴대폰 모두' };
  const ART = {
    shape: '그림 파일은 쓰지 말고 네모, 동그라미 같은 단순한 도형으로 그려 줘. 나중에 그림으로 바꿔 끼우기 쉽게 해 줘.',
    mine: '내가 그린 그림 파일을 쓸 거야. 처음에는 같은 크기의 도형으로 자리만 잡아 두고, 그림은 나중에 넣자.'
  };
  const ART_SHORT = { shape: '단순한 도형으로 시작', mine: '내가 그린 그림 파일(나중에 넣음)' };
  const SAVE = {
    none: '저장은 필요 없어. 새로고침하면 처음부터 시작해도 돼.',
    local: '최고 점수만 이 기기의 브라우저에 저장해 줘. 다른 기기와 나눌 필요는 없어.',
    board: '여러 사람이 함께 보는 점수판이 필요해. 점수를 어디에 저장하면 좋을지 방법을 먼저 몇 가지 알려 주고, 내가 고르면 그때 만들어 줘.'
  };
  const SAVE_SHORT = { none: '저장 안 함', local: '이 기기에 최고 점수만', board: '여럿이 보는 점수판' };
  const MULTI = {
    solo: '혼자 하는 게임이야.',
    same: '한 기기에서 두 사람이 함께 하는 게임이야. 서버는 필요 없어.',
    online: '각자 자기 기기로 함께 하는 게임이야. 서버가 필요할 테니, 처음에는 혼자 하는 버전부터 만들고 여럿이 하는 기능은 나중에 따로 이야기하자.'
  };
  const MULTI_SHORT = { solo: '혼자', same: '한 화면에서 둘이', online: '각자 기기로 함께' };
  const STEP1 = {
    '반응 속도': '화면 가운데 큰 네모를 그리고, 누르면 반응하는 것까지만 만들어 줘.',
    '피하기': '주인공 도형을 그리고 화면 안에서 움직이게만 해 줘.',
    '받기': '아래쪽에 받는 도형을 그리고 좌우로 움직이게만 해 줘.',
    '발판 점프': '주인공, 바닥, 발판 두세 개를 그리고 걷기와 점프만 되게 해 줘.',
    '짝 맞추기': '카드를 격자로 깔고, 누르면 뒤집히는 것까지만 만들어 줘.',
    '퀴즈': '문제 하나와 보기 단추를 띄우고, 보기를 누르면 고른 것이 표시되는 것까지만 만들어 줘.',
    '선택형 이야기': '장면 하나와 선택지 단추 두 개를 띄우고, 고르면 다음 장면으로 넘어가는 것까지만 만들어 줘.'
  };
  const sel = (map, k) => k ? esc(map[k]) : PH;

  function plan(d) {
    const rules = d.rules.length ? d.rules.map((r, i) => `  ${i + 1}. ${esc(r)}`).join('\n') : '  ' + PH;
    const lines = [
      '[게임 기획서]',
      d.title ? `- 이름: ${esc(d.title)}` : null,
      `- 장르: ${val(d.genre)}`,
      `- 한 줄 소개: ${val(d.intro)}`,
      `- 이기는 조건: ${val(d.win)}`,
      `- 지는 조건: ${val(d.lose)}`,
      `- 조작: ${d.ctrl.length ? esc(d.ctrl.join(', ')) : PH}`,
      `- 규칙:\n${rules}`,
      `- 점수: ${val(d.score)}`,
      `- 목숨: ${d.lives ? d.lives + '개' : '없음'}`,
      `- 화면 구성: ${val(d.layout)}`,
      `- 기기: ${sel(DEVICE_SHORT, d.device)}`,
      `- 그림: ${sel(ART_SHORT, d.art)} / 소리: ${d.sound ? '넣음' : '안 넣음'}`,
      `- 저장: ${sel(SAVE_SHORT, d.save)}`,
      `- 함께하기: ${sel(MULTI_SHORT, d.multi)}`
    ];
    return lines.filter(l => l !== null).join('\n');
  }
  const soundAll = d => d.sound ? '효과음은 소리 파일 없이 브라우저에서 만드는 짧은 소리로 넣고, 소리 끄기 단추도 만들어 줘.' : '소리는 넣지 마.';
  const ro = w => { const c = w.charCodeAt(w.length - 1) - 0xAC00; if (c < 0 || c > 11171) return '로'; const j = c % 28; return (j === 0 || j === 8) ? '로' : '으로'; };
  const ctrlText = d => d.ctrl.length ? '조작은 ' + esc(d.ctrl.join(', ')) + ro(d.ctrl[d.ctrl.length - 1]) + ' 하게 해 줘.' : '조작 방법: ' + PH;

  function promptAll(d) {
    return [
      '아래 기획서대로 브라우저에서 하는 게임을 만들어 줘.',
      '',
      plan(d),
      '',
      '만드는 방법',
      '- HTML 파일 하나로, 브라우저에서 열면 되게 만들어 줘. 인터넷에서 그림이나 음악을 가져오지 마.',
      '- ' + sel(DEVICE, d.device),
      '- ' + sel(ART, d.art),
      '- ' + soundAll(d),
      '- ' + sel(SAVE, d.save),
      '- ' + sel(MULTI, d.multi),
      '- 다 만들면 어떻게 해 보면 되는지 알려 줘.'
    ].join('\n');
  }
  function promptStep(d, i) {
    const keep = '이 단계에서 말하지 않은 것은 바꾸지 마.';
    if (i === 0) return [
      '아래 기획서의 게임을 만들 거야. 한 번에 다 만들지 말고 네 단계로 나눠서 할게. 지금은 1단계만 해 줘.',
      '',
      plan(d),
      '',
      '1단계 · 움직이기',
      '- ' + (d.genre && STEP1[d.genre] ? esc(STEP1[d.genre]) : '게임 화면을 그리고, 주인공(또는 누를 곳)이 조작에 반응하는 것까지만 만들어 줘.'),
      '- ' + ctrlText(d),
      '- ' + sel(DEVICE, d.device),
      '- HTML 파일 하나로 만들고, 그림은 단순한 도형으로 해 줘.',
      '- 규칙, 점수, 꾸미기는 아직 넣지 마.',
      '- 다 되면 내가 무엇을 눌러서 확인하면 되는지 알려 줘.'
    ].join('\n');
    if (i === 1) return [
      '1단계는 잘 돼. 먼저 지금 상태를 세이브 포인트로 커밋해 줘.',
      '',
      '2단계 · 규칙',
      '- 아래 규칙을 넣어 줘.',
      d.rules.length ? d.rules.map((r, k) => `  ${k + 1}. ${esc(r)}`).join('\n') : '  ' + PH,
      '- 이기는 조건: ' + val(d.win),
      '- 지는 조건: ' + val(d.lose),
      '- 이기거나 지면 결과를 보여 주고 [다시 하기] 단추를 만들어 줘.',
      '- 움직이는 방식은 바꾸지 마. ' + keep
    ].join('\n');
    if (i === 2) return [
      '2단계도 잘 돼. 지금 상태를 커밋해 줘.',
      '',
      '3단계 · 점수',
      '- 점수: ' + val(d.score),
      d.lives ? `- 목숨은 ${d.lives}개로 시작하고, 다 없어지면 지게 해 줘.` : '- 목숨은 없어.',
      '- 점수' + (d.lives ? '와 남은 목숨이' : '가') + ' 화면에 늘 보이게 해 줘.',
      '- ' + sel(SAVE, d.save),
      '- 규칙과 움직이는 방식은 바꾸지 마. ' + keep
    ].join('\n');
    const art4 = d.art === 'mine'
      ? '도형 자리에 내가 그린 그림 파일을 넣어 줘. 파일은 images 폴더에 넣어 둘게. 그림이 안 불러와지면 도형이 그대로 보이게 해 줘.'
      : (d.art === 'shape' ? '도형의 색과 크기를 보기 좋게 정리해 줘. 그림 파일은 아직 쓰지 마.' : '그림: ' + PH);
    const lines = [
      '3단계도 잘 돼. 지금 상태를 커밋해 줘.',
      '',
      '4단계 · 꾸미기와 소리',
      '- 화면 구성: ' + val(d.layout),
      '- ' + art4,
      '- ' + soundAll(d),
      '- 규칙, 점수 계산, 조작은 건드리지 마. ' + keep
    ];
    if (d.multi === 'online') lines.push('', '여기까지 끝나면 각자 기기로 함께 하는 기능을 어떻게 붙일지 따로 이야기하자. 서버가 필요하면 무료로 쓸 수 있는 방법과 그 한도도 알려 줘.');
    return lines.join('\n');
  }

  /* 빠진 칸 안내 */
  const REAL = ['마리오', '테트리스', '포켓몬', '카트라이더', '마인크래프트', '쿠키런', '애니팡', '로블록스', '젤다', '소닉', '팩맨', '배틀그라운드', '배그', '리그 오브 레전드', '롤', '메이플', '동물의 숲', '어몽어스', '앵그리버드', '캔디크러시', '브롤스타즈', '포트나이트', '오버워치', '스타크래프트', '피카츄', '슈퍼마리오'];
  function warnings(d) {
    const w = [], info = [];
    if (!d.genre) w.push('장르가 없습니다. 조수가 아무 장르나 고릅니다.');
    if (!d.win) w.push('이기는 조건이 없습니다. 무엇을 하면 성공인지 적어 주세요.');
    if (!d.lose) w.push('지는 조건(끝나는 때)이 없습니다. 게임이 끝나지 않고 계속될 수 있습니다.');
    if (!d.ctrl.length) w.push('조작을 고르지 않았습니다. 키보드인지 터치인지에 따라 만드는 방법이 달라집니다.');
    if (!d.device) w.push('기기를 고르지 않았습니다. 휴대폰에서 할 거라면 꼭 적어야 터치로도 됩니다.');
    else if (d.device !== 'pc' && d.ctrl.length && !d.ctrl.some(c => c === '화면 터치' || c === '화면 단추')) w.push('휴대폰에는 키보드가 없습니다. 조작에 화면 터치나 화면 단추를 함께 골라 주세요.');
    if (d.rules.length && d.rules.length < 3) w.push(`규칙이 ${d.rules.length}개입니다. 3~5개 적으면 원하는 게임에 더 가까워집니다.`);
    else if (!d.rules.length) w.push('규칙이 없습니다. 한 줄에 하나씩 3~5개 적어 주세요.');
    else if (d.rules.length > 6) w.push(`규칙이 ${d.rules.length}개입니다. 처음에는 5개 이하로 줄이고, 나머지는 잘 된 뒤에 하나씩 더하세요.`);
    const text = [d.title, d.intro, d.win, d.lose, d.layout, d.score].concat(d.rules).join(' ');
    const hit = REAL.filter(n => n.length > 1 && text.includes(n) && !(n === '롤' && !/(^|\s)롤(\s|$|처럼|같은)/.test(text)));
    if (hit.length) w.push(`실제 있는 게임 이름(${esc(hit.join(', '))})이 들어 있습니다. 이름과 캐릭터는 빼고 규칙을 직접 설명해 주세요.`);
    else if (/처럼|같은 게임|비슷하게/.test(text)) info.push('"○○처럼"보다 규칙을 직접 적는 편이 원하는 게임에 가깝고, 남의 게임을 베낄 걱정도 없습니다.');
    if (d.save === 'board') info.push('여럿이 보는 점수판은 장부(데이터베이스)가 있어야 합니다(12장).');
    if (d.multi === 'online') info.push('각자 기기로 함께 하려면 가게(서버)가 필요합니다(21장). 혼자 하는 버전을 먼저 완성하세요.');
    return { w, info };
  }

  /* 그리기 */
  function render() {
    const d = read();
    const { w, info } = warnings(d);
    warnBox.innerHTML = w.map(t => `<p>${t}</p>`).join('') + info.map(t => `<p class="info">${t}</p>`).join('');
    VB.$$(form, '.c22-f').forEach(l => l.classList.remove('miss'));
    if (!d.win) form.elements.win.closest('.c22-f').classList.add('miss');
    if (!d.lose) form.elements.lose.closest('.c22-f').classList.add('miss');
    if (way === 'all') {
      out.innerHTML = promptAll(d);
      stepsBox.hidden = true; nextBtn.hidden = true;
    } else {
      out.innerHTML = promptStep(d, step);
      stepsBox.hidden = false;
      stepsBox.innerHTML = STEP_NAMES.map((n, i) => `<button type="button" data-s="${i}" class="${i === step ? 'on' : ''}${i < doneUpTo ? ' done' : ''}">${n}</button>`).join('');
      nextBtn.hidden = false;
      nextBtn.disabled = step >= 3;
      nextBtn.textContent = step >= 3 ? '마지막 단계입니다' : `다음 단계 요청문 (${STEP_NAMES[step + 1]})`;
    }
    return { d, w };
  }

  form.addEventListener('input', render);
  form.addEventListener('change', render);
  VB.$$(form, '.c22-chips').forEach(g => g.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const was = b.getAttribute('aria-pressed') === 'true';
    VB.$$(g, 'button').forEach(x => x.setAttribute('aria-pressed', 'false'));
    if (!was) b.setAttribute('aria-pressed', 'true');
    render();
    if (g.dataset.name === 'genre' && !was) VB.msg(msg, `장르를 <b>${esc(b.dataset.v)}</b>${ro(b.dataset.v)} 골랐습니다. 이어서 이기는 조건과 지는 조건을 적어 보세요. 오른쪽 요청이 함께 바뀝니다.`);
  }));

  function setWay(wv, say) {
    way = wv; step = 0; doneUpTo = 0;
    wayBtns.forEach(b => b.setAttribute('aria-pressed', b.dataset.w === wv ? 'true' : 'false'));
    render();
    if (!say) return;
    if (wv === 'step') VB.msg(msg, '단계별로 보내면 1단계 요청만 먼저 보냅니다. 조수가 만든 것을 직접 해 보고, 잘 되면 <b>다음 단계 요청문</b>을 눌러 이어 갑니다. 단계마다 첫 줄에서 커밋(세이브 포인트)을 부탁합니다.', 'ok');
    else VB.msg(msg, '한 번에 다 보내는 요청입니다. 짧은 게임이면 괜찮지만, 규칙이 많을수록 어딘가 망가졌을 때 찾기 어렵습니다.');
  }
  wayBtns.forEach(b => b.addEventListener('click', () => setWay(b.dataset.w, true)));
  stepsBox.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    step = +b.dataset.s; render();
  });
  nextBtn.addEventListener('click', () => {
    if (step >= 3) return;
    doneUpTo = Math.max(doneUpTo, step + 1);
    step++; render();
    const say = [
      '',
      '2단계 요청입니다. 1단계 결과를 해 보고 잘 될 때 보냅니다. 첫 줄에서 지금 상태를 저장해 달라고 합니다.',
      '3단계 요청입니다. 점수를 넣을 때도 규칙과 움직임은 그대로 두라고 적었습니다.',
      '마지막 4단계 요청입니다. 그림과 소리는 게임이 다 된 다음에 손봅니다.'
    ][step];
    VB.msg(msg, say, 'ok');
  });

  copyBtn.addEventListener('click', async () => {
    const { w } = render();
    const text = out.textContent;
    let ok = false;
    try { await navigator.clipboard.writeText(text); ok = true; } catch (e) {
      const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
      ta.remove();
    }
    if (!ok) { VB.msg(msg, '복사하지 못했습니다. 오른쪽 글을 마우스로 끌어서 고른 뒤 <kbd>Ctrl</kbd>+<kbd>C</kbd>로 복사하세요.', 'bad'); return; }
    if (w.length) VB.msg(msg, `복사했습니다. 다만 노란 안내가 ${w.length}개 남아 있습니다. 빈칸이 있으면 조수가 마음대로 채웁니다.`, 'warn');
    else VB.msg(msg, '복사했습니다. 안티그래비티의 대화 칸에 붙여 넣으면(<kbd>Ctrl</kbd>+<kbd>V</kbd>) 됩니다.', 'ok');
  });

  /* 예시 */
  const EX = {
    react: {
      genre: '반응 속도', title: '번개 손', intro: '화면이 빨강에서 초록으로 바뀌는 순간 누르는 게임',
      win: '5번 모두 0.5초 안에 누르기', lose: '초록이 되기 전에 누르면 그 판은 실패',
      ctrl: ['스페이스', '화면 터치'],
      rules: '처음 화면은 빨간색이다\n2~5초 사이 아무 때나 초록으로 바뀐다\n초록이 되면 최대한 빨리 누른다\n5번 하고 나면 평균 시간을 보여 준다',
      score: '누르기까지 걸린 시간(초), 짧을수록 좋음', lives: '', layout: '위에 몇 번째 판인지, 가운데 큰 네모, 아래에 걸린 시간',
      device: 'both', art: 'shape', sound: true, save: 'local', multi: 'solo'
    },
    quiz: {
      genre: '퀴즈', title: '받아쓰기 대결', intro: '두 모둠이 번갈아 맞춤법이 맞는 낱말을 고르는 대결',
      win: '10문제가 끝났을 때 점수가 더 높은 모둠이 이긴다', lose: '점수가 낮은 모둠이 지고, 같으면 비긴다',
      ctrl: ['마우스 클릭', '화면 터치'],
      rules: '문제마다 낱말 두 개 가운데 맞춤법이 맞는 것을 고른다\n1모둠과 2모둠이 번갈아 푼다\n한 문제에 10초가 주어진다\n문제는 내가 적어 둔 목록에서 순서를 섞어 낸다',
      score: '맞히면 그 모둠에 1점', lives: '', layout: '위에 두 모둠 점수, 가운데 문제와 보기 두 개, 오른쪽 위에 남은 시간',
      device: 'pc', art: 'shape', sound: true, save: 'none', multi: 'same'
    },
    fruit: {
      genre: '받기', title: '과일 바구니', intro: '위에서 떨어지는 과일을 바구니로 받는 게임',
      win: '60초를 버티면 끝나고 점수가 기록된다', lose: '과일을 3번 놓치면 끝',
      ctrl: ['방향키', '화면 단추'],
      rules: '과일은 위쪽 아무 자리에서나 떨어진다\n시간이 갈수록 조금씩 빨라진다\n가끔 돌멩이가 떨어지고, 받으면 목숨이 하나 줄어든다\n바구니는 화면 밖으로 나가지 않는다',
      score: '과일 하나에 1점', lives: '3', layout: '위에 점수와 남은 목숨, 아래쪽에 바구니',
      device: 'both', art: 'shape', sound: false, save: 'local', multi: 'solo'
    }
  };
  function fill(e) {
    VB.$$(form, '.c22-chips').forEach(g => {
      const v = e ? e[g.dataset.name] : '';
      VB.$$(g, 'button').forEach(b => b.setAttribute('aria-pressed', v && b.dataset.v === v ? 'true' : 'false'));
    });
    ['title', 'intro', 'win', 'lose', 'rules', 'score', 'layout'].forEach(n => { form.elements[n].value = e ? e[n] : ''; });
    form.elements.lives.value = e ? e.lives : '';
    VB.$$(form, 'input[name="ctrl"]').forEach(i => { i.checked = !!e && e.ctrl.includes(i.value); });
    VB.$(form, 'input[name="sound"]').checked = !!(e && e.sound);
  }
  VB.$$(root, '.c22-ex button').forEach(b => b.addEventListener('click', () => {
    fill(EX[b.dataset.ex]); step = 0; doneUpTo = 0; render();
    VB.msg(msg, `<b>${esc(b.textContent)}</b> 예시를 불러왔습니다. 칸을 고쳐 보면 오른쪽 요청도 함께 바뀝니다. 위의 <b>단계별로</b>도 눌러 보세요.`, 'ok');
  }));

  VB.$(root, '.lab .reset').addEventListener('click', () => {
    fill(null); setWay('all', false);
    VB.msg(msg, '장르부터 골라 보세요.');
  });

  fill(null); setWay('all', false);
});
