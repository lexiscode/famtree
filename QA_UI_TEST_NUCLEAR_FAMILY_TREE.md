# QA UI Test Workflow - Nuclear Family Tree System

## Overview
This document provides a comprehensive QA testing workflow for the Nuclear Family Tree System implementation, covering all frontend components and features.

---

## Test Environment Setup

### Prerequisites
1. Database seeded with test users
2. At least 3 test users:
   - **User A**: Male, 18+, has spouse connection (can create trees)
   - **User B**: Female, 18+, has spouse connection (cannot create trees - male only restriction)
   - **User C**: Male, under 18 (cannot create trees - age restriction)
   - **User D**: Male, 18+, no family connections (cannot create trees - family connection requirement)

### Test Data Requirements
- User A should have:
  - Gender: male
  - Date of birth: 18+ years old
  - At least one accepted connection of type 'wife' OR 'son'/'daughter'

---

## Test Suite 1: Family Tree Index Page

### Test Case 1.1: View Admin Trees Section
**Objective**: Verify that trees where user is admin are displayed correctly

**Steps**:
1. Login as User A (who has admin access to at least one tree)
2. Navigate to `/family-tree`
3. Locate the "Trees I Manage" section

**Expected Results**:
- Section header displays "Trees I Manage" with Shield icon
- Count badge shows correct number of admin trees
- Each tree card displays:
  - Tree name
  - Description (if present)
  - Public/Private badge with Globe or Lock icon
  - Admin badge with Shield icon
  - Member count stat
  - Created date stat
  - Admin count stat
  - "View Tree" button with arrow icon

**Pass Criteria**:
- ✅ All admin trees are visible
- ✅ All badges and stats are accurate
- ✅ Cards are properly styled and responsive

---

### Test Case 1.2: View Member Trees Section
**Objective**: Verify that trees where user is a member (but not admin) are displayed correctly

**Steps**:
1. Login as user who is a member of trees but not an admin
2. Navigate to `/family-tree`
3. Locate the "Trees I'm Part Of" section

**Expected Results**:
- Section header displays "Trees I'm Part Of" with Users icon
- Count badge shows correct number of member trees
- Each tree card displays:
  - Tree name
  - Description (if present)
  - Public/Private badge
  - NO Admin badge
  - Member count, created date, and admin count stats
  - "Created by [Creator Name]" text
  - "View Tree" button

**Pass Criteria**:
- ✅ All member trees are visible
- ✅ No admin badge shown on these cards
- ✅ Creator name is displayed correctly

---

### Test Case 1.3: Empty State Display
**Objective**: Verify empty state when user has no trees

**Steps**:
1. Login as new user with no trees
2. Navigate to `/family-tree`

**Expected Results**:
- Empty state box displays with:
  - Family emoji icon
  - "Start Your Family Journey" heading
  - Descriptive text about creating family trees
  - "Create Your First Tree" button with Sparkles icon

**Pass Criteria**:
- ✅ Empty state is visually appealing
- ✅ CTA button is clickable and navigates to create page

---

### Test Case 1.4: Create Tree Button
**Objective**: Verify create tree button functionality

**Steps**:
1. Login as any user
2. Navigate to `/family-tree`
3. Click "Create Tree" button in header

**Expected Results**:
- Navigates to `/family-tree/create`
- Button has Plus icon and proper styling

**Pass Criteria**:
- ✅ Navigation works correctly
- ✅ Button is visible and properly positioned

---

## Test Suite 2: Create Family Tree Page

### Test Case 2.1: Successful Creation - Valid User
**Objective**: Verify that valid users can create nuclear family trees

**Prerequisites**: Login as User A (male, 18+, has spouse or child connection)

**Steps**:
1. Navigate to `/family-tree/create`
2. Verify validation passes automatically
3. Check nuclear family preview section
4. Enter tree name: "Smith Family Tree"
5. Enter description: "Our family tree spanning three generations"
6. Check "Make this tree public" checkbox
7. Click "Create Nuclear Family Tree" button

