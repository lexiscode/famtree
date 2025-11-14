# 📋 FAMTREE DEVELOPMENT TODOS

**Last Updated:** November 14, 2025
**Status:** Ready for Implementation
**Priority:** Critical Features First

---

## 🎯 Phase 1: Authentication & User Profile Foundation

### 1.1 User Registration Enhancement
- [ ] **Backend**: Update User model with additional fields: `phone`, `address`, `bio`, `date_of_birth`, `profile_image_url`, `status` (Alive/Deceased)
- [ ] **Database**: Create migration: `add_profile_fields_to_users_table`
  - Fields: `phone`, `address`, `bio`, `date_of_birth`, `profile_image_url`, `status` (enum: alive, deceased)
- [ ] **Backend**: Create UserProfileService for profile management
- [ ] **Backend**: Create UserProfileRepository for data access

---

## 🎯 Phase 2: Onboarding Flow (Critical for UX)

### 2.1 Onboarding Workflow
- [ ] **Database**: Create `onboarding_steps` table to track completed steps
  - Fields: `user_id`, `step_name`, `is_completed`, `completed_at`

- [ ] **Database**: Create `user_family_info` table to store onboarding data
  - Fields: `user_id`, `marital_status` (single, married, divorced, widowed), `has_kids` (boolean), `number_of_kids`, `has_siblings` (boolean), `number_of_siblings`, `created_at`, `updated_at`

- [ ] **Backend**: Create OnboardingService to manage onboarding flow
  - Method: `getOnboardingSteps($user)` - Return remaining steps
  - Method: `completeStep($user, $stepName)` - Mark step as complete
  - Method: `isOnboardingComplete($user)` - Check if all steps done

- [ ] **Backend**: Create OnboardingController
  - `GET /onboarding` - Get onboarding progress
  - `POST /onboarding/{step}/complete` - Complete a step
  - `GET /onboarding/check` - Check if onboarding needed

- [ ] **Frontend**: Create onboarding flow pages
  - [ ] `AuthAccessPages/Onboarding/Step1_BasicInfo.tsx` - Full name, bio, date of birth
  - [ ] `AuthAccessPages/Onboarding/Step2_FamilyStatus.tsx` - Marital status, kids info
  - [ ] `AuthAccessPages/Onboarding/Step3_LocationInfo.tsx` - Address, state, local govt, town
  - [ ] `AuthAccessPages/Onboarding/Step4_EducationWork.tsx` - High school, college, job title, skills
  - [ ] `AuthAccessPages/Onboarding/Step5_SiblingsSearch.tsx` - Search and request connections
  - [ ] `AuthAccessPages/Onboarding/Complete.tsx` - Onboarding complete confirmation

- [ ] **Frontend**: Create onboarding progress indicator component
  - Shows step 1 of 5, step 2 of 5, etc.
  - Visual progress bar

- [ ] **Middleware**: Update HandleInertiaRequests to redirect to onboarding if not complete
  - Check `onboarding_completed` flag on user
  - Redirect non-onboarded users to `/onboarding`

---

## 🎯 Phase 3: User Connections & Relationships

### 3.1 Connection System Database
- [ ] **Database**: Create `user_connections` table
  - Fields: `id`, `requester_user_id`, `recipient_user_id`, `relationship_type` (enum), `status` (pending, accepted, declined, undone), `requested_at`, `accepted_at`, `expires_at` (for 24h undo window), `created_at`, `updated_at`
  - Indexes: `(requester_user_id, status)`, `(recipient_user_id, status)`, `unique(requester_user_id, recipient_user_id, relationship_type)`

- [ ] **Database**: Create `relationship_types` reference table
  - Values: wife, husband, sibling, mother, father, daughter, son, aunt, uncle, niece, nephew, cousin, grandmother, grandfather, grandchild, step-sibling, step-parent, step-child, etc.

