import { useMemo, useState } from "react";
import { Info, Search } from "lucide-react";
import { MATERIALS, MATERIAL_CATEGORIES, MATERIAL_PRICE_SOURCE } from "@/lib/materials";
import { cn } from "@/lib/utils";

const KES = new Intl.NumberFormat("en-KE", {
  maximumFractionDigits: 2,
});

export function MaterialPrices() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return MATERIALS.filter((item) => {
      const matchesCategory = activeCategory === "all" || item.category === activeCategory;
      const matchesSearch =
        !query ||
        item.name.toLocaleLowerCase().includes(query) ||
        item.specification.toLocaleLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  return (
    <div>
      <section className="mb-5 rounded-2xl border border-line/60 bg-paper p-4 shadow-soft sm:mb-7 sm:rounded-[1.75rem] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
              Dated market survey · {MATERIAL_PRICE_SOURCE.published}
            </p>
            <h2 className="mt-2 font-display text-xl text-maroon sm:text-2xl">
              Compare individual material prices by town
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/70">
              The table shows PPRA reference prices for sampled items and specifications. It does
              not calculate a building or project total.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[340px]">
            <div className="rounded-xl border border-line bg-cream p-3">
              <p className="text-[10px] uppercase tracking-[0.12em] text-muted">Survey period</p>
              <p className="mt-1 text-sm font-medium text-maroon">
                {MATERIAL_PRICE_SOURCE.surveyStart} – {MATERIAL_PRICE_SOURCE.surveyEnd}
              </p>
            </div>
            <div className="rounded-xl border border-line bg-cream p-3">
              <p className="text-[10px] uppercase tracking-[0.12em] text-muted">Locations</p>
              <p className="mt-1 text-sm font-medium text-maroon">Nairobi + 4 regional towns</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search material prices</span>
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Search materials or specifications"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-12 w-full rounded-2xl border border-line/50 bg-cream pl-10 pr-4 text-sm text-ink outline-none transition-colors focus:border-burgundy"
          />
        </label>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
        <CategoryButton
          label="All"
          count={MATERIALS.length}
          selected={activeCategory === "all"}
          onClick={() => setActiveCategory("all")}
        />
        {MATERIAL_CATEGORIES.map((category) => {
          const count = MATERIALS.filter((item) => item.category === category.id).length;
          if (!count) return null;
          return (
            <CategoryButton
              key={category.id}
              label={`${category.icon} ${category.label}`}
              count={count}
              selected={activeCategory === category.id}
              onClick={() => setActiveCategory(category.id)}
            />
          );
        })}
      </div>

      <p className="mb-3 text-sm text-muted">
        Showing {filtered.length} of {MATERIALS.length} reference items
      </p>

      <div className="overflow-x-auto rounded-2xl border border-line/60 bg-paper">
        <table className="w-full min-w-[880px] border-collapse text-left text-sm">
          <caption className="sr-only">
            PPRA market price references by surveyed town, in Kenyan shillings per stated unit
          </caption>
          <thead className="bg-cream text-[10px] uppercase tracking-[0.12em] text-muted">
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-10 min-w-64 border-b border-line/60 bg-cream px-4 py-3"
              >
                Item and specification
              </th>
              <th scope="col" className="min-w-20 border-b border-line/60 px-3 py-3">
                Unit
              </th>
              {["Eldoret", "Kisumu", "Mombasa", "Nakuru", "Nairobi", "All towns"].map((town) => (
                <th
                  scope="col"
                  key={town}
                  className="min-w-28 border-b border-line/60 px-3 py-3 text-right"
                >
                  {town}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-b border-line/40 last:border-0">
                <th scope="row" className="sticky left-0 bg-paper px-4 py-3 text-left">
                  <span className="block font-medium text-maroon">{item.name}</span>
                  <span className="mt-0.5 block text-xs font-normal text-muted">
                    {item.specification}
                  </span>
                </th>
                <td className="px-3 py-3 text-xs text-ink/70">{item.unit}</td>
                {Object.values(item.townPrices).map((price, index) => (
                  <td
                    key={`${item.id}-${index}`}
                    className={cn(
                      "px-3 py-3 text-right tabular-nums",
                      price === null ? "text-muted" : "text-ink/80",
                    )}
                    title={
                      price === null
                        ? "Town average not published; PPRA says the all-town reference applies."
                        : undefined
                    }
                  >
                    {price === null ? "—" : `KES ${KES.format(price)}`}
                  </td>
                ))}
                <td className="bg-gold/5 px-3 py-3 text-right font-medium tabular-nums text-maroon">
                  KES {KES.format(item.allTownPrice)}
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted">
                  No matching materials. Try another search or category.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-line/50 bg-cream p-4 text-xs leading-relaxed text-muted sm:p-5">
        <Info className="mt-0.5 size-4 shrink-0" />
        <div>
          <p>{MATERIAL_PRICE_SOURCE.note}</p>
          <p className="mt-2">
            Source:{" "}
            <a
              href={MATERIAL_PRICE_SOURCE.url}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-burgundy underline underline-offset-2"
            >
              Public Procurement Regulatory Authority (PPRA), Market Price Reference Guide, June
              2026
            </a>
            . For towns not sampled, do not treat a neighboring town&apos;s price as a local quote.
          </p>
        </div>
      </div>
    </div>
  );
}

function CategoryButton({
  label,
  count,
  selected,
  onClick,
}: {
  label: string;
  count: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "min-h-12 shrink-0 rounded-2xl px-4 py-2.5 text-sm font-medium transition",
        selected
          ? "bg-maroon text-white shadow-soft"
          : "border border-line/50 bg-cream text-ink/70 hover:border-burgundy/50 hover:text-maroon",
      )}
    >
      {label} <span className="ml-1 text-xs opacity-70">{count}</span>
    </button>
  );
}
