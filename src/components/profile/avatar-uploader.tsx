import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteMyAvatar, getMyAvatar, saveMyAvatar } from "@/lib/profile-server";
import {
  AVATAR_MIME,
  AVATAR_EDGE,
  encodeImageDataUrl,
  initialsFrom,
  parseImageDataUrl,
  type ParsedImage,
} from "@/lib/profile";

/**
 * The client's picture.
 *
 * The resizing happens here, in the browser, because a phone camera produces a
 * 4 MB file and the server should never have to accept one. The file is drawn
 * to a 512px square — cropped to fill, because a squashed face looks like a
 * mistake — and re-encoded as a JPEG, which lands far below the size the server
 * will accept.
 */
export function AvatarUploader({
  displayName,
  onChanged,
  editable = true,
}: {
  displayName: string;
  onChanged?: () => void;
  editable?: boolean;
}) {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<ParsedImage | null>(null);
  const input = useRef<HTMLInputElement | null>(null);

  const {
    data,
    error: loadError,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["my-avatar"],
    queryFn: () => getMyAvatar({ data: undefined }),
  });

  const preview = picked ? encodeImageDataUrl(picked) : (data?.dataUrl ?? null);
  const initials = initialsFrom(displayName) || "AT";

  async function onFile(file: File) {
    setError(null);
    setPicked(null);
    if (!AVATAR_MIME.includes(file.type as (typeof AVATAR_MIME)[number])) {
      setError("Pick a picture — JPEG, PNG or WebP.");
      return;
    }
    try {
      const shrunk = await resizeToSquare(file, AVATAR_EDGE);
      const parsed = parseImageDataUrl(shrunk);
      if (!parsed.ok) {
        setError(parsed.reason);
        return;
      }
      setPicked(parsed.image);
    } catch {
      setError("That picture could not be read. Try a different file.");
    }
  }

  async function save() {
    if (!picked) return;
    setBusy(true);
    setError(null);
    try {
      const dataUrl = encodeImageDataUrl(picked);
      const result = await saveMyAvatar({
        data: {
          mime: picked.mime,
          dataUrl,
        },
      });
      setPicked(null);
      queryClient.setQueryData(["my-avatar"], { dataUrl, updatedAt: result.updatedAt });
      onChanged?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "That picture could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    setError(null);
    try {
      await deleteMyAvatar();
      queryClient.setQueryData(["my-avatar"], { dataUrl: null, updatedAt: null });
      onChanged?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "That picture could not be removed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative">
        {preview ? (
          <img
            src={preview}
            alt={`Profile photo for ${displayName || "your account"}`}
            className="size-20 rounded-full border border-ink/10 bg-cream object-cover"
          />
        ) : (
          <span
            aria-label={`Profile initials: ${initials}`}
            className="grid size-20 place-items-center rounded-full bg-maroon text-2xl font-bold text-gold"
          >
            {initials}
          </span>
        )}
        {busy ? (
          <span className="absolute inset-0 grid place-items-center rounded-full bg-white/70">
            <Loader2 className="size-5 animate-spin text-maroon" />
          </span>
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        {!editable ? (
          <>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
              Profile photo
            </p>
            <p className="mt-1 text-[13px] text-ink/70">
              {preview
                ? "Private to your account in this portal."
                : "Add a photo to personalize your account."}
            </p>
            {isLoading ? <p className="mt-1 text-[11px] text-ink/45">Loading photo…</p> : null}
            {loadError ? (
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <p role="alert" className="text-[11px] text-red-700">
                  Could not load your profile photo.
                </p>
                <Button type="button" size="sm" variant="ghost" onClick={() => void refetch()}>
                  Try again
                </Button>
              </div>
            ) : null}
          </>
        ) : (
          <>
            <p className="text-[13px] text-ink/70">
              A picture personalizes your account in the portal. It remains private to your account.
            </p>
            {isLoading ? (
              <p className="mt-1 text-[11px] text-ink/45">Loading current photo…</p>
            ) : null}
            {loadError ? (
              <p role="alert" className="mt-1 text-[11px] text-red-700">
                Could not load your current profile photo. You can still add a new one.
              </p>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                ref={input}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) void onFile(file);
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => input.current?.click()}
              >
                <Camera className="size-4" />
                {preview ? "Replace picture" : "Add a picture"}
              </Button>

              {picked ? (
                <Button type="button" size="sm" disabled={busy} onClick={() => void save()}>
                  <Upload className="size-4" />
                  Save picture
                </Button>
              ) : null}

              {preview && !picked ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  onClick={() => void remove()}
                >
                  <Trash2 className="size-4" />
                  Remove
                </Button>
              ) : null}
            </div>

            {picked ? (
              <p role="status" className="mt-2 text-[12px] text-ink/55">
                Ready to save — {Math.round(picked.bytes.byteLength / 1024)} KB after resizing.
              </p>
            ) : null}

            {error ? (
              <p role="alert" className="mt-2 text-[12px] text-red-700">
                {error}
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Draw an image into a square, cropped to fill, and return a JPEG data URL.
 *
 * Rejecting a huge canvas matters: a modern phone photo is 4000px wide, and
 * drawing that at full size needs ~64MB of memory before we scale it.
 */
function resizeToSquare(file: File, edge: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      const longest = Math.max(image.width, image.height);
      const scale = Math.min(1, 3000 / longest);
      const source = document.createElement("canvas");
      source.width = Math.max(1, Math.round(image.width * scale));
      source.height = Math.max(1, Math.round(image.height * scale));
      const sourceCtx = source.getContext("2d");
      if (!sourceCtx) return reject(new Error("no 2d context"));
      sourceCtx.drawImage(image, 0, 0, source.width, source.height);

      const out = document.createElement("canvas");
      out.width = edge;
      out.height = edge;
      const ctx = out.getContext("2d");
      if (!ctx) return reject(new Error("no 2d context"));
      const side = Math.min(source.width, source.height);
      ctx.drawImage(
        source,
        (source.width - side) / 2,
        (source.height - side) / 2,
        side,
        side,
        0,
        0,
        edge,
        edge,
      );
      resolve(out.toDataURL("image/jpeg", 0.82));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("could not decode image"));
    };
    image.src = url;
  });
}
