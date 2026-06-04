import { createFileRoute } from "@tanstack/react-router";

// Allow trailing-slash article URLs like /blog/{category}/{slug}/ to resolve
// to the parent article route instead of falling through to the category index.
export const Route = createFileRoute("/blog/$category/$slug/")({
  component: () => null,
});
