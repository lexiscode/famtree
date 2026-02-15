# Glam Squad — UI Testing Guide

Step-by-step workflow to test every feature of the Glam Squad implementation.

---

## Prerequisites

1. App running at `http://localhost`
2. Admin account with access to `http://localhost/admin`
3. At least 3 regular user accounts (with `gender` field set — e.g. "female" or "male")
4. Vite dev server running (`docker-compose exec -T famtree npm run dev`)

---

## Part 1: Admin — Season & Challenge Management

### 1.1 Navigate to Glam Squad Admin

1. Log in as admin at `http://localhost/admin`
2. Look for **"Glam Squad"** in the left sidebar (with sparkle icon)
3. Click it — you should land on the **Glam Squad Index** page
4. Verify: 6 stat cards showing (Seasons, Challenges, Entries, Votes, Squads, Members) — all at 0

### 1.2 Create a Season

1. Click **"Create Season"** button
2. Fill in:
   - **Name**: "Season 1 — Spring 2026"
   - **Start Date**: today's date
   - **End Date**: a date 3 months from now
3. Click **"Create Season"**
4. Verify: redirected back to Index, season appears in the table with status "upcoming"
5. Verify: Seasons stat card now shows 1

### 1.3 Activate the Season

1. Click on the season name to open the **Show** page
2. In the Overview tab, click **"Activate Season"** button
3. Verify: season status changes to "active"
4. Verify: success flash message appears

### 1.4 Create a Challenge

1. On the Season Show page, click the **"Challenges"** tab
2. Fill in the "Create Challenge" form:
   - **Title**: "Summer Vibes"
   - **Description**: "Show us your best summer outfit!"
   - **Theme**: "Casual Summer"
   - **Submissions Open**: now (current date/time)
   - **Submissions Close**: 2 days from now
   - **Voting Open**: 2 days from now
   - **Voting Close**: 5 days from now
   - **Results Date**: 5 days from now
3. Click **"Create Challenge"**
4. Verify: challenge appears in the list with status "upcoming"
5. Verify: Challenges stat card increments

### 1.5 Transition Challenge to Submissions Open

1. On the challenge row, click **"Transition"** button (or use the transition action)
2. Select transition to **"submissions_open"**
3. Verify: challenge status badge updates to green "submissions open"

### 1.6 View Squads (Admin)

1. Click **"Squads"** in the admin sidebar or use the Squads tab
2. Verify: page loads with empty squad list (no squads created yet)
3. Verify: gender track filter buttons work (Female / Male / Mixed / All)

---

## Part 2: Guest — Joining Squads

### 2.1 Access Glam Squad Page

1. Log in as a regular user (User A — female)
2. Navigate to `http://localhost/glam-squad`
3. Verify: page loads with dark premium theme
4. Verify: header shows "Glam Squad" with sparkle icon
5. Verify: current challenge banner appears showing "Summer Vibes" with "submissions open" status
6. Verify: challenge timeline shows Submissions step as active
7. Verify: countdown timer appears showing time until submissions close

### 2.2 Follow Glam Squad

1. Click the **"Follow"** button (pink, with heart icon) in the header
2. Verify: button changes to **"Unfollow"** (outline style with heart-off icon)
3. Verify: success flash message "Now following Glam Squad!"
4. Click **"Unfollow"** to toggle back
5. Verify: button returns to "Follow" state
6. Click **"Follow"** again to stay followed

### 2.3 Join a Gendered Squad

1. Click the **"My Squad"** tab
2. Verify: "Join a Squad" card appears with "Submit entries & compete" subtitle
3. Click **"Join"** button on the gendered squad card
4. Verify: success flash message "You've joined Female Squad 1!" (or Male Squad 1 based on gender)
5. Verify: squad card now shows squad name, member count (1), and a "Leave" button

### 2.4 Join a Mixed Squad

1. Still on the "My Squad" tab
2. Verify: "Join a Mixed Squad" card appears with "Chat with everyone" subtitle
3. Click **"Join"** on the mixed squad card
4. Verify: success flash message "You've joined Mixed Squad 1!"
5. Verify: mixed squad card now shows squad name and member count

### 2.5 Leave a Squad

