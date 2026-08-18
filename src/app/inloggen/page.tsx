import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { InlogKaart } from "@/components/inlog-kaart";
import { PaginaOvergang } from "@/components/pagina-overgang";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { huidigeGebruiker } from "@/lib/auth";
import { beeld } from "@/lib/site-beelden";

export const metadata: Metadata = {
  title: "Inloggen",
  description: "Log in als particulier om je aanvragen te volgen, of als bedrijf om je opdrachten te beheren.",
  robots: { index: false, follow: true },
};

function eerste(waarde: string | string[] | undefined) {
  return Array.isArray(waarde) ? (waarde[0] ?? "") : (waarde ?? "");
}

export default async function InloggenPagina({ searchParams }: PageProps<"/inloggen">) {
  const params = await searchParams;
  const gebruiker = await huidigeGebruiker();

  // Al ingelogd? Dan heeft dit scherm geen functie meer.
  if (gebruiker) redirect(gebruiker.soort === "bedrijf" ? "/pro" : "/account");

  return (
    <PaginaOvergang>
      <SiteHeader />
      <main className="flex-1 bg-brand-soft py-16 sm:py-24">
        <div className="container-page">
          <div className="mx-auto max-w-md">
            <div className="flex justify-center">
              <Image src="/logo-werkoo.svg" alt="Werkoo" width={160} height={32} className="h-8 w-auto" />
            </div>
            {beeld("welkom") ? (
              <Image
                src={beeld("welkom")!}
                alt=""
                width={700}
                height={700}
                sizes="180px"
                className="mx-auto mt-6 h-[170px] w-auto object-contain"
              />
            ) : null}
            <InlogKaart
              verder={eerste(params.verder)}
              beginModus={eerste(params.modus) === "registreren" ? "registreren" : "inloggen"}
            />
          </div>
        </div>
      </main>
      <SiteFooter />
    </PaginaOvergang>
  );
}
