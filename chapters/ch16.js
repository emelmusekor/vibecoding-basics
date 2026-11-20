VB.ch('ch16', root => {
  const view = VB.$(root, '.ch16-view');
  const dev = VB.$(root, '.ch16-dev');
  const f12 = VB.$(root, '.ch16-f12');
  const log = VB.$(root, '.ch16-log');
  const s1 = VB.$(root, '.ch16-s1');
  const s2 = VB.$(root, '.ch16-s2');
  const reload = VB.$(root, '.reload');
  const msg1 = VB.$(root, '.msg1');
  const ERR = "Uncaught TypeError: Cannot read properties of null (reading 'addEventListener')\n    at app.js:12:7";
  const names = ['김민준', '이서연', '박도윤', '최하은', '정지호', '강서아', '윤시우', '한지유', '오은우'];
  let st, token = 0;

  function drawView() {
    if (st.fixed) {
      view.innerHTML = `<div class="ch16-app"><b>우리 반 자리 바꾸기</b><div class="ch16-seats">${names.map(n => `<span>${n}</span>`).join('')}</div><button class="btn primary ch16-shuffle" type="button">자리 바꾸기</button></div>`;
    } else {
      view.innerHTML = '<div class="ch16-white"></div>';
    }
  }

  function say(who, html) {
    const d = document.createElement('div');
    d.className = 'ch16-bub ' + who;
    d.innerHTML = html;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
  }

  async function aiSay(html, my) {
    const d = document.createElement('div');
    d.className = 'ch16-bub ai typing';
    d.textContent = '생각하는 중...';
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    await VB.wait(900);
    if (my !== token) return;
    d.className = 'ch16-bub ai';
    d.innerHTML = html;
    log.scrollTop = log.scrollHeight;
  }

  view.addEventListener('click', ev => {
    if (!ev.target.closest('.ch16-shuffle')) return;
    const a = names.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    VB.$(view, '.ch16-seats').innerHTML = a.map(n => `<span>${n}</span>`).join('');
    VB.msg(msg1, '자리가 섞였습니다. 오류 한 줄을 정확히 전달했더니 조수가 한 번에 고쳤습니다.', 'ok');
  });

  f12.addEventListener('click', () => {
    dev.hidden = !dev.hidden;
    if (!dev.hidden && !st.fixed) VB.msg(msg1, '개발자 도구의 <b>Console</b> 탭에 빨간 줄이 보입니다. 화면은 하얗지만 쪽지는 여기에 남아 있었습니다. <b>복사</b>를 눌러 보세요.', 'warn');
    else if (!dev.hidden && st.fixed) VB.msg(msg1, '고친 뒤에는 콘솔에 빨간 줄이 없습니다.', 'ok');
  });

  s1.addEventListener('click', async () => {
    const my = token;
    say('me', '안 돼요.');
    s1.disabled = true;
    await aiSay('어떤 부분이 안 되는지 조금 더 알려 주시겠어요? 화면이 어떻게 보이는지, 어떤 버튼을 눌렀을 때 그런지, 그리고 브라우저에서 <kbd>F12</kbd>를 눌러 Console 탭에 빨간 글씨가 있으면 그대로 복사해서 보내 주세요.', my);
    if (my !== token) return;
    s1.disabled = false;
    VB.msg(msg1, '조수가 되묻습니다. "안 돼요"만으로는 무엇이 어디서 안 되는지 알 수 없어서 고칠 수가 없습니다. 실제로는 조수가 짐작으로 엉뚱한 곳을 고치기도 합니다.', 'warn');
  });

  s2.addEventListener('click', async () => {
    const my = token;
    say('me', `화면이 하얗게만 나와요. 콘솔에 이렇게 나옵니다.<pre>${ERR}</pre>`);
    s1.disabled = s2.disabled = true;
    await aiSay('<code>app.js</code> 12번째 줄에서 <code>start-btn</code>이라는 버튼을 찾아 기능을 붙이려 했는데, <code>index.html</code>에는 그 버튼 이름이 <code>startBtn</code>으로 적혀 있어서 찾지 못했습니다(null). 버튼을 못 찾으니 그다음 화면 그리기가 모두 멈춰 하얗게 나온 것입니다. 이름을 <code>start-btn</code>으로 맞췄습니다. <b>새로고침</b>해 보세요.', my);
    if (my !== token) return;
    st.fixed = true;
    VB.msg(msg1, '조수가 원인을 짚고 고쳤습니다. 하지만 브라우저는 아직 예전 서류를 보여 주고 있습니다. 주소창 옆 <b>새로고침</b>(&#x21bb;)을 눌러 보세요.', 'ok');
  });

  reload.addEventListener('click', () => {
    reload.classList.remove('spin'); void reload.offsetWidth; reload.classList.add('spin');
    view.innerHTML = '';
    setTimeout(() => {
      drawView();
      if (st.fixed) {
        VB.$(root, '.ch16-console').innerHTML = '<div class="ch16-clean">오류 없음</div>';
        VB.msg(msg1, '정상 화면이 나왔습니다. <b>자리 바꾸기</b> 버튼도 눌러 보세요.', 'ok');
      } else {
        VB.msg(msg1, '새로고침해도 같습니다. 서류 내용이 바뀌지 않았으니 결과도 같습니다. 먼저 오류를 조수에게 알려야 합니다.', 'bad');
      }
    }, 450);
  });

  // 오류 사전
  const dict = [
    ['404 Not Found', '그 주소에 서류가 없습니다. 경로(2장)가 틀렸거나, 파일 이름의 글자 하나가 다르거나, 아직 그 자리에 올리지 않은 경우입니다.'],
    ['Failed to fetch', '택배가 가게까지 가지 못했습니다(8장). 인터넷이 끊겼거나, 주소가 틀렸거나, 가게가 문을 닫은 상태입니다.'],
    ['net::ERR_INTERNET_DISCONNECTED', '도로로 나가는 문이 막혔습니다. 내 컴퓨터의 인터넷 연결이 끊긴 상태입니다. 와이파이부터 확인합니다.'],
    ['401 Unauthorized · 403 Forbidden', '열쇠 문제입니다(14장). 401은 열쇠를 안 가져왔거나 틀린 열쇠, 403은 열쇠는 맞지만 그 방에 들어갈 권한이 없다는 뜻입니다.'],
    ['500 Internal Server Error', '가게 주방에서 문제가 생겼습니다(12장). 주문(요청)은 잘 도착했는데 주방이 처리하다 멈췄습니다. 오류 내용은 주방(서버) 쪽 기록에 있습니다.'],
    ['SyntaxError: Unexpected token', '서류에 오타가 있습니다. 괄호 짝이 안 맞거나 따옴표가 빠져서, 읽어 주는 사람이 문장을 이해하지 못하고 멈췄습니다.'],
    ["Module not found · Cannot find module", '재료(부품)가 없습니다. 필요한 부품을 아직 사 오지 않았거나(<code>npm install</code>, 15장) 부품 이름이 틀렸습니다.'],
    ['command not found', '그 명령을 알아듣는 도구가 컴퓨터에 설치되어 있지 않습니다(15장). 무엇을 설치해야 하는지 조수에게 물어봅니다.']
  ];
  const dictEl = VB.$(root, '.ch16-dict');
  const msg2 = VB.$(root, '.msg2');
  dictEl.innerHTML = dict.map(([e], i) => `<button type="button" data-i="${i}"><code>${e}</code></button>`).join('');
  dictEl.addEventListener('click', ev => {
    const b = ev.target.closest('button'); if (!b) return;
    VB.$$(dictEl, 'button').forEach(x => x.classList.remove('sel'));
    b.classList.add('sel');
    const [e, d] = dict[b.dataset.i];
    VB.msg(msg2, `<code>${e}</code><br>${d}`, 'ok');
  });

  function reset() {
    token++;
    st = { fixed: false, copied: false };
    dev.hidden = true;
    VB.$(root, '.ch16-console').innerHTML = `<div class="ch16-errline"><span class="ch16-x">x</span><span class="ch16-errtxt">Uncaught TypeError: Cannot read properties of null (reading 'addEventListener')<br>&nbsp;&nbsp;&nbsp;&nbsp;at app.js:12:7</span></div><button class="btn ch16-copy" type="button">복사</button>`;
    log.innerHTML = '';
    say('ai', '자리 바꾸기 앱을 만들었습니다. 미리보기에서 확인해 보세요.');
    s1.disabled = false; s2.disabled = true;
    drawView();
    VB.$$(dictEl, 'button').forEach(x => x.classList.remove('sel'));
    VB.msg(msg1, '먼저 <kbd>F12</kbd> 버튼을 눌러 보세요.');
    VB.msg(msg2, '쪽지를 눌러 보세요.');
  }
  // 콘솔 내용을 다시 그리므로 복사 버튼은 위임으로 처리
  dev.addEventListener('click', ev => { const b = ev.target.closest('.ch16-copy'); if (b) copyHandler(b); });
  function copyHandler(btn) {
    st.copied = true; s2.disabled = false; btn.textContent = '복사됨';
    if (navigator.clipboard) navigator.clipboard.writeText(ERR).catch(() => {});
    VB.msg(msg1, '오류 글자를 복사했습니다. 이제 오른쪽 대화창에서 보내 보세요. 비교를 위해 "안 돼요"만 먼저 보내 봐도 좋습니다.', '');
  }
  VB.$(root, '.reset').addEventListener('click', reset);
  reset();
});
