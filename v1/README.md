# DARUDA 웹사이트 프로토타입 v1

주식회사 다루다 (DARUDA DESIGN STUDIO) 포트폴리오 사이트 프로토타입. 의뢰자 기획 이미지 1장을 근거로 요구사항을 정리하고(`REQUIREMENTS.md`), 지정 레퍼런스(stof.kr, salad-bowl.co.kr)에서 디자인 시스템을 추출해(`DESIGN-SYSTEM.md`) 정적 HTML/CSS/JS로 구현했다.

## 보는 법
서버 없이 `index.html`을 더블클릭해도 되지만, 밝기 감지(캔버스) 기능 때문에 로컬 서버로 여는 것을 권장한다.

```bash
python -m http.server 8190 --bind 127.0.0.1
```
→ http://127.0.0.1:8190/

| 파일 | 화면 |
|---|---|
| `index.html` | 메인 (슬라이드 · about/press/contact 오버레이 · U 마커 · 로고/메뉴 색 자동 전환) |
| `archive.html` | archive — ( 4 ) P PROCESSING / ( 53 ) A ARCHIVING, 미색 배경 |
| `processing.html` | 진행 중 작업 그리드 + 라이트박스(← → Esc) + 마퀴 |
| `archiving.html` | LIVING / COMMERCIAL 행 + 카드 캡션(타이틀/연도/분야) + 마퀴 |
| `project.html?id=…` | 프로젝트 상세 — 메인 이미지 + location/area/use, 서브 이미지 가로·세로 혼합 |
| `admin.html` | 관리자 목업 — 슬라이드·카운트·press·PROCESSING·프로젝트·상담 문의 수신함 |

## 구조
```
v1/
├─ index.html · archive.html · processing.html · archiving.html · project.html · admin.html
├─ assets/
│  ├─ css/tokens.css     디자인 토큰 (색·타이포·간격·모션)
│  ├─ css/style.css      컴포넌트
│  ├─ js/app.js          슬라이드·오버레이·라이트박스·마퀴·렌더링
│  ├─ data/site.js       콘텐츠 데이터 (관리자가 수정할 구조 그대로)
│  └─ img/               프로토타입용 AI 생성 인테리어 이미지 (ComfyUI, flux1-schnell) — 실제 사진으로 교체 예정
├─ _tools/gen_images.py  이미지 생성 스크립트
├─ REQUIREMENTS.md       기획 이미지에서 추출한 요구사항 + 확인 질의 10건
└─ DESIGN-SYSTEM.md      레퍼런스 분석 + 토큰 정의
```

## v1에서 구현된 요구사항
- 메인 풀이미지 3초 간격 좌→우 무빙 (최대 10장, 오버레이 열림 중에도 계속)
- 이미지 밝기 감지로 로고·메뉴 색 자동 전환 + 관리자에서 이미지별 색 직접 지정(4번 슬라이드 예시: 하늘색)
- 로고 좌상단 + 옆 고정 텍스트 3줄, 메뉴 4개 하단 분산
- about/press/contact 오버레이 (hover로 열림, click으로 고정, Esc/close), 활성 메뉴 위 'U' 마커
- press: 발간월 위 / 커버 아래, 커버 클릭 시 우측 사분면 배치 상세, 클릭 확대
- contact: mailto / instagram / tel / 네이버 지도 링크, consult 폼 전송 → 관리자 수신함
- archive 2분할 아웃라인 타이포, 카운트 관리자 연동
- PROCESSING 그리드 + 키보드 화살표 라이트박스 + 좌→우 마퀴
- ARCHIVING LIVING/COMMERCIAL 행, `>` 넘김, 검정 캡션 띠
- 프로젝트 상세 메인+서브(가로/세로 혼합) + 순차 확대
- 관리자 목업 (저장 항목은 localStorage로 사이트에 즉시 반영)

## v1에서 가정/보류한 것
- 관리자 파일 업로드·로그인·서버 저장은 UI만 (실서비스 단계에서 백엔드 연동)
- "넓은 모양의 'D'" 오버레이 → 직사각형으로 해석 (질의 3번)
- 대표자 성함·사업자번호는 판독 추정치 (질의 1·2번)
- 모바일은 기본 대응만 (오버레이 세로 적층, 메뉴 2×2)

## press 자료 전제
press는 의뢰자가 **매거진 PDF 또는 실제 지면 스캔 이미지**를 올리는 것을 전제로 한다. 예시 지면(`assets/img/press/`, `assets/press/*.pdf`)은 `v2/_tools/make_press.py`로 합성한 모형이며 실제 매거진 자료를 받으면 교체한다.
