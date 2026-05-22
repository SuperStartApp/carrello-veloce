"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, PlusCircle, Trash2, Box, Search, Image as ImageIcon, Edit2, XCircle, CheckCircle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category_id: string;
  packaging: string;
  base_price: number;
  image_url: string | null;
  min_qty: number;
  category_name?: string;
}

interface Category { id: string; name: string; }

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [packaging, setPackaging] = useState('');
  const [basePrice, setBasePrice] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState('');
  const [minQty, setMinQty] = useState<number>(1);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, catsRes] = await Promise.all([
        supabase.from('vb_products').select(`*, vb_categories(name)`),
        supabase.from('vb_categories').select('id, name').order('name')
      ]);
      setProducts(productsRes.data || []);
      setCategories(catsRes.data || []);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !categoryId) return;

    const productData = { name, category_id: categoryId, packaging, base_price: basePrice, image_url: imageUrl || null, min_qty: minQty };

    if (editingId) {
      const { error } = await supabase.from('vb_products').update(productData).eq('id', editingId);
      if (error) alert('Errore aggiornamento');
      else { setEditingId(null); resetForm(); fetchData(); }
    } else {
      const { error } = await supabase.from('vb_products').insert([productData]);
      if (error) alert('Errore creazione');
      else { resetForm(); fetchData(); }
    }
  };

  const startEdit = (prod: Product) => {
    setEditingId(prod.id);
    setName(prod.name);
    setCategoryId(prod.category_id);
    setPackaging(prod.packaging);
    setBasePrice(prod.base_price);
    setImageUrl(prod.image_url || '');
    setMinQty(prod.min_qty);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setName(''); setCategoryId(''); setPackaging(''); setBasePrice(0); setImageUrl(''); setMinQty(1); setEditingId(null);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Eliminare?')) return;
    await supabase.from('vb_products').delete().eq('id', id);
    fetchData();
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Package className="text-vinciguerra-gold" size={32} />
        <h1 className="text-3xl font-bold text-vinciguerra-dark">Gestione Prodotti</h1>
      </div>

      <div className={`bg-white p-6 rounded-lg shadow-md mb-8 border-t-4 ${editingId ? 'border-blue-500' : 'border-vinciguerra-gold'}`}>
        <h2 className="text-xl font-semibold mb-4 text-vinciguerra-dark">
          {editingId ? 'Modifica Prodotto' : 'Aggiungi Nuovo Prodotto'}
        </h2>
        <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Nome Prodotto</label>
            <input type="text" className="p-2 border rounded text-black" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Categoria</label>
            <select className="p-2 border rounded text-black" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
              <option value="">-- Seleziona --</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">URL Immagine</label>
            <input type="text" className="p-2 border rounded text-black" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Packaging</label>
            <input type="text" className="p-2 border rounded text-black" value={packaging} onChange={(e) => setPackaging(e.target.value)} />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Prezzo (€)</label>
            <input type="number" step="0.01" className="p-2 border rounded text-black" value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Minimo Ordinabile</label>
            <input type="number" className="p-2 border rounded text-black" value={minQty} onChange={(e) => setMinQty(Number(e.target.value))} />
          </div>
          <div className="flex items-end lg:col-span-3 gap-2">
            {editingId ? (
              <>
                <button type="button" onClick={resetForm} className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 flex items-center justify-center gap-2 h-[42px] flex-1">
                  <XCircle size={18} /> Annulla
                </button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2 h-[42px] flex-1">
                  <CheckCircle size={18} /> Salva Modifiche
                </button>
              </>
            ) : (
              <button type="submit" className="w-full bg-vinciguerra-gold text-white px-4 py-2 rounded hover:bg-opacity-90 flex items-center justify-center gap-2 h-[42px]">
                <PlusCircle size={18} /> Aggiungi al Magazzino
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input type="text" placeholder="Cerca prodotto..." className="w-full pl-10 pr-4 py-2 border rounded-full text-black outline-none focus:ring-2 focus:ring-vinciguerra-gold" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-vinciguerra-dark text-sm">
            <tr>
              <th className="p-4">Prodotto</th>
              <th className="p-4">Categoria</th>
              <th className="p-4">Min. Ordine</th>
              <th className="p-4">Prezzo (€)</th>
              <th className="p-4 text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (<tr><td colSpan={5} className="p-4 text-center">Caricamento...</td></tr>) : filteredProducts.length === 0 ? (<tr><td colSpan={5} className="p-4 text-center text-gray-500">Nessun prodotto.</td></tr>) : (
              filteredProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-vinciguerra-dark">
                    <div className="flex items-center gap-3">
                      {prod.image_url ? <img src={prod.image_url} className="w-10 h-10 object-cover rounded border" /> : <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400"><ImageIcon size={20}/></div>}
                      {prod.name}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{(prod as any).vb_categories?.name || '-'}</td>
                  <td className="p-4 text-sm font-bold">{prod.min_qty} pz</td>
                  <td className="p-4 font-semibold">€ {prod.base_price.toFixed(2)}</td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button onClick={() => startEdit(prod)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Modifica"><Edit2 size={18}/></button>
                    <button onClick={() => deleteProduct(prod.id)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={18}/></button>
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