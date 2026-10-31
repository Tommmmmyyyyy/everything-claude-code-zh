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

export function Approach() {
  return (
    <section id="approche" aria-labelledby="approche-title" className="relative section-y bg-ink">
      <div className="container-x">
        <div className="flex items-center gap-4">
          <span className="label text-cream/50">(02)</span>
          <span className="label">Mon approche</span>
          <span className="rule-dashed flex-1" data-reveal="line" aria-hidden="true" />
        </div>

        <h2 id="approche-title" className="sr-only">
          Mon approche
        </h2>
        <p data-reveal="scrub-words" className="mt-14 max-w-[22ch] font-serif text-[clamp(2.3rem,5.6vw,6rem)] leading-[1] md:mt-20">
          Chaque cheval est unique. J&apos;interviens avec douceur et précision, à son rythme, pour préserver son confort, sa santé et sa relation au mors — et je prends le temps de vous expliquer chaque geste.
        </p>

        <ul className="mt-20 grid gap-10 md:mt-32 md:grid-cols-3 md:gap-0" data-reveal="stagger">
          {PILLARS.map((p, i) => (
            <li key={p.n} className={`relative md:px-8 ${i === 0 ? "md:pl-0" : ""}`}>
              {i > 0 && <span className="rule-dashed-v absolute inset-y-0 left-0 hidden md:block" aria-hidden="true" />}
              <div className="flex items-center justify-between">
                <span className="label text-cream/50">{p.n}</span>
                <svg viewBox="0 0 48 44" className="h-10 w-10 text-sand" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {p.icon}
                </svg>
              </div>
              <h3 className="heading-sm mt-8">{p.title}</h3>
              <p className="body mt-4 max-w-sm text-cream/70">{p.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
