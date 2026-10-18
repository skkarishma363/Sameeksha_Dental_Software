import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import { FileCheck, ArrowLeft, AlertCircle, Clock, CreditCard, Stethoscope, Phone, Mail, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | Sameeksha Super Speciality Dental Hospital",
  description: "Terms of Service and patient consultation guidelines for Sameeksha Super Speciality Dental Hospital & Implant Centre in Ramanayyapeta.",
};

export default function TermsOfServicePage() {
  return (
    <>
      <Navbar />
      <main className="flex-grow pt-28 pb-20 bg-[#f8fafc]">
        {/* Header Banner */}
        <section className="bg-gradient-to-r from-[#c41215] via-[#E71B1E] to-[#0AA8DE] text-white py-14 px-6 md:px-12 lg:px-20 relative overflow-hidden">
          <div className="max-w-[1100px] mx-auto relative z-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium mb-6 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center gap-3 mb-3">
              <span className="p-2 bg-white/20 backdrop-blur-xs rounded-lg inline-flex">
                <FileCheck className="w-6 h-6 text-white" />
              </span>
              <span className="text-xs md:text-sm uppercase tracking-widest font-bold text-white/90">
                Hospital Guidelines & Policies
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Terms of Service
            </h1>
            <p className="mt-3 text-white/90 text-sm sm:text-base max-w-2xl font-normal">
              Terms and conditions governing clinical appointments, treatments, and online consultations at Sameeksha Super Speciality Dental Hospital & Implant Centre.
            </p>
            <p className="mt-2 text-xs text-white/70">
              Last Updated: October 2026 | Effective Date: October 2026
            </p>
          </div>
        </section>

        {/* Terms Content */}
        <section className="max-w-[1100px] mx-auto px-6 md:px-12 py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-8 sm:p-12 space-y-10 text-[#1e293b]">
            
            {/* 1. Acceptance */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0f2942] mb-4 flex items-center gap-2.5">
                <span className="w-2 h-6 bg-[#E71B1E] rounded-full inline-block" />
                1. Acceptance of Terms
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                By visiting our hospital, booking appointments online, submitting information through our Quick Online Consultancy service, or using our website, you agree to comply with and be bound by these Terms of Service. If you do not agree with any portion of these terms, please consult our front desk team prior to receiving services.
              </p>
            </div>

            {/* 2. Dental Consultations & Advice */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0f2942] mb-4 flex items-center gap-2.5">
                <span className="w-2 h-6 bg-[#E71B1E] rounded-full inline-block" />
                2. Medical Nature of Consultations
              </h2>
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl mb-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
                  Preliminary online advice submitted via website forms or WhatsApp does not constitute a final clinical diagnosis. Accurate dental diagnosis requires hands-on intraoral inspection, digital X-rays, or specialized diagnostic imaging in person.
                </p>
              </div>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                Our online consultancy feature is designed to provide guidance on service recommendations, estimated consultation procedures, and slot scheduling. Formal treatment decisions are confirmed following clinical evaluation by Dr. Suvarna Raju P or authorized associate specialists.
              </p>
            </div>

            {/* 3. Appointments & Cancellations */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0f2942] mb-4 flex items-center gap-2.5">
                <span className="w-2 h-6 bg-[#E71B1E] rounded-full inline-block" />
                3. Appointments & Rescheduling
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                  <h3 className="font-semibold text-sm text-[#0f2942] mb-1.5 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#0AA8DE]" /> Arrival Timeliness
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Patients are kindly requested to arrive 10–15 minutes prior to their scheduled appointment for preliminary vital checks and case sheet verification.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                  <h3 className="font-semibold text-sm text-[#0f2942] mb-1.5 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#0AA8DE]" /> Notice of Rescheduling
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    If you need to cancel or postpone your consultation, please inform our reception team at least 4 hours in advance so the slot can be offered to urgent care cases.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Treatment Plans & Informed Consent */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0f2942] mb-4 flex items-center gap-2.5">
                <span className="w-2 h-6 bg-[#E71B1E] rounded-full inline-block" />
                4. Treatment Plans & Patient Consent
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                Prior to commencing any surgical, prosthetic, orthodontic, or invasive dental procedure, our doctors discuss the nature of the treatment, expected outcomes, risks, alternatives, and anticipated timelines. Written or recorded informed consent will be obtained prior to surgical procedures.
              </p>
            </div>

            {/* 5. Payments & Financial Policies */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0f2942] mb-4 flex items-center gap-2.5">
                <span className="w-2 h-6 bg-[#E71B1E] rounded-full inline-block" />
                5. Fees & Payments
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base mb-3">
                Treatment fees are explained transparently before procedures begin. We accept cash, major UPI platforms, debit/credit cards, and bank transfers.
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 text-sm sm:text-base pl-2">
                <li>Multi-stage treatments (such as implants, crowns, and aligners) may require a phased advance deposit to initiate fabrication.</li>
                <li>Itemized payment receipts are issued for all clinical consultations and procedures.</li>
              </ul>
            </div>

            {/* 6. Medical History Disclosure */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0f2942] mb-4 flex items-center gap-2.5">
                <span className="w-2 h-6 bg-[#E71B1E] rounded-full inline-block" />
                6. Patient Responsibility & Medical History
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                Patients are obligated to provide complete and accurate information concerning their medical history, including but not limited to hypertension, cardiac conditions, diabetes, bleeding disorders, pregnancy, and active pharmaceutical prescriptions. Withholding medical details can compromise patient safety during surgical anaesthesia.
              </p>
            </div>

            {/* Contact Details */}
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-base text-[#0f2942] mb-3">
                Hospital Administration Inquiries
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                For questions regarding treatment terms, scheduling policies, or official billing, please contact our administrative desk:
              </p>
              <div className="space-y-2 text-sm text-slate-700">
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#E71B1E] shrink-0" />
                  <span>CHOWDARY GUEST HOUSE, GROUND FLOOR, NEAR RTC COLONY 4 ROAD JUNCTION, ROAD, NEAR KAVERI BUS PARKING, Ramanayapeta, Ramanayyapeta, Andhra Pradesh 533005</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#E71B1E] shrink-0" />
                  <span>088859 99857</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#E71B1E] shrink-0" />
                  <span>sameekshadentalhospital@gmail.com</span>
                </p>
              </div>
            </div>

          </div>
        </section>
      </main>
      <Footer />
      <FloatingButtons />
    </>
  );
}
