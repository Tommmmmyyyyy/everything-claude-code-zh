import type { StoryContent } from "@/lib/content";
import { SectionHeader, ProvisionalText } from "@/components/ui/SectionHeader";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { SHOW_PLACEHOLDERS } from "@/lib/config";

/** « Derrière chaque intervention, une passion. » — récit éditorial en chapitres. */
export function Story({ content, index = "06", header = true }: { content: StoryContent; index?: string; header?: boolean }) {
  return (
    <section id="histoire" aria-labelledby="histoire-title" className="theme-light relative section-y overflow-clip bg-ink">
      {header ? (
        <SectionHeader index={index} label="Mon histoire" title={content.title} provisional={content.provisional} titleId="histoire-title" align="left" />
      ) : (
        <h2 id="histoire-title" className="sr-only">
          {content.title}
        </h2>
      )}

      {/* Ouverture : portrait + introduction */}
      <div className={`container-x grid gap-10 md:grid-cols-12 md:gap-6 ${header ? "mt-16 md:mt-24" : ""}`}>
        <figure className={content.portrait.image ? "md:col-span-6 md:col-start-1" : "md:col-span-5 md:col-start-1"}>
          <div data-reveal="mask" className={`relative overflow-hidden rounded-[12px] ${content.portrait.image ? "aspect-[3/2]" : "aspect-[4/5]"}`}>
            <PhotoSlot
              src={content.portrait.image}
              alt={content.portrait.alt}
              motif="portrait"
              hint={content.portrait.hint}
              className="absolute inset-0"
              sizes="(min-width: 768px) 40vw, 100vw"
              innerProps={{ "data-reveal-inner": "" }}
            />
          </div>
          {content.portrait.caption && <figcaption className="micro mt-3 text-cream/45">{content.portrait.caption}</figcaption>}
        </figure>
        <div className="flex flex-col justify-end md:col-span-5 md:col-start-8">
          <p className="body-lg text-cream/85" data-reveal="up">
            <ProvisionalText text={content.intro} />
          </p>
          <figure className="mt-12 border-l border-dashed border-line-strong pl-6" data-reveal="up" data-delay="0.1">
            <blockquote className="font-serif text-[clamp(1.8rem,3vw,2.8rem)] leading-[1.05]">
              <ProvisionalText text={content.quote.text} />
            </blockquote>
            <figcaption className="label mt-5 text-cognac">{content.quote.author}</figcaption>
          </figure>
        </div>
      </div>

      {/* Chapitres */}
      <div className="container-x mt-24 grid gap-6 md:mt-40 md:grid-cols-12">
        <aside className="md:col-span-3">
          <nav aria-label="Chapitres de l'histoire" className="md:sticky md:top-[calc(var(--header-h)+40px)]">
            <p className="label text-cream/45">Chapitres</p>
            <ol className="mt-5 grid gap-2.5">
              {content.chapters.map((c, i) => (
                <li key={c.id}>
                  <a href={`#chapitre-${c.id}`} className="group flex items-baseline gap-3 text-cream/60 transition-colors hover:text-cream">
                    <span className="label tabular-nums text-cream/35">{String(i + 1).padStart(2, "0")}</span>
                    <span className="link-u">{c.label}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <div className="grid gap-24 md:col-span-9 md:gap-40">
          {content.chapters.map((c, i) => {
            const flip = i % 2 === 1;
            if (!c.image && !SHOW_PLACEHOLDERS) {
              // Chapitre sans photo : composition typographique
              return (
                <article key={c.id} id={`chapitre-${c.id}`} className="grid scroll-mt-28 gap-6 border-t border-dashed border-line-strong pt-10 md:grid-cols-9">
                  <p className="font-serif text-[clamp(5rem,11vw,10rem)] leading-[0.75] text-sand/25 md:col-span-3" aria-hidden="true" data-reveal="up">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <div className="md:col-span-6">
                    <p className="label text-sand" data-reveal="up">
                      {String(i + 1).padStart(2, "0")} — {c.label}
                    </p>
                    <h3 className="heading mt-5" data-reveal="lines">
                      {c.title}
                    </h3>
                    <p className="body-lg mt-6 max-w-2xl text-cream/75" data-reveal="up" data-delay="0.1">
                      <ProvisionalText text={c.text} />
                    </p>
                  </div>
                </article>
              );
            }
            return (
              <article key={c.id} id={`chapitre-${c.id}`} className="grid scroll-mt-28 gap-8 md:grid-cols-9 md:gap-6">
                <div className={`md:col-span-5 ${flip ? "md:order-2 md:col-start-5" : ""}`}>
                  <div data-reveal="mask" className={`relative overflow-hidden rounded-[12px] ${i % 3 === 0 ? "aspect-[4/5]" : i % 3 === 1 ? "aspect-[5/4]" : "aspect-square"}`}>
                    <PhotoSlot
                      src={c.image}
                      alt={c.title}
                      motif={c.motif}
                      hint={c.hint}
                      className="absolute inset-0"
                      sizes="(min-width: 768px) 38vw, 100vw"
                      innerProps={{ "data-reveal-inner": "" }}
                    />
                  </div>
                  {c.image && c.caption && <p className="micro mt-3 text-cream/45">{c.caption}</p>}
                </div>
                <div className={`flex flex-col justify-end md:col-span-4 ${flip ? "md:order-1 md:col-start-1" : ""}`}>
                  <p className="label text-sand" data-reveal="up">
                    {String(i + 1).padStart(2, "0")} — {c.label}
                  </p>
                  <h3 className="heading-sm mt-5" data-reveal="lines">
                    {c.title}
                  </h3>
                  <p className="body mt-5 text-cream/75" data-reveal="up" data-delay="0.1">
                    <ProvisionalText text={c.text} />
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
