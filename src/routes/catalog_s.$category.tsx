import { createFileRoute, Outlet, notFound } from "@tanstack/react-router";
import { categoryForCatalogPath } from "@/data/categories";
import type { Category } from "@/data/types";

type FacetKey =
  | "shape"
  | "material"
  | "gender"
  | "size"
  | "brand"
  | "wearMode"
  | "lensType"
  | "purpose";

interface CatalogConfig {
  title: string;
  subtitle: string;
  facets?: FacetKey[];
  metaTitle: string;
  metaDescription: string;
}

export const catalogConfig: Record<Category, CatalogConfig> = {
  opravy: {
    title: "Оправы",
    subtitle:
      "Современные оправы из ацетата, титана и металла. Подбираем под форму лица и образ жизни.",
    facets: ["shape", "material", "gender", "size", "brand"],
    metaTitle: "Оправы — каталог · ОПТИКА 100%",
    metaDescription:
      "Купить оправы для очков в Санкт-Петербурге: ацетат, титан, металл. Мужские, женские, детские модели.",
  },
  solntsezashchitnye: {
    title: "Солнцезащитные очки",
    subtitle: "100% UV-защита, поляризация, зеркальные и градиентные линзы.",
    facets: ["shape", "material", "gender", "size", "brand"],
    metaTitle: "Солнцезащитные очки — каталог · ОПТИКА 100%",
    metaDescription:
      "Солнцезащитные очки с UV-защитой, поляризацией и градиентными линзами. Ray-Ban, Persol, OPTIKA Studio.",
  },
  "kontaktnye-linzy": {
    title: "Контактные линзы",
    subtitle:
      "Однодневные, двухнедельные, месячные. Сферические, торические, для контроля миопии.",
    facets: ["brand", "wearMode", "lensType", "material"],
    metaTitle: "Контактные линзы — каталог · ОПТИКА 100%",
    metaDescription:
      "Контактные линзы Acuvue, CooperVision, Bausch+Lomb, Alcon. Однодневные, месячные, торические, для контроля миопии.",
  },
  "linzy-dlya-ochkov": {
    title: "Линзы для очков",
    subtitle:
      "Линзы мировых брендов: однофокусные, прогрессивные, фотохромные, с защитой от синего света.",
    facets: ["brand", "purpose"],
    metaTitle: "Линзы для очков — каталог · ОПТИКА 100%",
    metaDescription:
      "Линзы для очков ZEISS, Essilor, Hoya. Прогрессивные, фотохромные, с защитой от синего света.",
  },
  aksessuary: {
    title: "Аксессуары",
    subtitle: "Футляры, цепочки, салфетки, средства для очистки линз.",
    metaTitle: "Аксессуары для очков — каталог · ОПТИКА 100%",
    metaDescription:
      "Футляры, цепочки, салфетки и средства для ухода за очками и линзами.",
  },
};

// Layout-only route — validates category and renders child (index or PDP)
export const Route = createFileRoute("/catalog_s/$category")({
  loader: ({ params }) => {
    const category = categoryForCatalogPath(params.category);
    if (!category) throw notFound();
    return { category };
  },
  component: () => <Outlet />,
});
