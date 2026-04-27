ALTER TABLE public."user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_module_rights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_update_policy" ON public."user";
DROP POLICY IF EXISTS "umr_modify_policy" ON public.user_module_rights;

CREATE POLICY "user_update_policy"
ON public."user"
FOR UPDATE
USING (
  -- Only ADMIN can update
  EXISTS (
    SELECT 1
    FROM public."user" u
    WHERE u.userid = auth.uid()::text
    AND u.user_type = 'ADMIN'
  )
  AND
  -- Cannot update SUPERADMIN
  public."user".user_type <> 'SUPERADMIN'
);


CREATE POLICY "umr_modify_policy"
ON public.user_module_rights
FOR ALL
USING (
  NOT EXISTS (
    SELECT 1
    FROM public."user" u
    WHERE u.userid = user_module_rights.userid
    AND u.user_type = 'SUPERADMIN'
  )
);

CREATE POLICY "user_update_policy"
ON public."user"
FOR UPDATE
USING (
  -- Only ADMIN can update
  EXISTS (
    SELECT 1
    FROM public."user" u
    WHERE u.userid = auth.uid()::text
    AND u.user_type = 'ADMIN'
  )
  AND
  -- Cannot update SUPERADMIN
  public."user".user_type <> 'SUPERADMIN'
);


CREATE POLICY "umr_modify_policy"
ON public.user_module_rights
FOR ALL
USING (
  NOT EXISTS (
    SELECT 1
    FROM public."user" u
    WHERE u.userid = user_module_rights.userid
    AND u.user_type = 'SUPERADMIN'
  )
);