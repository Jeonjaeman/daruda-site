# hollywoodexhibit2026.com 분석 (2026-10-21)

ELLE & Esquire "The New Hollywood" 사진전 웹사이트. 캡처 `*.jpg`, 추출한 셰이더 `plane-vertex.glsl`, `shaders-extract*.txt`.

## 1. 소스 구성

| 항목 | 확인 내용 |
|---|---|
| 프레임워크 | **Next.js (App Router, Turbopack)** — `/_next/static/chunks/*.js` 20개, 라우트 `/`, `/elle-intro`, `/elle`, `/elle/[n]`, `/esquire…` |
| 3D | **three.js + React Three Fiber + drei** (`useFrame`, `useThree`, `useTexture`, `Preload`, `Html`). three 번들 890KB 청크에 `WebGLRenderer`, `ShaderMaterial`, `RawShaderMaterial`, `InstancedMesh`, `Points` 포함. WebGL 2.0 캔버스 2개(인트로용·갤러리용) |
| 애니메이션 | **GSAP**(인트로 타임라인, `timeline().to(uniform,{value})`), **framer-motion**(DOM 전환, `LayoutGroup`, spring stiffness/damping, Pan/Hover 제스처) |
| 상태 | **zustand**(페이지 전환 상태 `transitionPhase`, `slideTransition`, `isGridPage`/`isLightboxPage`, `gridItemRegistry`, `viewMode: grid/list`), **leva**(디버그 패널 잔재) |
| 스타일 | Tailwind. 폰트 Ivy Presto Headline/Text(세리프), ABC Arizona, Instrument Sans, Haigrast·Safira March(스크립트). Typekit 로드 |
| 데이터 | 청크에 인라인된 배열 `{id, image, logo, firstName, lastName, time:"December 2024/January 2025", credit:"PHOTOGRAPH BY CASS BIRD", text}` — ELLE 47장, Esquire 별도. 이미지는 `/_next/image?url=…&w=512` 리사이즈 |
| 기타 | 커스텀 커서(`.cursor-dot` + 노이즈 후광 `.magic` + 호버 라벨 `.view-icon-box`, `body{cursor:none}`), 전체 그레인 오버레이(`noise.png`, `fixed inset-0 z-5 pointer-events-none`), `AudioContext` 포함(효과음 가능성) |

## 2. 화면 흐름

1. **로딩**: 검정 배경, 세리프 타이틀 "THE ELLE *and* ESQUIRE HOLLYWOOD" + 스피너. (`20-intro-800.jpg`)
2. **스파이럴 인트로**(약 4.7초): 매거진 커버 21장이 휘어진 종이 상태로 나선을 그리며 날아들어 링을 이룸. (`12-click-plane.jpg`, `43-gallery-wheel-*.jpg`)
3. **갤러리 선택**: "Choose which gallery you want to explore" — ELLE / Esquire 커버 2장. 호버하면 커버가 하프톤으로 바뀌고 포인터 주변만 원본이 보이며 종이처럼 휘어짐. (`30-hover-cover.jpg`, `31-detail.jpg`)
4. **에디터 서문**(`/elle-intro`): 글자 단위 리빌(`animate-char-reveal` span), 뒤에 블러된 커버, 서명, Skip Intro / Go to Gallery. (`41-gallery-enter.jpg`)
5. **갤러리**(`/elle`): 헤더 = 좌 "⁞⁞ View"(그리드/리스트 토글), 중앙 로고, 우 "Menu". "SCROLL TO EXPLORE" → 거대 마스트헤드 ELLE가 스크롤에 따라 줄어들며 헤더 로고로 수렴 → 흰 배경에 **크기가 다른 사진이 흩어진 그리드**. 리스트 뷰는 가로 한 줄 필름스트립. (`50-gallery-grid.jpg`, `52-grid-scroll.jpg`, `53-list-view.jpg`)
6. **상세**(`/elle/5`): 좌측 세로 썸네일 스트립, 중앙 큰 사진, 우측 검정 패널 `[5]` / `February 2023` / `PHOTOGRAPH BY CASS BIRD` / 이름(세리프 대형). ← → 키로 이동, × 닫기. (`54-detail.jpg`, `55-detail-next.jpg`)

## 3. 3D 표현 방법

