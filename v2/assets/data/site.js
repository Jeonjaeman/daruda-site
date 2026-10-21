/* DARUDA v2 — 콘텐츠 데이터 (관리자 페이지가 수정하게 될 구조 그대로)
   관리자 프로토타입은 localStorage('daruda:v2')에 덮어쓴 값을 우선 사용한다. */
window.DARUDA_DEFAULT = {
  dataVersion: 2,   /* 기본 데이터가 바뀌면 올린다 — 관리자 저장본(localStorage) 버전이 다르면 무시 */
  company: {
    logo: "DARUDA",
    legalName: "주식회사 다루다",
    owner: "이○○",                 // TODO: 대표자 성함 확인
    bizNo: "789-81-01815",          // TODO: 사업자번호 확인
    copyright: "copyright (c) 2026 DARUDA All rights reserved.",
    email: "info@daruda.kr",
    instagram: "design_daruda_official",
    tels: ["041 569 8011", "010 9263 1835"],
    addressEn: "2F, 1 34GIL BULDANG, SEOBUK-GU, CHEONAN",
    addressKo: "천안시 서북구 불당34길 1, 2F",
    naverMap: "https://map.naver.com/p/search/" + encodeURIComponent("천안시 서북구 불당34길 1"),
    tagline: "A space you can feel."
  },

  about: {
    title: "DARUDA DESIGN STUDIO",
    lines: [
      "주식회사 다루다는, 일상의 다양한 영감과 새로운 시각으로 감각적인 공간과 고유한 경험을 디자인합니다.",
      "다년간 쌓아 올린 업무 경험과 경계 없는 새로운 시각, 각 전문 업체간의 협력을 통해 건축 인테리어 기획부터",
      "설계 및 시공을 비롯하여 브랜딩, 제작 가구 등 공간에서 경험할 수 있는 모든 것을 고민하고 만듭니다."
    ],
    services: ["건축·인테리어 기획", "설계", "시공", "브랜딩", "제작 가구"],
    photos: ["assets/img/main-03.jpg", "assets/img/sub-01.jpg"]
  },

  /* 메인 슬라이드 — 최대 10장. title/caption이 사진 하단에 표시됨. ui: "auto" | "#hex" */
  slides: [
    { src: "assets/img/main-01.jpg", ui: "auto", title: "haus B", caption: "불당동 주택 — 회색 대리석 아일랜드와 창가 거실", projectId: "haus-b" },
    { src: "assets/img/main-02.jpg", ui: "auto", title: "bakery T", caption: "성정동 카페 — 오크 패널과 긴 테이블", projectId: "bakery-t" },
    { src: "assets/img/main-03.jpg", ui: "auto", title: "ep.i", caption: "콘크리트와 흰 벽의 쇼룸, 의자 하나", projectId: "ep-i" },
    { src: "assets/img/main-04.jpg", ui: "#bfe3ff", title: "bar W", caption: "테라조 바닥과 황동 펜던트의 와인 바", projectId: "wine-bar" },
    { src: "assets/img/main-05.jpg", ui: "auto", title: "white kitchen", caption: "베이지 플라스터 벽의 침실", projectId: "white-kitchen" },
    { src: "assets/img/main-06.jpg", ui: "auto", title: "clinic G", caption: "트래버틴 리셉션과 간접 조명의 로비", projectId: "clinic-g" }
  ],
  slideInterval: 4000,

  press: [
    { id: "cafe24", date: "AUG. 2024", title: "CAFE & — 카페 앤", issue: "No. 98", source: "scan",
      cover: "assets/img/press/cafe24-cover.jpg", pdf: "assets/press/cafe24-2024.pdf",
      pages: ["assets/img/press/cafe24-01.jpg", "assets/img/press/cafe24-02.jpg", "assets/img/press/cafe24-03.jpg"] },
    { id: "maru24", date: "JUN. 2024", title: "마루 — MARU", issue: "No. 251", source: "scan",
      cover: "assets/img/press/maru24-cover.jpg", pdf: "assets/press/maru24-2024.pdf",
      pages: ["assets/img/press/maru24-01.jpg", "assets/img/press/maru24-02.jpg", "assets/img/press/maru24-03.jpg"] },
    { id: "casa24", date: "APR. 2024", title: "CASA LIVING", issue: "VOL. 318", source: "pdf",
      cover: "assets/img/press/casa24-cover.jpg", pdf: "assets/press/casa24-2024.pdf",
      pages: ["assets/img/press/casa24-01.jpg", "assets/img/press/casa24-02.jpg", "assets/img/press/casa24-03.jpg", "assets/img/press/casa24-04.jpg"] },
    { id: "p1", date: "FEB. 2024", title: "bob — Interior Magazine", issue: "VOL. 243", source: "pdf",
      cover: "assets/img/press/bob-cover.jpg", pdf: "assets/press/bob-2024.pdf",
      pages: ["assets/img/press/bob-01.jpg", "assets/img/press/bob-02.jpg", "assets/img/press/bob-03.jpg", "assets/img/press/bob-04.jpg", "assets/img/press/bob-05.jpg"] },
    { id: "maison24", date: "JAN. 2024", title: "MAISON — 메종", issue: "VOL. 344", source: "pdf",
      cover: "assets/img/press/maison24-cover.jpg", pdf: "assets/press/maison24-2024.pdf",
      pages: ["assets/img/press/maison24-01.jpg", "assets/img/press/maison24-02.jpg", "assets/img/press/maison24-03.jpg", "assets/img/press/maison24-04.jpg"] },
    { id: "interiors23", date: "NOV. 2023", title: "INTERIORS — 월간 인테리어", issue: "No. 446", source: "scan",
      cover: "assets/img/press/interiors23-cover.jpg", pdf: "assets/press/interiors23-2023.pdf",
      pages: ["assets/img/press/interiors23-01.jpg", "assets/img/press/interiors23-02.jpg", "assets/img/press/interiors23-03.jpg"] },
    { id: "deco23", date: "SEP. 2023", title: "DECO JOURNAL", issue: "VOL. 207", source: "pdf",
      cover: "assets/img/press/deco23-cover.jpg", pdf: "assets/press/deco23-2023.pdf",
      pages: ["assets/img/press/deco23-01.jpg", "assets/img/press/deco23-02.jpg"] },
    { id: "happy23", date: "MAY. 2023", title: "행복이 가득한 집", issue: "No. 291", source: "scan",
      cover: "assets/img/press/happy23-cover.jpg", pdf: "assets/press/happy23-2023.pdf",
      pages: ["assets/img/press/happy23-01.jpg", "assets/img/press/happy23-02.jpg", "assets/img/press/happy23-03.jpg"] },
    { id: "p2", date: "FEB. 2023", title: "전원속의 내집", issue: "No. 288", source: "scan",
      cover: "assets/img/press/house-cover.jpg", pdf: "assets/press/house-2023.pdf",
      pages: ["assets/img/press/house-01.jpg", "assets/img/press/house-02.jpg", "assets/img/press/house-03.jpg", "assets/img/press/house-04.jpg"] },
    { id: "space22", date: "DEC. 2022", title: "SPACE — 월간 공간", issue: "No. 661", source: "pdf",
      cover: "assets/img/press/space22-cover.jpg", pdf: "assets/press/space22-2022.pdf",
      pages: ["assets/img/press/space22-01.jpg", "assets/img/press/space22-02.jpg"] },
    { id: "bob22", date: "AUG. 2022", title: "bob — Interior Magazine", issue: "VOL. 225", source: "pdf",
      cover: "assets/img/press/bob22-cover.jpg", pdf: "assets/press/bob22-2022.pdf",
      pages: ["assets/img/press/bob22-01.jpg", "assets/img/press/bob22-02.jpg", "assets/img/press/bob22-03.jpg", "assets/img/press/bob22-04.jpg"] },
    { id: "house22", date: "MAR. 2022", title: "전원속의 내집", issue: "No. 277", source: "scan",
      cover: "assets/img/press/house22-cover.jpg", pdf: "assets/press/house22-2022.pdf",
      pages: ["assets/img/press/house22-01.jpg", "assets/img/press/house22-02.jpg"] }
  ],

  counts: { processing: 4, archiving: 53 },

  processing: [
    { src: "assets/img/proc-01.jpg", caption: "불당동 주택 — 철거 및 구조 보강" },
    { src: "assets/img/proc-02.jpg", caption: "마감재 샘플 검토" },
    { src: "assets/img/proc-03.jpg", caption: "제작 가구 — 오크 수납장" },
    { src: "assets/img/proc-04.jpg", caption: "성정동 카페 — 목공" },
    { src: "assets/img/sub-02.jpg", caption: "복도 조명 테스트" },
    { src: "assets/img/sub-04.jpg", caption: "아일랜드 석재 시공" },
    { src: "assets/img/sub-01.jpg", caption: "문턱 디테일" },
    { src: "assets/img/sub-03.jpg", caption: "창가 벤치 제작" }
  ],

  /* 완료 프로젝트 — category: living | commercial. main 1장 + subs 최대 20장 */
  projects: [
    { id: "ep-i", category: "commercial", title: "ep.i", year: 2026, field: "SPACE, BRANDING",
      cover: "assets/img/com-01.jpg", main: "assets/img/com-01.jpg",
      desc: "곡면 벽과 크롬 레일만으로 구성한 부티크 쇼룸. 브랜드의 첫 오프라인 공간으로, 옷이 주인공이 되도록 벽과 바닥을 한 톤으로 묶었습니다.",
      location: "Cheonan, Chungnam", area: "128㎡", use: "Boutique / Showroom", materials: "microcement, chrome, oak", photography: "DARUDA",
      subs: [
        { src: "assets/img/sub-01.jpg", shape: "portrait" }, { src: "assets/img/sub-02.jpg", shape: "landscape" },
        { src: "assets/img/sub-03.jpg", shape: "portrait" }, { src: "assets/img/sub-04.jpg", shape: "landscape" },
        { src: "assets/img/main-03.jpg", shape: "landscape" }
      ] },
    { id: "haus-b", category: "living", title: "haus B", year: 2025, field: "SPACE",
      cover: "assets/img/liv-01.jpg", main: "assets/img/main-01.jpg",
      desc: "거실과 주방을 하나의 긴 공간으로 열고, 회색 대리석 아일랜드를 중심에 둔 주택. 검정 라인 조명이 천장의 방향을 잡아 줍니다.",
      location: "Buldang-dong, Cheonan", area: "112㎡", use: "Residential", materials: "grey marble, white lacquer, oak", photography: "DARUDA",
      subs: [
        { src: "assets/img/liv-01.jpg", shape: "landscape" }, { src: "assets/img/sub-03.jpg", shape: "portrait" },
        { src: "assets/img/liv-02.jpg", shape: "landscape" }, { src: "assets/img/sub-04.jpg", shape: "landscape" },
        { src: "assets/img/sub-01.jpg", shape: "portrait" }, { src: "assets/img/liv-03.jpg", shape: "landscape" }
      ] },
    { id: "white-kitchen", category: "living", title: "white kitchen", year: 2025, field: "SPACE, FURNITURE",
      cover: "assets/img/liv-02.jpg", main: "assets/img/liv-02.jpg",
      desc: "스테인리스 상판과 흰 타일로 정리한 주방. 수납장은 손잡이 없이 제작해 면을 비웠습니다.",
      location: "Asan, Chungnam", area: "84㎡", use: "Residential", materials: "stainless steel, white tile", photography: "DARUDA",
      subs: [ { src: "assets/img/sub-04.jpg", shape: "landscape" }, { src: "assets/img/sub-01.jpg", shape: "portrait" }, { src: "assets/img/main-05.jpg", shape: "landscape" } ] },
    { id: "bath-mc", category: "living", title: "microcement bath", year: 2024, field: "SPACE",
      cover: "assets/img/liv-03.jpg", main: "assets/img/liv-03.jpg",
      desc: "베이지 마이크로시멘트로 벽과 바닥을 이은 욕실. 둥근 거울 하나가 유일한 장식입니다.",
      location: "Cheonan, Chungnam", area: "9㎡", use: "Residential", materials: "microcement, brass", photography: "DARUDA",
      subs: [ { src: "assets/img/sub-03.jpg", shape: "portrait" }, { src: "assets/img/sub-02.jpg", shape: "landscape" } ] },
    { id: "kids-room", category: "living", title: "kids room", year: 2024, field: "SPACE, FURNITURE",
      cover: "assets/img/liv-04.jpg", main: "assets/img/liv-04.jpg",
      desc: "연한 원목 가구와 부드러운 커튼으로 꾸민 아이 방. 가구는 아이 키에 맞춰 제작했습니다.",
      location: "Sejong", area: "16㎡", use: "Residential", materials: "birch plywood, linen", photography: "DARUDA",
      subs: [ { src: "assets/img/sub-01.jpg", shape: "portrait" }, { src: "assets/img/liv-01.jpg", shape: "landscape" } ] },
    { id: "bakery-t", category: "commercial", title: "bakery T", year: 2025, field: "SPACE, BRANDING",
      cover: "assets/img/com-02.jpg", main: "assets/img/com-02.jpg",
      desc: "테라조 카운터와 따뜻한 펜던트 조명의 작은 베이커리. 간판과 패키지까지 함께 디자인했습니다.",
      location: "Seongjeong-dong, Cheonan", area: "76㎡", use: "Cafe / Bakery", materials: "terrazzo, oak, brass", photography: "DARUDA",
      subs: [ { src: "assets/img/main-02.jpg", shape: "landscape" }, { src: "assets/img/sub-03.jpg", shape: "portrait" }, { src: "assets/img/sub-02.jpg", shape: "landscape" } ] },
    { id: "clinic-g", category: "commercial", title: "clinic G", year: 2024, field: "SPACE",
      cover: "assets/img/com-03.jpg", main: "assets/img/com-03.jpg",
      desc: "연한 녹색 벽과 오크 조이너리로 긴장을 덜어낸 치과 리셉션.",
      location: "Cheonan, Chungnam", area: "210㎡", use: "Dental Clinic", materials: "oak veneer, sage paint", photography: "DARUDA",
      subs: [ { src: "assets/img/sub-02.jpg", shape: "landscape" }, { src: "assets/img/sub-01.jpg", shape: "portrait" }, { src: "assets/img/main-06.jpg", shape: "landscape" } ] },
    { id: "wine-bar", category: "commercial", title: "bar W", year: 2024, field: "SPACE, FURNITURE",
      cover: "assets/img/com-04.jpg", main: "assets/img/com-04.jpg",
      desc: "짙은 월넛 선반과 석재 바 상판의 와인 바. 바 의자와 선반을 제작했습니다.",
      location: "Cheonan, Chungnam", area: "64㎡", use: "Wine Bar", materials: "walnut, basalt, brass", photography: "DARUDA",
      subs: [ { src: "assets/img/main-04.jpg", shape: "landscape" }, { src: "assets/img/sub-03.jpg", shape: "portrait" } ] }
  ],

  marquee: { processing: "THIS IS WHAT WE'RE MAKING" }
};

window.DARUDA = (function () {
  try {
    const saved = JSON.parse(localStorage.getItem("daruda:v2") || "null");
    if (saved && typeof saved === "object" && saved.dataVersion === window.DARUDA_DEFAULT.dataVersion) return Object.assign({}, window.DARUDA_DEFAULT, saved);
  } catch (e) {}
  return window.DARUDA_DEFAULT;
})();
