There's this new feature i will like us to add in the /your-tree page. Let's have something i call "Expanded View", lets have two of it, one from the paternal side and another for the maternal side. Now what do i mean?

Lets say for example, i am James or Emily or David, knowing their our mother is Sarah and our Father is Michael. Both parents represent maternal side and paternal side expanded view.

What that means is that, if James clicks on the "Paternal Expanded View", what James should see daniel.joseph tree - as in image1.png. And if James clicks on the "Maternal Expanded View", what James should see is tunde.john tree - as in image2.png.


NOTE:
The point i'm trying to make here is that, James's Dad, Michael Johnson, has his own father and grandfather and great-grand father; so depending on who is at the VERY TOP present in his linage in the tree, that person is what would be the starting point of the paternal expanded view for James. Which was why i said what James would get to see is daniel.joseph full tree (the same real tree structure that is scoped for only daniel.joseph to see, but will be visible for all if the Expanded View is clicked and if it happens daniel.joseph is the highest or top person on the starting tree head structure).

Now same ideology goes for the Maternal Expanded View too, to which means, James wants to see the history of his mother side, Sarah Johnson. And currently, for Sarah's historial linage in this app, its tunde.john that seems to be at the very top. Hence, that's why James is expected to see the full tree structure of tunde.john (the same scoped structure that tunde john sees when he logs in and visit /your-tree).


In summary, there should be a way whereby the system can really confirm who the paternal head or top is, when a child is trying to check to see the history of their father or mother linage. The system should trace the father/mother connection tree structure upwards down to the very top and focus should be on the father, grandfather, great grandfather, etc as the center spot.







Here's my understanding:

  Feature: "Expanded View" — Paternal & Maternal

  You want two buttons/options on /your-tree — "Paternal Expanded View" and "Maternal Expanded View". These allow a user to see the
  full tree of their highest ancestor on either their father's or mother's side.

  How it works (using James as example):

  James's parents are Michael (father) and Sarah (mother).

  - Paternal Expanded View: The system traces upward through James's father's lineage — Michael → Michael's father (Daniel Joseph) →
  and keeps going up (grandfather, great-grandfather, etc.) until it reaches the topmost person who has no parent above them in the
  system. In this case, that's Daniel Joseph. James then sees Daniel Joseph's full tree — the exact same tree Daniel would see if he
  logged in and visited /your-tree himself.
  - Maternal Expanded View: Same logic but through James's mother's lineage — Sarah → Sarah's father (Tunde John) → keeps going up.
  Tunde John is the topmost ancestor on that side, so James sees Tunde John's full tree as Tunde would see it.

  Key points:
  - The system needs to trace the parent chain upward (father → grandfather → great-grandfather...) to find the highest/oldest
  ancestor in the system on each side
  - Once found, it shows that ancestor's own full tree (not a scoped view — the real buildFamilyTree output for that person)
  - "Paternal" follows the father's father's father... chain; "Maternal" follows the mother's father/mother chain upward
