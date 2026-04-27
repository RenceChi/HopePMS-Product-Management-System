# Sprint 1 Log

## Week 1 (April 12, 2026)

### Project Lead/Scrum Master
**Tasks done**
- Completed the initial HopePMS project setup, including the repository creation, Vite + React 18 + Tailwind scaffold, and documented our branching/contribution guidelines.
- Finalized the core database architecture in Supabase, specifically the user, user_module, and UserModule_Rights tables.
- Implemented and successfully tested the provision_new_user database trigger, resolving earlier syntax errors and locking down admin security vulnerabilities.
- Verified our frontend module access and database triggers to officially clear the Sprint 1 gate.

**Blockers**
- No critical technical blockers on the backend right now (we successfully caught and deleted a rogue updated_at trigger that was causing database crashes).
- Mild dependency: Just waiting on M2 to finish the dynamic UI components for the /products page so we can transition from sandbox testing to the real end-to-end integration.

**Next steps**
- I've already finalized my primary backend deliverables for this sprint: PR-01 (productService.js & stampHelper.js) and PR-02 (priceHistService.js).
- Passing the API Sandbox components over to M2 (Frontend) and M5 (QA) so they can use them as a live contract to build out the UI and write test cases.
- Reviewing M3's upcoming Row Level Security (RLS) pull requests to ensure our role-based access holds up.

### Frontend Developer (UI/UX)
**Tasks done**
- Built login page
- Helped debug authentication issues

**Blockers**
- None at the moment

**Next steps**
- Preparing for Sprint 2

### Backend/DB Engineer
**Tasks done**
- Set up Supabase project and configured modules & rights
- Added SUPERADMIN users and fixed full access (modules + rights)
- Resolved issues with rights_value not updating correctly

**Blockers**
- None at the moment

**Next steps**
- Implementing and testing


### Rights & Authentication Specialists
**Tasks done**
- Set up local development environment (Node.js, npm, Git, cloned repo, configured .env.local)
- Created src/db/supabase.js as the Supabase client connector
- Built src/context/AuthContext.jsx with session listener, currentUser and session state
- Wrapped <App /> with <AuthProvider> in main.jsx
- Added login guard in ProtectedRoute.jsx checking record_status = 'ACTIVE'
- Added inactive error message display in AuthPage.jsx
- Added record_status check in AuthCallback.jsx for Google OAuth users
- Configured redirect URL (http://localhost:5173/auth/callback) in Supabase Auth settings
- Written and deployed provision_new_user() PostgreSQL trigger that creates new users as USER / INACTIVE with default module and rights rows
- Opened all 4 Pull Requests (PR-01, PR-02, PR-03, PR-04)

**Blockers**
- None at the moment

**Next steps**
- Addressing remaining QA feedback on PRs
- Fixing ProtectedRoute.jsx column name bug (id → userid)
- Updating trigger-provision-user.sql with final version and pushing to GitHub
- Fixed 5 QA bugs in the trigger including missing rights rows, incorrect module values, Google OAuth fallback, duplicate guard, and missing columns

### QA / Documentation Specialist
**Tasks done**
- Installed Vitest
- Created test checklist
- Documented DB schema
- Created auth test cases
- Manually verified email registration verification
- Tested auth test cases and created test log
- Wrote README.md & CONTRIBUTING.md

**Blockers**
- None at the moment

**Next steps**
- Preparing for Sprint 2

## End of Sprint 1