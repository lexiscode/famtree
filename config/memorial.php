<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Inactivity Thresholds (in months)
    |--------------------------------------------------------------------------
    |
    | These values control when the deceased verification process begins.
    | - reengagement_threshold: Months of inactivity before sending "we miss you" email
    | - family_check_threshold: Total months of inactivity before contacting close family
    |
    */
    'reengagement_threshold' => 6,
    'family_check_threshold' => 12,

    /*
    |--------------------------------------------------------------------------
    | Waiting Period Before Status Change (in days)
    |--------------------------------------------------------------------------
    |
    | After family majority confirms deceased status, wait this many days
    | before finalizing the memorial status. This gives the user time to
    | respond if they are actually alive.
    |
    */
    'pending_change_days' => 30,

    /*
    |--------------------------------------------------------------------------
    | Minimum Responses Required
    |--------------------------------------------------------------------------
    |
    | The minimum number of close family responses required before
    | the system can make a decision on the user's status.
    |
    */
    'min_responses_required' => 2,

    /*
    |--------------------------------------------------------------------------
    | Reactivation Token Expiry (in hours)
    |--------------------------------------------------------------------------
    |
    | How long a reactivation token remains valid for deceased users
    | attempting to reclaim their account.
    |
    */
    'reactivation_token_expiry' => 24,

    /*
    |--------------------------------------------------------------------------
    | Close Family Relationship Types
    |--------------------------------------------------------------------------
    |
    | Only these relationship types are considered "close family" and
    | will be contacted during the family check stage. These are the
    | users who can respond to status check requests.
    |
    */
    'close_family_types' => [
        'wife',
        'husband',
        'father',
        'mother',
        'son',
        'daughter',
        'brother',
        'sister',
    ],

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting
    |--------------------------------------------------------------------------
    |
    | - reactivation_request_cooldown: Hours to wait between reactivation requests
    |
    */
    'reactivation_request_cooldown' => 1,
];
