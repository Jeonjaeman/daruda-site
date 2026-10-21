# ComfyUI batch generator for DARUDA prototype placeholder images (flux1-schnell-fp8)
import json, urllib.request, time, sys, os, shutil, random
HOST="http://127.0.0.1:8188"
OUT=os.path.join(os.path.dirname(__file__),"..","assets","img")
STYLE=", minimal Korean architecture interior design photography, soft daylight, neutral tones, white walls, clean composition, wide angle, photorealistic, high-end editorial, no people, no text"
JOBS=[
 ("main-01","bright minimalist living room with grey marble kitchen island, floor-to-ceiling windows, black linear ceiling track lights",1344,896),
 ("main-02","warm wood-clad commercial cafe interior with long oak table and linen curtains, afternoon light",1344,896),
 ("main-03","concrete and white gallery-like showroom with a single sculptural chair, dramatic shadow",1344,896),
 ("main-04","dark moody restaurant interior with terrazzo floor, brass pendant lights, deep green walls",1344,896),
 ("main-05","sunlit bedroom with beige plaster walls, low wooden bed, sheer curtains",1344,896),
 ("main-06","office lobby with travertine reception desk and warm indirect lighting",1344,896),
 ("proc-01","construction site of interior renovation, exposed concrete, drawings on wall, work in progress",1024,1024),
 ("proc-02","close-up of material samples oak veneer stone tile swatches on a white table",1024,1024),
 ("proc-03","carpenter workshop building custom furniture, wood shavings, soft light",1024,1024),
 ("proc-04","interior under construction with timber framing and plaster, natural light",1024,1024),
 ("liv-01","compact apartment living room with built-in oak shelving and white sofa",1024,1024),
 ("liv-02","minimal kitchen with stainless steel counter and white tile",1024,1024),
 ("liv-03","serene bathroom with beige microcement walls and a round mirror",1024,1024),
 ("liv-04","children's room with pale wood furniture and soft curtains",1024,1024),
 ("com-01","boutique clothing store with curved white walls and chrome rails",1024,1024),
 ("com-02","small bakery cafe with terrazzo counter and warm pendant light",1024,1024),
 ("com-03","dental clinic reception with pale green walls and oak joinery",1024,1024),
 ("com-04","wine bar interior with dark walnut shelves and stone bar top",1024,1024),
 ("sub-01","detail of oak joinery and stone threshold in a minimal interior",896,1152),
 ("sub-02","corridor with linear ceiling light and white doors",1152,896),
 ("sub-03","window seat nook with linen cushion and plaster wall",896,1152),
 ("sub-04","close-up of marble kitchen island edge and stool",1152,896),
 ("press-01","magazine cover style interior photo of a white house with pink accent",896,1152),
 ("press-02","magazine cover style interior photo of a modern house exterior at dusk",896,1152),
]
def wf(name,prompt,w,h,seed):
    return {
     "1":{"class_type":"CheckpointLoaderSimple","inputs":{"ckpt_name":"flux1-schnell-fp8.safetensors"}},
     "2":{"class_type":"CLIPTextEncode","inputs":{"clip":["1",1],"text":prompt+STYLE}},
     "3":{"class_type":"CLIPTextEncode","inputs":{"clip":["1",1],"text":""}},
     "4":{"class_type":"EmptyLatentImage","inputs":{"width":w,"height":h,"batch_size":1}},
     "5":{"class_type":"KSampler","inputs":{"model":["1",0],"positive":["2",0],"negative":["3",0],"latent_image":["4",0],"seed":seed,"steps":4,"cfg":1.0,"sampler_name":"euler","scheduler":"simple","denoise":1.0}},
     "6":{"class_type":"VAEDecode","inputs":{"samples":["5",0],"vae":["1",2]}},
     "7":{"class_type":"SaveImage","inputs":{"images":["6",0],"filename_prefix":"daruda/"+name}},
    }
def post(path,data=None):
    req=urllib.request.Request(HOST+path,data=json.dumps(data).encode() if data else None,headers={"Content-Type":"application/json"})
    return json.load(urllib.request.urlopen(req,timeout=60))
def get(path):
    return json.load(urllib.request.urlopen(HOST+path,timeout=60))
done=0
for name,prompt,w,h in JOBS:
    target=os.path.join(OUT,name+".jpg")
    if os.path.exists(target): continue
    t0=time.time()
    r=post("/prompt",{"prompt":wf(name,prompt,w,h,random.randint(1,10**9)),"client_id":"daruda"})
    pid=r["prompt_id"]
    while True:
        time.sleep(2)
        h_=get("/history/"+pid)
        if pid in h_:
            outs=h_[pid]["outputs"]["7"]["images"][0]
            data=urllib.request.urlopen(HOST+"/view?filename=%s&subfolder=%s&type=%s"%(urllib.parse.quote(outs["filename"]),outs["subfolder"],outs["type"]),timeout=60).read()
            tmp=target+".png"; open(tmp,"wb").write(data)
            from PIL import Image
            Image.open(tmp).convert("RGB").save(target,"JPEG",quality=86,optimize=True); os.remove(tmp)
            print(name,"%.0fs"%(time.time()-t0),flush=True); break
        if time.time()-t0>600: print("TIMEOUT",name,flush=True); break
print("ALL DONE")
