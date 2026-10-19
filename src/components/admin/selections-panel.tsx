import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import {
  closeSelection,
  createSelection,
  readSelectionsForStaff,
  setSelectionAllowance,
} from "@/lib/selections-server";
import { allowanceVerdict, kes, summariseAllowances } from "@/lib/selections";
import { raiseVariation, readVariationsForStaff } from "@/lib/variations-server";
import { signedKes } from "@/lib/variations";
import { cn } from "@/lib/utils";

/**
 * The studio's side of selections.
 *
 * Two jobs: put a priced choice in front of the client, and see afterwards which
 * choices came in over the allowance. The second is the commercial one — those
 * are the conversations that decide whether a build ends with a margin or an
 * argument, and they are visible here before anyone has to remember them.
 */
export function SelectionsPanel({
  projectId,
  onChanged,
}: {
  projectId: string;
  onChanged?: () => void;
}) {
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [pricingFor, setPricingFor] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["staff-selections", projectId],
    queryFn: () => readSelectionsForStaff({ data: { projectId } }),
  });
  // The same key the Variations accordion queries, so pricing a choice here
  // updates both views at once.
  const { data: variations } = useQuery({
    queryKey: ["variations-staff", projectId],
    queryFn: () => readVariationsForStaff({ data: { projectId } }),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["staff-selections", projectId] });
    void queryClient.invalidateQueries({ queryKey: ["variations-staff", projectId] });
    onChanged?.();
  };

  const close = useMutation({
    mutationFn: closeSelection,
    onSuccess: () => {
      toast.success("Selection closed.");
      invalidate();
    },
  });

  const reallowance = useMutation({
    mutationFn: setSelectionAllowance,
    onSuccess: invalidate,
  });

  const selections = data ?? [];
  const summary = summariseAllowances(selections);

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-ink/10 bg-cream p-5">
        <div className="h-24 animate-pulse rounded-xl bg-ink/6" />
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-ink/10 bg-cream p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg text-maroon">Selections</h3>
          <p className="mt-1 text-[12px] leading-relaxed text-ink/55">
            A priced choice the client makes in their own time. The answer is written
            into the decision log with the date, and a choice over the allowance
            becomes a variation to price — it never edits the contract on its own.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setAdding((v) => !v)}>
          {adding ? <X className="size-4" /> : <Plus className="size-4" />}
          {adding ? "Cancel" : "New selection"}
        </Button>
      </div>

      {selections.length > 0 ? (
        <dl className="mt-4 grid grid-cols-2 gap-3 text-[12px] sm:grid-cols-4">
          {[
            ["Open", String(summary.open)],
            ["Chosen", String(summary.chosen)],
            ["Allowance", kes(summary.allowance)],
            [
              summary.variance > 0 ? "Over allowance" : "Under allowance",
              kes(Math.abs(summary.variance)),
            ],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-ink/10 bg-white p-3">
              <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                {k}
              </dt>
              <dd
                className={cn(
                  "mt-1 text-[14px]",
                  k === "Over allowance" && summary.variance > 0
                    ? "text-amber-800"
                    : "text-maroon",
                )}
              >
                {v}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {adding ? (
        <NewSelectionForm
          projectId={projectId}
          nextOrd={selections.length + 1}
          onDone={() => {
            setAdding(false);
            invalidate();
          }}
        />
      ) : null}

      {selections.length === 0 && !adding ? (
        <p className="mt-4 text-[13px] text-ink/55">
          None yet. Most studios find the roof covering, the kitchen top and the floor
          finish are where the money is decided.
        </p>
      ) : null}

      <ul className="mt-4 space-y-3">
        {selections.map((s) => {
          const verdict = allowanceVerdict(s);
          const linked = (variations ?? []).find(
            (v) => v.sourceKind === "selection" && v.sourceId === s.id,
          );
          // Over the allowance with nothing live against it is the moment to
          // price. Withdrawn counts as nothing live — that is the re-price.
          const needsPricing =
            verdict.needsVariation && (!linked || linked.status === "withdrawn");
          return (
            <li
              key={s.id}
              className={cn(
                "rounded-xl border bg-white p-4",
                needsPricing ? "border-amber-300" : "border-ink/10",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] text-maroon">{s.title}</span>
                    {s.status === "open" ? (
                      <Badge tone="gold" className="h-5 text-[9px]">Open</Badge>
                    ) : s.status === "chosen" ? (
                      <Badge tone="gold" className="h-5 text-[9px]">Chosen</Badge>
                    ) : (
                      <Badge tone="gold" className="h-5 text-[9px]">Closed</Badge>
                    )}
                    {verdict.needsVariation && linked && linked.status !== "withdrawn" ? (
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]",
                          linked.status === "proposed"
                            ? "border-amber-300 bg-amber-50 text-amber-900"
                            : linked.status === "approved"
                              ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                              : "border-ink/15 bg-stone/100 text-ink/60",
                        )}
                      >
                        {linked.status === "proposed"
                          ? `Variation sent — ${signedKes(linked.amount)} with the client`
                          : linked.status === "approved"
                            ? "Approved — added to the contract"
                            : "Declined by the client"}
                      </span>
                    ) : needsPricing ? (
                      <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-amber-900">
                        {kes(verdict.delta)} over
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-[12px] text-ink/55">
                    {s.options.length} option{s.options.length === 1 ? "" : "s"} · allowance{" "}
                    {kes(s.allowance)}
                    {s.deadline ? ` · close ${s.deadline}` : ""}
                    {verdict.chosen ? ` · chose ${verdict.chosen.label} at ${kes(verdict.price)}` : ""}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {needsPricing ? (
                    <Button
                      size="sm"
                      variant={pricingFor === s.id ? "ghost" : "primary"}
                      onClick={() => setPricingFor(pricingFor === s.id ? null : s.id)}
                    >
                      {pricingFor === s.id ? "Cancel" : "Price a variation"}
                    </Button>
                  ) : null}
                  {s.status === "open" ? (
                    <>
                      <label className="sr-only" htmlFor={`al-${s.id}`}>
                        Allowance for {s.title}
                      </label>
                      <Input
                        id={`al-${s.id}`}
                        type="number"
                        inputMode="numeric"
                        defaultValue={s.allowance || ""}
                        placeholder="Allowance"
                        className="h-9 w-32 text-[12px]"
                        onBlur={(e) => {
                          const next = Number(e.target.value);
                          if (Number.isFinite(next) && next !== s.allowance) {
                            reallowance.mutate({
                              data: { selectionId: s.id, allowance: next },
                            });
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={close.isPending}
                        onClick={() => close.mutate({ data: { selectionId: s.id } })}
                      >
                        Close
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>

              {s.options.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {s.options.map((o) => (
                    <li
                      key={o.id}
                      className={cn(
                        "rounded-lg border px-2.5 py-1 text-[11px]",
                        s.chosenOptionId === o.id
                          ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                          : "border-ink/10 text-ink/60",
                      )}
                    >
                      {o.label} · {kes(o.price)}
                      {o.recommended ? " · studio's pick" : ""}
                    </li>
                  ))}
                </ul>
              ) : null}

              {pricingFor === s.id && verdict.chosen ? (
                <PriceVariationForm
                  projectId={projectId}
                  selection={s}
                  delta={verdict.delta}
                  onDone={() => {
                    setPricingFor(null);
                    invalidate();
                  }}
                />
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * Put the overage to the client.
 *
 * The price defaults to the overage itself — the number that was already on
 * screen — so the common case is one glance and a send, and anything else is
 * a deliberate edit rather than a figure somebody typed from memory.
 */
function PriceVariationForm({
  projectId,
  selection,
  delta,
  onDone,
}: {
  projectId: string;
  selection: { id: string; title: string; chosenOptionId: string | null };
  delta: number;
  onDone: () => void;
}) {
  const [title, setTitle] = useState(selection.title);
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState(String(delta));
  const [days, setDays] = useState("");

  const raise = useMutation({
    mutationFn: () =>
      raiseVariation({
        data: {
          projectId,
          title,
          detail: `Chosen over the allowance by ${kes(delta)}.`,
          reason,
          amount: Number(amount) || 0,
          days: Number(days) || 0,
          sourceKind: "selection",
          sourceId: selection.id,
        },
      }),
    onSuccess: () => {
      toast.success("Variation sent to the client for approval.");
      onDone();
    },
  });

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-gold/40 bg-gold/5 p-4">
      <p className="text-[12px] leading-relaxed text-ink/65">
        {kes(delta)} over the allowance. The price goes to the client, and the contract does not
        move until they approve it.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label htmlFor={`pv-title-${selection.id}`}>What is changing</Label>
          <Input
            id={`pv-title-${selection.id}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor={`pv-amount-${selection.id}`}>Price (KES)</Label>
          <Input
            id={`pv-amount-${selection.id}`}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor={`pv-days-${selection.id}`}>Time impact (days)</Label>
          <Input
            id={`pv-days-${selection.id}`}
            type="number"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            placeholder="0"
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <Label htmlFor={`pv-reason-${selection.id}`}>Why it is needed (the client reads this)</Label>
        <Textarea
          id={`pv-reason-${selection.id}`}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mt-1 min-h-16"
          placeholder="Quartz carries a thicker slab and a longer lead time than the allowance covered."
        />
      </div>
      {raise.error instanceof Error ? (
        <p role="alert" className="text-[12px] text-red-700">
          {raise.error.message}
        </p>
      ) : null}
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={title.trim().length < 5 || raise.isPending}
          onClick={() => raise.mutate()}
        >
          {raise.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Send to the client
        </Button>
        <Button size="sm" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function NewSelectionForm({
  projectId,
  nextOrd,
  onDone,
}: {
  projectId: string;
  nextOrd: number;
  onDone: () => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Finish");
  const [allowance, setAllowance] = useState("");
  const [deadline, setDeadline] = useState("");
  const [note, setNote] = useState("");
  const [options, setOptions] = useState([
    { label: "", price: "", description: "", supplier: "", leadTime: "", recommended: false },
  ]);

  const create = useMutation({
    mutationFn: createSelection,
    onSuccess: () => {
      toast.success("Selection published to the client.");
      onDone();
    },
  });

  const valid =
    title.trim().length >= 2 &&
    options.filter((o) => o.label.trim() && Number(o.price) >= 0).length >= 1;

  return (
    <div className="mt-4 space-y-3 rounded-xl border border-gold/40 bg-gold/5 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor={`sel-title-${nextOrd}`}>What is being chosen</Label>
          <Input
            id={`sel-title-${nextOrd}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Roof covering"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor={`sel-cat-${nextOrd}`}>Category</Label>
          <Select
            id={`sel-cat-${nextOrd}`}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1"
          >
            {["Roof", "Floor", "Kitchen", "Bathroom", "Doors", "Windows", "External", "Services", "Finish"].map(
              (c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ),
            )}
          </Select>
        </div>
        <div>
          <Label htmlFor={`sel-allow-${nextOrd}`}>Allowance (KES)</Label>
          <Input
            id={`sel-allow-${nextOrd}`}
            type="number"
            inputMode="numeric"
            value={allowance}
            onChange={(e) => setAllowance(e.target.value)}
            placeholder="900000"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor={`sel-dead-${nextOrd}`}>Close the choice on</Label>
          <Input
            id={`sel-dead-${nextOrd}`}
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor={`sel-note-${nextOrd}`}>Note for the client (optional)</Label>
        <Textarea
          id={`sel-note-${nextOrd}`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="All three are quoted for the same specification. The allowance covers supply and laying."
          className="mt-1 min-h-16"
        />
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
          Options
        </p>
        <ul className="mt-2 space-y-2">
          {options.map((o, i) => (
            <li key={i} className="grid gap-2 rounded-lg border border-ink/10 bg-white p-3 sm:grid-cols-[1.4fr_0.8fr_1fr_auto]">
              <Input
                value={o.label}
                onChange={(e) =>
                  setOptions((list) =>
                    list.map((x, j) => (i === j ? { ...x, label: e.target.value } : x)),
                  )
                }
                placeholder="Option name"
                className="h-9 text-[12px]"
              />
              <Input
                type="number"
                inputMode="numeric"
                value={o.price}
                onChange={(e) =>
                  setOptions((list) =>
                    list.map((x, j) => (i === j ? { ...x, price: e.target.value } : x)),
                  )
                }
                placeholder="Price KES"
                className="h-9 text-[12px]"
              />
              <Input
                value={o.supplier}
                onChange={(e) =>
                  setOptions((list) =>
                    list.map((x, j) => (i === j ? { ...x, supplier: e.target.value } : x)),
                  )
                }
                placeholder="Supplier"
                className="h-9 text-[12px]"
              />
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-[11px] text-ink/60">
                  <input
                    type="checkbox"
                    checked={o.recommended}
                    onChange={(e) =>
                      setOptions((list) =>
                        list.map((x, j) =>
                          i === j ? { ...x, recommended: e.target.checked } : x,
                        ),
                      )
                    }
                  />
                  pick
                </label>
                {options.length > 1 ? (
                  <button
                    type="button"
                    aria-label="Remove this option"
                    onClick={() => setOptions((list) => list.filter((_, j) => j !== i))}
                    className="grid size-9 place-items-center rounded-lg text-muted hover:bg-stone"
                  >
                    <X className="size-4" />
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
        {options.length < 6 ? (
          <Button
            size="sm"
            variant="ghost"
            className="mt-2"
            onClick={() =>
              setOptions((list) => [
                ...list,
                { label: "", price: "", description: "", supplier: "", leadTime: "", recommended: false },
              ])
            }
          >
            <Plus className="size-4" />
            Add an option
          </Button>
        ) : null}
      </div>

      {create.error instanceof Error ? (
        <p role="alert" className="text-[12px] text-red-700">
          {create.error.message}
        </p>
      ) : null}

      <Button
        disabled={!valid || create.isPending}
        onClick={() =>
          create.mutate({
            data: {
              projectId,
              title: title.trim(),
              category,
              stage: "",
              allowance: Number(allowance) || 0,
              deadline,
              note,
              options: options
                .filter((o) => o.label.trim())
                .map((o) => ({
                  label: o.label.trim(),
                  description: o.description,
                  supplier: o.supplier.trim(),
                  price: Number(o.price) || 0,
                  leadTime: o.leadTime,
                  recommended: o.recommended,
                })),
            },
          })
        }
      >
        {create.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        Publish to the client
      </Button>
    </div>
  );
}
