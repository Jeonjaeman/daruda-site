# -*- coding: utf-8 -*-
"""DARUDA press — 매거진 표지 + 펼침면(스프레드) 스캔본 합성 + PDF 묶기 (PIL)
실행:  python make_press.py  (어디서 실행하든 경로는 이 파일 기준)
출력:  v2/assets/img/press/*.jpg, v2/assets/press/*.pdf  → v1에도 복사
"""
import os, random, shutil
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops

random.seed(7)
HERE = os.path.dirname(os.path.abspath(__file__))
V2 = os.path.abspath(os.path.join(HERE, ".."))
V1 = os.path.abspath(os.path.join(HERE, "..", "..", "v1"))
IMG = os.path.join(V2, "assets", "img")
OUT = os.path.join(V2, "assets", "img", "press")
PDF = os.path.join(V2, "assets", "press")
FONTS = os.environ.get("PRESS_FONTS", r"C:\Users\JEONJA~1\AppData\Local\Temp\claude\D--work-------\44c773e4-0c81-45a5-a3e0-852e55822837\scratchpad\fonts")
os.makedirs(OUT, exist_ok=True); os.makedirs(PDF, exist_ok=True)

PAPER = (244, 241, 234)
INK = (28, 27, 25)
GREY = (120, 117, 110)

def F(w, size):
    path = os.path.join(FONTS, f"Pretendard-{w}.otf")
    return ImageFont.truetype(path, size)
def SERIF(size, bold=False):
    return ImageFont.truetype(r"C:\Windows\Fonts\batang.ttc", size, index=0)

def photo(name, w, h, zoom=1.0):
    """cover-crop"""
    im = Image.open(os.path.join(IMG, name)).convert("RGB")
    s = max(w / im.width, h / im.height) * zoom
    im = im.resize((max(w, int(im.width * s)), max(h, int(im.height * s))), Image.LANCZOS)
    x = (im.width - w) // 2; y = (im.height - h) // 2
    return im.crop((x, y, x + w, y + h))

def wrap(draw, text, font, max_w):
    """한국어 문단 줄바꿈 (어절 우선, 길면 글자 단위)"""
    lines, line = [], ""
    for word in text.split(" "):
        test = (line + " " + word).strip()
        if draw.textlength(test, font=font) <= max_w:
            line = test
        else:
            if line: lines.append(line)
            # 단어 자체가 길면 글자 단위
            if draw.textlength(word, font=font) > max_w:
                cur = ""
                for ch in word:
                    if draw.textlength(cur + ch, font=font) <= max_w: cur += ch
                    else: lines.append(cur); cur = ch
                line = cur
            else:
                line = word
    if line: lines.append(line)
    return lines

def text_block(draw, xy, paragraphs, font, max_w, lh, color=INK, max_h=None, justify=False):
    x, y = xy
    for para in paragraphs:
        for ln in wrap(draw, para, font, max_w):
            if max_h and y + lh > xy[1] + max_h: return y
            draw.text((x, y), ln, font=font, fill=color)
            y += lh
        y += lh * 0.55
    return y

def scanify(im):
    """종이 노이즈 + 가장자리 비네팅 + 미세 블러로 스캔본 느낌"""
    w, h = im.size
    noise = Image.effect_noise((w, h), 9).convert("L")
    noise = Image.merge("RGB", (noise, noise, noise))
    im = ImageChops.add(ImageChops.multiply(im, Image.new("RGB", (w, h), (236, 236, 236))), ImageChops.multiply(noise, Image.new("RGB", (w, h), (20, 20, 20))))
    # vignette
    mask = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(mask)
    d.rectangle((0, 0, w, h), fill=255)
    edge = Image.new("L", (w, h), 255)
    ed = ImageDraw.Draw(edge)
    for i, a in enumerate(range(0, 60, 4)):
        ed.rectangle((a, a, w - a, h - a), outline=int(205 + i * 3.3))
    edge = edge.filter(ImageFilter.GaussianBlur(26))
    im = ImageChops.multiply(im, Image.merge("RGB", (edge, edge, edge)))
    return im.filter(ImageFilter.GaussianBlur(0.35))

