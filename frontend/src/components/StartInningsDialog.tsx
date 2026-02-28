import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StartInningsDialogProps {
  open: boolean;
  onClose: () => void;
  onStart: (opener1: string, opener2: string, bowler: string) => void;
  battingTeam: string;
  bowlingTeam: string;
  inningsNumber: number;
  isLoading?: boolean;
}

export default function StartInningsDialog({
  open,
  onClose,
  onStart,
  battingTeam,
  bowlingTeam,
  inningsNumber,
  isLoading = false,
}: StartInningsDialogProps) {
  const [opener1, setOpener1] = useState('');
  const [opener2, setOpener2] = useState('');
  const [bowler, setBowler] = useState('');

  const handleStart = () => {
    if (!opener1.trim() || !opener2.trim() || !bowler.trim()) return;
    onStart(opener1.trim(), opener2.trim(), bowler.trim());
    setOpener1('');
    setOpener2('');
    setBowler('');
  };

  const isValid = opener1.trim() && opener2.trim() && bowler.trim();

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-stadium-dark-card border-stadium-dark-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-cricket-gold tracking-wide">
            🏏 START INNINGS {inningsNumber}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {battingTeam} batting vs {bowlingTeam}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-muted-foreground font-display tracking-wide text-xs">
              OPENING BATSMAN 1 ({battingTeam})
            </Label>
            <Input
              value={opener1}
              onChange={(e) => setOpener1(e.target.value)}
              placeholder="Batsman name..."
              className="bg-stadium-dark-elevated border-stadium-dark-border"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground font-display tracking-wide text-xs">
              OPENING BATSMAN 2 ({battingTeam})
            </Label>
            <Input
              value={opener2}
              onChange={(e) => setOpener2(e.target.value)}
              placeholder="Batsman name..."
              className="bg-stadium-dark-elevated border-stadium-dark-border"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground font-display tracking-wide text-xs">
              OPENING BOWLER ({bowlingTeam})
            </Label>
            <Input
              value={bowler}
              onChange={(e) => setBowler(e.target.value)}
              placeholder="Bowler name..."
              className="bg-stadium-dark-elevated border-stadium-dark-border"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleStart}
            disabled={!isValid || isLoading}
            className="w-full bg-cricket-green hover:bg-cricket-green-light text-stadium-dark font-display font-bold tracking-wide"
          >
            {isLoading ? 'Starting...' : 'Start Innings'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
