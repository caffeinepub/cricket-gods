import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { MatchFormat, type Match } from '../backend';

// List all matches
export function useListMatches() {
  const { actor, isFetching } = useActor();
  return useQuery<Match[]>({
    queryKey: ['matches'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMatches();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

// Get a single match
export function useGetMatch(matchId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Match>({
    queryKey: ['match', matchId?.toString()],
    queryFn: async () => {
      if (!actor || matchId === null) throw new Error('No actor or matchId');
      return actor.getMatch(matchId);
    },
    enabled: !!actor && !isFetching && matchId !== null,
    refetchInterval: 5000,
  });
}

// Get demo match
export function useGetDemoMatch() {
  const { actor, isFetching } = useActor();
  return useQuery<Match>({
    queryKey: ['demoMatch'],
    queryFn: async () => {
      if (!actor) throw new Error('No actor');
      return actor.getSampleDemoMatch();
    },
    enabled: !!actor && !isFetching,
  });
}

// Create match mutation
export function useCreateMatch() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      title: string;
      teamA: string;
      teamB: string;
      format: MatchFormat;
      oversLimit: bigint | null;
    }) => {
      if (!actor) throw new Error('No actor');
      return actor.createMatch(params.title, params.teamA, params.teamB, params.format, params.oversLimit);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

// Start innings mutation
export function useStartInnings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      matchId: bigint;
      battingTeam: string;
      bowlingTeam: string;
    }) => {
      if (!actor) throw new Error('No actor');
      return actor.startInnings(params.matchId, params.battingTeam, params.bowlingTeam);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['match', vars.matchId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

// Add batting entry mutation
export function useAddBattingEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      inningsId: bigint;
      batsmanName: string;
      matchId: bigint;
    }) => {
      if (!actor) throw new Error('No actor');
      return actor.addBattingEntry(params.inningsId, params.batsmanName);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['match', vars.matchId.toString()] });
    },
  });
}

// Add bowling entry mutation
export function useAddBowlingEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      inningsId: bigint;
      bowlerName: string;
      matchId: bigint;
    }) => {
      if (!actor) throw new Error('No actor');
      return actor.addBowlingEntry(params.inningsId, params.bowlerName);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['match', vars.matchId.toString()] });
    },
  });
}

// Add delivery mutation
export function useAddDelivery() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      inningsId: bigint;
      overNumber: bigint;
      ballNumber: bigint;
      runs: bigint;
      extras: string;
      wicket: boolean;
      commentary: string;
      matchId: bigint;
    }) => {
      if (!actor) throw new Error('No actor');
      return actor.addDelivery(
        params.inningsId,
        params.overNumber,
        params.ballNumber,
        params.runs,
        params.extras,
        params.wicket,
        params.commentary
      );
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['match', vars.matchId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}
