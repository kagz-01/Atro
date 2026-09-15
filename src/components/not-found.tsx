import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function NotFound() {
  return (
    <section className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center pt-28">
      <p className="text-[11px] uppercase tracking-[0.2em] text-gold">404</p>
      <h1 className="mt-4 font-display text-5xl text-maroon">This page is not on the drawings.</h1>
      <p className="mt-4 max-w-md text-ink/70">
        The URL does not match a project, service or zone. Start from the studio home, or tell us what you were looking for.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link to="/">Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/start">Start a project</Link>
        </Button>
      </div>
    </section>
  );
}
