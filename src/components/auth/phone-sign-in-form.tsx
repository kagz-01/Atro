import { useState } from "react";
import { ArrowRight, Loader2, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

/**
 * Phone sign-in: a number, then a one-time code.
 *
 * One step at a time, because two fields on screen invites half-finished
 * submissions. The code field appears only once a code has actually been sent,
 * and Resend stays available because SMS delivery is not always instant.
 */

type Stage = "phone" | "code";

export function PhoneSignInForm({ onDone }: { onDone: () => void }) {
  const [stage, setStage] = useState<Stage>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode() {
    setError(null);
    setBusy(true);
    try {
      const { sendPhoneCode } = await import("@/lib/auth/client");
      const result = await sendPhoneCode(phone);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSent(true);
      setStage("code");
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setError(null);
    setBusy(true);
    try {
      const { verifyPhoneCode } = await import("@/lib/auth/client");
      const result = await verifyPhoneCode(phone, code.trim());
      if (result.error) {
        setError(result.error);
        return;
      }
      onDone();
    } finally {
      setBusy(false);
    }
  }

  if (stage === "phone") {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void sendCode();
        }}
        className="mt-4"
        noValidate
      >
        <h2 className="font-display text-3xl text-maroon">Sign in</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-ink/65">
          Enter the phone number you gave the studio. We will text you a code — no
          password to remember, and it works whether you are in Nairobi or abroad.
        </p>

        <div className="mt-6">
          <Label htmlFor="pi-phone">Phone number</Label>
          <Input
            id="pi-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0799 034 712"
          />
          <p className="mt-2 text-[12px] leading-relaxed text-ink/50">
            Include your country code if you are outside Kenya, for example +44
            7700 900123.
          </p>
        </div>

        {error ? <Alert>{error}</Alert> : null}

        <Button type="submit" variant="primary" size="lg" className="mt-6 w-full" disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <MessageSquareText className="size-4" />}
          Text me a code
          {!busy && <ArrowRight className="size-4 opacity-60" />}
        </Button>
      </form>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void verify();
      }}
      className="mt-4"
      noValidate
    >
      <h2 className="font-display text-3xl text-maroon">Enter your code</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-ink/65">
        {sent ? (
          <>
            We sent a code to <strong>{phone}</strong>. It is six digits and it is
            good for a few minutes.
          </>
        ) : null}
      </p>

      <div className="mt-6">
        <Label htmlFor="pi-code">Code</Label>
        <Input
          id="pi-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
          placeholder="123456"
          className="text-center text-lg tracking-[0.4em]"
        />
      </div>

      {error ? <Alert>{error}</Alert> : null}

      <Button type="submit" variant="primary" size="lg" className="mt-6 w-full" disabled={busy || code.length < 4}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : null}
        Sign in
      </Button>

      <div className="mt-4 flex items-center justify-between text-[13px]">
        <button
          type="button"
          onClick={() => {
            setStage("phone");
            setCode("");
            setError(null);
          }}
          className="cursor-pointer text-ink/55 underline decoration-gold decoration-2 underline-offset-4 hover:text-maroon"
        >
          Change number
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