"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Star, StarHalf } from "lucide-react";
import { getAssetPath } from "@/lib/getAssetPath";

interface TestimonialCardData {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  quote: string;
}

const TESTIMONIALS_DATA: TestimonialCardData[] = [
  {
    id: 1,
    name: "K Ksrkraju",
    avatar: "/figma/avatar_srinivas.png",
    rating: 4.5,
    quote:
      "Highly recommended for dental care.\n\nI recently had a root canal treatment done here, and it was a smooth experience. The hospital maintains excellent hygiene, and all the tools used by the staff were completely clean and sanitized.\n\nThe staff is incredibly friendly and cooperative, which makes you feel right at ease. A special shout-out to the doctor, who took the time to explain the entire procedure so patiently. Overall, a great experience—giving it a solid 4.5 out of 5.",
  },
  {
    id: 2,
    name: "Dyva Kumari Ranganadham",
    avatar: "/figma/avatar_bhargav.png",
    rating: 5,
    quote:
      "Had a really good experience here. Got my scaling, root planing, and wisdom tooth extraction done at Sameeksha Multi Speciality Hospital. The dentist was patient, gentle, and explained everything clearly so there were no surprises. Everything was hygienic and well-organized, and my recovery has been very smooth. Highly recommend this place to anyone needing dental work.",
  },
  {
    id: 3,
    name: "Dyva Kumari Ranganadham",
    avatar: "/figma/avatar_valibaba.png",
    rating: 5,
    quote:
      "I had a very positive experience with Dr. Suvarna Raju, who demonstrated exceptional patience and a gentle approach while treating patients. The entire treatment process was handled smoothly and comfortably, with great care taken to ensure it was virtually pain-free. Dr. Suvarna Raju’s polite attitude and reasonable treatment costs are truly commendable.\n\nI am highly satisfied with the treatment received. The clinic also provides excellent patient care and follow-up services. The reception team was very attentive, making post-treatment verification calls to check on my well-being, which reflects their dedication to patient satisfaction.",
  },
];

