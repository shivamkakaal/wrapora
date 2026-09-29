-- =========================================================
-- WRAPOURA: COMPLETE DATABASE SCHEMA + SEED DATA
-- Copy and paste this file into Supabase SQL Editor and click RUN
-- =========================================================

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

drop trigger if exists tr_categories_updated_at on categories;
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

drop trigger if exists tr_products_updated_at on products;
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

drop trigger if exists tr_event_services_updated_at on event_services;
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

drop trigger if exists tr_site_content_updated_at on site_content;
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

drop trigger if exists tr_orders_updated_at on orders;
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

drop trigger if exists tr_event_leads_updated_at on event_leads;
create trigger tr_event_leads_updated_at
  before update on event_leads
  for each row execute function set_updated_at();

-- 16. Global Settings
create table if not exists settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

drop trigger if exists tr_settings_updated_at on settings;
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
drop policy if exists "public_read_categories" on categories;
create policy "public_read_categories" on categories for select using (is_active = true);

drop policy if exists "public_read_products" on products;
create policy "public_read_products" on products for select using (is_active = true);

drop policy if exists "public_read_prod_cats" on product_categories;
create policy "public_read_prod_cats" on product_categories for select using (true);

drop policy if exists "public_read_services" on event_services;
create policy "public_read_services" on event_services for select using (is_active = true);

drop policy if exists "public_read_gallery" on gallery_items;
create policy "public_read_gallery" on gallery_items for select using (is_active = true);

drop policy if exists "public_read_content" on site_content;
create policy "public_read_content" on site_content for select using (true);

drop policy if exists "public_read_banners" on banners;
create policy "public_read_banners" on banners for select using (
  is_active = true and
  (starts_at is null or starts_at <= now()) and
  (ends_at is null or ends_at >= now())
);

drop policy if exists "public_read_testimonials" on testimonials;
create policy "public_read_testimonials" on testimonials for select using (is_active = true);

drop policy if exists "public_read_settings" on settings;
create policy "public_read_settings" on settings for select using (true);

drop policy if exists "public_read_order_by_id" on orders;
create policy "public_read_order_by_id" on orders for select using (true);

drop policy if exists "public_read_order_items_by_id" on order_items;
create policy "public_read_order_items_by_id" on order_items for select using (true);

drop policy if exists "public_insert_orders" on orders;
create policy "public_insert_orders" on orders for insert with check (true);

drop policy if exists "public_insert_order_items" on order_items;
create policy "public_insert_order_items" on order_items for insert with check (true);

drop policy if exists "public_insert_leads" on event_leads;
create policy "public_insert_leads" on event_leads for insert with check (true);

-- Admin ALL policies
drop policy if exists "admin_all_categories" on categories;
create policy "admin_all_categories" on categories for all using (is_admin()) with check (is_admin());

drop policy if exists "admin_all_products" on products;
create policy "admin_all_products" on products for all using (is_admin()) with check (is_admin());

drop policy if exists "admin_all_prod_cats" on product_categories;
create policy "admin_all_prod_cats" on product_categories for all using (is_admin()) with check (is_admin());

drop policy if exists "admin_all_services" on event_services;
create policy "admin_all_services" on event_services for all using (is_admin()) with check (is_admin());

drop policy if exists "admin_all_gallery" on gallery_items;
create policy "admin_all_gallery" on gallery_items for all using (is_admin()) with check (is_admin());

drop policy if exists "admin_all_content" on site_content;
create policy "admin_all_content" on site_content for all using (is_admin()) with check (is_admin());

drop policy if exists "admin_all_banners" on banners;
create policy "admin_all_banners" on banners for all using (is_admin()) with check (is_admin());

drop policy if exists "admin_all_testimonials" on testimonials;
create policy "admin_all_testimonials" on testimonials for all using (is_admin()) with check (is_admin());

drop policy if exists "admin_all_orders" on orders;
create policy "admin_all_orders" on orders for all using (is_admin()) with check (is_admin());

drop policy if exists "admin_all_order_items" on order_items;
create policy "admin_all_order_items" on order_items for all using (is_admin()) with check (is_admin());

drop policy if exists "admin_all_leads" on event_leads;
create policy "admin_all_leads" on event_leads for all using (is_admin()) with check (is_admin());

drop policy if exists "admin_all_settings" on settings;
create policy "admin_all_settings" on settings for all using (is_admin()) with check (is_admin());

