import type { MetadataRoute } from "next";
import { absoluut } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // De aanvraagflow en de inlogpagina hebben geen zoekwaarde en staan vol
      // querystrings; die hoeven niet in de index.
      disallow: ["/api/", "/aanvraag", "/inloggen"],
    },
    sitemap: absoluut("/sitemap.xml"),
  };
}
