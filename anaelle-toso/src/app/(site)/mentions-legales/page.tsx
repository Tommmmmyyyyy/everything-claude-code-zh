import type { Metadata } from "next";
import { site } from "@/lib/content";
import { SITE_URL, siteHref } from "@/lib/config";
import { LegalBlock, LegalPage, V } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: `Mentions légales du site de ${site.identity.fullName}, ${site.identity.profession.toLowerCase()}.`,
  alternates: { canonical: "/mentions-legales" },
};

export default function MentionsLegales() {
  const l = site.legal;
  const c = site.contact;
  return (
    <LegalPage title="Mentions légales" updated={l.lastUpdate}>
      <LegalBlock title="Éditeur du site">
        <p>
          <V value={l.businessName ?? site.identity.fullName} label="Nom commercial" /> — {site.identity.profession}
        </p>
        <p>
          Statut : <V value={l.status} label="Statut juridique (ex. entrepreneur individuel)" />
          <br />
          SIRET : <V value={l.siret} label="Numéro SIRET" />
          <br />
          Adresse : <V value={l.address} label="Adresse professionnelle" />
        </p>
        <p>
          Téléphone : <V value={c.phoneDisplay ?? c.phone} label="Téléphone" />
          <br />
          E-mail : <V value={c.email} label="E-mail" />
        </p>
        <p>
          Directrice de la publication : <V value={l.publicationDirector} label="Directeur de la publication" />
        </p>
      </LegalBlock>

      <LegalBlock title="Hébergement">
        <p>
          <V value={l.host} label="Nom de l'hébergeur" />
          <br />
          <V value={l.hostAddress} label="Adresse et contact de l'hébergeur" />
        </p>
      </LegalBlock>

      <LegalBlock title="Activité réglementée">
        <p>
          L&apos;activité de technicien dentaire équin est encadrée par l&apos;article L.243-3 du Code rural et de la pêche maritime et ses textes d&apos;application. Les informations
          publiées sur ce site ont une vocation pédagogique et ne remplacent ni un examen, ni l&apos;avis d&apos;un vétérinaire.
        </p>
      </LegalBlock>

      <LegalBlock title="Propriété intellectuelle">
        <p>
          L&apos;ensemble des contenus de ce site (textes, photographies, illustrations, schémas, logo, mise en page) est protégé par le droit d&apos;auteur. Toute reproduction ou
          réutilisation, totale ou partielle, sans autorisation préalable écrite est interdite.
        </p>
        {site.credits.studio && (
          <p>
            Conception et développement : {site.credits.studio}
            {site.credits.url ? (
              <>
                {" "}
                — <a href={site.credits.url}>{site.credits.url}</a>
              </>
            ) : null}
          </p>
        )}
      </LegalBlock>

      <LegalBlock title="Données personnelles">
        <p>
          Le traitement des données transmises via le formulaire de demande de rendez-vous est détaillé dans la <a href={siteHref("/confidentialite")}>politique de confidentialité</a>.
        </p>
      </LegalBlock>

      <LegalBlock title="Liens et services tiers">
        <p>
          Le site peut contenir des liens vers des sites tiers (réseaux sociaux, service de réservation, fonds de carte OpenStreetMap). L&apos;éditeur n&apos;est pas responsable de leur
          contenu.
        </p>
        <p>Adresse du site : {SITE_URL}</p>
      </LegalBlock>
    </LegalPage>
  );
}
