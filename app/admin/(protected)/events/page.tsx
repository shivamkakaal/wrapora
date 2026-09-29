import { createAdminClient } from "@/lib/supabase/admin";
import EventServiceManager from "@/components/admin/EventServiceManager";
import type { EventService } from "@/lib/supabase/types";
import { getEventServicesLocal } from "@/lib/db/local_store";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  let services = getEventServicesLocal();

  if (services.length === 0) {
    try {
      const supabase = createAdminClient();
      const { data } = await supabase
        .from("event_services")
        .select("*")
        .order("sort_order", { ascending: true });
      if (data && data.length > 0) {
        services = data as EventService[];
      }
    } catch {
      // ignore
    }
  }

  return <EventServiceManager initialServices={services} />;
}
