import type { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";
import DisclaimerFooter from "@/components/DisclaimerFooter";
import { Providers } from "@/components/Providers";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hustle — Budgeting That Builds Your World",
  description: "A budgeting RPG with a floating isometric town that reflects your real financial habits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${pressStart2P.variable} ${vt323.variable}`}>
      <body className="min-h-screen bg-[#1b1b1f] text-[#FFF4D6] font-body flex flex-col justify-between antialiased selection:bg-[#FFD95A] selection:text-[#1B1B1F]">
        <Providers>
          <main className="flex-1 flex flex-col items-center justify-start w-full">
            {children}
          </main>
          <DisclaimerFooter />
        </Providers>
      </body>
    </html>
  );
}
