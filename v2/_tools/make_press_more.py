# -*- coding: utf-8 -*-
"""DARUDA press — 매거진 예시 10종 추가 (표지 4가지 스타일 + 펼침면 2~4장 + PDF)
실행:  python make_press_more.py   (make_press.py 와 같은 폴더)
출력:  v2/assets/img/press/<key>-cover.jpg, <key>-NN.jpg, v2/assets/press/<key>-<year>.pdf → v1·v3 에도 복사
       press-data.js (site.js 의 press 배열 전체, 12종) 를 함께 출력
"""
import os, sys, json, random, shutil
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image, ImageDraw, ImageFont
import make_press as MP
from make_press import photo, F, SERIF, scanify, spread, OUT, PDF, V1, V2, INK, GREY

random.seed(11)
V3 = os.path.abspath(os.path.join(V2, "..", "v3"))

def GEORGIA(size, bold=False):
    try: return ImageFont.truetype(r"C:\Windows\Fonts\georgia" + ("b" if bold else "") + ".ttf", size)
    except Exception: return F("Bold" if bold else "Regular", size)

def barcode(d, x, y, code, white_box=False):
    if white_box: d.rectangle((x - 8, y - 8, x + 158, y + 78), fill=(255, 255, 255))
    cx = x
    while cx < x + 150:
        bw = random.choice([2, 3, 4]); d.rectangle((cx, y, cx + bw, y + 54), fill=INK); cx += bw + random.choice([2, 3, 4])
    d.text((x, y + 58), code, font=F("Regular", 11), fill=INK)

# ---------------------------------------------------------------- 표지 스타일
def cover_bold(path, s):
    """사진 풀블리드 + 상단 굵은 산세리프 마스트헤드 (bob 계열)"""
    w, h = 900, 1200
    im = photo(s["photo"], w, h, 1.05)
    grad = Image.new("L", (1, 400)); gd = ImageDraw.Draw(grad)
    for i in range(400): gd.point((0, i), fill=int(130 * (1 - i / 400) ** 1.6))
    im.paste(Image.new("RGB", (w, 400), (15, 15, 15)), (0, 0), grad.resize((w, 400)))
    d = ImageDraw.Draw(im); col = s.get("color", (255, 255, 255))
    d.text((52, 44), s["name"], font=F("ExtraBold", s.get("size", 150)), fill=col)
    d.text((56, 44 + s.get("size", 150) + 30), s["tag"], font=F("SemiBold", 17), fill=col)
    r = s["issue_line"]; d.text((w - 52 - d.textlength(r, font=F("SemiBold", 17)), 44 + s.get("size", 150) + 30), r, font=F("SemiBold", 17), fill=col)
    y = 870
    for t, sz, wgt in s["lines"]:
        d.text((52, y), t, font=F(wgt, sz), fill=col); y += sz + 14
    barcode(d, w - 52 - 150, h - 52 - 70, s["code"], white_box=True)
    d.text((52, h - 52 - 22), s.get("price", "KRW 12,000"), font=F("Medium", 14), fill=col)
    im = scanify(im); im.save(path, "JPEG", quality=86); return im

def cover_frame(path, s):
    """흰 바탕 + 세리프 제호 + 사진 인셋 (전원속의 내집 계열)"""
    w, h = 900, 1200
    im = Image.new("RGB", (w, h), s.get("paper", (248, 246, 240)))
    im.paste(photo(s["photo"], w - 120, 760, 1.0), (60, 300))
    d = ImageDraw.Draw(im)
    font = GEORGIA(s.get("size", 96)) if s.get("latin") else SERIF(s.get("size", 96))
    d.text((60, 54), s["name"], font=font, fill=INK)
    d.text((62, 176), s["tag"] + "  ·  " + s["issue_line"], font=F("Medium", 17), fill=GREY)
    d.line((60, 230, w - 60, 230), fill=INK, width=2)
    d.text((60, 246), s["lines"][0][0], font=F("SemiBold", 22), fill=INK)
    d.text((60, 1082), s["lines"][1][0], font=F("Bold", 26), fill=INK)
    d.text((60, 1120), s["lines"][2][0], font=F("Regular", 16), fill=GREY)
    barcode(d, w - 60 - 150, h - 54 - 70, s["code"])
    im = scanify(im); im.save(path, "JPEG", quality=86); return im

