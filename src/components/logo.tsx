import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function LogoMark({ className, alt }: { className?: string; alt?: string }) {
  return (
    <img
      src="/logo/logo.png"
      alt={alt ?? "ATRO Design & Construction"}
      className={cn("block object-contain", className)}
    />
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn("group shrink-0", className)}
      aria-label="ATRO home"
    >
      <LogoMark className="h-10 md:h-12 w-auto transition-transform duration-300 group-hover:scale-105" />
    </Link>
  );
}

export function HeaderLogo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn("group shrink-0", className)}
      aria-label="ATRO home"
    >
      <img
        src="/logo/logo-header.png"
        alt="ATRO Design & Construction"
        className="block h-9 w-auto object-contain transition-[filter,transform] duration-300 group-hover:scale-[1.03] group-hover:drop-shadow-[0_0_9px_rgba(235,174,88,0.7)] drop-shadow-[0_0_6px_rgba(235,174,88,0.35)]"
      />
    </Link>
  );
}
