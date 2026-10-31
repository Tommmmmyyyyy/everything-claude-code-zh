import { Experience } from "@/components/providers/Experience";
import { Cursor } from "@/components/providers/Cursor";
import { Preloader } from "@/components/providers/Preloader";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a href="#contenu" className="sr-only-focusable label fixed left-4 top-4 z-[300] rounded-full bg-cream px-5 py-3 text-ink">
        Aller au contenu
      </a>
      <Preloader />
      <Header />
      <main id="contenu">{children}</main>
      <Footer />
      <Cursor />
      <Experience />
    </>
  );
}