### 3.2 Connection Request Backend
- [ ] **Backend**: Create UserConnectionRepository
  - Method: `sendRequest($requesterId, $recipientId, $relationshipType)` - Create request
  - Method: `acceptRequest($connectionId)` - Accept request
  - Method: `declineRequest($connectionId)` - Decline request
  - Method: `undoRequest($connectionId)` - Unsend pending request
  - Method: `undoConnection($connectionId)` - Undo within 24h
  - Method: `getConnections($userId, $relationshipType = null)` - Get user connections
  - Method: `getPendingRequests($userId)` - Get pending requests for user
  - Method: `getSentRequests($userId)` - Get sent pending requests

- [ ] **Backend**: Create UserConnectionService
  - Validation: Check if person already has parent connection before allowing duplicate
  - Validation: Prevent self-connections
  - Validation: Validate relationship type exists
  - Method: `sendConnectionRequest($requesterData)` with all validations
  - Method: `acceptConnection($connectionId)` - Update status to accepted
  - Method: `declineConnection($connectionId)` - Update status to declined
  - Method: `undoRequest($connectionId)` - Delete pending request
  - Method: `undoConnection($connectionId)` - Check 24h window, revert to declined
  - Method: `getRelationshipLabel($fromUser, $toUser)` - Get relationship description

- [ ] **Backend**: Create ConnectionRequestController
  - `POST /connections/request` - Send request
  - `POST /connections/{id}/accept` - Accept request
  - `POST /connections/{id}/decline` - Decline request
  - `POST /connections/{id}/undo-request` - Unsend request
  - `POST /connections/{id}/undo-acceptance` - Undo within 24h
  - `GET /connections` - Get all connections
  - `GET /connections/pending` - Get pending requests
  - `GET /connections/sent` - Get sent requests

- [ ] **Validation**: Create ConnectionRequestValidator
  - Check for duplicate parent connections
  - Check for relationship type validity
  - Check for duplicate pending requests
  - Check 24h window for undo operations

### 3.3 Connection UI Pages
Pls the UI needs to be very sleek as usual, in a much attractive and professional look, that can increase conversation rate. Use the app platform's brand colors too. Use both bootstrap, bootstrap icons and css in your designs.
- [ ] **Frontend**: Create `AuthAccessPages/Connections/MyConnections.tsx`
  - Show all accepted connections grouped by relationship type
  - Display connection cards with user info
  - Show "View Profile" button for each connection
  - Search and filter connections

- [ ] **Frontend**: Create `AuthAccessPages/Connections/PendingRequests.tsx`
  - Show received pending requests
  - Accept/Decline buttons with confirmation modals
  - Show requester info and claimed relationship
  - Undo acceptance within 24h countdown timer

- [ ] **Frontend**: Create `AuthAccessPages/Connections/SendRequest.tsx`
  - Search for user by name/username/email
  - Select relationship type from dropdown
  - Show confirmation before sending
  - Handle duplicate parent connection error

- [ ] **Frontend**: Create `AuthAccessPages/Connections/RequestSent.tsx`
  - Show sent pending requests
  - Unsend button with confirmation
  - Show request details

---

## 🎯 Phase 4: User Profile Display & Visibility

### 4.1 Profile Privacy System
- [ ] **Database**: Create `user_profile_privacy` table
  - Fields: `user_id`, `field_name` (enum), `visibility_level` (enum: public, connected_family, nuclear_family, only_me), `created_at`, `updated_at`
  - Enum values for fields: full_name, phone, address, date_of_birth, bio, job_title, education, etc.

- [ ] **Backend**: Create ProfilePrivacyRepository
  - Method: `getPrivacySetting($userId, $fieldName)` - Get privacy level for field
  - Method: `setPrivacy($userId, $fieldName, $visibilityLevel)` - Set privacy
  - Method: `getDefaultPrivacySettings($userId)` - Return default privacy levels

- [ ] **Backend**: Create ProfilePrivacyService
  - Method: `canUserViewField($viewerId, $ownerId, $fieldName)` - Check if viewer can see field
  - Method: `getVisibleProfileData($viewerId, $ownerId)` - Return only visible fields
  - Implement visibility logic:
    - `only_me` - Only user can see
    - `nuclear_family` - Only direct family (parents/siblings/kids) can see
    - `connected_family` - All connected relatives can see
    - `public` - Anyone can see (but might be blurred if not connected)

