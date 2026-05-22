"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { UserPlus, Trash2, Ban, Play, Copy, Link as LinkIcon, Users, Search, MapPin, UserCircle, Edit2, XCircle, CheckCircle } from 'lucide-react';

interface Client { id: string; name: string; company: string | null; first_name: string | null; last_name: string | null; slug: string; pin: string; extra_discount: number; is_active: boolean; agent_ref: string | null; zone: string | null; }

export default function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [company, setCompany] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [agent, setAgent] = useState('');
  const [zone, setZone] = useState('');
  const [discount, setDiscount] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchClients = async () => {
    setLoading(true);
    const { data } = await supabase.from('vb_clients').select('*').order('company', { ascending: true });
    setClients(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchClients(); }, []);

  const generateSlug = (comp: string, name: string) => {
    return `${comp}-${name}`.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = `${firstName} ${lastName}`;
    const slug = generateSlug(company, fullName);

    if (editingId) {
      const { error } = await supabase.from('vb_clients').update({ 
        company, 
        first_name: firstName, 
        last_name: lastName, 
        name: fullName, 
        slug, 
        extra_discount: discount, 
        agent_ref: agent || null, 
        zone: zone || null 
      }).eq('id', editingId);
      if (error) alert('Errore aggiornamento');
      else { resetForm(); fetchClients(); }
    } else {
      const { error } = await supabase.from('vb_clients').insert([{ 
        company, 
        first_name: firstName, 
        last_name: lastName, 
        name: fullName, 
        slug, 
        pin: Math.floor(100000 + Math.random() * 900000).toString(), 
        extra_discount: discount, 
        agent_ref: agent || null, 
        zone: zone || null, 
        is_active: true 
      }]);
      if (error) alert('Errore creazione');
      else { resetForm(); fetchClients(); }
    }
  };

  const startEdit = (c: Client) => {
    setEditingId(c.id); 
    setCompany(c.company || ''); 
    setFirstName(c.first_name || ''); 
    setLastName(c.last_name || ''); 
    setAgent(c.agent_ref || ''); 
    setZone(c.zone || ''); 
    setDiscount(c.extra_discount);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => { setCompany(''); setFirstName(''); setLastName(''); setAgent(''); setZone(''); setDiscount(0); setEditingId(null); };

  const copyToClipboard = (slug: string) => {
    const link = `${window.location.origin}/ordine/${slug}`;
    navigator.clipboard.writeText(link);
    alert('Link copiato: ' + link);
  };

  const filtered = clients.filter(c => 
    (c.company || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.zone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.last_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Users className="text-vinciguerra-gold" size={32} />
        <h1 className="text-3xl font-bold text-vinciguerra-dark">Gestione Clienti</h1>
      </div>

      <div className={`bg-white p-6 rounded-lg shadow-md mb-8 border-t-4 ${editingId ? 'border-blue-500' : 'border-vinciguerra-gold'}`}>
        <h2 className="text-xl font-semibold mb-4 text-vinciguerra-dark">{editingId ? 'Modifica Cliente' : 'Crea Nuovo Cliente'}</h2>
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="flex flex-col"><label className="text-xs text-gray-500">Azienda</label><input type="text" className="p-2 border rounded text-black" value={company} onChange={(e)=>setCompany(e.target.value)} required /></div>
          <div className="flex flex-col"><label className="text-xs text-gray-500">Nome</label><input type="text" className="p-2 border rounded text-black" value={firstName} onChange={(e)=>setFirstName(e.target.value)} required /></div>
          <div className="flex flex-col"><label className="text-xs text-gray-500">Cognome</label><input type="text" className="p-2 border rounded text-black" value={lastName} onChange={(e)=>setLastName(e.target.value)} required /></div>
          <div className="flex flex-col"><label className="text-xs text-gray-500">Agente</label><input type="text" className="p-2 border rounded text-black" value={agent} onChange={(e)=>setAgent(e.target.value)} /></div>
          <div className="flex flex-col"><label className="text-xs text-gray-500">Zona</label><input type="text" className="p-2 border rounded text-black" value={zone} onChange={(e)=>setZone(e.target.value)} /></div>
          <div className="flex flex-col"><label className="text-xs text-gray-500">Sconto %</label><input type="number" className="p-2 border rounded text-black" value={discount} onChange={(e)=>setDiscount(Number(e.target.value))} /></div>
          <div className="flex items-end lg:col-span-6 gap-2">
            {editingId ? (
              <>
                <button type="button" onClick={resetForm} className="bg-gray-200 p-2 rounded flex-1 flex justify-center items-center gap-2"><XCircle size={18}/> Annulla</button>
                <button type="submit" className="bg-blue-600 text-white p-2 rounded flex-1 flex justify-center items-center gap-2"><CheckCircle size={18}/> Salva</button>
              </>
            ) : (
              <button type="submit" className="w-full bg-vinciguerra-gold text-white p-2 rounded flex justify-center items-center gap-2"><UserPlus size={18}/> Crea Cliente</button>
            )}
          </div>
        </form>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input type="text" placeholder="Cerca azienda, nome o zona..." className="w-full pl-10 pr-4 py-3 border rounded-full text-black outline-none focus:ring-2 focus:ring-vinciguerra-gold" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-vinciguerra-dark text-sm">
            <tr><th className="p-4">Azienda/Cliente</th><th className="p-4">Zona/Agente</th><th className="p-4">PIN</th><th className="p-4">Sconto</th><th className="p-4">Stato</th><th className="p-4 text-right">Azioni</th></tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (<tr><td colSpan={6} className="p-4 text-center">Caricamento...</td></tr>) : filtered.length === 0 ? (<tr><td colSpan={6} className="p-4 text-center text-gray-500">Nessun cliente trovato.</td></tr>) : (
              filtered.map(c => (
                <tr key={c.id} className={`hover:bg-gray-50 ${!c.is_active ? 'opacity-50' : ''}`}>
                  <td className="p-4 font-medium text-vinciguerra-dark">{c.company || 'N/A'}<br/><span className="text-xs text-gray-400">{c.first_name} {c.last_name}</span></td>
                  <td className="p-4 text-sm text-gray-600">{c.zone || '-'} / {c.agent_ref || '-'}</td>
                  <td className="p-4 font-mono text-sm">{c.pin}</td>
                  <td className="p-4 text-sm">{c.extra_discount}%</td>
                  <td className="p-4 text-sm">{c.is_active ? <span className="text-green-600">Attivo</span> : <span className="text-red-600">Sospeso</span>}</td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button onClick={() => copyToClipboard(c.slug)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Copia Link"><LinkIcon size={18}/></button>
                    <button onClick={() => startEdit(c)} className="p-2 text-gray-600 hover:bg-gray-100 rounded" title="Modifica"><Edit2 size={18}/></button>
                    <button onClick={async ()=>{await supabase.from('vb_clients').update({is_active: !c.is_active}).eq('id', c.id); fetchClients();}} className="p-2 text-orange-500 hover:bg-orange-50 rounded">{c.is_active ? <Ban size={18}/> : <Play size={18}/>}</button>
                    <button onClick={async ()=>{if(confirm('Elimina?')) {await supabase.from('vb_clients').delete().eq('id', c.id); fetchClients();}}} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={18}/></button>
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