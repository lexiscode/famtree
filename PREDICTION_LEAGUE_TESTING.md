# Football Prediction League — UI Testing Workflow

Step-by-step guide to test every part of the Prediction League feature end-to-end.

---

## Prerequisites

- App running at `http://localhost`
- Migrations run: `docker-compose exec -T famtree php artisan migrate`
- Badges seeded: `docker-compose exec -T famtree php artisan db:seed --class=PredictionBadgeSeeder`
- At least one organization with category slug `football-fans` exists (e.g. Chelsea, Manchester United)
- At least one regular user account exists and is a member of a group (ClassSet) within that football organization
- Admin account exists for admin panel access

---

## Phase 1: Admin Panel — Season Management

### 1.1 Navigate to Predictions in Admin Panel

1. Log in as admin at `http://localhost/admin`
2. In the left sidebar, look for **"Predictions"** with a trophy icon
3. Click it — you should land on `http://localhost/admin/predictions`
4. **Expected:** Empty state page with stats cards (Total Seasons: 0, Active: 0, Total Fixtures: 0, Total Predictions: 0) and a "Create Season" button

### 1.2 Create a New Season

1. Click **"Create Season"** button
2. You should land on `http://localhost/admin/predictions/create`
3. **Expected:** Form with:
   - Organization dropdown (should **only** list football-fans category orgs)
   - Season Name field
   - Start Date & End Date fields
4. Fill in:
   - Organization: select a football org (e.g. "Chelsea Football Club")
   - Season Name: `2025/26 Season`
   - Start Date: today's date
   - End Date: a date 6 months from now
5. Click **"Create Season"**
6. **Expected:** Redirected back to Predictions index with success toast. New season appears in the table with status "upcoming"

### 1.3 View Season Detail

1. Click the season name or "View" button on the season row
2. You should land on `http://localhost/admin/predictions/seasons/{id}`
3. **Expected:** Season detail page with 5 tabs:
   - **Overview** — Stats cards (fixtures, predictions, participants, etc.)
   - **Gameweeks** — Empty with a "Create Gameweek" form
   - **Fixtures** — Empty with a "Create Fixture" form
   - **Standings** — Empty leaderboard
   - **Badges** — Empty badges table

### 1.4 Activate the Season

1. On the season detail page, click the **"Activate Season"** button
2. **Expected:** Season status changes to "active", success toast appears

---

## Phase 2: Admin Panel — Gameweeks & Fixtures

### 2.1 Create a Gameweek

1. On the season detail page, click the **"Gameweeks"** tab
2. Fill in the form:
   - Number: `1`
   - Label: `Opening Week` (optional)
   - Start Date: today
   - End Date: 7 days from now
3. Click **"Create Gameweek"**
4. **Expected:** Gameweek appears in the table below the form

### 2.2 Create Fixtures

1. Click the **"Fixtures"** tab
2. Fill in the form:
   - Opponent Name: `Arsenal`
   - Venue: `Home`
   - Competition: `Premier League`
   - Match Date: pick a future date/time (must be in the future for predictions to be open)
   - Gameweek: select "GW1 — Opening Week"
3. Click **"Create Fixture"**
4. **Expected:** Fixture appears in the fixtures table with status "upcoming"
5. **Repeat** to create 2-3 more fixtures with different opponents (e.g. `Liverpool` Away, `Tottenham` Home) — mix some with and without the gameweek assigned

### 2.3 Verify Fixtures Table

- **Expected:** Each fixture row shows: opponent, venue (Home/Away), competition, date, status badge ("upcoming"), and action buttons ("Enter Result", "Cancel")

---

## Phase 3: Guest User — Organization Profile CTA

### 3.1 Check Prediction League CTA on Org Profile

1. Log in as a regular user
2. Navigate to the football org profile: `http://localhost/organizations/{slug}` (e.g. `/organizations/chelsea-football-club`)
3. Scroll down past the gallery section
4. **Expected:** A purple gradient "Prediction League" CTA section with:
   - Trophy icon
   - "Predict match outcomes, earn points, and compete with fellow fans on the leaderboard."
   - "Enter Prediction League" button
