"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { UserPlus, Trash2, Ban, Play, Copy, Link as LinkIcon, Users, Search, MapPin, UserCircle, Edit2, XCircle, CheckCircle } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  slug: string;
  pin: string;
  extra_discount: number;
  is_active: boolean;
  agent_ref: string | null;
  zone: string | null;
  created_at: string;
}

export default function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [name, setName] = useState('');
  const [agent, setAgent] = useState('');
  const [zone, setZone] = useState('');
  const [discount, setDiscount] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null); // Stato per la modifica

  const fetchClients = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('vb_clients').select('*').order('name', { ascending: true });
    if (error) console.error('Errore:', error);
    else setClients(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchClients(); }, []);

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.zone && client.zone.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.agent_ref && client.agent_ref.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const generatePin = () => Math.floor(100000 + Math.random() * 900000).toString();
  const generateSlug = (text: string) => text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    if (editingId) {
      // LOGICA MODIFICA
      const { error } = await supabase.from('vb_clients').update({
        name,
        slug: generateSlug(name),
        extra_discount: discount,
        agent_ref: agent || null,
        zone: zone || null,
      }).eq('id', editingId);

      if (error) alert('Errore aggiornamento');
      else {
        setEditingId(null);
        resetForm();
        fetchClients();
      }
    } else {
      // LOGICA CREAZIONE
      const { error } = await supabase.from('vb_clients').insert([
        { name, slug: generateSlug(name), pin: generatePin(), extra_discount: discount, agent_ref: agent || null, zone: zone || null, is_active: true },
      ]);
      if (error) alert('Errore creazione');
      else { resetForm(); fetchClients(); }
    }
  };

  const startEdit = (client: Client) => {
    setEditingId(client.id);
    setName(client.name);
    setAgent(client.agent_ref || '');
    setZone(client.zone || '');
    setDiscount(client.extra_discount);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setName(''); setAgent(''); setZone(''); setDiscount(0); setEditingId(null);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    await supabase.from('vb_clients').update({ is_active: !currentStatus }).eq('id', id);
    fetchClients();
  };

  const deleteClient = async (id: string) => {
    if (!confirm('Eliminare?')) return;
    await supabase.from('vb_clients').delete().eq('id', id);
    fetchClients();
  };

  const copyToClipboard = (slug: string) => {
    const link = `${window.location.origin}/ordine/${slug}`;
    navigator.clipboard.writeText(link);
    alert('Link copiato!');
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Users className="text-vinciguerra-gold" size={32} />
        <h1 className="text-3xl font-bold text-vinciguerra-dark">Gestione Clienti</h1>
      </div>

      <div className={`bg-white p-6 rounded-lg shadow-md mb-8 border-t-4 ${editingId ? 'border-blue-500' : 'border-vinciguerra-gold'}`}>
        <h2 className="text-xl font-semibold mb-4 text-vinciguerra-dark">
          {editingId ? 'Modifica Cliente' : 'Crea Nuovo Cliente'}
        </h2>
        <form onSubmit={handleSaveClient} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Nome</label>
            <input type="text" className="p-2 border rounded text-black" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Agente</label>
            <input type="text" className="p-2 border rounded text-black" value={agent} onChange={(e) => setAgent(e.target.value)} />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Zona</label>
            <input type="text" className="p-2 border rounded text-black" value={zone} onChange={(e) => setZone(e.target.value)} />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Sconto %</label>
            <input type="number" className="p-2 border rounded text-black" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
          </div>
          <div className="flex items-end gap-2">
            {editingId ? (
              <>
                <button type="button" onClick={resetForm} className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 flex items-center justify-center gap-2 h-[42px] flex-1">
                  <XCircle size={18} /> Annulla
                </button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2 h-[42px] flex-1">
                  <CheckCircle size={18} /> Salva
                </button>
              </>
            ) : (
              <button type="submit" className="w-full bg-vinciguerra-gold text-white px-4 py-2 rounded hover:bg-opacity-90 flex items-center justify-center gap-2 h-[42px]">
                <UserPlus size={18} /> Crea
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input type="text" placeholder="Cerca per nome, agente o zona..." className="w-full pl-10 pr-4 py-3 border rounded-full shadow-sm text-black focus:ring-2 focus:ring-vinciguerra-gold outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-vinciguerra-dark text-sm">
            <tr>
              <th className="p-4">Cliente</th>
              <th className="p-4">Agente / Zona</th>
              <th className="p-4">PIN</th>
              <th className="p-4">Sconto</th>
              <th className="p-4">Stato</th>
              <th className="p-4 text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (<tr><td colSpan={6} className="p-4 text-center">Caricamento...</td></tr>) : filteredClients.length === 0 ? (<tr><td colSpan={6} className="p-4 text-center text-gray-500">Nessun cliente trovato.</td></tr>) : (
              filteredClients.map((client) => (
                <tr key={client.id} className={`hover:bg-gray-50 ${!client.is_active ? 'opacity-50' : ''}`}>
                  <td className="p-4 font-medium text-vinciguerra-dark">{client.name}</td>
                  <td className="p-4 text-sm text-gray-600">
                    <div className="flex flex-col">
                      <span className="flex items-center gap-1"><UserCircle size={14}/> {client.agent_ref || '-'}</span>
                      <span className="flex items-center gap-1"><MapPin size={14}/> {client.zone || '-'}</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-sm">{client.pin}</td>
                  <td className="p-4 text-sm">{client.extra_discount}%</td>
                  <td className="p-4 text-sm">
                    {client.is_active ? <span className="text-green-600 flex items-center gap-1"><Play size={14} /> Attivo</span> : <span className="text-red-600 flex items-center gap-1"><Ban size={14} /> Sospeso</span>}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => copyToClipboard(client.slug)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Copia Link"><LinkIcon size={18}/></button>
                      <button onClick={() => startEdit(client)} className="p-2 text-gray-600 hover:bg-gray-100 rounded" title="Modifica"><Edit2 size={18}/></button>
                      <button onClick={() => toggleStatus(client.id, client.is_active)} className="p-2 text-orange-500 hover:bg-orange-50 rounded">{client.is_active ? <Ban size={18}/> : <Play size={18}/>}</button>
                      <button onClick={() => deleteClient(client.id)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}