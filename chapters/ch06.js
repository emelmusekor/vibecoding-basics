VB.ch('ch06', root => {
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  /* ---------- 1. 메모장 vs 크롬 ---------- */
  const BODY = `  <h1>우리 반 알림장</h1>
  <p>내일 준비물: 색연필, 가위</p>
  <p>현장체험학습 신청서는 금요일까지 냅니다.</p>
  <button>확인했어요</button>`;
  const SRC = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>우리 반 알림장</title>
</head>
<body>
${BODY}
</body>
</html>`;
  const opView = VB.$(root, '.op-view');
  const msg1 = VB.$(root, '.msg1');
  const bNote = VB.$(root, '.op-note'), bChrome = VB.$(root, '.op-chrome');
  function openWith(app) {
    bNote.classList.toggle('primary', app === 'note');
    bChrome.classList.toggle('primary', app === 'chrome');
    if (app === 'note') {
      opView.innerHTML = `<div class="notepad"><div class="np-bar">index.html - 메모장</div><div class="np-menu">파일 &nbsp; 편집 &nbsp; 보기</div><pre class="np-text">${esc(SRC)}</pre></div>`;
      VB.msg(msg1, '메모장은 서류를 읽어 주지 않고 적힌 글자를 그대로 보여 줍니다. <code>&lt;h1&gt;</code>, <code>&lt;button&gt;</code> 같은 표시는 "여기는 큰 제목", "여기는 버튼"이라고 브라우저에게 알려 주는 말입니다.');
    } else {
      opView.innerHTML = `<div class="browser"><div class="browser-bar"><span class="dots"><i></i><i></i><i></i></span><span class="tabname">우리 반 알림장</span><span class="addr">file:///C:/알림장/index.html</span></div><div class="browser-view notice">${BODY}</div></div>`;
      VB.$(opView, '.notice button').addEventListener('click', () =>
        VB.msg(msg1, '버튼은 보이지만 눌러도 아무 일이 없습니다. 이 서류에는 "누르면 무엇을 하라"는 내용이 없기 때문입니다. 아래 체험에서 이어집니다.', 'warn'));
      VB.msg(msg1, '같은 서류를 크롬이 읽었습니다. 표시를 보고 큰 제목, 글, 버튼을 화면에 그렸습니다. <code>&lt;title&gt;</code>에 적은 글은 탭 이름에 나옵니다.', 'ok');
    }
  }
  bNote.addEventListener('click', () => openWith('note'));
  bChrome.addEventListener('click', () => openWith('chrome'));

  /* ---------- 2. HTML → CSS → JS ---------- */
  const T = s => `<span class="t">${esc(s)}</span>`;
  const S = s => `<span class="s">${esc(s)}</span>`;
  const K = s => `<span class="k">${esc(s)}</span>`;
  const FILES = [
    ['index.html', 'html', '화면의 뼈대',
      `${T('<h2>')}오늘의 출석${T('</h2>')}
${T('<button')} id=${S('"check"')}${T('>')}출석하기${T('</button>')}
${T('<p')} id=${S('"result"')}${T('></p>')}`],
    ['style.css', 'css', '꾸미기',
      `${K('button')} {
  background: ${S('#2f6fb0')};  color: ${S('white')};
  border-radius: ${S('12px')};  padding: ${S('10px 24px')};
}`],
    ['app.js', 'js', '움직임',
      `${K('const')} btn = document.querySelector(${S('"#check"')});
btn.onclick = () => {
  document.querySelector(${S('"#result"')}).textContent = ${S('"출석 완료!"')};
};`]
  ];
  const codes = VB.$(root, '.codes');
  const att = VB.$(root, '.att');
  const attBtn = VB.$(root, '#ch06-check');
  const attResult = VB.$(root, '.att-result');
  const msg2 = VB.$(root, '.msg2');
  let step = 1;
  function setStep(n) {
    step = n;
    VB.$$(root, '.steps button').forEach(b => b.classList.toggle('primary', +b.dataset.step === n));
    codes.innerHTML = FILES.slice(0, n).map(([name, ext, role, code], i) =>
      `<div class="cf${i === n - 1 ? ' new' : ''}"><div class="code-title"><span class="ext ${ext}">.${ext}</span>${name} <small>${role}</small></div><pre class="code">${code}</pre></div>`
    ).join('');
    att.classList.toggle('styled', n >= 2);
    attResult.textContent = '';
    attBtn.classList.remove('done');
    const text = {
      1: '1단계입니다. 뼈대만 있어서 버튼이 기본 모양 그대로입니다. 오른쪽 버튼을 눌러 보세요.',
      2: '2단계입니다. <code>style.css</code>를 더했더니 버튼 모양이 바뀌었습니다. 다시 눌러 보세요.',
      3: '3단계입니다. <code>app.js</code>를 더했습니다. 이제 버튼을 눌러 보세요.'
    }[n];
    VB.msg(msg2, text);
  }
  VB.$$(root, '.steps button').forEach(b => b.addEventListener('click', () => setStep(+b.dataset.step)));
  attBtn.addEventListener('click', () => {
    if (step < 3) {
      attBtn.classList.remove('nudge'); void attBtn.offsetWidth; attBtn.classList.add('nudge');
      VB.msg(msg2, step === 1
        ? '눌렀지만 아무 일도 일어나지 않습니다. 버튼이 "어디에 있는지"만 적혀 있고 "누르면 무엇을 할지"는 아무 서류에도 적혀 있지 않습니다.'
        : '모양은 예뻐졌지만 여전히 아무 일도 없습니다. CSS는 꾸미기만 합니다. 누르면 할 일은 자바스크립트 서류에 적어야 합니다.', 'warn');
      return;
    }
    attResult.textContent = '출석 완료!';
    attBtn.classList.add('done');
    attResult.classList.remove('pop'); void attResult.offsetWidth; attResult.classList.add('pop');
    VB.msg(msg2, '브라우저가 <code>app.js</code>를 읽고 "버튼을 누르면 아래 글자를 출석 완료!로 바꾸라"는 내용대로 했습니다. 바이브코딩에서 "버튼이 안 눌려요"라고 하면 AI는 주로 이 .js 서류를 고칩니다.', 'ok');
  });
  VB.$(root, '.build .reload').addEventListener('click', e => {
    e.currentTarget.classList.remove('spin'); void e.currentTarget.offsetWidth; e.currentTarget.classList.add('spin');
    attResult.textContent = ''; attBtn.classList.remove('done');
  });

  /* ---------- 3. 파이썬으로 이름 바꾸기 ---------- */
  const N = 8;
  const pics = VB.$(root, '.pics');
  const term = VB.$(root, '.py .term');
  const runBtn = VB.$(root, '.py .run');
  const msg3 = VB.$(root, '.msg3');
  const pad = (n, w) => String(n).padStart(w, '0');
  let runId = 0;
  function resetPics() {
    pics.innerHTML = Array.from({ length: N }, (_, i) =>
      `<li><div class="fileicon sm" data-ext="jpg"><b>.jpg</b></div><span class="pn">IMG_${pad(i + 1, 4)}.jpg</span></li>`).join('');
    term.innerHTML = '<span class="d">실행하면 여기에 파이썬이 한 일이 나옵니다.</span>';
  }
  runBtn.addEventListener('click', async () => {
    const my = ++runId;
    resetPics();
    runBtn.disabled = true;
    term.innerHTML = '<span class="p">C:\\사진&gt;</span> python 이름바꾸기.py\n';
    VB.msg(msg3, '파이썬이 서류를 위에서부터 읽으며 일하는 중입니다.');
    const items = VB.$$(pics, 'li');
    for (let i = 0; i < N; i++) {
      await VB.wait(380);
      if (my !== runId) return;
      const li = items[i];
      const oldName = `IMG_${pad(i + 1, 4)}.jpg`, newName = `운동회_${pad(i + 1, 3)}.jpg`;
      li.classList.add('work');
      await VB.wait(180);
      if (my !== runId) return;
      VB.$(li, '.pn').textContent = newName;
      li.classList.remove('work'); li.classList.add('done');
      term.innerHTML += `<span class="d">${oldName}</span> → ${newName}\n`;
    }
    term.innerHTML += '<span class="p">C:\\사진&gt;</span> ';
    runBtn.disabled = false;
    VB.msg(msg3, `사진 ${N}장의 이름이 모두 바뀌었습니다. 보기 쉽게 천천히 보여 드렸지만 실제로는 100장이어도 1초가 채 걸리지 않습니다. 이런 화면 밖의 일이 파이썬의 몫입니다.`, 'ok');
  });

  /* ---------- 처음으로 ---------- */
  function resetAll() {
    runId++;
    runBtn.disabled = false;
    openWith('note');
    VB.msg(msg1, '메모장으로 열면 적힌 글자가 그대로 보입니다. 크롬으로도 열어 보세요.');
    setStep(1);
    VB.msg(msg2, '1단계입니다. 오른쪽 화면의 버튼을 눌러 보세요.');
    resetPics();
    VB.msg(msg3, '실행을 눌러 보세요.');
  }
  VB.$(root, '.reset').addEventListener('click', resetAll);
  resetAll();
});
