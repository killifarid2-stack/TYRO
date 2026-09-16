import * as React from "react";
import { useI18n } from "@/lib/i18n";
import FlagImage from "@/components/FlagImage";
import type { MatchData, RoundResult } from "./types";
import medalUrl from "@/assets/medal-transparent.png";
import splashBannerUrl from "@/assets/splash-banner.png";

const DESIGN_W = 1920;
const DESIGN_H = 1080;

function methodLabel(code: string, goldenPoint?: boolean) {
  if (goldenPoint) return "GOLDEN POINT";
  const labels: Record<string, string> = {
    KO: "KNOCKOUT",
    WDR: "WALKOVER / WITHDRAWAL",
    PTF: "POINTS / DECISION",
    PTG: "POINT GAP",
    RSC: "REFEREE STOP CONTEST",
    DSQ: "DISQUALIFICATION",
    SUP: "SUPERIORITY",
    PUN: "PUNITIVE DECLARATION",
    DQB: "DISQUALIFICATION — UNSPORTSMANLIKE BEHAVIOR",
    GDP: "GOLDEN POINT",
    KYESHI: "KYESHI",
  };
  return labels[code] || code || "DECISION";
}

function decisionText(match: MatchData) {
  if (match.decisionType === "WOOSE_GIROK") return "WOO-SE-GIROK · REFEREE / JUDGES DECISION";
  if (match.decisionType === "AI_RECOMMENDATION") return "AI TIE ANALYSIS · DECISION SUPPORT";
  if (match.aiRecommendation && match.aiRecommendation !== "unable") return `AI RECOMMENDATION · ${match.aiRecommendation.toUpperCase()}`;
  return "";
}

function roundWinner(round: RoundResult) {
  if (round.winner === "blue") return "BLUE";
  if (round.winner === "red") return "RED";
  if (round.winner === "draw") return "DRAW";
  if (round.blue > round.red) return "BLUE";
  if (round.red > round.blue) return "RED";
  return "DRAW";
}

function MetaItem({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="min-w-0 px-3 py-2 text-center">
      <div className="font-display text-[9px] font-black uppercase tracking-[.18em] text-[#ffd866]/65">{label}</div>
      <div className="mt-1 truncate font-display text-[13px] font-black uppercase tracking-[.05em] text-white/90">{value || "—"}</div>
    </div>
  );
}

