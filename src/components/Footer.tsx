"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone, MessageSquare, Clock } from "lucide-react";
import { getAssetPath } from "@/lib/getAssetPath";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        if (href === "#home") {
          window.scrollTo({ top: 0, behavior: "smooth" });
          window.history.pushState(null, "", window.location.pathname);
          return;
        }
        const headerEl = document.querySelector("header");
        const navbarHeight = headerEl ? headerEl.getBoundingClientRect().height + 16 : 96;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 12;
        window.scrollTo({
          top: Math.max(0, targetPosition),
          behavior: "smooth",
        });
        window.history.pushState(null, "", href);
      } else {
        e.preventDefault();
        window.location.href = getAssetPath(`/${href}`);
      }
    }
  };

  return (
    <footer className="w-full bg-[#0F172A] text-white/90 pt-20 pb-10 border-t border-white/5 relative overflow-hidden">
      {/* Top Brand Color Stripe */}
      <div className="w-full h-1.5 bg-gradient-to-r from-[#E71B1E] via-[#d6171a] to-[#0AA8DE] absolute top-0 left-0" />

      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#E71B1E]/15 blur-[150px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#0AA8DE]/10 blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        {/* Brand Column */}
        <div className="flex flex-col gap-6">
          <a
            href="#home"
            onClick={(e) => handleLinkClick(e, "#home")}
            className="flex items-center gap-3.5 group cursor-pointer flex-wrap sm:flex-nowrap"
          >
            <div className="relative w-[130px] sm:w-[140px] h-[36px] sm:h-[40px] shrink-0 bg-white rounded-lg px-1.5 py-1 flex items-center justify-center shadow-sm">
              <Image
                src={getAssetPath("/sameeksha-logo.png")}
                alt="Sameeksha Superspeciality Dental Hospital & Implant Center"
                fill
                className="object-contain p-0.5"
                unoptimized
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-heading font-extrabold text-sm sm:text-base tracking-tight text-white leading-tight">
                Sameeksha Superspeciality
              </span>
              <span className="font-sans font-medium text-[10px] sm:text-xs tracking-normal text-[#0AA8DE] leading-tight mt-0.5">
                Dental Hospital & Implant Center
              </span>
            </div>
          </a>
          <p className="text-white/60 text-sm leading-relaxed max-w-sm text-left">
            Transforming Smiles, Transforming Lives. Professional and personalized dental care in a modern and comfortable environment.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-[12px] bg-[#0AA8DE]/10 text-white/90 px-3.5 py-1 rounded-full font-medium border border-[#0AA8DE]/30 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#0AA8DE]" />
              Hours: Monday – Saturday: 9:00 AM – 8:00 PM (Sunday: Closed)
            </span>
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="flex flex-col gap-5 text-left">
          <h4 className="font-heading font-bold text-base text-white tracking-wide uppercase flex items-center gap-2">
            Navigation
            <span className="w-1.5 h-1.5 rounded-full bg-[#0AA8DE]" />
          </h4>
          <ul className="flex flex-col gap-3.5 text-sm text-white/60">
            {[
              { name: "Home", href: "#home" },
              { name: "Services", href: "#services" },
              { name: "About", href: "#about" },
              { name: "Blog", href: "#blog" },
              { name: "Contact", href: "#contact" },
              { name: "Book Appointment", href: "#appointment" },
            ].map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="hover:text-[#E71B1E] transition-colors duration-200"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Services Column */}
        <div className="flex flex-col gap-5 text-left">
          <h4 className="font-heading font-bold text-base text-white tracking-wide uppercase flex items-center gap-2">
            Services
            <span className="w-1.5 h-1.5 rounded-full bg-[#0AA8DE]" />
          </h4>
          <ul className="flex flex-col gap-3.5 text-sm text-white/60">
            {[
              { name: "Root Canal Treatment", href: "#services" },
              { name: "Cavity Inspection", href: "#services" },
              { name: "Dental Implants", href: "#services" },
              { name: "Orthodontics", href: "#services" },
              { name: "Teeth Alignment", href: "#services" },
              { name: "Cosmetic Dentistry", href: "#services" },
            ].map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="hover:text-[#E71B1E] transition-colors duration-200"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Column */}
        <div className="flex flex-col gap-5 text-left">
          <h4 className="font-heading font-bold text-base text-white tracking-wide uppercase flex items-center gap-2">
            Contact Us
            <span className="w-1.5 h-1.5 rounded-full bg-[#0AA8DE]" />
          </h4>
          <div className="flex flex-col gap-4 text-sm text-white/60">
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-[#E71B1E] shrink-0 mt-0.5" />
              <div className="flex flex-col text-left">
                <span className="leading-relaxed">
                  CHOWDARY GUEST HOUSE, GROUND FLOOR, NEAR RTC COLONY 4 ROAD JUNCTION, ROAD, NEAR KAVERI BUS PARKING, Ramanayapeta, Ramanayyapeta, Andhra Pradesh 533005
                </span>
                <span className="text-xs text-white/50 mt-1 font-medium">
                  X6VX+R3 Ramanayyapeta, Andhra Pradesh
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Phone className="w-5 h-5 text-[#E71B1E] shrink-0 mt-0.5" />
              <a href="tel:08885999857" className="hover:text-[#E71B1E] transition-colors">
                088859 99857
              </a>
            </div>
            <div className="flex gap-3">
              <Mail className="w-5 h-5 text-[#E71B1E] shrink-0 mt-0.5" />
              <a
                href="mailto:sameekshadentalhospital@gmail.com"
                className="hover:text-[#E71B1E] transition-colors"
              >
                sameekshadentalhospital@gmail.com
              </a>
            </div>
            <div className="flex gap-3">
              <MessageSquare className="w-5 h-5 text-[#25D366] shrink-0 mt-0.5" />
              <a
                href="https://wa.me/918885999857"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#25D366] transition-colors"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-white/10 max-w-[1440px] mx-auto px-6 md:px-12" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40 text-center md:text-left">
        <p>© {currentYear} Sameeksha Superspeciality Dental Hospital & Implant Center. All rights reserved.</p>
        <p className="text-white/40 flex items-center justify-center gap-1.5">
          <Image
            src={getAssetPath("/jk-logo.png")}
            alt="JK & Co."
            width={18}
            height={18}
            className="w-[18px] h-[18px] object-contain shrink-0"
            unoptimized
          />
          <span>Designed and Managed by JK & Co.</span>
        </p>
        <div className="flex items-center justify-center gap-6">
          <Link href="/privacy-policy" className="hover:text-[#E71B1E] transition-colors duration-200">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="hover:text-[#E71B1E] transition-colors duration-200">
            Terms of Service
          </Link>
          <a href="#" className="hover:text-[#E71B1E] transition-colors duration-200">
            Sitemap
          </a>
          <Link
            href="/login"
            className="hover:text-[#E71B1E] transition-colors duration-200 opacity-70 hover:opacity-100"
          >
            Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
