# Deceased Verification & Memorial Feature Implementation Plan

## Overview
Automated multi-stage system to detect potentially deceased users and convert their profiles to memorial mode with community verification from close family members.

---

## Phase 1: Database Migrations

### 1.1 Add `last_active_at` to users table
**File**: `database/migrations/2026_01_19_000001_add_last_active_at_to_users_table.php`
```php
- last_active_at (timestamp, nullable, index)
```

### 1.2 Create `deceased_verifications` table
**File**: `database/migrations/2026_01_19_000002_create_deceased_verifications_table.php`
```php
- id
- uuid (unique)
- user_id (FK users, index) - the inactive user being verified
- stage (enum: 'reengagement', 'family_check', 'pending_change', 'completed', 'cancelled')
- reengagement_sent_at (timestamp, nullable)
- family_check_sent_at (timestamp, nullable)
- status_change_scheduled_at (timestamp, nullable)
- final_status (enum: 'alive', 'deceased', nullable)
- completed_at (timestamp, nullable)
- cancelled_at (timestamp, nullable)
- cancelled_reason (string, nullable)
- timestamps
```

### 1.3 Create `deceased_verification_responses` table
**File**: `database/migrations/2026_01_19_000003_create_deceased_verification_responses_table.php`
```php
- id
- verification_id (FK deceased_verifications, index)
- responder_id (FK users, index) - the family member responding
- relationship_type (string) - wife, husband, etc.
- response (enum: 'alive', 'deceased', 'unknown')
- responded_at (timestamp)
- timestamps
```

### 1.4 Create `memorial_messages` table
**File**: `database/migrations/2026_01_19_000004_create_memorial_messages_table.php`
```php
- id
- user_id (FK users, index) - the deceased user
- author_id (FK users, index) - the family member writing
- relationship_type (string) - author's relationship to deceased
- message (text)
- is_approved (boolean, default true) - for moderation if needed
- timestamps
```

### 1.5 Add memorial fields to users table
**File**: `database/migrations/2026_01_19_000005_add_memorial_fields_to_users_table.php`
```php
- is_memorial (boolean, default false, index)
- memorialized_at (timestamp, nullable)
- memorialized_by (FK users, nullable) - who triggered the memorialization
- reactivation_token (string, nullable) - for deceased users to reclaim account
- reactivation_token_expires_at (timestamp, nullable)
```

### 1.6 Add new notification types
**File**: `database/migrations/2026_01_19_000006_add_memorial_notification_types.php`
- Add to notification type enum:
  - 'reengagement_check'
  - 'family_status_check'
  - 'status_change_pending'
  - 'user_memorialized'

---

## Phase 2: Models

### 2.1 DeceasedVerification Model
**File**: `app/Models/GuestModels/DeceasedVerification.php`
- Relationships: belongsTo User, hasMany Responses
- Scopes: pending(), atStage(), forUser()
- Methods: isExpired(), canBeCancelled()

### 2.2 DeceasedVerificationResponse Model
**File**: `app/Models/GuestModels/DeceasedVerificationResponse.php`
- Relationships: belongsTo Verification, belongsTo Responder (User)

### 2.3 MemorialMessage Model
**File**: `app/Models/GuestModels/MemorialMessage.php`
- Relationships: belongsTo User (deceased), belongsTo Author (User)

### 2.4 Update User Model
- Add relationships: hasOne DeceasedVerification, hasMany MemorialMessages
- Add accessor: getIsMemorializedAttribute()
- Add scope: scopeInactive($months)

---

## Phase 3: Backend Services

### 3.1 Middleware: UpdateLastActive
**File**: `app/Http/Middleware/UpdateLastActive.php`
- Updates `last_active_at` on every authenticated request
- Register in Kernel.php for web middleware group

### 3.2 DeceasedVerificationRepository
**File**: `app/Repositories/GuestRepositories/DeceasedVerificationRepository.php`
- createVerification()
- updateStage()
- addResponse()
- getResponsesForVerification()
- getActiveVerificationForUser()
- cancelVerification()
- getPendingVerifications()
- getVerificationsAtStage()

