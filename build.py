# chapters/chNN.html, chNN.js 를 모아 index.html 을 만든다.
# 사용: python build.py
import re
from pathlib import Path

ROOT = Path(__file__).parent
CH = ROOT / "chapters"

PARTS = {
    "1": ("1부", "내 방", "내 컴퓨터 안에서 파일이 어떻게 놓이고, 열리고, 바뀌는지 봅니다."),
    "2": ("2부", "길 밖으로", "파일이 인터넷이라는 길을 따라 다른 컴퓨터로 오가는 방법을 봅니다."),
    "3": ("3부", "가게 운영", "여러 사람이 함께 쓰는 앱이 안에서 어떻게 돌아가는지 봅니다."),
    "4": ("4부", "AI 조수와 일하기", "AI에게 일을 맡길 때 화면에서 마주치는 것들을 봅니다."),
    "6": ("심화", "게임 만들기", "지금까지 배운 것으로 게임을 만들 때 알아야 할 것과 여러 게임 장르를 살펴봅니다."),
    "5": ("마무리", "안티그래비티로", "지금까지 본 장소들이 실제 프로그램 화면의 어디에 있는지 확인합니다."),
}

def main():
    files = sorted(CH.glob("ch*.html"))
    chapters = []
    for f in files:
        html = f.read_text(encoding="utf-8")
        m = re.search(r'<section class="chapter" id="(ch\d+)" data-part="(\d)" data-title="([^"]+)"', html)
        if not m:
            raise SystemExit(f"머리 형식 오류: {f.name}")
        chapters.append((m.group(1), m.group(2), m.group(3), html, f.stem))

    body, toc = [], []
    last_part = None
    for cid, part, title, html, stem in chapters:
        if part != last_part:
            if part in PARTS:
                pn, name, desc = PARTS[part]
                body.append(f'<header class="part-head" id="part{part}" data-part="{part}"><div class="pn">{pn}</div><h2>{name}</h2><p>{desc}</p></header>')
                toc.append(f"<h4>{pn} {name}</h4>")
            else:
                toc.append("<h4>시작</h4>")
            last_part = part
        body.append(html.strip())
        num = int(cid[2:])
        label = str(num) if num and num < 90 else "·"
        toc.append(f'<a href="#{cid}"><span>{label}</span>{title}</a>')

    scripts = "\n".join(
        f'<script src="chapters/{stem}.js"></script>'
        for _, _, _, _, stem in chapters if (CH / f"{stem}.js").exists()
    )
    styles = "\n".join(
        f'<link rel="stylesheet" href="chapters/{stem}.css">'
        for _, _, _, _, stem in chapters if (CH / f"{stem}.css").exists()
    )
    tpl = (ROOT / "template.html").read_text(encoding="utf-8")
    out = (tpl.replace("<!--TOC-->", "\n".join(toc))
              .replace("<!--BODY-->", "\n\n".join(body))
              .replace("<!--SCRIPTS-->", scripts)
              .replace("<!--STYLES-->", styles))
    (ROOT / "index.html").write_text(out, encoding="utf-8")
    print(f"index.html: 챕터 {len(chapters)}개")

if __name__ == "__main__":
    main()
