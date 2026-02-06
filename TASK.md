I want you to first take a good look at the image.jpeg in this project root directory. i sketched it on a piece of paper, how i will like two different tree-like case studies to look like. That's a draft sketch, but it should give you an idea of what i expect to see.


-----------------------------------------------------------------------------
CASE I (First Case)

Mr A and Mrs B are husband and wife. They both have sons and daughters. Each member of this family are connected in this famtree app, and have their tree structures intact in http://localhost/your-tree
Now lets assume, some years down the line, Mr A and Mrs B divorces. Then Mr A marries a new wife (lets call it Mrs C). And then Mr A and Mrs C had children to, some sons and daughters for example. The previous connection node-line between Mr A and Mrs B has to be cut off in the tree (to indicate a divorce case). Look at image.jpeg, look at how i want the tree to look like for CASE I.

NB: Currently we have no logic that hands a divorce case, so we might need to consider that, so we can difference between when there are two wives in the application, to be sure if they are active wives or if one is divorced.



------------------------------------------------------------------------------
CASE II (The Reverse Case)

Mr A and Mrs B are husband and wife. They both have 2 sons and 2 daughters. Each member of this family are connected in this famtree app, and have their tree structures in http://localhost/your-tree
Now lets assume, some years down the line, Mr A and Mrs A divorces. Then Mr B marries another husband (lets call it Mr C). And then Mrs A and Mr C had children to, lets say 2 sons and 2 daughters. The previous connection node-line between Mr A and Mrs B has to be cut off in the tree (to indicate a divorce case). Look at image.jpeg, look at how i want the tree to look like for CASE II.



UI Testing Workflow

  1. Set Up: You need two users with a spousal connection

  - Log in as User A, go to /connections/create
  - Search for User B and send a connection request with relationship type Wife, Husband, or Partner
  - Log in as User B, go to /connections/pending and accept the request

  2. Test the Divorce Button on MyConnections Page

  - Log in as either user, go to /connections
  - Find the spousal connection card — it should show "✓ Connected" badge
  - You should see a "Mark as Divorced" button (red outline) at the bottom of that card
  - Non-spousal connections (brother, mother, etc.) should NOT have this button
  - Click "Mark as Divorced" — a confirmation prompt appears: "Are you sure?" with Confirm / Cancel
  - Click Cancel — nothing happens
  - Click Confirm — the connection card now shows a "Divorced" badge (red background) instead of "✓ Connected", and the divorce
  button disappears

  3. Test the Connection Tree (/your-tree)

  - Log in as the root user who has both a divorced spouse and (ideally) a current spouse
  - Go to /your-tree
  - Divorced spouse should appear to the LEFT of you with:
    - A dashed gray line (not solid colored)
    - Label abbreviation XW / XH / XP on hover
  - Active spouse should appear to the RIGHT with a solid colored line (unchanged behavior)
  - The legend at the bottom-left should show a dashed line entry labeled "Divorced"

  4. Test the Family Group Tree (/family-tree/{uuid}/tree)

  - Go to your family tree page and click into the tree visualization
  - Divorced spouse should appear with:
    - Gray dashed line connecting to you
    - A ✕ symbol instead of the ♥ heart
    - Gray-toned node styling
    - Role label showing "ex wife" / "ex husband" / "ex partner" above the node

  5. Test Child Grouping (requires children)

  - If User A has children connected to both the divorced and current spouse:
    - On /your-tree, children should be grouped under their respective parent pair
    - Children connected to the divorced spouse cluster toward the left
    - Children connected to the active spouse cluster toward the right

  Ideal Test Scenario

  For the fullest test, set up:
  - Root user (you)
  - Ex-spouse (connected as wife/husband, then divorced)
  - Current spouse (new spousal connection)
  - Child 1 connected to both root and ex-spouse
  - Child 2 connected to both root and current spouse

  This lets you verify all the visual grouping and layout behavior.




