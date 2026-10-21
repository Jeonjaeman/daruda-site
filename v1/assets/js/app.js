/* DARUDA v1 — behaviour */
(function () {
  const D = window.DARUDA;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- 공통: 로고 옆 고정 텍스트 ---------- */
  function taglineHTML() {
    const c = D.company;
    return `company ${esc(c.legalName)} owner ${esc(c.owner)}<br>business number ${esc(c.bizNo)}<br>${esc(c.copyright)}`;
  }
  $$("[data-tagline]").forEach((el) => (el.innerHTML = taglineHTML()));

  /* ---------- 공통: 라이트박스 (키보드 ← → Esc) ---------- */
  const LB = (function () {
    let list = [], idx = 0, el;
    function ensure() {
      if (el) return el;
      el = document.createElement("div");
      el.className = "lightbox";
      el.innerHTML = `<button class="lb-close" aria-label="close">close</button>
        <button class="lb-prev" aria-label="previous">&larr;</button>
        <img alt="">
        <button class="lb-next" aria-label="next">&rarr;</button>
        <div class="lb-count"></div>`;
      document.body.appendChild(el);
      $(".lb-close", el).onclick = close;
      $(".lb-prev", el).onclick = () => go(-1);
      $(".lb-next", el).onclick = () => go(1);
      el.addEventListener("click", (e) => { if (e.target === el) close(); });
      document.addEventListener("keydown", (e) => {
        if (!el.classList.contains("is-open")) return;
        if (e.key === "ArrowRight") go(1);
        else if (e.key === "ArrowLeft") go(-1);
        else if (e.key === "Escape") close();
      });
      return el;
    }
    function render() { $("img", el).src = list[idx]; $(".lb-count", el).textContent = (idx + 1) + " / " + list.length; }
    function open(srcs, i) { list = srcs; idx = i || 0; ensure().classList.add("is-open"); render(); }
    function close() { el && el.classList.remove("is-open"); }
    function go(d) { idx = (idx + d + list.length) % list.length; render(); }
    return { open, close };
  })();
  window.DARUDA_LB = LB;

  /* ---------- 공통: 마퀴 ---------- */
  $$("[data-marquee]").forEach((m) => {
    const text = D.marquee[m.dataset.marquee] || m.dataset.marquee;
    const track = document.createElement("div");
    track.className = "track";
    track.innerHTML = Array.from({ length: 12 }, () => `<span>${esc(text)}</span>`).join("");
    m.appendChild(track);
  });

  /* ============ MAIN ============ */
  const main = $(".main");
  if (main) initMain();

  function initMain() {
    const slidesEl = $(".slides", main);
    const ui = $(".main-ui", main);
    const slides = D.slides.slice(0, 10);
    const nodes = slides.map((s, i) => {
      const n = document.createElement("div");
      n.className = "slide";
      n.innerHTML = `<div class="slide-img" style="background-image:url('${s.src}')"></div>`;
      slidesEl.appendChild(n);
      return n;
    });
    let cur = 0;

    /* 이미지 밝기 감지 → 로고/메뉴 색. 관리자가 색을 지정했으면 그 색 우선 */
    const lumCache = {};
    function luminance(src) {
      if (lumCache[src]) return lumCache[src];
      lumCache[src] = new Promise((res) => {
        const im = new Image();
        im.onload = () => {
          try {
            const cv = document.createElement("canvas"); cv.width = 32; cv.height = 20;
            const cx = cv.getContext("2d"); cx.drawImage(im, 0, 0, 32, 20);
            const px = cx.getImageData(0, 0, 32, 20).data;
            // 로고 영역(좌상 40%×35%)과 메뉴 영역(하단 20%)만 평균
            let s = 0, n = 0;
            for (let y = 0; y < 20; y++) for (let x = 0; x < 32; x++) {
              const inLogo = x < 13 && y < 7, inNav = y >= 16;
              if (!inLogo && !inNav) continue;
              const o = (y * 32 + x) * 4;
              s += 0.2126 * px[o] + 0.7152 * px[o + 1] + 0.0722 * px[o + 2]; n++;
            }
            res(s / n / 255);
          } catch (e) { res(0.4); }
        };
        im.onerror = () => res(0.4);
        im.src = src;
      });
      return lumCache[src];
    }
    async function applyUI(i) {
      const s = slides[i];
      let color = s.ui && s.ui !== "auto" ? s.ui : null;
      if (!color) color = (await luminance(s.src)) > 0.6 ? "#111111" : "#ffffff";
      main.style.setProperty("--ui-color", color);
    }

    function show(i) {
      const prev = nodes[cur];
      cur = i;
      nodes.forEach((n) => n.classList.remove("is-leaving"));
      prev.classList.remove("is-active"); prev.classList.add("is-leaving");
      const nx = nodes[cur];
      nx.classList.remove("is-leaving"); nx.style.transition = "none"; nx.style.transform = "translateX(-100%)";
      void nx.offsetWidth; nx.style.transition = ""; nx.style.transform = "";
      nx.classList.add("is-active");
      applyUI(cur);
    }
    nodes[0].style.transition = "none"; nodes[0].classList.add("is-active"); applyUI(0);
    if (slides.length > 1) setInterval(() => show((cur + 1) % slides.length), D.slideInterval || 3000);

    /* 메뉴 → 오버레이 (hover 열림 / click 고정) + 'U' 마커 */
    const items = $$(".nav-main li", ui);
    const overlays = { about: $("#ov-about"), press: $("#ov-press"), contact: $("#ov-contact") };
    let pinned = null, hoverTimer;
    function openOv(key) {
      Object.keys(overlays).forEach((k) => overlays[k].classList.toggle("is-open", k === key));
      items.forEach((li) => li.classList.toggle("is-on", li.dataset.key === key));
    }
    function closeAll() { pinned = null; openOv(null); }
    items.forEach((li) => {
      const key = li.dataset.key;
      if (!overlays[key]) return;                          // archive는 링크
      const btn = $("button", li);
      li.addEventListener("mouseenter", () => { clearTimeout(hoverTimer); if (!pinned) openOv(key); });
      btn.addEventListener("click", (e) => { e.preventDefault(); if (pinned === key) closeAll(); else { pinned = key; openOv(key); } });
    });
    $(".nav-main", ui).addEventListener("mouseleave", () => { if (!pinned) hoverTimer = setTimeout(() => openOv(null), 350); });
    Object.values(overlays).forEach((ov) => {
      ov.addEventListener("mouseenter", () => clearTimeout(hoverTimer));
      ov.addEventListener("mouseleave", () => { if (!pinned) hoverTimer = setTimeout(() => openOv(null), 350); });
      ov.addEventListener("click", (e) => { if (e.target === ov) closeAll(); });
      $(".panel-close", ov).onclick = closeAll;
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(); });

    /* about */
    $("#ov-about .about-title").textContent = D.about.title;
    $("#ov-about .about-lines").innerHTML = D.about.lines.map((l) => `<p>${esc(l)}</p>`).join("");

    /* press */
    const pl = $("#ov-press .press-list"), pd = $("#ov-press .press-detail");
    pl.innerHTML = D.press.map((p, i) => `<div class="press-item" data-i="${i}"><span class="date">${esc(p.date)}</span><button type="button" aria-label="${esc(p.title)}"><img src="${p.cover}" alt="${esc(p.title)}"></button></div>`).join("");
    pd.innerHTML = `<p class="hint">커버를 클릭하면 상세 내용이 여기에 나타납니다.</p>`;
    $$(".press-item", pl).forEach((it) => $("button", it).onclick = () => {
      $$(".press-item", pl).forEach((x) => x.classList.remove("is-selected")); it.classList.add("is-selected");
      const p = D.press[+it.dataset.i];
      const pg = p.pages;
      /* 사분면 배치: 큰 1 / 작은 2 / 작은 2 / 큰 1 */
      pd.innerHTML = `<div class="quad">
        <div class="cell"><button type="button" data-k="0"><img src="${pg[0]}" alt=""></button></div>
        <div class="cell small">${[1, 2].map((k) => pg[k] ? `<button type="button" data-k="${k}"><img src="${pg[k]}" alt=""></button>` : "").join("")}</div>
        <div class="cell small">${[3, 4].map((k) => pg[k] ? `<button type="button" data-k="${k}"><img src="${pg[k]}" alt=""></button>` : "").join("")}</div>
        <div class="cell">${pg[5] ? `<button type="button" data-k="5"><img src="${pg[5]}" alt=""></button>` : ""}</div>
      </div>`;
      pd.insertAdjacentHTML("beforeend", `<div class="press-foot"><span>${esc(p.title)} · ${esc(p.date)}${p.issue ? " · " + esc(p.issue) : ""} · ${p.source === "pdf" ? "PDF 원본" : "스캔본"} · 펼침면 ${pg.length}장</span>${p.pdf ? `<a href="${p.pdf}" target="_blank" rel="noopener">PDF로 보기 (${pg.length + 1}쪽)</a>` : ""}</div>`);
      $$(".quad button", pd).forEach((b) => (b.onclick = () => LB.open(pg, +b.dataset.k)));
    });

    /* contact */
    const c = D.company;
    $("#ov-contact .contact-info").innerHTML = `<dl>
      <dt>Inquire</dt><dd><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></dd>
      <dt>SNS</dt><dd><a href="https://instagram.com/${esc(c.instagram)}" target="_blank" rel="noopener">@${esc(c.instagram)}</a></dd>
      <dt>Tel.</dt><dd>${c.tels.map((t) => `<a href="tel:${t.replace(/\s/g, "")}">${esc(t)}</a>`).join(" / ")}</dd>
      <dd class="addr"><a href="${c.naverMap}" target="_blank" rel="noopener" title="${esc(c.addressKo)}">${esc(c.addressEn)}</a></dd>
    </dl>`;
    const form = $("#ov-contact form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = { name: form.name.value.trim(), phone: form.phone.value.trim(), message: form.message.value.trim(), at: new Date().toISOString() };
      if (!data.name || !data.phone) { form.querySelector(".done").textContent = "성함과 연락처를 입력해 주세요."; return; }
      const box = JSON.parse(localStorage.getItem("daruda:inquiries") || "[]"); box.unshift(data);
      localStorage.setItem("daruda:inquiries", JSON.stringify(box));   // 실서비스에선 서버 전송
      form.reset(); form.querySelector(".done").textContent = "전송되었습니다. 확인 후 연락드리겠습니다.";
    });
  }

  /* ============ ARCHIVE (P / A) ============ */
  $$("[data-count]").forEach((el) => (el.textContent = "( " + D.counts[el.dataset.count] + " )"));

  /* ============ PROCESSING ============ */
  const gp = $(".grid-proc");
  if (gp) {
    gp.innerHTML = D.processing.map((p, i) => `<button type="button" data-i="${i}" title="${esc(p.caption || "")}"><img src="${p.src}" alt="${esc(p.caption || "")}" loading="lazy"></button>`).join("");
    const srcs = D.processing.map((p) => p.src);
    $$("button", gp).forEach((b) => (b.onclick = () => LB.open(srcs, +b.dataset.i)));
  }

  /* ============ ARCHIVING ============ */
  $$("[data-row]").forEach((row) => {
    const cat = row.dataset.row;
    const list = D.projects.filter((p) => p.category === cat);
    const track = $(".track", row);
    track.innerHTML = list.map((p) => `<a class="card" href="project.html?id=${encodeURIComponent(p.id)}">
      <div class="thumb"><img src="${p.cover}" alt="${esc(p.title)}" loading="lazy"></div>
      <div class="cap"><b>${esc(p.title)}</b><span>${p.year} / ${esc(p.field)}</span></div></a>`).join("");
    $(".next", row).onclick = () => track.scrollBy({ left: track.clientWidth * 0.8, behavior: "smooth" });
  });

  /* ============ PROJECT 상세 ============ */
  const pj = $(".project");
  if (pj) {
    const id = new URLSearchParams(location.search).get("id");
    const p = D.projects.find((x) => x.id === id) || D.projects[0];
    document.title = p.title + " — DARUDA";
    $("[data-project-title]").textContent = p.title;
    $("[data-project-cat]").textContent = p.category.toUpperCase();
    const all = [p.main].concat(p.subs.map((s) => s.src));
    $(".project-hero", pj).innerHTML = `<button type="button"><img src="${p.main}" alt="${esc(p.title)}"></button>
      <div class="project-meta"><div><span>location :</span>${esc(p.location)}</div><div><span>area :</span>${esc(p.area)}</div><div><span>use :</span>${esc(p.use)}</div></div>`;
    $(".project-hero button", pj).onclick = () => LB.open(all, 0);
    $(".project-subs", pj).innerHTML = p.subs.map((s, i) => `<button type="button" class="${s.shape || "landscape"}" data-i="${i + 1}"><img src="${s.src}" alt="" loading="lazy"></button>`).join("");
    $$(".project-subs button", pj).forEach((b) => (b.onclick = () => LB.open(all, +b.dataset.i)));
  }
})();
