# Suggested Family Members Feature - Implementation Plan

## Overview
Implement a "Suggested Family Members" feature that recommends potential family connections based on the user's existing connections. If User A is connected to User B, and User B is connected to User C, User A should see User C as a suggested family member with an inferred relationship type.

---

## Phase 1: Backend Logic & Service Layer

### Task 1.1: Create Suggested Connections Repository
- **File**: `app/Repositories/GuestRepositories/AuthAccessRepositories/SuggestedConnectionRepository.php`
- **Responsibilities**:
  - Get all direct connections for a user
  - Get second-degree connections (connections of connections)
  - Filter out already connected users
  - Filter out blocked users
  - Return suggested users with their IDs

### Task 1.2: Create Relationship Inference Service
- **File**: `app/Actions/GuestServices/AuthAccessServices/RelationshipInferenceService.php`
- **Responsibilities**:
  - Analyze connection chains between users
  - Infer relationship types based on paths (e.g., Brother + Sister = Sister)
  - Handle complex scenarios (Example #2: uncle/nephew relationships)
  - Return inferred relationship type and human-readable label
  - Create inference map for all possible relationship combinations

### Task 1.3: Relationship Inference Logic Implementation
- Implement relationship chain analysis algorithm
- Map relationship combinations:
  - `brother + sister = sister`
  - `brother + brother = brother`
  - `sister + sister = sister`
  - `brother + mother = mother` (or father depending on chain)
  - `son/daughter + mother = nephew/niece`
  - And so on for complex chains
- Create helper method to generate human-readable labels ("This person seems to be your...")

### Task 1.4: Create Suggested Connections Service
- **File**: `app/Actions/GuestServices/AuthAccessServices/SuggestedConnectionService.php`
- **Responsibilities**:
  - Orchestrate repository and inference service
  - Get suggested connections with inferred relationships
  - Handle pagination
  - Format results for API response
  - Filter by relationship type if needed

---

## Phase 2: Backend API Endpoints

### Task 2.1: Create Suggested Connections Controller
- **File**: `app/Http/Controllers/GuestControllers/AuthAccessControllers/SuggestedConnectionController.php`
- **Responsibilities**:
  - `index()` - Show suggested connections page
  - `list()` - API endpoint to fetch suggestions (with pagination/filtering)
  - `relationshipTypes()` - Get available relationship types for filtering

### Task 2.2: Create Routes
- **File**: `routes/web.php`
- Add routes:
  - `GET /suggested-connections` → `SuggestedConnectionController@index`
  - `POST /api/suggested-connections` → `SuggestedConnectionController@list`
  - Include middleware: `auth` (user must be logged in)

### Task 2.3: Add Form Request Validation (Optional)
- **File**: `app/Http/Requests/GuestRequests/AuthAccessRequests/ListSuggestedConnectionsRequest.php`
- Validate pagination parameters and filters

---

## Phase 3: Frontend UI - Pages

### Task 3.1: Create Suggested Connections Page Component
- **File**: `resources/js/Pages/GuestPages/AuthAccessPages/Connections/SuggestedMembers.tsx`
- **Features**:
  - Left sidebar: User profile (similar to MyConnections page)
  - Right content area: Suggested members list
  - Search functionality
  - Filter by relationship type
  - Pagination or infinite scroll
  - Each suggestion card shows:
    - Profile image
    - Full name
    - Username
    - Relationship inference text ("This person seems to be your...")
    - Action buttons (View Profile, Send Connection Request)

### Task 3.2: Create Suggestion Card Component
- **File**: `resources/js/Components/Connections/SuggestedMemberCard.tsx`
- **Features**:
  - Responsive card design matching the dark theme
  - Profile image with hover effects
  - Name and username display
  - Relationship inference text styled nicely
  - View Profile button
  - Send Connection Request button with loading state
  - Tooltip or additional info on hover

### Task 3.3: Style Suggested Members Page
- **File**: `resources/css/suggested-members.css` or add to existing `connections.css`
- Match the existing connections page styling:
  - Dark theme background
  - Blue accent colors matching the app theme
  - Smooth transitions and hover effects
  - Responsive layout for mobile

---

## Phase 4: Frontend Features & Interactions

### Task 4.1: Add "Suggested Family Members" Button to Profile
- **File**: `resources/js/Pages/GuestPages/AuthAccessPages/Profile/MyProfile.tsx`
- Location: Connection overview section
- Button should link to `/suggested-connections`
- Display count of available suggestions (optional)

### Task 4.2: Implement Search Functionality
- Search by name or username
- Filter results in real-time on the client side
- Update URL parameters for shareable links

### Task 4.3: Implement Filtering by Relationship Type
- Dropdown/select to filter by inferred relationship type
- Show all suggestions by default
- Update results when filter changes

### Task 4.4: Implement Connection Request from Suggestions
- Button to send connection request
- Show modal/confirmation dialog
- Allow user to select relationship type for their request
- Handle success/error states with toast notifications
- Remove suggestion from list after successful request

---

## Phase 5: TypeScript Types & Interfaces

### Task 5.1: Create Type Definitions
- **File**: `resources/js/types/index.ts` (or existing types file)
- Define types:
  - `SuggestedConnection` - User data with inferred relationship
  - `RelationshipInference` - Inferred relationship and label
  - `InferenceConfig` - Mapping of relationship combinations
  - `SuggestedConnectionsPageProps` - Page props

---

## Phase 6: Database & Backend Optimization

### Task 6.1: Analyze Query Performance
- Test suggested connections queries with large connection networks
- Ensure efficient database queries
- Consider caching if needed

### Task 6.2: Add Caching (Optional Enhancement)
- Cache suggestions for users
- Invalidate cache when connections change
- Set reasonable TTL (e.g., 1 hour)

---

## Phase 7: Testing

### Task 7.1: Unit Tests for Relationship Inference
- **File**: `tests/Unit/Services/RelationshipInferenceServiceTest.php`
- Test all relationship combinations
- Test complex multi-level chains

### Task 7.2: Feature Tests for Suggestions
- **File**: `tests/Feature/SuggestedConnectionsControllerTest.php`
- Test API endpoints
- Test filtering and pagination
- Test authorization

---

## Phase 8: Documentation & Polish

### Task 8.1: Code Comments & Documentation
- Document relationship inference logic
- Comment complex algorithms
- Create inline documentation for helpers

### Task 8.2: User Experience Polish
- Add empty state messaging
- Add loading skeletons
- Add error handling messages
- Test on mobile devices

### Task 8.3: Analytics & Tracking (Optional)
- Track suggestion clicks
- Track connection requests from suggestions
- Track which relationship types are most common

---

## Implementation Order

**Recommended sequence to implement:**
1. **Phase 1** (Backend Logic) - Foundation
   - Task 1.1, 1.2, 1.3, 1.4
2. **Phase 2** (API) - Backend endpoints
   - Task 2.1, 2.2, 2.3
3. **Phase 5** (Types) - TypeScript definitions
   - Task 5.1
4. **Phase 3** (UI) - Frontend pages
   - Task 3.1, 3.2, 3.3
5. **Phase 4** (Features) - Interactions
   - Task 4.1, 4.2, 4.3, 4.4
6. **Phase 6** (Optimization) - Performance
   - Task 6.1, 6.2
7. **Phase 7** (Testing) - Quality assurance
   - Task 7.1, 7.2
8. **Phase 8** (Polish) - Final touches
   - Task 8.1, 8.2, 8.3

---

## Key Considerations

### Relationship Inference Complexity
- Must handle multi-level connections
- Need clear rules for when to suggest (e.g., 2-3 levels deep?)
- Must avoid suggesting too many irrelevant users

### Performance
- Query optimization critical for users with many connections
- Consider pagination or infinite scroll
- Lazy load suggestion cards

### User Experience
- Clear, understandable relationship labels
- Easy-to-scan UI
- Fast response times
- Mobile-friendly design

### Privacy & Security
- Respect user privacy settings when showing suggestions
- Don't suggest blocked users
- Don't suggest if profile is private (if applicable)
- Validate all requests server-side

---

## Notes for Implementation

- Start with simple two-level suggestions first (direct connection's connections)
- Expand to multi-level if needed
- Keep relationship inference logic centralized and testable
- Reuse existing connection-related code patterns from the codebase
- Follow the Service + Repository pattern already established
- Match the dark theme and UI patterns from existing pages

