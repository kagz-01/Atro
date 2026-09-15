import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect } from "react";

export function Lightbox({
  images,
  index,
  onClose,
  onIndex,
}: {
  images: { src: string; alt: string }[];
  index: number;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const current = images[index];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex((index + 1) % images.length);
      if (e.key === "ArrowLeft") onIndex((index - 1 + images.length) % images.length);
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, images.length, onClose, onIndex]);

  if (!current) return null;

  return (
    <div className="fixed inset-0 z-50 bg-maroon/95 flex flex-col" role="dialog" aria-modal="true" aria-label="Image viewer">
      <div className="flex items-center justify-between px-4 h-14 text-paper">
        <p className="text-[11px] uppercase tracking-[0.16em] text-gold">
          {index + 1} / {images.length}
        </p>
        <button type="button" onClick={onClose} className="size-11 inline-flex items-center justify-center" aria-label="Close">
          <X className="size-6" />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 pb-8 gap-2">
        <button
          type="button"
          className="hidden sm:inline-flex size-12 items-center justify-center text-paper"
          onClick={() => onIndex((index - 1 + images.length) % images.length)}
          aria-label="Previous"
        >
          <ChevronLeft className="size-8" />
        </button>
        <img
          src={current.src}
          alt={current.alt}
          className="max-h-[78vh] max-w-full object-contain"
        />
        <button
          type="button"
          className="hidden sm:inline-flex size-12 items-center justify-center text-paper"
          onClick={() => onIndex((index + 1) % images.length)}
          aria-label="Next"
        >
          <ChevronRight className="size-8" />
        </button>
      </div>
      <p className="px-6 pb-6 text-center text-sm text-paper/70">{current.alt}</p>
    </div>
  );
}
