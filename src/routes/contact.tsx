import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone, MessageCircle, Mail, MapPin, Clock, ArrowRight } from "lucide-react";
import { COMPANY, isOpenNow } from "@/lib/site";
import { useState, useEffect } from "react";
import { useRevealOnScroll } from "@/hooks/use-reveal";
import { ScrollRevealText } from "@/components/scroll-effects";
import { cn } from "@/lib/utils";
import { defaultWhatsappText, whatsappHref } from "@/lib/whatsapp";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact — ATRO Design & Construction" },
      {
        name: "description",
        content: "Get in touch with ATRO. Call, message, or visit us in Nairobi. We serve clients across Kenya and the diaspora.",
      },
    ],
  }),
});

/** Live "open now" state, in East Africa Time, so visitors know when to call. */
function OpenNowBadge() {
  // Resolved after mount: the server and the browser read different clocks, so
  // rendering this during SSR would risk a hydration mismatch.
  const [open, setOpen] = useState<boolean | null>(null);
  useEffect(() => {
    const tick = () => setOpen(isOpenNow());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);
  if (open === null) return <span className="mt-2 block h-6" aria-hidden="true" />;
  return (
    <span
      className={cn(
        "mt-2 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em]",
        open ? "bg-emerald-100 text-emerald-800" : "bg-ink/10 text-ink/60",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          open ? "bg-emerald-600" : "bg-ink/40",
        )}
      />
      {open ? "Open now · EAT" : "Closed now · leave a message"}
    </span>
  );
}

function ContactPage() {
  const { ref: heroRef, revealed: heroRevealed } = useRevealOnScroll();
  const { ref: cardsRef, revealed: cardsRevealed } = useRevealOnScroll();

  const contactMethods = [
    {
      icon: <Phone className="size-6" />,
      title: "Call Us",
      value: COMPANY.phoneDisplay,
      href: `tel:${COMPANY.phoneTel}`,
      subtitle: "Call during our Nairobi working hours",
      color: "maroon",
    },
    {
      icon: <MessageCircle className="size-6" />,
      title: "WhatsApp",
      value: "Send us a message",
      href: whatsappHref(defaultWhatsappText()),
      subtitle: "For a quick question or first conversation",
      color: "whatsapp",
    },
    {
      icon: <Mail className="size-6" />,
      title: "Email",
      value: COMPANY.email,
      href: `mailto:${COMPANY.email}`,
      subtitle: "For a longer message or project documents",
      color: "burgundy",
    },
  ];

  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden bg-maroon pb-16 pt-32 md:pb-24 md:pt-40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-burgundy via-maroon to-[#1a0204]" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-gold/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-burgundy/30 rounded-full blur-[120px]" />
        </div>

        <div
          ref={heroRef}
          className={cn(
            "relative mx-auto grid max-w-[1400px] items-center gap-10 px-5 reveal-on-scroll sm:px-8 md:px-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16 lg:px-16",
            heroRevealed && "revealed",
          )}
        >
          <div>
            <div className="reveal inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur-md">
              <span className="size-2 rounded-full bg-gold" />
              <span className="text-[11px] uppercase tracking-[0.18em] text-white/80">
                Contact ATRO
              </span>
            </div>
            <h1 className="reveal reveal-delay-1 mt-6 max-w-3xl font-display text-[2.5rem] leading-[0.96] tracking-[-0.05em] text-paper sm:text-[3.2rem] md:text-[4rem] lg:text-[4.6rem]">
              Let’s talk about{" "}
              <span className="text-gradient-gold italic">what you’re building.</span>
            </h1>
            <p className="reveal reveal-delay-2 mt-6 max-w-2xl text-base leading-relaxed text-paper/75 sm:text-lg">
              Have a project in mind or just a first question? Choose the route that suits you.
              ATRO is based in Nairobi and works across Kenya with clients living abroad.
            </p>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-5 backdrop-blur-sm sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
              Not sure where to start?
            </p>
            <h2 className="mt-3 font-display text-2xl text-paper sm:text-3xl">
              Tell us a little about the project.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-paper/70">
              A few details help us understand the work and suggest a useful next step. There’s
              no commitment to proceed.
            </p>
            <div className="mt-6">
              <Link
                to="/start"
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-semibold text-maroon transition-colors hover:bg-gold-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                Start a project brief
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16 md:py-20">
        <div
          ref={cardsRef}
          className={cn(
            "mx-auto max-w-[1400px] px-5 reveal-on-scroll sm:px-8 md:px-12 lg:px-16",
            cardsRevealed && "revealed",
          )}
        >
          <div className="mb-6 max-w-2xl sm:mb-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-burgundy">
              Reach us directly
            </p>
            <h2 className="mt-2 font-display text-3xl text-maroon sm:text-4xl">
              Choose how you’d like to connect.
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3 md:gap-5">
            {contactMethods.map((method, i) => (
              <ScrollRevealText key={method.title} delay={i * 100}>
                <a
                  href={method.href}
                  className="group flex min-h-28 items-center gap-4 rounded-2xl border border-line/60 bg-cream p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-card-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-maroon sm:p-5 md:min-h-48 md:flex-col md:items-start md:gap-3 md:p-6"
                >
                  <div className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 sm:size-12",
                    method.color === "maroon" && "bg-maroon/10 text-maroon group-hover:bg-maroon group-hover:text-paper",
                    method.color === "whatsapp" && "bg-whatsapp/10 text-whatsapp group-hover:bg-whatsapp group-hover:text-paper",
                    method.color === "burgundy" && "bg-burgundy/10 text-burgundy group-hover:bg-burgundy group-hover:text-paper",
                  )}>
                    {method.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-lg text-maroon md:text-xl">{method.title}</h3>
                    <p className={cn(
                      "mt-1 break-words text-sm font-semibold transition-colors duration-300 sm:text-base",
                      method.color === "maroon" && "text-burgundy group-hover:text-maroon",
                      method.color === "whatsapp" && "text-whatsapp",
                      method.color === "burgundy" && "text-burgundy group-hover:text-maroon",
                    )}>
                      {method.value}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted sm:text-sm">{method.subtitle}</p>
                  </div>
                </a>
              </ScrollRevealText>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-stone/60 to-paper py-14 sm:py-16 md:py-20">
        <div className="mx-auto grid max-w-[1400px] gap-8 px-5 sm:px-8 md:px-12 lg:grid-cols-2 lg:gap-12 lg:px-16">
          <div className="rounded-3xl border border-line/60 bg-white/70 p-6 sm:p-8">
            <div className="flex size-11 items-center justify-center rounded-xl bg-maroon/10 text-maroon">
              <MapPin className="size-5" />
            </div>
            <h2 className="mt-5 font-display text-3xl text-maroon sm:text-4xl">
              Based in Nairobi. Working across Kenya.
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed text-ink/70">
              Our listed location is Nairobi, Kenya. We work on projects across the country and
              support clients living abroad who are planning work here.
            </p>
            <Link
              to="/diaspora"
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg font-medium text-burgundy transition-colors hover:text-maroon focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-maroon"
            >
              Building in Kenya from abroad?
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="rounded-3xl border border-line/60 bg-cream p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-maroon/10 text-maroon">
                <Clock className="size-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-burgundy">
                  Working hours
                </p>
                <p className="mt-1 text-sm text-ink/70">{COMPANY.hours}</p>
              </div>
            </div>
            <OpenNowBadge />
            <details className="mt-5 rounded-xl border border-line/60 bg-white/70">
              <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-4 px-4 py-3 text-sm font-medium text-maroon marker:content-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-maroon">
                See weekly hours
                <span aria-hidden="true" className="text-lg text-burgundy">+</span>
              </summary>
              <dl className="divide-y divide-ink/10 border-t border-ink/10">
                {COMPANY.hoursWeek.map((row) => (
                  <div
                    key={row.day}
                    className="flex items-center justify-between px-4 py-2.5 text-sm"
                  >
                    <dt className="text-ink/70">{row.day}</dt>
                    <dd
                      className={cn(
                        "tabular-nums",
                        row.open ? "font-medium text-maroon" : "text-ink/40",
                      )}
                    >
                      {row.open ? `${row.open} – ${row.close}` : "Closed"}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="border-t border-ink/10 px-4 py-2.5 text-xs text-ink/50">
                All times East Africa Time (EAT, UTC+3).
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-maroon" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-burgundy/50 via-maroon to-maroon" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-gold/10 rounded-full blur-[140px]" />
        </div>

        <div className="relative mx-auto max-w-[1400px] px-5 py-16 text-center sm:px-8 md:px-12 md:py-20 lg:px-16">
          <h2 className="font-display text-3xl text-paper sm:text-4xl md:text-5xl">
            Have a project to discuss?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-paper/70 sm:text-lg">
            Share what you know so far. We’ll review the brief and follow up with a practical next step.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/start"
              className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-gold to-gold-light px-6 py-3 font-semibold text-maroon shadow-glow-gold transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              Start a project brief
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href={`mailto:${COMPANY.email}`}
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-medium text-paper transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Mail className="size-5" />
              Email us
            </a>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            name: "Contact ATRO Design & Construction",
            url: "https://atro.ke/contact",
            contactPoint: {
              "@type": "ContactPoint",
              telephone: COMPANY.phoneTel,
              contactType: "customer service",
              areaServed: "KE",
              availableLanguage: ["English", "Swahili"],
            },
          }),
        }}
      />
    </main>
  );
}
