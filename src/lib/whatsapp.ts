import { COMPANY } from "@/lib/site";

export function whatsappHref(text: string) {
  return `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function defaultWhatsappText(opts?: { zone?: string | null; type?: string | null }) {
  const bits = ["Hello ATRO — I would like to start a project."];
  if (opts?.type) bits.push(`Type: ${opts.type}.`);
  if (opts?.zone) bits.push(`Location: ${opts.zone}.`);
  return bits.join(" ");
}
