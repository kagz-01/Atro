import { useState } from "react";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { authClient } from "@/lib/auth/client";

/**
 * Email + password sign-in and sign-up against this app's own Better Auth.
 *
 * Real accounts in this app's database — not the broker, not a mock — so a
 * client who never uses Google still gets a portal. Same shape as every other
 * form here: one mode at a time, inline errors, no page navigation until the
 * session actually exists.
 */

type Mode = "signin" | "signup";

const COPY: Record<Mode, { sub: string; cta: string; switchTo: Mode; switchLabel: string }> = {
  signin: {
    sub: "Use the email and password you set up for ATRO.",
    cta: "Sign in",
    switchTo: "signup",
    switchLabel: "Create an account",
  },
  signup: {
    sub: "Use the address the studio has on file, so your project is found for you.",
    cta: "Create account",
    switchTo: "signin",
    switchLabel: "I already have an account",
  },
};

export function EmailPasswordForm({ onDone }: { onDone: () => void }) {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copy = COPY[mode];

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!email.trim()) return setError("Enter your email address.");
    if (password.length < 8) return setError("Passwords are at least 8 characters.");
    if (mode === "signup" && !name.trim()) return setError("Enter your name.");

    setBusy(true);
    try {
      const result =
        mode === "signin"
          ? await authClient.signIn.email({ email: email.trim(), password })
          : await authClient.signUp.email({ email: email.trim(), password, name: name.trim() });

      if (result.error) {
        setError(result.error.message ?? "That did not work.");
        return;
      }
      toast.success(mode === "signin" ? "Signed in." : "Account created.");
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4" noValidate>
      <p className="text-[13px] leading-relaxed text-ink/60">{copy.sub}</p>

      {mode === "signup" ? (
        <div className="mt-5">
          <Label htmlFor="ep-name">Your name</Label>
          <Input
            id="ep-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            placeholder="e.g. Jane Wanjiku"
          />
        </div>
      ) : null}

      <div className="mt-5">
        <Label htmlFor="ep-email">Email</Label>
        <Input
          id="ep-email"
          type="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="you@example.com"
        />
      </div>

      <div className="mt-5">
        <Label htmlFor="ep-password">Password</Label>
        <Input
          id="ep-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          placeholder="At least 8 characters"
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-800"
        >
          {error}
        </p>
      ) : null}

      <Button type="submit" variant="primary" size="lg" className="mt-6 w-full" disabled={busy}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
        {copy.cta}
        {!busy && <ArrowRight className="size-4 opacity-60" />}
      </Button>

      <button
        type="button"
        onClick={() => {
          setMode(copy.switchTo);
          setError(null);
        }}
        className="mt-4 w-full cursor-pointer text-center text-[13px] text-ink/60 underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:text-maroon"
      >
        {copy.switchLabel}
      </button>
    </form>
  );
}