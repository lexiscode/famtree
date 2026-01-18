# Manual UI Test Workflow: Deceased Verification & Memorial Feature

A step-by-step manual testing guide to verify all UI functionality works correctly.

---

## Setup Before Testing

### Step 1: Create Test Users via Database

Run this command to create the test users:

```bash
docker-compose exec -T famtree php artisan tinker
```

Then paste this code:

```php
use App\Models\GuestModels\User;
use App\Models\GuestModels\UserConnection;

// User A - The "inactive" user who will be marked as deceased
$userA = User::create([
    'first_name' => 'John',
    'last_name' => 'Doe',
    'username' => 'johndoe_test',
    'email' => 'johndoe@test.com',
    'password' => bcrypt('Test1234'),
    'status' => 'alive',
    'gender' => 'male',
]);

// User B - Wife (close family)
$userB = User::create([
    'first_name' => 'Jane',
    'last_name' => 'Doe',
    'username' => 'janedoe_test',
    'email' => 'janedoe@test.com',
    'password' => bcrypt('Test1234'),
    'status' => 'alive',
    'gender' => 'female',
]);

// User C - Son (close family)
$userC = User::create([
    'first_name' => 'Mike',
    'last_name' => 'Doe',
    'username' => 'mikedoe_test',
    'email' => 'mikedoe@test.com',
    'password' => bcrypt('Test1234'),
    'status' => 'alive',
    'gender' => 'male',
]);

// User D - Friend (NOT close family)
$userD = User::create([
    'first_name' => 'Bob',
    'last_name' => 'Friend',
    'username' => 'bobfriend_test',
    'email' => 'bobfriend@test.com',
    'password' => bcrypt('Test1234'),
    'status' => 'alive',
    'gender' => 'male',
]);

// Create family connections
UserConnection::create([
    'requester_user_id' => $userA->id,
    'recipient_user_id' => $userB->id,
    'relationship_type' => 'wife',
    'status' => 'accepted',
    'requested_at' => now(),
    'accepted_at' => now(),
]);

UserConnection::create([
    'requester_user_id' => $userA->id,
    'recipient_user_id' => $userC->id,
    'relationship_type' => 'son',
    'status' => 'accepted',
    'requested_at' => now(),
    'accepted_at' => now(),
]);

// Friend connection (cousin - not close family)
UserConnection::create([
    'requester_user_id' => $userA->id,
    'recipient_user_id' => $userD->id,
    'relationship_type' => 'cousin',
    'status' => 'accepted',
    'requested_at' => now(),
    'accepted_at' => now(),
]);

echo "Done! Test accounts created.\n";
echo "User A (Inactive): johndoe@test.com / Test1234\n";
echo "User B (Wife): janedoe@test.com / Test1234\n";
echo "User C (Son): mikedoe@test.com / Test1234\n";
echo "User D (Friend): bobfriend@test.com / Test1234\n";
```

### Step 2: Create a Verification Record

```php
use App\Models\GuestModels\User;
use App\Models\GuestModels\DeceasedVerification;

$userA = User::where('email', 'johndoe@test.com')->first();

$verification = DeceasedVerification::create([
    'user_id' => $userA->id,
    'stage' => 'family_check',
    'reengagement_sent_at' => now()->subMonths(6),
    'family_check_sent_at' => now(),
]);

echo "Verification UUID: " . $verification->uuid . "\n";
echo "Save this UUID for testing!\n";
```

**Write down the UUID - you'll need it for testing.**

---

## Test 1: Family Status Check Page

### Test 1.1: Access Status Check as Family Member (Wife)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open browser | Browser opens |
| 2 | Go to `http://localhost/login` | Login page appears |
| 3 | Enter email: `janedoe@test.com` | Email entered |
| 4 | Enter password: `Test1234` | Password entered |
| 5 | Click Login | Successfully logged in, redirected to feed |
| 6 | Go to `http://localhost/status-check/{UUID}` (use UUID from setup) | Status check page loads |
| 7 | Verify page shows "A Gentle Check-In" heading | ✅ Heading visible |
| 8 | Verify page shows "About John Doe" | ✅ Name visible |
| 9 | Verify John's profile picture or initial is shown | ✅ Avatar visible |
| 10 | Verify message explains the situation sensitively | ✅ Explanation text present |
| 11 | Verify 3 response options are visible | ✅ All 3 options shown |

