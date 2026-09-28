import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter_Tight } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/components/providers/AppProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Loader } from "@/components/ui/Loader";
import { Cursor } from "@/components/ui/Cursor";
import { Header } from "@/components/ui/Header";
import { ProjectTransition } from "@/components/ui/ProjectTransition";
import { site } from "@/data/site";

// Duo typographique contrasté : une serif élégante + une grotesque serrée
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif-display",
  display: "swap",
});

const grotesk = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-grotesk",
  display: "swap",
});

const fullName = `${site.firstName} ${site.lastName}`;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://williamrosset.fr"),
  title: { default: `${fullName} — Portfolio`, template: `%s — ${fullName}` },
  description: `${fullName}, ${site.role.toLowerCase()}. ${site.baseline}.`,
  openGraph: {
    title: `${fullName} — Portfolio`,
    description: site.baseline,
    type: "website",
    locale: "fr_FR",
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f5f1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${serif.variable} ${grotesk.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Aller au contenu
        </a>
        <AppProvider>
          <SmoothScroll>
            <Loader />
            <Header />
            <main id="main">{children}</main>
            <ProjectTransition />
            <Cursor />
            {/* Grain de film en overlay, purement décoratif */}
            <div className="grain" aria-hidden />
          </SmoothScroll>
        </AppProvider>
      </body>
    </html>
  );
}
