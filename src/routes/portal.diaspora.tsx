import { createFileRoute } from "@tanstack/react-router";
import { PortalExperience } from "@/routes/portal";

export const Route = createFileRoute("/portal/diaspora")({
  component: DiasporaPortalPage,
  head: () => ({
    meta: [
      { title: "Diaspora project portal — ATRO Design & Construction" },
      {
        name: "description",
        content:
          "Follow your Kenya project from anywhere: progress, decisions, payments, documents and studio updates in one private portal.",
      },
    ],
  }),
});

function DiasporaPortalPage() {
  return <PortalExperience experience="diaspora" />;
}