### 4.2 Profile Display Pages
Pls the UI needs to be very sleek as usual, in a much attractive and professional look, that can increase conversation rate. Use the app platform's brand colors too. Use both bootstrap, bootstrap icons and css in your designs.
- [ ] **Frontend**: Create `AuthAccessPages/Profile/MyProfile.tsx`
  - Display current user's complete profile
  - Edit profile button
  - Settings button for privacy controls
  - Show connections section
  - Show family tree visualization
  - Show photos/galleries

- [ ] **Frontend**: Create `AuthAccessPages/Profile/ViewProfile/{userId}.tsx`
  - Display other user's profile (with privacy filtering)
  - Show only visible fields (rest appear blurred/hidden)
  - Show connection status (if connected, show relationship)
  - Show "Send Connection Request" if not connected
  - Show mutual connections
  - Show family members (filtered by privacy)

- [ ] **Frontend**: Create `AuthAccessPages/Profile/Edit.tsx`
  - Form to edit all profile fields
  - Image upload for profile picture
  - Rich text editor for bio
  - Save/Cancel buttons

- [ ] **Frontend**: Create `AuthAccessPages/Profile/PrivacySettings.tsx`
  - Checkbox for each field with privacy level dropdown
  - Visual explanation of each privacy level
  - Save settings button

- [ ] **Frontend**: Create profile card component
  - Show user info (name, username, bio, photo)
  - Show connection relationship (if connected)
  - Show connection status badge

---

## 🎯 Phase 5: Family Tree Visualization

### 5.1 Family Tree Data Structure
- [ ] **Database**: Create `family_trees` table (main family tree document)
  - Fields: `id`, `root_user_id`, `tree_name`, `description`, `is_public` (boolean), `created_by_user_id`, `created_at`, `updated_at`

- [ ] **Database**: Create `family_tree_members` table (members in each tree)
  - Fields: `id`, `family_tree_id`, `user_id`, `added_by_user_id`, `added_at`, `created_at`
  - Unique: `(family_tree_id, user_id)`

- [ ] **Backend**: Create FamilyTreeRepository
  - Method: `create($data)` - Create new tree
  - Method: `addMember($treeId, $userId)` - Add user to tree
  - Method: `removeMember($treeId, $userId)` - Remove user from tree
  - Method: `getTree($treeId)` - Get tree with all members
  - Method: `getUserTrees($userId)` - Get user's trees
  - Method: `getConnectionsTree($userId)` - Build tree from user's connections

- [ ] **Backend**: Create FamilyTreeService
  - Method: `buildTreeData($userId)` - Build family tree structure from connections
  - Method: `getTreeVisualization($treeId)` - Format tree data for visualization
  - Logic to determine tree hierarchy (parents at top, children at bottom, siblings side-by-side)

### 5.2 Family Tree Frontend
- [ ] **Frontend**: Create `AuthAccessPages/FamilyTree/MyFamilyTree.tsx`
  - Visual family tree display using library (e.g., react-family-tree or d3.js)
  - Zoom in/out controls
  - Pan controls
  - Click on family member to view profile
  - Highlight relationships (color-coded by relationship type)
  - Export as image/PDF button

- [ ] **Frontend**: Create `AuthAccessPages/FamilyTree/CreateTree.tsx`
  - Form to create new family tree
  - Option to auto-populate from user's connections
  - Add tree members
  - Set tree visibility (public/private)

- [ ] **Frontend**: Create family tree visualization component
  - Render family members as nodes
  - Show relationships as lines
  - Color-code by relationship type
  - Show profile photos in nodes
  - Clickable nodes to view profile

---

## 🎯 Phase 6: Child Account Management

### 6.1 Child Account System
- [ ] **Database**: Modify `users` table
  - Add fields: `parent_user_id` (nullable), `is_child_account` (boolean), `created_by_user_id` (who created account - for child accounts)
  - When child account: `email` is nullable, `password` is optional

- [ ] **Backend**: Create ChildAccountService
  - Method: `createChildAccount($parentId, $childData)` - Create account for child
  - Validation: Only users 18+ can create child accounts
  - Auto-create connection: parent → child as "father" or "mother"
  - Set account as non-deleted child account

