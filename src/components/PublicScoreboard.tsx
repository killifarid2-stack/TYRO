import { getRestPhase, getRestPhaseLabel } from '@/lib/rest-phase';
import React, { useEffect, useState, useRef } from 'react';
import { useMatch, isPublicDisplayWindow } from '@/context/MatchContext';
import { formatTime, getCurrentRoundScore, getRotationEntryForRound } from '@/lib/match-engine';
import { PlayerColor, MATCH_STAGE_LABELS, COMPETITION_MODE_LABELS, DEFAULT_DISPLAY_CONFIG, DEFAULT_CALL_DISPLAY_CONFIG } from '@/types/tkd';
import { Maximize, Settings as SettingsIcon, QrCode as QrIcon, X, Video, Swords, Scale, User, Trophy, Users, ClipboardCheck, Clock, ShieldCheck, Cpu, Wifi, WifiOff, ArrowRight, Star, AlertTriangle } from 'lucide-react';
import { supabase, ensureRealtimeSession } from '@/integrations/supabase/client';
import { loadTournamentLocal, saveTournamentLocal, isLocalTournamentId, getExternalDisplayColors } from '@/lib/tournament-local';
import { QRCodeSVG } from 'qrcode.react';
import FlagImage from './FlagImage';
import MatchupOverlay from './MatchupOverlay';
import ExactPlayerCallBroadcast from './ExactPlayerCallBroadcast';
import ExactPlayerCallV515 from './player-call/ExactPlayerCallV515';
import ParEquipePlayerCallV515 from './player-call/ParEquipePlayerCallV515';
import NextOnMatchOverlay from './NextOnMatchOverlay';
import CallEventBadges from './CallEventBadges';
import judgeDecisionBlueArmUrl from '@/assets/judge-decision/blue-arm.png';
import judgeDecisionRedArmUrl from '@/assets/judge-decision/red-arm.png';
import { PlayerChangeAnimation } from './player-call/player-change-animation';
import LiveTeamCallBroadcast from './broadcast-new/LiveTeamCallBroadcast';
import DoctorCallAnimation from './DoctorCallAnimation';
import KyeshiCallAnimation from './KyeshiCallAnimation';
import { formatPlayerName, type NameFormat } from '@/lib/playerName';
import { ANIMATION_ASSETS } from '@/assets/animations';

/** Player photo with a real fallback to the nationality flag — not just a
 *  blank space — when the photo URL is missing, invalid, or fails to load
 *  (expired blob URL, bad link, etc). Previously a broken photo URL just
 *  hid itself via onError with nothing in its place, even though a flag
 *  should have been shown instead. */
import type { MatchData } from './individual-result/types';
import { IndividualWinnerAnimation } from './individual-result/IndividualWinnerAnimation';

function PhotoOrFlag({ photoUrl, nationality, showPhoto, showFlag, size, className }: {
  photoUrl?: string; nationality?: string; showPhoto: boolean; showFlag: boolean;
  size: { width: string; height: string; flagWidth?: string };
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [photoUrl]);
  if (showPhoto && photoUrl && !failed) {
    return (
      <img src={photoUrl} alt="" className={className} style={{ height: size.height, width: size.width }}
        onError={() => setFailed(true)} />
    );
  }
  if (showFlag) {
    return (
      <FlagImage code={nationality || ''} size={160} className={className}
        style={{ height: size.height, width: size.flagWidth || size.width } as any} />
    );
  }
  return null;
}
import { sounds, announcer } from '@/lib/sounds';
import { useI18n } from '@/lib/i18n';
import MatBroadcastScreen from './MatBroadcastScreen';
import { getBroadcastDisplayMode, getBroadcastDisplayConfig } from '@/lib/broadcast-display';
import { useBroadcastViewport } from '@/lib/broadcast-viewport';
import appIconUrl from '@/assets/app-icon.png';
import splashBannerUrl from '@/assets/splash-banner.png';
import medalWabTkdUrl from '@/assets/medal-transparent.png';
// Real equipment photography for the Hit Statistics panel (spectator screen).
// Blue = chung, Red = hong — never swapped, never replaced with generic icons.
import gloveBlueUrl from '@/assets/hit-stats/glove-blue.png';
import gloveRedUrl from '@/assets/hit-stats/glove-red.png';
import huguBlueUrl from '@/assets/hit-stats/hogu-blue.png';
import huguRedUrl from '@/assets/hit-stats/hogu-red.png';
import headgearBlueUrl from '@/assets/hit-stats/headgear-blue.png';
import headgearRedUrl from '@/assets/hit-stats/headgear-red.png';
// Custom Video Replay cards supplied for the Public Display. Blue = replay available; red = no replay remaining.
import videoReplayAvailableBlueUrl from '@/assets/hit-stats/video-replay-available-blue.png';
import videoReplayUnavailableRedUrl from '@/assets/hit-stats/video-replay-unavailable-red.png';
// Dedicated Judge Decision arms — blue/red, used by the existing cinematic IVR decision animation.
import koRedLogoUrl from '@/assets/ko/ko-red.png';
import koBlueLogoUrl from '@/assets/ko/ko-blue.png';
import wooseGirokArmsUrl from '@/assets/woose-girok-arms.png';

function broadcastName(value: string | undefined, format: NameFormat, fallback?: string): string {
  return formatPlayerName(value || '', format) || fallback || '—';
}


// ===== HIT ICON (realistic silhouettes — fist / chest guard / head guard) =====
function HitIcon({ kind, size = 22 }: { kind: 'punch' | 'body' | 'head'; size?: number }) {
  const s = { width: size, height: size, display: 'block' as const };
  if (kind === 'punch') return (
    // KPNP-style padded fist protector — matches hogu/head guard aesthetic
    <svg viewBox="0 0 32 32" style={s} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      {/* Forearm cuff (like hogu belt) */}
      <path d="M9 23h14v4a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 9 27v-4z" fill="currentColor" fillOpacity="0.5"/>
      <path d="M9 23h14v4a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 9 27v-4z"/>
      {/* KPNP-style center stripe on cuff (mirrors hogu center panel) */}
      <rect x="15" y="23" width="2" height="5.5" fill="hsl(0 0% 100%)" fillOpacity="0.75" stroke="none"/>
      {/* Padded glove body — rounded plated shell */}
      <path d="M8 13.5c0-2.6 2-4.5 4.5-4.5h7c2.5 0 4.5 1.9 4.5 4.5V22c0 .6-.5 1-1 1H9c-.6 0-1-.4-1-1v-8.5z" fill="currentColor" fillOpacity="0.55"/>
      <path d="M8 13.5c0-2.6 2-4.5 4.5-4.5h7c2.5 0 4.5 1.9 4.5 4.5V22c0 .6-.5 1-1 1H9c-.6 0-1-.4-1-1v-8.5z"/>
      {/* Segmented knuckle plates (like hogu plate seams) */}
      <path d="M12 12.5v9M16 11.8v9.2M20 12.5v9" strokeOpacity="0.85" strokeWidth="1"/>
      {/* Top knuckle highlights */}
      <path d="M10.5 12.2c.6-1.4 1.7-2.2 3-2.2M14.5 11.4c.5-1.1 1.5-1.6 2.5-1.6M18.5 11.4c1 0 2 .5 2.5 1.6" strokeOpacity="0.9" stroke="hsl(0 0% 100%)" strokeWidth="0.8"/>
      {/* Thumb pad */}
      <path d="M8 16c-1.7 0-3 1.1-3 2.6s1.3 2.6 3 2.6" fill="currentColor" fillOpacity="0.55"/>
      <path d="M8 16c-1.7 0-3 1.1-3 2.6s1.3 2.6 3 2.6"/>
    </svg>
  );
  if (kind === 'body') return (
    // Hogu (chest guard) — segmented plates + target
    <svg viewBox="0 0 32 32" style={s} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Shoulder straps */}
      <path d="M9 6l3 3M23 6l-3 3" strokeWidth="2"/>
      {/* Main hogu body */}
      <path d="M7 9l5-2h8l5 2v10c0 4.4-3.6 8-8 8h-2c-4.4 0-8-3.6-8-8V9z" fill="currentColor" fillOpacity="0.35"/>
      <path d="M7 9l5-2h8l5 2v10c0 4.4-3.6 8-8 8h-2c-4.4 0-8-3.6-8-8V9z"/>
      {/* Vertical center seam */}
      <line x1="16" y1="7" x2="16" y2="27" strokeOpacity="0.7"/>
      {/* Horizontal plate seams */}
      <path d="M7.5 14h17M8 19h16" strokeOpacity="0.5"/>
      {/* Target ring */}
      <circle cx="16" cy="16.5" r="3.6" fill="currentColor" fillOpacity="0.9"/>
      <circle cx="16" cy="16.5" r="2.2" fill="hsl(0 0% 100%)" fillOpacity="0.85"/>
      <circle cx="16" cy="16.5" r="1" fill="currentColor"/>
    </svg>
  );
  return (
    // Head guard (helmet) — side/front hybrid with cheek + chin strap + target
    <svg viewBox="0 0 32 32" style={s} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Skull dome */}
      <path d="M6 15a10 10 0 0 1 20 0v4H6v-4z" fill="currentColor" fillOpacity="0.3"/>
      <path d="M6 15a10 10 0 0 1 20 0v4H6v-4z"/>
      {/* Cheek + jaw guard */}
      <path d="M8 19v3a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-3" fill="currentColor" fillOpacity="0.2"/>
      <path d="M8 19v3a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-3"/>
      {/* Ear cutout */}
      <circle cx="9" cy="17" r="1.4" fill="currentColor" fillOpacity="0.9"/>
      <circle cx="23" cy="17" r="1.4" fill="currentColor" fillOpacity="0.9"/>
      {/* Chin strap */}
      <path d="M11 25l1.5 2h7L21 25" strokeOpacity="0.7"/>
      {/* Face opening arch */}
      <path d="M11 19h10" strokeOpacity="0.6"/>
      {/* Target ring on forehead */}
      <circle cx="16" cy="13" r="3" fill="currentColor" fillOpacity="0.9"/>
      <circle cx="16" cy="13" r="1.7" fill="hsl(0 0% 100%)" fillOpacity="0.85"/>
      <circle cx="16" cy="13" r="0.8" fill="currentColor"/>
    </svg>
  );
}


// ===== HIT STATS CHIP — real equipment photos, replaces the old generic
// SVG icon chips in the corners of each score panel. =====
// Read-only display of Punch / Body / Head hit counts. Data comes straight
// from getHitCounts() (derived from state.events, the single source of
// truth for the match) — this component never keeps its own counters.
const HIT_STAT_EQUIPMENT: Record<'punch' | 'body' | 'head', { chung: string; hong: string; labelKey: 'broadcastPunch' | 'broadcastBody' | 'broadcastHead' }> = {
  punch: { chung: gloveBlueUrl, hong: gloveRedUrl, labelKey: 'broadcastPunch' },
  body: { chung: huguBlueUrl, hong: huguRedUrl, labelKey: 'broadcastBody' },
  head: { chung: headgearBlueUrl, hong: headgearRedUrl, labelKey: 'broadcastHead' },
};

function HitStatChip({ kind, count, side, pulseKey, reverse, size = 22 }: {
  kind: 'punch' | 'body' | 'head';
  count: number;
  side: 'chung' | 'hong';
  pulseKey: number; // increments each time this stat goes up -> replays the glow
  reverse?: boolean; // true = number first then icon (used on the HONG/right-aligned side)
  size?: number; // wired to the existing admin "Hit icon (px)" slider (displaySettings.hitIconSize)
}) {
  const { t } = useI18n();
  const eq = HIT_STAT_EQUIPMENT[kind];
  const img = side === 'chung' ? eq.chung : eq.hong;
  const accent = side === 'chung' ? 'hsl(217 91% 78%)' : 'hsl(0 80% 82%)';
  const display = String(Math.max(0, count)).padStart(2, '0');
  const iconEl = (
    <img key="icon" data-wab-layer-id={`hit-stats-icon-${kind}-${side}`} src={img} alt={t(eq.labelKey)} draggable={false} style={{
      width: size, height: size, objectFit: 'contain',
    }} />
  );
  const numEl = (
    <span key="num" className="hs-chip-num font-display font-black text-white tabular-nums" style={{
      fontSize: 'clamp(14px, 1.1vw, 20px)', minWidth: 22, textAlign: reverse ? 'left' : 'right',
    }}>{display}</span>
  );
  return (
    <div key={pulseKey} className="hs-chip flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{
      background: 'rgba(0,0,0,0.5)', border: '1.5px solid rgba(255,255,255,0.25)', color: accent,
      animation: pulseKey > 0 ? 'hsChipGlow 480ms cubic-bezier(0.22,1,0.36,1)' : 'none',
    }}>
      {reverse ? [numEl, iconEl] : [iconEl, numEl]}
      <style>{`
        @keyframes hsChipGlow {
          0% { box-shadow: none; }
          30% { box-shadow: 0 0 18px ${accent}; }
          100% { box-shadow: none; }
        }
      `}</style>
    </div>
  );
}

// ===== VIDEO REPLAY QUOTA — state-driven visual indicator =====
// Shows one artwork per available replay card. Used cards remain visible but
// transition to a dark/inactive state so the operator/spectator can see the
// original quota at a glance. The icon size scales down gently as the number
// of cards grows; no new image assets are created.
function VideoReplayQuota({
  quota,
  totalQuota,
  side,
}: {
  quota: number;
  totalQuota: number;
  side: 'chung' | 'hong';
}) {
  const { t } = useI18n();
  const total = Math.max(0, Math.min(12, Math.floor(totalQuota || 0)));
  if (total === 0) return null;
  const remaining = Math.max(0, Math.min(total, Math.floor(quota || 0)));
  const base = total <= 2 ? 50 : total <= 4 ? 43 : total <= 6 ? 37 : total <= 8 ? 32 : 28;
  const asset = side === 'chung' ? videoReplayAvailableBlueUrl : videoReplayUnavailableRedUrl;
  const accent = side === 'chung' ? 'hsl(217 91% 60%)' : 'hsl(0 85% 55%)';

  return (
    <div
      className={`video-replay-quota video-replay-quota-${side}`}
      aria-label={`${remaining} of ${total} video replay cards available`}
      style={{ '--vr-size': `${base}px`, '--vr-accent': accent } as React.CSSProperties}
    >
      {Array.from({ length: total }, (_, i) => {
        const available = i < remaining;
        return (
          <div key={`${side}-ivr-${i}`} className={`video-replay-card ${available ? 'is-available' : 'is-used'}`}
            title={available ? t('broadcastReplayAvailable') : t('broadcastReplayUsed')}>
            <img data-wab-layer-id={`video-replay-quota-icon-${side}`} src={asset} alt="" draggable={false} />
          </div>
        );
      })}
    </div>
  );
}

// ===== CONFETTI =====
function Confetti({ color }: { color: 'chung' | 'hong' }) {
  const particles = useRef(
    Array.from({ length: 80 }, (_, i) => ({
      id: i, x: Math.random() * 100, delay: Math.random() * 4,
      duration: 2.5 + Math.random() * 3, size: 4 + Math.random() * 10,
      hue: color === 'chung' ? 200 + Math.random() * 40 : Math.random() * 40,
      rotation: Math.random() * 360,
    }))
  ).current;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {particles.map(p => (
        <div key={p.id} className="absolute" style={{
          left: `${p.x}%`, top: '-12px', width: p.size, height: p.size * 0.5,
          background: `hsl(${p.hue} 85% 60%)`, borderRadius: 2,
          animation: `confettiFall ${p.duration}s ${p.delay}s linear infinite`,
          transform: `rotate(${p.rotation}deg)`,
        }} />
      ))}
      <style>{`@keyframes confettiFall { 0%{transform:translateY(0) rotate(0deg);opacity:1} 100%{transform:translateY(110vh) rotate(900deg);opacity:0} }`}</style>
    </div>
  );
}

// ===== LIGHT PARTICLES =====
function LightParticles({ color }: { color: string }) {
  const dots = useRef(
    Array.from({ length: 30 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: 2 + Math.random() * 4, delay: Math.random() * 5, duration: 3 + Math.random() * 4,
    }))
  ).current;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-5">
      {dots.map(d => (
        <div key={d.id} className="absolute rounded-full" style={{
          left: `${d.x}%`, top: `${d.y}%`, width: d.size, height: d.size,
          background: color, opacity: 0.4,
          animation: `particleFloat ${d.duration}s ${d.delay}s ease-in-out infinite alternate`,
        }} />
      ))}
      <style>{`@keyframes particleFloat { 0%{transform:translateY(0) scale(1);opacity:0.2} 50%{opacity:0.6} 100%{transform:translateY(-40px) scale(1.5);opacity:0.1} }`}</style>
    </div>
  );
}

// ===== ENTRY FREEZE — brief pre-reveal build-up for Par Équipe endings =====
// Match freezes → VS mark pulses once → screen darkens, then fades out to
// hand off to the champion reveal beneath it once winnerScale kicks in.
function EntryFreeze({ vsPulse, dark, done }: { vsPulse: boolean; dark: boolean; done: boolean }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none" style={{
      background: dark ? 'hsl(224 40% 2% / 0.92)' : 'transparent',
      opacity: done ? 0 : 1,
      transition: done ? 'opacity 0.55s ease-out' : 'background 0.55s ease-in',
    }}>
      <div className="font-display font-black" style={{
        fontSize: 'clamp(48px,8vw,96px)', color: 'hsl(0 0% 100%)',
        textShadow: '0 0 60px hsl(0 0% 100% / 0.8)',
        animation: vsPulse ? 'entryVsPulse 0.6s ease-out both' : 'none',
        opacity: vsPulse ? 1 : 0,
      }}>VS</div>
      <style>{`@keyframes entryVsPulse { 0%{ transform: scale(1); opacity: 0.9; } 45%{ transform: scale(1.4); opacity: 1; } 100%{ transform: scale(1); opacity: 0; } }`}</style>
    </div>
  );
}


function TeamWinnerScreen({ state, winner, winnerScale, isMiniPreview = false }: { state: any; winner: PlayerColor; winnerScale: boolean; isMiniPreview?: boolean }) {
  const { t } = useI18n();
  // Same convention as ScoreboardView (this screen's parent): "public
  // window" means the actual Electron/browser public-display window, OR a
  // mini preview standing in for it (e.g. inside the Broadcast Design
  // Studio or Operator screen). TeamWinnerScreen is a separate function
  // component, so it can't read ScoreboardView's local isPublicWindow —
  // it computes the same value itself from its own isMiniPreview prop.
  const isPublicWindow = isPublicDisplayWindow() || isMiniPreview;
  // FINAL BROADCAST TEMPLATE: RED is always LEFT, BLUE is always RIGHT on
  // the audience display — matching Player Call, the live match screen,
  // and every other screen in the app. The result is information-driven
  // with a premium medal reveal; no cup/trophy is used anywhere in the
  // winner presentation.
  const redSide: PlayerColor = 'hong';
  const blueSide: PlayerColor = 'chung';
  const rounds = Math.max(state.config?.rounds || 3, state.roundWinners?.length || 0);
  const medalUrl = medalWabTkdUrl;

  const meta = (side: PlayerColor) => {
    const p = state[side]?.player || {};
    const roster = (state.teamRoster?.[side] || []) as any[];
    return {
      teamName: state.teamNames?.[side] || (side === redSide ? 'RED TEAM' : 'BLUE TEAM'),
      clubName: state.clubNames?.[side] || p.club || 'CLUB',
      teamLogo: state.teamLogos?.[side] || p.teamLogo,
      clubLogo: state.clubLogos?.[side] || p.clubLogo,
      country: state.teamCountry?.[side] || p.nationality,
      roster,
      score: side === blueSide ? state.chung.totalScore : state.hong.totalScore,
      // Best-of-N match result = rounds WON, not raw point total — counted
      // straight from the real per-round record (state.roundWinners), same
      // source the ROUND RESULTS grid below reads from.
      roundsWon: (state.roundWinners || []).filter((r: any) => r.winner === side).length,
      color: side === redSide ? '#d33a45' : '#2467d6',
    };
  };

  const red = meta(redSide);
  const blue = meta(blueSide);
  const redWon = winner === redSide;

  const roundScore = (side: PlayerColor, round: number) => {
    const rw = state.roundWinners?.find((r: any) => r.round === round);
    if (!rw) return '—';
    return side === blueSide ? (rw.chungScore ?? '—') : (rw.hongScore ?? '—');
  };

  const playerRoundScore = (p: any, round: number) => {
    const direct = p?.roundScores?.find?.((r: any) => r.round === round);
    return direct?.score ?? '—';
  };

  const PlayerCard = ({ p, side, index }: { p: any; side: PlayerColor; index: number }) => {
    const c = side === redSide ? red.color : blue.color;
    const initials = (p?.name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((x: string) => x[0]).join('').toUpperCase();
    return (
      <div className="relative overflow-hidden rounded-xl" style={{
        border: `2px solid ${c}`,
        background: `linear-gradient(160deg, ${c}22, rgba(3,7,15,.97) 38%, rgba(0,0,0,.98))`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,.08), inset 0 0 22px ${c}12, 0 8px 22px rgba(0,0,0,.4), 0 0 14px ${c}25`,
      }}>
        <div className="absolute left-2 top-2 z-10 rounded-md px-2 py-1 font-display font-black" style={{ background: c, color: '#05070b', fontSize: 10 }}>
          {index + 1}
        </div>
        <div className="p-2">
          {p?.photo ? (
            <img data-wab-layer-id={`team-call-roster-photo-${side}-${index}`} src={p.photo} alt="" className="w-full object-cover rounded-lg" style={{ aspectRatio: '1 / 1.08', border: `1px solid ${c}75` }} />
          ) : (
            <div className="w-full rounded-lg flex items-center justify-center font-display font-black" style={{ aspectRatio: '1 / 1.08', border: `1px solid ${c}65`, background: `${c}12`, color: c, fontSize: 28 }}>
              {initials}
            </div>
          )}
          <div className="mt-2 text-center font-display font-black text-white leading-tight truncate" style={{ fontSize: 'clamp(10px, 1vw, 16px)' }}>
            {p?.name || 'PLAYER'}
          </div>
          <div className="mt-1 flex items-center justify-center gap-1.5 text-white/60 font-display" style={{ fontSize: 9 }}>
            {p?.nationality && <FlagImage code={p.nationality} size={16} className="rounded" />}
            <span>{p?.nationality || '—'}</span>
          </div>
          <div className="mt-1.5 flex items-center justify-center gap-1.5 flex-wrap font-display" style={{ fontSize: 8 }}>
            {(p?.weight || state.weightCategory) && <span className="px-2 py-0.5 rounded-full text-white/70" style={{ border: '1px solid rgba(255,255,255,.14)' }}>{p?.weight || state.weightCategory}</span>}
            {p?.rank && <span className="px-2 py-0.5 rounded-full" style={{ border: `1px solid ${c}70`, color: '#ffd866' }}>RANK {p.rank}</span>}
          </div>
          <div className="mt-2 grid grid-cols-4 gap-1 rounded-lg p-1" style={{ background: 'rgba(0,0,0,.30)', border: '1px solid rgba(255,255,255,.08)' }}>
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="text-center rounded-md py-1" style={{ background: `${c}0c` }}>
                <div className="text-white/35 font-display" style={{ fontSize: 7 }}>R{i + 1}</div>
                <div className="font-display font-black" style={{ color: c, fontSize: 11 }}>{playerRoundScore(p, i + 1)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const TeamPanel = ({ side }: { side: PlayerColor }) => {
    const m = side === redSide ? red : blue;
    const isWinner = winner === side;
    return (
      <section className="relative min-w-0 rounded-2xl overflow-hidden" style={{
        border: `3px solid ${m.color}${isWinner ? 'ff' : '90'}`,
        background: `linear-gradient(160deg, ${m.color}${isWinner ? '22' : '0d'} 0%, rgba(4,6,10,.97) 40%, rgba(0,0,0,.99) 100%)`,
        boxShadow: isWinner
          ? `0 0 40px ${m.color}45, 0 14px 30px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.1), inset 0 0 30px ${m.color}12`
          : `0 0 18px ${m.color}08`,
        opacity: isWinner ? 1 : 0.62,
        filter: isWinner ? 'none' : 'grayscale(.65) brightness(.58)',
        transition: 'opacity .8s ease, filter .8s ease',
        animation: isWinner ? `${side === redSide ? 'teamGlowPulseRed' : 'teamGlowPulseBlue'} 3s ease-in-out 1s infinite` : undefined,
      }}>
        {/* Corner accent brackets — same broadcast-frame language as Player Call */}
        {isWinner && [['top','left' as const],['top','right' as const],['bottom','left' as const],['bottom','right' as const]].map(([v,h]) => (
          <div key={`${v}-${h}`} className="absolute w-9 h-9 pointer-events-none z-10" style={{
            [v]: -3, [h]: -3,
            borderTop: v==='top' ? `4px solid ${m.color}` : 'none',
            borderBottom: v==='bottom' ? `4px solid ${m.color}` : 'none',
            borderLeft: h==='left' ? `4px solid ${m.color}` : 'none',
            borderRight: h==='right' ? `4px solid ${m.color}` : 'none',
            filter: `drop-shadow(0 0 10px ${m.color})`,
          } as any} />
        ))}
        {/* Periodic light sweep on the winning panel */}
        {isWinner && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-y-0 w-1/4" style={{
              left: '-30%',
              background: 'linear-gradient(100deg, transparent, rgba(255,255,255,.1) 45%, rgba(255,255,255,.18) 50%, rgba(255,255,255,.1) 55%, transparent)',
              animation: 'cardLightSweep 4s ease-in-out 1.8s infinite',
            }} />
          </div>
        )}
        <div className="h-1" style={{ background: `linear-gradient(90deg, transparent, ${m.color}, #fff8, ${m.color}, transparent)` }} />
        <div className="p-3 md:p-4">
          <div className="text-center font-display font-black tracking-[.24em]" style={{ color: isWinner ? '#ffd866' : 'rgba(255,255,255,.55)', fontSize: 10 }}>
            {isWinner ? t('broadcastWinningTeam') : t('broadcastLosingTeam')}
          </div>
          <div className="flex items-center justify-center gap-3 mt-2">
            {m.teamLogo && <img data-wab-layer-id={`match-result-team-logo-${side}`} src={m.teamLogo} alt="" className="object-contain rounded-xl" style={{ width: 'clamp(54px, 5vw, 78px)', height: 'clamp(54px, 5vw, 78px)', border: `2px solid ${m.color}90`, background: '#02050a' }} />}
            {m.clubLogo && m.clubLogo !== m.teamLogo && <img data-wab-layer-id={`match-result-club-logo-${side}`} src={m.clubLogo} alt="" className="object-contain rounded-lg" style={{ width: 'clamp(34px, 3vw, 46px)', height: 'clamp(34px, 3vw, 46px)', border: `1px solid ${m.color}70`, background: '#02050a' }} />}
          </div>
          <div className="text-center font-display font-black text-white mt-2 truncate" style={{ fontSize: 'clamp(18px, 2vw, 30px)' }}>{m.teamName}</div>
          {m.clubName && m.clubName !== 'CLUB' && <div className="text-center font-display font-bold mt-0.5 truncate" style={{ color: m.color, fontSize: 'clamp(10px, 1vw, 15px)' }}>{m.clubName}</div>}
          <div className="flex items-center justify-center gap-2 mt-1 text-white/70 font-display" style={{ fontSize: 10 }}>
            {m.country && <FlagImage code={m.country} size={18} className="rounded" />}
            {m.country && <span>{m.country}</span>}
          </div>
          <div className="mt-2 grid grid-cols-3 rounded-lg overflow-hidden" style={{ border: `1px solid ${m.color}40` }}>
            <div className="text-center py-1.5" style={{ borderRight: `1px solid ${m.color}30` }}><div className="text-white/40 font-display" style={{ fontSize: 7 }} >{t('broadcastPoints')}</div><div className="font-display font-black" style={{ color: m.color, fontSize: 19 }}>{m.score}</div></div>
            <div className="text-center py-1.5" style={{ borderRight: `1px solid ${m.color}30` }}><div className="text-white/40 font-display" style={{ fontSize: 7 }} >{t('broadcastWins')}</div><div className="font-display font-black text-white" style={{ fontSize: 16 }}>{state.roundWinners?.filter((r: any) => r.winner === side).length || 0}</div></div>
            <div className="text-center py-1.5"><div className="text-white/40 font-display" style={{ fontSize: 7 }} >{t('broadcastStatus')}</div><div className="font-display font-black" style={{ color: isWinner ? '#ffd866' : '#fff', fontSize: 11 }}>{isWinner ? t('broadcastWinner') : t('broadcastFinal')}</div></div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {m.roster.slice(0, 3).map((p: any, i: number) => <PlayerCard key={`${p?.name || 'player'}-${i}`} p={p} side={side} index={i} />)}
          </div>
        </div>
      </section>
    );
  };

  const openAudience = async () => { try { await window.electronAPI?.openPublicDisplay?.(); } catch {} };
  const fullScreen = async () => { try { if (!document.fullscreenElement) await document.documentElement.requestFullscreen(); } catch {} };

  return (
    <div className="fixed inset-0 overflow-hidden text-white" style={{ background: '#01040a', fontFamily: 'Inter, Cairo, sans-serif' }}>
      {/* Atmospheric background image behind the arena gradients — adds
          depth without ever competing with the score/roster content. */}
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.20 }}>
        <img data-wab-layer-id="winner-background-banner" src={splashBannerUrl} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'blur(3px) saturate(1.2)' }} />
      </div>
      {/* Static arena background: strong red/blue sides, gold center, no explosions. */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 48%, rgba(255,207,73,.24), transparent 22%), linear-gradient(90deg, rgba(45,125,246,.30) 0%, rgba(45,125,246,.10) 30%, transparent 44%, transparent 56%, rgba(239,51,64,.10) 70%, rgba(239,51,64,.30) 100%)' }} />
      <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)', backgroundSize: '52px 52px' }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 80%, rgba(255,180,20,.16), transparent 40%), linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.58))' }} />
      <div className="absolute inset-3 pointer-events-none rounded-2xl" style={{ border: '2px solid rgba(255,216,102,.6)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.06), inset 0 0 90px rgba(255,200,60,.08), 0 0 40px rgba(255,200,60,.1)' }} />

      <div className="relative z-10 h-full flex flex-col p-3 md:p-5 gap-3">
        <header className="flex items-center justify-between px-2 md:px-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <img data-wab-layer-id="winner-header-logo" src={appIconUrl} alt="" className="w-10 h-10 md:w-12 md:h-12 rounded-xl" />
            <div className="leading-tight hidden sm:block"><div className="font-display font-black tracking-wider text-white" style={{ fontSize: 14 }}>WAB-TKD</div><div className="text-[8px] text-white/45 tracking-[.16em] uppercase">{t('broadcastWorldAdvanced')}</div></div>
          </div>
          <div className="text-center">
            <div className="font-display font-black tracking-[.16em]" style={{ fontSize: 'clamp(34px, 5vw, 72px)', color: '#ffd866', lineHeight: .82, textShadow: '0 0 22px rgba(255,210,90,.45)' }} >{t('broadcastWinner')}</div>
            <div className="font-display font-bold tracking-[.3em] text-white/85 mt-2" style={{ fontSize: 'clamp(9px, 1vw, 14px)' }} >{t('broadcastEnded')}</div>
          </div>
          <div className="text-right hidden sm:block"><div className="font-display font-black tracking-wider text-white" style={{ fontSize: 14 }} >{t('broadcastWorldArena')}</div><div className="text-[8px] text-white/45 tracking-[.16em] uppercase" >{t('broadcastLabel')}</div></div>
        </header>

        <div className="flex-1 min-h-0 grid grid-cols-[minmax(0,1fr)_minmax(250px,.78fr)_minmax(0,1fr)] gap-3 items-stretch">
          <TeamPanel side={redSide} />

          <section className="relative min-w-0 rounded-2xl overflow-hidden flex flex-col items-center justify-center" style={{ border: '3px solid rgba(255,216,102,.65)', background: 'linear-gradient(160deg, rgba(255,202,64,.12), rgba(2,6,13,.88) 42%, rgba(0,0,0,.97))', boxShadow: '0 0 48px rgba(255,194,35,.22), inset 0 1px 0 rgba(255,255,255,.1), inset 0 0 40px rgba(255,214,90,.06)' }}>
            {/* Corner accent brackets — same broadcast-frame language as the team panels and Player Call */}
            {[['top','left' as const],['top','right' as const],['bottom','left' as const],['bottom','right' as const]].map(([v,h]) => (
              <div key={`${v}-${h}`} className="absolute w-8 h-8 pointer-events-none z-30" style={{
                [v]: -3, [h]: -3,
                borderTop: v==='top' ? '3px solid #ffd866' : 'none',
                borderBottom: v==='bottom' ? '3px solid #ffd866' : 'none',
                borderLeft: h==='left' ? '3px solid #ffd866' : 'none',
                borderRight: h==='right' ? '3px solid #ffd866' : 'none',
                filter: 'drop-shadow(0 0 8px #ffd866)',
              } as any} />
            ))}
            <div className="absolute inset-x-0 top-0 h-1" style={{ background: 'linear-gradient(90deg, transparent, #ffd866, #fff6c0, #ffd866, transparent)' }} />
            <style>{`
              @keyframes teamMedalEnter { 0%{opacity:0;transform:scale(.62) rotate(-10deg)} 70%{opacity:1;transform:scale(1.08) rotate(2deg)} 100%{opacity:1;transform:scale(1) rotate(0)} }
              @keyframes teamMedalFloat { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-8px) rotate(1deg)} }
              @keyframes teamGoldSweep { 0%{transform:translateX(-120%)} 100%{transform:translateX(120%)}}
            `}</style>
            {/* Premium medal spotlight — award object only, never a cup/trophy. */}
            <div className="absolute pointer-events-none" style={{
              width: 'min(60vw, 900px)', height: 'min(60vw, 900px)', top: '38%', left: '50%',
              transform: 'translate(-50%,-50%)',
              background: 'conic-gradient(from 0deg, transparent, rgba(255,216,102,.10), transparent 12%, transparent 50%, rgba(255,216,102,.08), transparent 62%)',
              animation: 'vsRingSpin 22s linear infinite',
            }} />
            <div className="absolute inset-x-0 top-10 h-32 pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(255,219,110,.20), transparent 68%)' }} />
            {/* Rising sparkle particles around the trophy */}
            {[...Array(8)].map((_, i) => (
              <div key={i} className="absolute rounded-full pointer-events-none" style={{
                left: `${18 + (i * 11) % 64}%`, bottom: '8%',
                width: 2 + (i % 3), height: 2 + (i % 3),
                background: '#ffe9ab', boxShadow: '0 0 6px #ffd866',
                animation: `particleFloatGold ${4 + (i % 4)}s ease-in-out ${i * .5}s infinite`,
              }} />
            ))}
            <div className="font-display font-black tracking-[.24em] text-[#ffd866] relative z-20" style={{ fontSize: 10 }} >{state.competitionName || t('broadcastChampionship')}</div>
            <div className="relative z-20 flex items-center justify-center" style={{ width: 'min(31vw, 500px)', height: 'min(52vh, 500px)', animation: 'teamMedalEnter 0.9s cubic-bezier(.16,1,.3,1) .18s both' }}>
              <div className="absolute inset-[10%] rounded-full bg-[#ffd866]/10 blur-3xl" />
              <div className="absolute inset-[18%] rounded-full border border-[#ffd866]/25" style={{ boxShadow: '0 0 55px rgba(255,216,102,.18), inset 0 0 30px rgba(255,216,102,.08)' }} />
              <img data-wab-layer-id="winner-medal" src={medalUrl} alt="WAB-TKD championship medal" className="relative h-full w-full object-contain" style={{ filter: 'drop-shadow(0 0 24px rgba(255,240,180,.95)) drop-shadow(0 0 58px rgba(255,216,102,.62)) drop-shadow(0 0 95px rgba(255,170,0,.30))', animation: 'teamMedalFloat 3.4s ease-in-out .95s infinite' }} />
            </div>

          </section>

          <TeamPanel side={blueSide} />
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center shrink-0">
          <div className="rounded-xl p-2" style={{ border: '1px solid rgba(255,255,255,.12)', background: 'rgba(0,0,0,.62)' }}>
            <div className="grid gap-1 text-center font-display" style={{ gridTemplateColumns: `auto repeat(${rounds}, 1fr) auto` }}>
              <div className="text-white/40 text-[8px] py-1" >{t('broadcastRound')}</div>
              {Array.from({ length: rounds }, (_, idx) => idx + 1).map(i => <div key={i} className="text-white/45 text-[8px] py-1">R{i}</div>)}
              <div className="text-white/40 text-[8px] py-1" >{t('broadcastTotal')}</div>
            </div>
            <div className="grid gap-1 text-center font-display items-center" style={{ gridTemplateColumns: `auto repeat(${rounds}, 1fr) auto` }}>
              <div className="font-black text-[10px]" style={{ color: blue.color }}>{blue.teamName}</div>
              {Array.from({ length: rounds }, (_, idx) => idx + 1).map(i => <div key={i} className="font-black text-[13px]" style={{ color: blue.color }}>{roundScore(blueSide, i)}</div>)}
              <div className="font-black text-[16px]" style={{ color: blue.color }}>{blue.score}</div>
            </div>
            <div className="grid gap-1 text-center font-display items-center mt-1" style={{ gridTemplateColumns: `auto repeat(${rounds}, 1fr) auto` }}>
              <div className="font-black text-[10px]" style={{ color: red.color }}>{red.teamName}</div>
              {Array.from({ length: rounds }, (_, idx) => idx + 1).map(i => <div key={i} className="font-black text-[13px]" style={{ color: red.color }}>{roundScore(redSide, i)}</div>)}
              <div className="font-black text-[16px]" style={{ color: red.color }}>{red.score}</div>
            </div>
          </div>

          <div className="rounded-xl px-5 py-2 text-center min-w-[180px]" style={{ border: '1px solid rgba(255,216,102,.42)', background: 'rgba(0,0,0,.72)' }}>
            <div className="font-display text-white/45 tracking-[.16em]" style={{ fontSize: 8 }} >{t('broadcastMatchInformation')}</div>
            <div className="font-display font-bold text-white/85 mt-1" style={{ fontSize: 10 }}>{state.weightCategory || t('broadcastCategory')} • {state.config?.competitionMode === 'par_equipe' ? 'PAR ÉQUIPE' : 'MATCH'}</div>
            <div className="font-display text-white/45 mt-1" style={{ fontSize: 8 }}>{state.eventDate || t('broadcastDate')} • {state.eventLocation || t('broadcastWorldArena')}</div>
          </div>

          <div className="rounded-xl p-2" style={{ border: '1px solid rgba(255,255,255,.12)', background: 'rgba(0,0,0,.62)' }}>
            <div className="grid grid-cols-3 gap-2 text-center font-display">
              <div><div className="text-white/40 text-[8px]" >{t('broadcastMatchTime')}</div><div className="font-black text-[#ffd866] text-[13px]">{Math.floor((state.config?.roundTime || 120) / 60).toString().padStart(2,'0')}:{((state.config?.roundTime || 120) % 60).toString().padStart(2,'0')}</div></div>
              <div><div className="text-white/40 text-[8px]" >{t('broadcastJudges')}</div><div className="font-black text-emerald-400 text-[13px]">{state.connectedJudgeCount || state.config?.judgeCount || 0} / {state.config?.judgeCount || 3}</div></div>
              <div><div className="text-white/40 text-[8px]" >{t('broadcastReferee')}</div><div className="font-black text-emerald-400 text-[11px]" >{t('broadcastConnected')}</div></div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-2 shrink-0">
          <button onClick={openAudience} className="px-5 py-2 rounded-lg font-display font-black text-xs tracking-widest" style={{ border: '1px solid rgba(255,216,102,.65)', background: 'rgba(255,190,40,.12)', color: '#ffd866' }}>▣ {t('broadcastAudienceScoreboard')}</button>
          <button onClick={fullScreen} className="px-4 py-2 rounded-lg font-display font-bold text-xs" style={{ border: '1px solid rgba(255,255,255,.16)', background: 'rgba(0,0,0,.45)', color: 'rgba(255,255,255,.72)' }} >{t('broadcastFullScreen')}</button>
        </div>
      </div>
    </div>
  );
}

