i'm logged-in as @daniel.williams, and in http://localhost/suggested-connections,

@emma.vincent was suggested as "This person seems to be your father-in-law" (wrong)
@anthia.vincent was suggested as "This person seems to be your mother-in-law" (wrong)
@tosin.vincent was suggested as "This person seems to be your brother-in-law" (wrong)
@damilola.vincent was suggested as "This person seems to be your sister-in-law" (wrong)

@daniel.williams is the child of @robert.williams, and @robert.williams is the brother to @michael.johnson, and then @michael.johnson's wife (@deborah.johnson) has siblings (@tosin.vincent and @damilola.vincent) and parents (@emma.vincent and @anthia.vincent).

And in English, there's no specific kinship term for the relationship between @daniel.williams and @emma.vincent (nor @anthia.vincent). 
And in English, there's a kinship term for the relationship between @daniel.williams and @tosin.vincent (or @damilola.vincent) - which is "Uncle (by marriage)" and "Aunt (by marriage)" respectively.

Therefore my final take is that, let the system not suggest to @daniel.williams, the parents of @deborah.johnson' but the system can still suggest to @daniel.williams the siblings of @deborah.johson in this way,

@tosin.vincent was suggested as "This person seems to be your uncle (by marriage)" 
@damilola.vincent was suggested as "This person seems to be your aunt (by marriage)"


Also in that case, it means we would need to include these relationship type in both the /suggested-connections form field and also the /connections/create page in the relationship type field options list. and also, we will need to have its own new row/section in /connections page as well