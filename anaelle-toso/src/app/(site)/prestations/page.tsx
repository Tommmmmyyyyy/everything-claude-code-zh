import type { Metadata } from "next";
import { anatomy, services, signs, site } from "@/lib/content";
import { PageHero } from "@/components/ui/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { Anatomy } from "@/components/sections/Anatomy";
import { Signs } from "@/components/sections/Signs";
import { ServicesCarousel } from "@/components/home/ServicesCarousel";
import { ServiceSheets } from "@/components/pages/ServiceSheets";
import { PageCta } from "@/components/pages/PageCta";

export const metadata: Metadata = {
  title: "Mes prestations",
  description: `Examen de la dentition, entretien des tables dentaires, pointes d'émail, surdents, dents de loup : les soins proposés par ${site.identity.fullName}, dans le cadre des actes autorisés aux techniciens dentaires équins.`,
  alternates: { canonical: "/prestations" },
};

export default function Prestations() {
  return (
    <>
      <PageHero
        index="01"
        label="Mes prestations"
        title={
          <>
            Des soins pensés pour son <em className="italic text-sand">confort.</em>
          </>
        }
        intro={services.intro}
        image="/images/galerie/pas-dane-detail.jpg"
        imagePosition="50% 40%"
        tone="leather"
      >
        <ButtonLink href="#dentition" variant="cream">
          Explorer la bouche du cheval
        </ButtonLink>
        <ButtonLink href="#fiches" variant="ghost">
          Les fiches des soins
        </ButtonLink>
      </PageHero>

      <Anatomy content={anatomy} index="02" />

      <section id="fiches" aria-labelledby="fiches-title" className="relative overflow-hidden bg-ink pt-24 md:pt-36">
        <div className="container-x">
          <div className="flex items-center gap-4">
            <span className="label tabular-nums text-cream/50">(03)</span>
            <span className="label">Les soins, un par un</span>
            <span className="rule-dashed flex-1" data-reveal="line" aria-hidden="true" />
          </div>
          <h2 id="fiches-title" className="heading mt-10 max-w-4xl md:mt-14" data-reveal="lines">
            Choisissez un soin, <em className="italic text-sand">découvrez sa fiche.</em>
          </h2>
        </div>
        <div className="mt-12 md:mt-16">
          <ServicesCarousel content={services} linkBase="/prestations" />
        </div>
        <div className="mt-16 md:mt-24">
          <ServiceSheets content={services} />
        </div>
      </section>

      <Signs content={signs} index="04" />
      <PageCta
        index="05"
        title={
          <>
            Un contrôle à <em className="italic text-sand">prévoir ?</em>
          </>
        }
        text="Décrivez votre demande en quelques étapes : je vous recontacte pour convenir ensemble d'une date."
        primary={{ href: "/rendez-vous", label: "Demander un rendez-vous" }}
        secondary={{ href: "/faq", label: "Lire la FAQ" }}
      />
    </>
  );
}
