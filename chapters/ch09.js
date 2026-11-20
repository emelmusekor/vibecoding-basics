VB.ch('ch09', root => {
  // 도로 사정: mbps = 실제로 쓸 수 있는 대략의 속도, rtt = 주문서가 한 번 오가는 시간(초)
  const nets = [
    { name: '학교 와이파이 (다 같이 쓸 때)', mbps: 3, rtt: 0.12 },
    { name: '휴대폰 LTE', mbps: 20, rtt: 0.06 },
    { name: '집 와이파이', mbps: 50, rtt: 0.03 },
    { name: '유선 랜선', mbps: 100, rtt: 0.02 }
  ];
  const HTML_MB = 0.05;      // 글자 서류(html 등) 크기
  const PARALLEL = 6;        // 브라우저가 한꺼번에 내보내는 주문 수(대략)

  const sSize = VB.$(root, '.s-size'), sCount = VB.$(root, '.s-count'), sNet = VB.$(root, '.s-net'), sFar = VB.$(root, '.s-far');
  const oSize = VB.$(root, '.o-size'), oCount = VB.$(root, '.o-count'), oNet = VB.$(root, '.o-net');
  const estT = VB.$(root, '.est-t'), estBar = VB.$(root, '.est-bar i'), estSum = VB.$(root, '.est-sum');
  const loadBtn = VB.$(root, '.load'), againBtn = VB.$(root, '.again'), clock = VB.$(root, '.clock');
  const pg = VB.$(root, '.pg9'), grid = VB.$(root, '.pg9-grid'), blank = VB.$(root, '.pg9-blank'), text = VB.$(root, '.pg9-text');
  const msg = VB.$(root, '.msg');
  const reloadIc = VB.$(root, '.b9 .reload');
  let run = 0, cached = false;

  function params() {
    const net = nets[+sNet.value];
    return { size: +sSize.value / 10, n: +sCount.value, net, rtt: net.rtt + (sFar.checked ? 0.25 : 0) };
  }
  // 시간 계산: 연결과 첫 주문 왕복 + 글자 서류 운반, 이후 사진 주문 왕복 + 사진 운반
  function calc(p) {
    const sec = mb => mb * 8 / p.net.mbps;
    const textT = p.rtt * 3 + sec(HTML_MB);
    const arrive = [];
    for (let i = 0; i < p.n; i++) arrive.push(textT + Math.ceil((i + 1) / PARALLEL) * p.rtt + sec(p.size * (i + 1)));
    return { textT, arrive, total: arrive[arrive.length - 1], totalMB: HTML_MB + p.size * p.n };
  }
  const fmtMB = mb => mb >= 1000 ? `약 ${(mb / 1000).toFixed(1)}GB` : mb >= 10 ? `약 ${Math.round(mb)}MB` : `약 ${mb.toFixed(1)}MB`;
  function fmtT(t) {
    if (t < 10) return `약 ${t.toFixed(1)}초`;
    if (t < 60) return `약 ${Math.round(t)}초`;
    const m = Math.floor(t / 60), s = Math.round(t % 60);
    return s ? `약 ${m}분 ${s}초` : `약 ${m}분`;
  }

  function update() {
    const p = params();
    oSize.textContent = p.size.toFixed(1) + 'MB';
    oCount.textContent = p.n + '장';
    oNet.textContent = ['좁음', '보통', '넓음', '아주 넓음'][+sNet.value];
    const c = calc(p);
    estT.textContent = fmtT(c.total);
    // 1초~10분을 같은 간격으로 보이게(로그 눈금)
    const w = Math.max(2, Math.min(100, (Math.log10(Math.max(c.total, 0.5)) + 0.3) / (Math.log10(600) + 0.3) * 100));
    estBar.style.width = w + '%';
    estBar.style.background = c.total < 3 ? 'var(--ok)' : c.total < 10 ? 'var(--warn)' : 'var(--bad)';
    estSum.innerHTML = `도로: <b>${p.net.name}</b>${sFar.checked ? ' · 가게가 먼 나라' : ''}<br>사진 ${p.n}장을 모두 합한 짐 무게는 <b>${fmtMB(c.totalMB)}</b>입니다. 주문서는 ${p.n + 1}번 오갑니다. 글자는 <b>${fmtT(c.textT)}</b> 뒤에 먼저 보입니다.`;
    cached = false; againBtn.disabled = true;
    return c;
  }

  function buildGrid(n) {
    grid.innerHTML = Array.from({ length: n }, (_, i) => `<i style="--h:${(i * 47) % 360}"></i>`).join('');
  }
  function clear() {
    run++;
    pg.classList.remove('show-text');
    blank.hidden = false; blank.textContent = '불러오기를 누르면 이곳에 페이지가 채워집니다.';
    grid.innerHTML = '';
    clock.textContent = '0.0초';
    loadBtn.disabled = false; reloadIc.classList.remove('spin9');
  }

  function play(c, fromCache) {
    const my = ++run;
    const shown = fromCache ? { textT: Math.min(c.textT, 0.3), arrive: c.arrive.map(() => Math.min(c.textT, 0.3) + 0.05), total: Math.min(c.textT, 0.3) + 0.05 } : c;
    const ANIM = 6;                              // 화면에서 보여 주는 최대 시간(초)
    const k = shown.total > ANIM ? ANIM / shown.total : 1;
    pg.classList.remove('show-text');
    blank.hidden = false; blank.textContent = '';
    buildGrid(c.arrive.length);
    const cells = VB.$$(grid, 'i');
    loadBtn.disabled = true; againBtn.disabled = true;
    reloadIc.classList.add('spin9');
    VB.msg(msg, fromCache ? '두 번째 방문입니다. 사진은 처음 받을 때 서랍에 복사해 둔 것을 꺼내 씁니다.' :
      (k < 1 ? `실제로는 ${fmtT(c.total)} 걸리는 것을 6초로 줄여서 보여 줍니다. 위의 시계는 실제 시간을 나타냅니다.` : '주문을 보냈습니다. 화면이 채워지는 순서를 보세요.'));
    const t0 = performance.now();
    let next = 0;
    function frame(now) {
      if (my !== run) return;
      const t = (now - t0) / 1000 / k;           // 실제 시간으로 환산
      clock.textContent = (t < 60 ? t.toFixed(1) + '초' : Math.floor(t / 60) + '분 ' + Math.floor(t % 60) + '초');
      if (t >= shown.textT && !pg.classList.contains('show-text')) { pg.classList.add('show-text'); blank.hidden = true; }
      while (next < cells.length && t >= shown.arrive[next]) { cells[next].classList.add('in'); next++; }
      if (next >= cells.length && t >= shown.total) {
        clock.textContent = fmtT(shown.total).replace('약 ', '');
        loadBtn.disabled = false; againBtn.disabled = false; cached = true;
        reloadIc.classList.remove('spin9');
        const s = params();
        if (fromCache) VB.msg(msg, `처음에는 ${fmtT(c.total)} 걸렸는데 이번에는 거의 바로 열렸습니다. 사진을 다시 주문하지 않고 내 서랍의 복사본(캐시)을 꺼냈기 때문입니다.`, 'ok');
        else if (c.total < 3) VB.msg(msg, `${fmtT(c.total)} 만에 다 열렸습니다. 짐이 가볍고 도로도 넉넉합니다. <b>한 번 더 열기</b>도 눌러 보세요.`, 'ok');
        else if (c.textT > 1) VB.msg(msg, `글자가 나오기 전까지 ${fmtT(c.textT)} 동안 하얀 화면이었습니다. 도로가 막혔거나 가게가 멀어서 첫 상자부터 늦게 왔습니다. 전체는 ${fmtT(c.total)} 걸렸습니다.`, 'warn');
        else VB.msg(msg, `글자는 금방 나왔지만 사진을 다 받는 데 ${fmtT(c.total)} 걸렸습니다. ${s.size >= 1 ? '사진 한 장이 무겁습니다. 0.3MB 정도로 줄이면 어떻게 되는지 보세요.' : '사진 개수를 줄이거나 도로 사정을 바꿔 보세요.'} <b>한 번 더 열기</b>도 눌러 보세요.`, c.total < 10 ? 'warn' : 'bad');
        return;
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  [sSize, sCount, sNet, sFar].forEach(el => el.addEventListener('input', () => { update(); clear(); }));
  sFar.addEventListener('change', () => { update(); clear(); });
  VB.$$(root, '.pre').forEach(b => b.addEventListener('click', () => {
    sSize.value = b.dataset.s; sCount.value = b.dataset.n; update(); clear();
  }));
  loadBtn.addEventListener('click', () => play(update(), false));
  againBtn.addEventListener('click', () => { if (cached) play(calc(params()), true); });
  VB.$(root, '.reset').addEventListener('click', () => {
    sSize.value = 3; sCount.value = 12; sNet.value = 2; sFar.checked = false;
    update(); clear();
    VB.msg(msg, '값을 바꿔 보고 불러오기를 눌러 보세요.');
  });
  update(); clear();
});