def cover_minimal(path, s):
    """사진 풀블리드 + 작은 제호 + 하단 흰 띠 (SPACE·미니멀 계열)"""
    w, h = 900, 1200
    im = photo(s["photo"], w, h - 150, 1.0)
    full = Image.new("RGB", (w, h), (250, 250, 248)); full.paste(im, (0, 0)); im = full
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, w, 96), fill=(250, 250, 248))
    d.text((48, 26), s["name"], font=GEORGIA(44) if s.get("latin") else SERIF(44), fill=INK)
    r = s["issue_line"]; d.text((w - 48 - d.textlength(r, font=F("Medium", 15)), 40), r, font=F("Medium", 15), fill=INK)
    y = h - 150 + 26
    d.text((48, y), s["lines"][0][0], font=F("Bold", 24), fill=INK)
    d.text((48, y + 40), s["lines"][1][0], font=F("Regular", 15), fill=GREY)
    d.text((48, y + 66), s["tag"], font=F("SemiBold", 12), fill=GREY)
    barcode(d, w - 48 - 150, h - 36 - 70, s["code"])
    im = scanify(im); im.save(path, "JPEG", quality=86); return im

def cover_band(path, s):
    """상단 컬러 띠 제호 + 사진 + 하단 커버라인 (행복이 가득한 집·까사 계열)"""
    w, h = 900, 1200
    band = s.get("band", (196, 60, 40))
    im = Image.new("RGB", (w, h), (255, 255, 255))
    im.paste(photo(s["photo"], w, h - 180 - 150, 1.0), (0, 180))
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, w, 180), fill=band)
    font = GEORGIA(s.get("size", 84), bold=True) if s.get("latin") else F("ExtraBold", s.get("size", 84))
    tw = d.textlength(s["name"], font=font); d.text(((w - tw) / 2, 36), s["name"], font=font, fill=(255, 255, 255))
    d.text((40, 146), s["tag"], font=F("SemiBold", 13), fill=(255, 255, 255))
    r = s["issue_line"]; d.text((w - 40 - d.textlength(r, font=F("SemiBold", 13)), 146), r, font=F("SemiBold", 13), fill=(255, 255, 255))
    y = h - 150 + 22
    d.text((40, y), s["lines"][0][0], font=F("Bold", 26), fill=INK)
    d.text((40, y + 42), s["lines"][1][0], font=F("Regular", 15), fill=GREY)
    d.text((40, y + 68), s["lines"][2][0], font=F("Medium", 14), fill=band)
    barcode(d, w - 40 - 150, h - 30 - 70, s["code"])
    im = scanify(im); im.save(path, "JPEG", quality=86); return im

COVERS = {"bold": cover_bold, "frame": cover_frame, "minimal": cover_minimal, "band": cover_band}

