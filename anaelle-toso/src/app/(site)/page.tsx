import { services, site, story, testimonials, zone } from "@/lib/content";
import { businessLd, JsonLd } from "@/lib/seo";
import { Hero } from "@/components/sections/Hero";
import { Approach } from "@/components/sections/Approach";
import { TruckJourney } from "@/components/sections/TruckJourney";
import { Testimonials } from "@/components/sections/Testimonials";
import { ContactFinale } from "@/components/sections/ContactFinale";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ButtonLink } from "@/components/ui/Button";
import { ServicesCarousel } from "@/components/home/ServicesCarousel";
import { AboutTeaser } from "@/components/home/AboutTeaser";
import { MouthJourney } from "@/components/home/MouthJourney";

export default function Home() {
  const id = site.identity;
  return (
    <>
      <JsonLd data={businessLd()} />
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
      <Approach index="02" />

      <section id="soins" aria-labelledby="soins-title" className="relative section-y overflow-hidden bg-ink">
        <SectionHeader index="03" label="Prestations" title={services.title} intro="Faites défiler les soins : chaque carte ouvre sa fiche détaillée." titleId="soins-title" />
        <div className="mt-14 md:mt-20">
          <ServicesCarousel
            content={services}
            aside={
              <ButtonLink href="/prestations" variant="ghost">
                Toutes les prestations
              </ButtonLink>
            }
          />
        </div>
      </section>

      <AboutTeaser story={story} index="04" />
      <TruckJourney index="05" livery={site.truck.livery} liverySub={site.truck.liverySub} truckImage={site.truck.image} truckImageAlt={site.truck.imageAlt} />
      <MouthJourney index="06" />
      <Testimonials content={testimonials} index="07" />
      <ContactFinale site={site} zone={zone} index="08" />
    </>
  );
}
