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

    // 현재 챕터 표시
    const tocLinks = Array.from(document.querySelectorAll('.toc a'));
    const partLinks = Array.from(document.querySelectorAll('.parts a'));
    const sections = Array.from(document.querySelectorAll('.chapter'));
    const bar = document.querySelector('.progress');
    function update() {
      const y = window.scrollY + 140;
      let cur = sections[0];
      for (const s of sections) { if (s.offsetTop <= y) cur = s; }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = sections[sections.length - 1];
      if (cur) {
        tocLinks.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + cur.id));
        const p = cur.dataset.part;
        partLinks.forEach(a => a.classList.toggle('on', a.dataset.part === p));
      }
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  });
})();
