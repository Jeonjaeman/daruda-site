/* DARUDA v2 — behaviour (A안) */
(function () {
  const D = window.DARUDA;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const page = document.body.dataset.page || "";

  /* ---------- 공통: 상단 바 활성 표시 / 회사 정보 ---------- */
  $$(".nav a").forEach((a) => { if (a.dataset.key && a.dataset.key === page) a.classList.add("is-active"); });
  $$("[data-company]").forEach((el) => {
    const c = D.company;
    el.innerHTML = `<span class="company">company ${esc(c.legalName)} &nbsp;owner ${esc(c.owner)}</span><br>business number ${esc(c.bizNo)}<br>${esc(c.copyright)}`;
  });
  $$("[data-foot]").forEach((el) => {
    const c = D.company;
    el.innerHTML = `<div><div class="brand">DARUDA</div>${esc(c.legalName)} · owner ${esc(c.owner)} · business number ${esc(c.bizNo)}<br>${esc(c.addressKo)} · <a href="tel:${c.tels[0].replace(/\s/g, "")}">${esc(c.tels[0])}</a> · <a href="mailto:${esc(c.email)}">${esc(c.email)}</a></div><div>${esc(c.copyright)}<br><a href="https://instagram.com/${esc(c.instagram)}" target="_blank" rel="noopener">@${esc(c.instagram)}</a></div>`;
  });

  /* ---------- 공통: 라이트박스 ---------- */
  const LB = (function () {
    let list = [], idx = 0, el;
    function ensure() {
      if (el) return el;
      el = document.createElement("div"); el.className = "lightbox";
      el.innerHTML = `<button class="lb-close">close</button><button class="lb-prev" aria-label="previous">&larr;</button><img alt=""><button class="lb-next" aria-label="next">&rarr;</button><div class="lb-count"></div>`;
      document.body.appendChild(el);
      $(".lb-close", el).onclick = close; $(".lb-prev", el).onclick = () => go(-1); $(".lb-next", el).onclick = () => go(1);
      el.addEventListener("click", (e) => { if (e.target === el) close(); });
      document.addEventListener("keydown", (e) => { if (!el.classList.contains("is-open")) return; if (e.key === "ArrowRight") go(1); else if (e.key === "ArrowLeft") go(-1); else if (e.key === "Escape") close(); });
      return el;
    }
    function render() { $("img", el).src = list[idx]; $(".lb-count", el).textContent = (idx + 1) + " / " + list.length; }
    function open(srcs, i) { list = srcs; idx = i || 0; ensure().classList.add("is-open"); render(); }
    function close() { el && el.classList.remove("is-open"); }
    function go(d) { idx = (idx + d + list.length) % list.length; render(); }
    return { open, close };
  })();

  /* ---------- 공통: 그리드 타일 렌더 ---------- */
  function tileHTML(p) {
    return `<a class="tile" href="project.html?id=${encodeURIComponent(p.id)}">
      <div class="ph"><img src="${p.cover}" alt="${esc(p.title)}" loading="lazy"></div>
      <h3>${esc(p.title)}</h3><p>${esc(p.desc || "")}</p>
      <div class="tags"><span>${esc(p.category)}</span><span>${esc(p.use || p.field)}</span><span>${p.year}</span></div></a>`;
  }

  /* ---------- 페이지별 초기화 (패널에서도 재사용) ---------- */
  function initPress(root) {
    const pl = $(".press-list", root), pd = $(".press-detail", root);
    if (!pl) return;
    pl.innerHTML = D.press.map((p, i) => `<div class="press-item" data-i="${i}"><span class="date">${esc(p.date)}</span><button type="button"><img src="${p.cover}" alt="${esc(p.title)}"><span class="ttl">${esc(p.title)}</span></button></div>`).join("");
    pd.innerHTML = `<p class="hint">커버를 누르면 지면이 아래에 펼쳐집니다.</p>`;
    function showMag(i) {
      $$(".press-item", pl).forEach((x, k) => x.classList.toggle("is-selected", k === i));
      const p = D.press[i], pg = p.pages; let cur = 0;
      pd.innerHTML = `<div class="spread-viewer">
        <div class="sv-head"><div><b>${esc(p.title)}</b><span>${esc(p.date)}${p.issue ? " · " + esc(p.issue) : ""} · ${p.source === "pdf" ? "PDF 원본" : "스캔본"}</span></div>
          ${p.pdf ? `<a class="sv-pdf" href="${p.pdf}" target="_blank" rel="noopener">PDF로 보기 (${pg.length + 1}쪽)</a>` : ""}</div>
        <div class="sv-stage"><button type="button" class="sv-prev" aria-label="이전 면">&larr;</button><button type="button" class="sv-img"><img src="${pg[0]}" alt=""></button><button type="button" class="sv-next" aria-label="다음 면">&rarr;</button></div>
        <div class="sv-count"></div>
        <div class="sv-thumbs">${pg.map((s, k) => `<button type="button" data-k="${k}"><img src="${s}" alt="" loading="lazy"></button>`).join("")}</div></div>`;
      const img = $(".sv-img img", pd), cnt = $(".sv-count", pd), th = $$(".sv-thumbs button", pd);
      const go = (k) => { cur = (k + pg.length) % pg.length; img.src = pg[cur]; cnt.textContent = `펼침면 ${cur + 1} / ${pg.length}`; th.forEach((b, j) => b.classList.toggle("is-on", j === cur)); };
      $(".sv-prev", pd).onclick = () => go(cur - 1); $(".sv-next", pd).onclick = () => go(cur + 1);
      $(".sv-img", pd).onclick = () => LB.open(pg, cur);
      th.forEach((b) => (b.onclick = () => go(+b.dataset.k)));
      go(0);
    }
    $$(".press-item", pl).forEach((it) => ($("button", it).onclick = () => showMag(+it.dataset.i)));
    showMag(0);   // 첫 매거진은 바로 펼쳐 둔다
  }
  function initContact(root) {
    const info = $(".contact-info", root); if (!info) return;
    const c = D.company;
    info.innerHTML = `<dl>
      <dt>Inquire</dt><dd><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></dd>
      <dt>SNS</dt><dd><a href="https://instagram.com/${esc(c.instagram)}" target="_blank" rel="noopener">@${esc(c.instagram)}</a></dd>
      <dt>Tel.</dt><dd>${c.tels.map((t) => `<a href="tel:${t.replace(/\s/g, "")}">${esc(t)}</a>`).join(" / ")}</dd>
      <dt>Address</dt><dd><a href="${c.naverMap}" target="_blank" rel="noopener">${esc(c.addressEn)}</a><br><span style="font-size:13px;color:var(--c-grey-700)">${esc(c.addressKo)} · 네이버 지도</span></dd>
    </dl>`;
    const form = $("form", root);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = { name: form.name.value.trim(), phone: form.phone.value.trim(), message: form.message.value.trim(), at: new Date().toISOString() };
      if (!data.name || !data.phone) { $(".done", form).textContent = "성함과 연락처를 입력해 주세요."; return; }
      const box = JSON.parse(localStorage.getItem("daruda:inquiries") || "[]"); box.unshift(data);
      localStorage.setItem("daruda:inquiries", JSON.stringify(box));   // 실서비스에선 서버 전송
      form.reset(); $(".done", form).textContent = "전송되었습니다. 확인 후 연락드리겠습니다.";
    });
  }
  function initAbout(root) {
    const t = $(".about-title", root); if (!t) return;
    t.textContent = D.about.title;
    $(".about-lines", root).innerHTML = D.about.lines.map((l) => `<p>${esc(l)}</p>`).join("");
    const ph = $(".about-photos", root); if (ph) ph.innerHTML = D.about.photos.map((s) => `<img src="${s}" alt="">`).join("");
    const sv = $(".about-services", root); if (sv) sv.innerHTML = D.about.services.map((s) => `<li>${esc(s)}</li>`).join("");
  }
  function initDoc(root) { initAbout(root); initPress(root); initContact(root); }
  initDoc(document);

  /* ============ MAIN ============ */
  const hero = $(".hero");
  if (hero) initMain();

  function initMain() {
    const bar = $(".bar");
    const slidesEl = $(".slides", hero), cap = $(".hero-cap", hero), dots = $(".dots", hero);
    const slides = D.slides.slice(0, 10);
    const nodes = slides.map((s) => { const n = document.createElement("div"); n.className = "slide"; n.innerHTML = `<div class="slide-img" style="background-image:url('${s.src}')"></div>`; slidesEl.appendChild(n); return n; });
    dots.innerHTML = slides.map((_, i) => `<button type="button" aria-label="slide ${i + 1}"></button>`).join("");
    const dotEls = $$("button", dots);
    let cur = 0, timer;

    /* 사진 밝기 감지 → 상단 바·캡션 색. 관리자 지정 색 우선 */
    const lumCache = {};
    function luminance(src) {
      if (lumCache[src]) return lumCache[src];
      lumCache[src] = new Promise((res) => {
        const im = new Image();
        im.onload = () => { try {
          const cv = document.createElement("canvas"); cv.width = 32; cv.height = 20;
          const cx = cv.getContext("2d"); cx.drawImage(im, 0, 0, 32, 20);
          const px = cx.getImageData(0, 0, 32, 20).data; let s = 0, n = 0;
          for (let y = 0; y < 20; y++) for (let x = 0; x < 32; x++) {
            const inBar = y < 4, inCap = y >= 15;            // 상단 바 영역 + 캡션 영역
            if (!inBar && !inCap) continue;
            const o = (y * 32 + x) * 4; s += 0.2126 * px[o] + 0.7152 * px[o + 1] + 0.0722 * px[o + 2]; n++;
          }
          res(s / n / 255);
        } catch (e) { res(0.4); } };
        im.onerror = () => res(0.4); im.src = src;
      });
      return lumCache[src];
    }
    async function applyUI(i) {
      const s = slides[i];
      const color = s.ui && s.ui !== "auto" ? s.ui : ((await luminance(s.src)) > 0.6 ? "#111111" : "#ffffff");
      hero.style.setProperty("--ui-color", color); bar.style.setProperty("--ui-color", color);
    }
    function show(i) {
      nodes[cur].classList.remove("is-active"); dotEls[cur].classList.remove("is-on");
      cur = i; nodes[cur].classList.add("is-active"); dotEls[cur].classList.add("is-on");
      const s = slides[cur];
      cap.innerHTML = s.projectId ? `<a href="project.html?id=${encodeURIComponent(s.projectId)}"><span class="t">${esc(s.title)}</span><span class="c">${esc(s.caption || "")}</span></a>` : `<span class="t">${esc(s.title)}</span><span class="c">${esc(s.caption || "")}</span>`;
      applyUI(cur);
    }
    function restart() { clearInterval(timer); if (slides.length > 1) timer = setInterval(() => show((cur + 1) % slides.length), D.slideInterval || 4000); }
    dotEls.forEach((d, i) => (d.onclick = () => { show(i); restart(); }));
    nodes[0].style.transition = "none"; show(0); requestAnimationFrame(() => (nodes[0].style.transition = "")); restart();

    /* 상단 바: 히어로를 지나면 미색 솔리드로 */
    const onScroll = () => bar.classList.toggle("is-solid", window.scrollY > hero.offsetHeight - 80);
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

    /* 최근 작업 4개 */
    const recent = $("[data-recent]");
    if (recent) recent.innerHTML = D.projects.slice(0, 3).map(tileHTML).join("");
  }

  /* ============ 패널 페이지 (about / press / contact를 메인 위에서 열기) ============ */
  const root = $(".panel-root");
  if (root) {
    const panel = $(".panel", root), scrim = $(".scrim", root), closeBtn = $(".panel-close", root);
    const cache = {};
    async function openPanel(href, push) {
      try {
        if (!cache[href]) {
          const html = await (await fetch(href, { cache: "force-cache" })).text();
          const doc = new DOMParser().parseFromString(html, "text/html");
          cache[href] = { title: doc.title, body: $(".doc", doc).outerHTML };
        }
        const { title, body } = cache[href];
        $(".panel-body", panel).innerHTML = body; initDoc(panel); panel.scrollTop = 0;
        root.classList.add("is-open"); document.body.style.overflow = "hidden";
        $$(".nav a").forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === href));
        if (push) history.pushState({ panel: href }, title, href);
        document.title = title;
      } catch (e) { location.href = href; }   // file:// 등 fetch 불가 시 일반 이동
    }
    function closePanel(push) {
      root.classList.remove("is-open"); document.body.style.overflow = "";
      $$(".nav a").forEach((a) => a.classList.remove("is-active"));
      document.title = "DARUDA";
      if (push) history.pushState({}, "DARUDA", "index.html");
    }
    $$(".nav a[data-panel]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); openPanel(a.getAttribute("href"), true); }));
    scrim.onclick = () => closePanel(true); closeBtn.onclick = () => closePanel(true);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && root.classList.contains("is-open")) closePanel(true); });
    window.addEventListener("popstate", (e) => { if (e.state && e.state.panel) openPanel(e.state.panel, false); else closePanel(false); });
    /* index.html?open=about 형태로 들어오면 바로 열기 */
    const want = new URLSearchParams(location.search).get("open");
    if (want) openPanel(want + ".html", false);
  }

  /* ============ ARCHIVE (필터 그리드) ============ */
  const grid = $("[data-archive-grid]");
  if (grid) {
    const filters = $$(".filters a"), letters = $(".arch-head .letters"), marquee = $(".marquee");
    $("[data-count-done]").textContent = D.counts.archiving;
    $("[data-count-proc]").textContent = D.counts.processing;
    const nLiving = D.projects.filter((p) => p.category === "living").length, nCom = D.projects.filter((p) => p.category === "commercial").length;
    $("[data-n-all]").textContent = D.projects.length; $("[data-n-living]").textContent = nLiving; $("[data-n-commercial]").textContent = nCom; $("[data-n-processing]").textContent = D.processing.length;
    function render(f) {
      filters.forEach((a) => a.classList.toggle("is-active", a.dataset.f === f));
      const isProc = f === "processing";
      letters.textContent = isProc ? "P" : "A"; letters.classList.toggle("is-fill", f !== "all");
      marquee.classList.toggle("is-on", isProc); document.body.classList.toggle("has-marquee", isProc);
      if (isProc) {
        grid.innerHTML = D.processing.map((p, i) => `<button type="button" class="tile is-proc" data-i="${i}"><div class="ph"><img src="${p.src}" alt="${esc(p.caption)}" loading="lazy"></div><h3>${esc(p.caption)}</h3><div class="tags"><span>in progress</span></div></button>`).join("");
        const srcs = D.processing.map((p) => p.src);
        $$("button", grid).forEach((b) => (b.onclick = () => LB.open(srcs, +b.dataset.i)));
      } else {
        const list = D.projects.filter((p) => f === "all" || p.category === f);
        grid.innerHTML = list.map(tileHTML).join("");
      }
    }
    const fromHash = () => { const h = (location.hash || "#all").slice(1); render(["all", "living", "commercial", "processing"].includes(h) ? h : "all"); };
    window.addEventListener("hashchange", fromHash); fromHash();
  }
  $$("[data-marquee]").forEach((m) => {
    const text = D.marquee[m.dataset.marquee] || m.dataset.marquee;
    const track = document.createElement("div"); track.className = "track";
    track.innerHTML = Array.from({ length: 12 }, () => `<span>${esc(text)}</span>`).join(""); m.appendChild(track);
  });

  /* ============ PROJECT 상세 ============ */
  const pj = $("[data-project]");
  if (pj) {
    const id = new URLSearchParams(location.search).get("id");
    const i = Math.max(0, D.projects.findIndex((x) => x.id === id)), p = D.projects[i];
    document.title = p.title + " — DARUDA";
    $("[data-bar-title]").innerHTML = `<b>${esc(p.title)}</b> &nbsp;·&nbsp; ${esc(p.category)}`;
    const all = [p.main].concat(p.subs.map((s) => s.src));
    $(".proj-hero", pj).innerHTML = `<button type="button"><img src="${p.main}" alt="${esc(p.title)}"></button>`;
    $(".proj-hero button", pj).onclick = () => LB.open(all, 0);
    $(".proj-body", pj).innerHTML = `<div><h1>${esc(p.title)}</h1><p class="desc">${esc(p.desc || "")}</p></div>
      <dl class="meta"><dt>Project</dt><dd>${esc(p.title)}</dd><dt>Category</dt><dd>${esc(p.category)} · ${esc(p.field)}</dd><dt>Completion year</dt><dd>${p.year}</dd><dt>Location</dt><dd>${esc(p.location)}</dd><dt>Area</dt><dd>${esc(p.area)}</dd><dt>Use</dt><dd>${esc(p.use)}</dd>${p.materials ? `<dt>Materials</dt><dd>${esc(p.materials)}</dd>` : ""}${p.photography ? `<dt>Photography</dt><dd>${esc(p.photography)}</dd>` : ""}</dl>`;
    $(".subs", pj).innerHTML = p.subs.map((s, k) => `<button type="button" class="${s.shape || "landscape"}" data-i="${k + 1}"><img src="${s.src}" alt="" loading="lazy"></button>`).join("");
    $$(".subs button", pj).forEach((b) => (b.onclick = () => LB.open(all, +b.dataset.i)));
    const prev = D.projects[(i - 1 + D.projects.length) % D.projects.length], next = D.projects[(i + 1) % D.projects.length];
    $(".proj-nav", pj).innerHTML = `<a href="project.html?id=${encodeURIComponent(prev.id)}">&larr; ${esc(prev.title)}</a><a href="archive.html#${esc(p.category)}">archive</a><a href="project.html?id=${encodeURIComponent(next.id)}">${esc(next.title)} &rarr;</a>`;
  }
})();
