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
      <div className="grid gap-3">
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
            Prices sourced from KNBS Construction Input Price Indices (Q4 2025), IQSK Construction Costs Handbook 2023/2024,
            and verified market surveys. All prices are KES, VAT excluded unless stated. Actual prices vary by brand, supplier,
            location, volume and market conditions. Last verified: Q1 2026.
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
    <div className="bg-cream border border-line/50 rounded-2xl overflow-hidden hover:border-burgundy/30 transition-all duration-200">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 text-left"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="font-display text-base text-maroon truncate">{material.name}</h3>
              <Badge tone="stone" className="shrink-0 text-[9px]">{material.unit}</Badge>
            </div>
            <p className="text-sm text-ink/50 line-clamp-1">{material.notes}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-display text-lg text-maroon tabular-nums">
              {formatMaterialRange(material.minPrice, material.maxPrice)}
            </p>
            <p className="text-[10px] text-muted mt-0.5">per {material.unit}</p>
          </div>
        </div>
      </button>

      {/* Animated expand/collapse */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: expanded ? `${contentHeight}px` : "0px" }}
      >
        <div ref={contentRef} className="px-5 pb-5 border-t border-line/30">
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
                <p className="text-[10px] uppercase tracking-[0.12em] text-muted mb-0.5">Last verified</p>
                <p className="text-sm text-ink/70">{material.lastUpdated}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
