import { type Innings } from '../backend';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { getStrikeRate } from '../lib/cricket';

interface BattingScorecardProps {
  innings: Innings;
}

export default function BattingScorecard({ innings }: BattingScorecardProps) {
  const [wides, noBalls, byes, legByes] = innings.extras;
  const totalExtras = Number(wides) + Number(noBalls) + Number(byes) + Number(legByes);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-stadium-dark-border hover:bg-transparent">
            <TableHead className="text-muted-foreground font-display tracking-wide text-xs w-[180px]">BATSMAN</TableHead>
            <TableHead className="text-muted-foreground font-display tracking-wide text-xs">DISMISSAL</TableHead>
            <TableHead className="text-muted-foreground font-display tracking-wide text-xs text-right">R</TableHead>
            <TableHead className="text-muted-foreground font-display tracking-wide text-xs text-right">B</TableHead>
            <TableHead className="text-muted-foreground font-display tracking-wide text-xs text-right">4s</TableHead>
            <TableHead className="text-muted-foreground font-display tracking-wide text-xs text-right">6s</TableHead>
            <TableHead className="text-muted-foreground font-display tracking-wide text-xs text-right">SR</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {innings.batting.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                No batting entries yet
              </TableCell>
            </TableRow>
          ) : (
            innings.batting.map((entry, idx) => (
              <TableRow
                key={idx}
                className={`border-stadium-dark-border ${entry.notOut ? 'bg-cricket-green/5' : ''}`}
              >
                <TableCell className="font-medium">
                  <span className={entry.notOut ? 'text-cricket-green' : 'text-foreground'}>
                    {entry.batsmanName}
                    {entry.notOut && <span className="text-cricket-green ml-1">*</span>}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {entry.notOut ? (
                    <span className="text-cricket-green text-xs font-medium">not out</span>
                  ) : (
                    <span className="text-xs">{entry.dismissal || 'out'}</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-display font-bold text-foreground">
                  {entry.runs.toString()}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {entry.ballsFaced.toString()}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {entry.fours.toString()}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {entry.sixes.toString()}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {getStrikeRate(entry.runs, entry.ballsFaced)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        <TableFooter>
          <TableRow className="border-stadium-dark-border bg-stadium-dark-elevated/50">
            <TableCell colSpan={2} className="text-muted-foreground text-sm">
              Extras (W: {wides.toString()}, NB: {noBalls.toString()}, B: {byes.toString()}, LB: {legByes.toString()})
            </TableCell>
            <TableCell className="text-right font-display font-bold" colSpan={5}>
              {totalExtras}
            </TableCell>
          </TableRow>
          <TableRow className="border-stadium-dark-border bg-stadium-dark-elevated">
            <TableCell colSpan={2} className="font-display font-bold text-foreground">
              TOTAL
            </TableCell>
            <TableCell className="text-right font-display font-bold text-cricket-green text-lg" colSpan={5}>
              {innings.totalRuns.toString()}/{innings.wickets.toString()}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
