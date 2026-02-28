import { type Innings, type Match } from '../backend';
import { calcRunRate, calcRequiredRunRate, getOversRemaining, formatOversBigInt, getInningsTarget } from '../lib/cricket';

interface LiveScorePanelProps {
  innings: Innings;
  match: Match;
}

export default function LiveScorePanel({ innings, match }: LiveScorePanelProps) {
  const inningsNum = Number(innings.inningsNumber);
  const target = getInningsTarget(match, inningsNum);
  const runsNeeded = target !== null ? target - Number(innings.totalRuns) : null;
  const oversRemaining = getOversRemaining(match.oversLimit, innings.deliveries);
  const rrr = runsNeeded !== null ? calcRequiredRunRate(runsNeeded, oversRemaining) : null;
  const crr = calcRunRate(innings.totalRuns, innings.deliveries);
  const oversDisplay = formatOversBigInt(innings.oversBowled, innings.deliveries);

  // Extras breakdown
  const [wides, noBalls, byes, legByes] = innings.extras;
  const totalExtras = Number(wides) + Number(noBalls) + Number(byes) + Number(legByes);

  return (
    <div className="bg-stadium-dark-card rounded-lg border border-stadium-dark-border overflow-hidden">
      {/* Main score */}
      <div className="bg-gradient-to-r from-cricket-green/10 to-cricket-gold/10 p-6 text-center border-b border-stadium-dark-border">
        <div className="text-sm font-display text-muted-foreground tracking-widest mb-1">
          {innings.battingTeam.toUpperCase()} — INNINGS {inningsNum}
        </div>
        <div className="font-display text-6xl font-bold text-foreground score-glow mb-1">
          {innings.totalRuns.toString()}
          <span className="text-3xl text-muted-foreground">/{innings.wickets.toString()}</span>
        </div>
        <div className="text-lg text-cricket-green font-display">
          {oversDisplay} overs
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-stadium-dark-border">
        <div className="p-3 text-center">
          <div className="text-xs text-muted-foreground font-display tracking-wide mb-1">CRR</div>
          <div className="font-display text-lg font-semibold text-cricket-green">{crr}</div>
        </div>

        {target !== null && runsNeeded !== null ? (
          <>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground font-display tracking-wide mb-1">TARGET</div>
              <div className="font-display text-lg font-semibold text-cricket-gold">{target}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground font-display tracking-wide mb-1">NEED</div>
              <div className={`font-display text-lg font-semibold ${runsNeeded > 0 ? 'text-foreground' : 'text-cricket-green'}`}>
                {Math.max(0, runsNeeded)} runs
              </div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground font-display tracking-wide mb-1">RRR</div>
              <div className={`font-display text-lg font-semibold ${parseFloat(rrr || '0') > parseFloat(crr) ? 'text-wicket-red' : 'text-cricket-green'}`}>
                {rrr}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground font-display tracking-wide mb-1">EXTRAS</div>
              <div className="font-display text-lg font-semibold text-foreground">{totalExtras}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground font-display tracking-wide mb-1">WICKETS</div>
              <div className="font-display text-lg font-semibold text-wicket-red">{innings.wickets.toString()}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground font-display tracking-wide mb-1">OVERS</div>
              <div className="font-display text-lg font-semibold text-foreground">{oversDisplay}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
