# SUG Group Chat & Broadcast System — Testing Guide

## Prerequisites

1. Log in to the org admin panel at `http://localhost/org/login`
2. Ensure you have an org account with full access (Owner role)
3. Have at least a few test users who follow the organization or belong to class sets within it

---

## Phase 1 & 2: Group Creation & Leadership

### Create an Org Group
1. Go to `http://localhost/org/org-groups`
2. Click **Create Group** (top right)
3. Fill in:
   - Name: "Student Union Government"
   - Description: "The official SUG body"
   - Type: Select "Student Union (SUG)"
   - Max Members: Leave empty or set a number
   - Check "Allow Join Requests" if desired
4. Click **Create Group**
5. Verify the group appears in the list with stats cards updating

### Add Members
1. On the group card, click the **blue UserPlus icon**
2. Type a username or name in the search box (min 2 characters)
3. Select a user from the dropdown
4. Choose a role (e.g., President)
5. Click **Add Member**
6. Repeat for Vice President, Secretary, etc.

### Expand Group & View Members
1. Click anywhere on the group card header to expand
2. Verify Leadership section shows leaders with colored role badges
3. Verify Members section shows regular members

### Change a Member's Role
1. In the expanded group, click the **purple Crown icon** on any member
2. Select a new role in the modal
3. Click **Update Role**

### Remove a Member
1. Click the **red UserMinus icon** on a member
2. Confirm in the dialog

### Edit Group
1. Click the **purple Edit icon** on the group card header
2. Change name/description/type/max members
3. Toggle "Allow Join Requests"
4. Click **Save Changes**

### Leadership Handover
1. Click the **green RotateCcw icon** on the group card
2. Enter a term name (e.g., "2025/2026")
3. Optionally add handover notes
4. Click **Complete Handover**
5. Verify all leaders are demoted to members
6. Click **Term History** (yellow clock icon) to see the archived term

### Delete Group
1. Click the **red Trash icon** on the group card
2. Confirm deletion

---

## Phase 3: Broadcast Enhancements

### Create a Broadcast with Category
1. Go to `http://localhost/org/broadcasts/create`
2. Select a **Category** from the colored buttons (Announcement, Event, Urgent, etc.)
3. Select **Priority** (Normal, High, Critical)
4. Fill in title, content, select target groups, schedule
5. If you're a limited-access user, notice the "Requires Approval" banner
6. Click **Create Broadcast** (or "Submit for Approval" if limited access)

### Filter Broadcasts
1. Go to `http://localhost/org/broadcasts`
2. Use the filter dropdowns: Category, Status, Priority, Approval Status
3. If there are pending approvals, notice the **amber banner** at the top with count

### Approve / Reject a Broadcast (full-access only)
1. Click on a broadcast that has "Pending Approval" status
2. On the show page, find the **Approval Section**
3. Click **Approve & Send** to approve, or **Reject** (enter a reason)
4. Verify status updates accordingly

### Flag / Unflag a Broadcast
1. On any broadcast show page, scroll to the bottom
2. Click **Flag Broadcast**, enter a reason
3. Verify the red "Flagged" banner appears on the show page and the index list
4. Click **Unflag** to remove the flag

### View Broadcast Analytics
1. On any sent broadcast's show page, scroll to the analytics panel
2. Check: Groups Delivered count, Total Reads, Est. Read Rate
3. See delivery breakdown per group and recent reads list

---

## Phase 4: Membership Management

### Join Requests
1. If a group has `allow_join_requests` enabled and users have submitted requests:
   - On the group card, notice the **amber Inbox icon with badge count**
   - Click it to open the Join Requests modal
   - **Approve** or **Reject** each request
   - Approved users appear as members; rejected requests disappear

### Ban a Member
1. Expand a group to see members
2. On any member, click the **orange Ban icon** (between Crown and Remove)
3. Enter a ban reason (required)
4. Optionally set an expiry date
5. Click **Ban User**
6. Verify the member is removed from the group

### View & Manage Bans
1. Click the **orange Ban icon** on the group card header
2. See all banned users with reason, date, expiry
3. Click **Unban** to lift a ban

### Auto-membership Rules
1. Click the **cyan Zap icon** on the group card header
2. Click **New Rule**
3. Select a rule type:
   - **Class Set**: Pick a specific class set — all its members get added
   - **Faculty**: Pick a faculty — all students in that faculty get added
   - **All Followers**: All org followers get added
4. For Class Set / Faculty, select a target from the dropdown
5. Click **Create Rule**
6. On the created rule, click **Run** to execute it
7. Verify the "last run" stats update and new members appear in the group
8. Click the **red trash icon** to delete a rule

---

## Phase 5: Group Chat

### Open Chat
1. Go to `http://localhost/org/org-groups`
2. On any group card, click the **green MessageCircle icon**
3. You're now on the chat page at `/org/org-groups/{id}/chat`

### Send Messages
1. Type a message in the input box at the bottom
2. Press **Enter** or click the **Send button**
3. Message appears in the chat instantly

