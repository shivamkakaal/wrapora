"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Save,
  Sparkles,
  Upload,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Check,
  RotateCcw,
  Palette,
  Gift,
  Layers,
  ShoppingBag,
  Bell,
  Phone,
  Eye,
  AlertCircle,
  X,
} from "lucide-react";
import { saveSiteContent } from "@/lib/actions/admin";
import { uploadImageAction } from "@/lib/actions/upload";
import { ServiceItem } from "@/components/site/ServicesSlider";
import { ShowcaseHamper } from "@/components/site/HeroGiftCard";

// Default Presets
const DEFAULT_HERO = {
  headline: "Making Every\nMoment Magical\nwith WRAPORA",
  tagline_badge: "Ultra-Luxury Event Styling & Curated Atelier",
  subheadline:
    "Premium event planning, stunning decorations, and handpicked gifts for your special celebrations.",
  background_image: "/images/hero-celebration.jpg",
  background_color: "#200538",
  sticker_image: "/images/hero-gifts-sticker.png",
  sticker_alt: "WRAPORA Luxury Celebration Gift Hamper",
  cta_primary: { label: "Plan Your Event", href: "/events#inquire" },
  cta_secondary: { label: "Explore Gifts", href: "/gifts" },
  trust_items: [
    { label: "Worldwide Gift Shipping 🌍" },
    { label: "White-Glove Setup" },
    { label: "100% Bespoke Decor" },
  ],
};

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    title: "Event Planning",
    subtitle: "Bespoke Themes & Coordination",
    image: "/images/service-planning.jpg",
    href: "/events",
  },
  {
    title: "Decor",
    subtitle: "Floral Arches & Fairy Lights",
    image: "/images/service-decor.jpg",
    href: "/events",
  },
  {
    title: "Gifting",
    subtitle: "Artisanal Hampers & Keepsakes",
    image: "/images/service-gifting.jpg",
    href: "/gifts",
  },
  {
    title: "Custom Cakes",
    subtitle: "Designer Tiered & Fondant Bakes",
    image: "/images/service-cake.jpg",
    href: "/events#inquire",
    badge: "Popular",
  },
  {
    title: "Photography",
    subtitle: "Cinematic Keepsakes & Stills",
    image: "/images/service-photo.jpg",
    href: "/gallery",
  },
];

const DEFAULT_STICKER_DRAWER = {
  title: "Curated Gift Hampers",
  tagline: "WRAPORA Atelier Gifting",
  description:
    "Handcrafted celebration boxes with premium champagnes, artisanal treats, and bespoke keepsakes.",
  items: [
    {
      id: "hamp-1",
      name: "The Royal Moët & Praline Atelier Chest",
      slug: "royal-celebration-chest",
      short_description:
        "Moët & Chandon rosé champagne, Godiva celebration pralines, pastel macarons & calligraphy card.",
      price_paise: 449900,
      compare_at_price_paise: 599900,
      image: "/images/hero-gifts-sticker.png",
      badge: "Most Loved",
    },
    {
      id: "hamp-2",
      name: "Golden Velvet Celebration Hamper",
      slug: "golden-velvet-gourmet-hamper",
      short_description:
        "Artisanal gold-leaf truffles, gourmet treats, Himalayan roast nuts & satin bow.",
      price_paise: 299900,
      compare_at_price_paise: 389900,
      image: "/images/hero-celebration.jpg",
      badge: "Bestseller",
    },
    {
      id: "hamp-3",
      name: "Enchanted Bloom & Scent Keepsake",
      slug: "enchanted-bloom-scent-atelier",
      short_description:
        "Blush preserved roses, aromatic luxury soy candle, organic bath salts & gourmet sweets.",
      price_paise: 349900,
      compare_at_price_paise: 429900,
      image: "/images/service-gifting.jpg",
      badge: "Handcrafted",
    },
    {
      id: "hamp-4",
      name: "Velvet Mocha & Cedarwood Duo",
      slug: "velvet-mocha-cedarwood-duo",
      short_description:
        "Single-origin roast coffee, french press, cedarwood candle & artisan leather coasters.",
      price_paise: 389900,
      compare_at_price_paise: 429900,
      image: "/images/service-decor.jpg",
      badge: "Limited Edition",
    },
  ] as ShowcaseHamper[],
};

const DEFAULT_HAMPERS_SECTION = {
  title: "Curated Gift Hampers",
  subtitle:
    "Handcrafted luxury keepsakes with gourmet delights, fine fragrances, and bespoke calligraphy cards.",
  view_all_label: "Explore Full Collection",
  view_all_href: "/gifts",
};

