import { useEffect, useState } from "react";
import {
  contactMyopiaModels,
  MYOPIA_CONTACT_SECTION,
  spectacleMyopiaModels,
} from "@/lib/myopia-lenses";
import { getCatalogPage, getStoreApiUrl } from "@/lib/api/bitrix";
import { apiFetch } from "@/lib/api/security";
import type { LensLineCard } from "@/lib/api/lens-recommend";
import { contactPackPrice, spectaclePairPrice } from "@/lib/myopia-prices";

type Prices = Partial<Record<string, number>>;

export function useMyopiaPrices(kind?: "spectacle" | "contact") {
  const [prices, setPrices] = useState<Prices>({});

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    function update(next: Prices) {
      if (!signal.aborted) setPrices((previous) => ({ ...previous, ...next }));
    }

    if (kind !== "contact") {
      void apiFetch(getStoreApiUrl("lens_lines.php?city=spb"), { signal })
        .then((response) => {
          if (!response.ok) throw new Error(`Каталог очковых линз: ${response.status}`);
          return response.json() as Promise<{ cards: LensLineCard[] }>;
        })
        .then(({ cards }) => cards)
        .then((lines) =>
          update(
            Object.fromEntries(
              spectacleMyopiaModels.map((model) => [model.slug, spectaclePairPrice(model, lines)]),
            ),
          ),
        )
        .catch(() => undefined);
    }

    if (kind !== "spectacle") {
      void getCatalogPage(MYOPIA_CONTACT_SECTION, { city: "spb", limit: 24 }, signal)
        .then(({ products }) =>
          update(
            Object.fromEntries(
              contactMyopiaModels.map((model) => [model.slug, contactPackPrice(model, products)]),
            ),
          ),
        )
        .catch(() => undefined);
    }

    return () => controller.abort();
  }, [kind]);

  return prices;
}
