import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Sentient staat niet op Google Fonts, dus het bestand komt van Fontshare en
 * staat hier in de repo. Alleen de snede die we gebruiken: 500 cursief, voor
 * de dienstnaam in de titel.
 */
const sentient = localFont({
  src: "./fonts/sentient-medium-italic.woff2",
  variable: "--font-sentient",
  weight: "500",
  style: "italic",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Werkoo — vakmensen die passen bij jouw klus",
    template: "%s | Werkoo",
  },
  description:
    "Vertel kort wat je zoekt en ontvang reacties van vakmensen uit je eigen regio. Gratis, zonder abonnement en zonder verplichtingen.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="nl"
      // Browserextensies zetten attributen op <html>, wat anders een hydration-waarschuwing geeft.
      suppressHydrationWarning
      className={`${montserrat.variable} ${sentient.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
