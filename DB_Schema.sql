-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.customer (
  custno character varying NOT NULL,
  custname character varying,
  address character varying,
  payterm character varying CHECK (payterm::text = ANY (ARRAY['COD'::character varying, '30D'::character varying, '45D'::character varying]::text[])),
  CONSTRAINT customer_pkey PRIMARY KEY (custno)
);
CREATE TABLE public.department (
  deptcode character varying NOT NULL,
  deptname character varying,
  CONSTRAINT department_pkey PRIMARY KEY (deptcode)
);
CREATE TABLE public.employee (
  empno character varying NOT NULL,
  lastname character varying,
  firstname character varying,
  gender character CHECK (gender = ANY (ARRAY['M'::bpchar, 'F'::bpchar])),
  birthdate date,
  hiredate date,
  sepdate date,
  CONSTRAINT employee_pkey PRIMARY KEY (empno)
);
CREATE TABLE public.job (
  jobcode character varying NOT NULL,
  jobdesc character varying,
  CONSTRAINT job_pkey PRIMARY KEY (jobcode)
);
CREATE TABLE public.jobhistory (
  empno character varying NOT NULL,
  jobcode character varying NOT NULL,
  effdate date NOT NULL,
  salary numeric CHECK (salary >= 0.0),
  deptcode character varying,
  CONSTRAINT jobhistory_pkey PRIMARY KEY (empno, jobcode, effdate),
  CONSTRAINT jobhistory_empno_fkey FOREIGN KEY (empno) REFERENCES public.employee(empno),
  CONSTRAINT jobhistory_jobcode_fkey FOREIGN KEY (jobcode) REFERENCES public.job(jobcode),
  CONSTRAINT jobhistory_deptcode_fkey FOREIGN KEY (deptcode) REFERENCES public.department(deptcode)
);

CREATE TABLE public.payment (
  orno character varying NOT NULL,
  paydate date,
  amount numeric,
  transno character varying,
  CONSTRAINT payment_pkey PRIMARY KEY (orno),
  CONSTRAINT payment_transno_fkey FOREIGN KEY (transno) REFERENCES public.sales(transno)
);
CREATE TABLE public.pricehist (
  effdate date NOT NULL,
  prodcode character varying NOT NULL,
  unitprice numeric CHECK (unitprice > 0::numeric),
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  created_by character varying,
  updated_at timestamp without time zone,
  updated_by character varying,
  CONSTRAINT pricehist_pkey PRIMARY KEY (effdate, prodcode),
  CONSTRAINT pricehist_prodcode_fkey FOREIGN KEY (prodcode) REFERENCES public.product(prodcode)
);
CREATE TABLE public.product (
  prodcode character varying NOT NULL,
  description character varying,
  unit character varying CHECK (unit::text = ANY (ARRAY['pc'::character varying, 'ea'::character varying, 'mtr'::character varying, 'pkg'::character varying, 'ltr'::character varying]::text[])),
  record_status character varying DEFAULT 'ACTIVE'::character varying,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  created_by character varying,
  updated_at timestamp without time zone,
  updated_by character varying,
  CONSTRAINT product_pkey PRIMARY KEY (prodcode)
);
CREATE TABLE public.sales (
  transno character varying NOT NULL,
  salesdate date,
  custno character varying,
  empno character varying,
  CONSTRAINT sales_pkey PRIMARY KEY (transno),
  CONSTRAINT sales_custno_fkey FOREIGN KEY (custno) REFERENCES public.customer(custno),
  CONSTRAINT sales_empno_fkey FOREIGN KEY (empno) REFERENCES public.employee(empno)
);
CREATE TABLE public.salesdetail (
  transno character varying NOT NULL,
  prodcode character varying NOT NULL,
  quantity numeric CHECK (quantity >= 0.0),
  CONSTRAINT salesdetail_pkey PRIMARY KEY (transno, prodcode),
  CONSTRAINT salesdetail_transno_fkey FOREIGN KEY (transno) REFERENCES public.sales(transno),
  CONSTRAINT salesdetail_prodcode_fkey FOREIGN KEY (prodcode) REFERENCES public.product(prodcode)
);
CREATE TABLE public.rights (
  right_id character varying NOT NULL,
  right_name character varying,
  CONSTRAINT rights_pkey PRIMARY KEY (right_id)
);
