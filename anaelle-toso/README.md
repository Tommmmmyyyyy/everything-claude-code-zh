# Anaëlle Toso — Technicienne dentaire équine

Site officiel, immersif et animé : récit du camion d'intervention, anatomie interactive de la
dentition, prestations, histoire, déroulement d'une visite, signes à surveiller, galerie, zone
d'intervention, demande de rendez-vous en plusieurs étapes, réseaux sociaux, avis, FAQ.

**Stack** : Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · GSAP 3.15
(ScrollTrigger, SplitText, Flip, DrawSVG) · Lenis · Zod · Leaflet · Keystatic (administration).

## Démarrer

```bash
npm install
cp .env.example .env.local   # facultatif en développement
npm run dev                  # http://localhost:3000
```

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` puis `npm start` | Version de production |
| `npm run typecheck` | Vérification TypeScript |
| `npm run lint` | ESLint (règles Next.js) |
| `npm test` | Tests unitaires du schéma de rendez-vous |
| `BASE_URL=http://localhost:3000 node tests/e2e.mjs` | Tests de bout en bout (Playwright) sur un serveur démarré |

En développement, sans canal d'envoi configuré, les demandes de rendez-vous sont enregistrées
dans `.data/demandes.jsonl` pour pouvoir tester le parcours.

## Direction artistique

« Chambre noire équestre » : un noir chaud, des verts de pâture, le cuir et le sable ; la crème
est la seule lumière. Titres en Instrument Serif, textes et étiquettes en Geist (capitales 500).
Filets pointillés, boutons en pilule, rayons limités à 12 / 22,5 / 36 px, aucune ombre portée.
Les jetons sont dans `src/app/globals.css` (`@theme`).

Les scènes (lever de soleil, route, écurie, pâture, crâne) sont des illustrations vectorielles
dessinées pour le site : elles restent cohérentes tant que les vraies photos ne sont pas
fournies, et chaque emplacement photo est clairement signalé.

## Architecture

```text
content/               Contenus éditables (JSON) — voir content/README.md
keystatic.config.ts    Schéma de l'espace d'administration
src/app/(site)/        Pages publiques (accueil, mentions légales, confidentialité)
src/app/api/rendez-vous  Réception sécurisée des demandes
src/app/keystatic/     Administration (/keystatic)
src/components/
  sections/            Une section = un fichier (Hero, TruckJourney, Anatomy…)
  illustrations/       Silhouettes, camion, décors, planches anatomiques
  booking/             Formulaire de rendez-vous en 6 étapes
  providers/           Défilement fluide, révélations, curseur, rideau d'ouverture
src/lib/               Contenu typé, schéma Zod, envoi d'e-mails, anti-spam, Instagram
tests/                 Tests unitaires et de bout en bout
```

