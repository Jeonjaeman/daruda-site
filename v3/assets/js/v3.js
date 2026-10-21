/* DARUDA v3 — Hollywood-exhibit 방식 갤러리 (바닐라 three.js + GSAP)
   구조: 인트로(스파이럴) → 마스트헤드 → 칩 필터 + 흩어진 그리드(DOM) 위에 WebGL 평면(하프톤 리빌) → 종이 접힘 전환 → 상세 */
import * as THREE from "three";
import { introVert, introFrag, planeVert, planeFrag } from "./shaders.js";

const D = window.DARUDA, gsap = window.gsap;
gsap.ticker.lagSmoothing(0);   // 저사양에서도 타임라인은 실제 시간을 따른다
const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const lerp = (a, b, t) => a + (b - a) * t;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = matchMedia("(hover: none)").matches;
const W = () => window.innerWidth, H = () => window.innerHeight;

/* ============ 1. 데이터 → 갤러리 아이템 ============ */
const items = [];
const seen = new Set();
function push(it) { if (seen.has(it.src)) return; seen.add(it.src); it.id = it.id || ("i" + items.length); items.push(it); }
D.projects.forEach((p) => {
  const base = { category: p.category, title: p.title, year: p.year, field: p.field, desc: p.desc, location: p.location, area: p.area, use: p.use, credit: "PHOTOGRAPH BY " + (p.photography || "DARUDA").toUpperCase(), when: p.year + " · " + p.category.toUpperCase() };
  push({ ...base, src: p.main, id: p.id });
  p.subs.forEach((s, k) => push({ ...base, src: s.src, id: p.id + "-" + (k + 1), title: p.title, sub: k + 1 }));
});
D.processing.forEach((p, k) => push({ src: p.src, id: "proc-" + k, category: "processing", title: p.caption, year: 2026, field: "IN PROGRESS", when: "2026 · PROCESSING", credit: "WORK IN PROGRESS", desc: "현재 진행 중인 작업 과정입니다. 완료 후 ARCHIVING으로 이동합니다." }));
D.press.forEach((p) => push({ src: p.cover, id: p.id, category: "press", title: p.title, year: p.date, field: "PRESS", when: p.date + (p.issue ? " · " + p.issue : ""), credit: p.source === "pdf" ? "PDF ORIGINAL" : "SCANNED PAGES", desc: "매거진에 소개된 다루다의 작업. 표지를 누르면 지면이 이어집니다.", pdf: p.pdf, pages: p.pages }));

/* ============ 2. 공통 UI: 회사 정보 / 그레인 / 커서 ============ */
const c = D.company;
$$("[data-company]").forEach((el) => (el.innerHTML = `company ${esc(c.legalName)} · owner ${esc(c.owner)} · business number ${esc(c.bizNo)}`));
$("#foot").innerHTML = `<div><b>DARUDA</b>${esc(c.legalName)} · owner ${esc(c.owner)} · business number ${esc(c.bizNo)}<br>${esc(c.addressKo)} · ${esc(c.tels[0])} · ${esc(c.email)}</div><div>${esc(c.copyright)}<br>@${esc(c.instagram)}</div>`;
$("#menuInfo").innerHTML = `<div>${esc(c.addressEn)}<br>${esc(c.addressKo)}</div><div>${c.tels.map(esc).join(" / ")}<br>${esc(c.email)}</div><div>@${esc(c.instagram)}<br>${esc(c.copyright)}</div>`;
$("#menuCount").textContent = items.length + " photographs";

