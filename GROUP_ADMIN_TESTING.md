# Group Admin System - UI Workflow Testing Guide

This document covers step-by-step manual testing workflows for the Group Admin System across all features: elections, member removal, mute state, system messages, and org staff overrides.

---

## Prerequisites

Before testing, ensure:
- Docker containers are running (`docker-compose up -d`)
- Migrations have been run (`docker-compose exec -T famtree php artisan migrate`)
- Frontend is built (`docker-compose exec -T famtree npx vite build`) or dev server is running
- You have access to:
  - **20+ user accounts** (to trigger elections)
  - **3 user accounts** designated as potential admins
  - **1 org staff account** with `manage-groups` permission
  - **1 class set** (group chat) belonging to an organization

---

## Test 1: Initial Election Trigger (20th Member Joins)

### Setup
- Ensure a class set (group chat) has **19 members** and **0 admins**
- Have a 20th user account ready

### Steps

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Log in as the 20th user | Navigate to the organization's class set page |
| 2 | Join the class set | Success toast: "Successfully joined {name}" |
| 3 | Open the group chat from the Messages page sidebar (look for the GraduationCap icon) | Group chat loads with message history |
| 4 | Observe the **election banner** pinned above the messages | A blue-tinted banner appears with: |
| | | - Vote icon + title: **"Group Admin Election"** |
| | | - Countdown timer showing **~48h remaining** (e.g. "47h 59m left") |
| | | - Subtitle: "Vote for 3 admins - 0 votes cast" |
| | | - A scrollable list of **all 20 members** as candidates |
| | | - Each candidate row shows: avatar, name, "0 votes", and a blue **"Vote"** button |
| 5 | Check the message area below the banner | A system message (centered pill-shaped bubble) should read: "🗳️ Group Admin Election has started! This group now has 20 members. Vote for 3 admins to help moderate this group. Voting ends in 48 hours." |

### What to verify
- [ ] Election banner is visible to all group members
- [ ] All 20 members appear as candidates
- [ ] Countdown timer ticks down correctly
- [ ] System message renders as a centered, grey pill (not a regular chat bubble)

---

## Test 2: Casting a Vote in an Election

