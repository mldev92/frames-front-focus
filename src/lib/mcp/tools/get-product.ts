import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getProduct } from "@/data/products";
import { productHref } from "@/data/categories";

export default defineTool({
  name: "get_product",
  title: "Get product",
  description: "Get full details for one catalog product by its slug (specs, colors, price, description).",
  inputSchema: { slug: z.string().min(1).describe("Product slug, e.g. vysota-oversize-crystal.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ slug }) => {
    const product = getProduct(slug);
    if (!product) throw new ToolError(`No product found with slug "${slug}".`);

    const payload = {
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price,
      oldPrice: product.oldPrice,
      description: product.description,
      specs: product.specs,
      characteristics: product.characteristics,
      colors: product.colors?.map((c) => ({ name: c.name, hex: c.hex })),
      shape: product.shape,
      material: product.material,
      gender: product.gender,
      size: product.size,
      badges: product.badges,
      inStock: product.inStock !== false,
      hasTryOn: Boolean(product.hasTryOn),
      images: product.images,
      url: product.canonicalPath ?? productHref(product.category, product.slug),
    };

    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
