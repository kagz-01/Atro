// ATRO enquiries inbox.
//
// Reused by the studio console (`/admin`); this route keeps the deep link
// working. Staff-gated — the read is authorised server-side, so there is no
// client-side gate standing in for it.

import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowLeft,
  Search,
  Globe,
  MapPin,
  Phone,
  Mail,
  Building2,
  Home,
  Landmark,
  Clock,
  Users,
  Plane,
  FileText,
  X,
  MessageCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useIsHydrated } from "@/lib/use-is-hydrated";
import { listEnquiriesFromDb } from "@/lib/enquiry-server";
import { cn } from "@/lib/utils";
import { whatsappHref } from "@/lib/whatsapp";

type Enquiry = {
  id: string;
  name: string;
  phone: string;
  email: string;
  project_type: string;
  zone: string;
  stage: string;
  start_date: string;
  description: string;
  sqm: number | null;
  finish: string | null;
  indicative_min: number | null;
  indicative_max: number | null;
  diaspora: boolean;
  diaspora_country: string;
  diaspora_timezone: string;
  diaspora_kenya_contact: string;
  diaspora_visit_plans: string;
  created_at: string;
};

const ZONE_LABELS: Record<string, string> = {
  nairobi: "Nairobi",
  kiambu: "Kiambu",
  machakos: "Machakos",
  kajiado: "Kajiado",
  coast: "Coast",
  nakuru: "Nakuru",
  kisumu: "Kisumu",
  diaspora: "Diaspora",
};

const TYPE_ICONS: Record<string, typeof Home> = {
  Residential: Home,
  Commercial: Building2,
  Institutional: Landmark,
};

function formatKes(n: number | null) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n);
}

function timeAgo(dateStr: string) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

