import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetMatch, useStartInnings, useAddBattingEntry, useAddBowlingEntry, useAddDelivery } from '../hooks/useQueries';
import { MatchStatus, MatchFormat } from '../backend';
import {
  getCurrentInnings,
  isInningsComplete,
  canStartNextInnings,
  getNextBattingTeam,
  getNextBowlingTeam,
  getCurrentOverNumber,
  getCurrentBallInOver,
  getLegalBallCount,
  getFormatLabel,
} from '../lib/cricket';
import LiveScorePanel from '../components/LiveScorePanel';
import BattingScorecard from '../components/BattingScorecard';
import BowlingScorecard from '../components/BowlingScorecard';
import CommentaryLog from '../components/CommentaryLog';
import FallOfWickets from '../components/FallOfWickets';
import BallInputControls from '../components/BallInputControls';
import WicketDialog from '../components/WicketDialog';
import StartInningsDialog from '../components/StartInningsDialog';
import NewBowlerDialog from '../components/NewBowlerDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, RefreshCw, Trophy, Users } from 'lucide-react';

export default function MatchDetailPage() {
  const { id } = useParams({ from: '/match/$id' });
  const navigate = useNavigate();
  const matchId = BigInt(id);

  const { data: match, isLoading, refetch, isFetching } = useGetMatch(matchId);
  const startInnings = useStartInnings();
  const addBattingEntry = useAddBattingEntry();
  const addBowlingEntry = useAddBowlingEntry();
  const addDelivery = useAddDelivery();

  const [showStartInnings, setShowStartInnings] = useState(false);
  const [showWicketDialog, setShowWicketDialog] = useState(false);
  const [showNewBowler, setShowNewBowler] = useState(false);
  const [currentBowler, setCurrentBowler] = useState<string>('');
  const [striker, setStriker] = useState<string>('');
  const [nonStriker, setNonStriker] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const currentInnings = match ? getCurrentInnings(match) : null;
  const inningsComplete = match && currentInnings ? isInningsComplete(currentInnings, match) : false;
  const canStart = match ? canStartNextInnings(match) : false;

  // Auto-show start innings dialog for scheduled matches
  useEffect(() => {
    if (match && match.status === MatchStatus.scheduled && match.innings.length === 0) {
      setShowStartInnings(true);
    }
  }, [match?.status, match?.innings.length]);

  // Sync striker/non-striker from batting entries
  useEffect(() => {
    if (currentInnings && currentInnings.batting.length >= 2) {
      const notOut = currentInnings.batting.filter(b => b.notOut);
      if (notOut.length >= 1 && !striker) setStriker(notOut[0].batsmanName);
      if (notOut.length >= 2 && !nonStriker) setNonStriker(notOut[1].batsmanName);
    }
  }, [currentInnings?.batting.length]);

  // Sync current bowler from bowling entries
  useEffect(() => {
    if (currentInnings && currentInnings.bowling.length > 0 && !currentBowler) {
      setCurrentBowler(currentInnings.bowling[currentInnings.bowling.length - 1].bowlerName);
    }
  }, [currentInnings?.bowling.length]);

  const handleStartInnings = async (opener1: string, opener2: string, bowler: string) => {
    if (!match) return;
    setIsProcessing(true);
    try {
      const battingTeam = match.innings.length === 0 ? match.teams[0] : getNextBattingTeam(match);
      const bowlingTeam = match.innings.length === 0 ? match.teams[1] : getNextBowlingTeam(match);

      const inningsId = await startInnings.mutateAsync({
        matchId,
        battingTeam,
        bowlingTeam,
      });

      await addBattingEntry.mutateAsync({ inningsId, batsmanName: opener1, matchId });
      await addBattingEntry.mutateAsync({ inningsId, batsmanName: opener2, matchId });
      await addBowlingEntry.mutateAsync({ inningsId, bowlerName: bowler, matchId });

      setStriker(opener1);
      setNonStriker(opener2);
      setCurrentBowler(bowler);
      setShowStartInnings(false);
      await refetch();
    } catch (e) {
      console.error('Failed to start innings', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelivery = async (runs: number, extras: string, wicket: boolean, dismissal?: string) => {
    if (!currentInnings || !match) return;
    setIsProcessing(true);
    try {
      const legalBalls = getLegalBallCount(currentInnings.deliveries);
      const overNum = Math.floor(legalBalls / 6) + 1;
      const ballNum = (legalBalls % 6) + 1;
      const isLegal = extras !== 'wide' && extras !== 'no-ball';

      // Build commentary
      let commentary = '';
      if (wicket) {
        commentary = `${striker} ${dismissal || 'out'} b ${currentBowler}`;
      } else if (extras === 'wide') {
        commentary = `Wide ball by ${currentBowler}`;
      } else if (extras === 'no-ball') {
        commentary = `No ball by ${currentBowler}. ${runs > 0 ? `${runs} run${runs > 1 ? 's' : ''} off the bat.` : ''}`;
      } else if (runs === 4) {
        commentary = `FOUR! ${striker} drives through the covers off ${currentBowler}`;
      } else if (runs === 6) {
        commentary = `SIX! ${striker} launches ${currentBowler} over the boundary!`;
      } else if (runs === 0) {
        commentary = `Dot ball. ${currentBowler} to ${striker}.`;
      } else {
        commentary = `${runs} run${runs > 1 ? 's' : ''}. ${currentBowler} to ${striker}.`;
      }

      await addDelivery.mutateAsync({
        inningsId: currentInnings.id,
        overNumber: BigInt(overNum),
        ballNumber: BigInt(ballNum),
        runs: BigInt(runs),
        extras,
        wicket,
        commentary,
        matchId,
      });

      // Rotate strike on odd runs (legal deliveries only)
      if (isLegal && runs % 2 === 1) {
        const temp = striker;
        setStriker(nonStriker);
        setNonStriker(temp);
      }

      // End of over: rotate strike and prompt for new bowler
      if (isLegal) {
        const newLegalBalls = legalBalls + 1;
        if (newLegalBalls % 6 === 0) {
          // Rotate strike at end of over
          const temp = striker;
          setStriker(nonStriker);
          setNonStriker(temp);
          setShowNewBowler(true);
        }
      }

      await refetch();
    } catch (e) {
      console.error('Failed to add delivery', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWicket = async (dismissal: string, nextBatsman: string) => {
    if (!currentInnings || !match) return;
    setIsProcessing(true);
    try {
      const legalBalls = getLegalBallCount(currentInnings.deliveries);
      const overNum = Math.floor(legalBalls / 6) + 1;
      const ballNum = (legalBalls % 6) + 1;
      const commentary = `WICKET! ${striker} ${dismissal} b ${currentBowler}`;

      await addDelivery.mutateAsync({
        inningsId: currentInnings.id,
        overNumber: BigInt(overNum),
        ballNumber: BigInt(ballNum),
        runs: 0n,
        extras: '',
        wicket: true,
        commentary,
        matchId,
      });

      // Add next batsman
      await addBattingEntry.mutateAsync({
        inningsId: currentInnings.id,
        batsmanName: nextBatsman,
        matchId,
      });

      setStriker(nextBatsman);
      setShowWicketDialog(false);
      await refetch();
    } catch (e) {
      console.error('Failed to record wicket', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewBowler = async (bowlerName: string) => {
    if (!currentInnings || !match) return;
    setIsProcessing(true);
    try {
      // Check if bowler already exists
      const exists = currentInnings.bowling.some(b => b.bowlerName === bowlerName);
      if (!exists) {
        await addBowlingEntry.mutateAsync({
          inningsId: currentInnings.id,
          bowlerName,
          matchId,
        });
      }
      setCurrentBowler(bowlerName);
      setShowNewBowler(false);
      await refetch();
    } catch (e) {
      console.error('Failed to set new bowler', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNextInnings = () => {
    setStriker('');
    setNonStriker('');
    setCurrentBowler('');
    setShowStartInnings(true);
  };

  const handleConclude = () => {
    navigate({ to: '/match/$id/result', params: { id } });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-4">
        <Skeleton className="h-8 w-48 bg-stadium-dark-card" />
        <Skeleton className="h-48 bg-stadium-dark-card" />
        <Skeleton className="h-64 bg-stadium-dark-card" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Match not found</p>
        <Button onClick={() => navigate({ to: '/' })} className="mt-4">Back to Matches</Button>
      </div>
    );
  }

  const formatBadgeClass = () => {
    switch (match.format) {
      case MatchFormat.t20: return 'bg-cricket-green/20 text-cricket-green border-cricket-green/30';
      case MatchFormat.odi: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case MatchFormat.test: return 'bg-cricket-gold/20 text-cricket-gold border-cricket-gold/30';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/' })}
          className="text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Matches</span>
        </Button>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-display font-semibold px-2 py-0.5 rounded border ${formatBadgeClass()}`}>
            {getFormatLabel(match.format)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-8 w-8 text-muted-foreground"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Match title */}
      <div className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
          {match.teams[0]} <span className="text-muted-foreground text-xl">vs</span> {match.teams[1]}
        </h1>
        {match.title && (
          <p className="text-muted-foreground text-sm mt-1">{match.title}</p>
        )}
      </div>

      {/* Innings tabs for multi-innings */}
      {match.innings.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {match.innings.map((inn, idx) => (
            <span
              key={inn.id.toString()}
              className={`text-xs font-display px-3 py-1 rounded-full border whitespace-nowrap ${
                idx === match.innings.length - 1
                  ? 'bg-cricket-green/20 text-cricket-green border-cricket-green/30'
                  : 'bg-stadium-dark-elevated text-muted-foreground border-stadium-dark-border'
              }`}
            >
              {inn.battingTeam} — Inn {inn.inningsNumber.toString()} ({inn.totalRuns.toString()}/{inn.wickets.toString()})
            </span>
          ))}
        </div>
      )}

      {/* No innings started */}
      {match.innings.length === 0 && (
        <div className="text-center py-16 bg-stadium-dark-card rounded-lg border border-stadium-dark-border">
          <Users className="h-12 w-12 text-cricket-green/40 mx-auto mb-4" />
          <h3 className="font-display text-xl text-muted-foreground mb-4">MATCH NOT STARTED</h3>
          <Button
            onClick={() => setShowStartInnings(true)}
            className="bg-cricket-green hover:bg-cricket-green-light text-stadium-dark font-display font-bold"
          >
            Start First Innings
          </Button>
        </div>
      )}

      {/* Active innings */}
      {currentInnings && (
        <>
          {/* Live score panel */}
          <div className="mb-6">
            <LiveScorePanel innings={currentInnings} match={match} />
          </div>

          {/* Current players */}
          {!inningsComplete && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="bg-stadium-dark-card border border-cricket-green/20 rounded-lg p-3">
                <div className="text-xs text-muted-foreground font-display tracking-wide mb-1">STRIKER ⚡</div>
                <div className="font-display font-bold text-cricket-green">{striker || '—'}</div>
                {striker && currentInnings.batting.find(b => b.batsmanName === striker) && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {currentInnings.batting.find(b => b.batsmanName === striker)?.runs.toString()} ({currentInnings.batting.find(b => b.batsmanName === striker)?.ballsFaced.toString()})
                  </div>
                )}
              </div>
              <div className="bg-stadium-dark-card border border-stadium-dark-border rounded-lg p-3">
                <div className="text-xs text-muted-foreground font-display tracking-wide mb-1">NON-STRIKER</div>
                <div className="font-display font-semibold text-foreground">{nonStriker || '—'}</div>
                {nonStriker && currentInnings.batting.find(b => b.batsmanName === nonStriker) && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {currentInnings.batting.find(b => b.batsmanName === nonStriker)?.runs.toString()} ({currentInnings.batting.find(b => b.batsmanName === nonStriker)?.ballsFaced.toString()})
                  </div>
                )}
              </div>
              <div className="bg-stadium-dark-card border border-cricket-gold/20 rounded-lg p-3">
                <div className="text-xs text-muted-foreground font-display tracking-wide mb-1">BOWLER 🎯</div>
                <div className="font-display font-bold text-cricket-gold">{currentBowler || '—'}</div>
                {currentBowler && currentInnings.bowling.find(b => b.bowlerName === currentBowler) && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {currentInnings.bowling.find(b => b.bowlerName === currentBowler)?.wickets.toString()}w — {currentInnings.bowling.find(b => b.bowlerName === currentBowler)?.runsConceded.toString()}r
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ball input controls */}
          {!inningsComplete && match.status !== MatchStatus.completed && (
            <div className="bg-stadium-dark-card border border-stadium-dark-border rounded-lg p-4 mb-6">
              <div className="text-xs text-muted-foreground font-display tracking-widest mb-3">
                BALL INPUT — OVER {getCurrentOverNumber(currentInnings.deliveries)}.{getCurrentBallInOver(currentInnings.deliveries) - 1}
              </div>
              <BallInputControls
                onRuns={(runs) => handleDelivery(runs, '', false)}
                onWide={() => handleDelivery(1, 'wide', false)}
                onNoBall={() => handleDelivery(1, 'no-ball', false)}
                onWicket={() => setShowWicketDialog(true)}
                disabled={isProcessing || !striker || !currentBowler}
              />
            </div>
          )}

          {/* Innings complete banner */}
          {inningsComplete && match.status !== MatchStatus.completed && (
            <div className="bg-cricket-gold/10 border border-cricket-gold/30 rounded-lg p-5 mb-6 text-center">
              <Trophy className="h-8 w-8 text-cricket-gold mx-auto mb-2" />
              <h3 className="font-display text-xl font-bold text-cricket-gold mb-1">INNINGS COMPLETE</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {currentInnings.battingTeam} scored {currentInnings.totalRuns.toString()}/{currentInnings.wickets.toString()}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {canStart && (
                  <Button
                    onClick={handleNextInnings}
                    className="bg-cricket-green hover:bg-cricket-green-light text-stadium-dark font-display font-bold"
                  >
                    Start Next Innings
                  </Button>
                )}
                <Button
                  onClick={handleConclude}
                  variant="outline"
                  className="border-cricket-gold/40 text-cricket-gold hover:bg-cricket-gold/10 font-display"
                >
                  View Result
                </Button>
              </div>
            </div>
          )}

          {/* Scorecards tabs */}
          <Tabs defaultValue="batting" className="mt-2">
            <TabsList className="bg-stadium-dark-elevated border border-stadium-dark-border w-full grid grid-cols-4">
              <TabsTrigger value="batting" className="font-display text-xs tracking-wide data-[state=active]:bg-cricket-green/20 data-[state=active]:text-cricket-green">
                BATTING
              </TabsTrigger>
              <TabsTrigger value="bowling" className="font-display text-xs tracking-wide data-[state=active]:bg-cricket-gold/20 data-[state=active]:text-cricket-gold">
                BOWLING
              </TabsTrigger>
              <TabsTrigger value="commentary" className="font-display text-xs tracking-wide data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                COMMENTARY
              </TabsTrigger>
              <TabsTrigger value="fow" className="font-display text-xs tracking-wide data-[state=active]:bg-wicket-red/20 data-[state=active]:text-wicket-red">
                FOW
              </TabsTrigger>
            </TabsList>

            <TabsContent value="batting" className="mt-4">
              <BattingScorecard innings={currentInnings} />
            </TabsContent>

            <TabsContent value="bowling" className="mt-4">
              <BowlingScorecard innings={currentInnings} currentBowler={currentBowler} />
            </TabsContent>

            <TabsContent value="commentary" className="mt-4">
              <CommentaryLog innings={currentInnings} />
            </TabsContent>

            <TabsContent value="fow" className="mt-4">
              <FallOfWickets innings={currentInnings} />
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Dialogs */}
      {match && (
        <>
          <StartInningsDialog
            open={showStartInnings}
            onClose={() => setShowStartInnings(false)}
            onStart={handleStartInnings}
            battingTeam={match.innings.length === 0 ? match.teams[0] : getNextBattingTeam(match)}
            bowlingTeam={match.innings.length === 0 ? match.teams[1] : getNextBowlingTeam(match)}
            inningsNumber={match.innings.length + 1}
            isLoading={isProcessing}
          />

          {currentInnings && (
            <>
              <WicketDialog
                open={showWicketDialog}
                onClose={() => setShowWicketDialog(false)}
                onConfirm={handleWicket}
                battingTeam={currentInnings.battingTeam}
                existingBatsmen={currentInnings.batting.map(b => b.batsmanName)}
                isLoading={isProcessing}
              />

              <NewBowlerDialog
                open={showNewBowler}
                onClose={() => setShowNewBowler(false)}
                onConfirm={handleNewBowler}
                innings={currentInnings}
                isLoading={isProcessing}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
