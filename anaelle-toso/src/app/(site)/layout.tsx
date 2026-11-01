import { Experience } from "@/components/providers/Experience";
import { Cursor } from "@/components/providers/Cursor";
import { Preloader } from "@/components/providers/Preloader";
import { PageCurtain } from "@/components/providers/PageCurtain";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DEMO } from "@/lib/config";

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a href="#contenu" className="sr-only-focusable label fixed left-4 top-4 z-[300] rounded-full bg-cream px-5 py-3 text-ink">
        Aller au contenu
      </a>
      <Preloader />
      <PageCurtain />
      <Header />
      <main id="contenu">{children}</main>
      <Footer />
      <Cursor />
      <Experience />
      {DEMO && (
        <p className="micro pointer-events-none fixed bottom-4 right-4 z-[140] rounded-full border border-cognac/60 bg-ink/85 px-3.5 py-2 text-cognac backdrop-blur-sm max-md:bottom-2 max-md:right-2 max-md:px-2 max-md:py-1 max-md:text-[8px] max-md:opacity-80">
          Prototype — version de travail
        </p>
      )}
    </>
  );
}
