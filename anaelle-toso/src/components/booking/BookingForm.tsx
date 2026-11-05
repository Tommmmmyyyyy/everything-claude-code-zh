"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  bookingSchema,
  EQUID_TYPES,
  issuesToErrors,
  labelOf,
  REQUEST_TYPES,
  SLOTS,
  STEP_FIELDS,
  CONTACT_PREFS,
  type BookingInput,
} from "@/lib/booking-schema";
import { DEMO, TURNSTILE_SITE_KEY, siteHref } from "@/lib/config";

const STEPS = [
  { id: "request", label: "Votre demande" },
  { id: "owner", label: "Propriétaire" },
  { id: "horse", label: "Cheval" },
  { id: "location", label: "Localisation" },
  { id: "schedule", label: "Date souhaitée" },
  { id: "review", label: "Récapitulatif" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

const EMPTY: BookingInput = {
  request: { type: "premier-rdv" },
  owner: { fullName: "", phone: "", email: "", contactPref: "indifferent" },
  horse: { name: "", age: "", type: "cheval", count: 1, notes: "" },
  location: { stable: "", address: "", postalCode: "", city: "" },
  schedule: { preferredDate: "", slot: "indifferent", message: "" },
  consent: false as unknown as true,
};

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; dev: boolean } | { kind: "error"; message: string };

declare global {
  interface Window {
    turnstile?: { render: (el: HTMLElement, opts: Record<string, unknown>) => string; reset: (id?: string) => void };
  }
}

function get(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
}

export function BookingForm({ contactFallback }: { contactFallback: React.ReactNode }) {
  const [data, setData] = useState<BookingInput>(EMPTY);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [honey, setHoney] = useState("");
  const [token, setToken] = useState<string | undefined>();
  const startedAt = useRef<number>(0);
  const panel = useRef<HTMLDivElement>(null);
  const live = useRef<HTMLParagraphElement>(null);
  const turnstileEl = useRef<HTMLDivElement>(null);

  const info = data.request.type === "information";
  const current = STEPS[step].id as StepId;

  useEffect(() => {
    startedAt.current = Date.now();
    // Lien entrant : /rendez-vous?type=deplacement (ou premier-rdv, suivi, information)
    const type = new URLSearchParams(window.location.search).get("type");
    if (!type || !REQUEST_TYPES.some((r) => r.id === type)) return;
    // après l'hydratation : le rendu serveur ne connaît pas l'URL
    const id = requestAnimationFrame(() => setData((d) => ({ ...d, request: { type: type as BookingInput["request"]["type"] } })));
    return () => cancelAnimationFrame(id);
  }, []);

  /* Les liens [data-booking-type] du site présélectionnent le type de demande */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-booking-type]");
      const type = t?.dataset.bookingType;
      if (type && REQUEST_TYPES.some((r) => r.id === type)) {
        setData((d) => ({ ...d, request: { type: type as BookingInput["request"]["type"] } }));
        setStep(0);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  /* Turnstile (anti-spam optionnel) */
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || current !== "review" || !turnstileEl.current) return;
    const el = turnstileEl.current;
    const render = () => {
      if (window.turnstile && !el.dataset.rendered) {
        el.dataset.rendered = "1";
        window.turnstile.render(el, { sitekey: TURNSTILE_SITE_KEY, theme: "dark", language: "fr", callback: (t: string) => setToken(t) });
      }
    };
    if (window.turnstile) render();
    else if (!document.getElementById("cf-turnstile")) {
      const s = document.createElement("script");
      s.id = "cf-turnstile";
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.onload = render;
      document.head.appendChild(s);
    }
  }, [current]);

  const set = useCallback((path: string, value: unknown) => {
    setData((d) => {
      const [a, b] = path.split(".");
      if (!b) return { ...d, [a]: value } as BookingInput;
      return { ...d, [a]: { ...(d as unknown as Record<string, Record<string, unknown>>)[a], [b]: value } } as BookingInput;
    });
    setErrors((e) => {
      if (!e[path]) return e;
      const n = { ...e };
      delete n[path];
      return n;
    });
  }, []);

  /** Valide les champs d'une étape (les étapes suivantes ne bloquent pas). */
  const validateStep = useCallback(
    (id: StepId) => {
      const probe = id === "review" ? data : { ...data, consent: true as const };
      const r = bookingSchema.safeParse(probe);
      if (r.success) return {};
      const all = issuesToErrors(r.error.issues);
      const fields = id === "review" ? Object.keys(all) : STEP_FIELDS[id];
      return Object.fromEntries(Object.entries(all).filter(([k]) => fields.includes(k)));
    },
    [data],
  );

  const focusFirstError = (errs: Record<string, string>) => {
    const first = Object.keys(errs)[0];
    if (!first) return;
    requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus());
  };

  const goTo = (i: number) => {
    setStep(i);
    requestAnimationFrame(() => {
      panel.current?.querySelector<HTMLElement>("[data-step-title]")?.focus();
    });
  };

  const next = () => {
    const errs = validateStep(current);
    setErrors(errs);
    if (Object.keys(errs).length) {
      if (live.current) live.current.textContent = "Certains champs sont à compléter.";
      focusFirstError(errs);
      return;
    }
    goTo(Math.min(step + 1, STEPS.length - 1));
  };

  const back = () => goTo(Math.max(step - 1, 0));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (current !== "review") {
      next();
      return;
    }
    const errs = validateStep("review");
    setErrors(errs);
    if (Object.keys(errs).length) {
      // Revenir à la première étape concernée
      const idx = STEPS.findIndex((s) => Object.keys(errs).some((k) => STEP_FIELDS[s.id]?.includes(k)));
      if (idx >= 0 && STEPS[idx].id !== "review") goTo(idx);
      focusFirstError(errs);
      return;
    }
    if (TURNSTILE_SITE_KEY && !token) {
      setStatus({ kind: "error", message: "Merci de valider la vérification anti-spam." });
      return;
    }
    setStatus({ kind: "sending" });
    if (DEMO) {
      // Aperçu : le parcours est complet mais aucune donnée ne quitte la page.
      await new Promise((r) => setTimeout(r, 900));
      setStatus({ kind: "sent", dev: true });
      return;
    }
    try {
      const res = await fetch("/api/rendez-vous", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, meta: { website: honey, startedAt: startedAt.current, turnstileToken: token } }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; dev?: boolean; message?: string; errors?: Record<string, string> };
      if (res.ok && json.ok) {
        setStatus({ kind: "sent", dev: !!json.dev });
        requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>("[data-step-title]")?.focus());
        return;
      }
      if (json.errors) {
        setErrors(json.errors);
        const idx = STEPS.findIndex((s) => Object.keys(json.errors!).some((k) => STEP_FIELDS[s.id]?.includes(k)));
        if (idx >= 0) goTo(idx);
      }
      setStatus({ kind: "error", message: json.message || "Votre demande n'a pas pu être envoyée. Merci de réessayer." });
      if (TURNSTILE_SITE_KEY) window.turnstile?.reset();
    } catch {
      setStatus({ kind: "error", message: "Connexion impossible. Vérifiez votre réseau puis réessayez." });
    }
  };

  const reset = () => {
    setData(EMPTY);
    setErrors({});
    setStatus({ kind: "idle" });
    setStep(0);
    startedAt.current = Date.now();
  };

  const field = (path: string, label: string, opts: { type?: string; autoComplete?: string; placeholder?: string; optional?: boolean; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]; min?: string; max?: number } = {}) => {
    const id = `f-${path.replace(".", "-")}`;
    const err = errors[path];
    const value = get(data, path);
    return (
      <div className="field">
        <label htmlFor={id} className="field-label">
          {label}
          {opts.optional ? <span className="ml-2 normal-case tracking-normal text-cream/40">(facultatif)</span> : null}
        </label>
        <input
          id={id}
          name={path}
          type={opts.type ?? "text"}
          autoComplete={opts.autoComplete}
          inputMode={opts.inputMode}
          placeholder={opts.placeholder}
          min={opts.min}
          max={opts.max}
          className="field-input"
          value={String(value ?? "")}
          onChange={(e) => set(path, e.target.value)}
          aria-invalid={err ? true : undefined}
          aria-describedby={err ? `${id}-err` : undefined}
        />
        {err && (
          <p id={`${id}-err`} className="field-error">
            {err}
          </p>
        )}
      </div>
    );
  };

  const summary = useMemo(
    () => [
      { step: 0, title: "Demande", rows: [["Type", labelOf(REQUEST_TYPES, data.request.type)]] },
      {
        step: 1,
        title: "Propriétaire",
        rows: [
          ["Nom", data.owner.fullName],
          ["Téléphone", data.owner.phone],
          ["E-mail", data.owner.email],
          ["Recontact", labelOf(CONTACT_PREFS, String(data.owner.contactPref ?? "indifferent"))],
        ],
      },
      {
        step: 2,
        title: "Cheval",
        rows: [
          ["Nom", data.horse.name || "—"],
          ["Âge", data.horse.age || "—"],
          ["Type", labelOf(EQUID_TYPES, String(data.horse.type))],
          ["Nombre", String(data.horse.count)],
          ["Infos", data.horse.notes || "—"],
        ],
      },
      {
        step: 3,
        title: "Localisation",
        rows: [
          ["Écurie", data.location.stable || "—"],
          ["Adresse", [data.location.address, data.location.postalCode, data.location.city].filter(Boolean).join(", ") || "—"],
        ],
      },
      {
        step: 4,
        title: "Date souhaitée",
        rows: [
          [
            "Date",
            data.schedule.preferredDate
              ? new Date(data.schedule.preferredDate + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })
              : "Non précisée",
          ],
          ["Créneau", labelOf(SLOTS, String(data.schedule.slot))],
          ["Message", data.schedule.message || "—"],
        ],
      },
    ],
    [data],
  );

  const today = new Date().toISOString().slice(0, 10);

  if (status.kind === "sent") {
    return (
      <div ref={panel} className="rounded-[18px] border border-line bg-ink/40 p-8 md:p-14" role="status">
        <div className="animate-[fadeup_0.8s_var(--ease-expo)]">
          <svg viewBox="0 0 64 64" className="h-14 w-14 text-sand" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="32" cy="32" r="30" strokeOpacity="0.4" />
            <path d="M 20 33 L 28 41 L 45 23" className="[stroke-dasharray:40] [stroke-dashoffset:40] [animation:draw_1.2s_0.2s_var(--ease-expo)_forwards]" />
          </svg>
          <h3 data-step-title tabIndex={-1} className="heading mt-8 outline-none">
            Merci{data.owner.fullName ? `, ${String(data.owner.fullName).split(" ")[0]}` : ""}.
          </h3>
          <p className="body-lg mt-5 max-w-xl text-cream/80">
            Votre demande a bien été transmise à Anaëlle. Elle vous recontacte par téléphone ou par e-mail pour confirmer le rendez-vous avec vous.
          </p>
          <p className="mt-3 max-w-xl text-cream/60">Il ne s&apos;agit pas d&apos;une réservation automatique : aucun créneau n&apos;est bloqué tant qu&apos;Anaëlle ne vous a pas recontacté.</p>
          {status.dev && (
            <p className="mt-6">
              <span className="ph-tag">{DEMO ? "Démonstration — aucune donnée n\u2019a été envoyée" : "Mode développement — demande enregistrée dans .data/demandes.jsonl"}</span>
            </p>
          )}
          <button type="button" onClick={reset} className="btn btn-ghost mt-10">
            <span className="btn-label">
              <span>Faire une autre demande</span>
              <span aria-hidden="true">Faire une autre demande</span>
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid grid-cols-[minmax(0,1fr)] gap-10 md:grid-cols-12 md:gap-6" aria-label="Demande de rendez-vous">
      {/* Étapes */}
      <nav aria-label="Étapes du formulaire" className="min-w-0 md:col-span-4">
        <ol className="flex gap-2 overflow-x-auto pb-2 md:grid md:gap-0 md:overflow-visible" data-lenis-prevent>
          {STEPS.map((s, i) => {
            const done = i < step;
            const on = i === step;
            const skipped = info && (s.id === "horse" || s.id === "location");
            return (
              <li key={s.id} className="shrink-0 md:border-t md:border-dashed md:border-line-strong">
                <button
                  type="button"
                  disabled={i > step}
                  onClick={() => i < step && goTo(i)}
                  aria-current={on ? "step" : undefined}
                  className={`flex items-center gap-3 rounded-[22.5px] border px-3 py-2 text-left transition-colors md:w-full md:rounded-none md:border-0 md:px-0 md:py-4 ${
                    on ? "border-cream text-cream" : done ? "border-line-strong text-cream/75 hover:text-cream" : "border-line text-cream/35"
                  }`}
                >
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[11px] tabular-nums ${
                      on ? "border-cream bg-cream text-ink" : done ? "border-sand text-sand" : "border-line-strong"
                    }`}
                    aria-hidden="true"
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  <span className="label whitespace-nowrap">
                    {s.label}
                    {skipped && <span className="ml-2 text-cream/35 normal-case tracking-normal">(facultatif)</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="mt-8 hidden md:block">
          <p className="label text-cream/45">Vous préférez appeler ?</p>
          <div className="mt-2">{contactFallback}</div>
        </div>
      </nav>

      {/* Contenu de l'étape */}
      <div ref={panel} className="min-w-0 md:col-span-8">
        <div className="rounded-[18px] border border-line bg-ink/40 p-6 md:p-10">
          <p ref={live} className="sr-only" aria-live="polite" />
          <div key={current} className="animate-[fadeup_0.6s_var(--ease-expo)]">
            <p className="label text-sand">
              Étape {step + 1} / {STEPS.length}
            </p>
            <h3 data-step-title tabIndex={-1} className="heading-sm mt-3 outline-none">
              {
                {
                  request: "Que puis-je faire pour vous ?",
                  owner: "Faisons connaissance.",
                  horse: info ? "Votre cheval (facultatif)." : "Parlez-moi de votre cheval.",
                  location: info ? "Où se trouve-t-il ? (facultatif)" : "Où se trouve-t-il ?",
                  schedule: "Quand souhaitez-vous me voir ?",
                  review: "Vérifions ensemble.",
                }[current]
              }
            </h3>

            <div className="mt-10 grid gap-8">
              {current === "request" && (
                <fieldset>
                  <legend className="sr-only">Type de demande</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {REQUEST_TYPES.map((t) => {
                      const on = data.request.type === t.id;
                      return (
                        <label
                          key={t.id}
                          className={`group relative cursor-pointer rounded-[18px] border p-5 transition-colors duration-300 ${on ? "border-cream bg-cream/[0.06]" : "border-line-strong hover:border-cream/70"}`}
                        >
                          <input type="radio" name="request.type" value={t.id} checked={on} onChange={() => set("request.type", t.id)} className="peer sr-only" />
                          <span className={`absolute right-4 top-4 h-4 w-4 rounded-full border transition-colors peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-cream ${on ? "border-sand bg-sand" : "border-line-strong"}`} aria-hidden="true" />
                          <span className="block font-serif text-[1.55rem] leading-tight">{t.label}</span>
                          <span className="mt-2 block text-[0.9rem] text-cream/60">{t.hint}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              )}

              {current === "owner" && (
                <>
                  {field("owner.fullName", "Nom et prénom", { autoComplete: "name" })}
                  <div className="grid gap-8 sm:grid-cols-2">
                    {field("owner.phone", "Téléphone", { type: "tel", autoComplete: "tel", inputMode: "tel" })}
                    {field("owner.email", "Adresse e-mail", { type: "email", autoComplete: "email", inputMode: "email" })}
                  </div>
                  <fieldset className="field">
                    <legend className="field-label">Comment préférez-vous être recontacté&#8239;?</legend>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {CONTACT_PREFS.map((c) => {
                        const on = data.owner.contactPref === c.id;
                        return (
                          <label key={c.id} className={`label cursor-pointer rounded-[22.5px] border px-4 py-2.5 transition-colors ${on ? "border-cream bg-cream text-ink" : "border-line-strong hover:border-cream"}`}>
                            <input type="radio" name="owner.contactPref" value={c.id} checked={on} onChange={() => set("owner.contactPref", c.id)} className="sr-only" />
                            {c.label}
                          </label>
                        );
                      })}
                    </div>
                    <p className="mt-3 text-[0.88rem] text-cream/55">Anaëlle vous recontacte pour convenir ensemble de la date&nbsp;: aucun rendez-vous n&apos;est fixé automatiquement.</p>
                  </fieldset>
                </>
              )}

              {current === "horse" && (
                <>
                  <div className="grid gap-8 sm:grid-cols-2">
                    {field("horse.name", "Nom du cheval", { optional: info, placeholder: "Plusieurs chevaux ? Indiquez le premier" })}
                    {field("horse.age", "Âge", { optional: true, placeholder: "ex. 9 ans" })}
                  </div>
                  <div className="grid gap-8 sm:grid-cols-2">
                    <div className="field">
                      <label htmlFor="f-horse-type" className="field-label">
                        Type d&apos;équidé
                      </label>
                      <select id="f-horse-type" name="horse.type" className="field-input" value={String(data.horse.type)} onChange={(e) => set("horse.type", e.target.value)}>
                        {EQUID_TYPES.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {field("horse.count", "Nombre de chevaux concernés", { type: "number", inputMode: "numeric", min: "1", max: 50 })}
                  </div>
                  <div className="field">
                    <label htmlFor="f-horse-notes" className="field-label">
                      Informations complémentaires <span className="ml-2 normal-case tracking-normal text-cream/40">(facultatif)</span>
                    </label>
                    <textarea
                      id="f-horse-notes"
                      name="horse.notes"
                      rows={3}
                      className="field-input"
                      placeholder="Dernier contrôle, comportement observé, caractère…"
                      value={String(data.horse.notes ?? "")}
                      onChange={(e) => set("horse.notes", e.target.value)}
                    />
                  </div>
                </>
              )}

              {current === "location" && (
                <>
                  {field("location.stable", "Nom de l'écurie", { optional: true, autoComplete: "organization" })}
                  {field("location.address", "Adresse", { optional: info, autoComplete: "street-address" })}
                  <div className="grid gap-8 sm:grid-cols-[1fr_2fr]">
                    {field("location.postalCode", "Code postal", { optional: info, autoComplete: "postal-code", inputMode: "numeric" })}
                    {field("location.city", "Ville", { optional: info, autoComplete: "address-level2" })}
                  </div>
                </>
              )}

              {current === "schedule" && (
                <>
                  <p className="-mt-4 text-[0.95rem] text-cream/60">
                    Indiquez vos préférences : il ne s&apos;agit pas d&apos;une réservation. Anaëlle vous recontacte pour fixer le rendez-vous.
                  </p>
                  <div className="grid gap-8 sm:grid-cols-2">
                    {field("schedule.preferredDate", "Date souhaitée", { type: "date", optional: true, min: today })}
                    <fieldset className="field">
                      <legend className="field-label">Créneau souhaité</legend>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {SLOTS.map((s) => {
                          const on = data.schedule.slot === s.id;
                          return (
                            <label key={s.id} className={`label cursor-pointer rounded-[22.5px] border px-4 py-2.5 transition-colors ${on ? "border-cream bg-cream text-ink" : "border-line-strong hover:border-cream"}`}>
                              <input type="radio" name="schedule.slot" value={s.id} checked={on} onChange={() => set("schedule.slot", s.id)} className="sr-only" />
                              {s.label}
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                  </div>
                  <div className="field">
                    <label htmlFor="f-schedule-message" className="field-label">
                      Message <span className="ml-2 normal-case tracking-normal text-cream/40">(facultatif)</span>
                    </label>
                    <textarea
                      id="f-schedule-message"
                      name="schedule.message"
                      rows={3}
                      className="field-input"
                      value={String(data.schedule.message ?? "")}
                      onChange={(e) => set("schedule.message", e.target.value)}
                    />
                  </div>
                </>
              )}

              {current === "review" && (
                <>
                  <dl className="grid gap-6">
                    {summary
                      .filter((g) => !(info && (g.step === 2 || g.step === 3) && g.rows.every(([, v]) => !v || v === "—" || v === "Cheval" || v === "1")))
                      .map((g) => (
                        <div key={g.title} className="border-t border-dashed border-line-strong pt-4">
                          <div className="flex items-center justify-between">
                            <dt className="label text-cream/50">{g.title}</dt>
                            <button type="button" onClick={() => goTo(g.step)} className="label link-u text-sand">
                              Modifier
                            </button>
                          </div>
                          <dd className="mt-2 grid gap-1">
                            {g.rows.map(([k, v]) => (
                              <p key={k} className="grid grid-cols-[7rem_1fr] gap-3 text-[0.95rem]">
                                <span className="text-cream/45">{k}</span>
                                <span className="break-words text-cream/90">{v}</span>
                              </p>
                            ))}
                          </dd>
                        </div>
                      ))}
                  </dl>
                  <label className="flex cursor-pointer items-start gap-4">
                    <input
                      type="checkbox"
                      name="consent"
                      checked={data.consent === true}
                      onChange={(e) => set("consent", e.target.checked)}
                      className="mt-1 h-5 w-5 shrink-0 accent-[#7ef7c6]"
                      aria-invalid={errors.consent ? true : undefined}
                      aria-describedby={errors.consent ? "f-consent-err" : undefined}
                    />
                    <span className="text-[0.92rem] leading-relaxed text-cream/75">
                      J&apos;accepte que les informations saisies soient transmises à Anaëlle Toso pour traiter ma demande de rendez-vous. Elles ne sont ni revendues ni utilisées à d&apos;autres fins.{" "}
                      <a href={siteHref("/confidentialite")} className="underline underline-offset-4 hover:text-cream" target="_blank" rel="noopener">
                        Politique de confidentialité
                      </a>
                    </span>
                  </label>
                  {errors.consent && (
                    <p id="f-consent-err" className="field-error -mt-4">
                      {errors.consent}
                    </p>
                  )}
                  {TURNSTILE_SITE_KEY && <div ref={turnstileEl} className="min-h-[65px]" />}
                </>
              )}
            </div>

            {/* Pot de miel : invisible pour les humains */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label htmlFor="f-website">Site web</label>
              <input id="f-website" name="website" tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} />
            </div>

            {status.kind === "error" && (
              <div role="alert" className="mt-8 rounded-[18px] border border-[#e08a6a]/40 bg-[#e08a6a]/10 p-4 text-[0.95rem] text-[#f6c2a8]">
                {status.message}
                <div className="mt-2 text-cream/70">{contactFallback}</div>
              </div>
            )}

            <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
              {step > 0 ? (
                <button type="button" onClick={back} className="btn btn-ghost">
                  <span className="btn-label">
                    <span>Retour</span>
                    <span aria-hidden="true">Retour</span>
                  </span>
                </button>
              ) : (
                <span />
              )}
              <button type="submit" className="btn btn-filled" disabled={status.kind === "sending"} aria-busy={status.kind === "sending"}>
                <span className="btn-label">
                  <span>{current === "review" ? (status.kind === "sending" ? "Envoi en cours…" : "Envoyer la demande") : "Continuer"}</span>
                  <span aria-hidden="true">{current === "review" ? (status.kind === "sending" ? "Envoi en cours…" : "Envoyer la demande") : "Continuer"}</span>
                </span>
                <span className="btn-icon" aria-hidden="true">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1 5h8M5.5 1.5 9 5 5.5 8.5" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
