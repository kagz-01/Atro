import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone, MessageCircle, Mail, MapPin, Clock, ArrowRight } from "lucide-react";
import { COMPANY } from "@/lib/site";
import { useRevealOnScroll } from "@/hooks/use-reveal";
import { ScrollRevealText } from "@/components/scroll-effects";
import { LeafletMap } from "@/components/leaflet-map";
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

function ContactPage() {
  const { ref: heroRef, revealed: heroRevealed } = useRevealOnScroll();
  const { ref: cardsRef, revealed: cardsRevealed } = useRevealOnScroll();

  const contactMethods = [
    {
      icon: <Phone className="size-6" />,
      title: "Call Us",
      value: COMPANY.phoneDisplay,
      href: `tel:${COMPANY.phoneTel}`,
      subtitle: COMPANY.hours,
      color: "maroon",
    },
    {
      icon: <MessageCircle className="size-6" />,
      title: "WhatsApp",
      value: "Chat with us",
      href: whatsappHref(defaultWhatsappText()),
      subtitle: "Fastest response — usually within minutes",
      color: "whatsapp",
    },
    {
      icon: <Mail className="size-6" />,
      title: "Email",
      value: COMPANY.email,
      href: `mailto:${COMPANY.email}`,
      subtitle: "We reply within 24 hours",
      color: "burgundy",
    },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 md:pt-40 pb-16 md:pb-24 overflow-hidden bg-maroon">
        {/* Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-burgundy via-maroon to-[#1a0204]" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-gold/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-burgundy/30 rounded-full blur-[120px]" />
        </div>

        <div ref={heroRef} className={cn("relative mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 text-center reveal-on-scroll", heroRevealed && "revealed")}>
          <div className="reveal inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 mb-8">
            <div className="size-2 rounded-full bg-gold" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-white/80">
              Get in touch
            </span>
          </div>

          <h1 className="reveal reveal-delay-1 font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-paper max-w-5xl mx-auto leading-[0.95]">
            Let's build something{" "}
            <span className="text-gradient-gold italic">remarkable.</span>
          </h1>

          <p className="reveal reveal-delay-2 mt-8 text-xl text-paper/70 max-w-2xl mx-auto">
            Call, message, or visit us. We're based in Nairobi and serve businesses and homeowners across Kenya.
          </p>
        </div>
      </section>

      {/* Response time badge */}
      <section className="relative -mt-6 z-10">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <ScrollRevealText delay={400}>
            <div className="mx-auto max-w-xl p-4 bg-gradient-to-r from-gold/10 to-gold-light/10 border border-gold/20 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center justify-center gap-3">
                <div className="size-2.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-sm text-maroon font-medium">
                  Average response time: ~12 minutes via WhatsApp
                </p>
              </div>
            </div>
          </ScrollRevealText>
        </div>
      </section>

      {/* Contact cards */}
      <section className="py-16 md:py-24">
        <div ref={cardsRef} className={cn("mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 reveal-on-scroll", cardsRevealed && "revealed")}>
          <div className="grid md:grid-cols-3 gap-6">
            {contactMethods.map((method, i) => (
              <ScrollRevealText key={method.title} delay={i * 100}>
                <a
                  href={method.href}
                  className="group block p-8 bg-cream border border-line/50 rounded-2xl text-center hover:shadow-card-hover hover:border-gold/30 card-lift transition-all duration-300"
                >
                  <div className={cn(
                    "size-16 mx-auto rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300",
                    method.color === "maroon" && "bg-maroon/10 text-maroon group-hover:bg-maroon group-hover:text-paper",
                    method.color === "whatsapp" && "bg-whatsapp/10 text-whatsapp group-hover:bg-whatsapp group-hover:text-paper",
                    method.color === "burgundy" && "bg-burgundy/10 text-burgundy group-hover:bg-burgundy group-hover:text-paper",
                  )}>
                    {method.icon}
                  </div>
                  <h3 className="font-display text-xl text-maroon">{method.title}</h3>
                  <p className={cn(
                    "mt-2 text-lg font-medium transition-colors duration-300",
                    method.color === "maroon" && "text-burgundy group-hover:text-maroon",
                    method.color === "whatsapp" && "text-whatsapp group-hover:text-whatsapp",
                    method.color === "burgundy" && "text-burgundy group-hover:text-maroon",
                  )}>
                    {method.value}
                  </p>
                  <p className="mt-2 text-sm text-muted">{method.subtitle}</p>
                </a>
              </ScrollRevealText>
            ))}
          </div>
        </div>
      </section>

      {/* Map and details */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-stone/60 to-paper">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left: details */}
            <div>
              <h2 className="font-display text-4xl md:text-5xl text-maroon">
                Our workshop
              </h2>
              <p className="mt-5 text-ink/70 text-lg max-w-xl">
                Drop by, call ahead, or send a message. We're in Nairobi and we build across Kenya.
              </p>

              <div className="mt-10 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-xl bg-maroon/10 flex items-center justify-center text-maroon shrink-0">
                    <MapPin className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium text-maroon">Studio Address</p>
                    <p className="text-ink/70">{COMPANY.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-xl bg-maroon/10 flex items-center justify-center text-maroon shrink-0">
                    <Clock className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium text-maroon">Working Hours</p>
                    <p className="text-ink/70">{COMPANY.hours}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-xl bg-maroon/10 flex items-center justify-center text-maroon shrink-0">
                    <Phone className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium text-maroon">Direct Line</p>
                    <a href={`tel:${COMPANY.phoneTel}`} className="text-burgundy hover:text-maroon transition-colors">
                      {COMPANY.phoneDisplay}
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href={whatsappHref(defaultWhatsappText())}
                  className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-whatsapp to-green-500 text-white font-medium rounded-xl btn-lift hover:shadow-lg transition-all duration-300"
                >
                  <MessageCircle className="size-5" />
                  WhatsApp us
                </a>
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="inline-flex items-center gap-3 px-6 py-3 bg-maroon text-paper font-medium rounded-xl btn-lift hover:bg-burgundy transition-colors duration-300"
                >
                  <Mail className="size-5" />
                  Send email
                </a>
              </div>
            </div>

            {/* Right: map */}
            <div className="bg-stone/60 border border-line rounded-2xl overflow-hidden h-[400px] lg:h-[500px]">
              <LeafletMap
                center={[-1.2921, 36.8219]}
                zoom={14}
                className="w-full h-full"
                markerTitle="ATRO Design & Construction"
              />
            </div>
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

        <div className="relative mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-20 md:py-28 text-center">
          <h2 className="font-display text-4xl md:text-5xl text-paper">
            Ready to start?
          </h2>
          <p className="mt-5 text-paper/70 text-lg max-w-2xl mx-auto">
            Tell us about your project. We'll respond within a working day with a frank assessment, not a sales pitch.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/start"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gold to-gold-light text-maroon font-bold text-lg rounded-2xl shadow-glow-gold btn-lift overflow-hidden"
            >
              <span className="relative z-10">Start a project</span>
              <ArrowRight className="size-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>
            <a
              href={whatsappHref(defaultWhatsappText())}
              className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-2xl text-lg hover:bg-white/15 btn-lift transition-all duration-300"
            >
              <MessageCircle className="size-5" />
              WhatsApp us
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