### Send with Attachment
1. Click the **Paperclip icon** (left of input)
2. Select a file (images show as previews, other files as download links)
3. Optionally type a message alongside
4. Click Send

### Reply to a Message
1. Hover over any message to see action buttons appear (top-right)
2. Click the **Reply icon**
3. A reply indicator appears above the input showing the original message
4. Type your reply and send
5. The message appears with a quoted reference to the original

### Pin / Unpin Messages
1. Hover over a message, click the **Pin icon**
2. The message gets a purple left border and pin indicator
3. In the chat header, a **Pin icon with count** appears
4. Click it to open the Pinned Messages sidebar
5. To unpin, hover the message again and click **Unpin**

### Delete a Message
1. Hover over a message, click the **red Trash icon**
2. Message is removed from chat

### View Members Panel
1. Click the **Users icon** in the chat header (top-right)
2. A sidebar opens showing Leadership and Members with role badges

### Load Older Messages
1. If there are 50+ messages, a **"Load older messages"** button appears at top
2. Click it to load more history (scroll position is maintained)

### Polling
1. Messages from other users/sessions appear automatically every 3 seconds
2. If you're scrolled to the bottom, new messages auto-scroll into view
3. If scrolled up, a **purple scroll-down button** appears at bottom-right

---

## Phase 6: Polls & Voting

### Access Polls
1. In the chat page, click the **BarChart3 icon** (chart icon) in the header
2. The Polls sidebar opens on the right

### Create a Poll
1. Click **New** button in the polls sidebar header
2. Fill in:
   - **Question**: "What should be our next event?"
   - **Description**: Optional detail
   - **Options**: At least 2, up to 10 (click "+ Add option" for more)
   - **Type**: Single choice or Multiple choice
   - **Anonymous voting**: Check to hide voter identities
   - **Show results before voting**: Uncheck to hide results until user votes
   - **Expires**: Optionally set an expiry datetime
3. Click **Create Poll**

### Vote on a Poll
1. In the polls sidebar, find your poll
2. Click on an option to vote
   - **Single choice**: Clicking another option changes your vote
   - **Multiple choice**: Click to toggle each option on/off
3. See the progress bar and percentage update in real-time

### View Results
- If "Show results before voting" is enabled, all users see percentages
- If disabled, percentages only appear after the user votes

### Close a Poll
1. Click the **Lock icon** on a poll card
2. The poll shows "Closed" badge and voting is disabled

### Delete a Poll
1. Click the **red Trash icon** on a poll card
2. Confirm deletion

### Poll Features to Verify
- Anonymous badge shows when poll is anonymous
- Expiry time displays with clock icon
- Expired polls auto-close and show "Expired" badge
- Voter count and total votes display at bottom of each poll

---

## Phase 7: Admin Oversight

### Suspend a Group
1. Go to `http://localhost/org/org-groups`
2. On any group card (full-access only), click the **red PauseCircle icon**
3. Enter a suspension reason
4. Click **Suspend Group**
5. Verify:
   - Red "Suspended" badge appears on the group card
   - The status dot turns red
   - Opening the group's chat shows a red suspension banner
   - The message input is disabled/greyed out
   - Polls sidebar still accessible (read-only)

### Unsuspend a Group
1. On a suspended group, click the **green PlayCircle icon**
2. The group returns to normal operation
3. Verify chat input is re-enabled

### Permission Templates
1. Go to `http://localhost/org/roles`
2. Click **Add Role**
3. Notice the **Quick Templates** section at the top of the modal:
   - **Union Leader**: Broadcasts + org groups + profile, 5-year limit
   - **Group Moderator**: Org groups + analytics + profile
   - **Content Manager**: Posts + broadcasts + analytics + profile
   - **Staff Admin**: Staff + groups + org groups + analytics + profile
4. Click a template — name, permissions, and year limit auto-fill
5. Modify if needed, then click **Create Role**

### Broadcast Moderation Overview
1. Go to `http://localhost/org/broadcasts`
2. Filter by "Flagged" or "Pending Approval" to find broadcasts needing attention
3. Click into any broadcast to review content
4. Use Flag/Unflag, Approve/Reject as needed

---

## Quick Smoke Test Checklist

- [ ] Create a group with type "SUG"
- [ ] Add 3+ members with different roles (President, VP, Member)
- [ ] Open chat, send 5+ messages
- [ ] Reply to a message
- [ ] Pin a message, verify pinned sidebar
- [ ] Attach an image and a file
- [ ] Create a single-choice poll with 3 options, vote
- [ ] Create a multiple-choice anonymous poll, vote
- [ ] Close a poll
- [ ] Create an auto-membership rule and execute it
- [ ] Ban a member, verify in bans list, then unban
- [ ] Suspend the group, verify chat is disabled
- [ ] Unsuspend the group, verify chat works again
- [ ] Do a leadership handover, check term history
- [ ] Create a broadcast with category "Urgent" and priority "Critical"
- [ ] Flag a broadcast, then unflag it
- [ ] Create a role using the "Union Leader" template
- [ ] Delete the group
