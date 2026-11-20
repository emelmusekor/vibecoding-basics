VB.ch('ch19', root => {
  const $ = s => VB.$(root, s), $$ = s => VB.$$(root, s);

  /* 필요한 것 풀이 */
  const GLOSS = {
    '충돌 판정': '두 그림이 겹쳤는지 확인하는 계산입니다. 18장에서 별을 먹을 때 쓴 것입니다.',
    '타이머': '시간을 재거나, 정해진 시간마다 무언가가 일어나게 하는 장치입니다.',
    '무작위': '매번 다르게 나오게 하는 장치입니다. 주사위를 굴리는 것과 같습니다.',
    '중력·점프': '위로 뛰었다가 다시 떨어지는 움직임을 계산하는 일입니다.',
    '칸 계산': '판을 바둑판처럼 칸으로 나누고 어느 칸에 무엇이 있는지 기억하는 일입니다.',
    '상대의 움직임': '적이나 컴퓨터 상대가 어떻게 움직일지 정한 약속입니다. 똑똑하게 만들수록 어려워집니다.',
    '숫자 맞추기': '너무 쉽지도 어렵지도 않게 값을 조절하는 일입니다. 사람이 여러 번 해 보며 맞춰야 합니다.',
    '이야기 표': '장면, 대사, 선택지, 다음 장면을 정리한 표입니다. 내용은 내가 쓰고 AI는 화면을 만듭니다.',
    '문제 목록': '퀴즈 문제와 보기, 정답을 모아 둔 자료입니다.',
    '소리': '효과음이나 음악입니다. <code>.mp3</code> 파일을 쓰거나 코드로 소리를 냅니다.',
    '저장': '진행 상황을 남기는 일입니다. 이 기기에서만 이어 하면 브라우저 안 저장 칸으로 충분하고, 여러 기기에서 이어 하려면 장부가 필요합니다(12장).',
    '서버': '여럿이 같은 판을 보려면 가게와 실시간 연결이 있어야 합니다(12장, 13장).',
    '3D': '입체 화면입니다. 3D 모델 파일과 카메라 계산이 필요합니다(21장).',
    '재료 파일 많음': '그림, 소리가 많으면 처음 켤 때 오래 걸립니다(9장).'
  };
  const DIFF = { 1: '쉬움', 2: '보통', 3: '어려움' };
  const DCOL = { 1: '#2b8a4a', 2: '#d89a1c', 3: '#c43d3d' };

  /* 장르 카드. x: 한 판 길이(0 짧음 ~ 100 김), y: 0 손 빠르기 ~ 100 머리 쓰기 */
  const G = [
    { id: 'click', name: '클릭·반응 속도', x: 4, y: 6, diff: 1, who: 'solo', input: 'touch', server: false,
      desc: '화면에 나타나는 것을 빨리 누르는 게임입니다. 정해진 시간 안에 몇 개를 눌렀는지, 얼마나 빨리 반응했는지 겨룹니다.',
      fun: '내 손이 얼마나 빠른지 바로 알 수 있고, 한 판이 짧아 또 하기 쉽습니다.',
      ctrl: '마우스 클릭, 화면 터치', ex: '오락실의 두더지 잡기, 피아노 타일',
      needs: ['타이머', '무작위'],
      say: 'HTML 파일 하나로, 화면에 나타나는 동그라미를 빨리 누르면 점수가 오르는 반응 속도 게임을 만들어 줘. 30초가 지나면 끝나고 점수를 보여 줘.' },
    { id: 'quiz', name: '퀴즈', x: 6, y: 68, diff: 1, who: 'both', input: 'touch', server: false,
      desc: '문제를 보고 보기 중에서 답을 고르는 게임입니다. 맞히면 점수가 오르고 다음 문제로 넘어갑니다.',
      fun: '아는 것을 확인하는 재미와 제한 시간 안에 답하는 긴장감이 있습니다.',
      ctrl: '보기 단추 누르기', ex: '카훗(Kahoot!), 띵커벨',
      needs: ['문제 목록', '타이머'], note: '여럿이 각자 폰으로 동시에 풀게 하려면 서버가 필요합니다.',
      say: 'HTML 파일 하나로 보기 4개 중 하나를 고르는 퀴즈 게임을 만들어 줘. 문제 10개는 내가 아래에 적을게. 문제마다 15초 제한 시간이 있고, 끝나면 맞힌 개수를 보여 줘.' },
    { id: 'match', name: '짝 맞추기·퍼즐', x: 16, y: 82, diff: 1, who: 'solo', input: 'touch', server: false,
      desc: '뒤집힌 카드에서 같은 그림 두 장을 찾거나, 같은 모양 세 개를 한 줄로 맞춰 없애는 게임입니다.',
      fun: '기억력과 눈썰미로 판을 깨끗이 비우는 시원함이 있습니다.',
      ctrl: '클릭, 터치, 끌어서 자리 바꾸기', ex: '애니팡, 캔디 크러시 사가',
      needs: ['칸 계산', '무작위'], note: '카드 짝 맞추기는 쉽고, 세 개 맞춰 없애기는 보통입니다.',
      say: 'HTML 파일 하나로 카드 16장을 뒤집어 같은 그림 짝을 찾는 게임을 만들어 줘. 그림은 색깔 도형으로 하고, 다 찾으면 걸린 시간과 뒤집은 횟수를 보여 줘.' },
    { id: 'block', name: '떨어지는 블록 퍼즐', x: 20, y: 46, diff: 2, who: 'solo', input: 'key', server: false,
      desc: '위에서 떨어지는 조각을 돌리고 옮겨 빈틈없이 쌓는 게임입니다. 한 줄이 꽉 차면 사라지고, 맨 위까지 쌓이면 끝납니다.',
      fun: '빠르게 판단해 딱 맞는 자리에 넣는 손맛이 있습니다. 생각과 손 빠르기를 함께 씁니다.',
      ctrl: '방향키로 옮기기, 키를 눌러 돌리기', ex: '테트리스, 뿌요뿌요',
      needs: ['칸 계산', '타이머', '무작위'],
      say: 'HTML 파일 하나로 위에서 떨어지는 블록을 쌓는 퍼즐 게임을 만들어 줘. 기존 게임과 다른 나만의 조각 모양 5가지를 쓰고, 가로줄이 꽉 차면 사라지게 해 줘. 휴대폰용 화면 단추도 넣어 줘.' },
    { id: 'runner', name: '러너 (끝없이 달리기)', x: 12, y: 26, diff: 2, who: 'solo', input: 'touch', server: false,
      desc: '캐릭터가 저절로 앞으로 달리고, 나는 점프나 미끄러지기만 해서 장애물을 피하는 게임입니다. 갈수록 빨라집니다.',
      fun: '조작이 하나뿐이라 시작은 쉽지만 오래 버티기는 어렵습니다. 내 기록을 넘는 재미가 있습니다.',
      ctrl: '스페이스바나 화면 한 번 누르기', ex: '크롬 공룡 게임(인터넷이 끊겼을 때 나오는 게임), 쿠키런',
      needs: ['충돌 판정', '중력·점프', '무작위'],
      say: 'HTML 파일 하나로, 네모 캐릭터가 저절로 달리고 화면을 누르거나 스페이스바를 누르면 점프해서 장애물을 피하는 게임을 만들어 줘. 시간이 갈수록 빨라지고, 부딪히면 버틴 시간을 보여 줘.' },
    { id: 'platform', name: '플랫포머 (발판 점프)', x: 34, y: 34, diff: 2, who: 'solo', input: 'key', server: false,
      desc: '옆에서 본 화면에서 발판 사이를 뛰어다니며 떨어지지 않고 끝 지점까지 가는 게임입니다. 캐릭터를 따라 화면이 옆으로 움직이는 경우가 많습니다.',
      fun: '어려운 점프에 성공했을 때의 기분, 숨은 길을 찾는 재미가 있습니다.',
      ctrl: '방향키로 움직이고 점프 키 누르기', ex: '슈퍼 마리오 브라더스, 셀레스트',
      needs: ['충돌 판정', '중력·점프', '숫자 맞추기'],
      say: 'HTML 파일 하나로 옆에서 보는 발판 점프 게임을 만들어 줘. 방향키로 움직이고 스페이스바로 점프해. 발판 10개 정도인 짧은 단계 하나만 먼저 만들고, 깃발에 닿으면 끝나게 해 줘.' },
    { id: 'shoot', name: '슈팅', x: 26, y: 10, diff: 2, who: 'solo', input: 'key', server: false,
      desc: '날아오는 적을 쏘아 맞히고 적의 공격은 피하는 게임입니다. 위로 쏘는 방식, 옆으로 쏘는 방식 등이 있습니다.',
      fun: '쏟아지는 공격 사이를 빠져나가며 맞히는 긴장감이 있습니다.',
      ctrl: '방향키로 움직이고 키를 눌러 쏘기', ex: '갤러그, 스페이스 인베이더',
      needs: ['충돌 판정', '상대의 움직임'],
      say: 'HTML 파일 하나로 아래쪽 우주선을 좌우로 움직이며 위에서 내려오는 운석을 쏘아 맞히는 게임을 만들어 줘. 운석에 3번 부딪히면 끝나고, 휴대폰에서는 화면을 끌어서 움직이게 해 줘.' },
    { id: 'rhythm', name: '리듬', x: 15, y: 15, diff: 2, who: 'solo', input: 'touch', server: false,
      desc: '음악에 맞춰 내려오는 표시를 박자에 맞게 누르는 게임입니다. 얼마나 정확히 눌렀는지로 점수를 매깁니다.',
      fun: '음악과 손이 맞아떨어질 때의 기분이 있습니다.',
      ctrl: '정해진 키나 화면 칸 누르기', ex: 'DJMAX, 태고의 달인',
      needs: ['소리', '타이머'], note: '소리와 화면의 박자를 맞추는 일이 생각보다 까다롭습니다.',
      say: 'HTML 파일 하나로 4칸짜리 리듬 게임을 만들어 줘. 음악 파일 없이 코드로 박자 소리를 내고, 내려오는 표시를 D F J K 키나 화면 터치로 누르면 정확도를 보여 줘.' },
    { id: 'board', name: '카드·보드게임', x: 36, y: 72, diff: 2, who: 'both', input: 'touch', server: false,
      desc: '정해진 규칙에 따라 카드를 내거나 말을 옮기며 차례대로 겨루는 게임입니다. 운과 작전이 섞여 있습니다.',
      fun: '상대의 수를 읽고 내 차례를 계획하는 재미가 있습니다.',
      ctrl: '클릭, 터치', ex: '오목·윷놀이 같은 전통 놀이, 하스스톤',
      needs: ['칸 계산', '상대의 움직임'], note: '한 화면에서 둘이 번갈아 하면 쉽고, 컴퓨터 상대를 똑똑하게 만들거나 온라인으로 겨루면 어려워집니다.',
      say: 'HTML 파일 하나로 두 사람이 한 화면에서 번갈아 두는 오목 게임을 만들어 줘. 가로, 세로, 대각선으로 다섯 개가 이어지면 이긴 사람을 알려 줘.' },
    { id: 'novel', name: '선택형 이야기 (비주얼 노벨)', x: 52, y: 92, diff: 1, who: 'solo', input: 'touch', server: false,
      desc: '그림과 글로 이야기가 펼쳐지고, 중간중간 내가 고른 선택에 따라 다음 장면과 결말이 달라지는 게임입니다.',
      fun: '내 선택이 이야기를 바꾸는 재미, 다른 결말을 보러 다시 하는 재미가 있습니다.',
      ctrl: '글 넘기기, 선택지 누르기', ex: '슈타인즈 게이트, 워킹 데드(텔테일 게임즈)',
      needs: ['이야기 표', '저장'], note: '화면은 쉽게 만들어집니다. 이야기를 쓰는 일이 가장 큽니다.',
      say: 'HTML 파일 하나로 선택에 따라 결말이 3가지로 갈리는 짧은 이야기 게임을 만들어 줘. 장면마다 글과 선택지 2개가 나오고, 이야기 내용은 따로 표로 정리해서 내가 고치기 쉽게 해 줘.' },
    { id: 'escape', name: '방 탈출·추리', x: 30, y: 90, diff: 1, who: 'solo', input: 'touch', server: false,
      desc: '방 안의 물건을 살펴 단서를 모으고, 자물쇠 번호를 알아내거나 범인을 찾아 문제를 푸는 게임입니다.',
      fun: '흩어진 단서가 하나로 이어지는 순간의 재미가 있습니다.',
      ctrl: '눌러서 살펴보기, 번호 입력', ex: '더 룸(The Room), 역전재판',
      needs: ['이야기 표'], note: '화면은 쉽게 만들어집니다. 단서와 정답을 짜는 일은 사람이 해야 합니다.',
      say: 'HTML 파일 하나로 방 그림 속 물건 5개를 눌러 단서를 모으고, 단서로 알아낸 네 자리 번호를 넣으면 문이 열리는 방 탈출 게임을 만들어 줘. 단서와 정답은 내가 정할게.' },
    { id: 'sim', name: '키우기·경영 시뮬레이션', x: 78, y: 78, diff: 2, who: 'solo', input: 'touch', server: false,
      desc: '동물이나 식물을 돌보거나 가게, 마을을 운영하며 시간이 지날수록 키워 가는 게임입니다.',
      fun: '조금씩 자라고 늘어나는 것을 보는 뿌듯함이 있습니다.',
      ctrl: '클릭, 터치', ex: '다마고치, 심시티',
      needs: ['저장', '타이머', '숫자 맞추기'], note: '며칠씩 이어 하므로 저장이 꼭 있어야 합니다.',
      say: 'HTML 파일 하나로 화분 하나를 키우는 게임을 만들어 줘. 물 주기와 햇빛 단추가 있고, 시간이 지나면 자라. 진행 상황은 이 브라우저에 저장해서 다시 열어도 이어지게 해 줘.' },
    { id: 'td', name: '타워 디펜스·전략', x: 54, y: 58, diff: 3, who: 'solo', input: 'touch', server: false,
      desc: '정해진 길로 몰려오는 적을 막기 위해 길가에 방어 탑을 세우는 게임입니다. 자원을 모으고 부대를 움직여 상대를 이기는 전략 게임도 이 근처에 있습니다.',
      fun: '내 배치가 맞아떨어져 적을 모두 막아 낼 때의 만족감이 있습니다.',
      ctrl: '눌러서 탑 놓기', ex: '킹덤 러시, 스타크래프트',
      needs: ['상대의 움직임', '충돌 판정', '숫자 맞추기'],
      say: 'HTML 파일 하나로 구불구불한 길 하나를 따라 적이 오는 타워 디펜스 게임을 만들어 줘. 탑 한 종류, 적 한 종류로 시작하고 적이 5번 몰려오는 것을 막으면 이기게 해 줘.' },
    { id: 'rpg', name: 'RPG (역할 놀이, 레벨 올리기)', x: 85, y: 54, diff: 3, who: 'solo', input: 'key', server: false, left: true,
      desc: '한 인물이 되어 세상을 돌아다니며 싸우고, 경험치를 모아 레벨을 올리고, 긴 이야기를 따라가는 게임입니다.',
      fun: '내 캐릭터가 점점 강해지는 성장과 긴 이야기를 따라가는 재미가 있습니다.',
      ctrl: '방향키로 걷기, 메뉴에서 고르기', ex: '포켓몬스터, 드래곤 퀘스트',
      needs: ['저장', '이야기 표', '숫자 맞추기', '재료 파일 많음'],
      say: 'HTML 파일 하나로 RPG의 전투 장면 하나만 먼저 만들어 줘. 내 캐릭터와 적 하나가 번갈아 공격이나 회복을 고르고, 이기면 경험치가 올라. 지도와 이야기는 아직 넣지 마.' },
    { id: 'rogue', name: '로그라이크 (매번 바뀌는 던전)', x: 60, y: 38, diff: 3, who: 'solo', input: 'key', server: false,
      desc: '던전(지하 미로)에 들어갈 때마다 지도와 아이템이 새로 바뀌는 게임입니다. 지면 처음부터 다시 시작하는 경우가 많습니다.',
      fun: '매번 다른 판이 나오고, 운과 실력이 함께 작용합니다.',
      ctrl: '방향키, 클릭', ex: '하데스, 슬레이 더 스파이어',
      needs: ['무작위', '칸 계산', '상대의 움직임'],
      say: 'HTML 파일 하나로 칸으로 된 작은 던전 게임을 만들어 줘. 시작할 때마다 방 5개짜리 지도가 무작위로 만들어지고, 방향키로 한 칸씩 움직여 계단을 찾으면 다음 층으로 가.' },
    { id: 'sandbox', name: '샌드박스·만들기', x: 92, y: 68, diff: 3, who: 'solo', input: 'key', server: false, left: true,
      desc: '정해진 목표 없이 블록이나 재료로 집, 마을, 장치를 자유롭게 짓는 게임입니다.',
      fun: '내가 상상한 것을 직접 지어 보는 재미가 있습니다.',
      ctrl: '마우스로 놓기와 지우기, 이동 키', ex: '마인크래프트, 테라리아',
      needs: ['칸 계산', '저장', '3D'], note: '위에서 내려다보는 2D로 작게 만들면 보통, 3D로 만들면 어려움입니다.',
      say: 'HTML 파일 하나로 위에서 내려다보는 칸 그림판 게임을 만들어 줘. 흙, 물, 나무, 돌 중 하나를 골라 칸을 눌러 놓고, 만든 모양을 이 브라우저에 저장해 줘.' },
    { id: 'race', name: '레이싱', x: 40, y: 18, diff: 2, who: 'both', input: 'key', server: false,
      desc: '정해진 길을 다른 차보다 빨리 달려 결승선에 먼저 들어가는 게임입니다.',
      fun: '속도감과 아슬아슬한 추월이 있습니다.',
      ctrl: '방향키, 휴대폰은 화면 단추나 기울이기', ex: '카트라이더, 마리오 카트',
      needs: ['충돌 판정', '상대의 움직임', '3D'], note: '위에서 내려다보는 2D는 보통, 3D로 만들면 어려움입니다.',
      say: 'HTML 파일 하나로 위에서 내려다보는 자동차 경주 게임을 만들어 줘. 타원형 길 하나를 3바퀴 도는데, 길 밖으로 나가면 느려지고, 끝나면 걸린 시간을 보여 줘.' },
    { id: '3d', name: '3D 탐험', x: 70, y: 44, diff: 3, who: 'solo', input: 'key', server: false,
      desc: '입체로 된 공간을 마음대로 걸어 다니며 구경하고, 숨겨진 것을 찾거나 목적지까지 가는 게임입니다.',
      fun: '직접 그 장소에 들어가 있는 느낌이 듭니다.',
      ctrl: '키보드로 걷고 마우스로 둘러보기', ex: '젤다의 전설 브레스 오브 더 와일드, 저니',
      needs: ['3D', '충돌 판정', '재료 파일 많음'],
      say: 'HTML 파일 하나로 Three.js를 써서 넓은 풀밭에 상자 10개가 놓인 3D 공간을 만들어 줘. 방향키로 걷고 마우스로 둘러보며, 상자에 다가가면 사라지게 해 줘.' },
    { id: 'multi', name: '여럿이 하는 게임 (멀티플레이)', multi: true, diff: 3, who: 'multi', input: 'any', server: true,
      desc: '여러 사람이 각자 기기로 같은 판에 들어와 함께 하거나 겨루는 게임입니다. 장르라기보다 어느 장르에나 붙일 수 있는 방식입니다.',
      fun: '사람과 함께하는 재미, 예측할 수 없는 상대가 있습니다.',
      ctrl: '장르에 따라 다름', ex: '어몽 어스, 리그 오브 레전드',
      needs: ['서버', '저장'], note: '모두의 화면이 같은 장부를 보고 서로 바로 알려 주어야 합니다. 21장에서 자세히 봅니다.',
      say: 'HTML 파일 하나로 같은 방 번호를 넣은 사람들이 각자 폰에서 함께 푸는 퀴즈 게임을 만들어 줘. 실시간 연결에는 Firebase를 쓰고, 설정 방법도 단계별로 알려 줘.' }
  ];
  const byId = Object.fromEntries(G.map(g => [g.id, g]));
  const ORDER = [['click', '반응 속도'], ['quiz', '퀴즈'], ['match', '짝 맞추기'], ['runner', '러너'], ['platform', '플랫포머'], ['sim', '키우기'], ['rpg', 'RPG']];

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const whoText = g => g.who === 'multi' ? '여럿이' : g.who === 'both' ? '혼자·여럿이' : '혼자';
  const inText = g => g.input === 'touch' ? '터치·클릭만으로' : g.input === 'key' ? '키보드가 편함' : '장르에 따라';

  function cardHTML(g) {
    return `<article class="c19-card" data-id="${g.id}">
      <header><h5>${esc(g.name)}</h5><span class="c19-diff d${g.diff}">${DIFF[g.diff]}</span></header>
      <div class="c19-tags"><span>${whoText(g)}</span><span>${inText(g)}</span><span class="${g.server ? 'srv' : ''}">${g.server ? '서버 필요' : '서버 없이'}</span></div>
      <p class="c19-desc">${esc(g.desc)}</p>
      <dl class="c19-kv">
        <dt>재미</dt><dd>${esc(g.fun)}</dd>
        <dt>조작</dt><dd>${esc(g.ctrl)}</dd>
        <dt>이런 게임</dt><dd>${esc(g.ex)}</dd>
        <dt>필요한 것</dt><dd class="c19-needs">${g.needs.map(n => `<span title="${esc(GLOSS[n].replace(/<[^>]+>/g, ''))}">${n}</span>`).join('')}</dd>
      </dl>
      ${g.note ? `<p class="c19-note">${esc(g.note)}</p>` : ''}
      <div class="c19-say"><div class="c19-say-h">AI에게 이렇게 말해 보세요<button class="btn c19-copy" type="button">복사</button></div><p>${esc(g.say)}</p></div>
    </article>`;
  }

  /* 지도 점 */
  const dotsG = $('.c19-dots');
  const NS = 'http://www.w3.org/2000/svg';
  const px = x => 110 + x / 100 * 740, py = y => 50 + y / 100 * 380;
  G.filter(g => !g.multi).forEach(g => {
    const a = document.createElementNS(NS, 'g');
    a.setAttribute('class', 'c19-dot');
    a.setAttribute('data-id', g.id);
    a.setAttribute('tabindex', '0');
    a.setAttribute('role', 'button');
    a.setAttribute('aria-label', g.name + ' 카드 열기');
    const X = px(g.x), Y = py(g.y);
    const label = g.name.replace(/ \(.+\)$/, '');
    const tx = g.left ? X - 16 : X + 16;
    a.innerHTML = `<circle class="hit" cx="${X}" cy="${Y}" r="20" fill="transparent"/>
      <circle class="ring" cx="${X}" cy="${Y}" r="15" fill="none" stroke="${DCOL[g.diff]}" stroke-width="3"/>
      <circle class="pt" cx="${X}" cy="${Y}" r="10" fill="${DCOL[g.diff]}" stroke="#fff" stroke-width="2.5"/>
      <text x="${tx}" y="${Y + 6}" font-size="17" font-weight="700" fill="#1d2433" text-anchor="${g.left ? 'end' : 'start'}">${label}</text>`;
    dotsG.appendChild(a);
  });
  const multiRow = $('.c19-multi-row');
  const mg = byId.multi;
  multiRow.innerHTML = `<button type="button" class="c19-dot c19-mdot" data-id="multi"><i style="background:${DCOL[mg.diff]}"></i>여럿이 하는 게임 (멀티플레이)<small>위 어느 장르에든 붙일 수 있음 · 서버 필요</small></button>`;

  const detail = $('.c19-detail');
  let picked = null;
  function pick(id, scroll) {
    picked = id;
    $$('.c19-dot').forEach(d => d.classList.toggle('on', d.dataset.id === id));
    detail.innerHTML = cardHTML(byId[id]);
    detail.classList.remove('pop'); void detail.offsetWidth; detail.classList.add('pop');
    if (scroll) detail.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  root.addEventListener('click', e => {
    const d = e.target.closest('.c19-dot');
    if (d && root.contains(d)) { pick(d.dataset.id, true); return; }
    const o = e.target.closest('.c19-order button');
    if (o) { pick(o.dataset.id, false); $('.c19-fig').scrollIntoView({ block: 'start', behavior: 'smooth' }); }
  });
  $$('.c19-dot').forEach(d => d.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(d.dataset.id, true); }
  }));

  /* 권하는 순서 */
  $('.c19-order').innerHTML = ORDER.map(([id, n], i) =>
    `<li><button type="button" data-id="${id}"><span>${i + 1}</span>${n}<i class="c19-diff d${byId[id].diff}">${DIFF[byId[id].diff]}</i></button></li>`).join('');

  /* 풀이 */
  $('.c19-gloss').innerHTML = Object.entries(GLOSS).map(([k, v]) => `<div><b>${k}</b>${v}</div>`).join('');

  /* 걸러 보기 */
  const cardsEl = $('.c19-cards'), countEl = $('.c19-count'), msg = $('.c19-msg');
  cardsEl.innerHTML = G.map(cardHTML).join('');
  let F;
  function match(g) {
    if (F.diff && String(g.diff) !== F.diff) return false;
    if (F.who === 'solo' && g.who === 'multi') return false;
    if (F.who === 'multi' && g.who === 'solo') return false;
    if (F.input && g.input !== 'any' && g.input !== F.input) return false;
    if (F.server === 'no' && g.server) return false;
    if (F.server === 'yes' && !g.server) return false;
    return true;
  }
  function apply(changed) {
    $$('.c19-fg').forEach(fg => VB.$$(fg, 'button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === F[fg.dataset.f])));
    const ok = G.filter(match);
    const okSet = new Set(ok.map(g => g.id));
    VB.$$(cardsEl, '.c19-card').forEach(c => { c.hidden = !okSet.has(c.dataset.id); });
    $$('.c19-dot').forEach(d => d.classList.toggle('dim', !okSet.has(d.dataset.id)));
    countEl.innerHTML = `장르 ${G.length}개 중 <b>${ok.length}개</b>`;
    if (!changed) return;
    if (!ok.length) { VB.msg(msg, '조건에 맞는 장르가 없습니다. 조건 하나를 [전체]로 돌려 보세요.', 'warn'); return; }
    const names = ok.map(g => g.name.replace(/ \(.+\)$/, '')).join(', ');
    let tip = '';
    if (F.server === 'yes' || F.who === 'multi') tip = ' 여럿이 각자 기기로 하려면 12장의 장부와 13장의 실시간 연결이 필요해서 어려워집니다.';
    else if (F.diff === '1') tip = ' 처음이라면 이 중 하나를 골라 HTML 파일 하나로 시작해 보세요.';
    else if (F.diff === '3') tip = ' 어려운 장르는 한 번에 만들지 말고, 카드의 예시처럼 작은 조각 하나부터 시작합니다.';
    else if (F.input === 'touch') tip = ' 휴대폰에서도 바로 할 수 있는 장르들입니다.';
    VB.msg(msg, `${names}.${tip}`, 'ok');
  }
  $$('.c19-fg button').forEach(b => b.addEventListener('click', () => {
    const f = b.closest('.c19-fg').dataset.f;
    F[f] = b.dataset.v;
    apply(true);
  }));

  /* 복사 */
  function copyText(t) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(t).then(() => true, () => fallback(t));
    return Promise.resolve(fallback(t));
  }
  function fallback(t) {
    const ta = document.createElement('textarea');
    ta.value = t; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
    ta.remove(); return ok;
  }
  root.addEventListener('click', e => {
    const b = e.target.closest('.c19-copy'); if (!b) return;
    const card = b.closest('.c19-card'), g = byId[card.dataset.id];
    copyText(g.say).then(ok => {
      b.textContent = ok ? '복사됨' : '복사 안 됨';
      b.classList.toggle('done', ok);
      setTimeout(() => { b.textContent = '복사'; b.classList.remove('done'); }, 1600);
      if (b.closest('.lab')) VB.msg(msg, ok
        ? `<b>${esc(g.name)}</b> 예시 문장을 복사했습니다. 안티그래비티의 AI 대화 칸에 <kbd>Ctrl</kbd>+<kbd>V</kbd>로 붙여 넣으면 됩니다. 숫자나 모양은 마음대로 바꿔도 됩니다.`
        : '이 브라우저에서는 자동 복사가 막혀 있습니다. 문장을 마우스로 끌어 고른 뒤 <kbd>Ctrl</kbd>+<kbd>C</kbd>로 복사하세요.', ok ? 'ok' : 'warn');
    });
  });

  function reset() {
    F = { diff: '', who: '', input: '', server: '' };
    apply(false);
    VB.msg(msg, '조건을 하나 눌러 보세요.');
  }
  $('.reset').addEventListener('click', reset);
  reset();
});