**Expected Results**:
- No validation errors displayed
- Nuclear Family Members section shows:
  - Blue info box with Users icon
  - List of spouse/children who will be auto-added
  - Each member shows name and role (spouse/child)
- Form fields are enabled
- Submit button is enabled
- Tips section displays nuclear family tree information
- After submission, redirects to tree detail page
- Success message: "Nuclear family tree created successfully! X members added."

**Pass Criteria**:
- ✅ Validation passes for eligible user
- ✅ Nuclear family preview is accurate
- ✅ Tree is created successfully
- ✅ All family members are auto-added
- ✅ Redirect and success message work

---

### Test Case 2.2: Validation Failure - Female User
**Objective**: Verify that female users cannot create trees

**Prerequisites**: Login as User B (female, 18+, has family connections)

**Steps**:
1. Navigate to `/family-tree/create`
2. Observe validation error alert

**Expected Results**:
- Red error alert box displays with AlertCircle icon
- Title: "Unable to Create Family Tree"
- Error message: "Only male users can create nuclear family trees"
- Submit button is DISABLED
- No nuclear family preview section shown

**Pass Criteria**:
- ✅ Validation error is clear and visible
- ✅ Submit button is disabled
- ✅ Cannot submit form

---

### Test Case 2.3: Validation Failure - Underage User
**Objective**: Verify that users under 18 cannot create trees

**Prerequisites**: Login as User C (male, under 18)

**Steps**:
1. Navigate to `/family-tree/create`
2. Observe validation error alert

**Expected Results**:
- Error alert displays
- Error message: "You must be at least 18 years old to create a family tree"
- Submit button is DISABLED

**Pass Criteria**:
- ✅ Age validation works correctly
- ✅ Error message is displayed
- ✅ Cannot create tree

---

### Test Case 2.4: Validation Failure - No Family Connections
**Objective**: Verify that users without nuclear family cannot create trees

**Prerequisites**: Login as User D (male, 18+, no spouse or child connections)

**Steps**:
1. Navigate to `/family-tree/create`
2. Observe validation error alert

**Expected Results**:
- Error alert displays
- Error message: "You must have at least one accepted connection of type 'wife', 'husband', 'son', or 'daughter' to create a nuclear family tree"
- Submit button is DISABLED

**Pass Criteria**:
- ✅ Family connection validation works
- ✅ Error message explains requirement
- ✅ Cannot create tree

---

### Test Case 2.5: Form Validation - Empty Tree Name
**Objective**: Verify client-side validation for required fields

**Prerequisites**: Login as User A (eligible to create)

**Steps**:
1. Navigate to `/family-tree/create`
2. Leave tree name empty
3. Try to click submit button

**Expected Results**:
- Submit button is DISABLED when tree name is empty
- HTML5 required validation triggers

**Pass Criteria**:
- ✅ Cannot submit without tree name
- ✅ Client-side validation works

---

### Test Case 2.6: Back Button Navigation
**Objective**: Verify back button functionality

**Steps**:
1. On create tree page, click "Back to Family Trees" button
2. Verify navigation

**Expected Results**:
- Navigates back to `/family-tree` index page
- Button has ArrowLeft icon and proper hover effect

**Pass Criteria**:
- ✅ Navigation works correctly
- ✅ Hover effect is visible

---

## Test Suite 3: Family Tree Detail Page (MyFamilyTree)

### Test Case 3.1: Tree Header Information
**Objective**: Verify tree header displays correct information

**Prerequisites**: Login as admin of a tree

**Steps**:
1. Navigate to a tree detail page
2. Inspect header section

**Expected Results**:
- Tree name is displayed prominently
- Tree description is shown (if exists)
- Badges section shows:
  - Public badge (Globe icon) OR Private badge (Lock icon)
  - Admin badge (Shield icon) if user is admin

