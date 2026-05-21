import { createFileRoute, Link } from "@tanstack/react-router";
import { articles } from "@/data/articles";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Журнал · ОПТИКА 100%" },
      {
        name: "description",
        content:
          "Статьи о подборе очков, контактных линз, моде на оправы и здоровье зрения.",
      },
      { property: "og:title", content: "Журнал · ОПТИКА 100%" },
    ],
  }),
  component: JournalIndex,
});

function JournalIndex() {
  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8 py-12">
      <h1 className="font-serif text-4xl lg:text-5xl">Журнал</h1>
      <p className="mt-3 text-muted-foreground max-w-xl">
        Гид по очкам, линзам, моде и здоровью зрения от наших врачей и стилистов.
      </p>

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
            <div className="mt-3 text-xs text-muted-foreground">
              {a.author} · {new Date(a.date).toLocaleDateString("ru-RU")}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
