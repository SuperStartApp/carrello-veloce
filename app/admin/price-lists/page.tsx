"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, Settings, User, List, CheckCircle2, AlertCircle } from 'lucide-react';

interface Client {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

export default function AdminPriceLists() {
  const [clients, setClients] = useState<Client[]>([]);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [discounts, setDiscounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientsRes, catsRes] = await Promise.all([
        supabase.from('vb_clients').select('id, name').order('name'),
        // NOTA: Prendiamo solo le categorie che NON hanno un parent_id (le Madri)
        supabase.from('vb_categories').select('id, name').is('parent_id', null).order('name')
      ]);

      if (clientsRes.error) throw clientsRes.error;
      if (catsRes.error) throw catsRes.error;

      setClients(clientsRes.data || []);
      setParentCategories(catsRes.data || []);
    } catch (error) {
      console.error('Errore:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (selectedClientId) {
      loadClientDiscounts(selectedClientId);
    } else {
      setDiscounts({});
    }
  }, [selectedClientId]);

  const loadClientDiscounts = async (clientId: string) => {
    const { data, error } = await supabase
      .from('vb_price_lists')
      .select('category_id, discount_percentage')
      .eq('client_id', clientId);

    if (error) console.error(error);
    else {
      const discountMap: Record<string, number> = {};
      data?.forEach(item => { discountMap[item.category_id] = item.discount_percentage; });
      setDiscounts(discountMap);
    }
  };

  const handleDiscountChange = (categoryId: string, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    setDiscounts(prev => ({ ...prev, [categoryId]: numValue }));
  };

  const savePriceList = async () => {
    if (!selectedClientId) return;
    setSaving(true);
    setMessage(null);

    try {
      // 1. Elimina sconti esistenti
      await supabase.from('vb_price_lists').delete().eq('client_id', selectedClientId);

      // 2. Inserisci nuovi sconti (solo quelli > 0)
      const newEntries = Object.entries(discounts)
        .filter(([_, value]) => value > 0)
        .map(([catId, value]) => ({
          client_id: selectedClientId,
          category_id: catId,
          discount_percentage: value
        }));

      if (newEntries.length > 0) {
        const { error } = await supabase.from('vb_price_lists').insert(newEntries);
        if (error) throw error;
      }

      setMessage({ type: 'success', text: 'Listino aggiornato con successo!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Errore durante il salvataggio.' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="text-vinciguerra-gold" size={32} />
        <h1 className="text-3xl font-bold text-vinciguerra-dark">Configurazione Listini (Madri)</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-vinciguerra-gold">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
          <User size={16} /> Seleziona il Cliente:
        </label>
        <select 
          className="w-full p-3 border rounded text-black bg-white focus:ring-2 focus:ring-vinciguerra-gold outline-none"
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
        >
          <option value="">-- Seleziona un cliente --</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <p className="text-xs text-gray-400 mt-2 italic">
          * Assegnando uno sconto a una categoria madre, sarà applicato automaticamente a tutte le sue sottocategorie.
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-md flex items-center gap-3 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle2 /> : <AlertCircle />}
          {message.text}
        </div>
      )}

      {selectedClientId ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
            <h2 className="font-semibold text-vinciguerra-dark flex items-center gap-2">
              <List size={18} /> Sconti per Categoria Madre
            </h2>
            <button onClick={savePriceList} disabled={saving} className="bg-vinciguerra-gold text-white px-5 py-2 rounded hover:bg-opacity-90 flex items-center gap-2 disabled:opacity-50">
              <Save size={18} /> {saving ? 'Salvataggio...' : 'Salva Listino'}
            </button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-600 text-sm">
              <tr>
                <th className="p-4">Categoria Madre</th>
                <th className="p-4 w-40 text-center">Sconto (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {parentCategories.map(cat => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="p-4 text-vinciguerra-dark font-medium">{cat.name}</td>
                  <td className="p-4">
                    <input 
                      type="number" min="0" max="100" placeholder="0"
                      className="w-full p-2 border rounded text-center text-black outline-none focus:ring-1 focus:ring-vinciguerra-gold"
                      value={discounts[cat.id] || ''}
                      onChange={(e) => handleDiscountChange(cat.id, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 text-gray-400 italic">
          Seleziona un cliente sopra per configurare i suoi sconti per categoria madre
        </div>
      )}
    </div>
  );
}