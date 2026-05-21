## Appointment modal — Premium redesign

Rebuild `src/components/AppointmentModal.tsx` to match the chosen "Premium — soft cards" direction. Fix the layout overflow bug and replace the mechanical horizontal carousel with smooth cross-fade + slide transitions between steps.

### Visual changes (all 3 steps)

- Modal shell: `max-w-[820px]`, `rounded-[2rem]`, soft warm shadow, `min-h-[580px]`, two-column flex (stacks on mobile).
- **Left panel (320px)**: full-bleed step image with dark gradient overlay + subtle backdrop blur. Brand-red eyebrow "ОНЛАЙН-ЗАПИСЬ", Fraunces 3xl headline "Запись к врачу". Stepper: 36px circles — active = filled brand red with soft glow, completed = white with check, inactive = bordered at 40% opacity. Each step has its label plus a "Шаг 0X" caption. Background image cross-fades when the step changes.
- **Right panel**: cream background, `p-10`, content centered at max-w-400, close (×) top-right.
- **Inputs**: white cards with hairline border, `rounded-xl`, generous `py-4` height, brand-red leading icon, brand-tinted focus ring.
- **Choice cards** (age / service): `rounded-[1.25rem]`, soft border, hover `-translate-y-1`, selected state = `bg-ink` with white text and a brand-red check icon in the top-right corner.
- **Time grid (Step 2)**: 4-day columns, each slot is a pill with hover affordance; selected slot fills with ink.
- **Primary CTA**: full-width pill `py-5 rounded-2xl`, brand red, soft red glow shadow, lifts on hover, arrow icon nudges right.
- **Secondary "Назад"**: ghost pill with hairline border.
- **Success state (Step 3)**: large brand-tinted check medallion, Fraunces "Запись принята!" headline, soft helper copy.

### Motion

- Replace the `width: 300%` + `translateX` carousel with conditional rendering of the current step only.
- Wrap the active step in a div keyed by `step` with `animate-in fade-in-0 slide-in-from-right-4 duration-400 ease-[var(--ease-editorial)]` going forward, and `slide-in-from-left-4` going back. Track direction with a small `direction` state.
- Left-panel image swap stays as cross-fade (opacity transition on stacked `<img>` elements).
- Stepper circle state changes animate with `transition-all duration-300`.

### Tokens

Use semantic classes from `src/styles.css` (`bg-background`, `bg-cream`, `bg-surface`, `text-foreground`, `text-brand`, `bg-brand`, `bg-ink`, `border-border`, `shadow-xl`, `font-serif`) instead of inline OKLCH literals so the modal stays themable and dark-mode-safe.

### Logic — unchanged

All state, validation, salons/services/time-slot data, submit handler, reset-on-close, and Russian copy are preserved exactly. Only JSX/styling and the transition mechanism change. Props interface (`open`, `onOpenChange`) stays identical, so call sites in `src/routes/index.tsx` need no changes.

### Files touched

- `src/components/AppointmentModal.tsx` — full rewrite of the JSX and styling, same exports.

No new dependencies (uses the already-installed `tw-animate-css`). No data, route, or backend changes.