import { faq, services, site, zone } from "@/lib/content";
import { SITE_URL } from "@/lib/config";

/** Données structurées de l'activité (schema.org). */
export function businessLd() {
  const sameAs = [site.social.instagram, site.social.facebook, site.social.tiktok].filter(Boolean);
  const area = zone.main.label ? [zone.main.label, ...zone.cities.map((c) => c.name)] : zone.cities.map((c) => c.name);
  const business: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: `${site.identity.fullName} — ${site.identity.profession}`,
    description: site.identity.seoDescription,
    url: SITE_URL,
    knowsAbout: ["Dentisterie équine", "Soins dentaires du cheval", "Pointes d'émail", "Dents de loup"],
    makesOffer: services.items.map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s.title } })),
  };
  if (site.contact.phone) business.telephone = site.contact.phone;
  if (site.contact.email) business.email = site.contact.email;
  if (site.contact.addressLocality) business.address = { "@type": "PostalAddress", addressLocality: site.contact.addressLocality, addressRegion: site.contact.region, addressCountry: "FR" };
  if (area.length) business.areaServed = area;
  if (sameAs.length) business.sameAs = sameAs;
  return business;
}

export function faqLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.items
      .filter((i) => !i.provisional)
      .map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };
}

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