Les révélations au défilement sont déclaratives : `data-reveal="lines|chars|words|up|mask|line|stagger|fade|scrub-words"`
et `data-parallax="0.15"` sur n'importe quel élément. Toutes les animations respectent
`prefers-reduced-motion` (pas d'épinglage, états finaux affichés, défilement natif).

## Mise en service : ce qu'il faut fournir

Rien n'a été inventé : chaque information manquante est un emplacement « À renseigner ».
Passer `NEXT_PUBLIC_SHOW_PLACEHOLDERS=false` au lancement masque ceux qui resteraient vides.

| À fournir | Où | Effet |
| --- | --- | --- |
| Téléphone, e-mail, réseaux | Administration → Identité (ou `content/site.json`) | Menu, contact, pied de page, données structurées |
| Statut, SIRET, adresse, hébergeur, durée de conservation | Identité → Mentions légales | Pages légales complètes |
| Liste des prestations confirmée, tarifs | Prestations & tarifs | Retire l'étiquette « Contenu à valider » |
| Histoire, formation, citation (textes réels) | Mon histoire | Remplace les textes provisoires |
| Zone principale, villes, déplacements | Zone d'intervention | Carte interactive tracée |
| Photos : hero, camion détouré, histoire, galerie, prestations | Champs « Photo » de l'administration (ou `public/images/…`) | Remplacent les illustrations et emplacements |
| Vidéo du hero (MP4, 10-20 s, sans son, < 6 Mo) | Identité → Ouverture | Remplace le lever de soleil illustré |
| Témoignages réels avec accord écrit | Témoignages | Carrousel d'avis |
| Réponses FAQ marquées « à confirmer » | FAQ | Retire l'étiquette |
| Canal d'envoi des demandes | Variables d'environnement | Voir ci-dessous |

**Camion** : déposer une photo détourée (PNG transparent, profil, orienté vers la droite,
environ 2 000 px de large) puis la renseigner dans Identité → Le camion. Elle remplace
l'illustration dans tout le parcours ; seule la rotation des roues est alors abandonnée.

**Réglementation** : les textes sur le cadre légal (article L.243-3 du Code rural et de la pêche
maritime, arrêté du 5 octobre 2011 modifié) sont à faire valider, puis à vérifier sur Légifrance
avant la mise en ligne. Le site présente comme vétérinaires la sédation, le diagnostic, la
prescription et les extractions autres que dents de lait et dents de loup.

## Prise de rendez-vous

Le formulaire (6 étapes, validation à chaque étape, récapitulatif modifiable, consentement RGPD)
envoie la demande à `/api/rendez-vous`, qui applique, dans l'ordre :

1. contrôle de l'origine de la requête et de la taille du corps ;
2. limitation de débit par adresse IP (5 demandes / 15 min) ;
3. pot de miel invisible et délai minimal de remplissage (4 s) ;
4. Cloudflare Turnstile si les clés sont fournies ;
5. validation Zod côté serveur (même schéma que le client) ;
6. transmission par **Resend**, **SMTP** et/ou **webhook** (au moins un canal requis en production).

Sans canal configuré en production, l'API répond « service non configuré » et le formulaire
affiche les coordonnées directes : aucune demande n'est perdue silencieusement. Les demandes ne
sont stockées dans aucune base : elles sont acheminées puis traitées par Anaëlle.

**Réservation en ligne** : renseigner `booking.calendlyUrl` (ou `googleAppointmentUrl`) dans
Identité → Prise de rendez-vous. L'agenda réel s'affiche au-dessus du formulaire, chargé
uniquement au clic (cookies tiers). Sans agenda, aucune disponibilité n'est affichée.

### Configurer l'envoi (exemple avec Resend)

1. Créer un compte Resend, vérifier le domaine du site.
2. Renseigner `RESEND_API_KEY`, `BOOKING_FROM` (adresse du domaine vérifié) et `BOOKING_TO`.
3. Redéployer, puis envoyer une demande test depuis le site.

Pour un suivi dans un tableur : `BOOKING_WEBHOOK_URL` vers un scénario Make / Zapier / n8n
(en-tête `X-Webhook-Secret` = `BOOKING_WEBHOOK_SECRET`).

## Réseaux sociaux

- **Liens** : Identité → Réseaux sociaux (menu, section réseaux, contact, pied de page).
- **Publications Instagram automatiques** : compte professionnel ou créateur, application Meta
  « Instagram API with Instagram Login », jeton longue durée dans `INSTAGRAM_ACCESS_TOKEN`
  (renouvelable tous les 60 jours). Mise en cache 1 h.
- **Sans jeton** : galerie manuelle (Administration → Réseaux sociaux), chaque publication
  renvoyant vers son lien d'origine.

## Espace d'administration

- **En local** : `npm run dev` puis <http://localhost:3000/keystatic> ; les modifications sont
  écrites dans `content/` et les images dans `public/images/`.
- **En production** : mode GitHub. Renseigner `NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO`
  (et `NEXT_PUBLIC_KEYSTATIC_PATH_PREFIX` si le site est dans un sous-dossier du dépôt), ouvrir
  `/keystatic` et suivre l'assistant qui crée l'application GitHub et fournit
  `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET` et
  `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`. Chaque enregistrement crée un commit et déclenche un
  redéploiement. Sans cette configuration, `/keystatic` répond 404 en production.

## Déploiement

Recommandé : Vercel (projet Next.js, dossier racine `anaelle-toso`). Renseigner les variables
d'environnement, puis le nom de domaine. Le site fonctionne aussi sur tout hébergeur Node.js
(`npm run build && npm start`).

Avant la mise en ligne : contenus validés, `NEXT_PUBLIC_SITE_URL` et un canal d'envoi
configurés, `NEXT_PUBLIC_SHOW_PLACEHOLDERS=false`, une demande test reçue.
