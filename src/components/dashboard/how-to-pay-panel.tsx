import { useQuery } from "@tanstack/react-query";
import { Panel } from "@/components/ui/panel";
import { pickInstructions } from "@/lib/how-to-pay";
import { getMyHowToPay } from "@/lib/how-to-pay-server";

/**
 * Where the money goes, on the half of the portal that shows the ledger.
 *
 * The studio writes both sheets in the console — a paybill and account for a
 * client in the country, a SWIFT code and reference for one abroad — and this
 * panel shows the half that matches how far away this client lives, so
 * nobody is handed wire instructions they cannot use or a paybill that only
 * works from inside Kenya. Nothing published means no panel: the portal does
 * not invent an account the studio has not given it.
 */
export function HowToPayPanel({ projectId, abroad }: { projectId: string; abroad: boolean }) {
  const { data } = useQuery({
    queryKey: ["how-to-pay", projectId],
    queryFn: () => getMyHowToPay({ data: { projectId } }),
  });
  const text = pickInstructions(data?.local ?? "", data?.international ?? "", abroad);
  if (!text) return null;
  return (
    <Panel
      title="How to pay"
      subtitle={
        abroad
          ? "The studio's bank, for a payment from outside Kenya"
          : "The studio's account, for a payment from here"
      }
    >
      <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-ink/70">{text}</p>
    </Panel>
  );
}
