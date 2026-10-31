import Image from "next/image";
import type { SiteContent, SocialContent, SocialPost } from "@/lib/content";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { SHOW_PLACEHOLDERS } from "@/lib/config";

const NETWORKS = [
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "tiktok", label: "TikTok" },
] as const;

export function SocialIcon({ id, className = "h-5 w-5" }: { id: string; className?: string }) {
  if (id === "instagram")
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  if (id === "facebook")
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.6-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8.2v3h2.5V21h2.8Z" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M16.6 3c.3 2.2 1.6 3.6 3.9 3.8v2.6c-1.4.1-2.6-.3-3.9-1.1v5.1c0 6.4-7 8.4-9.8 3.8-1.8-3-.7-8.2 5.2-8.4v2.7c-.4.1-.9.2-1.3.3-1.3.4-2 1.3-1.8 2.8.4 2.8 5.5 3.6 5.1-1.9V3h2.6Z" />
    </svg>
  );
}

export function Social({ site, content, posts }: { site: SiteContent; content: SocialContent; posts: SocialPost[] | null }) {
  const list = (posts && posts.length ? posts : content.posts).slice(0, 6);
  const links = NETWORKS.map((n) => ({ ...n, url: site.social[n.id] }));
  const handle = site.social.instagramHandle;

  return (
    <section id="reseaux" aria-labelledby="reseaux-title" className="relative section-y bg-ink">
      <SectionHeader index="12" label="Réseaux" title={content.title} intro={content.intro} titleId="reseaux-title" />

      <div className="container-x mt-12 flex flex-wrap gap-3 md:mt-16">
        {links.map((l) =>
          l.url ? (
            <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" data-magnetic="0.2">
              <SocialIcon id={l.id} className="h-4 w-4" />
              <span className="btn-label">
                <span>{l.id === "instagram" && handle ? `@${handle}` : l.label}</span>
                <span aria-hidden="true">{l.id === "instagram" && handle ? `@${handle}` : l.label}</span>
              </span>
            </a>
          ) : (
            SHOW_PLACEHOLDERS && (
              <span key={l.id} className="ph-tag !px-4 !py-3">
                <SocialIcon id={l.id} className="h-3.5 w-3.5" /> {l.label} — lien à renseigner
              </span>
            )
          ),
        )}
      </div>

      {list.length > 0 ? (
        <ul className="container-x mt-12 grid grid-cols-2 gap-3 md:mt-16 md:grid-cols-3 md:gap-6">
          {list.map((p, i) => (
            <li key={p.url + i} data-reveal="up" data-delay={String((i % 3) * 0.06)}>
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="group block" data-cursor="Voir">
                <div className="relative aspect-square overflow-hidden rounded-[12px] bg-umber">
                  <Image
                    src={p.image}
                    alt={p.caption ? p.caption.slice(0, 120) : "Publication"}
                    fill
                    sizes="(min-width: 768px) 33vw, 50vw"
                    className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-expo)] group-hover:scale-105"
                  />
                  <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-ink/60 text-cream backdrop-blur-sm">
                    <SocialIcon id={p.network} className="h-4 w-4" />
                  </span>
                </div>
                {p.caption && <p className="mt-3 line-clamp-2 text-[0.9rem] text-cream/60">{p.caption}</p>}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        SHOW_PLACEHOLDERS && (
          <ul className="container-x mt-12 grid grid-cols-2 gap-3 md:mt-16 md:grid-cols-3 md:gap-6" aria-label="Emplacements de publications">
            {(["horse", "truck", "intervention", "stable", "tools", "pasture"] as const).map((m, i) => (
              <li key={m} data-reveal="up" data-delay={String((i % 3) * 0.06)}>
                <PhotoSlot src={null} alt="" motif={m} label="Publication à venir" className="aspect-square rounded-[12px]" />
              </li>
            ))}
          </ul>
        )
      )}
    </section>
  );
}
