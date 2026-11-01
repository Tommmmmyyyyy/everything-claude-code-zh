"use client";

import { useEffect, useRef, useState } from "react";
import { contactSchema, reviewSchema, CONTACT_SUBJECTS } from "@/lib/forms-schema";
import { issuesToErrors } from "@/lib/booking-schema";
import { DEMO, siteHref } from "@/lib/config";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; dev: boolean } | { kind: "error"; message: string };

/** Envoi commun : anti-spam (pot de miel, délai), simulation en mode démonstration. */
function useSender(url: string) {
  const startedAt = useRef(0);
  const [honey, setHoney] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);
  const send = async (data: unknown, onErrors: (e: Record<string, string>) => void) => {
    setStatus({ kind: "sending" });
    if (DEMO) {
      await new Promise((r) => setTimeout(r, 800));
      setStatus({ kind: "sent", dev: true });
      return;
    }
    try {
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data, meta: { website: honey, startedAt: startedAt.current } }) });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; dev?: boolean; message?: string; errors?: Record<string, string> };
      if (res.ok && json.ok) return setStatus({ kind: "sent", dev: !!json.dev });
      if (json.errors) onErrors(json.errors);
      setStatus({ kind: "error", message: json.message || "L'envoi n'a pas abouti. Merci de réessayer." });
    } catch {
      setStatus({ kind: "error", message: "Connexion impossible. Vérifiez votre réseau puis réessayez." });
    }
  };
  const honeypot = (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor={`${url}-website`}>Site web</label>
      <input id={`${url}-website`} tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} />
    </div>
  );
  return { send, status, setStatus, honeypot };
}

