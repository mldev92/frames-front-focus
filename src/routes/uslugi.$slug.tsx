import { createFileRoute, notFound } from "@tanstack/react-router";
import { getService } from "@/data/services";
import { ServiceDetail } from "@/components/ServiceDetail";

export const Route = createFileRoute("/uslugi/$slug")({
  loader: ({ params }) => {
    const service = getService(params.slug);
    if (!service) throw notFound();
    return { service };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Услуга · ОПТИКА 100%" }] };
    const s = loaderData.service;
    return {
      meta: [
        { title: `${s.title} · ОПТИКА 100%` },
        { name: "description", content: s.short },
        { property: "og:title", content: s.title },
        { property: "og:description", content: s.short },
        { property: "og:image", content: s.image },
      ],
    };
  },
  component: () => <ServiceDetail service={Route.useLoaderData().service} />,
});
