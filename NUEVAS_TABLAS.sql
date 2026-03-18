-- ============================================
-- NUEVAS TABLAS: Clientes, Historial, Lecturas
-- ============================================

-- Tabla de clientes
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text,
  email text,
  phone text,
  address text,
  contract_start date,
  contract_end date,
  contract_type text not null default 'renta' check (contract_type in ('renta','venta','mixto')),
  active boolean not null default true,
  notes text,
  created_at timestamptz default now()
);

-- Historial de servicios
create table public.service_history (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid references public.equipment(id) on delete cascade,
  type text not null check (type in ('preventivo','correctivo')),
  technician_id uuid references public.profiles(id),
  date date not null,
  description text not null,
  parts_replaced text,
  page_count_at_service integer,
  cost numeric(10,2),
  created_at timestamptz default now()
);

-- Lecturas de páginas
create table public.page_readings (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid references public.equipment(id) on delete cascade,
  reading integer not null,
  previous_reading integer not null default 0,
  pages_used integer not null default 0,
  reading_date date not null,
  recorded_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- Agregar columnas a equipment para precio y cliente
alter table public.equipment
  add column if not exists client_id uuid references public.clients(id),
  add column if not exists next_service date,
  add column if not exists monthly_page_limit integer,
  add column if not exists price_per_page numeric(10,4),
  add column if not exists monthly_rent numeric(10,2);

-- RLS
alter table public.clients enable row level security;
alter table public.service_history enable row level security;
alter table public.page_readings enable row level security;

create policy "Clientes visibles" on public.clients
  for select using (auth.role() = 'authenticated');
create policy "Crear clientes" on public.clients
  for insert with check (auth.role() = 'authenticated');
create policy "Actualizar clientes" on public.clients
  for update using (auth.role() = 'authenticated');

create policy "Historial visible" on public.service_history
  for select using (auth.role() = 'authenticated');
create policy "Crear historial" on public.service_history
  for insert with check (auth.role() = 'authenticated');

create policy "Lecturas visibles" on public.page_readings
  for select using (auth.role() = 'authenticated');
create policy "Crear lecturas" on public.page_readings
  for insert with check (auth.role() = 'authenticated');
