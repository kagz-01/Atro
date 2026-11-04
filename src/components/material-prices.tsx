import { useState, useMemo, useRef, useEffect } from "react";
import { Search, Info, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  MATERIALS,
  MATERIAL_CATEGORIES,
  type MaterialCategory,
  type MaterialItem,
  formatMaterialRange,
} from "@/lib/materials";

export function MaterialPrices() {
  const [activeCategory, setActiveCategory] = useState<MaterialCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc">("name");
  const scrollRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    let items =
      activeCategory === "all"
        ? [...MATERIALS]
        : MATERIALS.filter((m) => m.category === activeCategory);

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.brands.some((b) => b.toLowerCase().includes(q)) ||
          m.notes.toLowerCase().includes(q),
      );
    }

    if (sortBy === "price-asc") items.sort((a, b) => a.minPrice - b.minPrice);
    else if (sortBy === "price-desc") items.sort((a, b) => b.maxPrice - a.maxPrice);
    else items.sort((a, b) => a.name.localeCompare(b.name));

    return items;
  }, [activeCategory, search, sortBy]);

  const totalCount = activeCategory === "all" ? MATERIALS.length : MATERIALS.filter((m) => m.category === activeCategory).length;

  // Count items per category for badges
  const catCounts = useMemo(() => {
    const counts: Record<string, number> = { all: MATERIALS.length };
    MATERIAL_CATEGORIES.forEach((c) => {
      counts[c.id] = MATERIALS.filter((m) => m.category === c.id).length;
    });
    return counts;
  }, []);

  return (
    <div>
      <div className="mb-4 rounded-2xl border border-line/60 bg-paper p-3 shadow-soft sm:mb-6 sm:rounded-[1.75rem] sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between sm:gap-5">
          <div className="max-w-2xl">
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted">Indicative pricing</p>
            <h2 className="mt-2 font-display text-lg text-maroon sm:text-2xl">A practical reference, not a commitment</h2>
            <p className="mt-2 text-xs leading-relaxed text-ink/70 sm:text-sm">
              Use these ranges to sense-check the likely cost of materials before a project brief, supplier enquiry, or formal quantity take-off.
            </p>
          </div>
          <div className="grid min-w-0 grid-cols-3 gap-2 text-left sm:min-w-[260px] sm:gap-3">
            <div className="rounded-xl border border-line bg-cream p-2 sm:rounded-2xl sm:p-3">
              <p className="text-[10px] uppercase tracking-[0.12em] text-muted">Categories</p>
              <p className="mt-2 font-display text-xl text-maroon">{MATERIAL_CATEGORIES.length}</p>
            </div>
            <div className="rounded-xl border border-line bg-cream p-2 sm:rounded-2xl sm:p-3">
              <p className="text-[10px] uppercase tracking-[0.12em] text-muted">Items</p>
              <p className="mt-2 font-display text-xl text-maroon">{MATERIALS.length}</p>
            </div>
            <div className="rounded-xl border border-line bg-cream p-2 sm:rounded-2xl sm:p-3">
              <p className="text-[10px] uppercase tracking-[0.12em] text-muted">Refresh rule</p>
              <p className="mt-2 text-xs font-medium text-ink/75">Price check</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category pills — horizontal scroll on mobile */}
      <div
        ref={scrollRef}
        className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1 snap-x snap-mandatory"
      >
        <button
          type="button"
          onClick={() => setActiveCategory("all")}
          className={cn(
            "snap-start shrink-0 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200",
            activeCategory === "all"
              ? "bg-maroon text-white shadow-soft"
              : "bg-cream border border-line/50 text-ink/70 hover:border-burgundy/50 hover:text-maroon",
          )}
        >
          All
          <span className="ml-1.5 text-xs opacity-70">{catCounts.all}</span>
        </button>
        {MATERIAL_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "snap-start shrink-0 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 whitespace-nowrap",
              activeCategory === cat.id
                ? "bg-maroon text-white shadow-soft"
                : "bg-cream border border-line/50 text-ink/70 hover:border-burgundy/50 hover:text-maroon",
            )}
          >
            <span className="mr-1.5">{cat.icon}</span>
            {cat.label}
            <span className="ml-1.5 text-xs opacity-70">{catCounts[cat.id]}</span>
          </button>
        ))}
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted" />
          <input
            type="text"
            placeholder="Search materials, brands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-cream border border-line/50 rounded-2xl text-sm text-ink outline-none focus:border-burgundy transition-colors"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="h-11 px-4 bg-cream border border-line/50 rounded-2xl text-sm text-ink outline-none focus:border-burgundy appearance-none cursor-pointer"
        >
          <option value="name">Sort by name</option>
          <option value="price-asc">Price: low → high</option>
          <option value="price-desc">Price: high → low</option>
        </select>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted mb-4">
        Showing {filtered.length} of {totalCount} items
      </p>

      {/* Material cards */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
        {filtered.map((material) => (
          <MaterialCard key={material.id} material={material} />
        ))}
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <div className="size-16 mx-auto bg-cream border border-line rounded-2xl flex items-center justify-center mb-4">
              <Package className="size-7 text-muted" />
            </div>
            <p className="text-lg font-display text-maroon">No materials found</p>
            <p className="text-sm text-muted mt-1">Try a different search term or category</p>
          </div>
        )}
      </div>

      {/* Data source note */}
      <div className="mt-8 p-5 bg-cream border border-line/50 rounded-2xl flex items-start gap-3">
        <Info className="size-4 text-muted shrink-0 mt-0.5" />
        <div className="text-xs text-muted leading-relaxed">
          <p className="font-medium text-ink/70">Data sources</p>
          <p className="mt-1">
            These are reference ranges in ATRO's dataset, with item dates shown below; no live supplier quotations are connected to this tool. KNBS Construction Input Price Indices track changes in input prices and are not individual brand or stockist quotations. Prices vary by product, supplier, county, delivery, volume and tax. Confirm a current written quote before relying on a rate.
          </p>
        </div>
      </div>
    </div>
  );
}

