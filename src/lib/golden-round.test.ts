import { describe, it, expect } from 'vitest';
import { createInitialMatchState, addScore, endRound, startNextRound } from './match-engine';

function next(s:any){ return startNextRound({ ...s, currentRound:s.currentRound+1 }); }

describe('World Taekwondo golden-round rules', () => {
  it('does not finish on one golden-round point', () => {
    let s:any=createInitialMatchState({ rounds:3, goldenRound:true });
    s={...s,currentRound:4,isGoldenRound:true,status:'fighting'};
    s=addScore(s,'chung','punch');
    expect(s.result).toBeUndefined();
    expect(s.status).toBe('fighting');
  });

  it('wins after two golden-round points', () => {
    let s:any=createInitialMatchState({ rounds:3, goldenRound:true });
    s={...s,currentRound:4,isGoldenRound:true,status:'fighting'};
    s=addScore(s,'chung','punch');
    expect(s.result).toBeUndefined();
    s=addScore(s,'chung','trunk_kick');
    expect(s.result?.winner).toBe('chung');
    expect(s.result?.method).toBe('GDP');
    expect(s.result?.finalScore).toEqual({chung:3,hong:0});
  });

  it('wins after opponent receives two golden-round Gam-jeoms', () => {
    let s:any=createInitialMatchState({ rounds:3, goldenRound:true });
    s={...s,currentRound:4,isGoldenRound:true,status:'fighting'};
    s=addScore(s,'hong','gamjeom');
    expect(s.result).toBeUndefined();
    s=addScore(s,'hong','gamjeom');
    expect(s.result?.winner).toBe('chung');
  });

  it('golden-round expiry uses punch point before PSS hits', () => {
    let s:any=createInitialMatchState({ rounds:3, goldenRound:true });
    s={...s,currentRound:4,isGoldenRound:true,status:'fighting'};
    s=addScore(s,'chung','punch','operator');
    s=addScore(s,'hong','trunk_kick','pss');
    s=endRound(s);
    expect(s.result?.winner).toBe('chung');
    expect(s.result?.method).toBe('SUP');
  });

  it('golden-round expiry falls back to referee when all official criteria tie', () => {
    let s:any=createInitialMatchState({ rounds:3, goldenRound:true });
    s={...s,currentRound:4,isGoldenRound:true,status:'fighting'};
    // Each side scores a single 1-point punch via PSS so punch points,
    // PSS-hit counts, regulation-round wins and Gam-jeoms are all tied —
    // neither reaches the golden round's 2-point threshold, so the round
    // must run to expiry and fall back to the superiority hierarchy.
    s=addScore(s,'chung','punch','pss');
    s=addScore(s,'hong','punch','pss');
    s=endRound(s);
    expect(s.result).toBeUndefined();
    expect(s.pendingRoundDecision).toBe(true);
  });

  it('the final Gam-jeom warning slot loses the current round instead of ending the whole match', () => {
    let s:any=createInitialMatchState({ rounds:3, goldenRound:true, gamjeomLimit:10, enforceGamjeomLimit:true });
    s={...s,status:'fighting'};
    for(let i=0;i<10;i++) s=addScore(s,'hong','gamjeom');
    expect(s.result).toBeUndefined();
    expect(s.status).toBe('rest');
    expect(s.roundWinners.find((r:any)=>r.round===1)?.winner).toBe('chung');
    expect(s.roundWinners.find((r:any)=>r.round===1)?.method).toBe('PUN');
  });

  it('LAST 10s ×2 records one warning and awards exactly two points to the opponent', () => {
    let s:any=createInitialMatchState({ rounds:3, gamjeomLimit:10, enforceGamjeomLimit:true, last10SecondsGamjeomPoints:2 });
    s={...s,status:'fighting',timeRemaining:8};
    s=addScore(s,'hong','gamjeom','operator',undefined,2);
    expect(s.hong.scores[0].gamjeom).toBe(1);
    expect(s.chung.scores[0].total).toBe(2);
    expect(s.events.filter((e:any)=>e.type==='gamjeom' && e.player==='hong')).toHaveLength(1);
    expect(s.events.find((e:any)=>e.type==='gamjeom' && e.player==='hong')?.points).toBe(2);
  });

  it('LAST 10s ×2 still fills only one penalty slot and the tenth slot loses the current round', () => {
    let s:any=createInitialMatchState({ rounds:3, gamjeomLimit:10, enforceGamjeomLimit:true, last10SecondsGamjeomPoints:2 });
    s={...s,status:'fighting',timeRemaining:8};
    for (let i=0;i<9;i++) s=addScore(s,'hong','gamjeom','operator',undefined,2);
    expect(s.hong.scores[0].gamjeom).toBe(9);
    expect(s.status).toBe('fighting');
    s=addScore(s,'hong','gamjeom','operator',undefined,2);
    expect(s.hong.scores[0].gamjeom).toBe(10);
    expect(s.events.filter((e:any)=>e.type==='gamjeom' && e.player==='hong')).toHaveLength(10);
    expect(s.events.filter((e:any)=>e.type==='gamjeom' && e.player==='chung')).toHaveLength(0);
    expect(s.roundWinners.find((r:any)=>r.round===1)?.winner).toBe('chung');
    expect(s.roundWinners.find((r:any)=>r.round===1)?.method).toBe('PUN');
    expect(s.result).toBeUndefined();
  });

});