5. Click the button
6. **Expected:** Navigated to `http://localhost/organizations/{slug}/predictions`

---

## Phase 4: Guest User — Prediction League Page

### 4.1 Page Layout (Eligible User)

1. Navigate to `http://localhost/organizations/{slug}/predictions`
2. **Expected:** Dark gradient background covering full viewport width with floating animated orbs
3. **Expected header:** Back arrow button, org logo, "Prediction League" title with gradient text, org name + season name subtitle
4. **Expected:** "Upcoming Fixtures" card showing the fixtures you created in admin
5. **Expected:** 4 tabs below: Standings | Gameweek | My Predictions | Badges

### 4.2 Page Layout (Non-Eligible User)

1. Log in as a user who is **NOT** a member of any group within this football org
2. Navigate to `http://localhost/organizations/{slug}/predictions`
3. **Expected:** Yellow/amber banner saying "Join a group to participate" with explanation text
4. **Expected:** No fixtures, tabs, or prediction forms shown

### 4.3 Page Layout (No Active Season)

1. If you deactivate/complete the season from admin, or test with an org that has no active season
2. **Expected:** Card with text "No prediction season available yet. Check back soon!"

---

## Phase 5: Guest User — Making Predictions

### 5.1 Match Result Prediction (5 points)

1. On the predictions page, find an upcoming fixture
2. The "Result (5pts)" bet type tab should be active by default
3. **Expected:** 3 option buttons: "Home Win", "Draw", "Away Win"
4. Click **"Home Win"**
5. **Expected:** Prediction submits immediately (button briefly shows selected state), page refreshes and shows a green confirmation: "Your prediction: Home Win (5pts)"
6. **Verify:** The fixture card now shows the confirmation instead of the prediction form

### 5.2 Double Chance Prediction (2 points)

1. Find another upcoming fixture (without a prediction)
2. Click the **"Double (2pts)"** bet type tab
3. **Expected:** 3 option buttons: "Home/Draw", "Away/Draw", "Home/Away"
4. Click **"Home/Draw"**
5. **Expected:** Submits immediately, green confirmation: "Your prediction: Home/Draw (2pts)"

### 5.3 Correct Score Prediction (15 points)

1. Find another upcoming fixture (without a prediction)
2. Click the **"Score (15pts)"** bet type tab
3. **Expected:** Two number inputs (H and A) and a "Submit" button
4. Enter `2` for Home and `1` for Away
5. Click **"Submit"**
6. **Expected:** Green confirmation: "Your prediction: 2-1 (15pts)"

### 5.4 Duplicate Prediction Prevention

1. Try to predict on a fixture that already has a prediction
2. **Expected:** The form is replaced by the confirmation display — no way to submit a duplicate

---

## Phase 6: Guest User — Tabs

### 6.1 Standings Tab

1. Click the **"Standings"** tab
2. **Expected:** League table card with header "League Table" (trophy icon)
3. If no one has scored yet, shows: "No standings yet. Make predictions to appear on the leaderboard!"
4. After results are entered (Phase 7), **Expected columns:** #, Player, Pts, Pred, Correct, Acc%, Streak
5. Your row should be highlighted with purple background and "(You)" label

### 6.2 Gameweek Tab

1. Click the **"Gameweek"** tab
2. **Expected:** "Gameweek Results" card with a dropdown selector
3. Select "GW1 — Opening Week"
4. **Expected:** Fixtures assigned to GW1 appear as cards. If completed, scores are shown. Your predictions and results (correct/incorrect) are displayed.
5. With no gameweek selected: "Select a gameweek to view fixtures and results"

### 6.3 My Predictions Tab

1. Click the **"My Predictions"** tab
2. **Expected:** If you have a standing — 4 stats cards at top: Match Results, Double Chance, Correct Scores, Best Streak (all showing 0 until results are in)
3. **Expected:** "All Predictions" card listing every fixture you predicted on, showing:
   - Opponent name, date, competition
   - Prediction type badge (purple), prediction value
   - After results: correct (+Xpts green) or incorrect (0pts red) badge

### 6.4 Badges Tab