drop policy if exists "admin_all_push_subscriptions" on push_subscriptions;
create policy "admin_all_push_subscriptions" on push_subscriptions for all using (is_admin()) with check (is_admin());

drop policy if exists "admin_all_admin_users" on admin_users;
create policy "admin_all_admin_users" on admin_users for all using (is_admin()) with check (is_admin());

drop policy if exists "public_insert_push_subscriptions" on push_subscriptions;
create policy "public_insert_push_subscriptions" on push_subscriptions for insert with check (true);

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

drop policy if exists "Public Access to Buckets" on storage.objects;
create policy "Public Access to Buckets" on storage.objects
  for select using (bucket_id in ('products', 'gallery', 'banners', 'testimonials'));

drop policy if exists "Admin Upload to Buckets" on storage.objects;
create policy "Admin Upload to Buckets" on storage.objects
  for insert with check (bucket_id in ('products', 'gallery', 'banners', 'testimonials'));

drop policy if exists "Admin Update to Buckets" on storage.objects;
create policy "Admin Update to Buckets" on storage.objects
  for update using (bucket_id in ('products', 'gallery', 'banners', 'testimonials'));

drop policy if exists "Admin Delete from Buckets" on storage.objects;
create policy "Admin Delete from Buckets" on storage.objects
  for delete using (bucket_id in ('products', 'gallery', 'banners', 'testimonials'));

-- =========================================================
-- SEED DATA
-- =========================================================

-- 1. Categories
insert into categories (id, name, slug, description, is_smart, sort_order, is_active)
values
  ('11111111-1111-1111-1111-111111111001', 'Best Sellers', 'best-sellers', 'Our most cherished and viral curated hampers', true, 1, true),
  ('11111111-1111-1111-1111-111111111002', 'For Partners', 'for-partners', 'Thoughtfully romantic gifts for anniversaries, birthdays and quiet dates', false, 2, true),
  ('11111111-1111-1111-1111-111111111003', 'Return Favors', 'return-favors', 'Graceful, personalized return gifts for weddings, poojas & milestones', false, 3, true),
  ('11111111-1111-1111-1111-111111111004', 'Custom Hampers', 'custom-hampers', 'Fully bespoke luxury gift boxes tailored to your recipient', false, 4, true)
on conflict (id) do nothing;

