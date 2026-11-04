import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/paystack/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { handlePaystackWebhook } = await import("@/lib/paystack-provider.server");
          await handlePaystackWebhook(request);
          return new Response(null, { status: 200 });
        } catch (error) {
          if (error instanceof Error && error.message === "Invalid Paystack webhook signature.") {
            return new Response("Unauthorized", { status: 401 });
          }
          console.error("Paystack webhook processing failed.", error);
          return new Response("Webhook processing failed", { status: 500 });
        }
      },
    },
  },
});
