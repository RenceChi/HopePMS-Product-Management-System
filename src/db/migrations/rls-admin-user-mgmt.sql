-- Create a helper function that reads user_type
-- WITHOUT triggering RLS (security definer bypasses it)
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

-- User can read own row; ADMIN/SUPERADMIN can read all
CREATE POLICY "user_select_policy" ON public."user"
FOR SELECT USING (
  userid = auth.uid()::text
  OR public.get_my_user_type() IN ('ADMIN', 'SUPERADMIN')
);

-- ADMIN/SUPERADMIN can update any row except SUPERADMIN rows
CREATE POLICY "user_update_policy" ON public."user"
FOR UPDATE USING (
  public.get_my_user_type() IN ('ADMIN', 'SUPERADMIN')
  AND public."user".user_type <> 'SUPERADMIN'
);

-- User reads own rights; ADMIN/SUPERADMIN reads all
CREATE POLICY "umr_select_policy" ON public.user_module_rights
FOR SELECT USING (
  userid = auth.uid()::text
  OR public.get_my_user_type() IN ('ADMIN', 'SUPERADMIN')
);

-- Nobody can modify SUPERADMIN rights rows
CREATE POLICY "umr_modify_policy" ON public.user_module_rights
FOR UPDATE USING (
  NOT EXISTS (
    SELECT 1 FROM public."user" u
    WHERE u.userid = user_module_rights.userid
    AND u.user_type = 'SUPERADMIN'
  )
);
