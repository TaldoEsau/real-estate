-- Supabase Schema for Real Estate Property Viewing & Booking System
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/fdcvfizcfuxwimpnablp/sql

-- Enable UUID extension (for gen_random_uuid)
create extension if not exists "uuid-ossp";

-- Drop existing tables to ensure clean creation with text IDs
drop table if exists public.notification_records cascade;
drop table if exists public.booking_requests cascade;
drop table if exists public.availability_schedules cascade;
drop table if exists public.properties cascade;
drop table if exists public.agents cascade;

-- 1. Agents Table
create table public.agents (
    id text primary key default gen_random_uuid()::text,
    name text not null,
    email text not null,
    phone text not null,
    role text not null,
    avatar text not null,
    bio text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Properties Table
create table public.properties (
    id text primary key default gen_random_uuid()::text,
    title text not null,
    slug text not null,
    description text not null,
    price numeric not null,
    property_type text not null check (property_type in ('house', 'apartment', 'villa', 'penthouse', 'townhouse')),
    listing_type text not null default 'for_sale' check (listing_type in ('for_sale', 'for_rent')),
    status text not null default 'active' check (status in ('active', 'archived', 'sold')),
    address text not null,
    city text not null,
    state text not null,
    zip_code text,
    lat numeric not null default 34.0522,
    lng numeric not null default -118.2437,
    bedrooms integer not null default 1,
    bathrooms numeric not null default 1,
    area_sq_ft integer not null,
    year_built integer,
    garage_spaces integer default 0,
    amenities jsonb not null default '[]'::jsonb,
    featured_image text not null,
    gallery jsonb not null default '[]'::jsonb,
    assigned_agent_id text references public.agents(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Availability Schedules Table
create table public.availability_schedules (
    id text primary key default gen_random_uuid()::text,
    property_id text not null references public.properties(id) on delete cascade,
    days_of_week jsonb not null default '[1,2,3,4,5,6]'::jsonb,
    start_hour integer not null default 9,
    end_hour integer not null default 18,
    slot_duration_minutes integer not null default 45,
    buffer_minutes integer not null default 15,
    blackout_dates jsonb not null default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Booking Requests Table
create table public.booking_requests (
    id text primary key default gen_random_uuid()::text,
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

-- 5. Notifications Audit Table
create table public.notification_records (
    id text primary key default gen_random_uuid()::text,
    booking_id text,
    recipient_role text not null check (recipient_role in ('client', 'agent')),
    recipient_email text not null,
    subject text not null,
    type text not null check (type in ('confirmation', 'reminder', 'agent_alert', 'status_change')),
    content_html text not null,
    sent_at timestamp with time zone default timezone('utc'::text, now()) not null,
    status text not null default 'delivered'
);

-- Setup Indexes for fast queries
create index if not exists idx_properties_city on public.properties (city);
create index if not exists idx_properties_status on public.properties (status);
create index if not exists idx_properties_price on public.properties (price);
create index if not exists idx_bookings_property_date on public.booking_requests (property_id, date);
create index if not exists idx_bookings_status on public.booking_requests (status);

-- Enable Row Level Security (RLS)
alter table public.agents enable row level security;
alter table public.properties enable row level security;
alter table public.availability_schedules enable row level security;
alter table public.booking_requests enable row level security;
alter table public.notification_records enable row level security;

-- Policies for public demo access (drop if exists to ensure re-runnable)
drop policy if exists "Allow public read on agents" on public.agents;
create policy "Allow public read on agents" on public.agents for select using (true);

drop policy if exists "Allow public read on properties" on public.properties;
create policy "Allow public read on properties" on public.properties for select using (true);

drop policy if exists "Allow public insert and update on properties" on public.properties;
create policy "Allow public insert and update on properties" on public.properties for all using (true);

drop policy if exists "Allow public read on schedules" on public.availability_schedules;
create policy "Allow public read on schedules" on public.availability_schedules for select using (true);

drop policy if exists "Allow public manage on schedules" on public.availability_schedules;
create policy "Allow public manage on schedules" on public.availability_schedules for all using (true);

drop policy if exists "Allow public read and insert on bookings" on public.booking_requests;
create policy "Allow public read and insert on bookings" on public.booking_requests for all using (true);

drop policy if exists "Allow public read and insert on notifications" on public.notification_records;
create policy "Allow public read and insert on notifications" on public.notification_records for all using (true);

-- Insert Seed Agent
insert into public.agents (id, name, email, phone, role, avatar, bio)
values (
    'a1111111-1111-1111-1111-111111111111',
    'Alexandra Vance',
    'alexandra.vance@luxuryrealty.com',
    '+1 (310) 849-2201',
    'Senior Luxury Specialist & Partner',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    'With over 12 years of luxury residential expertise across Bel-Air and Beverly Hills, Alexandra pairs discretion with curated client advisory.'
) on conflict (id) do nothing;

-- Insert Seed Properties
insert into public.properties (
    id, title, slug, description, price, property_type, listing_type, status,
    address, city, state, zip_code, lat, lng, bedrooms, bathrooms, area_sq_ft, year_built, garage_spaces,
    amenities, featured_image, gallery, assigned_agent_id
) values 
(
    'p1111111-1111-1111-1111-111111111111',
    'The Bel-Air Skyline Villa',
    'the-bel-air-skyline-villa',
    'An architectural masterpiece commanding panoramic ocean and city views. Featuring seamless indoor-outdoor living, zero-edge infinity pool, climate-controlled wine gallery, and state-of-the-art smart home integration.',
    4250000,
    'villa',
    'for_sale',
    'active',
    '10842 Bellagio Road',
    'Bel-Air',
    'CA',
    '90077',
    34.0837,
    -118.4447,
    5,
    6,
    6850,
    2023,
    3,
    '["Infinity Pool", "Wine Cellar", "Smart Home Automation", "Private Cinema", "Panoramic Ocean View", "Chef Kitchen"]'::jsonb,
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80"]'::jsonb,
    'a1111111-1111-1111-1111-111111111111'
),
(
    'p2222222-2222-2222-2222-222222222222',
    'Tribeca Light Glass Penthouse',
    'tribeca-light-glass-penthouse',
    'Suspended high above cobblestone streets, this duplex penthouse offers 360-degree skyline views through double-height floor-to-ceiling glass, custom Boffi kitchen, and a private 1,200 sq ft wrap-around rooftop terrace.',
    3800000,
    'penthouse',
    'for_sale',
    'active',
    '68 Franklin Street',
    'Tribeca',
    'NY',
    '10013',
    40.7183,
    -74.0048,
    3,
    3.5,
    4100,
    2022,
    1,
    '["Private Rooftop Terrace", "Doorman 24/7", "Fireplace", "Private Elevator Access", "Boffi Italian Kitchen"]'::jsonb,
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80"]'::jsonb,
    'a1111111-1111-1111-1111-111111111111'
),
(
    'p3333333-3333-3333-3333-333333333333',
    'The Modernist Beverly Hills Residence',
    'modernist-beverly-hills-residence',
    'A tranquil sanctuary boasting minimalist Japanese architecture influences, limestone courtyards, secluded master suite with outdoor soaking tub, and custom bronze fixtures throughout.',
    2950000,
    'house',
    'for_sale',
    'active',
    '9410 Loma Vista Drive',
    'Beverly Hills',
    'CA',
    '90210',
    34.0736,
    -118.4004,
    4,
    4.5,
    5200,
    2021,
    2,
    '["Zen Courtyard", "Outdoor Soaking Tub", "Guest House", "Solar Energy System", "Wine Display"]'::jsonb,
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1600573472591-ee6c8e695394?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1000&q=80"]'::jsonb,
    'a1111111-1111-1111-1111-111111111111'
) on conflict (id) do nothing;

-- 6. Storage Bucket for Property Uploaded Images
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
