import type { Competitor } from "./types";
import FlagImage from "@/components/FlagImage";

export function CompetitorCard({ competitor, showFlag = true, showClub = true }: { competitor: Competitor; showFlag?: boolean; showClub?: boolean }) {
  const isBlue = competitor.corner === "blue";
  const photo = (competitor as any).photo || (competitor as any).photoUrl;

  return (
    <div
      className={`clip-angled animate-rise-in relative flex w-full items-center gap-5 overflow-hidden px-6 py-4 xl:px-8 xl:py-5 ${isBlue ? "justify-end text-right" : "justify-start text-left"}`}
      style={{
        background: isBlue ? "var(--gradient-blue)" : "var(--gradient-red)",
        boxShadow: isBlue
          ? "var(--shadow-blue), inset 0 1px 0 oklch(1 0 0 / 0.2)"
          : "0 0 26px color-mix(in oklab, var(--teamred-bright) 40%, transparent), inset 0 1px 0 oklch(1 0 0 / 0.2)",
        border: `2px solid ${isBlue ? "color-mix(in oklab, var(--teamblue-bright) 78%, transparent)" : "color-mix(in oklab, var(--teamred-bright) 78%, transparent)"}`,
      }}
    >
      <span className="gold-sheen absolute inset-0" aria-hidden />

      {isBlue && photo && (
        <img src={photo} alt={competitor.name} className="relative z-10 h-16 w-16 shrink-0 rounded-xl object-cover ring-2 ring-white/35 xl:h-20 xl:w-20" />
      )}
      {!isBlue && showFlag && (
        <FlagImage
          code={competitor.flag || competitor.country}
          size={128}
          className="relative z-10 h-12 w-20 shrink-0 rounded-sm object-cover shadow-[0_4px_14px_oklch(0_0_0/0.6)] ring-1 ring-white/50 xl:h-16 xl:w-28"
        />
      )}

      <div className="relative z-10 min-w-0">
        <div className="font-display text-[clamp(28px,3vw,58px)] font-black uppercase leading-none tracking-tight text-foreground drop-shadow-[0_3px_12px_oklch(0_0_0/0.65)]">
          {competitor.name}
        </div>
        <div className="mt-2 flex items-center gap-3 font-display text-[clamp(13px,1.15vw,22px)] font-bold uppercase tracking-[0.12em] text-white/90">
          {isBlue && showFlag && (
            <FlagImage
              code={competitor.flag || competitor.country}
              size={128}
              className="h-8 w-14 shrink-0 rounded-sm object-cover shadow-[0_4px_14px_oklch(0_0_0/0.6)] ring-1 ring-white/50 xl:h-10 xl:w-16"
            />
          )}
          <span>{competitor.country}</span>
        </div>
        {showClub && <div className="mt-1 truncate font-display text-[clamp(12px,1vw,19px)] font-bold uppercase tracking-[0.16em] text-gold">{competitor.club}</div>}
      </div>

      {!isBlue && photo && (
        <img src={photo} alt={competitor.name} className="relative z-10 h-16 w-16 shrink-0 rounded-xl object-cover ring-2 ring-white/35 xl:h-20 xl:w-20" />
      )}
      {isBlue && !photo && showFlag && (
        <FlagImage
          code={competitor.flag || competitor.country}
          size={128}
          className="relative z-10 h-12 w-20 shrink-0 rounded-sm object-cover shadow-[0_4px_14px_oklch(0_0_0/0.6)] ring-1 ring-white/50 xl:h-16 xl:w-28"
        />
      )}
    </div>
  );
}
