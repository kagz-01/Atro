// Editable quantities worksheet data. Templates contain no assumed quantities
// or rates; enter measurements and current project-specific prices yourself.

export type BoqCategory = {
  id: string;
  name: string;
  section: string;
  description: string;
};

export type BoqLineItem = {
  id: string;
  categoryId: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
};

export type BoqProjectTemplate = {
  id: string;
  name: string;
  description: string;
  items: Omit<BoqLineItem, "id">[];
};

export const BOQ_CATEGORIES: BoqCategory[] = [
  { id: "prelim", name: "Preliminaries", section: "Section 1", description: "Site setup, temporary works, health & safety" },
  { id: "substructure", name: "Substructure", section: "Section 2", description: "Excavation, foundations, underground drainage" },
  { id: "concrete", name: "Concrete & Frame", section: "Section 3", description: "RC frame, columns, beams, slabs, stairs" },
  { id: "masonry", name: "Masonry", section: "Section 4", description: "Walling — stone, block, brick, plastering" },
  { id: "roofing", name: "Roofing", section: "Section 5", description: "Roof structure, covering, waterproofing, gutters" },
  { id: "carpentry", name: "Carpentry & Joinery", section: "Section 6", description: "Doors, windows, built-in furniture, ceiling" },
  { id: "finishes", name: "Finishes", section: "Section 7", description: "Floor, wall and ceiling finishes, tiling, painting" },
  { id: "plumbing", name: "Plumbing & Drainage", section: "Section 8", description: "Water supply, sanitaryware, drainage, tanks" },
  { id: "electrical", name: "Electrical", section: "Section 9", description: "Wiring, distribution, lighting, earth leakage" },
  { id: "mechanical", name: "Mechanical", section: "Section 10", description: "HVAC, fire, lift, generator provisions" },
  { id: "external", name: "External Works", section: "Section 11", description: "Fencing, paving, landscaping, drainage, external services" },
];

export const UNITS = [
  "m²", "m³", "m", "kg", "tonne", "No", "LS", "set", "lot", "hr", "day", "week", "month",
] as const;

export const BOQ_TEMPLATES: BoqProjectTemplate[] = [
  {
    id: "3bed-bungalow",
    name: "Residential Building",
    description: "Scope starter only. Measure quantities and enter current project-specific rates.",
    items: [
      { categoryId: "prelim", description: "Site establishment and temporary works", unit: "LS", quantity: 0, rate: 0 },
      { categoryId: "substructure", description: "Excavation and disposal", unit: "m³", quantity: 0, rate: 0 },
      { categoryId: "substructure", description: "Foundations and damp-proof course", unit: "LS", quantity: 0, rate: 0 },
      { categoryId: "concrete", description: "Reinforced concrete frame and slabs", unit: "m³", quantity: 0, rate: 0 },
      { categoryId: "masonry", description: "External and internal walling", unit: "m²", quantity: 0, rate: 0 },
      { categoryId: "roofing", description: "Roof structure and covering", unit: "m²", quantity: 0, rate: 0 },
      { categoryId: "carpentry", description: "Doors, windows and joinery", unit: "LS", quantity: 0, rate: 0 },
      { categoryId: "finishes", description: "Floor, wall and ceiling finishes", unit: "LS", quantity: 0, rate: 0 },
      { categoryId: "plumbing", description: "Water supply and drainage", unit: "LS", quantity: 0, rate: 0 },
      { categoryId: "electrical", description: "Electrical installation", unit: "LS", quantity: 0, rate: 0 },
      { categoryId: "external", description: "External works and services", unit: "LS", quantity: 0, rate: 0 },
    ],
  },
  {
    id: "2bed-apartment",
    name: "Apartment or Multi-unit",
    description: "Scope starter only. Confirm shared works and measure this project's quantities.",
    items: [
      { categoryId: "prelim", description: "Site establishment and temporary works", unit: "LS", quantity: 0, rate: 0 },
      { categoryId: "substructure", description: "Foundations and below-ground services", unit: "LS", quantity: 0, rate: 0 },
      { categoryId: "concrete", description: "Shared frame, slabs and stairs", unit: "LS", quantity: 0, rate: 0 },
      { categoryId: "masonry", description: "External and internal walling", unit: "m²", quantity: 0, rate: 0 },
      { categoryId: "roofing", description: "Roof structure and covering", unit: "m²", quantity: 0, rate: 0 },
      { categoryId: "carpentry", description: "Doors, windows and joinery", unit: "LS", quantity: 0, rate: 0 },
      { categoryId: "finishes", description: "Floor, wall and ceiling finishes", unit: "LS", quantity: 0, rate: 0 },
      { categoryId: "plumbing", description: "Water supply and drainage", unit: "LS", quantity: 0, rate: 0 },
      { categoryId: "electrical", description: "Electrical installation", unit: "LS", quantity: 0, rate: 0 },
      { categoryId: "external", description: "External works and shared services", unit: "LS", quantity: 0, rate: 0 },
    ],
  },
  {
    id: "renovation",
    name: "Renovation",
    description: "Scope starter only. Inspect the existing property and measure affected areas.",
    items: [
      { categoryId: "prelim", description: "Protection, access and temporary works", unit: "LS", quantity: 0, rate: 0 },
      { categoryId: "masonry", description: "Demolition, making good and repairs", unit: "LS", quantity: 0, rate: 0 },
      { categoryId: "carpentry", description: "Doors, windows and joinery", unit: "LS", quantity: 0, rate: 0 },
      { categoryId: "finishes", description: "Floor, wall and ceiling finishes", unit: "LS", quantity: 0, rate: 0 },
      { categoryId: "plumbing", description: "Plumbing alterations and fixtures", unit: "LS", quantity: 0, rate: 0 },
      { categoryId: "electrical", description: "Electrical alterations", unit: "LS", quantity: 0, rate: 0 },
    ],
  },
];

