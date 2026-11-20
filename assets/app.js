/* 공통 동작: 등장 모션, 목차·부 표시, 진행 막대, 챕터 초기화 */
(function () {
  const inits = [];
  const VB = {
    // 챕터 스크립트 등록: VB.ch('ch03', root => { ... })
    ch(id, fn) { inits.push([id, fn]); },
    // 안내 메시지 출력: type = '', 'ok', 'bad', 'warn'
    msg(el, html, type) {
      if (!el) return;
      el.className = 'lab-msg' + (type ? ' ' + type : '');
      el.innerHTML = html;
    },
    wait(ms) { return new Promise(r => setTimeout(r, ms)); },
    $(root, sel) { return root.querySelector(sel); },
    $$(root, sel) { return Array.from(root.querySelectorAll(sel)); },
    // 처음 화면에 보일 때 한 번 실행
    onShow(el, fn) {
      const io = new IntersectionObserver(es => {
        es.forEach(e => { if (e.isIntersecting) { io.disconnect(); fn(); } });
      }, { threshold: 0.3 });
      io.observe(el);
    }
  };
  window.VB = VB;

  document.addEventListener('DOMContentLoaded', () => {
    inits.forEach(([id, fn]) => {
      const root = document.getElementById(id);
      if (!root) return;
      try { fn(root); } catch (e) { console.error(id, e); (window.__errs = window.__errs || []).push(id + ': ' + e.message); }
    });

    // 등장 모션
    const revealIO = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); revealIO.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll('.chapter, .fig, .reveal').forEach(el => revealIO.observe(el));

    // 한 장씩 보기
    const KEY_LAST = 'vb-last', KEY_SEEN = 'vb-seen';
    const store = {
      get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } },
      set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
    };
    const sections = Array.from(document.querySelectorAll('.chapter'));
    const ids = sections.map(s => s.id);
    const heads = Array.from(document.querySelectorAll('.part-head'));
    const tocLinks = Array.from(document.querySelectorAll('.toc a'));
    const partLinks = Array.from(document.querySelectorAll('.parts a'));
    const bar = document.querySelector('.progress');
    const baseTitle = document.title;
    const label = s => {
      const n = parseInt(s.id.slice(2), 10);
      const t = s.dataset.title;
      return (n > 0 && n < 90) ? n + '장 ' + t : t;
    };
    document.body.classList.add('paged');

    // 장 끝마다 이전·다음 단추
    sections.forEach((s, i) => {
      const prev = sections[i - 1], next = sections[i + 1];
      const nav = document.createElement('nav');
      nav.className = 'pager';
      nav.innerHTML =
        (prev ? `<a class="pg prev" href="#${prev.id}"><small>이전</small><span>${label(prev)}</span></a>` : '<span></span>') +
        `<span class="pg-count">${i + 1} / ${sections.length}</span>` +
        (next ? `<a class="pg next" href="#${next.id}"><small>다음</small><span>${label(next)}</span></a>`
              : `<a class="pg next" href="#ch00"><small>처음으로</small><span>전체 지도</span></a>`);
      s.appendChild(nav);
    });

    // 표지에 '이어서 보기'
    const cover = document.getElementById('ch00');
    const last = store.get(KEY_LAST, null);
    if (cover && last && last !== 'ch00' && ids.includes(last)) {
      const box = document.createElement('div');
      box.className = 'resume';
      box.innerHTML = `<span>지난번에 보던 곳 <b>${label(document.getElementById(last))}</b></span><a class="btn primary" href="#${last}">이어서 보기</a>`;
      const lead = cover.querySelectorAll('.lead');
      (lead[lead.length - 1] || cover.firstElementChild).after(box);
    }

    const seen = new Set(store.get(KEY_SEEN, []));
    function markSeen() { tocLinks.forEach(a => a.classList.toggle('seen', seen.has(a.getAttribute('href').slice(1)))); }

    function resolve(hash) {
      const h = (hash || '').replace('#', '');
      if (ids.includes(h)) return h;
      const m = h.match(/^part(\d)$/);
      if (m) { const s = sections.find(x => x.dataset.part === m[1]); if (s) return s.id; }
      return null;
    }

    let cur = null;
    function show(id) {
      const s = document.getElementById(id);
      if (!s) return;
      cur = id;
      sections.forEach(x => x.classList.toggle('cur', x === s));
      const first = sections.find(x => x.dataset.part === s.dataset.part) === s;
      heads.forEach(h => h.classList.toggle('cur', first && h.dataset.part === s.dataset.part));
      tocLinks.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + id));
      partLinks.forEach(a => a.classList.toggle('on', a.dataset.part === s.dataset.part));
      const i = ids.indexOf(id);
      if (bar) bar.style.width = (ids.length > 1 ? i / (ids.length - 1) * 100 : 0) + '%';
      document.title = id === 'ch00' ? baseTitle : label(s) + ' | 바이브코딩 기초';
      window.scrollTo({ top: 0, behavior: 'instant' });
      const anims = s.querySelectorAll('.fig, .reveal');
      anims.forEach(el => el.classList.remove('in-view'));
      requestAnimationFrame(() => anims.forEach(el => revealIO.observe(el)));
      seen.add(id); store.set(KEY_SEEN, Array.from(seen)); store.set(KEY_LAST, id); markSeen();
      document.body.classList.remove('toc-open');
      const onLink = document.querySelector('.toc a.on');
      if (onLink) onLink.scrollIntoView({ block: 'nearest' });
    }

    function route() {
      const id = resolve(location.hash) || 'ch00';
      if (id !== cur) show(id);
      if (location.hash && location.hash.replace('#', '') !== id) history.replaceState(null, '', '#' + id);
    }
    window.addEventListener('hashchange', route);
    route();

    // 방향키로 넘기기 (입력 칸과 체험 칸 안에서는 쓰지 않음)
    document.addEventListener('keydown', e => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const t = e.target;
      if (t.closest && t.closest('input, select, textarea, [contenteditable], .lab')) return;
      const i = ids.indexOf(cur);
      if (e.key === 'ArrowRight' && i < ids.length - 1) location.hash = ids[i + 1];
      else if (e.key === 'ArrowLeft' && i > 0) location.hash = ids[i - 1];
    });

    // 휴대폰 목차
    const tocBtn = document.querySelector('.toc-btn');
    if (tocBtn) tocBtn.addEventListener('click', () => document.body.classList.toggle('toc-open'));
    const shade = document.querySelector('.toc-shade');
    if (shade) shade.addEventListener('click', () => document.body.classList.remove('toc-open'));
  });
})();
