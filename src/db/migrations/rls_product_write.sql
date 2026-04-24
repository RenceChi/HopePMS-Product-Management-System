-- =========================
-- INSERT (PRD_ADD)
-- =========================
CREATE POLICY "product_insert_policy"
ON public.product
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_module_rights umr
    WHERE umr.userid = (
      SELECT u.userid
      FROM public."user" u
      WHERE u.email = auth.jwt()->>'email'
    )
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
  EXISTS (
    SELECT 1
    FROM public.user_module_rights umr
    WHERE umr.userid = (
      SELECT u.userid
      FROM public."user" u
      WHERE u.email = auth.jwt()->>'email'
    )
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
  EXISTS (
    SELECT 1
    FROM public.user_module_rights umr
    WHERE umr.userid = (
      SELECT u.userid
      FROM public."user" u
      WHERE u.email = auth.jwt()->>'email'
    )
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
  EXISTS (
    SELECT 1
    FROM public."user" u
    WHERE u.userid = (
      SELECT u2.userid
      FROM public."user" u2
      WHERE u2.email = auth.jwt()->>'email'
    )
    AND u.user_type IN ('ADMIN', 'SUPERADMIN')
  )
)
WITH CHECK (
  record_status = 'ACTIVE'
);