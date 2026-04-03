import "./globals.css";
import { Lexend } from "next/font/google";

const lexend = Lexend({ subsets: ["latin"], variable: "--font-display", weight: ["300", "400", "500", "600", "700"] });

export const metadata = {
  title: "LearnPulse",
  description: "Adaptive AI-powered learning platform"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${lexend.variable} min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display transition-colors duration-200`}>
        {children}
      </body>
    </html>
  );
}