export function EnquiriesInbox() {
  const { user, isPending } = useCurrentUserState();
  const hydrated = useIsHydrated();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDiaspora, setFilterDiaspora] = useState<"all" | "diaspora" | "local">("all");
  const [selected, setSelected] = useState<Enquiry | null>(null);

  // Enquiries carry real names, emails and phone numbers, so the read is
  // account-gated server-side. No client-side password stands in for that.
  const { data: enquiries, isLoading } = useQuery({
    queryKey: ["admin-enquiries"],
    queryFn: async () => {
      const result = await listEnquiriesFromDb({ data: undefined });
      return (result ?? []) as Enquiry[];
    },
    enabled: Boolean(user),
  });

  // The server always renders "pending", so the first client paint must match it.
  if (isPending || !hydrated) return null;

  if (!user) {
    return (
      <div className="rounded-3xl border border-ink/10 bg-paper p-8">
        <div>
          <h1 className="font-display text-2xl text-maroon mb-2">Admin</h1>
          <p className="text-sm text-muted mb-6">
            Sign in with a studio account to view enquiries.
          </p>
          <Link
            to="/login"
            className="flex h-12 w-full items-center justify-center bg-gradient-to-r from-maroon to-burgundy text-white text-[12px] uppercase tracking-[0.14em] font-semibold rounded-xl"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const filtered = (enquiries ?? []).filter((e) => {
    if (filterType !== "all" && e.project_type !== filterType) return false;
    if (filterDiaspora === "diaspora" && !e.diaspora) return false;
    if (filterDiaspora === "local" && e.diaspora) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.phone.includes(q) ||
        e.zone.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const stats = {
    total: enquiries?.length ?? 0,
    diaspora: enquiries?.filter((e) => e.diaspora).length ?? 0,
    thisWeek: enquiries?.filter((e) => {
      const d = new Date(e.created_at);
      const now = new Date();
      return now.getTime() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
    }).length ?? 0,
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-paper border-b border-line/50">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 md:px-12 lg:px-16 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-burgundy hover:text-maroon"
            >
              <ArrowLeft className="size-3.5" />
              Site
            </Link>
            <h1 className="font-display text-xl text-maroon">Enquiries</h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted">
            <span>{stats.total} total</span>
            <span className="text-gold">·</span>
            <span>{stats.diaspora} diaspora</span>
            <span className="text-gold">·</span>
            <span>{stats.thisWeek} this week</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 md:px-12 lg:px-16 py-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone, zone..."
              className="w-full h-10 pl-10 pr-4 border border-line bg-paper rounded-xl text-sm outline-none focus:border-burgundy"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-10 px-3 border border-line bg-paper rounded-xl text-sm outline-none focus:border-burgundy"
          >
            <option value="all">All types</option>
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Institutional">Institutional</option>
          </select>
          <select
            value={filterDiaspora}
            onChange={(e) => setFilterDiaspora(e.target.value as typeof filterDiaspora)}
            className="h-10 px-3 border border-line bg-paper rounded-xl text-sm outline-none focus:border-burgundy"
          >
            <option value="all">All clients</option>
            <option value="diaspora">Diaspora only</option>
            <option value="local">Local only</option>
          </select>
        </div>

        {/* Enquiry list */}
        {isLoading ? (
          <div className="text-center py-20 text-muted">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted">No enquiries found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((e) => {
              const TypeIcon = TYPE_ICONS[e.project_type] || Building2;
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setSelected(e)}
                  className={cn(
                    "w-full text-left p-5 bg-paper border rounded-2xl hover:border-burgundy/30 hover:shadow-card-hover transition-all duration-200",
                    e.diaspora ? "border-gold/30" : "border-line/50",
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className={cn(
                        "size-10 rounded-xl flex items-center justify-center shrink-0",
                        e.diaspora ? "bg-gold/10 text-gold" : "bg-maroon/10 text-maroon",
                      )}>
                        {e.diaspora ? <Globe className="size-5" /> : <TypeIcon className="size-5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-display text-lg text-maroon truncate">{e.name}</p>
                          {e.diaspora && (
                            <Badge tone="gold" className="text-[9px]">
                              {e.diaspora_country || "Diaspora"}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted flex-wrap">
                          <span className="flex items-center gap-1">
                            <TypeIcon className="size-3" />
                            {e.project_type}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3" />
                            {ZONE_LABELS[e.zone] || e.zone}
                          </span>
                          {e.sqm && <span>{e.sqm} m²</span>}
                          {e.finish && <span className="capitalize">{e.finish}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted">{timeAgo(e.created_at)}</p>
                      {e.indicative_min && e.indicative_max && (
                        <p className="text-sm font-medium text-maroon mt-1">
                          {formatKes(e.indicative_min)} – {formatKes(e.indicative_max)}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6">
          <button
            type="button"
            className="absolute inset-0 bg-ink/50"
            onClick={() => setSelected(null)}
          />
          <div className="relative w-full sm:max-w-lg bg-paper rounded-t-2xl sm:rounded-2xl shadow-soft max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-paper border-b border-line/50 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "size-10 rounded-xl flex items-center justify-center",
                  selected.diaspora ? "bg-gold/10 text-gold" : "bg-maroon/10 text-maroon",
                )}>
                  {selected.diaspora ? <Globe className="size-5" /> : <FileText className="size-5" />}
                </div>
                <div>
                  <p className="font-display text-lg text-maroon">{selected.name}</p>
                  <p className="text-xs text-muted">{timeAgo(selected.created_at)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="size-10 inline-flex items-center justify-center rounded-full hover:bg-stone transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact */}
              <div>
                <h3 className="text-[11px] uppercase tracking-[0.14em] text-muted mb-3">Contact</h3>
                <div className="space-y-2">
                  <a href={`tel:${selected.phone}`} className="flex items-center gap-3 text-sm hover:text-maroon transition-colors">
                    <Phone className="size-4 text-muted" />
                    {selected.phone}
                  </a>
                  <a href={`mailto:${selected.email}`} className="flex items-center gap-3 text-sm hover:text-maroon transition-colors">
                    <Mail className="size-4 text-muted" />
                    {selected.email}
                  </a>
                </div>
              </div>

              {/* Project */}
              <div>
                <h3 className="text-[11px] uppercase tracking-[0.14em] text-muted mb-3">Project</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-stone/50 rounded-xl">
                    <p className="text-xs text-muted">Type</p>
                    <p className="text-sm font-medium text-maroon">{selected.project_type}</p>
                  </div>
                  <div className="p-3 bg-stone/50 rounded-xl">
                    <p className="text-xs text-muted">Zone</p>
                    <p className="text-sm font-medium text-maroon">{ZONE_LABELS[selected.zone] || selected.zone}</p>
                  </div>
                  <div className="p-3 bg-stone/50 rounded-xl">
                    <p className="text-xs text-muted">Size</p>
                    <p className="text-sm font-medium text-maroon">{selected.sqm ? `${selected.sqm} m²` : "—"}</p>
                  </div>
                  <div className="p-3 bg-stone/50 rounded-xl">
                    <p className="text-xs text-muted">Finish</p>
                    <p className="text-sm font-medium text-maroon capitalize">{selected.finish || "—"}</p>
                  </div>
                  <div className="p-3 bg-stone/50 rounded-xl">
                    <p className="text-xs text-muted">Stage</p>
                    <p className="text-sm font-medium text-maroon">{selected.stage || "—"}</p>
                  </div>
                  <div className="p-3 bg-stone/50 rounded-xl">
                    <p className="text-xs text-muted">Start date</p>
                    <p className="text-sm font-medium text-maroon">{selected.start_date || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Estimate */}
              {selected.indicative_min && selected.indicative_max && (
                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.14em] text-muted mb-3">Indicative range</h3>
                  <div className="p-4 bg-gradient-to-br from-maroon to-burgundy rounded-2xl">
                    <p className="font-display text-2xl text-paper">
                      {formatKes(selected.indicative_min)} – {formatKes(selected.indicative_max)}
                    </p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selected.description && (
                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.14em] text-muted mb-3">Notes</h3>
                  <p className="text-sm text-ink/80 bg-stone/50 p-4 rounded-xl whitespace-pre-wrap">{selected.description}</p>
                </div>
              )}

              {/* Diaspora details */}
              {selected.diaspora && (
                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.14em] text-gold mb-3 flex items-center gap-2">
                    <Globe className="size-3" />
                    Diaspora details
                  </h3>
                  <div className="p-4 bg-gold/5 border border-gold/20 rounded-xl space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Globe className="size-4 text-gold shrink-0" />
                      <span className="text-muted">Country:</span>
                      <span className="font-medium text-maroon">{selected.diaspora_country || "Not specified"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="size-4 text-gold shrink-0" />
                      <span className="text-muted">Time zone:</span>
                      <span className="font-medium text-maroon">{selected.diaspora_timezone || "Not specified"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Users className="size-4 text-gold shrink-0" />
                      <span className="text-muted">Kenya contact:</span>
                      <span className="font-medium text-maroon">{selected.diaspora_kenya_contact || "None"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Plane className="size-4 text-gold shrink-0" />
                      <span className="text-muted">Visit plans:</span>
                      <span className="font-medium text-maroon">{selected.diaspora_visit_plans || "Not specified"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={`tel:${selected.phone}`}
                  className="inline-flex h-10 px-5 items-center gap-2 bg-maroon text-white text-[11px] uppercase tracking-[0.14em] font-semibold rounded-xl hover:bg-burgundy transition-colors"
                >
                  <Phone className="size-4" />
                  Call
                </a>
                <a
                  href={`mailto:${selected.email}?subject=ATRO — Your project enquiry`}
                  className="inline-flex h-10 px-5 items-center gap-2 border border-maroon text-maroon text-[11px] uppercase tracking-[0.14em] font-semibold rounded-xl hover:bg-maroon/5 transition-colors"
                >
                  <Mail className="size-4" />
                  Email
                </a>
                <a
                  href={whatsappHref(`Hello ${selected.name} — thank you for your enquiry with ATRO. We have received your brief and would like to schedule a call.`)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 px-5 items-center gap-2 bg-green-600 text-white text-[11px] uppercase tracking-[0.14em] font-semibold rounded-xl hover:bg-green-700 transition-colors"
                >
                  <MessageCircle className="size-4" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
