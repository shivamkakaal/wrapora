import type { Metadata } from "next";
import AccountView from "@/components/site/AccountView";

export const metadata: Metadata = {
  title: "My Account & Orders | WRAPORA Luxury Gifting",
  description: "Track your WRAPORA orders in 1 step, view order history, and access client concierge services.",
};

export default function AccountPage() {
  return <AccountView />;
}
