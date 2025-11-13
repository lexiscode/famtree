I want you to read below thoroughly, because i would like you to create a DEVELOPMENT_TODOS.md tasks for all implementation ideas i have concerning this app below. Both the UI/X Frontend designs and the Backend implementation tasks too. And pls, as for all the pages or UI we will need, Pls the UI needs to be very sleek as usual, in a much attractive and professional look, that can increase conversation rate. Use the app platform's brand colors too. Use both bootstrap, bootstrap icons and css in your designs.


The FamTree idea which I have is very broad, but i will like us to first start with the basics. Below, I’m going to explain some basic functionality and UI workflow and setup I will like to see in the application, particularly accessible only for logged-in/registered users on the platform.

ASSUMING I AM A NEW USER, THIS IS MY EXPECTED UI WORKFLOW:

#EXPECTED FUNCTIONALITY
There will be an onboarding UI interface immediately after the very first login/register access for a user, before accessing the landing homepage, which must be completed in order to setup their profile to at least a very good extent, though some onboarding requirements there steps can be optional to which they can set those data later in their profile. 

NB: The onboarding should also have or ask questions like, are you a married? If yes, are you a dad or mom? If either, do you have kids, if yes, how many kids? Etc and these data should be stored in the database. ALSO, it should ask if they have siblings of their own paternal family? And if yes, they can search if any sibling or parent is on the platform through their usernames/names/emails and send connection requests, etc

PROFILE DETAILS TO DISPLAYED FOR LOGGED-IN USERS:
Full Name (first name and last name), username, short bio, date of birth, phone number, home address, job title, state of origin, local govt, town name, name of high school, name of college attended, skills, profile image, photo galleries, etc. There are also some other details which the app will auto-fill up like through the connections made with others, like father’s name, mother’s name, siblings etc.


#EXPECTED FUNCTIONALITY
The exact same step I did above, the registering and then following the app’s onboarding process and then landing on my profile homepage details of myself (assuming I’m man who is married, for instance). Therefore, my wife too would follow these same steps I followed when she creates her own account too, and likes each of our kids accounts. 

#EXPECTED FUNCTIONALITY
Then lets assume, as a dad/mom that i am, either of the parents can decide to create an account for their new infant from within their own profile, but when creating the account, they will fill in first name, last name, username, password, no email required - later when the child is of age, he/she can set an email in their own profile account. Then once i create the account for one of my infact kid, i will need to logout of mine and login to theirs in order to send/accept connection requests. This feature is cool so that parents can start documenting details of their kids at an early stage for them, to which the kids own future kids will see those data in the future too.

#EXPECTED FUNCTIONALITY

I also should be able to send a connection request to his wife, to link with her, with the platform asking me “who she is to me” with list of options like (wife, sibling, mom, step-sibling, cousin, niece, aunt, step-mom, etc), then i chose “my wife”. Now my wife gets notified in her own account that someone (which is me) has sent a connection request proposing or claiming to be her husband, then she accepts/confirms the request (to approve that indeed she’s my wife). The system then creates the family linkage for both of them automatically as being connected and in relations to each other. Same goes the other way around, and every other similar connection requests, like siblings connections, and the likes. I can send connection request to my kids, claiming to be their dad, while they get the request and confirms. Their mom too will do likewise to claim she is their mom while they too accepts. They too can be the ones to send the request first to their parents.

#EXPECTED FUNCTIONALITY
In my own profile, all my connections and my connections own connections can gets to see all info in my profile (aside from my wife’s connection with her siblings and parents though) my Dad and Mom (their grandparents), and my wife and kids. And they can enter other people’s i’m connected to profiles through my own profile. For instance, my wife enters my profile through hers, and then she has access to investigating or viewing my connections with my dad, and click on his name or so, in order to access his profile and she will see all profile details of my dad in the process. Likewise all my connections, siblings, cousins, relatives and the likes, she can access them through my linkage.

 In my wife profile, we get to see that I am her husband, and her kids, and her own parent names and siblings (but without access to their profiles) as her husband. But she can access her own parents profile and siblings, and likewise them to hers, but they can’t see her husband (which is my own profile) and kids profiles, just our names as the link won’t be clickable for them.


#EXPECTED FUNCTIONALITY

NB: Whenever anyone sends a connection request to someone, they can unsend that request incase its a mistake (before the person approves or declines it)

NB: If someone mistakenly approves a connection request, they can undo it within an estimated timeframe (i.e. 24 hours). But after that period, it will be permanent, and only Admin can help in this case.

NB: Anyone who already has connection to their parent (both their mom and dad), when another random person tries to want to claim they’re their parent (mom or dad) - the person’s request shouldn’t go through. An error feedback should tell the person that that person they’re trying to connect with as their dad already has a Dad or Mom connected to them. So that we don’t have duplicates, because surely, one can’t have two biological dads. Except they are step-dad or step-mom, which we will discuss this case better in later implementation.

NB: Each user can lock important details of their profile whereby only themselves or their linked families can see it. Not an outsiders or users who ain’t linked with them, it should be blurry for them.

NB: By default a new user is set as “Alive” only their fellow siblings or parents (the nuclear family members) or they themselves, that can set each other profiles from “Alive” to “Deceased” label.