function PlayerVisual({ photo, flag, name, accent, side }: { photo?: string; flag?: string; name: string; accent: string; side: "blue" | "red" }) {
  const [failed, setFailed] = React.useState(false);
  React.useEffect(() => setFailed(false), [photo]);
  const usePhoto = Boolean(photo && !failed);
  return (
    <div className="relative flex h-[150px] w-[150px] shrink-0 items-center justify-center overflow-hidden rounded-[16px] bg-black/55"
      style={{ border: `2px solid ${accent}99`, boxShadow: `0 0 28px ${accent}35, inset 0 0 22px rgba(0,0,0,.8)` }}>
      {usePhoto ? (
        <img src={photo} alt="" className="h-full w-full object-cover" onError={() => setFailed(true)} />
      ) : flag ? (
        <FlagImage code={flag} size={220} className="h-[94px] w-[138px] rounded-lg object-cover" />
      ) : (
        <span className="font-display text-4xl font-black text-white/75">{name.slice(0, 2).toUpperCase()}</span>
      )}
      {usePhoto && flag && (
        <div className={`absolute bottom-2 ${side === "blue" ? "right-2" : "left-2"} overflow-hidden rounded border-2 border-white/80 bg-black/70 shadow-[0_0_14px_rgba(0,0,0,.7)]">
          <FlagImage code={flag} size={54} className="h-6 w-9 object-cover" />
        </div>
      )}
    </div>
  );
}


export function MatchResultScreen({ match, playerPhoto }: { match: MatchData; playerPhoto?: string }) {
  const { lang } = useI18n();
  const [revealPhase, setRevealPhase] = React.useState(0);
  React.useEffect(() => {
    setRevealPhase(0);
    const timers = [
      window.setTimeout(() => setRevealPhase(1), 140),
      window.setTimeout(() => setRevealPhase(2), 650),
      window.setTimeout(() => setRevealPhase(3), 1150),
      window.setTimeout(() => setRevealPhase(4), 1750),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [match.matchId, match.winner.name]);
  const blueWon = match.winner.corner === "blue";
  const accent = blueWon ? "#3ea5ff" : "#ff4555";
  const tournament = match.tournament || "WAB TAEKWONDO CHAMPIONSHIP";
  const winnerName = match.winner.name || (blueWon ? "CHUNG" : "HONG");
  const country = match.winner.country || "—";
  const club = match.winner.club || "—";
  const showFlag = match.display?.showFlag !== false;
  const showClub = match.display?.showClub !== false;
  const winnerPhoto = match.display?.showPhoto === false ? undefined : playerPhoto;
  const rounds = match.rounds.slice().sort((a, b) => a.round - b.round);
  const roundWins = rounds.reduce((acc, round) => {
    const winner = roundWinner(round);
    if (winner === "BLUE") acc.blue += 1;
    if (winner === "RED") acc.red += 1;
    return acc;
  }, { blue: 0, red: 0 });
  const code = String(match.resultMethod || "DECISION").toUpperCase();
  const resultLabel = methodLabel(code, match.goldenPointWin);
  const decision = decisionText(match);
  const winnerRound = match.resultRound || match.decisiveRound;

  return (
    <main
      data-wab-layer-root="match-result"
      data-winner-reveal-phase={revealPhase}
      className="relative h-screen w-screen overflow-hidden bg-[#020306] text-white"
      dir={lang === "ar" ? "rtl" : "ltr"}
      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      <style>{`
        @keyframes winnerPageIn { from { opacity:0; transform:translateY(18px) scale(.985) } to { opacity:1; transform:translateY(0) scale(1) } }
        @keyframes winnerTitleIn { from { opacity:0; letter-spacing:.42em; transform:scale(.94) } to { opacity:1; letter-spacing:.14em; transform:scale(1) } }
        @keyframes winnerFlash { 0% { opacity:0; transform:scale(.55) } 18% { opacity:.95 } 100% { opacity:0; transform:scale(1.7) } }
        @keyframes winnerShock { 0% { transform:scale(.72); opacity:0 } 55% { transform:scale(1.08); opacity:1 } 100% { transform:scale(1); opacity:1 } }
        @keyframes medalEnter { 0% { opacity:0; transform:scale(.38) rotate(-16deg) translateY(35px) } 55% { opacity:1; transform:scale(1.14) rotate(4deg) translateY(-4px) } 78% { transform:scale(.96) rotate(-1deg) } 100% { opacity:1; transform:scale(1) rotate(0) translateY(0) } }
        @keyframes medalFloat { 0%,100% { transform:translateY(0) rotate(-1deg) } 50% { transform:translateY(-8px) rotate(1deg) } }
        @keyframes goldSweep { from { transform:translateX(-110%) } to { transform:translateX(110%) } }
        @keyframes energyLine { 0% { transform:scaleX(0); opacity:0 } 35% { opacity:1 } 100% { transform:scaleX(1); opacity:0 } }
        @keyframes winnerPulse { 0%,100% { box-shadow:0 0 30px var(--winner-glow), inset 0 0 35px rgba(255,255,255,.02) } 50% { box-shadow:0 0 75px var(--winner-glow), inset 0 0 55px rgba(255,216,102,.07) } }
        @media (prefers-reduced-motion: reduce) { * { animation-duration:.01ms !important; animation-iteration-count:1 !important; transition-duration:.01ms !important; } }
      `}</style>

      <div className="absolute inset-0" style={{ width: DESIGN_W, height: DESIGN_H, left: "50%", top: "50%", transform: "translate(-50%,-50%) scale(var(--wab-broadcast-fit-scale,1))" }}>
        <div className="absolute inset-0 overflow-hidden bg-[#020306]" data-reveal-phase={revealPhase}>
          {/* Winner cinematic energy layer: presentation only; it never changes match state. */}
          <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden="true">
            <div className="absolute left-1/2 top-[47%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffd866]/10 blur-[70px]" style={{ opacity: revealPhase >= 2 ? 1 : 0, transition: 'opacity .5s ease' }} />
            <div className="absolute left-[4%] right-[4%] top-[49%] h-px bg-gradient-to-r from-transparent via-[#ffd866] to-transparent" style={{ animation: revealPhase >= 2 ? 'energyLine 1.2s ease-out both' : 'none' }} />
            <div className="absolute left-1/2 top-[45%] h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#ffd866]/20" style={{ animation: revealPhase >= 2 ? 'winnerShock 1s ease-out both' : 'none' }} />
            <div className="absolute left-1/2 top-[45%] h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#ffd866]/10" style={{ animation: revealPhase >= 2 ? 'winnerShock 1.3s ease-out .12s both' : 'none' }} />
            <div className="absolute inset-0 bg-[#ffd866]/20" style={{ animation: revealPhase === 2 ? 'winnerFlash .75s ease-out both' : 'none' }} />
          </div>
          <img src={splashBannerUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-[.09]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(255,216,102,.13),transparent_35%),radial-gradient(circle_at_18%_50%,rgba(255,60,75,.09),transparent_28%),radial-gradient(circle_at_82%_50%,rgba(62,165,255,.09),transparent_28%),linear-gradient(180deg,rgba(1,3,7,.74),#020306_78%)]" />
          <div className="absolute inset-x-0 top-0 h-[5px] bg-gradient-to-r from-transparent via-[#ffd866] to-transparent shadow-[0_0_25px_rgba(255,216,102,.8)]" />

          {/* One tournament-information strip only. No duplicate metadata block. */}
          <header className="absolute left-[70px] right-[70px] top-[34px]" style={{ animation: "winnerPageIn .55s ease-out both", opacity: revealPhase >= 1 ? undefined : 0 }}>
            <div className="text-center font-display text-[38px] font-black uppercase tracking-[.14em] text-[#fff1bd]" style={{ textShadow: "0 0 28px rgba(255,216,102,.34)" }}>{tournament}</div>
            <div className="mt-5 grid grid-cols-8 overflow-hidden rounded-[14px] border border-[#ffd866]/30 bg-black/55 shadow-[0_0_32px_rgba(255,216,102,.08),inset_0_0_20px_rgba(255,216,102,.03)]">
              <MetaItem label="TYPE" value={match.competitionType || "TOURNAMENT"} />
              <MetaItem label="GENDER" value={match.gender} />
              <MetaItem label="AGE GROUP" value={match.ageGroup} />
              <MetaItem label="DIVISION" value={match.stage} />
              <MetaItem label="WEIGHT" value={match.weight || match.category} />
              <MetaItem label="MATCH" value={match.matchId != null ? `#${match.matchId}` : "—"} />
              <MetaItem label="DATE" value={match.date} />
              <MetaItem label="LOCATION" value={match.location || "WORLD ARENA"} />
            </div>
          </header>

          <div className="absolute left-[70px] right-[70px] top-[205px] text-center" style={{ animation: revealPhase >= 2 ? "winnerTitleIn .7s cubic-bezier(.16,1,.3,1) both" : "none", opacity: revealPhase >= 2 ? 1 : 0 }}>
            <div className="font-display text-[18px] font-black tracking-[.35em] text-white/40">OFFICIAL MATCH RESULT</div>
            <div className="mt-2 font-display text-[46px] font-black tracking-[.14em] text-white">MATCH <span className="text-[#ffd866]">{match.matchId || "—"}</span> <span className="text-white/25">—</span> RESULT</div>
          </div>

          {/* Large medal: award object only, no trophy and no nested frame. */}
          <div className="absolute right-[165px] top-[270px] z-10 flex h-[260px] w-[260px] items-center justify-center" style={{ animation: revealPhase >= 2 ? "medalEnter .9s cubic-bezier(.16,1,.3,1) both" : "none", opacity: revealPhase >= 2 ? 1 : 0 }}>
            <div className="absolute inset-[15%] rounded-full bg-[#ffd866]/10 blur-3xl" />
            <img src={medalUrl} alt="WAB-TKD medal" className="relative h-[245px] w-[245px] object-contain" style={{ filter: "drop-shadow(0 0 20px rgba(255,230,130,.95)) drop-shadow(0 0 65px rgba(255,174,0,.48))", animation: revealPhase >= 3 ? "medalFloat 3.2s ease-in-out 0s infinite" : "none" }} />
          </div>

          {/* Round wins are deliberately the visual priority; per-round points are compact. */}
          <section className="absolute left-[90px] right-[430px] top-[292px]" style={{ animation: revealPhase >= 3 ? "winnerPageIn .65s ease-out both" : "none", opacity: revealPhase >= 3 ? 1 : 0 }}>
            <div className="font-display text-[13px] font-black tracking-[.30em] text-[#ffd866]">ROUNDS WON</div>
            <div className="mt-3 flex items-end gap-7">
              <div className="flex items-end gap-3">
                <span className="font-display text-[104px] font-black leading-none text-[#ff4555]" style={{ textShadow: "0 0 30px rgba(255,69,85,.45)" }}>{roundWins.red}</span>
                <span className="pb-3 font-display text-[15px] font-black tracking-[.20em] text-red-200/70">RED</span>
              </div>
              <div className="pb-3 font-display text-[22px] font-black text-white/20">:</div>
              <div className="flex items-end gap-3">
                <span className="font-display text-[104px] font-black leading-none text-[#3ea5ff]" style={{ textShadow: "0 0 30px rgba(62,165,255,.45)" }}>{roundWins.blue}</span>
                <span className="pb-3 font-display text-[15px] font-black tracking-[.20em] text-blue-200/70">BLUE</span>
              </div>
            </div>
            <div className="mt-4 h-[2px] bg-gradient-to-r from-[#ff4555] via-[#ffd866] to-[#3ea5ff] opacity-60" />
            <div className="mt-3 flex max-w-[980px] items-center gap-3">
              {rounds.length ? rounds.slice(0, 5).map((round) => {
                const rw = roundWinner(round);
                const color = rw === "RED" ? "#ff4555" : rw === "BLUE" ? "#3ea5ff" : "#ffd866";
                return (
                  <div key={round.round} className="flex min-w-[132px] flex-1 items-center justify-between border-b border-white/10 px-1 pb-2">
                    <span className="font-display text-[11px] font-black tracking-[.15em] text-white/35">R{round.round}</span>
                    <span className="font-display text-[18px] font-black tabular-nums"><span className="text-[#3ea5ff]">{round.blue}</span><span className="mx-2 text-white/20">—</span><span className="text-[#ff4555]">{round.red}</span></span>
                    <span className="font-display text-[9px] font-black tracking-[.08em]" style={{ color }}>{rw}</span>
                  </div>
                );
              }) : <div className="text-sm font-bold text-white/30">R1 — R2 — R3</div>}
            </div>
            <div className="mt-5 flex items-center gap-7 font-display text-[12px] font-black uppercase tracking-[.16em] text-white/45">
              <span>TOTAL <b className="text-white/85">{match.score.blue} — {match.score.red}</b></span>
              <span>{resultLabel}</span>
              {winnerRound ? <span>DECISIVE R{winnerRound}</span> : null}
              {match.goldenPointWin ? <span className="text-[#ffd866]">GOLDEN POINT</span> : null}
            </div>
            {decision && <div className="mt-3 font-display text-[10px] font-black tracking-[.16em] text-[#ffd866]/75">{decision}</div>}
          </section>

          {/* Single bottom player frame. All winner identity information lives here. */}
          <section className="absolute bottom-[58px] left-[70px] right-[70px] h-[245px] overflow-hidden rounded-[22px] border-2 bg-black/65"
            style={{ borderColor: `${accent}aa`, boxShadow: `0 0 55px ${accent}20, inset 0 0 45px ${accent}0d`, animation: revealPhase >= 4 ? "winnerPageIn .7s ease-out both" : "none", opacity: revealPhase >= 4 ? 1 : 0 }}>
            <div className="absolute inset-y-0 left-0 w-[8px]" style={{ background: accent, boxShadow: `0 0 28px ${accent}` }} />
            <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${accent}16, rgba(0,0,0,.72) 38%, rgba(255,216,102,.06))` }} />
            <div className="relative flex h-full items-center gap-6 px-8">
              <PlayerVisual photo={winnerPhoto} flag={showFlag ? match.winner.flag || country : undefined} name={winnerName} accent={accent} side={blueWon ? "blue" : "red"} />
              <div className="min-w-0 flex-1">
                <div className="font-display text-[13px] font-black tracking-[.28em]" style={{ color: accent }}>WINNER · {blueWon ? "BLUE" : "RED"}</div>
                <div className="mt-2 truncate font-display text-[58px] font-black uppercase leading-none tracking-[.02em] text-white" style={{ textShadow: `0 0 24px ${accent}28` }}>{winnerName}</div>
                <div className="mt-4 flex items-center gap-5 font-display text-[15px] font-black uppercase tracking-[.12em] text-white/55">
                  {showClub && club !== "—" && <span>{club}</span>}
                  {country !== "—" && <span>{country}</span>}
                  {match.winner.number && <span>#{match.winner.number}</span>}
                </div>
              </div>
              <div className="w-[330px] shrink-0 text-right">
                <div className="font-display text-[11px] font-black tracking-[.22em] text-[#ffd866]">CHAMPIONSHIP RESULT</div>
                <div className="mt-3 font-display text-[34px] font-black text-white">{resultLabel}</div>
                <div className="mt-2 font-display text-[12px] font-bold tracking-[.16em] text-white/45">{match.category || "—"}{match.ring ? ` · MAT ${match.ring}` : ""}</div>
              </div>
            </div>
            <div className="absolute inset-y-0 left-0 w-[28%] bg-gradient-to-r from-transparent via-white/5 to-transparent" style={{ animation: "goldSweep 4s ease-in-out 1.5s infinite" }} />
          </section>
        </div>
      </div>
    </main>
  );
}
