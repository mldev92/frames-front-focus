# Virtual Try-On — How It's Wired

## TL;DR
We use **Jeeliz Glasses VTO Widget** as a black-box AR engine. We feed it a DOM element and a SKU string. It returns a live webcam canvas with 3D glasses tracked on the user's face. We don't own the tracking, the 3D models, or the rendering — only the UI shell around it.

---

## The end-to-end click path

### Step 1 — User clicks the badge
1. User hovers a product on `/opravy` (category page) → `ProductCard` shows the `TryOnBadge` overlay
2. User clicks → `e.preventDefault()` + `e.stopPropagation()` block the `<Link>` navigation
3. `setVtoOpen(true)` fires in `ProductCard` state

File: `src/components/ProductCard.tsx`

### Step 2 — Modal mounts
1. `<VirtualTryOnModal open={true} vtoSku={...} />` renders
2. The modal returns a fixed-position overlay containing:
   - A `<div ref={placeHolderRef}>` (size: fills modal body)
   - A `<canvas ref={canvasRef}>` (Jeeliz renders here)
3. `useEffect(open)` fires

File: `src/components/VirtualTryOnModal.tsx`

### Step 3 — Lazy-load Jeeliz module
1. `requestAnimationFrame` waits for the canvas to be painted
2. `await import("jeelizvtowidget")` pulls in the 280 KB chunk (separate from main bundle)
3. The module exports a single object: `JEELIZVTOWIDGET`

### Step 4 — Hand the canvas to Jeeliz
We call `JEELIZVTOWIDGET.start({ ... })` with this config:

```ts
{
  placeHolder: HTMLDivElement,        // OUR div — Jeeliz sizes itself to this
  canvas: HTMLCanvasElement,           // OUR canvas — Jeeliz draws into this
  sku: "rayban_aviator_or_vertFlash",  // Jeeliz's internal GlassesDB ID
  searchImageMask: "https://appstatic.jeeliz.com/...",  // "face not found" image
  callbacks: {
    LOADING_START: () => setStatus("loading"),
    LOADING_END:   () => setStatus("ready"),
  },
  callbackReady: () => setStatus("ready"),
  onError: (label) => setError(label),
}
```

### Step 5 — Jeeliz takes over
Inside `JEELIZVTOWIDGET.start()` (closed-source, minified):
1. Requests webcam via `navigator.mediaDevices.getUserMedia({ video: true })`
2. Downloads neural-net weights from `https://appstatic.jeeliz.com/...`
3. Downloads the 3D glasses model for the SKU from `https://glassesdbcached.jeeliz.com/sku/<sku>`
4. Spins up a WebGL2 context on our canvas
5. Per frame (~30 fps):
   - Pulls frame from `<video>`
   - Runs face-detection neural net → landmarks + head pose matrix
   - Renders the 3D model anchored to the face, with PBR lighting + raytraced shadows
   - Draws into our canvas

### Step 6 — Cleanup
1. User closes the modal → `setVtoOpen(false)`
2. Modal stays mounted (canvas survives in DOM)
3. `useEffect` cleanup runs `JEELIZVTOWIDGET.destroy()` while canvas is still alive
4. Webcam stream released, WebGL context disposed

---

## What WE own vs. what Jeeliz owns

| Layer | Who owns it | Where |
|---|---|---|
| Trigger button (TryOnBadge) | **We** | `src/components/TryOnIcon.tsx` |
| Modal shell + open/close state | **We** | `src/components/VirtualTryOnModal.tsx` |
| Loading / error UI | **We** | inside the modal |
| Webcam permission UX (browser native) | Browser | n/a |
| Face detection neural network | **Jeeliz** | `appstatic.jeeliz.com` (downloaded at runtime) |
| Face landmark tracking | **Jeeliz** | inside `JeelizVTOWidget.module.js` |
| Head pose estimation | **Jeeliz** | same module |
| 3D model storage | **Jeeliz** | `glassesdbcached.jeeliz.com/sku/<sku>` |
| 3D model format | **Jeeliz** | proprietary, not GLB |
| PBR rendering engine | **Jeeliz** | their custom WebGL2 deferred renderer |
| Shadow / lighting | **Jeeliz** | inside the module |
| Frame catalog (~350 SKUs) | **Jeeliz** | `glassesSKU.csv` in their repo |

We feed it 2 inputs (DOM nodes + SKU string) and get pixels back. Everything in between is a black box.

---

## What we know about how Jeeliz works internally

