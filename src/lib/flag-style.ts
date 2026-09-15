/**
 * WAB-TKD — Flag assets + flag display style.
 *
 * TWO bundled flag sets ship with the app (both fully offline — a venue's
 * public screen must never depend on the internet):
 *
 *   'standard' : src/assets/flags-standard  — 144×108 PNG, every flag
 *                normalized to the same size. Best for lists, dropdowns,
 *                brackets and anywhere flags sit in a grid, because every
 *                flag occupies exactly the same box.
 *   'hd'       : src/assets/flags-hd        — high-resolution PNG kept at
 *                each flag's true aspect ratio. Best for broadcast
 *                overlays, player-call and winner animations where the
 *                flag is rendered large.
 *   'svg'      : the bundled flag-icons vector set — infinitely scalable,
 *                used as an automatic fallback so a country is never blank.
 *
 * The resolver below always falls through standard → hd → svg (in whatever
 * order the chosen set implies), so a missing file in one set can never
 * produce an empty flag on air.
 */

import { findCountry, toIso2 } from './countries';

// ---------------------------------------------------------------------------
// Bundled assets
// ---------------------------------------------------------------------------

const STANDARD_ASSETS = import.meta.glob('../assets/flags-standard/*.png', {
  eager: true, query: '?url', import: 'default',
}) as Record<string, string>;

const HD_ASSETS = import.meta.glob('../assets/flags-hd/*.png', {
  eager: true, query: '?url', import: 'default',
}) as Record<string, string>;

// Legacy hand-placed SVGs (gb/ma/tr) — kept so nothing that referenced them
// before changes appearance.
const LEGACY_SVG_ASSETS = import.meta.glob('../assets/flags/*.svg', {
  eager: true, query: '?url', import: 'default',
}) as Record<string, string>;

// Full ISO coverage vector fallback from the flag-icons package.
const PACKAGE_SVG_ASSETS = import.meta.glob('/node_modules/flag-icons/flags/4x3/*.svg', {
  eager: true, query: '?url', import: 'default',
}) as Record<string, string>;

function lookup(map: Record<string, string>, prefix: string, file: string, ext: string): string {
  return map[`${prefix}/${file}.${ext}`] || '';
}

/** URL of the 144×108 normalized PNG for a country, or '' if absent. */
export function standardFlagUrl(input: string): string {
  const c = findCountry(input);
  return c ? lookup(STANDARD_ASSETS, '../assets/flags-standard', c.file, 'png') : '';
}

/** URL of the high-resolution PNG for a country, or '' if absent. */
export function hdFlagUrl(input: string): string {
  const c = findCountry(input);
  return c ? lookup(HD_ASSETS, '../assets/flags-hd', c.file, 'png') : '';
}

/** URL of the vector (SVG) flag for a country, or '' if absent. */
export function svgFlagUrl(input: string): string {
  const c = findCountry(input);
  if (!c) return '';
  // The home nations (ENG/SCT/WLS/NIR) have no ISO SVG — they only exist in
  // the PNG sets, so this correctly returns '' and the resolver falls back.
  const iso = c.iso2.toLowerCase();
  return lookup(LEGACY_SVG_ASSETS, '../assets/flags', iso, 'svg')
    || lookup(PACKAGE_SVG_ASSETS, '/node_modules/flag-icons/flags/4x3', iso, 'svg');
}

// ---------------------------------------------------------------------------
// Style model
// ---------------------------------------------------------------------------

export type FlagSet = 'standard' | 'hd' | 'svg';
export type FlagShape = 'rectangle' | 'rounded' | 'circle' | 'square';

export interface FlagStyle {
  /** Which bundled image set to prefer. */
  set: FlagSet;
  /** How the flag is cut out. */
  shape: FlagShape;
  /** Thin outline — keeps white flags (JPN, KOR…) readable on white. */
  border: boolean;
  /** Drop shadow, as used by the broadcast overlays. */
  shadow: boolean;
}

// NOTE: these defaults are chosen so that a fresh install renders EXACTLY
// like the app did before the flag system was added (rectangular, no
// outline, soft shadow). Nothing about the existing broadcast overlays
// moves or changes until the operator deliberately picks another style.
export const DEFAULT_FLAG_STYLE: FlagStyle = {
  set: 'standard',
  shape: 'rectangle',
  border: false,
  shadow: true,
};