// Append first 3 items as clones for seamless infinite looping
const EXTENDED_TESTIMONIALS = [
  ...TESTIMONIALS_DATA,
  ...TESTIMONIALS_DATA.slice(0, 3),
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Responsive items count
  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerPage(3);
      } else if (window.innerWidth >= 768) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(1);
      }
    };
    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  // Pause when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Handle transition end for seamless infinite loop
  const handleTransitionEnd = useCallback(() => {
    if (currentIndex >= TESTIMONIALS_DATA.length) {
      setIsTransitioning(false);
      setCurrentIndex(0);
    }
  }, [currentIndex]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 50) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
    } else if (diff < -50 && currentIndex > 0) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev - 1);
    }
    setTouchStart(null);
  };

  const translatePercent = currentIndex * (100 / itemsPerPage);

  return (
    <section
      id="testimonials"
      className="py-20 lg:py-28 relative overflow-hidden bg-[#f0f9fc]"
    >
      {/* Large subtle white decorative circle on right side */}
      <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border-[100px] border-white/60 pointer-events-none select-none z-0" />

      <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        
        {/* Header (Top Left Aligned) */}
        <div className="max-w-xl text-left mb-12 lg:mb-14">
          {/* Label with accent blue underline under TESTIMONIALS */}
          <div className="mb-3">
            <span className="relative inline-block text-xs md:text-sm font-bold tracking-[0.16em] uppercase pb-1 text-[#0f2942]">
              <span className="relative text-[#E71B1E]">
                TESTIMONIALS
                <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#0AA8DE] rounded-full" />
              </span>
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#0f2942] tracking-tight leading-[1.18]">
            Smiles That Speak for<br />
            <span className="text-[#E71B1E]">Themselves</span>
          </h2>
        </div>

        {/* Carousel Container (Auto-advances smoothly every 5 seconds) */}
        <div
          className="max-w-[1160px] mx-auto overflow-hidden py-4 -my-4"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex -mx-3 items-stretch"
            style={{
              transform: `translate3d(-${translatePercent}%, 0, 0)`,
              transition: isTransitioning
                ? "transform 700ms cubic-bezier(0.25, 1, 0.5, 1)"
                : "none",
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {EXTENDED_TESTIMONIALS.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="w-full md:w-1/2 lg:w-1/3 px-3 shrink-0 flex"
              >
                <div className="w-full bg-white rounded-2xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(231,27,30,0.06)] border border-[#E71B1E]/20 hover:border-[#E71B1E] flex flex-col justify-between text-left hover:shadow-xl transition-all duration-300 h-full relative group">
                  {/* Accent bar & Review Quote */}
                  <div>
                    <div className="w-8 h-1 bg-[#E71B1E] rounded-full mb-3" />
                    <div className="space-y-2 sm:space-y-2.5 text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal mb-6">
                      {item.quote.split("\n\n").map((para, pIdx) => (
                        <p key={pIdx}>{para}</p>
                      ))}
                    </div>
                  </div>

                  {/* Author & Rating */}
                  <div className="flex items-center gap-3.5 pt-4 border-t border-slate-100">
                    <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border-2 border-[#0AA8DE]">
                      <Image
                        src={getAssetPath(item.avatar)}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex flex-col">
                      <h4 className="font-bold text-sm text-[#0f2942] leading-tight">
                        {item.name}
                      </h4>
                      {/* Rating Stars */}
                      <div
                        className="flex text-[#E71B1E] gap-0.5 mt-1 items-center"
                        aria-label={`${item.rating} out of 5 stars`}
                      >
                        {[1, 2, 3, 4, 5].map((star) => {
                          if (item.rating >= star) {
                            return (
                              <Star
                                key={star}
                                className="w-3.5 h-3.5 fill-current stroke-current"
                              />
                            );
                          } else if (item.rating >= star - 0.5) {
                            return (
                              <div
                                key={star}
                                className="relative w-3.5 h-3.5 inline-block"
                              >
                                <Star className="w-3.5 h-3.5 fill-none stroke-current" />
                                <StarHalf className="w-3.5 h-3.5 fill-current stroke-current absolute top-0 left-0" />
                              </div>
                            );
                          } else {
                            return (
                              <Star
                                key={star}
                                className="w-3.5 h-3.5 fill-none stroke-current opacity-30"
                              />
                            );
                          }
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Center "View All" Button */}
        <div className="mt-12 lg:mt-14 text-center">
          <a
            href="https://www.google.com/search?q=sameeksha+dental+hospital&rlz=1C1ONGR_en-GBIN1218IN1220&sca_esv=306360304c71a31f&biw=1707&bih=862&sxsrf=APpeQnteMVAGiiKtFfm7oUsm6Rdhk8sqMA%3A1789897198193&ei=7qmvaoynC4-UseMPm96-0A8&gs_ssp=eJzj4tVP1zc0TKoqSUmqTK4wYLRSNagwTjS2MLIwSTZMMkozT05JsTKoME4zTDZPszBMTDNNTbI0TvWSLE7MTU3NLs5IVEhJzStJzFHIyC8uyCxJzAEA97IaSA&oq=sameeksha+&gs_lp=Egxnd3Mtd2l6LXNlcnAiCnNhbWVla3NoYSAqCwgCGIAEGMcBGK8BMgoQABiABBiKBRhDMhAQLhiABBiKBRhDGMcBGK8BMgsQLhiABBjHARivATIFEC4YgAQyBRAuGIAEMgUQABiABDIFEAAYgAQyChAAGIAEGIoFGEMyBRAAGIAEMgUQABiABEjXNVDOAljYGXABeAGQAQCYAZoBoAHoBqoBAzUuM7gBAcgBAPgBAZgCCKACiwfCAgYQABgWGB6YAwCIBgGSBwMzLjWgB7tPsgcDMy41uAeLB8IHBzAuNy4wLjHIBxiACAE&sclient=gws-wiz-serp#lrd=0x3a38284c1b2f7cdd:0x3f1c7f81af5eb93e,1,,,,"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-9 py-2.5 bg-[#E71B1E] hover:bg-[#c41215] text-white font-bold text-sm sm:text-base rounded-lg shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200"
          >
            View All
          </a>
        </div>

      </div>
    </section>
  );
}
