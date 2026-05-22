"use client";

import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, ChevronLeft } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* HEADER FISSO PER TUTTA L'AREA ADMIN */}
      <header className="bg-vinciguerra-dark text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <Link 
              href="/admin" 
              className="flex items-center gap-2 text-vinciguerra-gold hover:text-white transition-colors group"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <div className="flex items-center gap-2">
                <LayoutDashboard size={20} />
                <span className="font-bold tracking-wide uppercase text-sm">Torre di Controllo</span>
              </div>
            </Link>
          </div>

          <div className="hidden md:block">
            <span className="text-xs text-gray-400 font-medium italic">
              Vinciguerra Beverage Admin Panel
            </span>
          </div>
        </div>
      </header>

      {/* Qui verranno inserite le pagine (Clienti, Prodotti, ecc.) */}
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}