import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { products } from "@/data/products";
import { productHref } from "@/data/categories";

export default defineTool({
  name: "search_products",
  title: "Search products",
  description:
    "Search the ОПТИКА 100% catalog (frames, sunglasses, contact lenses, spectacle lenses, accessories) by text, category, brand and price.",
  inputSchema: {
    query: z.string().describe("Free text matched against name, brand, description, shape or material.").optional(),
    category: z
      .string()
      .describe("Category slug, e.g. opravy, solntsezashchitnye, kontaktnye-linzy, linzy-dlya-ochkov, aksessuary.")
      .optional(),
    brand: z.string().describe("Brand name filter (case-insensitive substring).").optional(),
    maxPrice: z.number().describe("Maximum price in RUB.").optional(),
    limit: z.number().int().describe("Max results, default 20.").optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ query, category, brand, maxPrice, limit }) => {
    const q = query?.trim().toLowerCase();
    const results = products
      .filter((p) => {
        if (category && p.category !== category) return false;
        if (brand && !p.brand.toLowerCase().includes(brand.toLowerCase())) return false;
        if (typeof maxPrice === "number" && p.price > maxPrice) return false;
        if (!q) return true;
        return [p.name, p.brand, p.description, p.shape, p.material]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q));
      })
      .slice(0, Math.max(1, Math.min(limit ?? 20, 50)))
      .map((p) => ({
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        category: p.category,
        price: p.price,
        oldPrice: p.oldPrice,
        shape: p.shape,
        material: p.material,
        gender: p.gender,
        inStock: p.inStock !== false,
        url: p.canonicalPath ?? productHref(p.category, p.slug),
      }));

    return {
      content: [{ type: "text", text: JSON.stringify({ count: results.length, results }, null, 2) }],
      structuredContent: { count: results.length, results },
    };
  },
});
