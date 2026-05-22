import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer"; // <--- IMPORTIAMO IL FOOTER

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vinciguerra Beverage App",
  description: "Gestione ordini per clienti HoReCa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        {/* 
           Il 'flex flex-col min-h-screen' sul body serve a 
           spingere il footer sempre in fondo alla pagina 
        */}
        <main className="flex-grow">
          {children}
        </main>
        
        <Footer /> 
      </body>
    </html>
  );
}