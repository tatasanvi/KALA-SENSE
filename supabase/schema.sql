-- KALA SENSE — chantier 1 « persistance » (Supabase, region eu-central-1).
-- A appliquer une fois dans le SQL editor du projet Supabase (coller puis Run).
-- L'acces se fait uniquement via la service role cote serveur (cle
-- SUPABASE_SECRET_KEY) : RLS est active sans policy permissive, donc les
-- roles publics (anon, authenticated) n'ont aucun acces par defaut.

create extension if not exists "pgcrypto";

create table if not exists analyses (
  id uuid primary key default gen_random_uuid(),
  org_id text not null,
  supervisor_id text,
  transcript text not null,
  findings jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists actions (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid references analyses (id) on delete cascade,
  label text not null,
  assignee text,
  due_at timestamptz,
  status text not null default 'open',
  updated_at timestamptz not null default now()
);

create index if not exists analyses_org_id_idx on analyses (org_id);
create index if not exists actions_analysis_id_idx on actions (analysis_id);

comment on table analyses is 'Transcriptions et resultats d analyse (un enregistrement par analyse reussie).';
comment on column analyses.org_id is 'Identifiant logique de l organisation (filtrage multi-tenant).';
comment on column analyses.supervisor_id is 'Superviseur proprietaire (renseigne par le chantier auth).';
comment on column analyses.transcript is 'Transcription source ayant servi a l analyse.';
comment on column analyses.findings is 'Analyse ancree (constats, score, issue) au format JSON.';
comment on column analyses.status is 'Etat du cycle de vie : pending puis completed apres analyse.';
comment on table actions is 'Suivis operationnels valides par le superviseur pour une analyse.';
comment on column actions.analysis_id is 'Analyse parente ; suppression en cascade.';
comment on column actions.status is 'Etat du suivi : open par defaut.';

-- Refus par defaut : aucune policy permissive n'est creee. La service role
-- contourne RLS, donc seul le serveur (cle SUPABASE_SECRET_KEY) y accede.
alter table analyses enable row level security;
alter table actions enable row level security;
