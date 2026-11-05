import { createFileRoute } from "@tanstack/react-router";
import { AdminConsole } from "@/routes/admin/index";

export const Route = createFileRoute("/staff")({
  component: StaffDashboard,
  head: () => ({
    meta: [{ title: "Staff dashboard — ATRO" }],
    robots: { index: false, follow: false },
  }),
});

function StaffDashboard() {
  return <AdminConsole workspace="staff" />;
}
