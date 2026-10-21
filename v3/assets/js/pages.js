/* DARUDA v3 — about / press / contact 페이지 (다크 테마, v2 로직 이식) */
(function () {
  const D = window.DARUDA;
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const c = D.company;
  $$("[data-foot]").forEach((el) => (el.innerHTML = `<div><b>DARUDA</b>${esc(c.legalName)} · owner ${esc(c.owner)} · business number ${esc(c.bizNo)}<br>${esc(c.addressKo)} · ${esc(c.tels[0])} · ${esc(c.email)}</div><div>${esc(c.copyright)}<br>@${esc(c.instagram)}</div>`));

  /* 커서 */
  const cursor = $("#cursor");
  if (cursor && !matchMedia("(hover: none)").matches) {
    const halo = $(".cursor-halo", cursor); let hx = 0, hy = 0, x = 0, y = 0;
    const hv = document.createElement("canvas"); hv.width = hv.height = 46; const hc = hv.getContext("2d");
    for (let i = 0; i < 900; i++) { const a = Math.random() * 6.283, r = Math.pow(Math.random(), .5) * 22; hc.fillStyle = `rgba(255,255,255,${.25 + Math.random() * .5})`; hc.fillRect(23 + Math.cos(a) * r, 23 + Math.sin(a) * r, 1, 1); }
    halo.style.backgroundImage = `url(${hv.toDataURL()})`;
    window.addEventListener("pointermove", (e) => { x = e.clientX; y = e.clientY; cursor.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`; }, { passive: true });
    (function loop() { requestAnimationFrame(loop); hx += (x - hx) * .14; hy += (y - hy) * .14; halo.style.transform = `translate(${hx - x}px,${hy - y}px) translate(-50%,-50%)`; })();
  }
  /* 그레인 */
  const g = $("#grain"); if (g) { const cv = document.createElement("canvas"); cv.width = cv.height = 220; const cx = cv.getContext("2d"); const im = cx.createImageData(220, 220); for (let i = 0; i < im.data.length; i += 4) { const v = 120 + Math.random() * 135; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } cx.putImageData(im, 0, 0); g.style.backgroundImage = `url(${cv.toDataURL()})`; }
  /* 메뉴 */
  const menu = $("#menu"); if (menu) { $("#menuBtn").onclick = () => menu.classList.add("is-open"); $("#menuClose").onclick = () => menu.classList.remove("is-open"); $("#menuInfo").innerHTML = `<div>${esc(c.addressEn)}<br>${esc(c.addressKo)}</div><div>${c.tels.map(esc).join(" / ")}<br>${esc(c.email)}</div><div>@${esc(c.instagram)}<br>${esc(c.copyright)}</div>`; document.addEventListener("keydown", (e) => { if (e.key === "Escape") menu.classList.remove("is-open"); }); }

  /* about */
  const t = $(".about-title"); if (t) { t.textContent = D.about.title; $(".about-lines").innerHTML = D.about.lines.map((l) => `<p>${esc(l)}</p>`).join(""); $(".about-photos").innerHTML = D.about.photos.map((s) => `<img src="${s}" alt="">`).join(""); $(".about-services").innerHTML = D.about.services.map((s) => `<li>${esc(s)}</li>`).join(""); }

  /* press — 스프레드 뷰어 */
  const pl = $(".press-list"), pd = $(".press-detail");
  if (pl) {
    pl.innerHTML = D.press.map((p, i) => `<div class="press-item" data-i="${i}"><span class="date">${esc(p.date)}</span><button type="button"><img src="${p.cover}" alt="${esc(p.title)}"><span class="ttl">${esc(p.title)}</span></button></div>`).join("");
    function showMag(i) {
      $$(".press-item", pl).forEach((x, k) => x.classList.toggle("is-selected", k === i));
      const p = D.press[i], pg = p.pages; let cur = 0;
      pd.innerHTML = `<div class="spread-viewer"><div class="sv-head"><div><b>${esc(p.title)}</b><span>${esc(p.date)}${p.issue ? " · " + esc(p.issue) : ""} · ${p.source === "pdf" ? "PDF 원본" : "스캔본"}</span></div>${p.pdf ? `<a class="sv-pdf" href="${p.pdf}" target="_blank" rel="noopener">PDF로 보기 (${pg.length + 1}쪽)</a>` : ""}</div>
        <div class="sv-stage"><button type="button" class="sv-prev" aria-label="이전 면">&larr;</button><a class="sv-img" href="${pg[0]}" target="_blank" rel="noopener"><img src="${pg[0]}" alt=""></a><button type="button" class="sv-next" aria-label="다음 면">&rarr;</button></div>
        <div class="sv-count"></div><div class="sv-thumbs">${pg.map((s, k) => `<button type="button" data-k="${k}"><img src="${s}" alt="" loading="lazy"></button>`).join("")}</div></div>`;
      const img = $(".sv-img img", pd), lnk = $(".sv-img", pd), cnt = $(".sv-count", pd), th = $$(".sv-thumbs button", pd);
      const go = (k) => { cur = (k + pg.length) % pg.length; img.src = pg[cur]; lnk.href = pg[cur]; cnt.textContent = `펼침면 ${cur + 1} / ${pg.length}`; th.forEach((b, j) => b.classList.toggle("is-on", j === cur)); };
      $(".sv-prev", pd).onclick = () => go(cur - 1); $(".sv-next", pd).onclick = () => go(cur + 1); th.forEach((b) => (b.onclick = () => go(+b.dataset.k))); go(0);
    }
    $$(".press-item", pl).forEach((it) => ($("button", it).onclick = () => showMag(+it.dataset.i))); showMag(0);
  }

  /* contact */
  const info = $(".contact-info");
  if (info) {
    info.innerHTML = `<dl><dt>Inquire</dt><dd><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></dd><dt>SNS</dt><dd><a href="https://instagram.com/${esc(c.instagram)}" target="_blank" rel="noopener">@${esc(c.instagram)}</a></dd><dt>Tel.</dt><dd>${c.tels.map((x) => `<a href="tel:${x.replace(/\s/g, "")}">${esc(x)}</a>`).join(" / ")}</dd><dt>Address</dt><dd><a href="${c.naverMap}" target="_blank" rel="noopener">${esc(c.addressEn)}</a><br><span style="font-size:13px;color:#8a8a8a">${esc(c.addressKo)} · 네이버 지도</span></dd></dl>`;
    const form = $("form");
    form.addEventListener("submit", (e) => { e.preventDefault(); const data = { name: form.name.value.trim(), phone: form.phone.value.trim(), message: form.message.value.trim(), at: new Date().toISOString() }; if (!data.name || !data.phone) { $(".done", form).textContent = "성함과 연락처를 입력해 주세요."; return; } const box = JSON.parse(localStorage.getItem("daruda:inquiries") || "[]"); box.unshift(data); localStorage.setItem("daruda:inquiries", JSON.stringify(box)); form.reset(); $(".done", form).textContent = "전송되었습니다. 확인 후 연락드리겠습니다."; });
  }
})();