def gutter(im):
    """양면 사이 거터 그림자"""
    w, h = im.size
    g = Image.new("L", (w, h), 255)
    d = ImageDraw.Draw(g)
    cx = w // 2
    for i in range(0, 70):
        v = 255 - int((70 - i) ** 1.35 * 0.55)
        d.line((cx - i, 0, cx - i, h), fill=max(150, v)); d.line((cx + i, 0, cx + i, h), fill=max(165, v + 8))
    g = g.filter(ImageFilter.GaussianBlur(6))
    return ImageChops.multiply(im, Image.merge("RGB", (g, g, g)))

def folio(draw, W, H, page_l, mag, issue):
    f = F("Medium", 15); fs = F("Regular", 14)
    draw.text((70, H - 58), str(page_l), font=f, fill=INK)
    r = str(page_l + 1); draw.text((W - 70 - draw.textlength(r, font=f), H - 58), r, font=f, fill=INK)
    draw.text((W // 2 - 300 - draw.textlength(mag.upper() + "  " + issue, font=fs), H - 58), mag.upper() + "  " + issue, font=fs, fill=GREY)
    draw.text((W // 2 + 300, H - 58), issue + "  " + mag.upper(), font=fs, fill=GREY)

# ---------------------------------------------------------------- 레이아웃
W, H = 1800, 1200
M = 80  # 바깥 여백

def layout_A(im, c):
    """좌: 풀블리드 사진 / 우: 작은 라벨 + 헤드라인 + 2단 본문 + 캡션"""
    d = ImageDraw.Draw(im)
    im.paste(photo(c["photos"][0], W // 2, H), (0, 0))
    x = W // 2 + 70
    d.text((x, 110), c["label"], font=F("SemiBold", 16), fill=GREY)
    y = text_block(d, (x, 150), [c["headline"]], F("Bold", 44), W // 2 - 150, 54)
    d.text((x, y + 6), c["sub"], font=F("Medium", 20), fill=GREY)
    colw = (W // 2 - 70 - M - 36) // 2
    body = F("Regular", 15.5); lh = 27
    # 본문을 두 단으로 흘림
    lines = []
    for p in c["body"]: lines += wrap(d, p, body, colw) + [""]
    top = y + 70; maxl = int((H - 130 - top) // lh)
    for col in range(2):
        cy = top
        for ln in lines[col * maxl:(col + 1) * maxl]:
            d.text((x + col * (colw + 36), cy), ln, font=body, fill=INK); cy += lh
    d.text((70, H - 100), c.get("caption", ""), font=F("Regular", 13), fill=(240, 240, 240))

def layout_B(im, c):
    """좌: 큰 헤드라인 + 스탠드퍼스트 + 1단 본문 / 우: 사진 2장(상 가로, 하 가로) + 캡션"""
    d = ImageDraw.Draw(im)
    d.text((M, 110), c["label"], font=F("SemiBold", 16), fill=GREY)
    y = text_block(d, (M, 170), [c["headline"]], F("ExtraBold", 72), W // 2 - M - 90, 82)
    y = text_block(d, (M, y + 24), [c["sub"]], F("Medium", 22), W // 2 - M - 110, 34, color=GREY)
    text_block(d, (M, y + 30), c["body"], F("Regular", 15.5), W // 2 - M - 130, 27, max_h=H - 150 - (y + 30))
    px = W // 2 + 60; pw = W - px - M
    im.paste(photo(c["photos"][0], pw, 560), (px, 90))
    im.paste(photo(c["photos"][1], pw, 400), (px, 90 + 560 + 24))
    d.text((px, 90 + 560 + 24 + 400 + 14), c.get("caption", ""), font=F("Regular", 13), fill=GREY)

def layout_C(im, c):
    """양면 걸친 풀블리드 사진 + 하단 흰 띠 캡션"""
    d = ImageDraw.Draw(im)
    im.paste(photo(c["photos"][0], W, H - 140), (0, 0))
    d.text((M, H - 112), c["headline"], font=F("Bold", 22), fill=INK)
    d.text((M, H - 80), c.get("caption", ""), font=F("Regular", 14), fill=GREY)
    r = c["label"]; d.text((W - M - d.textlength(r, font=F("SemiBold", 14)), H - 108), r, font=F("SemiBold", 14), fill=GREY)

def layout_D(im, c):
    """좌: 2단 본문 + 하단 작은 사진 / 우: 큰 사진(세로 꽉)"""
    d = ImageDraw.Draw(im)
    d.text((M, 110), c["label"], font=F("SemiBold", 16), fill=GREY)
    y = text_block(d, (M, 150), [c["headline"]], F("Bold", 40), W // 2 - M - 80, 50)
    colw = (W // 2 - M - 70 - 32) // 2
    body = F("Regular", 15); lh = 26
    lines = []
    for p in c["body"]: lines += wrap(d, p, body, colw) + [""]
    top = y + 40; maxl = int((H - 520 - top) // lh)
    for col in range(2):
        cy = top
        for ln in lines[col * maxl:(col + 1) * maxl]:
            d.text((M + col * (colw + 32), cy), ln, font=body, fill=INK); cy += lh
    im.paste(photo(c["photos"][1], W // 2 - M - 70, 330), (M, H - 470))
    d.text((M, H - 120), c.get("caption", ""), font=F("Regular", 13), fill=GREY)
    im.paste(photo(c["photos"][0], W // 2 - 60, H - 160), (W // 2 + 60, 80))

LAYOUTS = {"A": layout_A, "B": layout_B, "C": layout_C, "D": layout_D}

def spread(c, page_l, mag, issue, path):
    im = Image.new("RGB", (W, H), PAPER)
    LAYOUTS[c["layout"]](im, c)
    d = ImageDraw.Draw(im)
    if c["layout"] != "C": folio(d, W, H, page_l, mag, issue)
    im = gutter(scanify(im))
    im.save(path, "JPEG", quality=84, optimize=True)
    return im

# ---------------------------------------------------------------- 표지
def cover_bob(path):
    w, h = 900, 1200
    im = photo("main-01.jpg", w, h, 1.05)
    grad = Image.new("L", (1, 360)); gd = ImageDraw.Draw(grad)
    for i in range(360): gd.point((0, i), fill=int(120 * (1 - i / 360) ** 1.6))
    shade = Image.new("RGB", (w, 360), (20, 20, 20))
    im.paste(shade, (0, 0), grad.resize((w, 360)))
    d = ImageDraw.Draw(im)
    # 마스트헤드
    d.text((52, 38), "bob", font=F("ExtraBold", 190), fill=(255, 255, 255))
    d.text((56, 250), "INTERIOR · ARCHITECTURE · LIFESTYLE", font=F("SemiBold", 17), fill=(255, 255, 255))
    d.text((w - 52 - d.textlength("FEB. 2024  VOL. 243", font=F("SemiBold", 17)), 250), "FEB. 2024  VOL. 243", font=F("SemiBold", 17), fill=(255, 255, 255))
    # 커버라인
    lines = [("SPECIAL", 16, "SemiBold"), ("천안의 새로운 공간들", 54, "Bold"), ("DARUDA DESIGN STUDIO", 22, "SemiBold"), ("ep.i  ·  haus B  ·  bakery T", 20, "Medium")]
    y = 880
    for t, s, wgt in lines:
        d.text((52, y), t, font=F(wgt, s), fill=(255, 255, 255)); y += s + 14
    # 바코드
    bx, by = w - 52 - 150, h - 52 - 70
    d.rectangle((bx - 8, by - 8, bx + 158, by + 78), fill=(255, 255, 255))
    x = bx
    while x < bx + 150:
        bw = random.choice([2, 3, 4]); d.rectangle((x, by, x + bw, by + 54), fill=INK); x += bw + random.choice([2, 3, 4])
    d.text((bx, by + 58), "9 772799 000243", font=F("Regular", 11), fill=INK)
    d.text((52, h - 52 - 22), "KRW 12,000", font=F("Medium", 14), fill=(255, 255, 255))
    im = scanify(im); im.save(path, "JPEG", quality=86); return im

def cover_house(path):
    w, h = 900, 1200
    im = Image.new("RGB", (w, h), (248, 246, 240))
    im.paste(photo("main-05.jpg", w - 120, 760, 1.0), (60, 300))
    d = ImageDraw.Draw(im)
    d.text((60, 54), "전원속의 내집", font=SERIF(96), fill=INK)
    d.text((62, 176), "HOME & GARDEN LIFESTYLE  ·  2023. 02  ·  No. 288", font=F("Medium", 17), fill=GREY)
    d.line((60, 230, w - 60, 230), fill=INK, width=2)
    d.text((60, 246), "집, 빛을 들이는 방법  —  충청의 주택 네 채", font=F("SemiBold", 22), fill=INK)
    y = 1082
    d.text((60, y), "DARUDA · haus B", font=F("Bold", 26), fill=INK)
    d.text((60, y + 38), "불당동 112㎡ 주택, 회색 대리석과 흰 벽의 리모델링", font=F("Regular", 16), fill=GREY)
    bx, by = w - 60 - 150, h - 54 - 70
    x = bx
    while x < bx + 150:
        bw = random.choice([2, 3, 4]); d.rectangle((x, by, x + bw, by + 54), fill=INK); x += bw + random.choice([2, 3, 4])
    d.text((bx, by + 58), "9 771228 002887", font=F("Regular", 11), fill=INK)
    im = scanify(im); im.save(path, "JPEG", quality=86); return im

# ---------------------------------------------------------------- 콘텐츠
BOB = dict(mag="bob", issue="FEB. 2024", start=112, cover=cover_bob, key="bob", pages=[
  dict(layout="A", label="SPACE  |  CHEONAN", headline="옷이 주인공이 되는 곡면의 방, ep.i", sub="DARUDA DESIGN STUDIO 의 부티크 쇼룸",
       body=["천안 불당동의 한 블록, 유리문을 밀고 들어서면 모서리가 없는 방이 나온다. 벽은 완만하게 휘어 천장으로 이어지고, 조명은 그 곡면을 따라 한 줄로 흐른다. 다루다가 설계한 ep.i 쇼룸은 128제곱미터 안에서 '보여 주지 않는 것'을 먼저 정했다.",
             "크롬 레일 두 줄과 흰 선반 하나. 집기는 그것이 전부다. 대표 이○○ 은 \"브랜드의 첫 오프라인 공간이니 옷보다 먼저 눈에 들어오는 것이 없어야 했다\"고 말한다. 마이크로시멘트로 벽과 바닥을 한 톤으로 묶은 이유도 같다.",
             "곡면 벽 뒤로는 피팅룸과 창고가 숨어 있다. 손님 동선은 원을 그리며 다시 입구로 돌아오고, 직원 동선은 그 바깥을 돈다. 작은 매장에서 두 동선이 겹치지 않게 하는 것이 설계의 핵심이었다.",
             "브랜딩도 다루다의 몫이었다. 간판의 소문자 로고, 포장지의 회색, 영수증의 서체까지 공간과 같은 규칙으로 정리했다. 공간과 브랜드가 한 손에서 나온 드문 사례다."],
       photos=["com-01.jpg"], caption="ep.i 쇼룸 전경. 곡면 벽을 따라 흐르는 간접 조명."),
  dict(layout="C", label="ep.i  ·  DARUDA", headline="곡면 벽과 크롬 레일", photos=["main-03.jpg"], caption="피팅룸 앞 대기 공간. 의자 하나가 유일한 가구다."),
  dict(layout="B", label="PROCESS", headline="벽을 깎는 대신 벽을 휘다", sub="ep.i 의 곡면은 목공으로 뼈대를 세우고 석고보드를 두 겹 휘어 만든 뒤 마이크로시멘트로 마감했다.",
       body=["처음 도면에는 모서리가 있었다. 시공 직전 다루다는 네 모서리를 전부 지우고 반지름 1.2미터의 곡면으로 바꿨다. 공사 기간은 열흘 늘었지만, 매장 어디에 서도 벽이 '끝나는' 느낌이 사라졌다.",
             "레일은 벽에 직접 박지 않고 천장에서 내려오는 두 개의 크롬 봉에 걸었다. 옷을 바꿔 걸어도 벽에 흔적이 남지 않는다. 선반은 흰 MDF에 도장, 두께는 18밀리미터로 얇게 보이도록 앞면만 깎았다.",
             "조명은 3000K 간접등 한 줄과 트랙 스폿 여섯 개. 스폿은 옷이 아니라 벽을 향한다. 벽이 밝아지면 옷은 저절로 또렷해진다는 것이 다루다의 설명이다."],
       photos=["sub-02.jpg", "sub-04.jpg"], caption="위: 복도형 진열 테스트. 아래: 석재 카운터 디테일."),
  dict(layout="D", label="SPACE  |  LIVING", headline="아일랜드가 집의 중심이 된 112㎡, haus B",
       body=["불당동의 오래된 아파트를 다루다가 고쳤다. 거실과 주방 사이 벽을 걷어내고, 그 자리에 회색 대리석 아일랜드를 놓았다. 가족은 이제 이 돌 주위에서 아침을 먹고, 아이는 숙제를 하고, 손님은 와인을 마신다.",
             "천장에는 검정 라인 조명이 긴 축을 그린다. 다루다는 \"평면이 넓어지면 방향을 잡아 줄 선이 필요하다\"고 말한다. 조명은 밝히는 도구가 아니라 공간의 방향을 가리키는 선이다.",
             "수납은 전부 벽 안으로 들어갔다. 흰 래커 도어에는 손잡이가 없다. 아일랜드 하부의 오크 서랍만이 유일하게 나무를 드러낸다. 차가운 돌과 따뜻한 나무의 비율을 8 대 2로 맞췄다."],
       photos=["main-01.jpg", "liv-01.jpg"], caption="좌: 거실 쪽 오크 수납장. 우: 주방에서 본 아일랜드."),
  dict(layout="A", label="SPACE  |  F&B", headline="테라조 카운터 위의 아침, bakery T", sub="성정동 76㎡ 베이커리 — 공간과 간판, 포장까지",
       body=["빵집의 첫인상은 카운터다. 다루다는 bakery T 의 카운터를 테라조로 부었다. 흰 바탕에 베이지와 갈색 칩이 섞인 테라조는 빵 부스러기가 떨어져도 티가 나지 않는다. 실용에서 출발한 선택이 공간의 인상을 결정했다.",
             "천장은 낮다. 다루다는 그 낮음을 감추지 않고 황동 펜던트 세 개를 카운터 바로 위까지 내렸다. 손님의 시선은 자연스럽게 빵과 조명 사이에 머문다.",
             "간판은 오크에 음각, 포장지는 카운터와 같은 테라조 무늬를 인쇄했다. 매장을 나가도 봉투에 공간이 따라온다."],
       photos=["com-02.jpg"], caption="bakery T 카운터. 테라조와 오크, 황동의 세 가지 재료."),
])

HOUSE = dict(mag="전원속의 내집", issue="2023. 02", start=64, cover=cover_house, key="house", pages=[
  dict(layout="C", label="HOUSE  ·  CHEONAN", headline="haus B — 빛을 들이는 흰 집", photos=["main-05.jpg"], caption="침실. 베이지 플라스터 벽에 아침 빛이 비친다."),
  dict(layout="B", label="주택 리모델링", headline="벽을 하나 덜어내니 집이 길어졌다", sub="천안 불당동 112㎡ 아파트. 다루다 디자인 스튜디오가 거실·주방·발코니를 하나의 긴 공간으로 이었다.",
       body=["설계를 맡은 다루다는 먼저 평면도를 뒤집어 놓고 '어디서 빛이 들어오는가'를 표시했다. 남쪽 발코니에서 들어온 빛이 거실 중간의 벽에 막혀 주방까지 닿지 못하고 있었다. 벽을 덜어내자 빛은 아일랜드를 지나 현관까지 닿았다.",
             "바닥은 폭 190밀리미터의 오크 원목. 벽은 흰 도장이 아니라 미세한 질감이 있는 플라스터다. 다루다는 \"흰 벽도 질감이 있어야 빛이 머문다\"고 설명한다.",
             "아일랜드는 회색 대리석 통돌. 길이 2.4미터, 무게 약 300킬로그램. 크레인 없이 올릴 수 있는 한계치였다."],
       photos=["main-01.jpg", "sub-04.jpg"], caption="위: 거실에서 본 주방. 아래: 아일랜드 석재의 모서리."),
  dict(layout="D", label="욕실", headline="마이크로시멘트 9㎡, 거울 하나로 끝내다",
       body=["욕실은 작다. 다루다는 작은 욕실을 넓어 보이게 하는 대신 '한 덩어리'로 보이게 했다. 벽과 바닥, 세면대 하부까지 같은 베이지 마이크로시멘트로 이어 붙이고, 둥근 거울 하나와 황동 수전만 남겼다.",
             "줄눈이 없으니 청소가 쉽고, 색이 하나이니 작은 면적이 끊기지 않는다. 조명은 거울 뒤 간접등 하나. 아침에는 창에서, 밤에는 거울에서 빛이 나온다.",
             "수건걸이와 휴지걸이도 같은 황동으로 맞췄다. 작은 공간일수록 재료의 수를 줄이는 것이 다루다의 원칙이다."],
       photos=["liv-03.jpg", "sub-03.jpg"], caption="창가 벤치. 리넨 쿠션과 플라스터 벽."),
  dict(layout="A", label="아이 방", headline="아이 키에 맞춘 자작나무 가구", sub="16㎡ 방에 책상·침대·수납을 하나의 가구로",
       body=["세종의 한 아파트, 여섯 살 아이의 방이다. 다루다는 기성 가구를 사지 않고 자작나무 합판으로 침대와 책상, 책장을 하나의 'ㄱ'자 가구로 제작했다. 높이는 아이가 혼자 올라가고 내려올 수 있는 선에서 정했다.",
             "커튼은 두 겹. 낮에는 흰 리넨만 치고, 밤에는 안쪽의 두꺼운 면을 더한다. 벽은 연한 모래색으로 칠해 자작나무와 경계가 흐려지게 했다.",
             "아이가 자라면 책상 상판만 높여 다시 쓸 수 있도록 다리를 분리형으로 만들었다. 가구는 집보다 오래 쓰인다는 전제로 설계했다."],
       photos=["liv-04.jpg"], caption="아이 방. 자작나무 가구와 두 겹 커튼."),
])

def build(spec):
    key = spec["key"]
    cover_path = os.path.join(OUT, f"{key}-cover.jpg")
    cover = spec["cover"](cover_path)
    pages = [cover]
    for i, c in enumerate(spec["pages"], 1):
        p = os.path.join(OUT, f"{key}-{i:02d}.jpg")
        pages.append(spread(c, spec["start"] + (i - 1) * 2, spec["mag"], spec["issue"], p))
        print("spread", p)
    pdf_path = os.path.join(PDF, f"{key}-{spec['issue'][:4] if key=='house' else '2024'}.pdf")
    pdf_pages = [cover.resize((900, 1200))] + [im.resize((1500, 1000)) for im in pages[1:]]
    pdf_pages[0].save(pdf_path, "PDF", save_all=True, append_images=pdf_pages[1:], resolution=150)
    print("pdf", pdf_path, len(pdf_pages), "pages")

if __name__ == "__main__":
    build(BOB); build(HOUSE)
    # v1 에도 복사
    for src, dst in ((OUT, os.path.join(V1, "assets", "img", "press")), (PDF, os.path.join(V1, "assets", "press"))):
        os.makedirs(dst, exist_ok=True)
        for f in os.listdir(src):
            if os.path.isfile(os.path.join(src, f)): shutil.copy2(os.path.join(src, f), os.path.join(dst, f))
    print("copied to v1")