### 3-1. 인트로 평면 (fd44… 청크)
- `PlaneGeometry(1.6, 2, 20, 20)` 21개, 텍스처는 `/_next/image` 512px.
- **버텍스 셰이더**: `bend = (quadraticOut(uv.y) - 1) * uBend` → `pos.z += bend * 6` (종이가 세로 방향으로 휘어짐). `rotation3d(z축, uAngle·4π)` 후 `rotation3d((1.6,1,.5), π·flipProgress + uAngle·4π)` — 평면이 나선 축을 따라 회전·뒤집힘. `test.r = |pos.z|` 를 프래그먼트로 넘김.
- **프래그먼트**: `color - color * pow(|z|, 2) * 0.8` — 깊이에 따라 어두워지는 가짜 조명. 알파 `uOpacity`.
- **배치**: `startAngle π/2`, `amplitude 30`, `stretchX 1.4`, `stretchY 1.5`, 각 평면 `angles[i]`. GSAP 타임라인에서 `uBend 2→0`(2s, 0.2s·i 지연), `uOpacity`, `cameraZ 0→1`(3s), 4.7s에 onComplete.

### 3-2. 갤러리 평면 (56e6… 청크) — DOM 동기 WebGL
- 각 사진은 DOM `<img>` 와 **같은 크기·위치의 평면**(`scale.set(w,h)`, `position.set(cx,cy)`; 뷰포트 px ↔ 월드 단위 환산). 모드 `hover` / `transition`.
- **버텍스**(`plane-vertex.glsl`): ① **종이 접힘** — `uFoldOrigin`(포인터 위치)에서 접힘선이 `uFoldProgress·2.2` 만큼 대각선으로 진행, 접힘선 앞쪽은 회전(`foldAngle·uAmplitude·0.5`), 뒤로 3단 정착 물결(`sin(dist·7.5 + t·2)` 등). ② **포인터 리플** — `smoothstep(.35, 0, pointerDist)^2 · sin(pd·12 − t·0.3)` 느린 파동 × `uDistortionStrength 0.6` × `uPointerActive`. ③ 하프톤 점 변위 `uMorphProgress·uHalftoneStrength·(dot−.5)·0.08`.
- **프래그먼트**: 뒷면이면 UV 좌우 반전. luma → **하프톤**(각도 0.35rad, 셀 크기 `uHalftoneDotSize 6.5px`, 점 반지름 `mix(.26,.68,1−luma)`). **리빌 창**: 포인터 거리 0.28 + 페더 0.22, `hash()` 노이즈로 가장자리 흔들림. 창 안은 원본, 밖은 하프톤. 느린 흰 스캔라인 한 줄이 위로 흐름(`regularLine`, 강도 0.01).
- **런타임 값**: 포인터 속도 → `uPointerStrength = lerp(clamp(v·1.2), .18)`, 포인터 평활 `.05`, 활성 `.03`, `uHalftoneStrength` 호버 시 `.015`로 올리고 해제 시 `.004`로 서서히 내림. 전환: `uFoldProgress = −(cos(πf)−1)/2`, `uAmplitude = 0.4·k·(quartic in/out 0.4·0.6)`, `FLIP_PAGE_TRANSITION_DURATION_S` 동안 평면이 썸네일 rect → 목표 rect로 보간(shared-element FLIP) 후 라이트박스 DOM 표시.

### 3-3. 그 외 모션
- 마스트헤드 축소(스크롤 연동), 글자 단위 텍스트 리빌, 버튼 글자 split, 페이지 전환은 zustand 상태머신(`IDLE → …`)으로 DOM과 WebGL이 같은 타임라인을 공유.
- 그레인: PNG 노이즈 오버레이. 커서: 점 + 지연되는 노이즈 후광 + 호버 시 "View" 라벨.

## 4. 인터랙션 정리
| 입력 | 반응 |
|---|---|
| 로드 | 스파이럴 인트로 자동 재생 |
| 휠 | 인트로 중엔 평면 각도에 개입, 갤러리에선 가상 스크롤(마스트헤드 축소 → 그리드) |
| 포인터 이동 | 커서 점·후광 추적, 사진 위에서 하프톤+리빌, 속도에 따라 종이가 휘어짐 |
| 클릭 | 종이 접힘 + FLIP 전환으로 상세 |
| ← → / Esc | 상세에서 이전·다음 / 닫기 |
| View 토글 | 흩어진 그리드 ↔ 가로 필름스트립 |

## 5. DARUDA v3에 가져오는 것 / 바꾸는 것
- 가져옴: 스파이럴 인트로, 마스트헤드 축소, 흩어진 그리드 + 하프톤 리빌, 종이 접힘 전환, 상세(썸네일 스트립 + 검정 패널), View 토글, 커스텀 커서 + 그레인.
- 바꿈: 프레임워크 없이 **바닐라 three.js + GSAP**(번들 ~700KB → 두 CDN 모듈), 캔버스 1개, 필요 시에만 렌더(dirty flag), DPR ≤ 1.5, `prefers-reduced-motion` 시 인트로 생략. 인덱스·메뉴는 v3 보드의 C(거대 타이포 메뉴 오버레이) + D(칩 필터 + 리스트 뷰) + E(상세 패널·press 부록) + F(커서) 혼합.
