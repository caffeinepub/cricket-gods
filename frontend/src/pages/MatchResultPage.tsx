import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetMatch } from '../hooks/useQueries';
import { MatchFormat } from '../backend';
import { getFormatLabel } from '../lib/cricket';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Trophy, Star, PlusCircle } from 'lucide-react';
import BattingScorecard from '../components/BattingScorecard';
import BowlingScorecard from '../components/BowlingScorecard';

export default function MatchResultPage() {
  const { id } = useParams({ from: '/match/$id/result' });
  const navigate = useNavigate();

  // Demo match has id=0 — don't try to fetch it from the backend
  const isDemoMatch = id === '0';
  const matchId = isDemoMatch ? null : BigInt(id);
  const { data: match, isLoading } = useGetMatch(matchId);

  if (isLoading && !isDemoMatch) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-4">
        <Skeleton className="h-8 w-48 bg-stadium-dark-card" />
        <Skeleton className="h-64 bg-stadium-dark-card" />
        <Skeleton className="h-48 bg-stadium-dark-card" />
      </div>
    );
  }

  // Demo match special view
  if (isDemoMatch) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/' })}
          className="mb-6 text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Matches
        </Button>

        <div className="text-center py-16 bg-stadium-dark-card rounded-xl border border-cricket-gold/30">
          <Trophy className="h-20 w-20 text-cricket-gold mx-auto mb-6 gold-glow" />
          <div className="inline-block mb-3">
            <span className="text-xs font-display font-semibold px-2 py-0.5 rounded border bg-blue-500/20 text-blue-400 border-blue-500/30">
              ODI
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2 tracking-wide">
            Core Knights <span className="text-muted-foreground text-2xl">vs</span> Motoko Warriors
          </h1>
          <p className="text-muted-foreground text-sm mb-4">Sample Match (Demo)</p>
          <p className="font-display text-2xl sm:text-3xl font-bold text-cricket-gold gold-glow mb-8">
            Motoko Warriors win by 5 wickets
          </p>

          <Card className="bg-stadium-dark-elevated border-cricket-gold/20 max-w-xs mx-auto mb-8">
            <CardContent className="p-4 flex items-center gap-4">
              <Star className="h-8 w-8 text-cricket-gold flex-shrink-0" />
              <div className="text-left">
                <div className="text-xs text-muted-foreground font-display tracking-wide mb-1">PLAYER OF THE MATCH</div>
                <div className="font-display text-lg font-bold text-cricket-gold">—</div>
                <div className="text-xs text-muted-foreground">To be announced</div>
              </div>
            </CardContent>
          </Card>

          <p className="text-muted-foreground text-sm mb-6">
            This is a sample demo match. Create a real match to start scoring!
          </p>
          <Button
            onClick={() => navigate({ to: '/match/new' })}
            className="bg-cricket-green hover:bg-cricket-green-light text-stadium-dark font-display font-bold tracking-wide"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Your Match
          </Button>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Match not found.</p>
        <Button onClick={() => navigate({ to: '/' })} className="mt-4">
          Back to Matches
        </Button>
      </div>
    );
  }

  const formatBadgeClass = () => {
    switch (match.format) {
      case MatchFormat.t20: return 'bg-cricket-green/20 text-cricket-green border-cricket-green/30';
      case MatchFormat.odi: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case MatchFormat.test: return 'bg-cricket-gold/20 text-cricket-gold border-cricket-gold/30';
      default: return '';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/' })}
        className="mb-6 text-muted-foreground hover:text-foreground -ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Matches
      </Button>

      {/* Result hero */}
      <div className="text-center py-10 bg-gradient-to-b from-cricket-gold/10 to-transparent rounded-xl border border-cricket-gold/30 mb-8">
        <Trophy className="h-16 w-16 text-cricket-gold mx-auto mb-4 gold-glow" />
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className={`text-xs font-display font-semibold px-2 py-0.5 rounded border ${formatBadgeClass()}`}>
            {getFormatLabel(match.format)}
          </span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
          {match.teams[0]} <span className="text-muted-foreground text-2xl">vs</span> {match.teams[1]}
        </h1>
        {match.title && (
          <p className="text-muted-foreground text-sm mb-4">{match.title}</p>
        )}
        {match.result ? (
          <p className="font-display text-2xl sm:text-3xl font-bold text-cricket-gold gold-glow mt-4">
            {match.result}
          </p>
        ) : (
          <p className="font-display text-xl text-muted-foreground mt-4">Match in progress</p>
        )}
      </div>

      {/* Innings score summary */}
      {match.innings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {match.innings.map((inn) => {
            const legalBalls = inn.deliveries.filter(
              (d) => d.extras !== 'wide' && d.extras !== 'no-ball'
            ).length;
            const oversDisplay = `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;
            return (
              <Card key={inn.id.toString()} className="bg-stadium-dark-card border-stadium-dark-border">
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground font-display tracking-wide mb-2">
                    INNINGS {inn.inningsNumber.toString()} — {inn.battingTeam.toUpperCase()}
                  </div>
                  <div className="font-display text-3xl font-bold text-foreground">
                    {inn.totalRuns.toString()}
                    <span className="text-xl text-muted-foreground">/{inn.wickets.toString()}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {oversDisplay} overs
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Player of the match placeholder */}
      <Card className="bg-stadium-dark-card border-cricket-gold/20 mb-8">
        <CardContent className="p-4 flex items-center gap-4">
          <Star className="h-8 w-8 text-cricket-gold flex-shrink-0" />
          <div>
            <div className="text-xs text-muted-foreground font-display tracking-wide mb-1">
              PLAYER OF THE MATCH
            </div>
            <div className="font-display text-lg font-bold text-cricket-gold">—</div>
            <div className="text-xs text-muted-foreground">To be announced</div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed scorecards per innings */}
      {match.innings.length > 0 && (
        <div className="space-y-8">
          {match.innings.map((inn) => (
            <div key={inn.id.toString()}>
              <h3 className="font-display text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <span className="text-cricket-gold">Inn {inn.inningsNumber.toString()}</span>
                <span className="text-muted-foreground">—</span>
                <span>{inn.battingTeam}</span>
                <span className="text-muted-foreground text-sm font-normal ml-auto">
                  {inn.totalRuns.toString()}/{inn.wickets.toString()}
                </span>
              </h3>
              <Tabs defaultValue="batting">
                <TabsList className="bg-stadium-dark-elevated border border-stadium-dark-border">
                  <TabsTrigger
                    value="batting"
                    className="font-display text-xs tracking-wide data-[state=active]:bg-cricket-green/20 data-[state=active]:text-cricket-green"
                  >
                    BATTING
                  </TabsTrigger>
                  <TabsTrigger
                    value="bowling"
                    className="font-display text-xs tracking-wide data-[state=active]:bg-cricket-gold/20 data-[state=active]:text-cricket-gold"
                  >
                    BOWLING
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="batting" className="mt-3">
                  <BattingScorecard innings={inn} />
                </TabsContent>
                <TabsContent value="bowling" className="mt-3">
                  <BowlingScorecard innings={inn} />
                </TabsContent>
              </Tabs>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 text-center">
        <Button
          onClick={() => navigate({ to: '/' })}
          className="bg-cricket-green hover:bg-cricket-green-light text-stadium-dark font-display font-bold tracking-wide px-8"
        >
          Back to All Matches
        </Button>
      </div>
    </div>
  );
}
