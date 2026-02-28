import { Button } from '@/components/ui/button';

interface BallInputControlsProps {
  onRuns: (runs: number) => void;
  onWide: () => void;
  onNoBall: () => void;
  onWicket: () => void;
  disabled?: boolean;
}

export default function BallInputControls({
  onRuns,
  onWide,
  onNoBall,
  onWicket,
  disabled = false,
}: BallInputControlsProps) {
  const runButtons = [0, 1, 2, 3, 4, 6];

  return (
    <div className="space-y-3">
      {/* Run buttons */}
      <div className="grid grid-cols-6 gap-2">
        {runButtons.map((run) => (
          <Button
            key={run}
            onClick={() => onRuns(run)}
            disabled={disabled}
            className={`
              h-14 text-xl font-display font-bold border-0
              ${run === 0 ? 'bg-stadium-dark-elevated hover:bg-muted text-muted-foreground' : ''}
              ${run === 1 || run === 2 || run === 3 ? 'bg-cricket-green/20 hover:bg-cricket-green/30 text-cricket-green' : ''}
              ${run === 4 ? 'bg-cricket-green/40 hover:bg-cricket-green/50 text-cricket-green-light' : ''}
              ${run === 6 ? 'bg-cricket-gold/30 hover:bg-cricket-gold/40 text-cricket-gold' : ''}
            `}
          >
            {run}
          </Button>
        ))}
      </div>

      {/* Extras and wicket */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          onClick={onWide}
          disabled={disabled}
          className="h-12 font-display font-semibold tracking-wide bg-cricket-gold/20 hover:bg-cricket-gold/30 text-cricket-gold border border-cricket-gold/30"
          variant="outline"
        >
          WIDE
        </Button>
        <Button
          onClick={onNoBall}
          disabled={disabled}
          className="h-12 font-display font-semibold tracking-wide bg-cricket-gold/20 hover:bg-cricket-gold/30 text-cricket-gold border border-cricket-gold/30"
          variant="outline"
        >
          NO BALL
        </Button>
        <Button
          onClick={onWicket}
          disabled={disabled}
          className="h-12 font-display font-semibold tracking-wide bg-wicket-red/20 hover:bg-wicket-red/30 text-wicket-red border border-wicket-red/30"
          variant="outline"
        >
          WICKET
        </Button>
      </div>
    </div>
  );
}
