create table public.organizations (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    created_at timestamptz default now() not null
);

create table public.users (
    id uuid default gen_random_uuid() primary key,
    organization_id uuid references public.organizations(id) not null,
    email text unique not null,
    display_name text not null,
    role text not null,
    status text not null,
    created_at timestamptz default now() not null
);

create table public.teams (
    id uuid default gen_random_uuid() primary key,
    organization_id uuid references public.organizations(id) not null,
    name text not null,
    functional_vertical text not null,
    purpose text,
    created_at timestamptz default now() not null
);

create table public.team_members (
    user_id uuid references public.users(id) not null,
    team_id uuid references public.teams(id) not null,
    team_role text not null,
    primary key (user_id, team_id)
);

create table public.agents (
    id uuid default gen_random_uuid() primary key,
    organization_id uuid references public.organizations(id) not null,
    team_id uuid references public.teams(id) not null,
    owner_user_id uuid references public.users(id),
    name text not null,
    title text not null,
    role text not null,
    status text not null,
    model_route text,
    avatar_skin text,
    avatar_hair text,
    avatar_shirt text,
    role_based_access text,
    context_score integer default 0,
    rating text,
    reports_to text,
    context_note text,
    created_at timestamptz default now() not null
);

create table public.agent_skills (
    id uuid default gen_random_uuid() primary key,
    agent_id uuid references public.agents(id) on delete cascade not null,
    skill_name text not null,
    proficiency text,
    approved boolean default false not null,
    created_at timestamptz default now() not null
);

create table public.agent_connections (
    id uuid default gen_random_uuid() primary key,
    agent_id uuid references public.agents(id) on delete cascade not null,
    provider text not null,
    scope text,
    status text not null,
    last_sync_at timestamptz,
    created_at timestamptz default now() not null
);

create table public.agent_permission_policies (
    id uuid default gen_random_uuid() primary key,
    agent_id uuid references public.agents(id) on delete cascade not null,
    resource text not null,
    action text not null,
    conditions_json jsonb,
    enabled boolean default true not null,
    created_at timestamptz default now() not null
);

-- RLS Enablement
alter table public.organizations enable row level security;
alter table public.users enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.agents enable row level security;
alter table public.agent_skills enable row level security;
alter table public.agent_connections enable row level security;
alter table public.agent_permission_policies enable row level security;

-- Disable RLS strictly for now as it's a dev hackathon demo
-- (Normally you would add policy rules to check auth.uid())
create policy "Allow all access in dev for organizations" on public.organizations for all using (true);
create policy "Allow all access in dev for users" on public.users for all using (true);
create policy "Allow all access in dev for teams" on public.teams for all using (true);
create policy "Allow all access in dev for team_members" on public.team_members for all using (true);
create policy "Allow all access in dev for agents" on public.agents for all using (true);
create policy "Allow all access in dev for agent_skills" on public.agent_skills for all using (true);
create policy "Allow all access in dev for agent_connections" on public.agent_connections for all using (true);
create policy "Allow all access in dev for agent_permission_policies" on public.agent_permission_policies for all using (true);
