// Kenya Bill of Quantities (BOQ) data — based on SMM2 (Standard Method of Measurement, 2nd Edition, 2008)
// Categories, template line items, and unit rates from verified market data

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

export const CONTINGENCY_OPTIONS = [
  { id: "5", label: "5%", value: 0.05 },
  { id: "10", label: "10%", value: 0.10 },
  { id: "15", label: "15%", value: 0.15 },
  { id: "20", label: "20%", value: 0.20 },
] as const;

// Verified Kenya market rates (KES) — Q1 2026
export const BOQ_TEMPLATES: BoqProjectTemplate[] = [
  {
    id: "3bed-bungalow",
    name: "3-Bedroom Bungalow (120m²)",
    description: "Standard residential bungalow with 3 bedrooms, 2 bathrooms, kitchen, living room",
    items: [
      // Preliminaries
      { categoryId: "prelim", description: "Site establishment, access, security", unit: "LS", quantity: 1, rate: 180000 },
      { categoryId: "prelim", description: "Scaffolding, temporary power, water", unit: "LS", quantity: 1, rate: 120000 },
      // Substructure
      { categoryId: "substructure", description: "Excavate topsoil 200mm deep, remove from site", unit: "m³", quantity: 45, rate: 350 },
      { categoryId: "substructure", description: "Mass concrete in foundations (1:3:6), 600mm deep", unit: "m³", quantity: 36, rate: 8500 },
      { categoryId: "substructure", description: "Reinforced concrete strip foundations (1:2:4)", unit: "m³", quantity: 18, rate: 12500 },
      { categoryId: "substructure", description: "Damp-proof course (DPC) — 2-course thick", unit: "m", quantity: 48, rate: 850 },
      // Concrete
      { categoryId: "concrete", description: "Reinforced concrete columns (1:2:4), 300×300mm", unit: "m³", quantity: 6, rate: 18000 },
      { categoryId: "concrete", description: "RC beams and lintels (1:2:4)", unit: "m³", quantity: 8, rate: 16500 },
      { categoryId: "concrete", description: "RC floor slab, 150mm thick (1:2:4)", unit: "m²", quantity: 120, rate: 4200 },
      { categoryId: "concrete", description: "RC staircases including finish", unit: "LS", quantity: 1, rate: 185000 },
      // Masonry
      { categoryId: "masonry", description: "Machine-cut stone walls, 225mm thick, cement mortar 1:6", unit: "m²", quantity: 280, rate: 3200 },
      { categoryId: "masonry", description: "Internal partition walls, 115mm thick", unit: "m²", quantity: 95, rate: 2100 },
      { categoryId: "masonry", description: "Cement plaster 12mm both sides (1:4)", unit: "m²", quantity: 420, rate: 780 },
      // Roofing
      { categoryId: "roofing", description: "Timber roof trusses, treated cypress 50×150mm", unit: "m²", quantity: 140, rate: 1800 },
      { categoryId: "roofing", description: "Gauge 28 corrugated iron sheets, coloured", unit: "m²", quantity: 140, rate: 1100 },
      { categoryId: "roofing", description: "Fascia boards, guttering, downpipes (PVC)", unit: "m", quantity: 48, rate: 950 },
      { categoryId: "roofing", description: "Ceiling boards — gypsum, 9mm", unit: "m²", quantity: 120, rate: 650 },
      // Carpentry
      { categoryId: "carpentry", description: "Solid wood flush doors, 813×2032mm, with frame, lock, stops", unit: "No", quantity: 8, rate: 12000 },
      { categoryId: "carpentry", description: "Steel security door (main entrance), 3-point lock", unit: "No", quantity: 1, rate: 28000 },
      { categoryId: "carpentry", description: "Aluminium sliding windows, glazed, with mosquito nets", unit: "m²", quantity: 18, rate: 5500 },
      // Finishes
      { categoryId: "finishes", description: "Ceramic floor tiles 600×600mm, cement adhesive", unit: "m²", quantity: 100, rate: 3200 },
      { categoryId: "finishes", description: "Wall tiles 300×600mm, bathrooms and kitchen", unit: "m²", quantity: 65, rate: 3800 },
      { categoryId: "finishes", description: "Interior paint — 2 coats emulsion on plaster", unit: "m²", quantity: 380, rate: 380 },
      { categoryId: "finishes", description: "Exterior paint — 2 coats weatherproof on plaster", unit: "m²", quantity: 160, rate: 420 },
      // Plumbing
      { categoryId: "plumbing", description: "Complete plumbing installation — cold & hot water", unit: "LS", quantity: 1, rate: 350000 },
      { categoryId: "plumbing", description: "Sanitaryware — 2 WC, 2 basins, 1 bath, 1 kitchen sink", unit: "LS", quantity: 1, rate: 180000 },
      { categoryId: "plumbing", description: "10,000L water tank on steel stand", unit: "No", quantity: 1, rate: 52000 },
      { categoryId: "plumbing", description: "Soak-away pit, 3-chamber, masonry lined", unit: "LS", quantity: 1, rate: 65000 },
      // Electrical
      { categoryId: "electrical", description: "Complete electrical installation — wiring, lighting, sockets", unit: "LS", quantity: 1, rate: 280000 },
      { categoryId: "electrical", description: "Consumer unit, 12-way MCB board", unit: "No", quantity: 1, rate: 8500 },
      // External
      { categoryId: "external", description: "Perimeter wall, 2.4m high, stone with coping", unit: "m", quantity: 50, rate: 8500 },
      { categoryId: "external", description: "Car park — cabro paving on compacted sub-base", unit: "m²", quantity: 30, rate: 3800 },
      { categoryId: "external", description: "Septic tank, 3-chamber, reinforced concrete", unit: "LS", quantity: 1, rate: 120000 },
    ],
  },
  {
    id: "2bed-apartment",
    name: "2-Bedroom Apartment (80m²)",
    description: "Standard apartment unit with 2 bedrooms, 1 bathroom, kitchen, living area",
    items: [
      { categoryId: "prelim", description: "Pro-rata site establishment", unit: "LS", quantity: 1, rate: 60000 },
      { categoryId: "concrete", description: "RC slab contribution (shared structure)", unit: "m²", quantity: 80, rate: 3500 },
      { categoryId: "masonry", description: "Block walls 150mm, cement mortar", unit: "m²", quantity: 180, rate: 2400 },
      { categoryId: "masonry", description: "Cement plaster 12mm both sides", unit: "m²", quantity: 280, rate: 750 },
      { categoryId: "carpentry", description: "Flush doors with frames and locks", unit: "No", quantity: 5, rate: 11000 },
      { categoryId: "carpentry", description: "Aluminium sliding windows, glazed", unit: "m²", quantity: 10, rate: 5200 },
      { categoryId: "finishes", description: "Ceramic floor tiles 600×600mm", unit: "m²", quantity: 75, rate: 3000 },
      { categoryId: "finishes", description: "Wall tiles, bathroom and kitchen", unit: "m²", quantity: 40, rate: 3500 },
      { categoryId: "finishes", description: "Interior paint, 2 coats", unit: "m²", quantity: 240, rate: 360 },
      { categoryId: "plumbing", description: "Plumbing installation — water supply and drainage", unit: "LS", quantity: 1, rate: 180000 },
      { categoryId: "plumbing", description: "Sanitaryware — 1 WC, 1 basin, 1 shower, 1 kitchen sink", unit: "LS", quantity: 1, rate: 95000 },
      { categoryId: "electrical", description: "Electrical installation — wiring, lighting, sockets", unit: "LS", quantity: 1, rate: 140000 },
    ],
  },
  {
    id: "renovation",
    name: "Residential Renovation (100m²)",
    description: "Kitchen/bathroom renovation, repainting, floor retile",
    items: [
      { categoryId: "prelim", description: "Site protection, dust screens, access", unit: "LS", quantity: 1, rate: 35000 },
      { categoryId: "masonry", description: "Demolition of existing tiles and plaster (selective)", unit: "m²", quantity: 60, rate: 450 },
      { categoryId: "masonry", description: "Re-plaster damaged walls, 12mm", unit: "m²", quantity: 40, rate: 850 },
      { categoryId: "finishes", description: "New ceramic floor tiles, 600×600mm", unit: "m²", quantity: 50, rate: 3200 },
      { categoryId: "finishes", description: "New wall tiles, bathroom and kitchen", unit: "m²", quantity: 35, rate: 3800 },
      { categoryId: "finishes", description: "Interior paint, full repaint, 2 coats", unit: "m²", quantity: 200, rate: 380 },
      { categoryId: "plumbing", description: "Re-plumb kitchen and bathroom", unit: "LS", quantity: 1, rate: 120000 },
      { categoryId: "plumbing", description: "New sanitaryware — WC, basin, shower", unit: "LS", quantity: 1, rate: 85000 },
      { categoryId: "electrical", description: "Re-wire kitchen and bathroom", unit: "LS", quantity: 1, rate: 65000 },
      { categoryId: "carpentry", description: "New kitchen cabinets and countertop", unit: "LS", quantity: 1, rate: 180000 },
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

export function calculateGrandTotal(items: BoqLineItem[], contingencyPct: number): {
  subtotal: number;
  contingency: number;
  total: number;
} {
  const subtotal = items.reduce((sum, i) => sum + calculateLineTotal(i), 0);
  const contingency = Math.round(subtotal * contingencyPct);
  return { subtotal, contingency, total: subtotal + contingency };
}

export function generateBoqPdf(
  items: BoqLineItem[],
  contingencyPct: number,
  projectName: string,
  projectType: string,
): void {
  const { subtotal, contingency, total } = calculateGrandTotal(items, contingencyPct);
  const lines: string[] = [];

  lines.push("BILL OF QUANTITIES");
  lines.push(`Project: ${projectName || "Untitled Project"}`);
  lines.push(`Type: ${projectType}`);
  lines.push(`Generated: ${new Date().toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })}`);
  lines.push(`Currency: KES (VAT exclusive)`);
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
        item.rate.toLocaleString("en-KE").padStart(14) +
        amt.toLocaleString("en-KE").padStart(14),
      );
    }
    lines.push(
      "".padEnd(45) +
      "".padEnd(8) +
      "".padStart(8) +
      "Subtotal".padStart(14) +
      catTotal.toLocaleString("en-KE").padStart(14),
    );
    lines.push("─".repeat(80));
  }

  lines.push("");
  lines.push("─".repeat(80));
  lines.push(
    "".padEnd(45) +
    "".padEnd(8) +
    "".padStart(8) +
    "SUBTOTAL".padStart(14) +
    subtotal.toLocaleString("en-KE").padStart(14),
  );
  lines.push(
    "".padEnd(45) +
    "".padEnd(8) +
    "".padStart(8) +
    `CONTINGENCY (${Math.round(contingencyPct * 100)}%)`.padStart(14) +
    contingency.toLocaleString("en-KE").padStart(14),
  );
  lines.push("─".repeat(80));
  lines.push(
    "".padEnd(45) +
    "".padEnd(8) +
    "".padStart(8) +
    "GRAND TOTAL".padStart(14) +
    total.toLocaleString("en-KE").padStart(14),
  );
  lines.push("─".repeat(80));
  lines.push("");
  lines.push("NOTES:");
  lines.push("1. Rates are indicative — based on verified Q1 2026 Kenya market data.");
  lines.push("2. Quantities are preliminary and subject to site measurement.");
  lines.push("3. Excludes VAT (16%), statutory fees, professional fees, land and site investigations.");
  lines.push("4. Measurement in accordance with SMM2 (Standard Method of Measurement, 2nd Edition, 2008).");
  lines.push("5. A quantity surveyor should verify all items before tendering.");
  lines.push("");
  lines.push("Source: KNBS CIPI Q4 2025, IQSK Cost Handbook, EAPI Housing Cost Analysis");
  lines.push("Generated by ATRO Design & Construction — atro.co.ke");

  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `atro-boq-${projectName.toLowerCase().replace(/\s+/g, "-") || "untitled"}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
