# -*- coding: utf-8 -*-
"""고객 전달 자료(자료/고객전달_20261028/원본) → 사이트 실제 데이터
   - 사진은 optimize_images 로 WebP 변환해 site/assets/media/ 에 저장 (원본은 그대로)
   - site/assets/data/site.js 의 slides · press · archiveMenu · processing · projects · company.sns 를 교체
   실행:  python import_client.py
"""
import io, json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from optimize_images import optimize

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SRC = os.path.join(ROOT, "자료", "고객전달_20261028", "원본")
SITE = os.path.join(ROOT, "site")
MEDIA = os.path.join(SITE, "assets", "media")
IMG_EXT = (".jpg", ".jpeg", ".png", ".webp")
SIZES = {"md": 1600, "sm": 800}          # 상세·확대 1600 / 목록 800
SIZES_SLIDE = {"lg": 2400, "md": 1600}   # 메인 슬라이드만 큰 화면용

stats = {"files": 0, "src": 0, "out": 0}


def rel(p):
    return os.path.relpath(p, SITE).replace("\\", "/")


def num(name):
    m = re.match(r"\s*\+?[^\d]*?(\d+)", name)
    return int(m.group(1)) if m else 9999


def conv(src, section, slug, stem, sizes=SIZES):
    out = os.path.join(MEDIA, section, slug)
    marker = os.path.join(out, f"{stem}-{list(sizes)[-1]}.webp")
    info = optimize(src, out, stem, sizes) if not os.path.exists(marker) or os.path.getmtime(marker) < os.path.getmtime(src) else None
    if info is None:   # 이미 변환됨 — 크기만 다시 읽음
        from PIL import Image, ImageOps
        with Image.open(src) as im:
            w, h = ImageOps.exif_transpose(im).size
        from optimize_images import shape_of
        files = {k: os.path.join(out, f"{stem}-{k}.webp") for k in sizes}
        info = {"w": w, "h": h, "shape": shape_of(w, h), "files": files, "bytes": sum(os.path.getsize(f) for f in files.values()), "src_bytes": os.path.getsize(src)}
    stats["files"] += 1; stats["src"] += info["src_bytes"]; stats["out"] += info["bytes"]
    return {k: rel(v) for k, v in info["files"].items()} | {"shape": info["shape"], "w": info["w"], "h": info["h"]}


def images(folder):
    return sorted([f for f in os.listdir(folder) if f.lower().endswith(IMG_EXT)], key=lambda f: (num(f), f))


def find_dir(*parts):
    """'다루다/1. 메인' 처럼 번호 접두가 붙은 폴더를 이름 일부로 찾는다"""
    cur = SRC
    for p in parts:
        hit = [d for d in os.listdir(cur) if os.path.isdir(os.path.join(cur, d)) and p in d]
        if not hit:
            return None
        cur = os.path.join(cur, sorted(hit)[0])
    return cur


# ---------------------------------------------------------------- 내용 텍스트
def parse_text():
    t = next(os.path.join(dp, f) for dp, _, fs in os.walk(SRC) for f in fs if f.endswith(".txt"))
    txt = io.open(t, encoding="utf-8").read()
    sns = {k: (re.search(pat, txt) or [None, ""])[1] for k, pat in
           (("kakao", r"카카오톡\s*:\s*(\S+)"), ("instagram", r"인스타그램\s*:\s*(\S+)"), ("blog", r"블로그\s*:\s*(\S+)"))}
    info = {"living": {}, "commercial": {}}
    sec = None
    lines = txt.splitlines()
    for i, ln in enumerate(lines):
        s = ln.strip()
        if s.startswith("리빙"): sec = "living"; continue
        if s.startswith("커머셜"): sec = "commercial"; continue
        m = re.match(r"(\d+)\.\s*(.+)", s)
        if sec and m and i + 1 < len(lines):
            mm = re.search(r"location\s*:\s*(.*?),\s*area\s*:\s*(.*?),\s*use\s*:\s*(.*)", lines[i + 1])
            if mm:
                info[sec][int(m.group(1))] = {"title": m.group(2).strip(), "location": mm.group(1).strip(),
                                              "area": mm.group(2).strip().replace("m²", "㎡"), "use": mm.group(3).strip()}
    return sns, info


def slugify(s):
    tbl = str.maketrans({c: "" for c in "()[]{}+&,./\\'\""})
    s = s.translate(tbl).strip().lower()
    return re.sub(r"\s+", "-", s)


