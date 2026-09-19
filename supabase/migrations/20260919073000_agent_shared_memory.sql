create table public.agent_shared_memory (
    source_agent_id uuid references public.agents(id) on delete cascade not null,
    target_agent_id uuid references public.agents(id) on delete cascade not null,
    created_at timestamptz default now() not null,
    primary key (source_agent_id, target_agent_id)
);

alter table public.agent_shared_memory enable row level security;
create policy "Allow all access in dev for agent_shared_memory" on public.agent_shared_memory for all using (true);
