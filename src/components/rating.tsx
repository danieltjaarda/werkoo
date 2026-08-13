import Image from "next/image";

const MERK = "/images/werkoo-merk.png";

/** Cijfers lopen tot 10, zoals mensen ze op school leerden lezen. */
export const MAX_SCORE = 10;

/** Vijf beeldmerken, want tien op een rij wordt een streepjescode. */
const MERKEN = 5;

/**
 * Vijf beeldmerken als waardering bij een cijfer op een tienpuntsschaal. Het
 * laatste gevulde merk wordt deels ingekleurd, zodat een 9,4 er ook echt
 * uitziet als bijna vol.
 */
export function Rating({
  score,
  formaat = "klein",
  className = "",
}: {
  score: number;
  formaat?: "klein" | "groot";
  className?: string;
}) {
  const maat = formaat === "groot" ? "h-5 w-5" : "h-4 w-4";

  return (
    <span
      className={`flex items-center gap-1.5 ${className}`}
      aria-label={`${score.toLocaleString("nl-NL")} van de ${MAX_SCORE}`}
    >
      {Array.from({ length: MERKEN }).map((_, index) => {
        const deel = Math.min(Math.max((score / MAX_SCORE) * MERKEN - index, 0), 1);

        return (
          <span key={index} className={`relative block shrink-0 ${maat}`}>
            <Image src={MERK} alt="" width={36} height={36} aria-hidden className={`${maat} opacity-20 grayscale`} />
            {deel > 0 ? (
              <span
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${(deel * 100).toFixed(1)}%` }}
              >
                <Image
                  src={MERK}
                  alt=""
                  width={36}
                  height={36}
                  aria-hidden
                  className={`absolute left-0 top-0 max-w-none ${maat}`}
                />
              </span>
            ) : null}
          </span>
        );
      })}
    </span>
  );
}
