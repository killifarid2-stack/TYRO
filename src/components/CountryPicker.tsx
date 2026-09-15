import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import {
  CountryEntry, COUNTRY_COUNT, countryName, findCountry, groupByRegion,
  REGION_LABELS, searchCountries,
} from '@/lib/countries';
import FlagImage from './FlagImage';
import FlagStyleControls from './FlagStyleControls';

interface CountryPickerProps {
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
  className?: string;
  /** Hide the flag-appearance controls inside the dropdown (shown by
   *  default, so whoever picks a country can also decide how that flag
   *  will appear). */
  hideStyleControls?: boolean;
  /** Restrict to countries with a National Olympic Committee. */
  nocOnly?: boolean;
}

/**
 * Searchable country / nationality picker.
 *
 * Search accepts, in any of the app's three languages:
 *   - the 3-letter competition code   : "mar", "KOR", "GER"
 *   - the ISO-2 code                  : "ma", "kr"
 *   - a legacy / ISO-3 code           : "MYS" still finds MAS
 *   - the country name                : "Morocco", "Maroc", "المغرب"
 *
 * It searches the full bundled list (every country that has a real offline
 * flag image) rather than a short hand-written subset, and groups results
 * by continent so browsing without typing stays practical.
 */
export default function CountryPicker({
  value, onChange, placeholder, className = '',
  hideStyleControls = false, nocOnly = false,
}: CountryPickerProps) {
  const { lang } = useI18n();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const results = useMemo(
    () => searchCountries(search, { lang, nocOnly, limit: 400 }),
    [search, lang, nocOnly],
  );
  const grouped = useMemo(() => groupByRegion(results), [results]);
  // While typing, a flat best-match-first list beats continent headers;
  // grouping is what makes plain browsing usable.
  const flat = search.trim().length > 0;

  useEffect(() => setHighlight(0), [search, open]);

  const selected = findCountry(value);

  const commit = (c: CountryEntry) => {
    onChange(c.code);
    setSearch('');
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(h => Math.min(h + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight(h => Math.max(h - 1, 0)); }
    else if (e.key === 'Enter') {
      const pick = results[highlight];
      if (pick) { e.preventDefault(); commit(pick); }
    } else if (e.key === 'Escape') { setOpen(false); }
  };

  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>('[data-highlighted="true"]');
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlight, open]);

  const searchPlaceholder = lang === 'ar'
    ? 'ابحث: MAR أو المغرب أو Morocco…'
    : lang === 'fr'
      ? 'Rechercher : MAR, Maroc, Morocco…'
      : 'Search: MAR, Morocco, Maroc…';

  const emptyText = lang === 'ar' ? 'لا توجد دولة مطابقة'
    : lang === 'fr' ? 'Aucun pays correspondant' : 'No matching country';

  const countText = lang === 'ar' ? `${results.length} من ${COUNTRY_COUNT} دولة`
    : lang === 'fr' ? `${results.length} sur ${COUNTRY_COUNT} pays`
      : `${results.length} of ${COUNTRY_COUNT} countries`;

  const renderRow = (c: CountryEntry, index: number) => (
    <button
      key={c.iso2}
      type="button"
      data-highlighted={index === highlight}
      onMouseEnter={() => setHighlight(index)}
      onMouseDown={(e) => { e.preventDefault(); commit(c); }}
      className={`w-full text-start px-2 py-1.5 text-xs flex items-center gap-2 transition-colors ${
        index === highlight
          ? 'bg-[hsl(var(--primary))]/25 text-[hsl(var(--foreground))]'
          : 'text-[hsl(var(--foreground))] hover:bg-[hsl(var(--primary))]/15'
      } ${c.code === (selected?.code ?? '') ? 'font-bold' : ''}`}
    >
      <FlagImage code={c.code} size={22} lang={lang} />
      <span className="font-mono w-9 shrink-0 opacity-90">{c.code}</span>
      <span className="truncate">{countryName(c, lang)}</span>
      {!c.noc && (
        <span className="ms-auto text-[9px] uppercase opacity-50 shrink-0">
          {lang === 'ar' ? 'إقليم' : lang === 'fr' ? 'territoire' : 'territory'}
        </span>
      )}
    </button>
  );

  let cursor = -1;

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(o => !o)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(o => !o); } }}
        className="w-full flex items-center gap-1.5 px-2 py-2 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] text-sm cursor-pointer min-h-[38px]"
        title={selected ? `${selected.code} - ${countryName(selected, lang)}` : placeholder}
      >
        {selected
          ? <>
              <FlagImage code={selected.code} size={20} lang={lang} />
              <span className="font-mono truncate">{selected.code}</span>
            </>
          : <span className="opacity-50 truncate">{placeholder ?? (lang === 'ar' ? 'الدولة' : lang === 'fr' ? 'Pays' : 'Country')}</span>}
      </div>

      {open && (
        <div className="absolute z-[900] top-full start-0 mt-1 w-[min(22rem,80vw)] max-w-[80vw] rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-[hsl(var(--border))]">
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={searchPlaceholder}
              className="w-full px-2 py-1.5 rounded-md bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] text-xs"
            />
            <div className="mt-1 text-[10px] opacity-60 text-[hsl(var(--foreground))]">{countText}</div>
          </div>

          <div ref={listRef} className="max-h-60 overflow-y-auto">
            {results.length === 0 && (
              <div className="px-3 py-4 text-xs text-center opacity-60 text-[hsl(var(--foreground))]">{emptyText}</div>
            )}
            {flat
              ? results.map(c => renderRow(c, ++cursor))
              : grouped.map(group => (
                  <div key={group.region}>
                    <div className="sticky top-0 px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] border-b border-[hsl(var(--border))]">
                      {REGION_LABELS[group.region][lang]} - {group.countries.length}
                    </div>
                    {group.countries.map(c => renderRow(c, ++cursor))}
                  </div>
                ))}
          </div>

          {!hideStyleControls && (
            <div className="border-t border-[hsl(var(--border))] p-2 bg-[hsl(var(--secondary))]/40">
              <FlagStyleControls compact previewCode={selected?.code || 'MAR'} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
