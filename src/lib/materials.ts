// Verified 2025/2026 Kenya construction material prices
// Sources: KNBS Construction Input Price Indices Q4 2025, IQSK Cost Handbook, aspaxconstruction.com, goldstay.co.ke
// Prices are indicative ranges — actual prices vary by brand, supplier, location and volume

export type MaterialCategory =
  | "cement"
  | "steel"
  | "aggregates"
  | "blocks"
  | "roofing"
  | "timber"
  | "finishes"
  | "plumbing"
  | "electrical"
  | "paint";

export type MaterialItem = {
  id: string;
  name: string;
  category: MaterialCategory;
  unit: string;
  minPrice: number;
  maxPrice: number;
  brands: string[];
  notes: string;
  lastUpdated: string;
};

export const MATERIAL_CATEGORIES: { id: MaterialCategory; label: string; icon: string; description: string }[] = [
  { id: "cement", label: "Cement", icon: "🏭", description: "Portland cement, 50kg bags" },
  { id: "steel", label: "Steel & Rebar", icon: "🔩", description: "Reinforcement bars, mesh, structural steel" },
  { id: "aggregates", label: "Sand, Ballast & Stone", icon: "🪨", description: "River sand, ballast, quarry stone" },
  { id: "blocks", label: "Blocks & Bricks", icon: "🧱", description: "Machine-cut stone, concrete blocks, clay bricks" },
  { id: "roofing", label: "Roofing", icon: "🏠", description: "Iron sheets, stone-coated tiles, ridge caps" },
  { id: "timber", label: "Timber", icon: "🪵", description: "Construction timber, treated pine, plywood" },
  { id: "finishes", label: "Tiles & Sanitaryware", icon: "✨", description: "Floor tiles, wall tiles, doors, sanitaryware" },
  { id: "plumbing", label: "Plumbing", icon: "🚿", description: "Pipes, fittings, tanks, fixtures" },
  { id: "electrical", label: "Electrical", icon: "⚡", description: "Cables, conduit, switches, distribution boards" },
  { id: "paint", label: "Paint", icon: "🎨", description: "Interior, exterior, primers, undercoats" },
];

