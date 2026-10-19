import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Camera, Loader2 } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { proofLine } from "@/lib/evidence";
import { listMyEvidence, getMyEvidencePhoto } from "@/lib/evidence-server";

/**
 * The client's site photographs, against the stage each one proves.
 *
 * Before this, the milestones panel said "site photo" over a gradient and a
 * count. A client building from twelve time zones away does not need a count of
 * photographs — they need to look at the slab, the rebar, the curing, and judge
 * for themselves whether the work looks right. That is the product's whole
 * argument, and this panel is where it is kept.
 *
 * Each photograph loads its bytes only when its section is reached, so opening
 * the portal on a weak connection does not pull every photograph at once.
 */
export function EvidencePanel({ projectId }: { projectId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["my-evidence", projectId],
    queryFn: () => listMyEvidence({ data: { projectId } }),
  });

  if (isLoading) {
    return (
      <Panel title="Evidence" subtitle="Photographs from the site">
        <div className="flex items-center gap-3 text-[13px] text-ink/50">
          <Loader2 className="size-4 animate-spin" />
          Loading the photographs…
        </div>
      </Panel>
    );
  }

  if (error) {
    return (
      <Panel title="Evidence" subtitle="Photographs from the site">
        <p className="text-[13px] text-red-700">
          We could not load the photographs. Refresh the page and try again.
        </p>
      </Panel>
    );
  }

  const groups = data?.stages ?? [];
  const allPhotos = groups.flatMap((g) => g.photos);
  const totalPhotos = allPhotos.length;

  return (
    <Panel
      title="Evidence"
      subtitle={proofLine(allPhotos, data?.total ?? 0) || "Photographs from the site"}
      bodyClassName="p-0"
    >
      {totalPhotos === 0 ? (
        <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
          <Camera className="size-8 text-ink/20" aria-hidden />
          <p className="max-w-sm text-[13px] text-ink/50">
            No photographs have been posted on this project yet. When the studio
            posts one against a stage, it appears here with the date it was taken.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-ink/8">
          {groups.map((group) => (
            <section key={group.milestoneId} className="px-5 py-4">
              <header className="mb-3 flex flex-wrap items-baseline gap-2">
                <h3 className="font-display text-[15px] text-maroon">{group.name}</h3>
                {group.stage ? (
                  <span className="text-[11px] text-ink/45">{group.stage}</span>
                ) : null}
                <span className="ml-auto text-[11px] text-ink/40">
                  {group.photos.length}{" "}
                  {group.photos.length === 1 ? "photograph" : "photographs"}
                </span>
              </header>
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {group.photos.map((photo) => (
                  <li key={photo.id}>
                    <EvidencePhotoTile photoId={photo.id} caption={photo.caption} takenOn={photo.takenOn} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </Panel>
  );
}

/**
 * One photograph, loaded on demand.
 *
 * The bytes come back as a data URL over the same authenticated path the avatar
 * uses, so there is no second place where ownership could be checked wrong.
 */
function EvidencePhotoTile({
  photoId,
  caption,
  takenOn,
}: {
  photoId: string;
  caption: string;
  takenOn: string;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const r = await getMyEvidencePhoto({ data: { photoId } });
        if (!cancelled) setSrc(r.dataUrl);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [photoId]);

  return (
    <figure className="overflow-hidden rounded-xl border border-ink/10 bg-ink/4">
      <div className="relative aspect-[4/3] bg-gradient-to-br from-ink/8 to-ink/4">
        {src ? (
          <img
            src={src}
            alt={caption}
            loading="lazy"
            className="absolute inset-0 size-full object-cover"
          />
        ) : failed ? (
          <div className="absolute inset-0 grid place-items-center px-3 text-center text-[11px] text-ink/45">
            This photograph could not be loaded.
          </div>
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <Loader2 className="size-4 animate-spin text-ink/30" />
          </div>
        )}
      </div>
      <figcaption className="px-3 py-2.5">
        <p className="text-[12px] leading-snug text-ink/75">{caption}</p>
        {takenOn ? (
          <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-ink/40">
            Taken {takenOn}
          </p>
        ) : null}
      </figcaption>
    </figure>
  );
}