-- 2. Products
insert into products (id, category_id, name, slug, short_description, description, price_paise, compare_at_price_paise, sku, stock_status, stock_quantity, is_best_seller, is_customizable, is_active, images, tags, sort_order)
values
  (
    '22222222-2222-2222-2222-222222222001',
    '11111111-1111-1111-1111-111111111001',
    'The Royal Velvet Keepsake Hamper',
    'royal-velvet-keepsake-hamper',
    'Signature velvet trunk with handcrafted soy candle, gold brass coaster & artisanal truffles.',
    'A masterpiece of presentation and luxury. Housed in a handcrafted deep royal purple velvet keepsake trunk with satin ribbon trimmings. Includes a hand-poured lavender-bergamot soy candle, pair of etched brass coasters, luxury Belgian chocolate truffles, and a custom gold-foil calligraphed note card.',
    349900,
    399900,
    'WRP-HAM-001',
    'in_stock',
    25,
    true,
    true,
    true,
    array['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=800&q=80'],
    array['luxury', 'best-seller', 'anniversary', 'candle'],
    1
  ),
  (
    '22222222-2222-2222-2222-222222222002',
    '11111111-1111-1111-1111-111111111002',
    'Timeless Romance Starlight Crate',
    'timeless-romance-starlight-crate',
    'Preserved eternal roses, luxury niche fragrance, gourmet macaroons & fairy lights.',
    'Designed specifically to kindle unforgettable romantic moments. Features 3 preserved eternal red roses that last a year, an artisanal 50ml eau de parfum, a 6-pack box of French macaroons, micro warm fairy lights and a wax-sealed love note.',
    499900,
    549900,
    'WRP-HAM-002',
    'in_stock',
    18,
    true,
    true,
    true,
    array['https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80'],
    array['romance', 'partner', 'fragrance', 'roses'],
    2
  ),
  (
    '22222222-2222-2222-2222-222222222003',
    '11111111-1111-1111-1111-111111111003',
    'Artisanal Heritage Return Favor Box',
    'artisanal-heritage-return-favor-box',
    'Brass diya keepsake, premium saffron almonds, and velvet potli packaging.',
    'The quintessential Indian hospitality favor. Each box contains an antique-finish brass peacock diya, 100g premium Kashmiri saffron-roasted almonds, a scented dhoop cone glass jar, and a customized thank-you medallion.',
    149900,
    180000,
    'WRP-HAM-003',
    'in_stock',
    100,
    false,
    true,
    true,
    array['https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80'],
    array['wedding', 'return-favor', 'brass', 'dry-fruits'],
    3
  ),
  (
    '22222222-2222-2222-2222-222222222004',
    '11111111-1111-1111-1111-111111111004',
    'Bespoke Opulence Custom Trunk',
    'bespoke-opulence-custom-trunk',
    'Fully custom tailored luxury gift hamper curated personally by our design team.',
    'Tell us who you are gifting and the milestone occasion. Our gifting stylists will assemble a one-of-a-kind combination of gourmet treats, luxury lifestyle accessories, engraved keepsakes, and breathtaking botanical styling.',
    699900,
    799900,
    'WRP-HAM-004',
    'in_stock',
    10,
    true,
    true,
    true,
    array['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80'],
    array['custom', 'bespoke', 'luxury', 'corporate'],
    4
  ),
  (
    '22222222-2222-2222-2222-222222222005',
    '11111111-1111-1111-1111-111111111001',
    'Golden Glow Birthday Luxe Box',
    'golden-glow-birthday-luxe-box',
    'Party celebration kit with ceramic mug, gold teaspoon, hot cocoa stirrers & banner.',
    'The ultimate birthday in a box. Packed with an iridescent pink ceramic mug, gold-plated stir spoon, artisanal dark chocolate bomb, mini happy birthday acrylic cake topper, and celebration confetti popper.',
    229900,
    269900,
    'WRP-HAM-005',
    'in_stock',
    30,
    true,
    true,
    true,
    array['https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=800&q=80'],
    array['birthday', 'celebration', 'chocolate', 'mug'],
    5
  ),
  (
    '22222222-2222-2222-2222-222222222006',
    '11111111-1111-1111-1111-111111111002',
    'Velvet Mocha & Cedarwood Duo',
    'velvet-mocha-cedarwood-duo',
    'Specialty single-origin coffee beans, french press, cedarwood candle & leather coaster.',
    'A warm, grounding gift set for the partner who appreciates quiet mornings and fine design. Contains 250g Arabica roast, matte black mini French press, pure cedarwood candle and hand-stitched tan leather coaster.',
    389900,
    429900,
    'WRP-HAM-006',
    'in_stock',
    15,
    false,
    false,
    true,
    array['https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=800&q=80'],
    array['coffee', 'partner', 'candle', 'relax'],
    6
  )
on conflict (id) do nothing;

-- 3. Product Categories Mapping
insert into product_categories (product_id, category_id)
values
  ('22222222-2222-2222-2222-222222222001', '11111111-1111-1111-1111-111111111001'),
  ('22222222-2222-2222-2222-222222222001', '11111111-1111-1111-1111-111111111002'),
  ('22222222-2222-2222-2222-222222222002', '11111111-1111-1111-1111-111111111001'),
  ('22222222-2222-2222-2222-222222222002', '11111111-1111-1111-1111-111111111002'),
  ('22222222-2222-2222-2222-222222222003', '11111111-1111-1111-1111-111111111003'),
  ('22222222-2222-2222-2222-222222222004', '11111111-1111-1111-1111-111111111004'),
  ('22222222-2222-2222-2222-222222222005', '11111111-1111-1111-1111-111111111001'),
  ('22222222-2222-2222-2222-222222222006', '11111111-1111-1111-1111-111111111002')
on conflict do nothing;

