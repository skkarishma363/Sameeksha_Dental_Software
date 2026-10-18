"use client";

import Image from "next/image";
import { getAssetPath } from "@/lib/getAssetPath";

export default function AppointmentCTA() {
  const scrollToBooking = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.querySelector("#consultancy") || document.querySelector("#contact");
    if (target) {
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({
        top: Math.max(0, targetPosition),
        behavior: "smooth",
      });
    }
  };

  return (
    <section
      id="contact"
      className="py-20 lg:py-24 relative overflow-hidden text-white"
      style={{
        background: "linear-gradient(160deg, #0779a1 0%, #0AA8DE 55%, #066687 100%)",
      }}
    >
      <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT: Text & CTA Button */}
          <div className="lg:col-span-6 flex flex-col items-start text-left max-w-xl">
            <h2 className="text-3xl sm:text-4xl lg:text-[50px] font-extrabold text-white tracking-tight leading-[1.14] mb-4">
              Book Your<br />
              Appointment Today!
            </h2>
            <div className="w-16 h-1.5 bg-[#E71B1E] rounded-full mb-6" />

            <p className="text-white/90 text-sm sm:text-base leading-relaxed font-normal mb-8">
              Your smile deserves the best care! Whether you need a routine check-up, cosmetic enhancement, or specialized treatment, our expert team at Sameeksha Super Speciality Dental Hospital is here to help. Schedule your appointment now and take the first step toward a healthier, brighter smile. Easy booking, expert care, and a comfortable experience await you!
            </p>

            {/* White Button with Blue Text and Red Hover */}
            <div>
              <a
                href="#consultancy"
                onClick={scrollToBooking}
                className="inline-flex items-center justify-center px-9 py-3.5 bg-white text-[#0AA8DE] hover:bg-[#E71B1E] hover:text-white font-extrabold text-base rounded-lg shadow-xl hover:shadow-2xl active:scale-95 transition-all duration-200 cursor-pointer border-2 border-white"
              >
                Get Started
              </a>
            </div>
          </div>

          {/* RIGHT: Large Cartoon Smiling Tooth in Circular Light Blue Container */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end relative">
            {/* Circular Backdrop */}
            <div className="relative w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] lg:w-[430px] lg:h-[430px] rounded-full bg-[#0AA8DE]/25 flex items-center justify-center border-4 border-white/20 shadow-2xl">
              {/* Cartoon Smiling Tooth Character */}
              <div className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] lg:w-[390px] lg:h-[390px] filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.25)]">
                <Image
                  src={getAssetPath("/smiling-tooth.png")}
                  alt="Friendly Smiling Tooth - Sameeksha Dental Hospital"
                  fill
                  className="object-contain"
                  priority
                  unoptimized
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
