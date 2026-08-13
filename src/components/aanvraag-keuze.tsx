"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DienstZoeker } from "@/components/dienst-zoeker";
import { ArrowRightIcon } from "@/components/icons";
import { categorieen, dienstenVanCategorie, populaireDiensten } from "@/lib/diensten";

/**
 * Wat je krijgt als je op /aanvraag komt zonder te zeggen waarvoor. In plaats van
 * een lege flow of een 404 kies je hier eerst de dienst; daarna gaat het gewoon
 * verder met de vragen.
 */
export function AanvraagKeuze() {
  const router = useRouter();
  const [term, setTerm] = useState("");

  return (
    <div className="container-page sectie">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-balance font-display text-h1 text-ink">Waar heb je hulp bij nodig?</h1>
        <p className="mt-4 text-lead text-ink-soft">
          Typ waar je iemand voor zoekt. Daarna stellen we een paar korte vragen over je klus en leggen we die
          voor aan vakmensen in je eigen regio.
        </p>

        <div className="mt-8">
          <DienstZoeker
            id="aanvraag-dienst"
            waarde={term}
            onWaarde={setTerm}
            onKies={(dienst) => router.push(`/aanvraag?dienst=${dienst.slug}`, { transitionTypes: ["nav-vooruit"] })}
            autoFocus
            klassen="h-veld w-full rounded-2xl border border-lijn bg-white pl-12 pr-4 text-basis text-ink outline-none transition placeholder:text-ink-soft focus:border-brand focus:ring-4 focus:ring-brand/15"
          />
        </div>

        <div className="mt-8">
          <p className="text-klein font-semibold text-ink">Vaak gezocht</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {populaireDiensten().map((dienst) => (
              <li key={dienst.slug}>
                <Link
                  href={`/aanvraag?dienst=${dienst.slug}`}
                  className="flex rounded-full border border-lijn bg-white px-3.5 py-1.5 text-klein text-ink transition hover:border-brand hover:text-brand-deep"
                >
                  {dienst.menuLabel}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 border-t border-lijn pt-8">
          <p className="text-klein font-semibold text-ink">Of blader per categorie</p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {categorieen.map((categorie) => (
              <li key={categorie.id}>
                <Link
                  href={`/diensten/${categorie.slug}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-lijn bg-white px-4 py-3 transition hover:border-brand"
                >
                  <span className="text-basis text-ink">{categorie.titel}</span>
                  <span className="flex items-center gap-2 text-klein text-ink-soft">
                    {dienstenVanCategorie(categorie.id).length}
                    <ArrowRightIcon className="h-4 w-4" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