### Test 1.2: Submit Response as Wife

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "They have passed away" option | Option highlights with purple border |
| 2 | Verify "Submit Response" button is enabled | ✅ Button clickable |
| 3 | Click "Submit Response" | Loading state shows |
| 4 | Wait for submission | Redirected to Thank You page |
| 5 | Verify "Thank You" heading appears | ✅ Thank you message shown |
| 6 | Verify message mentions John's name | ✅ Personalized message |
| 7 | Click "Return to Home" | Redirected to home/feed page |

### Test 1.3: Duplicate Response Prevention

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Go to `http://localhost/status-check/{UUID}` again | Already Responded page loads |
| 2 | Verify "Already Responded" heading | ✅ Heading visible |
| 3 | Verify explanation that only one response is allowed | ✅ Message shown |
| 4 | Click "Return to Home" | Redirected to home |

### Test 1.4: Submit Response as Son

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click logout or go to `http://localhost/logout` | Logged out |
| 2 | Go to `http://localhost/login` | Login page |
| 3 | Login as `mikedoe@test.com` / `Test1234` | Logged in |
| 4 | Go to `http://localhost/status-check/{UUID}` | Status check page loads (NOT already responded) |
| 5 | Click "They have passed away" | Option selected |
| 6 | Click "Submit Response" | Redirected to Thank You page |

### Test 1.5: Non-Family Cannot Access

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Logout and login as `bobfriend@test.com` / `Test1234` | Logged in as friend |
| 2 | Go to `http://localhost/status-check/{UUID}` | Error message or redirect |
| 3 | Verify message says not authorized | ✅ Access denied for non-close-family |

---

## Test 2: Memorial Profile

### Setup: Make User A Memorialized

```bash
docker-compose exec -T famtree php artisan tinker --execute="
use App\Models\GuestModels\User;
\$user = User::where('email', 'johndoe@test.com')->first();
\$user->update([
    'is_memorial' => true,
    'memorialized_at' => now(),
    'status' => 'deceased',
    'death_date' => now()->subDays(7),
]);
echo 'User memorialized. Username: ' . \$user->username;
"
```

### Test 2.1: View Memorial Profile as Family

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login as `janedoe@test.com` / `Test1234` | Logged in |
| 2 | Go to `http://localhost/profile/johndoe_test` | Profile page loads |
| 3 | Verify Memorial Banner is visible at top | ✅ Purple/muted banner with candles |
| 4 | Verify "In Loving Memory" text | ✅ Text visible |
| 5 | Verify "John Doe" name displayed | ✅ Name shown |
| 6 | Verify death date is shown | ✅ Date visible |
| 7 | Verify "Message" button is HIDDEN | ✅ No message button |
| 8 | Verify "Connect" button is HIDDEN | ✅ No connect button |
| 9 | Verify "Follow" button is HIDDEN | ✅ No follow button |

### Test 2.2: View Memorial Profile as Non-Family

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login as `bobfriend@test.com` / `Test1234` | Logged in |
| 2 | Go to `http://localhost/profile/johndoe_test` | Profile page loads |
| 3 | Verify Memorial Banner is visible | ✅ Banner shown |
| 4 | Verify interactive buttons are hidden | ✅ No message/connect/follow |

---

## Test 3: Memorial Messages (Tributes)

### Test 3.1: Add Memorial Message as Wife

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login as `janedoe@test.com` / `Test1234` | Logged in |
| 2 | Go to `http://localhost/profile/johndoe_test` | Memorial profile loads |
| 3 | Scroll to "Tributes & Memories" section | Section visible |
| 4 | Verify textarea for adding message is visible | ✅ Input field shown |
| 5 | Type: "My dearest John, you were the love of my life. Rest in peace." | Text entered |
| 6 | Verify character count shows (e.g., "67/2000") | ✅ Counter visible |
| 7 | Click "Share Tribute" | Message submits |
| 8 | Verify message appears in the list | ✅ Message shown |
| 9 | Verify your name "Jane Doe" is shown | ✅ Author name visible |
| 10 | Verify "Wife" relationship is shown | ✅ Relationship label visible |
| 11 | Verify "Edit" and "Delete" buttons appear on YOUR message | ✅ Buttons visible |

