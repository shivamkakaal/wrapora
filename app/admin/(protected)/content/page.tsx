import { getAllSiteContent } from "@/lib/actions/admin";
import HomepageCustomizer from "@/components/admin/HomepageCustomizer";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const contentMap = await getAllSiteContent();
  return <HomepageCustomizer initialContent={contentMap} />;
}
