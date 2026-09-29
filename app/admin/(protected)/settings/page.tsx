import { createAdminClient } from "@/lib/supabase/admin";
import SettingsManager from "@/components/admin/SettingsManager";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = createAdminClient();
  const { data: rows } = await supabase.from("settings").select("*");

  const settingsMap: Record<string, unknown> = {};
  (rows || []).forEach((r) => {
    settingsMap[r.key] = r.value;
  });

  return <SettingsManager initialSettings={settingsMap} />;
}
