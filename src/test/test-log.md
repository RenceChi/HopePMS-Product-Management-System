### Test Log 1:
19 April 2026

#### Test Case: Email Registration Verification (Manual)
- **Test Step:** User completes email registration
- **Expected Result:** Confirmation email is sent to the registered email address
- **Actual Result:** Confirmation email sent (verified manually)
- **Status:** Pass (manual verification)
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