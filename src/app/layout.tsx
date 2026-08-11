import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
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
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