- [ ] **Backend**: Create ChildAccountController
  - `POST /accounts/child/create` - Create child account
  - `GET /accounts/child` - Get parent's child accounts
  - `POST /accounts/child/{id}/set-email` - Child sets their email when of age

- [ ] **Frontend**: Create `AuthAccessPages/ChildAccounts/ManageChildren.tsx`
  - Show list of child accounts created by parent
  - "Create Child Account" button
  - Show each child's basic info
  - Quick switch to child account button
  - Option to remove child account

- [ ] **Frontend**: Create `AuthAccessPages/ChildAccounts/CreateChild.tsx`
  - Form: First name, Last name, Username, Date of birth
  - Generate temporary password
  - Show credentials to parent
  - Auto-connect child as their son/daughter

- [ ] **Backend**: Create account switching mechanism
  - Session-based: Allow parent to login to child account
  - Track original user who logged in (for security audit)
  - "Switch Account" dropdown in navigation
  - "Back to Parent Account" button when viewing child

NB: But the parent should not have total control of the child account though, pending when the child is of age. To which he/she will decide to change their passwords in order to have 
---

## 🎯 Phase 7: Status Management (Alive/Deceased)

### 7.1 Status System
- [ ] **Database**: `users` table already has `status` field (see Phase 2)

- [ ] **Backend**: Create StatusService
  - Method: `updateStatus($userId, $status)` - Update user status
  - Validation: Only allow status change if:
    - User themselves change it
    - Their nuclear family members (parents/siblings/kids) change it
  - Emit event: user status changed (for notifications)

- [ ] **Backend**: Create StatusController
  - `POST /profile/status/update` - Update status

- [ ] **Frontend**: Create status update modal/form
  - Show only to eligible users
  - Confirmation before marking as deceased
  - Display death date option

- [ ] **Frontend**: Display status badge on profiles
  - Green badge: "Alive"
  - Black/Gray badge: "Deceased"
  - Show death date if available

---

## 🎯 Phase 8: Notifications System

### 8.1 Notification Database
- [ ] **Database**: Create `notifications` table
  - Fields: `id`, `user_id`, `type` (enum), `related_user_id`, `related_object_id`, `title`, `message`, `is_read`, `action_url`, `created_at`, `read_at`
  - Enum types: connection_request, connection_accepted, connection_declined, connection_undone, message, family_tree_invite, etc.

### 8.2 Notification Backend
- [ ] **Backend**: Create NotificationRepository
  - Method: `create($data)` - Create notification
  - Method: `get($userId)` - Get unread notifications
  - Method: `markAsRead($notificationId)` - Mark read
  - Method: `markAllAsRead($userId)` - Mark all as read

- [ ] **Backend**: Create NotificationService
  - Method: `notifyConnectionRequest($requesterId, $recipientId)` - Send notification
  - Method: `notifyConnectionAccepted($accepterId, $originalRequesterId)` - Send notification
  - Method: `notifyConnectionDeclined($declinerId, $originalRequesterId)` - Send notification

### 8.3 Notification Frontend
- [ ] **Frontend**: Create notifications dropdown in navbar
  - Show unread notification count badge
  - Display list of recent notifications
  - "Mark as Read" on each notification
  - Click notification to navigate to related page

---

## 🎯 Phase 9: Search & Discovery

### 9.1 User Search
- [ ] **Backend**: Create SearchRepository
  - Method: `searchUsers($query, $limit = 20)` - Search by name/username/email
  - Filter: Only return non-hidden users
  - Filter: Exclude blocked users

- [ ] **Backend**: Create SearchController
  - `GET /search/users?q={query}` - Search users

- [ ] **Frontend**: Create `AuthAccessPages/Search/Users.tsx`
  - Search input with real-time suggestions
  - Display search results as user cards
  - Show mutual connections count
  - "Send Request" button on each result

---

## 🎯 Phase 10: Settings & Account Management