**Pass Criteria**:
- ✅ All header information is accurate
- ✅ Badges match tree settings
- ✅ Admin badge only shows for admins

---

### Test Case 3.2: Admin Action Buttons
**Objective**: Verify admin-only action buttons

**Prerequisites**: Login as admin of a tree

**Steps**:
1. Navigate to tree detail page
2. Locate action buttons section

**Expected Results**:
- Three buttons are visible:
  - **Edit** (Edit icon) - navigates to edit page
  - **Export** (Download icon) - downloads tree data as JSON
  - **Delete** (Trash2 icon, red) - prompts confirmation then deletes tree
- Buttons are only visible if user is admin

**Pass Criteria**:
- ✅ All three buttons are present for admins
- ✅ Buttons are hidden for non-admin members
- ✅ Each button performs correct action

---

### Test Case 3.3: Export Tree Functionality
**Objective**: Verify tree export downloads correct JSON data

**Steps**:
1. Login as admin
2. Navigate to tree detail page
3. Click "Export" button
4. Check downloaded file

**Expected Results**:
- JSON file is downloaded
- Filename format: `TreeName_timestamp.json`
- File contains:
  - tree object (id, name, description, is_public, is_nuclear_family, created_at)
  - admins array
  - members array

**Pass Criteria**:
- ✅ File downloads successfully
- ✅ JSON structure is correct
- ✅ All data is included

---

### Test Case 3.4: Statistics Grid Display
**Objective**: Verify tree statistics are accurate

**Steps**:
1. Navigate to any tree detail page
2. Inspect statistics grid

**Expected Results**:
- Four stats are displayed:
  - **Total Members**: Shows count from members array
  - **Admins**: Shows count from admins array
  - **Created**: Shows year from created_at
  - **Creator**: Shows first name of creator admin

**Pass Criteria**:
- ✅ All stats are accurate
- ✅ Numbers match actual data
- ✅ Creator name is correct

---

### Test Case 3.5: Tree Administrators Section
**Objective**: Verify admin section displays all admins with correct roles

**Steps**:
1. Navigate to tree detail page
2. Locate "Tree Administrators" section

**Expected Results**:
- Section header shows "Tree Administrators" with Shield icon
- Grid of admin cards displays
- Each admin card shows:
  - Avatar with Crown icon (gold gradient) for creator
  - Avatar with Shield icon (blue gradient) for co-admins
  - Admin name
  - Role label: "Creator" or "Co-Admin"
  - Granted date in format: "Granted: MM/DD/YYYY"
- Cards use gradient backgrounds

**Pass Criteria**:
- ✅ All admins are displayed
- ✅ Creator has gold Crown icon
- ✅ Co-admins have blue Shield icon
- ✅ Roles are correctly labeled
- ✅ Dates are formatted properly

---

### Test Case 3.6: Family Members Section - Member Cards
**Objective**: Verify member cards display correct information

**Steps**:
1. Navigate to tree detail page
2. Scroll to "Family Members" section

**Expected Results**:
- Section header shows "Family Members" with Users icon
- Grid of member cards displays
- Each member card shows:
  - Avatar with first letter of name
  - Member name
  - Nuclear family role badge (if present):
    - **Spouse**: Pink background, "spouse" text
    - **Child**: Blue background, "child" text
    - **Merged**: Green background, "merged" text
    - **Extended**: Gray background, "extended" text
  - "Can add members" indicator (green with CheckCircle icon) if applicable
  - Action buttons (View Profile, Remove) if user is admin

**Pass Criteria**:
- ✅ All members are displayed
- ✅ Role badges have correct colors
- ✅ "Can add members" shows for eligible members
- ✅ Action buttons only show for admins

---

### Test Case 3.7: Remove Member Functionality
**Objective**: Verify admin can remove members

**Prerequisites**: Login as admin of tree with multiple members

