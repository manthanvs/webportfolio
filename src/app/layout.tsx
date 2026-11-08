import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { site } from "@/content";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
});

const jbmono = JetBrains_Mono({
  variable: "--font-jbmono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  // absolute origin for the link-preview image (app/opengraph-image.jpg); set by the deploy workflow
  metadataBase: process.env.NEXT_PUBLIC_SITE_ORIGIN ? new URL(process.env.NEXT_PUBLIC_SITE_ORIGIN) : undefined,
  title: `${site.name} — ${site.role}`,
  description: `Portfolio of ${site.name}, a developer in Pune building full-stack web apps, backend APIs and Android tools.`,
};

export const viewport: Viewport = {
  themeColor: "#111214",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bricolage.variable} ${jbmono.variable}`}>
      <body>
        {/* the preloader only leaves via JS — never trap no-JS visitors behind it */}
        <noscript>
          <style>{"[data-preloader]{display:none!important}"}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
