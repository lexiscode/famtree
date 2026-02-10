# Plan: Extend Auto-Inference to Second & Third Cousins

## Context

The current inference system only handles 2-hop paths (user → intermediate → target). First cousins now work via 2-hop chains like `father_nephew → first_cousin`. But second/third cousins can't auto-infer because:

1. **Discovery gap**: `getSecondDegreeConnections()` only returns users 2 degrees away. Second cousins are typically 3 degrees away (parent → sibling → their child), so they never appear on the suggestions page.
2. **Path-finding gap**: `getConnectionPath()` only finds 1-hop and 2-hop paths. A 3-hop chain like `father → brother → son` (= first cousin) can't be found when no direct nephew/niece connection exists.
3. **Inference gap**: `inferRelationship()` only handles `length === 1` and `length === 2` paths.

## Approach: 3-Hop Extension + Recursive Composition

Extend all three layers (discovery, path-finding, inference) to support 3-hop chains. This enables:
- **First cousins** via parent→sibling→child (fallback when no nephew/niece connection exists)
- **Second cousins** via parent→sibling→child→child (4-hop, via 2-hop with stored first_cousin)
- **Third cousins** via adding `second_cousin_son/daughter → third_cousin` map entries

For second/third cousins: the system bootstraps — once users accept first_cousin suggestions, their children become 2nd-degree targets for `first_cousin_son → second_cousin` inference. Adding 3-hop mainly strengthens first cousin discovery.

## Files to Modify

### 1. `app/Repositories/GuestRepositories/AuthAccessRepositories/SuggestedConnectionRepository.php`

**A. Extend `getSecondDegreeConnections()` → support 3rd degree**

Add an optional `$maxDegree = 3` parameter. After finding 2nd-degree user IDs, do one more level:
- Get connections of 2nd-degree users
- Filter out user, direct connections, and 2nd-degree connections
- Merge with 2nd-degree results
- Each result tagged with its degree for confidence weighting

**B. Extend `getConnectionPath()` → support 3-hop BFS**

After the existing 2-hop loop fails, add a 3-hop search:
```php
// Try third-degree path (3-hop)
foreach ($directConnections as $connection1) {
    $intermediate1Id = /* other user in connection1 */;
    $intermediate1Connections = $this->getDirectConnections($intermediate1Id);

    foreach ($intermediate1Connections as $connection2) {
        $intermediate2Id = /* other user in connection2 */;
        if ($intermediate2Id === $userId) continue; // avoid cycle

        // Check if intermediate2 connects to target
        $connection3 = /* find connection between intermediate2 and userId2 */;
        if ($connection3) {
            return [
                'path' => [$connection1, $connection2, $connection3],
                'intermediate_user_ids' => [$intermediate1Id, $intermediate2Id],
                'length' => 3,
            ];
        }
    }
}
```

Performance: With ~10 connections per user, 3-hop checks ~1000 paths. Acceptable since it only runs when 2-hop finds nothing. Add cycle detection (skip visited nodes).

### 2. `app/Actions/GuestServices/AuthAccessServices/RelationshipInferenceService.php`

**A. Add `length === 3` handling in `inferRelationship()`**

After the existing `length === 2` block:
```php
if ($path['length'] === 3) {
    $conn1 = $path['path'][0];
    $conn2 = $path['path'][1];
    $conn3 = $path['path'][2];
    $intermediate1 = $path['intermediate_user_ids'][0];
    $intermediate2 = $path['intermediate_user_ids'][1];

    $type1 = getRelationshipFromUserPerspective($userId, $intermediate1, $conn1);
    $type2 = getRelationshipFromUserPerspective($intermediate1, $intermediate2, $conn2);
    $type3 = getRelationshipFromUserPerspective($intermediate2, $targetUserId, $conn3);

    // Reject ex-relation chains
    if (str_starts_with($type1, 'ex_') || str_starts_with($type2, 'ex_') || str_starts_with($type3, 'ex_')) {
        return null;
    }
    // Reject divorced chains
    if ($conn1->isDivorced() || $conn2->isDivorced() || $conn3->isDivorced()) {
        return null;
    }

    // Recursive composition: reduce [type1, type2, type3] pairwise
    $intermediateResult = inferCombinedRelationship($type1, $type2, ...);
    $finalResult = inferCombinedRelationship($intermediateResult['type'], $type3, ...);

    return [
        'type' => $finalResult['type'],
        'label' => $finalResult['label'],
        'confidence' => min($intermediateResult['confidence'], $finalResult['confidence']),
        'path_length' => 3,
    ];
}
```

Key: recursive pairwise composition reuses the existing inference map — no explosion of entries needed. E.g., `father → brother → son` reduces to `uncle → son` → `first_cousin`.

**B. Add missing inference map entries**

```php
// Third cousin inference (via stored second_cousin connections, 2-hop)
'second_cousin_son' => 'third_cousin',
'second_cousin_daughter' => 'third_cousin',
'second_cousin_child' => 'third_cousin',
```

### 3. `app/Actions/GuestServices/AuthAccessServices/SuggestedConnectionService.php`

Update `getSuggestedMembers()` to pass degree info through, so 3rd-degree suggestions display with slightly lower confidence context. The `getSecondDegreeConnections` call already feeds into `inferRelationship`, so the main change is just calling the extended method.

## How Inference Chains Resolve

**First cousin via 3-hop** (parent→sibling→child, no stored nephew connection):
```
father → brother → son
  Step 1: father + brother = uncle (from map)
  Step 2: uncle + son = first_cousin (from map)
  Result: first_cousin at 99% confidence
```

**Second cousin via 2-hop** (requires stored first_cousin connection):
```
first_cousin → son
  Result: second_cousin (already in map)
```

**Third cousin via 2-hop** (requires stored second_cousin connection):
```
second_cousin → son
  Result: third_cousin (new map entry)
```

## Verification

1. Run seeder (already done)
2. Test 3-hop first cousin: temporarily remove a nephew connection, verify inference still finds first_cousin through parent→sibling→child
3. Test second cousin: store a first_cousin connection, verify child of that person infers as second_cousin
4. Test third cousin: store a second_cousin connection, verify child infers as third_cousin
5. `npm run build` passes
6. Verify suggestions page shows 3rd-degree users