# ---------------------------------------------------------------- 섹션별
def build():
    sns, info = parse_text()
    data = {"sns": sns}

    d = find_dir("다루다", "메인")
    data["slides"] = [dict(conv(os.path.join(d, f), "main", "slides", f"{i+1:02d}", SIZES_SLIDE), ui="auto") for i, f in enumerate(images(d)[:10])]

    press = []
    for mag in sorted(os.listdir(find_dir("다루다", "프레스"))):
        mdir = os.path.join(find_dir("다루다", "프레스"), mag)
        m = re.match(r"(.+?)\s*\((\w+)\s+(\d{4})\)", mag)
        title, mon, yr = (m.group(1).strip(), m.group(2), m.group(3)) if m else (mag, "", "")
        slug = slugify(title) or f"mag{len(press)}"
        fs = images(mdir)
        cover = next((f for f in fs if "커버" in f), fs[0])
        pages = [f for f in fs if f != cover]
        press.append({"id": slug, "title": title, "date": f"{mon[:3].upper()}. {yr}", "sort": int(yr or 0) * 100 + ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"].index(mon[:3].upper()) if mon[:3].upper() in ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"] else 0,
                      "cover": conv(os.path.join(mdir, cover), "press", slug, "cover"),
                      "pages": [conv(os.path.join(mdir, f), "press", slug, f"{i+1:02d}") for i, f in enumerate(pages)]})
    press.sort(key=lambda p: -p["sort"])
    data["press"] = press

    arch = []
    for key, label, part in (("living", "Living", "리빙"), ("commercial", "Commercial", "커머셜"), ("process", "Process", "프로세스")):
        ad = find_dir("다루다", "아카이브", part)
        f = images(ad)[0]
        arch.append({"key": key, "label": label, "href": f"{key}.html", "img": conv(os.path.join(ad, f), "archive", key, "bg")})
    data["archiveMenu"] = arch

    pd = find_dir("다루다", "4. 프로세스")
    data["processing"] = [conv(os.path.join(pd, f), "process", "items", f"{i+1:02d}") for i, f in enumerate(images(pd))]

    projects = []
    for cat, top, zipdir in (("living", "리빙", "다루다"), ("commercial", "커머셜", "다루다2"), ("commercial", "커머셜", "다루다3")):
        base = find_dir(zipdir, top) or (find_dir(zipdir) if zipdir == "다루다3" else None)   # 다루다3 은 '커머셜' 폴더 없이 바로 프로젝트
        if not base:
            continue
        for folder in sorted(os.listdir(base), key=num):
            fdir = os.path.join(base, folder)
            if not os.path.isdir(fdir):
                continue
            n = num(folder)
            meta = info[cat].get(n, {})
            name = re.sub(r"^\d+\.?\s*", "", folder).strip()
            py = (re.search(r"(\d+)\s*py", name, re.I) or [None, ""])[1]
            title = re.sub(r"\s*\d+\s*py\s*$", "", name, flags=re.I).strip()
            slug = f"{cat[0]}{n:02d}-" + slugify(title)
            fs = images(fdir)
            main = next((f for f in fs if "메인" in f), None) or next(f for f in fs if not f.startswith("+"))
            subs = [f for f in fs if f != main and not f.startswith("+")]
            brand = [f for f in fs if f.startswith("+")]
            projects.append({
                "id": slug, "category": cat, "no": n, "title": title, "pyeong": f"{py}평" if py else "",
                "location": meta.get("location", ""), "area": meta.get("area", ""), "use": meta.get("use", ""),
                "main": conv(os.path.join(fdir, main), "projects", slug, "main"),
                "subs": [conv(os.path.join(fdir, f), "projects", slug, f"s{i+1:02d}") for i, f in enumerate(subs)],
                "branding": [conv(os.path.join(fdir, f), "projects", slug, f"b{i+1:02d}") for i, f in enumerate(brand)],
            })
            if meta.get("title") and meta["title"].replace(" ", "") not in name.replace(" ", ""):
                print("  이름 확인:", folder, "↔", meta["title"])
    data["projects"] = projects
    missing = {c: sorted(set(info[c]) - {p["no"] for p in projects if p["category"] == c}) for c in info}
    data["_missing"] = missing
    return data


if __name__ == "__main__":
    data = build()
    out = os.path.join(SITE, "assets", "data", "content.js")
    body = json.dumps({k: v for k, v in data.items() if not k.startswith("_")}, ensure_ascii=False, indent=1)
    io.open(out, "w", encoding="utf-8", newline="\n").write(
        "/* 고객 전달 자료(2026-10-28)로 만든 실제 데이터 — _tools/import_client.py 가 생성. 직접 고치지 말고 스크립트를 다시 실행 */\n"
        "window.DARUDA_CONTENT = " + body + ";\n")
    print("projects:", sum(p["category"] == "living" for p in data["projects"]), "living /",
          sum(p["category"] == "commercial" for p in data["projects"]), "commercial · 아직 없는 번호:", data["_missing"])
    print(f"images {stats['files']} · 원본 {stats['src']/1e6:.0f}MB → 변환본 {stats['out']/1e6:.0f}MB")
