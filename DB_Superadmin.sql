-- =========================
-- 1. MODULES
-- =========================
INSERT INTO public.module (module_id, module_name) VALUES
('Prod_Mod', 'Product Module'),
('Report_Mod', 'Reports Module'),
('Adm_Mod', 'Admin Module')
ON CONFLICT (module_id) DO UPDATE
SET module_name = EXCLUDED.module_name;

-- =========================
-- 2. RIGHTS
-- =========================
INSERT INTO public.rights (right_id, right_name) VALUES
('PRD_ADD',  'Add Product'),
('PRD_DEL',  'Delete Product'),
('PRD_EDIT', 'Update/Edit Product'),
('REP_001',  'Report 1'),
('REP_002',  'Report 2'),
('ADM_USER', 'User Management')
ON CONFLICT (right_id) DO UPDATE
SET right_name = EXCLUDED.right_name;

-- =========================
-- 3. SUPERADMIN USER
-- =========================
INSERT INTO public."user" (
  userid,
  email,
  username,
  firstname,
  lastname,
  user_type,
  record_status,
  stamp
)
VALUES (
  'user1',
  'jcesperanza@neu.edu.ph',
  'Jerry',
  'Jeremias',
  'Esperanza',
  'SUPERADMIN',
  'ACTIVE',
  'SYSTEM_SEED ' || CURRENT_TIMESTAMP
)
ON CONFLICT (userid) DO UPDATE
SET 
  email = EXCLUDED.email,
  username = EXCLUDED.username,
  firstname = EXCLUDED.firstname,
  lastname = EXCLUDED.lastname,
  user_type = EXCLUDED.user_type,
  record_status = EXCLUDED.record_status,
  stamp = EXCLUDED.stamp;

-- =========================
-- 4. SUPERADMIN → MODULE ACCESS
-- =========================
INSERT INTO public.user_module (
  userid,
  module_id,
  rights_value,
  record_status,
  stamp
)
SELECT 
  'user1',
  m.module_id,
  1,
  'ACTIVE',
  'SYSTEM_SEED ' || CURRENT_TIMESTAMP
FROM public.module m
ON CONFLICT (userid, module_id) DO UPDATE
SET 
  rights_value = EXCLUDED.rights_value,
  record_status = EXCLUDED.record_status,
  stamp = EXCLUDED.stamp;

-- =========================
-- 5. SUPERADMIN → ALL RIGHTS
-- =========================
INSERT INTO public.user_module_rights (
  userid,
  module_id,
  right_id,
  rights_value,
  record_status,
  stamp
)
SELECT 
  'user1',
  m.module_id,
  r.right_id,
  1,
  'ACTIVE',
  'SYSTEM_SEED ' || CURRENT_TIMESTAMP
FROM public.module m
CROSS JOIN public.rights r
ON CONFLICT (userid, module_id, right_id) DO UPDATE
SET 
  rights_value = EXCLUDED.rights_value,
  record_status = EXCLUDED.record_status,
  stamp = EXCLUDED.stamp;