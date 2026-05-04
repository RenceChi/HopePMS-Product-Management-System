-- =========================
-- ENABLE RLS
-- =========================
ALTER TABLE public.priceHist ENABLE ROW LEVEL SECURITY;

-- =========================
-- SELECT POLICY
-- =========================
CREATE POLICY "priceHist_select_policy"
ON public.priceHist
FOR SELECT
USING (
  auth.role() = 'authenticated'
);

-- =========================
-- INSERT POLICY
-- =========================
CREATE POLICY "priceHist_insert_policy"
ON public.priceHist
FOR INSERT
USING (
  auth.role() = 'authenticated'
)
WITH CHECK (
  auth.role() = 'authenticated'
);