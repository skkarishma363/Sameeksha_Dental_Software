"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Phone, Menu, X } from "lucide-react";
import { getAssetPath } from "@/lib/getAssetPath";

const NAV_ITEMS = [
  { name: "Home", href: "#home" },
  { name: "About Us", href: "#about" },
  { name: "Our Services", href: "#services" },
  { name: "Gallery", href: "#gallery" },
  { name: "Testimonials", href: "#testimonials" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("home");

  useEffect(() => {
    const sectionIds = ["home", "about", "services", "gallery", "testimonials", "contact"];
    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    });

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash;
      setTimeout(() => {
        const target = document.querySelector(hash);
        if (target) {
          const navbarHeight = 100;
          const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
          window.scrollTo({
            top: Math.max(0, targetPosition),
            behavior: "smooth",
          });
        }
      }, 150);
    }
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMobileMenuOpen(false);

    if (href === "#home") {
      const homeEl = document.getElementById("home");
      if (homeEl) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        window.history.pushState(null, "", window.location.pathname);
      } else {
        e.preventDefault();
        window.location.href = getAssetPath("/");
      }
      return;
    }

    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const navbarHeight = 100;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
      window.scrollTo({
        top: Math.max(0, targetPosition),
        behavior: "smooth",
      });
      window.history.pushState(null, "", href);
    } else {
      e.preventDefault();
      window.location.href = getAssetPath(`/${href}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full shadow-xs">
      {/* 1. Thin Red Top Gradient Strip */}
      <div className="w-full h-8 bg-gradient-to-r from-[#c41215] via-[#E71B1E] to-[#0AA8DE] text-white flex items-center justify-end px-6 md:px-12 lg:px-20 text-xs font-medium tracking-wide" />

      {/* 2. Main White Navigation Bar */}
      <div className="w-full bg-white relative h-[72px] flex items-center">
        <div className="max-w-[1360px] mx-auto w-full px-6 md:px-12 lg:px-20 flex items-center justify-between">
          
          {/* Sameeksha Super Speciality Dental Hospital Logo */}
          <div className="relative z-20 shrink-0 flex items-center">
            <a
              href="#home"
              onClick={(e) => scrollToSection(e, "#home")}
              className="flex items-center transition-transform hover:scale-[1.02] py-1"
            >
              <div className="relative w-[170px] sm:w-[200px] md:w-[230px] lg:w-[250px] h-[48px] sm:h-[54px] md:h-[58px] lg:h-[62px]">
                <Image
                  src={getAssetPath("/sameeksha-logo.png")}
                  alt="Sameeksha Super Speciality Dental Hospital"
                  fill
                  className="object-contain object-left"
                  priority
                  unoptimized
                />
              </div>
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-9 ml-auto mr-8">
            {NAV_ITEMS.map((item) => {
              const itemId = item.href.replace("#", "");
              const isActive = activeSection === itemId;

              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => scrollToSection(e, item.href)}
                  className={`relative text-[15px] font-bold transition-colors duration-200 py-1 ${
                    isActive ? "text-[#E71B1E]" : "text-[#1e293b] hover:text-[#E71B1E]"
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#E71B1E] rounded-full" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Contact Us Button */}
          <div className="hidden lg:block shrink-0">
            <a
              href="tel:08885999857"
              className="inline-flex items-center justify-center px-6 py-2.5 text-[15px] font-bold text-white bg-[#E71B1E] hover:bg-[#c41215] rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
            >
              Contact Us
            </a>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex lg:hidden items-center gap-3">
            <a
              href="tel:08885999857"
              className="px-4 py-2 text-xs font-bold text-white bg-[#E71B1E] hover:bg-[#c41215] rounded-lg shadow-xs"
            >
              Contact Us
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-[#E71B1E] transition-colors"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden w-full bg-white border-b border-slate-200 shadow-xl px-6 py-5 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-3">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => scrollToSection(e, item.href)}
                className="py-2 text-base font-semibold text-slate-800 hover:text-[#E71B1E] transition-colors border-b border-slate-100"
              >
                {item.name}
              </a>
            ))}
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <a
              href="tel:08885999857"
              className="flex items-center gap-2 text-xs text-slate-700 font-semibold hover:text-[#E71B1E] transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#E71B1E]" />
              <span>088859 99857</span>
            </a>
            <a
              href="#contact"
              onClick={(e) => scrollToSection(e, "#contact")}
              className="w-full py-2.5 text-center text-sm font-bold text-white bg-gradient-to-r from-[#E71B1E] to-[#c41215] rounded-lg shadow-sm"
            >
              Get Online Consultancy
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
