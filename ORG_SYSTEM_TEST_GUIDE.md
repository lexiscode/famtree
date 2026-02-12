# Organization Accounts System — Feature Testing Guide

This document covers all features implemented across the 4-phase Organization Accounts System. Use it to manually verify each feature in the UI.

---

## Test Credentials

All seeded org accounts share the same password:

| Organization | Email | Username | Password |
|---|---|---|---|
| UNILAG | admin@unilag.famtree.test | unilag-admin | OrgPassword123 |
| UI (Ibadan) | admin@ui.famtree.test | ui-admin | OrgPassword123 |
| Chelsea FC | admin@chelsea.famtree.test | chelsea-admin | OrgPassword123 |
| Man Utd | admin@manutd.famtree.test | manutd-admin | OrgPassword123 |
| Deeper Life Ministry | admin@deeperlife.famtree.test | deeperlife-admin | OrgPassword123 |

---

## Phase 1: Foundation (Auth + Dashboard)

### 1.1 Org Login

- **URL:** `/org/login`
- [ ] Login page loads with dark theme, email + password fields, and "Remember me" checkbox
- [ ] Entering valid credentials (e.g. `admin@unilag.famtree.test` / `OrgPassword123`) redirects to `/org/dashboard`
- [ ] Entering invalid credentials shows an error message
- [ ] Already-logged-in org user visiting `/org/login` is redirected to dashboard
- [ ] "Remember me" persists session across browser close/reopen

### 1.2 Org Dashboard

- **URL:** `/org/dashboard`
- [ ] Dashboard loads with stats cards: Followers, Posts, Broadcasts Sent, Active Groups, Total Members
- [ ] Recent activity timeline shows login/logout and other actions
- [ ] Quick action buttons are visible and functional

### 1.3 Org Layout / Sidebar Navigation

- [ ] Sidebar displays organization logo and name
- [ ] Sidebar displays logged-in account info (username, role)
- [ ] All 8 nav items are present and navigate correctly:
  - Dashboard → `/org/dashboard`
  - Posts → `/org/posts`
  - Broadcasts → `/org/broadcasts`
  - Analytics → `/org/analytics`
  - Profile → `/org/profile`
  - Staff → `/org/staff`
  - Groups → `/org/groups`
  - Followers → `/org/followers`
- [ ] Active nav item is highlighted
- [ ] Sidebar collapses/expands properly
- [ ] Logout button works — redirects to `/org/login`

---

## Phase 2: Posts + Follow System + Feed Integration

### 2.1 Org Post Management

- **URL:** `/org/posts`
- [ ] Posts page loads with list of existing org posts (or empty state)
- [ ] **Create post:** Fill text content → submit → post appears in list with success toast
- [ ] **Edit post:** Click edit on an existing post → modify content → save → updated content shown
- [ ] **Delete post:** Click delete → confirm → post removed from list
- [ ] **Pin/Unpin post:** Click pin toggle → post is pinned/unpinned (pinned posts shown at top)
- [ ] Posts show engagement stats (views, reactions, comments counts)

### 2.2 Auto-Follow on ClassSet Join

- **Prerequisite:** Log in as a regular user (not org account)
- **URL:** `/organizations` → navigate to an organization → find a class set to join
- [ ] Join a class set under an organization (e.g. join a UNILAG class set)
- [ ] After joining, the organization should appear in the user's followed list
- [ ] The organization's follower count should increment

### 2.3 Org Posts in User Feed

- **Prerequisite:** A regular user who follows an organization (auto or manual), and that org has created posts
- **URL:** Log in as regular user → go to Feed page
- [ ] Org posts appear in the "Following" feed tab alongside regular user posts
- [ ] Org posts display with a distinctive purple "ORG" badge and Building icon
- [ ] Org posts show the organization name/logo as the author (not a user)
- [ ] Org posts show engagement counts but are read-only (no like/comment/share/delete buttons)
- [ ] Org posts appear correctly in the "All" feed tab too
- [ ] Scrolling/pagination loads more posts including org posts

---

## Phase 3: Broadcasts

