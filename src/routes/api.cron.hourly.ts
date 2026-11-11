import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/cron/hourly")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.CRON_SECRET?.trim();
        if (!secret) {
          return Response.json({ error: "Scheduled processing is not configured." }, { status: 503 });
        }

        const { isAuthorizedCronRequest } = await import("@/lib/cron-auth.server");
        if (!isAuthorizedCronRequest(request, secret)) {
          return Response.json({ error: "Unauthorized." }, { status: 401 });
        }

        try {
          const [{ getSql }, { runScheduledNotifications }] = await Promise.all([
            import("@/lib/db"),
            import("@/lib/scheduled-notifications.server"),
          ]);
          const result = await runScheduledNotifications(await getSql());
          return Response.json({ ok: true, ...result });
        } catch (error) {
          console.error("Hourly scheduled processing failed.", error);
          return Response.json({ error: "Scheduled processing failed." }, { status: 500 });
        }
      },
    },
  },
});
