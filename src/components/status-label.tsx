import { AntwoordIcon, BekerIcon, KlokIcon, KruisCirkelIcon, SterretjeIcon } from "@/components/icons-extra";
import { statusLabels, type Status } from "@/lib/aanvragen";

/**
 * Eén plek voor hoe een status eruitziet: kleur, icoon en tekst. Een lijst met
 * aanvragen is zo in één oogopslag te scannen, ook zonder de kleuren te kennen.
 */
const iconen: Record<Status, (props: { className?: string }) => React.ReactElement> = {
  nieuw: SterretjeIcon,
  in_behandeling: KlokIcon,
  gereageerd: AntwoordIcon,
  gewonnen: BekerIcon,
  verloren: KruisCirkelIcon,
};

export function StatusLabel({ status, className = "" }: { status: Status; className?: string }) {
  const Icoon = iconen[status];
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <Icoon className="h-6 w-6 shrink-0" />
      {statusLabels[status]}
    </span>
  );
}
