import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Order "mo:core/Order";
import Int "mo:core/Int";

actor {
  // Types
  type MatchStatus = {
    #scheduled;
    #inProgress;
    #completed;
  };

  type MatchFormat = {
    #t20;
    #odi;
    #test;
  };

  type Delivery = {
    overNumber : Nat;
    ballNumber : Nat;
    runs : Nat;
    extras : Text;
    wicket : Bool;
    commentary : Text;
  };

  type BowlingEntry = {
    bowlerName : Text;
    overs : Nat;
    maidens : Nat;
    runsConceded : Nat;
    wickets : Nat;
  };

  type BattingEntry = {
    batsmanName : Text;
    runs : Nat;
    ballsFaced : Nat;
    fours : Nat;
    sixes : Nat;
    dismissal : Text;
    notOut : Bool;
  };

  type Innings = {
    id : Nat;
    matchId : Nat;
    inningsNumber : Nat;
    battingTeam : Text;
    bowlingTeam : Text;
    totalRuns : Nat;
    wickets : Nat;
    oversBowled : Nat;
    extras : (Nat, Nat, Nat, Nat);
    batting : [BattingEntry];
    bowling : [BowlingEntry];
    deliveries : [Delivery];
  };

  type Match = {
    id : Nat;
    title : Text;
    format : MatchFormat;
    teams : (Text, Text);
    oversLimit : ?Nat;
    status : MatchStatus;
    createdAt : Time.Time;
    innings : [Innings];
    result : ?Text;
  };

  // Persistent Storage
  var nextMatchId = 1;
  var nextInningsId = 1;

  let matches = Map.empty<Nat, Match>();

  // Compare Matches by createdAt (for sorting)
  module Match {
    public func compareByCreatedAt(a : Match, b : Match) : Order.Order {
      Int.compare(a.createdAt, b.createdAt);
    };
  };

  // Create Match
  public shared ({ caller }) func createMatch(title : Text, teamA : Text, teamB : Text, format : MatchFormat, oversLimit : ?Nat) : async Nat {
    let matchId = nextMatchId;
    nextMatchId += 1;

    let newMatch : Match = {
      id = matchId;
      title;
      format;
      teams = (teamA, teamB);
      oversLimit;
      status = #scheduled;
      createdAt = Time.now();
      innings = [];
      result = null;
    };

    matches.add(matchId, newMatch);
    matchId;
  };

  // List Matches (sorted by createdAt)
  public query ({ caller }) func listMatches() : async [Match] {
    matches.values().toArray().sort(Match.compareByCreatedAt);
  };

  // Get Match details
  public query ({ caller }) func getMatch(matchId : Nat) : async Match {
    switch (matches.get(matchId)) {
      case (?match) { match };
      case (null) { Runtime.trap("Match not found") };
    };
  };

  // Start Innings
  public shared ({ caller }) func startInnings(matchId : Nat, battingTeam : Text, bowlingTeam : Text) : async Nat {
    switch (matches.get(matchId)) {
      case (null) { Runtime.trap("Match not found") };
      case (?match) {
        let inningsId = nextInningsId;
        nextInningsId += 1;

        let newInnings : Innings = {
          id = inningsId;
          matchId;
          inningsNumber = match.innings.size() + 1;
          battingTeam;
          bowlingTeam;
          totalRuns = 0;
          wickets = 0;
          oversBowled = 0;
          extras = (0, 0, 0, 0);
          batting = [];
          bowling = [];
          deliveries = [];
        };

        let updatedInnings = match.innings.concat([newInnings]);
        let updatedMatch = {
          match with
          innings = updatedInnings;
          status = #inProgress;
        };
        matches.add(matchId, updatedMatch);
        inningsId;
      };
    };
  };

  // Add Batting Entry to an Innings
  public shared ({ caller }) func addBattingEntry(inningsId : Nat, batsmanName : Text) : async () {
    let matchEntry = matches.entries().find(
      func((_, match)) {
        match.innings.find(func(inn) { inn.id == inningsId }) != null;
      }
    );

    switch (matchEntry) {
      case (null) {
        Runtime.trap("Innings not found. ");
      };
      case (?(_, match)) {
        let newBattingEntry : BattingEntry = {
          batsmanName;
          runs = 0;
          ballsFaced = 0;
          fours = 0;
          sixes = 0;
          dismissal = "";
          notOut = true;
        };

        let updatedInnings = match.innings.map(
          func(inn) {
            if (inn.id == inningsId) {
              let updatedBatting = inn.batting.concat([newBattingEntry]);
              { inn with batting = updatedBatting };
            } else {
              inn;
            };
          }
        );

        let updatedMatch = { match with innings = updatedInnings };
        matches.add(match.id, updatedMatch);
      };
    };
  };

  // Add Bowling Entry to an Innings
  public shared ({ caller }) func addBowlingEntry(inningsId : Nat, bowlerName : Text) : async () {
    let matchEntry = matches.entries().find(
      func((_, match)) {
        match.innings.find(func(inn) { inn.id == inningsId }) != null;
      }
    );

    switch (matchEntry) {
      case (null) {
        Runtime.trap("Innings not found. ");
      };
      case (?(_, match)) {
        let newBowlingEntry : BowlingEntry = {
          bowlerName;
          overs = 0;
          maidens = 0;
          runsConceded = 0;
          wickets = 0;
        };

        let updatedInnings = match.innings.map(
          func(inn) {
            if (inn.id == inningsId) {
              let updatedBowling = inn.bowling.concat([newBowlingEntry]);
              { inn with bowling = updatedBowling };
            } else {
              inn;
            };
          }
        );

        let updatedMatch = { match with innings = updatedInnings };
        matches.add(match.id, updatedMatch);
      };
    };
  };

  // Add Delivery to an Innings
  public shared ({ caller }) func addDelivery(inningsId : Nat, overNumber : Nat, ballNumber : Nat, runs : Nat, extras : Text, wicket : Bool, commentary : Text) : async () {
    let matchEntry = matches.entries().find(
      func((_, match)) {
        match.innings.find(func(inn) { inn.id == inningsId }) != null;
      }
    );

    switch (matchEntry) {
      case (null) {
        Runtime.trap("Innings not found. ");
      };
      case (?(_, match)) {
        let newDelivery : Delivery = {
          overNumber;
          ballNumber;
          runs;
          extras;
          wicket;
          commentary;
        };

        let updatedInnings = match.innings.map(
          func(inn) {
            if (inn.id == inningsId) {
              let updatedDeliveries = inn.deliveries.concat([newDelivery]);
              { inn with deliveries = updatedDeliveries };
            } else {
              inn;
            };
          }
        );

        let updatedMatch = { match with innings = updatedInnings };
        matches.add(match.id, updatedMatch);
      };
    };
  };

  // Get Demo Match (Sample)
  public query ({ caller }) func getSampleDemoMatch() : async Match {
    {
      id = 0;
      title = "Sample Match (Demo)";
      format = #odi;
      teams = ("Core Knights", "Motoko Warriors");
      oversLimit = ?50;
      status = #completed;
      createdAt = Time.now();
      innings = [];
      result = ?"Motoko Warriors win by 5 wickets";
    };
  };
};