### 3.3 DeceasedVerificationService
**File**: `app/Actions/GuestServices/DeceasedVerificationService.php`

**Methods**:
- `findInactiveUsers(int $months)` - Get users inactive for X months without active verification
- `initiateReengagement(User $user)` - Start Stage 1
- `progressToFamilyCheck(DeceasedVerification $verification)` - Move to Stage 2
- `getCloseFamilyConnections(int $userId)` - Get spouse, parents, children, siblings only
- `sendFamilyCheckNotifications(DeceasedVerification $verification)` - Notify close family
- `recordResponse(DeceasedVerification $verification, User $responder, string $response)` - Record family response
- `calculateMajority(DeceasedVerification $verification)` - Determine majority vote
- `scheduleStatusChange(DeceasedVerification $verification)` - Set 30-day pending
- `executeStatusChange(DeceasedVerification $verification)` - Finalize to deceased
- `cancelVerification(DeceasedVerification $verification, string $reason)` - Cancel if user returns
- `handleUserLogin(User $user)` - Check and cancel any pending verification

**Close Family Types**:
```php
const CLOSE_FAMILY_TYPES = ['wife', 'husband', 'father', 'mother', 'son', 'daughter', 'brother', 'sister'];
```

### 3.4 MemorialService
**File**: `app/Actions/GuestServices/MemorialService.php`

**Methods**:
- `enableMemorial(User $user, User $triggeredBy)` - Convert profile to memorial
- `addMemorialMessage(User $deceased, User $author, string $message)` - Add tribute
- `updateMemorialMessage(MemorialMessage $message, string $newContent)` - Edit tribute
- `deleteMemorialMessage(MemorialMessage $message)` - Remove tribute
- `getMemorialMessages(User $deceased)` - Get all tributes
- `canAddMemorialMessage(User $author, User $deceased)` - Check if author is close family
- `generateReactivationToken(User $user)` - For account recovery
- `validateReactivationToken(string $token)` - Verify token
- `reactivateAccount(User $user)` - Revert to alive status

### 3.5 MemorialEmailService
**File**: `app/Actions/GuestServices/MemorialEmailService.php`

**Methods**:
- `sendReengagementEmail(User $user)` - "We miss you" email
- `sendFamilyCheckEmail(User $familyMember, User $inactiveUser, DeceasedVerification $verification)` - Ask family
- `sendStatusChangePendingEmail(User $user, DeceasedVerification $verification)` - Final warning
- `sendMemorialCreatedEmail(User $familyMember, User $deceased)` - Notify family of memorial
- `sendReactivationEmail(User $user)` - Account recovery link

---

## Phase 4: Email Templates (Mailables)

### 4.1 ReengagementMail
**File**: `app/Mail/ReengagementMail.php`
**View**: `resources/views/emails/reengagement.blade.php`
- Subject: "We miss you on FamTree!"
- Content: Friendly reminder, link to login

### 4.2 FamilyStatusCheckMail
**File**: `app/Mail/FamilyStatusCheckMail.php`
**View**: `resources/views/emails/family-status-check.blade.php`
- Subject: "Is [Name] doing okay?"
- Content: Sensitive wording, link to respond in-app

### 4.3 StatusChangePendingMail
**File**: `app/Mail/StatusChangePendingMail.php`
**View**: `resources/views/emails/status-change-pending.blade.php`
- Subject: "Important: Your FamTree account status"
- Content: Explain what's happening, link to cancel/login

### 4.4 MemorialCreatedMail
**File**: `app/Mail/MemorialCreatedMail.php`
**View**: `resources/views/emails/memorial-created.blade.php`
- Subject: "A memorial has been created for [Name]"
- Content: Notify family, link to view memorial

