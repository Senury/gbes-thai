-- Chat backend (1:1, authenticated only) with read receipts + typing

create extension if not exists "pgcrypto";

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id) on delete cascade,
  is_direct boolean not null default true,
  direct_key text not null,
  constraint conversations_direct_key_unique unique (direct_key)
);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  last_typing_at timestamptz,
  primary key (conversation_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  edited_at timestamptz
);

create index if not exists messages_conversation_created_at_idx
  on public.messages (conversation_id, created_at desc);

create index if not exists conversation_members_user_idx
  on public.conversation_members (user_id);

create index if not exists conversation_members_conversation_idx
  on public.conversation_members (conversation_id);

create or replace function public.set_conversation_updated_at()
returns trigger
language plpgsql
as $$
begin
  update public.conversations
  set updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$;

create trigger messages_update_conversation
after insert on public.messages
for each row execute function public.set_conversation_updated_at();

create or replace function public.direct_conversation_key(user_a uuid, user_b uuid)
returns text
language sql
stable
as $$
  select case
    when user_a::text < user_b::text then user_a::text || ':' || user_b::text
    else user_b::text || ':' || user_a::text
  end;
$$;

create or replace function public.create_direct_conversation(other_user uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user uuid := auth.uid();
  key text;
  convo_id uuid;
begin
  if current_user is null then
    raise exception 'Authentication required';
  end if;

  if other_user is null or other_user = current_user then
    raise exception 'Invalid user';
  end if;

  key := public.direct_conversation_key(current_user, other_user);

  select id into convo_id
  from public.conversations
  where direct_key = key
  limit 1;

  if convo_id is not null then
    return convo_id;
  end if;

  insert into public.conversations (created_by, is_direct, direct_key)
  values (current_user, true, key)
  returning id into convo_id;

  insert into public.conversation_members (conversation_id, user_id, role)
  values
    (convo_id, current_user, 'owner'),
    (convo_id, other_user, 'member');

  return convo_id;
end;
$$;

create or replace function public.mark_conversation_read(p_conversation_id uuid)
returns void
language plpgsql
set search_path = public
as $$
begin
  update public.conversation_members
  set last_read_at = now()
  where conversation_id = p_conversation_id
    and user_id = auth.uid();
end;
$$;

create or replace function public.set_typing_status(p_conversation_id uuid, p_is_typing boolean)
returns void
language plpgsql
set search_path = public
as $$
begin
  update public.conversation_members
  set last_typing_at = case when p_is_typing then now() else null end
  where conversation_id = p_conversation_id
    and user_id = auth.uid();
end;
$$;

alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;

create policy "conversations_select_members"
  on public.conversations
  for select
  using (
    exists (
      select 1
      from public.conversation_members cm
      where cm.conversation_id = id
        and cm.user_id = auth.uid()
    )
  );

create policy "conversation_members_select_members"
  on public.conversation_members
  for select
  using (
    exists (
      select 1
      from public.conversation_members cm
      where cm.conversation_id = conversation_id
        and cm.user_id = auth.uid()
    )
  );

create policy "conversation_members_update_self"
  on public.conversation_members
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "messages_select_members"
  on public.messages
  for select
  using (
    exists (
      select 1
      from public.conversation_members cm
      where cm.conversation_id = conversation_id
        and cm.user_id = auth.uid()
    )
  );

create policy "messages_insert_members"
  on public.messages
  for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1
      from public.conversation_members cm
      where cm.conversation_id = conversation_id
        and cm.user_id = auth.uid()
    )
  );

create policy "messages_update_own"
  on public.messages
  for update
  using (sender_id = auth.uid())
  with check (sender_id = auth.uid());

revoke all on public.conversations from anon, authenticated;
revoke all on public.conversation_members from anon, authenticated;
revoke all on public.messages from anon, authenticated;

grant select on public.conversations to authenticated;
grant select, update on public.conversation_members to authenticated;
grant select, insert, update on public.messages to authenticated;

grant execute on function public.create_direct_conversation(uuid) to authenticated;
grant execute on function public.mark_conversation_read(uuid) to authenticated;
grant execute on function public.set_typing_status(uuid, boolean) to authenticated;