1. Click **"Leave"** on the mixed squad card
2. Verify: browser confirmation dialog appears "Leave this squad?"
3. Click OK
4. Verify: card reverts to "Join a Mixed Squad" state
5. Re-join the mixed squad for later testing

### 2.6 Verify Squad in Admin

1. Switch to admin panel
2. Go to Glam Squad > Squads
3. Verify: "Female Squad 1" (or "Male Squad 1") and "Mixed Squad 1" appear
4. Click on a squad to see the detail page
5. Verify: member list shows User A

---

## Part 3: Guest — Submitting an Entry

### 3.1 Navigate to Challenge

1. Log in as User A (who has a gendered squad)
2. On the Glam Squad index page, click **"Submit Entry"** button on the challenge banner
3. Verify: redirected to Challenge detail page (`/glam-squad/challenge/{id}`)
4. Verify: challenge header shows title, theme tag, status, timeline, and countdown
5. Verify: "Submit Your Entry" form appears

### 3.2 Upload Photos

1. In the submission form, click **"Photo 1 (required)"** upload area
2. Select an image file from your device
3. Verify: photo preview appears above the upload buttons
4. Verify: upload label changes to "Change Photo 1"
5. Click **"Photo 2 (optional)"** and upload a second image
6. Verify: both previews appear side by side
7. Test removing a photo by clicking the X button on a preview
8. Verify: preview disappears and upload label resets

### 3.3 Submit Entry

1. Upload at least Photo 1
2. Type a caption: "Loving the summer look!" (verify character counter shows e.g. "24/200")
3. Click **"Submit Entry"** button
4. Verify: button shows "Submitting..." while processing
5. Verify: success flash message "Entry submitted successfully!"
6. Verify: submission form is replaced by "Your Entry" section showing the uploaded photo and caption
7. Verify: message "Entry submitted! Voting will begin soon."

### 3.4 Verify Entry in Sidebar

1. Check the right sidebar
2. Verify: "Your Entry" widget appears with photo thumbnail, rating (0.0), votes (0)

### 3.5 Try Duplicate Submission

1. Navigate back to the challenge page
2. Verify: no submission form appears (already submitted)
3. Verify: "Your Entry" section is displayed instead

### 3.6 User Without Squad

1. Log in as a different user (User B) who has NOT joined a squad
2. Navigate to the challenge page
3. Verify: instead of submission form, a message appears: "Join a Squad to Compete"
4. Verify: "Go to Squads" link redirects to main Glam Squad page

---

## Part 4: Guest — Voting

### 4.1 Transition to Voting Phase (Admin)

1. In admin panel, go to the challenge
2. Transition the challenge to **"voting_open"**
3. Verify: status updates to "voting open" (yellow badge)

### 4.2 Submitter Cannot Vote

1. Log in as User A (who submitted an entry)
2. Navigate to the challenge page
3. Verify: "Voting in Progress" message appears
4. Verify: message says "Since you submitted an entry, you cannot vote in this challenge"
5. Verify: current rating and vote count for your entry are displayed

### 4.3 Non-Submitter Voting

1. Log in as User C (who has NOT submitted but is following or in a squad)
2. Navigate to the challenge page (`/glam-squad/challenge/{id}`)
3. Verify: **Voting Booth** appears with header showing "You've cast 0 votes"
4. Verify: an entry is displayed with photo(s), user info, and caption

### 4.4 Cast a Vote

1. In the voting booth, hover over the stars
2. Verify: stars highlight on hover (gold color)
3. Click on a star rating (e.g. 4 stars)
4. Verify: selected stars remain highlighted
5. Click **"Submit Vote"** button
6. Verify: vote count increments ("You've cast 1 vote")
7. Verify: next entry loads automatically (or "All caught up!" if no more entries)

### 4.5 No More Entries

1. Continue voting until all entries are rated
2. Verify: "All caught up!" message appears with sparkle icon
3. Verify: message says "No more entries to vote on right now. Check back later!"

### 4.6 Verify Vote Counts (Admin)

1. In admin panel, check the challenge entries
2. Verify: vote counts are incrementing on entries

---

## Part 5: Results & Scoring

### 5.1 Complete the Challenge (Admin)