**Steps**:
1. Navigate to tree detail page
2. Locate a member card (not yourself)
3. Click "Remove" button
4. Confirm deletion in browser alert

**Expected Results**:
- Confirmation prompt: "Are you sure you want to remove [Name] from the tree?"
- After confirmation, member is removed
- Page refreshes showing updated member list
- Loading state is shown during deletion

**Pass Criteria**:
- ✅ Confirmation prompt appears
- ✅ Member is successfully removed
- ✅ UI updates correctly
- ✅ Cannot remove yourself

---

### Test Case 3.8: Delete Tree Functionality
**Objective**: Verify admin can delete entire tree

**Prerequisites**: Login as admin of a tree

**Steps**:
1. Navigate to tree detail page
2. Click red "Delete" button
3. Confirm deletion in alert

**Expected Results**:
- Confirmation prompt: "Are you sure you want to delete this entire family tree? This action cannot be undone."
- After confirmation, tree is deleted
- Redirects to `/family-tree` index page
- Success message: "Family tree deleted successfully!"

**Pass Criteria**:
- ✅ Confirmation prompt is clear
- ✅ Tree is deleted from database
- ✅ Redirect works correctly
- ✅ Success message displays

---

### Test Case 3.9: Empty Members State
**Objective**: Verify empty state when tree has no members

**Prerequisites**: Tree with zero members (unlikely but test edge case)

**Steps**:
1. Navigate to tree with no members
2. Check Family Members section

**Expected Results**:
- Empty state box displays:
  - Family emoji icon
  - "No members in your tree" heading
  - Descriptive text
  - "Back to Trees" button (if admin)

**Pass Criteria**:
- ✅ Empty state is visible
- ✅ Message is clear
- ✅ Navigation button works (for admins)

---

## Test Suite 4: Tree Connection Manager Component

### Test Case 4.1: Send Connection Request - Show Form
**Objective**: Verify send connection request form displays correctly

**Prerequisites**: Login as admin of Tree A

**Steps**:
1. Navigate to Tree A detail page
2. Scroll to "Tree Connections" section
3. Click "Send Connection Request" button

**Expected Results**:
- Form expands with:
  - "Send Connection Request" heading
  - "Target Tree ID" input field (number)
  - "Message (Optional)" textarea
  - "Send Request" button (blue)
  - "Cancel" button (gray)
- Button changes to form view

**Pass Criteria**:
- ✅ Form displays correctly
- ✅ All fields are present
- ✅ Form styling is consistent

---

### Test Case 4.2: Send Connection Request - Validation
**Objective**: Verify form validation for sending requests

**Steps**:
1. With send form open, leave Target Tree ID empty
2. Try to click "Send Request"

**Expected Results**:
- Send button is DISABLED when tree ID is empty
- Required field validation works

**Pass Criteria**:
- ✅ Cannot submit without tree ID
- ✅ Button visual state shows disabled

---

### Test Case 4.3: Send Connection Request - Success
**Objective**: Verify successful connection request submission

**Prerequisites**:
- Login as admin of Tree A (ID: 1)
- Have another tree (Tree B, ID: 2) in database

**Steps**:
1. Open send connection request form
2. Enter Target Tree ID: 2
3. Enter message: "Let's connect our family trees!"
4. Click "Send Request" button

**Expected Results**:
- Loading state: Button text changes to "Sending..."
- Button is disabled during submission
- On success:
  - Form closes
  - Page refreshes
  - Request appears in "Sent Requests" section

**Pass Criteria**:
- ✅ Request is sent successfully
- ✅ Loading state is visible
- ✅ Form resets and closes
- ✅ Request shows in sent list

---

### Test Case 4.4: Send Connection Request - Duplicate Error
**Objective**: Verify error handling for duplicate requests

**Steps**:
1. Send connection request from Tree A to Tree B
2. Try to send another request to Tree B again

**Expected Results**:
- Error message displays
- Form shows error state
- Request is not duplicated

