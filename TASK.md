What You Already Have That's Perfect

  - Organization categories — football clubs are already identified by football-fans slug, so we can gate this feature to
  only those orgs
  - Group chat banners — the election/removal banner pattern (collapsible, pinned at top of chat) is exactly what we need
  for fixture prediction prompts
  - Membership tracking — ClassSetMember already tracks who's joined groups, so eligibility checks are straightforward
  - Organization follow system — already in place

  My Suggestions to Improve the Idea

  1. Points System — Make It More Strategic

  Rather than flat points, I'd suggest a risk/reward tier system:

  ┌─────────────────────────────────────────────────┬────────────┬───────────────────┐
  │                 Prediction Type                 │ Difficulty │ Points if Correct │
  ├─────────────────────────────────────────────────┼────────────┼───────────────────┤
  │ Double Chance (Home/Draw, Away/Draw, Home/Away) │ Easiest    │ 2 pts             │
  ├─────────────────────────────────────────────────┼────────────┼───────────────────┤
  │ Match Result (Win, Draw, Loss)                  │ Medium     │ 5 pts             │
  ├─────────────────────────────────────────────────┼────────────┼───────────────────┤
  │ Correct Score (e.g., 2-1)                       │ Hardest    │ 15 pts            │
  └─────────────────────────────────────────────────┴────────────┴───────────────────┘

  This makes it a real strategy game — do you play it safe with Double Chance for guaranteed small points, or go big with
  Correct Score?

  2. Prediction Locking

  Predictions should lock at kickoff time. Once the match starts, no more changes. This keeps it fair and adds urgency.

  3. Gameweeks (Optional but Nice)

  Group fixtures into gameweeks like real fantasy football. This gives a natural rhythm — "Gameweek 12 predictions are
  open!" — and allows for weekly mini-standings alongside the overall season table.

  4. Season Management

  Admin creates a Season (e.g., "2025/26 Premier League") with start/end dates. When it ends:
  - Top 4 are frozen and highlighted
  - Season gets archived
  - New season can start fresh

  Users could also view past season results for bragging rights.

  5. Result Entry by Admin

  After a match, a platform admin enters the actual result. The system auto-calculates points for everyone who predicted.
  This is simple and reliable vs trying to pull from external APIs.

  6. League Table Page

  A dedicated page at something like /organizations/chelsea-football-club/predictions with:
  - Season standings table — rank, user, points, predictions made, accuracy %
  - Top 4 visually highlighted (gold/silver/bronze/4th)
  - Current user's row always highlighted so they can find themselves
  - Maybe a "This Week" tab vs "Overall Season" tab

  7. Fixture Banner in Group Chat

  Reuse the election banner pattern — collapsible banner pinned at top of group chat:
  - Shows next upcoming fixture (opponent, date/time, competition)
  - Prediction buttons right there (Win/Draw/Loss or score inputs)
  - Once voted, shows "Your prediction: Chelsea Win ✓" and the banner becomes informational
  - Disappears after the match concludes (or shows result + whether they got points)

  8. Some Extra Ideas Worth Considering

  - Prediction streaks — bonus points for consecutive correct predictions (e.g., 3 in a row = +3 bonus)
  - Achievement badges — "Perfect Week", "Sharp Shooter" (5 correct scores), etc.
  - Prediction history — users can review their past predictions and see accuracy stats
  - Mini-leagues per group — each channel/group within the org could have its own sub-leaderboard, while still contributing
  to the main org league
