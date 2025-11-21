## 🎯 Phase 6: Child Account Management

### 6.1 Child Account System
- [ ] **Database**: Modify `users` table
  - Add fields: `parent_user_id` (nullable), `is_child_account` (boolean), `created_by_user_id` (who created account - for child accounts)
  - When child account: `email` is nullable, `password` is optional

- [ ] **Backend**: Create ChildAccountService
  - Method: `createChildAccount($parentId, $childData)` - Create account for child
  - Validation: Only users 18+ can create child accounts
  - Auto-create connection: parent → child as "father" or "mother"
  - Set account as non-deleted child account

- [ ] **Backend**: Create ChildAccountController
  - `POST /accounts/child/create` - Create child account
  - `GET /accounts/child` - Get parent's child accounts
  - `POST /accounts/child/{id}/set-email` - Child sets their email when of age

- [ ] **Frontend**: Create `AuthAccessPages/ChildAccounts/ManageChildren.tsx`
  - Show list of child accounts created by parent
  - "Create Child Account" button
  - Show each child's basic info
  - Quick switch to child account button
  - Option to remove child account

- [ ] **Frontend**: Create `AuthAccessPages/ChildAccounts/CreateChild.tsx`
  - Form: First name, Last name, Username, Date of birth
  - Generate temporary password
  - Show credentials to parent
  - Auto-connect child as their son/daughter

- [ ] **Backend**: Create account switching mechanism
  - Session-based: Allow parent to login to child account
  - Track original user who logged in (for security audit)
  - "Switch Account" dropdown in navigation
  - "Back to Parent Account" button when viewing child