### 3.1 Broadcast List

- **URL:** `/org/broadcasts`
- [ ] Broadcasts page loads with list of all broadcasts (or empty state)
- [ ] Each broadcast shows: title, message preview, status badge, target info, schedule info
- [ ] Status badges: draft, pending, sent, partially_sent, cancelled

### 3.2 Create Broadcast

- **URL:** `/org/broadcasts/create`
- [ ] Form loads with:
  - Title field (optional)
  - Message field (required)
  - Target selector: "All Groups" or "Selected Groups" with checkboxes for each class set
  - Schedule type: Immediate / Scheduled / Recurring
- [ ] **Immediate broadcast:** Select "Immediate" → submit → broadcast is sent right away → status becomes "sent"
- [ ] **Scheduled broadcast:** Select "Scheduled" → pick a future date/time → submit → status is "pending" with scheduled time shown
- [ ] **Recurring broadcast:** Select "Recurring" → choose Daily/Weekly + optional recurrence count → submit → status is "pending"
- [ ] **Target: All groups** → broadcast goes to every class set under the organization
- [ ] **Target: Selected groups** → only checked class sets receive the broadcast

### 3.3 Broadcast Details

- **URL:** `/org/broadcasts/{id}`
- [ ] Shows full broadcast details: title, message, target groups, schedule info, delivery stats
- [ ] **Cancel button** visible for pending/scheduled broadcasts
- [ ] Cancelling a broadcast changes its status to "cancelled"

### 3.4 Broadcast Display in Group Chat

- **Prerequisite:** A broadcast has been sent to a class set
- **URL:** Log in as a regular user who is a member of a targeted class set → go to Messages → open that class set chat
- [ ] Broadcast message appears with distinctive styling:
  - Purple gradient background
  - Organization avatar/logo
  - Organization name as sender
  - "Broadcast" badge label
  - Purple left border accent
- [ ] Broadcast messages are not editable or deletable by users
- [ ] Normal user messages still display and function normally alongside broadcasts

### 3.5 Scheduled/Recurring Broadcast Processing

- **Note:** This is handled by a background artisan command (`org:process-broadcasts`) that runs every minute
- [ ] Create a scheduled broadcast with `scheduled_at` set to 1-2 minutes from now
- [ ] Wait for the scheduler to pick it up → broadcast status changes to "sent"
- [ ] For recurring: after first send, `next_send_at` updates to the next occurrence (daily = +1 day, weekly = +1 week)
- [ ] Recurring broadcast stops after reaching `recurrence_count` limit

---

## Phase 4: Analytics, Staff, Groups, Followers, Profile

### 4.1 Analytics

- **URL:** `/org/analytics`
- [ ] Page loads with 5 summary cards at the top:
  - Total Follower Growth
  - Total Post Views
  - Total Reactions
  - Total Comments
  - Total Broadcast Reach
- [ ] **Follower Growth chart:** Purple area chart showing daily new follower counts over last 30 days
- [ ] **Post Engagement chart:** Grouped bar chart with 3 series — Views (blue), Reactions (pink), Comments (green)
- [ ] **Broadcast Reach chart:** Amber area chart showing daily people reached
- [ ] Charts show empty state message when no data is available
- [ ] Chart tooltips appear on hover with formatted dates and values
- [ ] Charts are responsive (resize with window)

### 4.2 Staff Management

- **URL:** `/org/staff`
- [ ] Staff table loads showing all org accounts with columns: Name, Username, Email, Role, Permissions, Status, Last Login, Actions
- [ ] Role badges display with correct colors:
  - Owner → gold/amber
  - Admin → purple
  - Editor → blue
  - Moderator → green
- [ ] Owner row shows "All permissions" in permissions column
- [ ] Owner row has no edit/delete action buttons (protected)

#### Add Staff
- [ ] Click "Add Staff" button → modal opens
- [ ] Fill in: Display Name, Username*, Email*, Password* (min 8 chars), Role dropdown, Permission toggles
- [ ] 6 permission toggles available:
  - Manage Posts
  - Manage Broadcasts
  - Manage Staff
  - View Analytics
  - Manage Groups
  - Manage Profile
