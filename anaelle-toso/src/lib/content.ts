/**
 * Point d'entrée unique du contenu éditorial.
 * Les données vivent dans /content/*.json — modifiables à la main ou via l'espace d'administration.
 */
import siteJson from "@content/site.json";
import servicesJson from "@content/services.json";
import storyJson from "@content/story.json";
import processJson from "@content/process.json";
import signsJson from "@content/signs.json";
import galleryJson from "@content/gallery.json";
import zoneJson from "@content/zone.json";
import testimonialsJson from "@content/testimonials.json";
import faqJson from "@content/faq.json";
import socialJson from "@content/social.json";
import anatomyJson from "@content/anatomy.json";

export type Motif =
  | "horse"
  | "intervention"
  | "truck"
  | "tools"
  | "stable"
  | "pasture"
  | "road"
  | "portrait";

export type DiagramKey = "exam" | "follow" | "tables" | "points" | "level" | "caps" | "wolf" | "advice";

export interface SiteContent {
  identity: {
    firstName: string;
    lastName: string;
    fullName: string;
    profession: string;
    tagline: string;
    subtitle: string;
    seoDescription: string;
  };
  contact: {
    phone: string | null;
    phoneDisplay: string | null;
    email: string | null;
    addressLocality: string | null;
    region: string | null;
    hours: string | null;
  };
  social: {
    instagram: string | null;
    instagramHandle: string | null;
    facebook: string | null;
    tiktok: string | null;
  };
  booking: {
    calendlyUrl: string | null;
    googleAppointmentUrl: string | null;
    responseDelay: string | null;
  };
  hero: { video: string | null; image: string | null; imageMobile?: string | null; imageAlt: string };
  truck: { image: string | null; imageAlt: string; livery: string; liverySub: string };
  legal: {
    businessName: string | null;
    status: string | null;
    siret: string | null;
    address: string | null;
    publicationDirector: string | null;
    host: string | null;
    hostAddress: string | null;
    dataRetention: string | null;
    lastUpdate: string | null;
  };
  credits: { label: string; studio: string | null; url: string | null };
}

export interface Service {
  id: string;
  title: string;
  kicker: string;
  description: string;
  details: string[];
  diagram: DiagramKey;
  image: string | null;
  imageAlt: string;
  price: string | null;
}

export interface ServicesContent {
  provisional: boolean;
  title: string;
  intro: string;
  items: Service[];
  regulatoryNote: string;
  pricingNote: string | null;
}

export interface StoryChapter {
  id: string;
  label: string;
  title: string;
  text: string;
  image: string | null;
  hint: string;
  motif: Motif;
  caption?: string | null;
}

export interface StoryContent {
  provisional: boolean;
  title: string;
  intro: string;
  portrait: { image: string | null; alt: string; hint: string; caption?: string | null };
  chapters: StoryChapter[];
  quote: { text: string; author: string };
}

export interface ProcessStep {
  title: string;
  text: string;
  image: string | null;
  motif: string;
}

export interface ProcessContent {
  provisional: boolean;
  title: string;
  intro: string;
  steps: ProcessStep[];
}

export interface Sign {
  id: string;
  title: string;
  text: string;
  icon: string;
  vet: boolean;
}

export interface SignsContent {
  title: string;
  intro: string;
  items: Sign[];
  disclaimer: string;
}

export type GalleryLayout = "hero" | "wide" | "tall" | "square" | "landscape";

export interface GalleryItem {
  src: string | null;
  alt: string;
  category: string;
  layout: GalleryLayout;
  caption: string;
  motif: Motif;
}

export interface GalleryContent {
  title: string;
  intro: string;
  categories: { id: string; label: string }[];
  items: GalleryItem[];
}

export interface ZonePoint {
  name: string;
  lat: number;
  lng: number;
  radiusKm?: number;
}

export interface ZoneContent {
  title: string;
  intro: string;
  main: { label: string | null; baseLabel?: string | null; lat?: number | null; lng?: number | null; radiusKm?: number | null };
  cities: ZonePoint[];
  extended: ZonePoint[];
  travelNote: string | null;
  map: { defaultLat: number; defaultLng: number; defaultZoom: number; tileUrl: string; attribution: string };
}

export interface Testimonial {
  name: string;
  horse?: string | null;
  /** Note de 1 à 5 (facultative). */
  rating?: number | null;
  text: string;
  image?: string | null;
  date?: string | null;
  source?: string | null;
}

