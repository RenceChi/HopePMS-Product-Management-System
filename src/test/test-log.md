### Test Log 1:
19 April 2026

#### Manual Test: Email Registration Verification
- **Test Step:** User completes email registration
- **Expected Result:** Confirmation email is sent to the registered email address
- **Actual Result:** Confirmation email sent
- **Status:** Pass
- **Notes:** Email delivery confirmed via manual check in inbox/log, user cannot log in until email is verified

#### Test Files:
- auth.test.jsx (7 tests)

#### Test Results:
- 2 failed | 5 passed

  - 2 tests in Test Suite 1 failed (Google OAuth Flow)
    - 'should auto-provision new Google OAuth user as USER / INACTIVE and redirect to login with error'
    - 'should allow Google OAuth user with ACTIVE status to proceed to /products'
- **Notes:** App enters Error 404 when clicking refresh (without any prior action)

### Test Log 2:
28 April 2026

#### Test Files:
- auth.test.jsx (7 tests)
- rights.test.jsx (20 tests)

#### Test Results:
- auth.test.jsx (Passed)
- rights.test.jsx (1 test failed)

- Tests: 1 failed | 26 passed

  - 1 test failed in useRights() integration (rights.test.jsx)
    - 'should fetch rights and build correct rights map for SUPERADMIN'

### Test Log 3:
29 April 2026

#### Manual Test: No Hard Delete in Codebase Check
- **Test Step:** Command run: `grep -r "delete(" src/`
- **Expected Result:** Should return NO output.
- **Actual Result:** Returned NO output.
- **Status:** Pass
- **Notes:** Codebase confirmed to have no hard delete

#### Test Files:
- auth.test.jsx (7 tests)
- rights.test.jsx (20 tests)
- softdelete.test.jsx (15 tests)

#### Test Results:
- auth.test.jsx (Passed)
- rights.test.jsx (1 test failed)
- softdelete.test.jsx (5 tests failed)

- Tests: 6 tests failed | 36 passed

  - 1 test failed in useRights() integration (rights.test.jsx)
    - 'should fetch rights and build correct rights map for SUPERADMIN'
  - 1 test failed in Test Suite 1: Soft-delete Visibility (softdelete.test.jsx)
    - 'USER cannot see soft-deleted products — getProducts filters out INACTIVE'
  - 1 test failed in Test Suite 2: Recovery Test (softdelete.test.jsx)
    - 'After recovery, USER sees the product again in their list'
  - 1 test failed in Test Suite 3: Direct API Bypass Test (softdelete.test.jsx)
    - 'getProducts(USER) ALWAYS applies eq(record_status, ACTIVE) filter at client level'
  - 2 tests failed in Test Suite 4: Stamp Visibility Test (softdelete.test.jsx)
    - 'getProducts(USER) does NOT include stamp column in SELECT'
    - 'USER response does NOT contain stamp property even if database sent it'
- **Notes:** All 5 failed tests in softdelete.test.jsx might be related to the getProducts() function