
TODO TASK #2

-------------------------------------------------------------------------------

CASE I (First Case)

Mr A is the husband to Mrs A, Mrs B, and Mrs C (literally Mr A has many wives). 
And Mr A has children (sons and daughters for each of all the wives). This family has connections in this app. Therefore, the tree should look this way.

--------------------------------------------------------------------------------------

CASE II (The Reverse Case)

Mrs A is the wife to Mr A, Mr B, and Mr C (literally Mrs A has many husbands). 
And Mrs A has children (sons and daughters for all the husbands). This family has connections in this app. Therefore, the tree should look this way.


-----------------------------------------------------------------------------------------------





TODO TASK #3

---------------------------------------------------------------------------------------------------

CASE I

When two cousins are connected with each other (a male cousin and a female cousin). Lets assume they are also both husband and wife too, that is married. They should show in the tree in two places, still connected as cousins and also still connected as husband and wife.



-----------------------------------------------------------------------------------------------

 Core Concept

  Think of it as "Fashion Prediction League" — same addictive loop, different content. The prediction league works because
  of: weekly cycles, competition, leaderboards, and social validation. We replicate that exact psychology.

  How It Would Work

  The Weekly Cycle:
  1. Monday — A new themed challenge is announced (auto or admin-created)
  2. Mon-Friday — Members submit their outfit photo entries
  3. Saturday-Sunday — Voting opens, members rate/vote on entries
  4. Sunday night — Results announced, points awarded, leaderboard updated

  This gives users a reason to open the app every single day of the week.

  Challenge Themes

  These rotate weekly — could be a predefined pool that cycles:
  - "Traditional Attire"
  - "All White"
  - "Corporate Chic"
  - "Ankara/African Print"
  - "Date Night Look"
  - "Vintage / Throwback"
  - "Color of the Week: Red"
  - "Street Style"
  - "Wedding Guest"
  - "Budget Slay (under X amount)"

  Group admins could also create custom themes relevant to their community.

  Where Does It Live?

  Two options worth considering:

  Option A — Inside existing groups (class sets)
  - Add a "Challenges" tab alongside chat
  - Same groups that have prediction league can also have fashion challenges
  - Less dev work, but mixes audiences (football fans + fashion fans in same group)

  Option B — Dedicated Fashion/Style groups
  - New group category: "Style Circle" or "Glam Squad"
  - Users create or join style-focused groups
  - Cleaner separation, but more infrastructure

  Option C — Hybrid
  - Any group can enable "Challenges" as a feature
  - The challenge type (fashion, cooking, fitness) is configurable
  - Most flexible, and future-proofs for other challenge types later

  Voting System

  This is where the engagement really happens:

  - Each member gets one vote per entry (like/star rating 1-5, or simple "fire" reaction)
  - You can't vote for yourself
  - You must submit an entry to vote — this forces participation
  - Voting could be anonymous to reduce bias
  - Optional: top 3 entries shown side-by-side for a final "head-to-head" vote

  Scoring & Leaderboard

  Reusing the prediction league pattern:
  - Entry submitted: +5 points (rewards participation)
  - Per vote received: +2 points
  - Top 3 finish: +15 / +10 / +5 bonus
  - Weekly winner: +25 points
  - Voting on others: +1 point per vote cast (rewards engagement)
  - Streak bonus: Submit entries for 4 consecutive weeks = bonus points

  Monthly leaderboard resets (or seasonal like the prediction league).

  Badges

  Similar to prediction league badges:
  - "Style Queen" — Won 3 challenges
  - "Consistent Slayer" — 8-week entry streak
  - "People's Choice" — Most votes in a single challenge
  - "Fashionista" — Top of monthly leaderboard
  - "Trendsetter" — First to submit entry 5 times
  - "Community Spirit" — Voted in 10+ challenges

  Feed Integration

  This is key for viral growth:
  - Challenge winners auto-posted to the main feed: "@username won the 'Ankara Challenge' in [Group Name]"
  - Users can share their entry to their personal feed
  - This makes non-members see the content and want to join groups


