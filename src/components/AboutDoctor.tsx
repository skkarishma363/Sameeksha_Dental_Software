"use client";

import Image from "next/image";
import { getAssetPath } from "@/lib/getAssetPath";

export default function AboutDoctor() {
  return (
    <section
      id="doctor"
      className="pt-20 sm:pt-24 lg:pt-28 pb-16 sm:pb-20 lg:pb-24 bg-white relative overflow-hidden scroll-mt-28"
    >
      {/* Decorative Background: Soft Tooth Outline */}
      <div
        className="absolute right-[-2%] top-[12%] w-[380px] h-[460px] opacity-[0.06] pointer-events-none select-none z-0"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 100 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full stroke-[#0AA8DE]"
          strokeWidth="1.6"
        >
          <path d="M20,35 C20,15 35,8 50,15 C65,8 80,15 80,35 C80,55 75,70 70,105 C68,112 60,112 56,98 C53,86 47,86 44,98 C40,112 32,112 30,105 C25,70 20,55 20,35 Z" />
        </svg>
      </div>

      <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* ================= LEFT SIDE: Content & Typography ================= */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            {/* Small label: ABOUT OUR DOCTOR */}
            <div className="mb-3">
              <span className="relative inline-block text-xs md:text-sm font-extrabold tracking-[0.16em] uppercase pb-1 text-[#0f2942]">
                <span className="relative text-[#E71B1E]">
                  ABOUT
                  <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#0AA8DE] rounded-full" />
                </span>
                <span className="ml-2 font-bold text-[#0f2942]">OUR DOCTOR</span>
              </span>
            </div>

            {/* Main heading: Expert Care for Healthier Smiles */}
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#0f2942] tracking-tight leading-[1.18] mb-3">
              Expert Care for<br className="hidden sm:inline" />{" "}
              <span className="text-[#E71B1E]">Healthier Smiles</span>
            </h2>

            {/* Tagline: Experienced. Compassionate. Dedicated to Your Smile. */}
            <p className="text-base sm:text-lg font-semibold text-[#0AA8DE] mb-5 tracking-tight">
              Experienced. Compassionate. Dedicated to Your Smile.
            </p>

            {/* Doctor Profile Paragraphs */}
            <div className="space-y-4 sm:space-y-5 text-slate-600 text-sm sm:text-[15px] leading-relaxed font-normal max-w-2xl">
              <p>
                Dr. Suvarna Raju P (BDS, FAGE) is a highly skilled Dental Surgeon and Implantologist who leads the clinical team at Sameeksha Dental Hospital with an enduring commitment to precision, innovation, and evidence-based care.
              </p>
              <p>
                After earning his Bachelor of Dental Surgery and completing specialized training in Implantology at St. Joseph Dental College & Hospital, Eluru, he became an active member of the Indian Dental Association.
              </p>
              <p>
                His clinical expertise encompasses root canal therapy, aesthetic restorations, surgical extractions, pain and infection management, as well as both guided and non-guided dental implant placements.
              </p>
              <p>
                Anchored by a conservative treatment philosophy, Dr. Suvarna Raju prioritizes preserving natural tooth structure whenever possible by integrating advanced diagnostics, digital dentistry, and strict sterilization protocols. He ensures the practice remains at the forefront of contemporary dental science while delivering personalized, minimally invasive care tailored to each individual.
              </p>
              <p>
                Dedicated to clinical excellence and patient well-being, his primary focus is providing accurate diagnoses and virtually painless procedures that minimize downtime while optimizing both functional aesthetics and long-term oral health. Under his compassionate direction, patients experience comfortable, trustworthy, and results-driven dentistry designed to restore confident, healthy smiles.
              </p>
            </div>
          </div>

          {/* ================= RIGHT SIDE: Doctor Image Placeholder & Decorative Elements ================= */}
          <div className="lg:col-span-6 w-full flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[440px] sm:max-w-[470px] lg:max-w-[500px] flex items-center justify-center">
              
              {/* Decorative 1: Soft Light-Blue Circular / Curved Background Shape */}
              <div
                className="absolute inset-0 -m-4 sm:-m-6 rounded-full bg-gradient-to-tr from-[#0AA8DE]/15 via-[#0AA8DE]/8 to-transparent -z-10 blur-xl pointer-events-none"
                aria-hidden="true"
              />
              <div
                className="absolute -right-4 sm:-right-8 top-1/2 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-[#0AA8DE]/10 -z-10 pointer-events-none"
                aria-hidden="true"
              />

              {/* Decorative 2: Small Blue Decorative Dots Grid */}
              <div
                className="absolute -top-6 -left-4 sm:-left-8 w-24 h-24 grid grid-cols-5 gap-2.5 opacity-40 pointer-events-none -z-10"
                aria-hidden="true"
              >
                {[...Array(25)].map((_, i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#0AA8DE]"
                  />
                ))}
              </div>

              {/* Decorative 3: Thin Red Curved Accent Line */}
              <svg
                className="absolute -bottom-6 -left-6 sm:-left-10 w-28 sm:w-36 h-20 pointer-events-none -z-10"
                viewBox="0 0 140 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M10 70 Q 70 10 130 50"
                  stroke="#E71B1E"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>

              {/* Doctor Image Container */}
              <div className="relative w-full aspect-[4/5] min-h-[420px] sm:min-h-[480px] lg:min-h-[520px] rounded-3xl sm:rounded-[36px] bg-gradient-to-b from-[#0AA8DE]/12 via-[#0AA8DE]/5 to-[#0AA8DE]/15 border-2 border-dashed border-[#0AA8DE]/40 shadow-xl shadow-slate-200/50 flex items-end justify-center pt-3 px-3 pb-0 sm:pt-4 sm:px-4 overflow-hidden group">
                
                {/* Subtle internal background glow */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 rounded-full bg-white/60 blur-2xl pointer-events-none" />

                {/* Doctor Cutout PNG */}
                <div className="relative w-full h-full flex items-end justify-center z-10">
                  <Image
                    src={getAssetPath("/doctor_raju.png")}
                    alt="Dr. P. S. Raju - Dental Surgeon"
                    fill
                    priority
                    className="object-contain object-bottom drop-shadow-[0_10px_20px_rgba(10,168,222,0.12)]"
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 470px, 500px"
                    unoptimized
                  />
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
