VB.ch('ch07', root => {
  const COLORS = { blue: ['파랑', '#2f6fb0'], red: ['빨강', '#c43d3d'], green: ['초록', '#2b8a4a'] };
  const PICS = {
    sun: ['해', '<svg viewBox="0 0 60 60" width="56" height="56"><g stroke="#e0a000" stroke-width="4" stroke-linecap="round"><line x1="30" y1="4" x2="30" y2="12"/><line x1="30" y1="48" x2="30" y2="56"/><line x1="4" y1="30" x2="12" y2="30"/><line x1="48" y1="30" x2="56" y2="30"/><line x1="12" y1="12" x2="17" y2="17"/><line x1="43" y1="43" x2="48" y2="48"/><line x1="12" y1="48" x2="17" y2="43"/><line x1="43" y1="17" x2="48" y2="12"/></g><circle cx="30" cy="30" r="13" fill="#f6c945"/></svg>'],
    star: ['별', '<svg viewBox="0 0 60 60" width="56" height="56"><polygon points="30,5 37,22 55,23 41,35 46,53 30,43 14,53 19,35 5,23 23,22" fill="#7650aa"/></svg>'],
    leaf: ['나뭇잎', '<svg viewBox="0 0 60 60" width="56" height="56"><path d="M10 50 C10 20 30 8 52 8 C52 32 38 50 10 50 Z" fill="#5fae64"/><path d="M12 48 L44 16" stroke="#2b8a4a" stroke-width="2.5"/></svg>']
  };
  const INIT = { title: '가을 운동회 안내', color: 'blue', pic: 'sun' };
  const KEYS = ['title', 'color', 'pic'];
  let draft, disk, view, cache;

  const lab = VB.$(root, '.lab');
  const inTitle = VB.$(root, '.in-title');
  const page = VB.$(root, '.page');
  const msg = VB.$(root, '.msg1');
  const inCache = VB.$(root, '.in-cache');
  const edState = VB.$(root, '.ed-state');
  const reloadBtn = VB.$(root, '.browser .reload');

  // 색·그림 고르는 단추
  VB.$(root, '.sw[data-k="color"]').innerHTML = Object.entries(COLORS).map(([k, [n, c]]) =>
    `<button type="button" data-v="${k}"><i style="background:${c}"></i>${n}</button>`).join('');
  VB.$(root, '.sw[data-k="pic"]').innerHTML = Object.entries(PICS).map(([k, [n]]) =>
    `<button type="button" data-v="${k}">${n}</button>`).join('');

  const isDirty = k => draft[k] !== disk[k];
  const anyDirty = () => KEYS.some(isDirty);
  const desc = o => `<span class="tk">"${esc(o.title)}"</span><span class="tk"><i style="background:${COLORS[o.color][1]}"></i>${COLORS[o.color][0]}</span><span class="tk">${PICS[o.pic][0]}</span>`;
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function renderEditor() {
    VB.$$(root, '.ed-tabs .tab').forEach(t => t.classList.toggle('dirty', isDirty(t.dataset.k)));
    VB.$$(root, '.sw').forEach(sw => VB.$$(sw, 'button').forEach(b =>
      b.classList.toggle('on', b.dataset.v === draft[sw.dataset.k])));
    if (inTitle.value !== draft.title) inTitle.value = draft.title;
    const n = KEYS.filter(isDirty).length;
    edState.textContent = n ? `저장 안 된 파일 ${n}개` : '모두 저장됨';
    edState.classList.toggle('dirty', n > 0);
  }
  function renderPage() {
    page.innerHTML = `<div class="pg-logo">${PICS[view.pic][1]}</div><div><h3 style="color:${COLORS[view.color][1]}">${esc(view.title)}</h3><p>우리 반 소식을 알려 드립니다.</p></div>`;
  }
  function renderWhere() {
    VB.$(root, '.w-ed .w-v').innerHTML = desc(draft);
    VB.$(root, '.w-disk .w-v').innerHTML = desc(disk);
    const on = inCache.checked;
    VB.$(root, '.w-cache').classList.toggle('off', !on);
    VB.$(root, '.w-cache .w-v').innerHTML = on
      ? `<span class="tk"><i style="background:${COLORS[cache.color][1]}"></i>${COLORS[cache.color][0]}</span><span class="tk">${PICS[cache.pic][0]}</span><small>글자색과 그림만 복사본으로 둠</small>`
      : '<small>꺼짐 · 매번 서랍에서 꺼내 옴</small>';
  }
  function renderAll() { renderEditor(); renderPage(); renderWhere(); }

  function edited() {
    renderEditor(); renderWhere();
    VB.msg(msg, '편집기 화면에서만 바뀌었습니다. 탭에 <b>●</b>가 생겼습니다. 아직 저장하지 않았다는 표시입니다. 이 상태로 먼저 새로고침을 눌러 보세요.');
  }
  inTitle.addEventListener('input', () => { draft.title = inTitle.value || ' '; edited(); });
  VB.$$(root, '.sw').forEach(sw => sw.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    draft[sw.dataset.k] = b.dataset.v; edited();
  }));

  function save() {
    if (!anyDirty()) {
      VB.msg(msg, '저장할 것이 없습니다. 탭에 ● 표시가 없으면 이미 서랍 속 서류와 편집기 내용이 같습니다.');
      return;
    }
    disk = { ...draft };
    renderEditor(); renderWhere();
    const w = VB.$(root, '.w-disk'); w.classList.remove('flash'); void w.offsetWidth; w.classList.add('flash');
    VB.msg(msg, '저장했습니다. 탭의 ● 가 사라지고 서랍 속 서류가 바뀌었습니다. 그래도 오른쪽 화면은 아직 그대로입니다. 이제 새로고침해 보세요.', 'ok');
  }

  async function reload(hard) {
    reloadBtn.classList.remove('spin'); void reloadBtn.offsetWidth; reloadBtn.classList.add('spin');
    page.classList.add('blank');
    await VB.wait(260);
    const old = { ...view };
    const useCache = inCache.checked && !hard;
    view = {
      title: disk.title,
      color: useCache ? cache.color : disk.color,
      pic: useCache ? cache.pic : disk.pic
    };
    if (!useCache) cache = { color: disk.color, pic: disk.pic };
    renderPage(); renderWhere();
    page.classList.remove('blank');

    const changed = KEYS.some(k => view[k] !== old[k]);
    const stale = useCache && (cache.color !== disk.color || cache.pic !== disk.pic);
    const dirty = anyDirty();
    const tail = dirty ? ' 그리고 탭에 ● 가 남은 파일은 아직 저장 전이라 반영되지 않았습니다.' : '';
    if (stale) {
      const head = view.title !== old.title ? '제목은 서랍에서 새로 꺼내 와서 바뀌었지만' : '새로고침을 했지만';
      VB.msg(msg, `${head}, 글자색과 그림은 책상 옆 복사본(캐시)에 있던 옛것이 그대로 쓰였습니다. 서랍 속 서류는 이미 바뀌어 있습니다. <b>강력 새로고침</b> (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd>)을 눌러 보세요.${tail}`, 'warn');
    } else if (dirty && !changed) {
      VB.msg(msg, '새로고침했지만 화면이 그대로입니다. 편집기 탭에 <b>●</b> 가 있습니다. 저장하지 않아서 서랍 속 서류가 바뀌지 않았기 때문입니다. 서랍에서 다시 꺼내 와도 옛 서류가 나옵니다. <b>저장</b>을 누른 뒤 다시 새로고침하세요.', 'bad');
    } else if (changed) {
      VB.msg(msg, (hard
        ? '강력 새로고침으로 복사본을 쓰지 않고 모든 서류를 서랍에서 새로 꺼내 왔습니다. 바뀐 내용이 모두 보입니다.'
        : '서랍에서 서류를 다시 꺼내 와서 바뀐 화면이 보입니다.') + tail, dirty ? 'warn' : 'ok');
      if (!inCache.checked && !dirty) VB.msg(msg, msg.innerHTML + ' 이번에는 아래 <b>캐시 상황</b> 스위치를 켜고 글자색이나 그림을 바꿔 저장한 뒤 새로고침해 보세요.', 'ok');
    } else {
      VB.msg(msg, '서랍 속 서류가 그대로라 화면도 같습니다. 편집기에서 무언가 고쳐 보세요.');
    }
  }

  VB.$(root, '.save').addEventListener('click', save);
  reloadBtn.addEventListener('click', () => reload(false));
  VB.$(root, '.r-soft').addEventListener('click', () => reload(false));
  VB.$(root, '.r-hard').addEventListener('click', () => reload(true));
  inCache.addEventListener('change', () => {
    renderWhere();
    VB.msg(msg, inCache.checked
      ? '캐시 상황을 켰습니다. 지금 화면에 보이는 글자색과 그림이 책상 옆 복사본으로 남아 있습니다. 글자색이나 그림을 바꿔 저장한 뒤 <b>새로고침</b>과 <b>강력 새로고침</b>을 차례로 눌러 보세요.'
      : '캐시 상황을 껐습니다. 새로고침할 때마다 모든 서류를 서랍에서 꺼내 옵니다.');
  });

  // 체험 칸 안에서만 동작하는 단축키
  lab.addEventListener('keydown', e => {
    const ctrl = e.ctrlKey || e.metaKey;
    const key = e.key.toLowerCase();
    if (e.key === 'F5') { e.preventDefault(); reload(ctrl || e.shiftKey); }
    else if (ctrl && key === 'r') { e.preventDefault(); reload(e.shiftKey); }
    else if (ctrl && key === 's') { e.preventDefault(); save(); }
  });

  function resetAll() {
    draft = { ...INIT }; disk = { ...INIT }; view = { ...INIT };
    cache = { color: INIT.color, pic: INIT.pic };
    inCache.checked = false;
    renderAll();
    VB.msg(msg, '편집기에서 제목 문구를 바꿔 보세요.');
  }
  VB.$(root, '.reset').addEventListener('click', resetAll);
  resetAll();
});
