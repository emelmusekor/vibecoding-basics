VB.ch('ch14', root => {
  const $ = s => VB.$(root, s);
  const lab = $('.lab'), msg = $('.c14-msg');
  const chat = $('.c14-chat'), q = $('.c14-q'), sendBtn = $('.c14-send');
  const srcBox = $('.c14-source'), code = $('.c14-code'), kitchen = $('.c14-kitchen');
  const abuse = $('.c14-abuse'), term = $('.c14-term'), money = $('.c14-money'), calls = $('.c14-calls'), bar = $('.c14-meter .bar i'), cap = $('.c14-cap');
  const srcBtn = $('.c14-src'), stealBtn = $('.c14-steal'), moveBtn = $('.c14-move');
  const KEY = 'sk-test-0000-0000-0000-FAKEKEY';
  const CAP = 50000, PRICE = 600, FULL = 2000000;
  const qs = ['광합성이 뭐예요?', '분수 나눗셈은 어떻게 해요?', '태양계 행성 순서를 알려 주세요'];
  const replies = {
    '광합성이 뭐예요?': '식물이 햇빛과 물, 이산화탄소로 양분을 만드는 일입니다.',
    '분수 나눗셈은 어떻게 해요?': '나누는 수의 분자와 분모를 바꾸어 곱하면 됩니다.',
    '태양계 행성 순서를 알려 주세요': '수성, 금성, 지구, 화성, 목성, 토성, 천왕성, 해왕성 순서입니다.'
  };
  let moved, cost, n, running, timer, qi, gen = 0;

  function renderCode() {
    const before = [
      ['', '<span class="t">&lt;script&gt;</span>'],
      ['hl', `  <span class="k">const</span> API_KEY = <span class="s">"${KEY}"</span>;`],
      ['', ''],
      ['', '  <span class="k">async function</span> ask(question) {'],
      ['', '    <span class="k">const</span> res = <span class="k">await</span> fetch(<span class="s">"https://api.ai-shop.example/v1/chat"</span>, {'],
      ['', '      method: <span class="s">"POST"</span>,'],
      ['', '      headers: { Authorization: <span class="s">"Bearer "</span> + API_KEY },'],
      ['', '      body: JSON.stringify({ question })'],
      ['', '    });'],
      ['', '    <span class="k">return</span> res.json();'],
      ['', '  }'],
      ['', '<span class="t">&lt;/script&gt;</span>']
    ];
    const after = [
      ['', '<span class="t">&lt;script&gt;</span>'],
      ['', '  <span class="c">// 열쇠는 이 코드에 없습니다. 주방에 주문만 넣습니다.</span>'],
      ['', '  <span class="k">async function</span> ask(question) {'],
      ['hl ok', '    <span class="k">const</span> res = <span class="k">await</span> fetch(<span class="s">"/api/ask"</span>, {'],
      ['', '      method: <span class="s">"POST"</span>,'],
      ['', '      body: JSON.stringify({ question })'],
      ['', '    });'],
      ['', '    <span class="k">return</span> res.json();'],
      ['', '  }'],
      ['', '<span class="t">&lt;/script&gt;</span>']
    ];
    code.innerHTML = (moved ? after : before).map(([c, l]) => `<span class="ln ${c}">${l || ' '}</span>`).join('');
  }

  /* 챗봇 */
  function bubble(who, text) {
    const d = document.createElement('div');
    d.className = 'c14-b ' + who;
    d.textContent = text;
    chat.appendChild(d);
    chat.scrollTop = chat.scrollHeight;
    return d;
  }
  async function send() {
    const g = gen;
    const text = q.value.trim() || qs[qi % qs.length];
    bubble('me', text);
    qi++; q.value = qs[qi % qs.length];
    const b = bubble('bot', '생각하는 중');
    await VB.wait(700);
    if (g !== gen) return;
    b.textContent = replies[text] || '좋은 질문입니다. 체험용 앱이라 정해진 답만 할 수 있습니다.';
    if (!srcBox.hidden) return;
    VB.msg(msg, moved
      ? '열쇠를 주방으로 옮긴 뒤에도 앱은 똑같이 동작합니다. 손님 눈에는 차이가 없습니다.'
      : '챗봇이 답했습니다. 이 앱은 질문할 때마다 AI 가게에 열쇠를 보여 주고 주문합니다. 이제 [1. 페이지 소스 보기]를 눌러 보세요.');
  }
  sendBtn.addEventListener('click', send);
  q.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });

  /* 1. 소스 보기 */
  srcBtn.addEventListener('click', () => {
    srcBox.hidden = false;
    renderCode();
    VB.msg(msg, moved
      ? '이제 소스에는 열쇠가 없습니다. 보이는 것은 <code>fetch("/api/ask")</code>, 곧 우리 가게 주방에 넣는 주문뿐입니다. 열쇠는 주방의 <code>.env</code>에 있고 손님에게 배달되지 않습니다.'
      : `누구나 이 화면을 볼 수 있습니다. 크롬에서 <kbd>Ctrl</kbd>+<kbd>U</kbd>만 누르면 됩니다. 노란 줄에 열쇠 <code>${KEY}</code>가 그대로 적혀 있습니다. 화면 코드는 손님 브라우저로 통째로 배달되기 때문입니다.`,
      moved ? 'ok' : 'bad');
  });

  /* 2. 열쇠 가져가기 */
  let onScreen = false;
  new IntersectionObserver(es => { onScreen = es[0].isIntersecting; }, { threshold: 0 }).observe(lab);
  function line(html) { term.innerHTML += html + '\n'; term.scrollTop = term.scrollHeight; }
  function renderMeter() {
    money.textContent = Math.round(cost).toLocaleString('ko-KR') + '원';
    calls.textContent = '주문 ' + n.toLocaleString('ko-KR') + '회';
    bar.style.width = Math.min(100, cost / FULL * 100) + '%';
    money.classList.toggle('hot', cost > CAP);
  }
  function stop() { clearInterval(timer); timer = null; running = false; stealBtn.disabled = false; }

  stealBtn.addEventListener('click', async () => {
    const g = gen;
    abuse.hidden = false;
    term.innerHTML = '';
    stealBtn.disabled = true;
    line('<span class="d">모르는 사람의 컴퓨터</span>');
    line('<span class="p">$</span> my-chatbot.example.com 페이지 소스 열기');
    await VB.wait(500); if (g !== gen) return;
    if (moved) {
      line('<span class="p">$</span> "API_KEY" 찾는 중...');
      await VB.wait(600); if (g !== gen) return;
      line('<span class="d">찾지 못함. fetch("/api/ask") 주문만 보임</span>');
      line('<span class="d">열쇠 없이는 AI 가게에 주문할 수 없음</span>');
      stealBtn.disabled = false;
      VB.msg(msg, '열쇠가 화면 코드에 없으니 가져갈 것이 없습니다. 다만 남이 우리 가게 주방(<code>/api/ask</code>)에 주문을 마구 넣을 수는 있습니다. 그래서 주방에 옮긴 뒤에도 사용 한도는 걸어 두는 것이 좋습니다.', 'ok');
      return;
    }
    line(`<span class="e">열쇠 발견: ${KEY}</span>`);
    line('<span class="p">$</span> 이 열쇠로 AI 가게에 대량 주문 시작');
    VB.msg(msg, '열쇠를 가져간 사람이 그 열쇠로 AI 가게에 주문을 쏟아붓습니다. 요금은 열쇠 주인인 나에게 청구됩니다.', 'bad');
    running = true;
    let t = 0, nextLog = 1;
    timer = setInterval(() => {
      if (!onScreen || document.hidden) return;
      t += 0.1;
      const k = Math.round(4 + t * t * 1.4);
      if (cap.checked && cost + k * PRICE >= CAP) {
        n += Math.floor((CAP - cost) / PRICE); cost = CAP; renderMeter(); stop();
        line('<span class="e">사용 한도 도달. 이 열쇠의 주문이 막힘</span>');
        VB.msg(msg, '사용 한도 5만 원에 닿아 주문이 멈췄습니다. 열쇠가 새어 나가도 피해가 한도 안에서 끝납니다. 그래도 열쇠는 바꿔야 합니다. [3. 열쇠를 주방으로 옮기기]를 눌러 보세요.', 'warn');
        return;
      }
      n += k; cost += k * PRICE; renderMeter();
      if (t >= nextLog) { line(`<span class="d">${Math.round(t)}초: 주문 ${n.toLocaleString('ko-KR')}회 보냄</span>`); nextLog++; }
      if (t >= 9) {
        stop();
        line('<span class="e">계속 사용 중...</span>');
        VB.msg(msg, `몇 초 만에 요금이 <b>${money.textContent}</b>이 되었습니다(가상 금액). 실제로는 며칠 동안 모르는 사이에 쌓이다가 청구서로 알게 됩니다. 오른쪽 [사용 한도] 스위치를 켜고 다시 눌러 보거나, [3. 열쇠를 주방으로 옮기기]를 눌러 보세요.`, 'bad');
      }
    }, 100);
  });
  cap.addEventListener('change', () => {
    if (!running) { cost = 0; n = 0; renderMeter(); }
  });

  /* 3. 주방으로 옮기기 */
  moveBtn.addEventListener('click', () => {
    if (running) stop();
    const wasStolen = cost > 0;
    moved = true;
    kitchen.hidden = false;
    moveBtn.disabled = true;
    srcBox.hidden = false;
    renderCode();
    VB.msg(msg, '열쇠를 주방의 <code>.env</code> 서류로 옮겼습니다. 소스에는 열쇠 대신 우리 가게 주방에 넣는 주문 <code>fetch("/api/ask")</code>만 남았습니다. 이제 [2]를 다시 눌러 보세요.' +
      (wasStolen ? ' 이미 가져간 열쇠는 코드에서 지워도 계속 쓸 수 있으니, 실제라면 서비스에서 그 열쇠를 폐기하고 새로 발급해야 합니다.' : ''), 'ok');
  });

  /* 처음으로 */
  function reset() {
    gen++;
    if (timer) stop();
    moved = false; cost = 0; n = 0; running = false; qi = 0;
    chat.innerHTML = '';
    bubble('bot', '안녕하세요. 궁금한 것을 물어보세요.');
    q.value = qs[0];
    srcBox.hidden = true; kitchen.hidden = true; abuse.hidden = true;
    term.innerHTML = ''; cap.checked = false;
    stealBtn.disabled = false; moveBtn.disabled = false;
    renderMeter();
    VB.msg(msg, '챗봇 입력칸에 질문을 써서 보내 보세요. 그다음 [1. 페이지 소스 보기]를 누릅니다.');
  }
  $('.reset').addEventListener('click', reset);
  reset();
});
