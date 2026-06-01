import { useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";

import stellestCss from "@/content/stellest-katalog-s-linzami.css?raw";
import stellestHtml from "@/content/stellest-katalog-s-linzami.html?raw";

export const Route = createFileRoute("/stellest-katalog-s-linzami")({
  head: () => ({
    meta: [
      { title: "Контроль миопии Stellest · ОПТИКА 100%" },
      {
        name: "description",
        content:
          "Контроль миопии у детей: линзы Essilor Stellest, MiSight 1 Day, диагностика и наблюдение в ОПТИКА 100%.",
      },
      { property: "og:title", content: "Контроль миопии Stellest · ОПТИКА 100%" },
      { property: "og:image", content: "/stellest/hero-child-stellest.png" },
    ],
  }),
  component: StellestCatalogPage,
});

function StellestCatalogPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const cleanups: Array<() => void> = [];

    const revealEls = Array.from(root.querySelectorAll<HTMLElement>(".reveal"));
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 },
      );

      revealEls.forEach((el) => io.observe(el));
      cleanups.push(() => io.disconnect());
    } else {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }

    const quizAnswers: Record<string, number> = {};
    const quizCard = root.querySelector<HTMLElement>("#quiz");

    const quizGo = (step: string) => {
      if (!quizCard) return;

      quizCard.querySelectorAll<HTMLElement>(".quiz-step").forEach((el) => {
        el.classList.remove("active");
      });

      const next = quizCard.querySelector<HTMLElement>(`[data-step="${step}"]`);
      if (next) {
        next.classList.add("active");
        root
          .querySelector<HTMLElement>(".quiz-wrap")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };

    const quizShowResult = () => {
      const total = Object.values(quizAnswers).reduce((sum, value) => sum + value, 0);
      const badge = root.querySelector<HTMLElement>("#qr-badge");
      const title = root.querySelector<HTMLElement>("#qr-title");
      const text = root.querySelector<HTMLElement>("#qr-text");
      if (!badge || !title || !text) return;

      if (total <= 3) {
        badge.className = "qr-badge qr-low";
        badge.textContent = "Низкий риск";
        title.textContent = "Низкий риск близорукости";
        text.textContent =
          "На основании предоставленной вами информации мы оцениваем риск прогрессирования близорукости у вашего ребёнка как низкий. Тем не менее, рекомендуем регулярно проверять зрение — особенно если в семье есть случаи миопии.";
      } else if (total <= 6) {
        badge.className = "qr-badge qr-mid";
        badge.textContent = "Средний риск";
        title.textContent = "Средний риск близорукости";
        text.textContent =
          "На основании предоставленной вами информации мы оцениваем риск прогрессирования близорукости у вашего ребёнка как умеренный. Наши специалисты по близорукости готовы провести подробную консультацию в наших филиалах.";
      } else {
        badge.className = "qr-badge qr-high";
        badge.textContent = "Высокий риск";
        title.textContent = "Высокий риск близорукости";
        text.textContent =
          "На основании предоставленной вами информации мы оцениваем риск прогрессирования близорукости у вашего ребёнка как высокий. Мы настоятельно рекомендуем обратиться к нашим специалистам для диагностики и подбора программы контроля миопии.";
      }
    };

    const quizReset = () => {
      Object.keys(quizAnswers).forEach((key) => delete quizAnswers[key]);
      root.querySelectorAll<HTMLElement>(".quiz-opt").forEach((el) => {
        el.classList.remove("selected");
      });
      root.querySelectorAll<HTMLElement>(".quiz-btn-next").forEach((el) => {
        el.classList.remove("enabled");
      });
      quizGo("0");
    };

    const addClick = (el: Element, handler: EventListener) => {
      el.addEventListener("click", handler);
      cleanups.push(() => el.removeEventListener("click", handler));
    };

    root.querySelectorAll<HTMLElement>("[data-quiz-start]").forEach((button) => {
      addClick(button, () => quizGo("1"));
    });

    root.querySelectorAll<HTMLElement>(".quiz-options").forEach((group) => {
      group.querySelectorAll<HTMLButtonElement>(".quiz-opt").forEach((button) => {
        addClick(button, () => {
          group.querySelectorAll<HTMLElement>(".quiz-opt").forEach((el) => {
            el.classList.remove("selected");
          });

          button.classList.add("selected");

          const questionId = group.dataset.qid;
          const value = Number(button.dataset.val || 0);
          if (questionId) quizAnswers[questionId] = value;

          button.closest(".quiz-step")?.querySelector(".quiz-btn-next")?.classList.add("enabled");
        });
      });
    });

    root.querySelectorAll<HTMLButtonElement>(".quiz-btn-next").forEach((button) => {
      addClick(button, () => {
        if (!button.classList.contains("enabled")) return;

        const target = button.dataset.to;
        if (!target) return;
        if (target === "result") quizShowResult();
        quizGo(target);
      });
    });

    root.querySelectorAll<HTMLElement>("[data-quiz-reset]").forEach((button) => {
      addClick(button, quizReset);
    });

    root.querySelectorAll<HTMLElement>(".cert-carousel").forEach((carousel) => {
      const slides = Array.from(carousel.querySelectorAll<HTMLElement>(".cert-slide"));
      const dots = Array.from(carousel.querySelectorAll<HTMLButtonElement>(".cert-dot"));
      let current = Math.max(
        0,
        slides.findIndex((slide) => slide.classList.contains("active")),
      );

      const goTo = (index: number) => {
        if (!slides.length) return;

        slides[current]?.classList.remove("active");
        dots[current]?.classList.remove("active");
        current = (index + slides.length) % slides.length;
        slides[current].classList.add("active");
        dots[current]?.classList.add("active");
      };

      const prev = carousel.querySelector<HTMLButtonElement>(".cert-prev");
      const next = carousel.querySelector<HTMLButtonElement>(".cert-next");

      if (prev) addClick(prev, () => goTo(current - 1));
      if (next) addClick(next, () => goTo(current + 1));

      dots.forEach((dot, index) => {
        addClick(dot, () => goTo(Number(dot.dataset.idx ?? index)));
      });
    });

    root.querySelectorAll<HTMLButtonElement>(".faq-q").forEach((button) => {
      addClick(button, () => {
        const item = button.closest(".faq-item");
        if (!item) return;

        const wasOpen = item.classList.contains("open");
        root.querySelectorAll<HTMLElement>(".faq-item").forEach((el) => {
          el.classList.remove("open");
        });
        if (!wasOpen) item.classList.add("open");
      });
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return (
    <>
      <style>{stellestCss}</style>
      <div
        ref={rootRef}
        className="stellest-page"
        dangerouslySetInnerHTML={{ __html: stellestHtml }}
      />
    </>
  );
}