1. In admin panel, transition the challenge to **"completed"**
2. Click **"Calculate Results"** button for the challenge
3. Verify: success message about results being calculated

### 5.2 View Results (Guest)

1. Log in as any user
2. Navigate to the Glam Squad index page
3. Verify: challenge banner now shows "completed" status
4. Click **"View Results"** button
5. Verify: redirected to Results page (`/glam-squad/challenge/{id}/results/female`)

### 5.3 Results Page Layout

1. Verify: back link "Back to Glam Squad" at top
2. Verify: header shows "Challenge #1 Results" with trophy icon
3. Verify: gender track toggle (Female / Male) is displayed
4. Verify: **Podium section** shows top 3 entries:
   - 1st place in the center (elevated, gold crown, gold border)
   - 2nd place on the left (silver badge)
   - 3rd place on the right (bronze badge)
5. Verify: each podium entry shows photo, user avatar, name, score, avg rating, and vote count
6. Verify: **"All Entries"** section below lists all entries with EntryCard components

### 5.4 Gender Track Toggle

1. Click **"Male"** on the gender toggle
2. Verify: page navigates to male track results
3. Verify: entries update to show male track participants
4. Click **"Female"** to switch back

### 5.5 Empty Results

1. If one track has no entries, verify: "No results yet" empty state appears
2. Verify: message shows "No qualifying entries in the [track] track for this challenge"

---

## Part 6: Leaderboard & Badges

### 6.1 Season Leaderboard

1. On the Glam Squad index page, click the **"Leaderboard"** tab
2. Verify: "Season Leaderboard" widget appears with gender toggle
3. Verify: leaderboard table shows columns: Rank, User, Points, Entered, Top 1, Top 3, Streak
4. Toggle between Female and Male tracks
5. Verify: data updates per track

### 6.2 User Stats Sidebar

1. Check the right sidebar
2. Verify: "Your Stats" widget shows Points, Entries, and Streak values
3. Verify: values reflect the user's actual participation

### 6.3 Badges Tab

1. Click the **"Badges"** tab
2. Verify: badge grid displays all 8 available badges
3. Verify: earned badges have a highlighted border (pink)
4. Verify: locked/unearned badges appear dimmed (50% opacity)
5. Verify: each badge shows icon, name, and description

---

## Part 7: Challenges Tab & Navigation

### 7.1 Challenge List

1. Click the **"Challenges"** tab
2. Verify: all challenges in the season are listed as ChallengeCard components
3. Verify: each card shows title, status badge, theme, and entry count
4. Click on a completed challenge card
5. Verify: navigates to results page for that challenge
6. Click on an active challenge card
7. Verify: navigates to challenge detail page

### 7.2 Season Selector

1. If multiple seasons exist, check the right sidebar
2. Verify: "Seasons" widget lists all seasons with status badges
3. Click on a different season
4. Verify: page reloads with that season's data
5. Verify: active season has highlighted background

### 7.3 No Season State

1. If no active season exists, verify the page shows gracefully with empty state
2. Verify: no errors or broken layouts

---

## Part 8: Feed Integration

### 8.1 Glam Squad Quick Link

1. Navigate to the Feed page (`http://localhost/feed` or home)
2. In the **left sidebar**, find the Quick Links section
3. Verify: **"Glam Squad"** link appears (with sparkle icon) after Settings
4. Click the link
5. Verify: navigates to `/glam-squad`

### 8.2 Winner Showcase Widget

1. On the Feed page, check the **right sidebar**
2. Verify: **"Glam Winners"** widget appears (only if there are completed challenges with results)
3. Verify: widget shows up to 4 winners with:
   - Crown icon for 1st place
   - Numbered badges for 2nd/3rd
   - Winner photo thumbnail
   - Name and score
4. Verify: "View All" link at the top navigates to `/glam-squad`
5. Click on a winner entry
6. Verify: navigates to the results page for that challenge/track

### 8.3 No Winners State

1. If no challenges have been completed, verify the Winners widget does not render at all (no empty box)

---

## Part 9: Lifecycle Automation

### 9.1 Verify Scheduler Registration

