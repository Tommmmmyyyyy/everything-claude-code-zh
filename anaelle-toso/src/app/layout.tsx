import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/content";
import { SITE_URL } from "@/lib/config";

const serif = Instrument_Serif({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const sans = Geist({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-geist",
  display: "swap",
});

const title = `${site.identity.fullName} — ${site.identity.profession}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: title, template: `%s — ${site.identity.fullName}` },
  description: site.identity.seoDescription,
  applicationName: site.identity.fullName,
  authors: [{ name: site.identity.fullName }],
  keywords: [
    "technicienne dentaire équine",
    "dentisterie équine",
    "dentiste équin",
    "soins dentaires cheval",
    "pointes d'émail",
    "dents de loup",
    "contrôle dentaire cheval",
    site.identity.fullName,
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: site.identity.fullName,
    title,
    description: site.identity.seoDescription,
  },
  twitter: { card: "summary_large_image", title, description: site.identity.seoDescription },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0d0a07",
  colorScheme: "dark",
};

/* Script minimal exécuté avant le rendu : active les révélations JS et saute le rideau déjà vu. */
const bootScript = `(function(){var d=document.documentElement;d.classList.add('js');try{if(sessionStorage.getItem('at-intro-seen')==='1')d.classList.add('intro-seen')}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
