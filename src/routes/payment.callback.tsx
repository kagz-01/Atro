import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifyPaystackPayment } from "@/lib/paystack-server";

export const Route = createFileRoute("/payment/callback")({
  validateSearch: (search: Record<string, unknown>) => ({
    reference:
      typeof search.reference === "string"
        ? search.reference
        : typeof search.trxref === "string"
          ? search.trxref
          : "",
    experience: search.experience === "diaspora" ? "diaspora" : "local",
  }),
  component: PaymentCallbackPage,
  head: () => ({
    meta: [
      { title: "Payment status — ATRO" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function PaymentCallbackPage() {
  const { reference, experience } = Route.useSearch();
  const portalRoute = experience === "diaspora" ? "/portal/diaspora" : "/portal";
  const result = useQuery({
    queryKey: ["paystack-payment-verification", reference],
    queryFn: () => verifyPaystackPayment({ data: { reference } }),
    enabled: Boolean(reference),
    retry: 1,
  });

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-stone/30 px-4 py-16">
      <section className="w-full max-w-lg rounded-3xl border border-ink/10 bg-paper p-6 text-center shadow-card sm:p-9">
        {!reference ? (
          <>
            <AlertCircle className="mx-auto size-9 text-red-700" aria-hidden="true" />
            <h1 className="mt-5 font-display text-2xl text-maroon">Payment reference missing</h1>
            <p className="mt-3 text-sm text-ink/65">
              We could not identify a Paystack transaction. Your project will not be marked paid
              without provider confirmation.
            </p>
          </>
        ) : result.isPending ? (
          <>
            <Loader2 className="mx-auto size-8 animate-spin text-gold" aria-label="Checking payment" />
            <h1 className="mt-5 font-display text-2xl text-maroon">Confirming your payment</h1>
            <p className="mt-3 text-sm text-ink/65">
              We are checking the transaction directly with Paystack. Please keep this page open.
            </p>
          </>
        ) : result.data?.status === "success" ? (
          <>
            <CheckCircle2 className="mx-auto size-9 text-emerald-700" aria-hidden="true" />
            <h1 className="mt-5 font-display text-2xl text-maroon">Payment confirmed</h1>
            <p className="mt-3 text-sm text-ink/65">
              The project ledger has been updated{result.data.receiptNumber
                ? ` and receipt ${result.data.receiptNumber} is ready`
                : ""}.
            </p>
          </>
        ) : result.data?.status === "pending" ? (
          <>
            <Loader2 className="mx-auto size-8 animate-spin text-gold" aria-label="Payment pending" />
            <h1 className="mt-5 font-display text-2xl text-maroon">Payment still processing</h1>
            <p className="mt-3 text-sm text-ink/65">
              Paystack has not confirmed the payment yet. Your project will update when the provider
              confirms it. You can safely return to the portal.
            </p>
            <Button
              variant="outline"
              className="mt-5"
              onClick={() => void result.refetch()}
              disabled={result.isFetching}
            >
              {result.isFetching ? "Checking…" : "Check again"}
            </Button>
          </>
        ) : (
          <>
            <AlertCircle className="mx-auto size-9 text-red-700" aria-hidden="true" />
            <h1 className="mt-5 font-display text-2xl text-maroon">Payment not confirmed</h1>
            <p className="mt-3 text-sm text-ink/65">
              {result.error instanceof Error
                ? result.error.message
                : result.data?.status === "failed"
                  ? "Paystack reports that this attempt did not complete. The certified amount is still due."
                  : "We could not verify this transaction. Your project will not be marked paid without provider confirmation."}
            </p>
          </>
        )}
        {!result.isPending ? (
          <Button asChild className="mt-6">
            <Link to={portalRoute}>
              {experience === "diaspora"
                ? "Return to the diaspora portal"
                : "Return to your project"}
            </Link>
          </Button>
        ) : null}
      </section>
    </main>
  );
}
