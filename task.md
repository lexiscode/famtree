Currently, we have organization accounts in http://localhost/org/*, and for this new task, let the new feature which i'm about sharing be implemented only for school org.

For example, we have Unilag as a school org, and we want this school org to have a single Student Union (SUG) group chat. 

In the school org admin panel, lets make them be able to create a new group chat dynamically in http://localhost/org/groups, which would only reflect within their org. The school should also be able to manage who the president and vice-president would be on the group, in this case SUG group chat.

And just as the school can send broadcast messages to ALL org groups from within http://localhost/org/broadcasts/create, lets also make a duplicate of this but only to be accessed by the president/vice-present of the SUG group. 

At the initial stages, the school org, for instance Unilag management, would create the SUG group and then add few users, say the president and vice-president, after which those newly added people can add the rest of their teams to the group easily just by searching their username; as everyone must at least be following the school org in http://localhost/organizations/university-of-lagos, or at least belong to a group within it.

Also, it means, the school admin can create a new role in http://localhost/org/roles, and assign the sug president to it, so they can have login access to the school admin panel, but their permissions is only restricted to them adding more people to their group and also sending custom broadcast messages from current to last 6 years faulty/deparmental group chats, just as we currently have for school admin in http://localhost/org/broadcasts/create, but for SUG, they can't send to all years past groups - just limited to last 5 years group chats.














Here's my understanding of what you're asking for, followed by additional ideas:

  ---
  My Understanding

  You want to build a SUG (Student Union Government) group chat + broadcast system scoped to school-type organizations. The
  core pieces are:

  1. Dynamic Group Chat Creation (/org/groups) — School org admins can create group chats (e.g. "SUG") that exist only
  within their org. They can manage membership and assign leadership roles (president, vice-president) on each group.
  2. SUG Leadership Broadcast Access — The president/vice-president of the SUG group get their own broadcast page (similar
  to /org/broadcasts/create) where they can send messages to org group chats — but limited to groups from the current year
  back to 5 years ago (not all historical groups like the school admin can).
  3. Bootstrapping Flow — School admin creates the SUG group → adds initial members (president, VP) → those leaders can then
   add more members themselves by searching usernames, with the constraint that candidates must either be following the
  school org or already belong to a group within it.
  4. Role-Based Admin Panel Access — School admin creates a custom role (/org/roles) and assigns it to the SUG president.
  This grants them limited login access to the school admin panel, restricted to:
    - Managing their own group's membership (adding people)
    - Sending broadcasts to faculty/departmental group chats (current year minus 5 years only)

  ---
  Additional Ideas Worth Considering

  Here are things a SUG or school administration would likely need:

  Governance & Structure

  - More leadership roles beyond president/VP — Secretary, Treasurer, PRO, Social Director, etc. Each could have different
  permission levels (e.g. only president/VP can broadcast, but secretary can manage membership).
  - Term/tenure tracking — SUG executives change yearly. A handover mechanism where the school admin can rotate leadership
  (archive old exec, assign new ones) without losing chat history.
  - Multiple union groups — Not just SUG. Faculty-level unions (e.g. Engineering Students Association), departmental reps,
  hall/hostel committees. Each with their own leadership and broadcast scope.

  Broadcast & Communication

  - Broadcast approval workflow — SUG president drafts a broadcast → school admin approves before it goes out (optional
  toggle the school can enable/disable).
  - Broadcast analytics — Read receipts / delivery stats so SUG and school admin can see how many students actually saw a
  broadcast.
  - Scheduled broadcasts — Allow SUG to schedule messages for a future date/time (e.g. event reminders).
  - Broadcast categories/tags — Election notices, event announcements, emergency alerts, general info — so recipients can
  filter or the school can audit by type.

  Membership & Access Control

  - Membership requests — Instead of only leaders adding people, students could request to join the SUG group (with leader
  approval).
  - Auto-membership rules — Automatically add all students who follow the org, or all students in a specific
  faculty/department group.
  - Member removal & banning — Leaders should be able to remove members; school admin should be able to override.
  - Activity audit log — Track who added/removed whom, who sent which broadcasts — important for accountability in a student
   government context.

  School Admin Oversight

  - Broadcast moderation — School admin can view all SUG broadcasts (read-only) for oversight, or flag/remove inappropriate
  ones.
  - Permission templates — Instead of manually configuring permissions per role, have preset templates like "Union Leader",
  "Group Moderator", etc.
  - Suspension/deactivation — School admin can temporarily suspend SUG broadcast privileges (e.g. during election periods or
   disciplinary actions).

  Student-Facing

  - Group chat UI for members — Beyond broadcasts, an actual group chat where SUG members can discuss amongst themselves.
  - Polls/voting within groups — SUG frequently needs to poll students or conduct internal votes.
  - Pinned announcements — Important messages that stay at the top of the group.
