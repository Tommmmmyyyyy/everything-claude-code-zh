# TikTok Studio : vidéos explicatives argent & vie quotidienne

Générateur de vidéos verticales (1080 × 1920, 30 ou 60 i/s) au format « explication chiffrée » :
fond sombre, objets 3D façon pâte à modeler, gros chiffres animés, graphiques, sous-titres
mot à mot, voix off française, musique et bruitages. Tout est produit localement, sans
banque d'images ni musique sous licence : la musique et les sons sont générés par le code.

## Vidéos incluses

- `videos/v1_cafe` : « Le vrai prix d'un café » (3 € par jour, sur 30 ans, à 5 %/an)
- `videos/v2_age` : « Sarah et Hugo : commencer à 25 ou à 35 ans » (200 €/mois, 6 %/an)
- `videos/v3_distributeur` : « Un distributeur automatique, ça rapporte combien ? »
- `videos/v4_loto` : « Le Loto chaque semaine pendant 40 ans, combien ça coûte ? »
- `videos/v05_pension_pre` à `videos/v14_regle72` : pension au pré, coût d'un cheval, studio étudiant,
  parking, Airbnb, micro-entreprise, food truck, millionnaire à 65 ans, top 1 %, règle des 72
- `videos/v15_credit25` à `videos/v24_an2000` (format long, 1 min 05 à 1 min 20) : crédit sur 25 ans,
  frais de notaire, Vinted, dropshipping, laverie, franchise de burgers, coût d'un enfant,
  panneaux solaires, smartphone en plusieurs fois, 100 € de l'an 2000

### Modèles d'animation (`lib/beats.js`)

- `stack` : éléments empilés qui apparaissent sur les repères de la voix (titres, chiffres, objets 3D, lignes).
- `waterfall` : du chiffre d'affaires à ce qu'il reste, charge par charge.
- `hbars` : comparaison en barres horizontales.
- `receipt` : ticket de caisse ligne par ligne, total et tampon.
- `splitbar` : barre de répartition (« où va votre argent ») avec légende et mise en avant.
- `chart` : courbes tracées en direct, avec étiquettes sur les repères.
- `cta` : question finale, avec un bouton « S'abonner » animé (`follow: 'repere'`).

## Installation (une seule fois)

```bash
./setup.sh
```

Il faut Python 3, Node.js 18+ et ffmpeg.

## Fabriquer une vidéo

```bash
./make.sh videos/v1_cafe out/cafe.mp4
AUDIO_ARGS="--seed 11 --root 48 --bpm 100" ./make.sh videos/v2_age out/age.mp4
```

Étapes : voix (`tts.py`), images (`render.js`), son (`audio.py`), encodage (`encode.sh`).
Compter environ 15 minutes par vidéo de 90 secondes sur 4 cœurs.

## Créer une nouvelle vidéo

1. Copier un dossier existant : `cp -r videos/v1_cafe videos/v3_mon_sujet`
2. Écrire le texte dans `script.json` (une entrée par phrase).
3. Adapter les animations dans `scene.js` (chaque séquence se cale sur des repères de la voix).
4. Lancer `./make.sh videos/v3_mon_sujet`.

Pour vérifier la mise en page sans tout rendre, générer quelques images fixes :

```bash
node render.js videos/v3_mon_sujet --stills 0,5,12.5
```

### Syntaxe du texte (`script.json`)

- `{90 €|quatre-vingt-dix euros}` : le sous-titre affiche `90 €`, la voix lit la partie de droite.
- `{*30 ans|trente ans}` ou `*mot` : mot mis en valeur (pastille verte) dans les sous-titres.
- `^repere` : crée un repère temporel au début du mot suivant, utilisable dans `scene.js` avec `cue('repere')`.
- `pause` : silence après la phrase, en secondes.

### Voix off

Par défaut : « fabien », une voix d'homme française très naturelle générée par Kyutai TTS 1.6B
(modèle sous licence CC BY 4.0, voix enregistrée par l'équipe Kyutai et publiée en CC0).
Le modèle tourne sur processeur : compter 3 à 4 minutes de calcul par vidéo de 90 secondes.

Autres voix possibles dans `script.json` : `"f1"` à `"f4"` (voix de femme Kyutai : f1 en CC0,
f2 à f4 issues de CML-TTS en CC BY 4.0), `"pierre"` ou `"tom"` (voix d'homme Piper, plus rapides
mais plus robotiques), `"siwis"` (voix de femme Kokoro).

### Utiliser une voix ElevenLabs (ou ta propre voix)

1. Coller le texte parlé de la vidéo dans ElevenLabs (une phrase par ligne), générer, télécharger le MP3.
2. Caler le texte sur l'audio, puis fabriquer la vidéo en 60 images/s :

```bash
python3 align_audio.py videos/v1_cafe/script.json voix.mp3 videos/v1_cafe/build
node render.js videos/v1_cafe --fps 60
python3 audio.py videos/v1_cafe
FPS=60 ./encode.sh videos/v1_cafe out/cafe.mp4
```

`align_audio.py` retrouve chaque mot dans l'audio (Whisper Turbo avec horodatage au mot) :
les sous-titres et les animations suivent exactement la voix enregistrée.

### Contrôle qualité automatique

Chaque phrase générée est réécoutée par une reconnaissance vocale (Whisper Turbo). Si la
transcription s'écarte du texte, ou si un nombre est mal entendu, la phrase est régénérée
(3 prises maximum) et la meilleure est gardée. Les prises sont mises en cache dans
`build/tts_cache` : seules les phrases modifiées sont recalculées.

### Astuces de texte

- Écrire les nombres en toutes lettres dans la partie parlée : `{1 000 €|mille euros}`.
- Éviter `mille quatre-vingt-quinze` (ambigu à l'oral) : préférer `plus de mille`.
- Choisir des prénoms qui passent bien : Sarah, Emma, Hugo, Thomas.
- Écouter chaque nouvelle vidéo en entier avant de la publier.

## Charte graphique

| Rôle | Couleur |
| --- | --- |
| Fond | vert très sombre `#081A14` |
| Argent qui grandit, placé | menthe `#2EE6A0` |
| Argent dépensé, versé | or `#F4B740` |
| Objets, étiquettes | crème `#F3ECDF` |
| Alerte, perte | corail `#FF5A4E` |

Polices (licence OFL) : Archivo (titres et chiffres), Inter Tight (sous-titres), JetBrains Mono (étiquettes).

## Rappel

Les chiffres présentés sont des simulations pédagogiques (rendement constant, avant frais et
impôts) et non des conseils en investissement. Chaque vidéo l'indique à l'écran.
