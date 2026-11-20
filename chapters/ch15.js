VB.ch('ch15', root => {
  const term = VB.$(root, '.ch15-term');
  const treeEl = VB.$(root, '.ch15-tree');
  const pv = VB.$(root, '.ch15-pv');
  const ask = VB.$(root, '.ch15-ask');
  const msg = VB.$(root, '.lab-msg');
  const closeBtn = VB.$(root, '.ch15-close');
  const PROMPT = '우리반앱&gt;';

  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const steps = [
    {
      say: '화면 파일들을 넣어 둘 서류철을 하나 만들겠습니다.',
      cmd: 'mkdir pages',
      what: '<code>mkdir</code>는 "서류철을 만들어라"라는 뜻입니다. <code>pages</code>라는 빈 폴더가 하나 생깁니다. 아무것도 지우지 않는 안전한 명령입니다.',
      out: [],
      apply(s) { s.items.push({ name: 'pages', type: 'folder', kids: [], fresh: true }); },
      ok: '<code>pages</code> 서류철이 생겼습니다. 오른쪽 서랍에서 확인해 보세요.'
    },
    {
      say: '첫 화면 파일을 만들고 제목을 한 줄 적겠습니다.',
      cmd: 'echo "<h1>우리 반 자리 바꾸기</h1>" > index.html',
      what: '<code>echo</code>는 "이 글자를 적어라", 뒤의 <code>&gt;</code>는 "그 글자를 이 파일에 넣어라"라는 뜻입니다. <code>index.html</code>이라는 서류가 새로 생기고 안에 제목 한 줄이 들어갑니다.',
      out: [],
      apply(s) { s.items.push({ name: 'index.html', type: 'file', fresh: true }); s.page = true; },
      ok: '<code>index.html</code> 서류가 생겼습니다. 조수는 이렇게 파일도 글자로 만듭니다. 편집기에서 직접 쓰는 경우가 더 많지만 결과는 같습니다.'
    },
    {
      say: '앱에 필요한 부품을 내려받겠습니다.',
      cmd: 'npm install',
      what: '재료를 사 오는 명령입니다. <code>package.json</code>에 적힌 부품 목록을 보고 인터넷에서 내려받아 <code>node_modules</code> 서류철에 넣습니다. 부품이 많으면 시간이 조금 걸립니다.',
      out: [['d', 'added 87 packages in 4s']],
      apply(s) { s.items.push({ name: 'node_modules', type: 'folder', kids: [], fresh: true }); s.installed = true; },
      ok: '<code>node_modules</code> 서류철이 생겼습니다. 사 온 재료가 여기에 쌓입니다. 이 서류철은 크고 다시 받을 수 있어서 따로 챙기지 않아도 됩니다.'
    },
    {
      say: '미리보기를 켜겠습니다.',
      cmd: 'npm run dev',
      what: '내 방 진열장(11장의 localhost)을 켜는 명령입니다. 켜고 나면 이 터미널은 진열장을 지키느라 계속 일하는 상태가 됩니다. 이 창을 닫으면 진열장도 꺼집니다.',
      out: null,
      ok: ''
    },
    {
      danger: true,
      say: '사진 서류철을 정리하려고 합니다. 기존 images 폴더를 지우고 다시 만들겠습니다.',
      cmd: 'rm -rf images',
      what: '<code>rm</code>은 지우기, <code>-r</code>은 안에 든 것까지 전부, <code>-f</code>는 묻지 않고 강제로라는 뜻입니다. <code>images</code> 서류철과 그 안의 사진이 통째로 지워집니다. 휴지통을 거치지 않습니다.',
      out: [],
      apply(s) { s.items = s.items.filter(x => x.name !== 'images'); s.gone = true; },
      ok: ''
    }
  ];

  let st, token = 0;

  function fresh() {
    return {
      i: 0,
      items: [
        { name: 'images', type: 'folder', kids: ['단체사진.jpg', '운동회.jpg'] },
        { name: 'package.json', type: 'file' }
      ],
      page: false, installed: false, running: false, closed: false, gone: false
    };
  }

  function drawTree() {
    const rows = [];
    const sorted = st.items.slice().sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'folder' ? -1 : 1));
    sorted.forEach(x => {
      rows.push(`<li class="${x.fresh ? 'ch15-new' : ''}"><span class="ch15-ic ${x.type}"></span>${x.name}</li>`);
      if (x.kids) x.kids.forEach(k => rows.push(`<li class="ch15-kid"><span class="ch15-ic file img"></span>${k}</li>`));
    });
    treeEl.innerHTML = rows.join('') || '<li class="ch15-empty">(비어 있음)</li>';
    st.items.forEach(x => { x.fresh = false; });
  }

  function drawPreview() {
    if (st.running && !st.closed) {
      const photos = st.gone
        ? '<div class="ch15-broken">사진 없음</div><div class="ch15-broken">사진 없음</div>'
        : '<div class="ch15-photo"></div><div class="ch15-photo b"></div>';
      pv.innerHTML = `<div class="ch15-app"><b>우리 반 자리 바꾸기</b><div class="ch15-photos">${photos}</div></div>`;
    } else if (st.closed) {
      pv.innerHTML = '<div class="ch15-off"><b>사이트에 연결할 수 없음</b><br>localhost에서 연결을 거부했습니다.<br><span>ERR_CONNECTION_REFUSED</span></div>';
    } else {
      pv.innerHTML = '<div class="ch15-off">진열장이 아직 꺼져 있습니다.</div>';
    }
    closeBtn.disabled = !(st.running && !st.closed);
  }

  function line(html, cls) {
    const d = document.createElement('div');
    if (cls) d.className = cls;
    d.innerHTML = html;
    term.appendChild(d);
    term.scrollTop = term.scrollHeight;
    return d;
  }

  async function typeCmd(cmd, my) {
    const d = line(`<span class="p">${PROMPT}</span> <span class="ch15-typed"></span><span class="ch15-cur"></span>`);
    const t = d.querySelector('.ch15-typed');
    for (let k = 1; k <= cmd.length; k++) {
      if (my !== token) return false;
      t.textContent = cmd.slice(0, k);
      await VB.wait(28);
    }
    d.querySelector('.ch15-cur').remove();
    await VB.wait(250);
    return my === token;
  }

  function showAsk() {
    const s = steps[st.i];
    if (!s) {
      ask.innerHTML = `<div class="ch15-card done"><div class="ch15-who">AI 조수</div><p>제안할 명령이 더 없습니다. ${st.running && !st.closed ? '진열장이 켜진 터미널 창을 닫아 보면 어떻게 되는지도 확인해 보세요.' : '<b>처음으로</b>를 눌러 다른 선택도 해 보세요.'}</p></div>`;
      return;
    }
    ask.innerHTML = `
      <div class="ch15-card${s.danger ? ' danger' : ''}">
        <div class="ch15-who">AI 조수 <span>${st.i + 1} / ${steps.length}</span></div>
        <p>${s.say} 다음 명령을 실행할까요?</p>
        <div class="ch15-cmd"><code>${esc(s.cmd)}</code></div>
        ${s.danger ? '<div class="ch15-warn">지우는 명령입니다. <code>rm</code>과 <code>-f</code>(강제)가 들어 있습니다. 무엇이 지워지는지 확인하세요.</div>' : ''}
        <div class="ch15-what" hidden></div>
        <div class="row">
          <button class="btn ${s.danger ? 'danger' : 'primary'}" data-a="yes" type="button">허락</button>
          <button class="btn" data-a="no" type="button">거절</button>
          <button class="btn" data-a="what" type="button">이게 뭐야?</button>
        </div>
      </div>`;
  }

  function lock(on) { VB.$$(ask, 'button').forEach(b => { b.disabled = on; }); }

  ask.addEventListener('click', async ev => {
    const b = ev.target.closest('button[data-a]'); if (!b) return;
    const s = steps[st.i];
    const a = b.dataset.a;
    if (a === 'what') {
      const w = VB.$(ask, '.ch15-what');
      w.hidden = false;
      w.innerHTML = `<b>조수의 답</b> ${s.what}`;
      VB.msg(msg, '설명을 읽고 허락할지 정해 보세요. 모르는 명령은 이렇게 먼저 물어보면 됩니다.', s.danger ? 'warn' : '');
      return;
    }
    const my = token;
    if (a === 'no') {
      line(`<span class="d">(거절함) ${esc(s.cmd)} 은(는) 실행되지 않았습니다.</span>`);
      if (s.danger) VB.msg(msg, '잘 멈췄습니다. 사진은 그대로 남아 있습니다. 실제로는 조수에게 "images 폴더는 지우지 말고 정리만 해 줘"처럼 다시 부탁하면 됩니다.', 'ok');
      else VB.msg(msg, '거절하면 그 명령은 실행되지 않고, 조수는 다른 방법을 찾거나 다음 일로 넘어갑니다. 이 체험에서는 다음 제안으로 넘어갑니다.', '');
      st.i++; showAsk(); return;
    }
    // 허락
    lock(true);
    const ok = await typeCmd(s.cmd, my);
    if (!ok) return;
    if (st.i === 3) {
      if (!st.installed) {
        line('<span class="e">\'vite\'은(는) 내부 또는 외부 명령, 실행할 수 있는 프로그램, 또는 배치 파일이 아닙니다.</span>');
        VB.msg(msg, '앞에서 <code>npm install</code>을 거절해서 진열장을 켜는 데 필요한 부품이 없습니다. 재료 없이 요리를 시작하려 한 것과 같아서 오류가 났습니다. 이럴 때는 오류 글자를 조수에게 보여 주면 됩니다.', 'bad');
      } else {
        line('');
        line('<span class="d">  VITE ready in 312 ms</span>');
        line('  ➜  Local:   <span class="ch15-url">http://localhost:5173/</span>');
        st.running = true;
        line('<span class="d">[진열장은 켜 둔 채 새 터미널을 열어 계속합니다]</span>');
        VB.msg(msg, '진열장이 켜졌습니다. 오른쪽 미리보기에 화면이 보입니다. 이 터미널이 진열장을 지키고 있어서, 조수는 다음 명령을 새 터미널 창에서 실행합니다.', 'ok');
      }
      drawPreview();
    } else {
      for (const [c, t] of s.out) { await VB.wait(400); if (my !== token) return; line(`<span class="${c}">${esc(t)}</span>`); }
      s.apply(st);
      drawTree();
      if (s.danger) {
        line('<span class="d">(아무 메시지 없이 끝남)</span>');
        drawPreview();
        VB.msg(msg, '<code>images</code> 서류철과 사진 두 장이 사라졌습니다. 터미널은 "지웠습니다"라는 말도 없이 조용히 끝납니다. 휴지통에도 없습니다. 실제였다면 세이브 포인트(17장)가 없으면 되돌릴 길이 없습니다. 체험이니 <b>처음으로</b>를 누르면 돌아옵니다.', 'bad');
      } else {
        drawPreview();
        VB.msg(msg, s.ok, 'ok');
      }
    }
    st.i++;
    showAsk();
  });

  closeBtn.addEventListener('click', () => {
    st.closed = true;
    line('<span class="d">[진열장을 켜 둔 터미널 창을 닫았습니다]</span>');
    drawPreview();
    showAsk();
    VB.msg(msg, '진열장을 지키던 터미널을 닫았더니 미리보기가 "연결할 수 없음"으로 바뀌었습니다. 가게 불을 끈 것입니다. 파일은 그대로 있으니 조수에게 "미리보기 다시 켜 줘"라고 하면 됩니다.', 'warn');
  });

  function reset() {
    token++;
    st = fresh();
    term.innerHTML = '';
    line('<span class="d">AI 조수가 연 터미널입니다.</span>');
    drawTree(); drawPreview(); showAsk();
    VB.msg(msg, '조수의 첫 제안을 보고 골라 보세요.');
  }
  VB.$(root, '.reset').addEventListener('click', reset);
  reset();
});
