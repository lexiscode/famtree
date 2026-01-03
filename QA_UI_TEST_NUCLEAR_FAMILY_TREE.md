
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
