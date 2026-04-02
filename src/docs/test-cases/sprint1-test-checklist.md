# Sprint 1 Manual Test Checklist

## Email Registration
- [ ] Register with first name, last name, username, email, password
- [ ] Confirmation email received at the provided address
- [ ] Clicking confirmation link activates the auth account
- [ ] "user" table shows new row with record_status = INACTIVE
- [ ] user_module and UserModule_Rights rows auto-created for the new user
- [ ] Logging in before activation shows "pending activation" message

## Google OAuth
- [ ] "Sign in with Google" button redirects to Google consent screen
- [ ] After approving, redirects to /auth/callback
- [ ] New Google user appears in Supabase Authentication → Users
- [ ] New row in "user" table with record_status = INACTIVE
- [ ] Login attempt blocked with "pending activation" message
- [ ] Username defaults to email prefix if Google doesn't provide a name

## Login Guard
- [ ] INACTIVE users are signed out and see error message (both methods)
- [ ] After manually setting record_status = 'ACTIVE', user can log in
- [ ] Logged-in ACTIVE user reaches /products

## Routing
- [ ] Visiting /products while not logged in → redirected to /login
- [ ] Placeholder pages (Products, Reports) load without errors
- [ ] AppShell shows correct username after login

## SUPERADMIN Seed
- [ ] jcesperanza@neu.edu.ph exists in Supabase Auth Users
- [ ] "user" table has SUPERADMIN row with record_status = ACTIVE
- [ ] All 6 rights rows for SUPERADMIN have Right_value = 1