----------------------------------------------------------------------------

 This is shaping up really well. Let me crystallize the full concept based on your decisions.

  Glam Squad — Full Concept

  What it is: A platform-managed fashion challenge feature where users join a dedicated "Glam Squad" group, compete in
  weekly themed outfit challenges created by the platform admin, and climb seasonal leaderboards.

  User Flow

  Joining:
  - User discovers "Glam Squad" via feed promotions, sidebar widget, or a dedicated nav link
  - Clicks "Join Glam Squad" — they're in. No approval needed.
  - Once joined, they see the current challenge, past results, leaderboard, and their badges

  Weekly Participation:
  1. User sees the current challenge theme (e.g., "Ankara Week")
  2. Uploads their outfit photo with an optional caption
  3. When voting opens, rates other entries 1-5 stars
  4. Sees results when the challenge closes

  Admin Panel (Platform Admin)

  The admin manages everything from the existing admin dashboard:

  Season Management:
  - Create seasons (e.g., "Season 1 — Spring 2026")
  - Set season start/end dates
  - View season leaderboard and stats
  - Close/archive seasons

  Challenge Management:
  - Create weekly challenges within a season
  - Set: theme name, description, optional inspiration image
  - Set: submission deadline (e.g., Friday 11:59pm)
  - Set: voting deadline (e.g., Sunday 11:59pm)
  - Manually announce winners or let the system auto-calculate
  - View all entries for a challenge, moderate if needed

  Member Management:
  - View all Glam Squad members
  - Remove members if necessary
  - View individual member stats

  Scoring System

  Per challenge:
  - Entry submitted: +5 points
  - Average star rating bonus: (avg_rating x 3) points — so a 5-star average = +15
  - Top 3 finish: +25 / +15 / +10
  - Voting on others: +1 per vote cast (rewards engagement)
  - Must submit to vote — forces participation

  Seasonal:
  - Points accumulate across all challenges in a season
  - Streak bonuses: 4 consecutive entries = +20 bonus, 8 = +50

  Challenge Lifecycle States

  upcoming → submissions_open → voting_open → completed

  - Upcoming: Theme visible, countdown shown, no submissions yet
  - Submissions Open: Members upload entries (Mon-Fri)
  - Voting Open: No more submissions, voting begins (Sat-Sun)
  - Completed: Results locked, winners displayed, points awarded

  Badges

  Earned across seasons (permanent):
  - "First Slay" — Submitted first ever entry
  - "Style Queen" — Won 3 challenges
  - "Consistent Slayer" — 8-week entry streak
  - "People's Favourite" — Highest average rating in a single challenge
  - "Fashionista" — Finished top of a seasonal leaderboard
  - "Trendsetter" — First to submit 5 times
  - "Community Spirit" — Voted in 10+ challenges
  - "Perfect Score" — Received 5.0 average rating

  Pages Needed (Frontend)

  1. Glam Squad Landing (/glam-squad) — Overview, current challenge, join button
  2. Challenge Detail (/glam-squad/challenges/{id}) — Entries gallery, submit entry, vote
  3. Leaderboard (/glam-squad/leaderboard) — Current season standings
  4. My Profile/Stats — Within the page, user's entries, badges, rank
  5. Admin: Season Management — CRUD for seasons
  6. Admin: Challenge Management — CRUD for challenges within seasons
  7. Admin: Entries Moderation — View/remove inappropriate entries

---------------------------------------------------------------------------------------------------------

