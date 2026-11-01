import type { Metadata } from "next";
import { processContent, site, zone } from "@/lib/content";
import { PageHero } from "@/components/ui/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { Booking } from "@/components/sections/Booking";
import { Process } from "@/components/sections/Process";
import { Zone } from "@/components/sections/Zone";

export const metadata: Metadata = {
  title: "Prendre rendez-vous",
  description: `Demande de rendez-vous avec ${site.identity.fullName}, ${site.identity.profession.toLowerCase()} basée à ${site.contact.addressLocality} : à l'écurie comme au pré, dans toute la Somme.`,
  alternates: { canonical: "/rendez-vous" },
};

export default function RendezVous() {
  return (
    <>
      <PageHero
        index="01"
        label="Rendez-vous"
        title={
          <>
            Prenons <em className="italic text-sand">rendez-vous.</em>
          </>
        }
        intro={
          <>
            Votre demande est transmise directement à Anaëlle, qui vous recontacte pour fixer ensemble la date. Un rendez-vous n&apos;est confirmé qu&apos;après sa réponse.
          </>
        }
        image="/images/galerie/ecurie-montagne.jpg"
        imagePosition="60% 45%"
        tone="forest"
      >
        <ButtonLink href="#rendez-vous" variant="cream">
          Remplir la demande
        </ButtonLink>
        {site.contact.phone && (
          <ButtonLink href={`tel:${site.contact.phone.replace(/\s/g, "")}`} variant="ghost">
            {`Appeler le ${site.contact.phoneDisplay || site.contact.phone}`}
          </ButtonLink>
        )}
      </PageHero>
      <Booking site={site} header={false} />
      <Process content={processContent} index="02" />
      <Zone zone={zone} index="03" />
    </>
  );
}
