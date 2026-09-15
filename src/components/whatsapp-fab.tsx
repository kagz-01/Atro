import { MessageCircle } from "lucide-react";
import { useSiteStore } from "@/lib/store";
import { defaultWhatsappText, whatsappHref } from "@/lib/whatsapp";

export function WhatsappFab() {
  const zone = useSiteStore((s) => s.selectedZone);
  const href = whatsappHref(defaultWhatsappText({ zone }));

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="fixed z-30 right-4 bottom-4 md:right-6 md:bottom-6 size-14 rounded-xs bg-whatsapp text-cream shadow-soft inline-flex items-center justify-center hover:brightness-95 active:scale-[0.96] transition-transform"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="size-7" strokeWidth={1.75} />
    </a>
  );
}
