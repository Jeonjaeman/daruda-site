# DARUDA 웹사이트 프로토타입 v2 — A안 (Norm형)

v1에서 "이용자가 헤매는" 지점을 레퍼런스 보드(`../references/index.html`)의 A안대로 고친 버전. 의뢰자 기획안의 독특한 장치(사진 톤에 따른 글자색 전환, 미색 배경, 굵은 로고, P/A 타이포, 마퀴)는 살리고 뼈대만 일반형으로 바꿨다.

## 보는 법
```bash
python -m http.server 8192 --bind 127.0.0.1
```
→ http://127.0.0.1:8192/ (패널 페이지가 fetch를 쓰므로 서버로 여는 것을 권장. 파일로 열면 일반 페이지 이동으로 동작)

| 파일 | 화면 |
|---|---|
| `index.html` | 상단 바 + 캡션 있는 풀이미지 슬라이드 + 소개 문장 + 최근 작업 3개. about/press/contact는 오른쪽에서 열리는 **패널 페이지**(주소 변경, 뒤로가기 동작) |
| `archive.html` | 미색 그리드 한 페이지. 머리에 `( 53 ) completed · ( 4 ) in progress`, 필터 `All / Living / Commercial / Processing`(해시로 공유 가능), 옆에 A/P 아웃라인 글자. Processing 선택 시에만 하단 마퀴 |
| `project.html?id=…` | 16:9 메인 이미지 → 제목·설명 + stof식 메타(Project / Category / Year / Location / Area / Use / Materials / Photography) → 가로·세로 혼합 서브 이미지 → 이전/다음 |
| `about.html` `press.html` `contact.html` | 단독으로도 열리는 일반 페이지(패널의 원본) |
| `admin.html` | 관리자 목업 — 슬라이드(프로젝트명·캡션·연결 프로젝트·상단 바 색), 카운트, press, PROCESSING, 프로젝트, 문의 수신함. localStorage `daruda:v2` |

## v1 → v2 변경 요약
| v1 | v2 |
|---|---|
| 하단 네 귀퉁이 메뉴 | 상단 바 (로고 좌 / 메뉴 우), 히어로를 지나면 미색 솔리드 |
| hover 오버레이 | 클릭으로 열리는 패널 페이지 + 독립 URL (`about.html` 등) |
| 'U' 마커 | 삭제 (메뉴 밑줄로 대체) |
| 좌→우 밀림 슬라이드, 캡션 없음 | 크로스페이드 4초 + 프로젝트명·한 줄 캡션 + 점 인디케이터, 캡션 클릭 시 상세 이동 |
| archive → P/A 2분할 → 행 → 상세 (3단계) | archive 그리드 한 페이지 + 필터 (1단계) |
| 거대한 P / A 글자 | 머리 옆 장식 글자로 축소, 필터에 따라 A↔P, 채움 |
| 마퀴 2종 상시 | PROCESSING 필터에서만 1종 |
| 상세: location/area/use 세 항목 | stof식 8개 메타 + 설명문 + 이전/다음 |
| 사진 톤에 따른 글자색 전환 | **유지** (상단 바·캡션에 적용) |
| 미색·굵은 로고·Pretendard | **유지**, 사이트 전체 배경을 미색으로 |

## 구조
```
v2/
├─ index.html · archive.html · project.html · about.html · press.html · contact.html · admin.html
├─ assets/css/tokens.css (v1과 동일) · style.css (v2 신규)
├─ assets/js/app.js · assets/data/site.js (슬라이드 title/caption/projectId, 프로젝트 desc/materials/photography 추가)
└─ assets/img/ (v1과 동일한 임시 이미지)
```

## press 자료 전제
press는 의뢰자가 **매거진 PDF 또는 실제 지면 스캔 이미지**를 올리는 것을 전제로 한다. 예시 지면(`assets/img/press/`, `assets/press/*.pdf`)은 `v2/_tools/make_press.py`로 합성한 모형이며 실제 매거진 자료를 받으면 교체한다.

## press 예시 자료 (2026-10-22 추가)
매거진 예시 12종(bob 2종, 전원속의 내집 2종, MARU, CASA LIVING, INTERIORS, DECO JOURNAL, 행복이 가득한 집, SPACE, CAFE &, MAISON). 표지 4가지 스타일·펼침면 2~4장·PDF는 `v2/_tools/make_press_more.py`(PIL)로 합성한 임시 자료이며, 매거진명·호수·기사 내용은 모두 예시다. 실제 게재 자료를 받으면 `assets/img/press/`·`assets/press/`와 `site.js`의 `press` 배열을 교체한다. `site.js`의 `dataVersion`이 관리자 저장본과 다르면 저장본을 무시한다(기본 데이터 갱신 시 올릴 것).

## 샘플 데이터 2배(2026-10-22)
슬라이드 6→10, 진행 중 8→16, 프로젝트 8→16(living 7·commercial 9), press 12종 유지. 새 이미지 24장은 `v2/_tools/gen_images_more.py`(ComfyUI flux1-schnell)로 생성, 데이터 추가는 `v2/_tools/add_samples.py`가 v1·v2·v3 `site.js`에 동일 반영(`dataVersion` 3). 모두 임시 예시.