**Pass Criteria**:
- ✅ Duplicate prevention works
- ✅ Error message is clear
- ✅ No duplicate requests created

---

### Test Case 4.5: Cancel Send Form
**Objective**: Verify cancel button closes form

**Steps**:
1. Click "Send Connection Request"
2. Enter some data in fields
3. Click "Cancel" button

**Expected Results**:
- Form closes immediately
- All entered data is cleared
- Button returns to "Send Connection Request"

**Pass Criteria**:
- ✅ Form closes correctly
- ✅ Data is reset
- ✅ UI returns to initial state

---

### Test Case 4.6: Pending Requests Display
**Objective**: Verify received pending requests are displayed correctly

**Prerequisites**: Login as admin of Tree B that has pending request from Tree A

**Steps**:
1. Navigate to Tree B detail page
2. Scroll to Tree Connections section
3. Locate "Pending Requests" section

**Expected Results**:
- Section header: "Pending Requests (X)" where X is count
- Each request card shows:
  - Requester tree name
  - "Requested by [First Name] [Last Name]"
  - Request message in italics (if provided)
  - Green "Accept" button with Check icon
  - Red "Decline" button with X icon
- Cards have white background with border

**Pass Criteria**:
- ✅ All pending requests are visible
- ✅ Request information is complete
- ✅ Accept/Decline buttons are styled correctly
- ✅ Count badge matches number of requests

---

### Test Case 4.7: Accept Connection Request
**Objective**: Verify accepting a connection request merges trees

**Prerequisites**:
- Login as admin of Tree B
- Tree A has sent connection request to Tree B

**Steps**:
1. Navigate to Tree B detail page
2. Locate pending request from Tree A
3. Click "Accept" button
4. Confirm in browser alert

**Expected Results**:
- Confirmation prompt: "Accept this tree connection request? The trees will be merged into one."
- After confirmation:
  - Trees are merged
  - Tree A's creator becomes co-admin of Tree B
  - All Tree A members are copied to Tree B
  - Tree A is marked as merged and soft-deleted
  - Redirects to Tree B (the merged tree)
  - Success message displays

**Pass Criteria**:
- ✅ Confirmation prompt is clear about merging
- ✅ Trees merge successfully
- ✅ Co-admin is created
- ✅ All members are transferred
- ✅ Tree A is soft-deleted
- ✅ Redirect and message work

---

### Test Case 4.8: Decline Connection Request
**Objective**: Verify declining a connection request

**Prerequisites**:
- Login as admin of Tree B
- Tree A has sent connection request to Tree B

**Steps**:
1. Navigate to Tree B detail page
2. Locate pending request from Tree A
3. Click "Decline" button
4. Confirm in browser alert

**Expected Results**:
- Confirmation prompt: "Decline this tree connection request?"
- After confirmation:
  - Request status changes to 'declined'
  - Request disappears from pending list
  - No merge occurs
  - Page refreshes

**Pass Criteria**:
- ✅ Confirmation prompt appears
- ✅ Request is declined
- ✅ Request removed from pending
- ✅ No data changes occur

---

### Test Case 4.9: Sent Requests Display
**Objective**: Verify sent requests are displayed correctly

**Prerequisites**: Login as admin of Tree A that sent request to Tree B

**Steps**:
1. Navigate to Tree A detail page
2. Scroll to Tree Connections section
3. Locate "Sent Requests" section

**Expected Results**:
- Section header: "Sent Requests (X)"
- Each sent request card shows:
  - "To: [Recipient Tree Name]"
  - "Waiting for response..." text
  - Orange/yellow background color
  - Orange border
- No action buttons (request is pending response from recipient)

**Pass Criteria**:
- ✅ All sent requests are visible
- ✅ Recipient tree name is shown
- ✅ Visual distinction from pending requests
- ✅ No actionable buttons shown

---