function Field({ id, label, error, optional, children }: { id: string; label: string; error?: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div className="field">
      <label htmlFor={id} className="field-label">
        {label}
        {optional && <span className="ml-2 normal-case tracking-normal text-cream/40">(facultatif)</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-err`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

function Sent({ title, text, dev, onReset }: { title: string; text: string; dev: boolean; onReset: () => void }) {
  return (
    <div role="status" className="animate-[fadeup_0.7s_var(--ease-expo)]">
      <p className="heading-sm">{title}</p>
      <p className="body mt-4 max-w-md text-cream/75">{text}</p>
      {dev && DEMO && <p className="mt-5"><span className="ph-tag">Démonstration — aucune donnée n&apos;a été envoyée</span></p>}
      <button type="button" onClick={onReset} className="label link-u mt-8 text-sand">
        Envoyer un autre message
      </button>
    </div>
  );
}

/* ── Formulaire de contact ── */
export function ContactForm() {
  const [d, setD] = useState({ name: "", email: "", phone: "", subject: "question", message: "", consent: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { send, status, setStatus, honeypot } = useSender("/api/contact");
  const set = (k: keyof typeof d, v: string | boolean) => {
    setD((x) => ({ ...x, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = contactSchema.safeParse(d);
    if (!r.success) {
      const errs = issuesToErrors(r.error.issues);
      setErrors(errs);
      document.getElementById(`c-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    send(r.data, setErrors);
  };
  if (status.kind === "sent")
    return <Sent title="Message envoyé, merci." text="Anaëlle vous répond rapidement, par e-mail ou par téléphone." dev={status.dev} onReset={() => { setD({ name: "", email: "", phone: "", subject: "question", message: "", consent: false }); setStatus({ kind: "idle" }); }} />;
  const inv = (k: string) => (errors[k] ? { "aria-invalid": true as const, "aria-describedby": `c-${k}-err` } : {});
  return (
    <form onSubmit={submit} noValidate className="relative grid gap-8" aria-label="Formulaire de contact">
      <div className="grid gap-8 sm:grid-cols-2">
        <Field id="c-name" label="Nom et prénom" error={errors.name}>
          <input id="c-name" className="field-input" autoComplete="name" value={d.name} onChange={(e) => set("name", e.target.value)} {...inv("name")} />
        </Field>
        <Field id="c-email" label="E-mail" error={errors.email}>
          <input id="c-email" type="email" className="field-input" autoComplete="email" value={d.email} onChange={(e) => set("email", e.target.value)} {...inv("email")} />
        </Field>
      </div>
      <div className="grid gap-8 sm:grid-cols-2">
        <Field id="c-phone" label="Téléphone" optional error={errors.phone}>
          <input id="c-phone" type="tel" className="field-input" autoComplete="tel" value={d.phone} onChange={(e) => set("phone", e.target.value)} {...inv("phone")} />
        </Field>
        <Field id="c-subject" label="Objet">
          <select id="c-subject" className="field-input" value={d.subject} onChange={(e) => set("subject", e.target.value)}>
            {CONTACT_SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field id="c-message" label="Message" error={errors.message}>
        <textarea id="c-message" rows={5} className="field-input" value={d.message} onChange={(e) => set("message", e.target.value)} {...inv("message")} />
      </Field>
      <label className="flex cursor-pointer items-start gap-4">
        <input id="c-consent" type="checkbox" checked={d.consent} onChange={(e) => set("consent", e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#d9c4a0]" {...inv("consent")} />
        <span className="text-[0.92rem] leading-relaxed text-cream/75">
          J&apos;accepte que ces informations soient transmises à Anaëlle Toso pour répondre à mon message.{" "}
          <a href={siteHref("/confidentialite")} className="underline underline-offset-4 hover:text-cream">
            Confidentialité
          </a>
        </span>
      </label>
      {errors.consent && <p id="c-consent-err" className="field-error -mt-5">{errors.consent}</p>}
      {honeypot}
      {status.kind === "error" && <p role="alert" className="rounded-[12px] border border-[#e08a6a]/40 bg-[#e08a6a]/10 p-4 text-[0.95rem] text-[#f6c2a8]">{status.message}</p>}
      <div>
        <button type="submit" className="btn btn-filled" disabled={status.kind === "sending"} aria-busy={status.kind === "sending"}>
          <span className="btn-label">
            <span>{status.kind === "sending" ? "Envoi…" : "Envoyer le message"}</span>
            <span aria-hidden="true">{status.kind === "sending" ? "Envoi…" : "Envoyer le message"}</span>
          </span>
        </button>
      </div>
    </form>
  );
}

/* ── Formulaire d'avis (modéré avant publication) ── */
export function ReviewForm() {
  const [d, setD] = useState({ firstName: "", horse: "", rating: 0, comment: "", email: "", consent: false });
  const [hover, setHover] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { send, status, setStatus, honeypot } = useSender("/api/avis");
  const set = (k: keyof typeof d, v: string | number | boolean) => {
    setD((x) => ({ ...x, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = reviewSchema.safeParse(d);
    if (!r.success) {
      const errs = issuesToErrors(r.error.issues);
      setErrors(errs);
      document.getElementById(`r-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    send(r.data, setErrors);
  };
  if (status.kind === "sent")
    return <Sent title="Merci pour votre avis !" text="Il sera relu par Anaëlle avant d'être publié sur le site." dev={status.dev} onReset={() => { setD({ firstName: "", horse: "", rating: 0, comment: "", email: "", consent: false }); setStatus({ kind: "idle" }); }} />;
  const inv = (k: string) => (errors[k] ? { "aria-invalid": true as const, "aria-describedby": `r-${k}-err` } : {});
  const shown = hover || d.rating;
  const labels = ["", "Décevant", "Moyen", "Bien", "Très bien", "Excellent"];
  return (
    <form onSubmit={submit} noValidate className="relative grid gap-8" aria-label="Laisser un avis">
      <div className="grid gap-8 sm:grid-cols-2">
        <Field id="r-firstName" label="Prénom" error={errors.firstName}>
          <input id="r-firstName" className="field-input" autoComplete="given-name" value={d.firstName} onChange={(e) => set("firstName", e.target.value)} {...inv("firstName")} />
        </Field>
        <Field id="r-horse" label="Nom de votre cheval" optional>
          <input id="r-horse" className="field-input" value={d.horse} onChange={(e) => set("horse", e.target.value)} />
        </Field>
      </div>
      <fieldset>
        <legend className="field-label">Votre note</legend>
        <div className="mt-3 flex items-center gap-4" onMouseLeave={() => setHover(0)}>
          <div id="r-rating" role="radiogroup" aria-label="Note sur 5" className="flex gap-1.5" tabIndex={-1}>
            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n} className="cursor-pointer" onMouseEnter={() => setHover(n)}>
                <input type="radio" name="rating" value={n} checked={d.rating === n} onChange={() => set("rating", n)} className="peer sr-only" aria-label={`${n} sur 5`} />
                <svg viewBox="0 0 20 20" className={`h-9 w-9 transition-transform duration-300 peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cream ${n <= shown ? "scale-110 text-sand" : "text-cream/30"}`} aria-hidden="true">
                  <path d="M10 1.6l2.5 5.3 5.8.7-4.3 4 1.1 5.7L10 14.5l-5.1 2.8 1.1-5.7-4.3-4 5.8-.7z" fill={n <= shown ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.1" />
                </svg>
              </label>
            ))}
          </div>
          <span className="label text-cream/60" aria-live="polite">{labels[shown]}</span>
        </div>
        {errors.rating && <p id="r-rating-err" className="field-error mt-2">{errors.rating}</p>}
      </fieldset>
      <Field id="r-comment" label="Votre avis" error={errors.comment}>
        <textarea id="r-comment" rows={5} className="field-input" placeholder="Comment s'est passée l'intervention ? Comment va votre cheval depuis ?" value={d.comment} onChange={(e) => set("comment", e.target.value)} {...inv("comment")} />
      </Field>
      <Field id="r-email" label="E-mail (jamais publié)" optional error={errors.email}>
        <input id="r-email" type="email" className="field-input" autoComplete="email" value={d.email} onChange={(e) => set("email", e.target.value)} {...inv("email")} />
      </Field>
      <label className="flex cursor-pointer items-start gap-4">
        <input id="r-consent" type="checkbox" checked={d.consent} onChange={(e) => set("consent", e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#d9c4a0]" {...inv("consent")} />
        <span className="text-[0.92rem] leading-relaxed text-cream/75">J&apos;accepte que mon prénom, le nom de mon cheval, ma note et mon avis soient publiés sur le site après validation.</span>
      </label>
      {errors.consent && <p id="r-consent-err" className="field-error -mt-5">{errors.consent}</p>}
      {honeypot}
      {status.kind === "error" && <p role="alert" className="rounded-[12px] border border-[#e08a6a]/40 bg-[#e08a6a]/10 p-4 text-[0.95rem] text-[#f6c2a8]">{status.message}</p>}
      <div>
        <button type="submit" className="btn btn-cream" disabled={status.kind === "sending"} aria-busy={status.kind === "sending"}>
          <span className="btn-label">
            <span>{status.kind === "sending" ? "Envoi…" : "Publier mon avis"}</span>
            <span aria-hidden="true">{status.kind === "sending" ? "Envoi…" : "Publier mon avis"}</span>
          </span>
        </button>
      </div>
    </form>
  );
}
