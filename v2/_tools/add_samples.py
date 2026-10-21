# -*- coding: utf-8 -*-
"""샘플 데이터 2배 확장 — slides 6→10, processing 8→16, projects 8→16 (press 12종은 유지)
실행: python add_samples.py   (gen_images_more.py 로 이미지 24장을 먼저 만든 뒤)
- v1·v2·v3 의 assets/data/site.js 에 같은 항목을 덧붙이고 dataVersion 을 3 으로 올린다
- v2/assets/img 의 새 이미지를 v1·v3 로 복사한다
"""
import os, re, shutil
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
IMG2 = os.path.join(ROOT, "v2", "assets", "img")

NEW_IMAGES = [f"main-{i:02d}.jpg" for i in range(7, 11)] + [f"liv-{i:02d}.jpg" for i in range(5, 9)] + [f"com-{i:02d}.jpg" for i in range(5, 9)] \
           + [f"sub-{i:02d}.jpg" for i in range(5, 13)] + [f"proc-{i:02d}.jpg" for i in range(5, 9)]

SLIDES = '''    { src: "assets/img/main-07.jpg", ui: "auto", title: "stair house", caption: "세종 단독주택 — 오크 계단과 2층 높이 거실", projectId: "stair-house" },
    { src: "assets/img/main-08.jpg", ui: "auto", title: "salon A", caption: "두정동 헤어살롱 — 아치 거울과 테라조 바닥", projectId: "salon-a" },
    { src: "assets/img/main-09.jpg", ui: "auto", title: "cafe S", caption: "성정동 카페 — 천창 아래 긴 석재 카운터", projectId: "cafe-s" },
    { src: "assets/img/main-10.jpg", ui: "auto", title: "tea room", caption: "다다미와 장지문의 찻집", projectId: "tea-room" }'''

PROCESSING = '''    { src: "assets/img/proc-05.jpg", caption: "두정동 살롱 — 곡면 벽 미장" },
    { src: "assets/img/proc-06.jpg", caption: "도면 검토와 마감재 선정" },
    { src: "assets/img/proc-07.jpg", caption: "제작 가구 — 오크 캐비닛 조립" },
    { src: "assets/img/proc-08.jpg", caption: "타일 나누기 시공" },
    { src: "assets/img/sub-06.jpg", caption: "계단 난간 디테일" },
    { src: "assets/img/sub-08.jpg", caption: "테라조 카운터 모서리" },
    { src: "assets/img/sub-09.jpg", caption: "복도 간접 조명 점검" },
    { src: "assets/img/sub-10.jpg", caption: "리셉션 상판 시공" }'''

