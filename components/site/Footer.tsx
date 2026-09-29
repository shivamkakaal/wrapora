import Link from "next/link";
import { Heart, Mail, Phone, MapPin } from "lucide-react";
import RaporaLogo from "./RaporaLogo";

export default function Footer() {
  return (
    <footer className="bg-royal-900 text-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block">
              <RaporaLogo size="lg" variant="light" />
            </Link>
            <p className="mt-4 text-sm text-white/60 leading-relaxed">
              Ultra-premium event planning and luxury gifting atelier.
              We create enchanting atmosphere and unforgettable keepsakes.
            </p>
          </div>

          {/* Explore & Services - Side by Side on Mobile */}
          <div className="grid grid-cols-2 gap-4 sm:gap-8 md:contents">
            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3 sm:mb-4">
                Explore
              </h3>
              <ul className="space-y-2 sm:space-y-2.5">
                {[
                  { href: "/events", label: "Event Services" },
                  { href: "/gifts", label: "Gift Store" },
                  { href: "/gallery", label: "Portfolio Gallery" },
                  { href: "/account", label: "Track Order" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs sm:text-sm text-white/70 hover:text-magenta-300 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3 sm:mb-4">
                Services
              </h3>
              <ul className="space-y-2 sm:space-y-2.5">
                {[
                  "Birthday Celebrations",
                  "Anniversary Soirées",
                  "Baby Shower Styling",
                  "Corporate Gifting",
                  "Custom Hampers",
                ].map((s) => (
                  <li key={s}>
                    <span className="text-xs sm:text-sm text-white/70">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Get in Touch
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-white/70">
                <Phone className="w-4 h-4 mt-1 text-[#FF2E93] flex-shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <a href="tel:+917006506721" className="hover:text-white transition-colors">
                    +91 70065 06721
                  </a>
                  <a href="tel:+919541223100" className="hover:text-white transition-colors">
                    +91 95412 23100
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-white/70">
                <Mail className="w-4 h-4 mt-1 text-[#FF2E93] flex-shrink-0" />
                <div className="flex flex-col gap-0.5 break-all">
                  <a href="mailto:shivamkakaal@gmail.com" className="hover:text-white transition-colors">
                    shivamkakaal@gmail.com
                  </a>
                  <a href="mailto:abhu2680@gmail.com" className="hover:text-white transition-colors">
                    abhu2680@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-white/70">
                <svg className="w-4 h-4 mt-0.5 text-[#25D366] flex-shrink-0 fill-current" viewBox="0 0 24 24">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67ZM8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7 8.5 7 9.74C7 10.98 7.9 12.18 8.03 12.35C8.15 12.52 9.78 15.02 12.27 16.1C12.86 16.36 13.32 16.51 13.68 16.63C14.28 16.82 14.82 16.79 15.25 16.73C15.73 16.66 16.73 16.12 16.94 15.53C17.15 14.94 17.15 14.43 17.09 14.33C17.03 14.23 16.86 14.17 16.61 14.04C16.36 13.92 15.13 13.31 14.9 13.23C14.67 13.15 14.51 13.11 14.34 13.36C14.18 13.61 13.71 14.17 13.56 14.33C13.42 14.5 13.27 14.52 13.02 14.39C12.77 14.27 11.97 14.01 11.02 13.16C10.28 12.5 9.78 11.69 9.63 11.44C9.49 11.19 9.61 11.06 9.74 10.93C9.85 10.82 9.99 10.64 10.12 10.49C10.24 10.34 10.28 10.23 10.36 10.06C10.45 9.9 10.4 9.75 10.34 9.63C10.28 9.5 9.79 8.3 9.59 7.8C9.39 7.32 9.18 7.39 9.03 7.38C8.88 7.37 8.71 7.33 8.53 7.33Z" />
                </svg>
                <a
                  href="https://wa.me/917006506721?text=Hello%20WRAPORA%2C%20I%20would%20like%20to%20inquire%20about%20your%20luxury%20services!"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-300 transition-colors font-medium"
                >
                  WhatsApp: +91 70065 06721
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-white/70">
                <MapPin className="w-4 h-4 mt-0.5 text-[#FF2E93] flex-shrink-0" />
                <span>Worldwide Gift Shipping 🌍 · Events across India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} WRAPORA Luxury Events & Gifting. All rights reserved.
          </p>
          <p className="flex items-center gap-1 text-xs text-white/40">
            Crafted with <Heart className="w-3 h-3 text-magenta fill-magenta" /> in India
          </p>
        </div>
      </div>
    </footer>
  );
}