export const FLAG_SETS: { value: FlagSet; en: string; ar: string; fr: string; hint: { en: string; ar: string; fr: string } }[] = [
  {
    value: 'standard', en: 'Standard 144×108', ar: 'قياسي 144×108', fr: 'Standard 144×108',
    hint: {
      en: 'Every flag the same size — best for lists, brackets and dropdowns.',
      ar: 'كل الأعلام بنفس المقاس — الأفضل للقوائم والجداول ولوائح الاختيار.',
      fr: 'Tous les drapeaux à la même taille — idéal pour les listes et tableaux.',
    },
  },
  {
    value: 'hd', en: 'HD (true ratio)', ar: 'عالي الدقة (النسبة الأصلية)', fr: 'HD (ratio réel)',
    hint: {
      en: 'High resolution, each flag keeps its real proportions — best on the broadcast/public screen.',
      ar: 'دقة عالية، كل علم يحتفظ بنسبته الحقيقية — الأفضل لشاشة البث والجمهور.',
      fr: 'Haute résolution, proportions réelles — idéal pour l’écran public/diffusion.',
    },
  },
  {
    value: 'svg', en: 'Vector (SVG)', ar: 'متجهي (SVG)', fr: 'Vectoriel (SVG)',
    hint: {
      en: 'Scales to any size with no blur — lightest option.',
      ar: 'يتكبر لأي مقاس دون تشويش — الخيار الأخف.',
      fr: 'S’agrandit sans flou — l’option la plus légère.',
    },
  },
];

export const FLAG_SHAPES: { value: FlagShape; en: string; ar: string; fr: string }[] = [
  { value: 'rectangle', en: 'Rectangle', ar: 'مستطيل', fr: 'Rectangle' },
  { value: 'rounded', en: 'Rounded', ar: 'زوايا دائرية', fr: 'Arrondi' },
  { value: 'circle', en: 'Circle', ar: 'دائري', fr: 'Cercle' },
  { value: 'square', en: 'Square', ar: 'مربع', fr: 'Carré' },
];

/** height ÷ width for a shape. 0.66 matches the ratio every existing
 *  broadcast overlay was designed around — changing it would move flags
 *  inside animations that are already positioned to the pixel. */
export function shapeAspect(shape: FlagShape): number {
  return shape === 'circle' || shape === 'square' ? 1 : 0.66;
}

export function shapeRadius(shape: FlagShape, width: number): string {
  switch (shape) {
    case 'circle': return '50%';
    case 'rounded': return `${Math.max(2, Math.round(width * 0.14))}px`;
    case 'square': return `${Math.max(2, Math.round(width * 0.08))}px`;
    default: return '2px';
  }
}

// ---------------------------------------------------------------------------
// Resolution with fallback
// ---------------------------------------------------------------------------

export interface ResolvedFlag {
  url: string;
  /** which set actually produced the URL (may differ from the requested one) */
  from: FlagSet | null;
}

const ORDER: Record<FlagSet, FlagSet[]> = {
  standard: ['standard', 'hd', 'svg'],
  hd: ['hd', 'standard', 'svg'],
  svg: ['svg', 'standard', 'hd'],
};

const GETTERS: Record<FlagSet, (code: string) => string> = {
  standard: standardFlagUrl,
  hd: hdFlagUrl,
  svg: svgFlagUrl,
};

/**
 * Resolve a country to an actual bundled image, trying the preferred set
 * first and then the others. Never throws; returns { url: '', from: null }
 * for an unknown country so the caller can render a text fallback.
 */
export function resolveFlag(input: string, set: FlagSet = DEFAULT_FLAG_STYLE.set): ResolvedFlag {
  if (!input) return { url: '', from: null };
  for (const s of ORDER[set] || ORDER.standard) {
    const url = GETTERS[s](input);
    if (url) return { url, from: s };
  }
  return { url: '', from: null };
}

/** Which of the three sets actually have an image for this country. */
export function availableSets(input: string): FlagSet[] {
  return (['standard', 'hd', 'svg'] as FlagSet[]).filter(s => !!GETTERS[s](input));
}

// ---------------------------------------------------------------------------
// Persistence (shared with the separate public-display window)
// ---------------------------------------------------------------------------

export const FLAG_STYLE_STORAGE_KEY = 'wab-tkd-flag-style';
export const FLAG_STYLE_CHANNEL = 'wab-tkd-flag-style';
export const FLAG_STYLE_EVENT = 'tkd-flag-style-changed';

export function readStoredFlagStyle(): FlagStyle {
  try {
    const raw = localStorage.getItem(FLAG_STYLE_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_FLAG_STYLE };
    return sanitizeFlagStyle(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_FLAG_STYLE };
  }
}

/** Never trust what came out of storage (or another window) — an older or
 *  hand-edited value must not be able to put an invalid set/shape on air. */
export function sanitizeFlagStyle(value: unknown): FlagStyle {
  const v = (value || {}) as Partial<FlagStyle>;
  const sets = FLAG_SETS.map(s => s.value);
  const shapes = FLAG_SHAPES.map(s => s.value);
  return {
    set: sets.includes(v.set as FlagSet) ? (v.set as FlagSet) : DEFAULT_FLAG_STYLE.set,
    shape: shapes.includes(v.shape as FlagShape) ? (v.shape as FlagShape) : DEFAULT_FLAG_STYLE.shape,
    border: typeof v.border === 'boolean' ? v.border : DEFAULT_FLAG_STYLE.border,
    shadow: typeof v.shadow === 'boolean' ? v.shadow : DEFAULT_FLAG_STYLE.shadow,
  };
}

export function writeStoredFlagStyle(style: FlagStyle): void {
  try { localStorage.setItem(FLAG_STYLE_STORAGE_KEY, JSON.stringify(style)); } catch { /* storage may be unavailable */ }
}