- [ ] Submit → new staff appears in table with success toast
- [ ] Validation: required fields enforced, duplicate username/email rejected

#### Edit Staff
- [ ] Click edit (pencil) button on a non-owner staff row → edit modal opens
- [ ] Pre-filled with current: display name, role, permissions
- [ ] Can change role, display name, permissions, and optionally set new password
- [ ] Save → table updates with changes

#### Toggle Active Status
- [ ] Click the Active/Inactive status badge on a non-owner row → status toggles
- [ ] Active = green badge, Inactive = red badge
- [ ] Inactive staff cannot log in

#### Delete Staff
- [ ] Click delete (trash) button on a non-owner row → confirmation dialog
- [ ] Confirm → staff removed from table

### 4.3 Groups

- **URL:** `/org/groups`
- [ ] Page loads with summary: X faculties, Y class sets, Z total members
- [ ] Hierarchical tree view: Faculties → Departments → Class Sets
- [ ] Faculties expandable/collapsible (all expanded by default)
- [ ] Departments expandable/collapsible (collapsed by default)
- [ ] Each faculty shows: name, department count, member count
- [ ] Each department shows: name, class set count, member count
- [ ] Each class set shows: name, year, member count, active status indicator (green/gray dot)
- [ ] Empty state shown when no groups exist

### 4.4 Followers

- **URL:** `/org/followers`
- [ ] Page header shows total follower count
- [ ] Followers displayed in a responsive grid of cards
- [ ] Each card shows: profile image (or gradient avatar), first + last name, @username, follow date
- [ ] Cards have hover effect (border highlight + lift)
- [ ] Pagination controls appear when followers exceed one page
- [ ] Previous/Next buttons work correctly
- [ ] Empty state shown when no followers

### 4.5 Profile Editing

- **URL:** `/org/profile`
- [ ] Cover image and logo preview displayed at top
- [ ] Form organized into 3 sections:

**Basic Information:**
- [ ] Organization Name* field
- [ ] Short Name field
- [ ] Description textarea
- [ ] Vision textarea
- [ ] Mission textarea

**Contact & Location:**
- [ ] Address field
- [ ] City, State, Country fields (3-column grid)
- [ ] Website, Email, Phone fields (3-column grid)

**Leadership:**
- [ ] Leader Name field
- [ ] Leader Title field
- [ ] Leader Qualifications textarea

- [ ] All fields pre-filled with current organization data
- [ ] Click "Save Changes" → success toast, data persisted
- [ ] Revisiting the page shows updated data

---

## Database Migrations Required

Before testing, ensure all migrations have been run:

```bash
docker-compose exec -T famtree php artisan migrate
```

Key tables created:
- `org_accounts` — Organization staff/admin accounts
- `org_activity_logs` — Audit trail for org actions
- `organization_follows` — User-to-org follow relationships
- `org_posts` — Organization posts
- `org_post_images` — Images attached to org posts
- `org_broadcasts` — Broadcast campaigns

Key table modifications:
- `class_set_messages` — Added: `is_org_broadcast`, `org_broadcast_id`, `org_account_id`, `organization_id` columns; `sender_id` made nullable

## Seeding

To seed the org accounts:

```bash
docker-compose exec -T famtree php artisan db:seed --class=OrgAccountSeeder
```

---

## Quick Smoke Test Checklist

1. [ ] Navigate to `/org/login` → log in with `admin@unilag.famtree.test` / `OrgPassword123`
2. [ ] Dashboard loads with stats
3. [ ] Create an org post from Posts page
4. [ ] Create an immediate broadcast targeting all groups from Broadcasts page
5. [ ] Check Analytics page — charts render (even if empty data)
6. [ ] Add a new staff member with "Editor" role and "Manage Posts" permission
7. [ ] View Groups hierarchy
8. [ ] View Followers list
9. [ ] Update organization name from Profile page
10. [ ] Log out
11. [ ] Log in as a regular user → check Feed for org posts
12. [ ] Open a class set chat → verify broadcast message appears with purple styling
