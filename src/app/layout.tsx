import type { Metadata, Viewport } from "next";
import { Manrope, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { PwaRegister } from "@/components/pwa-register";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "600", "700", "800"],
  style: ["normal", "italic"],
});

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const cleanBase = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;

export const metadata: Metadata = {
  title: "Sameeksha Super Speciality Dental Hospital & Implant Centre | Ramanayyapeta",
  description: "Sameeksha Super Speciality Dental Hospital & Implant Centre in Ramanayyapeta provides comprehensive, advanced dental care, dental implants, root canal treatment, laser dentistry, orthodontics, cosmetic smile makeovers, and oral healthcare.",
  keywords: [
    "Sameeksha Dental Hospital",
    "Sameeksha Super Speciality Dental Hospital",
    "Sameeksha Dental Implant Centre",
    "Dentist in Ramanayyapeta",
    "Dental Hospital Ramanayapeta",
    "Dr Suvarna Raju P",
    "Dr P S Raju",
    "Dental Implants",
    "Root Canal Treatment",
    "Laser Surgeries",
    "Orthodontics",
    "Invisalign",
    "Teeth Whitening",
    "Cosmetic Dentistry",
    "Dentures",
  ],
  authors: [{ name: "Sameeksha Super Speciality Dental Hospital & Implant Centre" }],
  openGraph: {
    title: "Sameeksha Super Speciality Dental Hospital & Implant Centre | Ramanayyapeta",
    description: "Transforming Smiles, Transforming Lives. High-precision dental implantology, root canal treatments, and comprehensive cosmetic dental care.",
    type: "website",
    locale: "en_US",
    siteName: "Sameeksha Super Speciality Dental Hospital & Implant Centre",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sameeksha Super Speciality Dental Hospital & Implant Centre | Ramanayyapeta",
    description: "Transforming Smiles, Transforming Lives. High-precision dental implantology, root canal treatments, and comprehensive cosmetic dental care.",
  },
  icons: {
    icon: [
      { url: `${cleanBase}/favicon.ico`, sizes: "any" },
      { url: `${cleanBase}/favicon-16x16.png`, sizes: "16x16", type: "image/png" },
      { url: `${cleanBase}/favicon-32x32.png`, sizes: "32x32", type: "image/png" },
      { url: `${cleanBase}/favicon-48x48.png`, sizes: "48x48", type: "image/png" },
    ],
    apple: [
      { url: `${cleanBase}/apple-touch-icon.png`, sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: `${cleanBase}/manifest.webmanifest`,
};

export const viewport: Viewport = {
  themeColor: "#E71B1E",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${inter.variable} ${playfair.variable} h-full antialiased scroll-smooth`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-white text-[#0F172A] selection:bg-[#E71B1E] selection:text-white font-sans relative z-0"
        style={{ zIndex: 0 }}
        suppressHydrationWarning
      >
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
