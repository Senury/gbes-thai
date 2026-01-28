-- Link companies to authenticated users for direct chat

alter table public.companies
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists companies_user_id_idx on public.companies (user_id);