Run in terminal:
```bash
docker-compose exec -T famtree php artisan schedule:list | grep glam
```
Verify: `glam:lifecycle` appears running every 5 minutes.

### 9.2 Test Manual Lifecycle Run

1. Create a new challenge in admin with **submissions_open_at** set to a past time
2. Run manually:
   ```bash
   docker-compose exec -T famtree php artisan glam:lifecycle
   ```
3. Verify: output shows "Challenge #X → submissions_open"
4. Check admin — challenge status should now be "submissions_open"

### 9.3 Test Full Lifecycle Transitions

1. Create a challenge with all dates set to past times:
   - submissions_open_at: past
   - voting_open_at: past
   - results_at: past
2. Set status to "upcoming"
3. Run `php artisan glam:lifecycle`
4. Verify: output shows it transitioned through all stages: upcoming → submissions_open → voting_open → completed (scored)

---

## Part 10: Squad Auto-Scaling

### 10.1 Test Squad Capacity (Optional — requires many users)

1. The squad cap is 250 members by default
2. To test auto-scaling, temporarily set `member_cap` to 2 in the database:
   ```sql
   UPDATE glam_squads SET member_cap = 2 WHERE gender_track = 'female';
   ```
3. Join with User A (member 1) and User B (member 2 — squad now full)
4. Log in as User C (female) and try to join
5. Verify: "Female Squad 2" is auto-created and User C is placed there
6. Verify: success message says "You've joined Female Squad 2!"
7. Reset member_cap back to 250 after testing

---

## Part 11: Edge Cases & Error Handling

### 11.1 Submit Without Photo

1. On the challenge submission form, try clicking **"Submit Entry"** without uploading Photo 1
2. Verify: button is disabled (grayed out) when no photo is selected

### 11.2 Vote Without Selecting Stars

1. In the voting booth, try clicking **"Submit Vote"** without selecting a star rating
2. Verify: button is disabled when no stars are selected

### 11.3 Unauthenticated Access

1. Log out of the application
2. Try navigating to `http://localhost/glam-squad`
3. Verify: redirected to login page (auth middleware)

### 11.4 Challenge Not Found

1. Navigate to `http://localhost/glam-squad/challenge/99999`
2. Verify: "Challenge not found" empty state appears
3. Verify: "Back to Glam Squad" link works

### 11.5 Results Not Available

1. Navigate to results for a non-existent challenge
2. Verify: "Results not available" empty state appears

---

## Part 12: Responsive Design

### 12.1 Mobile View (< 768px)

1. Open browser dev tools and toggle mobile view (or resize to ~375px width)
2. On the Index page, verify:
   - Sidebar stacks below main content
   - Challenge banner padding reduces
   - Tabs scroll horizontally if needed
3. On the Challenge page, verify:
   - Voting booth is full width
   - Photo previews scale down
4. On the Results page, verify:
   - Podium entries stack vertically (not side by side)
   - Entry cards are full width

### 12.2 Tablet View (~768px–1024px)

1. Resize to tablet dimensions
2. Verify: layout adjusts gracefully — no horizontal overflow or broken elements

---

## Summary Checklist

| # | Feature | Status |
|---|---------|--------|
| 1 | Admin: Create season | |
| 2 | Admin: Activate/complete season | |
| 3 | Admin: Create challenge | |
| 4 | Admin: Transition challenge status | |
| 5 | Admin: Calculate results | |
| 6 | Admin: View squads & members | |
| 7 | Guest: Follow/unfollow | |
| 8 | Guest: Join gendered squad | |
| 9 | Guest: Join mixed squad | |
| 10 | Guest: Leave squad | |
| 11 | Guest: Submit entry (1-2 photos + caption) | |
| 12 | Guest: Voting booth (star rating) | |
| 13 | Guest: View results (podium + entries) | |
| 14 | Guest: Gender track toggle on results | |
| 15 | Guest: Leaderboard tab | |
| 16 | Guest: Badges tab | |
| 17 | Guest: Season selector | |
| 18 | Feed: Glam Squad quick link | |
| 19 | Feed: Winner showcase widget | |
| 20 | Lifecycle: Auto-transition command | |
| 21 | Squad auto-scaling at capacity | |
| 22 | Responsive: Mobile layout | |
