import React, { useMemo, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import {
  COUNTRY_COUNT, CountryEntry, countryName, findCountry, groupByRegion,
  REGION_LABELS, searchCountries,
} from '@/lib/countries';
import { availableSets, FLAG_SETS, FLAG_SHAPES, FlagSet } from '@/lib/flag-style';
import { useFlagSettings } from '@/context/FlagSettingsContext';
import FlagImage from '@/components/FlagImage';
import FlagStyleControls from '@/components/FlagStyleControls';

/**
 * Settings ▸ Flags — the one place to search the full country list, see
 * exactly how a flag will look in each style, and set the style used by
 * every screen including the live public display.
 *
 * The "broadcast test" block at the bottom mirrors the real overlays
 * (RED/BLUE corners, small scoreboard chip, large winner flag) at the
 * sizes those overlays actually use, so the choice can be judged before
 * it goes on air instead of after.
 */
export default function FlagsSettingsPage() {
  const { lang } = useI18n();
  const { style } = useFlagSettings();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('MAR');
  const [nocOnly, setNocOnly] = useState(false);

  const L = (en: string, ar: string, fr: string) => (lang === 'ar' ? ar : lang === 'fr' ? fr : en);

  const results = useMemo(() => searchCountries(query, { lang, nocOnly }), [query, lang, nocOnly]);
  const grouped = useMemo(() => groupByRegion(results), [results]);
  const flat = query.trim().length > 0;

  const country = findCountry(selected);
  const code = country?.code || selected;
  const sets = availableSets(code);

  const card = (c: CountryEntry) => (
    <button
      key={c.iso2}
      type="button"
      onClick={() => setSelected(c.code)}
      title={`${c.code} · ${c.iso2} · ${c.aliases.join(' / ')}`}
      className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors ${
        c.code === code
          ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/15'
          : 'border-[hsl(var(--border))] bg-[hsl(var(--secondary))]/40 hover:bg-[hsl(var(--primary))]/10'
      }`}
    >
      <FlagImage code={c.code} size={44} lang={lang} />
      <span className="font-mono text-[11px] font-bold">{c.code}</span>
      <span className="text-[10px] opacity-70 leading-tight text-center line-clamp-2">{countryName(c, lang)}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] p-4 md:p-6">
      <header className="mb-4">
        <h1 className="text-xl md:text-2xl font-black tracking-tight">
          {L('Flags & Countries', 'الأعلام والدول', 'Drapeaux & Pays')}
        </h1>
        <p className="text-xs opacity-70 mt-1">
          {L(
            `${COUNTRY_COUNT} countries and territories, all bundled offline in two image sets.`,
            `${COUNTRY_COUNT} دولة وإقليم، كلها مضمّنة داخل التطبيق ومتاحة بدون إنترنت، بنوعين من الصور.`,
            `${COUNTRY_COUNT} pays et territoires, inclus hors ligne en deux jeux d’images.`,
          )}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-4">
        {/* ---------------- Browser ---------------- */}
        <section className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
          <div className="p-3 border-b border-[hsl(var(--border))] flex flex-wrap items-center gap-2">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={L(
                'Search by code or name: MAR, MA, Morocco, Maroc…',
                'ابحث بالاختصار أو الاسم: MAR أو MA أو المغرب أو Morocco…',
                'Rechercher par code ou nom : MAR, MA, Maroc, Morocco…',
              )}
              className="flex-1 min-w-[12rem] px-3 py-2 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-sm"
            />
            <label className="flex items-center gap-1 text-[11px] cursor-pointer whitespace-nowrap">
              <input type="checkbox" checked={nocOnly} onChange={e => setNocOnly(e.target.checked)} />
              {L('Olympic committees only', 'اللجان الأولمبية فقط', 'Comités olympiques seulement')}
            </label>
            <span className="text-[11px] opacity-60 whitespace-nowrap">
              {results.length} / {COUNTRY_COUNT}
            </span>
          </div>

          <div className="max-h-[26rem] overflow-y-auto p-3">
            {results.length === 0 && (
              <div className="py-10 text-center text-sm opacity-60">
                {L('No matching country', 'لا توجد دولة مطابقة', 'Aucun pays correspondant')}
              </div>
            )}
            {flat ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-2">
                {results.map(card)}
              </div>
            ) : (
              grouped.map(group => (
                <div key={group.region} className="mb-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider opacity-70 mb-2">
                    {REGION_LABELS[group.region][lang]} · {group.countries.length}
                  </div>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-2">
                    {group.countries.map(card)}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ---------------- Style panel ---------------- */}
        <aside className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 h-fit">
          <FlagStyleControls previewCode={code} />
        </aside>
      </div>

      {/* ---------------- Comparison of all variants ---------------- */}
      <section className="mt-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
        <h2 className="text-sm font-bold mb-1">
          {L('How it will appear', 'كيف سيظهر', 'Rendu')} — <span className="font-mono">{code}</span>
          {country && <span className="opacity-60 font-normal"> · {countryName(country, lang)}</span>}
        </h2>
        <p className="text-[11px] opacity-60 mb-3">
          {L(
            'Every combination of image set and shape, at broadcast size. Sets with no image for this country fall back automatically.',
            'كل تركيبة من نوع الصورة والشكل، بمقاس البث. الأنواع التي لا تتوفر لها صورة لهذه الدولة يتم استبدالها تلقائيًا.',
            'Chaque combinaison de jeu d’images et de forme, à la taille de diffusion. Les jeux sans image basculent automatiquement.',
          )}
        </p>
        <div className="overflow-x-auto">
          <table className="text-[11px] border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-start opacity-70 font-semibold" />
                {FLAG_SHAPES.map(s => (
                  <th key={s.value} className="p-2 opacity-70 font-semibold">
                    {lang === 'ar' ? s.ar : lang === 'fr' ? s.fr : s.en}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FLAG_SETS.map(set => (
                <tr key={set.value} className="border-t border-[hsl(var(--border))]">
                  <td className="p-2 whitespace-nowrap font-semibold">
                    {lang === 'ar' ? set.ar : lang === 'fr' ? set.fr : set.en}
                    {!sets.includes(set.value as FlagSet) && (
                      <span className="ms-1 text-[9px] opacity-50">
                        ({L('fallback', 'بديل', 'repli')})
                      </span>
                    )}
                  </td>
                  {FLAG_SHAPES.map(shape => (
                    <td key={shape.value} className="p-2 text-center">
                      <FlagImage code={code} size={56} set={set.value} shape={shape.value} lang={lang} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------- Broadcast test area ---------------- */}
      <section className="mt-4 rounded-xl border border-[hsl(var(--border))] overflow-hidden">
        <div className="px-3 py-2 text-sm font-bold bg-[hsl(var(--card))] border-b border-[hsl(var(--border))]">
          {L('Broadcast test', 'اختبار على شاشة البث', 'Test diffusion')}
          <span className="ms-2 text-[11px] font-normal opacity-60">
            {L('current style', 'النمط الحالي', 'style actuel')}: {style.set} / {style.shape}
          </span>
        </div>
        <div className="bg-black p-4 flex flex-wrap items-center gap-6">
          {/* RED / BLUE corner chips, as used by the scoreboard */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#c62828]">
            <FlagImage code={code} size={28} lang={lang} />
            <span className="text-white font-bold text-sm">HONG</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1565c0]">
            <FlagImage code={code} size={28} lang={lang} />
            <span className="text-white font-bold text-sm">CHUNG</span>
          </div>
          {/* Small list chip */}
          <div className="flex items-center gap-1.5 text-white/90 text-xs">
            <FlagImage code={code} size={18} lang={lang} />
            <span className="font-mono">{code}</span>
          </div>
          {/* Large winner-animation flag */}
          <div className="flex flex-col items-center gap-2">
            <FlagImage code={code} size={160} lang={lang} />
            <span className="text-white/70 text-[10px] uppercase tracking-widest">
              {L('winner overlay', 'أنيميشن الفائز', 'animation vainqueur')}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
