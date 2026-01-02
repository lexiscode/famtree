# Follow/Unfollow Feature Implementation Plan

## Overview
Implement a Twitter-like follow/unfollow system where users can follow each other independently of family connections. Public posts from followed users will be visible to all followers.

## Database Schema Changes

### 1. Create `user_follows` table
**Migration**: `create_user_follows_table.php`
```php
- id (primary key)
- follower_user_id (foreign key to users.id) - The user who is following
- following_user_id (foreign key to users.id) - The user being followed
- created_at (timestamp)
- updated_at (timestamp)

Indexes:
- Unique constraint on (follower_user_id, following_user_id)
- Index on follower_user_id
- Index on following_user_id
```

## Backend Implementation

### 2. Create Model
**File**: `app/Models/GuestModels/UserFollow.php`
- Define relationships: follower() and following()
- Add fillable fields

### 3. Create Repository
**File**: `app/Repositories/GuestRepositories/UserFollowRepository.php`
Methods:
- `follow(int $followerId, int $followingId)` - Create follow relationship
- `unfollow(int $followerId, int $followingId)` - Remove follow relationship
- `isFollowing(int $followerId, int $followingId): bool` - Check if user is following
- `getFollowers(int $userId)` - Get list of users following this user
- `getFollowing(int $userId)` - Get list of users this user is following
- `getFollowerCount(int $userId): int` - Count followers
- `getFollowingCount(int $userId): int` - Count following
- `getMutualFollows(int $userId1, int $userId2)` - Get mutual follows between two users

### 4. Create Service
**File**: `app/Actions/GuestServices/UserFollowService.php`
Methods:
- `followUser(User $follower, int $followingId)` - Business logic for following
  - Validate: Cannot follow yourself
  - Validate: Not already following
  - Create follow relationship
  - Send notification to followed user
- `unfollowUser(User $follower, int $followingId)` - Business logic for unfollowing
  - Validate: Currently following
  - Remove follow relationship
- `getFollowStatus(int $viewerId, int $targetUserId)` - Get relationship status
  - Returns: isFollowing, isFollowedBy, followerCount, followingCount
- `getFollowersList(int $userId, int $viewerId)` - Get formatted followers list
- `getFollowingList(int $userId, int $viewerId)` - Get formatted following list

### 5. Create Controller
**File**: `app/Http/Controllers/GuestControllers/AuthAccessControllers/UserFollowController.php`
Methods:
- `follow(int $userId)` - POST endpoint to follow a user
- `unfollow(int $userId)` - POST endpoint to unfollow a user
- `followers(int $userId)` - GET endpoint to view followers page
- `following(int $userId)` - GET endpoint to view following page

### 6. Create Routes
**File**: `routes/web.php`
```php
Route::middleware(['web', 'auth'])->group(function () {
    Route::post('/users/{userId}/follow', [UserFollowController::class, 'follow'])->name('users.follow');
    Route::post('/users/{userId}/unfollow', [UserFollowController::class, 'unfollow'])->name('users.unfollow');
    Route::get('/users/{userId}/followers', [UserFollowController::class, 'followers'])->name('users.followers');
    Route::get('/users/{userId}/following', [UserFollowController::class, 'following'])->name('users.following');
});
```

### 7. Update ProfileController
**File**: `app/Http/Controllers/GuestControllers/AuthAccessControllers/ProfileController.php`
- Inject `UserFollowService`
- Add follow status data to both `show()` and `viewUser()` methods:
  - `isFollowing` - Whether viewer is following this user
  - `isFollowedBy` - Whether this user is following viewer
  - `followerCount` - Number of followers
  - `followingCount` - Number of users being followed

### 8. Update PostRepository (Stories Privacy)
**File**: `app/Repositories/GuestRepositories/PostRepository.php`
- Modify privacy filtering in `getUserPosts()`, `searchUserPosts()`, and `filterByType()`:
  - Current logic: Show public posts to everyone, connected posts to connections
  - New logic: Show public posts to everyone (including followers), connected posts to connections only
  - No change needed for private posts (owner only)

The existing privacy logic already handles this correctly since public posts are shown to everyone regardless of relationship.

## Frontend Implementation