These are great refinements. Let me address your voting fairness question first — it's the most critical piece.

  Solving the Voting Fairness Problem

  You're right to flag this. If 200 people submit entries, some might get 80 votes while others get 5. Comparing averages
  wouldn't be fair.

  The solution: Random Voting Queue

  When a voter opens the voting page, they don't see a gallery of all entries. Instead, the system serves them entries one
  at a time (or in pairs) — randomly shuffled, prioritizing entries with fewer votes.

  Think of it like this:

  1. Voter opens the voting screen
  2. They see one entry (2 photos + caption)
  3. They rate it 1-5 stars
  4. Next entry loads — the system picks whoever has the fewest votes so far
  5. They keep going as long as they want — no obligation to vote on all

  This achieves:
  - Even vote distribution — the algorithm always pushes under-voted entries to the front
  - No scrolling past entries — every entry gets its moment
  - Addictive "swipe" feel — similar to browsing content on TikTok/Instagram
  - Fairness — when voting closes, most entries will have a similar vote count

  Winner Calculation:
  - Minimum vote threshold: an entry needs at least 10 votes to qualify for ranking
  - Score = weighted average — (average_stars × 0.7) + (total_votes_received / max_votes_any_entry × 0.3)
  - This means a 4.8 average with 40 votes beats a 5.0 average with 11 votes
  - System auto-calculates at voting deadline, no admin action needed

  Bi-Weekly Timeline

  Day 1-8:   Submissions Open (8 days to submit)
  Day 9-11:  Voting Open (3 days to vote)
  Day 12:    Results auto-calculated and announced
  Day 12-14: Cool-down / hype for next challenge
  Day 15:    Next challenge begins

  Group Structure (Squads)

  I love the multiple group idea. Here's how it would work:

  Three Squad types:
  - Female Glam Squad — Female members only, own leaderboard
  - Male Glam Squad — Male members only, own leaderboard
  - Mixed Glam Squad — All genders, combined leaderboard

  Auto-scaling:
  - Each squad has a member cap (e.g., 100 members)
  - When "Female Glam Squad 1" fills up, "Female Glam Squad 2" auto-creates
  - Users are shown available squads with open spots when joining
  - Each squad has its own group chat

  But challenges and leaderboards are shared across squads of the same type:
  - All Female Squad members (Squad 1, 2, 3...) compete on the same female leaderboard
  - All Male Squad members compete on the same male leaderboard
  - Mixed Squads have their own combined leaderboard
  - The challenge theme is the same for everyone

  So the hierarchy is:

  Glam Squad (Feature)
  ├── Female Track
  │   ├── Female Squad 1 (chat group, max 100)
  │   ├── Female Squad 2 (chat group, max 100)
  │   └── Shared Female Leaderboard
  ├── Male Track
  │   ├── Male Squad 1 (chat group, max 100)
  │   ├── Male Squad 2 (chat group, max 100)
  │   └── Shared Male Leaderboard
  └── Mixed Track
      ├── Mixed Squad 1 (chat group, max 100)
      └── Shared Mixed Leaderboard

  Voting Access

  - Anyone who follows Glam Squad can vote (male or female, member or not)
  - Only squad members can submit entries
  - Submitters for that challenge cannot vote — exactly as you said
  - This means the voting pool is much larger than the participant pool, which is great for fairness

  Feed Auto-Post (Bi-weekly)

  When results are calculated, the system auto-creates a feed post:

  "Glam Squad Bi-Weekly Winners — Ankara Challenge"

  [4 winner photos in a grid]
  1st: @username — 4.8 avg rating
  2nd: @username — 4.6 avg rating
  3rd: @username — 4.5 avg rating
  4th: @username — 4.4 avg rating

  [View Full Leaderboard →]

  Visible to everyone on the platform, not just members. This drives discovery and new sign-ups.