(function grain() {
  const cv = document.createElement("canvas"); cv.width = cv.height = 220; const cx = cv.getContext("2d");
  const im = cx.createImageData(220, 220); for (let i = 0; i < im.data.length; i += 4) { const v = 120 + Math.random() * 135; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
  cx.putImageData(im, 0, 0); $("#grain").style.backgroundImage = `url(${cv.toDataURL()})`;
  const hv = document.createElement("canvas"); hv.width = hv.height = 46; const hx = hv.getContext("2d");
  for (let i = 0; i < 900; i++) { const a = Math.random() * 6.283, r = Math.pow(Math.random(), 0.5) * 22; hx.fillStyle = `rgba(255,255,255,${0.25 + Math.random() * 0.5})`; hx.fillRect(23 + Math.cos(a) * r, 23 + Math.sin(a) * r, 1, 1); }
  $(".cursor-halo").style.backgroundImage = `url(${hv.toDataURL()})`;
})();

const cursor = $("#cursor"), halo = $(".cursor-halo");
const ptr = { x: W() / 2, y: H() / 2, hx: W() / 2, hy: H() / 2, vx: 0, vy: 0, lx: 0, ly: 0, lt: 0 };
window.addEventListener("pointermove", (e) => {
  const now = performance.now(), dt = Math.max(now - ptr.lt, 1);
  ptr.vx = (e.clientX - ptr.lx) / dt; ptr.vy = (e.clientY - ptr.ly) / dt; ptr.lx = e.clientX; ptr.ly = e.clientY; ptr.lt = now;
  ptr.x = e.clientX; ptr.y = e.clientY;
  cursor.style.transform = `translate(${ptr.x}px, ${ptr.y}px) translate(-50%,-50%)`;
}, { passive: true });

/* ============ 3. 그리드 DOM ============ */
const grid = $("#grid"), gallery = $("#gallery");
grid.innerHTML = items.map((it, i) => `<a class="item p${i % 9}" data-i="${i}" data-cat="${it.category}" href="#item-${esc(it.id)}"><div class="ph"><img src="${it.src}" alt="${esc(it.title)}" loading="lazy" decoding="async"></div><span class="cap">${esc(it.title)} · ${esc(String(it.year))}</span></a>`).join("");
const itemEls = $$(".item", grid);
itemEls.forEach((el) => { const im = $("img", el); const mark = () => { if (im.naturalWidth > im.naturalHeight) el.classList.add("is-land"); }; im.complete ? mark() : im.addEventListener("load", mark); });
const counts = { all: items.length };
items.forEach((it) => (counts[it.category] = (counts[it.category] || 0) + 1));
$$("#chips [data-n]").forEach((s) => (s.textContent = counts[s.dataset.n] || 0));
let filter = "all";
function applyFilter(f) {
  filter = f;
  $$("#chips button").forEach((b) => b.classList.toggle("is-on", b.dataset.f === f));
  let n = 0; itemEls.forEach((el, i) => { const on = f === "all" || items[i].category === f; el.classList.toggle("is-hidden", !on); if (on) n++; });
  $("#chipCount").textContent = `( ${n} ) photographs`;
  layoutChanged();
}
$$("#chips button").forEach((b) => (b.onclick = () => applyFilter(b.dataset.f)));
$("#viewToggle").onclick = () => { gallery.classList.toggle("is-list"); $("#viewToggle").classList.toggle("is-list"); layoutChanged(); };

/* ============ 4. 가상 스크롤 (Lenis식 lerp) ============ */
const scroller = $("#scroller"), spacer = $("#spacer"), hd = $("#hd"), mastWord = $("#mastWord");
const native = isTouch || reduced;
if (native) document.documentElement.classList.add("native-scroll");
let targetY = 0, curY = 0, needLayout = true;
function layoutChanged() { needLayout = true; }
function measure() { measureItems(); if (!native) spacer.style.height = scroller.scrollHeight + "px"; needLayout = false; }
window.addEventListener("scroll", () => (targetY = window.scrollY), { passive: true });
window.addEventListener("resize", layoutChanged);
new ResizeObserver(layoutChanged).observe(scroller);

/* ============ 4b. 스크롤 디테일 (Esquire 레퍼런스: 첫 2컷 대형→그리드 축소 · 속도 기울임 · 아래 개체 블러 진입) ============ */
const HERO_N = 2, MAST = .78;              /* 마스트헤드 높이 비율(78vh) — 아래 히어로 사진이 첫 화면 하단에 살짝 보이도록 */
const chips = $("#chips");
const docRects = []; let heroY0 = 0, gutPx = 24, skew = 0, prevY = 0;
const ease = (x) => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
function heroActive() { return filter === "all" && !gallery.classList.contains("is-list") && !reduced && itemEls.length >= HERO_N; }
function measureItems() {
  for (let i = 0; i < Math.min(HERO_N, planes.length); i++) planes[i].ph.style.cssText = "";   /* 변형을 걷고 원래 셀을 측정 */
  gallery.classList.toggle("has-hero", heroActive());
  gutPx = parseFloat(getComputedStyle(gallery).paddingLeft) || 24;
  heroY0 = chips.getBoundingClientRect().bottom + curY + 20;
  docRects.length = 0;
  itemEls.forEach((el, i) => { if (el.classList.contains("is-hidden")) { docRects[i] = null; return; } const r = el.getBoundingClientRect(); docRects[i] = { top: r.top + curY, left: r.left, width: r.width, height: r.height }; });
}
function heroRect(i) {
  const im = $("img", itemEls[i]); const ar = im.naturalWidth ? im.naturalWidth / im.naturalHeight : (i === 0 ? 4 / 3 : 3 / 4);
  const gap = Math.max(16, gutPx * .8), sw = (W() - gutPx * 2 - gap) / 2;
  const h = Math.min(sw / ar, H() * .86), w = h * ar;
  return { top: heroY0, left: i === 0 ? gutPx : W() - gutPx - w, width: w, height: h };
}
function scrollDetails(dt) {
  /* 1) 스크롤 속도에 따른 미세 기울임 (가상 스크롤일 때만) */
  const vel = dt > 0 ? (curY - prevY) / dt : 0; prevY = curY;
  const target = native ? 0 : Math.max(-1, Math.min(1, vel / 2600)) * 1.4;
  skew = lerp(skew, target, 1 - Math.pow(.002, dt)); if (Math.abs(skew) < .002) skew = 0;

  /* 2) 첫 2컷: 화면을 채우다 스크롤에 따라 그리드 자리로 축소 */
  const hero = gallery.classList.contains("has-hero");
  const t = hero ? ease(Math.min(Math.max(curY / (H() * .95), 0), 1)) : 1;
  for (let i = 0; i < Math.min(HERO_N, planes.length); i++) {
    const g = docRects[i], ph = planes[i].ph, el = itemEls[i];
    if (!hero || !g || t >= 1) { if (el.classList.contains("is-hero")) { el.classList.remove("is-hero"); ph.style.cssText = ""; } continue; }
    const h = heroRect(i);
    const x = lerp(h.left, g.left, t), y = lerp(h.top, g.top, t), w = lerp(h.width, g.width, t), hh = lerp(h.height, g.height, t);
    el.classList.add("is-hero");
    ph.style.cssText = `transform:translate3d(${(x - g.left).toFixed(2)}px,${(y - g.top).toFixed(2)}px,0);width:${w.toFixed(2)}px;height:${hh.toFixed(2)}px`;
  }

  /* 3) 아래에서 올라오는 개체는 뿌옇게 흐려진 채 들어와서, 들어온 순간부터 시간에 따라 서서히 선명해짐 */
  if (reduced) return;
  const now = performance.now(), enterY = H() * .97, leaveY = H() * 1.3, dur = 1100;
  itemEls.forEach((el, i) => {
    const r = docRects[i]; if (!r) return;
    const vt = r.top - curY;
    if (i < HERO_N && t < 1) { el._rt = -Infinity; }
    else if (vt > leaveY) { el._rt = undefined; }                                   /* 멀리 내려가면 초기화 → 다시 올라올 때 재리빌 */
    else if (el._rt === undefined && vt < enterY) { el._rt = now; }
    let e = el._rt === undefined ? 0 : Math.min((now - el._rt) / dur, 1); e = 1 - Math.pow(1 - e, 3);  /* ease-out */
    if (e >= 1) { if (el._e !== 1) { el._e = 1; el.style.opacity = ""; el.style.filter = ""; } return; }
    if (el._e !== undefined && Math.abs(el._e - e) < .004) return;
    el._e = e; el.style.opacity = (.06 + .94 * e).toFixed(3); el.style.filter = `blur(${((1 - e) * 14).toFixed(1)}px)`;
  });
}

/* ============ 5. three.js ============ */
const canvas = $("#gl");
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.setSize(W(), H()); renderer.setClearColor(0x000000, 0);
const loader = new THREE.TextureLoader(); const texCache = new Map();
function tex(src) {
  if (!texCache.has(src)) texCache.set(src, new Promise((res) => loader.load(src, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.minFilter = THREE.LinearFilter; t.generateMipmaps = false; res(t); }, undefined, () => res(null))));
  return texCache.get(src);
}

