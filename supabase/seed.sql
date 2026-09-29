-- Wrapoura Seed Data
-- PRD Section 5 & Appendix: Initial Storefront & CMS Seed

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
