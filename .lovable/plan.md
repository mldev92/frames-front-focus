## Goal

Bring the homepage closer to the Warby Parker reference: lighter, airier, more editorial, with horizontal carousels, magazine-style triptychs, and a prominent benefits/insurance band.

## Section-by-section changes to `src/routes/index.tsx`

1. **Hero** — Rework current dark-overlay hero into a brighter lifestyle banner.
   - Lighter gradient (only left ~40%, soft fade)
   - Smaller, tighter headline; pill-shaped primary CTAs ("Подобрать оправу", "Каталог очков")
   - Thin row of 4 trust signals overlaid at bottom: "Бесплатная доставка", "Гарантия 12 мес.", "Возврат 14 дней", "Примерка онлайн"

2. **New arrivals carousel** (replaces current grid)
   - Horizontal scroll/snap row of product cards with arrow controls
   - Card hover reveals "Примерить" pill + heart icon top-left
   - Color swatches under the price
   - "Смотреть все новинки" pill button in the section header (right)

3. **Editorial triptych** (new) — 3 large image cards side by side
   - "Дизайн из Италии · Tutto Collection", "Винтаж 90-х", "Спорт и активность"
   - Each card has white pill CTA at the bottom-left, full-bleed image, rounded corners

4. **"Четыре способа купить" tiles** (replaces current categories block, keeps 5 cats → choose 4 most relevant)
   - 4 equal portrait cards: Оправы с диоптриями · Солнцезащитные · Контактные линзы · Запись на проверку
   - White pill labels, soft pastel backgrounds, no heavy dark overlay
   - Centered section title above

5. **Bestsellers** — convert to same carousel pattern as New arrivals for consistency

6. **Brand promise band** (new, replaces current dark "контроль миопии" CTA block)
   - Full-width brand-red band with centered headline "Подбор очков — это просто"
   - Sub-line + 4 inline mini-steps (Выбор → Линзы → Примерка → Доставка)
   - Single white pill CTA

7. **Services** — keep but lighten: remove dark gradient overlay, white card with image on top + title/CTA below (matches reference's clean tile style)

8. **Editorial split** (keep myopia/children section but restyle)
   - Light cream background instead of black
   - Serif headline left, image right with rounded corners
   - Small green eyebrow text like reference's "We've got your eyes covered"

9. **App / advisor section** (new, optional) — phone mockup left, text right
   - "Подбор оправы у вас в кармане" + small CTA
   - Skip if no phone asset; replace with salon locator teaser

10. **Journal** — keep, but switch to 3-up with larger images, thinner type, subtle category chip

## Shared visual upgrades (`src/styles.css` + components)

- Introduce a `--surface-cream` token (warm off-white) for alternating section backgrounds
- Standardize CTA buttons to rounded-full pills (`rounded-full px-5 py-2.5`) — add a `Button` variant `pill`
- Tighter type scale on hero (down from 7xl → 6xl) but more generous line-height
- Use existing brand red sparingly — accents and one band only, not on every CTA
- Larger image radius (`rounded-lg`) across cards for the modern editorial feel

## New small components

- `src/components/ProductCarousel.tsx` — horizontal snap carousel with prev/next arrows, reused for New arrivals + Bestsellers
- `src/components/EditorialTriptych.tsx` — 3-image side-by-side block with pill CTAs
- `src/components/BrandPromiseBand.tsx` — full-width red band with 4 mini-steps

## Out of scope

- No new routes, no data model changes, no backend
- Header/Footer untouched
- Product card internals only get a light hover-pill addition (no behavior change)

## Assets

Reuse existing `/category_*_gemini.png`, `/services*.png`, `/main_banner_v2.png`, `/main_bottom_child_banner.png`. No new image generation required for the first pass; we can swap in generated lifestyle shots later if you want.
