/**
 * Images that go into the record.
 *
 * A phone camera produces a 4 MB file and a server should never accept one. So
 * the resize happens in the browser, here, before anything is uploaded — and
 * the same helper serves the client avatar and the site photographs so there is
 * one rule about size and format rather than two that drift apart.
 */

export const IMAGE_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
export type ImageMime = (typeof IMAGE_MIME)[number];

/** What we will store, per picture, after the browser has resized it. */
export const MAX_BYTES = 900 * 1024;

export const ACCEPTED = IMAGE_MIME.join(",");

/**
 * Longest edge kept. Site photographs are looked at on a phone and on a
 * desktop, and evidence has to be legible enough to judge a pour or a rebar
 * spacing — but not so large that the portal turns into a photo gallery that
 * nobody on a weak connection can open.
 */
export const MAX_EDGE = 1600;

/** Cap on the source bitmap we will even draw, to bound memory. */
const MAX_SOURCE_EDGE = 3000;

export type ImageProblem = { ok: false; reason: string };
export type ImageOk = { ok: true; dataUrl: string; bytes: number; mime: ImageMime };
export type ImageResult = ImageOk | ImageProblem;

export function checkImageSize(
  byteLength: number,
): { ok: true } | ImageProblem {
  if (byteLength === 0) return { ok: false, reason: "That picture was empty." };
  if (byteLength > MAX_BYTES) {
    return {
      ok: false,
      reason: `That picture is ${Math.round(byteLength / 1024)} KB after resizing, over the ${Math.round(MAX_BYTES / 1024)} KB limit. Try a smaller photo.`,
    };
  }
  return { ok: true };
}

export function isImageMime(value: string): value is ImageMime {
  return (IMAGE_MIME as readonly string[]).includes(value);
}

/**
 * Read a file, scale it to fit `maxEdge`, and return a JPEG data URL.
 *
 * Never throws: a corrupt file comes back as a reason, because the caller has to
 * show it to the person holding the phone.
 */
export function resizeImage(
  file: File,
  opts: { maxEdge?: number; quality?: number; square?: boolean } = {},
): Promise<ImageResult> {
  const maxEdge = opts.maxEdge ?? MAX_EDGE;
  const quality = opts.quality ?? 0.82;
  return new Promise<ImageResult>((resolve) => {
    if (!file.type.startsWith("image/")) {
      resolve({ ok: false, reason: "Pick a photograph — JPEG, PNG or WebP." });
      return;
    }

    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      try {
        resolve({ ok: true, ...draw(image, maxEdge, quality, opts.square === true) });
      } catch {
        resolve({ ok: false, reason: "That picture could not be read." });
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ ok: false, reason: "That picture could not be read. Try another file." });
    };

    image.src = url;
  });
}

function draw(
  image: HTMLImageElement,
  maxEdge: number,
  quality: number,
  square: boolean,
): { dataUrl: string; bytes: number; mime: ImageMime } {
  // Downscale the source before drawing: a 4000px photo at full size needs tens
  // of megabytes of canvas for no visible gain.
  const longest = Math.max(image.width, image.height);
  const scale = Math.min(1, MAX_SOURCE_EDGE / longest);
  const source = document.createElement("canvas");
  source.width = Math.max(1, Math.round(image.width * scale));
  source.height = Math.max(1, Math.round(image.height * scale));
  const sourceCtx = source.getContext("2d");
  if (!sourceCtx) throw new Error("no 2d context");
  sourceCtx.drawImage(image, 0, 0, source.width, source.height);

  const out = document.createElement("canvas");
  let sx = 0;
  let sy = 0;
  let sw = source.width;
  let sh = source.height;

  if (square) {
    const side = Math.min(source.width, source.height);
    sx = (source.width - side) / 2;
    sy = (source.height - side) / 2;
    sw = side;
    sh = side;
  } else {
    const longestEdge = Math.max(source.width, source.height);
    if (longestEdge > maxEdge) {
      const factor = maxEdge / longestEdge;
      sw = source.width * factor;
      sh = source.height * factor;
    }
  }

  out.width = Math.max(1, Math.round(sw));
  out.height = Math.max(1, Math.round(sh));
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("no 2d context");
  ctx.drawImage(source, sx, sy, sw, sh, 0, 0, out.width, out.height);

  const dataUrl = out.toDataURL("image/jpeg", quality);
  const bytes = Math.round((dataUrl.length - dataUrl.indexOf(",") - 1) * 0.75);
  return { dataUrl, bytes, mime: "image/jpeg" };
}

/** Split a data URL into its mime and bytes, refusing anything unexpected. */
export function parseImageDataUrl(
  value: string,
): { ok: true; mime: ImageMime; bytes: Uint8Array } | ImageProblem {
  const match = /^data:([a-z]+\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/i.exec(
    value.trim(),
  );
  if (!match) return { ok: false, reason: "That picture could not be read." };

  const mime = match[1].toLowerCase();
  if (!isImageMime(mime)) {
    return { ok: false, reason: "Use a JPEG, PNG or WebP picture." };
  }

  let bytes: Uint8Array;
  try {
    bytes = Uint8Array.from(atob(match[2].replace(/\s/g, "")), (c) => c.charCodeAt(0));
  } catch {
    return { ok: false, reason: "That picture could not be read." };
  }

  const size = checkImageSize(bytes.byteLength);
  if (!size.ok) return size;
  return { ok: true, mime, bytes };
}