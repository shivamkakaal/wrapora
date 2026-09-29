import { ArrowRight } from "lucide-react";
import { getEventServices } from "@/lib/supabase/queries";
import { formatPaiseToInr } from "@/lib/utils/format";
import EventInquiryForm from "@/components/site/EventInquiryForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Services | WRAPORA — Luxury Event Planning & Decor",
  description: "From milestone birthdays to fairy-tale anniversaries, WRAPORA creates enchanting event experiences with themed decor and concierge planning.",
};

export const revalidate = 60;

export default async function EventsPage() {
  const services = await getEventServices();

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-24 sm:pt-28 md:pt-32 pb-14 md:pb-24 brand-gradient text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-magenta/20 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-playfair animate-fade-in-up">
            Curate Your Dream Celebration
          </h1>
          <p className="mt-5 text-white/80 text-lg max-w-2xl mx-auto animate-fade-in-up stagger-1">
            From dramatic balloon arches to candlelit fairy-tale settings — our creative team turns your vision into a breathtaking reality.
          </p>
          <a
            href="#inquire"
            className="inline-flex items-center gap-2 mt-8 px-8 py-3.5 bg-white text-royal rounded-full font-semibold text-sm shadow-lg hover:-translate-y-0.5 transition-all animate-fade-in-up stagger-2"
          >
            Start Planning <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold font-playfair text-ink">
            Our <span className="brand-gradient-text">Services</span>
          </h2>
          <p className="mt-4 text-ink/60 text-lg">
            Handcrafted celebrations for every milestone.
          </p>
        </div>

        <div className="space-y-8">
          {services.map((svc, i) => (
            <div
              key={svc.id}
              className={`flex flex-col ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} gap-8 bg-white rounded-2xl overflow-hidden border border-royal-100/50 shadow-sm hover:shadow-royal transition-all`}
            >
              <div className="md:w-2/5 aspect-[4/3] md:aspect-auto overflow-hidden">
                <img
                  src={svc.cover_image || "https://placehold.co/600x400/3B0764/FFFFFF?text=Event"}
                  alt={svc.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="md:w-3/5 p-5 sm:p-8 md:p-10 flex flex-col justify-center">
                <span className="inline-block w-fit px-3 py-1 bg-royal-50 text-royal text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                  {svc.type.replace(/_/g, " ")}
                </span>
                <h3 className="text-2xl font-bold font-playfair text-ink">{svc.title}</h3>
                <p className="mt-3 text-ink/60 leading-relaxed">{svc.summary}</p>
                {svc.features && svc.features.length > 0 && (
                  <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {svc.features.map((f, fIdx) => (
                      <li key={`${svc.id}-feat-${fIdx}`} className="flex items-start gap-2 text-sm text-ink/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-magenta mt-1.5 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
                {svc.starting_price_paise && (
                  <p className="mt-4 text-royal font-semibold">
                    Starting from {formatPaiseToInr(svc.starting_price_paise)}
                  </p>
                )}
                <a
                  href="#inquire"
                  className="inline-flex items-center gap-2 mt-6 w-fit px-6 py-2.5 brand-gradient text-white rounded-full font-medium text-sm hover:opacity-90 transition-opacity shadow-royal"
                >
                  Enquire Now <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Inquiry Form */}
      <section id="inquire" className="py-20 bg-gradient-to-b from-cream to-royal-50/30 scroll-mt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold font-playfair text-ink">
              Plan Your <span className="brand-gradient-text">Event</span>
            </h2>
            <p className="mt-3 text-ink/60">
              Fill in the details below and our concierge team will get back to you within 24 hours.
            </p>
          </div>
          <EventInquiryForm services={services} />
        </div>
      </section>
    </div>
  );
}
