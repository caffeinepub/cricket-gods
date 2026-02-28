import { type Innings, type Match, MatchFormat, MatchStatus } from '../backend';

export function formatOvers(legalBalls: number): string {
  const overs = Math.floor(legalBalls / 6);
  const balls = legalBalls % 6;
  return balls === 0 ? `${overs}` : `${overs}.${balls}`;
}

export function formatOversBigInt(oversBowled: bigint, deliveries?: { extras: string }[]): string {
  // oversBowled from backend is full overs count
  // We need to count balls in current over from deliveries
  if (!deliveries) return `${oversBowled.toString()}.0`;
  const legalDeliveries = deliveries.filter(d => d.extras !== 'wide' && d.extras !== 'no-ball');
  const totalLegal = legalDeliveries.length;
  const overs = Math.floor(totalLegal / 6);
  const balls = totalLegal % 6;
  return `${overs}.${balls}`;
}

export function calcRunRate(runs: bigint, deliveries: { extras: string }[]): string {
  const legalBalls = deliveries.filter(d => d.extras !== 'wide' && d.extras !== 'no-ball').length;
  if (legalBalls === 0) return '0.00';
  const overs = legalBalls / 6;
  return (Number(runs) / overs).toFixed(2);
}

export function calcRequiredRunRate(runsNeeded: number, oversRemaining: number): string {
  if (oversRemaining <= 0) return '∞';
  return (runsNeeded / oversRemaining).toFixed(2);
}

export function getOversRemaining(oversLimit: bigint | undefined | null, deliveries: { extras: string }[]): number {
  if (!oversLimit) return 999;
  const legalBalls = deliveries.filter(d => d.extras !== 'wide' && d.extras !== 'no-ball').length;
  const oversUsed = legalBalls / 6;
  return Math.max(0, Number(oversLimit) - oversUsed);
}

export function getFormatLabel(format: MatchFormat): string {
  switch (format) {
    case MatchFormat.t20: return 'T20';
    case MatchFormat.odi: return 'ODI';
    case MatchFormat.test: return 'Test';
    default: return 'Unknown';
  }
}

export function getStatusLabel(status: MatchStatus): string {
  switch (status) {
    case MatchStatus.scheduled: return 'Scheduled';
    case MatchStatus.inProgress: return 'Live';
    case MatchStatus.completed: return 'Completed';
    default: return 'Unknown';
  }
}

export function getFormatOvers(format: MatchFormat): number | null {
  switch (format) {
    case MatchFormat.t20: return 20;
    case MatchFormat.odi: return 50;
    case MatchFormat.test: return null;
    default: return null;
  }
}

export function getCurrentInnings(match: Match): Innings | null {
  if (!match.innings || match.innings.length === 0) return null;
  return match.innings[match.innings.length - 1];
}

export function getInningsTarget(match: Match, inningsNumber: number): number | null {
  if (inningsNumber < 2) return null;
  // For 2nd innings, target is 1st innings total + 1
  // For Test 3rd/4th innings, it's more complex but we simplify
  const prevInnings = match.innings.find(i => Number(i.inningsNumber) === inningsNumber - 1);
  if (!prevInnings) return null;
  // For Test matches with 4 innings, target is sum of opponent's innings
  if (match.format === MatchFormat.test) {
    const battingTeam = match.innings.find(i => Number(i.inningsNumber) === inningsNumber)?.battingTeam;
    if (!battingTeam) return null;
    const opponentInnings = match.innings.filter(i => i.battingTeam !== battingTeam);
    const ownPrevInnings = match.innings.filter(i => i.battingTeam === battingTeam && Number(i.inningsNumber) < inningsNumber);
    const opponentTotal = opponentInnings.reduce((sum, inn) => sum + Number(inn.totalRuns), 0);
    const ownTotal = ownPrevInnings.reduce((sum, inn) => sum + Number(inn.totalRuns), 0);
    return opponentTotal - ownTotal + 1;
  }
  return Number(prevInnings.totalRuns) + 1;
}

export function isInningsComplete(innings: Innings, match: Match): boolean {
  const wickets = Number(innings.wickets);
  if (wickets >= 10) return true;
  if (match.oversLimit) {
    const legalBalls = innings.deliveries.filter(d => d.extras !== 'wide' && d.extras !== 'no-ball').length;
    const oversUsed = Math.floor(legalBalls / 6);
    if (oversUsed >= Number(match.oversLimit)) return true;
  }
  return false;
}

export function getLegalBallCount(deliveries: { extras: string }[]): number {
  return deliveries.filter(d => d.extras !== 'wide' && d.extras !== 'no-ball').length;
}

export function getCurrentOverNumber(deliveries: { extras: string }[]): number {
  const legalBalls = getLegalBallCount(deliveries);
  return Math.floor(legalBalls / 6) + 1;
}

export function getCurrentBallInOver(deliveries: { extras: string }[]): number {
  const legalBalls = getLegalBallCount(deliveries);
  return (legalBalls % 6) + 1;
}

export function getStrikeRate(runs: bigint, balls: bigint): string {
  if (balls === 0n) return '0.00';
  return ((Number(runs) / Number(balls)) * 100).toFixed(2);
}

export function getEconomy(runs: bigint, overs: bigint, balls?: number): string {
  const totalBalls = balls !== undefined ? balls : Number(overs) * 6;
  if (totalBalls === 0) return '0.00';
  const oversDecimal = totalBalls / 6;
  return (Number(runs) / oversDecimal).toFixed(2);
}

export function formatBowlerOvers(deliveries: { extras: string; commentary: string }[], bowlerName: string): string {
  const bowlerDeliveries = deliveries.filter(d => d.commentary.includes(bowlerName));
  const legalBalls = bowlerDeliveries.filter(d => d.extras !== 'wide' && d.extras !== 'no-ball').length;
  const overs = Math.floor(legalBalls / 6);
  const balls = legalBalls % 6;
  return balls === 0 ? `${overs}.0` : `${overs}.${balls}`;
}

export function groupDeliveriesByOver(deliveries: { overNumber: bigint; ballNumber: bigint; runs: bigint; extras: string; wicket: boolean; commentary: string }[]) {
  const groups: Map<number, typeof deliveries> = new Map();
  for (const d of deliveries) {
    const over = Number(d.overNumber);
    if (!groups.has(over)) groups.set(over, []);
    groups.get(over)!.push(d);
  }
  return Array.from(groups.entries()).sort((a, b) => a[0] - b[0]);
}

export function getMaxInningsForFormat(format: MatchFormat): number {
  return format === MatchFormat.test ? 4 : 2;
}

export function canStartNextInnings(match: Match): boolean {
  const maxInnings = getMaxInningsForFormat(match.format);
  return match.innings.length < maxInnings;
}

export function getNextBattingTeam(match: Match): string {
  const currentInnings = getCurrentInnings(match);
  if (!currentInnings) return match.teams[0];
  // Alternate teams
  return currentInnings.battingTeam === match.teams[0] ? match.teams[1] : match.teams[0];
}

export function getNextBowlingTeam(match: Match): string {
  const nextBatting = getNextBattingTeam(match);
  return nextBatting === match.teams[0] ? match.teams[1] : match.teams[0];
}
