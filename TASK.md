In the http://localhost/settings/privacy page, particularly the Profile Visibility section where we have radio button auto-submit options like public, connected only and private. Lets implement both the frontend and backend functionalities. First let me explain the UI workflow of how it should work upon UI testing.

If lets say User A selects "Public" here it what it means: 
- it means all connected users of that User A can see can see or access the profile view page (http://localhost/profile/{id}) of User A. 
- It also means, if User A is connected to User B, and User B is connected to User C, then User C can as well access User A profile view page (by entering User B profile first, and from there clicking on User A which will be on the Their Other Connections lists)

If lets say User A selects "Connected Only" here it what it means: 
- it means all connected users of that User A can see can see or access the profile view page (http://localhost/profile/{id}) of User A. 
- It also means, if User A is connected to User B, and User B is connected to User C, then User C cannot access User A profile view page (by entering User B profile first, and from there clicking on User A which will be on the Their Other Connections lists)

If lets say User A selects "Private" here it what it meaans:
- it means no connected users nor any user at all can access User A profile view page, http://localhost/profile/{id}