### Test 3.2: Edit Memorial Message

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Edit" on your message | Edit mode activates |
| 2 | Verify textarea shows current message | ✅ Text editable |
| 3 | Change text to: "My dearest John, you were the love of my life. We miss you every day." | Text updated |
| 4 | Click "Save" | Message updates |
| 5 | Verify updated message appears | ✅ New text shown |
| 6 | Verify timestamp shows "edited" or still shows correctly | ✅ Updated |

### Test 3.3: Add Second Message as Son

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Logout and login as `mikedoe@test.com` / `Test1234` | Logged in |
| 2 | Go to `http://localhost/profile/johndoe_test` | Memorial profile loads |
| 3 | Type: "Dad, thank you for everything you taught me. I love you." | Text entered |
| 4 | Click "Share Tribute" | Message submits |
| 5 | Verify message appears in list | ✅ Message shown |
| 6 | Verify "Mike Doe" and "Son" shown | ✅ Author info correct |
| 7 | Verify you can ONLY edit/delete YOUR message (not Jane's) | ✅ Only own message has buttons |

### Test 3.4: Delete Memorial Message

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Delete" on your (Mike's) message | Confirmation prompt appears |
| 2 | Click "OK" to confirm | Message deleted |
| 3 | Verify message is removed from list | ✅ Message gone |
| 4 | Verify Jane's message still exists | ✅ Other messages remain |

### Test 3.5: Non-Family Cannot Add Message

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Logout and login as `bobfriend@test.com` / `Test1234` | Logged in |
| 2 | Go to `http://localhost/profile/johndoe_test` | Memorial profile loads |
| 3 | Verify NO textarea for adding message is visible | ✅ No input field (or disabled) |
| 4 | Verify only viewing existing messages is allowed | ✅ Read-only access |

---

## Test 4: Account Reactivation

### Setup: Generate Reactivation Token

```bash
docker-compose exec -T famtree php artisan tinker --execute="
use App\Models\GuestModels\User;
use Illuminate\Support\Str;

\$user = User::where('email', 'johndoe@test.com')->first();
\$token = Str::random(64);
\$user->update([
    'reactivation_token' => hash('sha256', \$token),
    'reactivation_token_expires_at' => now()->addHours(24),
]);
echo 'Reactivation Token: ' . \$token . PHP_EOL;
echo 'Use this in URL: http://localhost/reactivate/' . \$token;
"
```

**Copy the token from the output.**

### Test 4.1: View Reactivation Page

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open new browser (or incognito) | Fresh browser session |
| 2 | Go to `http://localhost/reactivate/{TOKEN}` | Reactivation page loads |
| 3 | Verify "Welcome Back, John!" heading | ✅ Personalized greeting |
| 4 | Verify explanation text is shown | ✅ Explains situation |
| 5 | Verify info box shows what will happen | ✅ List of restoration items |
| 6 | Verify "Reactivate My Account" button is visible | ✅ Button shown |

### Test 4.2: Confirm Reactivation

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Reactivate My Account" | Button shows loading |
| 2 | Wait for processing | Redirected to profile |
| 3 | Verify success message appears | ✅ "Welcome back" or similar |
| 4 | Verify you are now logged in as John | ✅ Logged in |
| 5 | Go to your profile | Profile loads |
| 6 | Verify Memorial Banner is GONE | ✅ No memorial banner |
| 7 | Verify profile shows normal status | ✅ Normal profile |

### Test 4.3: Invalid/Expired Token

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Go to `http://localhost/reactivate/invalid_token_12345` | Invalid page loads |
| 2 | Verify "Link Expired or Invalid" heading | ✅ Error message shown |
| 3 | Verify email input field appears | ✅ Can request new link |
| 4 | Enter `johndoe@test.com` | Email entered |
| 5 | Click "Request New Link" | Form submits |
| 6 | Verify success message (check email) | ✅ Confirmation shown |
| 7 | Check Mailpit at `http://localhost:8025` | ✅ Reactivation email received |

---

## Test 5: Status Change Pending Banner

### Setup: Create Pending Status Change

First, reset user to alive and create pending verification:

```bash
docker-compose exec -T famtree php artisan tinker --execute="
use App\Models\GuestModels\User;
use App\Models\GuestModels\DeceasedVerification;

\$user = User::where('email', 'johndoe@test.com')->first();
\$user->update([
    'is_memorial' => false,
    'memorialized_at' => null,
    'status' => 'alive',
]);

// Delete old verifications
DeceasedVerification::where('user_id', \$user->id)->delete();

// Create pending change verification
DeceasedVerification::create([
    'user_id' => \$user->id,
    'stage' => 'pending_change',
    'reengagement_sent_at' => now()->subMonths(12),
    'family_check_sent_at' => now()->subDays(14),
    'status_change_scheduled_at' => now()->addDays(16),
]);

echo 'Pending verification created. User can now login to see banner.';
"
```

### Test 5.1: View Pending Status Banner

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login as `johndoe@test.com` / `Test1234` | Logged in |
| 2 | Go to profile or feed | Page loads |
| 3 | Verify red/orange warning banner appears | ✅ Prominent warning banner |
| 4 | Verify banner says account will be memorialized | ✅ Warning text present |
| 5 | Verify scheduled date is shown | ✅ Date visible |
| 6 | Verify days remaining shown | ✅ Countdown visible |
| 7 | Verify "Cancel Status Change" button visible | ✅ Cancel button shown |

### Test 5.2: Cancel Status Change

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Cancel Status Change" button | Confirmation prompt appears |
| 2 | Click "OK" to confirm | Processing |
| 3 | Verify success message | ✅ Cancellation confirmed |
| 4 | Verify banner is now GONE | ✅ No more warning |
| 5 | Refresh page | Banner stays gone |

---

## Test 6: Email Verification (via Mailpit)

### Setup: Open Mailpit
Go to `http://localhost:8025` in a new tab.

### Test 6.1: Check Reengagement Email

Run command to trigger:
```bash
docker-compose exec -T famtree php artisan tinker --execute="
use App\Mail\ReengagementMail;
use App\Models\GuestModels\User;
use Illuminate\Support\Facades\Mail;

\$user = User::where('email', 'johndoe@test.com')->first();
Mail::to(\$user->email)->send(new ReengagementMail(\$user));
echo 'Email sent!';
"
```

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Go to Mailpit `http://localhost:8025` | Mailpit opens |
| 2 | Find email to `johndoe@test.com` | Email in list |
| 3 | Click to open email | Email opens |
| 4 | Verify subject: "We miss you on FamTree!" | ✅ Correct subject |
| 5 | Verify email mentions John's name | ✅ Personalized |
| 6 | Verify "Log In to FamTree" button exists | ✅ CTA button |
| 7 | Click the button | Opens login page |

### Test 6.2: Check Family Status Check Email

```bash
docker-compose exec -T famtree php artisan tinker --execute="
use App\Mail\FamilyStatusCheckMail;
use App\Models\GuestModels\User;
use App\Models\GuestModels\DeceasedVerification;
use Illuminate\Support\Facades\Mail;

\$inactive = User::where('email', 'johndoe@test.com')->first();
\$family = User::where('email', 'janedoe@test.com')->first();
\$v = DeceasedVerification::where('user_id', \$inactive->id)->first()
    ?? DeceasedVerification::create(['user_id' => \$inactive->id, 'stage' => 'family_check']);

Mail::to(\$family->email)->send(new FamilyStatusCheckMail(\$family, \$inactive, \$v));
echo 'Email sent!';
"
```

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find email to `janedoe@test.com` in Mailpit | Email found |
| 2 | Verify subject: "Is John Doe doing okay?" | ✅ Correct subject |
| 3 | Verify sensitive wording used | ✅ Gentle tone |
| 4 | Verify "Respond to This Check" button | ✅ CTA button |

### Test 6.3: Check Memorial Created Email

```bash
docker-compose exec -T famtree php artisan tinker --execute="
use App\Mail\MemorialCreatedMail;
use App\Models\GuestModels\User;
use Illuminate\Support\Facades\Mail;

\$deceased = User::where('email', 'johndoe@test.com')->first();
\$family = User::where('email', 'janedoe@test.com')->first();

Mail::to(\$family->email)->send(new MemorialCreatedMail(\$family, \$deceased));
echo 'Email sent!';
"
```

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find email in Mailpit | Email found |
| 2 | Verify subject mentions memorial created | ✅ Memorial subject |
| 3 | Verify candle emoji in email | ✅ Respectful design |
| 4 | Verify "Visit Memorial Page" button | ✅ CTA button |

---

## Cleanup After Testing

```bash
docker-compose exec -T famtree php artisan tinker --execute="
use App\Models\GuestModels\User;
use App\Models\GuestModels\DeceasedVerification;
use App\Models\GuestModels\DeceasedVerificationResponse;
use App\Models\GuestModels\MemorialMessage;
use App\Models\GuestModels\UserConnection;

\$emails = ['johndoe@test.com', 'janedoe@test.com', 'mikedoe@test.com', 'bobfriend@test.com'];

foreach (\$emails as \$email) {
    \$user = User::where('email', \$email)->first();
    if (\$user) {
        DeceasedVerificationResponse::whereHas('verification', fn(\$q) => \$q->where('user_id', \$user->id))->delete();
        DeceasedVerification::where('user_id', \$user->id)->delete();
        MemorialMessage::where('user_id', \$user->id)->orWhere('author_id', \$user->id)->delete();
        UserConnection::where('requester_user_id', \$user->id)->orWhere('recipient_user_id', \$user->id)->delete();
        \$user->forceDelete();
        echo 'Deleted: ' . \$email . PHP_EOL;
    }
}
echo 'Cleanup complete!';
"
```

---

## Test Summary Checklist

| Test | Description | Pass/Fail |
|------|-------------|-----------|
| 1.1 | Status check page loads for family member | ⬜ |
| 1.2 | Can submit "deceased" response | ⬜ |
| 1.3 | Duplicate response blocked | ⬜ |
| 1.4 | Second family member can respond | ⬜ |
| 1.5 | Non-family cannot access status check | ⬜ |
| 2.1 | Memorial banner shows on profile | ⬜ |
| 2.2 | Interactive buttons hidden on memorial | ⬜ |
| 3.1 | Can add memorial message as family | ⬜ |
| 3.2 | Can edit own memorial message | ⬜ |
| 3.3 | Multiple family can add messages | ⬜ |
| 3.4 | Can delete own message | ⬜ |
| 3.5 | Non-family cannot add message | ⬜ |
| 4.1 | Reactivation page loads with valid token | ⬜ |
| 4.2 | Can reactivate account | ⬜ |
| 4.3 | Invalid token shows error with retry option | ⬜ |
| 5.1 | Pending status banner shows for user | ⬜ |
| 5.2 | Can cancel pending status change | ⬜ |
| 6.1 | Reengagement email renders correctly | ⬜ |
| 6.2 | Family status check email renders | ⬜ |
| 6.3 | Memorial created email renders | ⬜ |

---

## Test Credentials Quick Reference

| User | Email | Password | Role |
|------|-------|----------|------|
| John Doe | johndoe@test.com | Test1234 | Inactive/Deceased User |
| Jane Doe | janedoe@test.com | Test1234 | Wife (Close Family) |
| Mike Doe | mikedoe@test.com | Test1234 | Son (Close Family) |
| Bob Friend | bobfriend@test.com | Test1234 | Cousin (NOT Close Family) |

---

## URLs Quick Reference

| Page | URL |
|------|-----|
| Login | http://localhost/login |
| Status Check | http://localhost/status-check/{UUID} |
| Profile | http://localhost/profile/{username} |
| Reactivation | http://localhost/reactivate/{TOKEN} |
| Mailpit (Emails) | http://localhost:8025 |
