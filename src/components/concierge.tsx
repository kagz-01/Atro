import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { MessageSquareText, Send, X } from "lucide-react";
import { useRef, useState } from "react";
import { askConcierge } from "@/lib/concierge";
import { cn } from "@/lib/utils";
import { whatsappHref, defaultWhatsappText } from "@/lib/whatsapp";

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "Do you build in Kiambu?",
  "How does the cost range work?",
  "I am building from abroad — how do you run the site?",
];

export function Concierge() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "I can point you to a service, a zone, or the next step. I will not quote a price or sign anything off — that is a person.",
    },
  ]);
  const listRef = useRef<HTMLDivElement>(null);

  const mutation = useMutation({
    mutationFn: async (next: Msg[]) => {
      const payload = next.filter((m, i) => !(i === 0 && m.role === "assistant"));
      return askConcierge({ data: { messages: payload.slice(-10) } });
    },
    onSuccess: (res) => {
      if (res.ok) {
        setMessages((m) => [...m, { role: "assistant", content: res.text }]);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: res.error }]);
      }
      queueMicrotask(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
      });
    },
  });

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || mutation.isPending || messages.length > 16) return;
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    mutation.mutate(next);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed z-40 left-4 bottom-[5.5rem] md:left-6 md:bottom-6 size-12 md:w-auto md:px-4 rounded-full md:rounded-xs bg-maroon text-paper text-[11px] uppercase tracking-[0.16em] inline-flex items-center justify-center md:justify-start gap-2 shadow-soft hover:bg-burgundy"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Ask ATRO"
      >
        <MessageSquareText className="size-4 shrink-0" />
        {/* Icon-only on mobile: the full-width label sat on top of the phone number. */}
        <span className="hidden md:inline">Ask ATRO</span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6"
          role="dialog"
          aria-label="ATRO concierge"
        >
          <button
            type="button"
            className="absolute inset-0 bg-ink/50"
            aria-label="Close concierge"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full sm:max-w-md bg-paper text-ink rounded-t-md sm:rounded-md shadow-soft flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-5 h-14 border-b border-line">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-gold">
                  Concierge
                </p>
                <p className="font-display text-xl text-maroon leading-none">
                  Ask ATRO
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="size-11 inline-flex items-center justify-center"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {messages.map((m, i) => (
                <div
                  key={`${m.role}-${i}`}
                  className={cn(
                    "max-w-[90%] text-sm leading-relaxed px-3 py-2 rounded-sm",
                    m.role === "assistant"
                      ? "bg-stone text-ink"
                      : "bg-burgundy text-paper ml-auto",
                  )}
                >
                  {m.content}
                </div>
              ))}
              {mutation.isPending ? (
                <p className="text-xs text-muted uppercase tracking-[0.16em]">
                  Thinking
                </p>
              ) : null}
            </div>

            <div className="px-5 pb-3 flex flex-wrap gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="text-[11px] border border-line px-2.5 py-1.5 rounded-xs hover:border-burgundy"
                  onClick={() => send(s)}
                >
                  {s}
                </button>
              ))}
            </div>

            <form
              className="px-5 pb-5 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about a zone, a service, the process"
                className="flex-1 h-12 border border-line bg-cream px-3 rounded-sm outline-none focus:border-burgundy"
                maxLength={500}
              />
              <button
                type="submit"
                className="size-12 bg-burgundy text-paper inline-flex items-center justify-center rounded-xs disabled:opacity-40"
                disabled={mutation.isPending}
                aria-label="Send"
              >
                <Send className="size-4" />
              </button>
            </form>

            <div className="px-5 pb-5 flex gap-4 text-[11px] uppercase tracking-[0.14em] text-muted">
              <Link to="/start" className="hover:text-burgundy" onClick={() => setOpen(false)}>
                Start a project
              </Link>
              <a
                href={whatsappHref(defaultWhatsappText())}
                target="_blank"
                rel="noreferrer"
                className="hover:text-burgundy"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
