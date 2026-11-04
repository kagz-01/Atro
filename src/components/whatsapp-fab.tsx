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
      className="fixed z-20 right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] md:right-6 md:bottom-6 h-12 w-12 md:w-auto md:px-4 rounded-full bg-whatsapp text-cream text-[11px] font-medium uppercase tracking-[0.12em] shadow-soft inline-flex items-center justify-center gap-2 hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold active:scale-[0.96] transition-transform"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="size-5 shrink-0" strokeWidth={1.75} />
      <span className="hidden md:inline">WhatsApp</span>
    </a>
  );
}
