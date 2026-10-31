import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <>
    <Header />
    <main id="contenu">
    <section className="container-x flex min-h-[100svh] flex-col justify-center pt-[var(--header-h)]">
      <p className="label text-cream/50">Erreur 404</p>
      <h1 className="display mt-8 max-w-3xl">
        Ce chemin ne mène à <em className="italic text-sand">aucune écurie.</em>
      </h1>
      <p className="body-lg mt-8 max-w-xl text-cream/70">La page demandée n&apos;existe pas ou a été déplacée.</p>
      <div className="mt-12">
        <Link href="/" className="btn btn-cream">
          <span className="btn-label">
            <span>Retour à l&apos;accueil</span>
            <span aria-hidden="true">Retour à l&apos;accueil</span>
          </span>
        </Link>
      </div>
    </section>
    </main>
    <Footer />
    </>
  );
}
