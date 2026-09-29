import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import CartDrawer from "@/components/site/CartDrawer";
import WhatsAppWidget from "@/components/site/WhatsAppWidget";
import PwaRegister from "@/components/site/PwaRegister";
import MobileBottomNav from "@/components/site/MobileBottomNav";
import NotificationPrompt from "@/components/site/NotificationPrompt";
import PushAutoEnrollment from "@/components/site/PushAutoEnrollment";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main id="main-content" className="flex-1 pb-16 md:pb-0">
        {children}
      </main>
      <Footer />
      <WhatsAppWidget />
      <MobileBottomNav />
      <PwaRegister />
      <PushAutoEnrollment />
      <NotificationPrompt />
    </>
  );
}
