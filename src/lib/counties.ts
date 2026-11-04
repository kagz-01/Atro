export type KenyaCounty = {
  slug: string;
  name: string;
  serviceZoneSlug?: string;
};

// County names and order follow the Constitution of Kenya, First Schedule.
// `serviceZoneSlug` is set only where the existing ATRO coverage registry names
// that county or an existing multi-county region.
export const KENYA_COUNTIES: readonly KenyaCounty[] = [
  { slug: "mombasa", name: "Mombasa", serviceZoneSlug: "coast" },
  { slug: "kwale", name: "Kwale", serviceZoneSlug: "coast" },
  { slug: "kilifi", name: "Kilifi", serviceZoneSlug: "coast" },
  { slug: "tana-river", name: "Tana River", serviceZoneSlug: "coast" },
  { slug: "lamu", name: "Lamu", serviceZoneSlug: "coast" },
  { slug: "taita-taveta", name: "Taita-Taveta", serviceZoneSlug: "coast" },
  { slug: "garissa", name: "Garissa" },
  { slug: "wajir", name: "Wajir" },
  { slug: "mandera", name: "Mandera" },
  { slug: "marsabit", name: "Marsabit" },
  { slug: "isiolo", name: "Isiolo" },
  { slug: "meru", name: "Meru" },
  { slug: "tharaka-nithi", name: "Tharaka-Nithi" },
  { slug: "embu", name: "Embu" },
  { slug: "kitui", name: "Kitui" },
  { slug: "machakos", name: "Machakos", serviceZoneSlug: "machakos" },
  { slug: "makueni", name: "Makueni" },
  { slug: "nyandarua", name: "Nyandarua" },
  { slug: "nyeri", name: "Nyeri" },
  { slug: "kirinyaga", name: "Kirinyaga" },
  { slug: "muranga", name: "Murang'a" },
  { slug: "kiambu", name: "Kiambu", serviceZoneSlug: "kiambu" },
  { slug: "turkana", name: "Turkana" },
  { slug: "west-pokot", name: "West Pokot" },
  { slug: "samburu", name: "Samburu" },
  { slug: "trans-nzoia", name: "Trans Nzoia" },
  { slug: "uasin-gishu", name: "Uasin Gishu" },
  { slug: "elgeyo-marakwet", name: "Elgeyo-Marakwet" },
  { slug: "nandi", name: "Nandi" },
  { slug: "baringo", name: "Baringo" },
  { slug: "laikipia", name: "Laikipia" },
  { slug: "nakuru", name: "Nakuru", serviceZoneSlug: "nakuru" },
  { slug: "narok", name: "Narok" },
  { slug: "kajiado", name: "Kajiado", serviceZoneSlug: "kajiado" },
  { slug: "kericho", name: "Kericho" },
  { slug: "bomet", name: "Bomet" },
  { slug: "kakamega", name: "Kakamega" },
  { slug: "vihiga", name: "Vihiga" },
  { slug: "bungoma", name: "Bungoma" },
  { slug: "busia", name: "Busia" },
  { slug: "siaya", name: "Siaya" },
  { slug: "kisumu", name: "Kisumu", serviceZoneSlug: "kisumu" },
  { slug: "homa-bay", name: "Homa Bay" },
  { slug: "migori", name: "Migori" },
  { slug: "kisii", name: "Kisii" },
  { slug: "nyamira", name: "Nyamira" },
  { slug: "nairobi", name: "Nairobi", serviceZoneSlug: "nairobi" },
];

export function countyBySlug(slug: string): KenyaCounty | undefined {
  return KENYA_COUNTIES.find((county) => county.slug === slug);
}
