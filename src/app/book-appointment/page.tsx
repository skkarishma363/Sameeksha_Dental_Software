"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import { PublicAppointmentForm } from "@/components/public-appointment-form";

export default function BookAppointmentPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 flex flex-col justify-between">
      <Navbar />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 pt-32 pb-16 sm:px-6 lg:px-8 flex-grow flex flex-col justify-center">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-8">
          <span className="text-xs font-bold text-[#E71B1E] uppercase tracking-widest">
            Sameeksha Super Speciality Dental Hospital
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
            Online Appointment Request
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Schedule your visit with Dr. Suvarna Raju P and our specialist dental care team. Fill in your details below and our hospital reception will contact you to confirm your slot.
          </p>
        </div>

        <PublicAppointmentForm />
      </main>

      <Footer />
      <FloatingButtons />
    </div>
  );
}
