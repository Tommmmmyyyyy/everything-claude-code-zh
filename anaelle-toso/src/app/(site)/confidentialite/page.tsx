import type { Metadata } from "next";
import { site } from "@/lib/content";
import { LegalBlock, LegalPage, V } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: `Politique de confidentialité et protection des données personnelles — ${site.identity.fullName}.`,
  alternates: { canonical: "/confidentialite" },
};

export default function Confidentialite() {
  const l = site.legal;
  const c = site.contact;
  return (
    <LegalPage title="Politique de confidentialité" updated={l.lastUpdate}>
      <LegalBlock title="Responsable du traitement">
        <p>
          <V value={l.businessName ?? site.identity.fullName} label="Nom" />, {site.identity.profession.toLowerCase()} — <V value={l.address} label="Adresse" />. Contact :{" "}
          <V value={c.email} label="E-mail" />.
        </p>
      </LegalBlock>

      <LegalBlock title="Données collectées">
        <p>
          Via le formulaire de demande de rendez-vous : nom et prénom, téléphone, adresse e-mail, informations sur le ou les chevaux (nom, âge, type, nombre, informations
          complémentaires), lieu d&apos;intervention (écurie, adresse, code postal, ville), type de demande, date et créneau souhaités, message libre.
        </p>
        <p>Seules les informations nécessaires au traitement de votre demande sont demandées. Merci de ne pas transmettre de données sensibles dans les champs libres.</p>
      </LegalBlock>

      <LegalBlock title="Finalité et base légale">
        <p>
          Les données sont utilisées uniquement pour répondre à votre demande, organiser le rendez-vous et assurer le suivi de la relation. Le traitement repose sur votre
          consentement, recueilli dans le formulaire, et sur l&apos;exécution de mesures précontractuelles prises à votre demande (article 6.1.a et 6.1.b du RGPD).
        </p>
      </LegalBlock>

      <LegalBlock title="Destinataires">
        <p>
          Les données sont transmises à {site.identity.fullName} uniquement. Elles transitent par des prestataires techniques nécessaires au fonctionnement du site (hébergeur,
          service d&apos;envoi d&apos;e-mails), tenus à la confidentialité. Elles ne sont ni vendues, ni cédées, ni utilisées à des fins publicitaires.
        </p>
        <p>
          Le site ne stocke pas les demandes dans une base de données : elles sont acheminées par e-mail{" "}
          <span className="text-cream/50">(ou vers l&apos;outil de suivi configuré par l&apos;éditrice)</span>.
        </p>
      </LegalBlock>

      <LegalBlock title="Durée de conservation">
        <p>
          <V value={l.dataRetention} label="Durée de conservation (ex. 3 ans à compter du dernier contact)" />
        </p>
      </LegalBlock>

      <LegalBlock title="Vos droits">
        <p>
          Conformément au RGPD et à la loi « Informatique et Libertés », vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de limitation,
          d&apos;opposition et de portabilité de vos données, ainsi que du droit de retirer votre consentement à tout moment. Pour exercer ces droits : <V value={c.email} label="E-mail" />.
        </p>
        <p>
          Vous pouvez également introduire une réclamation auprès de la CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>).
        </p>
      </LegalBlock>

      <LegalBlock title="Cookies et services tiers">
        <p>Ce site n&apos;utilise pas de cookie publicitaire ni d&apos;outil de mesure d&apos;audience.</p>
        <p>
          Certains services tiers ne sont chargés que lorsque vous les utilisez : l&apos;agenda de réservation en ligne (s&apos;il est proposé) ne s&apos;affiche qu&apos;après un clic,
          et la carte de la zone d&apos;intervention utilise les fonds de carte OpenStreetMap. Les publications Instagram éventuellement affichées sont des images hébergées par
          Meta ; un clic vous redirige vers Instagram.
        </p>
        <p>
          Une protection anti-spam (Cloudflare Turnstile) peut être utilisée lors de l&apos;envoi du formulaire afin de distinguer les humains des robots.
        </p>
      </LegalBlock>

      <LegalBlock title="Sécurité">
        <p>Le site est servi exclusivement en HTTPS. Le formulaire est protégé contre les envois automatisés et les abus (limitation du nombre d&apos;envois, contrôles côté serveur).</p>
      </LegalBlock>
    </LegalPage>
  );
}
