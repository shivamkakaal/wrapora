-- Wrapoura Database Migration: Initial Schema
-- PRD Section 5: Data Model (Supabase / PostgreSQL)

-- 1. Helper function for updated_at timestamps
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 2. Enums
do $$ begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type order_status as enum ('pending', 'confirmed', 'completed', 'cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'lead_status') then
    create type lead_status as enum ('pending', 'confirmed', 'completed', 'cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'stock_status') then
    create type stock_status as enum ('in_stock', 'low_stock', 'out_of_stock');
  end if;
  if not exists (select 1 from pg_type where typname = 'payment_method') then
    create type payment_method as enum ('cod', 'upi_manual', 'online');
  end if;
  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type payment_status as enum ('unpaid', 'paid', 'refunded');
  end if;
  if not exists (select 1 from pg_type where typname = 'event_type') then
    create type event_type as enum ('birthday', 'anniversary', 'intimate_gathering', 'baby_shower', 'corporate', 'other');
  end if;
end $$;

-- 3. Admin Users
create table if not exists admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'admin' check (role in ('admin', 'staff')),
  created_at timestamptz default now()
);

-- 4. Helper Function: is_admin()
create or replace function is_admin() returns boolean
language sql security definer stable as $$
  select exists (
    select 1 from admin_users where user_id = auth.uid()
  );
$$;

-- 5. Categories
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  is_smart boolean default false,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger tr_categories_updated_at
  before update on categories
  for each row execute function set_updated_at();

-- 6. Products
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  name text not null,
  slug text unique not null,
  short_description text,
  description text,
  price_paise int not null check (price_paise >= 0),
  compare_at_price_paise int check (compare_at_price_paise >= 0),
  sku text unique,
  stock_status stock_status not null default 'in_stock',
  stock_quantity int check (stock_quantity >= 0),
  is_best_seller boolean default false,
  is_customizable boolean default false,
  is_active boolean default true,
  images text[] default '{}',
  tags text[] default '{}',
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_products_query on products (category_id, is_active, sort_order);
create index if not exists idx_products_slug on products (slug);

create trigger tr_products_updated_at
  before update on products
  for each row execute function set_updated_at();

-- 7. Product Categories (Many-to-Many)
create table if not exists product_categories (
  product_id uuid references products(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  primary key (product_id, category_id)
);

-- 8. Event Services
create table if not exists event_services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  type text not null check (type in ('event_organization', 'decor_styling', 'gifting')),
  summary text,
  description text,
  starting_price_paise int,
  cover_image text,
  features text[] default '{}',
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_event_services_slug on event_services (slug);
create index if not exists idx_event_services_active on event_services (type, is_active, sort_order);

create trigger tr_event_services_updated_at
  before update on event_services
  for each row execute function set_updated_at();

-- 9. Gallery Items
create table if not exists gallery_items (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  title text,
  caption text,
  event_type event_type,
  event_service_id uuid references event_services(id) on delete set null,
  width int,
  height int,
  is_featured boolean default false,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

create index if not exists idx_gallery_active on gallery_items (is_active, sort_order);
create index if not exists idx_gallery_featured on gallery_items (is_featured, is_active);

-- 10. Site Content
create table if not exists site_content (
  key text primary key,
  value jsonb not null,
  updated_by uuid references auth.users(id),
  updated_at timestamptz default now()
);

create trigger tr_site_content_updated_at
  before update on site_content
  for each row execute function set_updated_at();

-- 11. Banners
create table if not exists banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text,
  link_url text,
  placement text not null default 'top_bar' check (placement in ('top_bar', 'home_strip', 'shop_header')),
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

create index if not exists idx_banners_placement on banners (placement, is_active);

-- 12. Testimonials
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_title text,
  avatar_url text,
  rating smallint not null check (rating between 1 and 5),
  quote text not null,
  event_type event_type,
  is_featured boolean default true,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

create index if not exists idx_testimonials_active on testimonials (is_active, sort_order);

-- 13. Orders & Sequences
create sequence if not exists order_number_seq;

create or replace function generate_order_number() returns text as $$
declare
  date_part text;
  seq_part text;
begin
  date_part := to_char(now(), 'YYYYMMDD');
  seq_part := lpad(nextval('order_number_seq')::text, 4, '0');
  return 'WRP-' || date_part || '-' || seq_part;
end;
$$ language plpgsql;

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null default generate_order_number(),
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  shipping_address jsonb not null,
  delivery_date date,
  gift_message text,
  subtotal_paise int not null,
  delivery_fee_paise int not null default 0,
  discount_paise int not null default 0,
  total_paise int not null,
  payment_method payment_method not null default 'upi_manual',
  payment_status payment_status not null default 'unpaid',
  status order_status not null default 'pending',
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_orders_status on orders (status, created_at desc);
create index if not exists idx_orders_phone on orders (customer_phone);

create trigger tr_orders_updated_at
  before update on orders
  for each row execute function set_updated_at();

-- 14. Order Items
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  name_snapshot text not null,
  unit_price_paise int not null,
  quantity int not null check (quantity > 0),
  customization_note text,
  image_snapshot text
);

create index if not exists idx_order_items_order_id on order_items (order_id);

-- 15. Event Leads & Sequence
create sequence if not exists lead_number_seq;

create or replace function generate_lead_number() returns text as $$
declare
  seq_part text;
begin
  seq_part := lpad(nextval('lead_number_seq')::text, 4, '0');
  return 'LEAD-' || seq_part;
end;
$$ language plpgsql;

create table if not exists event_leads (
  id uuid primary key default gen_random_uuid(),
  lead_number text unique not null default generate_lead_number(),
  full_name text not null,
  phone text not null,
  email text,
  event_type event_type not null,
  event_service_id uuid references event_services(id) on delete set null,
  event_date date not null,
  city text not null,
  venue text,
  guest_count int,
  budget_range text,
  message text,
  preferred_contact text default 'whatsapp' check (preferred_contact in ('whatsapp', 'call', 'email')),
  status lead_status not null default 'pending',
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_leads_status on event_leads (status, created_at desc);
create index if not exists idx_leads_event_date on event_leads (event_date);

create trigger tr_event_leads_updated_at
  before update on event_leads
  for each row execute function set_updated_at();

-- 16. Global Settings
create table if not exists settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

create trigger tr_settings_updated_at
  before update on settings
  for each row execute function set_updated_at();

-- 17. Push Subscriptions
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text unique not null,
  keys jsonb not null,
  audience text default 'customer' check (audience in ('customer', 'admin')),
  user_id uuid references auth.users(id),
  created_at timestamptz default now()
);

-- =========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================

alter table categories enable row level security;
alter table products enable row level security;
alter table product_categories enable row level security;
alter table event_services enable row level security;
alter table gallery_items enable row level security;
alter table site_content enable row level security;
alter table banners enable row level security;
alter table testimonials enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table event_leads enable row level security;
alter table settings enable row level security;
alter table push_subscriptions enable row level security;
alter table admin_users enable row level security;

-- Public READ policies
create policy "public_read_categories" on categories
  for select using (is_active = true);

create policy "public_read_products" on products
  for select using (is_active = true);

create policy "public_read_prod_cats" on product_categories
  for select using (true);

create policy "public_read_services" on event_services
  for select using (is_active = true);

create policy "public_read_gallery" on gallery_items
  for select using (is_active = true);

create policy "public_read_content" on site_content
  for select using (true);

create policy "public_read_banners" on banners
  for select using (
    is_active = true and
    (starts_at is null or starts_at <= now()) and
    (ends_at is null or ends_at >= now())
  );

create policy "public_read_testimonials" on testimonials
  for select using (is_active = true);

create policy "public_read_settings" on settings
  for select using (true);

-- Customer access for order tracking (read order by ID)
create policy "public_read_order_by_id" on orders
  for select using (true);

create policy "public_read_order_items_by_id" on order_items
  for select using (true);

-- Admin ALL policies
create policy "admin_all_categories" on categories for all using (is_admin()) with check (is_admin());
create policy "admin_all_products" on products for all using (is_admin()) with check (is_admin());
create policy "admin_all_prod_cats" on product_categories for all using (is_admin()) with check (is_admin());
create policy "admin_all_services" on event_services for all using (is_admin()) with check (is_admin());
create policy "admin_all_gallery" on gallery_items for all using (is_admin()) with check (is_admin());
create policy "admin_all_content" on site_content for all using (is_admin()) with check (is_admin());
create policy "admin_all_banners" on banners for all using (is_admin()) with check (is_admin());
create policy "admin_all_testimonials" on testimonials for all using (is_admin()) with check (is_admin());
create policy "admin_all_orders" on orders for all using (is_admin()) with check (is_admin());
create policy "admin_all_order_items" on order_items for all using (is_admin()) with check (is_admin());
create policy "admin_all_leads" on event_leads for all using (is_admin()) with check (is_admin());
create policy "admin_all_settings" on settings for all using (is_admin()) with check (is_admin());
create policy "admin_all_push_subscriptions" on push_subscriptions for all using (is_admin()) with check (is_admin());
create policy "admin_all_admin_users" on admin_users for all using (is_admin()) with check (is_admin());

-- Allow public inserts into push_subscriptions
create policy "public_insert_push_subscriptions" on push_subscriptions
  for insert with check (true);

-- Realtime Setup
do $$ begin
  alter publication supabase_realtime add table orders, event_leads;
exception
  when duplicate_object then null;
  when others then null;
end $$;

-- =========================================================
-- STORAGE BUCKETS SETUP
-- =========================================================
insert into storage.buckets (id, name, public)
values
  ('products', 'products', true),
  ('gallery', 'gallery', true),
  ('banners', 'banners', true),
  ('testimonials', 'testimonials', true)
on conflict (id) do update set public = true;

-- Storage Policies
create policy "Public Access to Buckets" on storage.objects
  for select using (bucket_id in ('products', 'gallery', 'banners', 'testimonials'));

create policy "Admin Upload to Buckets" on storage.objects
  for insert with check (
    bucket_id in ('products', 'gallery', 'banners', 'testimonials')
    and (is_admin() or auth.role() = 'authenticated')
  );

create policy "Admin Update to Buckets" on storage.objects
  for update using (
    bucket_id in ('products', 'gallery', 'banners', 'testimonials')
    and (is_admin() or auth.role() = 'authenticated')
  );

create policy "Admin Delete from Buckets" on storage.objects
  for delete using (
    bucket_id in ('products', 'gallery', 'banners', 'testimonials')
    and (is_admin() or auth.role() = 'authenticated')
  );
