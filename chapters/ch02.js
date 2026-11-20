VB.ch('ch02', root => {
  /* ---------- 1. 주소 따라가기 ---------- */
  const T = (name, kind, desc, alias, children) => ({ name, kind, desc, alias, children });
  const tree = T('C:', 'drive', '서랍장 이름입니다. 컴퓨터의 저장공간 전체를 <b>C 드라이브</b>라고 부릅니다. 모든 주소는 여기서 시작합니다.', '로컬 디스크', [
    T('Users', 'folder', '이 컴퓨터를 쓰는 사람들의 서류철을 모아 둔 큰 서류철입니다. 한글 윈도우에서는 "사용자"로 보입니다.', '사용자', [
      T('홍길동', 'folder', '사용자 한 명의 서류철입니다. 윈도우에 로그인한 사람의 이름이 붙습니다.', '', [
        T('Desktop', 'folder', '바탕 화면입니다. 화면에 늘 보이는 바탕 화면도 이 서류철 하나입니다.', '바탕 화면', [
          T('우리반앱', 'app', '앱 하나를 담은 서류철입니다. 안티그래비티에서 여는 것이 이 서류철이고, AI가 만드는 파일도 모두 여기에 생깁니다.', '앱 폴더', [
            T('index.html', 'html', '웹페이지 서류입니다. 브라우저가 이 서류를 읽어 화면을 그립니다.'),
            T('style.css', 'css', '웹페이지의 색과 글꼴, 배치를 적은 꾸밈 서류입니다.'),
            T('images', 'folder', '그림을 모아 둔 서류철입니다. 앱 폴더 안에 있으니 웹페이지가 쓸 수 있습니다.', '', [
              T('logo.png', 'png', '서류입니다. 주소의 맨 끝은 늘 서류 이름입니다. 웹페이지 안에서는 앱 폴더를 기준으로 짧게 <code>images/logo.png</code>라고 적습니다.'),
              T('cat.jpg', 'jpg', '고양이 사진 서류입니다. 웹페이지 안에서는 <code>images/cat.jpg</code>라고 적습니다.')
            ])
          ]),
          T('운동회사진.jpg', 'jpg', '바탕 화면에 놓인 사진입니다. 앱 폴더 밖에 있으므로 이대로는 앱에서 쓸 수 없습니다.')
        ]),
        T('Documents', 'folder', '문서 서류철입니다. 한글이나 엑셀로 저장할 때 따로 정하지 않으면 여기로 갑니다.', '문서', [
          T('가정통신문.hwp', 'hwp', '문서 서류철 안의 한글 문서입니다.')
        ]),
        T('Downloads', 'folder', '다운로드 서류철입니다. 인터넷에서 받은 파일은 따로 정하지 않으면 여기에 들어옵니다.', '다운로드', [
          T('수업자료모음.zip', 'zip', '인터넷에서 받은 압축 파일입니다. 받은 파일을 찾을 때는 먼저 이 서류철을 봅니다.')
        ])
      ])
    ])
  ]);

  const list = VB.$(root, '.tree-list');
  const pathbar = VB.$(root, '.pathbar');
  const wp = VB.$(root, '.wp');
  const msg1 = VB.$(root, '.msg1');
  const flat = [];
  const icon = k => `<i class="ic2 k-${k}"></i>`;

  (function walk(n, depth, parents) {
    const id = flat.length;
    const chain = parents.concat(id);
    flat.push({ n, chain });
    const li = document.createElement('li');
    li.dataset.id = id;
    li.style.paddingLeft = (12 + depth * 20) + 'px';
    li.tabIndex = 0;
    li.setAttribute('role', 'button');
    li.innerHTML = `${icon(n.kind)}<span class="nm">${n.name}</span>${n.alias ? `<span class="al">${n.alias}</span>` : ''}`;
    list.appendChild(li);
    (n.children || []).forEach(c => walk(c, depth + 1, chain));
  })(tree, 0, []);

  let timer = 0;
  function pick(id) {
    const { n, chain } = flat[id];
    const lis = VB.$$(list, 'li');
    lis.forEach(li => li.classList.remove('sel', 'onpath'));
    chain.forEach(i => lis[i].classList.add('onpath'));
    lis[id].classList.add('sel');
    clearTimeout(timer);
    pathbar.innerHTML = '';
    wp.textContent = '';
    let k = 0;
    (function step() {
      const node = flat[chain[k]].n;
      if (k > 0) {
        const sep = document.createElement('span');
        sep.className = 'sep'; sep.textContent = '›';
        pathbar.appendChild(sep);
      }
      const chip = document.createElement('span');
      chip.className = 'chip k-' + node.kind + (k === chain.length - 1 ? ' last' : '');
      chip.innerHTML = icon(node.kind) + node.name;
      pathbar.appendChild(chip);
      wp.textContent += (k > 0 ? '\\' : '') + node.name;
      lis[chain[k]].classList.add('flash');
      k++;
      if (k < chain.length) timer = setTimeout(step, 260);
      else {
        setTimeout(() => lis.forEach(li => li.classList.remove('flash')), 300);
        const isFile = !['drive', 'folder', 'app'].includes(n.kind);
        const head = isFile ? '서류' : (n.kind === 'drive' ? '서랍장' : '서류철');
        VB.msg(msg1, `<b>${n.name}</b> (${head}) · ${n.desc}<br><span class="steps">C:부터 ${chain.length - 1}칸 들어온 곳입니다.</span>`, 'ok');
      }
    })();
  }
  list.addEventListener('click', ev => {
    const li = ev.target.closest('li'); if (li) pick(+li.dataset.id);
  });
  list.addEventListener('keydown', ev => {
    if (ev.key === 'Enter' || ev.key === ' ') { const li = ev.target.closest('li'); if (li) { ev.preventDefault(); pick(+li.dataset.id); } }
  });

  /* ---------- 2. 그림이 안 나오는 이유 ---------- */
  const st = { renamed: false, logoOut: false, photoIn: false };
  const mini = VB.$(root, '.mini-list');
  const page = VB.$(root, '.page');
  const src = VB.$(root, '.src');
  const msg2 = VB.$(root, '.msg2');
  const reload = VB.$(root, '.move-lab .reload');
  const bRename = VB.$(root, '.act-rename');
  const bLogo = VB.$(root, '.act-logo');
  const bPhoto = VB.$(root, '.act-photo');

  const logoSvg = `<svg viewBox="0 0 120 120" width="88" height="88" aria-label="우리반 로고"><rect x="6" y="6" width="108" height="108" rx="26" fill="#2f6fb0"/><path d="M60 22 L71 47 L98 49 L77 66 L84 93 L60 78 L36 93 L43 66 L22 49 L49 47Z" fill="#f6c945"/><text x="60" y="110" font-size="14" text-anchor="middle" fill="#fff" font-weight="700">4-2</text></svg>`;
  const photoSvg = `<svg viewBox="0 0 200 120" width="100%" aria-label="반 사진"><rect width="200" height="120" rx="6" fill="#bfe0f5"/><circle cx="165" cy="28" r="14" fill="#f6c945"/><rect y="80" width="200" height="40" fill="#7cc47f"/><path d="M0 80 Q50 60 100 80 T200 80" fill="#5fae64"/><g fill="#e3632b"><circle cx="60" cy="72" r="6"/><rect x="56" y="78" width="8" height="18" rx="3"/></g><g fill="#2f6fb0"><circle cx="90" cy="70" r="6"/><rect x="86" y="76" width="8" height="18" rx="3"/></g><g fill="#7650aa"><circle cx="120" cy="72" r="6"/><rect x="116" y="78" width="8" height="18" rx="3"/></g></svg>`;
  const broken = alt => `<div class="broken"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M3 4h18v10l-4-3-4 4-3-3-7 6z" fill="none" stroke="#8a93a6" stroke-width="1.6"/><path d="M3 18l5-4 3 3 3-3 3 2 4-3v7H3z" fill="#e2e0d8"/><path d="M14 2 L10 22" stroke="#c43d3d" stroke-width="1.6"/></svg><span>${alt}</span></div>`;

  function renderMini() {
    const imgs = st.renamed ? '그림' : 'images';
    const row = (d, kind, name, cls = '') => `<li class="${cls}" style="padding-left:${12 + d * 20}px">${icon(kind)}<span class="nm">${name}</span></li>`;
    let h = row(0, 'app', '우리반앱', 'appdir');
    h += row(1, 'html', 'index.html', 'inapp');
    h += row(1, 'css', 'style.css', 'inapp');
    h += row(1, 'folder', imgs, 'inapp' + (st.renamed ? ' changed' : ''));
    if (!st.logoOut) h += row(2, 'png', 'logo.png', 'inapp');
    if (st.photoIn) h += row(2, 'jpg', 'class-photo.jpg', 'inapp changed');
    if (st.logoOut) h += row(0, 'png', 'logo.png', 'changed');
    if (!st.photoIn) h += row(0, 'jpg', 'class-photo.jpg');
    h += row(0, 'hwp', '가정통신문.hwp');
    mini.innerHTML = h;
  }
  function renderPage() {
    const logoOk = !st.renamed && !st.logoOut;
    const photoOk = !st.renamed && st.photoIn;
    page.innerHTML = `<div class="pg-head">${logoOk ? logoSvg : broken('logo.png')}<div><b>우리반 앱</b><small>4학년 2반 알림장</small></div></div><div class="pg-photo">${photoOk ? photoSvg : broken('class-photo.jpg')}</div>`;
    src.innerHTML = `<span class="c">&lt;!-- index.html 안에 적힌 내용 --&gt;</span>\n<span class="t">&lt;img</span> src=<span class="s">"images/logo.png"</span><span class="t">&gt;</span>  ${logoOk ? '<span class="okk">찾음</span>' : '<span class="ng">없음</span>'}\n<span class="t">&lt;img</span> src=<span class="s">"images/class-photo.jpg"</span><span class="t">&gt;</span>  ${photoOk ? '<span class="okk">찾음</span>' : '<span class="ng">없음</span>'}`;
  }
  function renderBtns() {
    bRename.textContent = st.renamed ? '폴더 이름을 다시 "images"로 되돌리기' : 'images 폴더 이름을 "그림"으로 바꾸기';
    bLogo.textContent = st.logoOut ? 'logo.png를 다시 images 안으로 넣기' : 'logo.png를 바탕 화면으로 옮기기';
    bPhoto.textContent = st.photoIn ? 'class-photo.jpg를 다시 바탕 화면으로 빼기' : '바탕 화면의 class-photo.jpg를 images 안으로 넣기';
    bRename.classList.toggle('on', st.renamed);
    bLogo.classList.toggle('on', st.logoOut);
    bPhoto.classList.toggle('primary', !st.photoIn);
  }
  function explain() {
    const r = [];
    if (st.renamed) r.push('<b>images</b> 서류철 이름이 <b>그림</b>으로 바뀌었습니다. 웹페이지에는 여전히 <code>images/…</code>라고 적혀 있어서 그 주소에 가 보면 서류철이 없습니다. 그래서 그림이 모두 깨집니다.');
    if (st.logoOut) r.push('<b>logo.png</b>가 앱 폴더 밖 바탕 화면으로 나갔습니다. 웹페이지는 적힌 주소 <code>images/logo.png</code>에서만 찾으므로 못 찾습니다. 나중에 앱을 인터넷에 올릴 때도 앱 폴더만 올라가니 밖에 있는 서류는 따라가지 않습니다.');
    if (!st.photoIn) r.push('<b>class-photo.jpg</b>는 바탕 화면에 있어서 <code>images/class-photo.jpg</code> 자리에 없습니다.');
    if (!r.length) return VB.msg(msg2, '모든 그림이 적힌 주소 그대로 앱 폴더 안에 있습니다. 바탕 화면에 있던 사진도 <code>images</code> 안으로 넣으니 바로 보입니다.', 'ok');
    VB.msg(msg2, r.join('<br>'), (!st.renamed && !st.logoOut) ? 'warn' : 'bad');
  }
  function update(withReload) {
    renderMini(); renderBtns();
    if (withReload) {
      reload.classList.remove('spin'); void reload.offsetWidth; reload.classList.add('spin');
      page.classList.add('loading');
      setTimeout(() => { page.classList.remove('loading'); renderPage(); explain(); }, 350);
    } else { renderPage(); }
  }
  bRename.addEventListener('click', () => { st.renamed = !st.renamed; update(true); });
  bLogo.addEventListener('click', () => { st.logoOut = !st.logoOut; update(true); });
  bPhoto.addEventListener('click', () => { st.photoIn = !st.photoIn; update(true); });
  reload.addEventListener('click', () => update(true));

  /* ---------- 처음으로 ---------- */
  function resetAll() {
    clearTimeout(timer);
    VB.$$(list, 'li').forEach(li => li.classList.remove('sel', 'onpath', 'flash'));
    pathbar.innerHTML = '<span class="ph">여기에 주소가 쌓입니다</span>';
    wp.textContent = '-';
    VB.msg(msg1, '서류철이나 서류를 눌러 보세요.');
    st.renamed = false; st.logoOut = false; st.photoIn = false;
    update(false);
    VB.msg(msg2, '지금은 로고는 보이고, 반 사진은 깨져 있습니다. 반 사진은 아직 바탕 화면에 있기 때문입니다.', 'warn');
  }
  VB.$(root, '.reset').addEventListener('click', resetAll);
  resetAll();
});
