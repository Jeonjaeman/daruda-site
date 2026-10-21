/* DARUDA v3 — GLSL (hollywoodexhibit2026 분석을 바탕으로 직접 작성) */

const ROT3 = /* glsl */`
mat4 rot3(vec3 axis, float a){
  axis = normalize(axis); float s = sin(a), c = cos(a), oc = 1.0 - c;
  return mat4(
    oc*axis.x*axis.x + c,        oc*axis.x*axis.y - axis.z*s, oc*axis.z*axis.x + axis.y*s, 0.0,
    oc*axis.x*axis.y + axis.z*s, oc*axis.y*axis.y + c,        oc*axis.y*axis.z - axis.x*s, 0.0,
    oc*axis.z*axis.x - axis.y*s, oc*axis.y*axis.z + axis.x*s, oc*axis.z*axis.z + c,        0.0,
    0.0, 0.0, 0.0, 1.0);
}`;

/* ---------- 인트로: 휘어진 종이가 나선으로 날아드는 평면 ---------- */
export const introVert = /* glsl */`
uniform float uBend;   // 2 → 0
uniform float uAngle;  // 나선 각도(정규화)
uniform float uFlip;   // 0 → 1 뒤집힘
varying vec2 vUv; varying float vZ;
${ROT3}
float quadOut(float t){ return -t * (t - 2.0); }
void main(){
  vUv = uv;
  vec3 p = position;
  float bend = (quadOut(uv.y) - 1.0) * uBend;
  float flip = smoothstep(uv.x * 0.4, 0.8 + uv.x * 0.2, uFlip);
  p = (rot3(vec3(0.0, 0.0, 1.0), uAngle * 3.14159 * 4.0) * vec4(p, 1.0)).xyz;
  p = (rot3(vec3(1.6, 1.0, 0.5), 3.14159 * flip + uAngle * 3.14159 * 4.0) * vec4(p, 1.0)).xyz;
  p.z += bend * 6.0;
  vZ = abs(p.z);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;

export const introFrag = /* glsl */`
uniform sampler2D uMap; uniform float uOpacity;
varying vec2 vUv; varying float vZ;
void main(){
  vec4 img = texture2D(uMap, vUv);
  vec3 col = img.rgb - img.rgb * pow(min(vZ, 1.0), 2.0) * 0.8;   // 깊이에 따른 가짜 조명
  gl_FragColor = vec4(col, uOpacity);
}`;

/* ---------- 갤러리: DOM 동기 평면 (포인터 리플 + 종이 접힘 + 하프톤 리빌) ---------- */
export const planeVert = /* glsl */`
uniform float uTime;
uniform vec2  uPointer;        // 평면 UV 공간의 포인터
uniform vec2  uFoldOrigin;     // 접힘 시작점(UV)
uniform float uFold;           // 0 → 1 접힘 진행
uniform float uAmp;            // 접힘 진폭(포락선)
uniform float uPtrStrength;    // 포인터 속도 기반 휨
uniform float uPtrActive;      // 포인터 활성(0~1)
uniform float uDepth;          // z 변위 스케일(px)
varying vec2 vUv;
void main(){
  vUv = uv;
  vec3 p = position;

  /* 종이 접힘 — 접힘선이 uFoldOrigin에서 대각선으로 이동 */
  float d = length(uv - uFoldOrigin);
  float anchor = smoothstep(0.0, 0.35, d);
  float line = uFold * 2.2;
  float df = d - line;
  float w = 0.85;
  float region = smoothstep(-w, 0.0, df) * (1.0 - smoothstep(0.0, w * 0.7, df));
  float foldAngle = df < 0.0 ? smoothstep(-w * 1.2, 0.0, df) * uFold * 0.7 : 0.0;
  float crease = region * anchor * uAmp * 0.7 * (1.0 + sin(df * 4.0 + uTime * 2.0) * 0.1);
  float r = foldAngle * uAmp * 0.5;
  mat2 R = mat2(cos(r), -sin(r), sin(r), cos(r));
  float mask = smoothstep(0.0, -w * 1.5, df) * anchor;
  vec2 rp = mix(p.xy, R * p.xy, mask);
  p.xy = mix(p.xy, rp, uFold * 0.35);
  float ripple1 = smoothstep(-w * 2.5, -w * 0.9, df) * (1.0 - smoothstep(-w * 0.9, 0.0, df));
  float settle = ripple1 * uAmp * 0.18 * sin(df * 7.5 + uTime * 2.0) * anchor;
  float ripple2 = smoothstep(-w * 4.0, -w * 2.2, df) * (1.0 - smoothstep(-w * 2.2, -w * 1.3, df));
  settle += ripple2 * uAmp * 0.12 * sin(df * 6.0 + uTime * 1.5 + 1.2) * anchor;

  /* 포인터 리플 — 정지 시 아주 느린 파동 */
  float pd = length(uv - uPointer);
  float fall = pow(smoothstep(0.35, 0.0, pd), 2.0);
  float wave = sin(pd * 12.0 - uTime * 0.3) * 0.5 + 0.5;
  float ripple = fall * wave * 0.6 * uPtrActive * 0.08;
  float pf = smoothstep(0.6, 0.0, pd);
  float bendP = pow(pf, 2.0) * uPtrStrength * 0.12;

  p.z += (crease + settle + ripple + bendP) * uDepth;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;

export const planeFrag = /* glsl */`
uniform sampler2D uMap;
uniform vec2  uUvScale;        // cover-fit 보정
uniform vec2  uPointer;
uniform vec2  uAspect;         // (w/h, 1) 거리 보정
uniform vec2  uSizePx;         // 평면 px 크기 (하프톤 셀 계산)
uniform float uDot;            // 하프톤 셀 크기 px
uniform float uStrength;       // 하프톤 강도 0~1 (호버)
uniform float uOpacity;        // 평면 전체 알파
uniform float uSolid;          // 1이면 원본을 불투명하게 (전환 중)
uniform float uTime;
uniform vec3  uPaper;
varying vec2 vUv;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main(){
  vec2 uv = (vUv - 0.5) * uUvScale + 0.5;
  vec4 img = texture2D(uMap, uv);
  float luma = dot(img.rgb, vec3(0.2126, 0.7152, 0.0722));

  /* 하프톤 */
  float ang = 0.35; mat2 R = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
  vec2 hc = (vUv - 0.5) * uSizePx;
  vec2 huv = (R * hc + 0.5 * uSizePx) / uDot;
  vec2 cell = fract(huv) - 0.5;
  float dr = mix(0.26, 0.68, 1.0 - luma);
  float dotMask = smoothstep(dr, dr - 0.02, length(cell));
  vec3 paper = mix(img.rgb, uPaper, 0.85);
  vec3 dots = mix(paper, img.rgb, dotMask);

  /* 포인터 주변 리빌 창 — 가장자리에 노이즈 */
  vec2 dv = (vUv - uPointer) * uAspect;
  float noise = (hash((vUv - uPointer) * 120.0) - 0.5) * 0.07;
  float dist = length(dv) + noise;
  float radius = 0.28 + (hash(vUv * 45.0) - 0.5) * 0.04;
  float window = 1.0 - smoothstep(radius, radius + 0.22, dist);
  window = pow(window, 0.8);

  /* 느린 스캔라인 */
  float t = mod(uTime * 0.2, 2.0);
  float y = vUv.y - 0.5 + (t * 2.55 - 1.05);
  float line = smoothstep(-0.05, 0.0, y) - smoothstep(0.0, 0.5, y);
  dots = mix(dots, vec3(1.0), line * 0.04);

  if (uSolid > 0.5) { gl_FragColor = vec4(img.rgb, uOpacity); return; }
  /* 창 밖은 하프톤을 덮고, 창 안은 DOM 원본이 비치도록 알파를 낮춘다 */
  float a = uOpacity * uStrength * (1.0 - window);
  gl_FragColor = vec4(dots, a);
}`;
