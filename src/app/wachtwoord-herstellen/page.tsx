import type { Metadata } from "next";
import Image from "next/image";
import { PaginaOvergang } from "@/components/pagina-overgang";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WachtwoordHerstellenKaart } from "@/components/wachtwoord-kaart";

export const metadata: Metadata = {
  title: "Nieuw wachtwoord",
  robots: { index: false, follow: false },
};

function eerste(waarde: string | string[] | undefined) {
  return Array.isArray(waarde) ? (waarde[0] ?? "") : (waarde ?? "");
}

export default async function WachtwoordHerstellenPagina({ searchParams }: PageProps<"/wachtwoord-herstellen">) {
  const params = await searchParams;
  return (
    <PaginaOvergang>
      <SiteHeader />
      <main className="flex-1 bg-brand-soft py-16 sm:py-24">
        <div className="container-page">
          <div className="mx-auto max-w-md">
            <div className="flex justify-center">
              <Image src="/logo-werkoo.svg" alt="Werkoo" width={160} height={32} className="h-8 w-auto" />
            </div>
            <WachtwoordHerstellenKaart token={eerste(params.token)} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </PaginaOvergang>
  );
}