1. Click the **"Badges"** tab
2. **Expected:** 4 badge cards in a grid:
   - **Perfect Week** (gold star) — "All predictions correct in a gameweek"
   - **Sharp Shooter** (red target) — "5 correct score predictions"
   - **On Fire** (orange flame) — "10 consecutive correct predictions"
   - **Iron Defense** (blue shield) — "10 correct clean sheet predictions"
3. All should appear grayed out (unearned) initially
4. Earned badges show full opacity with purple border and "Earned Xx" count

---

## Phase 7: Admin Panel — Entering Results (Scoring Engine)

### 7.1 Enter a Fixture Result

1. Go back to admin panel: `http://localhost/admin/predictions/seasons/{id}`
2. Click the **"Fixtures"** tab
3. Find a fixture that users have predicted on
4. Click **"Enter Result"** button on that fixture row
5. **Expected:** Modal appears with two number inputs (Home Score, Away Score)
6. Enter the actual score (e.g. Home: 2, Away: 1)
7. Click **"Submit Result"**
8. **Expected:**
   - Success toast: "Result entered and predictions scored"
   - Fixture status changes to "completed"
   - Score appears in the fixture row

### 7.2 Verify Scoring Worked

1. Click the **"Standings"** tab on the season detail page
2. **Expected:** Users who predicted on this fixture now appear in the standings with:
   - Correct predictions → points awarded (5 for match_result, 2 for double_chance, 15 for correct_score)
   - Total points, predictions made, correct count updated
3. **Verify streak:** If the prediction was correct, current_streak should be 1

### 7.3 Enter More Results

1. Enter results for the remaining fixtures
2. **Expected:** Standings update cumulatively — points add up, streaks increase for consecutive correct predictions
3. Check for streak bonuses: 3 consecutive → +3 bonus, 5 → +5, 10 → +10

### 7.4 Cancel a Fixture

1. Create a new test fixture from the Fixtures tab
2. Click **"Cancel"** on that fixture
3. **Expected:** Fixture status changes to "cancelled", no scoring occurs

---

## Phase 8: Guest User — Verify Results Display

### 8.1 Check Standings After Results

1. As a regular user, go to the predictions page
2. Click **"Standings"** tab
3. **Expected:** Leaderboard now shows players ranked by total points
4. Top 4 rows have subtle purple background
5. Rank 1 = gold, Rank 2 = silver, Rank 3 = bronze colors
6. Your row highlighted with "(You)" label
7. Streak column shows flame icon + number for players with active streaks

### 8.2 Check Gameweek Results

1. Click **"Gameweek"** tab, select the gameweek
2. **Expected:** Completed fixtures show the actual score (bold white)
3. Your prediction shows below each fixture with correct (green +Xpts) or incorrect (red 0pts) badge

### 8.3 Check My Predictions

1. Click **"My Predictions"** tab
2. **Expected:** Stats cards now show actual numbers (e.g. Match Results: 1, Best Streak: 2)
3. All Predictions list shows each fixture with result badges

---

## Phase 9: Group Chat — Prediction Banner

### 9.1 Open a Football Org Group Chat

1. Navigate to Messages: `http://localhost/messages`
2. Open a group chat that belongs to a ClassSet within a football organization
3. **Expected:** A prediction banner appears between the election banner area and the chat messages area (if open fixtures exist)

### 9.2 Banner Collapsed State

1. If the banner is collapsible, click the chevron to collapse
2. **Expected (collapsed):** Trophy emoji, "Predictions Open" text, count badge showing number of open fixtures, chevron toggle

### 9.3 Banner Expanded State

1. Expand the banner
2. **Expected:** Horizontally scrollable fixture cards showing:
   - Opponent name/logo
   - Match date
   - Quick predict buttons (H/D/A for match result)
   - Or confirmation if already predicted
   - Or result + points if completed

### 9.4 Inline Prediction from Banner

1. Find an unpredicted fixture in the banner
2. Click one of the quick predict buttons (H, D, or A)
3. **Expected:** Prediction submits, card updates to show confirmation
4. Navigate to the full predictions page and verify the prediction appears there too

### 9.5 "Full League" Link

1. In the banner header, click the **"Full League"** link
2. **Expected:** Navigates to `http://localhost/organizations/{slug}/predictions`

---

