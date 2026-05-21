import { createFileRoute } from "@tanstack/react-router";
import { getService } from "@/data/services";
import { ServiceDetail } from "@/components/ServiceDetail";

const service = getService("diagnostika")!;

export const Route = createFileRoute("/kabinet-diagnostiki-spb")({
  head: () => ({
    meta: [
      { title: `${service.title} · ОПТИКА 100%` },
      { name: "description", content: service.short },
      { property: "og:title", content: service.title },
      { property: "og:description", content: service.short },
      { property: "og:image", content: service.image },
    ],
  }),
  component: () => <ServiceDetail service={service} />,
});
