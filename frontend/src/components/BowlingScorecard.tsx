import { type Innings } from '../backend';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface BowlingScorecardProps {
  innings: Innings;
  currentBowler?: string;
}

function getBowlerOversFromDeliveries(innings: Innings, bowlerName: string): string {
  // Count deliveries that mention this bowler in commentary
  const bowlerDeliveries = innings.deliveries.filter(d =>
    d.commentary.toLowerCase().includes(bowlerName.toLowerCase())
  );
  const legalBalls = bowlerDeliveries.filter(d => d.extras !== 'wide' && d.extras !== 'no-ball').length;
  const overs = Math.floor(legalBalls / 6);
  const balls = legalBalls % 6;
  return `${overs}.${balls}`;
}

function getEconomyFromDeliveries(innings: Innings, bowlerName: string, runsConceded: bigint): string {
  const bowlerDeliveries = innings.deliveries.filter(d =>
    d.commentary.toLowerCase().includes(bowlerName.toLowerCase())
  );
  const legalBalls = bowlerDeliveries.filter(d => d.extras !== 'wide' && d.extras !== 'no-ball').length;
  if (legalBalls === 0) return '0.00';
  const oversDecimal = legalBalls / 6;
  return (Number(runsConceded) / oversDecimal).toFixed(2);
}

export default function BowlingScorecard({ innings, currentBowler }: BowlingScorecardProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-stadium-dark-border hover:bg-transparent">
            <TableHead className="text-muted-foreground font-display tracking-wide text-xs w-[180px]">BOWLER</TableHead>
            <TableHead className="text-muted-foreground font-display tracking-wide text-xs text-right">O</TableHead>
            <TableHead className="text-muted-foreground font-display tracking-wide text-xs text-right">M</TableHead>
            <TableHead className="text-muted-foreground font-display tracking-wide text-xs text-right">R</TableHead>
            <TableHead className="text-muted-foreground font-display tracking-wide text-xs text-right">W</TableHead>
            <TableHead className="text-muted-foreground font-display tracking-wide text-xs text-right">ECON</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {innings.bowling.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No bowling entries yet
              </TableCell>
            </TableRow>
          ) : (
            innings.bowling.map((entry, idx) => {
              const isCurrent = currentBowler === entry.bowlerName;
              const oversDisplay = getBowlerOversFromDeliveries(innings, entry.bowlerName);
              const economy = getEconomyFromDeliveries(innings, entry.bowlerName, entry.runsConceded);
              return (
                <TableRow
                  key={idx}
                  className={`border-stadium-dark-border ${isCurrent ? 'bg-cricket-gold/5' : ''}`}
                >
                  <TableCell className="font-medium">
                    <span className={isCurrent ? 'text-cricket-gold' : 'text-foreground'}>
                      {entry.bowlerName}
                      {isCurrent && <span className="text-cricket-gold ml-1 text-xs">▶</span>}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{oversDisplay}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{entry.maidens.toString()}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{entry.runsConceded.toString()}</TableCell>
                  <TableCell className="text-right font-display font-bold text-wicket-red">{entry.wickets.toString()}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{economy}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
