import { createAdminClient } from "@/lib/supabase/admin";
import TestimonialManager from "@/components/admin/TestimonialManager";
import type { Testimonial } from "@/lib/supabase/types";
import { getTestimonialsLocal } from "@/lib/db/local_store";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  let testimonials = getTestimonialsLocal();

  if (testimonials.length === 0) {
    try {
      const supabase = createAdminClient();
      const { data } = await supabase
        .from("testimonials")
        .select("*")
        .order("sort_order", { ascending: true });
      if (data && data.length > 0) {
        testimonials = data as Testimonial[];
      }
    } catch {
      // ignore
    }
  }

  return <TestimonialManager initialTestimonials={testimonials} />;
}
