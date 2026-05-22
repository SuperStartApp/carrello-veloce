"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, PlusCircle, FolderTree, Edit2, CheckCircle, XCircle, ArrowUp, ArrowDown, ChevronRight, ChevronDown } from 'lucide-react';

interface Category { id: string; name: string; parent_id: string | null; position: number; }

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState('');
  const [selectedParent, setSelectedParent] = useState<string>('');
  const [newPos, setNewPos] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});

  const fetchCategories = async () => {
    setLoading(true);
    const { data } = await supabase.from('vb_categories').select('*').order('position', { ascending: true }).order('name', { ascending: true });
    setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    if (editingId) {
      await supabase.from('vb_categories').update({ name: newName, parent_id: selectedParent || null, position: newPos }).eq('id', editingId);
    } else {
      await supabase.from('vb_categories').insert([{ name: newName, parent_id: selectedParent || null, position: newPos }]);
    }
    resetForm();
    fetchCategories();
  };

  const movePosition = async (id: string, direction: 'up' | 'down', index: number, isParent: boolean) => {
    const list = isParent ? categories.filter(c => !c.parent_id) : categories.filter(c => c.parent_id === categories.find(cat => cat.id === id)?.parent_id);
    const currentItem = list[index];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= list.length) return;

    const targetItem = list[targetIndex];
    const oldPos = currentItem.position;
    const newPos = targetItem.position;

    await Promise.all([
      supabase.from('vb_categories').update({ position: newPos }).eq('id', id),
      supabase.from('vb_categories').update({ position: oldPos }).eq('id', targetItem.id)
    ]);
    fetchCategories();
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setNewName(cat.name);
    setSelectedParent(cat.parent_id || '');
    setNewPos(cat.position);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => { setNewName(''); setSelectedParent(''); setNewPos(0); setEditingId(null); };

  const deleteCategory = async (id: string) => {
    if (!confirm('Sei sicuro? Eliminerai anche le sottocategorie!')) return;
    await supabase.from('vb_categories').delete().eq('id', id);
    fetchCategories();
  };

  const toggleExpand = (id: string) => {
    setExpandedParents(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const parents = categories.filter(c => !c.parent_id);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <FolderTree className="text-vinciguerra-gold" size={32} />
        <h1 className="text-3xl font-bold text-vinciguerra-dark">Architettura Catalogo</h1>
      </div>

      <div className={`bg-white p-6 rounded-lg shadow-md mb-8 border-t-4 ${editingId ? 'border-blue-500' : 'border-vinciguerra-gold'}`}>
        <h2 className="text-xl font-semibold mb-4 text-vinciguerra-dark">{editingId ? 'Modifica Categoria' : 'Nuova Categoria'}</h2>
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input type="text" placeholder="Nome" className="p-2 border rounded text-black" value={newName} onChange={(e) => setNewName(e.target.value)} required />
          <select className="p-2 border rounded text-black" value={selectedParent} onChange={(e) => setSelectedParent(e.target.value)}>
            <option value="">-- Genitore (Principale) --</option>
            {parents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input type="number" placeholder="Posizione" className="p-2 border rounded text-black" value={newPos} onChange={(e) => setNewPos(Number(e.target.value))} />
          <div className="flex gap-2">
            {editingId ? (
              <>
                <button type="button" onClick={resetForm} className="flex-1 bg-gray-200 p-2 rounded flex justify-center items-center gap-2"><XCircle size={18}/> Annulla</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white p-2 rounded flex justify-center items-center gap-2"><CheckCircle size={18}/> Salva</button>
              </>
            ) : (
              <button type="submit" className="w-full bg-vinciguerra-gold text-white p-2 rounded flex justify-center items-center gap-2"><PlusCircle size={18}/> Aggiungi</button>
            )}
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 text-gray-400">Caricamento struttura...</div>
        ) : parents.length === 0 ? (
          <div className="text-center py-10 text-gray-400">Nessuna categoria principale trovata.</div>
        ) : (
          parents.map((parent, pIdx) => {
            const children = categories.filter(c => c.parent_id === parent.id);
            const isExpanded = expandedParents[parent.id];

            return (
              <div key={parent.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleExpand(parent.id)} className="text-gray-400 hover:text-vinciguerra-gold transition-colors">
                      {isExpanded ? <ChevronDown size={20}/> : <ChevronRight size={20}/>}
                    </button>
                    <span className="font-bold text-vinciguerra-dark"> {parent.name}</span>
                    <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded-full text-gray-500">Pos: {parent.position}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => movePosition(parent.id, 'up', pIdx, true)} className="p-1 text-gray-400 hover:text-vinciguerra-gold"><ArrowUp size={16}/></button>
                    <button onClick={() => movePosition(parent.id, 'down', pIdx, true)} className="p-1 text-gray-400 hover:text-vinciguerra-gold"><ArrowDown size={16}/></button>
                    <button onClick={() => startEdit(parent)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={18}/></button>
                    <button onClick={() => deleteCategory(parent.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={18}/></button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="bg-white">
                    {children.length === 0 ? (
                      <div className="p-4 text-center text-xs text-gray-400 italic">Nessuna sottocategoria assegnata.</div>
                    ) : (
                      children.map((child, cIdx) => (
                        <div key={child.id} className="flex items-center justify-between p-3 pl-12 border-b border-gray-50 hover:bg-gray-50 transition-//colors">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-300 text-xs">↳</span>
                            <span className="text-sm text-gray-600">{child.name}</span>
                            <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-400">Pos: {child.position}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => movePosition(child.id, 'up', cIdx, false)} className="p-1 text-gray-400 hover:text-vinciguerra-gold"><ArrowUp size={14}/></button>
                            <button onClick={() => movePosition(child.id, 'down', cIdx, false)} className="p-1 text-gray-400 hover:text-vinciguerra-gold"><ArrowDown size={14}/></button>
                            <button onClick={() => startEdit(child)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16}/></button>
                            <button onClick={() => deleteCategory(child.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}