### 9. Update ViewProfile Component
**File**: `resources/js/Pages/GuestPages/AuthAccessPages/Profile/ViewProfile.tsx`
Add:
- Follow/Unfollow button next to connection status
- Display follower and following counts (clickable to view lists)
- Handle follow/unfollow actions via Inertia router
- Show loading state during follow/unfollow operations

UI Changes:
```typescript
<div className="profile-stats">
    <div className="stat-item" onClick={() => router.visit(route('users.followers', userId))}>
        <span className="stat-count">{followerCount}</span>
        <span className="stat-label">Followers</span>
    </div>
    <div className="stat-item" onClick={() => router.visit(route('users.following', userId))}>
        <span className="stat-count">{followingCount}</span>
        <span className="stat-label">Following</span>
    </div>
</div>

{viewerId !== userId && (
    <button onClick={handleFollowToggle} className="follow-btn">
        {isFollowing ? 'Unfollow' : 'Follow'}
    </button>
)}
```

### 10. Create Followers/Following List Pages
**Files**:
- `resources/js/Pages/GuestPages/AuthAccessPages/Follow/FollowersList.tsx`
- `resources/js/Pages/GuestPages/AuthAccessPages/Follow/FollowingList.tsx`

Features:
- Display list of followers/following with profile pictures
- Show follow/unfollow button for each user
- Show mutual follow status
- Link to user profiles
- Search/filter functionality

### 11. Update Own Profile Page
**File**: `resources/js/Pages/GuestPages/AuthAccessPages/Profile/ViewOwnProfile.tsx` (or similar)
- Display follower and following counts
- Make counts clickable to view lists
- Show stats prominently

### 12. Create Follow Button Component (Optional)
**File**: `resources/js/Components/FollowButton.tsx`
- Reusable follow/unfollow button component
- Props: userId, isFollowing, onFollowToggle
- Handle loading states
- Show appropriate styling based on follow status

## Notification System Integration

### 13. Create Follow Notification
**File**: `app/Actions/GuestServices/NotificationService.php`
Add method:
- `sendFollowNotification(int $followerId, int $followedUserId)` - Send notification when someone follows you

Notification types to add:
- `user_followed` - "John Doe started following you"

## Testing Plan

### 14. Testing Checklist
- [ ] User can follow another user
- [ ] User cannot follow themselves
- [ ] User cannot follow the same user twice
- [ ] User can unfollow a user they're following
- [ ] Follower count updates correctly
- [ ] Following count updates correctly
- [ ] Followers list displays correctly
- [ ] Following list displays correctly
- [ ] Mutual follows are indicated
- [ ] Public posts are visible to all users (followers and non-followers)
- [ ] Connected posts are only visible to connected users
- [ ] Private posts are only visible to owner
- [ ] Follow notifications are sent
- [ ] Profile page shows correct follow status
- [ ] Follow/unfollow buttons work on multiple pages

## Migration Order

1. Create user_follows table migration
2. Run migration: `php artisan migrate`
3. Seed test data if needed

## Implementation Order

**Phase 1: Database & Backend Core**
1. Create migration for user_follows table
2. Create UserFollow model
3. Create UserFollowRepository
4. Create UserFollowService
5. Run and test migration

**Phase 2: API Endpoints**
6. Create UserFollowController
7. Add routes for follow/unfollow
8. Update ProfileController with follow status data
9. Test API endpoints with Postman/Insomnia

**Phase 3: Frontend Integration**
10. Update ViewProfile component with follow button and counts
11. Create FollowersList page
12. Create FollowingList page
13. Add routes for followers/following pages
14. Style components to match existing design

**Phase 4: Notifications & Polish**
15. Add follow notifications
16. Add loading states and error handling
17. Add optimistic UI updates
18. Test all functionality end-to-end

## Notes

- The existing privacy system already supports this: public posts are shown to everyone, so followers will see public posts without additional changes to PostRepository
- The follow system is **independent** of the connection system (family relationships)
- A user can be both connected (family) and following someone
- Consider rate limiting on follow/unfollow actions to prevent abuse
- Consider adding a "Remove Follower" feature for users to remove their followers
- Consider adding a "Block" feature enhancement later

## Open Questions

1. Should there be a privacy setting to make follower/following lists private?
2. Should users be able to prevent others from following them (private account)?
3. Should there be a notification when someone unfollows you?
4. Should there be a "suggested users to follow" feature?

