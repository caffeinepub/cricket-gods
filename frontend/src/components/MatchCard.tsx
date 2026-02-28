import { useNavigate } from '@tanstack/react-router';
import { type Match, MatchFormat, MatchStatus } from '../backend';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getFormatLabel, getStatusLabel, getCurrentInnings } from '../lib/cricket';
import { Calendar, Circle } from 'lucide-react';

interface MatchCardProps {
  match: Match;
}

export default function MatchCard({ match }: MatchCardProps) {
  const navigate = useNavigate();
  const currentInnings = getCurrentInnings(match);

  const formatBadgeClass = () => {
    switch (match.format) {
      case MatchFormat.t20: return 'bg-cricket-green/20 text-cricket-green border-cricket-green/30';
      case MatchFormat.odi: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case MatchFormat.test: return 'bg-cricket-gold/20 text-cricket-gold border-cricket-gold/30';
      default: return '';
    }
  };

  const statusBadgeClass = () => {
    switch (match.status) {
      case MatchStatus.inProgress: return 'bg-cricket-green/20 text-cricket-green border-cricket-green/30';
      case MatchStatus.completed: return 'bg-muted text-muted-foreground border-border';
      case MatchStatus.scheduled: return 'bg-cricket-gold/20 text-cricket-gold border-cricket-gold/30';
      default: return '';
    }
  };

  const handleClick = () => {
    if (match.status === MatchStatus.completed) {
      navigate({ to: '/match/$id/result', params: { id: match.id.toString() } });
    } else {
      navigate({ to: '/match/$id', params: { id: match.id.toString() } });
    }
  };

  return (
    <Card
      className="bg-stadium-dark-card border-stadium-dark-border hover:border-cricket-green/40 transition-all duration-200 cursor-pointer hover:shadow-cricket group"
      onClick={handleClick}
    >
      <CardContent className="p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-display font-semibold px-2 py-0.5 rounded border ${formatBadgeClass()}`}>
              {getFormatLabel(match.format)}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded border flex items-center gap-1 ${statusBadgeClass()}`}>
              {match.status === MatchStatus.inProgress && (
                <Circle className="h-2 w-2 fill-current animate-pulse-green" />
              )}
              {getStatusLabel(match.status)}
            </span>
          </div>
          {match.oversLimit && (
            <span className="text-xs text-muted-foreground">{match.oversLimit.toString()} overs</span>
          )}
        </div>

        {/* Teams */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="font-display font-semibold text-lg text-foreground group-hover:text-cricket-green transition-colors">
              {match.teams[0]}
            </span>
            {currentInnings && currentInnings.battingTeam === match.teams[0] && (
              <div className="text-right">
                <span className="font-display text-xl font-bold text-cricket-green">
                  {currentInnings.totalRuns.toString()}/{currentInnings.wickets.toString()}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="font-display font-semibold text-lg text-foreground group-hover:text-cricket-green transition-colors">
              {match.teams[1]}
            </span>
            {currentInnings && currentInnings.battingTeam === match.teams[1] && (
              <div className="text-right">
                <span className="font-display text-xl font-bold text-cricket-green">
                  {currentInnings.totalRuns.toString()}/{currentInnings.wickets.toString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Result or title */}
        {match.result && (
          <div className="text-sm text-cricket-gold font-medium border-t border-stadium-dark-border pt-3">
            {match.result}
          </div>
        )}
        {!match.result && match.title && (
          <div className="text-xs text-muted-foreground border-t border-stadium-dark-border pt-3 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {match.title}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
