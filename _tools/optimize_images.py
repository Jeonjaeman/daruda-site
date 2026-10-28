# -*- coding: utf-8 -*-
"""고객 원본 사진 → 웹용 WebP 변환 (CMS 업로드 · 사이트 등록용)

    from optimize_images import optimize
    info = optimize(src_path, out_dir, stem)   # → {"w","h","shape","files":{"lg","md","sm"},"bytes"}

- 원본은 건드리지 않는다. EXIF(GPS 등) 제거 · 회전 보정 · sRGB 변환.
- 크기: lg 긴 변 2400(라이트박스·슬라이드) / md 1600(상세) / sm 800(목록 썸네일). 원본이 더 작으면 원본 크기.
- WebP 품질 80, method 6.
"""
import io, os
from PIL import Image, ImageOps, ImageCms

SIZES = {"lg": 2400, "md": 1600, "sm": 800}
QUALITY = 80
_SRGB = ImageCms.createProfile("sRGB")


def _to_srgb(im):
    icc = im.info.get("icc_profile")
    if icc:
        try:
            src = ImageCms.ImageCmsProfile(io.BytesIO(icc))
            im = ImageCms.profileToProfile(im, src, _SRGB, outputMode="RGB")
        except Exception:
            im = im.convert("RGB")
    return im.convert("RGB")


def shape_of(w, h):
    r = w / h
    if r >= 1.15:
        return "landscape"
    if r <= 0.87:
        return "portrait"
    return "square"


def optimize(src, out_dir, stem, sizes=SIZES):
    os.makedirs(out_dir, exist_ok=True)
    with Image.open(src) as im0:
        im = ImageOps.exif_transpose(im0)
        im = _to_srgb(im)
    w, h = im.size
    files, total = {}, 0
    for key, edge in sizes.items():
        s = min(1.0, edge / max(w, h))
        tgt = im if s >= 1.0 else im.resize((round(w * s), round(h * s)), Image.LANCZOS)
        path = os.path.join(out_dir, f"{stem}-{key}.webp")
        tgt.save(path, "WEBP", quality=QUALITY, method=6)   # info/exif 를 넘기지 않으므로 메타데이터 없음
        files[key] = path
        total += os.path.getsize(path)
    return {"w": w, "h": h, "shape": shape_of(w, h), "files": files, "bytes": total, "src_bytes": os.path.getsize(src)}
