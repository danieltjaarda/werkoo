import type { Metadata } from "next";
import Image from "next/image";
import { InlogKaart } from "@/components/inlog-kaart";
import { PaginaOvergang } from "@/components/pagina-overgang";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Inloggen",
  description: "Log in als particulier om je aanvragen te volgen, of als bedrijf om je opdrachten te beheren.",
};

export default function InloggenPagina() {
  return (
    <PaginaOvergang>
      <SiteHeader />
      <main className="flex-1 bg-brand-soft py-16 sm:py-24">
        <div className="container-page">
          <div className="mx-auto max-w-md">
            <div className="flex justify-center">
              <Image src="/logo-werkoo.svg" alt="Werkoo" width={160} height={32} className="h-8 w-auto" />
            </div>
            <InlogKaart />
          </div>
        </div>
      </main>
      <SiteFooter />
    </PaginaOvergang>
  );
}
