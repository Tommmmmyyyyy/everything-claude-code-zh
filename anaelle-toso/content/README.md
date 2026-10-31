# Contenu du site

Tous les textes, images et réglages du site sont dans ce dossier, au format JSON.
Ils se modifient de deux façons :

- **dans l'espace d'administration** : `/keystatic` (voir le README principal) ;
- **à la main** : en éditant les fichiers ci-dessous, puis en publiant le changement.

Règle d'or : **ne jamais inventer d'information.** Un champ vide (`""`) s'affiche comme un
emplacement « À renseigner » (ou est masqué une fois `NEXT_PUBLIC_SHOW_PLACEHOLDERS=false`).

| Fichier | Contenu | À savoir |
| --- | --- | --- |
| `site.json` | Identité, coordonnées, réseaux, réservation, hero, camion, mentions légales, crédits | `booking.calendlyUrl` ou `booking.googleAppointmentUrl` : affiche l'agenda de réservation réel. Vides : seul le formulaire de demande est proposé, sans disponibilités. `hero.video` / `hero.image` : remplacent l'illustration du lever de soleil. `truck.image` : photo détourée du camion (PNG transparent, profil orienté vers la droite) qui remplace l'illustration dans le parcours. |
| `services.json` | Prestations, tarifs, note réglementaire | `provisional: true` affiche « Contenu à valider ». `image` remplace le schéma dentaire. `price` : texte libre (ex. « À partir de 80 € »). `diagram` : `exam`, `follow`, `tables`, `points`, `level`, `caps`, `wolf`, `advice`. |
| `story.json` | L'histoire d'Anaëlle | Tous les textes sont **provisoires** : les remplacer par le vrai parcours. Un texte qui commence par `[…]` est affiché comme provisoire. Ne mentionner que des qualifications réellement obtenues. |
| `process.json` | Les 7 étapes d'une intervention | `image` facultative. |
| `signs.json` | Signes à surveiller | `vet: true` : l'auto-observation recommande d'abord un avis vétérinaire. |
| `gallery.json` | Galerie | Déposer les photos dans `public/images/galerie/` puis renseigner `src` (ex. `/images/galerie/cheval-01.jpg`) et `alt`. Un `src` vide est un emplacement réservé. `layout` : `hero`, `tall`, `wide`, `square`. |
| `zone.json` | Zone d'intervention et carte | `main.lat` / `main.lng` / `main.radiusKm` : centre et rayon de la zone principale. Tant qu'ils sont absents, la carte affiche la France et un message d'attente. `cities` : villes desservies. `extended` : déplacements possibles sur demande. |
| `testimonials.json` | Témoignages | **Réels uniquement**, avec l'accord écrit de leurs auteurs. Jamais d'avis ni de note inventés. `reviewUrl` : lien pour laisser un avis (Google, Facebook…). |
| `faq.json` | Questions fréquentes | `provisional: true` : réponse à confirmer (pratique personnelle). Vérifier les réponses réglementaires sur Légifrance. |
| `social.json` | Galerie manuelle des réseaux | Utilisée si `INSTAGRAM_ACCESS_TOKEN` n'est pas configuré. Chaque publication renvoie vers son lien original. |
| `anatomy.json` | Explorateur anatomique | Textes pédagogiques. Ne pas modifier les `id` ni les `hotspot` (ils pilotent le schéma). Non géré par l'administration. |

## Exemple : renseigner la zone d'intervention

```json
"main": { "label": "Maine-et-Loire", "lat": 47.47, "lng": -0.55, "radiusKm": 60 },
"cities": [{ "name": "Angers", "lat": 47.47, "lng": -0.55 }],
"extended": [{ "name": "Sarthe", "lat": 48.0, "lng": 0.2, "radiusKm": 40 }]
```

## Exemple : ajouter un témoignage

```json
{ "name": "Camille", "horse": "Tornade", "text": "…", "image": "", "date": "2026-05", "source": "Google" }
```
