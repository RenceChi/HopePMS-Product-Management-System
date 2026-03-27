
CREATE TABLE public.user (
  userid character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  username character varying,
  user_type character varying DEFAULT 'USER'::character varying CHECK (user_type::text = ANY (ARRAY['SUPERADMIN'::character varying, 'ADMIN'::character varying, 'USER'::character varying]::text[])),
  record_status character varying DEFAULT 'ACTIVE'::character varying,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  created_by character varying,
  updated_at timestamp without time zone,
  updated_by character varying,
  CONSTRAINT user_pkey PRIMARY KEY (userid)
);

CREATE TABLE public.user_module_rights (
  userid character varying NOT NULL,
  module_id character varying NOT NULL,
  right_id character varying NOT NULL,
  rights_value integer DEFAULT 0,
  record_status character varying DEFAULT 'ACTIVE'::character varying,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  created_by character varying,
  updated_at timestamp without time zone,
  updated_by character varying,
  CONSTRAINT user_module_rights_pkey PRIMARY KEY (userid, module_id, right_id),
  CONSTRAINT user_module_rights_userid_fkey FOREIGN KEY (userid) REFERENCES public.user(userid),
  CONSTRAINT user_module_rights_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.module(module_id),
  CONSTRAINT user_module_rights_right_id_fkey FOREIGN KEY (right_id) REFERENCES public.rights(right_id)
);

CREATE TABLE public.user_module (
  userid character varying NOT NULL,
  module_id character varying NOT NULL,
  rights_value integer DEFAULT 0,
  record_status character varying DEFAULT 'ACTIVE'::character varying,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  created_by character varying,
  updated_at timestamp without time zone,
  updated_by character varying,
  CONSTRAINT user_module_pkey PRIMARY KEY (userid, module_id),
  CONSTRAINT user_module_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.module(module_id)
);

CREATE TABLE public.module (
  module_id character varying NOT NULL,
  module_name character varying,
  CONSTRAINT module_pkey PRIMARY KEY (module_id)
);