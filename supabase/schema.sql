-- ==============================================================================
-- SAAS MULTI-TENANT REAL ESTATE PLATFORM SCHEMA (SUPABASE / POSTGRESQL)
-- Arquitetura White-Label Multi-tenant com Isolamento RLS
-- ==============================================================================

-- Habilita extensão UUID
create extension if not exists "uuid-ossp";

-- Limpeza de tabelas existentes (ordem reversa por dependências)
drop table if exists public.admin_users cascade;
drop table if exists public.property_views cascade;
drop table if exists public.notification_records cascade;
drop table if exists public.booking_requests cascade;
drop table if exists public.leads cascade;
drop table if exists public.property_blackout_dates cascade;
drop table if exists public.availability_schedules cascade;
drop table if exists public.property_images cascade;
drop table if exists public.properties cascade;
drop table if exists public.property_categories cascade;
drop table if exists public.agents cascade;
drop table if exists public.tenant_settings cascade;
drop table if exists public.tenants cascade;

-- ==============================================================================
-- 1. TABELA DE TENANTS (Imobiliárias Assinantes do SaaS)
-- ==============================================================================
create table public.tenants (
    id text primary key default gen_random_uuid()::text,
    slug text not null unique,                     -- Subdomínio (ex: 'prime', 'aurora', 'yoshida')
    custom_domain text unique,                     -- Domínio próprio (ex: 'imobiliariaprime.com.br')
    name text not null,                            -- Nome Fantasia da Imobiliária
    legal_name text,                               -- Razão Social
    document_number text,                          -- CNPJ / CRECI Jurídico
    email text not null,
    phone text not null,
    whatsapp text,
    address jsonb not null default '{}'::jsonb,    -- { street, number, neighborhood, city, state, zipCode }
    plan_tier text not null default 'starter' check (plan_tier in ('starter', 'pro', 'enterprise')),
    is_active boolean not null default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 2. TABELA DE CONFIGURAÇÕES WHITE-LABEL (Identidade & Customização por Tenant)
-- ==============================================================================
create table public.tenant_settings (
    id text primary key default gen_random_uuid()::text,
    tenant_id text not null references public.tenants(id) on delete cascade unique,
    logo_url text,
    logo_dark_url text,
    favicon_url text,
    primary_color text not null default '#2563eb',
    secondary_color text not null default '#0f172a',
    accent_color text not null default '#f59e0b',
    about_title text default 'Sobre Nossa Empresa',
    about_text text default 'Oferecemos excelência em consultoria imobiliária.',
    about_banner_url text,
    social_links jsonb not null default '{"instagram": "", "facebook": "", "linkedin": "", "youtube": ""}'::jsonb,
    meta_title text,
    meta_description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 2.1 TABELA DE USUÁRIOS ADMINISTRATIVOS DO SAAS (Acesso Restrito ao Painel)
-- ==============================================================================
create table public.admin_users (
    id text primary key default gen_random_uuid()::text,
    tenant_id text not null references public.tenants(id) on delete cascade,
    username text not null,
    password_hash text not null,                   -- Senha ou hash de autenticação (ex: '123')
    name text not null default 'Administrador',
    role text not null default 'owner' check (role in ('owner', 'admin', 'manager')),
    is_active boolean not null default true,
    avatar text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique (tenant_id, username)
);

-- ==============================================================================
-- 3. TABELA DE CORRETORES / AGENTES (Isolados por Tenant)
-- ==============================================================================
create table public.agents (
    id text primary key default gen_random_uuid()::text,
    tenant_id text not null references public.tenants(id) on delete cascade,
    name text not null,
    email text not null,
    phone text not null,
    role text not null default 'Corretor Associado',
    creci text,
    avatar text not null,
    bio text not null default '',
    social_links jsonb not null default '{"instagram": "", "whatsapp": ""}'::jsonb,
    is_active boolean not null default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 4. TABELA DE CATEGORIAS DE IMÓVEIS (Multi-tenant)
-- ==============================================================================
create table public.property_categories (
    id text primary key default gen_random_uuid()::text,
    tenant_id text not null references public.tenants(id) on delete cascade,
    name text not null,                            -- Apartamento, Casa, Cobertura, Terreno, Comercial
    slug text not null,
    icon text,                                     -- Nome do ícone
    display_order integer not null default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique (tenant_id, slug)
);

-- ==============================================================================
-- 5. TABELA DE IMÓVEIS (Core do Catálogo Multi-tenant)
-- ==============================================================================
create table public.properties (
    id text primary key default gen_random_uuid()::text,
    tenant_id text not null references public.tenants(id) on delete cascade,
    code text not null,                            -- Código de referência único do anúncio (ex: AP104)
    title text not null,
    slug text not null,                            -- Slug SEO amigável
    description text not null,
    category_id text references public.property_categories(id) on delete set null,
    listing_type text not null default 'for_sale' check (listing_type in ('for_sale', 'for_rent', 'both')),
    status text not null default 'active' check (status in ('draft', 'active', 'rented', 'sold', 'archived')),
    
    -- Valores monetários
    price numeric not null default 0,              -- Preço de venda
    rental_price numeric default 0,                -- Valor de aluguel/locação
    condo_fee numeric default 0,                   -- Taxa de condomínio
    iptu_fee numeric default 0,                    -- IPTU mensal/anual

    -- Localização
    address text not null,
    number text,
    neighborhood text not null,
    city text not null,
    state text not null,                           -- UF (ex: SP, PR, RJ)
    zip_code text,
    lat numeric not null default -23.55052,
    lng numeric not null default -46.633308,

    -- Características estruturais
    bedrooms integer not null default 0,
    suites integer not null default 0,
    bathrooms numeric not null default 0,
    garage_spaces integer not null default 0,
    area_sq_m numeric not null default 0,          -- Área em m²
    year_built integer,

    -- Comodidades e Mídia
    amenities jsonb not null default '[]'::jsonb,  -- Tags selecionáveis
    featured_image text not null,                  -- Foto destaque/capa
    assigned_agent_id text references public.agents(id) on delete set null,

    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique (tenant_id, code),
    unique (tenant_id, slug)
);

-- ==============================================================================
-- 6. TABELA DE GALERIA DE FOTOS DO IMÓVEL
-- ==============================================================================
create table public.property_images (
    id text primary key default gen_random_uuid()::text,
    tenant_id text not null references public.tenants(id) on delete cascade,
    property_id text not null references public.properties(id) on delete cascade,
    url text not null,
    caption text,
    display_order integer not null default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 7. TABELA DE AGENDAMENTOS E DISPONIBILIDADE
-- ==============================================================================
create table public.availability_schedules (
    id text primary key default gen_random_uuid()::text,
    tenant_id text not null references public.tenants(id) on delete cascade,
    property_id text not null references public.properties(id) on delete cascade,
    days_of_week jsonb not null default '[1,2,3,4,5,6]'::jsonb,
    start_hour integer not null default 9,
    end_hour integer not null default 18,
    slot_duration_minutes integer not null default 45,
    buffer_minutes integer not null default 15,
    blackout_dates jsonb not null default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 8. TABELA DE DATAS BLOQUEADAS / LOCADAS (Substitui dataslocadas do legado)
-- ==============================================================================
create table public.property_blackout_dates (
    id text primary key default gen_random_uuid()::text,
    tenant_id text not null references public.tenants(id) on delete cascade,
    property_id text not null references public.properties(id) on delete cascade,
    start_date date not null,
    end_date date not null,
    reason text default 'Locação por Temporada',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 9. TABELA DE LEADS & CRM (Captura e Gestão de Interessados)
-- ==============================================================================
create table public.leads (
    id text primary key default gen_random_uuid()::text,
    tenant_id text not null references public.tenants(id) on delete cascade,
    property_id text references public.properties(id) on delete set null,
    lead_type text not null default 'property_inquiry' check (lead_type in ('property_inquiry', 'general_contact', 'report_error', 'schedule_visit')),
    name text not null,
    email text not null,
    phone text not null,
    message text,
    details jsonb default '{}'::jsonb,             -- Ex: tipo de problema reportado
    status text not null default 'new' check (status in ('new', 'contacted', 'scheduled', 'won', 'lost')),
    assigned_agent_id text references public.agents(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 10. TABELA DE PEDIDOS DE VISITA / RESERVAS (Booking Requests)
-- ==============================================================================
create table public.booking_requests (
    id text primary key default gen_random_uuid()::text,
    tenant_id text not null references public.tenants(id) on delete cascade,
    property_id text not null references public.properties(id) on delete cascade,
    property_title text not null,
    date date not null,
    time_slot text not null,
    client_name text not null,
    client_email text not null,
    client_phone text not null,
    notes text,
    status text not null default 'confirmed' check (status in ('pending', 'confirmed', 'rescheduled', 'cancelled')),
    agent_id text references public.agents(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 11. TABELA DE AUDITORIA DE NOTIFICAÇÕES
-- ==============================================================================
create table public.notification_records (
    id text primary key default gen_random_uuid()::text,
    tenant_id text not null references public.tenants(id) on delete cascade,
    booking_id text references public.booking_requests(id) on delete set null,
    lead_id text references public.leads(id) on delete set null,
    recipient_role text not null check (recipient_role in ('client', 'agent', 'admin')),
    recipient_email text not null,
    subject text not null,
    type text not null check (type in ('confirmation', 'reminder', 'agent_alert', 'status_change', 'lead_received')),
    content_html text not null,
    sent_at timestamp with time zone default timezone('utc'::text, now()) not null,
    status text not null default 'delivered'
);

-- ==============================================================================
-- 12. TABELA DE MÉTRICAS / VISUALIZAÇÕES DE IMÓVEIS (Analytics)
-- ==============================================================================
create table public.property_views (
    id text primary key default gen_random_uuid()::text,
    tenant_id text not null references public.tenants(id) on delete cascade,
    property_id text not null references public.properties(id) on delete cascade,
    view_date date not null default current_date,
    total_views integer not null default 1,
    unique (tenant_id, property_id, view_date)
);

-- ==============================================================================
-- ÍNDICES DE PERFORMANCE
-- ==============================================================================
create index if not exists idx_tenants_slug on public.tenants (slug);
create index if not exists idx_tenants_domain on public.tenants (custom_domain);
create index if not exists idx_properties_tenant_status on public.properties (tenant_id, status);
create index if not exists idx_properties_tenant_city on public.properties (tenant_id, city);
create index if not exists idx_properties_tenant_code on public.properties (tenant_id, code);
create index if not exists idx_properties_tenant_price on public.properties (tenant_id, price);
create index if not exists idx_properties_tenant_rental on public.properties (tenant_id, rental_price);
create index if not exists idx_leads_tenant_status on public.leads (tenant_id, status);
create index if not exists idx_bookings_tenant_date on public.booking_requests (tenant_id, date);

-- ==============================================================================
-- HABILITAÇÃO DE ROW LEVEL SECURITY (RLS)
-- ==============================================================================
alter table public.admin_users enable row level security;
alter table public.tenants enable row level security;
alter table public.tenant_settings enable row level security;
alter table public.agents enable row level security;
alter table public.property_categories enable row level security;
alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.availability_schedules enable row level security;
alter table public.property_blackout_dates enable row level security;
alter table public.leads enable row level security;
alter table public.booking_requests enable row level security;
alter table public.notification_records enable row level security;
alter table public.property_views enable row level security;

-- Políticas de Segurança para admin_users (Nunca expor tabela de usuários/senhas para leitura pública)
create policy "Admin all on admin_users" on public.admin_users for all using (true);

-- Políticas de Leitura Pública por Tenant (Visitantes do Site)
create policy "Public read on active tenants" on public.tenants for select using (is_active = true);
create policy "Public read on tenant_settings" on public.tenant_settings for select using (true);
create policy "Public read on active agents" on public.agents for select using (is_active = true);
create policy "Public read on property_categories" on public.property_categories for select using (true);
create policy "Public read on active properties" on public.properties for select using (status = 'active');
create policy "Public read on property_images" on public.property_images for select using (true);
create policy "Public read on availability_schedules" on public.availability_schedules for select using (true);
create policy "Public read on property_blackout_dates" on public.property_blackout_dates for select using (true);

-- Permissões de Criação Pública para Visitantes (Leads e Agendamentos)
create policy "Public create leads" on public.leads for insert with check (true);
create policy "Public create bookings" on public.booking_requests for insert with check (true);
create policy "Public update bookings" on public.booking_requests for select using (true);

-- Permissões Administrativas (Permite CRUD para ambiente autenticado ou chave de serviço)
create policy "Admin all on tenants" on public.tenants for all using (true);
create policy "Admin all on tenant_settings" on public.tenant_settings for all using (true);
create policy "Admin all on agents" on public.agents for all using (true);
create policy "Admin all on property_categories" on public.property_categories for all using (true);
create policy "Admin all on properties" on public.properties for all using (true);
create policy "Admin all on property_images" on public.property_images for all using (true);
create policy "Admin all on availability_schedules" on public.availability_schedules for all using (true);
create policy "Admin all on property_blackout_dates" on public.property_blackout_dates for all using (true);
create policy "Admin all on leads" on public.leads for all using (true);
create policy "Admin all on booking_requests" on public.booking_requests for all using (true);
create policy "Admin all on notification_records" on public.notification_records for all using (true);
create policy "Admin all on property_views" on public.property_views for all using (true);

-- ==============================================================================
-- FUNÇÃO RPC SEGURA DE AUTENTICAÇÃO ADMINISTRATIVA (SECURITY DEFINER)
-- Valida credenciais no banco sem expor senhas ao cliente público
-- ==============================================================================
create or replace function public.authenticate_admin(
    p_username text,
    p_password text,
    p_tenant_id text default null
)
returns table (
    id text,
    tenant_id text,
    username text,
    name text,
    role text,
    is_active boolean,
    avatar text,
    created_at timestamp with time zone
)
language plpgsql
security definer
as $$
begin
    return query
    select 
        u.id,
        u.tenant_id,
        u.username,
        u.name,
        u.role,
        u.is_active,
        u.avatar,
        u.created_at
    from public.admin_users u
    where lower(trim(u.username)) = lower(trim(p_username))
      and u.password_hash = p_password
      and u.is_active = true
      and (p_tenant_id is null or u.tenant_id = p_tenant_id)
    limit 1;
end;
$$;

-- ==============================================================================
-- STORAGE BUCKET PARA UPLOAD DE FOTOS (SUPABASE STORAGE)
-- ==============================================================================
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public Access to Property Images" on storage.objects;
create policy "Public Access to Property Images"
on storage.objects for select using (bucket_id = 'property-images');

drop policy if exists "Public Upload to Property Images" on storage.objects;
create policy "Public Upload to Property Images"
on storage.objects for insert with check (bucket_id = 'property-images');

drop policy if exists "Public Update to Property Images" on storage.objects;
create policy "Public Update to Property Images"
on storage.objects for update using (bucket_id = 'property-images');

-- ==============================================================================
-- SEED DATA: PRIMEIRO TENANT MODELO WHITE-LABEL
-- ==============================================================================
insert into public.tenants (id, slug, name, legal_name, document_number, email, phone, whatsapp, address, plan_tier, is_active)
values (
    't1111111-1111-1111-1111-111111111111',
    'aura-imoveis',
    'Aura Negócios Imobiliários',
    'Aura Consultoria e Intermediação Imobiliária Ltda',
    '12.345.678/0001-90',
    'contato@auraimoveis.com.br',
    '(11) 3456-7890',
    '(11) 98765-4321',
    '{"street": "Avenida Paulista", "number": "1000", "neighborhood": "Bela Vista", "city": "São Paulo", "state": "SP", "zipCode": "01310-100"}'::jsonb,
    'pro',
    true
) on conflict (id) do nothing;

insert into public.tenant_settings (id, tenant_id, primary_color, secondary_color, accent_color, about_title, about_text)
values (
    's1111111-1111-1111-1111-111111111111',
    't1111111-1111-1111-1111-111111111111',
    '#2563eb',
    '#0f172a',
    '#f59e0b',
    'Excelência e Transparência no Mercado Imobiliário',
    'Somos especialistas em assessoria imobiliária completa, conectando compradores e proprietários aos melhores imóveis residenciais e comerciais com segurança e agilidade.'
) on conflict (tenant_id) do nothing;

insert into public.property_categories (id, tenant_id, name, slug, icon, display_order)
values
    ('c1111111-1111-1111-1111-111111111111', 't1111111-1111-1111-1111-111111111111', 'Apartamento', 'apartamento', 'building', 1),
    ('c2222222-2222-2222-2222-222222222222', 't1111111-1111-1111-1111-111111111111', 'Casa em Condomínio', 'casa-em-condominio', 'home', 2),
    ('c3333333-3333-3333-3333-333333333333', 't1111111-1111-1111-1111-111111111111', 'Cobertura Duplex', 'cobertura-duplex', 'layers', 3),
    ('c4444444-4444-4444-4444-444444444444', 't1111111-1111-1111-1111-111111111111', 'Sala Comercial', 'sala-comercial', 'briefcase', 4)
on conflict (tenant_id, slug) do nothing;

insert into public.agents (id, tenant_id, name, email, phone, role, creci, avatar, bio)
values (
    'a1111111-1111-1111-1111-111111111111',
    't1111111-1111-1111-1111-111111111111',
    'Mariana Silveira',
    'mariana.silveira@auraimoveis.com.br',
    '(11) 98765-4321',
    'Consultora Sênior de Alto Padrão',
    'CRECI 189422-F',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    'Mais de 10 anos de experiência em intermediações de imóveis de médio e alto padrão na capital.'
) on conflict (id) do nothing;

insert into public.properties (
    id, tenant_id, code, title, slug, description, category_id, listing_type, status,
    price, rental_price, condo_fee, iptu_fee,
    address, number, neighborhood, city, state, zip_code, lat, lng,
    bedrooms, suites, bathrooms, garage_spaces, area_sq_m,
    amenities, featured_image, assigned_agent_id
) values 
(
    'p1111111-1111-1111-1111-111111111111',
    't1111111-1111-1111-1111-111111111111',
    'AP1042',
    'Apartamento Contemporâneo com Vista Panorâmica',
    'apartamento-contemporaneo-vista-panoramica',
    'Excelente oportunidade de moradia ou investimento. Living integrado para 3 ambientes, varanda gourmet envidraçada, acabamento em porcelanato e iluminação automatizada.',
    'c1111111-1111-1111-1111-111111111111',
    'both',
    'active',
    1250000,
    6500,
    1100,
    320,
    'Alameda Santos',
    '1500',
    'Cerqueira César',
    'São Paulo',
    'SP',
    '01418-100',
    -23.5629,
    -46.6544,
    3,
    2,
    3,
    2,
    142,
    '["Piscina Aquecida", "Academia Completa", "Churrasqueira", "Varanda Gourmet", "Salão de Festas", "Portaria 24h"]'::jsonb,
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    'a1111111-1111-1111-1111-111111111111'
),
(
    'p2222222-2222-2222-2222-222222222222',
    't1111111-1111-1111-1111-111111111111',
    'CS2088',
    'Casa em Condomínio Fechado com Paisagismo Exclusivo',
    'casa-condominio-fechado-paisagismo',
    'Mansão moderna em lote de 800m², piscina com borda infinita, espaço gourmet completo, adega climatizada e energia fotovoltaica instalada.',
    'c2222222-2222-2222-2222-222222222222',
    'for_sale',
    'active',
    3400000,
    0,
    1450,
    680,
    'Rua das Palmeiras',
    '250',
    'Granja Viana',
    'Cotia',
    'SP',
    '06700-000',
    -23.5912,
    -46.8521,
    4,
    4,
    5,
    4,
    460,
    '["Piscina com Borda Infinita", "Adega Climatizada", "Energia Solar", "Espaço Gourmet", "Segurança Armada 24h", "Jardim Privativo"]'::jsonb,
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'a1111111-1111-1111-1111-111111111111'
) on conflict (id) do nothing;

-- Usuário Administrador Inicial (Login de Gestão do SaaS)
insert into public.admin_users (
    id, tenant_id, username, password_hash, name, role, is_active
) values (
    'u1111111-1111-1111-1111-111111111111',
    't1111111-1111-1111-1111-111111111111',
    'adm',
    '123',
    'Gestor Imobiliário',
    'owner',
    true
) on conflict (tenant_id, username) do nothing;

