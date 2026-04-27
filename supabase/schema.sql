-- Perfis de usuário (estende auth.users)
create table profiles (
  id uuid references auth.users primary key,
  full_name text,
  email text,
  avatar_url text,
  role text default 'member', -- 'admin' | 'member'
  created_at timestamptz default now()
);

-- Contatos
create table contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  company text,
  notes text,
  owner_id uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Pipelines
create table pipelines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- Etapas (stages) de cada pipeline
create table stages (
  id uuid primary key default gen_random_uuid(),
  pipeline_id uuid references pipelines(id) on delete cascade,
  name text not null,
  color text default '#6366f1',
  position integer not null,
  created_at timestamptz default now()
);

-- Deals (negócios/cards do kanban)
create table deals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  value numeric default 0,
  currency text default 'BRL',
  status text default 'open', -- 'open' | 'won' | 'lost'
  stage_id uuid references stages(id) on delete set null,
  pipeline_id uuid references pipelines(id) on delete cascade,
  contact_id uuid references contacts(id) on delete set null,
  owner_id uuid references profiles(id),
  lost_reason text,
  expected_close_date date,
  notes text,
  position integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Atividades/histórico de um deal
create table activities (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references deals(id) on delete cascade,
  user_id uuid references profiles(id),
  type text not null, -- 'note' | 'call' | 'email' | 'meeting' | 'status_change'
  content text,
  created_at timestamptz default now()
);

-- RLS e trigger
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Configuração do RLS (Row Level Security)

-- Ativando RLS nas tabelas
alter table profiles enable row level security;
alter table contacts enable row level security;
alter table pipelines enable row level security;
alter table stages enable row level security;
alter table deals enable row level security;
alter table activities enable row level security;

-- Criando a função is_admin
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- Políticas
-- Profiles: Usuários podem ler todos, atualizar o próprio ou admin pode atualizar qualquer um
create policy "Todos podem ver os perfis" on profiles for select using (true);
create policy "Usuário pode atualizar o próprio perfil" on profiles for update using (auth.uid() = id or is_admin());

-- Pipelines e Stages: Todos autenticados podem ler, admins podem alterar
create policy "Todos os autenticados podem ver pipelines" on pipelines for select to authenticated using (true);
create policy "Apenas admin pode modificar pipelines" on pipelines for all to authenticated using (is_admin());

create policy "Todos os autenticados podem ver stages" on stages for select to authenticated using (true);
create policy "Apenas admin pode modificar stages" on stages for all to authenticated using (is_admin());

-- Contatos: Todos podem ler, apenas owner ou admin pode editar/deletar, todos podem criar
create policy "Todos os autenticados podem ver contatos" on contacts for select to authenticated using (true);
create policy "Todos os autenticados podem criar contatos" on contacts for insert to authenticated with check (true);
create policy "Apenas owner ou admin podem editar contatos" on contacts for update to authenticated using (auth.uid() = owner_id or is_admin());
create policy "Apenas owner ou admin podem deletar contatos" on contacts for delete to authenticated using (auth.uid() = owner_id or is_admin());

-- Deals: Todos podem ler, apenas owner ou admin pode editar/deletar, todos podem criar
create policy "Todos os autenticados podem ver deals" on deals for select to authenticated using (true);
create policy "Todos os autenticados podem criar deals" on deals for insert to authenticated with check (true);
create policy "Apenas owner ou admin podem editar deals" on deals for update to authenticated using (auth.uid() = owner_id or is_admin());
create policy "Apenas owner ou admin podem deletar deals" on deals for delete to authenticated using (auth.uid() = owner_id or is_admin());

-- Atividades: Todos podem ler, criador ou admin pode modificar
create policy "Todos os autenticados podem ver atividades" on activities for select to authenticated using (true);
create policy "Todos os autenticados podem criar atividades" on activities for insert to authenticated with check (true);
create policy "Apenas owner ou admin podem editar atividades" on activities for update to authenticated using (auth.uid() = user_id or is_admin());
create policy "Apenas owner ou admin podem deletar atividades" on activities for delete to authenticated using (auth.uid() = user_id or is_admin());
