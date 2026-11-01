import Image from "next/image";
import type { StoryContent } from "@/lib/content";
import { ButtonLink } from "@/components/ui/Button";
import { siteAsset } from "@/lib/config";

/** Accueil : présentation d'Anaëlle, lien vers « Mon histoire ». */
export function AboutTeaser({ story, index = "04" }: { story: StoryContent; index?: string }) {
  return (
    <section aria-labelledby="qui-title" className="relative section-y overflow-clip bg-forest">
      <div className="container-x grid gap-12 md:grid-cols-12 md:items-end md:gap-6">
        <figure className="md:col-span-6">
          <div data-reveal="mask" className="relative aspect-[3/2] overflow-hidden rounded-[12px]">
            {story.portrait.image && (
              <div data-reveal-inner className="absolute inset-0">
                <Image src={siteAsset(story.portrait.image)} alt={story.portrait.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
              </div>
            )}
          </div>
          {story.portrait.caption && <figcaption className="micro mt-3 text-cream/45">{story.portrait.caption}</figcaption>}
        </figure>
        <div className="md:col-span-5 md:col-start-8">
          <div className="flex items-center gap-4">
            <span className="label text-cream/50">({index})</span>
            <span className="label">Qui suis-je</span>
            <span className="rule-dashed flex-1" data-reveal="line" aria-hidden="true" />
          </div>
          <h2 id="qui-title" className="heading mt-8" data-reveal="lines">
            Anaëlle, à l&apos;écoute de vos <em className="italic text-sand">chevaux.</em>
          </h2>
          <p className="body-lg mt-6 text-cream/80" data-reveal="up">
            {story.intro}
          </p>
          <blockquote className="mt-8 border-l border-dashed border-line-strong pl-5 font-serif text-[1.45rem] leading-snug text-cream/90" data-reveal="up" data-delay="0.1">
            « {story.quote.text} »
          </blockquote>
          <div className="mt-10" data-reveal="up" data-delay="0.15">
            <ButtonLink href="/mon-histoire" variant="ghost">
              Découvrir mon histoire
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