-- 4. Event Services
insert into event_services (id, title, slug, type, summary, description, starting_price_paise, cover_image, features, is_active, sort_order)
values
  (
    '33333333-3333-3333-3333-333333333001',
    'Milestone Birthday Celebrations',
    'birthday-celebrations',
    'event_organization',
    'From dramatic balloon arches to theatrical lighting and custom cake tables.',
    'We turn milestone birthdays into cinematic experiences. Whether an intimate 18th, a lavish 30th, or a golden 50th jubilee, our team coordinates the styling, ambient neon backdrops, floral installations, catering staging and acoustic ambiance.',
    2500000,
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    array['Custom Theme Ideation', 'Luxe Neon & Balloon Styling', 'Personalized Backdrop & Photo Booth', 'Guest Welcome Concierge'],
    true,
    1
  ),
  (
    '33333333-3333-3333-3333-333333333002',
    'Anniversary Soirées & Date Nights',
    'anniversary-soirees',
    'decor_styling',
    'Candlelit dinners, floral canopies and private romantic setups in stunning settings.',
    'A sanctuary of romance tailored exclusively for two or your closest circle. We orchestrate enchanted floral cabanas, pathway fairy lights, live violinists or acoustic guitarists, personalized menu cards, and champagne coolers.',
    3500000,
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
    array['Fairy Light Canopy Setup', 'Fresh Exotic Floral Arrangements', 'Candlelit Walkway & Dining Setup', 'Bespoke Music & Soundscape'],
    true,
    2
  ),
  (
    '33333333-3333-3333-3333-333333333003',
    'Intimate Gatherings & Cocktail Soirées',
    'intimate-gatherings',
    'event_organization',
    'Artisanal tablescapes, grazing stations and cozy luxury decor for 20 to 80 guests.',
    'Host an unforgettable dinner party without the stress. We craft personalized tablescapes, linen runners, bespoke floral centerpieces, curated glassware and interactive grazing tables that spark conversations.',
    3000000,
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80',
    array['Custom Tablescapes & Namecards', 'Grazing Board Curation', 'Mood Lighting & Bar Styling', 'On-site Host Coordinator'],
    true,
    3
  ),
  (
    '33333333-3333-3333-3333-333333333004',
    'Baby Shower & Welcome Baby Magic',
    'baby-shower-welcome',
    'decor_styling',
    'Pastel dreamscapes, whimsical cloud backdrops and heirloom memory corners.',
    'Celebrate new life with soft pastels, floral wreaths, teddy bear and hot air balloon motifs, customized mom-to-be throne chairs, and sweet treat dessert tables designed to warm hearts.',
    2800000,
    'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80',
    array['Pastel Organic Balloon Wall', 'Mom-to-Be Seating Styling', 'Baby Gender/Name reveal setups', 'Guest Message Book & Station'],
    true,
    4
  ),
  (
    '33333333-3333-3333-3333-333333333005',
    'Bespoke Gifting & Corporate Favors',
    'bespoke-gifting-services',
    'gifting',
    'End-to-end luxury gifting curation for corporate galas, VIP guests & wedding parties.',
    'From 10 VIP hampers to 500 wedding return favors, our master gift-crafters assemble custom branding, ribbons, laser-engraved wooden packaging and door-to-door white-glove distribution.',
    1500000,
    'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80',
    array['Corporate Logo Ribbon & Seals', 'Handpicked Artisanal Products', 'Nationwide Insured Delivery', 'Batch Tracking & Proofs'],
    true,
    5
  )
on conflict (id) do nothing;

