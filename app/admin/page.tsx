"use client";

import React from 'react';
import Link from 'next/link';
import { Users, Package, ListOrdered, Settings, ClipboardList, LayoutDashboard } from 'lucide-react';

const adminMenu = [
  { name: 'Gestione Clienti', path: '/admin/clients', icon: Users, color: 'bg-blue-500', desc: 'Crea, modifica e sospendi clienti' },
  { name: 'Categorie', path: '/admin/categories', icon: ListOrdered, color: 'bg-purple-500', desc: 'Organizza il catalogo in madri e figlie' },
  { name: 'Prodotti', path: '/admin/products', icon: Package, color: 'bg-green-500', desc: 'Inserisci prodotti, prezzi e packaging' },
  { name: 'Listini Prezzi', path: '/admin/price-lists', icon: Settings, color: 'bg-orange-500', desc: 'Sconti personalizzati per ogni cliente' },
  { name: 'Gestione Ordini', path: '/admin/orders', icon: ClipboardList, color: 'bg-red-500', desc: 'Visualizza, elabora e scarica ordini' },
];

export default function AdminDashboard() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-12">
        <LayoutDashboard className="text-vinciguerra-gold" size={40} />
        <h1 className="text-4xl font-bold text-vinciguerra-dark">Torre di Controllo</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminMenu.map((item) => (
          <Link 
            key={item.path} 
            href={item.path} 
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-vinciguerra-gold hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className={`${item.color} p-3 rounded-xl text-white group-hover:scale-110 transition-transform`}>
                <item.icon size={24} />
              </div>
              <div>
                <h3 className="font-bold text-vinciguerra-dark text-lg">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 p-6 bg-vinciguerra-dark rounded-3xl text-white flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Vinciguerra Beverage Srl</h2>
          <p className="text-gray-400 text-sm">Sistema Gestionale SuPeR HO.RE.CA. Edition</p>
        </div>
        <div className="text-vinciguerra-gold font-bold text-2xl">v1.0</div>
      </div>
    </div>
  );
}