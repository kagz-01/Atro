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
