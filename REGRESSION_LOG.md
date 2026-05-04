# Rights & Permissions Regression Test Log

## Project: Sprint 3 Security Implementation
**Task ID:** test/e2e-rights-regression

### 1. SuperAdmin Guard (PR-09)
| Test Case | Scenario | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| SG-01 | Admin views SuperAdmin row | Action buttons (Edit/Delete) are disabled | ✅ PASS |
| SG-02 | Admin attempts click | UI prevents interaction (cursor: not-allowed) | ✅ PASS |

### 2. Granular Gating (PR-08)
| Test Case | Scenario | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| GG-01 | User without REP_001 right | "Product Report" link hidden in Sidebar | ✅ PASS |
| GG-02 | User without ADM_USER right | Access to /admin results in 403/Redirect | ✅ PASS |

### 3. Database Connectivity
| Test Case | Scenario | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| DB-01 | Fetching rights (lowercase) | Table 'user_module_rights' returns 200 OK | ✅ PASS |