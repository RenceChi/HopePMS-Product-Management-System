DROP POLICY IF EXISTS "product_insert_policy" ON public.product;
DROP POLICY IF EXISTS "product_update_edit_policy" ON public.product;
DROP POLICY IF EXISTS "product_soft_delete_policy" ON public.product;
DROP POLICY IF EXISTS "product_recovery_policy" ON public.product;

-- =========================
-- INSERT (PRD_ADD)
-- =========================
CREATE POLICY "product_insert_policy"
ON public.product
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_module_rights umr
    WHERE umr.userid = auth.uid()::text
    AND umr.right_id = 'PRD_ADD'
    AND umr.rights_value = 1
  )
);

-- =========================
-- UPDATE (EDIT - PRD_EDIT)
-- =========================
CREATE POLICY "product_update_edit_policy"
ON public.product
FOR UPDATE
USING (
  record_status = 'ACTIVE'
  AND EXISTS (
    SELECT 1 FROM public.user_module_rights umr
    WHERE umr.userid = auth.uid()::text
    AND umr.right_id = 'PRD_EDIT'
    AND umr.rights_value = 1
  )
)
WITH CHECK (
  record_status = 'ACTIVE'
);

-- =========================
-- UPDATE (SOFT DELETE - PRD_DEL)
-- =========================
CREATE POLICY "product_soft_delete_policy"
ON public.product
FOR UPDATE
USING (
  record_status = 'ACTIVE'
  AND EXISTS (
    SELECT 1 FROM public.user_module_rights umr
    WHERE umr.userid = auth.uid()::text
    AND umr.right_id = 'PRD_DEL'
    AND umr.rights_value = 1
  )
)
WITH CHECK (
  record_status = 'INACTIVE'
);

-- =========================
-- UPDATE (RECOVERY - ADMIN/SUPERADMIN)
-- =========================
CREATE POLICY "product_recovery_policy"
ON public.product
FOR UPDATE
USING (
  record_status = 'INACTIVE'
  AND EXISTS (
    SELECT 1 FROM public."user" u
    WHERE u.userid = auth.uid()::text
    AND u.user_type IN ('ADMIN', 'SUPERADMIN')
  )
)
WITH CHECK (
  record_status = 'ACTIVE'
);