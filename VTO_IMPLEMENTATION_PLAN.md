# Custom Virtual Try-On — Implementation Plan

## Goal
Replace the proprietary Jeeliz Glasses VTO Widget with our own **Apache-2.0 / MIT** stack that adds capabilities Jeeliz can't offer: **real-world millimeter scale**, **webcam-based pupillary distance (PD) measurement**, and **fit recommendations** ("this 142 mm frame is too wide for your 62 mm PD").

## Why
1. Jeeliz license limits free use to <10 models / non-commercial — bad for production rollout
2. Jeeliz can't measure PD or render at true mm scale — the biggest customer pain point on online eyewear
3. We bring our own GLB models — no SKU lookup against Jeeliz's catalog, no vendor lock-in
4. Total budget: **90h / $1,350 @ $15/h**, or **38h / $570** if we ship only Phases 1–2

## Stack
1. **MediaPipe Face Landmarker** (`@mediapipe/tasks-vision`) — 478 face landmarks + iris + 4×4 head pose matrix, Apache 2.0
2. **three.js** + **`@react-three/fiber`** — WebGL rendering in React, MIT
3. **`@react-three/drei`** — `useGLTF` loader + helpers, MIT
4. **One-Euro filter** (custom 30-line implementation) — pose smoothing
5. **GLB models** (glTF 2.0 binary) — our own catalog, sourced via Tripo + Blender or freelance modelers

---

## Phase 1 — Webcam PD Measurement (26h / $390)

### Step 1.1 — Install MediaPipe (1h)
1. `npm install @mediapipe/tasks-vision`
2. Verify TanStack Start SSR safety: dynamic-import inside `useEffect`, never at module top level
3. Vendor the WASM + model files to `public/mediapipe/` to avoid CDN dependency

### Step 1.2 — Build the tracking primitive (3h)
1. New file: `src/lib/vto/useFaceLandmarks.ts` — React hook
2. Inputs: `<video>` element ref, enabled flag
3. Outputs: `{ landmarks: NormalizedLandmark[], headPose: Matrix4, fps: number }`
4. Loop: `requestAnimationFrame` → `detector.detectForVideo(video, performance.now())` → setState (throttled to avoid React re-render storm)
5. Cleanup on unmount

### Step 1.3 — Iris-based PD calculation (6h)
1. New file: `src/lib/vto/calculatePD.ts`
2. Inputs: 478 landmarks (must call Face Landmarker with `outputFaceBlendshapes: false, outputFacialTransformationMatrixes: true, numFaces: 1`)
3. Extract iris landmarks: indices `468–472` (right iris), `473–477` (left iris)
4. Compute iris diameter in pixels (horizontal distance between iris points 469 & 471)
5. Apply biological constant: **iris diameter = 11.7 mm ± 0.5 mm**
6. Derive `mm_per_pixel = 11.7 / iris_diameter_px`
7. Compute pupil-to-pupil pixel distance (iris centers: indices `468` and `473`)
8. PD_mm = pupil_to_pupil_px × mm_per_pixel
9. Head-pose normalization: only accept frames where head yaw < 5° (use `facialTransformationMatrix` for this)
10. Multi-frame averaging: ring buffer of 30 valid samples, output median (rejects outliers)

### Step 1.4 — PD measurement UI panel (6h)
1. New file: `src/components/PDMeasurement.tsx`
2. UX flow:
   - Step A: "Look straight at the camera" — show camera preview with face overlay
   - Step B: live PD readout (large number, mm), confidence meter
   - Step C: "Hold still..." progress bar fills as 30 valid frames accumulate
   - Step D: "Your PD: 62 mm ✓" — save button
3. Visual feedback: green box around face when pose is good, red when head turned
4. Russian copy throughout

### Step 1.5 — Persist PD to user profile (2h)
1. Extend Zustand cart store: add `userPD: number | null` + `setUserPD(mm: number)`
2. Persist via existing `persist` middleware (localStorage)
3. Add entry point in user cabinet (`/cabinet`) — "Подбор размера"

### Step 1.6 — Cross-browser testing (4h)
1. Test matrix: Chrome (Win/Mac/Android), Safari (Mac/iOS), Firefox (Win/Mac)
2. Known issue: Safari requires `playsinline` on `<video>`
3. Mobile: ensure portrait orientation works (face landmarks are aspect-ratio-sensitive)
4. Low-light fallback: warn user if average landmark confidence < 0.7

### Step 1.7 — Performance budget (4h)
1. MediaPipe target: <16 ms per frame (60 fps) on mid-range laptop
2. Use Web Worker for the detector if main thread blocks (MediaPipe supports this)
3. Memoize landmark math — recompute only when landmarks actually change
4. Test on 4-year-old phone (iPhone 11 / mid-range Android)

**Verification:** PD readout stable within ±1 mm over 5 seconds of holding still. Tested against ruler-based ground truth on 3 people → <2 mm mean error.

---

## Phase 2 — Frame Fit Recommendation (12h / $180)

