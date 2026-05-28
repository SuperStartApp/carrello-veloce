"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Users, Package, ListOrdered, Settings, ClipboardList, LayoutDashboard, HelpCircle, X } from 'lucide-react';

const adminMenu = [
  { name: 'Gestione Clienti', path: '/admin/clients', icon: Users, color: 'bg-blue-500', desc: 'Crea, modifica e sospendi clienti. Genera i link di accesso e i PIN.' },
  { name: 'Categorie', path: '/admin/categories', icon: ListOrdered, color: 'bg-purple-500', desc: 'Organizza il catalogo in Categorie Madri e Sottocategorie.' },
  { name: 'Prodotti', path: '/admin/products', icon: Package, color: 'bg-green-500', desc: 'Inserisci prodotti, prezzi, packaging e quantità minime.' },
  { name: 'Listini Prezzi', path: '/admin/price-lists', icon: Settings, color: 'bg-orange-500', desc: 'Assegna sconti personalizzati per categoria a ogni cliente.' },
  { name: 'Gestione Ordini', path: '/admin/orders', icon: ClipboardList, color: 'bg-red-500', desc: 'Monitora gli ordini in tempo reale, cambia stati e scarica PDF/Excel.' },
];

export default function AdminDashboard() {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="text-vinciguerra-gold" size={40} />
          <h1 className="text-4xl font-bold text-vinciguerra-dark">Torre di Controllo</h1>
        </div>
        
        {/* TASTO GUIDA - ORA FUNZIONANTE */}
        <button 
          onClick={() => setIsGuideOpen(true)}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 text-vinciguerra-dark hover:text-vinciguerra-gold hover:border-vinciguerra-gold transition-all group"
        >
          <HelpCircle size={20} className="group-hover:rotate-12 transition-transform" />
          <span className="font-medium">Guida Rapida</span>
        </button>
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
        <div className="text-vinciguerra-gold font-bold text-2xl">v1.1</div>
      </div>

      {/* MODAL GUIDA RAPIDA */}
      {isGuideOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3">
                <HelpCircle className="text-vinciguerra-gold" size={24} />
                <h2 className="text-xl font-bold text-vinciguerra-dark">Come usare l'app</h2>
              </div>
              <button onClick={() => setIsGuideOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <section>
                <h3 className="font-bold text-vinciguerra-gold mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-vinciguerra-gold rounded-full"></div>
                  1. Categorie & Prodotti
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Crea prima le <strong>Categorie Principali</strong> (es. Birre) e poi le <strong>Sottocategorie</strong> (es. Peroni). 
                  I prodotti vanno associati a una sottocategoria. Puoi ordinare la posizione delle categorie usando le frecce Su/Giù.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-vinciguerra-gold mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-vinciguerra-gold rounded-full"></div>
                  2. Gestione Clienti
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Inserisci Azienda, Nome e Cognome. Il sistema genera un <strong>Link Univoco</strong> e un <strong>PIN a 6 cifre</strong>. 
                  Manda il link al cliente via WhatsApp; lui userà il PIN per entrare nel suo negozio.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-vinciguerra-gold mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-vinciguerra-gold rounded-full"></div>
                  3. Sconti Personalizzati
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Nel pannello Listini, seleziona un cliente e assegna una % di sconto a una <strong>Categoria Madre</strong>. 
                  Lo sconto verrà applicato automaticamente a tutti i prodotti di quella categoria e delle sue sottocategorie.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-vinciguerra-gold mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-vinciguerra-gold rounded-full"></div>
                  4. Gestione Ordini
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Gli ordini arrivano in tempo reale. Puoi cambiare lo stato (In Attesa $\rightarrow$ Elaborato $\rightarrow$ Consegnato) 
                  cliccando sul badge dello stato. Scarica il PDF per ogni singolo ordine o l'Excel per il riepilogo totale.
                </p>
              </section>
            </div>

            <div className="p-6 border-t bg-gray-50 text-center">
              <button onClick={() => setIsGuideOpen(false)} className="bg-vinciguerra-dark text-white px-8 py-2 rounded-xl font-bold hover:bg-gray-800 transition-all">
                Ho capito!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}