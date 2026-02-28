import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useListMatches } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import MatchCard from '../components/MatchCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Zap, Trophy, RefreshCw } from 'lucide-react';
import { MatchStatus } from '../backend';

export default function MatchListPage() {
  const navigate = useNavigate();
  const { data: matches, isLoading, refetch, isFetching } = useListMatches();
  const { actor } = useActor();
  const [loadingDemo, setLoadingDemo] = useState(false);

  const handleLoadDemo = async () => {
    if (!actor) return;
    setLoadingDemo(true);
    try {
      const demo = await actor.getSampleDemoMatch();
      // Demo match has id=0, navigate to result since it's completed
      navigate({ to: '/match/$id/result', params: { id: demo.id.toString() } });
    } catch (e) {
      console.error('Failed to load demo match', e);
    } finally {
      setLoadingDemo(false);
    }
  };

  const liveMatches = matches?.filter(m => m.status === MatchStatus.inProgress) ?? [];
  const scheduledMatches = matches?.filter(m => m.status === MatchStatus.scheduled) ?? [];
  const completedMatches = matches?.filter(m => m.status === MatchStatus.completed) ?? [];

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative overflow-hidden">
        <img
          src="/assets/generated/cricket-banner.dim_1200x300.png"
          alt="Cricket Gods"
          className="w-full h-48 sm:h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-4xl sm:text-6xl font-bold text-cricket-gold gold-glow tracking-widest drop-shadow-2xl">
              CRICKET GODS
            </h1>
            <p className="text-foreground/80 mt-2 text-sm sm:text-base font-body">
              Live Scoring · Scorecards · Commentary
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Button
            onClick={() => navigate({ to: '/match/new' })}
            className="flex-1 sm:flex-none h-12 bg-cricket-green hover:bg-cricket-green-light text-stadium-dark font-display font-bold tracking-wide text-base"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            NEW MATCH
          </Button>
          <Button
            onClick={handleLoadDemo}
            disabled={loadingDemo || !actor}
            variant="outline"
            className="flex-1 sm:flex-none h-12 border-cricket-gold/40 text-cricket-gold hover:bg-cricket-gold/10 font-display font-semibold tracking-wide"
          >
            <Zap className="h-5 w-5 mr-2" />
            {loadingDemo ? 'LOADING...' : 'DEMO MATCH'}
          </Button>
          <Button
            onClick={() => refetch()}
            disabled={isFetching}
            variant="ghost"
            size="icon"
            className="h-12 w-12 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-48 bg-stadium-dark-card" />
            ))}
          </div>
        ) : (
          <>
            {/* Live matches */}
            {liveMatches.length > 0 && (
              <section className="mb-8">
                <h2 className="font-display text-lg font-bold text-cricket-green tracking-widest mb-4 flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-cricket-green animate-pulse-green" />
                  LIVE NOW
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {liveMatches.map(match => (
                    <MatchCard key={match.id.toString()} match={match} />
                  ))}
                </div>
              </section>
            )}

            {/* Scheduled matches */}
            {scheduledMatches.length > 0 && (
              <section className="mb-8">
                <h2 className="font-display text-lg font-bold text-cricket-gold tracking-widest mb-4">
                  UPCOMING
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scheduledMatches.map(match => (
                    <MatchCard key={match.id.toString()} match={match} />
                  ))}
                </div>
              </section>
            )}

            {/* Completed matches */}
            {completedMatches.length > 0 && (
              <section className="mb-8">
                <h2 className="font-display text-lg font-bold text-muted-foreground tracking-widest mb-4">
                  COMPLETED
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedMatches.map(match => (
                    <MatchCard key={match.id.toString()} match={match} />
                  ))}
                </div>
              </section>
            )}

            {/* Empty state */}
            {(!matches || matches.length === 0) && (
              <div className="text-center py-20">
                <Trophy className="h-16 w-16 text-cricket-gold/30 mx-auto mb-4" />
                <h3 className="font-display text-2xl font-bold text-muted-foreground mb-2">
                  NO MATCHES YET
                </h3>
                <p className="text-muted-foreground mb-6">
                  Create your first match or load a demo to get started
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => navigate({ to: '/match/new' })}
                    className="bg-cricket-green hover:bg-cricket-green-light text-stadium-dark font-display font-bold"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Match
                  </Button>
                  <Button
                    onClick={handleLoadDemo}
                    disabled={loadingDemo || !actor}
                    variant="outline"
                    className="border-cricket-gold/40 text-cricket-gold hover:bg-cricket-gold/10 font-display"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Load Demo
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
