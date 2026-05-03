# HopePMS User Manual
 
## 1. Getting Started
### Registering an Account
1. Go to the app URL (https://hope-pms-product-management-system.vercel.app/)
2. Click "Sign Up" on the login page
3. Fill in: First Name, Last Name, Username, Email, Password
4. Click "Create Account"
5. Check your email and click the confirmation link
6. Wait for an administrator to activate your account
 
### Logging In
- **Email/Password:** Enter your credentials and click Sign In
- **Google:** Click "Sign in with Google" and select your Google account
- If you see "pending activation," your account has not been activated yet.
  Contact your system administrator.
 
## 2. Products Page
All users see the Products page after login.
 
| Button     | Who sees it       | What it does                          |
|------------|-------------------|---------------------------------------|
| Add        | All users          | Opens form to add a new product       |
| Edit       | All users          | Opens form to modify a product        |
| Delete     | SUPERADMIN only    | Deactivates product (reversible)      |
| Price History | All users       | Opens price history panel             |
 
### Adding a Product
1. Click "+ Add Product"
2. Enter a 6-character Product Code (e.g., AK0001)
3. Enter a Description (max 30 characters)
4. Select a Unit (pc, ea, mtr, pkg, ltr)
5. Click Save
 
### Price History
Click "Price History" on any product row to view and add price records.
Each entry requires an Effective Date and a Unit Price (must be > 0).
 
## 3. Deleted Items (ADMIN / SUPERADMIN only)
Products that have been deactivated appear here.
Click "Recover" to make a product visible again to all users.
 
## 4. Reports
### Product Report — All users
- Shows all active products with their current price
- Click any column header to sort
- Use the search box to filter by code or description
- Click "Export CSV" to download the report
 
### Top Selling — SUPERADMIN only
- Shows the top 10 products by total quantity sold
- Displayed as a ranked bar chart
 
## 5. User Management (SUPERADMIN only)
- Lists all registered users with their status and type
- Click "Activate" to allow a pending user to log in
- Click "Deactivate" to suspend an account
- SUPERADMIN accounts cannot be modified by anyone
 
## 6. Account Types
| Type        | What they can do                                           |
|-------------|-----------------------------------------------------------|
| USER        | View products, add products, edit products, view product listing  |
| ADMIN       | All USER rights + recover deleted items |
| SUPERADMIN  | Full access to everything including soft-delete and view top selling |