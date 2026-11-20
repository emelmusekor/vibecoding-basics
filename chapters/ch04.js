VB.ch('ch04', root => {
  /* ---------- 그림: 사진 1장 = 약 1,000쪽 ---------- */
  const pagesG = VB.$(root, '.pages');
  const pcount = VB.$(root, '.pcount');
  const NS = 'http://www.w3.org/2000/svg';
  const rows = [];
  for (let r = 0; r < 20; r++) {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'prow');
    let h = '';
    for (let c = 0; c < 50; c++) h += `<rect x="${c * 12}" y="${r * 10.5}" width="10" height="9" rx="1"/>`;
    g.innerHTML = h;
    pagesG.appendChild(g);
    rows.push(g);
  }
  function playPages() {
    rows.forEach(g => g.classList.remove('on'));
    pcount.textContent = '0';
    rows.forEach((g, i) => setTimeout(() => {
      g.classList.add('on');
      pcount.textContent = ((i + 1) * 50).toLocaleString('ko-KR');
    }, 200 + i * 90));
  }
  VB.onShow(VB.$(root, '.pages-fig'), playPages);
  VB.$(root, '.pages-fig').addEventListener('click', playPages);

  /* ---------- 1. 서랍장 채우기 ---------- */
  const CAP = 256;
  const BASE = { name: '윈도우와 기본 프로그램', gb: 40, color: '#8a93a6' };
  const items = [
    { id: 'photo', name: '사진 1,000장', gb: 5, color: '#2b8a6c', ext: 'jpg', ex: '한 장 약 5MB' },
    { id: 'movie', name: '영화 1편', gb: 4, color: '#7650aa', ext: 'mp4', ex: '' },
    { id: 'song', name: '노래 1,000곡', gb: 4, color: '#d6a43a', ext: 'mp3', ex: '한 곡 약 4MB' },
    { id: 'doc', name: '문서 1,000개', gb: 0.1, color: '#2f6fb0', ext: 'hwp', ex: '한 개 약 100KB' },
    { id: 'game', name: '큰 게임 1개', gb: 50, color: '#c43d3d', ext: 'exe', ex: '' }
  ];
  const count = {};
  const box = VB.$(root, '.items');
  const drop = VB.$(root, '.drop');
  const gauge = VB.$(root, '.gauge');
  const legend = VB.$(root, '.legend');
  const free = VB.$(root, '.free');
  const dlg = VB.$(root, '.full-dlg');
  const dlgText = VB.$(root, '.full-text');
  const msg1 = VB.$(root, '.msg1');

  box.innerHTML = items.map(it => `
    <div class="item" draggable="true" data-id="${it.id}" style="--c:${it.color}">
      <div class="fileicon sm" data-ext="${it.ext}"><b>.${it.ext}</b></div>
      <div class="it-txt"><b>${it.name}</b><small>약 ${fmt(it.gb)}${it.ex ? ` (${it.ex})` : ''}</small></div>
      <div class="it-btns"><button type="button" class="minus" aria-label="${it.name} 빼기">−</button><button type="button" class="plus" aria-label="${it.name} 담기">+</button></div>
    </div>`).join('');

  function fmt(gb) { return gb >= 1 ? `${+gb.toFixed(1)}GB` : `${Math.round(gb * 1000)}MB`; }
  const used = () => BASE.gb + items.reduce((s, it) => s + (count[it.id] || 0) * it.gb, 0);

  function render() {
    const seg = (c, gb, t) => gb > 0 ? `<i style="background:${c};width:${(gb / CAP) * 100}%" title="${t}"></i>` : '';
    gauge.innerHTML = seg(BASE.color, BASE.gb, BASE.name) + items.map(it => seg(it.color, (count[it.id] || 0) * it.gb, it.name)).join('');
    const u = used();
    free.textContent = `${fmt(u)} 사용 · 남은 공간 약 ${fmt(Math.max(0, CAP - u))}`;
    free.classList.toggle('low', CAP - u < 20);
    legend.innerHTML = `<span><i style="background:${BASE.color}"></i>${BASE.name} 약 ${BASE.gb}GB</span>` +
      items.filter(it => count[it.id]).map(it => `<span><i style="background:${it.color}"></i>${it.name} × ${count[it.id]} = 약 ${fmt(count[it.id] * it.gb)}</span>`).join('');
    VB.$$(box, '.item').forEach(el => { el.querySelector('.minus').disabled = !count[el.dataset.id]; });
  }

  function add(id) {
    const it = items.find(x => x.id === id);
    const u = used();
    if (u + it.gb > CAP + 1e-9) {
      dlgText.textContent = `${it.name}(약 ${fmt(it.gb)})을(를) 넣을 자리가 없습니다. 남은 공간은 약 ${fmt(CAP - u)}입니다.`;
      dlg.classList.add('on');
      drop.classList.add('shake');
      setTimeout(() => drop.classList.remove('shake'), 450);
      VB.msg(msg1, `서랍장이 꽉 찼습니다. 휴대폰이나 컴퓨터에서 보는 "용량이 부족합니다"가 이 상황입니다. 큰 것부터 빼거나(−) 다른 곳으로 옮겨야 새로 넣을 수 있습니다.`, 'bad');
      return;
    }
    count[id] = (count[id] || 0) + 1;
    dlg.classList.remove('on');
    render();
    const rest = CAP - used();
    let t = `<b>${it.name}</b>(약 ${fmt(it.gb)})을(를) 담았습니다. 남은 공간 약 ${fmt(rest)}.`;
    if (id === 'doc') t += ' 문서는 1,000개를 담아도 막대가 거의 움직이지 않습니다. 글자는 아주 작은 상자에 들어갑니다.';
    if (id === 'game') t += ' 큰 프로그램 하나가 사진 1만 장만큼 자리를 차지합니다.';
    VB.msg(msg1, t, rest < 20 ? 'warn' : 'ok');
  }
  function remove(id) {
    if (!count[id]) return;
    count[id]--;
    dlg.classList.remove('on');
    render();
    const it = items.find(x => x.id === id);
    VB.msg(msg1, `<b>${it.name}</b>을(를) 뺐습니다. 남은 공간 약 ${fmt(CAP - used())}.`, 'ok');
  }

  box.addEventListener('click', ev => {
    const el = ev.target.closest('.item'); if (!el) return;
    if (ev.target.closest('.plus')) add(el.dataset.id);
    else if (ev.target.closest('.minus')) remove(el.dataset.id);
  });
  box.addEventListener('dragstart', ev => {
    const el = ev.target.closest('.item'); if (!el) return;
    ev.dataTransfer.setData('text/plain', el.dataset.id);
    ev.dataTransfer.effectAllowed = 'copy';
    drop.classList.add('ready');
  });
  box.addEventListener('dragend', () => drop.classList.remove('ready', 'over'));
  drop.addEventListener('dragover', ev => { ev.preventDefault(); drop.classList.add('over'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('over'));
  drop.addEventListener('drop', ev => {
    ev.preventDefault();
    drop.classList.remove('over', 'ready');
    const id = ev.dataTransfer.getData('text/plain');
    if (items.some(x => x.id === id)) add(id);
  });
  VB.$(root, '.full-ok').addEventListener('click', () => dlg.classList.remove('on'));

  /* ---------- 2. 사진 상자 줄이기 ---------- */
  const cvO = VB.$(root, '.cv-orig');
  const cvS = VB.$(root, '.cv-small');
  const shrinkBox = VB.$(root, '.shrink');
  const szSmall = VB.$(root, '.sz-small');
  const bxSmall = VB.$(root, '.bx-small');
  const wait = VB.$(root, '.ph-wait');
  const btnShrink = VB.$(root, '.do-shrink');
  const zoom = VB.$(root, '.zoom');
  const msg2 = VB.$(root, '.msg2');
  let shrunk = false;

  function scene(ctx, W, H) {
    const k = W / 1200;
    ctx.save();
    ctx.scale(k, k);
    const sky = ctx.createLinearGradient(0, 0, 0, 600);
    sky.addColorStop(0, '#8fc8ee'); sky.addColorStop(1, '#d9eefb');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, 1200, 900);
    ctx.fillStyle = '#f6c945'; ctx.beginPath(); ctx.arc(1010, 140, 70, 0, 7); ctx.fill();
    ctx.fillStyle = '#a7c7a0'; ctx.beginPath(); ctx.moveTo(0, 520); ctx.quadraticCurveTo(250, 380, 520, 500); ctx.quadraticCurveTo(820, 360, 1200, 480); ctx.lineTo(1200, 900); ctx.lineTo(0, 900); ctx.fill();
    ctx.fillStyle = '#6fbf73'; ctx.fillRect(0, 580, 1200, 320);
    // 잔디 결
    ctx.strokeStyle = '#4f9f55'; ctx.lineWidth = 2;
    for (let i = 0; i < 260; i++) {
      const x = (i * 97) % 1200, y = 600 + ((i * 53) % 290);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 4, y - 14); ctx.stroke();
    }
    // 만국기 줄
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 90); ctx.quadraticCurveTo(600, 200, 1200, 90); ctx.stroke();
    const fc = ['#e3632b', '#2f6fb0', '#f6c945', '#2b8a6c', '#7650aa', '#c43d3d'];
    for (let i = 0; i < 24; i++) {
      const t = (i + .5) / 24, x = t * 1200, y = 90 + 220 * t * (1 - t);
      ctx.fillStyle = fc[i % 6];
      ctx.beginPath(); ctx.moveTo(x - 14, y); ctx.lineTo(x + 14, y); ctx.lineTo(x, y + 30); ctx.fill();
    }
    // 현수막 (작은 글씨)
    ctx.fillStyle = '#fff'; ctx.fillRect(150, 300, 360, 70);
    ctx.strokeStyle = '#c43d3d'; ctx.lineWidth = 4; ctx.strokeRect(150, 300, 360, 70);
    ctx.fillStyle = '#c43d3d'; ctx.font = 'bold 34px "Malgun Gothic", sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('제12회 가을 운동회', 330, 347);
    ctx.fillStyle = '#7d5a35'; ctx.fillRect(160, 370, 8, 120); ctx.fillRect(492, 370, 8, 120);
    // 아이들
    const kids = [[420, '#e3632b'], [560, '#2f6fb0'], [700, '#7650aa'], [840, '#2b8a6c']];
    kids.forEach(([x, c], i) => {
      const y = 640 + (i % 2) * 20;
      ctx.fillStyle = '#f2c9a0'; ctx.beginPath(); ctx.arc(x, y - 110, 34, 0, 7); ctx.fill();
      ctx.fillStyle = '#1d2433'; ctx.beginPath(); ctx.arc(x, y - 120, 34, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#1d2433'; ctx.beginPath(); ctx.arc(x - 12, y - 108, 4, 0, 7); ctx.arc(x + 12, y - 108, 4, 0, 7); ctx.fill();
      ctx.fillStyle = c; ctx.fillRect(x - 36, y - 74, 72, 100);
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 30px Consolas, monospace'; ctx.fillText(String(i + 1), x, y - 16);
      ctx.fillStyle = '#34405a'; ctx.fillRect(x - 30, y + 26, 24, 70); ctx.fillRect(x + 6, y + 26, 24, 70);
    });
    ctx.restore();
  }
  scene(cvO.getContext('2d'), cvO.width, cvO.height);
  function drawSmall() {
    const c = cvS.getContext('2d');
    c.imageSmoothingEnabled = true;
    c.imageSmoothingQuality = 'high';
    c.drawImage(cvO, 0, 0, cvS.width, cvS.height);
  }

  btnShrink.addEventListener('click', () => {
    if (shrunk) return;
    shrunk = true;
    btnShrink.disabled = true;
    drawSmall();
    wait.classList.add('gone');
    shrinkBox.classList.add('shrunk');
    let v = 5.0;
    szSmall.textContent = '약 5.0MB';
    const tm = setInterval(() => {
      v = Math.max(0.3, v - 0.35);
      szSmall.textContent = `약 ${v.toFixed(1)}MB`;
      bxSmall.style.setProperty('--s', Math.sqrt(v / 5));
      if (v <= 0.3) {
        clearInterval(tm);
        VB.msg(msg2, '상자가 약 5MB에서 약 0.3MB로 줄었습니다. 약 15분의 1입니다. 그래도 화면에서 보기에는 차이가 거의 없습니다. 화면에 보이는 크기보다 훨씬 촘촘하게 찍혀 있던 점을 줄였기 때문입니다. 웹페이지에 쓰는 사진을 줄여 두면 페이지가 빨리 열리고 공간도 덜 차지합니다. 이 이야기는 뒤에서 로딩과 클라우드를 다룰 때 다시 나옵니다.', 'ok');
      }
    }, 60);
  });
  zoom.addEventListener('change', () => {
    shrinkBox.classList.toggle('zoomed', zoom.checked);
    if (zoom.checked) {
      VB.msg(msg2, shrunk
        ? '현수막 부분을 아주 크게 확대했습니다. 이 정도로 키우면 웹용 사진은 점이 보이고 글씨가 뭉개집니다. 크게 인쇄하거나 확대할 사진은 원본을 쓰고, 화면에 보여 줄 사진은 줄여서 씁니다.'
        : '원본은 크게 확대해도 글씨가 또렷합니다. 이제 "사진 줄이기"를 누르고 비교해 보세요.', shrunk ? 'warn' : '');
    } else {
      VB.msg(msg2, shrunk ? '보통 크기로 돌아왔습니다. 화면에서 볼 때는 두 사진이 거의 같습니다.' : '"사진 줄이기"를 눌러 보세요.');
    }
  });

  /* ---------- 처음으로 ---------- */
  function resetAll() {
    items.forEach(it => { count[it.id] = 0; });
    dlg.classList.remove('on');
    render();
    VB.msg(msg1, '처음에는 윈도우와 기본 프로그램이 서랍장 일부를 쓰고 있습니다.');
    shrunk = false;
    btnShrink.disabled = false;
    cvS.getContext('2d').clearRect(0, 0, cvS.width, cvS.height);
    wait.classList.remove('gone');
    shrinkBox.classList.remove('shrunk', 'zoomed');
    zoom.checked = false;
    szSmall.textContent = '-';
    bxSmall.style.setProperty('--s', 1);
    VB.msg(msg2, '"사진 줄이기"를 눌러 보세요.');
  }
  VB.$(root, '.reset').addEventListener('click', resetAll);
  resetAll();
});
