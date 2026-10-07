import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, Globe, Lock, Shield } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useIsHydrated } from "@/lib/use-is-hydrated";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({
    meta: [
      { title: "Sign in — ATRO client portal" },
      {
        name: "description",
        content:
          "Sign in to your ATRO project portal: live milestone progress, photographic evidence, the payment ledger, the document vault and every decision — from anywhere in the world.",
      },
    ],
  }),
});

const PERKS = [
  {
    icon: CheckCircle2,
    title: "Live progress on your build",
    body: "Every stage, with the photographs taken before the work disappeared into the structure.",
  },
  {
    icon: Lock,
    title: "Money you can audit",
    body: "Certificates, retention and the paid-to-date ledger — nothing released without a certificate.",
  },
  {
    icon: Shield,
    title: "Decisions in writing",
    body: "Options, cost impact and what you chose, timestamped. Month nine never argues about month three.",
  },
];

function Login() {
  const { user, isPending } = useCurrentUserState();
  const hydrated = useIsHydrated();

  return (
    <main className="min-h-screen bg-paper pt-24 pb-16 md:pt-28">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
        <Link
          to="/diaspora"
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-maroon"
        >
          <ArrowLeft className="size-3.5" />
          Back to Abroad
        </Link>

        <div className="mt-8 grid items-stretch gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Value panel */}
          <section className="relative overflow-hidden rounded-3xl bg-maroon p-8 text-paper md:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-burgundy/60 via-maroon to-maroon" />
            <div className="pointer-events-none absolute -top-24 -right-16 size-[360px] rounded-full bg-gold/10 blur-[130px]" />

            <div className="relative">
              <Badge />
              <h1 className="mt-6 font-display text-4xl leading-tight text-paper sm:text-5xl">
                Your build,
                <br />
                <span className="text-gold">wherever you are.</span>
              </h1>
              <p className="mt-5 max-w-md text-[16px] leading-relaxed text-paper/70">
                The portal is the same record your project manager works from — not
                a summary sent to you later.
              </p>

              <ul className="mt-9 space-y-5">
                {PERKS.map((perk) => (
                  <li key={perk.title} className="flex gap-4">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">
                      <perk.icon className="size-4.5" />
                    </span>
                    <span>
                      <span className="block font-display text-lg text-paper">
                        {perk.title}
                      </span>
                      <span className="mt-1 block text-[14px] leading-relaxed text-paper/60">
                        {perk.body}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>

              <p className="mt-9 flex items-center gap-2 border-t border-paper/15 pt-6 text-[12px] uppercase tracking-[0.16em] text-paper/45">
                <Globe className="size-3.5 text-gold" />
                Built for Kenyans in the UK, Gulf, US and beyond
              </p>
            </div>
          </section>

          {/* Sign-in card */}
          <section className="rounded-3xl border border-ink/10 bg-white p-8 md:p-10">
            <div className="flex items-center justify-between gap-4">
              <Logo />
              <span className="rounded-full bg-maroon/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-maroon">
                Client portal
              </span>
            </div>

            {!authEnabled ? (
              <div className="mt-10">
                <h2 className="font-display text-3xl text-maroon">Sign in</h2>
                <p className="mt-3 text-[15px] text-ink/60">
                  Sign-in is disabled for this deployment.
                </p>
              </div>
            ) : isPending || !hydrated ? (
              <div className="mt-10 space-y-4" aria-busy="true">
                <div className="h-8 w-2/3 animate-pulse rounded-lg bg-ink/8" />
                <div className="h-4 w-1/2 animate-pulse rounded-lg bg-ink/8" />
                <div className="h-12 w-full animate-pulse rounded-xl bg-ink/8" />
                <div className="h-12 w-full animate-pulse rounded-xl bg-ink/8" />
              </div>
            ) : user ? (
              <div className="mt-10">
                <h2 className="font-display text-3xl text-maroon">You are signed in</h2>
                <p className="mt-3 text-[15px] leading-relaxed text-ink/65">
                  {user.displayName ?? user.primaryEmail ?? "Your account"} — your
                  projects, milestones and documents are one click away.
                </p>

                <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-cream px-5 py-4">
                  <span className="text-[13px] text-ink/60">Account</span>
                  <UserButton />
                </div>

                <Button
                  asChild
                  variant="primary"
                  size="lg"
                  className="mt-6 w-full"
                >
                  <Link to="/portal">
                    Open the portal
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="mt-10">
                <h2 className="font-display text-3xl text-maroon">Sign in</h2>
                <p className="mt-3 text-[15px] leading-relaxed text-ink/65">
                  Use the account you already have. Your portal stays private to you
                  — projects, evidence, payments and documents are scoped to your
                  sign-in.
                </p>

                <div className="mt-7 flex flex-col gap-3">
                  {GROK_PROVIDERS.map((p) => (
                    <button
                      key={p.providerId}
                      type="button"
                      onClick={() => signIn(p.providerId, { callbackURL: "/portal" })}
                      className="group flex h-13 w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-ink/15 bg-white px-5 text-[13px] font-medium text-ink transition-all hover:border-maroon hover:bg-maroon hover:text-paper"
                    >
                      <span>Continue with {p.label}</span>
                      <ArrowRight className="size-4 opacity-50 transition-transform group-hover:translate-x-1 group-hover:opacity-100" />
                    </button>
                  ))}
                </div>

                <p className="mt-6 text-[12px] leading-relaxed text-ink/50">
                  We only read your name and account id — never your contacts,
                  calendar or mail.
                </p>

                <div className="mt-6 border-t border-ink/10 pt-5">
                  <p className="text-[13px] text-ink/60">
                    New to ATRO?{" "}
                    <Link
                      to="/start"
                      search={{ from: "diaspora" }}
                      className="font-medium text-burgundy underline decoration-gold decoration-2 underline-offset-4 hover:text-maroon"
                    >
                      Start a project
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function Badge() {
  return (
    <span className="inline-flex h-7 items-center rounded-xs bg-gold/15 px-2.5 text-[10px] font-medium uppercase tracking-[0.16em] text-gold-light border border-gold/40">
      Accounts
    </span>
  );
}
