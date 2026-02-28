import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface BattingEntry {
    fours: bigint;
    notOut: boolean;
    runs: bigint;
    sixes: bigint;
    batsmanName: string;
    ballsFaced: bigint;
    dismissal: string;
}
export type Time = bigint;
export interface Delivery {
    ballNumber: bigint;
    wicket: boolean;
    runs: bigint;
    overNumber: bigint;
    extras: string;
    commentary: string;
}
export interface Innings {
    id: bigint;
    bowling: Array<BowlingEntry>;
    deliveries: Array<Delivery>;
    battingTeam: string;
    inningsNumber: bigint;
    totalRuns: bigint;
    bowlingTeam: string;
    oversBowled: bigint;
    matchId: bigint;
    wickets: bigint;
    extras: [bigint, bigint, bigint, bigint];
    batting: Array<BattingEntry>;
}
export interface BowlingEntry {
    maidens: bigint;
    overs: bigint;
    bowlerName: string;
    wickets: bigint;
    runsConceded: bigint;
}
export interface Match {
    id: bigint;
    status: MatchStatus;
    result?: string;
    teams: [string, string];
    title: string;
    createdAt: Time;
    innings: Array<Innings>;
    oversLimit?: bigint;
    format: MatchFormat;
}
export enum MatchFormat {
    odi = "odi",
    t20 = "t20",
    test = "test"
}
export enum MatchStatus {
    scheduled = "scheduled",
    completed = "completed",
    inProgress = "inProgress"
}
export interface backendInterface {
    addBattingEntry(inningsId: bigint, batsmanName: string): Promise<void>;
    addBowlingEntry(inningsId: bigint, bowlerName: string): Promise<void>;
    addDelivery(inningsId: bigint, overNumber: bigint, ballNumber: bigint, runs: bigint, extras: string, wicket: boolean, commentary: string): Promise<void>;
    createMatch(title: string, teamA: string, teamB: string, format: MatchFormat, oversLimit: bigint | null): Promise<bigint>;
    getMatch(matchId: bigint): Promise<Match>;
    getSampleDemoMatch(): Promise<Match>;
    listMatches(): Promise<Array<Match>>;
    startInnings(matchId: bigint, battingTeam: string, bowlingTeam: string): Promise<bigint>;
}
