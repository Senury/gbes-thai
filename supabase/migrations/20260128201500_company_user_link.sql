-- Auto-link companies to user accounts by contact_email when user_id is empty

create or replace function public.link_company_user()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  target_user uuid;
begin
  if new.user_id is not null then
    return new;
  end if;

  if new.contact_email is null then
    return new;
  end if;

  select user_id
  into target_user
  from public.profiles
  where lower(email) = lower(new.contact_email)
  limit 1;

  if target_user is not null then
    new.user_id := target_user;
  end if;

  return new;
end;
$$;

drop trigger if exists companies_link_user on public.companies;
create trigger companies_link_user
before insert or update of contact_email on public.companies
for each row execute function public.link_company_user();

update public.companies c
set user_id = p.user_id
from public.profiles p
where c.user_id is null
  and c.contact_email is not null
  and lower(c.contact_email) = lower(p.email);
