In LARAVEL logs:

[2025-11-23 12:10:53] local.DEBUG: === ProfileController Debug === {"viewer_id":4,"owner_id":1} 
[2025-11-23 12:10:53] local.DEBUG: Profile Data Keys: ["id","name","username","email","phone","address","date_of_birth","gender","bio","profile_image_url","status","job_title","education","created_at"] 
[2025-11-23 12:10:53] local.DEBUG: Profile Data: {"id":1,"name":"Alex Nwokorie","username":"lexiscode","email":"nwokoriealex20@gmail.com","phone":"09021801803","address":"33 Oremeji Street Ososami Oke-Ado","date_of_birth":"1997-06-14 00:00:00","gender":"male","bio":"i'm a software developer","profile_image_url":"http://localhost/storage/profile-images/0ukgusH6ARFFeVIIqnHtAsmgD2x3wTGoHOjEE55y.jpg","status":"alive","job_title":"Met. and Mat. Engineering","education":"associate","created_at":"2025-11-21 20:52:45"} 
[2025-11-23 12:10:53] local.DEBUG: FieldVisibility Keys: ["full_name","email","phone","address","date_of_birth","gender","bio","job_title","education","profile_image_url","status"] 
[2025-11-23 12:10:53] local.DEBUG: FieldVisibility: {"full_name":{"label":"Full Name","visible":true,"privacyLevel":"public"},"email":{"label":"Email Address","visible":true,"privacyLevel":"public"},"phone":{"label":"Phone Number","visible":false,"privacyLevel":"only_me"},"address":{"label":"Address","visible":true,"privacyLevel":"public"},"date_of_birth":{"label":"Date of Birth","visible":true,"privacyLevel":"public"},"gender":{"label":"Gender","visible":true,"privacyLevel":"public"},"bio":{"label":"Bio","visible":true,"privacyLevel":"public"},"job_title":{"label":"Job Title","visible":true,"privacyLevel":"public"},"education":{"label":"Education","visible":true,"privacyLevel":"public"},"profile_image_url":{"label":"Profile Picture","visible":true,"privacyLevel":"public"},"status":{"label":"Alive/Deceased Status","visible":true,"privacyLevel":"public"}} 
[2025-11-23 12:10:53] local.DEBUG: VisibleFields Keys: ["full_name","email","phone","address","date_of_birth","gender","bio","job_title","education","profile_image_url","status"] 
[2025-11-23 12:10:53] local.DEBUG: VisibleFields: {"full_name":{"visible":true,"label":"Full Name"},"email":{"visible":true,"label":"Email Address"},"phone":{"visible":false,"label":"Phone Number"},"address":{"visible":true,"label":"Address"},"date_of_birth":{"visible":true,"label":"Date of Birth"},"gender":{"visible":true,"label":"Gender"},"bio":{"visible":true,"label":"Bio"},"job_title":{"visible":true,"label":"Job Title"},"education":{"visible":true,"label":"Education"},"profile_image_url":{"visible":true,"label":"Profile Picture"},"status":{"visible":true,"label":"Alive/Deceased Status"}} 


In browser console:

✓ Field full_name found in visibleFields - RENDERING
✓ Field email found in visibleFields - RENDERING
✓ Field phone found in visibleFields - RENDERING
✓ Field address found in visibleFields - RENDERING
✓ Field date_of_birth found in visibleFields - RENDERING
✓ Field gender found in visibleFields - RENDERING
✓ Field bio found in visibleFields - RENDERING
✓ Field job_title found in visibleFields - RENDERING
✓ Field education found in visibleFields - RENDERING
✓ Field status found in visibleFields - RENDERING
✓ All expected fields present
