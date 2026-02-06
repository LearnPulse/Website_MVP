import "./globals.css";
import { Space_Grotesk, Inter_Tight } from "next/font/google";

const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-body" });

export const metadata = {
  title: "LearnPulse",
  description: "Minimal end-to-end learning system"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${space.variable} ${interTight.variable} gradient-bg min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
