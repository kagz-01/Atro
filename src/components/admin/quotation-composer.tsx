import { useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";
import { issueQuotation } from "@/lib/invoice-server";

type QuotationTarget =
  | { enquiryId: string; projectId?: never }
  | { projectId: string; enquiryId?: never };

type QuotationComposerProps = QuotationTarget & {
  recipient: string;
  projectLabel: string;
  onIssued?: () => void;
  onCancel?: () => void;
};

type DraftLine = { description: string; amount: string };

function dateAfter(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export function QuotationComposer({
  enquiryId,
  projectId,
  recipient,
  projectLabel,
  onIssued,
  onCancel,
}: QuotationComposerProps) {
  const [scope, setScope] = useState("");
  const [pricingBasis, setPricingBasis] = useState("");
  const [exclusions, setExclusions] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([{ description: "", amount: "" }]);
  const [vatPercent, setVatPercent] = useState("");
  const [validUntil, setValidUntil] = useState(() => dateAfter(14));
  const [submitting, setSubmitting] = useState(false);
  const [issued, setIssued] = useState<{ id: string; number: string } | null>(null);

  async function submit() {
    if (scope.trim().length < 20) {
      toast.error("Describe the proposed scope and inclusions in at least 20 characters.");
      return;
    }
    if (pricingBasis.trim().length < 10) {
      toast.error("Explain the pricing basis or reference the current source used.");
      return;
    }
    const parsedLines = lines.map((line) => ({
      description: line.description.trim(),
      amount: Number(line.amount),
    }));
    if (
      parsedLines.some(
        (line) =>
          line.description.length < 2 ||
          !Number.isSafeInteger(line.amount) ||
          line.amount <= 0 ||
          line.amount > 50_000_000_000,
      )
    ) {
      toast.error("Each quotation line needs a description and a whole-shilling amount.");
      return;
    }
    const vat = vatPercent.trim() ? Number(vatPercent) : 0;
    if (!Number.isFinite(vat) || vat < 0 || vat > 30) {
      toast.error("Enter a VAT rate between 0 and 30%, or leave it blank.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await issueQuotation({
        data: {
          ...(projectId ? { projectId } : { enquiryId }),
          scope: scope.trim(),
          pricingBasis: pricingBasis.trim(),
          exclusions: exclusions.trim(),
          lines: parsedLines,
          vatRate: vat / 100,
          validUntil,
        },
      });
      setIssued(result);
      onIssued?.();
      toast.success(`Quotation ${result.number} issued.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not issue the quotation.");
    } finally {
      setSubmitting(false);
    }
  }

  if (issued) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-sm font-medium text-emerald-900">
          Quotation {issued.number} issued for {recipient}.
        </p>
        <p className="mt-1 text-xs text-emerald-800">
          {enquiryId
            ? "It will be linked to the project record when this enquiry is converted."
            : "It is saved in this project record."}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild size="sm">
            <a href={`/admin/document/${issued.id}`} target="_blank" rel="noreferrer">
              Open and print quotation
            </a>
          </Button>
          {onCancel ? (
            <Button size="sm" variant="outline" onClick={onCancel}>
              Close
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-cream p-4 sm:p-5">
      <div>
        <h3 className="font-display text-lg text-maroon">Prepare a quotation</h3>
        <p className="mt-1 text-xs leading-relaxed text-ink/60">
          For {recipient} · {projectLabel}. Enter confirmed prices and define what is included;
          ATRO does not estimate a total from area or project type.
        </p>
      </div>

      <div className="mt-4 grid gap-4">
        <div>
          <Label htmlFor={`quote-scope-${enquiryId ?? projectId}`}>Scope and inclusions</Label>
          <Textarea
            id={`quote-scope-${enquiryId ?? projectId}`}
            value={scope}
            onChange={(event) => setScope(event.target.value)}
            placeholder="Describe the specific work covered by this quotation, including drawings or measured documents it relies on."
            maxLength={5000}
            className="mt-1 min-h-28 rounded-xl"
          />
        </div>

        <div>
          <Label htmlFor={`quote-basis-${enquiryId ?? projectId}`}>
            Pricing basis and references
          </Label>
          <Textarea
            id={`quote-basis-${enquiryId ?? projectId}`}
            value={pricingBasis}
            onChange={(event) => setPricingBasis(event.target.value)}
            placeholder="E.g. measured BOQ revision and date, supplier quote/reference and validity, site/location basis, or the agreed professional-fee basis."
            maxLength={2000}
            className="mt-1 min-h-20 rounded-xl"
          />
          <p className="mt-1 text-xs text-muted">
            This is printed with the quotation so the client can see what the price relies on.
          </p>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-maroon">Priced items (KES)</legend>
          <p className="text-xs text-muted">
            Use current, verified prices. Each line amount should match the written scope.
          </p>
          {lines.map((line, index) => (
            <div key={index} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_12rem_auto]">
              <div>
                <Label className="sr-only" htmlFor={`quote-line-${index}-${enquiryId ?? projectId}`}>
                  Item {index + 1} description
                </Label>
                <Input
                  id={`quote-line-${index}-${enquiryId ?? projectId}`}
                  value={line.description}
                  onChange={(event) =>
                    setLines((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, description: event.target.value } : item,
                      ),
                    )
                  }
                  placeholder="e.g. Architectural design services"
                  maxLength={240}
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label className="sr-only" htmlFor={`quote-amount-${index}-${enquiryId ?? projectId}`}>
                  Item {index + 1} amount in KES
                </Label>
                <Input
                  id={`quote-amount-${index}-${enquiryId ?? projectId}`}
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  value={line.amount}
                  onChange={(event) =>
                    setLines((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, amount: event.target.value } : item,
                      ),
                    )
                  }
                  placeholder="Amount (KES)"
                  className="rounded-xl"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={`Remove item ${index + 1}`}
                disabled={lines.length === 1}
                className="size-9 p-0"
                onClick={() => setLines((current) => current.filter((_, itemIndex) => itemIndex !== index))}
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setLines((current) => [...current, { description: "", amount: "" }])}
            disabled={lines.length >= 40}
          >
            <Plus className="size-4" />
            Add priced item
          </Button>
        </fieldset>

        <div>
          <Label htmlFor={`quote-exclusions-${enquiryId ?? projectId}`}>
            Exclusions and assumptions <span className="font-normal text-muted">Optional</span>
          </Label>
          <Textarea
            id={`quote-exclusions-${enquiryId ?? projectId}`}
            value={exclusions}
            onChange={(event) => setExclusions(event.target.value)}
            placeholder="List what is not included, unresolved site conditions, or assumptions."
            maxLength={3000}
            className="mt-1 min-h-20 rounded-xl"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor={`quote-valid-${enquiryId ?? projectId}`}>Valid until</Label>
            <Input
              id={`quote-valid-${enquiryId ?? projectId}`}
              type="date"
              value={validUntil}
              min={dateAfter(0)}
              onChange={(event) => setValidUntil(event.target.value)}
              className="mt-1 rounded-xl"
            />
            <p className="mt-1 text-xs text-muted">Suggested 14-day validity; confirm before issue.</p>
          </div>
          <div>
            <Label htmlFor={`quote-vat-${enquiryId ?? projectId}`}>
              VAT rate (%) <span className="font-normal text-muted">If confirmed</span>
            </Label>
            <Input
              id={`quote-vat-${enquiryId ?? projectId}`}
              type="number"
              min="0"
              max="30"
              step="0.01"
              value={vatPercent}
              onChange={(event) => setVatPercent(event.target.value)}
              placeholder="Leave blank if not confirmed"
              className="mt-1 rounded-xl"
            />
            <p className="mt-1 text-xs text-muted">
              The printed quote will state when VAT has not been included.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">
          Quotation only—not a contract or eTIMS tax invoice. Confirm the price, tax treatment and
          scope with the client. Work starts only after a written agreement is signed.
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => void submit()} disabled={submitting}>
            {submitting ? "Issuing…" : "Issue quotation"}
          </Button>
          {onCancel ? (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
