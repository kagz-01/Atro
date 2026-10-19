import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import {
  addEvidencePhoto,
  deleteEvidencePhoto,
  readPhotosForStaff,
} from "@/lib/evidence-server";
import { checkPhotoCount } from "@/lib/evidence";
import { resizeImage, ACCEPTED } from "@/lib/image";

type MilestoneOption = { id: string; order: number; name: string };

/**
 * Post a photograph against a stage.
 *
 * The file is resized in the browser before it is sent — a phone camera
 * produces 4 MB and the server should never have to accept one. The caption is
 * required and checked: "Photo 1" is a filename, not evidence, and the client
 * is being asked to judge work from a different continent.
 *
 * On a phone the camera opens directly, because the person holding the phone is
 * standing at the work.
 */
export function EvidenceUploader({
  projectId,
  milestones,
  onUploaded,
}: {
  projectId: string;
  milestones: MilestoneOption[];
  onUploaded?: () => void;
}) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [milestoneId, setMilestoneId] = useState("");
  const [caption, setCaption] = useState("");
  const [detail, setDetail] = useState("");
  const [takenOn, setTakenOn] = useState("");
  const [preview, setPreview] = useState<{ dataUrl: string; mime: "image/jpeg" | "image/png" | "image/webp"; bytes: number } | null>(null);
  const [problem, setProblem] = useState("");

  const { data: photos } = useQuery({
    queryKey: ["staff-photos", projectId],
    queryFn: () => readPhotosForStaff({ data: { projectId } }),
  });

  const upload = useMutation({
    mutationFn: () => {
      if (!preview) throw new Error("Choose a photograph first.");
      return addEvidencePhoto({
        data: {
          projectId,
          milestoneId,
          caption,
          detail,
          takenOn,
          mime: preview.mime,
          dataUrl: preview.dataUrl,
        },
      });
    },
    onSuccess: () => {
      setCaption("");
      setDetail("");
      setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
      void queryClient.invalidateQueries({ queryKey: ["staff-photos", projectId] });
      onUploaded?.();
    },
    onError: (err) => setProblem(err instanceof Error ? err.message : "That did not save."),
  });

  const remove = useMutation({
    mutationFn: (photoId: string) => deleteEvidencePhoto({ data: { photoId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["staff-photos", projectId] });
      onUploaded?.();
    },
    onError: (err) => setProblem(err instanceof Error ? err.message : "That did not delete."),
  });

  async function onFile(file: File) {
    setProblem("");
    const r = await resizeImage(file);
    if (!r.ok) {
      setPreview(null);
      setProblem(r.reason);
      return;
    }
    setPreview({ dataUrl: r.dataUrl, mime: r.mime, bytes: r.bytes });
  }

  const countForMilestone = (photos ?? []).filter((p) => p.milestoneId === milestoneId).length;
  const room = checkPhotoCount(countForMilestone);
  const canSubmit = Boolean(preview && milestoneId && caption.trim().length >= 3 && room.ok);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="ev-ms">Stage</Label>
        <Select id="ev-ms" value={milestoneId} onChange={(e) => setMilestoneId(e.target.value)}>
          <option value="">Choose a stage…</option>
          {milestones.map((m) => (
            <option key={m.id} value={m.id}>
              {m.order}. {m.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="ev-file">Photograph</Label>
        <input
          ref={fileRef}
          id="ev-file"
          type="file"
          accept={ACCEPTED}
          capture="environment"
          className="mt-1 block w-full text-[13px] file:mr-3 file:rounded-lg file:border-0 file:bg-ink/8 file:px-3 file:py-2 file:text-[12px] file:font-semibold"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void onFile(file);
          }}
        />
        {preview ? (
          <div className="mt-3 flex items-start gap-3">
            <img
              src={preview.dataUrl}
              alt="Preview of the photograph to upload"
              className="size-24 rounded-lg border border-ink/10 object-cover"
            />
            <div className="min-w-0 text-[11px] text-ink/50">
              <p className="flex items-center gap-1.5">
                <Camera className="size-3.5" aria-hidden />
                {Math.round(preview.bytes / 1024)} KB, ready to send
              </p>
              <button
                type="button"
                className="mt-1 text-[11px] text-maroon underline"
                onClick={() => {
                  setPreview(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
              >
                Choose a different one
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div>
        <Label htmlFor="ev-caption">Caption — what is in the frame</Label>
        <Input
          id="ev-caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Ring beam before the pour"
        />
        <p className="mt-1 text-[11px] text-ink/45">
          Say what the photograph shows. “Photo 1” is not evidence.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="ev-detail">Detail (optional)</Label>
          <Textarea
            id="ev-detail"
            className="min-h-16"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="Reinforcement photographed before the pour. Engineer present."
          />
        </div>
        <div>
          <Label htmlFor="ev-taken">Date taken</Label>
          <Input
            id="ev-taken"
            type="date"
            value={takenOn}
            onChange={(e) => setTakenOn(e.target.value)}
          />
          <p className="mt-1 text-[11px] text-ink/45">
            The day the work happened, not today.
          </p>
        </div>
      </div>

      {problem ? <p className="text-[12px] text-red-700">{problem}</p> : null}
      {!room.ok ? <p className="text-[12px] text-amber-700">{room.reason}</p> : null}

      <Button
        size="sm"
        disabled={!canSubmit || upload.isPending}
        onClick={() => {
          setProblem("");
          upload.mutate();
        }}
      >
        {upload.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Camera className="size-3.5" />}
        Post photograph
      </Button>

      {photos && photos.length > 0 ? (
        <div className="border-t border-ink/10 pt-4">
          <p className="mb-3 text-[12px] font-semibold text-ink/60">
            {photos.length} posted on this project
          </p>
          <ul className="space-y-2">
            {photos.map((photo) => (
              <li key={photo.id} className="flex items-center gap-3 text-[12px]">
                <span className="min-w-0 flex-1 truncate text-ink/70">{photo.caption}</span>
                <Badge className="shrink-0">{milestones.find((m) => m.id === photo.milestoneId)?.name ?? "Stage"}</Badge>
                <button
                  type="button"
                  className="shrink-0 text-ink/40 hover:text-red-600"
                  aria-label={`Remove ${photo.caption}`}
                  disabled={remove.isPending}
                  onClick={() => remove.mutate(photo.id)}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