// TEAM RESULT CARD — an alternate Par Équipe result reveal, shown ON TOP OF
// (never replacing the code of) TeamWinnerScreen above, which stays
// untouched. The Main Referee toggles this on with a dedicated button once
// the team match has ended (state.showTeamResultCard). Same medal-card
// visual language as the individual match result card, except the photo
// slot shows the TEAM LOGO (falling back to the club logo, then the flag)
// instead of a player photo, with the team name and club name beside it.
function TeamResultCard({ state, winner, isMiniPreview = false }: { state: any; winner: PlayerColor; isMiniPreview?: boolean }) {
  const redSide: PlayerColor = 'hong';
  const blueSide: PlayerColor = 'chung';
  const rounds = Math.max(state.config?.rounds || 3, state.roundWinners?.length || 0);
  const meta = (side: PlayerColor) => {
    const p = state[side]?.player || {};
    return {
      teamName: state.teamNames?.[side] || (side === redSide ? 'RED TEAM' : 'BLUE TEAM'),
      clubName: state.clubNames?.[side] || p.club || '',
      teamLogo: state.teamLogos?.[side] || state.clubLogos?.[side],
      country: state.teamCountry?.[side] || p.nationality,
      roster: (state.teamRoster?.[side] || []) as any[],
      roundsWon: (state.roundWinners || []).filter((r: any) => r.winner === side).length,
      color: side === redSide ? '#d33a45' : '#2467d6',
    };
  };
  const red = meta(redSide);
  const blue = meta(blueSide);
  const win = winner === redSide ? red : blue;
  const winColor = winner === redSide ? 'hsl(0 72% 51%)' : 'hsl(217 91% 55%)';
  const competitionTypeLabel = state.config?.competitionMode === 'par_equipe' ? 'PAR ÉQUIPE' : 'NORMAL MATCH';
  const genderLabel = state.gender === 'female' ? 'WOMEN' : state.gender === 'male' ? 'MEN' : (state.gender || '—');
  const infoRows: [string, string][] = [
    ['TOURNAMENT TYPE', competitionTypeLabel],
    ['WEIGHT', state.weightCategory || '—'],
    ['MAT', state.matNumber ? `MAT ${String(state.matNumber).padStart(2, '0')}` : 'MAT 01'],
    ['MATCH NO.', state.matchNumber ? String(state.matchNumber).padStart(3, '0') : '---'],
    ['AGE', state.ageGroup || '—'],
    ['GENDER', genderLabel],
  ];

  return (
    <div dir="ltr" key="team-result-card" className={`fixed inset-0 flex flex-col overflow-hidden ${isMiniPreview ? 'public-scoreboard-mini' : ''}`}
      style={{
        background: `radial-gradient(ellipse at 50% 30%, ${winColor.replace(')', ' / 0.22)')}, transparent 55%), radial-gradient(ellipse at 50% 40%, hsl(224 40% 7%), hsl(224 45% 2%) 85%)`,
        animation: 'frameEnter 0.7s ease-out', color: '#fff',
      }}>
      <div className="fixed inset-3 pointer-events-none z-30" style={{ border: '1px solid hsl(45 93% 58% / 0.35)', borderRadius: 18, boxShadow: 'inset 0 0 60px hsl(45 93% 58% / 0.06)' }} />
      <style>{`@keyframes winnerMedalFloat { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-8px) rotate(1deg)} }`}</style>

      {/* Championship + match info bar — same information the audience saw
          throughout the match (tournament type, weight, mat, match no, age,
          gender), so the final card still reads as a complete broadcast
          graphic rather than a bare "who won" popup. */}
      <div className="shrink-0 flex items-center justify-between gap-4 px-6 py-3 flex-wrap" style={{ borderBottom: '1px solid rgba(255,216,102,.18)', background: 'rgba(0,0,0,.35)' }}>
        <div className="font-display font-black tracking-[.18em] text-white/90" style={{ fontSize: 15 }}>WAB-TKD <span className="text-white/40 font-bold" style={{ fontSize: 10 }}>WORLD TAEKWONDO SYSTEM</span></div>
        <div className="font-display font-black tracking-[.14em] text-[#ffd866] text-center" style={{ fontSize: 13 }}>{state.competitionName || 'WAB-TKD OPEN CHAMPIONSHIP'}</div>
        <div className="flex items-center gap-4 flex-wrap">
          {infoRows.map(([label, value]) => (
            <div key={label} className="text-center">
              <div className="text-white/35 font-display tracking-[.12em]" style={{ fontSize: 7 }}>{label}</div>
              <div className="font-display font-black text-white/85" style={{ fontSize: 11 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6 relative z-20 overflow-hidden">
        <div style={{ height: 'clamp(120px,16vh,200px)', filter: 'drop-shadow(0 0 18px rgba(255,226,120,.75)) drop-shadow(0 0 48px rgba(255,170,0,.35))' }}>
          <img src={medalWabTkdUrl} alt="WAB-TKD championship medal" className="h-full w-auto object-contain" style={{ animation: 'winnerMedalFloat 3s ease-in-out infinite' }} />
        </div>

        <div className="text-center">
          <div className="font-display font-black tracking-[.32em] text-[#ffd866]/80" style={{ fontSize: 11 }}>ROUNDS WON</div>
          <div className="flex items-center gap-10 mt-1">
            <div className="text-center"><div className="font-display font-black leading-none" style={{ fontSize: 'clamp(50px,9vw,90px)', color: 'hsl(0 80% 60%)', textShadow: '0 0 30px hsl(0 72% 51% / 0.5)' }}>{red.roundsWon}</div><div className="font-display text-white/35 tracking-[.2em]" style={{ fontSize: 10 }}>WINS</div></div>
            <div className="text-center"><div className="font-display font-black leading-none" style={{ fontSize: 'clamp(50px,9vw,90px)', color: 'hsl(217 91% 60%)', textShadow: '0 0 30px hsl(217 91% 55% / 0.5)' }}>{blue.roundsWon}</div><div className="font-display text-white/35 tracking-[.2em]" style={{ fontSize: 10 }}>WINS</div></div>
          </div>
        </div>

        {/* Photo slot → TEAM LOGO instead of a player photo, per request —
            falls back to the flag if no logo is set, never left blank. */}
        <div className="flex items-center gap-4 rounded-2xl px-6 py-4" style={{ border: `2px solid ${win.color}88`, background: 'rgba(0,0,0,.55)', boxShadow: `0 0 40px ${win.color}33` }}>
          <div className="rounded-xl overflow-hidden flex items-center justify-center bg-black/40" style={{ width: 'clamp(64px,8vw,110px)', height: 'clamp(64px,8vw,110px)' }}>
            {win.teamLogo ? <img src={win.teamLogo} alt="" className="w-full h-full object-contain" /> : <FlagImage code={win.country || ''} size={56} />}
          </div>
          <div className="text-left">
            <div className="font-display font-black" style={{ fontSize: 'clamp(22px,2.8vw,40px)', color: win.color }}>{win.teamName}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {win.country && <FlagImage code={win.country} size={16} className="rounded" />}
              {win.clubName && <div className="font-display text-white/55 tracking-[.1em]" style={{ fontSize: 13 }}>{win.clubName}</div>}
            </div>
          </div>
        </div>

        {/* Roster strip — the athletes who actually fought for the winning
            team, small photo chips beside the team card, so the champion
            card credits the real players, not just an abstract team name. */}
        {win.roster.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap justify-center max-w-3xl">
            {win.roster.slice(0, 8).map((p: any, i: number) => (
              <div key={i} className="flex items-center gap-1.5 rounded-full pr-3 pl-1 py-1" style={{ border: `1px solid ${win.color}55`, background: 'rgba(0,0,0,.5)' }}>
                {p?.photo ? (
                  <img src={p.photo} alt="" className="rounded-full object-cover" style={{ width: 26, height: 26, border: `1px solid ${win.color}80` }} />
                ) : (
                  <div className="rounded-full flex items-center justify-center font-display font-black" style={{ width: 26, height: 26, background: `${win.color}22`, color: win.color, fontSize: 10 }}>
                    {(p?.name || '?').slice(0, 1).toUpperCase()}
                  </div>
                )}
                <span className="font-display font-bold text-white/75" style={{ fontSize: 10 }}>{p?.name || 'PLAYER'}</span>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-xl px-4 py-2" style={{ border: '1px solid rgba(255,255,255,.12)', background: 'rgba(0,0,0,.5)' }}>
          <div className="text-center font-display text-white/40 tracking-[.24em]" style={{ fontSize: 9 }}>ROUND RESULTS</div>
          <div className="mt-1.5 flex flex-col gap-1">
            {Array.from({ length: rounds }, (_, idx) => idx + 1).map(rn => {
              const rw = state.roundWinners.find((r: any) => r.round === rn);
              return (
                <div key={rn} className="flex items-center gap-4 justify-center font-display text-sm">
                  <span className="text-white/45 w-16 text-right" style={{ fontSize: 10 }}>ROUND {rn}</span>
                  <span className="font-black w-8 text-center" style={{ color: 'hsl(0 80% 60%)' }}>{rw ? rw.hongScore : '—'}</span>
                  <span className="font-black w-8 text-center" style={{ color: 'hsl(217 91% 60%)' }}>{rw ? rw.chungScore : '—'}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreboardView({ isMiniPreview = false }: { isMiniPreview?: boolean } = {}) {
  const { state, dispatch } = useMatch();
  const { t, lang } = useI18n();
  const ui = (en: string, ar: string, fr: string) => lang === 'fr' ? fr : lang === 'ar' ? ar : en;

  // Transparent stream-overlay mode: add ?transparent=1 (or ?obs=1) to the
  // public display URL to use this window as an OBS/Streamlabs Browser
  // Source — background becomes fully transparent (so only the scoreboard
  // graphics show over the camera feed) and the internal nav bar is
  // hidden, since a production switcher/OBS scene provides its own chrome.
  // Everything else (scores, call animations, winner screen...) renders
  // exactly as normal. Has no effect unless the query param is present, so
  // regular Electron/browser windows are unaffected.
  const isStreamOverlay = React.useMemo(() => {
    if (isMiniPreview) return false;
    try {
      const sp = new URLSearchParams(window.location.search);
      return sp.get('transparent') === '1' || sp.get('obs') === '1';
    } catch { return false; }
  }, [isMiniPreview]);


  // "Who's up next" — when this match ends, the audience should immediately
  // see who's coming to the mat next (name + side color, VS), pulled from
  // the same tournament bracket the Operator screen advances. Read-only
  // here; only used once the match has actually finished.
  const [announceBracket, setAnnounceBracket] = useState<any[] | null>(null);
  useEffect(() => {
    const tournamentId = state.tournamentId;
    if (!tournamentId) { setAnnounceBracket(null); return; }
    (async () => {
      if (isLocalTournamentId(tournamentId)) {
        const rec = loadTournamentLocal(tournamentId);
        setAnnounceBracket(rec?.bracket_data?.bracket ?? null);
        return;
      }
      try {
        const { data: t } = await supabase.from('tournaments').select('bracket_data').eq('id', tournamentId).single();
        setAnnounceBracket((t?.bracket_data as any)?.bracket ?? null);
      } catch {
        setAnnounceBracket(null);
      }
    })();
  }, [state.tournamentId, state.status]);
  const nextMatch = announceBracket?.find((m: any) =>
    m.id !== state.bracketMatchId && !m.winner && !m.isBye && m.player1 && m.player2
  ) ?? null;
  // Public Display follows the same application language as the operator.
  // It remains a clean audience screen, but its UI text is bilingual through i18n.
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);
  // True on the real Public Scoreboard window OR when embedded as the live
  // mini-preview inside the Operator screen — in both cases none of the
  // operator/referee controls (nav bar, QR toggle, settings gear, fullscreen
  // button) should be reachable.
  const isPublicWindow = isPublicDisplayWindow() || isMiniPreview;
  const { chung, hong, currentRound, timeRemaining, status, config, result } = state;
  // Admin-controlled show/hide of flag/club/photo/stage/weight on the public screen.
  const dc = state.displayConfig || DEFAULT_DISPLAY_CONFIG;
  const [showNav, setShowNav] = useState(false);
  // Persistent nav bar: on the actual public/connected display window
  // (isPublicWindow) the audience must never see admin/operator controls,
  // so it never renders there. Everywhere else — including this same
  // screen when it's just being previewed inside the main app window —
  // it now stays permanently visible (not hover-gated) so the operator
  // can always jump back to Operator/Admin/Judge/Par Équipe from here.
  const persistentTopNav = !isPublicWindow && (
    <div className="fixed top-0 left-0 right-0 z-[100]">
      
    </div>
  );
  const [showEndOfRound, setShowEndOfRound] = useState(false);
  // GOLDEN POINT cinematic visibility is now derived directly from synced
  // state (present = show, undefined = hidden) instead of local timers.
  // Both the automatic "round starts" trigger (MatchContext.tsx, operator
  // window) and the operator's manual "End animation now" button dispatch
  // GOLDEN_POINT_ANIMATE / CLEAR_GOLDEN_POINT_ANIMATE, which get mirrored
  // to this window like any other state field. This fixes a bug where the
  // cinematic could get stuck on screen forever if the match status
  // changed again (e.g. the golden round ended) before a local timeout
  // fired — see MatchContext.tsx for the full explanation.
  const showGoldenPoint = !!state.config.goldenRound && !!state.goldenPointAnimation;
  const prevStatusRef = useRef<string | null>(null);
  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    // Plain "end of round" banner — unchanged, fires the moment rest begins
    // (golden round has no such banner; it gets its own cinematic instead).
    if (status === 'rest' && prevStatus !== 'rest' && !state.isGoldenRound) {
      setShowEndOfRound(true);
      const timer = setTimeout(() => setShowEndOfRound(false), 2000);
      prevStatusRef.current = status;
      return () => clearTimeout(timer);
    }
    prevStatusRef.current = status;
  }, [status, state.isGoldenRound]);

  const [centiseconds, setCentiseconds] = useState(0);

  // ===== Score-scored flash (scale up + gold glow + brief pulse) =====
  const [chungFlash, setChungFlash] = useState(false);
  const [hongFlash, setHongFlash] = useState(false);
  const prevChungScoreRef = useRef<number | null>(null);
  const prevHongScoreRef = useRef<number | null>(null);
  useEffect(() => {
    const val = config.scoreResetPerRound ? getCurrentRoundScore(state, 'chung') : state.chung.totalScore;
    if (prevChungScoreRef.current !== null && val > prevChungScoreRef.current) {
      setChungFlash(true);
      const timer = setTimeout(() => setChungFlash(false), 650);
      prevChungScoreRef.current = val;
      return () => clearTimeout(timer);
    }
    prevChungScoreRef.current = val;
  }, [state.chung.totalScore, currentRound]);
  useEffect(() => {
    const val = config.scoreResetPerRound ? getCurrentRoundScore(state, 'hong') : state.hong.totalScore;
    if (prevHongScoreRef.current !== null && val > prevHongScoreRef.current) {
      setHongFlash(true);
      const timer = setTimeout(() => setHongFlash(false), 650);
      prevHongScoreRef.current = val;
      return () => clearTimeout(timer);
    }
    prevHongScoreRef.current = val;
  }, [state.hong.totalScore, currentRound]);
  const centiRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [recentAction, setRecentAction] = useState<{ id: string; player: PlayerColor; type: string; points: number } | null>(null);
  const [ptgAnimation, setPtgAnimation] = useState(false); // flash+shake window (configurable)
  const [ptgFlash, setPtgFlash] = useState(false);
  const ptgActive = !!state.ptgActive; // Drive PTG UI from shared state (locked until referee confirms)
  const [winnerScale, setWinnerScale] = useState(false);
  const [entryVsPulse, setEntryVsPulse] = useState(false);
  const [entryDark, setEntryDark] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [sbTab, setSbTab] = useState<'sizes' | 'colors' | 'text'>('sizes');
  const DEFAULT_SB = {
    // Sizes
    hitIconSize: 22,
    roundBoxBorder: 2.5,
    gamjeomSize: 18,
    titleScale: 1,
    subScale: 1,
    playerNameScale: 1,
    bigScoreScale: 1,
    timerScale: 1,
    winnerSize: 1,
    flagScale: 1,
    // Colors (hex)
    titleColor: '#f5c842',
    subColor: '#f0f0f0',
    playerNameColor: '#ffffff',
    chungColor: '#2467d6',
    hongColor: '#d33a45',
    timerColor: '#f5c842',
    gamjeomColor: '#f5c842',
    hitIconColor: '#f5c842',
    roundActiveColor: '#f5c842',
    winnerColor: '#f5c842',
    // Video Replay (IVR) request banner text — white or yellow (or any color)
    ivrRequestColor: '#f5c842',
    // FIGHT badge
    fightText: 'FIGHT',
    fightColor: '#22c55e',
  };
  type SBSettings = typeof DEFAULT_SB;
  const [displaySettings, setDisplaySettings] = useState<SBSettings>(() => {
    try {
      const s = localStorage.getItem('tkd-scoreboard-settings');
      if (s) return { ...DEFAULT_SB, ...JSON.parse(s) };
    } catch {}
    return DEFAULT_SB;
  });
  useEffect(() => {
    try { localStorage.setItem('tkd-scoreboard-settings', JSON.stringify(displaySettings)); } catch {}
    // Re-read colors immediately when Tournament Manager restores a saved theme.
    const onRestore = () => {
      try {
        const raw = localStorage.getItem('tkd-scoreboard-settings');
        if (raw) setDisplaySettings(s => ({ ...s, ...JSON.parse(raw) }));
      } catch {}
    };
    window.addEventListener('wab-tournament-colors-restored', onRestore);
    // External scoreboard colors are part of the active tournament snapshot too.
    // This keeps a color change made outside Tournament Manager attached to the
    // current tournament, so opening that tournament later restores the same identity.
    const tid = state.tournamentId;
    if (tid) {
      const rec = loadTournamentLocal(tid);
      if (rec) {
        const colors = getExternalDisplayColors();
        saveTournamentLocal({ ...rec, display_colors: colors, bracket_data: { ...(rec.bracket_data || {}), displayColors: colors } });
      }
    }
    return () => window.removeEventListener('wab-tournament-colors-restored', onRestore);
  }, [displaySettings, state.tournamentId]);
  const sb = displaySettings;
  // Hit pulse counters — bump to retrigger CSS animation
  const [hitPulse, setHitPulse] = useState<{ chung: Record<string, number>; hong: Record<string, number> }>({ chung: {}, hong: {} });
  const prevHitsRef = useRef<{ chung: Record<string, number>; hong: Record<string, number> }>({ chung: {}, hong: {} });

  const [approvalToast, setApprovalToast] = useState<{ status: 'approved' | 'rejected'; judge: string; referee: string; type: string; player: string } | null>(null);

  // Supabase sync + judge approval toast (internet mode — needs both this
  // screen and the operator to have internet access).
  useEffect(() => {
    let cancelled = false;
    let matchCh: ReturnType<typeof supabase.channel> | null = null;
    let voteCh: ReturnType<typeof supabase.channel> | null = null;
    const connect = async () => {
      const session = await ensureRealtimeSession();
      if (cancelled || !session) return;
      matchCh = supabase.channel('match-sync')
        .on('broadcast', { event: 'match-state' }, (payload) => {
          if (payload.payload) dispatch({ type: 'SET_STATE', state: payload.payload });
        }).subscribe();
      voteCh = supabase.channel('judge-votes')
        .on('broadcast', { event: 'score-vote-result' }, (payload) => {
          const p = payload.payload || {};
          setApprovalToast({
            status: p.status, judge: p.judgeName || 'Judge',
            referee: p.refereeName || 'Referee', type: p.type || '', player: p.player || '',
          });
          setTimeout(() => setApprovalToast(null), 2500);
        }).subscribe();
    };
    void connect();
    return () => {
      cancelled = true;
      if (matchCh) supabase.removeChannel(matchCh);
      if (voteCh) supabase.removeChannel(voteCh);
    };
  }, []);

  // ---------------------------------------------------------------------
  // Offline / local Wi-Fi sync — for an audience screen running as a plain
  // browser tab or webview on a SEPARATE device (e.g. an Android tablet
  // driving the venue TV), when the operator is in offline "Wi-Fi" mode
  // (no internet, so the Supabase channel above never fires). It connects
  // directly to the same local WebSocket server the desktop app already
  // runs for judge phones (electron/main.cjs, port 8787), registering as a
  // read-only "viewer" instead of a judge. This is skipped entirely when
  // this component IS the Electron-managed public window (isPublicWindow)
  // since that already gets state instantly over IPC — no need to also
  // open a socket to itself.
  // ---------------------------------------------------------------------
  const LOCAL_WS_KEY = 'tkd-public-ws-address';
  const [wsAddress, setWsAddress] = useState<string>(() => {
    try { return localStorage.getItem(LOCAL_WS_KEY) || ''; } catch { return ''; }
  });
  const [wsConnected, setWsConnected] = useState(false);
  const [showWifiConnect, setShowWifiConnect] = useState(false);
  const [wsAddressInput, setWsAddressInput] = useState(wsAddress);
  const wsRef = useRef<WebSocket | null>(null);
  const wsRetryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isStandaloneScreen = typeof window !== 'undefined' && !isPublicWindow && !(window as any).electronAPI;

  useEffect(() => {
    if (!isStandaloneScreen || !wsAddress) { setWsConnected(false); return; }
    let cancelled = false;

    const scheduleRetry = () => {
      if (cancelled) return;
      if (wsRetryRef.current) clearTimeout(wsRetryRef.current);
      wsRetryRef.current = setTimeout(connect, 3000);
    };

    function connect() {
      if (cancelled) return;
      let url = wsAddress.trim();
      if (!/^wss?:\/\//i.test(url)) url = `ws://${url}`;
      let ws: WebSocket;
      try { ws = new WebSocket(url); } catch { scheduleRetry(); return; }
      wsRef.current = ws;
      ws.onopen = () => {
        setWsConnected(true);
        try {
          const token = new URLSearchParams(window.location.search).get('token') || '';
          ws.send(JSON.stringify({ type: 'hello-viewer', token }));
        } catch {}
      };
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg.event === 'match-state' && msg.payload) {
            dispatch({ type: 'SET_STATE', state: msg.payload });
          }
        } catch {}
      };
      ws.onclose = () => { setWsConnected(false); scheduleRetry(); };
      ws.onerror = () => { try { ws.close(); } catch {} };
    }
    connect();

    return () => {
      cancelled = true;
      if (wsRetryRef.current) clearTimeout(wsRetryRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [isStandaloneScreen, wsAddress, dispatch]);

  const saveWsAddress = (value: string) => {
    const trimmed = value.trim();
    setWsAddress(trimmed);
    try {
      if (trimmed) localStorage.setItem(LOCAL_WS_KEY, trimmed);
      else localStorage.removeItem(LOCAL_WS_KEY);
    } catch {}
  };

  // Track score events for action flash
  const prevEventsLen = useRef(state.events.length);
  useEffect(() => {
    if (state.events.length > prevEventsLen.current) {
      const e = state.events[state.events.length - 1];
      if (e.type !== 'gamjeom') {
        setRecentAction({ id: e.id, player: e.player, type: e.type, points: e.points });
        setTimeout(() => setRecentAction(null), 2500);
      }
    }
    prevEventsLen.current = state.events.length;
  }, [state.events.length]);

  // Centiseconds for last 10s
  useEffect(() => {
    if (status === 'fighting' && timeRemaining <= 10 && timeRemaining > 0) {
      setCentiseconds(99);
      centiRef.current = setInterval(() => setCentiseconds(p => p <= 0 ? 99 : p - 1), 10);
    } else {
      if (centiRef.current) clearInterval(centiRef.current);
      setCentiseconds(0);
    }
    return () => { if (centiRef.current) clearInterval(centiRef.current); };
  }, [status, timeRemaining]);

  // PTG announcement — replaces timer with flashing PTG + soft shake for a configurable window.
  // PTG stays visible until the referee confirms (state.ptgActive cleared) and round winner is announced.
  const ptgFlashStartedRef = useRef(false);
  useEffect(() => {
    if (state.ptgActive && !ptgFlashStartedRef.current) {
      ptgFlashStartedRef.current = true;
      setPtgAnimation(true);
      if (!isMiniPreview) sounds.endRound();
      const fi = setInterval(() => setPtgFlash(p => !p), 500);
      const durationMs = Math.max(1, config.ptgDisplayDuration ?? 5) * 1000;
      setTimeout(() => { clearInterval(fi); setPtgAnimation(false); setPtgFlash(false); }, durationMs);
    }
    if (!state.ptgActive) {
      ptgFlashStartedRef.current = false;
      setPtgAnimation(false);
      setPtgFlash(false);
    }
  }, [state.ptgActive]);

  // Match-end presentation is intentionally information-first.
  // There is no explosion, confetti burst, VS flash, or trophy entrance: the
  // finished-match template appears immediately and only its live data changes.
  useEffect(() => {
    if (status !== 'finished') {
      setWinnerScale(false);
      setEntryVsPulse(false);
      setEntryDark(false);
      return;
    }
    if (result) {
      if (!isMiniPreview) {
        sounds.winner();
        // Winner + Best Player (MVP) voice announcement — MVP is computed
        // the same way as the on-screen MVP card (sum of real recorded
        // roundScores across both rosters), so the voice never announces a
        // name the audience can't also see on screen.
        try {
          const winnerName = state[result.winner]?.player?.name;
          const winnerSideLabel = result.winner === 'hong' ? 'Red' : 'Blue';
          const mvpCandidates: { name: string; total: number }[] = [];
          (['chung', 'hong'] as PlayerColor[]).forEach((side) => {
            (state.teamRoster?.[side] || []).forEach((entry: any) => {
              const total = (entry.roundScores || []).reduce((sum: number, rs: any) => sum + (rs.score || 0), 0);
              if (total > 0) mvpCandidates.push({ name: entry.name, total });
            });
          });
          mvpCandidates.sort((a, b) => b.total - a.total);
          const mvp = mvpCandidates[0];
          setTimeout(() => {
            announcer.speak(`${winnerSideLabel} corner wins.${winnerName ? ' ' + winnerName + '.' : ''}`, { rate: 0.9 });
          }, 300);
          if (mvp) {
            setTimeout(() => announcer.announceMvp({ playerName: mvp.name, points: mvp.total }), 3200);
          }
        } catch {}
      }
      setEntryVsPulse(false);
      setEntryDark(false);
      setWinnerScale(true);
    }
  }, [status, result]);

  // Countdown warnings — chime at 30s and 10s remaining during a fighting round.
  const lastWarnedRef = useRef<number>(-1);
  useEffect(() => {
    if (status === 'fighting' && (timeRemaining === 30 || timeRemaining === 10)) {
      if (lastWarnedRef.current !== timeRemaining) {
        lastWarnedRef.current = timeRemaining;
        if (!isMiniPreview) {
          try {
            sounds.countdown();
            setTimeout(() => sounds.countdown(), 220);
            if (timeRemaining === 10) setTimeout(() => sounds.countdown(), 440);
          } catch {}
        }
      }
    }
    if (status !== 'fighting') lastWarnedRef.current = -1;
  }, [status, timeRemaining]);

  // Voice call players when rest time ends.
  const restEndedRef = useRef(false);
  useEffect(() => {
    if (status === 'rest') restEndedRef.current = false;
    if ((status === 'paused' || status === 'fighting') && state.awaitingRoundStart && !restEndedRef.current) {
      restEndedRef.current = true;
      if (!isMiniPreview) {
        try {
          const u = new SpeechSynthesisUtterance('Call players. Round ' + (currentRound + 1));
          u.rate = 0.95; u.pitch = 1; u.volume = 1;
          window.speechSynthesis?.cancel();
          window.speechSynthesis?.speak(u);
        } catch {}
      }
    }
  }, [status, state.awaitingRoundStart, currentRound]);


  // Voice announcement for the Team/Player Call cinematic. Fires once per
  // distinct call event (keyed by callAnimation.ts, set fresh by the reducer
  // every time START_CALL_ANIMATION / ADVANCE_CALL_ANIMATION runs) so a
  // re-render mid-animation never re-triggers or overlaps speech, and a
  // fast RED→BLUE chain always cancels the previous utterance in favor of
  // the new one (handled inside announcer.speak).
  const lastAnnouncedCallRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    const ca = state.callAnimation;
    if (!ca || isMiniPreview || lastAnnouncedCallRef.current === ca.ts) return;
    lastAnnouncedCallRef.current = ca.ts;
    if (ca.phase === 'team') {
      announcer.announceTeamCall({ teamName: ca.teamName, clubName: ca.clubName, country: ca.teamCountry, side: ca.side });
    } else {
      announcer.announcePlayerCall({
        side: ca.side,
        playerName: ca.playerName,
        playerNumber: ca.playerNumber,
        seedNumber: (ca as any).seedNumber,
        nationality: ca.playerNationality,
        teamName: ca.teamName,
        clubName: ca.clubName,
        isSubstitution: ca.isSubstitution,
        outgoingName: ca.outgoingName,
      });
    }
  }, [state.callAnimation?.ts, isMiniPreview]);

  // SINGLE PLAYER CALL + MATCHUP — display-only, driven entirely by
  // state.singlePlayerCall / state.matchupAnimation (Main Referee only
  // dispatches the actions that set these).
  const matchupOverlay = <MatchupOverlay state={state} matchup={state.matchupAnimation} />;

  const handleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  };

  const chungRoundScore = getCurrentRoundScore(state, 'chung');
  const hongRoundScore = getCurrentRoundScore(state, 'hong');
  const displayChung = config.scoreResetPerRound ? chungRoundScore : chung.totalScore;
  const displayHong = config.scoreResetPerRound ? hongRoundScore : hong.totalScore;
  const chungRoundWins = state.roundWinners.filter(r => r.winner === 'chung').length;
  const hongRoundWins = state.roundWinners.filter(r => r.winner === 'hong').length;
  const isLast30 = timeRemaining <= 30 && timeRemaining > 10 && status === 'fighting';
  const isLast10 = timeRemaining <= 10 && timeRemaining > 0 && status === 'fighting';
  const isLast5 = timeRemaining <= 5 && timeRemaining > 0 && status === 'fighting';
  const isTimeout = status === 'paused' && !state.awaitingRoundStart;
  const isSpecialStatus = status === 'doctor' || status === 'kyeshi' || status === 'ivr';

  const timerDisplay = isLast10
    ? `${timeRemaining}.${centiseconds.toString().padStart(2, '0')}`
    : formatTime(timeRemaining);

  // Professional timer color ladder: user's normal color -> yellow (<=30s) -> red (<=10s),
  // with a pulse starting only in the last 5 seconds.
  const timerStateColor = isLast10 ? 'hsl(0 72% 51%)' : isLast30 ? 'hsl(45 93% 58%)' : sb.timerColor;

  const getGamjeomForRound = (player: PlayerColor) =>
    state.events.filter(e => e.player === player && e.type === 'gamjeom' && e.round === currentRound).length;

  const getHitCounts = (player: PlayerColor) => {
    const evs = state.events.filter(e => e.player === player && e.round === currentRound);
    return {
      punch: evs.filter(e => e.type === 'punch').length,
      body: evs.filter(e => e.type === 'trunk_kick' || e.type === 'turning_kick').length,
      head: evs.filter(e => e.type === 'head_kick' || e.type === 'turning_head').length,
      turning: evs.filter(e => e.type === 'turning_kick' || e.type === 'turning_head').length,
    };
  };
  const chungHits = getHitCounts('chung');
  const hongHits = getHitCounts('hong');

  // Trigger pulse animation when a hit count goes up
  useEffect(() => {
    const ph = prevHitsRef.current;
    const next = { chung: { ...hitPulse.chung }, hong: { ...hitPulse.hong } };
    let changed = false;
    (['punch', 'body', 'head'] as const).forEach(k => {
      if ((chungHits[k] || 0) > (ph.chung[k] || 0)) { next.chung[k] = (next.chung[k] || 0) + 1; changed = true; }
      if ((hongHits[k] || 0) > (ph.hong[k] || 0)) { next.hong[k] = (next.hong[k] || 0) + 1; changed = true; }
    });
    prevHitsRef.current = { chung: { ...chungHits }, hong: { ...hongHits } };
    if (changed) setHitPulse(next);
  }, [chungHits.punch, chungHits.body, chungHits.head, hongHits.punch, hongHits.body, hongHits.head]);

  const getHitLabel = (type: string) => {
    switch (type) {
      case 'punch': return 'PUNCH';
      case 'trunk_kick': return 'BODY KICK';
      case 'head_kick': return 'HEAD KICK';
      case 'turning_kick': return 'TURNING KICK';
      case 'turning_head': return 'TURNING HEAD';
      default: return '';
    }
  };

  // Public result gate: FINISH creates the authoritative result, but the
  // audience must not reveal it until Main Referee explicitly confirms the
  // final result. This keeps the public screen read-only and prevents an
  // accidental/stale FINISH event from leaking a winner before confirmation.
  const resultConfirmed = Boolean(result && state.resultConfirmed === true);
  const currentFrame: 'fight' | 'rest' | 'match_end' =
    status === 'finished' && resultConfirmed ? 'match_end' : status === 'rest' ? 'rest' : 'fight';
    const currentRoundDecision = state.roundWinners.find(r => r.round === currentRound)?.decisionType;
  const currentRoundDecisionLabel = currentRoundDecision === 'AI_RECOMMENDATION' ? 'AI DECISION' : currentRoundDecision === 'WOOSE_GIROK' ? 'WOO-SE-GIROK' : '';

  // Standby splash — takes priority over EVERYTHING else on this screen
  // (call-up screen, live bout, results) until the operator explicitly
  // starts the broadcast. Never reachable from this screen itself; the
  // operator flips it on/off from BroadcastControl in the TopNav.
  const hasCinematicOverride = Boolean(
    state.singlePlayerCall ||
    state.matchupAnimation ||
    state.callAnimation ||
    state.autoCallSequence?.active ||
    state.substitutionAnimation ||
    (currentFrame === 'match_end' && resultConfirmed) ||
    (state.status === 'ivr' && Boolean(state.ivrRequestedBy))
  );

  if (!state.publicBroadcastLive && !hasCinematicOverride) {
    return (
      <div
        dir="ltr"
        className={`fixed inset-0 bg-black overflow-hidden ${isMiniPreview ? 'public-scoreboard-mini' : ''}`}
        onMouseEnter={() => setShowNav(true)}
        onMouseLeave={() => setShowNav(false)}
      >
        {persistentTopNav}
        <img
          src={splashBannerUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover select-none"
          draggable={false}
        />
      </div>
    );
  }

  // Do not show the legacy referee-review result card. While the referee is reviewing, keep the normal scoreboard frozen
  // in its current state. The winner renderer becomes visible immediately
  // after CONFIRM_FINAL_RESULT, with no intermediate result animation.

  // Pre-match calling screen — shown for EVERY match (tournament, friendly,
  // or Par Équipe) until the referee presses "Match Ready" on the Operator
  // screen. Takes priority over the normal scoreboard, but never overrides
  // the winner/match_end screen (that's a different, already-decided state).
  // ===== Two-phase Call / Change-Player cinematic (Par Équipe) =====
  // Phase 'team': team logo + name + tournament name at top.
  // Phase 'player': player photo + name + numbers + category, in a frame
  // colored per side, with the tournament name still shown at top.
  // Replaces the old single-phase substitution flash entirely.
  const callAnim = state.callAnimation;
  const cc = state.callDisplayConfig || DEFAULT_CALL_DISPLAY_CONFIG;
  const nameFormat = (cc.nameFormat || 'full') as NameFormat;
  // 'subtle' halves the glow/particle strength of the call cinematic
  // (Player Call + Round Call Preview) for the admin-controlled light
  // intensity toggle. Multiply any opacity/blur figure that scales the
  // glow by this factor.
  const lightFactor = cc.lightIntensity === 'subtle' ? 0.5 : 1;
  // A 'player' phase call is either a fresh first-entrance call or a
  // mid-match substitution (isSubstitution) — the audience needs a
  // visibly different title for the latter so they don't think the
  // match is restarting from zero.
  const isChangeCall = !!callAnim?.isSubstitution;

  const competitionTypeLabel = state.config?.competitionMode === 'par_equipe' ? 'PAR ÉQUIPE'
    : state.config?.competitionMode === 'friendly' ? 'FRIENDLY'
    : state.config?.competitionMode === 'league' ? 'LEAGUE' : state.config?.competitionMode === 'super_fight' ? 'SUPER FIGHT' : 'TOURNAMENT';
  const genderLabel = state.gender === 'male' ? 'MALE' : state.gender === 'female' ? 'FEMALE' : '—';
  const publicMatchMetaBar = (
    <div className="relative z-20 w-full border-b-2 border-[#ffd866]/30 bg-[linear-gradient(180deg,rgba(5,7,14,.98),rgba(5,7,14,.88))] px-5 py-3 shadow-[0_8px_35px_rgba(0,0,0,.35)]">
      <div className="mx-auto max-w-[1900px] text-center">
        <div className="font-display font-black uppercase tracking-[.08em] text-[#fff1bd]" style={{ fontSize: 'clamp(24px, 3vw, 52px)', lineHeight: 1.05, textShadow: '0 0 28px rgba(255,216,102,.32)' }}>
          {state.competitionName || 'WAB-TKD'}
        </div>
        <div className="mx-auto mt-2 flex max-w-[1800px] flex-wrap items-center justify-center gap-2">
          {[
            ['TYPE', competitionTypeLabel],
            ['GENDER', genderLabel],
            ['AGE GROUP', state.ageGroup || '—'],
            ['DIVISION', state.division || state.config?.division || '—'],
            ['WEIGHT', state.weightCategory || '—'],
            ['MATCH', state.matchNumber ? `#${state.matchNumber}` : '---'],
            ...(status === 'rest' && currentRoundDecisionLabel ? [['ROUND DECISION', currentRoundDecisionLabel]] : []),
            ['DATE', state.eventDate || '—'],
            ['LOCATION', state.eventLocation || 'WORLD ARENA'],
          ].map(([label, value]) => (
            <span key={label} className="rounded-lg border border-[#ffd866]/25 bg-white/[.035] px-3 py-1.5 font-display text-[11px] font-black uppercase tracking-[.10em] text-white/85 shadow-[inset_0_0_14px_rgba(255,216,102,.04)]">
              <span className="text-[#ffd866]">{label}</span> <span className="mx-1 text-white/25">•</span> {value}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  // Between-round team match preview: show the exact two athletes assigned to
  // the upcoming round with a fixed BLUE-right / RED-left VS composition.
  // This is intentionally different from the first-match team call.
  const roundPreview = state.roundCallPreview;
  const roundPreviewAge = roundPreview ? Date.now() - roundPreview.ts : Infinity;
  // Exact PLAYER CALL cinematic from the supplied broadcast project.
  // It is driven by the live Main Referee call state; no demo data is used.
  const isParEquipeMatch = state.config?.competitionMode === 'par_equipe';
  // HARD ISOLATION: only one Player Call renderer can be active.
  // 1v1 and Par Équipe have separate components and separate activation rules.
  const callAnimationOverlay = (state.singlePlayerCall || (callAnim && callAnim.phase === 'player')) ? (
    isParEquipeMatch
      ? <ParEquipePlayerCallV515 key={`player-call-${state.animationController?.animationId || 'none'}`} state={state} />
      : <ExactPlayerCallV515 key={`player-call-${state.animationController?.animationId || 'none'}`} state={state} />
  ) : null;

  // TEAM CALL must have a real public-display renderer. Previously the
  // reducer changed callAnimation.phase to 'team', but PublicScoreboard only
  // rendered the player cinematic, so referee buttons changed state without
  // producing anything on the audience screen.
  const teamCallActive = Boolean(
    !state.substitutionAnimation &&
    state.callScreenActive &&
    (
      callAnim?.phase === 'team' ||
      state.autoCallSequence?.mode === 'teams' ||
      state.teamCallStatus?.chung === 'called' ||
      state.teamCallStatus?.hong === 'called'
    )
  );
  const teamCallOverlay = teamCallActive ? (
    <div data-wab-layer-root="team-call" className="fixed inset-0 z-[950] pointer-events-none overflow-hidden" data-wab-broadcast-root="team-call">
      <LiveTeamCallBroadcast key={`team-call-${state.animationController?.animationId || 'none'}`} state={state} dispatch={dispatch} isMiniPreview={isMiniPreview} />
    </div>
  ) : null;

  // TEAM CALL is an exclusive broadcast scene. Do not render the normal live
  // scoreboard underneath it: on the embedded Audience Preview the team-call
  // frame was opaque enough to hide that base UI, while the real second-window
  // compositor could expose the underlying RED/BLUE/player-information layer
  // through transparent artwork. That is the source of the "good in Audience /
  // overlapped on second screen" discrepancy. Both surfaces now receive the
  // exact same isolated scene and nothing else can occupy its centre/edges.
  if (teamCallActive) {
    return (
      <div dir="ltr" className={`fixed inset-0 overflow-hidden ${isMiniPreview ? 'public-scoreboard-mini' : ''} public-scoreboard-team-call-exclusive`} style={{ background: '#03050a' }}>
        {teamCallOverlay}
      </div>
    );
  }

  // One cinematic at a time. This prevents the round intro, call frames,
  // matchup and standby cards from stacking over each other before LIVE.
  const doctorCallOverlay = state.status === 'doctor' ? <DoctorCallAnimation isMiniPreview={isMiniPreview} /> : null;
  const kyeshiCallOverlay = state.status === 'kyeshi' ? <KyeshiCallAnimation timeRemaining={timeRemaining} isMiniPreview={isMiniPreview} /> : null;

  const cinematicActive = !!(state.status === 'doctor' || state.status === 'kyeshi' || state.substitutionAnimation || teamCallOverlay || callAnimationOverlay || state.matchupAnimation || state.singlePlayerCall || state.callAnimation || state.autoCallSequence?.active || (state.status === 'ivr' && state.ivrRequestedBy) || state.ivrAnimation || state.koAnimation || state.mvpReveal || state.poolMvpReveal || state.roundStartIntro?.active);

  // Exact Par Équipe PLAYER CHANGE cinematic supplied by the user.
  // It is created only by CONFIRM_SUBSTITUTION in teamMode='substitution'
  // and is cleared by its own completion callback; the normal Player Call
  // overlay is intentionally not used for this flow.
  const substitutionAnimationOverlay = state.substitutionAnimation ? (() => {
    const sub = state.substitutionAnimation;
    const sideKey = sub.side;
    const side = sideKey === 'chung' ? 'BLUE' : 'RED';
    const toRosterPlayer = (player: typeof sub.oldPlayer, status: 'ACTIVE' | 'SUBSTITUTED') => ({
      matchPlayerId: `${state.id}-${sideKey}-${status}-${sub.ts}`,
      playerId: `${state.id}-${sideKey}-${player.name || 'player'}`,
      side,
      status,
      fullName: player.name || '—',
      photo: player.photo || '',
      teamName: state.teamNames?.[sideKey] || '',
      clubName: state.clubNames?.[sideKey] || state[sideKey].player.club || '',
      clubLogo: state.clubLogos?.[sideKey] || '',
      teamLogo: state.teamLogos?.[sideKey] || '',
      country: player.nationality || state.teamCountry?.[sideKey] || '',
      flag: player.nationality || state.teamCountry?.[sideKey] || '',
      weightCategory: state.weightCategory || '',
      playerNumber: player.playerNumber || 0,
      ranking: player.seedNumber ? String(player.seedNumber) : '',
      winRate: 0,
      previousScore: '',
    });
    return (
      <PlayerChangeAnimation
        key={sub.ts}
        visible
        side={side}
        oldPlayer={toRosterPlayer(sub.oldPlayer, 'SUBSTITUTED') as any}
        newPlayer={toRosterPlayer(sub.newPlayer, 'ACTIVE') as any}
        tournamentName={state.competitionName || t('broadcastChampionship')}
        eventDate={state.eventDate || ''}
        eventLocation={state.eventLocation || ''}
        matchNumber={state.matchNumber}
        roundNumber={state.currentRound}
        tournamentType={competitionTypeLabel}
        gender={genderLabel}
        ageGroup={state.ageGroup || ''}
        division={state.division || state.config?.division || ''}
        weightCategory={state.weightCategory || ''}
        tagSeconds={state.config?.parEquipeTagSeconds ?? 5}
        nameFormat={state.callDisplayConfig?.nameFormat || 'full'}
        teamInfo={{
          name: state.teamNames?.[sideKey] || state[sideKey].player.club || '',
          logo: state.teamLogos?.[sideKey] || (sideKey === 'chung' ? ANIMATION_ASSETS.exactBlueClub : ANIMATION_ASSETS.exactRedClub),
          club: state.clubNames?.[sideKey] || state[sideKey].player.club || '',
          country: state.teamCountry?.[sideKey] || state[sideKey].player.nationality || '',
        }}
        onComplete={() => dispatch({ type: 'CLEAR_SUBSTITUTION_ANIMATION' })}
      />
    );
  })() : null;
  // Restored pre-call cinematic from the previous WAB-TKD presentation.
  // It appears only during the call-screen waiting gap; active Team/Player/
  // Matchup animations always take visual priority over it.
  const nextOnMatchOverlay = state.callScreenActive
    && !callAnim
    && !state.singlePlayerCall
    && !state.matchupAnimation
    ? <NextOnMatchOverlay state={state} />
    : null;

  // ===== League standings — full-screen table, toggled by the operator
  // (state.showStandings) so it can be shown between matches without
  // leaving the Operator screen. Independent of match status so it can
  // even be shown mid-rest or right before the next call. =====
  const standingsOverlay = state.showStandings && state.leagueStandings && state.leagueStandings.length > 0 && (
    <div className="fixed inset-0 z-[70] flex flex-col" style={{
      background: 'radial-gradient(ellipse at 50% 30%, hsl(224 35% 10%), hsl(224 40% 4%) 75%)',
      animation: 'frameEnter 0.4s ease-out',
    }}>
      <div className="text-center py-4 shrink-0" style={{ borderBottom: '1px solid hsl(224 35% 18%)' }}>
        <div className="font-display font-black text-[hsl(var(--gold))] tracking-[0.2em]" style={{ fontSize: 'clamp(22px, 3vw, 38px)' }}>
          🏆 {state.competitionName || 'LEAGUE'} — {t('broadcastStatus')}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 md:px-16 py-6">
        <table className="w-full font-display" style={{ fontSize: 'clamp(13px, 1.4vw, 22px)' }}>
          <thead>
            <tr className="text-white/40 text-left uppercase tracking-wider" style={{ fontSize: '0.6em' }}>
              <th className="pb-2 pl-2">#</th>
              <th className="pb-2" >{t('broadcastName')}</th>
              <th className="pb-2 text-center">P</th>
              <th className="pb-2 text-center">W</th>
              <th className="pb-2 text-center">L</th>
              <th className="pb-2 text-center">+/-</th>
              <th className="pb-2 pr-2 text-center" >{t('broadcastDiff')}</th>
            </tr>
          </thead>
          <tbody>
            {state.leagueStandings.map((s, i) => (
              <tr key={i} className="text-white" style={{
                background: i === 0 ? 'hsl(45 93% 58% / 0.12)' : i % 2 === 0 ? 'hsl(0 0% 100% / 0.03)' : 'transparent',
                borderBottom: '1px solid hsl(224 35% 15%)',
              }}>
                <td className="py-2.5 pl-2 font-black" style={{ color: i === 0 ? 'hsl(45 93% 58%)' : 'white' }}>{i + 1}</td>
                <td className="py-2.5 font-bold flex items-center gap-2">
                  {s.nationality && <FlagImage code={s.nationality} size={28} className="w-7 h-5 rounded shadow" />}
                  <span className="truncate">{s.name}</span>
                  {s.club && <span className="text-white/40 text-[0.7em] truncate">({s.club})</span>}
                </td>
                <td className="py-2.5 text-center text-white/70">{s.played}</td>
                <td className="py-2.5 text-center text-[hsl(142_71%_50%)] font-bold">{s.wins}</td>
                <td className="py-2.5 text-center text-[hsl(0_72%_58%)] font-bold">{s.losses}</td>
                <td className="py-2.5 text-center text-white/50">{s.pointsFor}-{s.pointsAgainst}</td>
                <td className="py-2.5 pr-2 text-center font-bold" style={{ color: s.diff > 0 ? 'hsl(142 71% 50%)' : s.diff < 0 ? 'hsl(0 72% 58%)' : 'white' }}>
                  {s.diff > 0 ? '+' : ''}{s.diff}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ===== READY banner — sticky ribbon shown before the match starts (Shijak),
  // separate from every other overlay/animation so it never overlaps them. =====
  const readyBanner = status === 'waiting' && (
    <div className="w-full py-2 px-4 text-center shrink-0 relative z-30" style={{
      background: 'linear-gradient(90deg, hsl(45 93% 40%), hsl(48 96% 55%), hsl(45 93% 40%))',
      borderTop: '2px solid hsl(50 100% 75%)',
      borderBottom: '2px solid hsl(45 93% 25%)',
      boxShadow: '0 4px 24px hsl(48 96% 55% / 0.55)',
      animation: 'readyPulse 1.6s ease-in-out infinite',
    }}>
      <div className="font-display font-black tracking-[0.32em] text-black" style={{
        fontSize: 'clamp(16px, 1.6vw, 26px)',
        textShadow: '0 1px 0 rgba(255,255,255,0.4)',
      }}>
        ⏳ READY — استعدوا — {broadcastName(chung.player.name, nameFormat)} VS {broadcastName(hong.player.name, nameFormat)} ⏳
      </div>
      <style>{`@keyframes readyPulse { 0%,100%{filter:brightness(1)} 50%{filter:brightness(1.3)} }`}</style>
    </div>
  );

  // ===== GREETING banner — both teams called, courtesy bow before player
  // calling begins. Only shown while the automatic call sequence is
  // actually paused on this stop (never a timer — referee confirms it). =====
  const greetingBanner = state.config.classification !== 'team' && state.autoCallSequence?.active && state.autoCallSequence.stage === 'GREETING' && !callAnim && (
    <div className="w-full py-2 px-4 text-center shrink-0 relative z-30" style={{
      background: 'linear-gradient(90deg, hsl(200 80% 40%), hsl(200 85% 55%), hsl(200 80% 40%))',
      borderTop: '2px solid hsl(200 90% 75%)',
      borderBottom: '2px solid hsl(200 80% 25%)',
      boxShadow: '0 4px 24px hsl(200 85% 55% / 0.55)',
      animation: 'readyPulse 1.6s ease-in-out infinite',
    }}>
      <div className="font-display font-black tracking-[0.28em] text-white" style={{
        fontSize: 'clamp(15px, 1.5vw, 24px)',
        textShadow: '0 1px 0 rgba(0,0,0,0.4)',
      }}>
        🤝 WAITING FOR GREETING — انتظار التحية 🤝
      </div>
    </div>
  );

  // ===== GOLDEN POINT banner — sticky ribbon during sudden-death round =====
  const goldenBanner = state.config.goldenRound && state.isGoldenRound && status !== 'finished' && (
    <div className="w-full py-2 px-4 text-center shrink-0 relative z-30" style={{
      background: 'linear-gradient(90deg, hsl(45 93% 45%), hsl(45 100% 60%), hsl(45 93% 45%))',
      borderTop: '2px solid hsl(45 100% 75%)',
      borderBottom: '2px solid hsl(45 100% 30%)',
      boxShadow: '0 4px 24px hsl(45 93% 58% / 0.6)',
      animation: 'goldenPulse 1.6s ease-in-out infinite',
    }}>
      <div className="font-display font-black tracking-[0.28em] text-black" style={{
        fontSize: 'clamp(16px, 1.6vw, 26px)',
        textShadow: '0 1px 0 rgba(255,255,255,0.5)',
      }}>
        🥇 GOLDEN POINT ROUND — النقطة الذهبية — FIRST VALID POINT WINS 🥇
      </div>
      <style>{`@keyframes goldenPulse { 0%,100%{filter:brightness(1)} 50%{filter:brightness(1.25)} }`}</style>
    </div>
  );

  // ===== GOLDEN POINT cinematic — full-screen, frame-independent overlay =====
  // Fires the instant the last rest period ends and the decisive (sudden-death)
  // round begins fighting — i.e. right after rest, right before the round is
  // truly under way. Rendered as a shared overlay (like goldenBanner above) so
  // it appears no matter which frame (rest/fight) is on screen at that moment:
  // impact flash → rotating rays → shockwave rings → rising sparks → a
  // spinning +1 gold circle (replaces the old static medal) + text landing
  // with a bounce. Arabic and English titles share identical size, weight and
  // glow — neither line dominates the other.
  const goldenPointOverlay = showGoldenPoint && (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden" style={{
      background: 'radial-gradient(ellipse at center, hsl(45 65% 9% / 0.98), hsl(224 35% 2% / 0.98))',
      animation: 'frameEnter 0.3s ease-out',
    }}>
      {/* Impact flash on entry — scaled by the same admin light-intensity
          toggle as Player Call / Round Call Preview, so all three call/score
          cinematics stay visually consistent. */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle, hsl(48 100% 88%) 0%, hsl(45 93% 58% / 0) 65%)',
        animation: 'gpFlash 0.7s ease-out forwards',
        opacity: lightFactor,
      }} />

      {/* Slowly rotating light rays behind everything */}
      <div className="absolute pointer-events-none" style={{
        width: '150vmax', height: '150vmax',
        background: `repeating-conic-gradient(hsl(45 100% 60% / ${0.14 * lightFactor}) 0deg 6deg, transparent 6deg 18deg)`,
        animation: 'gpRayRotate 9s linear infinite',
      }} />

      {/* Expanding shockwave rings, staggered */}
      {[0, 0.55, 1.1].map((delay) => (
        <div key={delay} className="absolute rounded-full pointer-events-none" style={{
          width: '100px', height: '100px',
          border: '3px solid hsl(45 100% 65% / 0.85)',
          animation: `gpShockwave 2s ease-out ${delay}s infinite`,
        }} />
      ))}

      {/* Rising gold sparks */}
      {Array.from({ length: 16 }).map((_, i) => (
        <div key={i} className="absolute rounded-full pointer-events-none" style={{
          width: `${4 + (i % 3) * 2}px`, height: `${4 + (i % 3) * 2}px`,
          left: `${(i * 6.25) % 100}%`,
          bottom: '-12px',
          background: 'hsl(45 100% 68%)',
          boxShadow: '0 0 10px hsl(45 100% 65%), 0 0 4px white',
          animation: `gpSparkRise ${2.6 + (i % 4) * 0.45}s ease-in ${(i * 0.18) % 2.4}s infinite`,
        }} />
      ))}

      {/* +1 circle + text — lands with an elastic bounce, then the
          circle keeps spinning on itself continuously (replaces the
          old static medal emoji) while the text settles into a
          steady pulse. Arabic and English titles are the same size,
          weight and glow — neither line dominates the other. */}
      <div className="text-center relative z-10" style={{ animation: 'gpZoomIn 0.75s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        {/* Gold coin — spins on its own axis like a rotating globe (sliding
            meridian stripes + a sweeping shine/terminator line) rather than
            a flat 2D spin, so the "+1" stays flat-facing and readable
            instead of flipping upside down mid-rotation. */}
        <div className="mx-auto relative flex items-center justify-center rounded-full overflow-hidden" style={{
          width: 'clamp(90px, 12vw, 160px)',
          height: 'clamp(90px, 12vw, 160px)',
          background: 'radial-gradient(circle at 35% 30%, hsl(48 100% 78%), hsl(45 90% 42%) 72%)',
          border: '4px solid hsl(45 100% 88%)',
          boxShadow: '0 0 40px hsl(45 100% 60% / 0.8), inset 0 0 22px hsl(28 80% 30% / 0.5)',
          animation: 'gpCircleEnter 0.9s cubic-bezier(0.34,1.56,0.64,1) both, gpMedalGlow 1.3s ease-in-out infinite 0.9s',
        }}>
          {/* Meridian stripes sliding sideways — the "planet turning" texture */}
          <div className="absolute inset-0 rounded-full pointer-events-none" style={{
            background: 'repeating-linear-gradient(90deg, hsl(28 70% 32% / 0.4) 0 3px, transparent 3px 20px)',
            backgroundSize: '200% 100%',
            animation: 'gpEarthSpin 2.4s linear infinite 0.9s',
            mixBlendMode: 'multiply',
          }} />
          {/* Sweeping shine — like a highlight/terminator line crossing a sphere */}
          <div className="absolute inset-0 rounded-full pointer-events-none" style={{
            background: 'linear-gradient(90deg, transparent 0%, hsl(48 100% 92% / 0.55) 45%, transparent 62%)',
            backgroundSize: '250% 100%',
            animation: 'gpEarthShine 2.4s linear infinite 0.9s',
          }} />
          <span className="font-display font-black relative" style={{
            fontSize: 'clamp(34px, 5vw, 62px)',
            color: 'hsl(28 75% 16%)',
            textShadow: '0 1px 0 hsl(48 100% 88% / 0.7)',
          }}>+1</span>
        </div>
        <div className="font-display font-black tracking-[0.3em] mt-3" style={{
          fontSize: 'clamp(40px, 6.5vw, 95px)',
          color: 'hsl(45 93% 58%)',
          textShadow: '0 0 50px hsl(45 93% 58% / 0.9), 0 0 110px hsl(45 93% 58% / 0.55), 0 4px 0 hsl(28 80% 18%)',
          animation: 'gpTextPulse 1s ease-in-out infinite 0.75s',
        }}>
          GOLDEN POINT
        </div>
        <div className="font-display font-black tracking-[0.3em] mt-2" dir="rtl" style={{
          fontSize: 'clamp(40px, 6.5vw, 95px)',
          color: 'hsl(45 93% 58%)',
          textShadow: '0 0 50px hsl(45 93% 58% / 0.9), 0 0 110px hsl(45 93% 58% / 0.55), 0 4px 0 hsl(28 80% 18%)',
          animation: 'gpTextPulse 1s ease-in-out infinite 0.8s',
        }}>
          النقطة الذهبية
        </div>
        <div className="font-display font-bold tracking-[0.35em] mt-3" style={{
          fontSize: 'clamp(13px, 1.7vw, 21px)',
          color: 'hsl(45 55% 72%)',
          animation: 'gpSlideUp 0.6s ease-out 0.5s both',
        }}>
          SUDDEN DEATH — FIRST VALID POINT WINS
        </div>
      </div>

      <style>{`
        @keyframes gpFlash { 0%{opacity:1} 100%{opacity:0} }
        @keyframes gpRayRotate { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes gpShockwave { 0%{transform:scale(0.3);opacity:0.9;border-width:4px} 100%{transform:scale(9);opacity:0;border-width:0.5px} }
        @keyframes gpSparkRise { 0%{transform:translateY(0) scale(1);opacity:0} 15%{opacity:1} 100%{transform:translateY(-70vh) scale(0.3);opacity:0} }
        @keyframes gpZoomIn { 0%{transform:scale(0.25) rotate(-10deg);opacity:0} 60%{transform:scale(1.08) rotate(2deg);opacity:1} 100%{transform:scale(1) rotate(0deg);opacity:1} }
        @keyframes gpCircleEnter { 0%{transform:scale(0.2) rotate(-180deg)} 70%{transform:scale(1.15) rotate(10deg)} 100%{transform:scale(1) rotate(0deg)} }
        @keyframes gpEarthSpin { from{background-position:0% 0%} to{background-position:-200% 0%} }
        @keyframes gpEarthShine { from{background-position:130% 0%} to{background-position:-150% 0%} }
        @keyframes gpMedalGlow { 0%,100%{filter:drop-shadow(0 0 12px hsl(45 100% 65% / 0.7))} 50%{filter:drop-shadow(0 0 32px hsl(45 100% 70% / 0.95))} }
        @keyframes gpTextPulse { 0%,100%{filter:brightness(1) drop-shadow(0 0 0 transparent)} 50%{filter:brightness(1.3)} }
        @keyframes gpSlideUp { 0%{transform:translateY(14px);opacity:0} 100%{transform:translateY(0);opacity:1} }
      `}</style>
    </div>
  );

  // ===== IVR REVIEW REQUEST — explicit pre-decision public animation =====
  // This state is separate from the verdict animation: the audience first sees
  // the exact requesting corner (RED/BLUE), then the Main Referee decision.
  // The camera artwork is colour-locked to the requester so RED can never
  // accidentally display the BLUE camera artwork.
  const pendingIvrSide = state.ivrRequestedBy;
  const pendingIvrIsBlue = pendingIvrSide === 'chung';
  const pendingIvrColor = pendingIvrIsBlue ? sb.chungColor : sb.hongColor;
  const pendingIvrLabel = pendingIvrIsBlue ? 'BLUE' : 'RED';
  const pendingIvrPlayer = pendingIvrIsBlue ? state.chung.player : state.hong.player;
  const pendingIvrCamera = pendingIvrIsBlue ? videoReplayAvailableBlueUrl : videoReplayUnavailableRedUrl;
  const ivrRequestOverlay = state.status === 'ivr' && pendingIvrSide ? (
    <div className="fixed inset-0 z-[895] flex items-center justify-center pointer-events-none overflow-hidden" style={{
      background:`radial-gradient(circle at 50% 42%, ${pendingIvrColor}22, rgba(2,6,14,.96) 55%, #01030a 100%)`,
      animation:'ivrOverlayIn .35s ease-out both',
    }}>
      <div className="absolute inset-0" style={{background:`repeating-linear-gradient(0deg,transparent 0 5px,${pendingIvrColor}08 6px 7px)`,animation:'ivrScan 2.6s linear infinite'}} />
      <div className="relative w-[min(1050px,88vw)] rounded-[34px] border p-8 md:p-12 text-center" style={{borderColor:`${pendingIvrColor}75`,background:'rgba(5,10,20,.94)',boxShadow:`0 0 80px ${pendingIvrColor}22, inset 0 0 70px ${pendingIvrColor}0b`}}>
        <div className="font-display text-[10px] md:text-xs font-black tracking-[.45em] text-[#ffd866]">WAB-TKD · OFFICIAL REVIEW</div>
        <div className="mt-3 font-display text-4xl md:text-6xl font-black tracking-[.12em] text-white">VIDEO REPLAY</div>
        <div className="mt-4 inline-flex items-center gap-3 rounded-full border px-5 py-2" style={{borderColor:`${pendingIvrColor}88`,background:`${pendingIvrColor}12`}}>
          <span className="h-3 w-3 rounded-full" style={{background:pendingIvrColor,boxShadow:`0 0 18px ${pendingIvrColor}`}} />
          <span className="font-display font-black tracking-[.22em] text-white">{pendingIvrLabel} · REVIEW REQUEST</span>
        </div>
        <div className="mt-8 flex items-center justify-center gap-8">
          <div className="relative shrink-0" style={{width:'clamp(180px,22vw,320px)',height:'clamp(130px,16vw,220px)'}}>
            <img data-wab-layer-id="video-replay-request-camera" src={pendingIvrCamera} alt="" className="w-full h-full object-contain" style={{filter:`drop-shadow(0 0 18px ${pendingIvrColor}) drop-shadow(0 0 45px ${pendingIvrColor}77)`,animation:'ivrCameraFloatStrong 1.7s ease-in-out infinite'}} />
          </div>
          <div className="text-left">
            <div className="font-display text-2xl md:text-4xl font-black text-white">{pendingIvrPlayer.name || pendingIvrLabel}</div>
            <div data-wab-layer-id="video-replay-request-flag" className="mt-2 flex items-center gap-2"><FlagImage code={pendingIvrPlayer.nationality || ''} size={28}/><span className="text-xs font-black tracking-[.2em] text-white/50">{pendingIvrPlayer.nationality || '—'}</span></div>
            <div className="mt-6 font-display font-black tracking-[.22em]" style={{color:pendingIvrColor}}>WAITING FOR REFEREE DECISION</div>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  // ===== IVR RESULT animation — premium camera review / official decision =====
  const ivrAnim = state.ivrAnimation;
  const ivrIsBlue = ivrAnim?.side === 'chung';
  const ivrPlayerName = ivrAnim ? (ivrIsBlue ? state.chung.player.name : state.hong.player.name) : '';
  const ivrSideColor = ivrAnim ? (ivrIsBlue ? sb.chungColor : sb.hongColor) : '';
  const ivrSideLabel = ivrIsBlue ? 'BLUE' : 'RED';
  const ivrAccepted = ivrAnim?.decision === 'accepted';
  const ivrDecisionColor = ivrAccepted ? 'hsl(142 75% 55%)' : 'hsl(0 85% 60%)';
  const ivrCameraAssetBySide: Record<PlayerColor, string> = { chung: videoReplayAvailableBlueUrl, hong: videoReplayUnavailableRedUrl };
  const ivrRequesterAsset = ivrAnim ? ivrCameraAssetBySide[ivrAnim.side] : videoReplayAvailableBlueUrl;
  // Auto-clears ~3s after the decision (see handleIVRDecision on the
  // Operator side), returning to the live match automatically; the
  // Operator's "HIDE RESULT" button still allows an earlier dismiss.
  const ivrOverlay = ivrAnim && (
    <div
      className="fixed inset-0 z-[900] flex items-center justify-center pointer-events-none overflow-hidden"
      style={{
        background: `radial-gradient(circle at 50% 43%, ${ivrSideColor}24 0%, rgba(3,8,18,.94) 42%, rgba(1,4,10,.985) 100%)`,
        animation: 'ivrOverlayIn .38s ease-out both',
      }}
    >
      {/* Broadcast energy field */}
      <div className="absolute inset-0 opacity-90" style={{
        background: `conic-gradient(from 0deg, transparent 0deg, ${ivrSideColor}18 28deg, transparent 62deg, ${ivrSideColor}14 128deg, transparent 178deg, ${ivrSideColor}20 238deg, transparent 300deg, ${ivrSideColor}12 338deg, transparent 360deg)`,
        animation: 'ivrSpin 9s linear infinite',
      }} />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, transparent 0 42%, rgba(0,0,0,.68) 100%)',
      }} />
      <div className="absolute inset-0 opacity-25" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(255,255,255,.055) 4px)',
        animation: 'ivrScan 2.6s linear infinite',
      }} />

      {/* Expanding review rings */}
      <div className="absolute rounded-full" style={{
        width: 'min(92vw, 1320px)', height: 'min(92vw, 1320px)',
        border: `1px solid ${ivrSideColor}45`,
        boxShadow: `0 0 100px ${ivrSideColor}18, inset 0 0 100px ${ivrSideColor}0c`,
        animation: 'ivrRing 1.8s ease-out forwards',
      }} />
      <div className="absolute rounded-full" style={{
        width: 'min(64vw, 920px)', height: 'min(64vw, 920px)',
        border: `2px solid ${ivrSideColor}58`,
        boxShadow: `0 0 70px ${ivrSideColor}20`,
        animation: 'ivrRing 1.25s .12s ease-out forwards',
      }} />
      <div className="absolute rounded-full" style={{
        width: 'min(36vw, 520px)', height: 'min(36vw, 520px)',
        border: `1px solid ${ivrSideColor}55`,
        animation: 'ivrRing 1s .25s ease-out forwards',
      }} />

      {/* Cinematic light sweep */}
      <div className="absolute top-0 bottom-0 w-[16vw] max-w-[240px]" style={{
        background: `linear-gradient(90deg, transparent, ${ivrSideColor}20, transparent)`,
        transform: 'skewX(-16deg)',
        animation: 'ivrSweep 2.8s .15s ease-in-out infinite',
      }} />

      <div
        className="relative w-[min(94vw,1320px)] min-h-[min(82vh,820px)] rounded-[38px] px-6 py-7 md:px-12 md:py-10 text-center flex flex-col justify-center"
        style={{
          background: `linear-gradient(145deg, rgba(5,11,21,.97), rgba(11,20,34,.94) 55%, ${ivrSideColor}0d)`,
          border: `1px solid ${ivrSideColor}88`,
          boxShadow: `0 0 70px ${ivrSideColor}30, 0 35px 130px rgba(0,0,0,.82), inset 0 0 80px ${ivrSideColor}0c`,
          animation: ivrAccepted ? 'ivrCardIn .78s cubic-bezier(.16,1,.3,1)' : 'ivrCardReject .7s cubic-bezier(.2,.8,.2,1)',
        }}
      >
        {/* Header / broadcast identity */}
        <div className="flex items-center justify-center gap-3 mb-2" style={{ animation: 'ivrFadeUp .5s .12s both' }}>
          <span className="h-px w-14 md:w-24" style={{ background: `linear-gradient(90deg, transparent, ${ivrSideColor})` }} />
          <span className="font-display font-black tracking-[.3em] text-white/80" style={{ fontSize: 'clamp(13px, 1.35vw, 21px)' }}>
            VIDEO REPLAY
          </span>
          <span className="h-px w-14 md:w-24" style={{ background: `linear-gradient(90deg, ${ivrSideColor}, transparent)` }} />
        </div>
        <div className="font-display font-bold tracking-[.32em] text-white/35" style={{ fontSize: 'clamp(8px, .75vw, 13px)', animation: 'ivrFadeUp .5s .2s both' }}>
          OFFICIAL VIDEO REVIEW · {ivrSideLabel} REQUEST
        </div>

        {/* Main camera → decision composition. Stacked and centered (not
            side-by-side left/right) per request — the camera is the
            centered focal point, with the accept/reject verdict appearing
            directly below it instead of off to one side. */}
        <div className="flex flex-col items-center justify-center gap-5 md:gap-7 mt-6 md:mt-8">
          {/* Requester camera */}
          <div className="flex flex-col items-center min-w-0" style={{ animation: 'ivrRequesterIn .82s .16s cubic-bezier(.16,1,.3,1) both' }}>
            <div className="inline-flex items-center gap-2 rounded-full px-5 py-2 font-display font-black tracking-[.22em]" style={{
              border: `1px solid ${ivrSideColor}88`, color: '#fff', background: `${ivrSideColor}16`,
              boxShadow: `0 0 28px ${ivrSideColor}20`, fontSize: 'clamp(9px, .8vw, 13px)',
            }}>
              <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full rounded-full opacity-80" style={{ background: ivrSideColor, animation: 'ivrDot 1.2s ease-out infinite' }} /><span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: ivrSideColor }} /></span>
              {ivrSideLabel} · REVIEW REQUEST
            </div>

            <div className="relative mt-2" style={{ animation: 'ivrCameraFloat 1.7s ease-in-out infinite' }}>
              <div className="absolute inset-[12%] rounded-full" style={{
                border: `1px solid ${ivrSideColor}55`, boxShadow: `0 0 65px ${ivrSideColor}2c`,
                animation: 'ivrCameraPulse 1.35s ease-out infinite',
              }} />
              <div className="absolute inset-[24%] rounded-full" style={{
                border: `1px dashed ${ivrSideColor}35`, animation: 'ivrCameraOrbit 5s linear infinite',
              }} />
              <img
                data-wab-layer-id="video-replay-result-camera"
                src={ivrRequesterAsset}
                alt={`${ivrSideLabel} video replay camera`}
                style={{
                  display: 'block', width: 'clamp(220px, 24vw, 400px)', height: 'clamp(160px, 17vw, 265px)',
                  objectFit: 'contain', position: 'relative', zIndex: 1,
                  filter: `drop-shadow(0 0 18px ${ivrSideColor}) drop-shadow(0 0 58px ${ivrSideColor}99)`,
                }}
              />
              <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 h-1 rounded-full" style={{ width: '55%', background: ivrSideColor, boxShadow: `0 0 20px ${ivrSideColor}` }} />
            </div>

            <div className="font-display font-black text-white mt-1" style={{ fontSize: 'clamp(19px, 1.9vw, 31px)', animation: 'ivrFadeUp .5s .46s both' }}>
              {ivrPlayerName || ivrSideLabel}
            </div>
            <div className="font-display font-bold tracking-[.28em] mt-1" style={{ color: ivrSideColor, fontSize: 'clamp(9px, .8vw, 13px)' }}>
              {ivrSideLabel} CORNER
            </div>
          </div>

          {/* Decision core */}
          <div className="relative flex flex-col items-center justify-center" style={{ minHeight: 'clamp(180px, 18vw, 280px)' }}>
            <div className="absolute rounded-full" style={{
              width: 'clamp(190px, 20vw, 300px)', height: 'clamp(190px, 20vw, 300px)',
              border: `2px solid ${ivrDecisionColor}75`,
              boxShadow: `0 0 70px ${ivrDecisionColor}35, inset 0 0 60px ${ivrDecisionColor}12`,
              animation: 'ivrPulse 1.2s ease-out infinite',
            }} />
            <div className="absolute rounded-full" style={{
              width: 'clamp(135px, 14vw, 210px)', height: 'clamp(135px, 14vw, 210px)',
              border: `1px solid ${ivrDecisionColor}55`, animation: 'ivrRingSmall 1.5s ease-out infinite',
            }} />
            <div className="font-display font-black leading-none relative" style={{
              fontSize: 'clamp(110px, 15vw, 235px)', color: ivrDecisionColor,
              textShadow: `0 0 22px ${ivrDecisionColor}, 0 0 70px ${ivrDecisionColor}aa, 0 10px 0 rgba(0,0,0,.55)`,
              animation: ivrAccepted ? 'ivrApprove .76s .25s cubic-bezier(.16,1,.3,1) both' : 'ivrReject .76s .25s cubic-bezier(.16,1,.3,1) both',
            }}>
              {ivrAccepted ? 'O' : 'X'}
            </div>
            <div className="font-display font-black tracking-[.22em] mt-[-5px]" style={{ color: ivrDecisionColor, fontSize: 'clamp(10px, .9vw, 15px)', animation: 'ivrFadeUp .5s .5s both' }}>
              {ivrAccepted ? 'REVIEW ACCEPTED' : 'REVIEW REJECTED'}
            </div>
          </div>
        </div>

        {/* Official result strip */}
        <div className="mt-7 md:mt-9 pt-5" style={{ borderTop: `1px solid ${ivrSideColor}35`, animation: 'ivrFadeUp .55s .62s both' }}>
          <div className="font-display font-black text-white leading-none" style={{
            fontSize: 'clamp(34px, 5vw, 76px)', letterSpacing: '.09em',
            textShadow: `0 0 30px ${ivrDecisionColor}35, 0 6px 24px rgba(0,0,0,.7)`,
          }}>
            {ivrAccepted ? 'ACCEPTED' : 'REJECTED'}
          </div>
          <div className="font-display font-bold text-white/70 mt-3" style={{ fontSize: 'clamp(13px, 1.35vw, 22px)' }}>
            {ivrAccepted ? 'قُبل طلب إعادة الفيديو' : 'رُفض طلب إعادة الفيديو'}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-4 text-white/35" style={{ animation: 'ivrFadeUp .55s .78s both' }}>
          <span className="h-px w-10 md:w-20" style={{ background: `${ivrSideColor}40` }} />
          <span className="font-display font-bold tracking-[.22em]" style={{ fontSize: 'clamp(8px, .7vw, 11px)' }}>
            WAB-TKD · OFFICIAL DECISION
          </span>
          <span className="h-px w-10 md:w-20" style={{ background: `${ivrSideColor}40` }} />
        </div>
      </div>

      <style>{`
        @keyframes ivrRequestEnter { 0%{opacity:0;transform:translateY(30px) scale(.82);filter:blur(8px)} 55%{opacity:1;transform:translateY(-3px) scale(1.03);filter:blur(0)} 100%{opacity:1;transform:none} }
        @keyframes ivrRequestRing { 0%{transform:scale(.55);opacity:.8} 100%{transform:scale(1.3);opacity:0} }
        @keyframes ivrRequestScan { from{background-position:0 0} to{background-position:0 32px} }
        @keyframes ivrRequestSweep { 0%,15%{left:-25%;opacity:0} 38%{opacity:.8} 72%{opacity:.2} 100%{left:125%;opacity:0} }
        @keyframes ivrRequestBlink { 0%,100%{opacity:.55} 50%{opacity:1} }
        @keyframes ivrOverlayIn { from{opacity:0;transform:scale(1.015)} to{opacity:1;transform:scale(1)} }
        @keyframes ivrSpin { from{transform:rotate(0deg) scale(1.08)} to{transform:rotate(360deg) scale(1.08)} }
        @keyframes ivrScan { from{background-position:0 0} to{background-position:0 24px} }
        @keyframes ivrRing { 0%{transform:scale(.42);opacity:0} 18%{opacity:.9} 100%{transform:scale(1.18);opacity:0} }
        @keyframes ivrRingSmall { 0%{transform:scale(.72);opacity:.8} 100%{transform:scale(1.22);opacity:0} }
        @keyframes ivrSweep { 0%,15%{left:-20%;opacity:0} 35%{opacity:.75} 72%{opacity:.25} 100%{left:120%;opacity:0} }
        @keyframes ivrCardIn { 0%{transform:translateY(45px) scale(.82);opacity:0;filter:blur(10px)} 58%{transform:translateY(-5px) scale(1.018);opacity:1;filter:blur(0)} 100%{transform:translateY(0) scale(1);opacity:1} }
        @keyframes ivrCardReject { 0%{transform:scale(.86);opacity:0;filter:blur(9px)} 45%{transform:scale(1.018);opacity:1;filter:blur(0)} 58%{transform:translateX(-12px)} 68%{transform:translateX(12px)} 78%{transform:translateX(-7px)} 88%{transform:translateX(7px)} 100%{transform:translateX(0) scale(1);opacity:1} }
        @keyframes ivrCameraFloat { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-9px) scale(1.035)} }
        @keyframes ivrCameraPulse { 0%{transform:scale(.78);opacity:.78} 70%{transform:scale(1.18);opacity:0} 100%{transform:scale(1.18);opacity:0} }
        @keyframes ivrCameraOrbit { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes ivrRequesterIn { 0%{transform:translateX(-60px) scale(.62);opacity:0} 62%{transform:translateX(5px) scale(1.045);opacity:1} 100%{transform:translateX(0) scale(1);opacity:1} }
        @keyframes ivrApprove { 0%{transform:scale(.18) rotate(-25deg);opacity:0} 60%{transform:scale(1.2) rotate(5deg);opacity:1} 100%{transform:scale(1) rotate(0);opacity:1} }
        @keyframes ivrReject { 0%{transform:scale(.18) rotate(-18deg);opacity:0} 55%{transform:scale(1.18) rotate(7deg);opacity:1} 75%{transform:scale(.96) rotate(-3deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
        @keyframes ivrPulse { 0%{transform:scale(.72);opacity:.9} 70%{transform:scale(1.12);opacity:0} 100%{transform:scale(1.12);opacity:0} }
        @keyframes ivrDot { 0%{transform:scale(.6);opacity:.9} 100%{transform:scale(2.8);opacity:0} }
        @keyframes ivrFadeUp { 0%{transform:translateY(18px);opacity:0} 100%{transform:translateY(0);opacity:1} }
        @media (prefers-reduced-motion: reduce) {
          .ivr-reduced-motion, [style*="ivrSpin"], [style*="ivrSweep"] { animation: none !important; }
        }
      `}</style>
    </div>
  );

  // ===== KO animation — side is the WINNER. Colour/logo are always derived from it. =====
  const koAnim = state.koAnimation;
  const koWinner = koAnim?.side ?? null;
  const koOverlay = koAnim && (Date.now() - koAnim.ts < 3000) && (() => {
    const isBlue = koWinner === 'chung';
    const accent = isBlue ? 'hsl(var(--chung))' : 'hsl(var(--hong))';
    const logo = isBlue ? koBlueLogoUrl : koRedLogoUrl;
    return (
      <div data-wab-layer-root="ko" className="fixed inset-0 z-[900] flex items-center justify-center pointer-events-none overflow-hidden" style={{ background: `radial-gradient(circle at 50% 43%, color-mix(in srgb, ${accent} 25%, transparent), rgba(0,0,0,.97) 60%)`, animation: 'ivrOverlayIn .25s ease-out' }}>
        <div data-wab-layer-id="ko-sweep" className="absolute inset-0" style={{ background: `repeating-linear-gradient(120deg, transparent 0 100px, ${accent} 102px, transparent 105px 205px)`, opacity: .32, animation: 'koSweep 1.7s linear infinite' }} />
        <div data-wab-layer-id="ko-flash" className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 45%, ${accent} 0%, transparent 18%), radial-gradient(circle at 50% 50%, rgba(255,255,255,.09), transparent 42%)`, mixBlendMode: 'screen', animation: 'koFlash 1.15s ease-out infinite' }} />
        <div data-wab-layer-id="ko-ring" className="absolute w-[72vmin] h-[72vmin] rounded-full border-2" style={{ borderColor: accent, boxShadow: `0 0 55px ${accent}, inset 0 0 55px ${accent}`, opacity: .6, animation: 'koRing .9s ease-out infinite' }} />
        <div data-wab-layer-id="ko-ring-inner" className="absolute w-[52vmin] h-[52vmin] rounded-full border border-white/15" style={{ borderColor: `${accent}88`, boxShadow: `0 0 28px ${accent}66`, animation: 'koRingInner 1.2s ease-out infinite' }} />
        <div data-wab-layer-id="ko-scan" className="absolute left-0 right-0 top-1/2 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, opacity: .7, boxShadow: `0 0 14px ${accent}`, animation: 'koScan 1.1s ease-in-out infinite' }} />
        <div data-wab-layer-id="ko-brand" className="absolute top-[8%] left-[6%] text-[9px] md:text-xs font-black tracking-[.35em]" style={{ color: accent }}>WAB-TKD · KNOCKOUT</div>
        <div data-wab-layer-id="ko-winner-label" className="absolute top-[8%] right-[6%] text-[9px] md:text-xs font-black tracking-[.25em] text-white/55">WINNER · {isBlue ? 'BLUE' : 'RED'}</div>
        <div data-wab-layer-id="ko-content" className="relative z-10 text-center px-8">
          <div className="mx-auto mb-2 rounded-full p-5" style={{ width: 'clamp(160px, 22vw, 340px)', height: 'clamp(160px, 22vw, 340px)', border: `3px solid ${accent}`, boxShadow: `0 0 30px ${accent}, 0 0 100px color-mix(in srgb, ${accent} 42%, transparent)`, animation: 'koLogoIn .55s cubic-bezier(.2,.8,.2,1) both' }}>
            <img data-wab-layer-id="ko-logo" src={logo} alt="" className="w-full h-full object-contain" />
          </div>
          <div data-wab-layer-id="ko-title" className="font-display font-black leading-none tracking-[.12em]" style={{ color: accent, fontSize: 'clamp(76px, 11vw, 175px)', textShadow: `0 0 14px ${accent}, 0 0 48px ${accent}`, animation: 'koText .8s ease-in-out infinite' }}>KO</div>
          <div data-wab-layer-id="ko-subtitle" className="font-display font-bold tracking-[.28em] text-white/75" style={{ fontSize: 'clamp(16px, 1.7vw, 30px)' }}>{t('broadcastKnockout')}</div>
        </div>
        <style>{`@keyframes koLogoIn {0%{opacity:0;transform:scale(.45) translateY(-25px);filter:blur(10px)}65%{opacity:1;transform:scale(1.08);filter:blur(0)}100%{opacity:1;transform:scale(1)}} @keyframes koText {0%,100%{transform:scale(1);filter:brightness(1)}50%{transform:scale(1.045);filter:brightness(1.45)}} @keyframes koRing {0%{transform:scale(.55);opacity:.8}100%{transform:scale(1.35);opacity:0}} @keyframes koSweep {from{transform:translateX(-18%) rotate(0deg)}to{transform:translateX(18%) rotate(360deg)}} @keyframes koFlash {0%,100%{opacity:.10;transform:scale(.85)}35%{opacity:.38;transform:scale(1.08)}65%{opacity:.16;transform:scale(1.02)}} @keyframes koRingInner {0%{transform:scale(.72);opacity:.7}100%{transform:scale(1.22);opacity:0}} @keyframes koScan {0%,100%{transform:scaleX(.25);opacity:.15}50%{transform:scaleX(1);opacity:.9}}`}</style>
      </div>
    );
  })();

  // ===== Substitution (Par Équipe) — full screen while the operator is
  // entering the replacement's name, then a brief "new player" flash once confirmed =====
  const pendingSub = state.pendingSubstitution;
  const subSideColor = pendingSub?.side === 'chung' ? 'hsl(var(--chung))' : 'hsl(var(--hong))';
  const pendingSubOverlay = pendingSub && state.status !== 'fighting' && (() => {
    const outgoing = state[pendingSub.side].player;
    return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center pointer-events-none" style={{
      background: 'hsl(224 30% 3%)', backdropFilter: 'blur(6px)', animation: 'ivrOverlayIn 0.35s ease-out',
    }}>
      <div className="text-center">
        {(outgoing.photoUrl) && (
          <img src={outgoing.photoUrl} alt="" className="mx-auto mb-4 rounded-full object-cover border-2 opacity-60" style={{ width: 'clamp(90px,10vw,150px)', height: 'clamp(90px,10vw,150px)', borderColor: subSideColor }} />
        )}
        <div className="font-display font-black text-white" style={{ fontSize: 'clamp(28px, 3vw, 56px)', letterSpacing: '0.15em' }} >{t('broadcastSubstitution')}</div>
        <div className="font-display font-bold mt-3" style={{ fontSize: 'clamp(22px, 2.2vw, 40px)', color: subSideColor }}>
          {pendingSub?.side === 'chung' ? 'BLUE' : 'RED'}
        </div>
        {outgoing.name && <div className="mt-2 text-white/45 font-display text-sm tracking-[.15em]">OUT: {outgoing.name}</div>}
      </div>
    </div>
    );
  })();


  // Live CSS overrides driven by settings (uses class hooks on key elements)
  const settingsStyleTag = (
    <style>{`
      .sb-title { font-size: calc(clamp(26px, 2.8vw, 52px) * ${sb.titleScale}) !important; color: ${sb.titleColor} !important; text-shadow: 0 0 22px ${sb.titleColor}88, 0 2px 4px rgba(0,0,0,0.6) !important; }
      .sb-sub   { font-size: calc(clamp(14px, 1.35vw, 22px) * ${sb.subScale}) !important; color: ${sb.subColor} !important; }
      .sb-player-name { font-size: calc(clamp(24px, 2.6vw, 48px) * ${sb.playerNameScale}) !important; color: ${sb.playerNameColor} !important; }
      .sb-score-chung { font-size: calc(clamp(90px, 18vw, 240px) * ${sb.bigScoreScale}) !important; }
      .sb-score-hong  { font-size: calc(clamp(90px, 18vw, 240px) * ${sb.bigScoreScale}) !important; }
      .sb-side-chung { background: ${sb.chungColor} !important; }
      .sb-side-hong  { background: ${sb.hongColor} !important; }
      .sb-timer { font-size: calc(clamp(44px, 5vw, 88px) * ${sb.timerScale}) !important; }
      .sb-fight-badge { background: ${sb.fightColor} !important; box-shadow: 0 0 18px ${sb.fightColor}b3 !important; border-color: ${sb.fightColor} !important; }
      .sb-winner {
        font-size: calc(clamp(60px, 7vw, 120px) * ${sb.winnerSize}) !important;
        color: ${sb.winnerColor} !important;
        text-shadow: 0 0 30px ${sb.winnerColor}88 !important;
        /* Fixed dark outline, independent of the chosen text color and of
           the banner's gold-metal background/frame — so "WINNER" always
           reads clearly even if the operator picks a gold/yellow text
           color that would otherwise blend into the gold frame around it. */
        -webkit-text-stroke: 2px hsl(224 45% 7% / 0.85);
        paint-order: stroke fill;
      }
      .sb-flag { transform: scale(${sb.flagScale}); transform-origin: center; }
      .sb-round-active { border-color: ${sb.roundActiveColor} !important; box-shadow: 0 0 18px ${sb.roundActiveColor}66 !important; }
      .sb-gamjeom-dot { background: ${sb.gamjeomColor} !important; color: #000 !important; }
      .sb-hit-icon { color: ${sb.hitIconColor} !important; }
      .sb-hit-icon svg { color: ${sb.hitIconColor} !important; }
    `}</style>
  );

  const SbField = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex items-center gap-2 py-1">
      <span className="font-display text-[10px] text-white/55 uppercase tracking-wide flex-1">{label}</span>
      <div className="flex items-center gap-1.5">{children}</div>
    </div>
  );
  const SbSlider = ({ value, onChange, min, max, step = 0.1 }: any) => (
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(+e.target.value)} className="w-28 accent-amber-400" />
  );
  const SbColor = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <input type="color" value={value} onChange={e => onChange(e.target.value)}
      className="w-8 h-6 rounded cursor-pointer bg-transparent border border-white/20" />
  );
  const SbNum = ({ value }: { value: number }) => (
    <span className="font-display text-[10px] text-white/80 tabular-nums w-9 text-right">
      {Number.isInteger(value) ? value : value.toFixed(2)}
    </span>
  );

  // Settings overlay — comprehensive control panel
  const settingsOverlay = !isPublicWindow && showSettings && (
    <div className="fixed top-14 right-4 z-[60] rounded-2xl p-4 w-[340px] max-h-[80vh] overflow-y-auto" style={{
      background: 'hsl(224 35% 8%)', border: '1px solid hsl(224 35% 18%)', boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
    }}>
      <div className="flex items-center justify-between mb-3">
        <div className="font-display text-sm font-bold text-white tracking-wider" >{t('broadcastScoreboardControls')}</div>
        <button onClick={() => setShowSettings(false)} className="text-white/50 hover:text-white"><X size={14} /></button>
      </div>

      <div className="flex gap-1 mb-3 p-1 rounded-lg bg-black/30">
        {(['sizes', 'colors', 'text'] as const).map(t => (
          <button key={t} onClick={() => setSbTab(t)}
            className={`flex-1 text-[11px] font-display font-bold tracking-wider py-1.5 rounded-md uppercase ${sbTab === t ? 'bg-amber-400 text-black' : 'text-white/60 hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      {sbTab === 'sizes' && (
        <div className="space-y-1">
          <SbField label="Title"><SbSlider value={sb.titleScale} min={0.5} max={2} onChange={(v: number) => setDisplaySettings(s => ({ ...s, titleScale: v }))} /><SbNum value={sb.titleScale} /></SbField>
          <SbField label="Sub header"><SbSlider value={sb.subScale} min={0.5} max={2} onChange={(v: number) => setDisplaySettings(s => ({ ...s, subScale: v }))} /><SbNum value={sb.subScale} /></SbField>
          <SbField label="Player name"><SbSlider value={sb.playerNameScale} min={0.6} max={1.8} onChange={(v: number) => setDisplaySettings(s => ({ ...s, playerNameScale: v }))} /><SbNum value={sb.playerNameScale} /></SbField>
          <SbField label="Flag"><SbSlider value={sb.flagScale} min={0.6} max={1.6} onChange={(v: number) => setDisplaySettings(s => ({ ...s, flagScale: v }))} /><SbNum value={sb.flagScale} /></SbField>
          <SbField label="Big score"><SbSlider value={sb.bigScoreScale} min={0.6} max={1.6} onChange={(v: number) => setDisplaySettings(s => ({ ...s, bigScoreScale: v }))} /><SbNum value={sb.bigScoreScale} /></SbField>
          <SbField label="Timer"><SbSlider value={sb.timerScale} min={0.6} max={1.8} onChange={(v: number) => setDisplaySettings(s => ({ ...s, timerScale: v }))} /><SbNum value={sb.timerScale} /></SbField>
          <SbField label="Winner banner"><SbSlider value={sb.winnerSize} min={0.6} max={1.8} onChange={(v: number) => setDisplaySettings(s => ({ ...s, winnerSize: v }))} /><SbNum value={sb.winnerSize} /></SbField>
          <SbField label="Hit icon (px)"><SbSlider value={sb.hitIconSize} min={14} max={48} step={1} onChange={(v: number) => setDisplaySettings(s => ({ ...s, hitIconSize: v }))} /><SbNum value={sb.hitIconSize} /></SbField>
          <SbField label="Gamjeom dot (px)"><SbSlider value={sb.gamjeomSize} min={10} max={36} step={1} onChange={(v: number) => setDisplaySettings(s => ({ ...s, gamjeomSize: v }))} /><SbNum value={sb.gamjeomSize} /></SbField>
          <SbField label="Round box border"><SbSlider value={sb.roundBoxBorder} min={1} max={8} step={0.5} onChange={(v: number) => setDisplaySettings(s => ({ ...s, roundBoxBorder: v }))} /><SbNum value={sb.roundBoxBorder} /></SbField>
        </div>
      )}

      {sbTab === 'colors' && (
        <div className="space-y-1">
          <SbField label="Title"><SbColor value={sb.titleColor} onChange={v => setDisplaySettings(s => ({ ...s, titleColor: v }))} /></SbField>
          <SbField label="Sub header"><SbColor value={sb.subColor} onChange={v => setDisplaySettings(s => ({ ...s, subColor: v }))} /></SbField>
          <SbField label="Player name"><SbColor value={sb.playerNameColor} onChange={v => setDisplaySettings(s => ({ ...s, playerNameColor: v }))} /></SbField>
          <SbField label="Chung (blue) bg"><SbColor value={sb.chungColor} onChange={v => setDisplaySettings(s => ({ ...s, chungColor: v }))} /></SbField>
          <SbField label="Hong (red) bg"><SbColor value={sb.hongColor} onChange={v => setDisplaySettings(s => ({ ...s, hongColor: v }))} /></SbField>
          <SbField label="Timer"><SbColor value={sb.timerColor} onChange={v => setDisplaySettings(s => ({ ...s, timerColor: v }))} /></SbField>
          <SbField label="FIGHT badge"><SbColor value={sb.fightColor} onChange={v => setDisplaySettings(s => ({ ...s, fightColor: v }))} /></SbField>
          <SbField label="Winner"><SbColor value={sb.winnerColor} onChange={v => setDisplaySettings(s => ({ ...s, winnerColor: v }))} /></SbField>
          <SbField label="Active round"><SbColor value={sb.roundActiveColor} onChange={v => setDisplaySettings(s => ({ ...s, roundActiveColor: v }))} /></SbField>
          <SbField label="Gamjeom"><SbColor value={sb.gamjeomColor} onChange={v => setDisplaySettings(s => ({ ...s, gamjeomColor: v }))} /></SbField>
          <SbField label="Hit icons"><SbColor value={sb.hitIconColor} onChange={v => setDisplaySettings(s => ({ ...s, hitIconColor: v }))} /></SbField>
          <SbField label="Video Replay text"><SbColor value={sb.ivrRequestColor} onChange={v => setDisplaySettings(s => ({ ...s, ivrRequestColor: v }))} /></SbField>
        </div>
      )}

      {sbTab === 'text' && (
        <div className="space-y-2">
          <div>
            <div className="font-display text-[10px] text-white/55 uppercase tracking-wide mb-1">FIGHT badge text</div>
            <input type="text" value={sb.fightText} maxLength={10}
              onChange={e => setDisplaySettings(s => ({ ...s, fightText: e.target.value.toUpperCase() }))}
              className="w-full px-2 py-1.5 rounded-md bg-black/40 border border-white/15 text-white font-display text-sm tracking-widest" />
          </div>
          <div className="text-[10px] text-white/40 leading-relaxed pt-2">
            Tip: use Sizes &amp; Colors tabs for everything else. Settings are saved automatically and apply to every match.
          </div>
        </div>
      )}

      <button onClick={() => setDisplaySettings(DEFAULT_SB)}
        className="w-full mt-3 px-3 py-1.5 rounded-lg text-xs bg-white/10 text-white/70 hover:bg-white/20 font-display tracking-wider">
        RESET DEFAULTS
      </button>
    </div>
  );

  // ================================================================
  // 🏆 MATCH END FRAME — Daedo style
  // ================================================================
  if (currentFrame === 'match_end' && result) {
    const w = result.winner;
    // Par Équipe "rotation" — the winner is the TEAM (by total point
    // difference across every player's rounds), so show the team name and
    // point totals here instead of whichever individual last happened to be
    // on the mat and the round-win tally.
    const isTeamReveal = !!state.teamNames && !!state.teamRoster && (state.teamMode === 'rotation' || state.config?.competitionMode === 'par_equipe');
    if (isTeamReveal) {
      if (state.showTeamResultCard) return <TeamResultCard state={state} winner={w} isMiniPreview={isMiniPreview} />;
      return <TeamWinnerScreen state={state} winner={w} winnerScale={winnerScale} isMiniPreview={isMiniPreview} />;
    }
    // Individual matches use the single production Winner renderer. It is a
    // static 1920x1080 information frame: no cinematic intro or legacy result
    // hold is inserted before it. Team-result rendering remains untouched.
    if (!isTeamReveal) {
      return <IndividualWinnerAnimation state={state} winner={w} />;
    }
    const displayName = state.teamNames![w];
    const chungBig = isTeamReveal ? state.chung.totalScore : chungRoundWins;
    const hongBig = isTeamReveal ? state.hong.totalScore : hongRoundWins;
    const resultMethodLabel = isTeamReveal ? 'فارق النقاط' : result.method;
    const isKoResult = !isTeamReveal && String(result.method || '').toUpperCase().replace(/[^A-Z]/g, '') === 'KO';
    const isGoldenResult = !isTeamReveal && String(result.method || '').toUpperCase() === 'GDP';
    const koResultIcon = w === 'chung' ? koBlueLogoUrl : koRedLogoUrl;
    // Par Équipe winner reveal also needs the team photo, the CLUB logo/name
    // (separate from the team's own identity), and every player who
    // fought — not just the team name — so the audience sees the whole
    // roster on the champion banner, matching the pre-match team call.
    const winTeamLogo = isTeamReveal ? state.teamLogos?.[w] : undefined;
    const winClubLogo = isTeamReveal ? state.clubLogos?.[w] : undefined;
    const winClubName = isTeamReveal ? state[w].player.club : undefined;
    const winRoster = isTeamReveal ? state.teamRoster?.[w] : undefined;
    // The losing team's identity + roster — shown mirrored, in the same
    // individual player-card style, so the audience sees both full squads
    // on the result screen, not just the winner's.
    const loserSide: PlayerColor = w === 'chung' ? 'hong' : 'chung';
    const loserTeamName = isTeamReveal ? state.teamNames?.[loserSide] : undefined;
    const loserTeamLogo = isTeamReveal ? state.teamLogos?.[loserSide] : undefined;
    const loserClubLogo = isTeamReveal ? state.clubLogos?.[loserSide] : undefined;
    const loserClubName = isTeamReveal ? state[loserSide].player.club : undefined;
    const loserRoster = isTeamReveal ? state.teamRoster?.[loserSide] : undefined;
    const loserColor = loserSide === 'chung' ? 'hsl(217 91% 55%)' : 'hsl(0 72% 51%)';
    const isChung = w === 'chung';
    const winColor = isChung ? 'hsl(217 91% 55%)' : 'hsl(0 72% 51%)';
    const winGlow = isChung ? 'hsl(217 91% 55% / 0.25)' : 'hsl(0 72% 51% / 0.25)';
    const particleColor = isChung ? 'hsl(217 91% 65%)' : 'hsl(0 72% 60%)';

    // Best Player (MVP) — computed strictly from real roundScores data
    // (sum of points actually scored across their rounds), across BOTH
    // rosters, not invented. Only shown when at least one roster entry has
    // recorded scores.
    const mvp = (() => {
      const candidates: { name: string; photo?: string; nationality?: string; side: PlayerColor; total: number }[] = [];
      (['chung', 'hong'] as PlayerColor[]).forEach((side) => {
        (state.teamRoster?.[side] || []).forEach((entry: any) => {
          const total = (entry.roundScores || []).reduce((sum: number, rs: any) => sum + (rs.score || 0), 0);
          if (total > 0) candidates.push({ name: entry.name, photo: entry.photo, nationality: entry.nationality, side, total });
        });
      });
      candidates.sort((a, b) => b.total - a.total);
      return candidates[0];
    })();
    const mvpColor = mvp?.side === 'chung' ? 'hsl(217 91% 58%)' : 'hsl(0 72% 55%)';

    return (
      <div key="frame-end" className={`fixed inset-0 flex flex-col overflow-hidden ${isMiniPreview ? 'public-scoreboard-mini' : ''}`}
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${winGlow}, transparent 55%),
            radial-gradient(ellipse at 50% 105%, hsl(45 80% 10% / 0.55), transparent 60%),
            radial-gradient(ellipse at 50% 40%, hsl(224 40% 7%), hsl(224 45% 2%) 85%)`,
          animation: 'frameEnter 0.7s ease-out',
        }}
        onMouseEnter={() => setShowNav(true)} onMouseLeave={() => setShowNav(false)}>
        {persistentTopNav}
        {/* Broadcast-style bezel frame — a strong double border with a
            faint gold glow, so the whole result reads as a produced
            championship graphic rather than a plain fullscreen panel. */}
        <div className="fixed inset-3 pointer-events-none z-30" style={{
          border: '1px solid hsl(45 93% 58% / 0.35)',
          boxShadow: 'inset 0 0 0 1px hsl(224 40% 60% / 0.12), inset 0 0 60px hsl(45 93% 58% / 0.08)',
          borderRadius: 18,
        }} />
        <div className="fixed inset-5 pointer-events-none z-30" style={{
          border: '1px solid hsl(224 40% 70% / 0.10)',
          borderRadius: 14,
        }} />
        <style>{`@keyframes winnerMedalFloat { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-8px) rotate(1deg)} }`}</style>
        {isTeamReveal && <EntryFreeze vsPulse={entryVsPulse} dark={entryDark} done={winnerScale} />}
        {settingsOverlay}{settingsStyleTag}{ivrRequestOverlay}{ivrOverlay}{koOverlay}{doctorCallOverlay}{kyeshiCallOverlay}{cinematicActive ? null : pendingSubOverlay}{substitutionAnimationOverlay || teamCallOverlay || callAnimationOverlay || (state.matchupAnimation ? matchupOverlay : null) || (cinematicActive ? null : nextOnMatchOverlay)}{cinematicActive ? null : readyBanner}{cinematicActive ? null : greetingBanner}{cinematicActive ? null : goldenBanner}{cinematicActive ? null : goldenPointOverlay}{cinematicActive ? null : standingsOverlay}



        {/* Ambient screen glow */}
        <div className="absolute inset-0 pointer-events-none z-0" style={{
          background: `radial-gradient(circle at 50% 50%, ${winGlow}, transparent 50%)`,
          animation: 'screenGlow 3s ease-in-out infinite alternate',
        }} />

        {/* TOP: Category bar — expanded to the same full tournament-info
            set as the reference broadcast graphic (mat, match no, round,
            age, gender), not just competition name + weight. */}
        <div className="relative z-20 px-6 py-2.5" style={{ background: 'hsl(224 35% 8% / 0.94)', borderBottom: '1px solid hsl(224 35% 15%)' }}>
          <div className="text-center font-display font-black tracking-[.22em] text-[#ffd866] uppercase mb-2" style={{ fontSize: 'clamp(14px,1.4vw,24px)' }}>
            {state.competitionName || 'TAEKWONDO CHAMPIONSHIP'}
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 max-w-6xl mx-auto">
            {[
              ['WEIGHT', (dc.showWeight && state.weightCategory) || '—'],
              ['MAT', state.matNumber ? `MAT ${String(state.matNumber).padStart(2, '0')}` : 'MAT 01'],
              ['MATCH NO.', state.matchNumber ? String(state.matchNumber).padStart(3, '0') : '---'],
              ['ROUND', `${state.roundWinners?.length || state.currentRound || 1} / ${state.config?.rounds || 3}`],
              ['AGE', state.ageGroup || '—'],
              ['GENDER', state.gender === 'female' ? 'WOMEN' : state.gender === 'male' ? 'MEN' : (state.gender || '—')],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg px-2 py-1.5 text-center" style={{ border: '1px solid rgba(255,216,102,.22)', background: 'rgba(255,255,255,.025)', boxShadow: 'inset 0 0 14px rgba(255,216,102,.035)' }}>
                <div className="text-white/35 font-display tracking-[.12em]" style={{ fontSize: 7 }}>{label}</div>
                <div className="font-display font-black text-white/90 truncate" style={{ fontSize: 11 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* INDIVIDUAL RESULT — championship information, MATCH RESULT, winner,
            medal, round results and rounds won are deliberately separated so
            every frame has its own clean visual hierarchy. */}
        <div className="relative z-20 mx-6 mt-3 text-center" style={{ opacity: winnerScale ? 1 : 0, transform: winnerScale ? 'translateY(0)' : 'translateY(18px)', transition: 'all .55s ease-out .15s' }}>
          <div className="font-display font-black tracking-[.22em] text-white" style={{ fontSize: 'clamp(22px,3vw,44px)' }}>
            MATCH <span className="text-[#ffd866]">{state.matchNumber || '---'} — RESULT</span>
          </div>
        </div>

        {/* Large WINNER frame. Medal is anchored on the right, never inside
            the text flow, so long player names cannot push it away. */}
        <div className="relative z-20 mx-6 mt-3 rounded-2xl px-6 py-4 flex items-center justify-between gap-5 overflow-hidden" style={{
          border: `2px solid ${winColor}88`,
          background: `linear-gradient(100deg, ${winGlow}, rgba(0,0,0,.58) 58%, rgba(255,216,102,.08))`,
          boxShadow: `0 0 45px ${winGlow}, inset 0 0 30px rgba(255,255,255,.025)`,
          minHeight: 'clamp(110px,15vh,170px)',
          opacity: winnerScale ? 1 : 0,
          transform: winnerScale ? 'scale(1)' : 'scale(.97)',
          transition: 'all .65s cubic-bezier(.2,.8,.25,1) .3s'
        }}>
          <div className="text-left min-w-0">
            <div className="inline-flex items-center rounded-xl px-5 py-2 border-2" style={{ borderColor: `${winColor}99`, background: 'rgba(0,0,0,.30)' }}>
              <span className="font-display font-black tracking-[.2em]" style={{ fontSize: 'clamp(30px,4vw,58px)', color: winColor, textShadow: `0 0 28px ${winGlow}` }}>WINNER</span>
            </div>
            <div className="mt-2 font-display font-black text-white/85 tracking-[.12em] truncate" style={{ fontSize: 'clamp(16px,2vw,28px)', maxWidth: '65vw' }}>{displayName.toUpperCase()}</div>
            <div className="mt-2 flex items-center gap-2">
              {isKoResult && <img data-wab-layer-id="winner-ko-icon" src={koResultIcon} alt="KO" className="object-contain" style={{ width: 72, height: 40 }} />}
              <span className={`rounded-md border px-3 py-1 font-display font-black text-[9px] tracking-[.18em] ${isGoldenResult ? 'border-yellow-300/50 bg-yellow-300/10 text-yellow-200' : isKoResult ? 'border-red-300/40 bg-red-300/10 text-red-100' : 'border-white/10 bg-black/25 text-white/45'}`}>{isGoldenResult ? 'GOLDEN POINT' : isKoResult ? 'KNOCKOUT · KO' : String(resultMethodLabel || 'PTF').toUpperCase()}</span>
            </div>
          </div>
          <div className="shrink-0 flex items-center justify-center" style={{ width: 'clamp(100px,12vw,170px)', height: 'clamp(100px,12vw,170px)' }}>
            <img data-wab-layer-id="winner-trophy" src={medalWabTkdUrl} alt="WAB-TKD championship medal" className="w-full h-full object-contain" style={{ filter: 'drop-shadow(0 0 18px rgba(255,226,120,.95)) drop-shadow(0 0 55px rgba(255,170,0,.45))', animation: winnerScale ? 'winnerMedalFloat 3s ease-in-out .7s infinite' : 'none' }} />
          </div>
        </div>

        {/* Round information: ROUNDS WON is one clean frame on the left;
            ROUND RESULTS is a separate clear frame on the right. */}
        <div className="relative z-20 w-full max-w-5xl grid grid-cols-[minmax(180px,.72fr)_minmax(0,1.28fr)] gap-4 mt-3 px-6" style={{ opacity: winnerScale ? 1 : 0, transform: winnerScale ? 'translateY(0)' : 'translateY(20px)', transition: 'all .6s ease-out .45s' }}>
          <div className="rounded-2xl p-4 flex flex-col justify-center" style={{ border: '2px solid rgba(255,216,102,.32)', background: 'rgba(0,0,0,.38)', boxShadow: 'inset 0 0 30px rgba(255,216,102,.035)' }}>
            <div className="text-center font-display font-black tracking-[.2em] text-[#ffd866]" style={{ fontSize: 10 }}>ROUNDS WON</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="text-center"><div className="font-display font-black leading-none" style={{ fontSize: 'clamp(58px,7vw,94px)', color: 'hsl(0 80% 60%)', textShadow: '0 0 28px hsl(0 72% 51% / .5)' }}>{hongBig}</div><div className="text-[9px] font-black tracking-[.16em] text-red-200/70">RED</div></div>
              <div className="text-center"><div className="font-display font-black leading-none" style={{ fontSize: 'clamp(58px,7vw,94px)', color: 'hsl(217 91% 60%)', textShadow: '0 0 28px hsl(217 91% 55% / .5)' }}>{chungBig}</div><div className="text-[9px] font-black tracking-[.16em] text-blue-200/70">BLUE</div></div>
            </div>
            <div className="mt-3 h-px bg-white/15" />
            <div className="mt-2 text-center text-[8px] tracking-[.12em] text-white/35">RED ←────────→ BLUE</div>
          </div>
          <div className="rounded-2xl p-4" style={{ border: '2px solid rgba(255,216,102,.32)', background: 'rgba(0,0,0,.38)', boxShadow: 'inset 0 0 30px rgba(255,216,102,.035)' }}>
            <div className="text-center font-display font-black tracking-[.22em] text-[#ffd866]" style={{ fontSize: 10 }}>ROUND RESULTS</div>
            <div className="mt-2 divide-y divide-white/10">
              {Array.from({ length: Math.max(3, state.config?.rounds || 3) }, (_, idx) => idx + 1).map(rn => {
                const rw = state.roundWinners.find(r => r.round === rn);
                const roundKo = rw && String(rw.method || '').toUpperCase().replace(/[^A-Z]/g, '') === 'KO';
                const roundDecision = rw?.decisionType === 'AI_RECOMMENDATION' ? 'AI' : rw?.decisionType === 'WOOSE_GIROK' ? 'WOO-SE-GIROK' : rw?.method ? String(rw.method).toUpperCase() : '';
                return <div key={rn} className="grid grid-cols-[1fr_1fr_1fr] items-center gap-3 py-2.5 font-display border-b border-white/5 last:border-b-0">
                  <span className="text-white/60 font-black tracking-[.12em] text-left flex items-center gap-2" style={{ fontSize: 10 }}>ROUND {rn}{roundKo && rw && rw.winner !== 'draw' && <img src={rw.winner === 'chung' ? koBlueLogoUrl : koRedLogoUrl} alt="KO" style={{ width: 34, height: 22, objectFit: 'contain' }} />}</span>
                  <span className="text-center font-black text-blue-300" style={{ fontSize: 20 }}>{rw ? rw.chungScore : '—'}</span>
                  <span className="text-center font-black text-red-300" style={{ fontSize: 20 }}>{rw ? rw.hongScore : '—'}</span>
                  {roundDecision && <span className="col-span-3 -mt-1 text-center text-[8px] font-black tracking-[.16em] text-white/35">{roundDecision}</span>}
                </div>;
              })}
            </div>
            <div className="mt-2 grid grid-cols-3 text-[7px] tracking-[.16em] text-white/30"><span></span><span className="text-center text-blue-300/70">BLUE</span><span className="text-center text-red-300/70">RED</span></div>
          </div>
        </div>

          {/* Champion info bar — flag flush against the left edge (full
              bar height, no border/rounding of its own) with the name set
              directly beside it, left-aligned, on the same team-colour
              strip: matches the reference broadcast graphic's
              flag-block + name-block layout exactly, rather than a
              centered card with a floating framed flag. */}
          <div className="w-full max-w-3xl" style={{
            transform: winnerScale ? 'translateY(0)' : 'translateY(40px)',
            opacity: winnerScale ? 1 : 0,
            transition: 'all 0.6s ease-out 0.6s',
          }}>
            <div className="rounded-xl overflow-hidden flex items-stretch" style={{
              background: winColor,
              boxShadow: `0 0 30px ${winGlow}`,
              minHeight: 88,
            }}>
              {/* Individual match ("لاعب ضد لاعب"): large flag/photo block
                  with its own clean frame — a real player photo gets a
                  visible border so it reads as a distinct framed element
                  (per broadcast-graphic convention); the flag fallback
                  stays flush with the bar like a TV lower-third. */}
              {!isTeamReveal && dc.showFlag && (
                <div className="shrink-0" style={{ width: 132, animation: 'gpZoomIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both' }}>
                  {(dc.showPhoto && state[w].player.photoUrl) ? (
                    <img src={state[w].player.photoUrl} alt="" className="w-full h-full object-cover" style={{
                      border: '3px solid rgba(255,255,255,0.85)', boxSizing: 'border-box',
                    }} />
                  ) : (
                    <div data-wab-layer-id="winner-flag" className="w-full h-full"><FlagImage code={state[w].player.nationality} size={120} className="w-full h-full object-cover" /></div>
                  )}
                </div>
              )}
              {/* Par Équipe: team crest — team logo + club logo badge, with
                  an expanding shockwave ring burst on entrance so it reads
                  as a trophy/crest presentation rather than a personal
                  spotlight — the whole squad's win, not one athlete's. */}
              {isTeamReveal && (winTeamLogo || winClubLogo) && (
                <div className="relative shrink-0 my-3 ml-3" style={{ width: 88, height: 88 }}>
                  <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none" style={{
                    border: `3px solid ${winColor}`, width: 40, height: 40, animation: 'gpShockwave 1.6s ease-out infinite',
                  }} />
                  <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none" style={{
                    border: `3px solid ${winColor}`, width: 40, height: 40, animation: 'gpShockwave 1.6s ease-out 0.5s infinite',
                  }} />
                  <img src={winTeamLogo || winClubLogo} alt="" className="relative w-full h-full rounded-2xl object-cover" style={{
                    border: '4px solid white', boxShadow: `0 0 30px ${winColor}, 0 0 60px ${winColor.replace(')', ' / 0.5)')}`,
                    animation: 'gpZoomIn 0.7s cubic-bezier(0.34,1.56,0.64,1) both, callGlowPulse 2.2s ease-in-out infinite',
                  }}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                  {winClubLogo && winTeamLogo && winClubLogo !== winTeamLogo && (
                    <img src={winClubLogo} alt="" className="absolute rounded-full object-cover bg-black"
                      style={{ width: '38%', height: '38%', bottom: '-8%', right: '-8%', border: '2px solid rgba(255,255,255,0.85)' }} />
                  )}
                </div>
              )}
              <div className="flex-1 flex flex-col justify-center gap-1.5 px-5 py-2 text-left" dir="ltr">
                {/* Name + country — its own framed box, per broadcast
                    convention, rather than plain floating text. */}
                <div className="inline-block w-fit px-3 py-1 rounded-md" style={{
                  border: '2px solid rgba(255,255,255,0.55)', background: 'rgba(0,0,0,0.15)',
                }}>
                  <div className="font-display text-3xl font-black text-white tracking-wider" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                    {isTeamReveal
                      ? displayName
                      : `${displayName.toUpperCase()}${state[w].player.nationality ? ` (${state[w].player.nationality})` : ''}`}
                  </div>
                </div>
                {isTeamReveal && (
                  <div className="font-display text-sm text-white/70">
                    {resultMethodLabel}{winClubName ? ` • ${winClubName}` : ''}
                  </div>
                )}
                {/* Club name — its own small framed badge, shown only when
                    the winning player actually has one on file. */}
                {!isTeamReveal && dc.showClub && state[w].player.club && (
                  <div className="inline-block w-fit px-2.5 py-0.5 rounded-md" style={{
                    border: '1.5px solid rgba(255,255,255,0.45)', background: 'rgba(0,0,0,0.15)',
                  }}>
                    <div className="font-display text-sm font-bold text-white/85 tracking-wide">
                      {state[w].player.club}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Individual player cards — every player who represented each
                team, as its own small photo/initial frame (not a flat text
                badge), winner's squad prominent and the loser's squad
                mirrored beside it in the same style, so the audience sees
                both full rosters on the result screen. */}
            {isTeamReveal && ((winRoster && winRoster.length > 0) || (loserRoster && loserRoster.length > 0)) && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {[
                  { roster: loserRoster, color: loserColor, teamName: loserTeamName, clubName: loserClubName, label: 'الفريق الخاسر', isLoser: true },
                  { roster: winRoster, color: winColor, teamName: displayName, clubName: winClubName, label: 'الفريق الفائز', isLoser: false },
                ].map((group, gi) => group.roster && group.roster.length > 0 && (
                  <div key={gi} className="rounded-xl p-3" style={{
                    background: 'hsl(224 35% 10% / 0.5)',
                    border: `1px solid ${group.color.replace(')', ' / 0.35)')}`,
                    opacity: group.isLoser ? 0.55 : 1,
                    filter: group.isLoser ? 'grayscale(0.5) brightness(0.75)' : 'none',
                    transition: 'opacity 0.6s ease, filter 0.6s ease',
                  }}>
                    <div className="text-center font-display text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: group.color }}>
                      {group.label} • {group.teamName}
                    </div>
                    <div className="flex flex-wrap items-start justify-center gap-2.5">
                      {[...group.roster]
                        .sort((a, b) => (a.playerNumber ?? a.seedNumber ?? 0) - (b.playerNumber ?? b.seedNumber ?? 0))
                        .map((p, i) => (
                          <div key={i} className="flex flex-col items-center gap-1" style={{ width: 58 }}>
                            <div className="relative">
                              {p.photo ? (
                                <img src={p.photo} alt="" className="rounded-lg object-cover" style={{
                                  width: 52, height: 52, border: `2px solid ${group.color}`,
                                }} />
                              ) : (
                                <div className="rounded-lg flex items-center justify-center font-display font-bold text-white/70" style={{
                                  width: 52, height: 52, border: `2px solid ${group.color}`, background: 'hsl(0 0% 100% / 0.08)', fontSize: 16,
                                }}>
                                  {p.name.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase()}
                                </div>
                              )}
                              {(p.playerNumber ?? p.seedNumber) != null && (
                                <div className="absolute -top-1.5 -left-1.5 rounded flex items-center justify-center font-display font-bold" style={{
                                  width: 16, height: 16, fontSize: 9, background: group.color, color: 'hsl(224 40% 6%)',
                                  border: '1px solid rgba(255,255,255,0.6)',
                                }}>
                                  {p.playerNumber ?? p.seedNumber}
                                </div>
                              )}
                              {p.nationality && (
                                <div className="absolute -bottom-1 -right-1 rounded shadow" style={{ border: '1px solid rgba(255,255,255,0.4)' }}>
                                  <FlagImage code={p.nationality} size={18} className="w-[18px] h-3 rounded" />
                                </div>
                              )}
                            </div>
                            <span className="font-display text-[9px] font-bold text-white/85 text-center leading-tight truncate w-full">
                              {p.name}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Best Player (MVP) — the athlete with the most points actually
                scored across their rounds, computed from real data above.
                Uses the same gold "winner" treatment as the trophy screen. */}
            {isTeamReveal && mvp && (
              <div className="mt-4 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden" style={{
                border: '2px solid rgba(255,216,102,.75)',
                background: 'linear-gradient(160deg, rgba(255,202,64,.14), rgba(2,6,13,.9) 55%, rgba(0,0,0,.97))',
                boxShadow: '0 0 32px rgba(255,194,35,.25), inset 0 1px 0 rgba(255,255,255,.1)',
                animation: 'seqFadeUp .6s cubic-bezier(.22,1,.36,1) .3s both',
              }}>
                <div className="absolute inset-x-0 top-0 h-1" style={{ background: 'linear-gradient(90deg, transparent, #ffd866, #fff6c0, #ffd866, transparent)' }} />
                <div className="relative shrink-0">
                  {mvp.photo ? (
                    <img src={mvp.photo} alt="" className="rounded-xl object-cover" style={{ width: 68, height: 68, border: '3px solid #ffd866', boxShadow: '0 0 20px rgba(255,216,102,.6)' }} />
                  ) : (
                    <div className="rounded-xl flex items-center justify-center font-display font-black text-white/70" style={{ width: 68, height: 68, border: '3px solid #ffd866', background: 'rgba(255,255,255,.08)', fontSize: 22 }}>
                      {mvp.name.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                  )}
                  <div className="absolute -top-2 -right-2 rounded-full flex items-center justify-center" style={{ width: 24, height: 24, background: '#ffd866', boxShadow: '0 0 10px rgba(255,216,102,.8)' }}>
                    <span style={{ fontSize: 13 }}>🏅</span>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display font-black tracking-[.2em] text-[#ffd866]" style={{ fontSize: 10 }}>BEST PLAYER / أفضل لاعب</div>
                  <div className="font-display font-black text-white truncate" style={{ fontSize: 'clamp(18px,2vw,28px)' }}>{mvp.name}</div>
                  {mvp.nationality && <div className="font-display font-bold text-white/60" style={{ fontSize: 12 }}>{mvp.nationality} • <span style={{ color: mvpColor }}>{mvp.side === 'chung' ? 'BLUE' : 'RED'}</span></div>}
                </div>
                <div className="shrink-0 text-center rounded-xl px-4 py-2" style={{ border: '1px solid rgba(255,216,102,.6)', background: 'rgba(2,5,10,.7)' }}>
                  <div className="font-display text-[#ffd866]/70" style={{ fontSize: 9 }} >{t('broadcastPoints')}</div>
                  <div className="font-display font-black text-[#ffd866]" style={{ fontSize: 26 }}>{mvp.total}</div>
                </div>
              </div>
            )}
          </div>

          {/* Round-by-round summary */}
          <div className="w-full max-w-2xl" style={{
            opacity: winnerScale ? 1 : 0,
            transition: 'opacity 0.6s ease-out 0.8s',
          }}>
            <div className="grid gap-1.5">
              {state.roundWinners.map(rw => (
                <div key={rw.round} className="flex items-center gap-4 px-5 py-2 rounded-lg" style={{ background: 'hsl(224 35% 8% / 0.7)' }}>
                  <span className="font-display text-xs text-white/30 w-8">R{rw.round}</span>
                  <span className="flex-1 text-right font-display font-bold" style={{ color: 'hsl(217 91% 55%)' }}>{rw.chungScore}</span>
                  <span className="text-white/15 text-xs">—</span>
                  <span className="flex-1 font-display font-bold" style={{ color: 'hsl(0 72% 51%)' }}>{rw.hongScore}</span>
                  <span className="w-6 text-center">{rw.winner === 'chung' ? '🔵' : rw.winner === 'hong' ? '🔴' : '—'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Calling next players — name + side color, VS between, pulled
              straight from the tournament bracket so the audience (and the
              next two athletes) know immediately who's up. */}
          {nextMatch && (
            <div className="w-full max-w-2xl" style={{
              opacity: winnerScale ? 1 : 0,
              transform: winnerScale ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.6s ease-out 1s',
            }}>
              <div className="text-center font-display text-xs text-white/40 tracking-[0.3em] uppercase mb-2">Next Match</div>
              <div className="flex items-center justify-center gap-5 rounded-xl py-4 px-6" style={{ background: 'hsl(224 35% 8% / 0.85)', border: '1px solid hsl(224 35% 18%)' }}>
                <div className="text-center flex-1 max-w-[260px]">
                  <div className="font-display text-2xl font-black truncate" style={{ color: 'hsl(217 91% 60%)', textShadow: '0 0 15px hsl(217 91% 55% / 0.4)' }}>
                    {nextMatch.player1?.name}
                  </div>
                </div>
                <div className="font-display text-xl text-white/25 font-bold">VS</div>
                <div className="text-center flex-1 max-w-[260px]">
                  <div className="font-display text-2xl font-black truncate" style={{ color: 'hsl(0 72% 58%)', textShadow: '0 0 15px hsl(0 72% 51% / 0.4)' }}>
                    {nextMatch.player2?.name}
                  </div>
                </div>
              </div>
            </div>
          )}

      </div>
    );
  }

  // ================================================================
  // ⏱️ REST / INTERMISSION FRAME — static information layout
  // ================================================================
  if (currentFrame === 'rest') {
    const restProgress = config.restTime > 0 ? timeRemaining / config.restTime : 0;
    const timerColor = restProgress > 0.2 ? '#25d96b' : '#ffd866';
    const bluePlayer = state.chung.player;
    const redPlayer = state.hong.player;
    const judges = Math.max(0, Number(state.connectedJudgeCount ?? 0));
    const judgesAllowed = Math.max(1, Number(state.config?.judgeCount ?? 3));
    const roundsTotal = Math.max(1, Number(config.rounds || 3));
    const nextRound = Math.min(roundsTotal, currentRound + 1);
    const restLabel = state.isGoldenRound ? 'GOLDEN ROUND REST' : `ROUND ${currentRound} REST`;
    const restPhase = getRestPhase(timeRemaining, state.status, config.restTime);
    const restPhaseLabel = getRestPhaseLabel(restPhase, lang);
    const isFinalRound = currentRound >= roundsTotal;
    const nextRoundNumber = isFinalRound ? roundsTotal : currentRound + 1;
    const nextRoundLabel = isFinalRound ? 'FINAL DECISION / NEXT STAGE' : `ROUND ${nextRoundNumber}`;
    const restUrgency = timeRemaining <= 5 ? 'get-ready' : timeRemaining <= 10 ? 'prepare' : 'rest';
    const roundHistory = (state.roundWinners || []).slice().sort((a,b) => a.round - b.round);
    const blueRoundWins = roundHistory.filter(r => r.winner === 'chung').length;
    const redRoundWins = roundHistory.filter(r => r.winner === 'hong').length;
    const lastRoundResult = roundHistory.find(r => r.round === currentRound);
    const roundScore = (side: PlayerColor, roundNo: number) => {
      const r = roundHistory.find(x => x.round === roundNo);
      if (!r) return '—';
      return side === 'chung' ? r.chungScore : r.hongScore;
    };
    const matchHits = (side: PlayerColor) => state.events.filter(e => e.player === side && !['gamjeom','warning'].includes(e.type)).length;
    const matchGamjeom = (side: PlayerColor) => state.events.filter(e => e.player === side && e.type === 'gamjeom').length;
    const playerPhoto = (side: PlayerColor) => side === 'chung' ? (bluePlayer?.photoUrl || bluePlayer?.photo) : (redPlayer?.photoUrl || redPlayer?.photo);
    const playerName = (side: PlayerColor) => side === 'chung' ? (bluePlayer?.name || 'CHUNG') : (redPlayer?.name || 'HONG');
    const playerCountry = (side: PlayerColor) => side === 'chung' ? (bluePlayer?.nationality || '') : (redPlayer?.nationality || '');
    const playerClub = (side: PlayerColor) => side === 'chung' ? (bluePlayer?.club || '') : (redPlayer?.club || '');
    const playerNumber = (side: PlayerColor) => side === 'chung' ? bluePlayer?.playerNumber : redPlayer?.playerNumber;
    const playerFlag = (side: PlayerColor) => side === 'chung' ? bluePlayer?.nationality : redPlayer?.nationality;
    const renderPlayerFrame = (side: PlayerColor) => {
      const blue = side === 'chung';
      const accent = blue ? '#3ea5ff' : '#ff4555';
      const photo = playerPhoto(side);
      const country = playerCountry(side);
      return (
        <section className="relative flex min-h-0 flex-col overflow-hidden rounded-[24px] border-2 bg-black/50 p-4" style={{ borderColor: `${accent}aa`, background: `linear-gradient(145deg, ${accent}18, rgba(0,0,0,.72) 42%, rgba(255,216,102,.035))`, boxShadow: `0 0 42px ${accent}22, inset 0 0 34px ${accent}0d` }}>
          <div className="flex items-center justify-between border-b border-[#ffd866]/20 pb-3">
            <div className="text-[11px] font-black tracking-[.26em]" style={{ color: accent }}>{blue ? 'BLUE PLAYER' : 'RED PLAYER'}</div>
            <div className="text-[10px] font-black tracking-[.18em] text-[#ffd866]/65">{blue ? 'CHUNG' : 'HONG'}</div>
          </div>
          <div className="mt-3 px-2 py-2">
            <div className={`flex items-center gap-3 ${blue ? 'flex-row-reverse' : ''}`}>
              {photo ? <div className="relative shrink-0"><img src={photo} alt="" className="h-16 w-16 rounded-xl object-cover" style={{ boxShadow: `0 0 0 2px ${accent}66, 0 0 20px ${accent}25` }} />{playerFlag(side) && <div className={`absolute -bottom-1 ${blue ? '-right-1' : '-left-1'} overflow-hidden rounded border border-white/80 bg-black/70`}><FlagImage code={playerFlag(side) || ''} size={42} className="h-5 w-8 object-cover" /></div>}</div> : playerFlag(side) ? <FlagImage code={playerFlag(side) || ''} size={180} className="h-16 w-24 shrink-0 rounded-lg object-cover shadow-[0_0_24px_rgba(255,216,102,.18)]" /> : <div className="h-16 w-24 shrink-0 rounded-lg border border-white/10 bg-white/5" />}
              <div className={`min-w-0 flex-1 ${blue ? 'text-right' : 'text-left'}`}>
                <div className="truncate text-[clamp(24px,2.2vw,38px)] font-black" style={{ color: accent }}>{playerName(side)}</div>
                <div className={`mt-1 flex items-center gap-2 text-[11px] font-black tracking-[.12em] text-white/55 ${blue ? 'justify-end' : ''}`}>
                  {playerNumber != null && <span>#{playerNumber}</span>}
                  {playerClub(side) && <span className="truncate">{playerClub(side)}</span>}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3 flex min-h-0 flex-1 flex-col">
            <div className="mb-2 text-center text-[9px] font-black tracking-[.28em] text-white/35">ROUNDS</div>
            <div className="grid gap-1.5">
              {Array.from({length: roundsTotal}, (_,i) => i + 1).map(rn => (
                <div key={rn} className="grid grid-cols-[42px_1fr] items-center border-b border-white/8 px-3 py-1.5">
                  <span className="text-[11px] font-black tracking-[.2em] text-white/35">R{rn}</span>
                  <span className="text-right text-[21px] font-black tabular-nums" style={{ color: rn === currentRound ? accent : '#fff' }}>{roundScore(side, rn)}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-[1fr_auto] items-center rounded-xl border-2 border-white/12 bg-black/35 px-4 py-3">
              <span className="text-[9px] font-black tracking-[.2em] text-white/40">TOTAL POINTS</span>
              <span className="text-[34px] font-black tabular-nums" style={{ color: accent }}>{blue ? state.chung.totalScore : state.hong.totalScore}</span>
            </div>
          </div>
          <div className="mt-3 border-t border-white/10 pt-3 text-center">
            <div className="text-[9px] font-black tracking-[.28em] text-white/35">ROUNDS WON</div>
            <div className="text-[72px] font-black leading-none" style={{ color: accent, textShadow: `0 0 28px ${accent}55` }}>{blue ? blueRoundWins : redRoundWins}</div>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-1.5 rounded-xl border border-white/10 bg-black/55 p-1.5">
            <div className="rounded-lg bg-white/[.025] px-1 py-2 text-center"><div className="text-[7px] font-black text-white/35">GAM-JEOM</div><div className="text-xl font-black">{matchGamjeom(side)}</div></div>
            
            <div className="rounded-lg bg-white/[.025] px-1 py-2 text-center"><div className="text-[7px] font-black text-white/35">HITS</div><div className="text-xl font-black">{matchHits(side)}</div></div>
            <div className="rounded-lg bg-white/[.025] px-1 py-2 text-center"><div className="text-[7px] font-black text-[#ffd866]/70">IVR</div><div className="text-xl font-black">{blue ? (state.config.ivrQuotaChung ?? state.config.ivrQuota ?? 0) : (state.config.ivrQuotaHong ?? state.config.ivrQuota ?? 0)}</div></div>
          </div>
        </section>
      );
    };

    return (
      <div key="frame-rest" className={`fixed inset-0 flex flex-col overflow-hidden ${isMiniPreview ? 'public-scoreboard-mini' : ''}`} style={{ background: '#020306', color: '#fff' }}>
        <img src={splashBannerUrl} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[.12]" draggable={false} />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(255,216,102,.12),transparent_38%),linear-gradient(180deg,rgba(1,3,7,.78),rgba(1,3,7,.94))]" />
        {persistentTopNav}
        {settingsOverlay}{settingsStyleTag}{ivrRequestOverlay}{ivrOverlay}{koOverlay}{doctorCallOverlay}{kyeshiCallOverlay}{cinematicActive ? null : pendingSubOverlay}{substitutionAnimationOverlay || teamCallOverlay || callAnimationOverlay || (state.matchupAnimation ? matchupOverlay : null) || (cinematicActive ? null : nextOnMatchOverlay)}{cinematicActive ? null : readyBanner}{cinematicActive ? null : greetingBanner}{cinematicActive ? null : goldenBanner}{cinematicActive ? null : goldenPointOverlay}{cinematicActive ? null : standingsOverlay}
        {publicMatchMetaBar}

        <div className="relative z-10 shrink-0 px-5 py-3">
          <div className="mx-auto flex max-w-[1900px] items-center justify-between gap-5">
            <div className="text-[13px] font-black tracking-[.25em] text-white/45">WAB TAEKWONDO</div>
            <div className="text-[clamp(24px,2.2vw,40px)] font-black tracking-[.12em] text-white">{state.division || state.config?.division || 'CADETS - OTHERS'}</div>
            <div className="flex items-center gap-2 text-[10px] font-black tracking-[.18em] text-white/45"><span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(37,217,107,.8)]" /> LIVE BROADCAST</div>
          </div>
        </div>

        <div className="relative z-10 shrink-0 px-5 pb-3">
          <div className="mx-auto grid max-w-[1900px] grid-cols-[1fr_250px_1fr] gap-3">
            <div className="rounded-xl border border-[#ff4555]/45 bg-[#8b0815]/25 px-4 py-3"><div className="text-[9px] font-black tracking-[.22em] text-[#ff6674]">RED PLAYER</div><div className="mt-1 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-[22px] font-black text-white">{playerName('hong')}</div></div>
            <div className="rounded-xl border border-white/10 bg-black/45 px-4 py-3 text-center"><div className="text-[9px] font-black tracking-[.22em] text-white/35">MATCH</div><div className="mt-1 text-[28px] font-black text-white">{state.matchNumber ? String(state.matchNumber).padStart(3,'0') : '—'}</div><div className="mt-1 text-[9px] font-black tracking-[.15em] text-white/40">REST · R{currentRound}</div></div>
            <div className="rounded-xl border border-[#3ea5ff]/45 bg-[#0c2c6d]/25 px-4 py-3 text-right"><div className="text-[9px] font-black tracking-[.22em] text-[#55b7ff]">BLUE PLAYER</div><div className="mt-1 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-[22px] font-black text-white">{playerName('chung')}</div></div>
          </div>
        </div>

        <div className="relative z-10 mx-auto grid min-h-0 w-full max-w-[1900px] flex-1 grid-cols-[1fr_minmax(390px,1.08fr)_1fr] gap-4 px-5 pb-5">
          {renderPlayerFrame('hong')}
          <section className={`relative flex min-h-0 flex-col items-center overflow-hidden rounded-[26px] border border-white/12 bg-black/45 px-7 py-6 shadow-[0_0_60px_rgba(0,0,0,.5),inset_0_0_35px_rgba(255,216,102,.04)] rest-transition-${restUrgency}`}>
            <style>{`
              @keyframes restCorePulse { 0%,100% { transform:scale(1); filter:brightness(1) } 50% { transform:scale(1.035); filter:brightness(1.22) } }
              @keyframes restSweep { 0% { transform:translateX(-120%) } 100% { transform:translateX(120%) } }
              @keyframes restRing { 0% { transform:scale(.82); opacity:.65 } 100% { transform:scale(1.18); opacity:0 } }
              @keyframes readyBlink { 0%,100% { opacity:.55 } 50% { opacity:1 } }
            `}</style>
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
              <div className="absolute left-1/2 top-[36%] h-[310px] w-[310px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#ffd866]/15" style={{ animation: restUrgency === 'get-ready' ? 'restRing 1s ease-out infinite' : 'none' }} />
              <div className="absolute left-1/2 top-[36%] h-[230px] w-[230px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" style={{ animation: restUrgency === 'prepare' ? 'restRing 1.6s ease-out infinite' : 'none' }} />
              <div className="absolute left-0 top-[42%] h-px w-1/2 bg-gradient-to-r from-transparent via-[#ffd866]/45 to-transparent" style={{ animation: 'restSweep 3.4s linear infinite' }} />
              <div className="absolute right-0 top-[42%] h-px w-1/2 bg-gradient-to-r from-transparent via-[#ffd866]/45 to-transparent" style={{ animation: 'restSweep 3.4s linear infinite reverse' }} />
            </div>
            <div className="relative z-10 text-[12px] font-black tracking-[.38em] text-[#ffd866]">{restLabel}</div>
            <div className="relative z-10 mt-2 text-[clamp(84px,9vw,150px)] font-black leading-none tabular-nums" style={{ color: timerColor, textShadow: `0 0 20px ${timerColor},0 0 60px ${timerColor}66`, animation: restUrgency !== 'rest' ? 'restCorePulse 1s ease-in-out infinite' : 'none' }}>{formatTime(timeRemaining)}</div>
            <div className="relative z-10 mt-3 h-2.5 w-[88%] overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${Math.max(0,Math.min(1,restProgress))*100}%`, background: timerColor, boxShadow: `0 0 18px ${timerColor}` }} /></div>
            <div className="relative z-10 mt-5 text-[18px] font-black tracking-[.2em] text-white/75">{restPhaseLabel}</div>
            <div className="relative z-10 mt-2 text-[10px] font-black tracking-[.18em] text-white/35">NEXT {nextRoundLabel}</div>

            <div className="relative z-10 mt-4 grid w-full grid-cols-3 gap-2">
              {[currentRound, nextRoundNumber, Math.min(roundsTotal, nextRoundNumber + 1)].filter((n, i, a) => a.indexOf(n) === i).map((rn, index) => {
                const active = rn === nextRoundNumber && !isFinalRound;
                const done = rn <= currentRound;
                return (
                  <div key={`${rn}-${index}`} className="rounded-xl border px-2 py-2 text-center" style={{ borderColor: active ? 'rgba(255,216,102,.65)' : 'rgba(255,255,255,.10)', background: active ? 'rgba(255,216,102,.08)' : 'rgba(0,0,0,.25)', boxShadow: active ? '0 0 20px rgba(255,216,102,.12)' : 'none' }}>
                    <div className="text-[7px] font-black tracking-[.18em] text-white/35">{done && rn < nextRoundNumber ? 'COMPLETED' : active ? 'UP NEXT' : 'ROUND'}</div>
                    <div className={`mt-1 text-[18px] font-black ${active ? 'text-[#ffd866]' : done ? 'text-white/45' : 'text-white/75'}`}>R{rn}</div>
                  </div>
                );
              })}
            </div>

            {lastRoundResult && <div className="mt-5 w-full rounded-xl border border-emerald-400/25 bg-emerald-400/[.035] px-4 py-3 text-center">
              <div className="text-[8px] font-black tracking-[.22em] text-emerald-300/70">ROUND {currentRound} RESULT</div>
              <div className="mt-1 text-[16px] font-black">{lastRoundResult.winner === 'chung' ? 'BLUE / CHUNG' : lastRoundResult.winner === 'hong' ? 'RED / HONG' : 'DRAW'} · {lastRoundResult.chungScore} — {lastRoundResult.hongScore}</div>
              <div className="mt-1 text-[9px] font-black tracking-[.14em] text-white/45">{lastRoundResult.decisionLabel || lastRoundResult.decisionType || (lastRoundResult.method ? String(lastRoundResult.method).toUpperCase() : 'POINT GAP')}</div>
            </div>}

            <div className="mt-5 grid w-full grid-cols-2 gap-3">
              <div className="rounded-2xl border-2 border-[#ff4555]/65 bg-[#ff4555]/[.06] px-3 py-3 text-center"><div className="text-[9px] font-black tracking-[.18em] text-[#ff6674]">RED ROUNDS WON</div><div className="mt-1 text-[70px] font-black leading-none text-[#ff4555]">{redRoundWins}</div></div>
              <div className="rounded-2xl border-2 border-[#3ea5ff]/65 bg-[#3ea5ff]/[.06] px-3 py-3 text-center"><div className="text-[9px] font-black tracking-[.18em] text-[#55b7ff]">BLUE ROUNDS WON</div><div className="mt-1 text-[70px] font-black leading-none text-[#3ea5ff]">{blueRoundWins}</div></div>
            </div>

            <div className="relative z-10 mt-auto w-full border-t border-white/10 pt-4 text-center">
              <div className={`text-[11px] font-black tracking-[.22em] ${restUrgency === 'get-ready' ? 'text-[#ffd866]' : 'text-white/45'}`} style={{ animation: restUrgency === 'get-ready' ? 'readyBlink .8s ease-in-out infinite' : 'none' }}>
                {timeRemaining > 0 ? (isFinalRound ? 'PREPARE FOR OFFICIAL RESULT TRANSITION' : `NEXT ROUND R${nextRoundNumber} · REFEREE WILL START SHIJAK`) : (isFinalRound ? 'FINAL DECISION READY' : `ROUND ${nextRoundNumber} READY · WAITING FOR REFEREE`)}
              </div>
              <div className="mt-2 text-[8px] font-black tracking-[.16em] text-white/30">JUDGES PRESENT <span className={judges > 0 ? 'text-emerald-300' : 'text-white/45'}>{Math.min(judges, judgesAllowed)}/{judgesAllowed}</span> · {restPhase === 'REFEREE_CONFIRM' ? 'REFEREE CONFIRMATION REQUIRED' : 'REST / RECOVER'}</div>
            </div>
          </section>
          {renderPlayerFrame('chung')}
        </div>
      </div>
    );
  }

  // ================================================================
  // ⚖️ INDIVIDUAL ROUND TIE BROADCAST — read-only mirror of Main Referee
  // ================================================================
  const tieReview = state.roundTieReview;
  const tieDetails = state.roundWinners.find(r => r.round === state.currentRound)?.tiebreakDetails;
  // Persistent by request: this used to vanish after a short
  // roundResultRevealSeconds timer (2s default) — now it stays up for the
  // whole rest period instead of disappearing on its own; it naturally
  // clears once the referee confirms and the match leaves 'rest'.
  const showTieResult = tieReview?.phase === 'result' && state.status === 'rest';
  const tieBroadcastOverlay = (state.pendingRoundDecision || showTieResult) && config.competitionMode !== 'par_equipe' && config.roundTieBroadcastAnimationEnabled !== false ? (
    <div dir="ltr" className="fixed inset-0 z-[220] flex items-center justify-center bg-black/92 backdrop-blur-sm pointer-events-none">
      <div className="w-[min(94vw,1200px)] rounded-3xl border-2 border-[hsl(var(--gold))]/60 bg-[#070a10] shadow-[0_0_80px_rgba(245,200,66,.16)] overflow-hidden">
        <div className="px-8 py-5 border-b border-white/10 text-center"><div className="text-[hsl(var(--gold))] text-xs font-black tracking-[.4em]">ROUND {state.currentRound} — TIE</div><div className="mt-2 text-4xl font-display font-black"><span className="text-[hsl(var(--chung))]">BLUE {state.chung.scores[state.currentRound-1]?.total ?? 0}</span><span className="text-white/30 mx-6">—</span><span className="text-[hsl(var(--hong))]">{state.hong.scores[state.currentRound-1]?.total ?? 0} RED</span></div></div>
        <div className="p-8 min-h-[420px] relative">
          {(!tieReview || tieReview.phase === 'ai') && <div className="text-center animate-fade-in"><div className="text-[10px] tracking-[.35em] text-white/50">AI TIE ANALYSIS</div><div className={`mt-3 text-5xl font-display font-black ${tieDetails?.aiWinner==='chung'?'text-[hsl(var(--chung))]':tieDetails?.aiWinner==='hong'?'text-[hsl(var(--hong))]':'text-white'}`}>{tieDetails?.aiWinner==='chung'?'BLUE':tieDetails?.aiWinner==='hong'?'RED':'NO CLEAR ADVANTAGE'}</div><div className="mt-3 text-lg text-white/80">CONFIDENCE {tieDetails?.aiConfidence ?? state.aiConfidence ?? 0}%</div><div className="mt-2 text-sm font-black"><span className="text-[hsl(var(--chung))]">BLUE {tieDetails?.aiScore?.chung ?? '—'}</span><span className="text-white/30 mx-2">—</span><span className="text-[hsl(var(--hong))]">{tieDetails?.aiScore?.hong ?? '—'} RED</span></div><div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-left"><div className="rounded-xl border border-white/10 p-3"><span className="text-[9px] text-white/50">HEAD HITS</span><div className="font-black mt-1"><span className="text-[hsl(var(--chung))]">{tieDetails?.chungHeadKicks ?? 0}</span> — <span className="text-[hsl(var(--hong))]">{tieDetails?.hongHeadKicks ?? 0}</span></div></div><div className="rounded-xl border border-white/10 p-3"><span className="text-[9px] text-white/50">BODY HITS</span><div className="font-black mt-1"><span className="text-[hsl(var(--chung))]">{tieDetails?.chungTrunkKicks ?? 0}</span> — <span className="text-[hsl(var(--hong))]">{tieDetails?.hongTrunkKicks ?? 0}</span></div></div><div className="rounded-xl border border-white/10 p-3"><span className="text-[9px] text-white/50">ATTACKS</span><div className="font-black mt-1"><span className="text-[hsl(var(--chung))]">{tieDetails?.chungValidHits ?? 0}</span> — <span className="text-[hsl(var(--hong))]">{tieDetails?.hongValidHits ?? 0}</span></div></div><div className="rounded-xl border border-white/10 p-3"><span className="text-[9px] text-white/50">PENALTIES</span><div className="font-black mt-1"><span className="text-[hsl(var(--chung))]">{tieDetails?.chungPenalties ?? 0}</span> — <span className="text-[hsl(var(--hong))]">{tieDetails?.hongPenalties ?? 0}</span></div></div><div className="rounded-xl border border-white/10 p-3"><span className="text-[9px] text-white/50">PSS HITS</span><div className="font-black mt-1"><span className="text-[hsl(var(--chung))]">{tieDetails?.chungPssHits ?? 0}</span> — <span className="text-[hsl(var(--hong))]">{tieDetails?.hongPssHits ?? 0}</span></div></div></div><div className="mt-6 text-sm text-white/60 max-w-3xl mx-auto">{tieDetails?.reason || 'REFEREE DECISION REQUIRED'}</div></div>}
          {tieReview?.phase === 'summons' && <div data-wab-layer-root="woose-girok" data-wab-layer-id="woose-girok-root" className="h-full flex flex-col items-center justify-center text-center relative overflow-hidden girok-public-scene"><img data-wab-layer-id="woose-girok-arms" src={wooseGirokArmsUrl} alt="" className="girok-public-arms"/><div data-wab-layer-id="woose-girok-center" className="relative z-10 girok-public-center"><div data-wab-layer-id="woose-girok-kicker" className="text-[hsl(var(--gold))] text-sm tracking-[.5em]">우세기록</div><div data-wab-layer-id="woose-girok-title" className="girok-gold-title font-display text-5xl mt-3">WOO-SE-GIROK</div><div data-wab-layer-id="woose-girok-subtitle" className="mt-8 text-white/60 tracking-[.3em]">THREE JUDGES SUMMONED</div></div></div>}
          {tieReview?.phase === 'countdown' && <div data-wab-layer-root="woose-girok" data-wab-layer-id="woose-girok-root" className="h-full flex flex-col items-center justify-center text-center relative overflow-hidden girok-public-scene"><img data-wab-layer-id="woose-girok-arms" src={wooseGirokArmsUrl} alt="" className="girok-public-arms countdown-arms"/><div data-wab-layer-id="woose-girok-countdown" className="relative z-10 girok-count-between"><div data-wab-layer-id="woose-girok-count" className="girok-count-lit text-[hsl(var(--gold))] text-8xl font-display font-black">{tieReview.countdownStep}</div><div data-wab-layer-id="woose-girok-count-label" className="text-2xl font-black text-white mt-2">{tieReview.countdownStep===1?'HANA — 하나':tieReview.countdownStep===2?'DUL — 둘':'SET — 셋'}</div></div></div>}
          {tieReview?.phase === 'voting' && <div data-wab-layer-root="woose-girok" data-wab-layer-id="woose-girok-voting-root" className="text-center relative"><div className="text-xs tracking-[.35em] text-[hsl(var(--gold))] font-black">THREE REFEREES</div><div className="grid grid-cols-3 gap-5 mt-8">{(['left','center','right'] as const).map((id,i)=>{const vote=tieReview.votes[id]; const name=tieReview.judgeNames?.[id] || (i===0?'Judge 1':i===1?'Center Referee':'Judge 3'); const role=i===1?'CENTER / MAT REFEREE':'SIDE JUDGE'; const photo=tieReview.judgePhotos?.[id]; const armSrc = vote==='chung'?judgeDecisionBlueArmUrl:vote==='hong'?judgeDecisionRedArmUrl:null; return <div key={id} className={`girok-public-judge girok-frame-strong ${i===1?'is-center':''} ${vote?(vote==='chung'?'is-voted-chung':'is-voted-hong'):''}`}><div data-wab-layer-id={`woose-girok-voting-photo-${id}`} className="girok-public-photo-wrap">{photo ? <img src={photo} alt="" className="girok-public-photo"/> : <div className="girok-public-photo-placeholder">{name.slice(0,1).toUpperCase()}</div>}</div>{armSrc ? <img data-wab-layer-id={`woose-girok-voting-arm-${id}`} src={armSrc} alt="" className={`girok-judge-arms-voted ${vote==='chung'?'is-chung-arm':'is-hong-arm'}`}/> : <img data-wab-layer-id={`woose-girok-voting-arm-${id}`} src={wooseGirokArmsUrl} alt="" className="girok-judge-arms"/>}<div className="relative z-10"><div className="text-sm font-black">{name}</div><div className="text-[9px] tracking-[.18em] text-white/45 mt-1">{role}</div><div className={`mt-5 text-2xl font-display font-black ${vote==='chung'?'text-[hsl(var(--chung))]':vote==='hong'?'text-[hsl(var(--hong))]':'text-white/30'}`}>{vote==='chung'?'BLUE':vote==='hong'?'RED':'WAITING'}</div></div></div>})}</div><div className="mt-8 text-3xl font-display font-black">BLUE {Object.values(tieReview.votes).filter(v=>v==='chung').length} — {Object.values(tieReview.votes).filter(v=>v==='hong').length} RED</div></div>}
          {tieReview?.phase === 'result' && (() => {
            const blue = Object.values(tieReview.votes).filter(v => v === 'chung').length;
            const red = Object.values(tieReview.votes).filter(v => v === 'hong').length;
            const winner = blue >= 2 ? 'chung' : 'hong';
            const unanimous = blue === 3 || red === 3;
            const winningArm = winner === 'chung' ? judgeDecisionBlueArmUrl : judgeDecisionRedArmUrl;
            const winnerName = winner === 'chung'
              ? broadcastName(state.chung.player?.name, nameFormat, 'BLUE PLAYER')
              : broadcastName(state.hong.player?.name, nameFormat, 'RED PLAYER');
            return (
              <div data-wab-layer-root="woose-girok" data-wab-layer-id="woose-girok-result-root" className="h-full flex flex-col items-center justify-center text-center relative overflow-hidden girok-result-scene">
                <div className="relative z-10 w-full max-w-[1180px] mx-auto px-4">
                  {/* Three judge decisions come first on the audience screen. */}
                  <div className="text-[10px] tracking-[.3em] text-white/45 font-black mb-4">THREE REFEREES · FINAL VOTE</div>
                  <div className="grid grid-cols-3 gap-4 max-w-[920px] mx-auto">
                    {(['left','center','right'] as const).map((id,i) => {
                      const vote = tieReview.votes[id];
                      const name = tieReview.judgeNames?.[id] || (i===0?'Judge 1':i===1?'Center Referee':'Judge 3');
                      const role = i===1 ? 'CENTER / MAT REFEREE' : 'SIDE JUDGE';
                      const photo = tieReview.judgePhotos?.[id];
                      const armSrc = vote === 'chung' ? judgeDecisionBlueArmUrl : judgeDecisionRedArmUrl;
                      return (
                        <div key={id} className={`girok-public-judge girok-frame-strong is-small ${i===1?'is-center':''} ${vote==='chung'?'is-voted-chung':'is-voted-hong'}`}>
                          <div data-wab-layer-id={`woose-girok-result-photo-${id}`} className="girok-public-photo-wrap is-small">
                            {photo ? <img src={photo} alt="" className="girok-public-photo"/> : <div className="girok-public-photo-placeholder">{name.slice(0,1).toUpperCase()}</div>}
                          </div>
                          <img data-wab-layer-id={`woose-girok-result-arm-${id}`} src={armSrc} alt="" className={`girok-judge-arms-voted is-small ${vote==='chung'?'is-chung-arm':'is-hong-arm'}`}/>
                          <div className="relative z-20">
                            <div className="text-xs font-black">{name}</div>
                            <div className="text-[8px] tracking-[.16em] text-white/45 mt-1">{role}</div>
                            <div className={`relative z-30 mt-3 text-2xl font-display font-black ${vote==='chung'?'text-[hsl(var(--chung))]':'text-[hsl(var(--hong))]'}`}>{vote==='chung'?'BLUE':'RED'}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Large final decision frame BELOW the three judge cards. The
                      winning blue/red arm is enlarged behind the frame so the
                      complete artwork reaches both sides without being cropped. */}
                  <div className={`girok-decision-frame girok-final-decision-panel mx-auto mt-5 relative overflow-hidden ${winner==='chung'?'is-chung':'is-hong'}`}>
                    <img data-wab-layer-id="woose-girok-final-decision-arm" src={winningArm} alt="" className="girok-decision-arm girok-final-decision-arm" />
                    <div className="relative z-10 px-8 py-6 md:px-12 md:py-7">
                      <div data-wab-layer-id="woose-girok-winner-kicker" className="font-display text-3xl md:text-5xl font-black uppercase tracking-[.28em] text-[#ffd866]" style={{ textShadow: '0 0 28px rgba(255,216,102,.65)' }}>WINNER</div>
                      <div data-wab-layer-id="woose-girok-majority-title" className="girok-gold-title mt-1 font-display text-2xl md:text-4xl">{unanimous ? 'UNANIMOUS DECISION' : 'MAJORITY DECISION'}</div>
                      <div data-wab-layer-id="woose-girok-winner-label" className={`mt-2 font-display font-black ${winner==='chung'?'text-[hsl(var(--chung))]':'text-[hsl(var(--hong))]'}`} style={{ fontSize: 'clamp(48px,5.8vw,94px)', lineHeight: 1, textShadow: `0 0 42px ${winner==='chung'?'hsl(var(--chung))':'hsl(var(--hong))'}77` }}>
                        {winner==='chung' ? 'BLUE WINS' : 'RED WINS'}
                      </div>
                      <div data-wab-layer-id="woose-girok-winner-name" className="mt-2 font-display font-black text-white truncate max-w-[92%] mx-auto" style={{ fontSize: 'clamp(22px,2.7vw,44px)', lineHeight: 1.05 }}>
                        {winnerName}
                      </div>
                      {/* Winner identity is shown only here: real photo when available,
                          with the national flag, country and club. */}
                      <div className="relative z-20 mt-4 flex items-center justify-center gap-4">
                        {(winner === 'chung' ? state.chung.player?.photoUrl || state.chung.player?.photo : state.hong.player?.photoUrl || state.hong.player?.photo) && (
                          <img
                            src={winner === 'chung' ? state.chung.player?.photoUrl || state.chung.player?.photo : state.hong.player?.photoUrl || state.hong.player?.photo}
                            alt=""
                            className="h-20 w-20 rounded-xl object-cover ring-2 ring-white/35 shadow-[0_0_28px_rgba(255,255,255,.16)]"
                          />
                        )}
                        <div className="text-left">
                          <div className="flex items-center gap-3">
                            <FlagImage code={winner === 'chung' ? state.chung.player?.nationality || '' : state.hong.player?.nationality || ''} size={120} className="h-9 w-14 rounded-sm object-cover ring-1 ring-white/45" />
                            <div className="font-display text-lg md:text-2xl font-black text-white">
                              {winner === 'chung' ? state.chung.player?.nationality || '—' : state.hong.player?.nationality || '—'}
                            </div>
                          </div>
                          <div className="mt-1 font-display text-sm md:text-lg font-black uppercase text-white/80">
                            {winner === 'chung' ? state.chung.player?.club || '—' : state.hong.player?.club || '—'}
                          </div>
                        </div>
                      </div>
                      {/* Decision score: RED is always on the left; BLUE is always on the right. */}
                      <div data-wab-layer-id="woose-girok-vote-score" className="mt-4 inline-flex items-center justify-center gap-3 rounded-xl border border-white/15 bg-black/35 px-6 py-2.5 font-display font-black" style={{ fontSize: 'clamp(26px,3vw,48px)', lineHeight: 1 }}>
                        <span className="text-[hsl(var(--hong))]">RED {red}</span>
                        <span className="text-white/35">—</span>
                        <span className="text-[hsl(var(--chung))]">{blue} BLUE</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div key="frame-fight" dir="ltr" className={`fixed inset-0 flex flex-col overflow-hidden ${ptgAnimation ? 'ptg-shake' : ''} ${isMiniPreview ? 'public-scoreboard-mini' : ''} ${isParEquipeMatch ? 'public-scoreboard-par-equipe-live' : ''}`}
      style={{ background: isStreamOverlay ? 'transparent' : 'hsl(224 35% 4%)', animation: 'frameEnter 0.6s ease-out' }}
      onMouseEnter={() => setShowNav(true)} onMouseLeave={() => setShowNav(false)}>
      {state.config.trainingMode && !isStreamOverlay && (
        <div className="w-full py-1 text-center text-[11px] font-black tracking-[0.3em] bg-[hsl(38_92%_50%)] text-black z-[70] relative shrink-0">
          🎓 TRAINING MODE — NOT AN OFFICIAL MATCH
        </div>
      )}
      {!isStreamOverlay && persistentTopNav}
      {tieBroadcastOverlay}
      {settingsOverlay}{settingsStyleTag}{ivrRequestOverlay}{ivrOverlay}{koOverlay}{doctorCallOverlay}{kyeshiCallOverlay}{cinematicActive ? null : pendingSubOverlay}{substitutionAnimationOverlay || teamCallOverlay || callAnimationOverlay || (state.matchupAnimation ? matchupOverlay : null) || (cinematicActive ? null : nextOnMatchOverlay)}{cinematicActive ? null : readyBanner}{cinematicActive ? null : greetingBanner}{cinematicActive ? null : goldenBanner}{cinematicActive ? null : goldenPointOverlay}{cinematicActive ? null : standingsOverlay}
      {publicMatchMetaBar}
      <style>{`
        @keyframes ptgSoftShake {
          0%,100% { transform: translate(0,0); }
          20% { transform: translate(-3px,2px); }
          40% { transform: translate(3px,-2px); }
          60% { transform: translate(-2px,-2px); }
          80% { transform: translate(2px,2px); }
        }
        .ptg-shake { animation: ptgSoftShake 180ms linear infinite; }
      `}</style>


      {/* Judge approval toast (from main referee) */}
      {approvalToast && (
        <div className="fixed top-[10%] left-1/2 -translate-x-1/2 z-[300] animate-fade-in pointer-events-none">
          <div className={`px-8 py-4 rounded-2xl shadow-2xl border-2 backdrop-blur-md ${
            approvalToast.status === 'approved'
              ? 'bg-emerald-500/25 border-emerald-400 text-emerald-100'
              : 'bg-red-500/25 border-red-400 text-red-100'
          }`}>
            <div className="text-center font-display font-black tracking-widest text-2xl">
              {approvalToast.status === 'approved' ? '✓ POINT APPROVED' : '✗ POINT REJECTED'}
            </div>
            <div className="text-center text-sm opacity-90 mt-1">
              {approvalToast.judge} → <span className="uppercase font-bold">{approvalToast.player}</span> · {approvalToast.type.replace('_',' ')}
              <span className="opacity-70"> · by {approvalToast.referee}</span>
            </div>
          </div>
        </div>
      )}


      {/* BACKGROUND MOTION LAYER */}
      <div className="absolute inset-0 z-0" style={{
        background: displayChung > displayHong
          ? 'radial-gradient(ellipse at 30% 50%, hsl(217 91% 15% / 0.3), transparent 60%)'
          : displayHong > displayChung
          ? 'radial-gradient(ellipse at 70% 50%, hsl(0 72% 15% / 0.3), transparent 60%)'
          : 'none',
        transition: 'all 1s ease',
      }} />

      {/* Special status overlays. IVR is a dedicated camera/replay request cinematic;
          the old plain VIDEO REPLAY title is intentionally not used anymore. */}
      {isSpecialStatus && (
        <div className="absolute inset-0 z-30 flex items-center justify-center overflow-hidden"
          style={{
            background: status === 'doctor' ? 'hsl(0 72% 8% / 0.96)' :
              status === 'kyeshi' ? 'hsl(0 0% 0% / 0.96)' : 'rgba(2,7,17,.96)',
          }}>
          {status === 'ivr' && (() => {
            const requester = state.ivrRequestedBy;
            const blue = requester === 'chung';
            const accent = blue ? sb.chungColor : sb.hongColor;
            const player = requester ? (blue ? state.chung.player : state.hong.player) : null;
            const elapsed = ivrAnim ? Date.now() - ivrAnim.ts : 0;
            return (
              <div className="absolute inset-0 flex items-center justify-center" style={{ '--ivr-accent': accent } as React.CSSProperties}>
                <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 45%, ${accent}2b 0%, transparent 34%, rgba(0,0,0,.92) 78%)` }} />
                <div className="absolute w-[74vmin] h-[74vmin] rounded-full border" style={{ borderColor: `${accent}45`, boxShadow: `0 0 80px ${accent}18, inset 0 0 80px ${accent}10`, animation: 'ivrRequestRing 1.7s ease-out infinite' }} />
                <div className="absolute w-[48vmin] h-[48vmin] rounded-full border-2" style={{ borderColor: `${accent}65`, boxShadow: `0 0 55px ${accent}20`, animation: 'ivrRequestRing 1.25s .18s ease-out infinite' }} />
                <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 4px, rgba(255,255,255,.035) 5px)', animation: 'ivrRequestScan 2.2s linear infinite', opacity: .55 }} />
                <div className="absolute top-0 bottom-0 w-[18vw]" style={{ background: `linear-gradient(90deg, transparent, ${accent}22, transparent)`, transform: 'skewX(-16deg)', animation: 'ivrRequestSweep 2.5s ease-in-out infinite' }} />

                <div className="relative z-10 flex flex-col items-center justify-center text-center px-8" style={{ animation: 'ivrRequestEnter .65s cubic-bezier(.16,1,.3,1) both' }}>
                  <div className="font-display font-black tracking-[.38em] text-white/65 mb-3" style={{ fontSize: 'clamp(9px, 1vw, 15px)' }}>WAB-TKD · OFFICIAL REVIEW</div>
                  <div className="relative" style={{ animation: 'ivrCameraFloat 1.35s ease-in-out infinite' }}>
                    <div className="absolute inset-[12%] rounded-full" style={{ border: `2px solid ${accent}55`, boxShadow: `0 0 45px ${accent}55`, animation: 'ivrCameraPulse 1.15s ease-out infinite' }} />
                    <div className="absolute inset-[2%] rounded-full border border-dashed" style={{ borderColor: `${accent}50`, animation: 'ivrCameraOrbit 4s linear infinite' }} />
                    <img data-wab-layer-id="video-replay-request-camera" src={blue ? videoReplayAvailableBlueUrl : videoReplayUnavailableRedUrl} alt="Video replay camera" className="relative z-10 object-contain" style={{ width: 'clamp(150px, 18vw, 290px)', height: 'clamp(115px, 14vw, 220px)', filter: `drop-shadow(0 0 16px ${accent}) drop-shadow(0 0 55px ${accent}99)` }} />
                  </div>
                  <div className="font-display font-black tracking-[.22em] text-white mt-1" style={{ fontSize: 'clamp(30px, 5vw, 74px)', textShadow: `0 0 25px ${accent}88` }}>VIDEO REPLAY</div>
                  <div className="mt-2 rounded-full px-5 py-2 font-display font-black tracking-[.18em]" style={{ color: '#fff', background: `${accent}20`, border: `2px solid ${accent}88`, boxShadow: `0 0 25px ${accent}20`, fontSize: 'clamp(10px, 1vw, 16px)' }}>
                    {blue ? 'BLUE' : 'RED'} · REVIEW REQUEST
                  </div>
                  {player && <div className="font-display font-bold text-white/70 mt-3" style={{ fontSize: 'clamp(12px, 1.2vw, 19px)' }}>{broadcastName(player.name, nameFormat)}</div>}
                  <div className="font-display font-black tracking-[.3em] mt-4" style={{ color: accent, fontSize: 'clamp(8px, .8vw, 12px)', animation: 'ivrRequestBlink 1s ease-in-out infinite' }}>WAITING FOR REFEREE DECISION</div>
                  {elapsed > 0 && <div className="sr-only">{elapsed}</div>}
                </div>
              </div>
            );
          })()}

          {status === 'doctor' && <div className="text-center"><div className="font-display text-7xl font-black mb-4" style={{ color: 'hsl(0 72% 51%)', animation: 'pulseScore 2s ease-in-out infinite', letterSpacing: '0.1em' }}>DOCTOR</div></div>}
          {status === 'kyeshi' && <div className="text-center"><div className="font-display text-7xl font-black mb-4" style={{ color: 'white', animation: 'pulseScore 2s ease-in-out infinite', letterSpacing: '0.1em' }}>KYESHI</div><div className="font-display font-black mt-4" style={{ fontSize: 'clamp(80px, 12vw, 180px)', color: 'white', textShadow: '0 0 30px rgba(255,255,255,.5)' }}>{formatTime(timeRemaining)}</div></div>}
        </div>
      )}

      {/* PTG is now rendered inside the timer area (see center column). */}

      {/* Test Mode badge — small persistent corner tag, doesn't block the view */}
      {state.testMode && (
        <div className="absolute top-3 start-3 z-40 px-3 py-1.5 rounded-lg font-display font-black text-sm tracking-widest animate-pulse"
          style={{ background: 'hsl(45 93% 15%)', color: 'hsl(45 93% 58%)', border: '2px solid hsl(45 93% 58%)' }}>
          TEST MODE
        </div>
      )}

      {/* Awaiting round start */}
      {state.awaitingRoundStart && !ptgAnimation && (
        <div className="absolute inset-0 z-35 flex items-center justify-center" style={{ background: 'hsl(224 35% 3% / 0.9)' }}>
          <div className="text-center">
            <div className="font-display text-4xl mb-3 animate-pulse" style={{ color: 'hsl(45 93% 58%)' }} >{t('broadcastCallPlayers')}</div>
            <div className="font-display text-2xl text-white/40">ROUND {currentRound + 1}</div>
          </div>
        </div>
      )}

      {/* ZONE 1: clean player identity strip — no duplicated lower flag/country row. */}
      <div className="flex shrink-0 items-stretch relative z-10" style={{ background: 'linear-gradient(180deg,rgba(5,7,14,.98),rgba(5,7,14,.90))', borderBottom: '1px solid rgba(255,216,102,.18)' }}>
        {/* RED — left. Flag is immediately beside the name; photo gets a small flag badge. */}
        <div className="flex-1 min-w-0 px-6 py-2.5" style={{ borderBottom: '4px solid hsl(0 72% 51%)' }}>
          <div className="flex items-center gap-4 min-w-0">
            {dc.showPhoto && hong.player.photoUrl ? (
              <div className="relative shrink-0">
                <img src={hong.player.photoUrl} alt="" className="h-[58px] w-[58px] rounded-lg object-cover" style={{ boxShadow: '0 0 0 2px rgba(255,69,85,.65), 0 0 22px rgba(255,69,85,.22)' }} />
                {dc.showFlag && hong.player.nationality && <div className="absolute -bottom-1 -left-1 overflow-hidden rounded border border-white/85 bg-black/80"><FlagImage code={hong.player.nationality} size={40} className="h-5 w-8 object-cover" /></div>}
              </div>
            ) : dc.showFlag && hong.player.nationality ? (
              <div className="shrink-0 rounded-lg p-1" style={{ border: '2px solid rgba(255,69,85,.55)', background: 'rgba(255,69,85,.08)', boxShadow: '0 0 22px rgba(255,69,85,.14)' }}><FlagImage code={hong.player.nationality} size={180} className="h-[50px] w-[80px] rounded-md object-cover" /></div>
            ) : null}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 min-w-0">
                <div className="sb-player-name min-w-0 truncate font-display font-black leading-none text-white" style={{ fontSize: 'clamp(24px,2.6vw,48px)', textShadow: '0 2px 8px rgba(0,0,0,.65)' }}>{broadcastName(hong.player.name, nameFormat)}</div>
              </div>
              <div className="mt-1 flex items-center gap-3 text-[10px] font-black uppercase tracking-[.13em] text-white/42">
                {hong.player.club && <span className="truncate text-[#ffd866]/65">{hong.player.club}</span>}
                {hong.player.playerNumber != null && <span>#{hong.player.playerNumber}</span>}
                {hong.player.seedNumber != null && <span>SEED {hong.player.seedNumber}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* CENTER — match identity */}
        <div className="flex w-[220px] shrink-0 flex-col items-center justify-center border-x border-[#ffd866]/15 px-3 text-center">
          <div className="font-display text-[8px] font-black tracking-[.24em] text-[#ffd866]/60">MATCH</div>
          <div className="font-display text-[25px] font-black leading-none text-[#ffd866]">#{state.matchNumber || '---'}</div>
          <div className="mt-1 font-display text-[8px] font-black tracking-[.18em] text-white/35">ROUND {currentRound} / {config.rounds}</div>
        </div>

        {/* BLUE — right. Mirror of RED. */}
        <div className="flex flex-1 min-w-0 flex-row-reverse px-6 py-2.5" style={{ borderBottom: '4px solid hsl(217 91% 55%)' }}>
          <div className="flex w-full items-center gap-4 min-w-0">
            {dc.showPhoto && chung.player.photoUrl ? (
              <div className="relative shrink-0">
                <img src={chung.player.photoUrl} alt="" className="h-[58px] w-[58px] rounded-lg object-cover" style={{ boxShadow: '0 0 0 2px rgba(62,165,255,.65), 0 0 22px rgba(62,165,255,.22)' }} />
                {dc.showFlag && chung.player.nationality && <div className="absolute -bottom-1 -right-1 overflow-hidden rounded border border-white/85 bg-black/80"><FlagImage code={chung.player.nationality} size={40} className="h-5 w-8 object-cover" /></div>}
              </div>
            ) : dc.showFlag && chung.player.nationality ? (
              <div className="shrink-0 rounded-lg p-1" style={{ border: '2px solid rgba(62,165,255,.55)', background: 'rgba(62,165,255,.08)', boxShadow: '0 0 22px rgba(62,165,255,.14)' }}><FlagImage code={chung.player.nationality} size={180} className="h-[50px] w-[80px] rounded-md object-cover" /></div>
            ) : null}
            <div className="min-w-0 flex-1 text-right">
              <div className="flex items-center justify-end gap-2 min-w-0">
                <div className="sb-player-name min-w-0 truncate font-display font-black leading-none text-white" style={{ fontSize: 'clamp(24px,2.6vw,48px)', textShadow: '0 2px 8px rgba(0,0,0,.65)' }}>{broadcastName(chung.player.name, nameFormat)}</div>
              </div>
              <div className="mt-1 flex items-center justify-end gap-3 text-[10px] font-black uppercase tracking-[.13em] text-white/42">
                {chung.player.playerNumber != null && <span>#{chung.player.playerNumber}</span>}
                {chung.player.seedNumber != null && <span>SEED {chung.player.seedNumber}</span>}
                {chung.player.club && <span className="truncate text-[#ffd866]/65">{chung.player.club}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ZONE 2+3: MAIN SCORING AREA (fills remaining space) */}
      <div className="flex-1 flex items-stretch relative z-10">

        {/* CHUNG Score Panel — ~39% width, matching the KPNP FOB scoreboard proportions */}
        <div className="sb-side-chung flex flex-col items-center justify-center relative" style={{ flex: '0 0 39%', background: 'hsl(217 91% 50%)', order: 3 }}>
          {/* Team/club emblem (Par Équipe only) — shown above the score, never
              rendered at all when no logo is set (avoids a broken-image icon
              filling this large space; the score number below is enough). */}
          {config.competitionMode === 'par_equipe' && (state.teamLogos?.chung || state.clubLogos?.chung) && (
            <div className="rounded-2xl p-2 mb-3 flex items-center justify-center" style={{
              background: 'rgba(255,255,255,0.92)',
              boxShadow: '0 0 30px rgba(0,0,0,0.35)',
              width: 'clamp(72px, 8vw, 140px)', height: 'clamp(72px, 8vw, 140px)',
            }}>
              <img src={state.teamLogos?.chung || state.clubLogos?.chung} alt=""
                className="max-w-full max-h-full object-contain rounded-xl"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
            </div>
          )}
          {/* Single-frame score — decluttered */}
          <div className="rounded-2xl px-6 md:px-10 py-2 md:py-4 flex items-center justify-center" style={{
            border: '2px solid rgba(255,255,255,0.5)',
            background: 'rgba(0,0,0,0.22)',
            boxShadow: '0 0 30px rgba(0,0,0,0.35), inset 0 0 20px rgba(0,0,0,0.35)',
          }}>
            <div className="sb-score-chung font-display font-black text-white leading-none select-none" style={{
              fontSize: 'clamp(90px, 18vw, 240px)',
              textShadow: chungFlash ? '0 0 60px hsl(45 93% 58%), 0 0 100px hsl(45 93% 58% / 0.8), 0 4px 40px rgba(0,0,0,0.5)' : '0 4px 40px rgba(0,0,0,0.5)',
              transform: chungFlash ? 'scale(1.12)' : 'scale(1)',
              transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), text-shadow 0.25s ease',
              animation: chungFlash ? 'pulseScore 0.3s ease-in-out' : 'none',
            }}>
              {displayChung}
            </div>
          </div>

          {/* BLUE VIDEO REPLAY — one visible card per configured quota. */}
          <VideoReplayQuota quota={chung.ivrQuota} totalQuota={state.config?.ivrQuota ?? chung.ivrQuota} side="chung" />


          {/* Hit breakdown chips — top-left (real equipment photos) */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {(['punch', 'body', 'head'] as const).map((k) => (
              <HitStatChip key={k} kind={k} side="chung" count={chungHits[k]} pulseKey={hitPulse.chung[k] || 0} size={displaySettings.hitIconSize} />
            ))}
          </div>

          {/* Per-round scores — framed boxes at very bottom */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {chung.scores.slice(0, config.rounds).map((s, i) => {
              const active = i === currentRound - 1;
              const bw = displaySettings.roundBoxBorder;
              return (
                <div key={i} className={`${active ? 'sb-round-active' : ''} rounded-lg flex flex-col items-center justify-center transition-all`} style={{
                  minWidth: 'clamp(44px, 3.5vw, 68px)',
                  padding: 'clamp(3px, 0.3vw, 6px) clamp(6px, 0.5vw, 10px)',
                  background: active ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)',
                  border: `${active ? bw + 1 : bw}px solid ${active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)'}`,
                  boxShadow: active ? '0 0 22px rgba(255,255,255,0.35), inset 0 0 14px rgba(0,0,0,0.45)' : 'inset 0 0 8px rgba(0,0,0,0.3)',
                }}>
                  <div className="font-display font-bold text-white/80 tracking-widest" style={{ fontSize: 'clamp(9px, 0.7vw, 12px)' }}>R{i + 1}</div>
                  <div className="font-display font-black text-white leading-none tabular-nums" style={{ fontSize: 'clamp(16px, 1.45vw, 26px)' }}>{s.total}</div>
                </div>
              );
            })}
          </div>

          {/* Gamjeom dots — above round scores */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-lg" style={{ bottom: 'clamp(70px, 6vw, 110px)', background: 'rgba(0,0,0,0.4)' }}>
            <span className="text-white/70 font-display font-bold tracking-widest" style={{ fontSize: 'clamp(10px, 0.75vw, 13px)' }}>GAM</span>
            {Array.from({ length: Math.min(config.gamjeomLimit, 10) }, (_, i) => (
              <div key={i} className="rounded-full border-2" style={{
                width: 'clamp(10px, 0.8vw, 16px)', height: 'clamp(10px, 0.8vw, 16px)',
                background: i < getGamjeomForRound('chung') ? 'hsl(38 92% 50%)' : 'rgba(255,255,255,0.08)',
                borderColor: i < getGamjeomForRound('chung') ? 'hsl(38 92% 65%)' : 'rgba(255,255,255,0.2)',
                boxShadow: i < getGamjeomForRound('chung') ? '0 0 10px hsl(38 92% 50%)' : 'none',
              }} />
            ))}
          </div>

          {/* Action flash on score — slides from left, positioned above gamjeom+round boxes */}
          {recentAction?.player === 'chung' && (
            <div className="absolute left-6" style={{ bottom: 'clamp(140px, 11vw, 180px)', animation: 'hitSlideLeft 0.5s ease-out', zIndex: 15 }}>
              <div className="px-5 py-2.5 rounded-lg text-white font-display font-black"
                style={{ fontSize: 'clamp(14px, 1.2vw, 20px)', background: 'rgba(0,0,0,0.65)', border: '2px solid rgba(255,255,255,0.55)', boxShadow: '0 0 24px hsl(217 91% 55% / 0.7)' }}>
                {getHitLabel(recentAction.type)} +{recentAction.points}
              </div>
            </div>
          )}
        </div>

        {/* CENTER COLUMN: MATCH + Timer + Round — ~22% width, matching the KPNP layout */}
        <div className="flex flex-col items-center justify-center relative" style={{ flex: '0 0 22%', background: 'hsl(224 35% 3%)', order: 2 }}>
          {/* MATCH header above timer — bold & clear */}
          <div className="mb-3 px-5 py-2 rounded-xl text-center" style={{
            background: 'linear-gradient(180deg, hsl(45 93% 58% / 0.12), hsl(45 93% 58% / 0.02))',
            border: '2px solid hsl(45 93% 58% / 0.4)',
            boxShadow: '0 0 22px hsl(45 93% 58% / 0.18), inset 0 0 12px hsl(45 93% 58% / 0.08)',
          }}>
            <div className="font-display font-black text-white tracking-[0.3em] leading-none" style={{
              fontSize: 'clamp(20px, 1.8vw, 32px)',
              textShadow: '0 0 10px rgba(0,0,0,0.6)',
            }} >{t('match')}</div>
            <div className="font-display font-black leading-none mt-1" style={{
              fontSize: 'clamp(44px, 5vw, 88px)',
              color: 'hsl(45 93% 58%)',
              textShadow: '0 0 22px hsl(45 93% 58% / 0.6), 0 2px 0 rgba(0,0,0,0.4)',
            }}>
              #{state.matchNumber || '---'}
            </div>
          </div>
          {/* Timer (or PTG announcement replacing the timer) */}
          {ptgActive ? (
            <div className="rounded-xl px-6 py-3 text-center" style={{
              background: ptgAnimation ? (ptgFlash ? 'hsl(0 0% 0%)' : 'hsl(45 93% 58%)') : 'hsl(0 0% 0%)',
              border: '3px solid hsl(45 93% 58%)',
              boxShadow: '0 0 40px hsl(45 93% 58% / 0.7), inset 0 0 20px hsl(45 93% 58% / 0.25)',
              transition: 'background 60ms linear',
              minWidth: 'clamp(180px, 14vw, 320px)',
            }}>
              <div className="font-display font-black leading-none tracking-tight" style={{
                fontSize: 'clamp(60px, 7vw, 120px)',
                color: ptgAnimation && !ptgFlash ? 'hsl(0 0% 0%)' : 'hsl(45 93% 58%)',
                textShadow: (!ptgAnimation || ptgFlash) ? '0 0 30px hsl(45 93% 58% / 0.8)' : 'none',
              }}>PTG</div>
              <div className="font-display font-black mt-1 tracking-[0.35em]" style={{
                fontSize: 'clamp(10px, 0.9vw, 16px)',
                color: ptgAnimation && !ptgFlash ? 'hsl(0 0% 0%)' : 'hsl(45 93% 58%)',
              }} >{t('broadcastPointGap')}</div>
            </div>
          ) : (
            <div className="rounded-xl px-5 py-2" style={{
              background: isTimeout ? 'hsl(45 93% 58%)' : 'transparent',
              border: isTimeout ? '3px solid hsl(45 93% 40%)' : '2px solid hsl(45 93% 58% / 0.35)',
              boxShadow: isTimeout ? '0 0 24px hsl(45 93% 58% / 0.5)' : 'none',
            }}>
              <div className="sb-timer font-display font-black leading-none text-center" style={{
                fontSize: isLast10 ? 'clamp(32px, 5vw, 56px)' : 'clamp(40px, 6vw, 64px)',
                color: isTimeout ? 'hsl(0 0% 0%)' : timerStateColor,
                textShadow: isTimeout ? 'none' : isLast30 || isLast10 ? `0 0 20px ${timerStateColor}` : undefined,
                animation: isLast5 ? 'pulseScore 0.5s ease-in-out infinite' : 'none',
              }}>
                {timerDisplay}
              </div>
            </div>
          )}

          {/* TIME OUT */}
          {isTimeout && (
            <div className="mt-2 px-3 py-1 rounded animate-pulse" style={{ background: 'hsl(38 92% 50% / 0.12)', border: '1px solid hsl(38 92% 50% / 0.3)' }}>
              <span className="font-display text-[10px] font-bold" style={{ color: 'hsl(38 92% 50%)' }} >{t('broadcastTimeOut')}</span>
            </div>
          )}

          {/* Round */}
          <div className="mt-3 rounded-lg px-5 py-1.5" style={{ background: 'hsl(217 91% 60% / 0.08)' }}>
            <div className="text-white/15 font-display text-[8px] text-center tracking-[0.3em]" >{t('broadcastRound')}</div>
            <div className="font-display text-3xl text-center font-bold" style={{ color: 'hsl(217 91% 60%)' }}>{currentRound}</div>
          </div>

          {/* FIGHT indicator (live) — GREEN */}
          {status === 'fighting' && (
            <div className="sb-fight-badge mt-3 flex items-center gap-2 px-4 py-1.5 rounded-full" style={{
              background: 'hsl(142 71% 38%)',
              boxShadow: '0 0 18px hsl(142 71% 45% / 0.7)',
              border: '2px solid hsl(142 71% 65%)',
              animation: 'pulseScore 1.2s ease-in-out infinite',
            }}>
              <div className="w-2.5 h-2.5 rounded-full bg-white" style={{ animation: 'pulseScore 0.8s ease-in-out infinite' }} />
              <span className="font-display font-black text-white tracking-[0.3em]" style={{ fontSize: 'clamp(13px, 1vw, 18px)' }}>{sb.fightText}</span>
            </div>
          )}

          {/* Round-win indicators — BOTTOM, enlarged, with R labels */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
            <div className="font-display text-[9px] text-white/40 tracking-[0.35em]">ROUND WINS</div>
            <div className="flex gap-2.5">
              {Array.from({ length: config.rounds }, (_, i) => {
                const rw = state.roundWinners.find(r => r.round === i + 1);
                const c = rw?.winner === 'chung' ? 'hsl(217 91% 55%)' : rw?.winner === 'hong' ? 'hsl(0 72% 51%)' : 'hsl(224 24% 18%)';
                return (
                  <div key={i} className="flex flex-col items-center gap-0.5">
                    <div className="rounded-full border-2 flex items-center justify-center" style={{
                      width: 38, height: 38,
                      background: c,
                      borderColor: rw ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)',
                      boxShadow: rw ? `0 0 14px ${c}` : 'none',
                    }}>
                      <span className="font-display text-[10px] font-black text-white">
                        {rw?.winner === 'chung' ? '🔵' : rw?.winner === 'hong' ? '🔴' : ''}
                      </span>
                    </div>
                    <span className="font-display text-[9px] text-white/40 font-bold">R{i + 1}</span>
                  </div>
                );
              })}
            </div>
            {/* Round-win tally — framed scoreboard look */}
            <div className="flex items-stretch gap-0 mt-2 rounded-lg overflow-hidden" style={{
              border: '2px solid rgba(255,255,255,0.25)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
            }}>
              <div className="flex flex-col items-center justify-center px-3 py-1" style={{ background: 'hsl(217 91% 50%)', minWidth: 'clamp(36px, 3vw, 56px)' }}>
                <span className="font-display font-black text-white tabular-nums leading-none" style={{ fontSize: 'clamp(25px, 2.1vw, 38px)', textShadow: '0 0 18px rgba(255,216,102,.28)' }}>{chungRoundWins}</span>
              </div>
              <div className="flex items-center justify-center px-1.5" style={{ background: 'hsl(224 35% 8%)' }}>
                <span className="font-display text-white/45 font-black" style={{ fontSize: 'clamp(14px, 1.1vw, 20px)' }}>:</span>
              </div>
              <div className="flex flex-col items-center justify-center px-3 py-1" style={{ background: 'hsl(0 72% 45%)', minWidth: 'clamp(36px, 3vw, 56px)' }}>
                <span className="font-display font-black text-white tabular-nums leading-none" style={{ fontSize: 'clamp(25px, 2.1vw, 38px)', textShadow: '0 0 18px rgba(255,216,102,.28)' }}>{hongRoundWins}</span>
              </div>
            </div>
          </div>
        </div>

        {/* HONG Score Panel — ~39% width, matching the KPNP FOB scoreboard proportions */}
        <div className="sb-side-hong flex flex-col items-center justify-center relative" style={{ flex: '0 0 39%', background: 'hsl(0 72% 45%)', order: 1 }}>
          {/* Team/club emblem (Par Équipe only) — same as CHUNG side; never
              rendered when no logo is set. */}
          {config.competitionMode === 'par_equipe' && (state.teamLogos?.hong || state.clubLogos?.hong) && (
            <div className="rounded-2xl p-2 mb-3 flex items-center justify-center" style={{
              background: 'rgba(255,255,255,0.92)',
              boxShadow: '0 0 30px rgba(0,0,0,0.35)',
              width: 'clamp(72px, 8vw, 140px)', height: 'clamp(72px, 8vw, 140px)',
            }}>
              <img src={state.teamLogos?.hong || state.clubLogos?.hong} alt=""
                className="max-w-full max-h-full object-contain rounded-xl"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
            </div>
          )}
          {/* Single-frame score — decluttered */}
          <div className="rounded-2xl px-6 md:px-10 py-2 md:py-4 flex items-center justify-center" style={{
            border: '2px solid rgba(255,255,255,0.5)',
            background: 'rgba(0,0,0,0.22)',
            boxShadow: '0 0 30px rgba(0,0,0,0.35), inset 0 0 20px rgba(0,0,0,0.35)',
          }}>
            <div className="sb-score-hong font-display font-black text-white leading-none select-none" style={{
              fontSize: 'clamp(90px, 18vw, 240px)',
              textShadow: hongFlash ? '0 0 60px hsl(45 93% 58%), 0 0 100px hsl(45 93% 58% / 0.8), 0 4px 40px rgba(0,0,0,0.5)' : '0 4px 40px rgba(0,0,0,0.5)',
              transform: hongFlash ? 'scale(1.12)' : 'scale(1)',
              transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), text-shadow 0.25s ease',
              animation: hongFlash ? 'pulseScore 0.3s ease-in-out' : 'none',
            }}>
              {displayHong}
            </div>
          </div>

          {/* Hit breakdown chips — top-right (real equipment photos) */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
            {(['punch', 'body', 'head'] as const).map((k) => (
              <HitStatChip key={k} kind={k} side="hong" count={hongHits[k]} pulseKey={hitPulse.hong[k] || 0} reverse size={displaySettings.hitIconSize} />
            ))}
          </div>

          {/* RED VIDEO REPLAY — one visible card per configured quota. */}
          <VideoReplayQuota quota={hong.ivrQuota} totalQuota={state.config?.ivrQuota ?? hong.ivrQuota} side="hong" />


          {/* Per-round scores — framed boxes at very bottom */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {hong.scores.slice(0, config.rounds).map((s, i) => {
              const active = i === currentRound - 1;
              const bw = displaySettings.roundBoxBorder;
              return (
                <div key={i} className={`${active ? 'sb-round-active' : ''} rounded-lg flex flex-col items-center justify-center transition-all`} style={{
                  minWidth: 'clamp(44px, 3.5vw, 68px)',
                  padding: 'clamp(3px, 0.3vw, 6px) clamp(6px, 0.5vw, 10px)',
                  background: active ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)',
                  border: `${active ? bw + 1 : bw}px solid ${active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)'}`,
                  boxShadow: active ? '0 0 22px rgba(255,255,255,0.35), inset 0 0 14px rgba(0,0,0,0.45)' : 'inset 0 0 8px rgba(0,0,0,0.3)',
                }}>
                  <div className="font-display font-bold text-white/80 tracking-widest" style={{ fontSize: 'clamp(9px, 0.7vw, 12px)' }}>R{i + 1}</div>
                  <div className="font-display font-black text-white leading-none tabular-nums" style={{ fontSize: 'clamp(20px, 1.8vw, 32px)' }}>{s.total}</div>
                </div>
              );
            })}
          </div>

          {/* Gamjeom dots — above round scores */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-lg" style={{ bottom: 'clamp(70px, 6vw, 110px)', background: 'rgba(0,0,0,0.4)' }}>
            <span className="text-white/70 font-display font-bold tracking-widest" style={{ fontSize: 'clamp(10px, 0.75vw, 13px)' }}>GAM</span>
            {Array.from({ length: Math.min(config.gamjeomLimit, 10) }, (_, i) => (
              <div key={i} className="rounded-full border-2" style={{
                width: 'clamp(10px, 0.8vw, 16px)', height: 'clamp(10px, 0.8vw, 16px)',
                background: i < getGamjeomForRound('hong') ? 'hsl(38 92% 50%)' : 'rgba(255,255,255,0.08)',
                borderColor: i < getGamjeomForRound('hong') ? 'hsl(38 92% 65%)' : 'rgba(255,255,255,0.2)',
                boxShadow: i < getGamjeomForRound('hong') ? '0 0 10px hsl(38 92% 50%)' : 'none',
              }} />
            ))}
          </div>

          {/* Action flash — slides from right side, positioned above gamjeom+round boxes */}
          {recentAction?.player === 'hong' && (
            <div className="absolute right-6" style={{ bottom: 'clamp(140px, 11vw, 180px)', animation: 'hitSlideRight 0.5s ease-out', zIndex: 15 }}>
              <div className="px-5 py-2.5 rounded-lg text-white font-display font-black"
                style={{ fontSize: 'clamp(14px, 1.2vw, 20px)', background: 'rgba(0,0,0,0.65)', border: '2px solid rgba(255,255,255,0.55)', boxShadow: '0 0 24px hsl(0 72% 51% / 0.7)' }}>
                {getHitLabel(recentAction.type)} +{recentAction.points}
              </div>
            </div>
          )}
        </div>

        {/* ZONE 3: Central action overlay (hit type flash) */}
        {recentAction && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
            <div className="px-8 py-4 rounded-2xl" style={{
              background: recentAction.player === 'chung' ? 'hsl(217 91% 55% / 0.15)' : 'hsl(0 72% 51% / 0.15)',
              backdropFilter: 'blur(4px)',
              animation: 'actionFlash 0.5s ease-out',
            }}>
              <div className="font-display text-2xl font-black text-white text-center" style={{
                textShadow: `0 0 20px ${recentAction.player === 'chung' ? 'hsl(217 91% 55%)' : 'hsl(0 72% 51%)'}`,
              }}>
                {getHitLabel(recentAction.type)}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        /* Mini public preview must stay inside the referee preview frame. Any
           fixed descendant becomes local/absolute so no public animation or
           scoreboard layer can escape and cover the Main Referee controls. */
        .public-scoreboard-mini { position: absolute !important; inset: 0 !important; overflow: hidden !important; }
        .public-scoreboard-mini .fixed { position: absolute !important; }
        .public-scoreboard-mini .fixed.inset-0 { inset: 0 !important; }
        @keyframes actionFlash { 0%{transform:scale(1.5);opacity:0} 30%{transform:scale(1);opacity:1} 100%{opacity:0.7} }
        @keyframes actionPop { 0%{transform:translateY(10px) scale(0.8);opacity:0} 100%{transform:translateY(0) scale(1);opacity:1} }
        @keyframes frameEnter { 0%{opacity:0;transform:scale(0.985)} 100%{opacity:1;transform:scale(1)} }
        @keyframes hitSlideLeft { 0%{transform:translateX(-60px) scale(0.7);opacity:0} 40%{transform:translateX(0) scale(1.1);opacity:1} 100%{transform:translateX(0) scale(1);opacity:1} }
        @keyframes hitSlideRight { 0%{transform:translateX(60px) scale(0.7);opacity:0} 40%{transform:translateX(0) scale(1.1);opacity:1} 100%{transform:translateX(0) scale(1);opacity:1} }
      `}</style>
    </div>
  );
}

class PublicDisplayErrorBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error) {
    console.error('[PUBLIC DISPLAY] renderer fallback:', error);
    window.electronAPI?.preparePublicDisplay?.({ready:false,canvas:{width:1920,height:1080},animation:'DISPLAY ERROR'}).catch(()=>{});
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return <div dir="ltr" className="fixed inset-0 bg-black text-white overflow-hidden flex items-center justify-center">
      <div className="text-center px-8"><div className="font-display text-[12px] tracking-[.45em] text-yellow-300">WAB-TKD</div><div className="mt-4 font-display text-5xl font-black">STANDBY</div><div className="mt-3 text-xs tracking-[.25em] text-white/45">PUBLIC DISPLAY FALLBACK · DISPLAY ERROR</div></div>
    </div>;
  }
}
function DisplayGuides({ enabled, testMode, diagnostics }: { enabled: boolean; testMode: boolean; diagnostics: { scale: string; animation: string; ready: boolean; safe: boolean; overlaps: number; outOfBounds: number } }) {
  if (!enabled && !testMode) return null;
  return <>{(enabled || testMode) && <div className={testMode ? "wab-display-test-pattern" : "wab-display-guides"} aria-hidden="true">
    {testMode && <><div className="test-16x9"/><div className="test-safe"/><div className="test-center"/><div className="test-center-h"/><div className="test-zone red"/><div className="test-zone match"/><div className="test-zone blue"/><div className="test-label">MASTER 1920×1080 · DISPLAY TEST</div></>}
    {enabled && !testMode && <><div className="wab-guide-label">MASTER 1920×1080 · 16:9</div><div className="wab-guide-safe"/><div className="wab-guide-center-v"/><div className="wab-guide-center-h"/><div className="wab-guide-zone red">RED AREA</div><div className="wab-guide-zone match">MATCH AREA</div><div className="wab-guide-zone blue">BLUE AREA</div></>}
  </div>}
  {enabled && <div className="wab-display-diagnostics" aria-live="polite">
    <div><b>CANVAS</b> 1920×1080</div><div><b>SCALE</b> {diagnostics.scale}</div><div><b>ANIMATION</b> {diagnostics.animation}</div><div><b>STATUS</b> <span className={diagnostics.ready?'ok':'warn'}>{diagnostics.ready?'READY':'PREPARING'}</span></div><div><b>SAFE AREA</b> <span className={diagnostics.safe?'ok':'warn'}>{diagnostics.safe?'OK':'OUT'}</span></div><div><b>OVERLAPS</b> {diagnostics.overlaps}</div><div><b>OUT OF BOUNDS</b> {diagnostics.outOfBounds}</div>
  </div>}
  </>;
}

export default function PublicScoreboard(props: {isMiniPreview?:boolean}={}){
  useBroadcastViewport(!props.isMiniPreview);
  const displayId=React.useMemo(()=>{try{return Number(new URLSearchParams(window.location.search).get('displayId'))||undefined}catch{return undefined}},[]);
  useEffect(()=>{
    if(props.isMiniPreview || !isPublicDisplayWindow()) return;
    let cancelled=false;
    const prepare=()=>{
      if(cancelled) return;
      const width=Math.max(1,Math.round(window.innerWidth));
      const height=Math.max(1,Math.round(window.innerHeight));
      // READY means the 1920×1080 master canvas is mounted and renderable.
      // It must NOT require the physical CSS viewport to be exactly 1920×1080:
      // 4K and wireless displays are intentionally normalized/scaled to the
      // same master canvas.
      const renderable=width>0 && height>0 && Boolean(document.getElementById('root'));
      document.documentElement.dataset.wabDisplayPrepared=renderable?'true':'false';
      window.electronAPI?.preparePublicDisplay?.({ready:renderable,canvas:{width:1920,height:1080},animation:'PUBLIC_DISPLAY'}).catch(()=>{});
    };
    const id=window.requestAnimationFrame(prepare);
    window.addEventListener('resize',prepare,{passive:true});
    return()=>{cancelled=true;window.cancelAnimationFrame(id);window.removeEventListener('resize',prepare);};
  },[props.isMiniPreview]);
  useEffect(()=>{
    if(props.isMiniPreview || !isPublicDisplayWindow()) return;
    const send=()=>window.electronAPI?.publicDisplayHeartbeat?.({displayId,ready:document.documentElement.dataset.wabDisplayPrepared==='true',animation:'PUBLIC_DISPLAY'});
    send(); const id=window.setInterval(send,1000);
    return()=>window.clearInterval(id);
  },[props.isMiniPreview,displayId]);
  const[emergency,setEmergency]=useState(false);
  useEffect(()=>{
    if(props.isMiniPreview || !isPublicDisplayWindow()) return;
    return window.electronAPI?.onPublicDisplayEmergency?.(()=>setEmergency(true));
  },[props.isMiniPreview]);
  const[mode,setMode]=useState(()=>getBroadcastDisplayConfig(displayId).mode);useEffect(()=>{const sync=()=>setMode(getBroadcastDisplayConfig(displayId).mode);window.addEventListener('storage',sync);window.addEventListener('wab-display-config-changed',sync);const id=window.setInterval(sync,500);return()=>{window.removeEventListener('storage',sync);window.removeEventListener('wab-display-config-changed',sync);clearInterval(id);};},[displayId]);
  const [guides,setGuides]=useState(false);
  const [testMode,setTestMode]=useState(false);
  const [diagnostics,setDiagnostics]=useState({scale:'1.000',animation:'PUBLIC_DISPLAY',ready:false,safe:true,overlaps:0,outOfBounds:0});
  useEffect(()=>{if(typeof window==='undefined')return;const sync=()=>setGuides(localStorage.getItem('wab-display-guides')==='1');sync();const api=window.electronAPI;void api?.getDisplayOverlay?.().then(v=>{localStorage.setItem('wab-display-guides',v.guides?'1':'0');setGuides(v.guides);});const off=api?.onDisplayOverlayChanged?.(v=>{localStorage.setItem('wab-display-guides',v.guides?'1':'0');setGuides(v.guides);setTestMode(v.test);});window.addEventListener('storage',sync);return()=>{off?.();window.removeEventListener('storage',sync);};},[]);
  useEffect(()=>{if(typeof window==='undefined')return;const sync=()=>setTestMode(localStorage.getItem('wab-display-test-mode')==='1');sync();window.addEventListener('storage',sync);window.addEventListener('wab-display-test-mode-changed',sync);return()=>{window.removeEventListener('storage',sync);window.removeEventListener('wab-display-test-mode-changed',sync);};},[]);
  useEffect(()=>{
    const inspect=()=>{
      const root=document.documentElement; const width=Math.max(1,window.innerWidth),height=Math.max(1,window.innerHeight);
      const scale=Number(root.dataset.wabBroadcastFit||1); const nodes=Array.from(document.querySelectorAll('[data-wab-layer-root]')) as HTMLElement[];
      let out=0; for(const el of nodes){const r=el.getBoundingClientRect(); if(r.right<0||r.bottom<0||r.left>width||r.top>height) out++;}
      let overlaps=0; for(let i=0;i<nodes.length;i++){for(let j=i+1;j<nodes.length;j++){const a=nodes[i].getBoundingClientRect(),b=nodes[j].getBoundingClientRect(); if(a.width>4&&a.height>4&&b.width>4&&b.height>4&&a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top) overlaps++;}}
      setDiagnostics({scale:scale.toFixed(3),animation:document.querySelector('[data-wab-layer-root]')?.getAttribute('data-wab-layer-root')||'PUBLIC_DISPLAY',ready:document.documentElement.dataset.wabDisplayPrepared==='true',safe:out===0,overlaps,outOfBounds:out});
    };
    inspect(); const id=window.setInterval(inspect,500); window.addEventListener('resize',inspect); return()=>{clearInterval(id);window.removeEventListener('resize',inspect);};
  },[]);
  if(emergency && !props.isMiniPreview) return <div dir="ltr" className="fixed inset-0 bg-black text-white overflow-hidden flex items-center justify-center"><div className="text-center"><div className="font-display text-6xl font-black">STANDBY</div><div className="mt-3 text-sm tracking-[.3em] text-white/45">PUBLIC DISPLAY EMERGENCY FALLBACK</div></div></div>;
  const child=(!props.isMiniPreview&&isPublicDisplayWindow()&&(mode==='mat_announcer'||mode==='upcoming'))?<MatBroadcastScreen displayId={displayId} mode={mode}/>:<ScoreboardView {...props}/>;
  return <PublicDisplayErrorBoundary><>{child}<DisplayGuides enabled={guides&&(props.isMiniPreview||isPublicDisplayWindow())} testMode={testMode&&(props.isMiniPreview||isPublicDisplayWindow())} diagnostics={diagnostics}/></></PublicDisplayErrorBoundary>;}