### 4.5 AccountReactivationMail
**File**: `app/Mail/AccountReactivationMail.php`
**View**: `resources/views/emails/account-reactivation.blade.php`
- Subject: "Verify your identity to reactivate your account"
- Content: Verification link with token

---

## Phase 5: Scheduled Commands (Artisan)

### 5.1 CheckInactiveUsersCommand
**File**: `app/Console/Commands/CheckInactiveUsersCommand.php`
**Schedule**: Daily at 2:00 AM
```php
// Find users inactive for 6+ months without active verification
// Create verification at 'reengagement' stage
// Send in-app notification + email
```

### 5.2 ProcessReengagementStageCommand
**File**: `app/Console/Commands/ProcessReengagementStageCommand.php`
**Schedule**: Daily at 3:00 AM
```php
// Find verifications at 'reengagement' for 6+ months (12 months total inactive)
// Progress to 'family_check' stage
// Send notifications to close family
```

### 5.3 ProcessFamilyResponsesCommand
**File**: `app/Console/Commands/ProcessFamilyResponsesCommand.php`
**Schedule**: Daily at 4:00 AM
```php
// Find verifications at 'family_check' with sufficient responses
// Calculate majority vote
// If deceased: move to 'pending_change', schedule 30-day wait
// If alive: cancel verification
```

### 5.4 ExecutePendingStatusChangesCommand
**File**: `app/Console/Commands/ExecutePendingStatusChangesCommand.php`
**Schedule**: Daily at 5:00 AM
```php
// Find verifications at 'pending_change' where 30 days passed
// Execute status change to deceased
// Enable memorial mode
// Notify family
```

### 5.5 Register in Console Kernel
**File**: `app/Console/Kernel.php`
```php
$schedule->command('deceased:check-inactive')->dailyAt('02:00');
$schedule->command('deceased:process-reengagement')->dailyAt('03:00');
$schedule->command('deceased:process-family-responses')->dailyAt('04:00');
$schedule->command('deceased:execute-pending-changes')->dailyAt('05:00');
```

---

## Phase 6: Controllers & Routes

### 6.1 DeceasedVerificationController
**File**: `app/Http/Controllers/GuestControllers/AuthAccessControllers/DeceasedVerificationController.php`

**Methods**:
- `showFamilyCheckForm($verificationUuid)` - Display response form
- `submitFamilyResponse(Request $request, $verificationUuid)` - Record response
- `cancelPendingChange()` - User cancels their own pending status change

### 6.2 MemorialController
**File**: `app/Http/Controllers/GuestControllers/AuthAccessControllers/MemorialController.php`

**Methods**:
- `addMessage(Request $request, $userUuid)` - Add memorial message
- `updateMessage(Request $request, $messageId)` - Edit message
- `deleteMessage($messageId)` - Delete message
- `getMessages($userUuid)` - Get all messages for a memorial

### 6.3 AccountReactivationController
**File**: `app/Http/Controllers/GuestControllers/AccountReactivationController.php`

**Methods**:
- `showReactivationForm($token)` - Display reactivation page
- `requestReactivation(Request $request)` - Deceased user requests reactivation
- `confirmReactivation($token)` - Verify and reactivate account

### 6.4 Routes
**File**: `routes/web.php`
```php
// Family status check response
Route::get('/status-check/{verificationUuid}', [DeceasedVerificationController::class, 'showFamilyCheckForm'])->name('status-check.show');
Route::post('/status-check/{verificationUuid}', [DeceasedVerificationController::class, 'submitFamilyResponse'])->name('status-check.submit');

// Cancel pending status change (authenticated)
Route::post('/cancel-status-change', [DeceasedVerificationController::class, 'cancelPendingChange'])->name('status-check.cancel')->middleware('auth');

// Memorial messages (authenticated)
Route::prefix('memorial')->middleware('auth')->group(function () {
    Route::get('/{userUuid}/messages', [MemorialController::class, 'getMessages'])->name('memorial.messages');
    Route::post('/{userUuid}/messages', [MemorialController::class, 'addMessage'])->name('memorial.add-message');
    Route::put('/messages/{messageId}', [MemorialController::class, 'updateMessage'])->name('memorial.update-message');
    Route::delete('/messages/{messageId}', [MemorialController::class, 'deleteMessage'])->name('memorial.delete-message');
});

// Account reactivation (unauthenticated)
Route::get('/reactivate/{token}', [AccountReactivationController::class, 'showReactivationForm'])->name('account.reactivate');
Route::post('/reactivate/{token}', [AccountReactivationController::class, 'confirmReactivation'])->name('account.reactivate.confirm');
Route::post('/request-reactivation', [AccountReactivationController::class, 'requestReactivation'])->name('account.request-reactivation');
```

