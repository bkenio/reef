-- This is the schema file for the bken database
-- The API is responsible for the schema
-- All migrations are run from these files

create table pods (
  id text not null constraint pods_pkey primary key,
  nickname text default 'new-pod'::text no null,
  owner_id text not null contraint pods_owner_id_fkey references users on update cascate on delete set null,
  created_at timestamp(6) with time zone default CURRENT_TIMESTAMP not null,
  updated_at timestamp(6) with time zone default CURRENT_TIMESTAMP not null,
)