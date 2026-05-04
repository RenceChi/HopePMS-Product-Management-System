# Sprint 3 Manual Test Checklist

## 1. Auth (Sprint 1 regression)
- [ ] New email registration → confirmation email → INACTIVE account created
- [ ] INACTIVE user blocked from login with correct message
- [ ] SUPERADMIN (jcesperanza@neu.edu.ph) can log in directly
- [ ] Google OAuth button present and redirects to Google
 
## 2. Product CRUD (Sprint 2 regression)
- [ ] USER: Add and Edit buttons visible, Delete button HIDDEN
- [ ] SUPERADMIN: Add, Edit, Delete all visible
- [ ] Add Product: saves and appears in list
- [ ] Edit Product: updates correctly
- [ ] Soft Delete: product disappears from USER view immediately
- [ ] Recover: product reappears for all users
- [ ] Stamp column: hidden for USER, visible for ADMIN/SUPERADMIN
 
## 3. Reports (Sprint 3 — new)
- [ ] USER: Product Report link in sidebar, page loads with data
- [ ] USER: Top Selling NOT in sidebar, /reports/top-selling redirects away
- [ ] ADMIN: Product Report visible, Top Selling NOT visible
- [ ] SUPERADMIN: both reports visible and load with data
- [ ] Product Report: CSV export downloads a valid .csv file
- [ ] Top Selling: shows ranked list with bars
 
## 4. User Management (Sprint 3 — new)
- [ ] USER: User Management NOT in sidebar, /admin/users redirects away
- [ ] ADMIN: User Management NOT in sidebar (ADM_USER = 0 for ADMIN)
- [ ] SUPERADMIN: User Management visible and page loads
- [ ] SUPERADMIN row in table: Activate and Deactivate buttons disabled
- [ ] Hovering disabled buttons shows tooltip "SUPERADMIN accounts cannot be modified"
- [ ] Activate a USER account → user can now log in
- [ ] Deactivate a USER account → user is blocked from login
 
## 5. No hard deletes
- [ ] Grep search: no .delete() in src/ — CONFIRMED
- [ ] Supabase: no DELETE pg_policies — CONFIRMED