import { createFileRoute } from "@tanstack/react-router";
import { EnquiriesInbox } from "@/components/admin/enquiries-inbox";

export const Route = createFileRoute("/admin/enquiries")({
  component: AdminEnquiriesPage,
  head: () => ({
    meta: [{ title: "Enquiries — ATRO Studio" }],
    robots: { index: false, follow: false },
  }),
});

function AdminEnquiriesPage() {
  return (
    <main className="min-h-dvh bg-stone/30 pt-28 pb-16 md:pt-32">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
        <EnquiriesInbox />
      </div>
    </main>
  );
}
