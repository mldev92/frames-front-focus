import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { getArticlesByCategory, getBlogCategory } from "@/data/articles";
import { Route as BlogCategoryRoute } from "./blog.$category";

// Index route — renders the article list at /blog/$category/
// The parent layout (blog.$category.tsx) validates the category slug.
export const Route = createFileRoute("/blog/$category/")({
  head: ({ params }) => {
    const cat = getBlogCategory(params.category);
    if (!cat) return { meta: [{ title: "Блог · ОПТИКА 100%" }] };
    return {
      meta: [
        { title: `${cat.title} — статьи · ОПТИКА 100%` },
        { name: "description", content: `Статьи на тему «${cat.title}» в журнале ОПТИКА 100%.` },
        { property: "og:title", content: `${cat.title} · ОПТИКА 100%` },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = BlogCategoryRoute.useLoaderData();
  const articles = getArticlesByCategory(category.slug);

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8 py-12">
      <nav className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
        <Link to="/" className="hover:text-foreground">Главная</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/blog" className="hover:text-foreground">Блог</Link>
      </nav>
      <h1 className="font-serif text-4xl lg:text-5xl">{category.title}</h1>

      <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
        {articles.map((a) => (
          <Link
            key={a.slug}
            to="/blog/$category/$slug"
            params={{ category: a.categorySlug, slug: a.slug }}
            className="group block"
          >
            <div className="aspect-[4/3] bg-surface rounded-sm overflow-hidden mb-4">
              <img
                src={a.cover}
                alt={a.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="text-xs uppercase tracking-wider text-brand">{a.category}</div>
            <h2 className="font-serif text-xl mt-2 group-hover:text-brand">{a.title}</h2>
            <p className="text-sm text-muted-foreground mt-2">{a.excerpt}</p>
            {!a.isMigrated ? (
              <div className="mt-3 text-xs text-muted-foreground">
                Полный текст пока доступен на optika100.com
              </div>
            ) : a.author && a.date ? (
              <div className="mt-3 text-xs text-muted-foreground">
                {a.author} · {new Date(a.date).toLocaleDateString("ru-RU")}
              </div>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
