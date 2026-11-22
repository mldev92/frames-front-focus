import { useEffect, useState } from "react";
import {
  contactMyopiaModels,
  MYOPIA_CONTACT_SECTION,
  spectacleMyopiaModels,
} from "@/data/myopia-lenses";
import { getCatalogPage } from "@/lib/api/bitrix";
import { fetchLensLines } from "@/lib/api/lens-recommend";
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
      void fetchLensLines(signal, "spb")
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
