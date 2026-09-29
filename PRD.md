Wrapora — Product Requirements Document (PRD)
Product: Wrapoura PWA + Admin CMS Version: 1.0 (MVP scope, with Phase 2 roadmap) Stack: Next.js (App Router) · Tailwind CSS · Supabase · Vercel
1. Product Overview
1.1 Vision
Wrapoura is a luxury event planning, themed decor and curated gifting brand. The platform lets customers discover services, buy gift hampers, and book event consultations from an installable, app-like web experience, while the owner runs the whole storefront and content from a no-code Admin CMS.
1.2 Goals
#	Goal	Success Metric
G1	Convert visitors into event consultation leads	Lead form conversion ≥ 3% of sessions
G2	Sell curated gifts online	Cart-to-order conversion ≥ 2%
G3	Let the admin manage everything without developers	100% of homepage copy, products, gallery, testimonials editable from CMS
G4	Premium, fast, installable experience	Lighthouse: Performance ≥ 90, PWA ✔, Accessibility ≥ 95
1.3 Non-Goals (MVP)
Multi-vendor marketplace, native iOS/Android apps, customer loyalty program, multi-currency, real-time chat (WhatsApp handles this), vendor/staff scheduling.
1.4 Personas
Priya (Customer – Gifter): 28, wants a premium hamper for her partner quickly, mobile-first, pays via UPI/card.
Rahul (Customer – Host): 35, planning a birthday/anniversary, wants to see past work and request a consultation.
Meera (Admin/Owner): Runs Wrapoura, non-technical, updates products, banners and leads from phone or laptop.
1.5 Assumptions (confirm before build)
Market is India (₹ INR, +91 phone format, WhatsApp as primary contact channel).
Payment: MVP supports Cash/UPI on confirmation via WhatsApp and an optional online gateway (Razorpay) behind a feature flag. Payment gateway integration is Phase 2 unless confirmed.
Single admin role in MVP; roles scaffolded for future staff users.
Delivery is by pincode/city-based flat fee configured in CMS.
2. Tech Stack & Architecture
2.1 Stack
Layer	Choice	Notes
Frontend	Next.js 14+ (App Router, TypeScript)	Server Components for catalog/SEO; Client Components for cart, forms, carousels
Styling	Tailwind CSS + tailwind.config.ts tokens	Mobile-first, dark-mode optional (Phase 2)
Database	Supabase PostgreSQL	RLS on every table
Auth	Supabase Auth (email + password)	Admin only; @supabase/ssr for cookie sessions
Storage	Supabase Storage	Buckets: products, gallery, banners, testimonials
Realtime	Supabase Realtime	Admin leads/orders live updates
Hosting	Vercel	Edge caching, preview deployments, CI/CD from GitHub
PWA	manifest.webmanifest + custom service worker (Workbox / @serwist/next)	Offline shell, install prompt, push-ready
Validation	Zod + React Hook Form	Shared schemas client/server
State	Zustand (cart, persisted to localStorage)	Server is source of truth at checkout
Email (optional)	Resend	Order/lead notification to admin
2.2 High-Level Architecture
Browser (PWA) ── Next.js on Vercel (RSC, Route Handlers, Server Actions, ISR)
                    │
                    ├─ Supabase Postgres (public reads via RLS, writes via Server Actions)
                    ├─ Supabase Auth (admin session cookies, middleware guard on /admin/*)
                    ├─ Supabase Storage (public-read buckets, admin-write)
                    └─ Supabase Realtime (admin dashboard subscriptions)
Service Worker ── cache-first static, stale-while-revalidate catalog/images, offline fallback page
2.3 Rendering & Caching Strategy
Route	Strategy
/ (Home)	ISR, revalidate: 60; on-demand revalidation (revalidateTag) when admin edits content
/gifts, /gifts/[slug]	ISR + tag revalidation on product change
/events, /gallery	ISR + tag revalidation
/cart, /checkout, /account	Dynamic (client-driven)
/admin/**	Dynamic, no-store, middleware-protected
2.4 Project Structure
/app
  (site)/page.tsx, events/, gifts/, gifts/[slug]/, gallery/, account/, checkout/, order/[id]/
  admin/login/, admin/(protected)/{dashboard,products,events,gallery,content,testimonials,orders,leads,settings}
  api/{revalidate,leads,orders,push/subscribe}/route.ts
/components  ui/, site/, admin/
/lib         supabase/{client,server,middleware}.ts, validators/, utils/
/public      icons/, manifest.webmanifest, sw.js, offline.html
/supabase    migrations/, seed.sql
middleware.ts
2.5 Environment Variables
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY (server only), NEXT_PUBLIC_WHATSAPP_NUMBER, NEXT_PUBLIC_SITE_URL, REVALIDATE_SECRET, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, RESEND_API_KEY (optional).
3. Brand & Design System
3.1 Color Tokens
Token	Hex	Usage
royal (500/DEFAULT)	#6B21A8	Primary brand, headers, primary buttons, footer
royal-50 … 900	Generated scale (50 #FAF5FF, 100 #F3E8FF, 700 #581C87, 900 #3B0764)	Surfaces, hovers, gradients
magenta (500/DEFAULT)	#DB2777	CTAs, badges, accents, highlights
magenta-50 … 900	Generated scale (50 #FDF2F8, 600 #BE185D)	Hover/pressed, tints
ink	#1F1030	Body text
cream	#FFF9FB	Page background
Gradient	linear-gradient(135deg, #6B21A8, #DB2777)	Hero overlay, primary CTA
Contrast rule: white text on #6B21A8 and #DB2777 passes WCAG AA for large and normal text; do not use pink text on purple backgrounds for body copy.
3.2 Typography
Headings: Playfair Display (serif, luxury feel), weights 600–700.
Body/UI: Inter or Poppins, weights 400–600.
Load via next/font (self-hosted, no layout shift).
3.3 Components & Patterns
Rounded-2xl cards with soft purple shadow, glassmorphism sticky navbar (blur + 80% white), pill buttons, subtle Framer Motion fade/slide on scroll (respect prefers-reduced-motion), skeleton loaders for all async lists, toast notifications for feedback.
3.4 Breakpoints
Tailwind defaults: sm 640, md 768, lg 1024, xl 1280. Design mobile-first at 375px.
4. Information Architecture & Routes
4.1 Public
Route	Purpose
/	Home: hero, services, featured gifts, gallery preview, testimonials, CTA
/events	Event services detail + consultation inquiry form
/gifts	Gift store with category tabs
/gifts/[slug]	Product detail
/gallery	Masonry portfolio with filters
/cart	Full-page cart (drawer is primary on desktop/mobile)
/checkout	Checkout form
/order/[id]	Order confirmation + status
/account	Order lookup by phone/email + saved details (see FR-ACC)
/offline	Offline fallback
4.2 Admin (Protected)
/admin/login, /admin/dashboard, /admin/products, /admin/products/new, /admin/products/[id], /admin/events, /admin/gallery, /admin/content, /admin/testimonials, /admin/orders, /admin/orders/[id], /admin/leads, /admin/leads/[id], /admin/settings.
5. Data Model (Supabase / PostgreSQL)
All tables: id uuid primary key default gen_random_uuid(), created_at timestamptz default now(), updated_at timestamptz default now() (maintained by trigger). Money stored as integer paise (price_paise) to avoid float errors.
5.1 Enums
create type order_status  as enum ('pending','confirmed','completed','cancelled');
create type lead_status   as enum ('pending','confirmed','completed','cancelled');
create type stock_status  as enum ('in_stock','low_stock','out_of_stock');
create type payment_method as enum ('cod','upi_manual','online');
create type payment_status as enum ('unpaid','paid','refunded');
create type event_type    as enum ('birthday','anniversary','intimate_gathering','baby_shower','corporate','other');
5.2 Tables
-- Admin allow-list (Supabase Auth users who are admins)
create table admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'admin' check (role in ('admin','staff')),
  created_at timestamptz default now()
);

-- Product categories (tabs on gift store)
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,                 -- Best Sellers, For Partners, Return Favors, Custom Hampers
  slug text unique not null,
  description text,
  is_smart boolean default false,     -- true = "Best Sellers" (driven by products.is_best_seller)
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table products (
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
  stock_quantity int check (stock_quantity >= 0),   -- null = not tracked
  is_best_seller boolean default false,
  is_customizable boolean default false,           -- shows note/personalization field
  is_active boolean default true,                  -- soft-hide (draft)
  images text[] default '{}',                      -- public URLs, first = cover
  tags text[] default '{}',
  sort_order int default 0,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create index on products (category_id, is_active, sort_order);

-- Many-to-many so a product can be in several tabs (e.g., Best Seller + For Partners)
create table product_categories (
  product_id uuid references products(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  primary key (product_id, category_id)
);

-- Event / decor services shown on /events
create table event_services (
  id uuid primary key default gen_random_uuid(),
  title text not null,                 -- e.g., "Birthday Celebrations"
  slug text unique not null,
  type text not null check (type in ('event_organization','decor_styling','gifting')),
  summary text,
  description text,
  starting_price_paise int,            -- optional "Starting from"
  cover_image text,
  features text[] default '{}',
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

-- Portfolio / gallery
create table gallery_items (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  title text,
  caption text,
  event_type event_type,
  event_service_id uuid references event_services(id) on delete set null,
  width int, height int,               -- for masonry aspect ratio / CLS prevention
  is_featured boolean default false,   -- shown on homepage preview
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Key-value CMS blocks (hero, announcement bar, footer, contact info)
create table site_content (
  key text primary key,                -- e.g., 'hero', 'announcement', 'contact', 'footer', 'seo_home'
  value jsonb not null,
  updated_by uuid references auth.users(id),
  updated_at timestamptz default now()
);
-- hero value shape:
-- { "headline": "...", "subheadline": "...", "media_type": "image|video", "media_url": "...",
--   "poster_url": "...", "cta_primary": {"label":"Plan Your Event","href":"/events#inquire"},
--   "cta_secondary": {"label":"Explore Gifts","href":"/gifts"} }

-- Seasonal banners (Diwali, Valentine's, etc.)
create table banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text,
  link_url text,
  placement text not null default 'top_bar' check (placement in ('top_bar','home_strip','shop_header')),
  starts_at timestamptz, ends_at timestamptz,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_title text,                 -- e.g., "Birthday client, Jammu"
  avatar_url text,
  rating smallint not null check (rating between 1 and 5),
  quote text not null,
  event_type event_type,
  is_featured boolean default true,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Gift orders
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,   -- e.g., WRP-20260928-0042 (generated by trigger/sequence)
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  shipping_address jsonb not null,     -- {line1,line2,city,state,pincode,landmark}
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
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  name_snapshot text not null,         -- price/name frozen at order time
  unit_price_paise int not null,
  quantity int not null check (quantity > 0),
  customization_note text,
  image_snapshot text
);

-- Event consultation leads
create table event_leads (
  id uuid primary key default gen_random_uuid(),
  lead_number text unique not null,    -- e.g., LEAD-0031
  full_name text not null,
  phone text not null,
  email text,
  event_type event_type not null,
  event_service_id uuid references event_services(id) on delete set null,
  event_date date not null,
  city text not null,
  venue text,
  guest_count int,
  budget_range text,                   -- '<25k','25-50k','50k-1L','1L+'
  message text,
  preferred_contact text default 'whatsapp' check (preferred_contact in ('whatsapp','call','email')),
  status lead_status not null default 'pending',
  admin_notes text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

-- Global settings (delivery fee rules, WhatsApp number, service cities)
create table settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- Web Push subscriptions (push-notification readiness)
create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text unique not null,
  keys jsonb not null,
  audience text default 'customer' check (audience in ('customer','admin')),
  user_id uuid references auth.users(id),
  created_at timestamptz default now()
);
5.3 Helper Function & Row Level Security
create or replace function is_admin() returns boolean
language sql security definer stable as $$
  select exists (select 1 from admin_users where user_id = auth.uid());
$$;

-- Enable RLS on all tables
alter table categories, products, product_categories, event_services, gallery_items,
  site_content, banners, testimonials, orders, order_items, event_leads, settings,
  push_subscriptions, admin_users enable row level security;

-- Public READ of active catalog/content
create policy "public read categories"  on categories  for select using (is_active);
create policy "public read products"    on products    for select using (is_active);
create policy "public read prod_cats"   on product_categories for select using (true);
create policy "public read services"    on event_services for select using (is_active);
create policy "public read gallery"     on gallery_items for select using (is_active);
create policy "public read content"     on site_content for select using (true);
create policy "public read banners"     on banners for select using (is_active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now()));
create policy "public read testimonials" on testimonials for select using (is_active);

-- Admin full access (repeat for each table above, plus orders, order_items, event_leads, settings)
create policy "admin all products" on products for all using (is_admin()) with check (is_admin());
-- ...same pattern for every admin-managed table

-- Public may NOT read/insert orders or leads directly; inserts go through server route handlers
-- using the service-role key after Zod validation + rate limiting. Admin reads via is_admin().
create policy "admin all orders" on orders for all using (is_admin()) with check (is_admin());
create policy "admin all order_items" on order_items for all using (is_admin()) with check (is_admin());
create policy "admin all leads" on event_leads for all using (is_admin()) with check (is_admin());
5.4 Storage Buckets
Bucket	Read	Write	Limits
products	Public	is_admin()	JPG/PNG/WebP, ≤ 5 MB, up to 6 images/product
gallery	Public	is_admin()	≤ 8 MB
banners	Public	is_admin()	≤ 5 MB; hero video ≤ 20 MB (MP4/WebM)
testimonials	Public	is_admin()	≤ 2 MB
Client-side compression to WebP (max 1600px long edge) before upload; next/image handles responsive delivery.
5.5 Triggers
set_updated_at() on all tables with updated_at.
generate_order_number() / generate_lead_number() via sequences.
Optional: decrement_stock() when an order moves to confirmed (if stock_quantity is tracked).
Realtime enabled on orders and event_leads.
6. Functional Requirements — Customer PWA
Priority: P0 = MVP must-have, P1 = MVP should-have, P2 = Phase 2.
FR-PWA — Progressive Web App
ID	Requirement	Pri
FR-PWA-1	manifest.webmanifest: name "Wrapoura", short_name "Wrapoura", start_url: "/?source=pwa", display: standalone, theme_color: #6B21A8, background_color: #FFF9FB, icons 192/512 (any + maskable), shortcuts ("Plan Event", "Gifts", "Cart").	P0
FR-PWA-2	Service worker registered in production only. Precaches app shell, fonts, icons, /offline.	P0
FR-PWA-3	Runtime caching: static assets → cache-first (1 yr); product/gallery images → stale-while-revalidate (max 100 entries, 30 days); catalog API/HTML → network-first with 3s timeout falling back to cache. Admin routes and all POSTs are never cached.	P0
FR-PWA-4	Offline: previously viewed pages and catalog readable offline; forms show "You're offline" and queue-safe messaging (no silent data loss); /offline fallback for uncached pages.	P0
FR-PWA-5	Custom install prompt: capture beforeinstallprompt, show a branded "Install Wrapoura" banner after 2nd visit or first add-to-cart; iOS shows "Add to Home Screen" instructions sheet. Dismissal remembered 14 days.	P1
FR-PWA-6	Update flow: when a new SW is waiting, show toast "New version available — Refresh".	P1
FR-PWA-7	Push readiness: VAPID keys, push_subscriptions table, subscribe endpoint, SW push and notificationclick handlers. UI opt-in prompt is shipped behind a feature flag; sending is Phase 2 (order status updates, seasonal offers).	P1
Acceptance criteria
Lighthouse PWA audit passes; app is installable on Android Chrome, desktop Chrome/Edge, and iOS Safari (A2HS).
With network disabled, reloading a previously visited /gifts page renders content; an unvisited page shows /offline.
Updating a product in admin is visible to customers within 60s (or immediately after on-demand revalidation), never served stale beyond that from SW HTML cache.
FR-NAV — Header & Navigation
ID	Requirement	Pri
FR-NAV-1	Sticky navbar with logo (links to /), links: Home, Events, Gifts, Gallery, Account. Active link highlighted in magenta.	P0
FR-NAV-2	Cart icon with live badge showing total item quantity; updates instantly on add/remove; hidden when 0; animates on change; persists across reloads (localStorage). Clicking opens Cart Drawer.	P0
FR-NAV-3	Mobile: hamburger opens full-height slide-in menu; optional bottom tab bar in standalone PWA mode (Home, Events, Gifts, Cart, Account).	P0
FR-NAV-4	Navbar gains backdrop blur + shadow after 16px scroll. Announcement bar above navbar driven by banners (top_bar).	P1
FR-NAV-5	Skip-to-content link, keyboard navigable, ARIA labels on icon buttons.	P0
Acceptance: Adding 3 items shows badge "3" without reload; badge value equals sum of quantities; navbar stays visible on scroll on all breakpoints; tap targets ≥ 44px.
FR-HERO — Hero Section
ID	Requirement	Pri
FR-HERO-1	Headline, sub-headline, background image or looping muted video (from site_content.hero), with purple→pink gradient overlay for text legibility.	P0
FR-HERO-2	Dual CTAs: "Plan Your Event" (primary, magenta gradient → /events#inquire) and "Explore Gifts" (secondary outline → /gifts). Labels/links editable in CMS.	P0
FR-HERO-3	Video: poster image, preload="metadata", disabled on prefers-reduced-motion and on Save-Data/slow connections (falls back to image).	P1
FR-HERO-4	Fallback default content if CMS row is missing.	P0
Acceptance: LCP < 2.5s on 4G mobile; text contrast ≥ 4.5:1; CMS edit reflects on homepage without deploy.
FR-SVC — Services & Decor Showcase
ID	Requirement	Pri
FR-SVC-1	Interactive grid of three pillars — Event Organization, Decor Styling, Gifting Boxes — cards with image, title, summary; hover/tap reveals feature list and CTA.	P0
FR-SVC-2	/events page lists event_services (birthdays, anniversaries, intimate gatherings, etc.) with detail modal or expandable panel, "Starting from ₹X" if set, and "Enquire" CTA that pre-selects the service in the inquiry form.	P0
FR-SVC-3	Decor showcase: image carousel/lightbox of styling themes tied to gallery_items by service.	P1
Acceptance: Cards render from DB; deactivating a service in admin removes it publicly; "Enquire" pre-fills event_service_id.
FR-STORE — Gifting Store
ID	Requirement	Pri
FR-STORE-1	/gifts shows category tabs: Best Sellers, For Partners, Return Favors, Custom Hampers (+ "All"); tabs loaded from categories ordered by sort_order. Tab state reflected in URL (?category=for-partners).	P0
FR-STORE-2	Product card: cover image (lazy, blur placeholder), name, price (₹, with strikethrough compare-at if set), short description, stock badge, Add to Cart button. Out-of-stock → disabled "Sold Out".	P0
FR-STORE-3	Product detail /gifts/[slug]: image gallery, full description, quantity selector, customization note field (if is_customizable), related products, JSON-LD Product schema.	P0
FR-STORE-4	Sort (Popular, Price ↑/↓, Newest) and search-by-name.	P1
FR-STORE-5	Add-to-cart gives instant feedback (button state + toast) and opens drawer or increments badge.	P0
Acceptance: Switching tabs does not full-reload the page and updates URL; a product marked "out_of_stock" cannot be added; prices display in INR format (₹1,499).
FR-SOCIAL — Gallery & Testimonials
ID	Requirement	Pri
FR-SOCIAL-1	/gallery masonry grid (CSS columns or CSS grid) using stored width/height to avoid layout shift; filter chips by event_type; lightbox with swipe/keyboard navigation; infinite scroll or "Load more" (24 per page).	P0
FR-SOCIAL-2	Homepage gallery preview shows is_featured items (up to 8) + "View full gallery".	P0
FR-SOCIAL-3	Testimonial slider: autoplay 6s (pause on hover/focus), swipe on touch, arrows + dots, star rating, name/title/avatar; respects reduced motion.	P0
Acceptance: No CLS > 0.1 on gallery; slider is keyboard operable; only is_active items appear.
FR-WA — Floating WhatsApp Widget
ID	Requirement	Pri
FR-WA-1	Fixed bottom-right circular button (green WhatsApp icon, subtle pulse), offset above mobile bottom tab bar and safe-area inset.	P0
FR-WA-2	Click opens a small popover ("Hi! How can we help?") with quick options: Plan an Event, Order a Gift, Custom Hamper, each opening https://wa.me/<number>?text=<prefilled message>. Number from settings.	P0
FR-WA-3	Context-aware prefill: on a product page, message includes product name and URL; on events page, includes event type if selected.	P1
FR-WA-4	Hidden on /admin/** and checkout submit step z-index conflicts avoided.	P0
Acceptance: Tap opens WhatsApp app/web with correct prefilled text; widget never overlaps cart drawer or cookie/install banners.
FR-CART — Cart Drawer
ID	Requirement	Pri
FR-CART-1	Right-side slide-in drawer (bottom sheet on mobile) listing items: image, name, unit price, quantity stepper (min 1, max 10 or stock), remove, customization note edit.	P0
FR-CART-2	Live subtotal; delivery fee estimate note; "Checkout" primary CTA; "Continue shopping" link; empty state with CTA to /gifts.	P0
FR-CART-3	Cart persisted in localStorage; on load, revalidated against server (price/stock changes flagged with a notice).	P0
FR-CHK — Checkout & Order Flow
ID	Requirement	Pri
FR-CHK-1	Single-page checkout: contact (name, phone, email optional), delivery address (line1, city, pincode, landmark), preferred delivery date (min +2 days, configurable), gift message, payment method (COD / UPI on confirmation; Razorpay if enabled).	P0
FR-CHK-2	Server-side validation (Zod); prices recomputed server-side from DB — client totals are never trusted.	P0
FR-CHK-3	On success: create orders + order_items, generate order_number, clear cart, redirect to /order/[id] with summary and a "Confirm on WhatsApp" button that pre-fills order details to the business number. Admin notified via realtime + optional email/push.	P0
FR-CHK-4	Rate limiting (e.g., 5 orders/hour/IP) and honeypot field for spam.	P0
FR-CHK-5	Order tracking page shows status (Pending → Confirmed → Completed) using a unguessable order UUID URL.	P1
Acceptance: Tampering with cart prices in the client does not change stored totals; order appears in admin within 2s; invalid phone (non-10-digit Indian mobile) blocked with inline error.
FR-LEAD — Event Consultation Inquiry Form
ID	Requirement	Pri
FR-LEAD-1	Form on /events#inquire (also reachable from hero CTA): full name*, phone*, email, event type* (select), service (select, prefilled), event date* (date picker, future dates only), city / location* (select from settings.service_cities + "Other" free text), venue, guest count, budget range, message, preferred contact method.	P0
FR-LEAD-2	Submission creates event_leads row (status pending), shows success state with lead number and "Chat on WhatsApp" shortcut. Admin notified in realtime (+ optional email/push).	P0
FR-LEAD-3	Multi-step layout on mobile (3 steps: You → Event → Details) with progress indicator and per-step validation.	P1
FR-LEAD-4	Spam protection: honeypot + rate limit + optional Cloudflare Turnstile.	P0
Acceptance: Past dates are rejected; required-field errors are inline and announced to screen readers; a lead is never lost on transient failure (retry UI, no duplicate on double-click).
FR-ACC — Account (Lightweight)
MVP is guest checkout. /account provides: order lookup by phone + order number, saved recent orders on device (localStorage), install-app prompt, contact/support links, and notification opt-in. Full customer login (Supabase Auth email OTP/Google) is Phase 2. Pri: P1
FR-SEO — SEO & Analytics
Dynamic metadata per page, OpenGraph images, sitemap.xml, robots.txt, JSON-LD (Organization, Product, Review, LocalBusiness), canonical URLs. Vercel Analytics + Web Vitals; optional GA4/Meta Pixel via consent banner. P1
7. Functional Requirements — Admin CMS
FR-AUTH — Authentication
ID	Requirement	Pri
FR-AUTH-1	/admin/login: email + password via Supabase Auth; show/hide password; generic error message on failure ("Invalid credentials").	P0
FR-AUTH-2	middleware.ts refreshes session and redirects unauthenticated requests on /admin/** (except login) to /admin/login?next=….	P0
FR-AUTH-3	Authorization double-check: authenticated user must exist in admin_users; otherwise sign out + 403. Enforced both in middleware/server actions and by RLS is_admin().	P0
FR-AUTH-4	Logout, session expiry (7 days), login rate limiting (Supabase built-in + app-level), "Forgot password" email reset. Public sign-ups disabled in Supabase.	P0
FR-AUTH-5	Admin pages send noindex and Cache-Control: no-store; excluded from SW cache.	P0
Acceptance: Direct URL to /admin/orders while logged out redirects to login; a logged-in non-admin user gets no data (RLS returns empty/denied); admin created only via Supabase dashboard/seed script.
FR-DASH — Dashboard Overview
ID	Requirement	Pri
FR-DASH-1	Summary widgets: Total gift orders (all-time + this month), Active event leads (pending + confirmed), Revenue (completed orders, this month), Inventory overview (# active products, low-stock, out-of-stock).	P0
FR-DASH-2	Recent activity: latest 5 orders and 5 leads with status pills, links to detail.	P0
FR-DASH-3	Realtime: new order/lead increments counters and shows toast + optional sound (Supabase Realtime).	P1
FR-DASH-4	Date-range filter (7d/30d/all) and simple orders-over-time chart.	P2
FR-PROD — Gift Store CRUD
ID	Requirement	Pri
FR-PROD-1	Products list: table (desktop) / cards (mobile) with thumbnail, name, category, price, stock status, active toggle; search, filter by category/stock, pagination (20/page).	P0
FR-PROD-2	Create/Edit form: name, auto-generated editable slug (unique), category (multi-select), short + long description, price (₹, converted to paise), compare-at price, SKU, stock status, optional stock quantity, best-seller toggle, customizable toggle, active toggle, tags, sort order.	P0
FR-PROD-3	Image upload to Supabase Storage products bucket: multi-file drag-drop, preview, client-side WebP compression, reorder (first = cover), delete; file type/size validation.	P0
FR-PROD-4	Delete with confirmation modal. If product exists in past orders, allow (order snapshots preserve data; product_id set null) — offer "Archive (hide)" as the recommended alternative. Also deletes orphaned storage files.	P0
FR-PROD-5	Quick inline edits from the list: price and stock status, active toggle.	P1
FR-PROD-6	Category manager: create/rename/reorder/deactivate categories (the 4 default tabs seeded).	P0
FR-PROD-7	On every mutation, call revalidation (revalidateTag('products')) so the storefront updates immediately.	P0
FR-PROD-8	Bulk CSV import/export.	P2
Acceptance: Creating a product with 3 images makes it visible on /gifts within seconds; slug collision shows an error; price entered as 1499.50 stores 149950; out-of-stock switch disables Add to Cart publicly.
FR-EVT — Event & Portfolio Manager
ID	Requirement	Pri
FR-EVT-1	Event services CRUD: title, slug, type (organization/decor/gifting), summary, description, features list (repeatable), starting price, cover image, active toggle, sort order (drag reorder).	P0
FR-EVT-2	Gallery manager: bulk upload, auto-capture of image dimensions, edit title/caption/event type/service, feature toggle (homepage), active toggle, reorder, delete (removes file from Storage).	P0
FR-EVT-3	Deleting an event service does not delete gallery items (relation set null) and warns about linked items.	P0
FR-CMS — Content & Banner Control
ID	Requirement	Pri
FR-CMS-1	Hero editor: headline, sub-headline, media type (image/video), upload media + poster, primary/secondary CTA label & link; live preview pane; Save & Publish (writes site_content.hero, triggers revalidation).	P0
FR-CMS-2	Seasonal banners: create/edit/delete banners with title, subtitle, image, link, placement, start/end schedule, active toggle; auto show/hide by date.	P0
FR-CMS-3	Other editable blocks: announcement bar text, contact info (phone, WhatsApp number, email, address, social links), footer text, homepage SEO title/description.	P1
FR-CMS-4	Basic version history (last 5 revisions of site_content) with restore.	P2
Acceptance: Changing hero headline updates the live homepage without any deploy; a banner scheduled for a future date does not display until its start time.
FR-TEST — Testimonials Manager
ID	Requirement	Pri
FR-TEST-1	CRUD: customer name, title/location, avatar upload, star rating (1–5 selector), quote (max 400 chars with counter), event type, featured & active toggles, sort order.	P0
FR-TEST-2	Slider order on site follows sort_order; preview of card in form.	P1
FR-OPS — Orders & Leads Tracker
ID	Requirement	Pri
FR-OPS-1	Orders table: order #, customer, phone, items count, total, payment status, order status, created time; filters (status, date range), search (name/phone/order #), sort; realtime insertions with highlight.	P0
FR-OPS-2	Order detail: full items with images/notes, address, delivery date, gift message, totals; status controls Pending → Confirmed → Completed (+ Cancelled); payment status toggle; internal admin notes; "Message on WhatsApp" quick link; printable packing slip.	P0
FR-OPS-3	Leads table: lead #, name, event type, event date, city, budget, status, created; filters incl. upcoming event date; realtime updates.	P0
FR-OPS-4	Lead detail: all inquiry fields, status controls (Pending, Confirmed, Completed, Cancelled), admin notes, WhatsApp/call/email quick actions.	P0
FR-OPS-5	Status changes are optimistic with rollback on error, stamp updated_at, and (Phase 2) trigger customer push/WhatsApp template.	P0
FR-OPS-6	CSV export of orders and leads.	P1
FR-OPS-7	Status change audit log (who/when/from/to).	P2
Acceptance: A new order placed on the storefront appears at the top of the admin table within 2 seconds without refresh; changing a status persists and is reflected on the customer's /order/[id] page; status transitions limited to allowed values.
FR-SET — Settings
WhatsApp number, service cities list, delivery fee rules (flat/free above ₹X), min lead time for orders, low-stock threshold, feature flags (online payments, push opt-in). P1
8. Key User Flows
8.1 Gift Purchase (Customer)
Lands on Home → taps Explore Gifts (or Gifts nav).
Selects a category tab (e.g., For Partners) → views product cards.
Opens product → chooses quantity/personalization → Add to Cart → badge increments, drawer opens.
Reviews cart → Checkout → fills details, delivery date, message, payment method.
Submits → server validates and recomputes totals → order created → confirmation page + optional WhatsApp confirm.
Admin receives realtime alert → confirms order → status visible to customer.
8.2 Event Consultation (Customer)
Home hero → Plan Your Event → /events#inquire.
Chooses event type/service, date, city, budget → submits.
Success screen with lead number + WhatsApp shortcut.
Admin sees lead → contacts customer → updates status Pending → Confirmed → Completed.
8.3 Admin Product Update
Login → Products → Edit → change price/stock/images → Save → storefront revalidated → confirmation toast.
8.4 Admin Hero/Banner Update
Login → Content → Hero editor → edit copy/media → preview → Publish → live homepage updates.
8.5 PWA Install
Second visit → install banner → user accepts → app opens standalone with bottom tab bar → later opens offline to browse cached catalog.
9. API & Server Interfaces
Use Server Actions for admin mutations and Route Handlers for public writes.
Endpoint	Method	Auth	Purpose
/api/orders	POST	Public (rate-limited)	Validate cart, recompute totals, create order
/api/leads	POST	Public (rate-limited)	Create event lead
/api/revalidate	POST	Secret / admin session	Tag-based revalidation
/api/push/subscribe	POST/DELETE	Public	Store/remove push subscription
/api/order-status/[id]	GET	Public (UUID)	Customer-safe order status
Admin Server Actions	—	Admin session + is_admin()	CRUD for products, categories, services, gallery, content, banners, testimonials, statuses
Standard response: { ok: boolean, data?: T, error?: { code: string, message: string, fields?: Record<string,string> } }.
10. Non-Functional Requirements
Area	Requirement
Performance	LCP < 2.5s, INP < 200ms, CLS < 0.1 on mid-range Android over 4G; JS budget < 170 KB gzip on landing route; next/image with WebP/AVIF; fonts via next/font.
Security	RLS on all tables; service-role key server-only; input validated with Zod; CSP, HSTS, X-Frame-Options headers; no public writes to orders/leads except via validated handlers; storage write restricted to admins; rate limiting (Vercel KV/Upstash or Supabase edge).
Privacy	Collect minimum PII; privacy policy + terms pages; consent banner for analytics; data-retention policy (e.g., purge leads > 24 months on request).
Accessibility	WCAG 2.1 AA: keyboard nav, focus rings, alt text (required in CMS uploads), reduced-motion support.
Reliability	Vercel + Supabase managed; daily Supabase backups (PITR on paid tier); graceful error boundaries and not-found pages.
Scalability	Designed for ≤ 50k monthly visits and ≤ 500 orders/month on free/pro tiers; indexes on filter columns; ISR reduces DB load.
Browser Support	Last 2 versions of Chrome, Safari (iOS 15+), Edge, Firefox, Samsung Internet.
Localization	English MVP; INR formatting via Intl.NumberFormat('en-IN'); i18n-ready copy structure.
Observability	Vercel Analytics, Sentry (errors), Supabase logs.
11. DevOps, Environments & CI/CD
Environments: Local (Supabase CLI) → Preview (per PR on Vercel + Supabase staging project) → Production.
Migrations: SQL files in /supabase/migrations, applied via Supabase CLI in CI; seed.sql seeds categories, sample products, hero content, settings.
CI (GitHub Actions): typecheck, ESLint, Vitest unit tests, Playwright smoke tests (home, add-to-cart, lead submit, admin login), Lighthouse CI budget check.
Deploy: Merge to main → Vercel production; instant rollback via Vercel.
Secrets: Vercel encrypted env vars; separate keys per environment.
12. Testing & Definition of Done
Unit: validators, price/paise utilities, cart store, order total calculation.
Integration: order/lead handlers against a local Supabase; RLS policy tests (anon cannot read orders/leads; non-admin cannot write; admin can).
E2E (Playwright): full gift purchase, lead submission, admin CRUD + image upload, status update propagation, offline reload.
Definition of Done: acceptance criteria met, RLS verified, Lighthouse budgets met, responsive checked at 375/768/1280, a11y audit (axe) passes, no console errors, docs updated.
13. Delivery Plan
Phase	Scope	Est.
0 – Setup	Repo, Tailwind tokens, Supabase project, schema + RLS + seed, Vercel pipeline, PWA shell	1 wk
1 – Public Site	Navbar/cart badge, hero, services, gifts store, gallery, testimonials, WhatsApp widget, SEO	2–3 wks
2 – Checkout & Leads	Cart drawer, checkout, order confirmation, inquiry form, notifications	1–2 wks
3 – Admin CMS	Auth, dashboard, products/categories, events/gallery, content/banners, testimonials, orders/leads tracker	3 wks
4 – Hardening	PWA offline QA, performance, a11y, security review, E2E, UAT, launch	1–2 wks
Phase 2 (post-launch)	Razorpay, customer accounts, push campaigns, coupons, analytics charts, CSV bulk import, audit log, version history	Backlog
14. Risks & Mitigations
Risk	Mitigation
Stale content from SW/ISR caching	Tag revalidation on every admin write; network-first for HTML; SW update toast
Spam/fake orders and leads	Honeypot, rate limits, Turnstile, admin confirmation step before fulfilment
Large media slows site	Enforced compression, size limits, lazy loading, next/image
iOS PWA limitations (push, install UX)	Instructional A2HS sheet; push treated as progressive enhancement
Overselling limited stock	Optional stock quantity with decrement on confirmation; manual override by admin
Admin misconfiguration	Confirmation modals, soft-delete/archive, restricted role, backups
15. Open Questions
Is online payment (Razorpay/UPI gateway) required at launch or is WhatsApp/COD confirmation sufficient?
Delivery coverage: which cities/pincodes, and are fees flat or tiered?
Do event services show public pricing or "on request" only?
Will multiple staff need admin access at launch (roles/permissions)?
Preferred admin notification channel for new orders/leads: email, WhatsApp, push, or all?
Final logo, brand copy, and photography availability for seed content.
16. Appendix — Tailwind Config Snippet
// tailwind.config.ts
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        royal:   { 50:"#FAF5FF",100:"#F3E8FF",200:"#E9D5FF",300:"#D8B4FE",400:"#A855F7",
                   500:"#6B21A8",600:"#6B21A8",700:"#581C87",800:"#4C1D95",900:"#3B0764", DEFAULT:"#6B21A8" },
        magenta: { 50:"#FDF2F8",100:"#FCE7F3",200:"#FBCFE8",300:"#F9A8D4",400:"#F472B6",
                   500:"#DB2777",600:"#BE185D",700:"#9D174D",800:"#831843",900:"#500724", DEFAULT:"#DB2777" },
        cream: "#FFF9FB", ink: "#1F1030",
      },
      fontFamily: { display: ["var(--font-playfair)"], sans: ["var(--font-inter)"] },
      backgroundImage: { "brand-gradient": "linear-gradient(135deg,#6B21A8,#DB2777)" },
      boxShadow: { royal: "0 10px 30px -10px rgba(107,33,168,.35)" },
      borderRadius: { "2xl": "1.25rem" },
    },
  },
};
17. Appendix — Sample manifest.webmanifest
{
  "name": "Wrapoura — Events, Decor & Gifting",
  "short_name": "Wrapoura",
  "description": "Luxury event planning, themed decor and curated gifting.",
  "start_url": "/?source=pwa",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#FFF9FB",
  "theme_color": "#6B21A8",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "shortcuts": [
    { "name": "Plan an Event", "url": "/events#inquire" },
    { "name": "Browse Gifts", "url": "/gifts" },
    { "name": "View Cart", "url": "/cart" }
  ]
}