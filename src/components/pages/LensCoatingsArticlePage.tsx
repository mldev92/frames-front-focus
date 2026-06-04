import { useEffect, useRef } from "react";

import lensCoatingsCss from "@/content/pokrytiya-linz-dlya-ochkov.css?raw";
import lensCoatingsHtml from "@/content/pokrytiya-linz-dlya-ochkov.html?raw";

export function LensCoatingsArticlePage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const cleanups: Array<() => void> = [];
    const revealEls = Array.from(root.querySelectorAll<HTMLElement>(".reveal"));

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 },
      );

      revealEls.forEach((el) => observer.observe(el));
      cleanups.push(() => observer.disconnect());
    } else {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }

    const handleTocClick = (event: Event) => {
      event.preventDefault();

      const link = event.currentTarget as HTMLAnchorElement;
      const href = link.getAttribute("href");
      if (!href) return;

      const target = root.querySelector<HTMLElement>(href);
      if (!target) return;

      const y = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    };

    root.querySelectorAll<HTMLAnchorElement>('.toc-list a[href^="#"]').forEach((link) => {
      link.addEventListener("click", handleTocClick);
      cleanups.push(() => link.removeEventListener("click", handleTocClick));
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return (
    <>
      <style>{lensCoatingsCss}</style>
      <article
        ref={rootRef}
        className="lens-coatings-page"
        dangerouslySetInnerHTML={{ __html: lensCoatingsHtml }}
      />
    </>
  );
}
