import { useState } from "react";
import { Smile } from "lucide-react";

const EMOJIS = [
  ["👍", "Thumbs up"],
  ["❤️", "Heart"],
  ["😊", "Smiling face"],
  ["🙏", "Thank you"],
  ["👏", "Clapping"],
  ["🎉", "Celebration"],
  ["✅", "Done"],
  ["👀", "Looking"],
  ["🏠", "House"],
  ["🧱", "Bricks"],
  ["🔨", "Hammer"],
  ["🛠️", "Tools"],
  ["📅", "Calendar"],
  ["📍", "Location"],
  ["📷", "Photo"],
  ["💰", "Money"],
] as const;

export function EmojiPicker({ onPick }: { onPick: (emoji: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Add emoji"
        title="Add emoji"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="grid size-11 shrink-0 place-items-center rounded-full text-maroon transition-colors hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon"
      >
        <Smile className="size-5" aria-hidden />
      </button>
      {open ? (
        <div
          role="group"
          aria-label="Choose an emoji"
          className="absolute bottom-full left-0 z-20 mb-2 grid w-52 grid-cols-4 gap-1 rounded-xl border border-ink/10 bg-white p-2 shadow-lg"
        >
          {EMOJIS.map(([emoji, label]) => (
            <button
              key={emoji}
              type="button"
              aria-label={label}
              title={label}
              className="grid size-10 place-items-center rounded-lg text-xl hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon"
              onClick={() => {
                onPick(emoji);
                setOpen(false);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
