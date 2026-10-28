# -*- coding: utf-8 -*-
"""외부(고객) 전달 자료 보안 점검 — 압축 경로 조작 · 형식 위장 · 숨은 데이터 · 개인정보(GPS) · 배포본 메타데이터
   실행: python security_check.py  (결과는 표준 출력)"""
import collections, hashlib, os, re, zipfile
from PIL import Image, ExifTags

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BASE = os.path.join(ROOT, "자료", "고객전달_20261028")
ORIG = os.path.join(BASE, "원본")
MEDIA = os.path.join(ROOT, "site", "assets", "media")
SEP = ("/", chr(92))   # 슬래시 · 역슬래시


def name_of(info):
    nm = info.filename
    if not (info.flag_bits & 0x800):
        try:
            nm = nm.encode("cp437").decode("cp949")
        except Exception:
            pass
    return nm


print("== 1. 압축 파일: 경로 조작 · 링크 · 암호화 · 압축 폭탄")
for n in ("다루다.zip", "다루다2.zip", "다루다3.zip"):
    p = os.path.join(BASE, n)
    z = zipfile.ZipFile(p)
    sha = hashlib.sha256(open(p, "rb").read()).hexdigest()
    exts, sus, enc, bomb = collections.Counter(), [], 0, []
    for i in z.infolist():
        nm = name_of(i)
        parts = nm.replace(chr(92), "/").split("/")
        if nm.startswith(SEP) or ".." in parts or ":" in nm:
            sus.append(nm)
        if (i.external_attr >> 16) & 0o170000 == 0o120000:
            sus.append("symlink " + nm)
        if i.flag_bits & 0x1:
            enc += 1
        if i.compress_size and i.file_size / i.compress_size > 100:
            bomb.append(nm)
        if not nm.endswith("/"):
            exts[os.path.splitext(nm)[1].lower()] += 1
    print(f"{n}: sha256 {sha[:16]}… · {len(z.infolist())}개 · 확장자 {dict(exts)} · 경로조작/링크 {sus or '없음'} · 암호화 {enc} · 압축폭탄 의심 {bomb or '없음'}")

print("\n== 2. 풀린 파일: 실제 형식(확장자 위장) · 이미지 뒤에 숨은 데이터 · 실행/스크립트 흔적")
SIG = {b"\xff\xd8\xff": "jpg", b"\x89PNG\r\n\x1a\n": "png"}
MARKERS = (b"<script", b"<?php", b"MZ\x90\x00", b"#!/", b"powershell", b"<html", b"PK\x03\x04", b"Rar!", b"7z\xbc\xaf")
total, mismatch, trailing, markers, txts = 0, [], [], [], []
for dp, _, fs in os.walk(ORIG):
    for f in fs:
        p = os.path.join(dp, f)
        rel = os.path.relpath(p, ORIG)
        total += 1
        b = open(p, "rb").read()
        ext = os.path.splitext(f)[1].lower()
        if ext == ".txt":
            ctrl = sum(1 for c in b if c < 9 or 13 < c < 32)
            urls = re.findall(rb"https?://[^\s]+", b)
            txts.append((rel, len(b), ctrl, [u.decode("utf-8", "replace") for u in urls]))
            continue
        kind = next((v for k, v in SIG.items() if b.startswith(k)), None)
        if kind is None or (kind == "jpg") != (ext in (".jpg", ".jpeg")):
            mismatch.append((rel, b[:8]))
        if kind == "jpg":
            end = b.rfind(b"\xff\xd9") + 2
        elif kind == "png":
            end = b.rfind(b"IEND") + 8
        else:
            end = len(b)
        extra = len(b) - end
        if extra > 64:
            trailing.append((rel, extra, b[end:end + 12]))
        for m in MARKERS:
            pos = b.find(m, 64)
            if pos > 0 and (m != b"PK\x03\x04" or pos >= end):
                markers.append((rel, m, pos))
        try:
            with Image.open(p) as im:
                im.verify()
        except Exception as e:
            mismatch.append((rel, "decode " + str(e)[:60]))
print(f"파일 {total}개 · 형식 위장/깨짐 {mismatch or '없음'}")
print(f"이미지 끝 뒤 덧붙은 데이터(64바이트 초과) {len(trailing)}건")
for t in trailing[:15]:
    print("   ", t)
print(f"실행·스크립트·압축 흔적 {len(markers)}건")
for m in markers[:15]:
    print("   ", m)
for t in txts:
    print("텍스트:", t)

print("\n== 3. 개인정보: 원본 사진의 촬영 위치(GPS) · 기기 정보")
GPS = next(k for k, v in ExifTags.TAGS.items() if v == "GPSInfo")
gps, dev = [], collections.Counter()
for dp, _, fs in os.walk(ORIG):
    for f in fs:
        if not f.lower().endswith((".jpg", ".jpeg", ".png")):
            continue
        p = os.path.join(dp, f)
        try:
            ex = Image.open(p).getexif()
        except Exception:
            continue
        g = ex.get_ifd(GPS) if GPS in ex else {}
        if g and (2 in g or 4 in g):
            gps.append(os.path.relpath(p, ORIG))
        mk = ex.get(271)
        if mk:
            dev[str(mk).strip()] += 1
print(f"GPS 위치가 들어 있는 원본 {len(gps)}장" + (f" (예: {gps[:5]})" if gps else ""))
print(f"촬영 기기 정보 {dict(dev)}")

print("\n== 4. 배포본(site/assets/media): 메타데이터 남았는지")
left, cnt, size = [], 0, 0
for dp, _, fs in os.walk(MEDIA):
    for f in fs:
        p = os.path.join(dp, f)
        cnt += 1
        size += os.path.getsize(p)
        with Image.open(p) as im:
            if im.info.get("exif") or im.info.get("xmp") or len(im.getexif()):
                left.append(os.path.relpath(p, MEDIA))
print(f"WebP {cnt}개 · {size/1e6:.0f}MB · EXIF/XMP 남은 파일 {left[:5] or '없음'}")
