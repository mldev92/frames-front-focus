import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { articles, articleHref } from "@/data/articles";

export default defineTool({
  name: "search_articles",
  title: "Search blog articles",
  description: "Search the store's blog articles about eyewear, lenses and eye health.",
  inputSchema: {
    query: z.string().describe("Free text matched against title and excerpt.").optional(),
    limit: z.number().int().describe("Max results, default 10.").optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ query, limit }) => {
    const q = query?.trim().toLowerCase();
    const results = articles
      .filter((a) => !q || `${a.title} ${a.excerpt}`.toLowerCase().includes(q))
      .slice(0, Math.max(1, Math.min(limit ?? 10, 50)))
      .map((a) => ({
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        category: a.category,
        date: a.date,
        url: articleHref(a),
      }));
    return {
      content: [{ type: "text", text: JSON.stringify({ count: results.length, results }, null, 2) }],
      structuredContent: { count: results.length, results },
    };
  },
});
