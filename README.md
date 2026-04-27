# Hope, Inc. Product Management System (HopePMS)

## Overview
HopePMS is a comprehensive product management system designed for Hope, Inc. to streamline product lifecycle management, from ideation to launch and beyond. The system is a web-based application where authorized users manage products and price history from the HopeDB database. All access is dynamically gated by the Rights Management schema.

## Framework
This project is built using React with Vite as the build tool, providing a modern and fast development experience.

## Team
- **M1 - Project Lead/Scrum Master:** Clark Lawrence Ching
- **M2 - Frontend Developer (UI/UX):** Precy S. Baguio
- **M3 - Backend/DB Engineer:** Ronne Rae A. Mayuga
- **M4 - Rights & Authentication Specialists:** Jonathan D. Bibay & Patrick Ace Galima
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
[To be updated...]