/* --- 갤러리 씬: 1 world unit = 1 px (z=0 평면) --- */
const gScene = new THREE.Scene();
const gCam = new THREE.PerspectiveCamera(45, W() / H(), 10, 6000);
function fitCam() { gCam.aspect = W() / H(); gCam.position.z = (H() / 2) / Math.tan(THREE.MathUtils.degToRad(22.5)); gCam.updateProjectionMatrix(); }
fitCam();
const planeGeo = new THREE.PlaneGeometry(1, 1, 24, 24);
const planes = items.map((it, i) => {
  const u = { uMap: { value: null }, uUvScale: { value: new THREE.Vector2(1, 1) }, uPointer: { value: new THREE.Vector2(0.5, 0.5) }, uAspect: { value: new THREE.Vector2(1, 1) }, uSizePx: { value: new THREE.Vector2(100, 100) },
    uDot: { value: 6.5 }, uStrength: { value: 0 }, uOpacity: { value: 0 }, uSolid: { value: 0 }, uTime: { value: 0 }, uPaper: { value: new THREE.Color("#ece9e2") },
    uFoldOrigin: { value: new THREE.Vector2(0, 0) }, uFold: { value: 0 }, uAmp: { value: 0 }, uPtrStrength: { value: 0 }, uPtrActive: { value: 0 }, uDepth: { value: 60 } };
  const m = new THREE.Mesh(planeGeo, new THREE.ShaderMaterial({ vertexShader: planeVert, fragmentShader: planeFrag, uniforms: u, transparent: true, depthTest: false, side: THREE.DoubleSide }));
  m.visible = false; m.renderOrder = i; gScene.add(m);
  return { mesh: m, u, el: itemEls[i], ph: $(".ph", itemEls[i]), it, strength: 0, opacity: 0, active: 0, ptrS: 0, rect: null, override: null };
});
function coverScale(u, w, h, t) { if (!t || !t.image) return; const pr = w / h, ir = t.image.width / t.image.height; u.uUvScale.value.set(pr > ir ? 1 : pr / ir, pr > ir ? ir / pr : 1); }