From poking the minified module:
1. **Neural net** — convolutional network for face detection. They call it "WebAR.rocks" tech. Compressed weights live at the `appstatic.jeeliz.com` CDN.
2. **3D models** — stored as a proprietary JSON format (not GLB/glTF). Each SKU fetches a JSON blob with mesh geometry + PBR textures.
3. **No real-world scale** — frames are sized to "look right" on the detected face bbox. No pupillary distance measurement, no mm calibration.
4. **License** — proprietary. Free for <10 models / non-commercial / not-yet-public. Paid plan needed beyond that.

---

## Could you build this yourself? Yes — here's the recipe

### Replacement stack (all free / Apache 2.0 / MIT)
1. **MediaPipe Face Landmarker** — face detection + 478 landmarks + head pose matrix (Apache 2.0)
2. **three.js** — WebGL renderer
3. **`@react-three/fiber`** — React bindings for three.js (optional, simpler than raw three.js)
4. **GLB models** — standard glTF 2.0 binaries, you build/buy them per frame

### Step-by-step DIY plan
1. **Day 1** — replace `JEELIZVTOWIDGET.start()` with MediaPipe Face Landmarker. Get 478 landmarks per frame on the user's face in a `<canvas>`
2. **Day 2** — render the webcam video as a background plane in three.js. Position a placeholder cube where the face bridge would be (landmark indices 168, 6, 197 — between the eyes)
3. **Day 3** — load a sample GLB with `GLTFLoader`. Replace the cube with the loaded mesh. Anchor its position to the face-bridge landmark, rotation to MediaPipe's head pose matrix.
4. **Day 4** — smoothing: One-Euro filter on the pose matrix to kill jitter. Without this it'll shake violently.
5. **Day 5** — occlusion: render a depth-only invisible head mesh (MediaPipe has a canonical face mesh) so glasses go behind ears, in front of nose, correctly.
6. **Days 6–8** — polish: lighting (HDRI env map), shadows (planar projection), mobile perf, lens transparency.
7. **Days 9–10** — calibration: use iris diameter (11.7 mm constant) for **real PD measurement** and **true-mm frame scale** — something Jeeliz can't do.

### What you give up vs. Jeeliz
1. PBR shading quality (Jeeliz has 5+ years of polish)
2. Robust tracking in bad lighting (Jeeliz's NN is very forgiving)
3. Pre-built 350-frame catalog (you bring your own GLBs)

### What you GAIN
1. Real-world mm scale (Jeeliz's biggest blind spot)
2. PD measurement in millimeters
3. Bring-your-own GLB models (no Jeeliz fees, no SKU lookup)
4. Apache 2.0 / MIT licensing — commercial use OK at any scale
5. Full control over the rendering pipeline

### Reference open-source projects to study
1. `gosiacodes/React-PD-Meter-App` — React + MediaPipe PD measurement (closest to what we'd want)
2. `breathingcyborg/mediapipe-face-effects` — three.js + MediaPipe face overlays
3. `bensonruan/Virtual-Glasses-Try-on` — full DIY glasses VTO with face-api.js
4. `jeeliz/jeelizPupillometry` — open-source pupil tracking (different Jeeliz repo, this one IS Apache 2.0)
5. `hiukim/mind-ar-js` — MIT-licensed alternative to Jeeliz, lower polish but functional

---

## What's in our codebase today

```
src/
├── components/
│   ├── ProductCard.tsx           ← TryOnBadge + per-card vtoOpen state + modal
│   ├── TryOnIcon.tsx             ← The visual badge + SVG icon
│   └── VirtualTryOnModal.tsx     ← The modal shell + Jeeliz integration
├── routes/
│   └── products.$slug.tsx        ← PDP: badge in image + thumbnail strip icon + modal
└── data/
    ├── types.ts                  ← Product.vtoSku?: string
    └── products.ts               ← One pilot product has vtoSku set

node_modules/
└── jeelizvtowidget/              ← The closed-source dependency
    ├── index.js                  ← ESM wrapper (4 lines)
    └── dist/
        └── JeelizVTOWidget.module.js   ← 279 KB minified WebGL engine
```

Total code we wrote for VTO: **~200 lines**. The other ~280 KB is Jeeliz.

---

## Summary

We use Jeeliz the way you'd use Google Maps — wire up the host element, pass a config, get a working result. Jeeliz handles the hard parts (face tracking, 3D rendering, models). We handle the UI.

To rebuild it yourself: ~2 weeks of dev with MediaPipe + three.js, free licensing, and you get real-world scale measurement as a bonus. The face-tracking quality won't match Jeeliz on day one, but for an MVP it's good enough — and the licensing trade-off (Apache 2.0 vs. proprietary <10-model limit) matters a lot once you scale past a pilot.
