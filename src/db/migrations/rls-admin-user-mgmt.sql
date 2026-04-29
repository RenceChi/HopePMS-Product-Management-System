ALTER TABLE public."user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_module_rights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_select_policy" ON public."user";
DROP POLICY IF EXISTS "user_update_policy" ON public."user";
DROP POLICY IF EXISTS "umr_policy" ON public.user_module_rights;

CREATE POLICY "user_select_policy"
ON public."user"
FOR SELECT
USING (
  userid = auth.uid()::text OR email = auth.jwt()->>'email'
);

CREATE POLICY "user_update_policy"
ON public."user"
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public."user" u
    WHERE u.userid = auth.uid()::text
    AND u.user_type IN ('ADMIN', 'SUPERADMIN')
  )
  AND
  public."user".user_type <> 'SUPERADMIN'
);

CREATE POLICY "umr_policy"
ON public.user_module_rights
FOR ALL
USING (
  userid = auth.uid()::text
)
WITH CHECK (
  NOT EXISTS (
    SELECT 1
    FROM public."user" u
    WHERE u.userid = user_module_rights.userid
    AND u.user_type = 'SUPERADMIN'
  )
);