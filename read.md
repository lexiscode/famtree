 do you remember that recent concept we did, whereby lets assume i'm logged-in as michael.johnson, and i visit my /your-tree
  page, i see my own full scoped tree structure. and when i click on someone's node, like my siblings, wife or kids, i see my
  direct relationship with them and all their downwards tree structure  which may not be in my own full tree

● Yes, I remember. When you're on /your-tree as michael.johnson:

  1. Your own tree — full tree with spouses, children, grandchildren, parents, siblings, extended family (via buildFamilyTree)
  2. Click someone's node (e.g. your son James) — switches to a scoped tree (via buildScopedTree) showing:
    - James as root with his downward family (spouses, children, grandchildren)
    - You (Michael) appear as a single viewer node above, with the relationship edge
    - All labels are from your perspective (what each person is to you)
    - This reveals James's downward connections that might not appear in your own tree







 cool! now this downward approach should only work when the auth user (viewer) is looking at or trying to view someone's node
  who is in his level/positioning or below his level/positioning; what i mean by that is, for instance, Michael, it works fine
  when he is viewing any of his siblings, or wives, or children, or child's children nodes etc, this is the downward logic we
  had already done.

  now i will like us to work on the upward logic too, whereby if Michael decides to click on for instance his Mother's
  (glory.joseph) or Father's (daniel.joseph) node. If he clicks on Glory Joseph node, let it show also a scoped tree, showing
  Glory Joseph's siblings and parents - which are upward, and the connection node-lines will have his direct relationship labels
   to them.

  do you really understand my idea? pls restate it to me

● Yes, here's my understanding:

  Current (downward scoped tree): When Michael clicks a node at his level or below (siblings, spouses, children, grandchildren,
  etc.), he sees that person as root with their downward family — their spouses, children, grandchildren. Michael appears as a viewer
   node above. This already works.

  New (upward scoped tree): When Michael clicks a node above him (like his mother Glory Joseph or father Daniel Joseph), he should
  see that person as the focal point with their upward family — their siblings (Michael's uncles/aunts), their parents (Michael's
  grandparents), and potentially further ancestors. Michael appears as a viewer node below, since he's the child.

  All relationship labels in both cases are from Michael's perspective — so Glory's brother would show as "Uncle", Glory's parents
  would show as "Grandmother"/"Grandfather", etc.

  In short: The direction of the scoped tree flips based on whether you're clicking someone above or below you in the hierarchy.
  Below = show their downward family. Above = show their upward family.
