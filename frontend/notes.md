Elaview Development Issues - Organized Roadmap 🔥 CRITICAL - HIGH PRIORITY Issues affecting core user flows and authentication 1. Authentication & Routing Issues * Home page should be the landing no matter if user is authenticated or not - All onboarding should be eliminated * Login is redirecting to browse page - It should redirect to "Home" instead * Remove "Learn more" button on login page 2. Dashboard Data Filtering * Space owner dashboard is showing ALL properties/spaces - Should only show the specific user's data!!!! 3. Space Grid Scrolling Bug * The space grid stops scrolling down too soon - Bottom scroll threshold needs to be below the lowest card, or until pagination 🐛 BUG FIXES - MEDIUM PRIORITY Functional issues that need debugging 



4. Image Display Issues * Details modal might be showing PROPERTY pictures, not SPACE pictures * If user has only uploaded one photo, additional photos should not show up - Currently repeating the same first image multiple times 


6. Notification System * Notification dropdown shows approve button - Should not have approve button * Approve and deny should only appear for new campaign invitations 📅 CALENDAR & AVAILABILITY SYSTEM - HIGH COMPLEXITY Major feature development requiring database changes 7. Property Owner Calendar System * Property owner cannot specify availability dates while listing their space * Should be able to see 6 months of calendar ahead * Specify which dates DO NOT work for them * View their calendar inside dashboard * See dates that spaces have been booked 8. Details Modal Calendar * Details modal calendar should show available dates for that particular space * If space is already booked during certain days, that should not show up * If space is booked, the property owner's calendar should update 🔄 WORKFLOW & ADMIN FEATURES - COMPLEX Business logic and admin review processes 9. Campaign Management * Need to isolate the campaign invitation page - Create test route for development 10. Admin Review System * After space owner confirmation, need a way to review the transaction as an admin - Before advertiser pays 🎨 UI/UX DEVELOPMENT - DESIGN NEEDED Requires wireframing and design before implementation 11. Checkout Page * Need wireframe for checkout page - Design phase required before development 📊 

Please review this and lets start on #2.

NO PARTIALS. Must include FULL files. That doesn't mean 50% of a file and a comment saying // include the rest of your code here. It means a full file. 

Here are contextual files you may need in order to work on #2. If you need anything else you must ask.