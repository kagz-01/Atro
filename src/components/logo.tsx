import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <img
      src="/logo/logo.png"
      alt="ATRO Design & Construction"
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
      <LogoMark className="h-14 md:h-16 w-auto" />
    </Link>
  );
}
