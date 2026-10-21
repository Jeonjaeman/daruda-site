# DARUDA 디자인 시스템 v1

## 1. 레퍼런스 분석

### 1-1. stof.kr (의뢰자 지정 — 메인 로고/메뉴 색 변화, works 상세 레이아웃)
- 풀블리드 사진 1장이 화면 전체. UI는 사진 위에 얹힌 **한 줄의 텍스트**뿐.
- 타이포: `Helvetica Neue LT Pro / Pretendard` — 그로테스크 산세리프, 모두 대문자 메뉴, 글자 크기 작음(14~16px).
- 로고 `stof.` 와 메뉴가 **같은 줄, 같은 크기, 같은 색**으로 묶여 있고, 사진 톤에 따라 텍스트 색이 바뀐다(갈색 사진 → 하늘색, 회색 사진 → 검정).
- works 상세: 상단 바(로고 / WORKS / 프로젝트명), 본문은 큰 여백 + 좌측 설명문, 우측 **라벨(회색) : 값(검정)** 메타 리스트(PROJECT, COMPLETION YEAR, LOCATION, GROSS BUILT AREA, MATERIALS, PHOTOGRAPHY).
- 배경 순백, 텍스트 순검정. 장식 없음.

### 1-2. salad-bowl.co.kr (의뢰자 지정 — 서브 이미지 가로·세로 혼합 레이아웃)
- 2열 컬럼 안에 **가로/세로 사진을 섞어** 쌓는 레이아웃. 사진 옆에 세로로 회전된 캡션 `[001] 2025 ACR COFFEE KUWAIT`.
- 좌측 고정 사이드바에 주소·전화·메일·인스타가 세로 텍스트로. 폰트 `FKGrotesk / Gothic A1`.
- 로고는 글자 사이를 벌린 모노스페이스풍 `SAL B WL`.

### 1-3. 의뢰자 기획안에서 읽히는 톤
- 회색 대리석·흰 벽 사진 위에 **흰색 굵은 로고 `DARUDA`** (Helvetica Bold 계열의 넓은 산세리프).
- 메뉴는 **소문자** `about archive press contact`, 하단 양끝 정렬.
- 오버레이는 **흰 사각형 + 검정 Pretendard Medium**. 장식·그림자 없음.
- archive 페이지는 **미색 배경 + 아웃라인 대문자 타이포** (P / A).
- 검정 박스 + 흰 글자 마퀴 (`THIS IS WHAT WE'RE MAKING`, `ARCHIVE : We make and design`).

### 1-4. 결론 — v1 디자인 방향
> "사진이 주인공, UI는 텍스트 한 겹" (stof) + "가로·세로 사진 혼합 그리드" (salad-bowl) + "흰 사각형 오버레이·아웃라인 타이포" (기획안)

---

## 2. 토큰 (`assets/css/tokens.css`)

### 색
| 토큰 | 값 | 용도 |
|---|---|---|
| `--c-black` | `#111111` | 텍스트, 마퀴 박스 |
| `--c-white` | `#ffffff` | 오버레이 패널, 사진 위 UI |
| `--c-cream` | `#f3f0e8` | archive 페이지 배경 (미색) |
| `--c-grey-100` | `#f5f5f5` | 이미지 플레이스홀더 |
| `--c-grey-400` | `#9a9a9a` | 메타 라벨 (stof 방식) |
| `--c-grey-700` | `#4a4a4a` | 보조 텍스트 |
| `--c-line` | `#111111` | 아웃라인 타이포·폼 테두리 (1px) |
| `--ui-color` | 동적 | 메인 사진 위 로고/메뉴 색 (밝기 감지로 `#fff` ↔ `#111`, 관리자 지정 가능) |

### 타이포 — Pretendard Variable (CDN, 동적 서브셋)
| 역할 | 크기 / 굵기 / 자간 |
|---|---|
| 로고 `DARUDA` | `clamp(40px, 5.6vw, 84px)` / 800 / `-0.03em` |
| 로고 옆 고정 텍스트 | 11px / 400 / 0 / 행간 1.6 |
| 메인 메뉴 | 18px / 500 / 0 (소문자) |
| 오버레이 제목 | 20px / 600 |
| 오버레이 본문 | 15px / **500 (Medium)** / 행간 1.9 |
| 아웃라인 대문자 (P/A) | `clamp(200px, 32vw, 460px)` / 700 / `-webkit-text-stroke: 2px` |
| 섹션 라벨 (PROCESSING 등) | 14px / 600 / `0.02em` 대문자 |
| 카드 캡션 | 13px / 600 (타이틀), 11px / 400 (연도·분야) |
| 메타 라벨 (location:) | 13px / 500 / 회색 → 값은 검정 |
| 마퀴 | 13px / 600 / `0.04em` 대문자 |

### 간격 / 레이아웃
- 페이지 여백 `--gutter: clamp(20px, 3vw, 48px)`
- 상단 바 높이 `--bar: 72px`
- 그리드 간격 `--gap: clamp(12px, 1.6vw, 24px)`
- 오버레이 패널: 가로 `min(1100px, 86vw)`, 세로 내용 맞춤, 화면 중앙 (살짝 위)
- 마퀴 박스 높이 `44px`, 검정, 화면 하단 고정

### 모션
- 메인 슬라이드: 3,000ms 간격, 좌→우 슬라이드 900ms `cubic-bezier(.77,0,.18,1)` + 각 슬라이드 3.2s 동안 2% 가로 드리프트
- 오버레이: 180ms 페이드 + 8px 상승
- 'U' 마커: 220ms 페이드/상승
- 마퀴: 왼쪽 → 오른쪽, 28s 루프, `linear`
- 라이트박스: 160ms 페이드

### 반응형
- `≥ 1024px` 기획안 그대로
- `< 1024px` 오버레이 패널 세로 적층, ARCHIVING 행은 가로 스크롤
- `< 640px` 메뉴 2×2, 로고 옆 텍스트는 로고 아래로, 프로젝트 상세는 세로 적층

---

## 3. 컴포넌트 목록
`.logo` `.tagline` `.nav-main` `.u-marker` `.overlay` `.panel` `.press-list` `.press-detail` `.contact-info` `.consult-form` `.split` `.outline-letter` `.grid-proc` `.row-archive` `.card` `.project-hero` `.project-subs` `.lightbox` `.marquee` `.admin-*`

구현은 `assets/css/style.css`, 동작은 `assets/js/app.js`, 콘텐츠는 `assets/data/site.js` 한 곳에서 관리한다(관리자 페이지가 바꿀 데이터 구조 그대로).
