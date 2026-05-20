## Product page redesign — Warby Parker style with sticky purchase card

### Layout changes (`src/routes/products.$slug.tsx`)

**1. Container: full-width like catalog**
- Remove `mx-auto max-w-7xl` from the root wrapper.
- Use `px-6 lg:px-10` for breathing room edge-to-edge.

**2. Three-column grid**
Reference layout: thumbnail rail (left, narrow) + big gallery (center) + sticky purchase card (right, narrow).

```text
[thumbs 80px] [ gallery flex-1 ] [ purchase card ~380px ]
```

- Thumbnails move from a horizontal strip *below* the gallery to a vertical rail on the **left** of the gallery, stacked top-to-bottom (incl. the VTO icon as the last tile).
- Gallery becomes the dominant central element on a soft grey/cream background card (`bg-surface`, rounded), with `Try on` pill in top-right corner of the gallery (matches reference).
- Right column becomes the **sticky purchase card** — see below.

**3. Sticky purchase card (the key feature)**
The right card stays fixed to the viewport while the user scrolls the long left content (tabs, specs, related), then "releases" when its container ends — exactly like the reference.

Implementation: pure CSS, no JS.
- Wrap the right column with `<aside className="lg:sticky lg:top-24 lg:self-start h-fit">`.
- `self-start` on the grid item + `sticky top-24` makes the card stick while the sibling column scrolls, and naturally unstick at the parent container's bottom.
- Card visual: white background, rounded, subtle border + soft shadow, internal padding `p-6`, contains:
  - Brand eyebrow + product name
  - Price + installment line
  - Color swatches (compact)
  - Primary CTA "Подобрать линзы и купить" (full-width, brand color, prominent)
  - Secondary: "Купить оправу без линз" (ghost)
  - Heart save button (icon-only, top-right of card)
  - Trust strip (compact 3-up: доставка / гарантия / возврат)

**4. Left column content reorder**
Now that the purchase card moved right, the left column holds:
- Gallery (with vertical thumbnail rail beside it)
- Below gallery: long-form content that scrolls past the sticky card:
  - "Что включено за {price}" feature list (NEW — mirrors reference: checkmark list of bundled benefits like "Однодневная доставка", "Бесплатная подгонка", "Защита от царапин 12 мес", etc.) — render from a static array in the same file.
  - Specs table (existing, but as accordion section, not tab)
  - "Как подобрать" (accordion)
  - "Доставка и возврат" (accordion)
  - "Нужен рецепт?" accordion containing the existing `PrescriptionInput`
  - About the brand (accordion stub)

Convert the current tabs into stacked accordion sections (reuse `@/components/ui/accordion`), which matches the reference exactly and makes the page tall enough for the sticky card to demonstrate its behavior.

**5. Prescription input placement**
Currently always shown inline. Move it inside the "Нужен рецепт?" accordion so the main column stays scannable.

**6. Lens modal trigger**
The "Подобрать линзы" inline button is removed — its job is taken by the primary CTA in the sticky card ("Подобрать линзы и купить"), which opens `LensPurposeModal` (or adds to cart for non-lens products).

**7. Related products section**
Stays full-width below the grid, unchanged structurally.

### What does NOT change
- No data model changes.
- No new routes, no backend changes.
- `LensPurposeModal`, `PrescriptionInput`, `VirtualTryOnModal`, `TBankWidget`, `ProductCard` reused as-is.
- Mobile: grid collapses to single column, purchase card becomes a normal block (no sticky on mobile — `lg:sticky` only).

### Files touched
- `src/routes/products.$slug.tsx` — full restructure of the JSX (logic preserved).
- No new components required (accordion already exists at `src/components/ui/accordion.tsx`).

### Visual polish
- Gallery background: `bg-surface` rounded-lg, generous aspect-square area, image centered with `object-contain`.
- Purchase card: white, `border border-border`, `shadow-sm`, `rounded-lg`.
- Primary CTA: brand red, `rounded-full` pill (matches the modern pill style introduced on the homepage), large padding.
- Vertical thumb rail: 64px wide tiles, 2px brand border when active.