PROJECTS = '''    { id: "stair-house", category: "living", title: "stair house", year: 2026, field: "SPACE, FURNITURE",
      cover: "assets/img/main-07.jpg", main: "assets/img/main-07.jpg",
      desc: "2층 높이의 거실에 오크 계단을 띄운 단독주택. 계단참의 작은 창이 하루의 빛을 거실로 끌어들입니다.",
      location: "Sejong", area: "168㎡", use: "Residential", materials: "oak, white plaster, black steel", photography: "DARUDA",
      subs: [ { src: "assets/img/sub-06.jpg", shape: "portrait" }, { src: "assets/img/sub-11.jpg", shape: "landscape" }, { src: "assets/img/sub-07.jpg", shape: "portrait" }, { src: "assets/img/liv-05.jpg", shape: "landscape" } ] },
    { id: "attic-bed", category: "living", title: "attic bedroom", year: 2025, field: "SPACE",
      cover: "assets/img/liv-05.jpg", main: "assets/img/liv-05.jpg",
      desc: "경사 천장을 흰색으로 비우고 낮은 평상 침대만 둔 다락 침실. 바닥의 오크가 유일한 색입니다.",
      location: "Cheonan, Chungnam", area: "22㎡", use: "Residential", materials: "oak, white paint, linen", photography: "DARUDA",
      subs: [ { src: "assets/img/sub-07.jpg", shape: "portrait" }, { src: "assets/img/sub-11.jpg", shape: "landscape" } ] },
    { id: "home-office", category: "living", title: "home office", year: 2025, field: "SPACE, FURNITURE",
      cover: "assets/img/liv-06.jpg", main: "assets/img/liv-06.jpg",
      desc: "창 아래로 긴 자작나무 책상을 제작해 넣은 재택 사무실. 수납은 책상 아래로 숨겼습니다.",
      location: "Asan, Chungnam", area: "12㎡", use: "Residential", materials: "birch plywood, linen", photography: "DARUDA",
      subs: [ { src: "assets/img/sub-12.jpg", shape: "landscape" }, { src: "assets/img/sub-05.jpg", shape: "portrait" } ] },
    { id: "entry-bench", category: "living", title: "entrance hall", year: 2024, field: "SPACE, FURNITURE",
      cover: "assets/img/liv-07.jpg", main: "assets/img/liv-07.jpg",
      desc: "현관에 오크 벤치를 짜 넣고 석재 바닥과 둥근 거울로 마무리한 작은 공간.",
      location: "Cheonan, Chungnam", area: "6㎡", use: "Residential", materials: "oak, limestone, brass", photography: "DARUDA",
      subs: [ { src: "assets/img/sub-05.jpg", shape: "portrait" }, { src: "assets/img/liv-08.jpg", shape: "landscape" } ] },
    { id: "green-kitchen", category: "living", title: "green kitchen", year: 2024, field: "SPACE, FURNITURE",
      cover: "assets/img/liv-08.jpg", main: "assets/img/liv-08.jpg",
      desc: "짙은 녹색 아일랜드와 황동 펜던트로 중심을 잡은 주방·식당. 상부장은 두지 않았습니다.",
      location: "Cheonan, Chungnam", area: "38㎡", use: "Residential", materials: "green lacquer, brass, oak", photography: "DARUDA",
      subs: [ { src: "assets/img/sub-08.jpg", shape: "portrait" }, { src: "assets/img/sub-12.jpg", shape: "landscape" }, { src: "assets/img/sub-09.jpg", shape: "landscape" } ] },
    { id: "salon-a", category: "commercial", title: "salon A", year: 2026, field: "SPACE, BRANDING",
      cover: "assets/img/main-08.jpg", main: "assets/img/main-08.jpg",
      desc: "아치형 거울과 베이지 플라스터 벽의 헤어살롱. 테라조 바닥과 간판 서체를 한 규칙으로 맞췄습니다.",
      location: "Dujeong-dong, Cheonan", area: "96㎡", use: "Hair Salon", materials: "plaster, terrazzo, brass", photography: "DARUDA",
      subs: [ { src: "assets/img/sub-08.jpg", shape: "portrait" }, { src: "assets/img/sub-09.jpg", shape: "landscape" }, { src: "assets/img/sub-07.jpg", shape: "portrait" } ] },
    { id: "cafe-s", category: "commercial", title: "cafe S", year: 2025, field: "SPACE",
      cover: "assets/img/main-09.jpg", main: "assets/img/main-09.jpg",
      desc: "천창 아래 긴 석재 카운터 하나로 정리한 콘크리트 카페. 가구는 벤치 하나와 스툴뿐입니다.",
      location: "Seongjeong-dong, Cheonan", area: "88㎡", use: "Cafe", materials: "concrete, basalt, oak", photography: "DARUDA",
      subs: [ { src: "assets/img/sub-10.jpg", shape: "landscape" }, { src: "assets/img/sub-11.jpg", shape: "landscape" }, { src: "assets/img/sub-06.jpg", shape: "portrait" } ] },
    { id: "tea-room", category: "commercial", title: "tea room", year: 2025, field: "SPACE, FURNITURE",
      cover: "assets/img/main-10.jpg", main: "assets/img/main-10.jpg",
      desc: "다다미와 장지문, 짙은 목재로 구성한 찻집. 좌탁과 선반을 제작했습니다.",
      location: "Gongju, Chungnam", area: "54㎡", use: "Tea House", materials: "dark timber, tatami, washi", photography: "DARUDA",
      subs: [ { src: "assets/img/sub-12.jpg", shape: "landscape" }, { src: "assets/img/sub-05.jpg", shape: "portrait" } ] },
    { id: "eyewear-n", category: "commercial", title: "eyewear N", year: 2024, field: "SPACE, BRANDING",
      cover: "assets/img/com-05.jpg", main: "assets/img/com-05.jpg",
      desc: "흰 벽감 진열과 트래버틴 카운터의 안경 매장. 안경 한 개씩만 놓이는 진열 간격을 먼저 정했습니다.",
      location: "Cheonan, Chungnam", area: "42㎡", use: "Eyewear Shop", materials: "travertine, white lacquer", photography: "DARUDA",
      subs: [ { src: "assets/img/sub-10.jpg", shape: "landscape" }, { src: "assets/img/sub-05.jpg", shape: "portrait" } ] },
    { id: "flower-m", category: "commercial", title: "flower M", year: 2024, field: "SPACE",
      cover: "assets/img/com-06.jpg", main: "assets/img/com-06.jpg",
      desc: "아연 카운터와 콘크리트 바닥의 꽃집. 꽃이 유일한 색이 되도록 재료의 색을 모두 뺐습니다.",
      location: "Cheonan, Chungnam", area: "33㎡", use: "Flower Shop", materials: "zinc, concrete, glass", photography: "DARUDA",
      subs: [ { src: "assets/img/sub-11.jpg", shape: "landscape" }, { src: "assets/img/sub-07.jpg", shape: "portrait" } ] },
    { id: "pilates-l", category: "commercial", title: "pilates L", year: 2023, field: "SPACE",
      cover: "assets/img/com-07.jpg", main: "assets/img/com-07.jpg",
      desc: "연한 원목 바닥과 거울, 벽을 씻는 조명만으로 구성한 필라테스 스튜디오.",
      location: "Cheonan, Chungnam", area: "120㎡", use: "Pilates Studio", materials: "maple, mirror, plaster", photography: "DARUDA",
      subs: [ { src: "assets/img/sub-09.jpg", shape: "landscape" }, { src: "assets/img/sub-06.jpg", shape: "portrait" } ] },
    { id: "hotel-r", category: "commercial", title: "hotel R", year: 2023, field: "SPACE, FURNITURE",
      cover: "assets/img/com-08.jpg", main: "assets/img/com-08.jpg",
      desc: "곡면 플라스터 벽과 석재 바닥, 펜던트 하나의 부티크 호텔 로비. 리셉션 데스크를 제작했습니다.",
      location: "Gongju, Chungnam", area: "140㎡", use: "Hotel Lobby", materials: "plaster, limestone, brass", photography: "DARUDA",
      subs: [ { src: "assets/img/sub-10.jpg", shape: "landscape" }, { src: "assets/img/sub-08.jpg", shape: "portrait" }, { src: "assets/img/sub-12.jpg", shape: "landscape" } ] }'''