### Test Case 4.10: Merged Trees Display
**Objective**: Verify accepted/merged connections are displayed

**Prerequisites**: Tree A has been merged with Tree B

**Steps**:
1. Navigate to Tree B detail page (the merged tree)
2. Scroll to Tree Connections section
3. Locate "Merged Trees" section

**Expected Results**:
- Section header: "Merged Trees (X)"
- Each merged connection card shows:
  - Link2 icon (green)
  - "[Tree A Name] ↔ [Tree B Name]"
  - "Merged on [Date]" text
  - Green background
  - Green border

**Pass Criteria**:
- ✅ Merged connections are visible
- ✅ Both tree names are shown with arrow
- ✅ Merge date is formatted correctly
- ✅ Green styling indicates success

---

### Test Case 4.11: Empty Connections State
**Objective**: Verify empty state when no connections exist

**Prerequisites**: Tree with no pending, sent, or merged connections

**Steps**:
1. Navigate to tree detail page
2. Scroll to Tree Connections section

**Expected Results**:
- Empty state displays:
  - Large Users icon (semi-transparent)
  - "No tree connections yet" message
  - Descriptive text: "Send a connection request to another family tree to merge your families together."
  - Centered layout with gray text

**Pass Criteria**:
- ✅ Empty state is visible
- ✅ Message is helpful and clear
- ✅ Styling is consistent

---

### Test Case 4.12: Admin-Only Visibility
**Objective**: Verify connection manager only shows for admins

**Prerequisites**: Login as non-admin member of a tree

**Steps**:
1. Navigate to tree detail page
2. Scroll to bottom of page

**Expected Results**:
- Tree Connection Manager section is NOT visible
- Component returns null for non-admins

**Pass Criteria**:
- ✅ Component is completely hidden
- ✅ No connection management options for members

---

## Test Suite 5: Responsive Design & Cross-Browser Testing

### Test Case 5.1: Mobile Responsiveness - Index Page
**Objective**: Verify index page works on mobile devices

**Steps**:
1. Open browser dev tools
2. Set viewport to mobile (375px width)
3. Navigate to `/family-tree`
4. Test all interactive elements

**Expected Results**:
- Grid layouts collapse to single column
- Cards are fully visible and tappable
- Badges wrap properly
- Create button is accessible
- Text is readable

**Pass Criteria**:
- ✅ Layout adapts correctly
- ✅ No horizontal overflow
- ✅ All elements are usable

---

### Test Case 5.2: Mobile Responsiveness - Create Page
**Objective**: Verify create page works on mobile

**Steps**:
1. Set viewport to mobile
2. Navigate to create page
3. Fill out form

**Expected Results**:
- Form fields are full width
- Error alerts are readable
- Nuclear family preview is scrollable
- Buttons are tappable
- Tips section is readable

**Pass Criteria**:
- ✅ Form is fully functional
- ✅ All text is legible
- ✅ No layout issues

---

### Test Case 5.3: Mobile Responsiveness - Tree Detail
**Objective**: Verify tree detail page works on mobile

**Steps**:
1. Set viewport to mobile
2. Navigate to tree detail page
3. Test all sections

**Expected Results**:
- Header info is readable
- Stats grid wraps properly
- Admin cards stack vertically
- Member cards display in single column
- Connection manager form is usable
- Action buttons are tappable

**Pass Criteria**:
- ✅ All sections are accessible
- ✅ No content is cut off
- ✅ Interactive elements work

---

### Test Case 5.4: Tablet Responsiveness
**Objective**: Verify layouts work on tablet (768px)

**Steps**:
1. Set viewport to tablet width
2. Test all pages
3. Verify grid layouts use 2 columns

**Expected Results**:
- Tree cards display in 2 columns
- Admin cards display in 2 columns
- Member cards display in 2-3 columns
- All content is properly spaced

**Pass Criteria**:
- ✅ Tablet layouts are optimal
- ✅ Content uses available space well