### Steps

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | In the election banner, click **"Vote"** next to a candidate | Button shows loading state briefly |
| 2 | Observe the banner update | - The voted candidate's count increases by 1 |
| | | - All "Vote" buttons disappear |
| | | - A green check with **"You have voted"** appears at the bottom of the banner |
| | | - The candidate list re-sorts by vote count |
| 3 | Refresh the page and reopen the group chat | Election banner still shows, your vote is preserved, no "Vote" buttons appear |
| 4 | Log in as a **different member** and open the same group chat | They should see the "Vote" buttons (they haven't voted yet) and the updated vote counts |

### What to verify
- [ ] Only one vote per user (clicking Vote a second time should not be possible)
- [ ] Vote counts update in real-time after voting
- [ ] The "You have voted" green indicator persists across page reloads
- [ ] Other users see updated vote counts but still have their own Vote buttons

---

## Test 3: Election Completion (Top 3 Become Admins)

### Setup
- Have enough users vote so 3 candidates have the most votes
- To speed up testing: update the election's `ends_at` in the database to a past time:
  ```sql
  UPDATE group_elections SET ends_at = NOW() WHERE class_set_id = {id} AND status = 'active';
  ```

### Steps

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Run the election processor: `docker-compose exec -T famtree php artisan groups:process-elections` | Output: "Processed 1 ended election(s)." |
| 2 | Open the group chat as any member | - The election banner is **gone** (election completed) |
| | | - A system message appears: "🗳️ Election results are in! New admin(s): {Name1}, {Name2}, {Name3}. Congratulations!" |
| 3 | Open the group member list (via the Members route) | The 3 winning users should show `is_admin: true` |

### What to verify
- [ ] Election banner disappears after processing
- [ ] Results system message lists correct winners
- [ ] Winners have admin status in the database
- [ ] No more than 3 admins were appointed

---

## Test 4: Tiebreaker Election

### Setup
- Create an election where 2 candidates clearly win, but candidates #3 and #4 are tied
- Example: Candidate A=5 votes, B=4, C=3, D=3
- Set `ends_at` to past, then process

### Steps

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Run `php artisan groups:process-elections` | Output: "Processed 1 ended election(s)." |
| 2 | Open the group chat | - System message: "🗳️ There was a tie! A tiebreaker election has started with 2 candidates for 1 position(s). Voting ends in 24 hours." |
| | | - A new election banner appears titled **"Tiebreaker Election"** |
| | | - Only the 2 tied candidates appear in the list |
| | | - Timer shows ~24 hours |
| 3 | Verify that candidates A and B are now admins | Check member list - A and B should be admins |

### What to verify
- [ ] Only the tied candidates appear in the tiebreaker
- [ ] The tiebreaker has a 24h duration (not 48h)
- [ ] Clear winners were already promoted to admin
- [ ] Banner title says "Tiebreaker Election"

---

## Test 5: Replacement Election (Admin Leaves)

### Setup
- Group has 3 admins and 20+ members
- One admin will leave the group

### Steps

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Log in as one of the 3 admins | Navigate to the group |
| 2 | Leave the class set (via the Leave button) | Success toast: "Successfully left {name}" |
| 3 | Log in as another member and open the group chat | - A new election banner: **"Replacement Admin Election"** |
| | | - Subtitle: "Vote for 1 admin" |
| | | - Candidate list shows **up to 20 most active chatters** (excluding current admins) |
| | | - Timer: ~48h |
| | | - System message: "🗳️ A replacement admin election has started!..." |

### What to verify
- [ ] Replacement election triggers automatically when admin count drops below 3
- [ ] Only 1 position to fill
- [ ] Current admins are excluded from candidates
- [ ] Candidate pool is based on recent chat activity

---

## Test 6: Admin Initiates Member Removal

### Setup
- Group has 3 admins
- Identify a non-admin member to target for removal

### Steps

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Log in as **Admin A** | Open the group chat |
| 2 | Call the removal initiation API (from browser console or via a UI trigger if you add one): `axios.post(route('class-sets.removal.initiate', '{groupUuid}'), { target_user_id: {targetId} })` | Response: `{ success: true, removal: { status: 'pending', ... } }` |
| 3 | Observe the group chat | **Removal alert** appears below the header with orange/amber styling: |
| | | - AlertTriangle icon + title: "Member Removal Vote" |
| | | - Text: "Admin A wants to remove **Target Name** from this group." |
| | | - Vote pills: "Admin A: confirm" (red pill) |
| | | - **No vote buttons** for Admin A (initiator can't vote again) |
| | | - Expiry date shown on the right |
| 4 | Check the messages area | System message: "⚠️ Admin A has initiated the removal of Target Name from this group. Other admins have 3 days to vote. 2 confirm votes are needed to remove." |

### What to verify
- [ ] Removal alert appears with correct styling (orange/amber)
- [ ] Initiator's vote is auto-recorded as "confirm"
- [ ] Initiator does NOT see Confirm/Reject buttons
- [ ] System message appears in the chat

---

## Test 7: Target User Sees Removal Alert + Muted State

### Steps

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Log in as the **target user** (the one being removed) | Open the group chat |
| 2 | Observe the removal alert | **Red-tinted banner** appears: |
| | | - AlertTriangle icon (red) + title: **"Removal Initiated Against You"** |
| | | - Text: "{Admin A} has initiated your removal from this group." |
| | | - "Contact the admins to discuss:" followed by clickable admin name buttons |
| 3 | Click an admin name button | Should navigate to `/messages/start?userId={adminId}` to start a DM |
| 4 | Look at the message input area at the bottom | Input is **replaced** with a red alert: |
| | | - AlertTriangle icon + text: **"You cannot send messages while a removal is pending."** |
| | | - No text input field, no send button |
| 5 | Try sending a message via API: `axios.post(route('class-sets.send-message', '{groupUuid}'), { message: 'test' })` | Should return 422 error: "You cannot send messages while a removal is pending." |

### What to verify
- [ ] Target sees the red-styled removal banner (different from admin's orange banner)
- [ ] Admin contact buttons are clickable and navigate to DMs
- [ ] Message input is completely disabled with explanation text
- [ ] Backend also blocks message sending (not just frontend)

---

## Test 8: Regular Member Sees Subtle Moderation Notice

### Steps

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Log in as a **regular member** (not admin, not the target) | Open the group chat |
| 2 | Observe the removal alert area | An **amber-tinted banner** appears with: |
| | | - AlertTriangle icon (orange) + title: "Moderation in Progress" |
| | | - Simple text: "A moderation action is in progress." |
| | | - No vote buttons, no detailed info |
| 3 | Check the message input | Should still be **active** - regular members can still send messages |

### What to verify
- [ ] Regular members see a subtle notice (not detailed voting UI)
- [ ] Their message input is NOT disabled
- [ ] They cannot see who is being removed or vote details

---

## Test 9: Second Admin Confirms Removal (2-Vote Threshold)

### Steps

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Log in as **Admin B** (not the initiator) | Open the group chat |
| 2 | Observe the removal alert | Orange banner with: |
| | | - "Admin A wants to remove **Target Name**" |
| | | - Vote pill: "Admin A: confirm" |
| | | - Two buttons: **"Confirm Remove"** (red) and **"Reject"** (green) |
| 3 | Click **"Confirm Remove"** | - Button shows loading state |
| | | - Removal alert **disappears** (removal was executed) |
| | | - System message: "🚫 Target Name has been removed from this group by admin consensus." |
| 4 | Check the member list | Target user is no longer a member |
| 5 | Log in as the target user | They should no longer see this group in their Messages sidebar |

### What to verify
- [ ] Second confirm vote triggers immediate removal
- [ ] Removal alert disappears for all users after execution
- [ ] System message confirms removal
- [ ] Target is actually removed from the group

---

## Test 10: Admin Rejects Removal (2 Reject Votes Cancel)

### Setup
- Initiate a new removal (follow Test 6)
- This time, admins will reject

### Steps

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Log in as **Admin B** | Open group chat, see removal alert |
| 2 | Click **"Reject"** button | - One reject vote recorded |
| | | - If only 2 admins besides initiator: one more reject needed |
| 3 | Log in as **Admin C** | Open group chat |
| 4 | Click **"Reject"** | - 2 reject votes reached → removal cancelled |
| | | - Alert disappears |
| | | - System message: "✅ The removal of Target Name has been cancelled by admin vote." |
| 5 | Log in as the target user | - Group chat accessible |
| | | - Message input is **re-enabled** (no longer muted) |
| | | - Can send messages again |

### What to verify
- [ ] 2 reject votes cancel the removal
- [ ] Target's mute is lifted (can message again)
- [ ] System message confirms cancellation
- [ ] Removal alert gone for everyone

---

## Test 11: 3-Day Auto-Confirm (Expiry)

### Setup
- Initiate a removal but don't have other admins vote
- Simulate expiry by updating the database:
  ```sql
  UPDATE group_member_removals SET expires_at = NOW() WHERE status = 'pending';
  ```

### Steps

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Run: `docker-compose exec -T famtree php artisan groups:process-removals` | Output: "Processed 1 expired removal(s)." |
| 2 | Open the group chat | - Removal alert gone |
| | | - System message: "🚫 Target Name has been removed from this group by admin consensus." |
| 3 | Verify target is removed | Target no longer appears in member list |

### What to verify
- [ ] Expired removals are auto-confirmed (member removed)
- [ ] The scheduler command processes correctly
- [ ] Same system message as manual confirmation

---

## Test 12: Org Staff - Force Remove Member

### Steps

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Log in to the **org dashboard** (`/org/login`) with a staff account that has `manage-groups` permission | Navigate to Groups page (`/org/groups`) |
| 2 | Observe the page | Hierarchical tree: Faculty > Department > Class Sets |
| 3 | Click on a department to expand it | Class sets appear with member counts and active indicators |
| 4 | Click on a class set row to expand it | **Member list** appears below showing: |
| | | - Each member's avatar, name |
| | | - **ADMIN** badge (yellow) for admins |
| | | - **MUTED** badge (red) for muted members |
| | | - Action buttons per member |
| 5 | For a non-admin member, observe the buttons | Two buttons: **"Make Admin"** (blue) and **"Remove"** (red) |
| 6 | Click **"Remove"** on a member | - Page reloads with success toast: "Member removed successfully." |
| | | - Member disappears from the list |
| | | - Member count decreases |
| 7 | Open the group chat as any member | System message: "🔒 A member has been removed by organization staff." |

### What to verify
- [ ] Member list is visible and expandable per class set
- [ ] Force remove works immediately (no voting needed)
- [ ] System message is posted in the group chat
- [ ] Member count updates correctly
- [ ] If a pending removal existed for this user, it was cancelled

---

## Test 13: Org Staff - Appoint Admin

### Steps

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | On the Groups page, expand a class set | See member list |
| 2 | Find a non-admin member | They should have a blue **"Make Admin"** button |
| 3 | Click **"Make Admin"** | - Success toast: "Admin appointed successfully." |
| | | - The member now shows a yellow **ADMIN** badge |
| | | - Their button changes to **"Remove Admin"** (amber) |
| 4 | Open the group chat | System message: "🔒 An admin has been appointed by organization staff." |

### What to verify
- [ ] Button changes from "Make Admin" to "Remove Admin" after appointment
- [ ] ADMIN badge appears immediately
- [ ] System message is posted
- [ ] If appointing this admin fills all 3 slots and an election is active, the election should be cancelled

---

## Test 14: Org Staff - Remove Admin

### Steps

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | On the Groups page, find a member with the **ADMIN** badge | They should have an amber **"Remove Admin"** button |
| 2 | Click **"Remove Admin"** | - Success toast: "Admin removed successfully." |
| | | - ADMIN badge disappears |
| | | - Button changes back to **"Make Admin"** (blue) |
| 3 | Open the group chat | System message: "🔒 An admin has been removed by organization staff." |

### What to verify
- [ ] Admin status is revoked
- [ ] UI updates correctly (badge removed, button changed)
- [ ] System message posted

---

## Test 15: System Messages Rendering

### What to look for

System messages (sent with `sender_id = null`) should render as:
- **Centered** in the chat (not left or right aligned)
- **Pill-shaped** rounded bubble (border-radius: 20px)
- **Grey background**: `rgba(255, 255, 255, 0.05)`
- **Subtle border**: `rgba(255, 255, 255, 0.08)`
- **Grey text** (#aaa), font-size 0.78rem
- **Timestamp** below in smaller, darker grey

They should **NOT** look like:
- Regular user messages (with avatar, name, left/right alignment)
- Broadcast messages (with purple styling and org logo)

### Messages to verify render correctly
- [ ] Election started announcement
- [ ] Election results announcement
- [ ] Tiebreaker announcement
- [ ] Removal initiated announcement
- [ ] Removal confirmed announcement
- [ ] Removal cancelled announcement
- [ ] Org staff action announcements

---

## Test 16: Edge Cases

| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| 1 | User tries to join a group that already has 20+ members and admins | No election triggered (admins already exist) |
| 2 | Admin initiates removal against another admin | Error: "You cannot remove another admin. Admins must leave voluntarily." |
| 3 | Two removals attempted simultaneously | Error: "There is already a pending removal in this group." |
| 4 | Non-admin tries to initiate removal | Error: "Only group admins can initiate member removal." |
| 5 | User tries to vote twice in election | Error: "You have already voted in this election." |
| 6 | Election with 0 votes cast | System message: "The election has ended with no votes cast. No admins were appointed." |
| 7 | Group drops below 20 members after election | Existing admins remain, no new elections triggered |
| 8 | Org staff force-removes a user who has a pending removal | Pending removal is cancelled, user is removed directly |

---

## Quick Reference: API Endpoints

### User-Facing (auth middleware)
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/class-sets/{uuid}/election` | Get active election data |
| POST | `/class-sets/{uuid}/election/vote` | Cast vote (`candidate_id`) |
| GET | `/class-sets/{uuid}/removal` | Get pending removal data |
| POST | `/class-sets/{uuid}/removal/initiate` | Start removal (`target_user_id`) |
| POST | `/class-sets/{uuid}/removal/vote` | Vote on removal (`vote: confirm\|reject`) |

### Org Staff (auth:org middleware)
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/org/groups/{classSetId}/members/{userId}/force-remove` | Force remove member |
| POST | `/org/groups/{classSetId}/members/{userId}/appoint-admin` | Appoint as admin |
| POST | `/org/groups/{classSetId}/members/{userId}/remove-admin` | Remove admin status |

### Scheduler Commands
| Command | Schedule | Description |
|---------|----------|-------------|
| `groups:process-elections` | Every 5 minutes | Process ended elections |
| `groups:process-removals` | Hourly | Auto-confirm expired removals |
