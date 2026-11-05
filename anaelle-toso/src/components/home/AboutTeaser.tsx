import Image from "next/image";
import type { StoryContent } from "@/lib/content";
import { ButtonLink } from "@/components/ui/Button";
import { siteAsset } from "@/lib/config";

/** Accueil : présentation d'Anaëlle, lien vers « Mon histoire ». */
export function AboutTeaser({ story, index = "04", diploma }: { story: StoryContent; index?: string; diploma?: string | null }) {
  return (
    <section aria-labelledby="qui-title" className="relative section-y overflow-clip bg-forest">
      <div className="container-x grid gap-12 md:grid-cols-12 md:items-end md:gap-6">
        <figure className="md:col-span-6">
          <div data-reveal="mask" className="relative aspect-[3/2] overflow-hidden rounded-[18px]">
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
            <span className="label inline-flex h-6 items-center rounded-full border border-line-strong px-2.5 tabular-nums text-sand">{index}</span>
            <span className="label">Qui suis-je</span>
            <span className="relative h-px flex-1 bg-line" aria-hidden="true"><span className="absolute inset-0 origin-left bg-[linear-gradient(90deg,var(--color-cognac),transparent_70%)] opacity-70" data-reveal="line" /></span>
          </div>
          <h2 id="qui-title" className="heading mt-8" data-reveal="lines">
            Anaëlle, à l&apos;écoute de vos <em className="italic text-sand">chevaux.</em>
          </h2>
          {diploma && (
            <p className="mt-6 inline-flex items-center gap-3 rounded-full border border-line-strong px-4 py-2" data-reveal="up">
              <svg viewBox="0 0 20 20" className="h-4 w-4 text-sand" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
                <path d="M10 2.5 2.5 6.5 10 10.5l7.5-4L10 2.5Z" />
                <path d="M5.5 8.2v4.3c0 1.4 2 2.8 4.5 2.8s4.5-1.4 4.5-2.8V8.2M17.5 6.5v5" />
              </svg>
              <span className="label text-cream/85">{diploma}</span>
            </p>
          )}
          <p className="body-lg mt-6 text-cream/80" data-reveal="up">
            {story.intro}
          </p>
          <blockquote className="mt-8 border-l border-dashed border-line-strong pl-5 font-serif text-[1.45rem] leading-snug text-cream/90" data-reveal="up" data-delay="0.1">
            « {story.quote.text} »
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
