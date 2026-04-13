CREATE OR REPLACE FUNCTION provision_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user row as USER / INACTIVE
  INSERT INTO public.user (userid, email, username, user_type, record_status)
  VALUES (
    NEW.id::varchar,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    'USER',
    'INACTIVE'
  );

  -- Insert default module rows
  INSERT INTO public.user_module (userid, module_id, rights_value, record_status, stamp)
  VALUES
    (NEW.id::varchar, 'Adm_Mod', 0, 'ACTIVE', 'SYSTEM ' || NOW()::varchar),
    (NEW.id::varchar, 'Prod_Mod', 0, 'ACTIVE', 'SYSTEM ' || NOW()::varchar),
    (NEW.id::varchar, 'Report_Mod', 0, 'ACTIVE', 'SYSTEM ' || NOW()::varchar);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION provision_new_user();