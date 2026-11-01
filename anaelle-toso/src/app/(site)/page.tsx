import { anatomy, faq, gallery, processContent, services, signs, site, social, story, testimonials, zone } from "@/lib/content";
import { SITE_URL } from "@/lib/config";
import { fetchInstagramPosts } from "@/lib/instagram";
import { Hero } from "@/components/sections/Hero";
import { Approach } from "@/components/sections/Approach";
import { TruckJourney } from "@/components/sections/TruckJourney";
import { Anatomy } from "@/components/sections/Anatomy";
import { Services } from "@/components/sections/Services";
import { Story } from "@/components/sections/Story";
import { Process } from "@/components/sections/Process";
import { Signs } from "@/components/sections/Signs";
import { Gallery } from "@/components/sections/Gallery";
import { Zone } from "@/components/sections/Zone";
import { Booking } from "@/components/sections/Booking";
import { Social } from "@/components/sections/Social";
import { Testimonials } from "@/components/sections/Testimonials";
import { Faq } from "@/components/sections/Faq";
import { ContactFinale } from "@/components/sections/ContactFinale";

export const revalidate = 3600;

function jsonLd() {
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
  if (area.length) business.areaServed = area;
  if (sameAs.length) business.sameAs = sameAs;
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.items
      .filter((i) => !i.provisional)
      .map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };
  return [business, faqLd];
}

export default async function Home() {
  const id = site.identity;
  const instagram = await fetchInstagramPosts(6);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()).replace(/</g, "\\u003c") }} />
      <Hero
        firstName={id.firstName}
        lastName={id.lastName}
        tagline={id.tagline}
        subtitle={id.subtitle}
        profession={id.profession}
        video={site.hero.video}
        image={site.hero.image}
        imageMobile={site.hero.imageMobile}
        imageAlt={site.hero.imageAlt}
      />
      <Approach />
      <TruckJourney livery={site.truck.livery} liverySub={site.truck.liverySub} truckImage={site.truck.image} truckImageAlt={site.truck.imageAlt} />
      <Anatomy content={anatomy} />
      <Services content={services} />
      <Story content={story} />
      <Process content={processContent} />
      <Signs content={signs} />
      <Gallery content={gallery} />
      <Zone zone={zone} />
      <Booking site={site} />
      <Social site={site} content={social} posts={instagram} />
      <Testimonials content={testimonials} site={site} />
      <Faq content={faq} />
      <ContactFinale site={site} zone={zone} />
    </>
  );
}
