import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, EB_Garamond } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { site } from "@/content/site";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
const garamond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-garamond",
  display: "swap",
});

const description = `${site.name} (${site.shortName}) is the choir of ${site.church}, ${site.assembly}. ${site.mission}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} | ${site.church}, ${site.assembly}`, template: `%s | ${site.name}` },
  description,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: site.name,
    description,
    locale: "en_GH",
  },
  twitter: { card: "summary_large_image", title: site.name, description },
};

export const viewport: Viewport = { themeColor: "#670b20" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${garamond.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
