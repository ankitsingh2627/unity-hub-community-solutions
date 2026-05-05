
-- Enum for roles
create type public.app_role as enum ('admin', 'member');
create type public.complaint_status as enum ('open', 'in_progress', 'resolved');
create type public.complaint_priority as enum ('low', 'medium', 'high');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  flat_number text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- Roles (separate table for security)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- Auto profile + role on signup (first user = admin)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  is_first boolean;
begin
  insert into public.profiles (id, full_name, flat_number)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'flat_number');

  select count(*) = 0 into is_first from public.user_roles;
  insert into public.user_roles (user_id, role)
  values (new.id, case when is_first then 'admin'::app_role else 'member'::app_role end);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Complaints
create table public.complaints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text not null,
  category text not null,
  status complaint_status not null default 'open',
  priority complaint_priority not null default 'medium',
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.complaints enable row level security;

create table public.complaint_upvotes (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid references public.complaints(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique (complaint_id, user_id)
);
alter table public.complaint_upvotes enable row level security;

-- Announcements
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete set null,
  title text not null,
  content text not null,
  category text not null default 'general',
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.announcements enable row level security;

-- Events
create table public.events (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid references auth.users(id) on delete set null,
  title text not null,
  description text,
  location text,
  event_date timestamptz not null,
  created_at timestamptz not null default now()
);
alter table public.events enable row level security;

create table public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);
alter table public.event_rsvps enable row level security;

-- Polls
create table public.polls (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete set null,
  question text not null,
  options jsonb not null,
  end_date timestamptz,
  created_at timestamptz not null default now()
);
alter table public.polls enable row level security;

create table public.poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid references public.polls(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  option_index int not null,
  created_at timestamptz not null default now(),
  unique (poll_id, user_id)
);
alter table public.poll_votes enable row level security;

-- RLS policies
-- Profiles: anyone authed can view; users update own
create policy "profiles viewable by authed" on public.profiles for select to authenticated using (true);
create policy "users update own profile" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "users insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);

-- Roles: viewable by authed; only admin can modify (via service role typically)
create policy "roles viewable by authed" on public.user_roles for select to authenticated using (true);
create policy "admins manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Complaints
create policy "complaints viewable" on public.complaints for select to authenticated using (true);
create policy "members create complaints" on public.complaints for insert to authenticated with check (auth.uid() = user_id);
create policy "owner or admin update complaint" on public.complaints for update to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "owner or admin delete complaint" on public.complaints for delete to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create policy "upvotes viewable" on public.complaint_upvotes for select to authenticated using (true);
create policy "users upvote" on public.complaint_upvotes for insert to authenticated with check (auth.uid() = user_id);
create policy "users remove own upvote" on public.complaint_upvotes for delete to authenticated using (auth.uid() = user_id);

-- Announcements: view all; admin only write
create policy "announcements viewable" on public.announcements for select to authenticated using (true);
create policy "admins manage announcements" on public.announcements for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Events: view all; admin only write
create policy "events viewable" on public.events for select to authenticated using (true);
create policy "admins manage events" on public.events for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "rsvps viewable" on public.event_rsvps for select to authenticated using (true);
create policy "users rsvp" on public.event_rsvps for insert to authenticated with check (auth.uid() = user_id);
create policy "users remove own rsvp" on public.event_rsvps for delete to authenticated using (auth.uid() = user_id);

-- Polls
create policy "polls viewable" on public.polls for select to authenticated using (true);
create policy "admins manage polls" on public.polls for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "poll votes viewable" on public.poll_votes for select to authenticated using (true);
create policy "users vote in polls" on public.poll_votes for insert to authenticated with check (auth.uid() = user_id);
