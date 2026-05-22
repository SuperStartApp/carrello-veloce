"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, PlusCircle, FolderTree } from 'lucide-react';

// Definiamo cosa sia una Categoria per il computer
interface Category {
  id: string;
  name: string;
  parent_id: string | null;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState('');
  const [selectedParent, setSelectedParent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // 1. Carica le categorie dal database
  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('vb_categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Errore nel caricamento:', error);
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 2. Aggiungi una nuova categoria
  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const { error } = await supabase.from('vb_categories').insert([
      { 
        name: newName, 
        parent_id: selectedParent || null 
      },
    ]);

    if (error) {
      alert('Errore durante l\'aggiunta');
    } else {
      setNewName('');
      setSelectedParent('');
      fetchCategories(); // Ricarica la lista
    }
  };

  // 3. Elimina una categoria
  const deleteCategory = async (id: string) => {
    if (!confirm('Sei sicuro? Se elimini questa categoria, spariranno anche le sottocategorie!')) return;

    const { error } = await supabase.from('vb_categories').delete().eq('id', id);

    if (error) {
      alert('Errore durante l\'eliminazione');
    } else {
      fetchCategories();
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <FolderTree className="text-vinciguerra-gold" size={32} />
        <h1 className="text-3xl font-bold text-vinciguerra-dark">Gestione Categorie</h1>
      </div>

      {/* FORM PER AGGIUNGERE */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-t-4 border-vinciguerra-gold">
        <h2 className="text-xl font-semibold mb-4">Aggiungi Nuova Categoria</h2>
        <form onSubmit={addCategory} className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Nome Categoria (es. BIRRA)"
            className="flex-grow p-2 border rounded text-black"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          
          <select 
            className="p-2 border rounded text-black"
            value={selectedParent}
            onChange={(e) => setSelectedParent(e.target.value)}
          >
            <option value="">-- Nessuna (Categoria Genitore) --</option>
            {categories.filter(c => c.parent_id === null).map(parent => (
              <option key={parent.id} value={parent.id}>
                {parent.name}
              </option>
            ))}
          </select>

          <button 
            type="submit"
            className="bg-vinciguerra-gold text-white px-6 py-2 rounded hover:bg-opacity-90 flex items-center justify-center gap-2"
          >
            <PlusCircle size={20} /> Aggiungi
          </button>
        </form>
      </div>

      {/* LISTA CATEGORIE */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-vinciguerra-dark">
            <tr>
              <th className="p-4">Nome</th>
              <th className="p-4">Tipo</th>
              <th className="p-4 text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={3} className="p-4 text-center">Caricamento...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={3} className="p-4 text-center">Nessuna categoria trovata.</td></tr>
            ) : (
              categories.map((cat) => {
                // Cerchiamo di capire se è una sottocategoria
                const parent = categories.find(c => c.id === cat.parent_id);
                
                return (
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-vinciguerra-dark">
                      {cat.name}
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {parent ? `Sottocategoria di ${parent.name}` : 'Categoria Principale'}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => deleteCategory(cat.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}