# ---------------------------------------------------------------- 펼침면 콘텐츠 풀
POOL = {
 "epi_space": dict(layout="A", label="SPACE  |  CHEONAN", headline="옷이 주인공이 되는 곡면의 방, ep.i", sub="DARUDA DESIGN STUDIO 의 부티크 쇼룸",
    body=["천안 불당동의 한 블록, 유리문을 밀고 들어서면 모서리가 없는 방이 나온다. 벽은 완만하게 휘어 천장으로 이어지고, 조명은 그 곡면을 따라 한 줄로 흐른다. 다루다가 설계한 ep.i 쇼룸은 128제곱미터 안에서 '보여 주지 않는 것'을 먼저 정했다.",
          "크롬 레일 두 줄과 흰 선반 하나. 집기는 그것이 전부다. 마이크로시멘트로 벽과 바닥을 한 톤으로 묶었고, 피팅룸과 창고는 곡면 벽 뒤에 숨겼다.",
          "브랜딩도 다루다의 몫이었다. 간판의 소문자 로고, 포장지의 회색, 영수증의 서체까지 공간과 같은 규칙으로 정리했다."],
    photos=["com-01.jpg"], caption="ep.i 쇼룸 전경. 곡면 벽을 따라 흐르는 간접 조명."),
 "epi_full": dict(layout="C", label="ep.i  ·  DARUDA", headline="곡면 벽과 크롬 레일", photos=["main-03.jpg"], caption="피팅룸 앞 대기 공간. 의자 하나가 유일한 가구다."),
 "hausb_island": dict(layout="D", label="SPACE  |  LIVING", headline="아일랜드가 집의 중심이 된 112㎡, haus B",
    body=["불당동의 오래된 아파트를 다루다가 고쳤다. 거실과 주방 사이 벽을 걷어내고, 그 자리에 회색 대리석 아일랜드를 놓았다. 가족은 이제 이 돌 주위에서 아침을 먹고, 아이는 숙제를 하고, 손님은 와인을 마신다.",
          "천장에는 검정 라인 조명이 긴 축을 그린다. 조명은 밝히는 도구가 아니라 공간의 방향을 가리키는 선이다.",
          "수납은 전부 벽 안으로 들어갔다. 흰 래커 도어에는 손잡이가 없다. 차가운 돌과 따뜻한 나무의 비율을 8 대 2로 맞췄다."],
    photos=["main-01.jpg", "liv-01.jpg"], caption="좌: 거실 쪽 오크 수납장. 우: 주방에서 본 아일랜드."),
 "hausb_light": dict(layout="B", label="주택 리모델링", headline="벽을 하나 덜어내니 집이 길어졌다", sub="천안 불당동 112㎡ 아파트. 거실·주방·발코니를 하나의 긴 공간으로 이었다.",
    body=["설계를 맡은 다루다는 먼저 평면도를 뒤집어 놓고 '어디서 빛이 들어오는가'를 표시했다. 벽을 덜어내자 빛은 아일랜드를 지나 현관까지 닿았다.",
          "바닥은 폭 190밀리미터의 오크 원목. 벽은 흰 도장이 아니라 미세한 질감이 있는 플라스터다. \"흰 벽도 질감이 있어야 빛이 머문다.\"",
          "아일랜드는 회색 대리석 통돌. 길이 2.4미터, 무게 약 300킬로그램. 크레인 없이 올릴 수 있는 한계치였다."],
    photos=["main-01.jpg", "sub-04.jpg"], caption="위: 거실에서 본 주방. 아래: 아일랜드 석재의 모서리."),
 "hausb_full": dict(layout="C", label="HOUSE  ·  CHEONAN", headline="haus B — 빛을 들이는 흰 집", photos=["main-05.jpg"], caption="침실. 베이지 플라스터 벽에 아침 빛이 비친다."),
 "bath": dict(layout="D", label="욕실", headline="마이크로시멘트 9㎡, 거울 하나로 끝내다",
    body=["욕실은 작다. 다루다는 작은 욕실을 넓어 보이게 하는 대신 '한 덩어리'로 보이게 했다. 벽과 바닥, 세면대 하부까지 같은 베이지 마이크로시멘트로 이어 붙이고, 둥근 거울 하나와 황동 수전만 남겼다.",
          "줄눈이 없으니 청소가 쉽고, 색이 하나이니 작은 면적이 끊기지 않는다. 조명은 거울 뒤 간접등 하나.",
          "수건걸이와 휴지걸이도 같은 황동으로 맞췄다. 작은 공간일수록 재료의 수를 줄이는 것이 다루다의 원칙이다."],
    photos=["liv-03.jpg", "sub-03.jpg"], caption="창가 벤치. 리넨 쿠션과 플라스터 벽."),
 "kid": dict(layout="A", label="아이 방", headline="아이 키에 맞춘 자작나무 가구", sub="16㎡ 방에 책상·침대·수납을 하나의 가구로",
    body=["세종의 한 아파트, 여섯 살 아이의 방이다. 다루다는 기성 가구를 사지 않고 자작나무 합판으로 침대와 책상, 책장을 하나의 'ㄱ'자 가구로 제작했다.",
          "커튼은 두 겹. 낮에는 흰 리넨만 치고, 밤에는 안쪽의 두꺼운 면을 더한다. 벽은 연한 모래색으로 칠해 자작나무와 경계가 흐려지게 했다.",
          "아이가 자라면 책상 상판만 높여 다시 쓸 수 있도록 다리를 분리형으로 만들었다. 가구는 집보다 오래 쓰인다는 전제로 설계했다."],
    photos=["liv-04.jpg"], caption="아이 방. 자작나무 가구와 두 겹 커튼."),
 "bakery": dict(layout="A", label="SPACE  |  F&B", headline="테라조 카운터 위의 아침, bakery T", sub="성정동 76㎡ 베이커리 — 공간과 간판, 포장까지",
    body=["빵집의 첫인상은 카운터다. 다루다는 bakery T 의 카운터를 테라조로 부었다. 흰 바탕에 베이지와 갈색 칩이 섞인 테라조는 빵 부스러기가 떨어져도 티가 나지 않는다.",
          "천장은 낮다. 다루다는 그 낮음을 감추지 않고 황동 펜던트 세 개를 카운터 바로 위까지 내렸다.",
          "간판은 오크에 음각, 포장지는 카운터와 같은 테라조 무늬를 인쇄했다. 매장을 나가도 봉투에 공간이 따라온다."],
    photos=["com-02.jpg"], caption="bakery T 카운터. 테라조와 오크, 황동의 세 가지 재료."),
 "cafe_full": dict(layout="C", label="CAFE  ·  CHEONAN", headline="빛이 벽을 따라 내려오는 카페", photos=["com-03.jpg"], caption="성정동 카페 S. 천창 아래 긴 테이블."),
 "office": dict(layout="B", label="OFFICE", headline="회의실을 없애고 복도를 넓혔다", sub="천안 쌍용동 240㎡ 사무실. 다루다는 벽 대신 가구로 영역을 나눴다.",
    body=["유리 회의실 두 개를 걷어내고, 그 자리에 2.4미터 길이의 오크 테이블을 놓았다. 회의는 테이블에서, 통화는 복도 끝 부스에서 한다.",
          "바닥은 회색 에폭시, 천장은 노출. 다루다는 흰 벽 대신 회색 커튼으로 영역을 나눴다. 커튼을 걷으면 사무실 전체가 한 방이 된다.",
          "조명은 레일 스폿을 책상이 아니라 벽으로 향하게 했다. 벽이 밝으면 눈이 덜 피로하다는 것이 다루다의 설명이다."],
    photos=["com-04.jpg", "sub-01.jpg"], caption="위: 공용 테이블. 아래: 복도 끝 전화 부스."),
 "process": dict(layout="B", label="PROCESS", headline="벽을 깎는 대신 벽을 휘다", sub="ep.i 의 곡면은 목공으로 뼈대를 세우고 석고보드를 두 겹 휘어 만든 뒤 마이크로시멘트로 마감했다.",
    body=["처음 도면에는 모서리가 있었다. 시공 직전 다루다는 네 모서리를 전부 지우고 반지름 1.2미터의 곡면으로 바꿨다. 공사 기간은 열흘 늘었다.",
          "레일은 벽에 직접 박지 않고 천장에서 내려오는 두 개의 크롬 봉에 걸었다. 옷을 바꿔 걸어도 벽에 흔적이 남지 않는다.",
          "조명은 3000K 간접등 한 줄과 트랙 스폿 여섯 개. 스폿은 옷이 아니라 벽을 향한다."],
    photos=["proc-01.jpg", "proc-02.jpg"], caption="위: 곡면 목공 뼈대. 아래: 마이크로시멘트 시공 중."),
 "furniture": dict(layout="D", label="FURNITURE", headline="공간에 맞춰 짓는 가구, 다루다의 제작 가구",
    body=["다루다는 설계한 공간의 가구를 직접 제작한다. 기성품으로는 치수가 맞지 않는 자리, 재료가 이어지지 않는 자리를 위해서다.",
          "오크, 자작나무 합판, 흰 래커, 황동. 재료는 네 가지로 제한한다. 같은 집 안에서 가구가 공간과 같은 말을 하게 하려는 원칙이다.",
          "제작은 천안의 협력 공방에서 한다. 도면은 다루다가, 손은 공방이, 설치는 둘이 함께 한다."],
    photos=["sub-02.jpg", "liv-02.jpg"], caption="좌: 오크 벤치 시제품. 우: 설치 후 거실."),
 "interview": dict(layout="B", label="INTERVIEW", headline="\"공간보다 먼저 보이는 것이 없어야 한다\"", sub="다루다 디자인 스튜디오 대표 이○○ 인터뷰",
    body=["천안에서 스튜디오를 연 지 다섯 해. 주거와 상업 공간, 브랜딩과 제작 가구까지 한 손에서 나오는 이유를 물었다.",
          "\"공간은 결국 그 안에 들어갈 물건과 사람을 위한 배경입니다. 배경이 먼저 눈에 들어오면 실패한 겁니다. 그래서 재료를 줄이고, 선을 줄이고, 색을 줄입니다.\"",
          "\"브랜딩과 가구를 함께 하는 이유도 같습니다. 공간은 한 사람이 끝까지 책임질 때 하나의 말을 합니다.\""],
    photos=["main-02.jpg", "proc-03.jpg"], caption="위: 스튜디오. 아래: 현장에서."),
 "stair_full": dict(layout="C", label="LIVING  ·  SEJONG", headline="오크 계단과 흰 벽", photos=["main-04.jpg"], caption="세종 단독주택. 계단참의 작은 창."),
 "kitchen_full": dict(layout="C", label="KITCHEN", headline="돌 하나로 정리한 주방", photos=["main-06.jpg"], caption="회색 대리석 아일랜드와 검정 라인 조명."),
}

