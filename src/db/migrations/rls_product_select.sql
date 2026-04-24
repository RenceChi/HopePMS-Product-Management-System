-- =========================
-- ENABLE RLS
-- =========================
ALTER TABLE public.product ENABLE ROW LEVEL SECURITY;

-- =========================
-- SELECT POLICY
-- =========================
DROP POLICY IF EXISTS product_select_policy ON public.product;

CREATE POLICY product_select_policy
ON public.product
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public."user" u
    WHERE u.userid = auth.uid()::text
      AND (
        u.user_type IN ('ADMIN', 'SUPERADMIN')
        OR (u.user_type = 'USER' AND product.record_status = 'ACTIVE')
      )
  )
);