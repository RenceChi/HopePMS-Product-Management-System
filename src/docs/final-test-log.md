# Sprint 3 — Final End-to-End Regression Log
# Tested on: https://hope-pms-product-management-system.vercel.app/
# Date: 4 May 2026
 
## Sprint 1 Test Checklist

### Email Registration
- [x] Register with first name, last name, username, email, password
- [x] Confirmation email received at the provided address
- [x] Clicking confirmation link activates the auth account
- [x] "user" table shows new row with record_status = INACTIVE
- [x] user_module and UserModule_Rights rows auto-created for the new user
- [x] Logging in before activation shows "pending activation" message

### Google OAuth
- [x] "Sign in with Google" button redirects to Google consent screen
- [x] After approving, redirects to /auth/callback
- [x] New Google user appears in Supabase Authentication → Users
- [x] New row in "user" table with record_status = INACTIVE
- [x] Login attempt blocked with "pending activation" message
- [x] Username defaults to email prefix if Google doesn't provide a name

### Login Guard
- [x] INACTIVE users are signed out and see error message (both methods)
- [x] After manually setting record_status = 'ACTIVE', user can log in
- [x] Logged-in ACTIVE user reaches /products

### Routing
- [x] Visiting /products while not logged in → redirected to /login
- [x] Placeholder pages (Products, Reports) load without errors
- [x] AppShell shows correct username after login

### SUPERADMIN Seed
- [x] jcesperanza@neu.edu.ph exists in Supabase Auth Users
- [x] "user" table has SUPERADMIN row with record_status = ACTIVE
- [x] All 6 rights rows for SUPERADMIN have Right_value = 1

## Sprint 2 Test Checklist
 
### Product CRUD
- [x] Add Product: form opens, saves correctly, appears in list
- [x] Add Product: prodCode max 6 chars enforced
- [x] Edit Product: form pre-fills, saves changes correctly
- [x] Soft Delete: product disappears from USER view immediately
- [x] Soft Delete: product still appears in ADMIN Deleted Items
- [x] Soft Delete: no DELETE statement fired (check Supabase logs)
- [x] Recover: product reappears in all users' product lists
 
### Rights Enforcement (test each user type)
- [x] USER — Add button visible, Edit button visible, Delete button HIDDEN
- [x] ADMIN — Add button visible, Edit button visible, Delete button HIDDEN
- [x] SUPERADMIN — All 3 buttons visible
 
### Stamp Visibility
- [x] USER — stamp column NOT shown in product table
- [x] USER — stamp column NOT shown in price history panel
- [x] ADMIN — stamp column IS shown in product table
- [x] SUPERADMIN — stamp column IS shown in product table
 
### Deleted Items Access
- [x] USER — "Deleted Items" link NOT visible in sidebar
- [x] USER — navigating to /deleted-items URL redirects to /products
- [x] ADMIN — "Deleted Items" link IS visible, page loads
- [x] SUPERADMIN — "Deleted Items" link IS visible, page loads
 
### Price History
- [x] Price history panel opens for a product
- [x] Adding a price entry saves correctly with effDate and unitPrice
- [x] Most recent price shows at top of list
- [x] unitPrice validation: negative or zero rejected
 
### RLS verification (check via Supabase SQL Editor)
- [x] Run: SELECT * FROM product WHERE record_status='INACTIVE' — as USER via API → 0 rows
- [x] Run: SELECT * FROM product — as ADMIN via API → includes INACTIVE rows

## Sprint 3 Test Checklist

### 1. Auth (Sprint 1 regression)
- [x] New email registration → confirmation email → INACTIVE account created
- [x] INACTIVE user blocked from login with correct message
- [x] SUPERADMIN (jcesperanza@neu.edu.ph) can log in directly
- [x] Google OAuth button present and redirects to Google
 
### 2. Product CRUD (Sprint 2 regression)
- [x] USER: Add and Edit buttons visible, Delete button HIDDEN
- [x] SUPERADMIN: Add, Edit, Delete all visible
- [x] Add Product: saves and appears in list
- [x] Edit Product: updates correctly
- [x] Soft Delete: product disappears from USER view immediately
- [x] Recover: product reappears for all users
- [x] Stamp column: hidden for USER, visible for ADMIN/SUPERADMIN
 
### 3. Reports (Sprint 3 — new)
- [x] USER: Product Report link in sidebar, page loads with data
- [x] USER: Top Selling NOT in sidebar, /reports/top-selling redirects away
- [x] ADMIN: Product Report visible, Top Selling NOT visible
- [x] SUPERADMIN: both reports visible and load with data
- [x] Product Report: CSV export downloads a valid .csv file
- [x] Top Selling: shows ranked list with bars
 
### 4. User Management (Sprint 3 — new)
- [x] USER: User Management NOT in sidebar, /admin redirects away
- [x] ADMIN: User Management NOT in sidebar (ADM_USER = 0 for ADMIN)
- [x] SUPERADMIN: User Management visible and page loads
- [x] SUPERADMIN row in table: Activate and Deactivate buttons disabled
- [x] Hovering disabled buttons shows tooltip "SUPERADMIN accounts cannot be modified"
- [x] Activate a USER account → user can now log in
- [x] Deactivate a USER account → user is blocked from login
 
### 5. No hard deletes
- [x] Grep search: no .delete() in src/ — CONFIRMED
- [x] Supabase: no DELETE pg_policies — CONFIRMED