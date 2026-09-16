import { useMemo } from 'react';
import { useBroadcastViewport } from '@/lib/broadcast-viewport';
import { MatchResultScreen } from './MatchResultScreen';
import type { MatchState, PlayerColor } from '@/types/tkd';
import type { MatchData, RoundResult } from './types';

/**
 * Static public winner/result adapter.
 *
 * The public winner screen is intentionally NOT a cinematic sequence anymore.
 * It is a single information frame. Live MatchState remains the only source of
 * truth, so names, photos, flags, scores, rounds and decision evidence update
 * whenever the recorded result changes without replaying an animation.
 */
export function IndividualWinnerAnimation({ state: liveState, winner }: { state: MatchState; winner: PlayerColor }) {
  useBroadcastViewport(true);

  const match = useMemo<MatchData | null>(() => {
    const win = liveState[winner];
    if (!win?.player) return null;

    const rounds: RoundResult[] = (liveState.roundWinners || [])
      .slice()
      .sort((a, b) => a.round - b.round)
      .map((r) => ({
        round: r.round,
        winner: r.winner === 'chung' ? 'blue' : r.winner === 'hong' ? 'red' : 'draw',
        blue: r.chungScore,
        red: r.hongScore,
        method: r.method,
        decisionType: r.decisionType,
        decisionLabel: r.decisionLabel || (r.decisionType === 'WOOSE_GIROK' ? 'WOO-SE-GIROK' : r.decisionType === 'AI_RECOMMENDATION' ? 'AI RECOMMENDATION' : undefined),
        tiebreakDetails: r.tiebreakDetails,
      }));

    const isBlue = winner === 'chung';
    const resultMethod = String(liveState.result?.method || 'DECISION').toUpperCase();
    const decisiveRound = [...(liveState.roundWinners || [])].reverse().find((r) => r.winner === winner)?.round;
    const finalDecision = [...(liveState.roundWinners || [])].reverse().find((r) => r.decisionType || r.refereeVotes);
    const refereeVotes = finalDecision?.refereeVotes ? {
      left: finalDecision.refereeVotes.left === 'chung' ? 'blue' : finalDecision.refereeVotes.left === 'hong' ? 'red' : undefined,
      center: finalDecision.refereeVotes.center === 'chung' ? 'blue' : finalDecision.refereeVotes.center === 'hong' ? 'red' : undefined,
      right: finalDecision.refereeVotes.right === 'chung' ? 'blue' : finalDecision.refereeVotes.right === 'hong' ? 'red' : undefined,
    } : undefined;

    const goldenPointWin = (resultMethod === 'GDP' || resultMethod === 'SUP') && (
      !!liveState.isGoldenRound ||
      (decisiveRound != null && decisiveRound > Number(liveState.config.rounds || 3))
    );

    return {
      matchId: String(liveState.matchNumber ?? '—'),
      category: liveState.weightCategory || win.player.category || '—',
      tournament: liveState.competitionName || 'WAB-TKD CHAMPIONSHIP',
      stage: liveState.matchStage || 'MATCH',
      date: liveState.eventDate || '—',
      time: '—',
      ring: liveState.matNumber ?? '—',
      winner: {
        name: win.player.name,
        country: win.player.nationality || '—',
        flag: win.player.nationality || '',
        club: win.player.club || '—',
        corner: isBlue ? 'blue' : 'red',
        number: win.player.playerNumber != null ? String(win.player.playerNumber) : undefined,
      },
      score: { blue: liveState.chung.totalScore, red: liveState.hong.totalScore },
      competitionType: liveState.config.competitionMode === 'par_equipe' ? 'PAR ÉQUIPE' : 'INDIVIDUAL',
      gender: liveState.gender === 'male' ? 'MEN' : liveState.gender === 'female' ? 'WOMEN' : '—',
      ageGroup: liveState.ageGroup || '—',
      weight: liveState.weightCategory || '—',
      location: 'WORLD ARENA',
      rounds,
      stats: { headHits: 0, bodyHits: 0, totalHits: { blue: 0, red: 0 }, warnings: 0 },
      display: liveState.displayConfig,
      resultMethod,
      decisiveRound,
      resultRound: decisiveRound,
      resultStatus: 'FINISHED',
      refereeConfirmed: !!liveState.resultConfirmed,
      goldenPointWin,
      goldenRound: goldenPointWin ? decisiveRound : undefined,
      refereeVotes,
      decisionType: finalDecision?.decisionType,
      aiRecommendation: liveState.aiRecommendation === 'chung' ? 'blue' : liveState.aiRecommendation === 'hong' ? 'red' : liveState.aiRecommendation === 'unable' ? 'unable' : undefined,
      aiConfidence: liveState.aiConfidence,
      aiReason: liveState.aiReason,
    };
  }, [liveState, winner]);

  if (!match) return null;
  return (
    <div className="wab-broadcast-layer wab-winner-public-layer" data-wab-layer-root="winner" data-winner-side={winner === 'chung' ? 'blue' : 'red'}>
      <MatchResultScreen match={match} playerPhoto={liveState[winner].player?.photo || liveState[winner].player?.photoUrl} />
    </div>
  );
}
