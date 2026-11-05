import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { serviceBySlug } from "@/lib/site";

export const Route = createFileRoute("/services/$slug")({
  beforeLoad: ({ params }) => {
    if (!serviceBySlug(params.slug)) throw notFound();
    throw redirect({
      to: "/services",
      search: { service: params.slug },
    });
  },
});