def extend(s, key, addition, count_label):
    """`  key: [` ... `  ],` 블록의 마지막 항목 뒤에 addition 을 덧붙인다"""
    m = re.search(r"(\n  %s: \[\n)(.*?)(\n  \],)" % key, s, re.S)
    assert m, key
    body = m.group(2).rstrip()
    assert count_label not in body, f"{key}: 이미 확장됨"
    return s[:m.start()] + m.group(1) + body + ",\n" + addition + m.group(3) + s[m.end():]

for v in ("v1", "v2", "v3"):
    p = os.path.join(ROOT, v, "assets", "data", "site.js")
    s = open(p, encoding="utf-8").read()
    if "dataVersion: 3" in s: print(v, "already v3 data"); continue
    s = extend(s, "slides", SLIDES, "stair-house")
    s = extend(s, "processing", PROCESSING, "proc-05")
    s = extend(s, "projects", PROJECTS, "stair-house")
    s = s.replace("dataVersion: 2,", "dataVersion: 3,")
    s = re.sub(r"counts: \{ processing: \d+, archiving: \d+ \}", "counts: { processing: 8, archiving: 106 }", s)
    open(p, "w", encoding="utf-8").write(s)
    print(v, "site.js extended")

# 이미지 복사 (v2 → v1, v3)
missing = [f for f in NEW_IMAGES if not os.path.exists(os.path.join(IMG2, f))]
if missing: print("WARNING missing images:", missing)
for v in ("v1", "v3"):
    dst = os.path.join(ROOT, v, "assets", "img")
    for f in NEW_IMAGES:
        src = os.path.join(IMG2, f)
        if os.path.exists(src): shutil.copy2(src, os.path.join(dst, f))
print("done")