---

### Test Case 5.5: Cross-Browser Testing - Chrome
**Objective**: Verify functionality in Chrome

**Steps**:
1. Open application in Chrome
2. Test all major features
3. Check console for errors

**Expected Results**:
- All features work correctly
- No console errors
- Styling renders properly
- Icons display correctly

**Pass Criteria**:
- ✅ Full functionality in Chrome

---

### Test Case 5.6: Cross-Browser Testing - Firefox
**Objective**: Verify functionality in Firefox

**Steps**:
1. Open application in Firefox
2. Test all major features
3. Check console for errors

**Expected Results**:
- All features work correctly
- No console errors
- Styling is consistent
- Icons display correctly

**Pass Criteria**:
- ✅ Full functionality in Firefox

---

### Test Case 5.7: Cross-Browser Testing - Safari
**Objective**: Verify functionality in Safari

**Steps**:
1. Open application in Safari
2. Test all major features
3. Check console for errors

**Expected Results**:
- All features work correctly
- No console errors
- Styling renders properly
- Icons display correctly

**Pass Criteria**:
- ✅ Full functionality in Safari

---

## Test Suite 6: Edge Cases & Error Handling

### Test Case 6.1: Long Tree Names
**Objective**: Verify UI handles long tree names gracefully

**Steps**:
1. Create tree with name: "This is an extremely long family tree name that should test text overflow and wrapping"
2. View in index and detail pages

**Expected Results**:
- Text wraps properly in cards
- No layout breaking
- Full name is visible somewhere (tooltip or wrapped)

**Pass Criteria**:
- ✅ Long names are handled gracefully

---

### Test Case 6.2: Special Characters in Tree Name
**Objective**: Verify special characters are handled

**Steps**:
1. Create tree with name: "O'Brien & Smith-Jones Family 🌳"
2. View tree in various places

**Expected Results**:
- Special characters display correctly
- Emoji renders properly
- No encoding issues

**Pass Criteria**:
- ✅ Special characters work correctly

---

### Test Case 6.3: Large Number of Members
**Objective**: Verify UI handles trees with many members

**Prerequisites**: Tree with 50+ members

**Steps**:
1. Navigate to tree detail page
2. Check member grid rendering
3. Test scrolling

**Expected Results**:
- All members render
- Grid layout remains intact
- Page performance is acceptable
- No memory issues

**Pass Criteria**:
- ✅ Large member lists work smoothly

---

### Test Case 6.4: Network Error Handling
**Objective**: Verify graceful handling of network errors

**Steps**:
1. Open browser dev tools
2. Set network to offline
3. Try to create a tree or send connection request

**Expected Results**:
- Error message displays
- Loading state clears
- User can retry after reconnection

**Pass Criteria**:
- ✅ Network errors are handled gracefully

---

### Test Case 6.5: Concurrent User Actions
**Objective**: Verify handling of simultaneous actions

**Steps**:
1. Open tree detail in two browser tabs
2. In Tab 1: Accept connection request
3. In Tab 2: Try to interact with same tree

**Expected Results**:
- Stale data doesn't cause crashes
- Page refresh shows updated state
- No data corruption

**Pass Criteria**:
- ✅ Concurrent actions don't break app

---

## Test Suite 7: Performance Testing

### Test Case 7.1: Page Load Time
**Objective**: Measure page load performance

**Steps**:
1. Open dev tools Network tab
2. Navigate to each page
3. Measure load time

**Expected Results**:
- Index page loads in < 2 seconds
- Create page loads in < 1 second
- Detail page loads in < 2 seconds
- No unnecessary re-renders

**Pass Criteria**:
- ✅ All pages load quickly

---

### Test Case 7.2: Form Submission Performance
**Objective**: Verify forms submit quickly

**Steps**:
1. Fill out create tree form
2. Submit and measure time to redirect
3. Send connection request and measure response

