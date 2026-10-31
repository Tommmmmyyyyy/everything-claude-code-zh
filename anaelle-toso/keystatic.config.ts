/**
 * Espace d'administration (Keystatic) — accessible sur /keystatic.
 * En local : modifie directement les fichiers /content/*.json.
 * En production : mode GitHub (chaque enregistrement crée un commit → redéploiement automatique).
 * Voir README, section « Espace d'administration ».
 */
import { config, fields, singleton } from "@keystatic/core";

const repo = process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO as `${string}/${string}` | undefined;
const pathPrefix = process.env.NEXT_PUBLIC_KEYSTATIC_PATH_PREFIX || undefined;

const img = (label: string, dir: string, description?: string) =>
  fields.image({ label, description, directory: `public/images/${dir}`, publicPath: `/images/${dir}/` });

const MOTIFS = [
  { label: "Cheval", value: "horse" },
  { label: "Intervention", value: "intervention" },
  { label: "Camion", value: "truck" },
  { label: "Matériel", value: "tools" },
  { label: "Écurie", value: "stable" },
  { label: "Pâture", value: "pasture" },
  { label: "Route", value: "road" },
  { label: "Portrait", value: "portrait" },
];

export default config({
  storage: repo ? { kind: "github", repo, pathPrefix } : { kind: "local" },
  ui: {
    brand: { name: "Anaëlle Toso — Administration" },
    navigation: {
      Général: ["site"],
      Contenus: ["services", "story", "process", "signs", "faq"],
      Médias: ["gallery", "social", "testimonials"],
      Territoire: ["zone"],
    },
  },
  singletons: {
    site: singleton({
      label: "Identité, coordonnées & intégrations",
      path: "content/site",
      format: { data: "json" },
      schema: {
        identity: fields.object(
          {
            firstName: fields.text({ label: "Prénom" }),
            lastName: fields.text({ label: "Nom" }),
            fullName: fields.text({ label: "Nom complet" }),
            profession: fields.text({ label: "Métier" }),
            tagline: fields.text({ label: "Accroche" }),
            subtitle: fields.text({ label: "Sous-titre", multiline: true }),
            seoDescription: fields.text({ label: "Description pour Google (≈ 155 caractères)", multiline: true }),
          },
          { label: "Identité" },
        ),
        contact: fields.object(
          {
            phone: fields.text({ label: "Téléphone (format international conseillé, ex. +33 6 12 34 56 78)" }),
            phoneDisplay: fields.text({ label: "Téléphone (affichage)" }),
            email: fields.text({ label: "E-mail" }),
            addressLocality: fields.text({ label: "Ville / secteur affiché" }),
            region: fields.text({ label: "Région" }),
            hours: fields.text({ label: "Horaires" }),
          },
          { label: "Coordonnées" },
        ),
        social: fields.object(
          {
            instagram: fields.text({ label: "Lien Instagram" }),
            instagramHandle: fields.text({ label: "Identifiant Instagram (sans @)" }),
            facebook: fields.text({ label: "Lien Facebook" }),
            tiktok: fields.text({ label: "Lien TikTok" }),
          },
          { label: "Réseaux sociaux" },
        ),
        booking: fields.object(
          {
            calendlyUrl: fields.text({ label: "Lien Calendly (réservation en ligne)" }),
            googleAppointmentUrl: fields.text({ label: "Lien de réservation Google Agenda" }),
            responseDelay: fields.text({ label: "Délai de réponse indicatif (ex. sous 48 h)" }),
          },
          { label: "Prise de rendez-vous" },
        ),
        hero: fields.object(
          {
            video: fields.text({ label: "Vidéo d'ouverture (chemin, ex. /images/hero/pature.mp4)" }),
            image: img("Photo d'ouverture", "hero"),
            imageAlt: fields.text({ label: "Description de la photo" }),
          },
          { label: "Ouverture (hero)" },
        ),
        truck: fields.object(
          {
            image: img("Photo détourée du camion (PNG transparent, profil vers la droite)", "camion"),
            imageAlt: fields.text({ label: "Description" }),
            livery: fields.text({ label: "Marquage principal (illustration)" }),
            liverySub: fields.text({ label: "Marquage secondaire" }),
          },
          { label: "Le camion" },
        ),
        legal: fields.object(
          {
            businessName: fields.text({ label: "Nom commercial / raison sociale" }),
            status: fields.text({ label: "Statut juridique" }),
            siret: fields.text({ label: "SIRET" }),
            address: fields.text({ label: "Adresse professionnelle" }),
            publicationDirector: fields.text({ label: "Directeur·rice de la publication" }),
            host: fields.text({ label: "Hébergeur" }),
            hostAddress: fields.text({ label: "Adresse de l'hébergeur" }),
            dataRetention: fields.text({ label: "Durée de conservation des données" }),
            lastUpdate: fields.text({ label: "Date de mise à jour des mentions" }),
          },
          { label: "Mentions légales" },
        ),
        credits: fields.object(
          {
            label: fields.text({ label: "Libellé" }),
            studio: fields.text({ label: "Studio" }),
            url: fields.text({ label: "Lien" }),
          },
          { label: "Crédits" },
        ),
      },
    }),

    services: singleton({
      label: "Prestations & tarifs",
      path: "content/services",
      format: { data: "json" },
      schema: {
        provisional: fields.checkbox({ label: "Liste encore à confirmer", defaultValue: true }),
        title: fields.text({ label: "Titre" }),
        intro: fields.text({ label: "Introduction", multiline: true }),
        items: fields.array(
          fields.object({
            id: fields.text({ label: "Identifiant (sans espace)" }),
            title: fields.text({ label: "Titre" }),
            kicker: fields.text({ label: "Sous-titre" }),
            description: fields.text({ label: "Description", multiline: true }),
            details: fields.array(fields.text({ label: "Point" }), { label: "Points clés", itemLabel: (p) => p.value }),
            diagram: fields.select({
              label: "Schéma affiché sans photo",
              defaultValue: "exam",
              options: [
                { label: "Examen", value: "exam" },
                { label: "Suivi", value: "follow" },
                { label: "Tables dentaires", value: "tables" },
                { label: "Pointes d'émail", value: "points" },
                { label: "Nivellement", value: "level" },
                { label: "Dents de lait", value: "caps" },
                { label: "Dents de loup", value: "wolf" },
                { label: "Conseils", value: "advice" },
              ],
            }),
            image: img("Photo", "prestations"),
            imageAlt: fields.text({ label: "Description de la photo" }),
            price: fields.text({ label: "Tarif (texte libre, ex. « À partir de 80 € »)" }),
          }),
          { label: "Prestations", itemLabel: (p) => p.fields.title.value },
        ),
        regulatoryNote: fields.text({ label: "Note réglementaire", multiline: true }),
        pricingNote: fields.text({ label: "Note sur les tarifs (déplacement, etc.)", multiline: true }),
      },
    }),

    story: singleton({
      label: "Mon histoire",
      path: "content/story",
      format: { data: "json" },
      schema: {
        provisional: fields.checkbox({ label: "Textes encore provisoires", defaultValue: true }),
        title: fields.text({ label: "Titre" }),
        intro: fields.text({ label: "Introduction", multiline: true }),
        portrait: fields.object(
          {
            image: img("Portrait", "histoire"),
            alt: fields.text({ label: "Description" }),
            hint: fields.text({ label: "Indication (si pas de photo)" }),
          },
          { label: "Portrait" },
        ),
        chapters: fields.array(
          fields.object({
            id: fields.text({ label: "Identifiant" }),
            label: fields.text({ label: "Étiquette" }),
            title: fields.text({ label: "Titre" }),
            text: fields.text({ label: "Texte", multiline: true }),
            image: img("Photo", "histoire"),
            hint: fields.text({ label: "Indication (si pas de photo)" }),
            motif: fields.select({ label: "Illustration de remplacement", defaultValue: "horse", options: MOTIFS }),
          }),
          { label: "Chapitres", itemLabel: (p) => p.fields.label.value },
        ),
        quote: fields.object({ text: fields.text({ label: "Citation", multiline: true }), author: fields.text({ label: "Auteur" }) }, { label: "Citation" }),
      },
    }),

    process: singleton({
      label: "Déroulement d'une intervention",
      path: "content/process",
      format: { data: "json" },
      schema: {
        provisional: fields.checkbox({ label: "Textes encore provisoires", defaultValue: true }),
        title: fields.text({ label: "Titre" }),
        intro: fields.text({ label: "Introduction", multiline: true }),
        steps: fields.array(
          fields.object({
            title: fields.text({ label: "Titre" }),
            text: fields.text({ label: "Texte", multiline: true }),
            image: img("Photo", "deroulement"),
            motif: fields.select({
              label: "Pictogramme",
              defaultValue: "advice",
              options: [
                { label: "Téléphone", value: "phone" },
                { label: "Calendrier", value: "calendar" },
                { label: "Camion", value: "truck" },
                { label: "Licol", value: "halter" },
                { label: "Examen", value: "exam" },
                { label: "Soin", value: "care" },
                { label: "Conseil", value: "advice" },
              ],
            }),
          }),
          { label: "Étapes", itemLabel: (p) => p.fields.title.value },
        ),
      },
    }),

    signs: singleton({
      label: "Signes à surveiller",
      path: "content/signs",
      format: { data: "json" },
      schema: {
        title: fields.text({ label: "Titre" }),
        intro: fields.text({ label: "Introduction", multiline: true }),
        items: fields.array(
          fields.object({
            id: fields.text({ label: "Identifiant" }),
            title: fields.text({ label: "Titre" }),
            text: fields.text({ label: "Texte", multiline: true }),
            icon: fields.select({
              label: "Pictogramme",
              defaultValue: "chew",
              options: [
                { label: "Mastication", value: "chew" },
                { label: "Aliments qui tombent", value: "drop-food" },
                { label: "Condition corporelle", value: "condition" },
                { label: "Mors", value: "bit" },
                { label: "Salivation", value: "saliva" },
                { label: "Haleine", value: "breath" },
                { label: "Fibres", value: "fibers" },
              ],
            }),
            vet: fields.checkbox({ label: "Recommander d'abord un avis vétérinaire" }),
          }),
          { label: "Signes", itemLabel: (p) => p.fields.title.value },
        ),
        disclaimer: fields.text({ label: "Avertissement", multiline: true }),
      },
    }),

    faq: singleton({
      label: "FAQ",
      path: "content/faq",
      format: { data: "json" },
      schema: {
        title: fields.text({ label: "Titre" }),
        items: fields.array(
          fields.object({
            q: fields.text({ label: "Question" }),
            a: fields.text({ label: "Réponse", multiline: true }),
            provisional: fields.checkbox({ label: "Réponse à confirmer" }),
          }),
          { label: "Questions", itemLabel: (p) => p.fields.q.value },
        ),
      },
    }),

    gallery: singleton({
      label: "Galerie",
      path: "content/gallery",
      format: { data: "json" },
      schema: {
        title: fields.text({ label: "Titre" }),
        intro: fields.text({ label: "Introduction", multiline: true }),
        categories: fields.array(fields.object({ id: fields.text({ label: "Identifiant" }), label: fields.text({ label: "Libellé" }) }), {
          label: "Catégories",
          itemLabel: (p) => p.fields.label.value,
        }),
        items: fields.array(
          fields.object({
            src: img("Photo", "galerie"),
            alt: fields.text({ label: "Description (accessibilité)" }),
            category: fields.select({
              label: "Catégorie",
              defaultValue: "chevaux",
              options: [
                { label: "Les chevaux", value: "chevaux" },
                { label: "Les interventions", value: "interventions" },
                { label: "Les écuries", value: "ecuries" },
                { label: "Le camion", value: "camion" },
                { label: "Le matériel", value: "materiel" },
                { label: "Les coulisses", value: "coulisses" },
              ],
            }),
            layout: fields.select({
              label: "Format",
              defaultValue: "square",
              options: [
                { label: "Grand portrait", value: "hero" },
                { label: "Portrait", value: "tall" },
                { label: "Paysage", value: "wide" },
                { label: "Carré", value: "square" },
              ],
            }),
            caption: fields.text({ label: "Légende" }),
            motif: fields.select({ label: "Illustration de remplacement", defaultValue: "horse", options: MOTIFS }),
          }),
          { label: "Photos", itemLabel: (p) => p.fields.caption.value || p.fields.alt.value },
        ),
      },
    }),

    social: singleton({
      label: "Réseaux sociaux (galerie manuelle)",
      path: "content/social",
      format: { data: "json" },
      schema: {
        title: fields.text({ label: "Titre" }),
        intro: fields.text({ label: "Introduction", multiline: true }),
        posts: fields.array(
          fields.object({
            image: img("Image", "instagram"),
            caption: fields.text({ label: "Légende", multiline: true }),
            url: fields.text({ label: "Lien vers la publication originale" }),
            network: fields.select({
              label: "Réseau",
              defaultValue: "instagram",
              options: [
                { label: "Instagram", value: "instagram" },
                { label: "Facebook", value: "facebook" },
                { label: "TikTok", value: "tiktok" },
              ],
            }),
            date: fields.text({ label: "Date (AAAA-MM-JJ)" }),
          }),
          { label: "Publications", itemLabel: (p) => p.fields.caption.value.slice(0, 40) || p.fields.url.value },
        ),
      },
    }),

    testimonials: singleton({
      label: "Témoignages (réels uniquement)",
      path: "content/testimonials",
      format: { data: "json" },
      schema: {
        title: fields.text({ label: "Titre" }),
        items: fields.array(
          fields.object({
            name: fields.text({ label: "Prénom du propriétaire" }),
            horse: fields.text({ label: "Nom du cheval" }),
            text: fields.text({ label: "Témoignage (avec l'accord écrit de son auteur)", multiline: true }),
            image: img("Photo du cheval", "avis"),
            date: fields.text({ label: "Date (ex. 2026-05)" }),
            source: fields.text({ label: "Source (ex. Google)" }),
          }),
          { label: "Témoignages", itemLabel: (p) => p.fields.name.value },
        ),
        reviewUrl: fields.text({ label: "Lien pour laisser un avis (Google, Facebook…)" }),
      },
    }),

    zone: singleton({
      label: "Zone d'intervention",
      path: "content/zone",
      format: { data: "json" },
      schema: {
        title: fields.text({ label: "Titre" }),
        intro: fields.text({ label: "Introduction", multiline: true }),
        main: fields.object(
          {
            label: fields.text({ label: "Nom de la zone principale (ex. Pays de la Loire)" }),
            lat: fields.number({ label: "Latitude du centre (ex. 47.47)", step: 0.0001 }),
            lng: fields.number({ label: "Longitude du centre (ex. -0.55)", step: 0.0001 }),
            radiusKm: fields.integer({ label: "Rayon (km)" }),
          },
          { label: "Zone principale" },
        ),
        cities: fields.array(
          fields.object({
            name: fields.text({ label: "Ville" }),
            lat: fields.number({ label: "Latitude", step: 0.0001 }),
            lng: fields.number({ label: "Longitude", step: 0.0001 }),
          }),
          { label: "Villes desservies", itemLabel: (p) => p.fields.name.value },
        ),
        extended: fields.array(
          fields.object({
            name: fields.text({ label: "Secteur" }),
            lat: fields.number({ label: "Latitude", step: 0.0001 }),
            lng: fields.number({ label: "Longitude", step: 0.0001 }),
            radiusKm: fields.integer({ label: "Rayon (km)" }),
          }),
          { label: "Déplacements possibles (sur demande)", itemLabel: (p) => p.fields.name.value },
        ),
        travelNote: fields.text({ label: "Précisions sur les déplacements", multiline: true }),
        map: fields.object(
          {
            defaultLat: fields.number({ label: "Latitude par défaut", step: 0.0001 }),
            defaultLng: fields.number({ label: "Longitude par défaut", step: 0.0001 }),
            defaultZoom: fields.integer({ label: "Zoom par défaut" }),
            tileUrl: fields.text({ label: "Fond de carte (URL des tuiles)" }),
            attribution: fields.text({ label: "Attribution du fond de carte" }),
          },
          { label: "Carte" },
        ),
      },
    }),
  },
});
