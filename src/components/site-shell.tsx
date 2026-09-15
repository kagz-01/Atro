import { useEffect, type ReactNode } from "react";
import { Concierge } from "@/components/concierge";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsappFab } from "@/components/whatsapp-fab";
import { useSiteStore } from "@/lib/store";

export function SiteShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    void useSiteStore.persist.rehydrate();
  }, []);

  return (
    <div className="min-h-dvh flex flex-col bg-paper text-ink">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <WhatsappFab />
      <Concierge />
    </div>
  );
}
