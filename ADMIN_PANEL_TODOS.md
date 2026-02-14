# ADMIN PANEL FEATURES & TODOS

**Last Updated:** February 14, 2026
**Status:** Partially Implemented / Ongoing
**Priority:** Critical for Platform Management

---

## Table of Contents

1. [Overview](#overview)
2. [Current State — What Already Exists](#current-state--what-already-exists)
3. [Phase 1: Organization Management (NEW — Critical)](#phase-1-organization-management)
4. [Phase 2: Content Moderation System](#phase-2-content-moderation-system)
5. [Phase 3: Report & Safety Management](#phase-3-report--safety-management)
6. [Phase 4: Deceased Verification & Memorial Management](#phase-4-deceased-verification--memorial-management)
7. [Phase 5: Messaging & Chat Oversight](#phase-5-messaging--chat-oversight)
8. [Phase 6: Blog & Contact Management](#phase-6-blog--contact-management)
9. [Phase 7: Family Tree & Connection Oversight](#phase-7-family-tree--connection-oversight)
10. [Phase 8: Group Administration Oversight (Elections & Removals)](#phase-8-group-administration-oversight)
11. [Phase 9: Advanced Analytics & Reporting](#phase-9-advanced-analytics--reporting)
12. [Phase 10: System Configuration & Settings](#phase-10-system-configuration--settings)
13. [Phase 11: Security & Compliance](#phase-11-security--compliance)
14. [Phase 12: Notification & Email Management](#phase-12-notification--email-management)
15. [Phase 13: Scheduled Tasks & Background Jobs Monitoring](#phase-13-scheduled-tasks--background-jobs-monitoring)
16. [Phase 14: Public Pages & SEO Management](#phase-14-public-pages--seo-management)
17. [Phase 15: Admin Team & Role Management](#phase-15-admin-team--role-management)
18. [Implementation Priority Order](#implementation-priority-order)
19. [Admin Navigation Structure](#admin-navigation-structure)
20. [Admin UI Design Guidelines](#admin-ui-design-guidelines)

---

## Overview

The Admin Panel is the platform owner's central command center for managing every aspect of FamTree — a family tree and social networking platform with organization support, real-time messaging, group elections, memorial systems, and more.

**Platform Feature Inventory (as of Feb 2026):**
- 54+ Eloquent models
- 50+ controllers across 4 contexts (Admin, Guest, AuthAccess, Org)
- 60+ services, 40+ repositories
- 10+ scheduled artisan commands
- 8 real-time broadcast events (WebSocket)
- 5 mail classes
- 80+ database migrations
- 114 frontend page components, 32 reusable components
- 3 separate authentication flows (User, Admin, Org Staff)

**Key Capabilities Needed:**
- Complete user lifecycle management
- Organization account creation, approval, and oversight
- Content moderation across posts, comments, images, voice, and galleries
- Report review and resolution workflow
- Deceased verification and memorial process oversight
- Messaging and chat monitoring
- Blog content management (CRUD)
- Contact submission handling
- Family tree and connection oversight
- Group election and removal monitoring
- Comprehensive analytics and reporting
- System configuration and health monitoring
- Security auditing and compliance (GDPR)
- Scheduled task monitoring
- Admin team and role management

---

## Current State — What Already Exists

These features are **already implemented** and functional in the admin panel:

### Admin Authentication (DONE)
- [x] Admin login page (`AdminPages/Auth/AdminLogin.tsx`)
- [x] Admin forgot password (`AdminPages/Auth/AdminForgotPassword.tsx`)
- [x] Admin reset password (`AdminPages/Auth/AdminResetPassword.tsx`)
- [x] `auth:admin` guard configured
- [x] Admin model with role-based access
- [x] Session-based authentication

### Admin Dashboard (DONE)
- [x] Dashboard homepage (`AdminPages/Dashboard/Index.tsx`)
- [x] Key metrics cards: total users, active users, pending reports, family trees
- [x] User growth chart with 7/30/90-day filtering
- [x] Connection statistics (accepted/pending/declined with progress bars)
- [x] Report statistics (pending/reviewing/resolved/dismissed)
- [x] Recent admin activity log with timestamps
- [x] Active alerts system (warnings and critical alerts)
- [x] `DashboardService` with `getKeyMetrics()`, `getUserGrowth()`, `getConnectionStats()`, etc.

### User Management (DONE)
- [x] User list with pagination (`AdminPages/Users/Index.tsx`)
- [x] Advanced search by name, email, username
- [x] Multi-filter: account status, 2FA status, account type (primary/child)
- [x] Statistics cards: total users, active, suspended, with 2FA, child accounts
- [x] User detail page with Profile/Security/Activity tabs (`AdminPages/Users/Show.tsx`)
- [x] Account actions: suspend, unsuspend, ban, deactivate, schedule deletion, cancel deletion
- [x] Reset password, enable/disable 2FA
- [x] Complete/reset onboarding
- [x] Action history viewing
- [x] Child accounts viewing (`AdminPages/Users/ChildAccounts.tsx`)
- [x] Child account CRUD (create, update, delete)
- [x] User connections viewing (`AdminPages/Users/Connections.tsx`)
- [x] Remove connections
- [x] User action modal with confirmation and reason input
- [x] `UserService`, `UserActionService`, `ChildAccountService`, `UserConnectionService`

### Admin Layout & UI Components (DONE)
- [x] `AdminLayout.tsx` with collapsible sidebar
- [x] Navigation: Dashboard, Users (sidebar items)
- [x] Reusable components: Alert, Badge, Button, DashboardCard, DataTable, Modal, Pagination
- [x] `UserActionModal.tsx`

### Admin Activity Logging (DONE)
- [x] `admin_activity_logs` table
- [x] Logging of admin actions with IP, user agent, timestamps
- [x] Activity log display on dashboard

---

## Phase 1: Organization Management

**Priority: CRITICAL** — Organizations are a core feature with their own auth system, staff accounts, posts, broadcasts, hierarchies, and groups. The platform owner needs full oversight and creation capabilities.

### 1.1 Organization Account Creation & Approval
- [ ] **Backend**: Create `AdminOrganizationController`
  - `GET /admin/organizations` — List all organizations with search/filter
  - `GET /admin/organizations/{id}` — View organization details
  - `POST /admin/organizations` — Create new organization
  - `PUT /admin/organizations/{id}` — Edit organization details
  - `POST /admin/organizations/{id}/suspend` — Suspend organization
  - `POST /admin/organizations/{id}/unsuspend` — Reactivate organization
  - `DELETE /admin/organizations/{id}` — Delete organization (soft delete)
  - `POST /admin/organizations/{id}/verify` — Mark as verified
  - `POST /admin/organizations/{id}/unverify` — Remove verification

- [ ] **Backend**: Create `AdminOrganizationService`
  - Method: `getAllOrganizations($filters)` — List with filtering (status, category, date range)
  - Method: `createOrganization($data)` — Full org creation including initial staff account
  - Method: `updateOrganization($id, $data)` — Edit org details (name, description, logo, contact info)
  - Method: `suspendOrganization($id, $reason)` — Suspend org and notify staff
  - Method: `deleteOrganization($id)` — Soft-delete org and all associated data
  - Method: `getOrganizationStats($id)` — Followers, posts, broadcasts, members, groups
  - Method: `verifyOrganization($id)` — Mark as platform-verified

- [ ] **Frontend**: Create `AdminPages/Organizations/Index.tsx`
  - Data table: Name, Category, Slug, Status (active/suspended/verified), Staff Count, Follower Count, Created Date, Actions
  - Search by name, slug, category
  - Filter by: status, category, date range, follower count range
  - Statistics cards: total orgs, active, suspended, verified, total followers across orgs
  - Action buttons: View, Edit, Suspend, Delete

- [ ] **Frontend**: Create `AdminPages/Organizations/Show.tsx`
  - Organization profile card: logo, name, short name, description, contact info
  - Tabs: Overview, Structure, Staff, Posts, Broadcasts, Followers, Activity Log
  - **Overview Tab**: Stats (followers, posts, broadcasts, groups, total members), verification status, created date
  - **Structure Tab**: Faculty → Department → Class Set hierarchy (expandable tree)
  - **Staff Tab**: List all staff accounts with roles, last login, active status
  - **Posts Tab**: Recent org posts with engagement metrics
  - **Broadcasts Tab**: Scheduled and sent broadcasts
  - **Followers Tab**: Follower list with join dates
  - **Activity Log Tab**: Org audit trail
  - Admin actions: Edit, Suspend/Unsuspend, Verify/Unverify, Delete

- [ ] **Frontend**: Create `AdminPages/Organizations/Create.tsx`
  - Form fields: name, short name, slug (auto-generated), category, description, vision, mission
  - Logo upload, cover image upload
  - Contact info: address, city, state, country, website, email, phone, founded year
  - Leader info: name, title, qualifications, image
  - Initial staff account creation: username, email, password (auto-generated option)
  - Category selection from `organization_categories` table

- [ ] **Frontend**: Create `AdminPages/Organizations/Edit.tsx`
  - Same form as Create but pre-populated
  - Section to manage verification badge
  - Danger zone: suspend, delete

### 1.2 Organization Category Management
- [ ] **Backend**: CRUD endpoints for `organization_categories`
  - `GET /admin/organization-categories` — List categories
  - `POST /admin/organization-categories` — Create category
  - `PUT /admin/organization-categories/{id}` — Edit category
  - `DELETE /admin/organization-categories/{id}` — Delete category (only if no orgs use it)

- [ ] **Frontend**: Create `AdminPages/Organizations/Categories.tsx`
  - List all categories with org count
  - Inline create/edit/delete
  - Prevent deletion of categories with active organizations

### 1.3 Organization Structure Management (Faculty/Department/Class Set)
- [ ] **Backend**: Admin endpoints for managing org hierarchy
  - `POST /admin/organizations/{id}/faculties` — Create faculty
  - `PUT /admin/organizations/faculties/{id}` — Edit faculty
  - `DELETE /admin/organizations/faculties/{id}` — Delete faculty
  - `POST /admin/organizations/faculties/{id}/departments` — Create department
  - `PUT /admin/organizations/departments/{id}` — Edit department
  - `DELETE /admin/organizations/departments/{id}` — Delete department
  - `POST /admin/organizations/departments/{id}/class-sets` — Create class set
  - `PUT /admin/organizations/class-sets/{id}` — Edit class set
  - `DELETE /admin/organizations/class-sets/{id}` — Delete class set
  - `GET /admin/organizations/class-sets/{id}/members` — View members
  - `POST /admin/organizations/class-sets/{id}/remove-member` — Force remove member

- [ ] **Frontend**: Hierarchy management within org detail page
  - Expandable tree view: Faculty → Department → Class Set → Members
  - Inline add/edit/delete for each level
  - Member count at each level
  - Bulk actions: deactivate class set, move department between faculties

### 1.4 Organization Staff Oversight
- [ ] **Backend**: Admin endpoints for managing org staff from platform level
  - `GET /admin/organizations/{id}/staff` — List staff accounts
  - `POST /admin/organizations/{id}/staff` — Create staff account
  - `POST /admin/organizations/staff/{id}/disable` — Disable staff account
  - `POST /admin/organizations/staff/{id}/reset-password` — Reset staff password

- [ ] **Frontend**: Staff management within org detail page
  - List all staff: username, display name, role, active status, last login
  - Create new staff account (for onboarding new org owners)
  - Disable/enable staff accounts
  - Reset staff passwords
  - View staff activity logs

### 1.5 Organization Analytics (Platform-Wide)
- [ ] **Backend**: Aggregate org analytics
  - Method: `getOrgPlatformStats()` — Total orgs, total org followers, total org posts, total broadcasts, most popular orgs
  - Method: `getOrgGrowth($days)` — Org creation over time
  - Method: `getTopOrganizations($metric, $limit)` — Top by followers, posts, members

- [ ] **Frontend**: Organization analytics section within main analytics page
  - Org creation trend chart
  - Top orgs by followers
  - Top orgs by engagement (posts, broadcasts)
  - Category distribution pie chart

---

## Phase 2: Content Moderation System

**Priority: CRITICAL** — Users create text posts, voice posts, images, comments, and galleries. The platform owner needs tools to moderate all content types.

### 2.1 Post Moderation
- [ ] **Backend**: Create `AdminPostController`
  - `GET /admin/posts` — List all posts with filters
  - `GET /admin/posts/{id}` — View post details with comments and reactions
  - `DELETE /admin/posts/{id}` — Remove post (admin override)
  - `POST /admin/posts/{id}/flag` — Flag post for review
  - `POST /admin/posts/{id}/unflag` — Remove flag
  - `GET /admin/posts/flagged` — List flagged posts

- [ ] **Backend**: Create `AdminPostService`
  - Method: `getAllPosts($filters)` — Filter by type (text/voice), date, user, flagged status, privacy
  - Method: `getPostDetails($id)` — Full post with user, images, comments, reactions
  - Method: `deletePost($id, $reason)` — Admin delete with reason logging
  - Method: `getPostStats()` — Total posts, by type, avg engagement, flagged count

- [ ] **Frontend**: Create `AdminPages/Content/Posts.tsx`
  - Data table: Post ID, Author, Type (text/voice), Title/Preview, Views, Comments, Reactions, Privacy, Flagged, Date, Actions
  - Search by content, author name/username
  - Filter by: type, date range, flagged status, privacy level, engagement range
  - Inline content preview (expandable row)
  - Voice post playback button
  - Image thumbnail previews
  - Action buttons: View, Flag, Delete

- [ ] **Frontend**: Create `AdminPages/Content/PostDetail.tsx`
  - Full post content display
  - Author profile card
  - Images gallery
  - Voice player (if voice post)
  - All comments with threading
  - All reactions breakdown
  - Engagement metrics
  - Admin actions: Delete post, Delete specific comments, Flag/Unflag

### 2.2 Comment Moderation
- [ ] **Backend**: Admin comment endpoints
  - `GET /admin/comments` — List comments with filters (reported, flagged)
  - `DELETE /admin/comments/{id}` — Remove comment
  - `GET /admin/comments/reported` — Comments associated with reported content

- [ ] **Frontend**: Comment moderation within post detail or standalone list
  - View all comments across platform
  - Filter by: reported, date, user
  - Bulk delete comments
  - View comment thread context

### 2.3 Gallery & Image Moderation
- [ ] **Backend**: Admin gallery endpoints
  - `GET /admin/galleries` — List all galleries platform-wide
  - `GET /admin/galleries/{id}` — View gallery images
  - `DELETE /admin/galleries/{id}` — Delete gallery
  - `DELETE /admin/gallery-images/{id}` — Delete specific image

- [ ] **Frontend**: Create `AdminPages/Content/Galleries.tsx`
  - Grid view of galleries with thumbnails
  - Filter by user, date, image count
  - Image lightbox preview
  - Delete individual images or entire galleries
  - Storage usage statistics

### 2.4 Organization Post Moderation
- [ ] **Backend**: Admin org post oversight
  - `GET /admin/org-posts` — List all org posts across all organizations
  - `DELETE /admin/org-posts/{id}` — Remove org post
  - `GET /admin/org-broadcasts` — List all broadcasts

- [ ] **Frontend**: Org content moderation within content section
  - Combined view of org posts and broadcasts
  - Filter by organization, date, type, pinned status
  - View engagement metrics per org post

---

## Phase 3: Report & Safety Management

**Priority: CRITICAL** — Users can report other users. The admin needs a full workflow for reviewing, investigating, and resolving reports.

### 3.1 Report Dashboard
- [ ] **Backend**: Create `AdminReportController`
  - `GET /admin/reports` — List all reports with filters
  - `GET /admin/reports/{id}` — View report details
  - `POST /admin/reports/{id}/review` — Mark as reviewing
  - `POST /admin/reports/{id}/resolve` — Resolve report with action taken
  - `POST /admin/reports/{id}/dismiss` — Dismiss report
  - `GET /admin/reports/stats` — Report statistics

- [ ] **Backend**: Create `AdminReportService`
  - Method: `getAllReports($filters)` — Filter by status, reason, date, reported user
  - Method: `getReportDetails($id)` — Full report with reporter info, reported user info, history
  - Method: `resolveReport($id, $action, $notes)` — Resolve with action (warn, suspend, ban, no action)
  - Method: `getReportedUserHistory($userId)` — All reports against a user
  - Method: `getReportStats()` — Pending, reviewing, resolved, dismissed counts
  - Method: `getRepeatOffenders($threshold)` — Users with multiple reports

- [ ] **Frontend**: Create `AdminPages/Reports/Index.tsx`
  - Data table: Report ID, Reported User, Reporter, Reason, Description Preview, Status, Date, Actions
  - Status badges: Pending (yellow), Reviewing (blue), Resolved (green), Dismissed (gray)
  - Filter by: status, reason (harassment, spam, inappropriate, impersonation, other), date range
  - Search by user name/username
  - Statistics cards: total reports, pending, resolved this month, repeat offenders
  - Quick action buttons: Review, Resolve, Dismiss

- [ ] **Frontend**: Create `AdminPages/Reports/Show.tsx`
  - Report details: reason, full description, date filed
  - Reporter profile card with report history (how many reports they've filed)
  - Reported user profile card with report history (how many reports against them)
  - Previous reports against this user (repeat offender detection)
  - Admin action panel:
    - Status update dropdown: Reviewing, Resolved, Dismissed
    - Action taken: No Action, Warning Sent, Account Suspended, Account Banned
    - Admin notes text area
    - Save button
  - Timeline of all actions taken on this report

### 3.2 User Block Oversight
- [ ] **Backend**: Admin block endpoints
  - `GET /admin/blocks` — List all user-to-user blocks
  - `GET /admin/blocks/user/{userId}` — Blocks by/against specific user
  - `DELETE /admin/blocks/{id}` — Force unblock (admin override)
  - `POST /admin/blocks/admin-block` — Platform-level block (admin blocks user from platform features)

- [ ] **Frontend**: Block management section
  - List all blocks with filter by user
  - View who blocked whom
  - Force unblock capability
  - Admin-level blocking for severe cases

---

## Phase 4: Deceased Verification & Memorial Management

**Priority: HIGH** — The platform has an automated 3-stage deceased verification process. The admin needs oversight and manual intervention capabilities.

### 4.1 Verification Process Oversight
- [ ] **Backend**: Create `AdminMemorialController`
  - `GET /admin/verifications` — List all deceased verifications with status
  - `GET /admin/verifications/{id}` — View verification details with responses
  - `POST /admin/verifications/{id}/cancel` — Admin cancel verification
  - `POST /admin/verifications/{id}/expedite` — Skip to next stage
  - `POST /admin/verifications/{id}/override-deceased` — Manually mark as deceased
  - `POST /admin/verifications/{id}/override-alive` — Manually mark as alive
  - `GET /admin/memorialized` — List all memorialized accounts
  - `POST /admin/users/{id}/memorialize` — Manually memorialize a user
  - `POST /admin/users/{id}/unmemorial` — Revert memorialization

- [ ] **Backend**: Create `AdminMemorialService`
  - Method: `getAllVerifications($filters)` — Filter by stage, status, date
  - Method: `getVerificationDetails($id)` — Full verification with all family responses
  - Method: `cancelVerification($id, $reason)` — Admin cancel with reason
  - Method: `manuallyMemorialize($userId, $reason)` — Skip process and memorialize
  - Method: `revertMemorialization($userId, $reason)` — Undo memorialization
  - Method: `getMemorialStats()` — Total memorialized, in-progress, cancelled
  - Method: `getActiveVerifications()` — Currently active verification processes

- [ ] **Frontend**: Create `AdminPages/Memorial/Verifications.tsx`
  - Data table: User, Stage (reengagement/family_check/pending_change), Status, Started Date, Family Responses, Actions
  - Stage badge colors: reengagement (orange), family_check (blue), pending_change (purple), completed (green), cancelled (gray)
  - Filter by stage, status, date range
  - Statistics: active verifications, completed this month, cancelled, total memorialized accounts
  - Action buttons: View, Cancel, Expedite, Override

- [ ] **Frontend**: Create `AdminPages/Memorial/VerificationDetail.tsx`
  - User profile card (the inactive user)
  - Verification timeline: each stage with timestamps
  - Family responses table: Responder, Relationship, Response (alive/deceased/unknown), Date
  - Response tally: alive vs deceased vs unknown counts
  - Admin action panel: Cancel, Expedite to Next Stage, Override as Deceased, Override as Alive
  - Notes field for admin reasoning

- [ ] **Frontend**: Create `AdminPages/Memorial/MemorializedUsers.tsx`
  - List all memorialized users
  - Date memorialized, memorialized by (system vs admin)
  - Reactivation token status (active/expired/used)
  - Action: Revert memorialization
  - Memorial messages count per user

### 4.2 Memorial Configuration
- [ ] **Backend**: Configurable settings for memorial process
  - Inactivity threshold (currently 6 months)
  - Reengagement email wait period (currently 3 days)
  - Minimum family responses required (currently 2)
  - Pending change wait period (currently 30 days)
  - Reactivation token expiry period

- [ ] **Frontend**: Memorial settings section within system settings
  - Edit all configurable thresholds
  - Toggle deceased verification feature on/off
  - View/edit email templates (reengagement, family check, status change, memorial created, reactivation)

---

## Phase 5: Messaging & Chat Oversight

**Priority: HIGH** — Three messaging systems exist: private DMs, family tree chat, and class set (org group) chat. The admin needs monitoring and moderation tools.

### 5.1 Private Message Monitoring
- [ ] **Backend**: Admin messaging endpoints
  - `GET /admin/conversations` — List all conversations with last message timestamp
  - `GET /admin/conversations/{id}/messages` — View conversation messages
  - `DELETE /admin/messages/{id}` — Delete specific message (admin)
  - `GET /admin/messages/stats` — Messaging statistics

- [ ] **Frontend**: Create `AdminPages/Messaging/Conversations.tsx`
  - List all conversations: User 1, User 2, Last Message Date, Message Count, Actions
  - Search by user name/username
  - Filter by: date range, message count
  - Statistics: total conversations, active today, total messages

- [ ] **Frontend**: Create `AdminPages/Messaging/ViewConversation.tsx`
  - Full message thread display (read-only for admin)
  - Message metadata: sent time, delivered time, read time, edited
  - Delete individual messages button
  - User profile links for both participants

### 5.2 Family Tree Chat Monitoring
- [ ] **Backend**: Admin tree chat endpoints
  - `GET /admin/tree-chats` — List all family tree chats with activity
  - `GET /admin/tree-chats/{treeId}/messages` — View tree chat messages
  - `DELETE /admin/tree-chat-messages/{id}` — Delete message

- [ ] **Frontend**: Tree chat monitoring
  - List family trees with chat activity
  - Message count, last activity, member count
  - View messages with sender info

### 5.3 Class Set Chat Monitoring
- [ ] **Backend**: Admin class set chat endpoints
  - `GET /admin/class-set-chats` — List all class set chats with activity
  - `GET /admin/class-set-chats/{classSetId}/messages` — View messages
  - `DELETE /admin/class-set-messages/{id}` — Delete message

- [ ] **Frontend**: Class set chat monitoring
  - List class sets with chat activity
  - View messages including org broadcast messages
  - Filter by organization

### 5.4 Messaging Analytics
- [ ] **Backend**: Messaging statistics
  - Total DM conversations, messages sent today/this week/this month
  - Total tree chat messages, active tree chats
  - Total class set messages, active class set chats
  - Average messages per conversation
  - Most active chat groups

- [ ] **Frontend**: Messaging analytics section within main analytics
  - Message volume charts (DMs, tree chat, group chat)
  - Active hours heatmap
  - Growth trends

---

## Phase 6: Blog & Contact Management

**Priority: HIGH** — Blog posts and contact submissions exist but have no admin CRUD interface.

### 6.1 Blog Content Management
- [ ] **Backend**: Create `AdminBlogController`
  - `GET /admin/blog` — List all blog posts
  - `GET /admin/blog/create` — Create form
  - `POST /admin/blog` — Store new blog post
  - `GET /admin/blog/{id}/edit` — Edit form
  - `PUT /admin/blog/{id}` — Update blog post
  - `DELETE /admin/blog/{id}` — Delete blog post
  - `POST /admin/blog/{id}/publish` — Publish draft
  - `POST /admin/blog/{id}/unpublish` — Unpublish

- [ ] **Backend**: Create `AdminBlogService`
  - Method: `getAllPosts($filters)` — Filter by status (draft/published), date, search
  - Method: `createPost($data)` — Create with title, slug, content, excerpt, featured image, published status
  - Method: `updatePost($id, $data)` — Update post
  - Method: `deletePost($id)` — Soft delete
  - Method: `publishPost($id)` — Set published_at timestamp
  - Method: `getBlogStats()` — Total posts, published, drafts, views

- [ ] **Frontend**: Create `AdminPages/Blog/Index.tsx`
  - Data table: Title, Slug, Status (Published/Draft), Published Date, Actions
  - Search by title, content
  - Filter by status, date range
  - Create new post button

- [ ] **Frontend**: Create `AdminPages/Blog/Create.tsx` and `Edit.tsx`
  - Rich text editor for content (similar to user post creation)
  - Title, slug (auto-generated from title, editable)
  - Excerpt field
  - Featured image upload
  - Status toggle: Draft / Published
  - Published date picker
  - Preview button
  - Save / Publish buttons

### 6.2 Contact Submission Management
- [ ] **Backend**: Create `AdminContactController`
  - `GET /admin/contact-submissions` — List all submissions
  - `GET /admin/contact-submissions/{id}` — View submission details
  - `POST /admin/contact-submissions/{id}/mark-read` — Mark as read
  - `POST /admin/contact-submissions/{id}/respond` — Send email response
  - `DELETE /admin/contact-submissions/{id}` — Delete submission
  - `GET /admin/contact-submissions/export` — Export as CSV

- [ ] **Backend**: Create `AdminContactService`
  - Method: `getAllSubmissions($filters)` — Filter by status (new/read/responded), date
  - Method: `markAsRead($id)` — Mark submission as read
  - Method: `respondToSubmission($id, $response)` — Send email reply and log it
  - Method: `getContactStats()` — Total, unread, responded count

- [ ] **Frontend**: Create `AdminPages/Contact/Index.tsx`
  - Data table: Name, Email, Subject, Status (New/Read/Responded), Date, Actions
  - Unread count badge in sidebar navigation
  - Filter by status, date range
  - Search by name, email, subject, message content
  - Action buttons: View, Mark Read, Respond, Delete
  - Export button

- [ ] **Frontend**: Create `AdminPages/Contact/Show.tsx`
  - Submitter info: name, email
  - Subject and full message display
  - Status indicator with timestamp
  - Reply form: text area, send button
  - Previous admin response (if any)
  - Delete button

---

## Phase 7: Family Tree & Connection Oversight

**Priority: MEDIUM** — Family trees and connections are the core of the platform. Admin needs monitoring and intervention tools.

### 7.1 Family Tree Management
- [ ] **Backend**: Create `AdminFamilyTreeController`
  - `GET /admin/family-trees` — List all family trees
  - `GET /admin/family-trees/{id}` — View tree details with members
  - `DELETE /admin/family-trees/{id}` — Delete tree (admin override)
  - `POST /admin/family-trees/{id}/toggle-visibility` — Force public/private
  - `GET /admin/family-trees/{id}/chat` — View tree chat messages

- [ ] **Backend**: Create `AdminFamilyTreeService`
  - Method: `getAllTrees($filters)` — Filter by visibility, size, date, merged status
  - Method: `getTreeDetails($id)` — Full tree with members, admins, connections, chat stats
  - Method: `deleteTree($id, $reason)` — Admin delete with logging
  - Method: `getTreeStats()` — Total trees, public vs private, avg members, merged trees count
  - Method: `getLargestTrees($limit)` — Trees with most members

- [ ] **Frontend**: Create `AdminPages/FamilyTrees/Index.tsx`
  - Data table: Tree Name, Root User, Members Count, Visibility, Type (Nuclear/Extended), Merged, Created Date, Actions
  - Filter by: visibility, type, date range, member count range
  - Search by tree name, root user
  - Statistics: total trees, public, private, nuclear, merged
  - Action buttons: View, Toggle Visibility, Delete

- [ ] **Frontend**: Create `AdminPages/FamilyTrees/Show.tsx`
  - Tree info card: name, description, root user, visibility, type
  - Member list with roles (creator, admin, member)
  - Tree admin list
  - Merged trees information (if merged)
  - Chat statistics (message count, last activity)
  - Tree connection requests (pending/accepted/declined)
  - Admin actions: Toggle visibility, Delete tree

### 7.2 Connection Oversight
- [ ] **Backend**: Admin connection endpoints
  - `GET /admin/connections` — List all connections platform-wide with filters
  - `GET /admin/connections/stats` — Connection statistics
  - `DELETE /admin/connections/{id}` — Force disconnect (already exists via user page)
  - `GET /admin/connections/divorced` — List all divorced connections

- [ ] **Frontend**: Create `AdminPages/Connections/Index.tsx`
  - Data table: User 1, User 2, Relationship Type, Status, Divorced, Connected Date, Actions
  - Filter by: relationship type, status (accepted/pending), divorced status, date range
  - Statistics: total connections, by relationship type breakdown, divorced count, pending count
  - Relationship type distribution chart

### 7.3 Suggested Connections Analytics
- [ ] **Backend**: Suggested connection metrics
  - Method: `getSuggestionStats()` — Total suggestions generated, acceptance rate, most common suggestion types

- [ ] **Frontend**: Suggestion metrics within analytics
  - Acceptance rate chart
  - Most effective suggestion types
  - Suggestions per user average

---

## Phase 8: Group Administration Oversight

**Priority: MEDIUM** — Class sets have automated democratic elections and consensus-based member removal. Admin needs to monitor and intervene.

### 8.1 Election Monitoring
- [ ] **Backend**: Create `AdminElectionController`
  - `GET /admin/elections` — List all elections (active and completed)
  - `GET /admin/elections/{id}` — View election details with candidates and votes
  - `POST /admin/elections/{id}/cancel` — Cancel active election
  - `POST /admin/elections/{id}/extend` — Extend voting period

- [ ] **Frontend**: Create `AdminPages/Groups/Elections.tsx`
  - Data table: Class Set, Organization, Type (initial/replacement/tiebreaker), Status (active/completed), Positions to Fill, Started, Ends, Actions
  - Filter by: status, type, organization, date range
  - Statistics: active elections, completed this month, avg voter turnout
  - View details: candidates, vote counts, winners

### 8.2 Member Removal Monitoring
- [ ] **Backend**: Create `AdminRemovalController`
  - `GET /admin/removals` — List all removal processes
  - `GET /admin/removals/{id}` — View removal details with votes
  - `POST /admin/removals/{id}/cancel` — Admin cancel removal
  - `POST /admin/removals/{id}/execute` — Admin force execute removal

- [ ] **Frontend**: Create `AdminPages/Groups/Removals.tsx`
  - Data table: Class Set, Organization, Target User, Initiator, Status (pending/confirmed/cancelled), Votes, Expires, Actions
  - Filter by: status, organization, date range
  - View details: target user, initiator, all votes (confirm/reject), expiry

### 8.3 Class Set Member Management
- [ ] **Backend**: Admin class set member endpoints
  - `GET /admin/class-sets/{id}/members` — List members with admin/muted status
  - `POST /admin/class-sets/{id}/promote` — Force promote user to admin
  - `POST /admin/class-sets/{id}/demote` — Force demote admin
  - `POST /admin/class-sets/{id}/mute` — Mute member
  - `POST /admin/class-sets/{id}/unmute` — Unmute member
  - `POST /admin/class-sets/{id}/remove-member` — Force remove member (already exists in 1.3)

---

## Phase 9: Advanced Analytics & Reporting

**Priority: MEDIUM** — Comprehensive analytics for platform-level decision making.

### 9.1 Analytics Dashboard Enhancement
- [ ] **Backend**: Create `AdminAnalyticsController`
  - `GET /admin/analytics/overview` — Platform-wide overview
  - `GET /admin/analytics/users` — User growth, retention, demographics
  - `GET /admin/analytics/content` — Posts, comments, reactions, engagement
  - `GET /admin/analytics/connections` — Connection and relationship analytics
  - `GET /admin/analytics/organizations` — Org-level analytics
  - `GET /admin/analytics/messaging` — Messaging volume and trends
  - `GET /admin/analytics/export` — Export analytics data as CSV/PDF

- [ ] **Backend**: Create `AdminAnalyticsService`
  - Method: `getOverview($dateRange)` — All high-level metrics
  - Method: `getUserAnalytics($dateRange)` — Registrations, active users, retention, churn
  - Method: `getContentAnalytics($dateRange)` — Posts created, engagement rates, content types
  - Method: `getConnectionAnalytics($dateRange)` — Connections formed, request acceptance rates
  - Method: `getOrgAnalytics($dateRange)` — Org growth, engagement, broadcasts
  - Method: `getMessagingAnalytics($dateRange)` — Message volume, active conversations
  - Method: `getUserRetentionCohorts()` — Cohort-based retention analysis
  - Method: `getFeatureUsage()` — Which features are most/least used

- [ ] **Frontend**: Create `AdminPages/Analytics/Overview.tsx`
  - Key metrics cards: total users, DAU, MAU, posts today, new connections today
  - Multi-metric line chart with date range selector (7/30/90/365 days)
  - Feature usage breakdown bar chart
  - Quick links to detailed analytics pages

- [ ] **Frontend**: Create `AdminPages/Analytics/Users.tsx`
  - User registration trend chart
  - Active users (DAU/WAU/MAU) chart
  - Retention cohort table (signup week vs retention %)
  - User status distribution pie chart (active/inactive/suspended/memorialized)
  - Account type breakdown (primary vs child)
  - 2FA adoption rate over time
  - Top users by connections/posts/followers

- [ ] **Frontend**: Create `AdminPages/Analytics/Content.tsx`
  - Posts created per day/week chart
  - Content type distribution (text vs voice)
  - Average engagement per post (views, comments, reactions)
  - Top posts by engagement
  - Refam statistics
  - Gallery upload trends
  - Comment and reaction trends

- [ ] **Frontend**: Create `AdminPages/Analytics/Connections.tsx`
  - Connections formed per day chart
  - Request acceptance rate over time
  - Relationship type distribution pie chart
  - Divorce rate tracking
  - Average connections per user histogram
  - Suggested connection effectiveness

- [ ] **Frontend**: Create `AdminPages/Analytics/Organizations.tsx`
  - Organization creation trend
  - Top organizations by followers/posts/members
  - Category distribution
  - Broadcast frequency and reach
  - Org engagement metrics

- [ ] **Frontend**: Export functionality
  - Date range selection
  - Export as CSV or PDF
  - Scheduled report delivery (future enhancement)

---

## Phase 10: System Configuration & Settings

**Priority: MEDIUM** — Platform-wide settings management.

### 10.1 General Settings
- [ ] **Database**: Create `system_settings` table (if not exists)
  - Fields: `id`, `key` (unique), `value` (JSON), `group`, `description`, `is_editable`, `updated_by_admin_id`, `updated_at`, `created_at`

- [ ] **Backend**: Create `AdminSettingsController`
  - `GET /admin/settings` — Get all settings grouped by category
  - `PUT /admin/settings` — Update settings
  - `POST /admin/cache/clear` — Clear application cache
  - `POST /admin/maintenance-mode/toggle` — Toggle maintenance mode

- [ ] **Frontend**: Create `AdminPages/Settings/General.tsx`
  - Application settings: app name, contact email, support email
  - Logo and favicon upload
  - Maintenance mode toggle with custom message
  - Cache clear button
  - Save button with confirmation

### 10.2 Feature Toggles
- [ ] **Frontend**: Create `AdminPages/Settings/Features.tsx`
  - Toggle features on/off platform-wide:
    - User registration (open/closed/invite-only)
    - OAuth login (Google)
    - Voice posts
    - Family tree creation
    - Organization features
    - Blog
    - Contact form
    - Deceased verification
    - Follow system
    - Refam (re-share)

### 10.3 Content & Limits Settings
- [ ] **Frontend**: Create `AdminPages/Settings/Limits.tsx`
  - Max post content length
  - Max images per post
  - Max voice duration
  - Max gallery images per user
  - Max child accounts per user
  - Max family tree members
  - Chat message retention period (auto-cleanup)
  - Activity log retention period (auto-cleanup)

### 10.4 Registration & Onboarding Settings
- [ ] **Frontend**: Registration settings
  - Password policy (min length, uppercase, lowercase, number requirements)
  - Email verification required (yes/no)
  - Onboarding steps (enable/disable individual steps)
  - Default privacy settings for new users

---

## Phase 11: Security & Compliance

**Priority: MEDIUM** — Security monitoring, audit trails, and GDPR compliance.

### 11.1 Security Dashboard
- [ ] **Backend**: Security endpoints
  - `GET /admin/security/login-attempts` — Failed login attempts
  - `GET /admin/security/sessions` — Active user sessions
  - `POST /admin/security/force-logout/{userId}` — Force logout user
  - `GET /admin/security/2fa-stats` — 2FA adoption metrics
  - `GET /admin/security/suspicious-activity` — Flag unusual patterns

- [ ] **Frontend**: Create `AdminPages/Security/Dashboard.tsx`
  - Failed login attempts chart (last 24h, 7d, 30d)
  - Active sessions count
  - 2FA adoption rate card
  - Suspicious activity alerts (multiple failed logins, unusual locations)
  - Force logout capability
  - Account lockout management

### 11.2 Admin Activity Audit Trail
- [ ] **Frontend**: Create `AdminPages/Security/AuditLog.tsx`
  - Full log of all admin actions (already tracked in `admin_activity_logs`)
  - Columns: Admin, Action, Resource, Details, IP Address, Date
  - Filter by: admin, action type, resource type, date range
  - Search by description
  - Export as CSV

### 11.3 GDPR & Data Privacy
- [ ] **Backend**: Create `AdminDataExportController`
  - `POST /admin/users/{id}/export-data` — Export all user data (GDPR right to access)
  - `POST /admin/users/{id}/anonymize` — Anonymize user data (GDPR right to erasure)
  - `GET /admin/data-requests` — List pending data export/deletion requests

- [ ] **Frontend**: Create `AdminPages/Security/DataPrivacy.tsx`
  - Pending data requests list
  - Export user data button (generates downloadable archive)
  - Anonymize user data button (with confirmation)
  - Data retention policy configuration
  - Privacy policy last updated date

---

## Phase 12: Notification & Email Management

**Priority: LOW-MEDIUM** — Manage platform notifications and email delivery.

### 12.1 System-Wide Notifications
- [ ] **Backend**: Admin notification endpoints
  - `POST /admin/notifications/broadcast` — Send notification to all users or filtered group
  - `GET /admin/notifications/history` — List sent system notifications
  - `GET /admin/notifications/stats` — Notification delivery and read rates

- [ ] **Frontend**: Create `AdminPages/Notifications/Broadcast.tsx`
  - Compose system notification: title, message, type
  - Target audience: all users, active users, specific group
  - Schedule for later or send immediately
  - Preview before sending
  - History of sent broadcasts with delivery stats

### 12.2 Email Monitoring
- [ ] **Backend**: Email tracking endpoints
  - `GET /admin/emails/history` — Sent email log
  - `GET /admin/emails/failed` — Failed email deliveries
  - `POST /admin/emails/test` — Send test email
  - `GET /admin/emails/stats` — Email delivery metrics

- [ ] **Frontend**: Create `AdminPages/Emails/Index.tsx`
  - Email delivery log: recipient, type, status (sent/failed), date
  - Failed emails with error details and retry button
  - Test email form
  - Email type breakdown (verification, memorial, reengagement, password reset, etc.)
  - Delivery success rate chart

### 12.3 Email Template Management
- [ ] **Frontend**: Create `AdminPages/Emails/Templates.tsx`
  - List all email templates (ReengagementMail, FamilyStatusCheckMail, StatusChangePendingMail, MemorialCreatedMail, AccountReactivationMail)
  - View/edit template content
  - Preview rendered template
  - Send test of each template

---

## Phase 13: Scheduled Tasks & Background Jobs Monitoring

**Priority: LOW-MEDIUM** — Monitor the 10+ scheduled commands that run automatically.

### 13.1 Scheduled Task Dashboard
- [ ] **Backend**: Create `AdminSchedulerController`
  - `GET /admin/scheduler` — List all scheduled tasks with last run times
  - `GET /admin/scheduler/{task}/history` — Run history for specific task
  - `POST /admin/scheduler/{task}/run` — Manually trigger a task
  - `GET /admin/failed-jobs` — List failed queue jobs
  - `POST /admin/failed-jobs/{id}/retry` — Retry failed job

- [ ] **Frontend**: Create `AdminPages/System/Scheduler.tsx`
  - List all scheduled commands:
    - `CheckInactiveUsersCommand` — Detect inactive users (6 months)
    - `ProcessReengagementStageCommand` — Progress reengagement → family check
    - `ProcessFamilyResponsesCommand` — Process family status responses
    - `ExecutePendingStatusChangesCommand` — Execute memorial status changes
    - `ProcessGroupElections` — Finalize elections and handle tiebreakers
    - `ProcessPendingRemovals` — Finalize member removal votes
    - `CleanupOldChatMessages` — Clean up old chat messages
    - `CleanupOldActivityLogs` — Archive old activity logs
    - `DeleteExpiredAccounts` — Delete accounts past scheduled deletion date
    - `ProcessOrgBroadcasts` — Send scheduled org announcements
  - For each: last run time, next scheduled run, last result (success/failure), run count
  - Manual run button
  - Failed jobs list with retry/delete

### 13.2 System Health
- [ ] **Backend**: System health endpoints
  - `GET /admin/system/health` — Database connectivity, Redis status, disk space, queue size
  - `GET /admin/system/database-stats` — Table sizes, row counts, index health
  - `GET /admin/system/storage` — Upload storage usage, image counts

- [ ] **Frontend**: Create `AdminPages/System/Health.tsx`
  - Health check cards: Database (connected/error), Redis (connected/error), Disk Space, Queue Size
  - Database table sizes
  - Storage usage (profile images, post images, gallery images, voice files)
  - Application version info
  - PHP/Laravel/Node versions

---

## Phase 14: Public Pages & SEO Management

**Priority: LOW** — Manage public-facing pages that unauthenticated users see.

### 14.1 Public Pages Editor
- [ ] **Database**: Create `public_pages` table
  - Fields: `id`, `slug`, `title`, `content` (JSON), `meta_description`, `meta_keywords`, `is_published`, `edited_by_admin_id`, `last_edited_at`, `created_at`, `updated_at`

- [ ] **Backend**: Create `AdminPublicPageController`
  - `GET /admin/pages` — List all public pages
  - `GET /admin/pages/{slug}/edit` — Edit page
  - `PUT /admin/pages/{slug}` — Save page changes
  - `POST /admin/pages/{slug}/publish` — Publish
  - `POST /admin/pages/{slug}/unpublish` — Unpublish

- [ ] **Frontend**: Create `AdminPages/PublicPages/Index.tsx`
  - List pages: Home, About, Features, How It Works, Contact
  - Status: Published/Draft
  - Last edited date and by whom
  - Edit button

- [ ] **Frontend**: Create `AdminPages/PublicPages/Editor.tsx`
  - Rich text editor for page content
  - SEO fields: meta title, meta description, meta keywords
  - OG image upload (for social sharing)
  - Publish/unpublish toggle
  - Preview button

### 14.2 Testimonials Management
- [ ] **Backend**: CRUD for homepage testimonials
- [ ] **Frontend**: Manage testimonials shown on homepage
  - Add/edit/delete testimonials
  - Reorder testimonials
  - Toggle visibility

### 14.3 Family Explorer Management
- [ ] **Backend**: Admin family explorer endpoints
  - `GET /admin/family-explorer` — View all public families
  - `POST /admin/families/{id}/feature` — Feature a family on explorer
  - `POST /admin/families/{id}/hide` — Hide from explorer

- [ ] **Frontend**: Manage featured families
  - Feature/unfeature families on the explorer page
  - Hide inappropriate families
  - Reorder featured families

---

## Phase 15: Admin Team & Role Management

**Priority: LOW** — As the platform grows, multiple admins with different roles will be needed.

### 15.1 Admin Account Management
- [ ] **Backend**: Admin user CRUD
  - `GET /admin/team` — List all admin accounts
  - `POST /admin/team` — Create new admin account
  - `PUT /admin/team/{id}` — Edit admin account
  - `POST /admin/team/{id}/disable` — Disable admin account
  - `POST /admin/team/{id}/reset-password` — Reset admin password

- [ ] **Frontend**: Create `AdminPages/Team/Index.tsx`
  - List all admin accounts: name, email, role, active status, last login
  - Create new admin account
  - Edit admin details and role
  - Disable/enable accounts
  - Reset passwords

### 15.2 Admin Role & Permission Management
- [ ] **Backend**: Role and permission management
  - Roles: `super_admin`, `content_moderator`, `user_manager`, `system_analyst`, `support_team`
  - Permissions per role: which sections they can access, read-only vs read-write

- [ ] **Frontend**: Create `AdminPages/Team/Roles.tsx`
  - List roles with associated permissions
  - Create custom roles
  - Assign permissions per section (Users, Reports, Content, Analytics, Settings, etc.)
  - Read-only vs full access per section

---

## Implementation Priority Order

### Tier 1 — Critical (Deploy Blockers)
1. **Phase 1.1–1.4**: Organization Management (creation, approval, staff, structure)
2. **Phase 2.1–2.2**: Post & Comment Moderation
3. **Phase 3.1**: Report Dashboard & Resolution Workflow
4. **Phase 6.1**: Blog Content Management (CRUD)
5. **Phase 6.2**: Contact Submission Management

### Tier 2 — High Priority (First Month Post-Deploy)
6. **Phase 4.1–4.2**: Deceased Verification & Memorial Oversight
7. **Phase 5.1–5.3**: Messaging & Chat Monitoring
8. **Phase 2.3–2.4**: Gallery & Org Post Moderation
9. **Phase 3.2**: User Block Oversight
10. **Phase 7.1**: Family Tree Management

### Tier 3 — Medium Priority (First Quarter)
11. **Phase 8.1–8.3**: Group Election & Removal Monitoring
12. **Phase 9.1**: Advanced Analytics (Overview, Users, Content)
13. **Phase 7.2–7.3**: Connection Oversight & Suggestion Analytics
14. **Phase 10.1–10.4**: System Configuration & Settings
15. **Phase 11.1–11.2**: Security Dashboard & Audit Trail

### Tier 4 — Lower Priority (Ongoing Enhancement)
16. **Phase 1.5**: Organization Analytics (Platform-Wide)
17. **Phase 9 continued**: Analytics for Connections, Orgs, Messaging
18. **Phase 12.1–12.3**: Notification & Email Management
19. **Phase 13.1–13.2**: Scheduled Task Monitoring & System Health
20. **Phase 14.1–14.3**: Public Pages & SEO Management
21. **Phase 15.1–15.2**: Admin Team & Role Management
22. **Phase 11.3**: GDPR & Data Privacy

---

## Admin Navigation Structure

```
Admin Panel
├── Dashboard (/admin/dashboard) ........................ [DONE]
├── Users (/admin/users) ................................ [DONE]
│   ├── User List (/admin/users)
│   ├── User Detail (/admin/users/{id})
│   ├── Child Accounts (/admin/users/{id}/child-accounts)
│   └── Connections (/admin/users/{id}/connections)
├── Organizations (/admin/organizations) ................ [TODO]
│   ├── Organization List (/admin/organizations)
│   ├── Create Organization (/admin/organizations/create)
│   ├── Organization Detail (/admin/organizations/{id})
│   ├── Edit Organization (/admin/organizations/{id}/edit)
│   └── Categories (/admin/organization-categories)
├── Content (/admin/content) ............................ [TODO]
│   ├── Posts (/admin/posts)
│   ├── Post Detail (/admin/posts/{id})
│   ├── Galleries (/admin/galleries)
│   └── Org Posts (/admin/org-posts)
├── Reports (/admin/reports) ............................ [TODO]
│   ├── Report List (/admin/reports)
│   ├── Report Detail (/admin/reports/{id})
│   └── Blocks (/admin/blocks)
├── Memorial (/admin/memorial) .......................... [TODO]
│   ├── Verifications (/admin/verifications)
│   ├── Verification Detail (/admin/verifications/{id})
│   └── Memorialized Users (/admin/memorialized)
├── Family Trees (/admin/family-trees) .................. [TODO]
│   ├── Tree List (/admin/family-trees)
│   ├── Tree Detail (/admin/family-trees/{id})
│   └── Connections (/admin/connections)
├── Groups (/admin/groups) .............................. [TODO]
│   ├── Elections (/admin/elections)
│   └── Removals (/admin/removals)
├── Messaging (/admin/messaging) ........................ [TODO]
│   ├── Conversations (/admin/conversations)
│   ├── Tree Chats (/admin/tree-chats)
│   └── Class Set Chats (/admin/class-set-chats)
├── Blog (/admin/blog) ................................. [TODO]
│   ├── Post List (/admin/blog)
│   ├── Create Post (/admin/blog/create)
│   └── Edit Post (/admin/blog/{id}/edit)
├── Contact (/admin/contact-submissions) ................ [TODO]
├── Analytics (/admin/analytics) ........................ [TODO]
│   ├── Overview (/admin/analytics)
│   ├── Users (/admin/analytics/users)
│   ├── Content (/admin/analytics/content)
│   ├── Connections (/admin/analytics/connections)
│   ├── Organizations (/admin/analytics/organizations)
│   └── Messaging (/admin/analytics/messaging)
├── System (/admin/system) .............................. [TODO]
│   ├── Scheduler (/admin/system/scheduler)
│   ├── Health (/admin/system/health)
│   └── Failed Jobs (/admin/system/failed-jobs)
├── Security (/admin/security) .......................... [TODO]
│   ├── Dashboard (/admin/security)
│   ├── Audit Log (/admin/security/audit-log)
│   └── Data Privacy (/admin/security/data-privacy)
├── Notifications (/admin/notifications) ................ [TODO]
│   ├── Broadcast (/admin/notifications/broadcast)
│   └── Email Log (/admin/emails)
├── Settings (/admin/settings) .......................... [TODO]
│   ├── General (/admin/settings/general)
│   ├── Features (/admin/settings/features)
│   ├── Limits (/admin/settings/limits)
│   └── Registration (/admin/settings/registration)
├── Public Pages (/admin/pages) ......................... [TODO]
├── Team (/admin/team) .................................. [TODO]
│   ├── Admin Accounts (/admin/team)
│   └── Roles (/admin/team/roles)
└── Logout
```

---

## Admin UI Design Guidelines

### Color Scheme
- **Primary**: #0052E8 (Blue)
- **Danger**: #FF4757 (Red)
- **Success**: #00D97F (Green)
- **Warning**: #FFB84D (Orange)
- **Secondary**: #6C757D (Gray)
- **Background**: #F9FAFB (Light Gray)
- **Text**: #1a1a1a (Dark)

### Components & Patterns
- Consistent data tables with sortable columns and pagination
- Breadcrumb navigation on all pages
- Confirmation modals for destructive actions
- Toast notifications for success/error feedback
- Status badges with consistent color coding
- Search bars with debounced input
- Date range pickers for filtering
- Export buttons (CSV/PDF) on data-heavy pages
- Responsive sidebar that collapses on mobile
- Loading skeletons for async data

### Existing Reusable Components
- `Admin/Alert.tsx` — Alert box
- `Admin/Badge.tsx` — Status badge
- `Admin/Button.tsx` — Button
- `Admin/DashboardCard.tsx` — Metric card
- `Admin/DataTable.tsx` — Data table with sorting
- `Admin/Modal.tsx` — Modal dialog
- `Admin/Pagination.tsx` — Pagination controls
- `AdminComponents/UserActionModal.tsx` — Action confirmation modal

---

## Notes

- **Security**: All admin actions must be logged to `admin_activity_logs`
- **Performance**: Use pagination everywhere; avoid loading all records
- **Real-time**: Consider WebSocket notifications for new reports, contact submissions
- **Docker**: All commands run via `docker-compose exec -T famtree`
- **Inertia Pattern**: Controllers return `Inertia::render()`, NOT JSON responses. Use `redirect()->back()->with('success/error', ...)` for actions
- **Service Pattern**: Controller → Service → Repository → Model (follow existing codebase conventions)
- **Testing**: Create feature tests for all admin endpoints
- **Accessibility**: Follow WCAG guidelines for all admin interfaces