One Question

  Following vs Joining — You mentioned users "follow" the Glam Squad page to be able to vote. Should following be separate
  from joining a squad? Meaning:

  - Follow Glam Squad = Can vote, see results, see feed posts (casual engagement)
  - Join a Squad = Can submit entries, access squad group chat, appear on leaderboard (active participation)

  This two-tier system would maximize the voting pool while keeping squads focused. Does that feel right, or should it be
  simpler?


  ------------------------------------------------------------------------------------

 Complete Feature Spec Summary

  Glam Squad — a platform-managed bi-weekly fashion challenge with gendered leaderboards.

  ┌─────────────────┬─────────────────────────────────────────────────────────────────────────────────────────────┐
  │     Aspect      │                                           Detail                                            │
  ├─────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────┤
  │ Management      │ Platform admin creates seasons, challenges, and squads from admin panel                     │
  ├─────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────┤
  │ Bi-weekly cycle │ 8 days submissions, 3 days voting, auto-results on day 12, 2 days cool-down                 │
  ├─────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────┤
  │ Tracks          │ Female track (own leaderboard), Male track (own leaderboard)                                │
  ├─────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────┤
  │ Squads          │ Female Squad, Male Squad, Mixed Squad — each capped at 250 members, auto-scales             │
  ├─────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────┤
  │ Membership      │ One gendered squad + optionally one Mixed squad per user. Gender from profile.              │
  ├─────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────┤
  │ Mixed squads    │ Group chat/community only — no challenge submissions                                        │
  ├─────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────┤
  │ Entries         │ Max 2 photos + short caption                                                                │
  ├─────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────┤
  │ Voting          │ 1-5 star rating, random queue (fewest-votes-first), non-submitters only, followers can vote │
  ├─────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────┤
  │ Winner calc     │ Auto-calculated: weighted avg (70% star rating + 30% vote volume) with 10-vote minimum      │
  ├─────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────┤
  │ Leaderboard     │ Seasonal, points accumulate across challenges, streak bonuses                               │
  ├─────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────┤
  │ Feed            │ Top 4 winners auto-posted bi-weekly with link to full leaderboard                           │
  ├─────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────┤
  │ Badges          │ Earned across seasons, permanent                                                            │
  ├─────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────┤
  │ Visibility      │ Challenge results visible to everyone, group chat restricted to squad members               │
  └─────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────┘

  This is a solid feature. Shall I start planning the implementation — database schema, backend services, admin panel, and
  frontend pages?



The 5-vote minimum was part of the original plan to ensure fair rankings — the idea being:

  1. Prevents gaming — Without a minimum, someone could get 1 friend to give them 5 stars and instantly rank #1 over someone
   with 30 votes averaging 4.8
  2. Statistical fairness — A rating from 2 votes isn't meaningful compared to a rating from 50 votes. The minimum ensures
  rankings reflect actual consensus
  3. Weighted score formula — The scoring formula (avg_stars × 0.7) + (vote_count / max_votes × 0.3) × 5 already rewards
  more votes, but without a threshold, very low-vote entries can still rank unreasonably high


Badge bonus points are now awarded on first earn only (repeat earns just increment times_earned). The point values
  scaled to the existing system:

  ┌─────────────────┬────────┬─────────────────────────────┐
  │      Badge      │ Points │         Difficulty          │
  ├─────────────────┼────────┼─────────────────────────────┤
  │ Fashionista     │ 10     │ 5 entries in a season       │
  ├─────────────────┼────────┼─────────────────────────────┤
  │ Style Streak    │ 15     │ 5 consecutive entries       │
  ├─────────────────┼────────┼─────────────────────────────┤
  │ Critic Eye      │ 15     │ 100+ votes cast             │
  ├─────────────────┼────────┼─────────────────────────────┤
  │ Crowd Favorite  │ 20     │ 50+ votes on one entry      │
  ├─────────────────┼────────┼─────────────────────────────┤
  │ Rising Star     │ 20     │ Top 3 on first challenge    │
  ├─────────────────┼────────┼─────────────────────────────┤
  │ Top Model       │ 25     │ Win 1st place               │
  ├─────────────────┼────────┼─────────────────────────────┤
  │ Podium Regular  │ 30     │ Top 3 in 3 challenges       │
  ├─────────────────┼────────┼─────────────────────────────┤
  │ Season Champion │ 50     │ 1st on seasonal leaderboard │
  └─────────────────┴────────┴─────────────────────────────┘
