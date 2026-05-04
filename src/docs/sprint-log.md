# Sprint 1 Log

## Week 1-2

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

## End of Sprint 1 Summary
The team successfully completed the foundational setup of the HopePMS project, covering both backend and frontend essentials, with no major blockers encountered.

**Key Accomplishments**
- Project Setup & Architecture
  - Initialized repository and frontend stack (Vite + React 18 + Tailwind).
  - Designed and implemented core Supabase database structure (users, modules, and rights).
  - Established contribution guidelines and development workflow.
- Authentication & User Management
  - Built full authentication flow (login, Google OAuth, session handling).
  - Implemented provision_new_user trigger to auto-create users with default roles and permissions.
  - Enforced access control using record status and protected routes.
- Backend Development
  - Completed core backend services (product and price history services).
  - Resolved database issues (triggers, rights updates, admin access vulnerabilities).
- Frontend Progress
  - Developed login UI and assisted in debugging authentication.
- QA & Documentation
  - Set up testing framework (Vitest).
  - Created test cases, logs, and documentation (README, CONTRIBUTING, DB schema).
  - Verified authentication workflows.

**Blockers**
- No critical blockers across teams.
- Minor dependency: frontend awaiting dynamic UI components for full integration.

**Next Steps (Sprint 2)**
- Integrate backend services with frontend UI.
- Continue frontend feature development (e.g., products page).
- Review and implement Row Level Security (RLS).
- Address QA feedback and finalize pending fixes.

# Sprint 2 Log

## Week 3-4

### Project Lead/Scrum Master
**Tasks done**
- Successfully completed my primary Sprint 2 backend deliverables: PR-01 (productService API & stampHelper utility) and PR-02 (priceHistService API).
- Built temporary Sandbox React components to independently test our API functions against the live Supabase database.
- Successfully validated our database constraints (composite primary keys for price history, character limits for product codes) and identified/deleted rogue updated_at database triggers to ensure flawless write operations.
- Officially provided the working Sandbox components to M2 (Frontend) and M5 (QA) to serve as live "API Contracts" for their UI development and Vitest configurations.

**Blockers**
- No technical blockers! The backend logic is stable and tested.
- Mild dependency: I am holding on end-to-end integration until M2 finishes the dynamic UI components for the /products and Price History panels.

**Next steps**
- Supporting M2 and M4 as they integrate the product and price history APIs into the actual frontend layout.
- Reviewing M3’s upcoming Row Level Security (RLS) pull requests (e.g., rls-product-select) to ensure our role-based access perfectly aligns with our Sprint 2 Rights Matrix.

### Frontend Developer (UI/UX)
**Tasks done**
- Submitted all 4 Sprint 2 Pull Requests:
  - PR-01 feat/ui-product-list
  - PR-02 feat/ui-product-crud
  - PR-03 feat/ui-price-history
  - PR-04 feat/ui-deleted-items
- All Sprint 2 M2 deliverables done and reviewed:
  - ProductListPage
  - AddProductModal
  - EditProductModal
  - SoftDeleteConfirmDialog
  - PriceHistoryPanel
  - DeletedItemsPage
  - Navbar and Sidebar updates

**Blockers**
- UserRightsContext and AdminRoute required in main.jsx 
- stampHelper.js VARCHAR(60) bug

**Next steps**
- Waiting for Sprint 3 tasks to be assigned

### Backend/DB Engineer
**Tasks done**
- Implemented RLS policies for product (SELECT, INSERT, UPDATE with edit, soft-delete, recovery)
- Created current_product_price view for latest pricing per product
- Added RLS policies for priceHist (SELECT and INSERT for authenticated users)
- Tested all policies using Supabase SQL editor with different user roles

**Blockers**
- Corrupted OS

**Next steps**
- Final testing and validation of RLS behavior across USER, ADMIN, SUPERADMIN
- Clean up and submit PRs for Issues #59–61


### Rights & Authentication Specialists
**Tasks done**
- PR-02: Authentication Architecture
  - Feature: Implemented *Supabase Auth* integration.
  - Impact: Established the core security layer allowing users to Sign Up, Log In, and Log Out. 
  - Outcome: Secured the application entrance and enabled persistent user sessions.
- PR-03: Global State & Context API
  - Feature: Created the **AuthContext** and **UserRightsContext**.
  - Impact: Centralized user data and permission logic. This eliminated "Prop Drilling," allowing any component in the app to instantly know who is logged in and what they can do.
  - Outcome: Improved code maintainability and application performance.
- PR-04: Advanced Routing & Layouts*
  - Feature: Developed **ProtectedRoute** and **AdminRoute** wrappers.
  - Impact: Built a "Navigation Guard" system that automatically redirects unauthorized users. Designed the **MainLayout** with a dynamic Sidebar that adapts to the user's role.
  - Outcome: Established a professional, scalable folder structure and routing hierarchy.

**Blockers**
- Async Synchronization: Resolved issues where the app would try to load protected pages before the Supabase session was fully recognized (Race Conditions).
- Role Mapping: Successfully mapped Supabase Auth metadata to our internal user_type (STAFF/ADMIN/SUPERADMIN).

**Next steps**
Waiting for Sprint 3 tasks to be assigned

### QA / Documentation Specialist
**Tasks done**
- Created test checklist for Sprint 2.
- Created rights matrix test cases.
- Created soft-delete visibility, recovery, direct API bypass, stamp visibility test cases.
- Tested all test files and verified no hard deletes in codebase.
- Documented test results and updated test log.


**Blockers**
- None at the moment

**Next steps**
- Waiting for Sprint 3 tasks to be assigned

## End of Sprint 2 Summary
Sprint 2 was successfully completed with all major backend, frontend, authentication, and QA deliverables implemented, tested, and reviewed. The system now has a stable API layer, functional UI, and enforced role-based access controls.

**Key Achievements**
- Backend (Project Lead / Scrum Master)
  - Completed core APIs:
    - Product service & helper utilities
    - Price history service
  - Validated database constraints and resolved trigger issues
  - Built Sandbox testing components used as API references for frontend and QA
  - Backend is stable with no technical blockers
- Frontend (UI/UX Developer)
  - Delivered all required UI features:
    - Product management (list, add, edit, delete)
    - Price history panel
    - Deleted items page
    - Updated navigation (Navbar/Sidebar)
  - All PRs submitted and reviewed
- Backend/Database Engineering
  - Implemented Row Level Security (RLS) for products and price history
  - Created optimized pricing view (current_product_price)
  - Successfully tested role-based DB access
- Authentication & Rights
  - Integrated Supabase authentication (login/signup/logout)
  - Built global state management (AuthContext, UserRightsContext)
  - Implemented protected/admin routing and dynamic layouts
  - Resolved session timing and role-mapping issues
- QA / Documentation
  - Created comprehensive test cases and checklist
  - Verified:
    - Rights matrix behavior
    - Soft-delete functionality
    - No hard deletes in codebase
  - Documented all results

**Blockers**
- Minor frontend dependencies:
  - Missing UserRightsContext and AdminRoute integration
  - stampHelper.js VARCHAR(60) issue
- Backend/DB engineer faced temporary OS issue (non-project related)
- No major technical blockers overall

**Next Steps**
- Begin Sprint 3 (pending task assignment)
- Complete frontend-backend integration
- Final validation of RLS across all roles
- Support ongoing integration and testing