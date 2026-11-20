VB.ch('ch03', root => {
  /* ---------- 1. 책상에 펼치기 ---------- */
  const OS = { id: 'os', name: '윈도우', size: 4, color: '#8a93a6' };
  const progs = [
    { id: 'hwp', name: '한글 문서', size: 2, color: '#2f6fb0' },
    { id: 'tab', name: '크롬 탭', size: 1, color: '#e3632b', multi: true, max: 10 },
    { id: 'video', name: '영상 편집', size: 7, color: '#7650aa' },
    { id: 'ag', name: '안티그래비티', size: 4, color: '#2b8a6c' },
    { id: 'xlsx', name: '엑셀', size: 2, color: '#1f7a46' },
    { id: 'kakao', name: '카카오톡', size: 1, color: '#d6a43a' }
  ];
  const CAP = 20; // 책상 칸 수 (한 칸 = 5%)
  const progBox = VB.$(root, '.progs');
  const desk = VB.$(root, '.desk');
  const deskbox = VB.$(root, '.deskbox');
  const swap = VB.$(root, '.swap');
  const swapCells = VB.$(root, '.swap-cells');
  const usage = VB.$(root, '.usage');
  const useBar = VB.$(root, '.use-bar');
  const openList = VB.$(root, '.open-list');
  const msg1 = VB.$(root, '.msg1');
  let open = [];
  let seq = 0;
  let busy = false;

  progBox.innerHTML = progs.map(p =>
    `<button class="prog" type="button" data-id="${p.id}"><span class="sw" style="background:${p.color}"></span>${p.name}<small>${p.size}칸</small></button>`
  ).join('');

  const used = () => OS.size + open.reduce((s, o) => s + o.p.size, 0);
  const label = o => o.p.multi ? `${o.p.name} ${o.n}` : o.p.name;

  function render() {
    const cells = [];
    [{ p: OS }, ...open].forEach(o => { for (let i = 0; i < o.p.size; i++) cells.push(o.p.color); });
    let h = '';
    for (let i = 0; i < CAP; i++) h += cells[i] ? `<div class="cell f" style="--c:${cells[i]}"></div>` : '<div class="cell"></div>';
    desk.innerHTML = h;
    const extra = cells.slice(CAP);
    swapCells.innerHTML = extra.map(c => `<div class="cell f" style="--c:${c}"></div>`).join('');
    const over = extra.length > 0;
    swap.classList.toggle('on', over);
    deskbox.classList.toggle('slow', over);
    const pct = used() * 5;
    usage.textContent = over ? `${pct}% · 꽉 참, 느려짐` : `${pct}%`;
    usage.classList.toggle('full', over);
    useBar.classList.toggle('full', over);
    useBar.firstElementChild.style.width = Math.min(100, pct) + '%';
    openList.innerHTML = `<span class="chip fixed"><span class="sw" style="background:${OS.color}"></span>윈도우 (늘 켜져 있음)</span>` +
      open.map(o => `<span class="chip"><span class="sw" style="background:${o.p.color}"></span>${label(o)}<button type="button" data-k="${o.k}" aria-label="${label(o)} 닫기">×</button></span>`).join('');
    VB.$$(progBox, '.prog').forEach(b => b.classList.toggle('isopen', open.some(o => o.p.id === b.dataset.id)));
  }

  function fly(fromEl, color) {
    const a = fromEl.getBoundingClientRect();
    const b = desk.getBoundingClientRect();
    if (!a.width || !b.width) return;
    const f = document.createElement('div');
    f.className = 'flyer';
    f.style.setProperty('--c', color);
    f.style.left = a.left + a.width / 2 - 17 + 'px';
    f.style.top = a.top + 'px';
    root.appendChild(f);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2);
    const dy = b.top + b.height / 2 - a.top - 21;
    const an = f.animate([
      { transform: 'translate(0,0) scale(.6)', opacity: 0 },
      { transform: `translate(${dx * .5}px, ${dy * .5 - 30}px) scale(1)`, opacity: 1, offset: .5 },
      { transform: `translate(${dx}px, ${dy}px) scale(.8)`, opacity: 0 }
    ], { duration: 650, easing: 'ease-in-out' });
    an.onfinish = () => f.remove();
  }

  progBox.addEventListener('click', async ev => {
    const btn = ev.target.closest('.prog'); if (!btn || busy) return;
    const p = progs.find(x => x.id === btn.dataset.id);
    const mine = open.filter(o => o.p.id === p.id);
    if (!p.multi && mine.length) {
      VB.msg(msg1, `<b>${p.name}</b>은(는) 이미 책상에 펼쳐져 있어서 바로 화면에 나옵니다. 다시 꺼낼 필요가 없습니다.`, 'ok');
      return;
    }
    if (p.multi && mine.length >= p.max) {
      VB.msg(msg1, `크롬 탭이 ${p.max}개나 열려 있습니다. 탭 하나하나가 책상 자리를 차지합니다. 안 쓰는 탭을 닫아 보세요.`, 'warn');
      return;
    }
    const willOver = used() + p.size > CAP;
    const wait = (300 + p.size * 120) * (willOver ? 2.5 : 1);
    busy = true;
    btn.classList.add('busy');
    const old = btn.innerHTML;
    btn.innerHTML = `<span class="sw" style="background:${p.color}"></span>꺼내는 중…`;
    VB.msg(msg1, `<b>${p.name}</b>을(를) 서랍에서 꺼내 책상에 펼치는 중입니다. 이 기다림이 로딩입니다.${willOver ? ' 책상이 모자라 평소보다 오래 걸립니다.' : ''}`);
    fly(btn, p.color);
    await VB.wait(wait);
    btn.classList.remove('busy');
    btn.innerHTML = old;
    busy = false;
    const n = p.multi ? (mine.length ? Math.max(...mine.map(o => o.n)) + 1 : 1) : 0;
    open.push({ p, n, k: ++seq });
    render();
    const pct = used() * 5;
    if (used() > CAP) {
      VB.msg(msg1, `책상이 꽉 찼습니다(${pct}%). 남는 서류는 서랍장 일부를 빌린 <b>임시 책상</b>에 놓입니다. 서랍장은 손이 닿는 데 오래 걸려서 컴퓨터 전체가 느려집니다. 안 쓰는 프로그램을 × 로 닫아 보세요.`, 'bad');
    } else {
      VB.msg(msg1, `<b>${label(open[open.length - 1])}</b>을(를) 책상에 펼쳤습니다. 로딩에 약 ${(wait / 1000).toFixed(1)}초 걸렸습니다. 큰 프로그램일수록 꺼낼 것이 많아 오래 걸립니다. 책상 사용량 ${pct}%.`, pct >= 80 ? 'warn' : 'ok');
    }
  });

  openList.addEventListener('click', ev => {
    const b = ev.target.closest('button[data-k]'); if (!b) return;
    const o = open.find(x => x.k === +b.dataset.k);
    open = open.filter(x => x !== o);
    render();
    const still = used() > CAP;
    VB.msg(msg1, `<b>${label(o)}</b>을(를) 닫았습니다. 책상에서 치워져 자리가 생겼습니다.${still ? ' 아직 책상이 넘칩니다. 더 닫아 보세요.' : ' 다시 넉넉해졌습니다.'}`, still ? 'warn' : 'ok');
  });

  VB.$(root, '.restart').addEventListener('click', async () => {
    if (busy) return;
    busy = true;
    open = [];
    desk.innerHTML = '';
    swap.classList.remove('on');
    deskbox.classList.remove('slow');
    usage.textContent = '다시 시작하는 중…';
    useBar.firstElementChild.style.width = '0%';
    openList.innerHTML = '';
    VB.msg(msg1, '전원을 껐다가 다시 켜는 중입니다.');
    await VB.wait(900);
    busy = false;
    render();
    VB.msg(msg1, '다시 시작하면서 책상이 싹 치워졌고 윈도우만 다시 펼쳐졌습니다. 컴퓨터를 껐다 켜면 빨라지는 이유입니다. 다만 켜 두었던 프로그램은 다시 열어야 합니다.', 'ok');
  });

  /* ---------- 2. 저장하고 끄기 ---------- */
  const ORIGINAL = '11월 현장체험학습 안내\n날짜: 11월 27일(금)\n장소: 국립과천과학관';
  const EDITS = ['준비물: 도시락, 물, 돗자리', '모이는 시간: 오전 9시, 학교 운동장'];
  const s = { drawer: ORIGINAL, open: false, on: true, round: 0, offText: null, how: '' };
  const docDrawer = VB.$(root, '.doc-drawer');
  const editor = VB.$(root, '.editor');
  const ta = VB.$(root, '.ed-text');
  const dirty = VB.$(root, '.dirty');
  const empty = VB.$(root, '.desk-empty');
  const offScreen = VB.$(root, '.off-screen');
  const power = VB.$(root, '.power');
  const hist = VB.$(root, '.history');
  const msg2 = VB.$(root, '.msg2');
  const B = {
    open: VB.$(root, '.s-open'), edit: VB.$(root, '.s-edit'), save: VB.$(root, '.s-save'),
    offsave: VB.$(root, '.s-offsave'), offnosave: VB.$(root, '.s-offnosave'), on: VB.$(root, '.s-on')
  };
  let sBusy = false;

  function sRender() {
    docDrawer.textContent = s.drawer;
    editor.className = 'editor' + (s.open ? ' on' : '');
    empty.classList.toggle('hide', s.open);
    offScreen.classList.toggle('on', !s.on);
    power.textContent = s.on ? '전원 켜짐' : '전원 꺼짐';
    power.classList.toggle('off', !s.on);
    const isDirty = s.open && ta.value !== s.drawer;
    dirty.classList.toggle('on', isDirty);
    B.open.disabled = sBusy || !s.on || s.open;
    B.edit.disabled = sBusy || !s.open;
    B.save.disabled = sBusy || !s.open;
    B.offsave.disabled = sBusy || !s.open;
    B.offnosave.disabled = sBusy || !s.open;
    B.on.disabled = sBusy || s.on;
  }
  const isDirty = () => s.open && ta.value !== s.drawer;
  function save() {
    if (!s.open) return;
    const changed = isDirty();
    s.drawer = ta.value;
    docDrawer.classList.add('flash');
    setTimeout(() => docDrawer.classList.remove('flash'), 600);
    sRender();
    return changed;
  }
  async function openDoc(text) {
    sBusy = true; sRender();
    empty.textContent = '서랍에서 꺼내는 중…';
    await VB.wait(700);
    empty.textContent = '책상이 비어 있습니다';
    ta.value = s.drawer;
    s.open = true; sBusy = false;
    sRender();
  }

  B.open.addEventListener('click', async () => {
    await openDoc();
    VB.msg(msg2, '서랍 속 서류를 꺼내 책상에 펼쳤습니다. 이제 오른쪽 칸의 글을 직접 고치거나 "한 줄 고치기"를 눌러 보세요.', 'ok');
  });
  B.edit.addEventListener('click', () => {
    const add = EDITS.find(e => !ta.value.includes(e)) || '(덧붙임) ' + EDITS[0];
    ta.value = ta.value.replace(/\s+$/, '') + '\n' + add;
    sRender();
    VB.msg(msg2, '책상 위 서류만 고쳤습니다. 왼쪽 서랍 속 서류는 아직 그대로입니다. 이제 끄는 방법을 골라 보세요.', 'warn');
  });
  ta.addEventListener('input', () => {
    sRender();
    if (isDirty()) VB.msg(msg2, '책상 위 서류를 고치는 중입니다. 서랍 속 서류는 아직 그대로입니다.', 'warn');
  });
  ta.addEventListener('keydown', ev => {
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 's') {
      ev.preventDefault();
      save();
      VB.msg(msg2, '<kbd>Ctrl</kbd>+<kbd>S</kbd>로 저장했습니다. 고친 서류를 서랍에 다시 넣었습니다.', 'ok');
    }
  });
  B.save.addEventListener('click', () => {
    const changed = save();
    VB.msg(msg2, changed ? '저장했습니다. 고친 서류를 서랍에 다시 넣어서 왼쪽 서랍 속 서류도 바뀌었습니다.' : '고친 내용이 없어서 서랍 속 서류와 같습니다.', 'ok');
  });

  async function powerOff(withSave) {
    const wasDirty = isDirty();
    if (withSave) save();
    s.offText = ta.value;
    s.how = withSave ? '저장하고 끔' : '저장 안 하고 끔';
    s.edited = wasDirty;
    sBusy = true;
    editor.className = 'editor away';
    sRender(); editor.className = 'editor away';
    await VB.wait(500);
    s.open = false; s.on = false; sBusy = false;
    ta.value = '';
    sRender();
    VB.msg(msg2, withSave
      ? '고친 서류를 서랍에 넣은 뒤 전원을 껐습니다. 책상 위는 치워졌습니다. "다시 켜서 열기"를 눌러 확인해 보세요.'
      : '저장하지 않고 전원을 껐습니다. 책상 위가 통째로 치워졌습니다. "다시 켜서 열기"를 눌러 확인해 보세요.', withSave ? 'ok' : 'warn');
  }
  B.offsave.addEventListener('click', () => powerOff(true));
  B.offnosave.addEventListener('click', () => powerOff(false));

  B.on.addEventListener('click', async () => {
    s.on = true; sRender();
    await openDoc();
    s.round++;
    const kept = s.offText === s.drawer;
    let res, cls;
    if (!s.edited) { res = '고친 것이 없었으니 그대로'; cls = 'ok'; }
    else if (kept) { res = '고친 내용이 남아 있음'; cls = 'ok'; }
    else { res = '고친 내용이 사라짐'; cls = 'bad'; }
    const li = document.createElement('li');
    li.innerHTML = `${s.round}번째 · ${s.how} → 다시 켜서 열어 보니 <b class="${cls}">${res}</b>`;
    hist.appendChild(li);
    if (!s.edited) VB.msg(msg2, '고친 것 없이 껐다 켰습니다. 이번에는 "한 줄 고치기"를 누른 뒤 꺼 보세요.');
    else if (kept) VB.msg(msg2, '저장해 두었기 때문에 서랍 속 서류가 고친 내용으로 바뀌어 있었습니다. 다시 켜서 꺼내도 고친 줄이 그대로 있습니다.', 'ok');
    else VB.msg(msg2, '고친 줄이 없습니다. 고친 내용은 책상 위에만 있었고, 전원을 끄면서 책상이 치워졌습니다. 서랍에는 고치기 전 서류만 남아 있었습니다.', 'bad');
  });

  /* ---------- 처음으로 ---------- */
  VB.$(root, '.reset').addEventListener('click', () => {
    open = []; busy = false; render();
    VB.msg(msg1, '윈도우 자체가 늘 책상 일부를 쓰고 있습니다. 프로그램을 눌러 켜 보세요.');
    Object.assign(s, { drawer: ORIGINAL, open: false, on: true, round: 0, offText: null, how: '', edited: false });
    sBusy = false; ta.value = ''; hist.innerHTML = '';
    empty.textContent = '책상이 비어 있습니다';
    sRender();
    VB.msg(msg2, '"문서 열기"부터 눌러 보세요.');
  });

  render();
  sRender();
});
