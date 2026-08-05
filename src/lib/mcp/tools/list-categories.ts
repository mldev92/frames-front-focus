import { defineTool } from "@lovable.dev/mcp-js";
import { categories, catalogHref } from "@/data/categories";
import { products } from "@/data/products";

export default defineTool({
  name: "list_categories",
  title: "List catalog categories",
  description: "List the catalog categories of the store with product counts and URLs.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const results = categories.map((c) => ({
      slug: c.slug,
      title: c.title,
      productCount: products.filter((p) => p.category === c.slug).length,
      url: catalogHref(c.slug),
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      structuredContent: { categories: results },
    };
  },
});