### Step 2.1 — Extend product catalog (3h)
1. Add to `Product` type in `src/data/types.ts`:
   ```ts
   measurements?: {
     totalWidthMm: number;     // hinge-to-hinge frame width
     lensWidthMm: number;      // single lens width
     bridgeMm: number;         // bridge width
     templeMm: number;         // temple length
   }
   ```
2. Populate `measurements` for all ~49 products in `src/data/products.ts`
3. Most frames already have specs in `product.specs` — parse those strings or duplicate as numbers

### Step 2.2 — Fit classification algorithm (3h)
1. New file: `src/lib/vto/fitRecommendation.ts`
2. Industry rule: **ideal frame width ≈ user PD × 2.2 ± 5 mm**
3. Function `recommendFit(userPD_mm, frameWidth_mm)`:
   - "Узкие" (narrow): frame < userPD × 2.0
   - "В размер" (perfect): userPD × 2.0 ≤ frame ≤ userPD × 2.4
   - "Широкие" (wide): frame > userPD × 2.4
4. Unit tests for boundary cases

### Step 2.3 — Fit badge UI (4h)
1. New component: `src/components/FitBadge.tsx` — colored chip (green / amber / red)
2. Add to `ProductCard` — shown only when `userPD` is set
3. Add to PDP — prominent placement next to price
4. Tooltip: "Ваш PD: 62 мм. Эта оправа 138 мм — идеально вам подходит."

### Step 2.4 — Empty-state UX (2h)
1. If `userPD` is null: show "Узнайте свой размер" CTA on every ProductCard
2. Click → opens the Phase 1 measurement panel
3. After measurement, badges retroactively populate across the site

**Verification:** Open `/opravy` without measuring → see "Узнайте свой размер" CTAs. Measure once. Reload → every product now shows narrow/perfect/wide badge.

---

## Phase 3 — True-Scale 3D Rendering (34h / $510)

### Step 3.1 — Three.js + Fiber scene scaffold (6h)
1. `npm install three @react-three/fiber @react-three/drei`
2. New component: `src/components/CustomVTOCanvas.tsx`
3. Layout: `<Canvas>` filling the modal body. Inside:
   - `<VideoBackground>` — webcam stream as a textured plane behind everything
   - `<FaceMesh>` — invisible depth-only canonical face mesh (for occlusion)
   - `<Glasses glb={url} />` — our 3D model anchored to the bridge landmark
4. `<Canvas camera={{ fov: 63, near: 0.1, far: 10 }}>` — match webcam FOV

### Step 3.2 — Anchor frame to facial landmarks (10h)
1. Bridge landmark: index `168` (between eyes, just above nose root)
2. Convert normalized landmark coords → world-space using `facialTransformationMatrix`
3. Apply matrix to a `THREE.Group` wrapping the loaded GLB
4. **The hard part:** scale the GLB so that **its catalog `totalWidthMm` matches the on-screen pixel width derived from the user's PD**
   - Compute scene-units-per-mm using the same iris→mm-per-pixel logic from Phase 1
   - Set `group.scale = totalWidthMm * scenePixelsPerMm / glbWidth`
5. Validation: take screenshot, measure rendered frame width in pixels, compare to catalog mm × known px/mm ratio. Should be within 2%.

### Step 3.3 — Smoothing (4h)
1. New file: `src/lib/vto/oneEuroFilter.ts`
2. Reference: https://gery.casiez.net/1euro/ (30-line algorithm)
3. Apply to position, rotation (quaternion-aware), and scale separately
4. Tune: `mincutoff = 1.0`, `beta = 0.1` as starting point

### Step 3.4 — Occlusion (4h)
1. Render MediaPipe canonical face mesh (468 verts) as **invisible** material that writes only to depth buffer (`colorWrite: false`)
2. This makes the glasses correctly hide behind ears + temple regions when user turns head
3. Verify: turn head 30° left — glasses' right temple should disappear behind the cheek

### Step 3.5 — "Realistic size" toggle (4h)
1. Add toggle to VTO modal: `[Стандартный] | [Реальный размер]`
2. Standard mode = current behavior (frame sized to look reasonable)
3. Real mode = Phase 3.2 true-scale rendering
4. Save user preference

### Step 3.6 — Visual QA + tuning (6h)
1. Test on 5+ frames spanning narrow (130mm) to wide (148mm)
2. Compare side-by-side: same person, same frame, real vs. standard mode
3. Tune lighting: HDRI env map from `@react-three/drei` `<Environment preset="studio" />`
4. Lens transparency: separate material on the lens mesh with `transparent: true, opacity: 0.15, ior: 1.5`

**Verification:** A user with measured 62mm PD trying on a 138mm and 148mm frame can clearly see the second is wider on their face. Take screenshots, measure pixel widths, confirm 10mm difference renders proportionally.

---

## Phase 4 — QA, Polish, Edge Cases (18h / $270)

### Step 4.1 — Cross-browser (4h)
1. Chrome, Safari, Firefox on desktop
2. Mobile Safari (iOS 16+) and Chrome Android
3. Known traps: Safari WebGL2 quirks, Android camera permission delays, low-end GPU fallback