### 10.1 User Settings
- [ ] **Frontend**: Create `AuthAccessPages/Settings/AccountSettings.tsx`
  - Change password
  - Email verification
  - Two-factor authentication option
  - Account deletion option

- [ ] **Frontend**: Create `AuthAccessPages/Settings/PrivacySettings.tsx`
  - Profile visibility (public/private)
  - Block users
  - Report user option
  - Privacy field controls (moved from profile edit)

- [ ] **Frontend**: Create `AuthAccessPages/Settings/NotificationSettings.tsx`
  - Toggle notification types (email, in-app)
  - Notification frequency

---

## 🎯 Phase 11: Admin Features

### 11.1 Admin Dashboard (Future)
- [ ] **Backend**: Create AdminUserManagementController
  - `GET /admin/users` - List all users
  - `POST /admin/users/{id}/status` - Change user status (for deceased scenarios)
  - `POST /admin/connections/{id}/resolve` - Resolve disputed connections

- [ ] **Frontend**: Create `AdminPages/Dashboard/Users.tsx` (Future)
  - List users
  - Search/filter
  - View user details
  - Manage reported users

---

## 🎯 Database Schema Summary

### Core Tables
```
users (id, first_name, last_name, username, email, password, phone, address, bio, date_of_birth, profile_image_url, status, parent_user_id, is_child_account, created_by_user_id, onboarding_completed, created_at, updated_at)

user_family_info (user_id, marital_status, has_kids, number_of_kids, has_siblings, number_of_siblings, created_at, updated_at)

user_connections (id, requester_user_id, recipient_user_id, relationship_type, status, requested_at, accepted_at, expires_at, created_at, updated_at)

relationship_types (id, name, description)

user_profile_privacy (user_id, field_name, visibility_level, created_at, updated_at)

onboarding_steps (user_id, step_name, is_completed, completed_at, created_at, updated_at)

family_trees (id, root_user_id, tree_name, description, is_public, created_by_user_id, created_at, updated_at)

family_tree_members (id, family_tree_id, user_id, added_by_user_id, added_at, created_at)

notifications (id, user_id, type, related_user_id, related_object_id, title, message, is_read, action_url, created_at, read_at)
```

---

## 🎯 Frontend UI Components Summary

### Layouts
- `AuthAccessLayout.tsx` - Layout for logged-in users (navbar, sidebar, footer)

### Navigation
- Update navbar with: Profile dropdown, Notifications, Logout
- Add sidebar navigation with menu items

### Reusable Components
- `UserCard.tsx` - Display user info card
- `ConnectionRequestModal.tsx` - Send connection request
- `ConnectionBadge.tsx` - Show relationship type
- `ProfileField.tsx` - Display profile field with privacy indicator
- `FamilyTreeNode.tsx` - Render family tree node
- `NotificationDropdown.tsx` - Show notifications
- `ProgressIndicator.tsx` - Onboarding progress

### Styles
- Use Bootstrap 5 classes throughout
- Use Bootstrap Icons for icons
- Use custom CSS for:
  - Family tree visualization
  - Profile cards
  - Connection badges
  - Privacy indicators
  - Onboarding steps

---

## 🚀 Implementation Order (Recommended)

1. **Phase 2: Onboarding** - Critical UX blocker
2. **Phase 3: Connections** - Core relationship functionality
3. **Phase 4: Profile Display** - View other profiles
4. **Phase 5: Family Tree** - Visual representation
5. **Phase 6: Child Accounts** - Extended functionality
6. **Phase 7: Status Management** - Simple but important
7. **Phase 8: Notifications** - Better UX
8. **Phase 9: Search** - Discovery feature
9. **Phase 10: Settings** - Account management
10. **Phase 11: Admin** - Backend support tools

---

## 📝 Notes

- **Design Consistency**: Use FamTree brand colors (Gold #FFD700, Blue #0052E8, Green #00D97F)
- **Responsive Design**: All pages must be mobile-responsive
- **Accessibility**: Follow WCAG guidelines for all forms
- **Performance**: Optimize family tree rendering for large datasets
- **Security**: Validate all connection requests and privacy settings server-side
- **Testing**: Create feature tests for connection logic and privacy checks

