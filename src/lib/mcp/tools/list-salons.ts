import { defineTool } from "@lovable.dev/mcp-js";
import { salons } from "@/data/salons";

export default defineTool({
  name: "list_salons",
  title: "List salons",
  description: "List the ОПТИКА 100% optical salons with addresses, metro, phones and opening hours.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const results = salons.map((s) => ({
      id: s.id,
      name: s.name,
      address: s.address,
      metro: s.metro,
      phone: s.phone,
      hours: s.hours,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      structuredContent: { salons: results },
    };
  },
});