### Step 4.2 — Mobile camera quirks (4h)
1. `<video playsinline autoplay muted>` — required for iOS
2. Camera permission prompt timing (request only after explicit user gesture)
3. Front vs. back camera: `facingMode: "user"`, fallback if denied
4. Portrait orientation handling — lock or adapt scene

### Step 4.3 — Error states (3h)
1. No camera available → "Камера не найдена. Включите её или используйте другое устройство."
2. Permission denied → instructions for re-enabling per browser
3. Low light → "Сделайте фон ярче для точного измерения"
4. Head turned during PD measurement → "Смотрите прямо в камеру"
5. User already wearing glasses → warn "Снимите очки для точного замера"

### Step 4.4 — Russian copy (2h)
1. All user-facing strings in Russian, consistent with site tone
2. Tooltip / help text for PD measurement explainer

### Step 4.5 — Buffer (5h)
1. Unknown unknowns — always reserved for unexpected issues
2. Performance regressions
3. Late-stage feedback fixes

---

## Critical files to create

| File | Purpose | Phase |
|---|---|---|
| `src/lib/vto/useFaceLandmarks.ts` | MediaPipe React hook | 1 |
| `src/lib/vto/calculatePD.ts` | Iris → PD math | 1 |
| `src/lib/vto/fitRecommendation.ts` | Narrow/perfect/wide logic | 2 |
| `src/lib/vto/oneEuroFilter.ts` | Smoothing | 3 |
| `src/components/PDMeasurement.tsx` | PD measurement UI | 1 |
| `src/components/FitBadge.tsx` | Colored fit chip | 2 |
| `src/components/CustomVTOCanvas.tsx` | three.js scene | 3 |
| `src/components/CustomVTOModal.tsx` | Replaces VirtualTryOnModal | 3 |
| `public/mediapipe/face_landmarker.task` | Vendored MediaPipe model | 1 |
| `public/glb/<sku>.glb` | Our own 3D models (1 per SKU) | 3 |

## Critical files to modify

| File | Change | Phase |
|---|---|---|
| `src/data/types.ts` | Add `measurements`, drop `vtoSku` | 2 |
| `src/data/products.ts` | Populate measurements + glb paths | 2/3 |
| `src/lib/store/cart.ts` | Add `userPD` + `setUserPD` | 1 |
| `src/components/ProductCard.tsx` | Use FitBadge, replace VirtualTryOnModal with CustomVTOModal | 2/3 |
| `src/routes/products.$slug.tsx` | Same | 2/3 |
| `src/routes/cabinet.tsx` | Add "Подбор размера" entry | 1 |
| `package.json` | Add deps, remove `jeelizvtowidget` | 1/3 |

## Files to delete (at the end)

| File | Why |
|---|---|
| `src/components/VirtualTryOnModal.tsx` | Replaced by CustomVTOModal |

---

## Decision points / risks

1. **3D model sourcing.** Phase 3 needs one GLB per frame in our catalog. Free path: Tripo image-to-3D + Blender cleanup (~1h per SKU). For 49 products: ~50h modeling work, **not included in the 90h dev estimate**. Either: pay a freelance Blender modeler ($15–25/SKU on Fiverr = $735–1,225), or budget another 50h ourselves.
2. **Webcam FOV calibration.** Different webcams have different FOVs. We assume 63° (typical laptop cam). If wildly off, scale will be inaccurate. Mitigation: ship a 1-time "hold a credit card to your forehead" calibration UI as a fallback if iris method fails. **Not in budget — add 4h if needed.**
3. **MediaPipe model size.** The `face_landmarker.task` file is ~3 MB. First-load cost matters on mobile. Mitigation: lazy-load on intent (when user clicks try-on button), not on page load.
4. **Stop-after-Phase-2 option.** PD measurement + fit badges deliver 70% of the customer value at 42% of the cost (38h vs 90h). Recommended if budget is tight or Jeeliz quality is acceptable for the AR visuals.

---

## Recommended rollout order

1. **Phase 1 + 2** ship together (38h / $570) — measurable customer-facing win: "now you can see if a frame fits before buying"
2. **Validate** with real users — does the fit badge drive purchases? Does PD measurement complete > 50%?
3. **Phase 3** only if data justifies it ($510 more for true-scale 3D)
4. **Phase 4** is mandatory before any rollout — non-negotiable QA

---

## Verification — end-to-end

1. Open `http://localhost:5173/cabinet`
2. Click "Подбор размера" → measure PD → save (saves to localStorage)
3. Navigate to `/opravy` → every ProductCard now shows fit badge
4. Open a frame with "Узкие" badge → PDP shows full fit explanation
5. Click "Примерить онлайн" → custom VTO modal opens (not Jeeliz)
6. Webcam tracks face at 30 fps, glasses render at catalog mm width
7. Toggle "Реальный размер" off/on → visible difference in apparent frame width
8. Run `npm run build` — bundle delta vs. main < 200 KB (MediaPipe + three.js lazy-loaded)
9. Lighthouse mobile score on `/opravy` ≥ existing baseline (VTO must not regress page perf)
