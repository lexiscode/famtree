FIXED: User ID 5 (Chima, male) and User ID 1 (Alex, male) brother connection

Issue: When User 1 viewed their connections page, User 5 was incorrectly listed in the "sisters" section with "sister" label instead of "brothers" section with "brother" label.

Root Cause: The getInverseRelationship() method in UserConnectionRepository was not considering the recipient's gender when inverting sibling relationships. For same-gender sibling relationships, the label should not be inverted.

Solution: Updated getInverseRelationship() to:
1. Accept recipient gender as an additional parameter
2. Check if relationship type is 'brother' with male recipient -> return 'brother'
3. Check if relationship type is 'sister' with female recipient -> return 'sister'
4. Otherwise apply the standard inverse mapping

Result: Both users now correctly see same-gender sibling relationships with the matching gender-specific label.
