import { useState, useMemo } from "react";
import {
  Plus, Trash2, Download, ChevronDown, ChevronRight,
  Calculator, FileText, Copy, LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  BOQ_CATEGORIES,
  BOQ_TEMPLATES,
  UNITS,
  CONTINGENCY_OPTIONS,
  createEmptyLineItem,
  calculateLineTotal,
  calculateCategorySubtotal,
  calculateGrandTotal,
  generateBoqPdf,
  type BoqLineItem,
} from "@/lib/boq";

export function BoqGenerator() {
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState("3-Bedroom Bungalow");
  const [items, setItems] = useState<BoqLineItem[]>([]);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(["prelim"]));
  const [contingencyId, setContingencyId] = useState("10");
  const [showSummary, setShowSummary] = useState(false);

  const contingencyPct = CONTINGENCY_OPTIONS.find((c) => c.id === contingencyId)?.value ?? 0.10;
  const totals = useMemo(() => calculateGrandTotal(items, contingencyPct), [items, contingencyPct]);

  const toggleCategory = (catId: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const loadTemplate = (templateId: string) => {
    const template = BOQ_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    setProjectName(template.name);
    setProjectType(template.name);
    setItems(
      template.items.map((item, i) => ({
        ...item,
        id: `item-${Date.now()}-${i}`,
      })),
    );
    // Expand all categories that have items
    const catsWithItems = new Set(template.items.map((i) => i.categoryId));
    setExpandedCats(catsWithItems);
  };

  const addItem = (categoryId: string) => {
    setItems((prev) => [...prev, createEmptyLineItem(categoryId)]);
    setExpandedCats((prev) => new Set(prev).add(categoryId));
  };

  const updateItem = (id: string, field: keyof BoqLineItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const duplicateItem = (id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (!item) return prev;
      const newItem = { ...item, id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
      const idx = prev.findIndex((i) => i.id === id);
      return [...prev.slice(0, idx + 1), newItem, ...prev.slice(idx + 1)];
    });
  };

  const handleExport = () => {
    generateBoqPdf(items, contingencyPct, projectName, projectType);
  };

  return (
    <div className="bg-cream border border-line rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-line bg-paper">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <h2 className="font-display text-2xl text-maroon">Bill of Quantities</h2>
            <p className="text-sm text-ink/60 mt-1">
              {items.length} line items · KES {totals.subtotal.toLocaleString("en-KE")} before contingency
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={handleExport} disabled={items.length === 0}>
              <Download className="size-4 mr-1.5" />
              Export
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowSummary(!showSummary)}>
              <Calculator className="size-4 mr-1.5" />
              Summary
            </Button>
          </div>
        </div>

        {/* Project details */}
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-[0.12em] text-muted block mb-1">Project name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. Karen Courtyard House"
              className="w-full h-10 px-3 bg-cream border border-line rounded-lg text-sm text-ink outline-none focus:border-burgundy transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.12em] text-muted block mb-1">Project type</label>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              className="w-full h-10 px-3 bg-cream border border-line rounded-lg text-sm text-ink outline-none focus:border-burgundy appearance-none cursor-pointer"
            >
              <option>3-Bedroom Bungalow</option>
              <option>2-Bedroom Apartment</option>
              <option>Residential Renovation</option>
              <option>Commercial Office</option>
              <option>School Block</option>
              <option>Church</option>
              <option>Custom</option>
            </select>
          </div>
        </div>
      </div>

      {/* Templates (if empty) */}
      {items.length === 0 && (
        <div className="p-6 border-b border-line">
          <div className="flex items-center gap-2 mb-4">
            <LayoutGrid className="size-4 text-maroon" />
            <p className="text-sm font-medium text-maroon">Start from a template</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {BOQ_TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => loadTemplate(t.id)}
                className="text-left p-5 bg-paper border border-line/50 rounded-2xl hover:border-burgundy/50 hover:shadow-card card-lift transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge tone="maroon" className="text-[9px]">{t.items.length} items</Badge>
                </div>
                <p className="font-display text-base text-maroon group-hover:text-burgundy transition-colors">{t.name}</p>
                <p className="text-xs text-ink/50 mt-2 line-clamp-2">{t.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Summary (collapsible) */}
      {showSummary && items.length > 0 && (
        <div className="p-6 border-b border-line bg-paper">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-muted">Subtotal</p>
              <p className="font-display text-2xl text-maroon tabular-nums mt-1">
                KES {totals.subtotal.toLocaleString("en-KE")}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-muted">Contingency ({Math.round(contingencyPct * 100)}%)</p>
              <p className="font-display text-2xl text-maroon tabular-nums mt-1">
                KES {totals.contingency.toLocaleString("en-KE")}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-muted">Grand Total</p>
              <p className="font-display text-2xl text-gold tabular-nums mt-1">
                KES {totals.total.toLocaleString("en-KE")}
              </p>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.12em] text-muted block mb-1">Contingency</label>
              <div className="flex gap-2">
                {CONTINGENCY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setContingencyId(opt.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      contingencyId === opt.id
                        ? "bg-maroon text-white"
                        : "bg-cream border border-line text-ink/70 hover:border-burgundy",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category sections */}
      <div className="divide-y divide-line/50">
        {BOQ_CATEGORIES.map((cat) => {
          const catItems = items.filter((i) => i.categoryId === cat.id);
          const catTotal = calculateCategorySubtotal(items, cat.id);
          const isExpanded = expandedCats.has(cat.id);

          return (
            <div key={cat.id}>
              {/* Category header */}
              <button
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-paper/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="size-4 text-muted" />
                  ) : (
                    <ChevronRight className="size-4 text-muted" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted">{cat.section}</span>
                      <span className="font-medium text-maroon">{cat.name}</span>
                      {catItems.length > 0 && (
                        <Badge tone="stone" className="text-[9px]">{catItems.length}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted mt-0.5 ml-0">{cat.description}</p>
                  </div>
                </div>
                {catTotal > 0 && (
                  <span className="font-display text-sm text-maroon tabular-nums">
                    KES {catTotal.toLocaleString("en-KE")}
                  </span>
                )}
              </button>

              {/* Line items */}
              {isExpanded && (
                <div className="px-6 pb-4">
                  {catItems.length === 0 ? (
                    <button
                      type="button"
                      onClick={() => addItem(cat.id)}
                      className="w-full p-4 border border-dashed border-line rounded-xl text-sm text-muted hover:border-burgundy hover:text-maroon transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="size-4" />
                      Add line item
                    </button>
                  ) : (
                    <div className="space-y-2">
                      {/* Column headers */}
                      <div className="hidden sm:grid grid-cols-[1fr_80px_80px_100px_100px_70px] gap-2 px-3 text-[10px] uppercase tracking-[0.12em] text-muted">
                        <span>Description</span>
                        <span>Unit</span>
                        <span>Qty</span>
                        <span>Rate (KES)</span>
                        <span>Amount</span>
                        <span></span>
                      </div>

                      {catItems.map((item) => (
                        <div
                          key={item.id}
                          className="bg-paper border border-line/50 rounded-2xl p-3 sm:p-3"
                        >
                          {/* Mobile: stacked layout */}
                          <div className="sm:hidden space-y-2">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateItem(item.id, "description", e.target.value)}
                              placeholder="Item description"
                              className="w-full h-9 px-3 bg-cream border border-line/50 rounded-xl text-sm text-ink outline-none focus:border-burgundy"
                            />
                            <div className="grid grid-cols-3 gap-2">
                              <select
                                value={item.unit}
                                onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                                className="h-9 px-2 bg-cream border border-line/50 rounded-xl text-xs text-ink outline-none focus:border-burgundy appearance-none cursor-pointer"
                              >
                                {UNITS.map((u) => (
                                  <option key={u} value={u}>{u}</option>
                                ))}
                              </select>
                              <input
                                type="number"
                                value={item.quantity || ""}
                                onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                                min={0}
                                placeholder="Qty"
                                className="h-9 px-3 bg-cream border border-line/50 rounded-xl text-xs text-ink text-right tabular-nums outline-none focus:border-burgundy"
                              />
                              <input
                                type="number"
                                value={item.rate || ""}
                                onChange={(e) => updateItem(item.id, "rate", Number(e.target.value))}
                                min={0}
                                placeholder="Rate"
                                className="h-9 px-3 bg-cream border border-line/50 rounded-xl text-xs text-ink text-right tabular-nums outline-none focus:border-burgundy"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-display text-sm text-maroon tabular-nums">
                                KES {calculateLineTotal(item).toLocaleString("en-KE")}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => duplicateItem(item.id)}
                                  className="size-8 flex items-center justify-center rounded-xl hover:bg-stone/30 text-muted hover:text-maroon transition-colors"
                                  title="Duplicate"
                                >
                                  <Copy className="size-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeItem(item.id)}
                                  className="size-8 flex items-center justify-center rounded-xl hover:bg-red-50 text-muted hover:text-red-600 transition-colors"
                                  title="Remove"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Desktop: inline layout */}
                          <div className="hidden sm:grid sm:grid-cols-[1fr_80px_80px_100px_100px_70px] gap-2 items-center">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateItem(item.id, "description", e.target.value)}
                              placeholder="Item description"
                              className="w-full h-9 px-3 bg-cream border border-line/50 rounded-xl text-sm text-ink outline-none focus:border-burgundy"
                            />
                            <select
                              value={item.unit}
                              onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                              className="w-full h-9 px-2 bg-cream border border-line/50 rounded-xl text-sm text-ink outline-none focus:border-burgundy appearance-none cursor-pointer"
                            >
                              {UNITS.map((u) => (
                                <option key={u} value={u}>{u}</option>
                              ))}
                            </select>
                            <input
                              type="number"
                              value={item.quantity || ""}
                              onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                              min={0}
                              className="w-full h-9 px-3 bg-cream border border-line/50 rounded-xl text-sm text-ink text-right tabular-nums outline-none focus:border-burgundy"
                            />
                            <input
                              type="number"
                              value={item.rate || ""}
                              onChange={(e) => updateItem(item.id, "rate", Number(e.target.value))}
                              min={0}
                              className="w-full h-9 px-3 bg-cream border border-line/50 rounded-xl text-sm text-ink text-right tabular-nums outline-none focus:border-burgundy"
                            />
                            <div className="h-9 flex items-center justify-end px-3 font-display text-sm text-maroon tabular-nums">
                              {calculateLineTotal(item).toLocaleString("en-KE")}
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => duplicateItem(item.id)}
                                className="size-8 flex items-center justify-center rounded-xl hover:bg-stone/30 text-muted hover:text-maroon transition-colors"
                                title="Duplicate"
                              >
                                <Copy className="size-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="size-8 flex items-center justify-center rounded-xl hover:bg-red-50 text-muted hover:text-red-600 transition-colors"
                                title="Remove"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => addItem(cat.id)}
                        className="w-full py-2 border border-dashed border-line rounded-xl text-xs text-muted hover:border-burgundy hover:text-maroon transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Plus className="size-3.5" />
                        Add item
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-line bg-paper">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted">
              Measurement per SMM2 (2nd Edition, 2008). Excludes VAT (16%), statutory fees, professional fees.
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleExport} disabled={items.length === 0}>
              <FileText className="size-4 mr-1.5" />
              Export BOQ
            </Button>
            <Button size="sm" onClick={handleExport} disabled={items.length === 0}>
              <Download className="size-4 mr-1.5" />
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Sticky summary bar (mobile) */}
      {items.length > 0 && (
        <div className="sticky bottom-0 z-10 bg-maroon text-paper px-6 py-3 flex items-center justify-between shadow-lg sm:hidden">
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-gold">Grand Total</p>
            <p className="font-display text-xl tabular-nums">
              KES {totals.total.toLocaleString("en-KE")}
            </p>
          </div>
          <Button size="sm" onClick={handleExport} className="bg-gold text-maroon hover:bg-gold-light">
            <Download className="size-4 mr-1.5" />
            Export
          </Button>
        </div>
      )}
    </div>
  );
}
