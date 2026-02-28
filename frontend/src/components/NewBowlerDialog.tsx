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
import { type Innings } from '../backend';

interface NewBowlerDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (bowlerName: string) => void;
  innings: Innings;
  isLoading?: boolean;
}

export default function NewBowlerDialog({
  open,
  onClose,
  onConfirm,
  innings,
  isLoading = false,
}: NewBowlerDialogProps) {
  const [bowlerName, setBowlerName] = useState('');
  const existingBowlers = innings.bowling.map(b => b.bowlerName);

  const handleConfirm = () => {
    if (!bowlerName.trim()) return;
    onConfirm(bowlerName.trim());
    setBowlerName('');
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-stadium-dark-card border-stadium-dark-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-cricket-gold tracking-wide">
            NEW OVER — SELECT BOWLER
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-muted-foreground font-display tracking-wide text-xs">
              BOWLER NAME ({innings.bowlingTeam})
            </Label>
            <Input
              value={bowlerName}
              onChange={(e) => setBowlerName(e.target.value)}
              placeholder="Enter bowler name..."
              className="bg-stadium-dark-elevated border-stadium-dark-border"
              onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
              autoFocus
            />
            {existingBowlers.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {existingBowlers.map((name) => (
                  <button
                    key={name}
                    onClick={() => setBowlerName(name)}
                    className="text-xs px-2 py-0.5 rounded bg-stadium-dark-elevated border border-stadium-dark-border text-muted-foreground hover:text-foreground hover:border-cricket-gold/40 transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleConfirm}
            disabled={!bowlerName.trim() || isLoading}
            className="w-full bg-cricket-gold hover:bg-cricket-gold-light text-stadium-dark font-display font-bold tracking-wide"
          >
            {isLoading ? 'Setting...' : 'Start Over'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
