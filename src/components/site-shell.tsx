import { useEffect, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Concierge } from "@/components/concierge";
import { RouteTransition } from "@/components/motion/route-transition";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsappFab } from "@/components/whatsapp-fab";
import { useSiteStore } from "@/lib/store";

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const hasMarketingFooter = pathname === "/" || pathname === "/diaspora";
  const isStartingProject = pathname === "/start";
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    void useSiteStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (!hasMarketingFooter) {
      setFooterVisible(false);
      return;
    }

    const footer = document.querySelector("[data-site-footer]");
    if (!footer) return;

    const observer = new IntersectionObserver(([entry]) => {
      setFooterVisible(entry.isIntersecting);
    });
    observer.observe(footer);
    return () => observer.disconnect();
  }, [hasMarketingFooter]);

  return (
    <div className="site-canvas min-h-dvh flex flex-col text-ink">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        <RouteTransition routeKey={pathname}>{children}</RouteTransition>
      </main>
      {hasMarketingFooter ? <SiteFooter /> : null}
      {!isStartingProject ? (
        <div
          aria-hidden="true"
          className="h-[calc(9rem+env(safe-area-inset-bottom))] shrink-0 md:hidden"
        />
      ) : null}
      {!footerVisible && !isStartingProject ? (
        <>
          <WhatsappFab />
          <Concierge />
        </>
      ) : null}
    </div>
  );
}
