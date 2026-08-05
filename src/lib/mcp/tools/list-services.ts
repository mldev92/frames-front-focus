import { defineTool } from "@lovable.dev/mcp-js";
import { services, serviceHref } from "@/data/services";

export default defineTool({
  name: "list_services",
  title: "List clinic services",
  description: "List vision-clinic services (diagnostics, doctor appointments, fitting, repair) with price and duration.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const results = services.map((s) => ({
      slug: s.slug,
      title: s.title,
      short: s.short,
      price: s.price,
      duration: s.duration,
      includes: s.includes,
      url: serviceHref(s.slug),
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      structuredContent: { services: results },
    };
  },
});
