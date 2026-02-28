# Specification

## Summary
**Goal:** Build "Cricket Gods," a full-featured cricket scoreboard application with a Motoko backend and a vibrant cricket-themed frontend, supporting match creation, live ball-by-ball scoring, and detailed scorecards for T20, ODI, and Test formats.

**Planned changes:**

**Backend (single Motoko actor):**
- Data model with stable variables for matches, innings, batting entries, bowling entries, ball-by-ball deliveries, fall of wickets, and match results
- Functions: `createMatch`, `listMatches`, `getMatch`, `startInnings`, `addDelivery`, `addBatsman`, `addBowler`, `switchInnings`, `concludeMatch`, `getSampleDemoMatch`
- Auto-increment match IDs; support up to 4 innings (Test format); auto-calculate match result on conclusion

**Frontend:**
- Home screen listing all matches as cards (format badge, teams, status, score summary) with "New Match" and "Load Demo Match" buttons
- Match creation form with team names, format selector (T20/ODI/Test), auto-filled overs limit, and optional title
- Live scoring interface with prominent scoreboard (runs/wickets/overs/run rate), striker/non-striker stats, current bowler stats, and ball input buttons (0–6, Wide, No Ball, Wicket); wicket flow prompts dismissal type and next batsman selection
- Scoreboard panel showing target, runs needed, and required run rate when chasing
- Batting scorecard tab (name, dismissal, runs, balls, 4s, 6s, strike rate; not-out highlighted)
- Bowling scorecard tab (name, overs, maidens, runs, wickets, economy)
- Ball-by-ball commentary log grouped by over with collapsible headers; wickets highlighted
- Fall of wickets tracker (wicket number, score, over, batsman)
- Match result screen (winner, margin, draw/tie support, "Back to Matches" button)
- Dark stadium-inspired design with green and gold accents, responsive from 375px width, tab-based navigation within a match view

**User-visible outcome:** Users can create cricket matches (T20, ODI, Test), score them ball-by-ball, view live batting and bowling scorecards, track fall of wickets and commentary, and see a final result screen — all persisted on-chain via the Motoko backend.
