VB.ch('ch11', root => {
  const URL = 'https://아이디.github.io/우리반앱/';
  const items = ['색연필', '색연필, 가위', '색연필, 가위, 풀', '색연필, 가위, 풀, 줄넘기'];
  const myView = VB.$(root, '.my-view'), myAddr = VB.$(root, '.mybr .addr');
  const dUrl = VB.$(root, '.d-url'), dBar = VB.$(root, '.d-bar i'), dState = VB.$(root, '.d-state');
  const msgs = VB.$(root, '.ph-msgs'), phAddr = VB.$(root, '.ph-addr'), phView = VB.$(root, '.ph-view'), phReload = VB.$(root, '.ph-reload');
  const bLocal = VB.$(root, '.send-local'), bDrive = VB.$(root, '.send-drive'), bWeb = VB.$(root, '.send-web');
  const bDeploy = VB.$(root, '.deploy'), bEdit = VB.$(root, '.edit'), bPower = VB.$(root, '.power');
  const msg = VB.$(root, '.msg');
  let st, run = 0;

  const appPage = (v, small) => `<div class="app${small ? ' sm' : ''}"><div class="app-h">우리 반 알림장</div><div class="app-b"><b>내일 준비물</b><span class="items">${items[v % items.length]}</span></div><div class="app-b"><b>오늘의 한마디</b><span>서로 친절하게 말해요.</span></div></div>`;
  const errPage = (title, detail) => `<div class="err"><svg viewBox="0 0 40 40" width="36" height="36"><rect x="6" y="8" width="28" height="22" rx="3" fill="none" stroke="#8a93a6" stroke-width="2.5"/><path d="M14 15l12 9M26 15l-12 9" stroke="#c43d3d" stroke-width="2.5" stroke-linecap="round"/></svg><b>${title}</b><span>${detail}</span></div>`;
  const drivePage = () => `<div class="drv"><div class="drv-h"><span class="drv-ic"></span>index.html</div><pre>&lt;!doctype html&gt;
&lt;html lang="ko"&gt;
&lt;head&gt;
  &lt;meta charset="utf-8"&gt;
  &lt;title&gt;우리 반 알림장&lt;/title&gt;
  &lt;link rel="stylesheet" href="style.css"&gt;
&lt;/head&gt;
&lt;body&gt;
  &lt;h1&gt;우리 반 알림장&lt;/h1&gt;
  &lt;script src="app.js"&gt;&lt;/script&gt;</pre></div>`;

  function init() {
    st = { pcOn: true, ver: 0, deployed: false, deployVer: -1, deploying: false, sent: null, phoneVer: -1 };
    run++;
    msgs.innerHTML = '<div class="ph-empty">아직 받은 링크가 없습니다.</div>';
    phAddr.textContent = '-';
    phView.innerHTML = '<div class="ph-idle">링크를 받으면 여기에서 열립니다.</div>';
    dBar.style.width = '0'; dState.textContent = '';
    drawMe();
    VB.msg(msg, '① localhost 링크 보내기부터 눌러 보세요.');
  }
  function drawMe() {
    myAddr.textContent = 'localhost:5173';
    myView.innerHTML = st.pcOn ? appPage(st.ver) : '<div class="pc-off">컴퓨터가 꺼져 있습니다</div>';
    root.querySelector('.me').classList.toggle('off', !st.pcOn);
    dUrl.textContent = st.deployed ? URL : '아직 없음';
    dUrl.classList.toggle('on', st.deployed);
    bWeb.disabled = !st.deployed || st.deploying;
    bDeploy.disabled = !st.pcOn || st.deploying;
    bDeploy.textContent = st.deployed ? '다시 배포하기' : '② 배포하기';
    bEdit.disabled = !st.pcOn || st.deploying;
    bLocal.disabled = bDrive.disabled = st.deploying;
    bPower.textContent = st.pcOn ? '내 컴퓨터 끄기' : '내 컴퓨터 켜기';
    if (st.deployed && !st.deploying) {
      const same = st.deployVer === st.ver;
      dState.textContent = same ? '가게 진열장과 내 화면이 같습니다.' : '내 화면을 고쳤지만 가게 진열장은 아직 옛 서류입니다.';
      dState.className = 'd-state ' + (same ? 'ok' : 'warn');
    }
  }

  // 친구 휴대폰이 링크를 여는 장면
  async function phoneOpen(kind, quiet) {
    const my = ++run;
    phAddr.textContent = kind === 'local' ? 'localhost:5173' : kind === 'drive' ? 'drive.google.com/file/...' : URL;
    phView.innerHTML = '<div class="ph-wait"><i></i></div>';
    phReload.classList.remove('spin'); void phReload.offsetWidth; phReload.classList.add('spin');
    await VB.wait(700);
    if (my !== run) return;
    if (kind === 'local') {
      phView.innerHTML = errPage('사이트에 연결할 수 없음', 'localhost에서 연결을 거부했습니다.');
      if (!quiet) VB.msg(msg, `친구 휴대폰은 <code>localhost</code>를 "내 기기 안"으로 읽습니다. 친구 휴대폰 안에는 이 진열장이 없으니 연결할 수 없습니다.${st.pcOn ? ' 내 화면에서는 잘 보이는데도 그렇습니다.' : ''} 이제 <b>② 배포하기</b>를 눌러 보세요.`, 'bad');
    } else if (kind === 'drive') {
      phView.innerHTML = drivePage();
      if (!quiet) VB.msg(msg, '친구 휴대폰에는 앱 화면이 아니라 코드 글자만 보입니다. 드라이브는 서류를 보관하는 창고라서 서류 내용을 보여 줄 뿐, 앱으로 펼쳐 주지 않습니다.', 'warn');
    } else {
      st.phoneVer = st.deployVer;
      phView.innerHTML = appPage(st.phoneVer, true);
      if (quiet) return;
      if (!st.pcOn) VB.msg(msg, '내 컴퓨터가 꺼져 있어도 친구는 앱을 봅니다. 서류가 이미 가게 진열장에 있기 때문입니다.', 'ok');
      else if (st.deployVer !== st.ver) VB.msg(msg, '친구 휴대폰에는 고치기 전 화면이 보입니다. 가게 진열장에 아직 옛 서류가 있기 때문입니다. <b>다시 배포하기</b>를 누른 뒤 친구 휴대폰에서 새로고침해 보세요.', 'warn');
      else if (st.ver > 0) VB.msg(msg, '새로고침으로 다시 주문하니 가게 진열장의 새 서류가 왔습니다. 이제 친구 화면도 바뀌었습니다. <b>내 컴퓨터 끄기</b>도 눌러 보세요.', 'ok');
      else VB.msg(msg, '친구 휴대폰에서 앱이 열렸습니다. 서류가 가게 앞 진열장에 있으니 누구나 이 주소로 볼 수 있습니다. 이제 <b>④ 내 화면 글자 고치기</b>를 눌러 보세요.', 'ok');
    }
  }
  function send(kind) {
    st.sent = kind;
    const label = kind === 'local' ? 'localhost:5173' : kind === 'drive' ? 'drive.google.com/file/d/1a2B.../view' : URL;
    if (msgs.querySelector('.ph-empty')) msgs.innerHTML = '';
    msgs.insertAdjacentHTML('beforeend', `<div class="bub"><span>${label}</span></div>`);
    msgs.scrollTop = msgs.scrollHeight;
    phoneOpen(kind);
  }
  bLocal.addEventListener('click', () => send('local'));
  bDrive.addEventListener('click', () => send('drive'));
  bWeb.addEventListener('click', () => send('web'));
  phReload.addEventListener('click', () => {
    if (!st.sent) return;
    phoneOpen(st.sent, false);
  });

  bDeploy.addEventListener('click', async () => {
    if (st.deploying || !st.pcOn) return;
    const again = st.deployed;
    st.deploying = true; drawMe();
    const steps = ['서류를 묶는 중', '도로로 보내는 중', '가게 진열장에 놓는 중'];
    dState.className = 'd-state';
    dBar.style.transition = 'none'; dBar.style.width = '0'; void dBar.offsetWidth; dBar.style.transition = '';
    VB.msg(msg, (again ? '고친 서류를 다시 가게로 보냅니다.' : '내 방 진열장의 서류를 가게로 보냅니다.') + ' 실제로는 몇 분 걸릴 수 있어 여기서는 줄여서 보여 줍니다.');
    for (let i = 0; i < steps.length; i++) {
      dState.textContent = steps[i] + '...';
      dBar.style.width = ((i + 1) / steps.length * 100) + '%';
      await VB.wait(800);
    }
    st.deploying = false; st.deployed = true; st.deployVer = st.ver;
    drawMe();
    if (!again) VB.msg(msg, `배포가 끝나 <code>${URL}</code> 주소가 생겼습니다. 이제 <b>③ 배포 주소 보내기</b>를 눌러 보세요.`, 'ok');
    else if (st.sent === 'web') VB.msg(msg, '가게 진열장을 바꿨습니다. 하지만 친구 휴대폰은 아직 예전에 받은 화면을 보고 있습니다. 친구 휴대폰 주소창 옆의 새로고침(⟳)을 눌러 보세요.', 'warn');
    else VB.msg(msg, '가게 진열장을 바꿨습니다. 이제 배포 주소를 보내면 고친 화면이 보입니다.', 'ok');
  });
  bEdit.addEventListener('click', () => {
    if (!st.pcOn) return;
    st.ver++;
    drawMe();
    myView.querySelector('.items').classList.add('flash');
    if (st.deployed && st.sent === 'web') VB.msg(msg, '내 화면은 바로 바뀌었지만 친구 휴대폰은 그대로입니다. 고친 것은 내 방 진열장뿐이고, 가게 진열장에는 옛 서류가 있습니다. 친구 휴대폰에서 새로고침을 해 보고, <b>다시 배포하기</b>도 눌러 보세요.', 'warn');
    else if (st.deployed) VB.msg(msg, '내 방 진열장만 바뀌었습니다. 가게 진열장에 반영하려면 다시 배포해야 합니다.', 'warn');
    else VB.msg(msg, '내 방 진열장의 서류를 고쳤습니다. 아직 배포 전이라 남은 볼 수 없습니다.');
  });
  bPower.addEventListener('click', () => {
    st.pcOn = !st.pcOn;
    drawMe();
    if (!st.pcOn) {
      VB.msg(msg, '내 컴퓨터를 껐습니다. 내 방 진열장(미리보기)도 함께 닫혔습니다.' +
        (!st.deployed ? ' 아직 배포하지 않았으니 이제 아무도 볼 수 없습니다.' : st.sent === 'web' ? ' 친구 휴대폰의 새로고침을 눌러 보세요. 배포한 사이트는 가게에 있으니 계속 열립니다.' : ' <b>③ 배포 주소 보내기</b>를 눌러 보세요. 배포한 사이트는 가게에 있으니 계속 열립니다.'), 'warn');
    } else {
      VB.msg(msg, '컴퓨터를 다시 켰습니다. 실제로는 안티그래비티에서 미리보기를 다시 실행해야 내 방 진열장이 열립니다.');
    }
  });
  VB.$(root, '.reset').addEventListener('click', init);
  init();
});
