const PILLARS = [
  {
    n: "01",
    title: "Le confort d'abord",
    text: "Un examen attentif et des gestes mesurés, dans le respect du rythme et du tempérament de chaque cheval.",
    icon: (
      <path d="M 6 30 C 14 14, 34 14, 42 30 M 16 30 C 20 22, 28 22, 32 30 M 24 6 V 14" />
    ),
  },
  {
    n: "02",
    title: "Le geste juste",
    text: "Des soins réalisés dans le cadre des actes autorisés aux techniciens dentaires équins, avec un matériel adapté.",
    icon: <path d="M 6 38 L 34 10 M 30 6 L 42 18 M 10 30 L 18 38" />,
  },
  {
    n: "03",
    title: "La pédagogie",
    text: "Des explications claires après chaque visite, et des repères concrets pour suivre la santé dentaire de votre cheval.",
    icon: <path d="M 8 10 H 40 V 30 H 22 L 14 38 V 30 H 8 Z M 16 18 H 32 M 16 23 H 27" />,
  },
];

export function Approach({ index = "02" }: { index?: string }) {
  return (
    <section id="approche" aria-labelledby="approche-title" className="theme-light relative section-y bg-ink">
      <div className="container-x">
        <div className="flex items-center gap-4">
          <span className="label inline-flex h-6 items-center rounded-full border border-line-strong px-2.5 tabular-nums text-sand">{index}</span>
          <span className="label">Mon approche</span>
          <span className="relative h-px flex-1 bg-line" aria-hidden="true"><span className="absolute inset-0 origin-left bg-[linear-gradient(90deg,var(--color-cognac),transparent_70%)] opacity-70" data-reveal="line" /></span>
        </div>

        <h2 id="approche-title" className="sr-only">
          Mon approche
        </h2>
        <p data-reveal="scrub-words" className="mt-14 max-w-[26ch] font-serif text-[clamp(1.8rem,3.9vw,4.2rem)] font-light leading-[1.08] tracking-[-0.045em] md:mt-20">
          Chaque cheval est unique. J&apos;interviens avec douceur et précision, à son rythme, pour préserver son confort, sa santé et sa relation au mors — et je prends le temps de vous expliquer chaque geste.
        </p>

        <ul className="mt-20 grid gap-4 md:mt-28 md:grid-cols-3" data-reveal="stagger">
          {PILLARS.map((p) => (
            <li key={p.n} data-spotlight className="group relative overflow-hidden rounded-[20px] border border-line bg-ink-2 p-7 shadow-[0_30px_60px_-40px_rgb(4_19_12/0.35)] transition-[border-color,transform] duration-700 ease-[var(--ease-expo)] hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--color-cognac)_45%,transparent)] md:p-8">
              <span className="hud-corners pointer-events-none absolute inset-3 opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden="true" />
              <div className="flex items-center justify-between">
                <span className="label tabular-nums text-cream/45">{p.n}</span>
                <span className="grid h-14 w-14 place-items-center rounded-2xl border border-line bg-ink text-sand">
                  <svg viewBox="0 0 48 44" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {p.icon}
                  </svg>
                </span>
              </div>
              <h3 className="heading-sm mt-10">{p.title}</h3>
              <p className="body mt-4 max-w-sm text-cream/70">{p.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