## Phase 10: Admin Panel — Season Lifecycle

### 10.1 Edit a Season

1. In admin panel, go to Predictions index
2. Click **"Edit"** on the season
3. Change the season name or dates
4. Click **"Update Season"**
5. **Expected:** Redirected back with success toast, changes reflected

### 10.2 Complete a Season

1. On the season detail page, click **"Complete Season"**
2. **Expected:** Season status changes to "completed", success toast
3. On the guest predictions page, the season should still be viewable but no new predictions can be made on upcoming fixtures (they should all be resolved)

### 10.3 Season Selector (Multiple Seasons)

1. Create a second season for the same org in admin
2. Activate it
3. On the guest predictions page, **Expected:** A season dropdown appears in the header
4. Switching seasons should reload the page with that season's data

---

## Phase 11: Edge Cases & Validation

### 11.1 Prediction Lock After Kickoff

1. In admin, create a fixture with a match date in the past
2. On the guest page, this fixture should NOT show prediction form
3. **Expected:** If the fixture `match_date` has passed, it's locked — no prediction buttons shown

### 11.2 Non-Football Org

1. Navigate to a non-football organization's profile (e.g. a university)
2. **Expected:** No "Prediction League" CTA section on the profile page
3. Manually visiting `/organizations/{non-football-slug}/predictions` should still work but show "no season" or "not eligible"

### 11.3 Unauthenticated Access

1. Log out
2. Try to visit `http://localhost/organizations/{slug}/predictions`
3. **Expected:** Redirected to login page (auth middleware)

### 11.4 Responsive Design

1. Open the predictions page on mobile viewport (< 768px)
2. **Expected:**
   - Header stacks vertically
   - Stats grid becomes 2 columns
   - Tabs remain horizontally scrollable
   - Fixture cards stack properly
   - Badge grid becomes single column
   - Bet type buttons wrap

---

## Phase 12: Badges (After Sufficient Data)

To test badges, you need enough prediction data. Here's how to trigger each:

| Badge | How to Trigger |
|-------|---------------|
| **Perfect Week** | Predict on ALL fixtures in a gameweek, and ALL must be correct after results entered |
| **Sharp Shooter** | Get 5+ correct score predictions right across the season |
| **On Fire** | Get 10+ consecutive correct predictions (any type) |
| **Iron Defense** | Predict 10+ clean sheets (0-0, 1-0, 0-1, 2-0, 0-2, etc.) correctly |

After triggering, check the **Badges** tab — the earned badge should show full color with "Earned 1x".

---

## Quick Checklist

- [ ] Admin: Predictions nav item visible in sidebar
- [ ] Admin: Create season (only football orgs in dropdown)
- [ ] Admin: Activate season
- [ ] Admin: Create gameweeks
- [ ] Admin: Create fixtures (with/without gameweek)
- [ ] Admin: Enter fixture results (modal with score inputs)
- [ ] Admin: Cancel fixture
- [ ] Admin: View standings after scoring
- [ ] Admin: Edit season
- [ ] Admin: Complete season
- [ ] Guest: Prediction League CTA on football org profile
- [ ] Guest: Predictions page — dark theme, full-width background, animated orbs
- [ ] Guest: Not-eligible banner for non-members
- [ ] Guest: No-season empty state
- [ ] Guest: Make match result prediction (immediate submit on click)
- [ ] Guest: Make double chance prediction (immediate submit on click)
- [ ] Guest: Make correct score prediction (number inputs + submit button)
- [ ] Guest: Standings tab — leaderboard with rank colors, streaks
- [ ] Guest: Gameweek tab — fixture results with prediction outcomes
- [ ] Guest: My Predictions tab — accuracy stats + prediction history
- [ ] Guest: Badges tab — earned/unearned display
- [ ] Guest: Season selector dropdown (when multiple seasons)
- [ ] Chat: Prediction banner appears in football org group chats
- [ ] Chat: Inline quick predictions from banner
- [ ] Chat: Full League link navigation
- [ ] Scoring: Points calculated correctly (5/2/15)
- [ ] Scoring: Streaks increment on consecutive correct
- [ ] Scoring: Standings update after result entry
- [ ] Responsive: Mobile layout works correctly
