# TikTok Studio : vidéos explicatives argent & vie quotidienne

Générateur de vidéos verticales (1080 × 1920, 30 i/s) au format « explication chiffrée » :
fond sombre, objets 3D façon pâte à modeler, gros chiffres animés, graphiques, sous-titres
mot à mot, voix off française, musique et bruitages. Tout est produit localement, sans
banque d'images ni musique sous licence : la musique et les sons sont générés par le code.

## Vidéos incluses

- `videos/v1_cafe` : « Le vrai prix d'un café » (3 € par jour, sur 30 ans, à 5 %/an)
- `videos/v2_age` : « Léa et Hugo : commencer à 25 ou à 35 ans » (200 €/mois, 6 %/an)

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
Compter environ 10 minutes par vidéo de 90 secondes sur 4 cœurs.

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

- `{1 095 €|mille quatrevingt-quinze euros}` : le sous-titre affiche `1 095 €`, la voix lit la partie de droite.
- `{*30 ans|trente années}` ou `*mot` : mot mis en valeur (pastille verte) dans les sous-titres.
- `^repere` : crée un repère temporel au début du mot suivant, utilisable dans `scene.js` avec `cue('repere')`.
- `pause` : silence après la phrase, en secondes.

### Astuces de prononciation (voix Kokoro « ff_siwis »)

- Écrire `quatrevingt` en un mot (`quatrevingt-dix`, `quatrevingt-quinze`) : la forme
  avec trait d'union est mal prononcée.
- Préférer `trente années` à `trente ans` (la liaison est parfois avalée).
- Éviter les mots isolés très courts dans une phrase à part (`Non.`) : les intégrer à une phrase.

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
