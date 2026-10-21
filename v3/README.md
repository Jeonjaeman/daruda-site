# DARUDA 웹사이트 프로토타입 v3 — Hollywood-exhibit 방식 갤러리

hollywoodexhibit2026.com 의 갤러리 방식(스파이럴 인트로 → 거대 마스트헤드 → 흩어진 그리드 + 하프톤 포인터 리빌 → 종이 접힘 전환 → 썸네일 스트립 상세)을 **프레임워크 없이 바닐라 three.js + GSAP** 으로 다시 구현하고, 인덱스·메뉴는 v3 레퍼런스 보드의 C·D·E·F 를 혼합했다. 분석 문서: `../references/hollywood/analysis.md`.

## 보는 법
```bash
python -m http.server 8193 --bind 127.0.0.1
```
→ http://127.0.0.1:8193/ (ES 모듈·텍스처 로딩 때문에 서버 필요. three@0.170, gsap@3.12 는 jsdelivr CDN)

## 구조와 채택한 안
| 영역 | 구현 | 출처 |
|---|---|---|
| 인트로 | 프로젝트 사진 21장이 휘어진 종이(uBend 2→0)로 나선을 그리며 날아들고 카메라가 뒤로 빠짐. 4.6초, skip 가능, `prefers-reduced-motion` 시 생략 | Hollywood 스파이럴 |
| 마스트헤드 | 검정 화면에 세리프 `DARUDA` 거대 타이포, 스크롤에 따라 축소되며 헤더 로고로 수렴 | Hollywood 마스트헤드 + **C안 거대 타이포** |
| 인덱스 | 칩 필터 `All / Living / Commercial / Processing / Press` + `( n ) photographs` 카운트, 헤더 좌측 **View** 토글로 흩어진 그리드 ↔ 가로 필름스트립 | **D안 컨택트 시트·칩** + Hollywood View 토글 |
| 스크롤 디테일 | (Esquire Goes to Hollywood 영상 반영) ① 마스트헤드 78vh 아래로 첫 2컷이 화면을 채우며 살짝 보이고, 스크롤하면 약 0.95화면 동안 자기 그리드 자리로 축소 ② 스크롤 속도에 비례한 미세 `skewY`(±1.4°) 기울임 ③ 아래에서 들어오는 사진은 블러 14px·불투명도 6%로 시작해 1.1초에 걸쳐 선명해짐(화면 1.3배 아래로 나가면 초기화) | Esquire 레퍼런스 |
| 갤러리 | 12칸 그리드에 9종 패턴으로 흩어진 사진(DOM). 호버하면 같은 위치에 WebGL 평면이 떠서 **하프톤 + 포인터 리빌 창 + 속도 기반 휨** | Hollywood 갤러리 셰이더 |
| 전환 | 클릭 시 평면이 **종이 접힘**(uFold, 3단 정착 물결)을 하며 썸네일 rect → 상세 rect 로 FLIP, 끝나면 상세 DOM 표시. 닫을 때 역재생 | Hollywood page-flip |
| 상세 | 좌 썸네일 스트립 · 중앙 사진 · 우 검정 패널 `[n]` / 연도·분류 / credit / 설명 / location·area·use / 제목 세리프 대형. ← → Esc | Hollywood 상세 + **E안 출판물 패널** |
| 메뉴 | 우상단 Menu → 검정 오버레이에 아웃라인 세리프 `ABOUT / ARCHIVE / PRESS / CONTACT`, 호버 시 채움 | **C안 타이포 벽** |
| 커서 | 점 + 지연되는 노이즈 후광 + 사진 위 "View" 라벨, 전체 그레인 오버레이 | Hollywood + **F안 커서** |
| 서브 페이지 | about / press(스프레드 뷰어 + PDF) / contact 는 다크 테마 일반 페이지 | **E안 부록** |

## 성능 설계
- 캔버스 1개, 렌더는 인트로 중이거나 보이는 평면이 있을 때만 (`any ? render : clear`). DPR ≤ 1.5, antialias 끔.
- 평면은 호버·전환 중인 것만 `visible`. 텍스처는 인트로 21장 먼저, 나머지는 인트로 후 선로딩. 1024px 이하 JPG.
- 가상 스크롤은 `transform` 한 줄(lerp), 터치·reduced-motion 은 네이티브 스크롤로 전환. 기울임은 가상 스크롤일 때만, 블러 진입은 reduced-motion 이 아닐 때만. 개체 rect 는 레이아웃이 바뀔 때만 측정(`measureItems`)하고 매 프레임은 스크롤 값만 뺀다.
- 의존성: three.module.min(≈ 650KB gz 170KB) + gsap(≈ 70KB). React·R3F·framer-motion 없음.

## 구조
```
v3/
├─ index.html (인트로·마스트헤드·칩·그리드·상세·메뉴)  about.html  press.html  contact.html  admin.html
├─ assets/css/v3.css
├─ assets/js/shaders.js (GLSL 4종)  v3.js (앱)  pages.js (서브 페이지)
├─ assets/data/site.js (v2와 동일 구조, 저장 키 daruda:v3)
└─ assets/img/ · assets/img/press/ · assets/press/*.pdf (v2와 동일 임시 자료)
```

## v2 → v3 변경
- 풀이미지 슬라이드 → 스파이럴 인트로 + 마스트헤드. 상단 바 메뉴 → Menu 오버레이(타이포 벽). archive 그리드 → 사진 단위 흩어진 그리드 + 칩. 프로젝트 상세 → 사진 단위 상세(썸네일 스트립). 패널 페이지 → 다크 일반 페이지.
- 유지: 데이터 구조, press PDF/스캔본, 관리자 목업, 미확정 질의(대표자 성함·사업자번호).

## press 예시 자료 (2026-10-22 추가)
매거진 예시 12종(bob 2종, 전원속의 내집 2종, MARU, CASA LIVING, INTERIORS, DECO JOURNAL, 행복이 가득한 집, SPACE, CAFE &, MAISON). 표지 4가지 스타일·펼침면 2~4장·PDF는 `v2/_tools/make_press_more.py`(PIL)로 합성한 임시 자료이며, 매거진명·호수·기사 내용은 모두 예시다. 실제 게재 자료를 받으면 `assets/img/press/`·`assets/press/`와 `site.js`의 `press` 배열을 교체한다. `site.js`의 `dataVersion`이 관리자 저장본과 다르면 저장본을 무시한다(기본 데이터 갱신 시 올릴 것).
