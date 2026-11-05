import { useState } from "react";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { authAvailable } from "@/lib/auth/client";

type Stage = "email" | "code";

export function EmailSignInForm({
  onDone,
  onGuestPreview,
}: {
  onDone: () => void;
  onGuestPreview: () => void;
}) {
  const [stage, setStage] = useState<Stage>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function sendCode() {
    setBusy(true);
    setError("");
    if (!authAvailable()) {
      onGuestPreview();
      setBusy(false);
      return;
    }
    try {
      const { sendEmailCode } = await import("@/lib/auth/client");
      const result = await sendEmailCode(email);
      if (result.error) {
        setError(result.error);
        return;
      }
      setStage("code");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not send an email code.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode() {
    setBusy(true);
    setError("");
    try {
      const { verifyEmailCode } = await import("@/lib/auth/client");
      const result = await verifyEmailCode(email, code);
      if (result.error) {
        setError(result.error);
        return;
      }
      onDone();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not verify the email code.");
    } finally {
      setBusy(false);
    }
  }

  return stage === "email" ? (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void sendCode();
      }}
      className="mt-4 max-w-md"
      noValidate
    >
      <h2 className="font-display text-2xl text-maroon">Continue with email</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink/80">
        We will email you a one-time code. No password is needed, and a new account is created
        automatically if this is your first visit.
      </p>
      <div className="mt-5">
        <Label htmlFor="email-sign-in">Email address</Label>
        <Input
          id="email-sign-in"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          maxLength={254}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
        />
      </div>
      {error ? <Alert>{error}</Alert> : null}
      <Button type="submit" variant="primary" size="lg" className="mt-5 w-full" disabled={busy}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
        Email me a code
        {!busy ? <ArrowRight className="size-4 opacity-60" /> : null}
      </Button>
    </form>
  ) : (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void verifyCode();
      }}
      className="mt-4 max-w-md"
      noValidate
    >
      <h2 className="font-display text-2xl text-maroon">Check your email</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink/80">
        Enter the one-time code sent to <strong>{email.trim()}</strong>.
      </p>
      <div className="mt-5">
        <Label htmlFor="email-sign-in-code">Email code</Label>
        <Input
          id="email-sign-in-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 8))}
          placeholder="123456"
          className="text-center text-lg tracking-[0.4em]"
        />
      </div>
      {error ? <Alert>{error}</Alert> : null}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="mt-5 w-full"
        disabled={busy || code.length < 4}
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : null}
        Verify and open portal
      </Button>
      <div className="mt-4 flex items-center justify-between text-[13px]">
        <button
          type="button"
          onClick={() => {
            setStage("email");
            setCode("");
            setError("");
          }}
          className="cursor-pointer text-ink/75 underline decoration-gold decoration-2 underline-offset-4 hover:text-maroon"
        >
          Change email
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void sendCode()}
          className="cursor-pointer text-burgundy underline decoration-gold decoration-2 underline-offset-4 hover:text-maroon disabled:cursor-wait disabled:opacity-50"
        >
          Resend code
        </button>
      </div>
    </form>
  );
}

function Alert({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-800">
      {children}
    </p>
  );
}
