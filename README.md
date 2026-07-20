<img width="1875" height="956" alt="image" src="https://github.com/user-attachments/assets/96264b04-1242-4a52-a452-c623755a029b" /># Hope, Inc. Product Management System (HopePMS)

## Overview
HopePMS is a comprehensive product management system designed for Hope, Inc. to streamline product lifecycle management, from ideation to launch and beyond. The system is a web-based application where authorized users manage products and price history from the HopeDB database. All access is dynamically gated by the Rights Management schema.

## Framework
This project is built using React with Vite as the build tool, providing a modern and fast development experience.

## Team
- **M1 - Project Lead/Scrum Master:** Clark Lawrence Ching
- **M2 - Frontend Developer (UI/UX):** Precy S. Baguio
- **M3 - Backend/DB Engineer:** Ronne Rae A. Mayuga
- **M4 - Rights & Authentication Specialists:** Jonathan D. Bibay
- **M5 - QA / Documentation Specialist:** Zyrus C. Velasco 

## Features
- [To be updated...]

## Tech Stack
- **Frontend:** React 19.2.4, Vite 8.0.1
- **Styling:** Tailwind CSS 4.2.2
- **Backend/Database:** Supabase
- **Routing:** React Router DOM 7.13.2
- **Linting:** ESLint
- **Build Tools:** PostCSS, Autoprefixer

## Setup & Branch Strategy
- See CONTRIBUTING.md

## Repo Structure
```
[not yet finalized...]
HopePMS-Product-Management-System
├─ .gitattributes
├─ .gitignore
├─ CONTRIBUTING.md
├─ DB_Schema.png
├─ DB_Schema.sql
├─ DB_Superadmin.sql
├─ HOPEPMS_ERD.png
├─ README.md
├─ Trigger_provision_user.sql
├─ eslint.config.js
├─ index.html
├─ package-lock.json
├─ package.json
├─ postcss.config.js
├─ prompt-log.md
├─ public
│  ├─ favicon.svg
│  └─ icons.svg
├─ src
│  ├─ App.css
│  ├─ App.jsx
│  ├─ assets
│  │  ├─ hero.png
│  │  ├─ react.svg
│  │  └─ vite.svg
│  ├─ components
│  │  ├─ AddProductModal.jsx
│  │  ├─ EditProductModal.jsx
│  │  ├─ MainLayout.jsx
│  │  ├─ Navbar.jsx
│  │  ├─ PriceHistoryPanel.jsx
│  │  ├─ Sidebar.jsx
│  │  └─ SoftDeleteConfirmDialog.jsx
│  ├─ context
│  │  ├─ AuthContext.jsx
│  │  └─ UserRightsContext.jsx
│  ├─ db
│  │  ├─ migrations
│  │  │  ├─ rls_pricehist.sql
│  │  │  ├─ rls_product_select.sql
│  │  │  ├─ rls_product_write.sql
│  │  │  └─ view_current_product_price.sql
│  │  └─ supabase.js
│  ├─ docs
│  │  ├─ db-schema.md
│  │  └─ test-cases
│  │     └─ sprint1-test-checklist.md
│  ├─ index.css
│  ├─ main.jsx
│  ├─ pages
│  │  ├─ AuthCallBack.jsx
│  │  ├─ AuthPage.jsx
│  │  ├─ DeletedItemsPage.jsx
│  │  ├─ ProductListPage.jsx
│  │  └─ ProductsPage.jsx
│  ├─ router
│  │  ├─ AdminRoute.jsx
│  │  └─ ProtectedRoute.jsx
│  ├─ services
│  │  ├─ priceHistService.js
│  │  └─ productService.js
│  ├─ test
│  │  ├─ PriceHistSandbox.jsx
│  │  ├─ ProductSandbox.jsx
│  │  ├─ auth.test.jsx
│  │  ├─ setup.js
│  │  └─ test-log.md
│  └─ utils
│     └─ stampHelper.js
├─ tailwind.config.js
├─ vercel.json
└─ vite.config.js
```

## Screenshots
Authentication:
<img width="1873" height="957" alt="image" src="https://github.com/user-attachments/assets/750843f4-88bb-473c-9dd5-f57e44cc412e" />
<img width="1874" height="957" alt="image" src="https://github.com/user-attachments/assets/93baed4d-a066-4025-9ef3-a0ea50d8681b" />

Admin's View: 
<img width="1875" height="956" alt="image" src="https://github.com/user-attachments/assets/de03a4b9-3654-4bd3-bbbb-50e0177c8aa1" />

User's View: 
<img width="1874" height="961" alt="image" src="https://github.com/user-attachments/assets/eba5b26e-3fe5-4b64-85d7-d983efe8fe07" />


