# Sprint 2 Manual Test Checklist
 
## Product CRUD
- [ ] Add Product: form opens, saves correctly, appears in list
- [ ] Add Product: prodCode max 6 chars enforced
- [ ] Edit Product: form pre-fills, saves changes correctly
- [ ] Soft Delete: product disappears from USER view immediately
- [ ] Soft Delete: product still appears in ADMIN Deleted Items
- [ ] Soft Delete: no DELETE statement fired (check Supabase logs)
- [ ] Recover: product reappears in all users' product lists
 
## Rights Enforcement (test each user type)
- [ ] USER — Add button visible, Edit button visible, Delete button HIDDEN
- [ ] ADMIN — Add button visible, Edit button visible, Delete button HIDDEN
- [ ] SUPERADMIN — All 3 buttons visible
 
## Stamp Visibility
- [ ] USER — stamp column NOT shown in product table
- [ ] USER — stamp column NOT shown in price history panel
- [ ] ADMIN — stamp column IS shown in product table
- [ ] SUPERADMIN — stamp column IS shown in product table
 
## Deleted Items Access
- [ ] USER — "Deleted Items" link NOT visible in sidebar
- [ ] USER — navigating to /deleted-items URL redirects to /products
- [ ] ADMIN — "Deleted Items" link IS visible, page loads
- [ ] SUPERADMIN — "Deleted Items" link IS visible, page loads
 
## Price History
- [ ] Price history panel opens for a product
- [ ] Adding a price entry saves correctly with effDate and unitPrice
- [ ] Most recent price shows at top of list
- [ ] unitPrice validation: negative or zero rejected
 
## RLS verification (check via Supabase SQL Editor)
- [ ] Run: SELECT * FROM product WHERE record_status='INACTIVE' — as USER via API → 0 rows
- [ ] Run: SELECT * FROM product — as ADMIN via API → includes INACTIVE rows