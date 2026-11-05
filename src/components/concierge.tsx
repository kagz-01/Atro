import * as Dialog from "@radix-ui/react-dialog";
import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { MessageSquareText, RotateCcw, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { askConcierge } from "@/lib/concierge";
import { cn } from "@/lib/utils";
import { defaultWhatsappText, whatsappHref } from "@/lib/whatsapp";

type Message = {
  role: "user" | "assistant";
  content: string;
  retryable?: boolean;
};

const STARTERS = [
  "Where does ATRO work?",
  "How do material prices work?",
  "How do I start a project?",
];
const WELCOME: Message = {
  role: "assistant",
  content:
    "I can help with general questions about ATRO’s services, project areas and process. For project-specific decisions, use your project messages so the conversation stays on your project record.",
};
const RETRY_MESSAGE = "I couldn’t get an answer just now. Please try again, or contact the studio.";
const MAX_QUESTIONS = 6;

export function Concierge() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const latestMessageRef = useRef<HTMLDivElement>(null);
  const questionCount = messages.filter((message) => message.role === "user").length;
  const canAsk = questionCount < MAX_QUESTIONS;

  const mutation = useMutation({
    mutationFn: async (history: Message[]) => {
      const payload = history
        .filter((message, index) => !(index === 0 && message.role === "assistant"))
        .filter((message) => !message.retryable)
        .slice(-10)
        .map(({ role, content }) => ({ role, content }));
      return askConcierge({ data: { messages: payload } });
    },
    onSuccess: (result) => {
      appendReply(result.ok ? result.text : RETRY_MESSAGE, !result.ok);
    },
    onError: () => {
      appendReply(RETRY_MESSAGE, true);
    },
  });

  useEffect(() => {
    if (open) latestMessageRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, mutation.isPending, open]);

  function appendReply(content: string, retryable = false) {
    setMessages((current) => [...current, { role: "assistant", content, retryable }]);
  }

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || mutation.isPending || !canAsk) return;

    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setInput("");
    mutation.mutate(next);
  }

  function retry() {
    if (mutation.isPending) return;
    let retryIndex = -1;
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index].retryable) {
        retryIndex = index;
        break;
      }
    }
    if (retryIndex < 0) return;

    const history = messages.slice(0, retryIndex);
    setMessages(history);
    mutation.mutate(history);
  }

  function startNewChat() {
    if (mutation.isPending) return;
    setMessages([WELCOME]);
    setInput("");
  }

  return (
    <>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <button
            type="button"
            className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-4 z-20 inline-flex h-12 w-12 items-center justify-center gap-2 rounded-full bg-maroon text-[11px] uppercase tracking-[0.16em] text-paper shadow-soft transition-colors hover:bg-burgundy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold active:scale-[0.96] md:bottom-6 md:left-6 md:w-auto md:px-4"
            aria-label="Ask ATRO a question"
          >
            <MessageSquareText className="size-4 shrink-0" />
            <span className="hidden md:inline">Ask ATRO</span>
          </button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-[2px]" />
          <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[calc(100dvh-1rem-env(safe-area-inset-top))] w-full flex-col overflow-hidden rounded-t-2xl border border-line bg-paper text-ink shadow-soft focus:outline-none sm:inset-x-auto sm:bottom-auto sm:top-1/2 sm:w-[min(100%-3rem,30rem)] sm:-translate-y-1/2 sm:rounded-2xl md:right-6 md:top-auto md:bottom-6 md:translate-y-0 md:max-h-[min(80dvh,46rem)]">
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-burgundy">
                  General help
                </p>
                <Dialog.Title className="mt-0.5 font-display text-xl leading-tight text-maroon">
                  Ask ATRO
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-xs leading-relaxed text-ink/60">
                  Services, project areas and how to get started.
                </Dialog.Description>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {messages.length > 1 ? (
                  <button
                    type="button"
                    onClick={startNewChat}
                    disabled={mutation.isPending}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-burgundy transition-colors hover:bg-stone/50 disabled:opacity-50"
                    aria-label="Start a new chat"
                    title="Start a new chat"
                  >
                    <RotateCcw className="size-3.5" />
                    <span className="hidden sm:inline">New chat</span>
                  </button>
                ) : null}
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="grid size-11 place-items-center rounded-lg text-ink/65 transition-colors hover:bg-stone/50 hover:text-maroon focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-maroon"
                    aria-label="Close Ask ATRO"
                  >
                    <X className="size-5" />
                  </button>
                </Dialog.Close>
              </div>
            </header>

            <div
              role="log"
              aria-label="Conversation with Ask ATRO"
              aria-live="polite"
              aria-relevant="additions text"
              className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5"
            >
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={cn(
                    "max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    message.role === "assistant"
                      ? "rounded-tl-sm border border-line/70 bg-white text-ink"
                      : "ml-auto rounded-tr-sm bg-burgundy text-paper",
                  )}
                >
                  <p>{message.content}</p>
                  {message.retryable ? (
                    <button
                      type="button"
                      onClick={retry}
                      disabled={mutation.isPending}
                      className="mt-2 inline-flex min-h-10 items-center gap-1.5 font-semibold text-burgundy underline decoration-burgundy/40 underline-offset-2 disabled:opacity-50"
                    >
                      <RotateCcw className="size-3.5" />
                      Try again
                    </button>
                  ) : null}
                </div>
              ))}
              {mutation.isPending ? (
                <p className="flex items-center gap-2 text-xs text-ink/60" role="status">
                  <span className="flex gap-1" aria-hidden="true">
                    <span className="size-1.5 animate-pulse rounded-full bg-burgundy" />
                    <span className="size-1.5 animate-pulse rounded-full bg-burgundy [animation-delay:150ms]" />
                    <span className="size-1.5 animate-pulse rounded-full bg-burgundy [animation-delay:300ms]" />
                  </span>
                  Finding an answer…
                </p>
              ) : null}
              <div ref={latestMessageRef} aria-hidden="true" />
            </div>

            {messages.length === 1 ? (
              <div className="shrink-0 px-4 pb-3 sm:px-5">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/50">
                  Or choose a question
                </p>
                <div className="flex flex-wrap gap-2">
                  {STARTERS.map((starter) => (
                    <button
                      key={starter}
                      type="button"
                      disabled={mutation.isPending || !canAsk}
                      className="min-h-10 rounded-full border border-line bg-white px-3 text-left text-xs text-ink/80 transition-colors hover:border-burgundy/50 hover:bg-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy disabled:opacity-50"
                      onClick={() => send(starter)}
                    >
                      {starter}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <form
              className="shrink-0 border-t border-line bg-cream/70 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-5 sm:pb-4"
              onSubmit={(event) => {
                event.preventDefault();
                send(input);
              }}
            >
              {canAsk ? (
                <>
                  <div className="flex items-end gap-2">
                    <label className="sr-only" htmlFor="ask-atro-input">
                      Your question
                    </label>
                    <input
                      id="ask-atro-input"
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      placeholder="Type your question…"
                      className="h-12 min-w-0 flex-1 rounded-xl border border-line bg-white px-3 text-sm outline-none transition-colors placeholder:text-ink/45 focus:border-burgundy focus:ring-2 focus:ring-burgundy/10"
                      maxLength={500}
                      disabled={mutation.isPending}
                    />
                    <button
                      type="submit"
                      className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-burgundy text-paper transition-colors hover:bg-maroon focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy disabled:cursor-not-allowed disabled:opacity-45"
                      disabled={mutation.isPending || !input.trim()}
                      aria-label="Send question"
                    >
                      <Send className="size-4" />
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-ink/55">
                    General guidance only—not a quote, technical approval or project decision.
                  </p>
                </>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm leading-relaxed text-ink/75">
                    This chat has reached its question limit. Start a new chat or talk to the
                    studio about your project.
                  </p>
                  <button
                    type="button"
                    onClick={startNewChat}
                    className="inline-flex min-h-10 items-center gap-2 font-semibold text-burgundy"
                  >
                    <RotateCcw className="size-4" />
                    Start a new chat
                  </button>
                </div>
              )}
              <div className="mt-2 flex items-center gap-4 text-xs font-medium text-burgundy">
                <Link
                  to="/start"
                  className="inline-flex min-h-10 items-center underline decoration-burgundy/30 underline-offset-2 hover:text-maroon"
                  onClick={() => setOpen(false)}
                >
                  Start a project brief
                </Link>
                <a
                  href={whatsappHref(defaultWhatsappText())}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-10 items-center underline decoration-burgundy/30 underline-offset-2 hover:text-maroon"
                >
                  WhatsApp the studio
                </a>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
