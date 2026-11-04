export const PPRA_PRICE_TOWNS = [
  "Eldoret",
  "Kisumu",
  "Mombasa",
  "Nakuru",
  "Nairobi",
] as const;

export type PpraPriceTown = (typeof PPRA_PRICE_TOWNS)[number];

export type MaterialCategory =
  | "cement"
  | "steel"
  | "finishes"
  | "roofing"
  | "timber"
  | "other";

export type MaterialPriceReference = {
  id: string;
  name: string;
  specification: string;
  category: MaterialCategory;
  unit: string;
  townPrices: Record<PpraPriceTown, number | null>;
  allTownPrice: number;
};

export const MATERIAL_PRICE_SOURCE = {
  title: "PPRA Market Price Reference Guide, June 2026",
  url: "https://ppra.go.ke/mprf-june2026/",
  pdfUrl: "https://ppra.go.ke/download/market-price-reference-guide-june-2026/?wpdmdl=15169",
  surveyStart: "25 May 2026",
  surveyEnd: "6 June 2026",
  published: "June 2026",
  note:
    "Indicative market survey averages for the stated survey period, not live supplier quotations. PPRA surveyed Nairobi, Mombasa, Kisumu, Nakuru and Eldoret. A dash means no town-level average was published; PPRA says the all-town average applies in that case. Confirm current price, stock, delivery and tax with a supplier.",
} as const;

export const MATERIAL_CATEGORIES: {
  id: MaterialCategory;
  label: string;
  icon: string;
}[] = [
  { id: "cement", label: "Cement", icon: "🏭" },
  { id: "steel", label: "Reinforcement steel", icon: "🔩" },
  { id: "finishes", label: "Tiles", icon: "✨" },
  { id: "roofing", label: "Roofing", icon: "🏠" },
  { id: "timber", label: "Boards", icon: "🪵" },
  { id: "other", label: "Other", icon: "📦" },
];

export const MATERIALS: MaterialPriceReference[] = [
  {
    id: "cement-ordinary-50kg",
    name: "Ordinary cement",
    specification: "50 kg bag",
    category: "cement",
    unit: "bag",
    townPrices: {
      Eldoret: 896.5,
      Kisumu: 875.53,
      Mombasa: 846.93,
      Nakuru: 865.28,
      Nairobi: 860.57,
    },
    allTownPrice: 868.09,
  },
  {
    id: "reinforcement-d12-12m",
    name: "Deformed reinforcement bar D12",
    specification: "12 mm diameter, 12 m length",
    category: "steel",
    unit: "bar",
    townPrices: {
      Eldoret: 1313.45,
      Kisumu: 1351.47,
      Mombasa: 1342.43,
      Nakuru: 1315.47,
      Nairobi: 1300.35,
    },
    allTownPrice: 1320.65,
  },
  {
    id: "reinforcement-d10-12m",
    name: "Deformed reinforcement bar D10",
    specification: "10 mm diameter, 12 m length",
    category: "steel",
    unit: "bar",
    townPrices: {
      Eldoret: 616.9,
      Kisumu: 639.25,
      Mombasa: 710.8,
      Nakuru: 621.08,
      Nairobi: 565.45,
    },
    allTownPrice: 608.87,
  },
  {
    id: "reinforcement-d8-12m",
    name: "Deformed reinforcement bar D8",
    specification: "8 mm diameter, 12 m length",
    category: "steel",
    unit: "bar",
    townPrices: {
      Eldoret: 292.79,
      Kisumu: 386.53,
      Mombasa: 271.44,
      Nakuru: 253.62,
      Nairobi: 349.02,
    },
    allTownPrice: 308.85,
  },
  {
    id: "tile-ceramic-30x30",
    name: "Ceramic floor tile",
    specification: "30 x 30 cm, per square metre",
    category: "finishes",
    unit: "m²",
    townPrices: {
      Eldoret: 1377,
      Kisumu: 1820.76,
      Mombasa: 2156.99,
      Nakuru: 1359.99,
      Nairobi: 1812.28,
    },
    allTownPrice: 1690.41,
  },
  {
    id: "tile-ceramic-60x60",
    name: "Ceramic floor tile",
    specification: "60 x 60 cm, per square metre",
    category: "finishes",
    unit: "m²",
    townPrices: {
      Eldoret: 1899,
      Kisumu: 3104.42,
      Mombasa: 2721.78,
      Nakuru: 3000,
      Nairobi: 2813.79,
    },
    allTownPrice: 2855.61,
  },
  {
    id: "tile-porcelain-600x600",
    name: "Porcelain floor tile",
    specification: "600 x 600 mm, per square metre",
    category: "finishes",
    unit: "m²",
    townPrices: {
      Eldoret: 1989,
      Kisumu: 3144.96,
      Mombasa: 2098.81,
      Nakuru: null,
      Nairobi: 2636.08,
    },
    allTownPrice: 2662.42,
  },
  {
    id: "gypsum-board-12mm",
    name: "Gypsum board",
    specification: "12 mm thick, 1200 x 2400 mm",
    category: "other",
    unit: "board",
    townPrices: {
      Eldoret: 1295.7,
      Kisumu: 1156.43,
      Mombasa: 861.77,
      Nakuru: 980.03,
      Nairobi: 1158.11,
    },
    allTownPrice: 1113.66,
  },
  {
    id: "plywood-12mm",
    name: "Wooden plywood",
    specification: "12 mm thick, 1200 x 2400 mm",
    category: "timber",
    unit: "sheet",
    townPrices: {
      Eldoret: null,
      Kisumu: 1334.06,
      Mombasa: 2200,
      Nakuru: 4800,
      Nairobi: 1324.31,
    },
    allTownPrice: 1663.58,
  },
  {
    id: "dpc-200mm-7m",
    name: "Damp-proof course",
    specification: "200 mm wide x 7 m long",
    category: "other",
    unit: "piece",
    townPrices: {
      Eldoret: 2480.53,
      Kisumu: 2089.16,
      Mombasa: null,
      Nakuru: 2306,
      Nairobi: 2131,
    },
    allTownPrice: 2233,
  },
  {
    id: "binding-wire-25kg",
    name: "Binding wire",
    specification: "25 kg roll",
    category: "steel",
    unit: "roll",
    townPrices: {
      Eldoret: 3322.14,
      Kisumu: 4083.8,
      Mombasa: 3500,
      Nakuru: 3695.46,
      Nairobi: 3539.32,
    },
    allTownPrice: 3663.9,
  },
];
