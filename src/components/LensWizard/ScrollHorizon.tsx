import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Decorative fade over the bottom of the wizard scroller.
 *
 * Its real job is erasing the hard horizontal line the sticky footer draws:
 * a full-width rule at the fold is what makes a clipped list read as finished.
 *
 * Deliberately NOT `mask-image` on the scroll container — a mask would fade the
 * focus ring of whichever option button sits at the boundary. Deliberately not
 * interactive: an `aria-hidden` container must never contain a control.
 */
export function ScrollHorizon({
  scrollRef,
}: {
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const atEnd = el.scrollHeight - el.scrollTop - el.clientHeight < 8;
      // focusout fires before focus lands, so this read is deferred by rAF.
      const focusWithin = el.contains(document.activeElement);
      setVisible(!atEnd && !focusWithin);
    };
    // rAF-coalesced: also what keeps ResizeObserver from looping.
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    el.addEventListener("scroll", schedule, { passive: true });
    el.addEventListener("focusin", schedule);
    el.addEventListener("focusout", schedule);
    window.addEventListener("resize", schedule);

    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    // Load-bearing: catches step 3's photochromic sub-section mounting, which
    // grows scrollHeight by ~1000px without firing a scroll event.
    if (el.firstElementChild) ro.observe(el.firstElementChild);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener("scroll", schedule);
      el.removeEventListener("focusin", schedule);
      el.removeEventListener("focusout", schedule);
      window.removeEventListener("resize", schedule);
      ro.disconnect();
    };
  }, [scrollRef]);

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 h-14 lg:hidden",
        "bg-gradient-to-t from-background via-background/85 to-transparent",
        "transition-opacity",
        visible ? "opacity-100" : "opacity-0",
      )}
      style={{
        transitionDuration: "var(--duration-snap)",
        transitionTimingFunction: "var(--ease-editorial)",
      }}
    />
  );
}
