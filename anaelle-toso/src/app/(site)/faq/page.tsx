import type { Metadata } from "next";
import { faq, site } from "@/lib/content";
import { faqLd, JsonLd } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { Faq } from "@/components/sections/Faq";
import { PageCta } from "@/components/pages/PageCta";

export const metadata: Metadata = {
  title: "Questions fréquentes",
  description: `Dentisterie équine, soins, déroulement d'une intervention, rendez-vous et déplacements : les réponses d'${site.identity.fullName} à vos questions.`,
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqLd()} />
      <PageHero
        index="01"
        label="FAQ"
        title={faq.title}
        intro="Dentisterie équine, soins, déroulement, rendez-vous, déplacements : les questions que l'on me pose le plus souvent."
        image="/images/galerie/complicite-poney.jpg"
        imagePosition="40% 40%"
        tone="leather"
      />
      <Faq content={faq} />
      <PageCta
        index="02"
        title={
          <>
            Une autre <em className="italic text-sand">question&nbsp;?</em>
          </>
        }
        text="Écrivez-moi : je vous réponds personnellement."
        primary={{ href: "/contact", label: "Me contacter" }}
        secondary={{ href: "/rendez-vous", label: "Prendre rendez-vous" }}
      />
    </>
  );
}
