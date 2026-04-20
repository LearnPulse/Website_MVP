import "./globals.css";
import { Lexend } from "next/font/google";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${lexend.variable} min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display`}
      >
        {children}
      </body>
    </html>
  );
}
