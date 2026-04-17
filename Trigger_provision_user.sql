CREATE OR REPLACE FUNCTION provision_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Bug 4 Fix: Guard against duplicate inserts
  IF NOT EXISTS (SELECT 1 FROM public.user WHERE userid = NEW.id::varchar) THEN

    -- Bug 5 & Rogue Column Fix: Removed 'email'
    INSERT INTO public.user (userid, username, user_type, record_status, firstname, lastname, stamp)
    VALUES (
      NEW.id::varchar,
      COALESCE(NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      'USER',     -- Security Fix: Hardcoded to USER
      'INACTIVE', -- Security Fix: Hardcoded to INACTIVE
      COALESCE(NEW.raw_user_meta_data->>'firstName', split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 1), ''),
      COALESCE(NEW.raw_user_meta_data->>'lastName', split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 2), ''),
      'SYSTEM ' || NOW()::varchar
    );

    -- Bug 2 Fix: Associate user with the 3 required modules
    INSERT INTO public.user_module (userid, module_id, rights_value, record_status, stamp)
    VALUES
      (NEW.id::varchar, 'Adm_Mod',    0, 'ACTIVE', 'SYSTEM ' || NOW()::varchar),
      (NEW.id::varchar, 'Prod_Mod',   1, 'ACTIVE', 'SYSTEM ' || NOW()::varchar),
      (NEW.id::varchar, 'Report_Mod', 1, 'ACTIVE', 'SYSTEM ' || NOW()::varchar);

    -- Bug 1 & 3 Fix: Exactly 6 Rights, NO module_id column, added stamp
    INSERT INTO public."UserModule_Rights" (userid, "Right_ID", "Right_value", "Record_status", "Stamp")
    VALUES
      (NEW.id::varchar, 'PRD_ADD',  1, 'ACTIVE', 'SYSTEM ' || NOW()::varchar),
      (NEW.id::varchar, 'PRD_EDIT', 1, 'ACTIVE', 'SYSTEM ' || NOW()::varchar),
      (NEW.id::varchar, 'PRD_DEL',  0, 'ACTIVE', 'SYSTEM ' || NOW()::varchar),
      (NEW.id::varchar, 'REP_001',  1, 'ACTIVE', 'SYSTEM ' || NOW()::varchar),
      (NEW.id::varchar, 'REP_002',  0, 'ACTIVE', 'SYSTEM ' || NOW()::varchar),
      (NEW.id::varchar, 'ADM_USER', 0, 'ACTIVE', 'SYSTEM ' || NOW()::varchar);

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;