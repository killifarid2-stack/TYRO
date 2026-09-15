import React from 'react';
import { useI18n } from '@/lib/i18n';
import { countryName, findCountry } from '@/lib/countries';
import { availableSets, FLAG_SETS, FLAG_SHAPES, FlagSet } from '@/lib/flag-style';
import { useFlagSettings } from '@/context/FlagSettingsContext';
import FlagImage from './FlagImage';

interface FlagStyleControlsProps {
  /** Country used for the live preview. Defaults to Morocco. */
  previewCode?: string;
  /** Tight layout for use inside a dropdown. */
  compact?: boolean;
  className?: string;
}

/**
 * The flag-appearance switcher + live preview.
 *
 * Deliberately a small standalone component rather than page-specific
 * markup: it is embedded inside the CountryPicker dropdown (so the choice
 * sits right next to where a country is selected), inside Admin ▸ Settings,
 * and on the dedicated Flags page. All three edit the same global setting,
 * which is broadcast to the public-display window immediately.
 */
export default function FlagStyleControls({
  previewCode = 'MAR', compact = false, className = '',
}: FlagStyleControlsProps) {
  const { lang } = useI18n();
  const { style, setStyle, reset } = useFlagSettings();

  const country = findCountry(previewCode);
  const code = country?.code || previewCode;
  const sets = availableSets(code);

  const L = (en: string, ar: string, fr: string) => (lang === 'ar' ? ar : lang === 'fr' ? fr : en);

  const setLabel = (s: typeof FLAG_SETS[number]) => (lang === 'ar' ? s.ar : lang === 'fr' ? s.fr : s.en);
  const shapeLabel = (s: typeof FLAG_SHAPES[number]) => (lang === 'ar' ? s.ar : lang === 'fr' ? s.fr : s.en);

  const activeSetInfo = FLAG_SETS.find(s => s.value === style.set);

  return (
    <div className={`text-[hsl(var(--foreground))] ${className}`}>
      {/* --- Flag type ------------------------------------------------- */}
      <div className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">
        {L('Flag type', 'نوع العلم', 'Type de drapeau')}
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        {FLAG_SETS.map(s => {
          const missing = !sets.includes(s.value as FlagSet);
          return (
            <button
              key={s.value}
              type="button"
              onClick={() => setStyle({ set: s.value })}
              title={missing
                ? L('Not available for this country — the app falls back automatically.',
                    'غير متوفر لهذه الدولة — التطبيق يستبدله تلقائيًا.',
                    'Indisponible pour ce pays — remplacement automatique.')
                : (lang === 'ar' ? s.hint.ar : lang === 'fr' ? s.hint.fr : s.hint.en)}
              className={`px-2 py-1 rounded-md text-[10px] font-semibold border transition-colors ${
                style.set === s.value
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))]'
                  : 'bg-[hsl(var(--secondary))] border-[hsl(var(--border))] hover:bg-[hsl(var(--primary))]/20'
              } ${missing ? 'opacity-50' : ''}`}
            >
              {setLabel(s)}
            </button>
          );
        })}
      </div>

      {/* --- Shape ------------------------------------------------------ */}
      <div className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">
        {L('Shape', 'الشكل', 'Forme')}
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        {FLAG_SHAPES.map(s => (
          <button
            key={s.value}
            type="button"
            onClick={() => setStyle({ shape: s.value })}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold border transition-colors ${
              style.shape === s.value
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))]'
                : 'bg-[hsl(var(--secondary))] border-[hsl(var(--border))] hover:bg-[hsl(var(--primary))]/20'
            }`}
          >
            <FlagImage code={code} size={16} shape={s.value} lang={lang} />
            {shapeLabel(s)}
          </button>
        ))}
      </div>

      {/* --- Toggles ---------------------------------------------------- */}
      <div className="flex flex-wrap items-center gap-3 mb-2 text-[10px]">
        <label className="flex items-center gap-1 cursor-pointer">
          <input type="checkbox" checked={style.border} onChange={e => setStyle({ border: e.target.checked })} />
          {L('Outline', 'إطار', 'Contour')}
        </label>
        <label className="flex items-center gap-1 cursor-pointer">
          <input type="checkbox" checked={style.shadow} onChange={e => setStyle({ shadow: e.target.checked })} />
          {L('Shadow', 'ظل', 'Ombre')}
        </label>
        <button
          type="button"
          onClick={reset}
          className="ms-auto px-2 py-0.5 rounded border border-[hsl(var(--border))] hover:bg-[hsl(var(--primary))]/20"
        >
          {L('Reset', 'استعادة الافتراضي', 'Réinitialiser')}
        </button>
      </div>

      {/* --- Live preview ----------------------------------------------- */}
      <div className="rounded-lg border border-[hsl(var(--border))] overflow-hidden">
        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-[hsl(var(--secondary))]/60">
          {L('Preview', 'معاينة', 'Aperçu')} · {code}
          {country && <span className="opacity-60"> — {countryName(country, lang)}</span>}
        </div>
        {/* Two backgrounds on purpose: a white flag (JPN/KOR) can vanish on a
            light panel, and a dark flag can vanish on the broadcast black. */}
        <div className="grid grid-cols-2">
          <div className="flex items-center justify-center gap-2 p-3 bg-white">
            <FlagImage code={code} size={compact ? 40 : 64} lang={lang} />
            {!compact && <FlagImage code={code} size={24} lang={lang} />}
          </div>
          <div className="flex items-center justify-center gap-2 p-3 bg-black">
            <FlagImage code={code} size={compact ? 40 : 64} lang={lang} />
            {!compact && <FlagImage code={code} size={24} lang={lang} />}
          </div>
        </div>
        {!compact && activeSetInfo && (
          <div className="px-2 py-1.5 text-[10px] opacity-70 border-t border-[hsl(var(--border))]">
            {lang === 'ar' ? activeSetInfo.hint.ar : lang === 'fr' ? activeSetInfo.hint.fr : activeSetInfo.hint.en}
          </div>
        )}
      </div>

      {!compact && (
        <p className="mt-2 text-[10px] opacity-60 leading-relaxed">
          {L(
            'This choice applies everywhere flags appear — admin, brackets, operator screen and the live public/broadcast display, which updates instantly without a reload.',
            'هذا الاختيار يُطبَّق في كل مكان تظهر فيه الأعلام — الإدارة والجداول وشاشة المشغل وشاشة البث/الجمهور المباشرة، وتتحدث فورًا دون إعادة تحميل.',
            'Ce choix s’applique partout où des drapeaux apparaissent — admin, tableaux, écran opérateur et écran public/diffusion, mis à jour instantanément.',
          )}
        </p>
      )}
    </div>
  );
}
