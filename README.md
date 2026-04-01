# Hope, Inc. Product Management System (HopePMS)

## 🚀 Local Setup Instructions
To get this project running on your local machine, please follow these steps carefully:

1. **Clone the repository:**
   ```
   bash
   git clone <paste-your-repo-link-here>
   cd <your-repo-folder-name>
   ```

2. **Install dependencies:**
   ```
   bash
   npm install
   ```

3. **Configure Environment Variables:**
   * Ask the Project Lead (M1) for the Supabase Project URL and Anon Key.
   * Create a file named `.env` in the root folder.
   * Add the following lines:
     ```env
     VITE_SUPABASE_URL=your_supabase_url_here
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
     ```

4. **Run the local development server:**
   ```
   bash
   npm run dev
   ```

---

## 🌿 Git Workflow & Branching Strategy

**RULE: Never commit directly to `main` or `dev`.** All work must follow this flow: `feature branch` → `Pull Request` → `dev`.

### Branch Naming Convention
When creating a new branch from `dev`, you must use one of the following prefixes:
* feat/: New feature (e.g., `feat/auth-google-oauth`)
* fix/: Bug fix (e.g., `fix/login-guard-redirect`)
* db/: Database or migration change (e.g., `db/rls-product-policy`)
* test/: Test files only
* docs/: Documentation updates
* refactor/: Code cleanup (no logic change)
* chore/: Config, tooling, dependencies

### Pull Request Expectations
* **Titles:** Must be in the imperative mood and under 72 characters (e.g., "Add soft-delete RLS policy for product table").
* **Descriptions:** Must clearly state What changed, Why it was needed, and How to test it.
* **Reviews:** Every PR must be reviewed and approved by at least one other team member before merging into `dev`.