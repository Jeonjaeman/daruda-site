/* DARUDA v1 — 콘텐츠 데이터 (관리자 페이지가 수정하게 될 구조 그대로)
   이미지 경로는 assets/img/ 기준. 관리자 프로토타입은 localStorage('daruda:v1')에 덮어쓴 값을 우선 사용한다. */
window.DARUDA_DEFAULT = {
  dataVersion: 3,   /* 기본 데이터가 바뀌면 올린다 — 관리자 저장본(localStorage) 버전이 다르면 무시 */
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
    naverMap: "https://map.naver.com/p/search/" + encodeURIComponent("천안시 서북구 불당34길 1")
  },

  about: {
    title: "DARUDA DESIGN STUDIO",
    lines: [
      "주식회사 다루다는, 일상의 다양한 영감과 새로운 시각으로 감각적인 공간과 고유한 경험을 디자인합니다.",
      "다년간 쌓아 올린 업무 경험과 경계 없는 새로운 시각, 각 전문 업체간의 협력을 통해 건축 인테리어 기획부터",
      "설계 및 시공을 비롯하여 브랜딩, 제작 가구 등 공간에서 경험할 수 있는 모든 것을 고민하고 만듭니다."
    ]
  },

  /* 메인 슬라이드 — 최대 10장. ui: "auto" | "#hex" (관리자에서 이미지별 로고·메뉴 색 지정 가능) */
  slides: [
    { src: "assets/img/main-01.jpg", ui: "auto", alt: "Living room" },
    { src: "assets/img/main-02.jpg", ui: "auto", alt: "Cafe" },
    { src: "assets/img/main-03.jpg", ui: "auto", alt: "Showroom" },
    { src: "assets/img/main-04.jpg", ui: "#bfe3ff", alt: "Restaurant" },
    { src: "assets/img/main-05.jpg", ui: "auto", alt: "Bedroom" },
    { src: "assets/img/main-06.jpg", ui: "auto", alt: "Lobby" },
    { src: "assets/img/main-07.jpg", ui: "auto", alt: "Stair house" },
    { src: "assets/img/main-08.jpg", ui: "auto", alt: "Salon" },
    { src: "assets/img/main-09.jpg", ui: "auto", alt: "Cafe" },
    { src: "assets/img/main-10.jpg", ui: "auto", alt: "Tea room" }
  ],
  slideInterval: 3000,

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

  counts: { processing: 8, archiving: 106 },

  processing: [
    { src: "assets/img/proc-01.jpg", caption: "불당동 주택 — 철거 및 구조 보강" },
    { src: "assets/img/proc-02.jpg", caption: "마감재 샘플 검토" },
    { src: "assets/img/proc-03.jpg", caption: "제작 가구 — 오크 수납장" },
    { src: "assets/img/proc-04.jpg", caption: "성정동 카페 — 목공" },
    { src: "assets/img/sub-02.jpg", caption: "복도 조명 테스트" },
    { src: "assets/img/sub-04.jpg", caption: "아일랜드 석재 시공" },
    { src: "assets/img/sub-01.jpg", caption: "문턱 디테일" },
    { src: "assets/img/sub-03.jpg", caption: "창가 벤치 제작" },
    { src: "assets/img/proc-05.jpg", caption: "두정동 살롱 — 곡면 벽 미장" },
    { src: "assets/img/proc-06.jpg", caption: "도면 검토와 마감재 선정" },
    { src: "assets/img/proc-07.jpg", caption: "제작 가구 — 오크 캐비닛 조립" },
    { src: "assets/img/proc-08.jpg", caption: "타일 나누기 시공" },
    { src: "assets/img/sub-06.jpg", caption: "계단 난간 디테일" },
    { src: "assets/img/sub-08.jpg", caption: "테라조 카운터 모서리" },
    { src: "assets/img/sub-09.jpg", caption: "복도 간접 조명 점검" },
    { src: "assets/img/sub-10.jpg", caption: "리셉션 상판 시공" }
  ],

  /* 완료 프로젝트 — category: living | commercial. main 1장 + subs 최대 20장. subs의 shape는 관리자에서 레이아웃 변경용 (landscape|portrait) */
  projects: [
    { id: "ep-i", category: "commercial", title: "ep.i", year: 2026, field: "SPACE, BRANDING",
      cover: "assets/img/com-01.jpg", main: "assets/img/com-01.jpg",
      location: "Cheonan, Chungnam", area: "128㎡", use: "Boutique / Showroom",
      subs: [
        { src: "assets/img/sub-01.jpg", shape: "portrait" }, { src: "assets/img/sub-02.jpg", shape: "landscape" },
        { src: "assets/img/sub-03.jpg", shape: "portrait" }, { src: "assets/img/sub-04.jpg", shape: "landscape" },
        { src: "assets/img/main-03.jpg", shape: "landscape" }
      ] },
    { id: "haus-b", category: "living", title: "haus B", year: 2025, field: "SPACE",
      cover: "assets/img/liv-01.jpg", main: "assets/img/main-01.jpg",
      location: "Buldang-dong, Cheonan", area: "112㎡", use: "Residential",
      subs: [
        { src: "assets/img/liv-01.jpg", shape: "landscape" }, { src: "assets/img/sub-03.jpg", shape: "portrait" },
        { src: "assets/img/liv-02.jpg", shape: "landscape" }, { src: "assets/img/sub-04.jpg", shape: "landscape" },
        { src: "assets/img/sub-01.jpg", shape: "portrait" }, { src: "assets/img/liv-03.jpg", shape: "landscape" }
      ] },
    { id: "white-kitchen", category: "living", title: "white kitchen", year: 2025, field: "SPACE, FURNITURE",
      cover: "assets/img/liv-02.jpg", main: "assets/img/liv-02.jpg",
      location: "Asan, Chungnam", area: "84㎡", use: "Residential",
      subs: [ { src: "assets/img/sub-04.jpg", shape: "landscape" }, { src: "assets/img/sub-01.jpg", shape: "portrait" }, { src: "assets/img/main-05.jpg", shape: "landscape" } ] },
    { id: "bath-mc", category: "living", title: "microcement bath", year: 2024, field: "SPACE",
      cover: "assets/img/liv-03.jpg", main: "assets/img/liv-03.jpg",
      location: "Cheonan, Chungnam", area: "9㎡", use: "Residential",
      subs: [ { src: "assets/img/sub-03.jpg", shape: "portrait" }, { src: "assets/img/sub-02.jpg", shape: "landscape" } ] },
    { id: "kids-room", category: "living", title: "kids room", year: 2024, field: "SPACE, FURNITURE",
      cover: "assets/img/liv-04.jpg", main: "assets/img/liv-04.jpg",
      location: "Sejong", area: "16㎡", use: "Residential",
      subs: [ { src: "assets/img/sub-01.jpg", shape: "portrait" }, { src: "assets/img/liv-01.jpg", shape: "landscape" } ] },
    { id: "bakery-t", category: "commercial", title: "bakery T", year: 2025, field: "SPACE, BRANDING",
      cover: "assets/img/com-02.jpg", main: "assets/img/com-02.jpg",
      location: "Seongjeong-dong, Cheonan", area: "76㎡", use: "Cafe / Bakery",
      subs: [ { src: "assets/img/main-02.jpg", shape: "landscape" }, { src: "assets/img/sub-03.jpg", shape: "portrait" }, { src: "assets/img/sub-02.jpg", shape: "landscape" } ] },
    { id: "clinic-g", category: "commercial", title: "clinic G", year: 2024, field: "SPACE",
      cover: "assets/img/com-03.jpg", main: "assets/img/com-03.jpg",
      location: "Cheonan, Chungnam", area: "210㎡", use: "Dental Clinic",
      subs: [ { src: "assets/img/sub-02.jpg", shape: "landscape" }, { src: "assets/img/sub-01.jpg", shape: "portrait" }, { src: "assets/img/main-06.jpg", shape: "landscape" } ] },
    { id: "wine-bar", category: "commercial", title: "bar W", year: 2024, field: "SPACE, FURNITURE",
      cover: "assets/img/com-04.jpg", main: "assets/img/com-04.jpg",
      location: "Cheonan, Chungnam", area: "64㎡", use: "Wine Bar",
      subs: [ { src: "assets/img/main-04.jpg", shape: "landscape" }, { src: "assets/img/sub-03.jpg", shape: "portrait" } ] },
    { id: "stair-house", category: "living", title: "stair house", year: 2026, field: "SPACE, FURNITURE",
      cover: "assets/img/main-07.jpg", main: "assets/img/main-07.jpg",
      desc: "2층 높이의 거실에 오크 계단을 띄운 단독주택. 계단참의 작은 창이 하루의 빛을 거실로 끌어들입니다.",
      location: "Sejong", area: "168㎡", use: "Residential", materials: "oak, white plaster, black steel", photography: "DARUDA",
      subs: [ { src: "assets/img/sub-06.jpg", shape: "portrait" }, { src: "assets/img/sub-11.jpg", shape: "landscape" }, { src: "assets/img/sub-07.jpg", shape: "portrait" }, { src: "assets/img/liv-05.jpg", shape: "landscape" } ] },
    { id: "attic-bed", category: "living", title: "attic bedroom", year: 2025, field: "SPACE",
      cover: "assets/img/liv-05.jpg", main: "assets/img/liv-05.jpg",
      desc: "경사 천장을 흰색으로 비우고 낮은 평상 침대만 둔 다락 침실. 바닥의 오크가 유일한 색입니다.",
      location: "Cheonan, Chungnam", area: "22㎡", use: "Residential", materials: "oak, white paint, linen", photography: "DARUDA",
      subs: [ { src: "assets/img/sub-07.jpg", shape: "portrait" }, { src: "assets/img/sub-11.jpg", shape: "landscape" } ] },
    { id: "green-kitchen", category: "living", title: "green kitchen", year: 2024, field: "SPACE, FURNITURE",
      cover: "assets/img/liv-08.jpg", main: "assets/img/liv-08.jpg",
      desc: "짙은 녹색 아일랜드와 황동 펜던트로 중심을 잡은 주방·식당. 상부장은 두지 않았습니다.",
      location: "Cheonan, Chungnam", area: "38㎡", use: "Residential", materials: "green lacquer, brass, oak", photography: "DARUDA",
      subs: [ { src: "assets/img/sub-08.jpg", shape: "portrait" }, { src: "assets/img/sub-12.jpg", shape: "landscape" }, { src: "assets/img/sub-09.jpg", shape: "landscape" } ] },
    { id: "salon-a", category: "commercial", title: "salon A", year: 2026, field: "SPACE, BRANDING",
      cover: "assets/img/main-08.jpg", main: "assets/img/main-08.jpg",
      desc: "아치형 거울과 베이지 플라스터 벽의 헤어살롱. 테라조 바닥과 간판 서체를 한 규칙으로 맞췄습니다.",
      location: "Dujeong-dong, Cheonan", area: "96㎡", use: "Hair Salon", materials: "plaster, terrazzo, brass", photography: "DARUDA",
      subs: [ { src: "assets/img/sub-08.jpg", shape: "portrait" }, { src: "assets/img/sub-09.jpg", shape: "landscape" }, { src: "assets/img/sub-07.jpg", shape: "portrait" } ] },
    { id: "cafe-s", category: "commercial", title: "cafe S", year: 2025, field: "SPACE",
      cover: "assets/img/main-09.jpg", main: "assets/img/main-09.jpg",
      desc: "천창 아래 긴 석재 카운터 하나로 정리한 콘크리트 카페. 가구는 벤치 하나와 스툴뿐입니다.",
      location: "Seongjeong-dong, Cheonan", area: "88㎡", use: "Cafe", materials: "concrete, basalt, oak", photography: "DARUDA",
      subs: [ { src: "assets/img/sub-10.jpg", shape: "landscape" }, { src: "assets/img/sub-11.jpg", shape: "landscape" }, { src: "assets/img/sub-06.jpg", shape: "portrait" } ] },
    { id: "tea-room", category: "commercial", title: "tea room", year: 2025, field: "SPACE, FURNITURE",
      cover: "assets/img/main-10.jpg", main: "assets/img/main-10.jpg",
      desc: "다다미와 장지문, 짙은 목재로 구성한 찻집. 좌탁과 선반을 제작했습니다.",
      location: "Gongju, Chungnam", area: "54㎡", use: "Tea House", materials: "dark timber, tatami, washi", photography: "DARUDA",
      subs: [ { src: "assets/img/sub-12.jpg", shape: "landscape" }, { src: "assets/img/sub-05.jpg", shape: "portrait" } ] },
    { id: "eyewear-n", category: "commercial", title: "eyewear N", year: 2024, field: "SPACE, BRANDING",
      cover: "assets/img/com-05.jpg", main: "assets/img/com-05.jpg",
      desc: "흰 벽감 진열과 트래버틴 카운터의 안경 매장. 안경 한 개씩만 놓이는 진열 간격을 먼저 정했습니다.",
      location: "Cheonan, Chungnam", area: "42㎡", use: "Eyewear Shop", materials: "travertine, white lacquer", photography: "DARUDA",
      subs: [ { src: "assets/img/sub-10.jpg", shape: "landscape" }, { src: "assets/img/sub-05.jpg", shape: "portrait" } ] },
    { id: "hotel-r", category: "commercial", title: "hotel R", year: 2023, field: "SPACE, FURNITURE",
      cover: "assets/img/com-08.jpg", main: "assets/img/com-08.jpg",
      desc: "곡면 플라스터 벽과 석재 바닥, 펜던트 하나의 부티크 호텔 로비. 리셉션 데스크를 제작했습니다.",
      location: "Gongju, Chungnam", area: "140㎡", use: "Hotel Lobby", materials: "plaster, limestone, brass", photography: "DARUDA",
      subs: [ { src: "assets/img/sub-10.jpg", shape: "landscape" }, { src: "assets/img/sub-08.jpg", shape: "portrait" }, { src: "assets/img/sub-12.jpg", shape: "landscape" } ] }
  ],

  marquee: {
    processing: "THIS IS WHAT WE'RE MAKING",
    archiving: "ARCHIVE : We make and design"
  }
};

/* 관리자 프로토타입이 저장한 데이터가 있으면 병합 */
window.DARUDA = (function () {
  try {
    const saved = JSON.parse(localStorage.getItem("daruda:v1") || "null");
    if (saved && typeof saved === "object" && saved.dataVersion === window.DARUDA_DEFAULT.dataVersion) return Object.assign({}, window.DARUDA_DEFAULT, saved);
  } catch (e) {}
  return window.DARUDA_DEFAULT;
})();
