import { type Innings } from '../backend';

interface FallOfWicketsProps {
  innings: Innings;
}

export default function FallOfWickets({ innings }: FallOfWicketsProps) {
  // Derive fall of wickets from deliveries and batting entries
  const wicketDeliveries = innings.deliveries.filter(d => d.wicket);

  if (wicketDeliveries.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        No wickets fallen yet
      </div>
    );
  }

  // Build cumulative score at each wicket
  let cumulativeRuns = 0;
  const fallOfWickets: { wicketNum: number; score: number; over: string; batsman: string }[] = [];

  let wicketCount = 0;
  const dismissedBatsmen = innings.batting.filter(b => !b.notOut).map(b => b.batsmanName);

  for (const delivery of innings.deliveries) {
    cumulativeRuns += Number(delivery.runs);
    if (delivery.wicket) {
      wicketCount++;
      const batsman = dismissedBatsmen[wicketCount - 1] || 'Unknown';
      fallOfWickets.push({
        wicketNum: wicketCount,
        score: cumulativeRuns,
        over: `${delivery.overNumber.toString()}.${delivery.ballNumber.toString()}`,
        batsman,
      });
    }
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 gap-2 text-xs font-display text-muted-foreground tracking-wide px-3 pb-2 border-b border-stadium-dark-border">
        <span>#</span>
        <span>SCORE</span>
        <span>OVER</span>
        <span>BATSMAN</span>
      </div>
      {fallOfWickets.map((fow) => (
        <div
          key={fow.wicketNum}
          className="grid grid-cols-4 gap-2 items-center bg-stadium-dark-card border border-stadium-dark-border rounded-lg px-3 py-2.5"
        >
          <span className="font-display font-bold text-wicket-red">{fow.wicketNum}</span>
          <span className="font-display font-bold text-foreground">{fow.score}</span>
          <span className="text-muted-foreground text-sm">{fow.over}</span>
          <span className="text-sm text-foreground">{fow.batsman}</span>
        </div>
      ))}
    </div>
  );
}
