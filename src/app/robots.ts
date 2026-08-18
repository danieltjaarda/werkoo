import type { MetadataRoute } from "next";
import { absoluut } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      /**
       * De aanvraagflow en de inlogpagina hebben geen zoekwaarde en staan vol
       * querystrings; die hoeven niet in de index.
       *
       * De $ sluit het pad af en de / opent de map eronder. Zonder die $ zou
       * "/account" ook /accountant blokkeren — een gewone dienstpagina die we
       * juist geïndexeerd willen hebben. scripts/routes-test.mjs bewaakt dat.
       */
      disallow: [
        "/api/",
        "/aanvraag$",
        "/aanvraag?",
        "/inloggen$",
        "/inloggen?",
        "/account$",
        "/account/",
        "/pro$",
        "/pro/",
        "/wachtwoord-vergeten$",
        "/wachtwoord-herstellen",
      ],
    },
    sitemap: absoluut("/sitemap.xml"),
  };
}