const DEFAULT_ANNOUNCEMENT = {
  text: "✨ Worldwide Shipping on All Luxury Hampers! Complimentary gold-foil calligraphy on bespoke orders.",
  is_visible: true,
  link: "/gifts",
};

const DEFAULT_CONTACT = {
  phone: "+91 70065 06721 / +91 95412 23100",
  whatsapp: "+917006506721",
  email: "shivamkakaal@gmail.com, abhu2680@gmail.com",
  instagram: "@wrapora.luxury",
  location: "Worldwide Gift Shipping 🌍 · Events in Delhi NCR, Chandigarh & Jammu",
};

interface HomepageCustomizerProps {
  initialContent: Record<string, unknown>;
}

export default function HomepageCustomizer({ initialContent }: HomepageCustomizerProps) {
  const [activeTab, setActiveTab] = useState<"hero" | "services" | "sticker" | "hampers" | "announcement" | "contact">("hero");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Hero State
  const initialHero = (initialContent.hero as typeof DEFAULT_HERO) || DEFAULT_HERO;
  const [hero, setHero] = useState({
    headline: initialHero.headline ?? DEFAULT_HERO.headline,
    tagline_badge: initialHero.tagline_badge ?? DEFAULT_HERO.tagline_badge,
    subheadline: initialHero.subheadline ?? DEFAULT_HERO.subheadline,
    background_image: initialHero.background_image ?? DEFAULT_HERO.background_image,
    background_color: initialHero.background_color ?? DEFAULT_HERO.background_color,
    sticker_image: initialHero.sticker_image ?? DEFAULT_HERO.sticker_image,
    sticker_alt: initialHero.sticker_alt ?? DEFAULT_HERO.sticker_alt,
    cta_primary: initialHero.cta_primary ?? DEFAULT_HERO.cta_primary,
    cta_secondary: initialHero.cta_secondary ?? DEFAULT_HERO.cta_secondary,
    trust_items: initialHero.trust_items ?? DEFAULT_HERO.trust_items,
  });

  // Services State
  const initialServices = (initialContent.services_showcase as { title?: string; items?: ServiceItem[] }) || {};
  const [servicesTitle, setServicesTitle] = useState(initialServices.title || "Our Services");
  const [services, setServices] = useState<ServiceItem[]>(
    initialServices.items && initialServices.items.length > 0
      ? initialServices.items
      : DEFAULT_SERVICES
  );

  // Sticker Drawer State
  const initialDrawer = (initialContent.hero_sticker_drawer as typeof DEFAULT_STICKER_DRAWER) || DEFAULT_STICKER_DRAWER;
  const [drawerTitle, setDrawerTitle] = useState(initialDrawer.title ?? DEFAULT_STICKER_DRAWER.title);
  const [drawerTagline, setDrawerTagline] = useState(initialDrawer.tagline ?? DEFAULT_STICKER_DRAWER.tagline);
  const [drawerDescription, setDrawerDescription] = useState(initialDrawer.description ?? DEFAULT_STICKER_DRAWER.description);
  const [drawerHampers, setDrawerHampers] = useState<ShowcaseHamper[]>(
    initialDrawer.items && initialDrawer.items.length > 0
      ? initialDrawer.items
      : DEFAULT_STICKER_DRAWER.items
  );

  // Hampers Section State
  const initialHampersSec = (initialContent.hampers_section as typeof DEFAULT_HAMPERS_SECTION) || DEFAULT_HAMPERS_SECTION;
  const [hampersSection, setHampersSection] = useState(initialHampersSec);

  // Announcement State
  const initialAnnouncement = (initialContent.announcement as typeof DEFAULT_ANNOUNCEMENT) || DEFAULT_ANNOUNCEMENT;
  const [announcement, setAnnouncement] = useState(initialAnnouncement);

  // Contact State
  const initialContact = (initialContent.contact as typeof DEFAULT_CONTACT) || DEFAULT_CONTACT;
  const [contact, setContact] = useState(initialContact);

  // Modals / Editing states
  const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(null);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [serviceFormData, setServiceFormData] = useState<ServiceItem>({
    title: "",
    subtitle: "",
    image: "",
    href: "/events",
    badge: "",
  });

  const [editingHamperIndex, setEditingHamperIndex] = useState<number | null>(null);
  const [hamperModalOpen, setHamperModalOpen] = useState(false);
  const [hamperFormData, setHamperFormData] = useState<ShowcaseHamper>({
    id: "",
    name: "",
    slug: "",
    short_description: "",
    price_paise: 299900,
    compare_at_price_paise: 399900,
    image: "",
    badge: "",
  });

  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // Generic File Upload Handler (supports files up to 10MB)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File exceeds 10MB limit. Image should not be more than 10MB.");
      return;
    }

    setUploadingField(targetField);
    try {
      const formData = new FormData();
      const res = await uploadImageAction(formData);

      if (res.ok && res.url) {
        if (targetField === "hero_bg") {
          setHero((prev) => ({ ...prev, background_image: res.url! }));
        } else if (targetField === "hero_sticker") {
          setHero((prev) => ({ ...prev, sticker_image: res.url! }));
        } else if (targetField === "service_form") {
          setServiceFormData((prev) => ({ ...prev, image: res.url! }));
        } else if (targetField === "hamper_form") {
          setHamperFormData((prev) => ({ ...prev, image: res.url! }));
        }
      } else {
        alert("Upload failed: " + (res.error || "Unknown error"));
      }
    } catch (err: unknown) {
      const error = err as Error;
      alert("Upload error: " + error.message);
    } finally {
      setUploadingField(null);
    }
  };

  // Save All Changes
  const handleSaveAll = async () => {
    setSaving(true);
    setErrorMessage("");
    setSavedSuccess(false);

    try {
      // 1. Save Hero
      const resHero = await saveSiteContent("hero", hero);
      if (!resHero.ok) throw new Error(resHero.error || "Failed to save Hero");

      // 2. Save Services
      const resServices = await saveSiteContent("services_showcase", {
        title: servicesTitle,
        items: services,
      });
      if (!resServices.ok) throw new Error(resServices.error || "Failed to save Services");

      // 3. Save Hero Sticker Drawer
      const resDrawer = await saveSiteContent("hero_sticker_drawer", {
        title: drawerTitle,
        tagline: drawerTagline,
        description: drawerDescription,
        items: drawerHampers,
      });
      if (!resDrawer.ok) throw new Error(resDrawer.error || "Failed to save Sticker Drawer");

      // 4. Save Hampers Section
      const resHampers = await saveSiteContent("hampers_section", hampersSection);
      if (!resHampers.ok) throw new Error(resHampers.error || "Failed to save Hampers Section");

      // 5. Save Announcement
      const resAnnounce = await saveSiteContent("announcement", announcement);
      if (!resAnnounce.ok) throw new Error(resAnnounce.error || "Failed to save Announcement");

      // 6. Save Contact
      const resContact = await saveSiteContent("contact", contact);
      if (!resContact.ok) throw new Error(resContact.error || "Failed to save Contact Info");

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  // Reset to Defaults
  const handleResetToDefaults = () => {
    if (!confirm("Are you sure you want to restore pristine default WRAPORA settings for all sections?")) return;
    setHero(DEFAULT_HERO);
    setServicesTitle("Our Services");
    setServices(DEFAULT_SERVICES);
    setDrawerTitle(DEFAULT_STICKER_DRAWER.title);
    setDrawerTagline(DEFAULT_STICKER_DRAWER.tagline);
    setDrawerDescription(DEFAULT_STICKER_DRAWER.description);
    setDrawerHampers(DEFAULT_STICKER_DRAWER.items);
    setHampersSection(DEFAULT_HAMPERS_SECTION);
    setAnnouncement(DEFAULT_ANNOUNCEMENT);
    setContact(DEFAULT_CONTACT);
  };

  // Service CRUD helpers
  const openNewServiceModal = () => {
    setEditingServiceIndex(null);
    setServiceFormData({
      title: "",
      subtitle: "",
      image: "/images/service-cake.jpg",
      href: "/events",
      badge: "",
    });
    setServiceModalOpen(true);
  };

  const openEditServiceModal = (idx: number) => {
    setEditingServiceIndex(idx);
    setServiceFormData({ ...services[idx] });
    setServiceModalOpen(true);
  };

  const saveServiceModal = () => {
    if (!serviceFormData.title.trim()) {
      alert("Service Title is required");
      return;
    }
    if (editingServiceIndex !== null) {
      const updated = [...services];
      updated[editingServiceIndex] = serviceFormData;
      setServices(updated);
    } else {
      setServices([...services, serviceFormData]);
    }
    setServiceModalOpen(false);
  };

  const deleteService = (idx: number) => {
    if (!confirm(`Are you sure you want to remove "${services[idx].title}"?`)) return;
    setServices(services.filter((_, i) => i !== idx));
  };

  const moveService = (idx: number, direction: "up" | "down") => {
    const target = direction === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= services.length) return;
    const copy = [...services];
    const temp = copy[idx];
    copy[idx] = copy[target];
    copy[target] = temp;
    setServices(copy);
  };

  // Hamper CRUD helpers
  const openNewHamperModal = () => {
    setEditingHamperIndex(null);
    setHamperFormData({
      id: "hamp-" + Date.now(),
      name: "",
      slug: "",
      short_description: "",
      price_paise: 299900,
      compare_at_price_paise: 389900,
      image: "/images/hero-gifts-sticker.png",
      badge: "",
    });
    setHamperModalOpen(true);
  };

  const openEditHamperModal = (idx: number) => {
    setEditingHamperIndex(idx);
    setHamperFormData({ ...drawerHampers[idx] });
    setHamperModalOpen(true);
  };

  const saveHamperModal = () => {
    if (!hamperFormData.name.trim()) {
      alert("Hamper Name is required");
      return;
    }
    const slug =
      hamperFormData.slug.trim() ||
      hamperFormData.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-");

    const payload = { ...hamperFormData, slug };

    if (editingHamperIndex !== null) {
      const updated = [...drawerHampers];
      updated[editingHamperIndex] = payload;
      setDrawerHampers(updated);
    } else {
      setDrawerHampers([...drawerHampers, payload]);
    }
    setHamperModalOpen(false);
  };

  const deleteHamper = (idx: number) => {
    if (!confirm(`Are you sure you want to remove "${drawerHampers[idx].name}"?`)) return;
    setDrawerHampers(drawerHampers.filter((_, i) => i !== idx));
  };

  const moveHamper = (idx: number, direction: "up" | "down") => {
    const target = direction === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= drawerHampers.length) return;
    const copy = [...drawerHampers];
    const temp = copy[idx];
    copy[idx] = copy[target];
    copy[target] = temp;
    setDrawerHampers(copy);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Header & Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-[#D91B60] text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>WRAPORA Studio CMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-playfair text-[#1F1030]">
            Homepage Customizer
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Customize everything on your homepage: hero headline, background image, sticker, services carousel, drawer hampers & trust badges.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-black transition-all"
          >
            <Eye className="w-4 h-4" />
            <span>View Live Site</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </Link>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#D91B60] hover:bg-[#c21453] shadow-md shadow-[#D91B60]/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Publishing..." : "Save & Publish"}</span>
          </button>
        </div>
      </div>

      {/* Success / Error Alerts */}
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-fade-in-up">
          <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-bold text-sm">Homepage Updated Successfully!</p>
            <p className="text-xs text-emerald-700">All changes have been published and the cache has been automatically revalidated.</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="font-bold text-sm">Failed to Save Changes</p>
            <p className="text-xs text-red-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 p-1.5 bg-white rounded-2xl border border-gray-100 shadow-sm no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("hero")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "hero"
              ? "bg-[#250842] text-white shadow"
              : "text-gray-600 hover:text-black hover:bg-gray-50"
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Hero & Sticker</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("services")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "services"
              ? "bg-[#250842] text-white shadow"
              : "text-gray-600 hover:text-black hover:bg-gray-50"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Our Services ({services.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sticker")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "sticker"
              ? "bg-[#250842] text-white shadow"
              : "text-gray-600 hover:text-black hover:bg-gray-50"
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Sticker Drawer ({drawerHampers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("hampers")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "hampers"
              ? "bg-[#250842] text-white shadow"
              : "text-gray-600 hover:text-black hover:bg-gray-50"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Curated Hampers Section</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("announcement")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "announcement"
              ? "bg-[#250842] text-white shadow"
              : "text-gray-600 hover:text-black hover:bg-gray-50"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Announcement Bar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("contact")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "contact"
              ? "bg-[#250842] text-white shadow"
              : "text-gray-600 hover:text-black hover:bg-gray-50"
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>Concierge & Contact</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: HERO SECTION & STICKER                                             */}
      {/* ========================================================================= */}
      {activeTab === "hero" && (
        <div className="space-y-6">
          {/* Live Preview Header Card */}
          <div className="relative rounded-3xl overflow-hidden shadow-lg border border-purple-900/30 p-6 sm:p-10 text-white" style={{ backgroundColor: hero.background_color }}>
            {/* Background image preview */}
            <div className="absolute inset-0 -z-10">
              <img
                src={hero.background_image || "/images/hero-celebration.jpg"}
                alt="Hero background preview"
                className="w-full h-full object-cover object-center opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1E0535]/95 via-[#250842]/85 to-[#1E0535]/70" />
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-pink-200">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF2E93]" />
                  {hero.tagline_badge}
                </span>

                <h2 className="text-3xl sm:text-4xl font-bold font-playfair leading-tight whitespace-pre-line">
                  {hero.headline}
                </h2>

                <p className="text-xs sm:text-sm text-purple-100/80 leading-relaxed">
                  {hero.subheadline}
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <span className="px-5 py-2 rounded-full text-xs font-bold text-white bg-[#D91B60]">
                    {hero.cta_primary?.label || "Plan Your Event"}
                  </span>
                  <span className="px-5 py-2 rounded-full text-xs font-bold text-white bg-[#380E65]/90 border border-white/20">
                    {hero.cta_secondary?.label || "Explore Gifts"}
                  </span>
                </div>
              </div>

              {/* Sticker Preview */}
              <div className="flex flex-col items-center">
                <div className="relative w-44 sm:w-56 h-auto">
                  <img
                    src={hero.sticker_image || "/images/hero-gifts-sticker.png"}
                    alt={hero.sticker_alt}
                    className="w-full h-auto object-contain drop-shadow-2xl animate-float-gentle"
                  />
                </div>
                <span className="text-[11px] text-pink-200/80 font-medium mt-2">
                  ✨ Interactive Sticker (Clickable)
                </span>
              </div>
            </div>
          </div>

          {/* Hero Form Controls */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-[#1F1030] flex items-center gap-2 border-b pb-3">
              <Palette className="w-5 h-5 text-[#D91B60]" />
              <span>Hero Text & Headlines</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Grand Headline */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Hero Headline (Use Enter for line breaks)
                </label>
                <textarea
                  rows={3}
                  value={hero.headline}
                  onChange={(e) => setHero({ ...hero, headline: e.target.value })}
                  placeholder="Making Every&#10;Moment Magical&#10;with WRAPORA"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#D91B60] focus:ring-1 focus:ring-[#D91B60]"
                />
              </div>

              {/* Tagline Badge */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Top Pill Badge Tagline
                </label>
                <input
                  type="text"
                  value={hero.tagline_badge}
                  onChange={(e) => setHero({ ...hero, tagline_badge: e.target.value })}
                  placeholder="Ultra-Luxury Event Styling & Curated Atelier"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#D91B60]"
                />
              </div>

              {/* Background Color */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Hero Background Base Color (Hex)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={hero.background_color}
                    onChange={(e) => setHero({ ...hero, background_color: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0.5"
                  />
                  <input
                    type="text"
                    value={hero.background_color}
                    onChange={(e) => setHero({ ...hero, background_color: e.target.value })}
                    className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm font-mono uppercase"
                  />
                </div>
              </div>

              {/* Subheadline */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Subheadline / Editorial Description
                </label>
                <textarea
                  rows={2}
                  value={hero.subheadline}
                  onChange={(e) => setHero({ ...hero, subheadline: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#D91B60]"
                />
              </div>
            </div>

            {/* Background Image & Sticker Controls */}
            <h3 className="text-lg font-bold text-[#1F1030] flex items-center gap-2 border-b pt-4 pb-3">
              <Upload className="w-5 h-5 text-[#D91B60]" />
              <span>Background & Sticker Images</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Background Image */}
              <div className="space-y-3 p-4 rounded-xl bg-purple-50/40 border border-purple-100">
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Hero Background Image
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                    <img
                      src={hero.background_image || "/images/hero-celebration.jpg"}
                      alt="Bg preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={hero.background_image}
                      onChange={(e) => setHero({ ...hero, background_image: e.target.value })}
                      placeholder="/images/hero-celebration.jpg"
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-mono"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer shadow-xs">
                      <Upload className="w-3.5 h-3.5 text-[#D91B60]" />
                      <span>{uploadingField === "hero_bg" ? "Uploading..." : "Upload New File"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "hero_bg")}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Sticker Image */}
              <div className="space-y-3 p-4 rounded-xl bg-pink-50/40 border border-pink-100">
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Interactive Gift Sticker Image (Transparent PNG / Cutout)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-purple-100/60 border border-purple-200 flex-shrink-0 flex items-center justify-center p-1">
                    <img
                      src={hero.sticker_image || "/images/hero-gifts-sticker.png"}
                      alt="Sticker preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={hero.sticker_image}
                      onChange={(e) => setHero({ ...hero, sticker_image: e.target.value })}
                      placeholder="/images/hero-gifts-sticker.png"
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-mono"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer shadow-xs">
                      <Upload className="w-3.5 h-3.5 text-[#D91B60]" />
                      <span>{uploadingField === "hero_sticker" ? "Uploading..." : "Upload Sticker PNG"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "hero_sticker")}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <h3 className="text-lg font-bold text-[#1F1030] flex items-center gap-2 border-b pt-4 pb-3">
              <ExternalLink className="w-5 h-5 text-[#D91B60]" />
              <span>Call To Action (CTA) Buttons</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary CTA */}
              <div className="space-y-3 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                <span className="text-xs font-bold text-[#D91B60] uppercase tracking-wider block">
                  Primary Button (Pink Gradient)
                </span>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
                  <input
                    type="text"
                    value={hero.cta_primary?.label || ""}
                    onChange={(e) =>
                      setHero({
                        ...hero,
                        cta_primary: { ...hero.cta_primary, label: e.target.value, href: hero.cta_primary?.href || "" },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Link URL</label>
                  <input
                    type="text"
                    value={hero.cta_primary?.href || ""}
                    onChange={(e) =>
                      setHero({
                        ...hero,
                        cta_primary: { ...hero.cta_primary, href: e.target.value, label: hero.cta_primary?.label || "" },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Secondary CTA */}
              <div className="space-y-3 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider block">
                  Secondary Button (Glass Purple)
                </span>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
                  <input
                    type="text"
                    value={hero.cta_secondary?.label || ""}
                    onChange={(e) =>
                      setHero({
                        ...hero,
                        cta_secondary: { ...hero.cta_secondary, label: e.target.value, href: hero.cta_secondary?.href || "" },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Link URL</label>
                  <input
                    type="text"
                    value={hero.cta_secondary?.href || ""}
                    onChange={(e) =>
                      setHero({
                        ...hero,
                        cta_secondary: { ...hero.cta_secondary, href: e.target.value, label: hero.cta_secondary?.label || "" },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <h3 className="text-lg font-bold text-[#1F1030] flex items-center justify-between border-b pt-4 pb-3">
              <span>Trust Badges</span>
              <button
                type="button"
                onClick={() =>
                  setHero({
                    ...hero,
                    trust_items: [...(hero.trust_items || []), { label: "New Trust Badge" }],
                  })
                }
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Badge</span>
              </button>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {hero.trust_items?.map((badge, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 bg-white">
                  <input
                    type="text"
                    value={badge.label}
                    onChange={(e) => {
                      const updated = [...(hero.trust_items || [])];
                      updated[idx] = { label: e.target.value };
                      setHero({ ...hero, trust_items: updated });
                    }}
                    className="flex-1 text-xs font-medium text-gray-800 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = hero.trust_items?.filter((_, i) => i !== idx);
                      setHero({ ...hero, trust_items: updated });
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: OUR SERVICES SHOWCASE                                              */}
      {/* ========================================================================= */}
      {activeTab === "services" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold font-playfair text-[#1F1030]">Our Services Showcase</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Add, edit, reorder or delete services shown in the horizontal slider on the homepage.
              </p>
            </div>

            <button
              type="button"
              onClick={openNewServiceModal}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#D91B60] hover:bg-[#c21453] shadow-md shadow-[#D91B60]/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Service</span>
            </button>
          </div>

          {/* Section Heading Title input */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex items-center gap-3">
            <span className="text-xs font-bold text-gray-700 whitespace-nowrap">Section Title:</span>
            <input
              type="text"
              value={servicesTitle}
              onChange={(e) => setServicesTitle(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-semibold"
            />
          </div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {services.map((service, idx) => (
              <div
                key={idx}
                className="group bg-white rounded-2xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-purple-50 mb-3 border border-purple-100">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {service.badge && (
                      <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full bg-[#D91B60] text-white text-[9px] font-bold">
                        {service.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-[#1F1030] line-clamp-1">{service.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{service.subtitle}</p>
                  <p className="text-[10px] text-purple-700 font-mono mt-1 truncate">Link: {service.href}</p>
                </div>

                {/* Actions */}
                <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveService(idx, "up")}
                      className="p-1 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-30 cursor-pointer"
                      title="Move Left/Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === services.length - 1}
                      onClick={() => moveService(idx, "down")}
                      className="p-1 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-30 cursor-pointer"
                      title="Move Right/Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditServiceModal(idx)}
                      className="p-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteService(idx)}
                      className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: STICKER DRAWER HAMPERS                                             */}
      {/* ========================================================================= */}
      {activeTab === "sticker" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold font-playfair text-[#1F1030]">
                Hero Sticker Unboxing Drawer
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                When someone clicks the gift sticker on the hero, this luxury drawer slides open. Manage the featured hampers displayed inside!
              </p>
            </div>

            <button
              type="button"
              onClick={openNewHamperModal}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#D91B60] hover:bg-[#c21453] shadow-md shadow-[#D91B60]/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Featured Hamper</span>
            </button>
          </div>

          {/* Drawer Header Settings */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Drawer Tagline</label>
              <input
                type="text"
                value={drawerTagline}
                onChange={(e) => setDrawerTagline(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Drawer Title</label>
              <input
                type="text"
                value={drawerTitle}
                onChange={(e) => setDrawerTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Drawer Description</label>
              <input
                type="text"
                value={drawerDescription}
                onChange={(e) => setDrawerDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium"
              />
            </div>
          </div>

          {/* Drawer Hampers List */}
          <div className="space-y-3">
            {drawerHampers.map((hamper, idx) => (
              <div
                key={hamper.id || idx}
                className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 w-full sm:w-auto">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-purple-50 border border-purple-100 flex-shrink-0 flex items-center justify-center p-1">
                    <img
                      src={hamper.image}
                      alt={hamper.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#1F1030]">{hamper.name}</h4>
                      {hamper.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-[#D91B60] text-white text-[9px] font-bold">
                          {hamper.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5 max-w-md">{hamper.short_description}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-bold text-xs text-purple-900">
                        ₹{(hamper.price_paise / 100).toLocaleString("en-IN")}
                      </span>
                      {hamper.compare_at_price_paise && (
                        <span className="text-[10px] text-gray-400 line-through">
                          ₹{(hamper.compare_at_price_paise / 100).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveHamper(idx, "up")}
                    className="p-1.5 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-30 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === drawerHampers.length - 1}
                    onClick={() => moveHamper(idx, "down")}
                    className="p-1.5 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-30 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditHamperModal(idx)}
                    className="p-2 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteHamper(idx)}
                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CURATED HAMPERS SECTION                                            */}
      {/* ========================================================================= */}
      {activeTab === "hampers" && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-xl font-bold font-playfair text-[#1F1030] border-b pb-3">
            Curated Gift Hampers Showcase Section
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Section Title</label>
              <input
                type="text"
                value={hampersSection.title}
                onChange={(e) => setHampersSection({ ...hampersSection, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">View All Button Label</label>
              <input
                type="text"
                value={hampersSection.view_all_label}
                onChange={(e) => setHampersSection({ ...hampersSection, view_all_label: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Section Subtitle</label>
              <textarea
                rows={2}
                value={hampersSection.subtitle}
                onChange={(e) => setHampersSection({ ...hampersSection, subtitle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">View All Link URL</label>
              <input
                type="text"
                value={hampersSection.view_all_href}
                onChange={(e) => setHampersSection({ ...hampersSection, view_all_href: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ANNOUNCEMENT BAR                                                   */}
      {/* ========================================================================= */}
      {activeTab === "announcement" && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-xl font-bold font-playfair text-[#1F1030]">Announcement Top Bar</h2>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={announcement.is_visible}
                onChange={(e) => setAnnouncement({ ...announcement, is_visible: e.target.checked })}
                className="w-4 h-4 text-[#D91B60] rounded focus:ring-[#D91B60]"
              />
              <span className="text-xs font-bold text-gray-700">Display Top Bar</span>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Announcement Text</label>
              <textarea
                rows={2}
                value={announcement.text}
                onChange={(e) => setAnnouncement({ ...announcement, text: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Click Link (Optional)</label>
              <input
                type="text"
                value={announcement.link}
                onChange={(e) => setAnnouncement({ ...announcement, link: e.target.value })}
                placeholder="/gifts"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: CONTACT & CONCIERGE                                                */}
      {/* ========================================================================= */}
      {activeTab === "contact" && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-xl font-bold font-playfair text-[#1F1030] border-b pb-3">
            Concierge & Contact Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">WhatsApp Number (e.g. +919876543210)</label>
              <input
                type="text"
                value={contact.whatsapp}
                onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Phone Number</label>
              <input
                type="text"
                value={contact.phone}
                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Concierge Email</label>
              <input
                type="email"
                value={contact.email}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Instagram Handle</label>
              <input
                type="text"
                value={contact.instagram}
                onChange={(e) => setContact({ ...contact, instagram: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Studio / Atelier Location Text</label>
              <input
                type="text"
                value={contact.location}
                onChange={(e) => setContact({ ...contact, location: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 p-4 px-6 z-40 flex items-center justify-between shadow-lg">
        <button
          type="button"
          onClick={handleResetToDefaults}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restore Default Styling</span>
        </button>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
          >
            Preview Site <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </Link>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#D91B60] hover:bg-[#c21453] shadow-md shadow-[#D91B60]/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Publishing Changes..." : "Save & Publish All"}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT SERVICE                                                 */}
      {/* ========================================================================= */}
      {serviceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl border border-gray-100 space-y-4 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-[#1F1030]">
                {editingServiceIndex !== null ? "Edit Service" : "Add New Service"}
              </h3>
              <button
                type="button"
                onClick={() => setServiceModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Service Title *</label>
                <input
                  type="text"
                  value={serviceFormData.title}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, title: e.target.value })}
                  placeholder="e.g. Custom Cakes"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Subtitle / Short Info</label>
                <input
                  type="text"
                  value={serviceFormData.subtitle}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, subtitle: e.target.value })}
                  placeholder="e.g. Designer Tiered & Fondant Bakes"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Image URL / Upload</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={serviceFormData.image}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, image: e.target.value })}
                    placeholder="/images/service-cake.jpg"
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-xs font-mono"
                  />
                  <label className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer shadow-xs" title="Upload Image">
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "service_form")}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Link URL</label>
                <input
                  type="text"
                  value={serviceFormData.href}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, href: e.target.value })}
                  placeholder="/events#inquire"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Badge Tag (Optional)</label>
                <input
                  type="text"
                  value={serviceFormData.badge || ""}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, badge: e.target.value })}
                  placeholder="e.g. Popular, New, Signature"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setServiceModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveServiceModal}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#D91B60] hover:bg-[#c21453]"
              >
                Save Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT STICKER HAMPER                                          */}
      {/* ========================================================================= */}
      {hamperModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-gray-100 space-y-4 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-[#1F1030]">
                {editingHamperIndex !== null ? "Edit Drawer Hamper" : "Add New Drawer Hamper"}
              </h3>
              <button
                type="button"
                onClick={() => setHamperModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Hamper Name *</label>
                <input
                  type="text"
                  value={hamperFormData.name}
                  onChange={(e) => setHamperFormData({ ...hamperFormData, name: e.target.value })}
                  placeholder="The Royal Moët & Praline Atelier Chest"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Product Slug / URL Path</label>
                <input
                  type="text"
                  value={hamperFormData.slug}
                  onChange={(e) => setHamperFormData({ ...hamperFormData, slug: e.target.value })}
                  placeholder="royal-celebration-chest"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Price in ₹ *</label>
                  <input
                    type="number"
                    value={hamperFormData.price_paise / 100}
                    onChange={(e) => setHamperFormData({ ...hamperFormData, price_paise: Number(e.target.value) * 100 })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Compare Price in ₹ (MRP)</label>
                  <input
                    type="number"
                    value={hamperFormData.compare_at_price_paise ? hamperFormData.compare_at_price_paise / 100 : ""}
                    onChange={(e) =>
                      setHamperFormData({
                        ...hamperFormData,
                        compare_at_price_paise: e.target.value ? Number(e.target.value) * 100 : undefined,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={hamperFormData.short_description}
                  onChange={(e) => setHamperFormData({ ...hamperFormData, short_description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Image URL / Upload</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={hamperFormData.image}
                    onChange={(e) => setHamperFormData({ ...hamperFormData, image: e.target.value })}
                    placeholder="/images/hero-gifts-sticker.png"
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-xs font-mono"
                  />
                  <label className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer shadow-xs" title="Upload Image">
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "hamper_form")}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Badge (e.g. Most Loved, Bestseller)</label>
                <input
                  type="text"
                  value={hamperFormData.badge || ""}
                  onChange={(e) => setHamperFormData({ ...hamperFormData, badge: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setHamperModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveHamperModal}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#D91B60] hover:bg-[#c21453]"
              >
                Save Hamper
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
