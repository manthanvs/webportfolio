import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";

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
  title: "Manthan Sankpal — Developer",
  description: "Portfolio of Manthan Sankpal, developer.",
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
