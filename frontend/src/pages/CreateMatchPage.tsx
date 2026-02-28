import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateMatch } from '../hooks/useQueries';
import { MatchFormat } from '../backend';
import { getFormatOvers } from '../lib/cricket';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, PlusCircle } from 'lucide-react';

export default function CreateMatchPage() {
  const navigate = useNavigate();
  const createMatch = useCreateMatch();

  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [title, setTitle] = useState('');
  const [format, setFormat] = useState<MatchFormat>(MatchFormat.t20);
  const [overs, setOvers] = useState<string>('20');

  const handleFormatChange = (value: string) => {
    const fmt = value as MatchFormat;
    setFormat(fmt);
    const defaultOvers = getFormatOvers(fmt);
    setOvers(defaultOvers !== null ? defaultOvers.toString() : '');
  };

  const isTestFormat = format === MatchFormat.test;
  const isValid = teamA.trim() && teamB.trim() && (isTestFormat || (overs && parseInt(overs) > 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const oversLimit = isTestFormat ? null : BigInt(parseInt(overs));
    const matchTitle = title.trim() || `${teamA.trim()} vs ${teamB.trim()}`;

    try {
      const matchId = await createMatch.mutateAsync({
        title: matchTitle,
        teamA: teamA.trim(),
        teamB: teamB.trim(),
        format,
        oversLimit,
      });
      navigate({ to: '/match/$id', params: { id: matchId.toString() } });
    } catch (e) {
      console.error('Failed to create match', e);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/' })}
        className="mb-6 text-muted-foreground hover:text-foreground -ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Matches
      </Button>

      <Card className="bg-stadium-dark-card border-stadium-dark-border">
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-2xl text-cricket-gold tracking-wide">
            CREATE NEW MATCH
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Format */}
            <div className="space-y-2">
              <Label className="text-muted-foreground font-display tracking-wide text-xs">
                MATCH FORMAT
              </Label>
              <Select value={format} onValueChange={handleFormatChange}>
                <SelectTrigger className="bg-stadium-dark-elevated border-stadium-dark-border h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-stadium-dark-card border-stadium-dark-border">
                  <SelectItem value={MatchFormat.t20}>
                    <span className="font-display font-semibold text-cricket-green">T20</span>
                    <span className="text-muted-foreground ml-2 text-sm">— 20 overs per side</span>
                  </SelectItem>
                  <SelectItem value={MatchFormat.odi}>
                    <span className="font-display font-semibold text-blue-400">ODI</span>
                    <span className="text-muted-foreground ml-2 text-sm">— 50 overs per side</span>
                  </SelectItem>
                  <SelectItem value={MatchFormat.test}>
                    <span className="font-display font-semibold text-cricket-gold">Test</span>
                    <span className="text-muted-foreground ml-2 text-sm">— Unlimited overs, 4 innings</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Overs */}
            <div className="space-y-2">
              <Label className="text-muted-foreground font-display tracking-wide text-xs">
                OVERS PER INNINGS
              </Label>
              <Input
                type="number"
                value={isTestFormat ? '' : overs}
                onChange={(e) => setOvers(e.target.value)}
                disabled={isTestFormat}
                placeholder={isTestFormat ? 'Unlimited (Test match)' : 'Number of overs'}
                min={1}
                max={999}
                className="bg-stadium-dark-elevated border-stadium-dark-border h-11 disabled:opacity-50"
              />
            </div>

            {/* Team A */}
            <div className="space-y-2">
              <Label className="text-muted-foreground font-display tracking-wide text-xs">
                TEAM 1 NAME *
              </Label>
              <Input
                value={teamA}
                onChange={(e) => setTeamA(e.target.value)}
                placeholder="e.g. Mumbai Indians"
                className="bg-stadium-dark-elevated border-stadium-dark-border h-11"
                required
              />
            </div>

            {/* Team B */}
            <div className="space-y-2">
              <Label className="text-muted-foreground font-display tracking-wide text-xs">
                TEAM 2 NAME *
              </Label>
              <Input
                value={teamB}
                onChange={(e) => setTeamB(e.target.value)}
                placeholder="e.g. Chennai Super Kings"
                className="bg-stadium-dark-elevated border-stadium-dark-border h-11"
                required
              />
            </div>

            {/* Title (optional) */}
            <div className="space-y-2">
              <Label className="text-muted-foreground font-display tracking-wide text-xs">
                MATCH TITLE (OPTIONAL)
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Final — Eden Gardens"
                className="bg-stadium-dark-elevated border-stadium-dark-border h-11"
              />
            </div>

            <Button
              type="submit"
              disabled={!isValid || createMatch.isPending}
              className="w-full h-12 bg-cricket-green hover:bg-cricket-green-light text-stadium-dark font-display font-bold tracking-widest text-base mt-2"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              {createMatch.isPending ? 'CREATING...' : 'CREATE MATCH'}
            </Button>

            {createMatch.isError && (
              <p className="text-wicket-red text-sm text-center">
                Failed to create match. Please try again.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