export interface TestimonialsContent {
  title: string;
  items: Testimonial[];
  reviewUrl: string | null;
}

export interface FaqContent {
  title: string;
  categories: { id: string; label: string }[];
  items: { q: string; a: string; provisional: boolean; category: string }[];
}

export interface SocialPost {
  image: string;
  caption: string;
  url: string;
  network: "instagram" | "facebook" | "tiktok";
  date?: string;
}

export interface SocialContent {
  title: string;
  intro: string;
  posts: SocialPost[];
}

export interface AnatomyItem {
  id: "incisives" | "premolaires" | "molaires" | "tables" | "pointes" | "surdents" | "dents-de-loup";
  title: string;
  short: string;
  text: string;
  detail: string;
  hotspot: [number, number];
}

export interface AnatomyContent {
  title: string;
  intro: string;
  note: string;
  items: AnatomyItem[];
}

/** Les champs vides saisis dans l'administration ("") sont traités comme absents (null). */
function nullify<T>(v: T): T {
  if (v === "") return null as T;
  if (Array.isArray(v)) return v.map(nullify) as T;
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, nullify(x)])) as T;
  return v;
}

/**
 * Typographie française : espaces insécables avant « ? ! ; : » et à l'intérieur des guillemets,
 * pour qu'aucune ponctuation ne se retrouve seule en début de ligne.
 */
export function frTypo(text: string) {
  return text
    .replace(/[ \u00A0]+([?!;])/g, "\u202F$1")
    .replace(/[ \u00A0]+(:)(?=\s|$)/g, "\u00A0$1")
    .replace(/«[ \u00A0]+/g, "«\u00A0")
    .replace(/[ \u00A0]+»/g, "\u00A0»");
}
function typo<T>(v: T): T {
  if (typeof v === "string") return frTypo(v) as T;
  if (Array.isArray(v)) return v.map(typo) as T;
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, typo(x)])) as T;
  return v;
}

export const site = typo(nullify(siteJson)) as unknown as SiteContent;
export const services = typo(nullify(servicesJson)) as unknown as ServicesContent;
export const story = typo(nullify(storyJson)) as unknown as StoryContent;
export const processContent = typo(nullify(processJson)) as unknown as ProcessContent;
export const signs = typo(signsJson) as unknown as SignsContent;
export const gallery = typo(nullify(galleryJson)) as unknown as GalleryContent;
export const zone = typo(nullify(zoneJson)) as unknown as ZoneContent;
export const testimonials = typo(nullify(testimonialsJson)) as unknown as TestimonialsContent;
export const faq = typo(faqJson) as unknown as FaqContent;
export const social = typo(nullify(socialJson)) as unknown as SocialContent;
export const anatomy = typo(anatomyJson) as unknown as AnatomyContent;

/** Pages du site (menu principal, menu plein écran, pied de page). */
export const navLinks = [
  { href: "/", label: "Accueil", sub: "Bienvenue à l'écurie", image: "/images/hero/paturage-contre-jour-large.jpg" },
  { href: "/mon-histoire", label: "Mon histoire", sub: "Mon parcours, ma passion", image: "/images/histoire/portrait-poney.jpg" },
  { href: "/prestations", label: "Mes prestations", sub: "Soins et anatomie", image: "/images/galerie/pas-dane-detail.jpg" },
  { href: "/rendez-vous", label: "Rendez-vous", sub: "Demande et réservation", image: "/images/galerie/ecurie-montagne.jpg" },
  { href: "/galerie", label: "Galerie", sub: "Chevaux, écuries, interventions", image: "/images/galerie/concours.jpg" },
  { href: "/faq", label: "FAQ", sub: "Vos questions, mes réponses", image: "/images/galerie/complicite-poney.jpg" },
  { href: "/contact", label: "Contact", sub: "Me joindre, laisser un avis", image: "/images/contact/cheval-pas-dane.jpg" },
] as const;

export const primaryNav = navLinks;

export function socialLinks() {
  const s = site.social;
  return [
    { id: "instagram", label: "Instagram", url: s.instagram },
    { id: "facebook", label: "Facebook", url: s.facebook },
    { id: "tiktok", label: "TikTok", url: s.tiktok },
  ] as const;
}