/* --- 인트로 씬 --- */
const iScene = new THREE.Scene(); const iCam = new THREE.PerspectiveCamera(50, W() / H(), 0.1, 200); iCam.position.z = 26;
const introGroup = new THREE.Group(); iScene.add(introGroup);
const introGeo = new THREE.PlaneGeometry(2.4, 3, 20, 20);
const introState = { spread: 0, rot: 0, active: !reduced };
const introPlanes = [];

/* ============ 6. 인트로 타임라인 ============ */
const introEl = $("#intro");
async function runIntro() {
  if (reduced) { finishIntro(true); return; }
  canvas.classList.add("is-intro");
  const picks = items.filter((x) => x.category !== "press").slice(0, 21);
  picks.forEach((p, i) => {
    const u = { uMap: { value: null }, uBend: { value: 2 }, uAngle: { value: 0 }, uFlip: { value: 0 }, uOpacity: { value: 0 } };
    const m = new THREE.Mesh(introGeo, new THREE.ShaderMaterial({ vertexShader: introVert, fragmentShader: introFrag, uniforms: u, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
    m.visible = false; introGroup.add(m); introPlanes.push({ m, u, i });
    tex(p.src).then((t) => { if (t && introState.active) { u.uMap.value = t; m.visible = true; } });   // 텍스처가 오는 대로 켠다
  });
  const tl = gsap.timeline({ onComplete: () => finishIntro(false) });
  tl.to(introState, { spread: 1, duration: 3.6, ease: "power2.inOut" }, 0);
  introPlanes.forEach(({ u, i }) => {
    tl.to(u.uOpacity, { value: 1, duration: .3, ease: "power2.out" }, .3 + i * .06);
    tl.fromTo(u.uBend, { value: 2 }, { value: 0, duration: 2.2, ease: "power2.inOut" }, .4 + i * .05);
    tl.to(u.uFlip, { value: 1, duration: 1.8, ease: "sine.inOut" }, .7 + i * .05);
  });
  tl.fromTo(iCam.position, { z: 4 }, { z: 19, duration: 3.8, ease: "power2.inOut" }, .4);
  tl.to(introEl.querySelector(".t"), { opacity: 0, y: -20, duration: .8, ease: "power2.in" }, 3.8);
  tl.to({}, { duration: .5 });
  $(".skip", introEl).onclick = () => { tl.progress(1); };
}
function layoutIntro() {
  const n = introPlanes.length, s = introState.spread;
  introPlanes.forEach(({ m, u, i }) => {
    const a = Math.PI / 2 + (i / n) * Math.PI * 2 * 1.35 * s + introState.rot;
    const k = Math.min(1, (W() / H()) / 1.6);
    const r = (1.5 + 8 * s) * k;
    m.position.set(Math.cos(a) * r * 1.35, Math.sin(a) * r * 0.85, -i * 1.3 * s + 6 * (1 - s));
    u.uAngle.value = -(a - Math.PI / 2) / (3 * Math.PI);
  });
  introGroup.rotation.z = introState.rot * 0.2;
}
function finishIntro(instant) {
  introState.active = false;
  introEl.classList.add("is-done"); canvas.classList.remove("is-intro");
  introPlanes.forEach(({ m }) => { introGroup.remove(m); m.material.dispose(); });
  introPlanes.length = 0;
  if (!instant) setTimeout(() => (introEl.style.display = "none"), 900); else introEl.style.display = "none";
  document.body.classList.add("is-ready");
  items.forEach((it) => tex(it.src));        // 나머지 텍스처 선로딩
  openFromHash();
}

/* ============ 7. 호버 / 포인터 ============ */
let hovered = null, transitioning = false;
grid.addEventListener("pointerover", (e) => { const el = e.target.closest(".item"); if (el) { hovered = planes[+el.dataset.i]; cursor.classList.add("is-view"); } });
grid.addEventListener("pointerout", (e) => { const el = e.target.closest(".item"); if (el && !el.contains(e.relatedTarget)) { hovered = null; cursor.classList.remove("is-view"); } });
grid.addEventListener("click", (e) => { const el = e.target.closest(".item"); if (!el) return; e.preventDefault(); if (!transitioning) openDetail(+el.dataset.i, true); });

/* ============ 8. 상세 + 종이 접힘 전환 ============ */
const detail = $("#detail"), dImg = $("#detailImg"), strip = $("#strip");
let current = -1;
strip.innerHTML = items.map((it, i) => `<button type="button" data-i="${i}" aria-label="${esc(it.title)}"><img src="${it.src}" alt="" loading="lazy"></button>`).join("");
$$("button", strip).forEach((b) => (b.onclick = () => showDetail(+b.dataset.i)));
function visibleIndexes() { return planes.map((p, i) => (p.el.classList.contains("is-hidden") ? -1 : i)).filter((i) => i >= 0); }
function fillDetail(i) {
  const it = items[i]; current = i;
  dImg.src = it.src; $("#dIdx").textContent = `[${i + 1}]`; $("#dWhen").textContent = it.when; $("#dCredit").textContent = it.credit;
  $("#dDesc").textContent = it.desc || "";
  $("#dMeta").innerHTML = it.location ? `<span>location</span><b>${esc(it.location)}</b><span>area</span><b>${esc(it.area)}</b><span>use</span><b>${esc(it.use)}</b><span>field</span><b>${esc(it.field)}</b>` : (it.pdf ? `<span>press</span><b><a href="${it.pdf}" target="_blank" rel="noopener">PDF 원본 보기</a></b>` : "");
  const parts = it.title.split(/\s+/); $("#dFirst").textContent = parts.length > 1 ? parts.slice(0, -1).join(" ") : (it.category === "press" ? "press" : it.category); $("#dLast").textContent = parts[parts.length - 1];
  $$("button", strip).forEach((b, k) => { b.classList.toggle("is-on", k === i); b.style.display = planes[k].el.classList.contains("is-hidden") ? "none" : ""; });
  const on = $(`button[data-i="${i}"]`, strip); if (on) on.scrollIntoView({ block: "center", behavior: "smooth" });
  history.replaceState(null, "", "#item-" + it.id);
}
function stageRect(i) {
  const s = $(".stage", detail).getBoundingClientRect(); const im = items[i]; const t = texCache.get(im.src);
  const ar = (im._ar) || 1; const w = Math.min(s.width, s.height * ar), h = w / ar;
  return { left: s.left + (s.width - w) / 2, top: s.top + (s.height - h) / 2, width: w, height: h };
}
async function openDetail(i, animate) {
  const p = planes[i]; const t = await tex(p.it.src); if (t && t.image) p.it._ar = t.image.width / t.image.height;
  fillDetail(i);
  if (!animate || isTouch || reduced || !t) { detail.classList.add("is-open"); return; }
  transitioning = true; hovered = null; cursor.classList.remove("is-view");
  const from = p.ph.getBoundingClientRect(), to = stageRect(i);
  p.u.uMap.value = t; p.u.uSolid.value = 1; p.u.uOpacity.value = 1; p.opacity = 1; p.mesh.visible = true;
  p.u.uFoldOrigin.value.set(Math.min(Math.max((ptr.x - from.left) / from.width, 0), 1), 1 - Math.min(Math.max((ptr.y - from.top) / from.height, 0), 1));
  const st = { t: 0 }; const dur = 1.15;
  gsap.timeline({ onComplete: () => { detail.classList.add("is-open"); setTimeout(() => { p.u.uSolid.value = 0; p.u.uOpacity.value = 0; p.opacity = 0; p.mesh.visible = false; p.override = null; p.u.uFold.value = 0; p.u.uAmp.value = 0; transitioning = false; }, 380); } })
    .to(st, { t: 1, duration: dur, ease: "none", onUpdate: () => {
      const e = gsap.parseEase("power2.inOut")(st.t);
      p.override = { left: lerp(from.left, to.left, e), top: lerp(from.top, to.top, e), width: lerp(from.width, to.width, e), height: lerp(from.height, to.height, e) };
      p.u.uFold.value = -(Math.cos(Math.PI * st.t) - 1) / 2;
      const q = st.t < .4 ? 1 - Math.pow(1 - st.t / .4, 4) : st.t > .6 ? Math.pow((1 - st.t) / .4, 4) : 1;
      p.u.uAmp.value = q * .9;
    } }, 0);
}
function closeDetail() {
  if (current < 0) return;
  const p = planes[current];
  detail.classList.remove("is-open"); history.replaceState(null, "", location.pathname);
  if (isTouch || reduced || p.el.classList.contains("is-hidden") || !texCache.has(p.it.src)) return;
  tex(p.it.src).then((t) => {
    if (!t) return;
    transitioning = true; const from = stageRect(current), to = p.ph.getBoundingClientRect();
    p.u.uMap.value = t; p.u.uSolid.value = 1; p.u.uOpacity.value = 1; p.opacity = 1; p.mesh.visible = true; p.u.uFoldOrigin.value.set(.5, .5);
    const st = { t: 0 };
    gsap.to(st, { t: 1, duration: .9, ease: "none", onUpdate: () => { const e = gsap.parseEase("power2.inOut")(st.t); p.override = { left: lerp(from.left, to.left, e), top: lerp(from.top, to.top, e), width: lerp(from.width, to.width, e), height: lerp(from.height, to.height, e) }; p.u.uFold.value = -(Math.cos(Math.PI * st.t) - 1) / 2; const q = st.t < .4 ? 1 - Math.pow(1 - st.t / .4, 4) : st.t > .6 ? Math.pow((1 - st.t) / .4, 4) : 1; p.u.uAmp.value = q * .6; },
      onComplete: () => { p.u.uSolid.value = 0; p.u.uOpacity.value = 0; p.opacity = 0; p.mesh.visible = false; p.override = null; p.u.uFold.value = 0; p.u.uAmp.value = 0; transitioning = false; } });
  });
}
function showDetail(i) { gsap.fromTo(dImg, { opacity: 0 }, { opacity: 1, duration: .35 }); fillDetail(i); }
function step(d) { const v = visibleIndexes(); if (!v.length) return; const k = v.indexOf(current); showDetail(v[(k + d + v.length) % v.length]); }
$("#dClose").onclick = closeDetail; $("#dPrev").onclick = () => step(-1); $("#dNext").onclick = () => step(1);
document.addEventListener("keydown", (e) => {
  if (detail.classList.contains("is-open")) { if (e.key === "ArrowRight") step(1); else if (e.key === "ArrowLeft") step(-1); else if (e.key === "Escape") closeDetail(); }
  else if (e.key === "Escape") menu.classList.remove("is-open");
});
function openFromHash() { const m = location.hash.match(/^#item-(.+)$/); if (!m) return; const i = items.findIndex((x) => x.id === decodeURIComponent(m[1])); if (i >= 0) openDetail(i, false); }

/* ============ 9. 메뉴 (C안) ============ */
const menu = $("#menu");
$("#menuBtn").onclick = () => menu.classList.add("is-open");
$("#menuClose").onclick = () => menu.classList.remove("is-open");
$("[data-archive]", menu).onclick = (e) => { e.preventDefault(); menu.classList.remove("is-open"); const y = gallery.offsetTop - 20; if (native) window.scrollTo({ top: y, behavior: "smooth" }); else { window.scrollTo(0, y); targetY = y; } };

/* ============ 10. 프레임 루프 ============ */
const clock = new THREE.Clock(); let last = 0;
function frame() {
  requestAnimationFrame(frame);
  const t = clock.getElapsedTime(), dt = Math.min(t - last, .05); last = t;
  if (needLayout) measure();

  /* 스크롤 */
  if (native) curY = window.scrollY; else { curY = lerp(curY, targetY, 1 - Math.pow(.0008, dt)); if (Math.abs(curY - targetY) < .05) curY = targetY; scroller.style.transform = `translate3d(0,${-curY}px,0) skewY(${skew.toFixed(3)}deg)`; }
  scrollDetails(dt);
  const pm = Math.min(Math.max(curY / (H() * MAST), 0), 1);
  mastWord.style.transform = `scale(${1 - pm * .82}) translateY(${-pm * 20}vh)`; mastWord.style.opacity = String(1 - pm * 1.15);
  hd.classList.toggle("is-scrolled", pm > .62);

  /* 커서 후광 지연 */
  ptr.hx = lerp(ptr.hx, ptr.x, .14); ptr.hy = lerp(ptr.hy, ptr.y, .14);
  halo.style.transform = `translate(${ptr.hx - ptr.x}px, ${ptr.hy - ptr.y}px) translate(-50%,-50%)`;

  /* 인트로 */
  if (introState.active) { introState.rot += dt * .12; layoutIntro(); renderer.render(iScene, iCam); return; }

  /* 갤러리 평면 */
  const speed = Math.min(Math.hypot(ptr.vx, ptr.vy) * 1.2, 1);
  let any = false;
  for (const p of planes) {
    const isH = p === hovered && !transitioning;
    p.strength = lerp(p.strength, isH ? 1 : 0, isH ? .08 : .05);
    if (!p.override) { p.opacity = lerp(p.opacity, isH ? 1 : 0, .12); }
    p.ptrS = lerp(p.ptrS, isH ? speed : 0, isH ? .18 : .12);
    p.active = lerp(p.active, isH ? 1 : 0, .04);
    const show = p.override || p.opacity > .004;
    if (!show) { p.mesh.visible = false; continue; }
    if (!p.u.uMap.value) { const tc = texCache.get(p.it.src); if (tc) tc.then((tx) => { if (tx) { p.u.uMap.value = tx; p.it._ar = tx.image.width / tx.image.height; } }); else tex(p.it.src); p.mesh.visible = false; continue; }
    const r = p.override || p.ph.getBoundingClientRect();
    if (!p.override && (r.bottom < -50 || r.top > H() + 50)) { p.mesh.visible = false; continue; }
    p.mesh.visible = true; any = true;
    p.mesh.position.set(r.left + r.width / 2 - W() / 2, H() / 2 - (r.top + r.height / 2), 0);
    p.mesh.scale.set(r.width, r.height, 1);
    coverScale(p.u, r.width, r.height, p.u.uMap.value);
    p.u.uSizePx.value.set(r.width, r.height); p.u.uAspect.value.set(r.width / r.height, 1); p.u.uDepth.value = Math.min(r.width, r.height) * .35;
    if (!p.override) { p.u.uPointer.value.lerp(new THREE.Vector2(Math.min(Math.max((ptr.x - r.left) / r.width, -.2), 1.2), 1 - Math.min(Math.max((ptr.y - r.top) / r.height, -.2), 1.2)), .18); p.u.uOpacity.value = p.opacity; }
    p.u.uStrength.value = p.strength; p.u.uPtrStrength.value = p.ptrS; p.u.uPtrActive.value = p.active; p.u.uTime.value = t;
  }
  if (any) renderer.render(gScene, gCam); else renderer.clear();
}
window.addEventListener("resize", () => { renderer.setSize(W(), H()); fitCam(); iCam.aspect = W() / H(); iCam.updateProjectionMatrix(); });

applyFilter("all");
frame();
runIntro();