export const MATERIALS: MaterialItem[] = [
  // ─── Cement ───
  {
    id: "cement-32.5r",
    name: "Cement 32.5R (general purpose)",
    category: "cement",
    unit: "50kg bag",
    minPrice: 700,
    maxPrice: 780,
    brands: ["Bamburi Nguvu", "Simba 32.5R", "Rhino", "Nyumba"],
    notes: "Most common for general construction, mortar, plaster",
    lastUpdated: "Q4 2025",
  },
  {
    id: "cement-42.5n",
    name: "Cement 42.5N (high strength)",
    category: "cement",
    unit: "50kg bag",
    minPrice: 850,
    maxPrice: 1200,
    brands: ["Simba 42.5N", "Bamburi Power Plus", "Savannah"],
    notes: "For structural concrete, foundations, columns",
    lastUpdated: "Q4 2025",
  },
  {
    id: "cement-blended",
    name: "Blended cement (Pozzolana)",
    category: "cement",
    unit: "50kg bag",
    minPrice: 650,
    maxPrice: 750,
    brands: ["Mombasa Cement", "EAPCC", "Rai"],
    notes: "Cheaper alternative for non-structural work",
    lastUpdated: "Q4 2025",
  },

  // ─── Steel ───
  {
    id: "steel-d8",
    name: "Deformed steel bar D8 (Y8)",
    category: "steel",
    unit: "12m length",
    minPrice: 600,
    maxPrice: 750,
    brands: ["MidSteel", "Histeel", "Mastar", "New Steel"],
    notes: "Light reinforcement, stirrups, links",
    lastUpdated: "Q1 2026",
  },
  {
    id: "steel-d10",
    name: "Deformed steel bar D10 (Y10)",
    category: "steel",
    unit: "12m length",
    minPrice: 950,
    maxPrice: 1200,
    brands: ["MidSteel", "Histeel", "Mastar"],
    notes: "Light to medium reinforcement",
    lastUpdated: "Q1 2026",
  },
  {
    id: "steel-d12",
    name: "Deformed steel bar D12 (Y12)",
    category: "steel",
    unit: "12m length",
    minPrice: 1400,
    maxPrice: 1750,
    brands: ["MidSteel", "Histeel", "Mastar", "New Steel"],
    notes: "Medium reinforcement, beams, slabs",
    lastUpdated: "Q1 2026",
  },
  {
    id: "steel-d16",
    name: "Deformed steel bar D16 (Y16)",
    category: "steel",
    unit: "12m length",
    minPrice: 2500,
    maxPrice: 3100,
    brands: ["MidSteel", "Histeel", "Mastar"],
    notes: "Heavy reinforcement, columns, foundations",
    lastUpdated: "Q1 2026",
  },
  {
    id: "steel-d20",
    name: "Deformed steel bar D20 (Y20)",
    category: "steel",
    unit: "12m length",
    minPrice: 3200,
    maxPrice: 4000,
    brands: ["MidSteel", "Histeel", "Mastar"],
    notes: "Heavy structural reinforcement",
    lastUpdated: "Q1 2026",
  },
  {
    id: "steel-brc",
    name: "BRC welded mesh (A393)",
    category: "steel",
    unit: "sheet (6m × 2.4m)",
    minPrice: 4500,
    maxPrice: 6000,
    brands: ["MidSteel", "Histeel"],
    notes: "Slab reinforcement, paths, driveways",
    lastUpdated: "Q1 2026",
  },

  // ─── Aggregates ───
  {
    id: "sand-river",
    name: "River sand",
    category: "aggregates",
    unit: "tonne",
    minPrice: 1800,
    maxPrice: 2400,
    brands: [],
    notes: "For concrete, mortar, plaster. Prices vary by distance from river",
    lastUpdated: "Q4 2025",
  },
  {
    id: "sand-philadelphia",
    name: "Philadelphia / manufactured sand",
    category: "aggregates",
    unit: "tonne",
    minPrice: 1500,
    maxPrice: 2000,
    brands: [],
    notes: "Crushed stone sand — cheaper alternative to river sand",
    lastUpdated: "Q4 2025",
  },
  {
    id: "ballast",
    name: "Ballast (19mm + 13mm)",
    category: "aggregates",
    unit: "tonne",
    minPrice: 1300,
    maxPrice: 1800,
    brands: [],
    notes: "For concrete mixing, foundation work",
    lastUpdated: "Q4 2025",
  },
  {
    id: "stone-quarry",
    name: "Quarry stone (hardcore)",
    category: "aggregates",
    unit: "tonne",
    minPrice: 1500,
    maxPrice: 2100,
    brands: [],
    notes: "Foundation filling, sub-base",
    lastUpdated: "Q4 2025",
  },
  {
    id: "murram",
    name: "Murram / fill material",
    category: "aggregates",
    unit: "tonne",
    minPrice: 800,
    maxPrice: 1200,
    brands: [],
    notes: "Site filling, compaction, road sub-base",
    lastUpdated: "Q4 2025",
  },

  // ─── Blocks & Bricks ───
  {
    id: "stone-machine-cut",
    name: "Machine-cut stone (6×9 inches)",
    category: "blocks",
    unit: "piece",
    minPrice: 50,
    maxPrice: 75,
    brands: [],
    notes: "Standard walling stone, Nairobi pricing. Up to KES 100 in remote areas",
    lastUpdated: "Q1 2026",
  },
  {
    id: "stone-hand-cut",
    name: "Hand-cut stone (6×9 inches)",
    category: "blocks",
    unit: "piece",
    minPrice: 30,
    maxPrice: 50,
    brands: [],
    notes: "Cheaper but less uniform. Common in rural areas",
    lastUpdated: "Q1 2026",
  },
  {
    id: "block-concrete",
    name: "Concrete block (150mm thick)",
    category: "blocks",
    unit: "piece",
    minPrice: 35,
    maxPrice: 60,
    brands: [],
    notes: "For non-load-bearing walls, partitions",
    lastUpdated: "Q1 2026",
  },
  {
    id: "brick-clay",
    name: "Clay brick (standard)",
    category: "blocks",
    unit: "piece",
    minPrice: 18,
    maxPrice: 35,
    brands: [],
    notes: "Traditional walling, decorative exposed brickwork",
    lastUpdated: "Q1 2026",
  },

  // ─── Roofing ───
  {
    id: "roof-iron-g30",
    name: "Corrugated iron sheet (gauge 30)",
    category: "roofing",
    unit: "metre",
    minPrice: 700,
    maxPrice: 950,
    brands: ["Mabati Factory", "Afristeel", "Galvatech"],
    notes: "Standard roofing. Gauge 30 is thinner/lighter",
    lastUpdated: "Q1 2026",
  },
  {
    id: "roof-iron-g28",
    name: "Corrugated iron sheet (gauge 28)",
    category: "roofing",
    unit: "metre",
    minPrice: 900,
    maxPrice: 1200,
    brands: ["Mabati Factory", "Afristeel", "Galvatech"],
    notes: "Stronger than gauge 30, better wind resistance",
    lastUpdated: "Q1 2026",
  },
  {
    id: "roof-box-profile",
    name: "Box profile sheet (0.45mm)",
    category: "roofing",
    unit: "metre",
    minPrice: 1100,
    maxPrice: 1500,
    brands: ["Mabati Factory", "Alaf"],
    notes: "Modern profile, better water runoff",
    lastUpdated: "Q1 2026",
  },
  {
    id: "roof-stone-coated",
    name: "Stone-coated roof tile",
    category: "roofing",
    unit: "m²",
    minPrice: 1800,
    maxPrice: 3200,
    brands: ["Decra", "TileTech", "Stonechips"],
    notes: "Premium roofing, 50+ year lifespan. Colour options",
    lastUpdated: "Q1 2026",
  },
  {
    id: "roof-ridge-cap",
    name: "Ridge cap (mabati)",
    category: "roofing",
    unit: "piece (2m)",
    minPrice: 350,
    maxPrice: 550,
    brands: [],
    notes: "For roof ridges and hips",
    lastUpdated: "Q1 2026",
  },

  // ─── Timber ───
  {
    id: "timber-cypress-2x3",
    name: "Cypress timber (2×3 inches)",
    category: "timber",
    unit: "metre",
    minPrice: 80,
    maxPrice: 130,
    brands: [],
    notes: "Roof trusses, framing, general construction",
    lastUpdated: "Q1 2026",
  },
  {
    id: "timber-treated-pine",
    name: "Treated pine (structural)",
    category: "timber",
    unit: "metre",
    minPrice: 120,
    maxPrice: 200,
    brands: [],
    notes: "Termite-treated, for exposed structural elements",
    lastUpdated: "Q1 2026",
  },
  {
    id: "timber-plywood",
    name: "Plywood (12mm, marine grade)",
    category: "timber",
    unit: "sheet (8×4 ft)",
    minPrice: 1200,
    maxPrice: 2000,
    brands: ["Revolution", "Inter ply"],
    notes: "Formwork, ceiling, cabinetry",
    lastUpdated: "Q1 2026",
  },

  // ─── Finishes ───
  {
    id: "tile-floor-ceramic",
    name: "Ceramic floor tile",
    category: "finishes",
    unit: "m²",
    minPrice: 1500,
    maxPrice: 3500,
    brands: ["Orient", "Serengeti", "Royal Ceramics"],
    notes: "600×600mm standard. Prices by design and quality",
    lastUpdated: "Q1 2026",
  },
  {
    id: "tile-floor-porcelain",
    name: "Porcelain floor tile",
    category: "finishes",
    unit: "m²",
    minPrice: 3000,
    maxPrice: 6500,
    brands: ["Johnson", "RAK", "Somany"],
    notes: "Premium, harder wearing, better for wet areas",
    lastUpdated: "Q1 2026",
  },
  {
    id: "tile-wall",
    name: "Wall tile (ceramic)",
    category: "finishes",
    unit: "m²",
    minPrice: 1200,
    maxPrice: 4500,
    brands: ["Orient", "Serengeti", "Royal Ceramics"],
    notes: "For bathrooms, kitchens. 300×600mm standard",
    lastUpdated: "Q1 2026",
  },
  {
    id: "door-panel",
    name: "Single panel solid wood door",
    category: "finishes",
    unit: "unit",
    minPrice: 8000,
    maxPrice: 25000,
    brands: ["Ecoli", "Kenwood", "Custom joinery"],
    notes: "With frame, lock and hinges. Imported doors available",
    lastUpdated: "Q1 2026",
  },
  {
    id: "door-steel",
    name: "Steel security door",
    category: "finishes",
    unit: "unit",
    minPrice: 15000,
    maxPrice: 40000,
    brands: ["Galana", "Steeltec"],
    notes: "For main entrance. 3-point lock standard",
    lastUpdated: "Q1 2026",
  },
  {
    id: "sanitaryware-wc",
    name: "WC suite (toilet + seat + cistern)",
    category: "finishes",
    unit: "set",
    minPrice: 8000,
    maxPrice: 45000,
    brands: ["Twyford", "Johnson", "RAK", "CERA"],
    notes: "Huge price range — basic to premium. Installation extra",
    lastUpdated: "Q1 2026",
  },

  // ─── Plumbing ───
  {
    id: "pipe-pvc-110",
    name: "PVC waste pipe (110mm)",
    category: "plumbing",
    unit: "6m length",
    minPrice: 600,
    maxPrice: 900,
    brands: ["Wavin", "Kaylee", "Polypipe"],
    notes: "Main drainage and sewer lines",
    lastUpdated: "Q1 2026",
  },
  {
    id: "pipe-pvc-25",
    name: "PVC water pipe (25mm / 1 inch)",
    category: "plumbing",
    unit: "6m length",
    minPrice: 200,
    maxPrice: 350,
    brands: ["Wavin", "Kaylee"],
    notes: "Cold water distribution",
    lastUpdated: "Q1 2026",
  },
  {
    id: "tank-water-10000",
    name: "Plastic water tank (10,000 litres)",
    category: "plumbing",
    unit: "unit",
    minPrice: 35000,
    maxPrice: 55000,
    brands: ["Roto", "Klem Plast", "Politank"],
    notes: "Overhead or ground level. With lid and fittings",
    lastUpdated: "Q1 2026",
  },

  // ─── Electrical ───
  {
    id: "cable-2.5mm",
    name: "2.5mm² twin & earth cable",
    category: "electrical",
    unit: "100m roll",
    minPrice: 4500,
    maxPrice: 6500,
    brands: ["KenKable", "Sollatek", "General Cable"],
    notes: "Lighting and socket circuits (ring final)",
    lastUpdated: "Q1 2026",
  },
  {
    id: "cable-4mm",
    name: "4mm² twin & earth cable",
    category: "electrical",
    unit: "100m roll",
    minPrice: 7000,
    maxPrice: 10000,
    brands: ["KenKable", "Sollatek"],
    notes: "Cooker circuit, shower, higher loads",
    lastUpdated: "Q1 2026",
  },
  {
    id: "consumer-unit",
    name: "Consumer unit (MCB board, 12-way)",
    category: "electrical",
    unit: "unit",
    minPrice: 5000,
    maxPrice: 12000,
    brands: ["Hager", "Schneider", "MK"],
    notes: "Main distribution board. 6-way to 24-way options",
    lastUpdated: "Q1 2026",
  },

  // ─── Paint ───
  {
    id: "paint-interior",
    name: "Interior emulsion paint",
    category: "paint",
    unit: "20L bucket",
    minPrice: 3500,
    maxPrice: 6000,
    brands: ["Crown", "Basco", "Galaxy", "Heritage"],
    notes: "Covers ~120m² per 20L. 2 coats standard",
    lastUpdated: "Q1 2026",
  },
  {
    id: "paint-exterior",
    name: "Exterior weatherproof paint",
    category: "paint",
    unit: "20L bucket",
    minPrice: 4500,
    maxPrice: 8000,
    brands: ["Crown", "Basco", "Plascon"],
    notes: "UV and rain resistant. Acrylic or PVA based",
    lastUpdated: "Q1 2026",
  },
  {
    id: "paint-primer",
    name: "Wall primer / undercoat",
    category: "paint",
    unit: "20L bucket",
    minPrice: 2500,
    maxPrice: 4000,
    brands: ["Crown", "Basco"],
    notes: "Seals surface before painting. Essential for new plaster",
    lastUpdated: "Q1 2026",
  },
];

export function getMaterialsByCategory(category: MaterialCategory): MaterialItem[] {
  return MATERIALS.filter((m) => m.category === category);
}

export function searchMaterials(query: string): MaterialItem[] {
  const q = query.toLowerCase();
  return MATERIALS.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.brands.some((b) => b.toLowerCase().includes(q)) ||
      m.notes.toLowerCase().includes(q),
  );
}

export function formatMaterialPrice(price: number): string {
  return `KES ${price.toLocaleString("en-KE")}`;
}

export function formatMaterialRange(min: number, max: number): string {
  return `KES ${min.toLocaleString("en-KE")} – ${max.toLocaleString("en-KE")}`;
}

export function getCategoryStats(category: MaterialCategory) {
  const items = getMaterialsByCategory(category);
  return {
    count: items.length,
    avgMin: Math.round(items.reduce((s, m) => s + m.minPrice, 0) / items.length),
    avgMax: Math.round(items.reduce((s, m) => s + m.maxPrice, 0) / items.length),
  };
}
