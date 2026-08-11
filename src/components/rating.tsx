import { StarIcon } from "@/components/icons";

export function Rating({ score, className = "" }: { score: number; className?: string }) {
  return (
    <span className={`flex items-center gap-0.5 ${className}`} aria-label={`${score} van de 5 sterren`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <StarIcon
          key={index}
          className={`h-4 w-4 ${index < Math.round(score) ? "text-zon" : "text-current opacity-25"}`}
        />
      ))}
    </span>
  );
}
