import type { Metadata } from "next";
import Image from "next/image";
import { PaginaOvergang } from "@/components/pagina-overgang";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WachtwoordVergetenKaart } from "@/components/wachtwoord-kaart";

export const metadata: Metadata = {
  title: "Wachtwoord vergeten",
  robots: { index: false, follow: true },
};

export default function WachtwoordVergetenPagina() {
  return (
    <PaginaOvergang>
      <SiteHeader />
      <main className="flex-1 bg-brand-soft py-16 sm:py-24">
        <div className="container-page">
          <div className="mx-auto max-w-md">
            <div className="flex justify-center">
              <Image src="/logo-werkoo.svg" alt="Werkoo" width={160} height={32} className="h-8 w-auto" />
            </div>
            <WachtwoordVergetenKaart />
          </div>
        </div>
      </main>
      <SiteFooter />
    </PaginaOvergang>
  );
}
