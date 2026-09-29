import AnnouncementsManager from "@/components/admin/AnnouncementsManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Announcements & Broadcasts | WRAPORA Admin",
  description: "Send instant web push notifications and announcements to installed app users and clients.",
};

export default function AdminAnnouncementsPage() {
  return <AnnouncementsManager />;
}
