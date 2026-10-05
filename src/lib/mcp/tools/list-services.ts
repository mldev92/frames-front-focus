import { defineTool } from "@lovable.dev/mcp-js";
import { getServicePrice, services, serviceHref } from "@/data/services";

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
      price: getServicePrice(s, "spb"),
      pricesByCity: {
        spb: getServicePrice(s, "spb"),
        nvk: getServicePrice(s, "nvk"),
      },
      duration: s.duration,
      includes: s.includes,
      url: serviceHref(s.slug, "spb"),
      urlsByCity: {
        spb: serviceHref(s.slug, "spb"),
        nvk: serviceHref(s.slug, "nvk"),
      },
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      structuredContent: { services: results },
    };
  },
});