function MaterialCard({ material }: { material: MaterialItem }) {
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [expanded]);

  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-line/50 bg-cream transition-all duration-200 hover:border-burgundy/30 sm:rounded-2xl">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 text-left sm:p-5"
      >
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
              <h3 className="line-clamp-2 font-display text-sm leading-tight text-maroon sm:text-base">{material.name}</h3>
              <Badge tone="stone" className="shrink-0 text-[9px]">{material.unit}</Badge>
            </div>
            <p className="line-clamp-2 text-[10px] leading-snug text-ink/50 sm:text-sm sm:leading-normal">{material.notes}</p>
          </div>
          <div className="shrink-0 text-left sm:text-right">
            <p className="font-display text-sm text-maroon tabular-nums sm:text-lg">
              {formatMaterialRange(material.minPrice, material.maxPrice)}
            </p>
            <p className="mt-0.5 text-[9px] text-muted sm:text-[10px]">per {material.unit}</p>
          </div>
        </div>
      </button>

      {/* Animated expand/collapse */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: expanded ? `${contentHeight}px` : "0px" }}
      >
        <div ref={contentRef} className="border-t border-line/30 px-3 pb-3 sm:px-5 sm:pb-5">
          <div className="pt-4 space-y-4">
            {material.brands.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.12em] text-muted mb-2">Brands</p>
                <div className="flex flex-wrap gap-1.5">
                  {material.brands.map((brand) => (
                    <span key={brand} className="px-3 py-1.5 bg-paper border border-line/50 rounded-xl text-xs text-ink/70">
                      {brand}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-muted mb-1">Notes</p>
              <p className="text-sm text-ink/70">{material.notes}</p>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.12em] text-muted mb-0.5">Min price</p>
                <p className="font-display text-sm text-maroon tabular-nums">KES {material.minPrice.toLocaleString("en-KE")}</p>
              </div>
              <div className="w-px h-8 bg-line/50" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.12em] text-muted mb-0.5">Max price</p>
                <p className="font-display text-sm text-maroon tabular-nums">KES {material.maxPrice.toLocaleString("en-KE")}</p>
              </div>
              <div className="w-px h-8 bg-line/50" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.12em] text-muted mb-0.5">Reference date</p>
                <p className="text-sm text-ink/70">{material.lastUpdated}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
