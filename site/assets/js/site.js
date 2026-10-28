/* DARUDA site — behaviour (최종 기획안 2026-10-27) */
(function () {
  const D = window.DARUDA;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pyeong = (area) => { const m = parseFloat(String(area || "").replace(/[^\d.]/g, "")); return m ? Math.round(m / 3.3058) + "평" : ""; };

  /* ---------- 라이트박스 (← → Esc) ---------- */
  const LB = (function () {
    let list = [], idx = 0, el;
    function ensure() {
      if (el) return el;
      el = document.createElement("div");
      el.className = "lightbox";
      el.innerHTML = `<button class="lb-close" type="button" aria-label="닫기">close</button><button class="lb-prev" type="button" aria-label="이전">&larr;</button><img alt=""><button class="lb-next" type="button" aria-label="다음">&rarr;</button><div class="lb-count"></div>`;
      document.body.appendChild(el);
      $(".lb-close", el).onclick = close; $(".lb-prev", el).onclick = () => go(-1); $(".lb-next", el).onclick = () => go(1);
      el.addEventListener("click", (e) => { if (e.target === el) close(); });
      document.addEventListener("keydown", (e) => {
        if (!el.classList.contains("is-open")) return;
        if (e.key === "ArrowRight") go(1); else if (e.key === "ArrowLeft") go(-1); else if (e.key === "Escape") close();
      });
      return el;
    }
    function render() { $("img", el).src = list[idx]; $(".lb-count", el).textContent = idx + 1 + " / " + list.length; }
    function open(srcs, i) { list = srcs; idx = i || 0; ensure().classList.add("is-open"); render(); }
    function close() { el && el.classList.remove("is-open"); }
    function go(d) { idx = (idx + d + list.length) % list.length; render(); }
    return { open, close, isOpen: () => !!el && el.classList.contains("is-open") };
  })();

  /* ============ MAIN ============ */
  const main = $(".main");
  if (main) initMain();

  function initMain() {
    const c = D.company;
    $("[data-tagline]").innerHTML = `company ${esc(c.legalName)} owner ${esc(c.owner)}<br>business number ${esc(c.bizNo)}<br>${esc(c.copyright)}`;

    /* 우측 상단 네모 3개 — 카카오톡 · 인스타그램 · 블로그 */
    const ICON = {
      kakao: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5C6.75 3.5 2.5 6.86 2.5 11c0 2.66 1.76 5 4.41 6.33l-.9 3.3c-.08.3.25.53.5.36l3.94-2.6c.5.06 1.02.1 1.55.1 5.25 0 9.5-3.36 9.5-7.5S17.25 3.5 12 3.5z"/></svg>',
      instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm6-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0zM16.4 2.5H7.6A5.1 5.1 0 0 0 2.5 7.6v8.8a5.1 5.1 0 0 0 5.1 5.1h8.8a5.1 5.1 0 0 0 5.1-5.1V7.6a5.1 5.1 0 0 0-5.1-5.1zm3.4 13.9a3.4 3.4 0 0 1-3.4 3.4H7.6a3.4 3.4 0 0 1-3.4-3.4V7.6a3.4 3.4 0 0 1 3.4-3.4h8.8a3.4 3.4 0 0 1 3.4 3.4z"/></svg>',
      blog: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3h4.5v6.3A5.6 5.6 0 0 1 12.6 7.6c3.3 0 5.9 2.8 5.9 6.7S15.9 21 12.6 21a5.5 5.5 0 0 1-4.3-2v1.6H4zm8 8.2c-1.8 0-3.4 1.3-3.4 3.2s1.6 3.2 3.4 3.2 3.3-1.4 3.3-3.2-1.5-3.2-3.3-3.2z"/></svg>'
    };
    const NAMES = { kakao: "카카오톡 채널", instagram: "인스타그램", blog: "블로그" };
    const sns = c.sns || {};
    $("[data-sns]").innerHTML = ["kakao", "instagram", "blog"].map((k) => sns[k]
      ? `<a href="${esc(sns[k])}" target="_blank" rel="noopener" aria-label="${NAMES[k]}" title="${NAMES[k]}">${ICON[k]}</a>`
      : `<a class="is-empty" role="link" aria-disabled="true" aria-label="${NAMES[k]} (준비 중)" title="${NAMES[k]} (준비 중)">${ICON[k]}</a>`).join("");

    /* 슬라이드 — 3초 간격, 왼쪽에서 오른쪽으로 */
    const slidesEl = $(".slides", main);
    const slides = D.slides.slice(0, 10);
    const nodes = slides.map((s) => {
      const n = document.createElement("div");
      n.className = "slide";
      n.innerHTML = `<div class="slide-img" style="background-image:url('${s.src}')"></div>`;
      slidesEl.appendChild(n);
      return n;
    });
    let cur = 0;
    const lumCache = {};
    function luminance(src) {
      if (lumCache[src]) return lumCache[src];
      return (lumCache[src] = new Promise((res) => {
        const im = new Image();
        im.onload = () => {
          try {
            const cv = document.createElement("canvas"); cv.width = 32; cv.height = 20;
            const cx = cv.getContext("2d"); cx.drawImage(im, 0, 0, 32, 20);
            const px = cx.getImageData(0, 0, 32, 20).data;
            let s = 0, n = 0;
            for (let y = 0; y < 20; y++) for (let x = 0; x < 32; x++) {
              if (!(y < 6 || y >= 17)) continue;          // 로고 · SNS 줄과 메뉴 줄만
              const o = (y * 32 + x) * 4; s += 0.2126 * px[o] + 0.7152 * px[o + 1] + 0.0722 * px[o + 2]; n++;
            }
            res(s / n / 255);
          } catch (e) { res(0.4); }
        };
        im.onerror = () => res(0.4);
        im.src = src;
      }));
    }
    async function applyUI(i) {
      const s = slides[i];
      let color = s.ui && s.ui !== "auto" ? s.ui : null;
      if (!color) color = (await luminance(s.src)) > 0.62 ? "#111111" : "#ffffff";
      main.style.setProperty("--ui-color", color);
      const hex = color.replace("#", ""), v = parseInt(hex.length === 3 ? hex.split("").map((h) => h + h).join("") : hex, 16);
      const L = (0.2126 * ((v >> 16) & 255) + 0.7152 * ((v >> 8) & 255) + 0.0722 * (v & 255)) / 255;
      main.style.setProperty("--ui-contrast", L > 0.6 ? "#111111" : "#ffffff");
    }
    function show(i) {
      const prev = nodes[cur]; cur = i;
      nodes.forEach((n) => n.classList.remove("is-leaving"));
      prev.classList.remove("is-active"); prev.classList.add("is-leaving");
      const nx = nodes[cur];
      nx.style.transition = "none"; nx.style.transform = "translateX(-100%)"; void nx.offsetWidth; nx.style.transition = ""; nx.style.transform = "";
      nx.classList.add("is-active");
      applyUI(cur);
    }
    if (nodes.length) { nodes[0].style.transition = "none"; nodes[0].classList.add("is-active"); applyUI(0); }
    if (slides.length > 1) setInterval(() => show((cur + 1) % slides.length), D.slideInterval || 3000);

    /* 오버레이 사각형 위치 — 모두 같은 크기, 메뉴 글자 선에 맞춤
       about: 'U'(= about 글자)의 왼쪽 선 / press: about의 t ~ contact의 t / archive · contact: 그 사이 */
    const items = $$(".nav-main li");
    const boxes = { about: $("#ov-about"), archive: $("#ov-archive"), press: $("#ov-press"), contact: $("#ov-contact") };
    function layoutBoxes() {
      if (innerWidth < 768) { Object.values(boxes).forEach((b) => { b.style.removeProperty("--box-left"); b.style.removeProperty("--box-w"); }); return; }
      const a = $("[data-key=about] button").getBoundingClientRect();
      const ct = $("[data-key=contact] button").getBoundingClientRect();
      const w = ct.right - a.right;
      const lefts = { about: a.left, press: a.right, center: (a.left + a.right) / 2 };
      Object.values(boxes).forEach((b) => {
        b.style.setProperty("--box-w", w + "px");
        b.style.setProperty("--box-left", lefts[b.dataset.align] + "px");
      });
    }
    layoutBoxes();
    addEventListener("resize", layoutBoxes);
    document.fonts && document.fonts.ready.then(layoutBoxes);

    /* 마우스 오버로 열림 · 클릭하면 고정 · 'U' 표시 · 배경 슬라이드는 계속 */
    let pinned = null, timer;
    function open(key) {
      Object.keys(boxes).forEach((k) => boxes[k].classList.toggle("is-open", k === key));
      items.forEach((li) => li.classList.toggle("is-on", li.dataset.key === key));
    }
    function closeAll() { pinned = null; open(null); }
    const touch = matchMedia("(hover: none)").matches;
    items.forEach((li) => {
      const key = li.dataset.key, btn = $("button", li);
      if (!touch) li.addEventListener("mouseenter", () => { clearTimeout(timer); if (!pinned) open(key); });
      btn.addEventListener("click", () => { if (pinned === key) closeAll(); else { pinned = key; open(key); } });
    });
    const leave = () => { if (!pinned) timer = setTimeout(() => open(null), 380); };
    $(".nav-main").addEventListener("mouseleave", leave);
    Object.values(boxes).forEach((b) => { b.addEventListener("mouseenter", () => clearTimeout(timer)); b.addEventListener("mouseleave", leave); });
    main.addEventListener("click", (e) => { if (pinned && !e.target.closest(".box, .nav-main, .top")) closeAll(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !LB.isOpen()) closeAll(); });

    /* about */
    $("#ov-about .about-title").textContent = D.about.title;
    $("#ov-about .about-lines").innerHTML = D.about.lines.map((l) => `<p>${esc(l)}</p>`).join("");
    const ai = $("#ov-about .about-img img");
    if (D.about.image) { ai.src = D.about.image; ai.alt = D.about.title; } else $("#ov-about .about-img").remove();

    /* archive */
    $("#ov-archive .archive-menu").innerHTML = (D.archiveMenu || []).map((m) =>
      `<a href="${esc(m.href)}"><img src="${esc(m.src)}" alt="" loading="lazy"><span>${esc(m.label)}</span></a>`).join("");

    /* press — 최신순, 연도 위 · 커버 아래, 클릭 시 오른쪽 사분면 */
    const pl = $("#ov-press .press-list"), pd = $("#ov-press .press-detail");
    pl.innerHTML = D.press.map((p, i) => `<div class="press-item" data-i="${i}"><span class="date">${esc(p.date)}</span><button type="button" aria-label="${esc(p.title)} ${esc(p.date)}"><img src="${esc(p.cover)}" alt="" loading="lazy"></button></div>`).join("");
    function showMag(i) {
      $$(".press-item", pl).forEach((x, k) => x.classList.toggle("is-selected", k === i));
      const p = D.press[i], pg = p.pages.slice(0, 4);
      pd.innerHTML = `<p class="ttl">${esc(p.title)} · ${esc(p.date)}${p.issue ? " · " + esc(p.issue) : ""}</p>
        <div class="quad">${pg.map((s, k) => `<button type="button" data-k="${k}"><img src="${esc(s)}" alt="" loading="lazy"></button>`).join("")}</div>
        ${p.pdf ? `<a class="pdf" href="${esc(p.pdf)}" target="_blank" rel="noopener">PDF 보기</a>` : ""}`;
      $$(".quad button", pd).forEach((b) => (b.onclick = () => LB.open(p.pages, +b.dataset.k)));
    }
    $$(".press-item", pl).forEach((it) => ($("button", it).onclick = () => showMag(+it.dataset.i)));
    if (D.press.length) showMag(0);

    /* contact — consult 양식 · 개인정보 안내 · 하단 이메일 · 전화 · 주소 */
    const C = window.DARUDA_CONSULT;
    const form = $("#ov-contact .consult-form");
    const req = (f) => (f.required ? '<span class="req" aria-label="필수">•</span>' : "");
    form.innerHTML = `<label class="agree"><input type="checkbox" name="agree"> ${esc(C.agreeLabel)}<span class="req">•</span></label>` +
      C.fields.map((f) => {
        const id = "cf-" + f.name;
        if (f.type === "tel3") return `<div class="field"><label for="${id}1">${esc(f.label)}${req(f)}</label><div class="tel3"><input type="tel" id="${id}1" name="${f.name}1" maxlength="4" inputmode="numeric">-<input type="tel" name="${f.name}2" maxlength="4" inputmode="numeric" aria-label="연락처 가운데">-<input type="tel" name="${f.name}3" maxlength="4" inputmode="numeric" aria-label="연락처 끝"></div></div>`;
        if (f.type === "textarea") return `<div class="field full"><label for="${id}">${esc(f.label)}${req(f)}</label><textarea id="${id}" name="${f.name}"></textarea></div>`;
        if (f.type === "file") return `<div class="field"><label for="${id}">${esc(f.label)}</label><input type="file" id="${id}" name="${f.name}" accept="image/*,.pdf"></div>`;
        return `<div class="field"><label for="${id}">${esc(f.label)}${req(f)}</label><input type="${f.type === "date" ? "date" : "text"}" id="${id}" name="${f.name}"></div>`;
      }).join("") +
      `<div class="actions"><span class="done" aria-live="polite"></span><button class="submit" type="submit">${esc(C.submitLabel)}</button></div>`;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const done = $(".done", form);
      if (!form.agree.checked) { done.textContent = "개인정보 수집 및 이용에 동의해 주세요."; return; }
      const missing = C.fields.filter((f) => f.required && (f.type === "tel3" ? ![1, 2, 3].every((k) => form[f.name + k].value.trim()) : !form[f.name].value.trim()));
      if (missing.length) { done.textContent = missing[0].label.split(" (")[0] + " 항목을 입력해 주세요."; return; }
      const data = { at: new Date().toISOString() };
      C.fields.forEach((f) => { if (f.type === "tel3") data[f.name] = [1, 2, 3].map((k) => form[f.name + k].value.trim()).join("-"); else if (f.type === "file") data[f.name] = form[f.name].files[0] ? form[f.name].files[0].name : ""; else data[f.name] = form[f.name].value.trim(); });
      try { const box = JSON.parse(localStorage.getItem("daruda:inquiries") || "[]"); box.unshift(data); localStorage.setItem("daruda:inquiries", JSON.stringify(box)); } catch (err) {}
      /* CMS 단계: 서버로 전송 · 담당자 메일 알림 */
      form.reset(); done.textContent = "접수되었습니다. 2-3일 내로 안내 전화 드리겠습니다.";
    });
    $("#ov-contact .privacy-title").textContent = C.privacyTitle;
    $("#ov-contact .privacy-body").textContent = C.privacy;
    $("#ov-contact .contact-info").innerHTML =
      `<span><b>Inquire</b><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></span>` +
      `<span><b>Tel.</b>${c.tels.map((t) => `<a href="tel:${t.replace(/\s/g, "")}">${esc(t)}</a>`).join(" / ")}</span>` +
      `<span><a href="${esc(c.naverMap)}" target="_blank" rel="noopener" title="${esc(c.addressKo)} · 네이버 지도">${esc(c.addressEn)}</a></span>`;
  }

  /* ============ process — 4 × 2 ============ */
  const gp = $(".grid-proc");
  if (gp) {
    const list = D.processing.slice(0, 8);
    gp.innerHTML = list.map((p, i) => `<button type="button" data-i="${i}" aria-label="${esc(p.caption || "진행 중 작업 " + (i + 1))}"><img src="${esc(p.src)}" alt="" loading="lazy"></button>`).join("");
    const srcs = list.map((p) => p.src);
    $$("button", gp).forEach((b) => (b.onclick = () => LB.open(srcs, +b.dataset.i)));
  }

  /* ============ Living · Commercial ============ */
  const gw = $(".grid-works");
  if (gw) {
    const cat = gw.dataset.works;
    const list = D.projects.filter((p) => p.category === cat);
    gw.innerHTML = list.length ? list.map((p) => {
      const sub = cat === "living" ? [p.area, pyeong(p.area)].filter(Boolean).join(" · ") : [p.use, p.area].filter(Boolean).join(" · ");
      return `<a class="work" href="project.html?id=${encodeURIComponent(p.id)}"><img src="${esc(p.cover)}" alt="" loading="lazy"><div class="cap"><b>${esc(p.title)}</b><span>${esc(sub)}</span></div></a>`;
    }).join("") : `<p class="empty">등록된 프로젝트가 없습니다.</p>`;
  }

  /* ============ 프로젝트 상세 ============ */
  const pj = $(".project");
  if (pj) {
    const id = new URLSearchParams(location.search).get("id");
    const p = D.projects.find((x) => x.id === id) || D.projects[0];
    document.title = p.title + " — DARUDA";
    const label = p.category === "living" ? "Living" : "Commercial";
    $("[data-cat]").innerHTML = `<a href="${p.category}.html">${label}</a>`;
    const subs = p.subs.slice(0, 20);
    const all = [p.main].concat(subs.map((s) => s.src));
    $(".project-main", pj).innerHTML = `<button type="button" aria-label="크게 보기"><img src="${esc(p.main)}" alt="${esc(p.title)}"></button>
      <h2>${esc(p.title)}</h2>
      <div class="project-meta"><div><span>location :</span>${esc(p.location)}</div><div><span>area :</span>${esc(p.area)}</div><div><span>use :</span>${esc(p.use)}</div></div>
      ${p.desc ? `<p class="project-desc">${esc(p.desc)}</p>` : ""}`;
    $(".project-main button", pj).onclick = () => LB.open(all, 0);
    $(".project-subs", pj).innerHTML = subs.map((s, i) => `<button type="button" class="${esc(s.shape || "landscape")}" data-i="${i + 1}" aria-label="사진 ${i + 1} 크게 보기"><img src="${esc(s.src)}" alt="" loading="lazy"></button>`).join("");
    $$(".project-subs button", pj).forEach((b) => (b.onclick = () => LB.open(all, +b.dataset.i)));
  }
})();
