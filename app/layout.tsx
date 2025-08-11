import "./globals.css";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = { title: "Atlas Analítica" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
        <header style={{ padding: 12, borderBottom: "1px solid #2a2f3a" }}>
          ATLAS — MVP
        </header>
        <main style={{ maxWidth: 980, margin: "16px auto", padding: 16 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
