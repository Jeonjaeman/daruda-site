# -*- coding: utf-8 -*-
# ComfyUI batch generator — 샘플 데이터 2배 확장용 임시 이미지 24장 (flux1-schnell-fp8)
# 실행: python gen_images_more.py  → v2/assets/img/*.jpg (v1·v3 복사는 add_samples.py 가 처리)
import json, urllib.request, urllib.parse, time, os, random
from PIL import Image
HOST = "http://127.0.0.1:8188"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "img")
STYLE = ", minimal Korean architecture interior design photography, soft daylight, neutral tones, clean composition, photorealistic, high-end editorial, no people, no text"
JOBS = [
 # 메인 슬라이드 추가 4장 (가로)
 ("main-07", "double-height white living room with a floating oak staircase and a tall window, morning light", 1344, 896),
 ("main-08", "calm hair salon interior with arched mirrors, beige plaster walls, terrazzo floor", 1344, 896),
 ("main-09", "small concrete gallery cafe with a long stone counter and skylight", 1344, 896),
 ("main-10", "japanese-inspired tea house interior with tatami, shoji screens and dark timber", 1344, 896),
 # 주거 프로젝트 4건
 ("liv-05", "attic bedroom with sloped white ceiling, oak floor and a low platform bed", 1024, 1024),
 ("liv-06", "compact home office with a long birch desk under a window, linen curtain", 1024, 1024),
 ("liv-07", "entrance hall with a built-in oak bench, stone floor and a round mirror", 1024, 1024),
 ("liv-08", "open plan kitchen and dining with a dark green island and brass pendants", 1024, 1024),
 # 상업 프로젝트 4건
 ("com-05", "minimal eyewear shop with white display niches and a travertine counter", 1024, 1024),
 ("com-06", "small flower shop interior with zinc counter, concrete floor and glass front", 1024, 1024),
 ("com-07", "pilates studio with pale wood floor, mirrors and warm wall washers", 1024, 1024),
 ("com-08", "boutique hotel lobby with curved plaster walls, stone floor and a single pendant", 1024, 1024),
 # 서브 컷 8장 (세로 4, 가로 4)
 ("sub-05", "detail of a brass door handle on a white lacquer door", 896, 1152),
 ("sub-06", "staircase detail with oak treads and a thin black steel handrail", 896, 1152),
 ("sub-07", "tall linen curtain beside a plaster wall with soft shadow", 896, 1152),
 ("sub-08", "detail of terrazzo counter edge and a brass tap", 896, 1152),
 ("sub-09", "long corridor with hidden cove lighting and oak doors", 1152, 896),
 ("sub-10", "close-up of a travertine reception desk top and a small lamp", 1152, 896),
 ("sub-11", "window with a deep white reveal and a wooden stool", 1152, 896),
 ("sub-12", "built-in white shelving with a few ceramic objects", 1152, 896),
 # 진행 중 4장
 ("proc-05", "interior renovation site with plaster being applied to a curved wall, scaffold", 1024, 1024),
 ("proc-06", "architect's desk with floor plan drawings, material samples and a scale ruler", 1024, 1024),
 ("proc-07", "workshop with a half-built oak cabinet and clamps, sawdust", 1024, 1024),
 ("proc-08", "construction site with tile layout in progress and a laser level line", 1024, 1024),
]
def wf(name, prompt, w, h, seed):
    return {
     "1": {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": "flux1-schnell-fp8.safetensors"}},
     "2": {"class_type": "CLIPTextEncode", "inputs": {"clip": ["1", 1], "text": prompt + STYLE}},
     "3": {"class_type": "CLIPTextEncode", "inputs": {"clip": ["1", 1], "text": ""}},
     "4": {"class_type": "EmptyLatentImage", "inputs": {"width": w, "height": h, "batch_size": 1}},
     "5": {"class_type": "KSampler", "inputs": {"model": ["1", 0], "positive": ["2", 0], "negative": ["3", 0], "latent_image": ["4", 0], "seed": seed, "steps": 4, "cfg": 1.0, "sampler_name": "euler", "scheduler": "simple", "denoise": 1.0}},
     "6": {"class_type": "VAEDecode", "inputs": {"samples": ["5", 0], "vae": ["1", 2]}},
     "7": {"class_type": "SaveImage", "inputs": {"images": ["6", 0], "filename_prefix": "daruda/" + name}},
    }
def post(path, data=None):
    req = urllib.request.Request(HOST + path, data=json.dumps(data).encode() if data else None, headers={"Content-Type": "application/json"})
    return json.load(urllib.request.urlopen(req, timeout=60))
def get(path):
    return json.load(urllib.request.urlopen(HOST + path, timeout=60))
for name, prompt, w, h in JOBS:
    target = os.path.join(OUT, name + ".jpg")
    if os.path.exists(target): print("skip", name, flush=True); continue
    t0 = time.time()
    pid = post("/prompt", {"prompt": wf(name, prompt, w, h, random.randint(1, 10 ** 9)), "client_id": "daruda"})["prompt_id"]
    while True:
        time.sleep(2)
        hist = get("/history/" + pid)
        if pid in hist:
            o = hist[pid]["outputs"]["7"]["images"][0]
            data = urllib.request.urlopen(HOST + "/view?filename=%s&subfolder=%s&type=%s" % (urllib.parse.quote(o["filename"]), o["subfolder"], o["type"]), timeout=60).read()
            tmp = target + ".png"; open(tmp, "wb").write(data)
            Image.open(tmp).convert("RGB").save(target, "JPEG", quality=86, optimize=True); os.remove(tmp)
            print(name, "%.0fs" % (time.time() - t0), flush=True); break
        if time.time() - t0 > 600: print("TIMEOUT", name, flush=True); break
print("ALL DONE")
