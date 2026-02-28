import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DISMISSAL_TYPES = [
  'bowled',
  'caught',
  'lbw',
  'run out',
  'stumped',
  'hit wicket',
  'obstructing the field',
  'timed out',
  'handled the ball',
];

interface WicketDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (dismissal: string, nextBatsman: string) => void;
  battingTeam: string;
  existingBatsmen: string[];
  isLoading?: boolean;
}

export default function WicketDialog({
  open,
  onClose,
  onConfirm,
  battingTeam,
  existingBatsmen,
  isLoading = false,
}: WicketDialogProps) {
  const [dismissalType, setDismissalType] = useState('bowled');
  const [nextBatsman, setNextBatsman] = useState('');

  const handleConfirm = () => {
    if (!nextBatsman.trim()) return;
    onConfirm(dismissalType, nextBatsman.trim());
    setNextBatsman('');
    setDismissalType('bowled');
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-stadium-dark-card border-stadium-dark-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-wicket-red tracking-wide">
            🏏 WICKET!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-muted-foreground font-display tracking-wide text-xs">
              DISMISSAL TYPE
            </Label>
            <Select value={dismissalType} onValueChange={setDismissalType}>
              <SelectTrigger className="bg-stadium-dark-elevated border-stadium-dark-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-stadium-dark-card border-stadium-dark-border">
                {DISMISSAL_TYPES.map((type) => (
                  <SelectItem key={type} value={type} className="capitalize">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground font-display tracking-wide text-xs">
              NEXT BATSMAN ({battingTeam})
            </Label>
            <Input
              value={nextBatsman}
              onChange={(e) => setNextBatsman(e.target.value)}
              placeholder="Enter batsman name..."
              className="bg-stadium-dark-elevated border-stadium-dark-border"
              onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
            />
            {existingBatsmen.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {existingBatsmen.map((name) => (
                  <button
                    key={name}
                    onClick={() => setNextBatsman(name)}
                    className="text-xs px-2 py-0.5 rounded bg-stadium-dark-elevated border border-stadium-dark-border text-muted-foreground hover:text-foreground hover:border-cricket-green/40 transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="text-muted-foreground"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!nextBatsman.trim() || isLoading}
            className="bg-wicket-red hover:bg-wicket-red-light text-white font-display"
          >
            {isLoading ? 'Recording...' : 'Confirm Wicket'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
