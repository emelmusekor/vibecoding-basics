VB.ch('ch01', root => {
  const files = [
    ['가정통신문', 'hwp', '한글 문서입니다. 한글 프로그램이 엽니다.'],
    ['학부모총회', 'pptx', '파워포인트 발표 자료입니다. 파워포인트가 엽니다.'],
    ['출석부', 'xlsx', '엑셀 표입니다. 엑셀이 엽니다.'],
    ['운동회사진', 'jpg', '사진입니다. 사진 보기 프로그램이 엽니다.'],
    ['교가', 'mp3', '소리 파일입니다. 음악 재생 프로그램이 엽니다.'],
    ['수업자료모음', 'zip', '여러 파일을 한 봉투에 넣고 꾹 눌러 담은 압축 파일입니다. 풀어야 안의 서류를 꺼낼 수 있습니다.'],
    ['index', 'html', '웹페이지 파일입니다. 크롬 같은 <b>브라우저</b>가 읽어서 화면으로 보여 줍니다. 바이브코딩에서 가장 많이 보게 됩니다.'],
    ['app', 'js', '자바스크립트 파일입니다. 웹페이지 안에서 버튼이 눌리거나 화면이 움직이게 하는 내용이 적혀 있습니다.'],
    ['정리하기', 'py', '파이썬 파일입니다. 파일 정리, 엑셀 계산 같은 일을 시키는 내용이 적혀 있습니다.'],
    ['카카오톡설치', 'exe', '프로그램을 설치하거나 실행하는 파일입니다. 누르면 바로 무언가가 실행되므로 모르는 곳에서 받은 것은 열지 않습니다.']
  ];
  const grid = VB.$(root, '.filegrid');
  const msg1 = VB.$(root, '.msg1');
  grid.innerHTML = files.map(([n, e], i) =>
    `<button type="button" data-i="${i}"><div class="fileicon" data-ext="${e}"><b>.${e}</b></div><span>${n}.${e}</span></button>`
  ).join('');
  grid.addEventListener('click', ev => {
    const b = ev.target.closest('button'); if (!b) return;
    VB.$$(grid, 'button').forEach(x => x.classList.remove('sel'));
    b.classList.add('sel');
    const [n, e, d] = files[b.dataset.i];
    VB.msg(msg1, `<b>${n}.${e}</b> · ${d}`, 'ok');
  });

  // 확장자 바꾸기
  const sel = VB.$(root, '.rn-name select');
  const icon = VB.$(root, '.rename .fileicon');
  const view = VB.$(root, '.rn-view');
  const msg2 = VB.$(root, '.msg2');
  const photo = `<svg viewBox="0 0 200 120" width="200" height="120"><rect width="200" height="120" rx="6" fill="#bfe0f5"/><circle cx="165" cy="28" r="14" fill="#f6c945"/><rect y="80" width="200" height="40" fill="#7cc47f"/><path d="M0 80 Q50 60 100 80 T200 80" fill="#5fae64"/><g fill="#e3632b"><circle cx="60" cy="72" r="6"/><rect x="56" y="78" width="8" height="18" rx="3"/></g><g fill="#2f6fb0"><circle cx="90" cy="70" r="6"/><rect x="86" y="76" width="8" height="18" rx="3"/></g><line x1="20" y1="20" x2="180" y2="20" stroke="#fff" stroke-width="1.5"/><g fill="#ff6b6b"><path d="M30 20 l6 10 l6 -10z"/><path d="M60 20 l6 10 l6 -10z"/><path d="M90 20 l6 10 l6 -10z"/><path d="M120 20 l6 10 l6 -10z"/><path d="M150 20 l6 10 l6 -10z"/></g></svg>`;
  const garble = 'ÿØÿà JFIF  H H  ÿÛ C  ÿÀ \u0011\b\u0001à\u0002€ ÿÄ \u001f  ÿÚ \f ò¢Š(\u0000¢Š(\u0000¢Š(\u0000¢Š(\u0000ÿ×ò¢Š(\u0000¢Š( ¹²ÖÒ÷Ãz¼ÞÔíRú\u0007Õ´ýF;ëy¢—';

  function setIcon() {
    const v = sel.value;
    icon.dataset.ext = v || 'none';
    icon.querySelector('b').textContent = v ? '.' + v : '?';
    view.innerHTML = '';
    VB.msg(msg2, '이름표만 바뀌었습니다. 열어 보세요.');
  }
  sel.addEventListener('change', setIcon);
  VB.$(root, '.rn-open').addEventListener('click', () => {
    const v = sel.value;
    if (v === 'jpg') {
      view.innerHTML = photo;
      VB.msg(msg2, '사진 보기 프로그램이 열려 사진이 잘 보입니다.', 'ok');
    } else if (v === 'txt') {
      view.innerHTML = `<div class="garble">${garble.repeat(3)}</div>`;
      VB.msg(msg2, '메모장이 열렸습니다. 사진 내용을 글자로 읽으려 하니 알 수 없는 기호만 나옵니다. 사진이 망가진 것은 아닙니다. 확장자를 <code>.jpg</code>로 돌려놓으면 다시 보입니다.', 'warn');
    } else if (v === 'mp3') {
      view.innerHTML = `<div class="dialog"><b>음악 재생기</b><br>이 파일을 재생할 수 없습니다.</div>`;
      VB.msg(msg2, '음악 프로그램이 열렸지만 내용은 사진이라 재생하지 못합니다. 컴퓨터는 내용을 보지 않고 이름표만 보고 맡길 곳을 정했기 때문입니다.', 'bad');
    } else {
      view.innerHTML = `<div class="dialog"><b>이 파일을 어떻게 여시겠습니까?</b><br>앱 목록에서 선택하세요.</div>`;
      VB.msg(msg2, '확장자가 없으니 컴퓨터가 누구에게 맡겨야 할지 몰라 물어봅니다.', 'bad');
    }
  });
  VB.$(root, '.reset').addEventListener('click', () => {
    sel.value = 'jpg'; setIcon(); view.innerHTML = '';
    VB.$$(grid, 'button').forEach(x => x.classList.remove('sel'));
    VB.msg(msg1, '서류를 눌러 보세요.');
    VB.msg(msg2, '확장자를 골라 보고 열어 보세요.');
  });
});
