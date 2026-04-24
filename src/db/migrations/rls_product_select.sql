-- =========================
-- ENABLE RLS
-- =========================
ALTER TABLE public.product ENABLE ROW LEVEL SECURITY;

-- =========================
-- SELECT POLICY
-- =========================
CREATE POLICY "product_select_policy"
ON public.product
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public."user" u
    WHERE u.userid = (
      SELECT u2.userid
      FROM public."user" u2
      WHERE u2.email = auth.jwt()->>'email'
    )
    AND (
      u.user_type IN ('ADMIN', 'SUPERADMIN')
      OR (u.user_type = 'USER' AND product.record_status = 'ACTIVE')
    )
  )
);