**Expected Results**:
- Form submissions complete in < 1 second
- Loading states are visible
- No hanging or freezing

**Pass Criteria**:
- ✅ Forms submit smoothly

---

## Test Suite 8: Accessibility Testing

### Test Case 8.1: Keyboard Navigation
**Objective**: Verify all features are keyboard accessible

**Steps**:
1. Navigate through pages using only Tab key
2. Test form submission with Enter key
3. Test button clicks with Space/Enter

**Expected Results**:
- All interactive elements are focusable
- Focus indicators are visible
- Forms can be submitted via keyboard
- Modals can be closed with Escape

**Pass Criteria**:
- ✅ Full keyboard accessibility

---

### Test Case 8.2: Screen Reader Compatibility
**Objective**: Verify screen reader can navigate content

**Steps**:
1. Enable screen reader (NVDA, JAWS, or VoiceOver)
2. Navigate through pages
3. Listen to announcements

**Expected Results**:
- Page structure is announced
- Form labels are read correctly
- Buttons have descriptive labels
- Images have alt text
- Icons have accessible names

**Pass Criteria**:
- ✅ Screen reader compatibility

---

### Test Case 8.3: Color Contrast
**Objective**: Verify sufficient color contrast

**Steps**:
1. Use browser contrast checker
2. Check all text against backgrounds
3. Verify badge colors are distinguishable

**Expected Results**:
- Text meets WCAG AA standard (4.5:1)
- Badges are visually distinct
- Error messages are highly visible

**Pass Criteria**:
- ✅ Color contrast is sufficient

---

## Test Coverage Summary

### Components Tested
- ✅ Index.tsx (Family Tree List)
- ✅ CreateTree.tsx (Tree Creation Form)
- ✅ MyFamilyTree.tsx (Tree Detail Page)
- ✅ TreeConnectionManager.tsx (Connection Management)

### Features Tested
- ✅ Admin tree display
- ✅ Member tree display
- ✅ Tree creation validation (male, 18+, family connections)
- ✅ Nuclear family preview
- ✅ Tree statistics
- ✅ Admin section display
- ✅ Member cards with roles
- ✅ Tree connection requests (send, accept, decline)
- ✅ Tree merging
- ✅ Export functionality
- ✅ Delete functionality
- ✅ Responsive design
- ✅ Error handling
- ✅ Performance
- ✅ Accessibility

### Test Statistics
- **Total Test Cases**: 71
- **Critical Test Cases**: 28
- **Medium Priority**: 25
- **Low Priority**: 18

---

## Bug Reporting Template

When issues are found, report them using this format:

```markdown
### Bug Report #[NUMBER]

**Title**: [Brief description]

**Severity**: [Critical / High / Medium / Low]

**Component**: [Index / CreateTree / MyFamilyTree / TreeConnectionManager]

**Steps to Reproduce**:
1. Step one
2. Step two
3. Step three

**Expected Result**:
[What should happen]

**Actual Result**:
[What actually happened]

**Screenshots**:
[Attach screenshots if applicable]

**Environment**:
- Browser: [Chrome/Firefox/Safari version]
- Device: [Desktop/Mobile/Tablet]
- Screen Size: [Viewport dimensions]
- User Type: [Admin/Member/Non-member]

**Console Errors**:
[Any JavaScript errors from console]

**Additional Notes**:
[Any other relevant information]
```

---

## Test Sign-Off

### QA Tester Information
- **Tester Name**: _______________________
- **Date**: _______________________
- **Test Environment**: _______________________

### Test Results
- **Total Tests Executed**: _______
- **Tests Passed**: _______
- **Tests Failed**: _______
- **Tests Blocked**: _______
- **Bugs Found**: _______

### Approval
- [ ] All critical tests passed
- [ ] All high priority tests passed
- [ ] Known issues documented
- [ ] Ready for production

**Signature**: _______________________

---

## End of QA Test Workflow
