import Image from "next/image";

const MERK = "/images/werkoo-merk.png";

/**
 * Vijf beeldmerken als waardering. Het laatste gevulde merk wordt deels
 * ingekleurd, zodat een 4,7 er ook echt uitziet als bijna vijf.
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
      aria-label={`${score.toLocaleString("nl-NL")} van de 5`}
    >
      {Array.from({ length: 5 }).map((_, index) => {
        const deel = Math.min(Math.max(score - index, 0), 1);

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
