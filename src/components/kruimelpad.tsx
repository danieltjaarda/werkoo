import Link from "next/link";

export type Kruimel = { naam: string; pad: string };

/**
 * Zichtbaar kruimelpad. De laatste kruimel is de pagina zelf en linkt niet.
 * Hoort samen te gaan met een BreadcrumbList in de gestructureerde data —
 * Google toont die alleen als het pad ook echt op de pagina staat.
 */
export function Kruimelpad({ kruimels, licht = false }: { kruimels: Kruimel[]; licht?: boolean }) {
  const kleur = licht ? "text-white/80" : "text-ink-soft";
  const actief = licht ? "text-white" : "text-ink";
  const hover = licht ? "hover:text-white" : "hover:text-brand-deep";

  return (
    <nav aria-label="Kruimelpad" className={`flex flex-wrap items-center gap-2 text-klein ${kleur}`}>
      {kruimels.map((kruimel, index) => {
        const laatste = index === kruimels.length - 1;
        return (
          <span key={kruimel.pad} className="flex items-center gap-2">
            {index > 0 ? <span aria-hidden>/</span> : null}
            {laatste ? (
              <span aria-current="page" className={actief}>
                {kruimel.naam}
              </span>
            ) : (
              <Link href={kruimel.pad} className={`underline-offset-4 hover:underline ${hover}`}>
                {kruimel.naam}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
