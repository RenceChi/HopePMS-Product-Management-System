
CREATE OR REPLACE FUNCTION public.get_my_user_type()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_type FROM public."user"
  WHERE userid = auth.uid()::text
  LIMIT 1;
$$;

DROP POLICY IF EXISTS "user_select_policy" ON public."user";
DROP POLICY IF EXISTS "user_update_policy" ON public."user";
DROP POLICY IF EXISTS "umr_select_policy"  ON public.user_module_rights;
DROP POLICY IF EXISTS "umr_modify_policy"  ON public.user_module_rights;

CREATE POLICY "user_select_policy" ON public."user"
FOR SELECT USING (
  userid = auth.uid()::text
  OR public.get_my_user_type() IN ('ADMIN', 'SUPERADMIN')
);

CREATE POLICY "user_update_policy" ON public."user"
FOR UPDATE USING (
  public.get_my_user_type() IN ('ADMIN', 'SUPERADMIN')
  AND public."user".user_type <> 'SUPERADMIN'
);

CREATE POLICY "umr_select_policy" ON public.user_module_rights
FOR SELECT USING (
  userid = auth.uid()::text
  OR public.get_my_user_type() IN ('ADMIN', 'SUPERADMIN')
);

CREATE POLICY "umr_modify_policy" ON public.user_module_rights
FOR UPDATE USING (
  NOT EXISTS (
    SELECT 1 FROM public."user" u
    WHERE u.userid = user_module_rights.userid
    AND u.user_type = 'SUPERADMIN'
  )
);