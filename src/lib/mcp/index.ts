import { defineMcp } from "@lovable.dev/mcp-js";
import searchProducts from "./tools/search-products";
import getProductTool from "./tools/get-product";
import listCategories from "./tools/list-categories";
import listSalons from "./tools/list-salons";
import listServices from "./tools/list-services";
import searchArticles from "./tools/search-articles";

export default defineMcp({
  name: "style-replica-studio",
  title: "Style Replica Studio",
  version: "0.1.0",
  instructions:
    "Public read-only tools for the ОПТИКА 100% eyewear store. Use `search_products` and `get_product` for the catalog (frames, sunglasses, contact and spectacle lenses, accessories), `list_categories` for navigation, `list_salons` for store locations, `list_services` for vision-clinic services, and `search_articles` for blog content.",
  tools: [searchProducts, getProductTool, listCategories, listSalons, listServices, searchArticles],
});
