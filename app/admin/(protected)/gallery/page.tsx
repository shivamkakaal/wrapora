import { createAdminClient } from "@/lib/supabase/admin";
import GalleryManager from "@/components/admin/GalleryManager";
import type { GalleryItem } from "@/lib/supabase/types";
import { getGalleryItemsLocal } from "@/lib/db/local_store";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  let items = getGalleryItemsLocal();

  if (items.length === 0) {
    try {
      const supabase = createAdminClient();
      const { data } = await supabase
        .from("gallery_items")
        .select("*")
        .order("created_at", { ascending: false });
      if (data && data.length > 0) {
        items = data as GalleryItem[];
      }
    } catch {
      // ignore
    }
  }

  return <GalleryManager initialItems={items} />;
}
