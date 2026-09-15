import React, { useEffect, useMemo, useState } from 'react';
import { findCountry, countryName, CountryLang } from '@/lib/countries';
import {
  FlagSet, FlagShape, resolveFlag, shapeAspect, shapeRadius, svgFlagUrl,
} from '@/lib/flag-style';
import { useFlagSettings } from '@/context/FlagSettingsContext';

interface FlagImageProps {
  /** Any country reference: 'MAR', 'MA', 'Morocco', 'Maroc', 'المغرب'. */
  code: string;
  /** Width in px. Height is derived from the shape's aspect ratio. */
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  /** Override the global set for this one flag (e.g. force 'hd' inside a
   *  full-screen winner animation while lists stay on 'standard'). */
  set?: FlagSet;
  /** Override the global shape for this one flag. */
  shape?: FlagShape;
  border?: boolean;
  shadow?: boolean;
  /** 'cover' (default, layout-stable) or 'contain' (shows the flag's true
   *  proportions with no cropping). */
  fit?: 'cover' | 'contain';
  /** Language used for the tooltip/alt text. */
  lang?: CountryLang;
}

/**
 * The single flag renderer for the whole app.
 *
 * Every screen — operator, admin, brackets, and the public broadcast
 * overlays — goes through this component, so changing the flag set or
 * shape in Settings ▸ Flags instantly changes every flag everywhere,
 * including the separate public-display window.
 *
 * Resolution order is set-aware and never blank: preferred set → other PNG
 * set → bundled SVG → a readable text badge with the 3-letter code. That
 * last step matters on air: an unknown or brand-new nationality shows
 * "MAR" rather than an empty hole in the overlay.
 */
export default function FlagImage({
  code, size = 64, className = '', style,
  set, shape, border, shadow, fit = 'cover', lang = 'en',
}: FlagImageProps) {
  const { style: globalStyle } = useFlagSettings();

  const activeSet = set ?? globalStyle.set;
  const activeShape = shape ?? globalStyle.shape;
  const activeBorder = border ?? globalStyle.border;
  const activeShadow = shadow ?? globalStyle.shadow;

  const resolved = useMemo(() => resolveFlag(code || '', activeSet), [code, activeSet]);
  const country = useMemo(() => findCountry(code || ''), [code]);

  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [resolved.url]);

  const width = size;
  const height = Math.round(size * shapeAspect(activeShape));

  // Only apply a radius for the non-default shapes, so existing screens that
  // already pass their own `rounded-*` class keep rendering exactly as before.
  const radius = activeShape === 'rectangle' ? undefined : shapeRadius(activeShape, width);

  const boxStyle: React.CSSProperties = {
    width, height,
    ...(radius ? { borderRadius: radius } : null),
    ...(activeBorder ? { boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.45), 0 0 0 1px rgba(0,0,0,0.35)' } : null),
    ...style,
  };

  const shapeClass = [
    'inline-block shrink-0',
    activeShape === 'rectangle' ? 'rounded-sm' : '',
    activeShadow ? 'shadow-md' : '',
  ].filter(Boolean).join(' ');

  const label = country ? countryName(country, lang) : (code || '');

  if (resolved.url && !failed) {
    return (
      <img
        src={resolved.url}
        alt={label}
        title={label}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        draggable={false}
        className={`${shapeClass} ${fit === 'contain' ? 'object-contain' : 'object-cover'} ${className}`}
        style={{ imageRendering: 'auto', ...boxStyle }}
        // A single broken asset must never take a broadcast screen with it:
        // fall through to the vector set, then to the text badge below.
        onError={() => setFailed(true)}
      />
    );
  }

  const svgUrl = country ? svgFlagUrl(country.iso2) : '';
  if (svgUrl && failed) {
    return (
      <img
        src={svgUrl}
        alt={label}
        title={label}
        width={width}
        height={height}
        draggable={false}
        className={`${shapeClass} object-cover ${className}`}
        style={boxStyle}
      />
    );
  }

  if (!country && !code) return null;

  // Last-resort readable badge — never an empty box on air.
  return (
    <span
      aria-label={label}
      title={label}
      className={`${shapeClass} inline-flex items-center justify-center bg-black/40 text-white font-bold tracking-wide ${className}`}
      style={{ ...boxStyle, fontSize: Math.max(7, Math.round(height * 0.5)), lineHeight: 1 }}
    >
      {(country?.code || code || '').toUpperCase().slice(0, 3)}
    </span>
  );
}
