"use client";

import Image from "next/image";
import { Carousel } from "@/components/ui/Carousel";
import { siteAsset } from "@/lib/config";

export interface HorseSlide {
  src: string;
  alt: string;
  caption: string;
  position?: string;
}

/** Carrousel photographique immersif. */
export function HorsesCarousel({ slides, label = "Les chevaux" }: { slides: HorseSlide[]; label?: string }) {
  return (
    <Carousel label={label} itemClass="w-[84vw] sm:w-[58vw] lg:w-[38vw]">
      {slides.map((s) => (
        <figure key={s.src} className="group">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] bg-umber">
            <Image
              src={siteAsset(s.src)}
              alt={s.alt}
              fill
              sizes="(min-width: 1024px) 38vw, 84vw"
              className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-expo)] group-hover:scale-[1.05]"
              style={{ objectPosition: s.position ?? "50% 50%" }}
              draggable={false}
            />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/80 to-transparent" aria-hidden="true" />
            <figcaption className="absolute inset-x-5 bottom-5 font-serif text-[1.5rem] leading-tight">{s.caption}</figcaption>
          </div>
        </figure>
      ))}
    </Carousel>
  );
}
