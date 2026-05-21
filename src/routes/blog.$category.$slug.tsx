import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { getArticle, getArticlesByCategory } from "@/data/articles";
import type { Article } from "@/data/types";

export const Route = createFileRoute("/blog/$category/$slug")({
  loader: ({ params }) => {
    const article = getArticle(params.slug);
    if (!article || article.categorySlug !== params.category) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Статья · ОПТИКА 100%" }] };
    const a = loaderData.article;
    return {
      meta: [
        { title: `${a.title} · ОПТИКА 100%` },
        { name: "description", content: a.excerpt },
        { property: "og:title", content: a.title },
        { property: "og:description", content: a.excerpt },
        { property: "og:image", content: a.cover },
        { property: "og:type", content: "article" },
      ],
    };
  },
  component: ArticlePage,
});

function ArticlePage() {
  const data = Route.useLoaderData() as { article: Article };
  const { article } = data;
  const more = getArticlesByCategory(article.categorySlug)
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3);

  return (
    <article>
      <header className="mx-auto max-w-3xl px-4 lg:px-8 py-12">
        <nav className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
          <Link to="/" className="hover:text-foreground">Главная</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/blog" className="hover:text-foreground">Журнал</Link>
          <ChevronRight className="h-3 w-3" />
          <Link
            to="/blog/$category"
            params={{ category: article.categorySlug }}
            className="hover:text-foreground"
          >
            {article.category}
          </Link>
        </nav>
        <div className="text-xs uppercase tracking-wider text-brand">
          {article.category}
        </div>
        <h1 className="font-serif text-4xl lg:text-5xl mt-3 leading-tight">
          {article.title}
        </h1>
        <div className="mt-4 text-sm text-muted-foreground">
          {article.author} · {new Date(article.date).toLocaleDateString("ru-RU")}
        </div>
      </header>

      <div className="aspect-[16/9] bg-surface mx-auto max-w-5xl">
        <img
          src={article.cover}
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="mx-auto max-w-3xl px-4 lg:px-8 py-12 space-y-5 text-lg leading-relaxed">
        {article.content.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
          <h2 className="font-serif text-2xl mb-8">Читайте также</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {more.map((a) => (
              <Link
                key={a.slug}
                to="/blog/$category/$slug"
                params={{ category: a.categorySlug, slug: a.slug }}
                className="group block"
              >
                <div className="aspect-[4/3] bg-background rounded-sm overflow-hidden mb-3">
                  <img
                    src={a.cover}
                    alt={a.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="text-xs uppercase tracking-wider text-brand">
                  {a.category}
                </div>
                <h3 className="font-serif text-lg mt-1 group-hover:text-brand">
                  {a.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
