"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ClipboardList, Download, Search, Eye, CheckCircle, Clock, X, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  vb_clients: { name: string; zone: string; agent_ref: string };
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
  vb_products: { name: string; packaging: string };
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'month'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Stato per il Modal dei dettagli
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('vb_orders').select(`*, vb_clients(*)`).order('created_at', { ascending: false });
    if (error) console.error(error); else setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  // --- LOGICA CAMBIO STATO ---
  const updateStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'in_attesa' ? 'elaborato' : currentStatus === 'elaborato' ? 'consegnato' : 'in_attesa';
    const { error } = await supabase.from('vb_orders').update({ status: nextStatus }).eq('id', id);
    if (error) alert('Errore aggiornamento stato'); else fetchOrders();
  };

  // --- LOGICA DETTAGLIO ORDINE ---
  const viewOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    setModalLoading(true);
    const { data, error } = await supabase.from('vb_order_items').select(`*, vb_products(name, packaging)`).eq('order_id', order.id);
    if (error) console.error(error); else setOrderItems(data || []);
    setModalLoading(false);
  };

  // --- EXPORT EXCEL (Generale) ---
  const exportToExcel = () => {
    const filtered = orders.filter(order => {
      const date = new Date(order.created_at);
      const now = new Date();
      let matchesDate = true;
      if (filter === 'today') matchesDate = date.toDateString() === now.toDateString();
      else if (filter === 'month') matchesDate = date.getMonth() === now.getMonth();
      const matchesSearch = order.vb_clients.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDate && matchesSearch;
    });

    const data = filtered.map(o => ({
      Data: new Date(o.created_at).toLocaleString(),
      Cliente: o.vb_clients.name,
      Zona: o.vb_clients.zone,
      Agente: o.vb_clients.agent_ref,
      Totale: o.total_amount,
      Stato: o.status
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ordini");
    XLSX.writeFile(wb, `Ordini_Vinciguerra_${new Date().toLocaleDateString()}.xlsx`);
  };

  // --- EXPORT PDF (Singolo Ordine) ---
  const exportSinglePDF = () => {
    if (!selectedOrder || !orderItems) return;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(173, 146, 99); // Vinciguerra Gold
    doc.text("Vinciguerra Beverage Srl", 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Ordine ID: ${selectedOrder.id}`, 14, 30);
    doc.text(`Cliente: ${selectedOrder.vb_clients.name}`, 14, 37);
    doc.text(`Data: ${new Date(selectedOrder.created_at).toLocaleString()}`, 14, 44);
    doc.text(`Zona: ${selectedOrder.vb_clients.zone || '-'}`, 14, 51);

    const tableData = orderItems.map(item => [
      item.vb_products.name,
      item.vb_products.packaging,
      item.quantity,
      `€ ${item.price_at_time.toFixed(2)}`,
      `€ ${(item.quantity * item.price_at_time).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 60,
      head: [['Prodotto', 'Packaging', 'Quantità', 'Prezzo Unit.', 'Subtotale']],
      body: tableData,
      headStyles: { fillColor: [173, 146, 99] },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 60;
    doc.setFontSize(14);
    doc.text(`TOTALE ORDINE: € ${selectedOrder.total_amount.toFixed(2)}`, 14, finalY + 10);

    doc.save(`Ordine_${selectedOrder.vb_clients.name}.pdf`);
  };

  const filteredOrders = orders.filter(order => {
    const date = new Date(order.created_at);
    const now = new Date();
    let matchesDate = true;
    if (filter === 'today') matchesDate = date.toDateString() === now.toDateString();
    else if (filter === 'month') matchesDate = date.getMonth() === now.getMonth();
    const matchesSearch = order.vb_clients.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (order.vb_clients.zone && order.vb_clients.zone.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesDate && matchesSearch;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <ClipboardList className="text-vinciguerra-gold" size={32} />
          <h1 className="text-3xl font-bold text-vinciguerra-dark">Gestione Ordini</h1>
        </div>
        <button onClick={exportToExcel} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-all">
          <Download size={18} /> Export Excel (Filtro)
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex flex-col md:flex-row gap-4 items-center justify-between border-t-4 border-vinciguerra-gold">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
          {(['all', 'today', 'month'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f ? 'bg-white text-vinciguerra-gold shadow-sm' : 'text-gray-500'}`}>{f === 'all' ? 'Tutti' : f === 'today' ? 'Oggi' : 'Mese'}</button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Cerca cliente o zona..." className="w-full pl-10 pr-4 py-2 border rounded-full text-black outline-none focus:ring-2 focus:ring-vinciguerra-gold" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-vinciguerra-dark text-sm">
            <tr>
              <th className="p-4">Data</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Zona</th>
              <th className="p-4">Totale</th>
              <th className="p-4">Stato</th>
              <th className="p-4 text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (<tr><td colSpan={6} className="p-4 text-center">Caricamento...</td></tr>) : filteredOrders.length === 0 ? (<tr><td colSpan={6} className="p-4 text-center text-gray-500">Nessun ordine.</td></tr>) : (
              filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="p-4 text-sm text-gray-600">{new Date(order.created_at).toLocaleString('it-IT')}</td>
                  <td className="p-4 font-bold text-vinciguerra-dark">{order.vb_clients.name}</td>
                  <td className="p-4 text-sm text-gray-500">{order.vb_clients.zone || '-'}</td>
                  <td className="p-4 font-bold text-vinciguerra-gold">€ {order.total_amount.toFixed(2)}</td>
                  <td className="p-4">
                    <button onClick={() => updateStatus(order.id, order.status)} className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${order.status === 'in_attesa' ? 'bg-orange-100 text-orange-600' : order.status === 'elaborato' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                      {order.status === 'in_attesa' ? <Clock size={12}/> : <CheckCircle size={12}/>} {order.status.toUpperCase()}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => viewOrderDetails(order)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Eye size={20} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DETTAGLI ORDINE */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3">
                <FileText className="text-vinciguerra-gold" />
                <h2 className="text-xl font-bold text-vinciguerra-dark">Dettaglio Ordine</h2>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={24}/></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div><p className="text-gray-400">Cliente</p><p className="font-bold">{selectedOrder.vb_clients.name}</p></div>
                <div><p className="text-gray-400">Data</p><p className="font-bold">{new Date(selectedOrder.created_at).toLocaleString()}</p></div>
                <div><p className="text-gray-400">Zona</p><p className="font-bold">{selectedOrder.vb_clients.zone || '-'}</p></div>
                <div><p className="text-gray-400">Totale</p><p className="font-bold text-vinciguerra-gold text-lg">€ {selectedOrder.total_amount.toFixed(2)}</p></div>
              </div>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-gray-400">
                    <th className="py-2">Prodotto</th>
                    <th className="py-2 text-center">Quantità</th>
                    <th className="py-2 text-right">Prezzo</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {modalLoading ? (<tr><td colSpan={3} className="py-4 text-center">Caricamento prodotti...</td></tr>) : (
                    orderItems.map(item => (
                      <tr key={item.id}>
                        <td className="py-3 font-medium">{item.vb_products.name} <br/><span className="text-[10px] text-gray-400">{item.vb_products.packaging}</span></td>
                        <td className="py-3 text-center">{item.quantity} pz</td>
                        <td className="py-3 text-right font-bold">€ {(item.quantity * item.price_at_time).toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setSelectedOrder(null)} className="px-4 py-2 text-gray-500 font-medium">Chiudi</button>
              <button onClick={exportSinglePDF} className="bg-vinciguerra-gold text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-opacity-90 transition-all">
                <Download size={18} /> Scarica PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}