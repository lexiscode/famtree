# Connection Feeds Feature - Implementation TODO

## Project Overview
Build a "Connection Feeds" page that displays recent posts from direct and indirect connections within the last 30 days, respecting privacy settings.

**Current User:** Anthia (User ID: 4)
**Target URL:** `/connection-feeds` (new page)
**Reference Pages:**
- Connection Overview UI: http://localhost/connections
- Stories UI: http://localhost/stories
- Privacy Settings: http://localhost/settings/privacy

---

## Phase 1: Backend Architecture Setup

### 1.1 Database & Model Analysis
- [ ] Review User model for relationships (direct/indirect connections)
- [ ] Review Post model structure
- [ ] Check existing privacy settings schema
- [ ] Analyze connection tables to understand direct vs indirect connections

### 1.2 Privacy Settings Structure
- [ ] Understand ContentPrivacy model/table
- [ ] Identify privacy levels: `public`, `connected_only`, `private`
- [ ] Map how privacy settings apply to story visibility

### 1.3 Create Migration/Model for Connection Feeds (if needed)
- [ ] Assess if new migration is required
- [ ] Determine caching strategy for connection feeds performance

---

## Phase 2: Backend Development

### 2.1 Create ConnectionFeedsRepository
**File:** `app/Repositories/GuestRepositories/AuthAccessRepositories/ConnectionFeedsRepository.php`
- [ ] Method: `getDirectConnections(User $user)` - fetch direct connections
- [ ] Method: `getIndirectConnections(User $user)` - fetch indirect connections (2nd degree)
- [ ] Method: `getConnectionsPosts(User $user, int $days = 30)` - fetch posts from all connections
- [ ] Method: `filterByPrivacy(Collection $posts, User $user)` - apply privacy filters
- [ ] Apply 30-day filter to all queries

### 2.2 Create ContentPrivacyRepository (if not exists)
**File:** `app/Repositories/GuestRepositories/AuthAccessRepositories/ContentPrivacyRepository.php`
- [ ] Method: `getPrivacySetting(User $user, string $type)` - get user's privacy setting for 'stories'
- [ ] Method: `canUserViewContent(User $author, User $viewer, string $contentType)` - check permission
- [ ] Handle privacy levels: public, connected_only, private

### 2.3 Create ConnectionFeedsService
**File:** `app/Actions/GuestServices/AuthAccessServices/ConnectionFeedsService.php`
- [ ] Inject `ConnectionFeedsRepository` and `ContentPrivacyRepository`
- [ ] Method: `getConnectionFeeds(User $user)` - main service method
  - Fetch direct connections posts
  - Fetch indirect connections posts
  - Apply privacy filters for each post
  - Sort by created_at (newest first)
  - Return paginated results (if needed)
- [ ] Method: `checkPostVisibility(Post $post, User $viewer)` - privacy check
- [ ] Handle edge cases (no connections, all posts private, etc.)

### 2.4 Create Controller
**File:** `app/Http/Controllers/GuestControllers/AuthAccessControllers/ConnectionFeedsController.php`
- [ ] Method: `index()` - render connection feeds page
  - Get authenticated user
  - Call service to fetch connection feeds
  - Gather user data for sidebar
  - Get connection count, notification count, pending requests, etc.
  - Pass data to Inertia view

---

## Phase 3: Frontend Development

### 3.1 Create Page Component
**File:** `resources/js/Pages/GuestPages/AuthAccessPages/ConnectionFeeds/Index.tsx`
- [ ] Import necessary components and hooks
- [ ] Define TypeScript interfaces for props
- [ ] Create 3-column layout (left sidebar, center content, optional)
- [ ] Implement left sidebar with fixed profile card
- [ ] Implement center content with connection feeds posts
- [ ] Add search/filter functionality (optional)
- [ ] Handle empty states

### 3.2 Left Sidebar - User Profile Card
**Reuse/Create:** `resources/js/Pages/GuestPages/AuthAccessPages/ConnectionFeeds/ProfileSidebar.tsx`
- [ ] Display user avatar
- [ ] Show username and name
- [ ] Display connection counts
- [ ] Show status badge
- [ ] Add action buttons (settings, view profile, etc.)
- [ ] Style consistently with Stories page

### 3.3 Center Content - Feed Posts Display
**Reuse/Adapt:** Use existing PostCard component from Stories
- [ ] List all posts from connections
- [ ] Filter by last 30 days
- [ ] Show post metadata (author, timestamp, type)
- [ ] Display post content (text/voice/images)
- [ ] Add engagement stats (likes, comments, views)
- [ ] Add action buttons (like, comment, share, etc.)
- [ ] Implement smooth scrolling/pagination if needed

### 3.4 Post Filtering & Search (Optional Enhancement)
- [ ] Add filter by connection type (direct/indirect)
- [ ] Add filter by post type (text/voice)
- [ ] Add search functionality
- [ ] Add sort options (newest, most liked, etc.)

---

## Phase 4: Privacy Implementation

### 4.1 Privacy Check Logic
- [ ] Implement `canViewPost(Post $post, User $viewer)` logic:
  - If post author is direct connection:
    - Check author's "stories" content privacy
    - If `public`: show to viewer
    - If `connected_only`: show if viewer is connected
    - If `private`: don't show
  - If post author is indirect connection:
    - Check author's "stories" content privacy
    - If `public`: show to viewer
    - If `connected_only` or `private`: don't show

