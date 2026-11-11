import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bell,
  ChevronLeft,
  LogOut,
  Menu,
  Search,
  Settings,
  X,
  type LucideIcon,
} from "lucide-react";
import { LogoMark } from "@/components/logo";
import { RouteTransition } from "@/components/motion/route-transition";
import { cn } from "@/lib/utils";

export function DashboardBackLink({
  to,
  children,
  className,
}: {
  to: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-ink/12 bg-white px-4 text-[11px] font-medium normal-case tracking-normal text-burgundy shadow-sm transition-colors hover:border-burgundy/40 hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
        className,
      )}
    >
      <ArrowLeft className="size-4" aria-hidden />
      {children}
    </Link>
  );
}

/**
 * The dashboard frame: grouped sidebar navigation, a topbar, and the content
 * area — the layout every console screen shares.
 *
 * The sidebar is the primary navigation on a wide screen and collapses to icons
 * when there is no room for labels. Under `lg` it leaves the flow entirely and
 * becomes a drawer, because a 260px rail plus a phone-width table is not a
 * layout, it is a fight.
 */

export type NavItem = {
  id: string;
  label: string;
  mobileLabel?: string;
  icon: LucideIcon;
  /** Right-aligned count, e.g. enquiries awaiting a reply. */
  badge?: number | string;
  href?: string;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export type Alert = { id: string; title: string; detail: string; onSelect?: () => void };

export function DashboardShell({
  groups,
  mobileItems,
  mobileNavMode = "scroll",
  active,
  onSelect,
  alerts = [],
  user,
  search,
  onSearch,
  searchPlaceholder = "Search",
  children,
  toolbar,
  readOnly = false,
  hideNav = false,
}: {
  groups: NavGroup[];
  /** Highest-priority destinations shown as quick links on narrow screens. */
  mobileItems?: NavItem[];
  /** Use a fitted grid rather than a horizontally scrolling strip on mobile. */
  mobileNavMode?: "scroll" | "grid";
  active: string;
  onSelect: (id: string) => void;
  alerts?: Alert[];
  user?: { name: string; role?: string; email?: string; onSignOut?: () => void };
  search?: string;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  /** Rendered at the top of the content column, under the topbar. */
  toolbar?: ReactNode;
  /** Disable actions inside the content area while preserving dashboard navigation. */
  readOnly?: boolean;
  /** Use when a dashboard is already a single-purpose view and should not display the nav rail. */
  hideNav?: boolean;
  children: ReactNode;
}) {
  const [rail, setRail] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const drawerTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [openAlerts, setOpenAlerts] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const nav = (compact: boolean) => (
    <nav className="flex flex-col gap-6 p-4" aria-label="Sections">
      {groups.map((group) => (
        <div key={group.title}>
          {!compact ? (
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted/70">
              {group.title}
            </p>
          ) : null}
          <ul className="space-y-1">
            {group.items.map((item) => (
              <li key={item.id}>
                <NavButton
                  item={item}
                  active={active === item.id}
                  rail={compact}
                  onSelect={() => {
                    onSelect(item.id);
                    setDrawer(false);
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <Dialog.Root open={drawer && !hideNav} onOpenChange={setDrawer}>
      <div
        className="dashboard-canvas min-h-dvh"
        style={
          {
            "--dashboard-sidebar-width": rail ? "76px" : "clamp(200px, 17vw, 260px)",
          } as CSSProperties
        }
      >
        {/* Sidebar — wide screens only */}
        <aside
          className={cn(
            "fixed left-0 top-0 z-30 hidden h-dvh flex-col border-r border-ink/10 bg-white transition-[width] duration-200 lg:flex",
            hideNav && "!hidden",
          )}
          style={{ width: "var(--dashboard-sidebar-width)" }}
        >
          <div
            className={cn(
              "flex h-16 shrink-0 items-center border-b border-ink/10",
              rail ? "justify-center px-2" : "justify-between px-5",
            )}
          >
            <Link to="/" aria-label="ATRO home" className="flex items-center">
              <LogoMark alt="" className={cn("w-auto object-contain", rail ? "size-8" : "h-10")} />
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto">{nav(rail)}</div>

          <div className={cn("shrink-0 border-t border-ink/10", rail ? "p-2" : "p-3")}>
            <button
              type="button"
              onClick={() => setRail((r) => !r)}
              className={cn(
                "flex items-center gap-3 rounded-xl text-[13px] text-muted transition-colors hover:bg-cream hover:text-maroon",
                rail ? "mx-auto grid size-10 place-items-center" : "w-full px-3 py-2.5",
              )}
              aria-label={rail ? "Expand navigation" : "Collapse navigation"}
            >
              <ChevronLeft
                className={cn("size-4 shrink-0 transition-transform", rail && "rotate-180")}
              />
              {!rail ? <span>Collapse</span> : null}
            </button>
          </div>
        </aside>

        {/* Drawer — narrow screens */}
        <Dialog.Portal>
          <Dialog.Overlay className="motion-overlay fixed inset-0 z-40 bg-ink/50 backdrop-blur-[2px]" />
          <Dialog.Content
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              drawerTriggerRef.current?.focus();
            }}
            className="motion-drawer fixed inset-y-0 left-0 z-50 flex max-h-dvh w-[min(280px,calc(100vw-1rem))] flex-col bg-white pb-[env(safe-area-inset-bottom)] shadow-soft focus:outline-none"
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-ink/10 px-5">
              <Dialog.Title asChild>
                <Link to="/" aria-label="ATRO home">
                  <LogoMark alt="" className="h-10 w-auto object-contain" />
                </Link>
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="grid size-11 place-items-center rounded-lg text-muted hover:bg-cream"
                  aria-label="Close navigation"
                >
                  <X className="size-4" />
                </button>
              </Dialog.Close>
            </div>
            <div className="flex-1 overflow-y-auto">{nav(false)}</div>
          </Dialog.Content>
        </Dialog.Portal>

        {/* Content column */}
        <div
          className={cn(
            "min-w-0 transition-[padding] duration-200",
            !hideNav && "lg:pl-[var(--dashboard-sidebar-width)]",
          )}
        >
          <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-ink/10 bg-white/95 px-3 backdrop-blur sm:h-16 sm:gap-3 sm:px-6">
            {!hideNav ? (
              <Dialog.Trigger asChild>
                <button
                  type="button"
                  onClick={(event) => {
                    drawerTriggerRef.current = event.currentTarget;
                  }}
                  className="grid size-12 shrink-0 place-items-center rounded-xl border border-ink/10 text-maroon transition-colors hover:bg-cream lg:hidden"
                  aria-label="Open navigation"
                >
                  <Menu className="size-4" />
                </button>
              </Dialog.Trigger>
            ) : null}

            {onSearch ? (
              <label className="relative min-w-0 flex-1 sm:max-w-sm">
                <span className="sr-only">{searchPlaceholder}</span>
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
                  aria-hidden
                />
                <input
                  value={search ?? ""}
                  onChange={(e) => onSearch(e.target.value)}
                  placeholder="Search"
                  title={searchPlaceholder}
                  className="h-12 w-full rounded-xl border border-ink/10 bg-cream pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-gold"
                />
              </label>
            ) : (
              <div className="flex-1" />
            )}

            <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
              <AlertsBell alerts={alerts} open={openAlerts} onOpenChange={setOpenAlerts} />
              {user ? <UserChip user={user} /> : null}
            </div>
          </header>

          {toolbar ? (
            <div className="border-b border-ink/10 bg-white px-3 py-3 sm:px-6">{toolbar}</div>
          ) : null}

          {readOnly ? (
            <div
              role="status"
              className="flex flex-wrap items-center justify-between gap-2 border-b border-gold/30 bg-gold/10 px-4 py-2 text-xs text-ink/75 sm:px-6"
            >
              <span>Sign in to make project changes.</span>
              <Link
                to="/login"
                search={{ returnTo: undefined }}
                className="min-h-11 inline-flex items-center font-semibold text-maroon underline underline-offset-2"
              >
                Sign in for full access
              </Link>
            </div>
          ) : null}

          {!hideNav && mobileItems?.length ? (
            <nav
              aria-label="Quick sections"
              className="border-b border-ink/10 bg-white px-2 py-2 lg:hidden"
            >
              <ul
                className={
                  mobileNavMode === "grid"
                    ? "grid gap-1"
                    : "dashboard-quick-links flex gap-1 overflow-x-auto"
                }
                style={
                  mobileNavMode === "grid"
                    ? { gridTemplateColumns: `repeat(${mobileItems.length + 1}, minmax(0, 1fr))` }
                    : undefined
                }
              >
                {mobileItems.map((item) => (
                  <li key={item.id} className="shrink-0">
                    <button
                      type="button"
                      aria-label={
                        item.badge
                          ? `${item.label}, ${item.badge} ${Number(item.badge) === 1 ? "item" : "items"}`
                          : item.label
                      }
                      aria-current={active === item.id ? "page" : undefined}
                      onClick={() => onSelect(item.id)}
                      className={cn(
                        mobileNavMode === "grid"
                          ? "relative flex min-h-14 min-w-0 w-full flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[10px] leading-none transition-colors"
                          : "inline-flex min-h-12 items-center gap-2 rounded-xl px-3 text-xs transition-colors",
                        active === item.id
                          ? "bg-maroon text-paper"
                          : "text-ink/65 hover:bg-cream hover:text-maroon",
                      )}
                    >
                      <item.icon className="size-3.5 shrink-0" aria-hidden />
                      <span
                        className={mobileNavMode === "grid" ? "max-w-full truncate" : undefined}
                      >
                        {mobileNavMode === "grid" ? (item.mobileLabel ?? item.label) : item.label}
                      </span>
                      {item.badge ? (
                        <span
                          className={cn(
                            "rounded-full px-1 py-0.5 text-[9px] font-bold",
                            mobileNavMode === "grid" && "absolute right-1 top-0.5",
                            active === item.id
                              ? "bg-gold/20 text-gold-light"
                              : "bg-burgundy/10 text-burgundy",
                          )}
                        >
                          {item.badge}
                        </span>
                      ) : null}
                    </button>
                  </li>
                ))}
                <li className="shrink-0">
                  <Dialog.Trigger asChild>
                    <button
                      type="button"
                      onClick={(event) => {
                        drawerTriggerRef.current = event.currentTarget;
                      }}
                      aria-label="More dashboard sections"
                      title="More dashboard sections"
                      aria-current={
                        mobileItems.some((item) => item.id === active) ? undefined : "page"
                      }
                      className={cn(
                        mobileNavMode === "grid"
                          ? "flex min-h-14 min-w-0 w-full flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[10px] leading-none transition-colors"
                          : "inline-flex min-h-12 items-center gap-2 rounded-xl px-3 text-xs transition-colors",
                        mobileItems.some((item) => item.id === active)
                          ? "text-ink/65 hover:bg-cream hover:text-maroon"
                          : "bg-maroon text-paper",
                      )}
                    >
                      <Menu className="size-3.5 shrink-0" aria-hidden />
                      <span>More</span>
                    </button>
                  </Dialog.Trigger>
                </li>
              </ul>
            </nav>
          ) : null}

          <main className="min-w-0 px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
            <RouteTransition routeKey={`${pathname}:${active}`}>
              {readOnly ? (
                <fieldset disabled className="min-w-0 border-0 p-0">
                  {children}
                </fieldset>
              ) : (
                children
              )}
            </RouteTransition>
          </main>
        </div>
      </div>
    </Dialog.Root>
  );
}

function NavButton({
  item,
  active,
  rail,
  onSelect,
}: {
  item: NavItem;
  active: boolean;
  rail: boolean;
  onSelect: () => void;
}) {
  const className = cn(
    "flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition-[background-color,color,transform,box-shadow] duration-200 ease-out",
    active ? "bg-maroon text-paper shadow-card" : "text-ink/65 hover:bg-cream hover:text-maroon",
    rail && "justify-center px-0",
  );

  const content = (
    <>
      <item.icon
        className={cn("size-4 shrink-0", active ? "text-gold" : "text-muted")}
        aria-hidden
      />
      {!rail ? <span className="flex-1 truncate text-left">{item.label}</span> : null}
      {!rail && item.badge ? (
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
            active ? "bg-gold/20 text-gold-light" : "bg-burgundy/10 text-burgundy",
          )}
        >
          {item.badge}
        </span>
      ) : null}
      {rail && item.badge ? (
        <span className="absolute right-2 top-1.5 size-1.5 rounded-full bg-gold" />
      ) : null}
    </>
  );

  if (item.href) {
    return (
      <li className="relative">
        <Link to={item.href} className={className} title={rail ? item.label : undefined}>
          {content}
        </Link>
      </li>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={className}
      title={rail ? item.label : undefined}
    >
      {content}
    </button>
  );
}

function AlertsBell({
  alerts,
  open,
  onOpenChange,
}: {
  alerts: Alert[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <DropdownMenu.Root open={open} onOpenChange={onOpenChange}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="relative grid size-12 place-items-center rounded-lg border border-ink/10 text-ink/60 transition-colors hover:bg-cream hover:text-maroon"
          aria-label={alerts.length > 0 ? `Alerts, ${alerts.length} needing attention` : "Alerts"}
        >
          <Bell className="size-4" aria-hidden />
          {alerts.length > 0 ? (
            <span className="absolute -right-1 -top-1 grid min-w-[18px] place-items-center rounded-full bg-burgundy px-1 text-[10px] font-bold text-paper">
              {alerts.length}
            </span>
          ) : null}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="motion-popover z-50 w-[320px] rounded-2xl border border-ink/10 bg-white p-2 shadow-soft focus:outline-none"
        >
          <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
            Needs a human
          </p>
          {alerts.length === 0 ? (
            <p className="px-3 pb-3 text-[13px] text-ink/60">
              Nothing is stuck and nobody is waiting on a client.
            </p>
          ) : (
            alerts.map((a) => (
              <DropdownMenu.Item
                key={a.id}
                onSelect={() => a.onSelect?.()}
                className="cursor-pointer rounded-xl px-3 py-2.5 outline-none transition-colors data-[highlighted]:bg-cream"
              >
                <span className="block text-[13px] text-maroon">{a.title}</span>
                <span className="mt-0.5 block text-[11px] leading-snug text-ink/55">
                  {a.detail}
                </span>
              </DropdownMenu.Item>
            ))
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function UserChip({
  user,
}: {
  user: { name: string; role?: string; email?: string; onSignOut?: () => void };
}) {
  const initials = user.name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex items-center gap-2.5 rounded-xl border border-ink/10 py-1.5 pl-1.5 pr-2.5 transition-colors hover:bg-cream"
          aria-label={`Account menu for ${user.name}`}
        >
          <span className="grid size-8 place-items-center rounded-lg bg-maroon text-[12px] font-bold text-gold">
            {initials || "A"}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block max-w-[140px] truncate text-[13px] leading-tight text-maroon">
              {user.name}
            </span>
            {user.role ? (
              <span className="block text-[11px] leading-tight capitalize text-muted">
                {user.role}
              </span>
            ) : null}
          </span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="motion-popover z-50 w-[240px] rounded-2xl border border-ink/10 bg-white p-2 shadow-soft focus:outline-none"
        >
          <div className="px-3 py-2">
            <p className="truncate text-[13px] text-maroon">{user.name}</p>
            {user.email ? (
              <p className="mt-0.5 truncate text-[11px] text-muted">{user.email}</p>
            ) : null}
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-ink/10" />
          <DropdownMenu.Item
            asChild
            className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-[13px] text-ink/70 outline-none data-[highlighted]:bg-cream"
          >
            <Link to="/">
              <Settings className="size-4 text-muted" aria-hidden />
              Back to the site
            </Link>
          </DropdownMenu.Item>
          {user.onSignOut ? (
            <DropdownMenu.Item
              onSelect={() => user.onSignOut?.()}
              className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-[13px] text-ink/70 outline-none data-[highlighted]:bg-cream"
            >
              <LogOut className="size-4 text-muted" aria-hidden />
              Sign out
            </DropdownMenu.Item>
          ) : null}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
