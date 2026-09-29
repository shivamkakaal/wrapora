import { getGalleryItems } from "@/lib/supabase/queries";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio Gallery | WRAPORA — Our Work",
  description: "Browse our portfolio of luxury event decor, themed celebrations, and curated gifting experiences.",
};

export const revalidate = 60;

export default async function GalleryPage() {
  const items = await getGalleryItems();

  const eventTypes = [
    { value: "all", label: "All" },
    { value: "birthday", label: "Birthdays" },
    { value: "anniversary", label: "Anniversaries" },
    { value: "intimate_gathering", label: "Gatherings" },
    { value: "baby_shower", label: "Baby Showers" },
    { value: "corporate", label: "Corporate" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold font-playfair text-ink">
          Our <span className="brand-gradient-text">Portfolio</span>
        </h1>
        <p className="mt-3 text-ink/60 max-w-xl mx-auto">
          A visual journey through the enchanting worlds we&apos;ve brought to life.
        </p>
      </div>

      {/* Masonry Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {items.map((item, i) => (
          <div
            key={item.id}
            className="break-inside-avoid group relative rounded-2xl overflow-hidden bg-royal-50 shadow-sm hover:shadow-royal transition-all"
          >
            <img
              src={item.image_url}
              alt={item.title || "Gallery photo"}
              className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              style={{ aspectRatio: item.width && item.height ? `${item.width}/${item.height}` : "4/3" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              {item.title && <p className="text-white font-semibold text-sm">{item.title}</p>}
              {item.caption && <p className="text-white/70 text-xs mt-0.5">{item.caption}</p>}
              {item.event_type && (
                <span className="inline-block mt-2 px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full">
                  {item.event_type.replace(/_/g, " ")}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
