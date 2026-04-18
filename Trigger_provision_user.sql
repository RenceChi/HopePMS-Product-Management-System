-- Drop and recreate with fixed stamp
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS provision_new_user CASCADE;

CREATE OR REPLACE FUNCTION provision_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user WHERE userid = NEW.id::varchar) THEN

    INSERT INTO public.user (userid, email, username, user_type, record_status, firstname, lastname, stamp)
    VALUES (
      NEW.id::varchar,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      'USER',
      'INACTIVE',
      COALESCE(NEW.raw_user_meta_data->>'firstname', NEW.raw_user_meta_data->>'firstName', split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 1), ''),
      COALESCE(NEW.raw_user_meta_data->>'lastname', NEW.raw_user_meta_data->>'lastName', split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 2), ''),
      'SYSTEM ' || TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI')
    );

    INSERT INTO public.user_module (userid, module_id, rights_value, record_status, stamp)
    VALUES
      (NEW.id::varchar, 'Adm_Mod',    0, 'ACTIVE', 'SYSTEM ' || TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI')),
      (NEW.id::varchar, 'Prod_Mod',   1, 'ACTIVE', 'SYSTEM ' || TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI')),
      (NEW.id::varchar, 'Report_Mod', 1, 'ACTIVE', 'SYSTEM ' || TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI'));

    INSERT INTO public.user_module_rights (userid, module_id, right_id, rights_value, record_status, stamp)
    VALUES
      (NEW.id::varchar, 'Prod_Mod',   'PRD_ADD',  1, 'ACTIVE', 'SYSTEM ' || TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI')),
      (NEW.id::varchar, 'Prod_Mod',   'PRD_EDIT', 1, 'ACTIVE', 'SYSTEM ' || TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI')),
      (NEW.id::varchar, 'Prod_Mod',   'PRD_DEL',  0, 'ACTIVE', 'SYSTEM ' || TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI')),
      (NEW.id::varchar, 'Report_Mod', 'REP_001',  1, 'ACTIVE', 'SYSTEM ' || TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI')),
      (NEW.id::varchar, 'Report_Mod', 'REP_002',  0, 'ACTIVE', 'SYSTEM ' || TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI')),
      (NEW.id::varchar, 'Adm_Mod',    'ADM_USER', 0, 'ACTIVE', 'SYSTEM ' || TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI'));

  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION provision_new_user();