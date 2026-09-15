/**
 * WAB-TKD — legacy flag helpers.
 *
 * The real implementation now lives in:
 *   - src/lib/countries.ts   — the full country database (254 entries)
 *   - src/lib/flag-style.ts  — the two bundled image sets + display style
 *
 * This file is kept as a thin compatibility layer so that the ~30 existing
 * screens that already import getFlagUrl/getIso2/getCountryFlag keep working
 * unchanged. It used to hold a hand-maintained 200-entry IOC→ISO2 map; every
 * one of those codes is still resolvable, now as an alias in countries.ts.
 */

import { findCountry, toCountryCode } from './countries';
import { resolveFlag, standardFlagUrl, svgFlagUrl } from './flag-style';

/** 2-letter ISO code from any input (2-letter, 3-letter, or country name). */
export function getIso2(code: string): string | null {
  const c = findCountry(code);
  return c ? c.iso2 : null;
}

/**
 * Resolve a flag to a bundled local asset. There is intentionally no remote
 * CDN fallback: public screens must remain deterministic and work offline.
 */
export function getLocalFlagUrl(code: string): string {
  return resolveFlag(code || '').url;
}

export function getFlagUrl(code: string): string {
  return getLocalFlagUrl(code);
}

/** Bitmap (144x108 PNG) flag URL, ignoring the operator's chosen set. */
export function getStandardFlagUrl(code: string): string {
  return standardFlagUrl(code);
}

/** Vector flag URL, ignoring the operator's chosen set. */
export function getSvgFlagUrl(code: string): string {
  return svgFlagUrl(code);
}

/**
 * Text-only country fallback. Broadcast/referee screens must use FlagImage,
 * which resolves the real bundled image. Other admin/text surfaces use the
 * canonical competition code here instead of an emoji.
 */
export function getCountryFlag(code: string): string {
  return findCountry(code) ? toCountryCode(code) : '';
}
