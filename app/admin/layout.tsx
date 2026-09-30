import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#1F0838",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "WRAPORA Admin Console",
    template: "%s | WRAPORA Admin",
  },
  description: "WRAPORA Executive Management, Real-Time Orders, Leads & Broadcast Push Control",
  manifest: "/manifest-admin.webmanifest",
  icons: {
    icon: [
      { url: "/icons/admin-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/admin-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/admin-apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WRAPORA Admin",
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