### 4.2 Query Optimization
- [ ] Use eager loading for relationships
- [ ] Create efficient privacy check queries
- [ ] Consider caching for performance
- [ ] Add database indexes if needed

---

## Phase 5: Routing & Navigation

### 5.1 Create Routes
**File:** `routes/web.php`
- [ ] Add route: `GET /connection-feeds` → `ConnectionFeedsController@index` (name: `connection-feeds.index`)
- [ ] Apply `auth` middleware
- [ ] Add route group with other auth-access routes

### 5.2 Update Navigation/Links
**File:** `resources/js/Pages/GuestPages/AuthAccessPages/Profile/MyProfile.tsx`
- [ ] Add "Connection Feeds" button in Connection Overview section
- [ ] Use route helper: `route('connection-feeds.index')`
- [ ] Style consistently with existing buttons

### 5.3 Add FAB Button (if needed)
- [ ] Check if floating action button is needed on this page
- [ ] If yes, reuse CreatePostModal from Stories page

---

## Phase 6: UI/UX Polish

### 6.1 Styling
- [ ] Create CSS file or extend `stories.css`: `resources/css/connection-feeds.css`
- [ ] Match Stories page design system
- [ ] Implement 3-column layout
- [ ] Add responsive design for mobile/tablet
- [ ] Ensure consistent color scheme and typography

### 6.2 Animations & Interactions
- [ ] Add page transition animations
- [ ] Add post loading state indicators
- [ ] Add empty state graphics
- [ ] Add hover effects on posts

### 6.3 Accessibility
- [ ] Add proper ARIA labels
- [ ] Ensure keyboard navigation works
- [ ] Test screen reader compatibility
- [ ] Ensure proper contrast ratios

---

## Phase 7: Testing & Debugging

### 7.1 Backend Testing
- [ ] Test privacy filter logic with different privacy settings
- [ ] Test direct connection retrieval
- [ ] Test indirect connection retrieval
- [ ] Test 30-day filter
- [ ] Test edge cases (no connections, all private, etc.)

### 7.2 Frontend Testing
- [ ] Test page rendering
- [ ] Test post display
- [ ] Test sidebar functionality
- [ ] Test responsive design
- [ ] Test navigation
- [ ] Test empty states

### 7.3 Integration Testing
- [ ] Test full user flow (click button → see feeds → interact with posts)
- [ ] Test privacy settings apply correctly
- [ ] Test with different user roles/connections
- [ ] Performance testing (load time, query count)

### 7.4 Debugging
- [ ] Check browser console for errors
- [ ] Review Laravel logs
- [ ] Profile slow queries
- [ ] Verify data accuracy

---

## Phase 8: Deployment & Documentation

### 8.1 Code Review
- [ ] Review code for security issues
- [ ] Check code standards/style compliance
- [ ] Ensure proper error handling
- [ ] Verify comments/documentation

### 8.2 Database
- [ ] Run migrations
- [ ] Verify data integrity
- [ ] Test rollback if needed

### 8.3 Documentation
- [ ] Document new routes
- [ ] Document new services/repositories
- [ ] Update README if needed
- [ ] Add code comments for complex logic

---

## Implementation Checklist by Priority

### HIGH PRIORITY (Core Functionality)
1. [ ] Backend: ConnectionFeedsRepository with basic queries
2. [ ] Backend: ConnectionFeedsService with privacy filtering
3. [ ] Backend: ConnectionFeedsController
4. [ ] Frontend: Connection Feeds Index page layout
5. [ ] Frontend: Profile sidebar component
6. [ ] Routing: Add connection-feeds route
7. [ ] Navigation: Add button to MyProfile

### MEDIUM PRIORITY (Enhanced Features)
1. [ ] Privacy verification logic
2. [ ] Indirect connections support
3. [ ] Pagination/infinite scroll
4. [ ] Post engagement features (like, comment)
5. [ ] CSS styling and animations
6. [ ] Responsive design

### LOW PRIORITY (Polish)
1. [ ] Search/filter functionality
2. [ ] Sort options
3. [ ] Advanced animations
4. [ ] Performance optimizations
5. [ ] Caching strategy
6. [ ] Analytics tracking

---

## Key Technical Decisions

### Privacy Implementation Strategy
- Use repository pattern to abstract privacy logic
- Create separate privacy check method for reusability
- Cache privacy settings if needed for performance

### Frontend Architecture
- Reuse existing components (PostCard, layouts)
- Follow Stories page pattern for consistency
- Use Inertia.js for server-side rendering

### Performance Considerations
- Eager load relationships to avoid N+1 queries
- Use pagination for large feed lists
- Consider caching user connections
- Index frequently queried columns

---

## Notes
- Current User: Anthia (ID: 4) - use for testing
- Reference UI: Stories page (http://localhost/stories) - exclude Engagement Metrics sidebar
- Reference Sidebar: Connections page (http://localhost/connections)
- Privacy Settings: http://localhost/settings/privacy
- Focus on sleek, professional, conversion-friendly UI design

---

## Timeline Estimate
- Phase 1-2 (Backend): 2-3 hours
- Phase 3 (Frontend Layout): 1-2 hours
- Phase 4 (Privacy Logic): 1 hour
- Phase 5-6 (Routing & Styling): 1-2 hours
- Phase 7-8 (Testing & Deployment): 1-2 hours
- **Total: 6-10 hours of development**

---

## Status Tracking
- [ ] Started
- [ ] In Progress
- [ ] Completed
- [ ] Deployed
