import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { SiteShell } from "@/components/site-shell";
import appCss from "../styles.css?url";
import { PreviewBanner } from "@/components/preview-banner";
import { PreviewPersonaSwitcher } from "@/components/preview-persona-switcher";

const APP_NAME = "ATRO Design & Construction";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "ATRO Design & Construction — high-quality design and construction for residential, commercial and institutional projects in Kenya. Concept to completion, built to last.",
      },
      { name: "theme-color", content: "#3C0508" },
      { name: "keywords", content: "construction company in Kenya, design and construction company Kenya, building contractors Nairobi, building contractors Kiambu, architectural design Kenya" },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
      { rel: "icon", type: "image/png", href: "/favicon-32.png", sizes: "32x32" },
      { rel: "icon", type: "image/png", href: "/favicon-16.png", sizes: "16x16" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "icon", type: "image/png", href: "/icon-192.png", sizes: "192x192" },
      { rel: "icon", type: "image/png", href: "/icon-512.png", sizes: "512x512" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Outfit:wght@300;400;500;600;700&display=swap",
      },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  // The console and the portal are applications, not pages on the site: they
  // bring their own navigation, so the marketing header, footer, WhatsApp
  // button and concierge would only get in the way of the data.
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isApp = pathname.startsWith("/admin") || pathname.startsWith("/portal");

  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-paper text-ink">
        <PreviewHostBridge />
        <PreviewBanner />
        <PreviewPersonaSwitcher />
        <AuthProvider>
          {isApp ? (
            <Outlet />
          ) : (
            <SiteShell>
              <Outlet />
            </SiteShell>
          )}
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