export function createEmptyLineItem(categoryId: string): BoqLineItem {
  return {
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId,
    description: "",
    unit: "m²",
    quantity: 0,
    rate: 0,
  };
}

export function calculateLineTotal(item: BoqLineItem): number {
  return item.quantity * item.rate;
}

export function calculateCategorySubtotal(items: BoqLineItem[], categoryId: string): number {
  return items
    .filter((i) => i.categoryId === categoryId)
    .reduce((sum, i) => sum + calculateLineTotal(i), 0);
}

export function calculatePricedSubtotal(items: BoqLineItem[]): number {
  const subtotal = items.reduce((sum, i) => sum + calculateLineTotal(i), 0);
  return subtotal;
}

export function downloadBoqWorksheet(
  items: BoqLineItem[],
  projectName: string,
  projectType: string,
): void {
  const subtotal = calculatePricedSubtotal(items);
  const lines: string[] = [];

  lines.push("PRELIMINARY QUANTITIES WORKSHEET");
  lines.push(`Project: ${projectName || "Untitled Project"}`);
  lines.push(`Type: ${projectType}`);
  lines.push(`Generated: ${new Date().toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })}`);
  lines.push(`Currency: KES (confirm tax treatment)`);
  lines.push("");
  lines.push("─".repeat(80));

  // Group by category
  for (const cat of BOQ_CATEGORIES) {
    const catItems = items.filter((i) => i.categoryId === cat.id);
    if (catItems.length === 0) continue;

    lines.push("");
    lines.push(`${cat.section.toUpperCase()}: ${cat.name.toUpperCase()}`);
    lines.push(`${cat.description}`);
    lines.push("─".repeat(80));
    lines.push(
      "Description".padEnd(45) +
      "Unit".padEnd(8) +
      "Qty".padStart(8) +
      "Rate".padStart(14) +
      "Amount".padStart(14),
    );
    lines.push("─".repeat(80));

    let catTotal = 0;
    for (const item of catItems) {
      const amt = calculateLineTotal(item);
      catTotal += amt;
      lines.push(
        item.description.padEnd(45).slice(0, 45) +
        item.unit.padEnd(8) +
        String(item.quantity).padStart(8) +
        (item.rate > 0 ? item.rate.toLocaleString("en-KE") : "—").padStart(14) +
        (item.quantity > 0 && item.rate > 0 ? amt.toLocaleString("en-KE") : "—").padStart(14),
      );
    }
    lines.push(
      "".padEnd(45) +
      "".padEnd(8) +
      "".padStart(8) +
      "Subtotal".padStart(14) +
      (catTotal > 0 ? catTotal.toLocaleString("en-KE").padStart(14) : "—".padStart(14)),
    );
    lines.push("─".repeat(80));
  }

  lines.push("");
  lines.push("─".repeat(80));
  lines.push(
    "".padEnd(45) +
    "".padEnd(8) +
    "".padStart(8) +
    "PRICED LINES SUBTOTAL".padStart(14) +
    (subtotal > 0 ? subtotal.toLocaleString("en-KE").padStart(14) : "—".padStart(14)),
  );
  lines.push("─".repeat(80));
  lines.push("");
  lines.push("NOTES:");
  lines.push("1. Templates do not include assumed quantities or rates; enter measured quantities and current quotations.");
  lines.push("2. The priced-lines subtotal includes only the entries priced in this worksheet; it is not a whole-project total.");
  lines.push("3. Confirm tax treatment, delivery, labour, statutory charges and omitted scope separately.");
  lines.push("4. Work sections and units are a worksheet structure, not a claim of compliance with a measurement standard.");
  lines.push("5. A quantity surveyor must verify scope, specification, quantities and rates before tendering.");
  lines.push("");
  lines.push("Generated by ATRO Design & Construction — atro.co.ke");

  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `atro-boq-${projectName.toLowerCase().replace(/\s+/g, "-") || "untitled"}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
