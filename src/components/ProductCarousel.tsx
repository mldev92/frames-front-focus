import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/data/types";

export function ProductCarousel({ products }: { products: Product[] }) {
  const scroller = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={scroller}
        className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((p) => (
          <div
            key={p.slug}
            className="snap-start shrink-0 w-[70%] sm:w-[42%] md:w-[31%] lg:w-[23.5%]"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => scrollBy(-1)}
        aria-label="Назад"
        className="hidden md:flex absolute -left-3 top-[35%] -translate-y-1/2 h-10 w-10 rounded-full bg-background border border-border shadow-sm items-center justify-center hover:bg-cream"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => scrollBy(1)}
        aria-label="Вперёд"
        className="hidden md:flex absolute -right-3 top-[35%] -translate-y-1/2 h-10 w-10 rounded-full bg-background border border-border shadow-sm items-center justify-center hover:bg-cream"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