---

## Phase 7: Frontend Components

### 7.1 Memorial Banner Component
**File**: `resources/js/Components/Memorial/MemorialBanner.tsx`
- Displays "In Loving Memory of [Name]" header
- Shows death date
- Candle/flower visual elements
- Soft, respectful color scheme (muted purples, whites)

### 7.2 Memorial Messages Section
**File**: `resources/js/Components/Memorial/MemorialMessages.tsx`
- List of tribute messages from family
- Shows author name, relationship, date
- Add message form (for close family only)
- Edit/delete own messages

### 7.3 Family Status Check Page
**File**: `resources/js/Pages/GuestPages/StatusCheck/Index.tsx`
- Shows inactive user's photo and name
- Sensitive wording: "We noticed [Name] hasn't been active in a while..."
- Three response options:
  - "They're doing well" (alive)
  - "They have passed away" (deceased)
  - "I'm not sure" (unknown)
- Thank you message after response

### 7.4 Status Change Pending Banner
**File**: `resources/js/Components/StatusChangePendingBanner.tsx`
- Shown to user during 30-day window
- "Your account is scheduled for memorial status. If this is a mistake, click here to cancel."
- Prominent cancel button

### 7.5 Account Reactivation Page
**File**: `resources/js/Pages/GuestPages/AccountReactivation/Index.tsx`
- For deceased users trying to log in
- Explains situation
- Email verification flow
- Success message on reactivation

### 7.6 Update ViewProfile.tsx
**File**: `resources/js/Pages/GuestPages/AuthAccessPages/Profile/ViewProfile.tsx`
- Add memorial banner when `is_memorial === true`
- Hide Message, Connect, Follow buttons for memorial profiles
- Add Memorial Messages section
- Disable any interaction forms

### 7.7 Update Post/Story Components
- Disable comments on deceased user's posts
- Show "Comments disabled" message
- Hide like/react buttons or make view-only

---

## Phase 8: Notification Integration

### 8.1 In-App Notifications
Extend existing NotificationService:

```php
// New methods to add:
- notifyReengagement(User $user)
- notifyFamilyStatusCheck(User $familyMember, User $inactiveUser, DeceasedVerification $verification)
- notifyStatusChangePending(User $user)
- notifyUserMemorialized(User $familyMember, User $deceased)
```

### 8.2 Notification Display Updates
- Add icons/styling for new notification types
- Family check notification links to response page
- Memorial notification links to memorial profile

---

## Phase 9: Security & Edge Cases

### 9.1 Login Interception for Deceased Users
**File**: `app/Http/Middleware/CheckDeceasedStatus.php`
- If user status is 'deceased' and tries to login
- Redirect to reactivation request page
- Generate and send reactivation token via email
- Only allow login after email verification

### 9.2 Verification Cancellation on Activity
In `UpdateLastActive` middleware:
- Check if user has pending verification
- If yes, cancel it automatically
- Notify family who responded that user is active

### 9.3 Malicious Response Prevention
- Only close family can respond (verified by connection + relationship_type)
- One response per family member per verification
- Unknown responses don't count toward majority
- Require minimum 2 responses before taking action (or 50% of close family, whichever is higher)