# ---------------------------------------------------------------- 매거진 10종
MAGS = [
 dict(key="maru24", mag="MARU", issue="JUN. 2024", date="JUN. 2024", title="마루 — MARU", issue_label="No. 251", source="scan", start=86, cover="frame",
      cover_spec=dict(name="MARU", latin=True, size=110, tag="HOUSING · ARCHITECTURE", issue_line="2024. 06  ·  No. 251", photo="main-04.jpg", code="9 771229 450251",
                      lines=[("계단이 집의 거실이 되는 법  —  세종·천안의 집 세 채",), ("DARUDA · 세종 단독주택",), ("오크 계단과 흰 벽, 계단참의 작은 창",)]),
      pages=["stair_full", "hausb_light", "furniture"]),
 dict(key="casa24", mag="CASA LIVING", issue="APR. 2024", date="APR. 2024", title="CASA LIVING", issue_label="VOL. 318", source="pdf", start=140, cover="band",
      cover_spec=dict(name="CASA", latin=True, size=96, band=(28, 28, 28), tag="LIVING · DESIGN · CULTURE", issue_line="APRIL 2024  ·  VOL. 318", photo="main-06.jpg", code="9 771228 003184",
                      lines=[("주방이 거실이 된 집",), ("DARUDA DESIGN STUDIO 의 haus B 와 제작 가구",), ("SPECIAL · 천안의 디자인 스튜디오",)]),
      pages=["kitchen_full", "hausb_island", "furniture", "interview"]),
 dict(key="interiors23", mag="INTERIORS", issue="NOV. 2023", date="NOV. 2023", title="INTERIORS — 월간 인테리어", issue_label="No. 446", source="scan", start=58, cover="minimal",
      cover_spec=dict(name="INTERIORS", latin=True, tag="MONTHLY · SINCE 1986", issue_line="NOVEMBER 2023  ·  No. 446", photo="com-01.jpg", code="9 771227 844463",
                      lines=[("곡면의 방 — ep.i, 천안",), ("DARUDA DESIGN STUDIO · 부티크 쇼룸 128㎡",)]),
      pages=["epi_space", "epi_full", "process"]),
 dict(key="deco23", mag="DECO JOURNAL", issue="SEP. 2023", date="SEP. 2023", title="DECO JOURNAL", issue_label="VOL. 207", source="pdf", start=72, cover="bold",
      cover_spec=dict(name="DECO", size=170, tag="JOURNAL · INTERIOR & LIFESTYLE", issue_line="SEP. 2023  VOL. 207", photo="com-03.jpg", code="9 772093 002079",
                      lines=[("F&B SPECIAL", 16, "SemiBold"), ("빛이 내려오는 카페", 54, "Bold"), ("DARUDA DESIGN STUDIO", 22, "SemiBold"), ("카페 S  ·  bakery T", 20, "Medium")]),
      pages=["cafe_full", "bakery"]),
 dict(key="happy23", mag="행복이 가득한 집", issue="2023. 05", date="MAY. 2023", title="행복이 가득한 집", issue_label="No. 291", source="scan", start=118, cover="band",
      cover_spec=dict(name="행복이 가득한 집", size=72, band=(160, 46, 38), tag="LIVING · CULTURE", issue_line="2023년 5월호  ·  No. 291", photo="liv-04.jpg", code="9 771228 291005",
                      lines=[("아이와 함께 자라는 방",), ("DARUDA 가 자작나무로 지은 16㎡ 아이 방",), ("특집 · 작은 집의 큰 가구",)]),
      pages=["kid", "bath", "furniture"]),
 dict(key="space22", mag="SPACE", issue="DEC. 2022", date="DEC. 2022", title="SPACE — 월간 공간", issue_label="No. 661", source="pdf", start=96, cover="minimal",
      cover_spec=dict(name="SPACE", latin=True, tag="ARCHITECTURE · URBANISM · DESIGN", issue_line="DECEMBER 2022  ·  No. 661", photo="com-04.jpg", code="9 771228 006619",
                      lines=[("벽 없는 사무실 — 쌍용동 240㎡",), ("DARUDA DESIGN STUDIO · 가구로 나눈 영역",)]),
      pages=["office", "interview"]),
 dict(key="bob22", mag="bob", issue="AUG. 2022", date="AUG. 2022", title="bob — Interior Magazine", issue_label="VOL. 225", source="pdf", start=130, cover="bold",
      cover_spec=dict(name="bob", size=190, tag="INTERIOR · ARCHITECTURE · LIFESTYLE", issue_line="AUG. 2022  VOL. 225", photo="main-02.jpg", code="9 772799 000225",
                      lines=[("STUDIO", 16, "SemiBold"), ("천안의 젊은 스튜디오", 54, "Bold"), ("DARUDA DESIGN STUDIO", 22, "SemiBold"), ("interview  ·  furniture  ·  process", 20, "Medium")]),
      pages=["interview", "furniture", "process", "hausb_full"]),
 dict(key="house22", mag="전원속의 내집", issue="2022. 03", date="MAR. 2022", title="전원속의 내집", issue_label="No. 277", source="scan", start=52, cover="frame",
      cover_spec=dict(name="전원속의 내집", size=96, tag="HOME & GARDEN LIFESTYLE", issue_line="2022. 03  ·  No. 277", photo="main-04.jpg", code="9 771228 002771",
                      lines=[("계단 있는 집  —  세종의 단독주택",), ("DARUDA · 세종 주택",), ("오크 계단과 흰 벽, 2층의 작은 서재",)]),
      pages=["stair_full", "bath"]),
 dict(key="cafe24", mag="CAFE &", issue="AUG. 2024", date="AUG. 2024", title="CAFE & — 카페 앤", issue_label="No. 98", source="scan", start=40, cover="band",
      cover_spec=dict(name="CAFE &", latin=True, size=90, band=(72, 86, 58), tag="COFFEE · SPACE · PEOPLE", issue_line="AUGUST 2024  ·  No. 98", photo="com-02.jpg", code="9 772384 000987",
                      lines=[("테라조 카운터의 빵집",), ("DARUDA 가 만든 bakery T 의 공간과 포장",), ("SPACE REPORT · 천안",)]),
      pages=["bakery", "cafe_full", "process"]),
 dict(key="maison24", mag="MAISON", issue="JAN. 2024", date="JAN. 2024", title="MAISON — 메종", issue_label="VOL. 344", source="pdf", start=160, cover="minimal",
      cover_spec=dict(name="MAISON", latin=True, tag="LIVING · STYLE · PEOPLE", issue_line="JANUARY 2024  ·  VOL. 344", photo="main-05.jpg", code="9 771227 003446",
                      lines=[("흰 집의 아침 — haus B",), ("DARUDA DESIGN STUDIO · 빛을 들이는 리모델링",)]),
      pages=["hausb_full", "hausb_island", "kitchen_full", "bath"]),
]

