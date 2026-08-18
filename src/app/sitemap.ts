import type { MetadataRoute } from "next";
import { categorieen, diensten } from "@/lib/diensten";
import { plaatsen, slugVanPlaatsnaam } from "@/lib/plaatsen";
import { absoluut } from "@/lib/site";
import { actieveBedrijfSlugs, dienstenMetBedrijven } from "@/lib/aanvragen";

/**
 * We zetten bewust niet alle 87 × 40 plaatscombinaties in de sitemap. Voor de
 * diensten waar nog geen vakmensen bij staan zou dat duizenden pagina's zijn die
 * onderling nauwelijks verschillen, en dat is precies wat een zoekmachine als
 * doorway pages ziet. Zodra een dienst profielen heeft, komen zijn plaatspagina's
 * er vanzelf bij.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const nu = new Date();
  const [metProfielen, bedrijfSlugs] = await Promise.all([dienstenMetBedrijven(), actieveBedrijfSlugs()]);

  const vast: MetadataRoute.Sitemap = [
    { url: absoluut("/"), lastModified: nu, changeFrequency: "daily", priority: 1 },
    { url: absoluut("/diensten"), lastModified: nu, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluut("/aanmelden"), lastModified: nu, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluut("/over-ons"), lastModified: nu, changeFrequency: "yearly", priority: 0.4 },
    { url: absoluut("/privacy"), lastModified: nu, changeFrequency: "yearly", priority: 0.2 },
    { url: absoluut("/voorwaarden"), lastModified: nu, changeFrequency: "yearly", priority: 0.2 },
  ];

  const categoriePaginas: MetadataRoute.Sitemap = categorieen.map((categorie) => ({
    url: absoluut(`/diensten/${categorie.slug}`),
    lastModified: nu,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const dienstPaginas: MetadataRoute.Sitemap = diensten.map((dienst) => ({
    url: absoluut(`/${dienst.slug}`),
    lastModified: nu,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const plaatsPaginas: MetadataRoute.Sitemap = diensten
    .filter((dienst) => metProfielen.has(dienst.slug))
    .flatMap((dienst) =>
      plaatsen.map((plaats) => ({
        url: absoluut(`/${dienst.slug}/${slugVanPlaatsnaam(plaats)}`),
        lastModified: nu,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    );

  const profielPaginas: MetadataRoute.Sitemap = bedrijfSlugs.map((slug) => ({
    url: absoluut(`/vakman/${slug}`),
    lastModified: nu,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...vast, ...categoriePaginas, ...dienstPaginas, ...plaatsPaginas, ...profielPaginas];
}
