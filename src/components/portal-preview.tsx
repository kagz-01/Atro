import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Pause,
  Play,
} from "lucide-react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";

type PortalPreviewProps = {
  experience: "kenya" | "diaspora";
};

const VIEWS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "milestones", label: "Milestones", icon: ClipboardList },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "messages", label: "Messages", icon: MessageSquare },
] as const;

type PreviewView = (typeof VIEWS)[number]["id"];

const VIEW_INDEX: Record<PreviewView, number> = {
  overview: 0,
  milestones: 1,
  documents: 2,
  messages: 3,
};

function DashboardScreen({ view }: { view: PreviewView }) {
  if (view === "milestones") {
    return (
      <div className="space-y-5">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-burgundy">
            Project timeline
          </p>
          <h3 className="mt-1 font-display text-xl text-maroon sm:text-2xl">
            Milestones and approvals
          </h3>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-ink/60">
            <span>Project stages</span>
            <span>Progress at a glance</span>
          </div>
          <div className="mt-5 grid grid-cols-4 gap-2">
            {["Brief", "Design", "Build", "Handover"].map((stage, index) => (
              <div key={stage}>
                <div className={`h-1.5 rounded-full ${index === 0 ? "bg-gold" : "bg-maroon/10"}`} />
                <p className="mt-2 text-[9px] text-ink/60 sm:text-[10px]">{stage}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 border-t border-ink/8 pt-4 text-xs leading-relaxed text-ink/60">
            Review stage updates and approvals as they are recorded for your project.
          </p>
        </div>
      </div>
    );
  }

  if (view === "documents") {
    return (
      <div className="space-y-5">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-burgundy">
            Project records
          </p>
          <h3 className="mt-1 font-display text-xl text-maroon sm:text-2xl">
            Documents in one place
          </h3>
        </div>
        <div className="space-y-2">
          {[
            ["Drawings and plans", "Project documents"],
            ["Certificates and invoices", "Payment records"],
            ["Site photos and reports", "Progress evidence"],
          ].map(([title, detail]) => (
            <div
              key={title}
              className="flex items-center gap-3 rounded-xl border border-ink/10 bg-white p-3 sm:p-4"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-maroon/8 text-maroon">
                <FileText className="size-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-medium text-maroon sm:text-sm">
                  {title}
                </span>
                <span className="mt-0.5 block text-[10px] text-ink/50">{detail}</span>
              </span>
              <ArrowRight className="size-4 text-ink/35" aria-hidden />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view === "messages") {
    return (
      <div className="space-y-5">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-burgundy">
            Project conversation
          </p>
          <h3 className="mt-1 font-display text-xl text-maroon sm:text-2xl">
            Keep the team in the loop
          </h3>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-white p-4 sm:p-5">
          <div className="flex items-center gap-3 border-b border-ink/8 pb-4">
            <span className="flex size-9 items-center justify-center rounded-full bg-gold/20 text-maroon">
              <MessageSquare className="size-4" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-medium text-maroon">Your project team</p>
              <p className="mt-0.5 text-[10px] text-ink/50">
                Messages stay with the project record
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <p className="w-fit max-w-[90%] rounded-2xl rounded-tl-sm bg-[#f5efe7] px-3 py-2 text-[10px] leading-relaxed text-ink/65 sm:text-xs">
              Ask questions and keep project decisions together.
            </p>
            <p className="ml-auto w-fit max-w-[90%] rounded-2xl rounded-tr-sm bg-maroon px-3 py-2 text-[10px] leading-relaxed text-paper/90 sm:text-xs">
              Follow up on updates directly from your project space.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-burgundy">
          Project overview
        </p>
        <h3 className="mt-1 font-display text-xl text-maroon sm:text-2xl">
          A clear view of what matters
        </h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: ClipboardList, label: "Milestones", detail: "Progress and approvals" },
          { icon: FileText, label: "Project records", detail: "Documents and payments" },
          { icon: MessageSquare, label: "Conversations", detail: "Messages and decisions" },
        ].map(({ icon: Icon, label, detail }) => (
          <div key={label} className="rounded-xl border border-ink/10 bg-white p-3 sm:p-4">
            <Icon className="size-4 text-burgundy" aria-hidden />
            <p className="mt-3 text-xs font-medium text-maroon">{label}</p>
            <p className="mt-1 text-[10px] leading-relaxed text-ink/55">{detail}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-ink/10 bg-white px-4 py-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
          <CheckCircle2 className="size-4" aria-hidden />
        </span>
        <p className="text-xs leading-relaxed text-ink/60">
          Your project information is kept in a private, account-based workspace.
        </p>
      </div>
    </div>
  );
}

export function DashboardPreview({ autoPlay = true }: { autoPlay?: boolean }) {
  const [activeView, setActiveView] = useState<PreviewView>("overview");
  const [playing, setPlaying] = useState(true);
  const hasInteracted = useRef(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(previewRef, { amount: 0.25 });
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!autoPlay || !playing || !isInView || prefersReducedMotion || hasInteracted.current) return;

    const timer = window.setInterval(() => {
      setActiveView((current) => VIEWS[(VIEW_INDEX[current] + 1) % VIEWS.length].id);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [autoPlay, isInView, playing, prefersReducedMotion]);

  function selectView(view: PreviewView) {
    hasInteracted.current = true;
    setActiveView(view);
  }

  return (
    <div
      ref={previewRef}
      className="overflow-hidden rounded-[1.5rem] border border-[#d6cab6] bg-[#fbf8f3] shadow-[0_24px_70px_-38px_rgba(60,5,8,0.35)] sm:rounded-[1.75rem]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-ink/10 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-maroon text-gold">
            <LayoutDashboard className="size-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[9px] font-semibold uppercase tracking-[0.15em] text-burgundy">
              Client portal preview
            </p>
            <p className="mt-0.5 truncate font-display text-base text-maroon sm:text-lg">
              Your project space
            </p>
          </div>
        </div>
        {autoPlay ? (
          <button
            type="button"
            onClick={() => {
              hasInteracted.current = true;
              setPlaying((current) => !current);
            }}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-ink/10 text-ink/60 transition-colors hover:bg-white hover:text-maroon focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-maroon"
            aria-label={playing ? "Pause dashboard preview" : "Play dashboard preview"}
          >
            {playing ? (
              <Pause className="size-4" aria-hidden />
            ) : (
              <Play className="size-4" aria-hidden />
            )}
          </button>
        ) : null}
      </div>

      <div>
        <nav
          aria-label="Dashboard preview screens"
          className="grid grid-cols-2 gap-1 border-b border-ink/10 p-2 sm:grid-cols-4 sm:p-3"
        >
          {VIEWS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => selectView(id)}
              aria-pressed={activeView === id}
              className={`flex min-h-10 items-center justify-center gap-2 rounded-lg px-2 text-[10px] transition-colors sm:px-3 sm:text-xs ${
                activeView === id
                  ? "bg-maroon text-paper"
                  : "text-ink/55 hover:bg-white hover:text-maroon"
              }`}
            >
              <Icon className="size-3.5 shrink-0" aria-hidden />
              {label}
            </button>
          ))}
        </nav>

        <div className="min-h-[270px] border-t border-ink/10 p-4 sm:min-h-[320px] sm:p-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -6 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.24, ease: "easeOut" }}
              aria-live="off"
            >
              <DashboardScreen view={activeView} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-ink/10 px-4 py-2.5 text-[9px] text-ink/45 sm:px-6">
        <span>Portal preview</span>
        <span className="hidden sm:inline">Select a section to explore</span>
      </div>
    </div>
  );
}

export function PortalPreview({ experience }: PortalPreviewProps) {
  const isDiaspora = experience === "diaspora";
  const portalPath = isDiaspora ? "/portal/diaspora" : "/portal";

  return (
    <section className="border-b border-ink/10 bg-[#f5efe7] px-6 py-12 sm:px-8 md:px-12 md:py-16 lg:px-16">
      <div className="mx-auto grid max-w-[1400px] gap-8 lg:grid-cols-2 lg:items-center lg:gap-14">
        <div>
          <p className="inline-flex rounded-full border border-[#c7a478]/60 bg-[#f3ebdf] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-burgundy">
            Your private project dashboard
          </p>
          <h2 className="mt-5 max-w-xl font-display text-[2rem] leading-[0.98] tracking-[-0.04em] text-maroon sm:text-[2.4rem] md:text-[3rem]">
            {isDiaspora
              ? "Stay close to your Kenya project, wherever you are."
              : "See what is happening across your project."}
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink/70 sm:text-base">
            {isDiaspora
              ? "Follow progress, review project records and keep decisions connected to your team—all in one private space."
              : "Follow milestones, find project records and keep conversations and decisions together in one private space."}
          </p>

          <div className="mt-7">
            <Link
              to="/login"
              search={{ returnTo: portalPath }}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#410f18] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-paper transition-colors hover:bg-[#5b1c26] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-maroon"
            >
              Sign in / create account
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <p className="mt-3 max-w-lg text-xs leading-relaxed text-ink/55">
            Already a client or received an invitation? Sign in with the email linked to your
            project.
          </p>
        </div>

        <DashboardPreview />
      </div>
    </section>
  );
}
