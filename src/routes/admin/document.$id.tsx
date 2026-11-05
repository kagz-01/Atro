import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DocumentFlowGuide } from "@/components/documents/document-flow-guide";
import { DOCUMENT_STYLES, KIND_LABEL } from "@/lib/invoices";
import { getStaffDocument } from "@/lib/invoice-server";

export const Route = createFileRoute("/admin/document/$id")({
  component: StaffDocumentPage,
  head: () => ({
    meta: [{ title: "Document — ATRO staff" }],
    robots: { index: false, follow: false },
  }),
});

function StaffDocumentPage() {
  const { id } = Route.useParams();
  const { data: doc, isLoading, error } = useQuery({
    queryKey: ["staff-document", id],
    queryFn: () => getStaffDocument({ data: { id } }),
    retry: false,
  });

  return (
    <main className="min-h-screen bg-stone/30 pt-12 pb-16">
      <style>{DOCUMENT_STYLES}</style>

      <div className="mx-auto max-w-4xl px-6 sm:px-8">
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-4">
          <Button asChild variant="ghost" size="sm">
            <a href="/admin/">
              <ArrowLeft className="size-4" />
              Back to studio
            </a>
          </Button>
          {doc && doc.status !== "void" ? (
            <Button size="sm" onClick={() => window.print()}>
              <Printer className="size-4" />
              Print or save as PDF
            </Button>
          ) : null}
        </div>

        {isLoading ? (
          <p className="py-20 text-center text-[13px] text-muted">Opening the document…</p>
        ) : error || !doc ? (
          <div className="rounded-2xl border border-ink/10 bg-paper p-8 text-center">
            <h1 className="font-display text-2xl text-maroon">Document not available</h1>
            <p className="mt-3 text-[14px] text-ink/60">
              Sign in with an ATRO staff account, or confirm the document link.
            </p>
          </div>
        ) : (
          <>
            {doc.status === "void" ? (
              <div className="no-print mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
                <p className="flex items-center gap-2 text-[13px] font-medium text-red-800">
                  <Badge tone="live">Void</Badge>
                  This document was voided{doc.voidedReason ? `: ${doc.voidedReason}` : ""}. A
                  corrected document carries a new number.
                </p>
              </div>
            ) : null}

            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="text-[12px] uppercase tracking-[0.16em] text-muted">
                {KIND_LABEL[doc.kind]}
              </span>
              <span className="font-mono text-[12px] text-muted">{doc.number}</span>
            </div>

            <div
              className="rounded-2xl border border-ink/10 bg-white p-6 md:p-10"
              dangerouslySetInnerHTML={{ __html: doc.bodyHtml }}
            />
            <div className="mt-6">
              <DocumentFlowGuide audience="studio" kind={doc.kind} status={doc.status} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
