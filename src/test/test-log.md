### Test Log 1:
19 April 2026

#### Test Case: Email Registration Verification (Manual)
- <b>Test Step:</b> User completes email registration
- <b>Expected Result:</b> Confirmation email is sent to the registered email address
- <b>Actual Result:</b> Confirmation email sent (verified manually)
- <b>Status:</b> Pass (manual verification)
- <b>Notes:</b> Email delivery confirmed via manual check in inbox/log, user cannot log in until email is verified

#### Test Files:
- auth.test.jsx (7 tests)

#### Test Results:
- 2 failed | 5 passed
- Test Suite 1 failed (Google OAuth Flow)
- Notes: App enters Error 404 when clicking refresh (without any prior action)