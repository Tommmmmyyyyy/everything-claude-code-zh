import { boot } from '../../lib/engine.js';
import { seq, stack, cta, at } from '../../lib/beats.js';

boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'APRÈS NOËL', y: 228, at: -1 },
    { kind: 'sprite', name: 'gift', cx: 540, by: 700, size: 460, at: -1, rot: -6 },
    { kind: 'head', html: 'UN CADEAU QUI NE<br>VOUS <span class="r">PLAÎT PAS</span> ?', y: 760, size: 100, at: -1 },
    { kind: 'chip', html: '37 % FINISSENT AU PLACARD', style: 'red', y: 1010, size: 50, at: 'placard', anim: 'stamp', sfx: 'stamp' },
  ], { sfxIn: false }) },
  { at: 'loop', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'DE L’ARGENT<br>À <span class="a">RÉCUPÉRER</span>', y: 300, size: 120, at: 'loop' },
    { kind: 'chip', html: 'AU BON MOMENT', style: 'gold', y: 600, size: 64, at: 'loop2', anim: 'stamp', sfx: 'stamp' },
    { kind: 'sprite', name: 'coinpile', cx: 540, by: 1120, size: 420, at: at('loop', .4) },
  ]) },
  { at: 'revendus', fn: (a, b) => stack(a, b, [
    { kind: 'num', html: '19<span class="u">%</span>', y: 280, size: 170, color: 'red', at: 'revendus' },
    { kind: 'mono', html: 'DES CADEAUX NON DÉSIRÉS SONT REVENDUS', y: 480, at: at('revendus', .4), color: 'cream' },
    { kind: 'num', html: '3 SUR 10', y: 560, size: 120, color: 'cream', at: 'ipsos' },
    { kind: 'mono', html: 'SE DISENT PRÊTS À LE FAIRE', y: 700, at: at('ipsos', .4) },
    { kind: 'num', html: '≈ 100<span class="u">€</span>', y: 780, size: 160, color: 'mint', at: 'cent' },
    { kind: 'mono', html: 'RÉCUPÉRÉS EN MOYENNE', y: 960, at: at('cent', .4), color: 'cream' },
  ], { foot: 'YOUGOV (NOVEMBRE 2026) · BAROMÈTRE RAKUTEN-IPSOS' }) },
  { at: 'moment', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'LE BON <span class="g">MOMENT</span>', y: 280, size: 110, at: 'moment' },
    { kind: 'num', html: '25 → 28 DÉC.', y: 420, size: 120, color: 'gold', at: 'm1' },
    { kind: 'row', icon: 'check', iconColor: 'mint', html: 'LES ACHETEURS', sub: 'CHERCHENT LES BONNES AFFAIRES', y: 600, h: 160, size: 48, at: 'm2' },
    { kind: 'row', icon: 'check', iconColor: 'mint', html: 'PRIX DU NEUF', sub: 'VOTRE CADEAU EST ENCORE RÉCENT', y: 780, h: 160, size: 48, at: 'm3' },
  ], { lab: ['01', 'QUAND VENDRE'] }) },
  { at: 'pic', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: '2ᵉ PIC : <span class="g">UN MOIS APRÈS</span>', y: 280, size: 84, at: 'pic' },
    { kind: 'mono', html: 'QUAND LES DÉLAIS DE RETOUR SONT DÉPASSÉS', y: 410, at: 'pic2', color: 'cream' },
    { kind: 'sprite', name: 'phone', cx: 540, by: 900, size: 420, at: 'tech' },
    { kind: 'chip', html: 'TECH : LE PRIX BAISSE CHAQUE SEMAINE', style: 'red', y: 960, size: 42, at: at('tech', .4), anim: 'stamp', sfx: 'stamp' },
  ]) },
  { at: 'astuce', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'MES <span class="a">ASTUCES</span>', y: 280, size: 110, at: 'astuce' },
    { kind: 'row', icon: 'box', iconColor: 'mint', html: 'EMBALLAGE D’ORIGINE', y: 450, h: 150, size: 48, at: 'a1' },
    { kind: 'row', icon: 'check', iconColor: 'mint', html: 'BELLES PHOTOS', y: 620, h: 150, size: 48, at: 'a2' },
    { kind: 'row', icon: 'minus', iconColor: 'gold', html: '20 À 30 % SOUS LE NEUF', y: 790, h: 150, size: 48, at: 'a3' },
    { kind: 'chip', html: 'EMBALLÉ : VENDU EN QUELQUES HEURES', style: 'gold', y: 990, size: 40, at: 'blister', anim: 'stamp', sfx: 'stamp' },
  ], { lab: ['02', 'BIEN VENDRE'] }) },
  { at: 'echange', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'D’ABORD : LE<br><span class="g">TICKET CADEAU</span>', y: 290, size: 104, at: 'echange' },
    { kind: 'row', icon: 'check', iconColor: 'mint', html: 'ÉCHANGE EN MAGASIN', sub: 'PLUS SIMPLE, SANS PERTE', y: 560, h: 170, size: 48, at: 'ech2' },
    { kind: 'sprite', name: 'shopbag', cx: 540, by: 1140, size: 360, at: at('ech2', .4) },
  ]) },
  { at: 'impots', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'ET LES <span class="g">IMPÔTS</span> ?', y: 290, size: 116, at: 'impots' },
    { kind: 'row', icon: 'check', iconColor: 'mint', html: 'VOS AFFAIRES PERSO', sub: 'PAS IMPOSABLES, SAUF GRANDE VALEUR', y: 500, h: 170, size: 48, at: 'imp2' },
    { kind: 'sprite', name: 'deed', cx: 540, by: 1120, size: 360, at: at('imp2', .4) },
  ]) },
  { at: 'sens', fn: (a, b) => stack(a, b, [
    { kind: 'sprite', name: 'gift', cx: 540, by: 700, size: 440, at: 'sens' },
    { kind: 'head', html: 'CE N’EST PAS UN MANQUE<br>DE <span class="a">RESPECT</span>', y: 760, size: 84, at: at('sens', .3) },
    { kind: 'mono', html: 'UN OBJET QUI SERT, PLUTÔT QU’UN PLACARD PLEIN', y: 960, at: 'sens2', color: 'cream' },
  ]) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'APRÈS NOËL', sprites: [{ name: 'gift', cx: 540, by: 900, size: 520 }], head: 'VOUS OSERIEZ REVENDRE UN<br>CADEAU DE VOTRE <span class="r">BELLE-MÈRE</span> ?', headY: 960, headSize: 74, follow: 'follow' }) },
]));