def build(m):
    key = m["key"]
    cover = COVERS[m["cover"]](os.path.join(OUT, f"{key}-cover.jpg"), m["cover_spec"])
    pages, files = [cover], []
    for i, pk in enumerate(m["pages"], 1):
        p = os.path.join(OUT, f"{key}-{i:02d}.jpg")
        pages.append(spread(POOL[pk], m["start"] + (i - 1) * 2, m["mag"], m["issue"], p)); files.append(f"assets/img/press/{key}-{i:02d}.jpg")
    year = "".join(ch for ch in m["issue"] if ch.isdigit())[:4]
    pdf_name = f"{key}-{year}.pdf"
    pdf_pages = [cover.resize((900, 1200))] + [im.resize((1500, 1000)) for im in pages[1:]]
    pdf_pages[0].save(os.path.join(PDF, pdf_name), "PDF", save_all=True, append_images=pdf_pages[1:], resolution=150)
    print("built", key, len(pages), "pages")
    return dict(id=key, date=m["date"], title=m["title"], issue=m["issue_label"], source=m["source"],
                cover=f"assets/img/press/{key}-cover.jpg", pdf=f"assets/press/{pdf_name}", pages=files)

if __name__ == "__main__":
    data = [build(m) for m in MAGS]
    existing = [
        dict(id="p1", date="FEB. 2024", title="bob — Interior Magazine", issue="VOL. 243", source="pdf", cover="assets/img/press/bob-cover.jpg", pdf="assets/press/bob-2024.pdf",
             pages=[f"assets/img/press/bob-{i:02d}.jpg" for i in range(1, 6)]),
        dict(id="p2", date="FEB. 2023", title="전원속의 내집", issue="No. 288", source="scan", cover="assets/img/press/house-cover.jpg", pdf="assets/press/house-2023.pdf",
             pages=[f"assets/img/press/house-{i:02d}.jpg" for i in range(1, 5)]),
    ]
    MONTHS = {m: i for i, m in enumerate(["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"], 1)}
    def sortkey(d): mo, yr = d["date"].replace(".", "").split(); return (int(yr), MONTHS[mo])
    allp = sorted(data + existing, key=sortkey, reverse=True)
    lines = []
    for d in allp:
        pg = ", ".join(f'"{p}"' for p in d["pages"])
        lines.append(f'    {{ id: "{d["id"]}", date: "{d["date"]}", title: "{d["title"]}", issue: "{d["issue"]}", source: "{d["source"]}",\n      cover: "{d["cover"]}", pdf: "{d["pdf"]}",\n      pages: [{pg}] }}')
    js = "  press: [\n" + ",\n".join(lines) + "\n  ],"
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "press-data.js"), "w", encoding="utf-8") as f: f.write(js + "\n")
    # v1 · v3 에도 복사
    for root in (V1, V3):
        for src, sub in ((OUT, os.path.join("assets", "img", "press")), (PDF, os.path.join("assets", "press"))):
            dst = os.path.join(root, sub); os.makedirs(dst, exist_ok=True)
            for fn in os.listdir(src):
                if os.path.isfile(os.path.join(src, fn)): shutil.copy2(os.path.join(src, fn), os.path.join(dst, fn))
    print("press-data.js written,", len(allp), "magazines; copied to v1/v3")
