import { SterIcon } from "@/components/icons";

/**
 * Label voor een betaalde uitgelichte plek. Het staat er bewust bij: die plek is
 * gekocht en niet verdiend met een cijfer, en dat hoort een bezoeker te zien.
 * Wordt zowel in de toplijst als op de kaarten in de aanvraagflow gebruikt.
 */
export function UitgelichtLabel({ formaat = "klein" }: { formaat?: "klein" | "groot" }) {
  const groot = formaat === "groot";

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full bg-zon font-display font-bold uppercase tracking-[0.08em] text-ink ${
        groot ? "px-2.5 py-1 text-mini" : "px-2 py-0.5 text-[11px]"
      }`}
    >
      <SterIcon className={groot ? "h-3.5 w-3.5" : "h-3 w-3"} />
      Uitgelicht
    </span>
  );
}
