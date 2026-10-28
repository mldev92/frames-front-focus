import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppointmentModal } from "@/components/AppointmentModal";
import { getStellestLensProducts } from "@/lib/api/bitrix";
import { productCardHref } from "@/data/categories";
import type { Product } from "@/data/types";
import { fetchLensSearch, type LensRecommendCard } from "@/lib/api/lens-recommend";
import { formatPrice, useCart } from "@/lib/store/cart";
import { CONTACT } from "@/data/contact";
import { PriceSavings } from "@/components/PriceSavings";
import { DEFAULT_REGION, useCityStore } from "@/lib/store/city";

import stellestCss from "@/content/stellest-katalog-s-linzami.css?raw";
import stellestHtml from "@/content/stellest-katalog-s-linzami.html?raw";

const stellestInnerHtml = { __html: stellestHtml };

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
      { property: "og:image", content: "/stellest/hero-child-stellest.webp" },
    ],
  }),
  loader: () => getStellestLensProducts("spb", DEFAULT_REGION),
  component: StellestCatalogPage,
});

function StellestCatalogPage() {
  const [aptOpen, setAptOpen] = useState(false);
  const [catalogTarget, setCatalogTarget] = useState<HTMLElement | null>(null);
  const [liveLensTarget, setLiveLensTarget] = useState<HTMLElement | null>(null);
  const city = useCityStore((state) => state.city);
  const region = useCityStore((state) => state.region);
  const loaderLenses = Route.useLoaderData();
  const { data: lensProducts = [] } = useQuery({
    queryKey: ["stellest-contact-lenses", city, region],
    queryFn: () => getStellestLensProducts(city, region),
    initialData: region === DEFAULT_REGION ? loaderLenses : undefined,
    placeholderData: region === "spb" ? () => loaderLenses : undefined,
  });
  // Если в админке для города ничего не выбрано, остаются статичные карточки из HTML.
  const showLiveLenses = lensProducts.length > 0 && liveLensTarget !== null;
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    setCatalogTarget(root.querySelector<HTMLElement>("#stellest-lens-catalog"));
    setLiveLensTarget(root.querySelector<HTMLElement>("#stellest-contact-lens-live"));

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

    root.querySelectorAll<HTMLElement>("[data-open-appointment]").forEach((trigger) => {
      addClick(trigger, (event) => {
        event.preventDefault();
        setAptOpen(true);
      });
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  useEffect(() => {
    const staticGrid = rootRef.current?.querySelector<HTMLElement>("#stellest-contact-lens-static");
    if (staticGrid) staticGrid.style.display = showLiveLenses ? "none" : "";
  }, [showLiveLenses]);

  return (
    <>
      <style>{stellestCss}</style>
      <div
        ref={rootRef}
        className="stellest-page"
        dangerouslySetInnerHTML={stellestInnerHtml}
      />
      {catalogTarget && createPortal(
        <StellestLensCatalog onBook={() => setAptOpen(true)} />,
        catalogTarget,
      )}
      {showLiveLenses && createPortal(
        <StellestContactLenses products={lensProducts} />,
        liveLensTarget,
      )}
      <AppointmentModal open={aptOpen} onOpenChange={setAptOpen} />
    </>
  );
}

function StellestContactLenses({ products }: { products: Product[] }) {
  return (
    <div className="prod-grid">
      {products.map((product) => {
        const href = productCardHref(product);
        return (
          <article className="prod-card" key={product.id ?? product.slug}>
            <a className="prod-photo" href={href} tabIndex={-1} aria-hidden="true">
              <img src={product.images[0] ?? "/no-product-image.svg"} alt="" loading="lazy" />
            </a>
            <div className="prod-info">
              <div className="prod-brand">{product.brand}</div>
              <a className="prod-name" href={href}>{product.name.trim()}</a>
              {product.wearMode && <div className="prod-desc">Замена: {product.wearMode}</div>}
              <div className="prod-foot">
                <span className="prod-meta">{formatPrice(product.price)} / упак.</span>
                <a href={href} className="prod-link">Подробнее</a>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function StellestLensCatalog({ onBook }: { onBook: () => void }) {
  const city = useCityStore((state) => state.city);
  const addLens = useCart((state) => state.addLens);
  const [offers, setOffers] = useState<LensRecommendCard[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setOffers(null);
    setError(false);
    fetchLensSearch("Stellest", { limit: 100 }, controller.signal)
      .then((result) => {
        setOffers(result.matches
          .filter((offer) => offer.line.toLowerCase().includes("stellest"))
          .sort((a, b) => (a.priceRub ?? Infinity) - (b.priceRub ?? Infinity)
            || a.line.localeCompare(b.line, "ru")));
      })
      .catch((reason: unknown) => {
        if ((reason as Error).name !== "AbortError") setError(true);
      });
    return () => controller.abort();
  }, [city]);

  if (error) return <p className="text-center">Каталог временно недоступен. Уточните варианты в салоне.</p>;
  if (!offers) return <p className="text-center">Загружаем варианты Stellest…</p>;
  if (!offers.length) return <p className="text-center">Варианты Stellest уточняются. Свяжитесь с салоном.</p>;

  return (
    <div className="coat-grid reveal is-visible">
      {offers.map((offer) => {
        const plano = offer.line.toLowerCase().includes("plano");
        const tint = offer.line.toLowerCase().includes("tint");
        const rock = offer.line === "AS Stellest Airwear" && offer.coating === "Crizal Rock";
        const title = plano
          ? "ESSILOR AS Stellest Airwear Plano Crizal Prevencia"
          : `ESSILOR ${offer.line} ${offer.coating}`;
        const image = tint
          ? "/stellest/stellest-crizal-sun-xprotect.webp"
          : offer.line.includes("2.0")
            ? "/stellest/stellest-2-girl.webp"
            : offer.coating.toLowerCase().includes("prevencia")
              ? "/stellest/stellest-crizal-prevencia.webp"
              : "/stellest/stellest-crizal-rock.webp";
        return (
          <article className="coat-card" key={offer.id}>
            <div className="coat-photo"><img src={image} alt="" loading="lazy" /></div>
            <div className="coat-body">
              <div className="coat-num">Essilor Stellest · {offer.index?.toFixed(2) ?? "1.59"}</div>
              <h3>{title}</h3>
              <p>{plano ? "Профилактика миопии · Sph 0,0 / Cyl 0,0" : tint
                ? "Тонированные линзы Stellest" : "Очковые линзы для контроля миопии"}</p>
              {city === "spb" && (plano || tint || rock) && (
                <p className="stellest-offer-condition">
                  {plano ? "Скидка 50%" : tint
                    ? "Скидка 50% при покупке прозрачных линз Stellest"
                    : "Скидка 20%"}
                </p>
              )}
              <div className="coat-price-row">
                <span className="coat-price">
                  {offer.priceRub !== null ? formatPrice(offer.priceRub) : "Цена по запросу"}
                  <small>за шт.</small>
                  {offer.priceBeforeDiscountRub !== null && (
                    <small className="stellest-old-price">{formatPrice(offer.priceBeforeDiscountRub)}</small>
                  )}
                  <PriceSavings
                    oldPrice={offer.priceBeforeDiscountRub}
                    price={offer.priceRub}
                    discountPercent={offer.discountPercent}
                    className="stellest-price-savings"
                  />
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className="coat-btn" onClick={() => addLens(offer)}>В корзину</button>
                <a href={CONTACT.phone.href} className="coat-btn">Позвонить в салон</a>
                <button type="button" className="coat-btn" onClick={onBook}>Записаться на приём</button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