-- 5. Gallery Items
insert into gallery_items (id, image_url, title, caption, event_type, width, height, is_featured, is_active, sort_order)
values
  ('44444444-4444-4444-4444-444444444001', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80', 'Royal Purple 30th Gala', 'A fairytale neon & velvet evening in Jammu', 'birthday', 1200, 800, true, true, 1),
  ('44444444-4444-4444-4444-444444444002', 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80', 'Starlight Terrace Anniversary', '1000 fairy lights with champagne gazebo', 'anniversary', 1200, 800, true, true, 2),
  ('44444444-4444-4444-4444-444444444003', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80', 'Bohemian Sunken Tablescape', 'Intimate dinner party for 24 guests in Delhi NCR', 'intimate_gathering', 1200, 800, true, true, 3),
  ('44444444-4444-4444-4444-444444444004', 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80', 'Cloud Nine Pastel Baby Shower', 'Whimsical baby shower styling in Chandigarh', 'baby_shower', 1200, 800, true, true, 4),
  ('44444444-4444-4444-4444-444444444005', 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80', 'Golden Shimmer Jubilee', '50th anniversary grand ballroom decor', 'anniversary', 1200, 800, true, true, 5),
  ('44444444-4444-4444-4444-444444444006', 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1200&q=80', 'Heirloom Brass Wedding Favors', 'Custom packaging for 200 wedding guests', 'other', 1200, 800, true, true, 6)
on conflict (id) do nothing;

-- 6. Site Content
insert into site_content (key, value)
values
  (
    'hero',
    jsonb_build_object(
      'headline', 'Where Moments Turn Into Majestic Memories',
      'subheadline', 'Luxury event curation, spellbinding themed decor, and bespoke handcrafted gift hampers designed with timeless elegance.',
      'media_type', 'image',
      'media_url', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=85',
      'poster_url', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
      'cta_primary', jsonb_build_object('label', 'Plan Your Event', 'href', '/events#inquire'),
      'cta_secondary', jsonb_build_object('label', 'Explore Gifts', 'href', '/gifts')
    )
  ),
  (
    'announcement',
    jsonb_build_object(
      'text', '✨ Festive & Wedding Season Bookings Open! Enjoy complimentary personalized gold-foil calligraphy on all custom hampers.',
      'is_visible', true,
      'link', '/gifts'
    )
  ),
  (
    'contact',
    jsonb_build_object(
      'phone', '+91 98765 43210',
      'whatsapp', '+919876543210',
      'email', 'concierge@wrapoura.com',
      'instagram', '@wrapoura.luxury',
      'location', 'Jammu, Delhi NCR & Chandigarh'
    )
  ),
  (
    'footer',
    jsonb_build_object(
      'brand_bio', 'Wrapoura is an ultra-premium event planning and luxury gifting atelier. We create enchanting atmosphere and unforgettable keepsakes.',
      'copyright', '© 2026 Wrapoura Luxury Events & Gifting. All rights reserved.'
    )
  ),
  (
    'seo_home',
    jsonb_build_object(
      'title', 'Wrapoura | Luxury Event Planning, Themed Decor & Curated Gifting',
      'description', 'Discover Wrapoura: bespoke celebration decor, milestone anniversaries, birthday styling, and handcrafted luxury hampers delivered across India.'
    )
  )
on conflict (key) do update set value = excluded.value;

-- 7. Banners
insert into banners (id, title, subtitle, image_url, link_url, placement, is_active, sort_order)
values
  (
    '55555555-5555-5555-5555-555555555001',
    'Special Celebration Edition Hampers',
    'Order 3+ hampers and receive priority bespoke gift ribbons.',
    'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80',
    '/gifts',
    'home_strip',
    true,
    1
  )
on conflict (id) do nothing;

-- 8. Testimonials
insert into testimonials (id, customer_name, customer_title, avatar_url, rating, quote, event_type, is_featured, is_active, sort_order)
values
  (
    '66666666-6666-6666-6666-666666666001',
    'Priya Sharma',
    'Birthday Client, Jammu',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    5,
    'Wrapoura transformed my 30th birthday into pure magic! The neon backdrop, royal purple aesthetics, and attention to every guest was extraordinary. All my guests are still talking about it!',
    'birthday',
    true,
    true,
    1
  ),
  (
    '66666666-6666-6666-6666-666666666002',
    'Rohan & Ananya Mehta',
    'Anniversary Soirée, Delhi NCR',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    5,
    'The candlelit terrace setup was beyond what we imagined. They took care of everything from the acoustic ambiance to the personalized menu cards. Truly a luxury service.',
    'anniversary',
    true,
    true,
    2
  ),
  (
    '66666666-6666-6666-6666-666666666003',
    'Kavita Kapoor',
    'Baby Shower, Chandigarh',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
    5,
    'Their curated return hampers and floral dreamscapes for our baby shower were heavenly. The brass diyas and velvet boxes felt deeply personal and lavish.',
    'baby_shower',
    true,
    true,
    3
  )
on conflict (id) do nothing;

-- 9. Settings
insert into settings (key, value)
values
  (
    'general',
    jsonb_build_object(
      'whatsapp_number', '+919876543210',
      'support_email', 'concierge@wrapoura.com',
      'min_lead_days', 2,
      'currency', 'INR',
      'currency_symbol', '₹'
    )
  ),
  (
    'service_cities',
    jsonb_build_array('Jammu', 'Delhi NCR', 'Chandigarh', 'Mumbai', 'Jaipur', 'Other')
  ),
  (
    'delivery_rules',
    jsonb_build_object(
      'flat_fee_paise', 15000,
      'free_delivery_threshold_paise', 250000,
      'express_delivery_fee_paise', 350000
    )
  ),
  (
    'feature_flags',
    jsonb_build_object(
      'online_payments_enabled', false,
      'push_notifications_enabled', true,
      'reviews_enabled', true
    )
  )
on conflict (key) do update set value = excluded.value;
