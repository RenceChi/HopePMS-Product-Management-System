CREATE OR REPLACE FUNCTION provision_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_user_type TEXT;
  v_is_superadmin BOOLEAN;
BEGIN
  -- Identify User Type (Defaults to 'USER')
  v_user_type := COALESCE(NEW.raw_user_meta_data->>'user_type', 'USER');
  v_is_superadmin := (v_user_type = 'SUPERADMIN');

  -- Bug 4 Fix: Guard against duplicate inserts
  IF NOT EXISTS (SELECT 1 FROM public.user WHERE userid = NEW.id::varchar) THEN

    -- Bug 5 & Rogue Column Fix: Removed 'email' column to prevent crash.
    -- Ensure columns match your Project Guide Section 4.4 exactly.
    INSERT INTO public.user (userid, username, user_type, record_status, firstname, lastname, stamp)
    VALUES (
      NEW.id::varchar,
      COALESCE(NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      v_user_type,
      'INACTIVE',
      COALESCE(NEW.raw_user_meta_data->>'firstName', split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 1), ''),
      COALESCE(NEW.raw_user_meta_data->>'lastName', split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 2), ''),
      'SYSTEM ' || NOW()::varchar
    );

    -- Bug 2 Fix: Associate user with the 3 required modules
    INSERT INTO public.user_module (userid, module_id, rights_value, record_status, stamp)
    VALUES
      (NEW.id::varchar, 'Adm_Mod',    CASE WHEN v_is_superadmin THEN 1 ELSE 0 END, 'ACTIVE', 'SYSTEM ' || NOW()::varchar),
      (NEW.id::varchar, 'Prod_Mod',   1, 'ACTIVE', 'SYSTEM ' || NOW()::varchar),
      (NEW.id::varchar, 'Report_Mod', 1, 'ACTIVE', 'SYSTEM ' || NOW()::varchar);

    -- Bug 1 Fix: Verify exactly 6 Rights based on the Rights Matrix
    INSERT INTO public.user_module_rights (userid, module_id, right_id, rights_value, record_status)
    VALUES
      -- Module: Prod_Mod
      (NEW.id::varchar, 'Prod_Mod', 'PRD_ADD',  1, 'ACTIVE'),
      (NEW.id::varchar, 'Prod_Mod', 'PRD_EDIT', 1, 'ACTIVE'),
      (NEW.id::varchar, 'Prod_Mod', 'PRD_DEL',  CASE WHEN v_is_superadmin THEN 1 ELSE 0 END, 'ACTIVE'),
      
      -- Module: Report_Mod
      (NEW.id::varchar, 'Report_Mod', 'REP_001', 1, 'ACTIVE'),
      (NEW.id::varchar, 'Report_Mod', 'REP_002', CASE WHEN v_is_superadmin THEN 1 ELSE 0 END, 'ACTIVE'),
      
      -- Module: Adm_Mod
      (NEW.id::varchar, 'Adm_Mod', 'ADM_USER', CASE WHEN v_is_superadmin THEN 1 ELSE 0 END, 'ACTIVE');

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;