### 9.4 Rate Limiting
- Max 1 reactivation request per hour
- Reactivation token expires in 24 hours

---

## Configuration Constants

**File**: `config/memorial.php`
```php
return [
    // Inactivity thresholds (in months)
    'reengagement_threshold' => 6,
    'family_check_threshold' => 12,

    // Waiting period before status change (in days)
    'pending_change_days' => 30,

    // Minimum responses required
    'min_responses_required' => 2,

    // Reactivation token expiry (in hours)
    'reactivation_token_expiry' => 24,

    // Close family relationship types
    'close_family_types' => [
        'wife', 'husband', 'father', 'mother',
        'son', 'daughter', 'brother', 'sister'
    ],
];
```

---

## Files to Create Summary

### Migrations (6 files)
1. `add_last_active_at_to_users_table.php`
2. `create_deceased_verifications_table.php`
3. `create_deceased_verification_responses_table.php`
4. `create_memorial_messages_table.php`
5. `add_memorial_fields_to_users_table.php`
6. `add_memorial_notification_types.php`

### Models (3 files)
1. `DeceasedVerification.php`
2. `DeceasedVerificationResponse.php`
3. `MemorialMessage.php`

### Repositories (2 files)
1. `DeceasedVerificationRepository.php`
2. `MemorialMessageRepository.php`

### Services (3 files)
1. `DeceasedVerificationService.php`
2. `MemorialService.php`
3. `MemorialEmailService.php`

### Mailables (5 files)
1. `ReengagementMail.php`
2. `FamilyStatusCheckMail.php`
3. `StatusChangePendingMail.php`
4. `MemorialCreatedMail.php`
5. `AccountReactivationMail.php`

### Email Views (5 files)
1. `emails/reengagement.blade.php`
2. `emails/family-status-check.blade.php`
3. `emails/status-change-pending.blade.php`
4. `emails/memorial-created.blade.php`
5. `emails/account-reactivation.blade.php`

### Commands (4 files)
1. `CheckInactiveUsersCommand.php`
2. `ProcessReengagementStageCommand.php`
3. `ProcessFamilyResponsesCommand.php`
4. `ExecutePendingStatusChangesCommand.php`

### Controllers (3 files)
1. `DeceasedVerificationController.php`
2. `MemorialController.php`
3. `AccountReactivationController.php`

### Middleware (2 files)
1. `UpdateLastActive.php`
2. `CheckDeceasedStatus.php`

### Frontend Components (6 files)
1. `MemorialBanner.tsx`
2. `MemorialMessages.tsx`
3. `StatusCheck/Index.tsx`
4. `StatusChangePendingBanner.tsx`
5. `AccountReactivation/Index.tsx`
6. Update `ViewProfile.tsx`

### Config (1 file)
1. `config/memorial.php`

---

## Implementation Order

1. **Phase 1**: Migrations & Models (foundation)
2. **Phase 2**: Middleware for activity tracking
3. **Phase 3**: Config file
4. **Phase 4**: Repositories & Services
5. **Phase 5**: Mailables & Email views
6. **Phase 6**: Commands (scheduled jobs)
7. **Phase 7**: Controllers & Routes
8. **Phase 8**: Frontend components
9. **Phase 9**: Testing & edge cases

---

## Testing Checklist

- [ ] User activity tracking works
- [ ] Reengagement notifications sent at 6 months
- [ ] Family check notifications sent at 12 months
- [ ] Only close family receives notifications
- [ ] Response recording works
- [ ] Majority calculation correct
- [ ] 30-day pending period enforced
- [ ] Status change executes correctly
- [ ] Memorial mode enables properly
- [ ] Memorial messages CRUD works
- [ ] User can cancel pending change
- [ ] Deceased user can request reactivation
- [ ] Email verification for reactivation works
- [ ] Account reactivates successfully
- [ ] Memorial banner displays correctly
- [ ] Interactive buttons hidden on memorial profiles
- [ ] Comments disabled on deceased user's posts
