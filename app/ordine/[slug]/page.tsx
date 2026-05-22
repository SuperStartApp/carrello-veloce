"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Lock, ArrowLeft, ShoppingBag, Plus, Minus, ChevronRight, Package, Image as ImageIcon, ArrowRight, CheckCircle, History, Eye, FileText, X, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Category { id: string; name: string; parent_id: string | null; }
interface Product { id: string; name: string; category_id: string; packaging: string; base_price: number; image_url: string | null; min_qty: number; }
interface Order { id: string; total_amount: number; status: string; created_at: string; }
interface OrderItem { id: string; product_id: string; quantity: number; price_at_time: number; vb_products: { name: string; packaging: string }; }

export default function ClienteOrdinePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [client, setClient] = useState<any>(null);
  const [pinInput, setPinInput] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderSent, setOrderSent] = useState(false);
  const [currentTab, setCurrentTab] = useState<'shop' | 'history'>('shop');

  const [view, setView] = useState<'categories' | 'subcategories' | 'products'>('categories');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [discounts, setDiscounts] = useState<Record<string, number>>({});
  const [cart, setCart] = useState<Record<string, number>>({});
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    const initPage = async () => {
      try {
        const { data: clientData } = await supabase.from('vb_clients').select('*').eq('slug', slug).eq('is_active', true).single();
        if (!clientData) { setError('Cliente non trovato.'); return; }
        setClient(clientData);
        const { data: catsData } = await supabase.from('vb_categories').select('*').order('name');
        setCategories(catsData || []);
        const { data: prodData } = await supabase.from('vb_products').select('*');
        setProducts(prodData || []);
        const { data: discData } = await supabase.from('vb_price_lists').select('category_id, discount_percentage').eq('client_id', clientData.id);
        const discMap: Record<string, number> = {};
        discData?.forEach(d => { discMap[d.category_id] = d.discount_percentage; });
        setDiscounts(discMap);
      } catch (err) { setError('Errore di caricamento.'); }
      finally { setLoading(false); }
    };
    initPage();
  }, [slug]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (client.pin === pinInput) setIsLoggedIn(true);
    else setError('PIN errato.');
  };

  const fetchMyOrders = async () => {
    const { data } = await supabase.from('vb_orders').select('*').eq('client_id', client.id).order('created_at', { ascending: false });
    setMyOrders(data || []);
  };

  const viewOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    const { data } = await supabase.from('vb_order_items').select(`*, vb_products(name, packaging)`).eq('order_id', order.id);
    setOrderItems(data || []);
  };

  const downloadOrderPDF = () => {
    if (!selectedOrder || !orderItems) return;
    const doc = new jsPDF();
    doc.setTextColor(173, 146, 99); doc.setFontSize(20); doc.text("Vinciguerra Beverage Srl", 105, 20, { align: 'center' });
    doc.setTextColor(0, 0, 0); doc.setFontSize(12);
    doc.text(`Ordine: ${selectedOrder.id}`, 14, 30);
    doc.text(`Data: ${new Date(selectedOrder.created_at).toLocaleString()}`, 14, 37);
    doc.text(`Stato: ${selectedOrder.status.toUpperCase()}`, 14, 44);
    autoTable(doc, {
      startY: 55,
      head: [['Prodotto', 'Packaging', 'Quantità', 'Subtotale']],
      body: orderItems.map(i => [i.vb_products.name, i.vb_products.packaging, i.quantity, `€ ${(i.quantity * i.price_at_time).toFixed(2)}`]),
      headStyles: { fillColor: [173, 146, 99] },
    });
    doc.text(`TOTALE: € ${selectedOrder.total_amount.toFixed(2)}`, 14, (doc as any).lastAutoTable.finalY + 10);
    doc.save(`Ordine_${selectedOrder.id}.pdf`);
  };

  const updateQty = (product: Product, delta: number) => {
    setCart(prev => {
      const currentQty = prev[product.id] || 0;
      const min = product.min_qty || 1;
      let newQty = currentQty + (delta * min);
      if (newQty < 0) newQty = 0;
      if (newQty === 0) { const { [product.id]: _, ...rest } = prev; return rest; }
      return { ...prev, [product.id]: newQty };
    });
  };

  const getFinalPrice = (product: Product) => {
    const catDiscount = discounts[product.category_id] || 0;
    const extra = client?.extra_discount || 0;
    return product.base_price * (1 - catDiscount / 100) * (1 - extra / 100);
  };

  const submitOrder = async () => {
    try {
      const totalAmount = Object.entries(cart).reduce((total, [id, qty]) => {
        const prod = products.find(p => p.id === id);
        return total + (prod ? getFinalPrice(prod) * qty : 0);
      }, 0);
      const { data: order, error: oErr } = await supabase.from('vb_orders').insert([{ client_id: client.id, total_amount: totalAmount, status: 'in_attesa' }]).select().single();
      if (oErr) throw oErr;
      const items = Object.entries(cart).map(([prodId, qty]) => {
        const prod = products.find(p => p.id === prodId)!;
        return { order_id: order.id, product_id: prodId, quantity: qty, price_at_time: getFinalPrice(prod) };
      });
      await supabase.from('vb_order_items').insert(items);
      setCart({}); setOrderSent(true);
    } catch (err) { alert('Errore invio ordine.'); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vinciguerra-gold"></div></div>;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl text-center">
          <Lock className="mx-auto text-vinciguerra-gold mb-4" size={48} />
          <h1 className="text-2xl font-bold text-vinciguerra-dark mb-2">Benvenuto!</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" maxLength={6} placeholder="PIN" className="w-full text-center text-3xl tracking-[0.5em] p-3 border-2 border-gray-200 rounded-xl focus:border-vinciguerra-gold outline-none text-black" value={pinInput} onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))} required />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" className="w-full bg-vinciguerra-gold text-white py-4 rounded-xl font-bold text-lg">Accedi</button>
          </form>
        </div>
      </div>
    );
  }

  if (orderSent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
          <h1 className="text-3xl font-bold text-vinciguerra-dark mb-2">Ordine Inviato!</h1>
          <p className="text-gray-500 mb-8">Il tuo ordine è stato ricevuto correttamente.</p>
          <button onClick={() => setOrderSent(false)} className="w-full bg-vinciguerra-gold text-white py-4 rounded-xl font-bold text-lg">Nuovo Ordine</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <header className="bg-white shadow-sm sticky top-0 z-50 px-4 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="font-bold text-vinciguerra-dark text-lg">Vinciguerra</span>
            <div className="flex bg-gray-100 p-1 rounded-lg text-xs font-medium">
              <button onClick={() => setCurrentTab('shop')} className={`px-3 py-1 rounded-md transition-all ${currentTab === 'shop' ? 'bg-white text-vinciguerra-gold shadow-sm' : 'text-gray-500'}`}>Negozio</button>
              <button onClick={() => { setCurrentTab('history'); fetchMyOrders(); }} className={`px-3 py-1 rounded-md transition-all ${currentTab === 'history' ? 'bg-white text-vinciguerra-gold shadow-sm' : 'text-gray-500'}`}>I miei Ordini</button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-vinciguerra-gold">
            <ShoppingBag size={20} />
            <span>{Object.values(cart).reduce((a, b) => a + b, 0)} pz</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4">
        {currentTab === 'shop' ? (
          <>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap">
              <button onClick={() => { setView('categories'); setSelectedParentId(null); setSelectedSubCategoryId(null); }} className="hover:text-vinciguerra-gold">Home</button>
              {selectedParentId && (<><ChevronRight size={14} /><button onClick={() => { setView('subcategories'); setSelectedSubCategoryId(null); }} className="hover:text-vinciguerra-gold">{categories.find(c => c.id === selectedParentId)?.name}</button></>)}
              {selectedSubCategoryId && (<><ChevronRight size={14} /><span className="text-vinciguerra-dark font-medium">{categories.find(c => c.id === selectedSubCategoryId)?.name}</span></>)}
            </div>
            {view === 'categories' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categories.filter(c => !c.parent_id).map(cat => (
                  <button key={cat.id} onClick={() => { setSelectedParentId(cat.id); setView('subcategories'); }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 hover:border-vinciguerra-gold transition-all h-32">
                    <Package className="text-vinciguerra-gold" size={32} /><span className="font-bold text-vinciguerra-dark">{cat.name}</span>
                  </button>
                ))}
              </div>
            )}
            {view === 'subcategories' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categories.filter(c => c.parent_id === selectedParentId).map(sub => (
                  <button key={sub.id} onClick={() => { setSelectedSubCategoryId(sub.id); setView('products'); }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 hover:border-vinciguerra-gold transition-all h-32">
                    <ChevronRight className="text-vinciguerra-gold" size={32} /><span className="font-bold text-vinciguerra-dark">{sub.name}</span>
                  </button>
                ))}
              </div>
            )}
            {view === 'products' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.filter(p => p.category_id === selectedSubCategoryId).map(prod => {
                  const finalPrice = getFinalPrice(prod);
                  const qty = cart[prod.id] || 0;
                  return (
                    <div key={prod.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 flex flex-col">
                      <div className="h-48 bg-gray-50 relative">
                        {prod.image_url ? <img src={prod.image_url} alt={prod.name} className="w-full h-full object-contain p-2" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={48}/></div>}
                        <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-[10px] font-bold text-vinciguerra-gold shadow-sm">{prod.packaging}</div>
                      </div>
                      <div className="p-4 flex-grow flex flex-col">
                        <h3 className="font-bold text-vinciguerra-dark mb-1">{prod.name}</h3>
                        <div className="text-xl font-bold text-vinciguerra-gold mb-1">€ {finalPrice.toFixed(2)}</div>
                        <p className="text-xs text-gray-400 mb-4">Minimo ordine: {prod.min_qty} pz</p>
                        {qty > 0 ? (
                          <div className="flex items-center justify-between bg-gray-100 rounded-xl p-1">
                            <button onClick={() => updateQty(prod, -1)} className="p-2 text-vinciguerra-gold"><Minus size={20}/></button>
                            <span className="font-bold text-vinciguerra-dark">{qty} pz</span>
                            <button onClick={() => updateQty(prod, 1)} className="p-2 text-vinciguerra-gold"><Plus size={20}/></button>
                          </div>
                        ) : (
                          <button onClick={() => updateQty(prod, 1)} className="w-full bg-gray-100 text-vinciguerra-dark py-3 rounded-xl font-bold hover:bg-vinciguerra-gold hover:text-white transition-all flex items-center justify-center gap-2"><Plus size={18} /> Aggiungi {prod.min_qty > 1 ? `${prod.min_qty} pz` : '1 pz'}</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-vinciguerra-dark mb-6 flex items-center gap-2"><History className="text-vinciguerra-gold" /> I miei ordini</h2>
            {myOrders.length === 0 ? (
              <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border-2 border-dashed">Non hai ancora effettuato ordini.</div>
            ) : (
              <div className="grid gap-4">
                {myOrders.map(order => (
                  <div key={order.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-vinciguerra-dark">{new Date(order.created_at).toLocaleDateString('it-IT')}</p>
                      <p className="text-sm text-gray-500">Totale: € {order.total_amount.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${order.status === 'in_attesa' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>{order.status}</span>
                      <button onClick={() => viewOrderDetails(order)} className="p-2 bg-gray-100 text-vinciguerra-dark rounded-full hover:bg-vinciguerra-gold hover:text-white transition-all"><Eye size={18}/></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL DETTAGLI ORDINE CLIENTE */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3 font-bold text-vinciguerra-dark"><FileText className="text-vinciguerra-gold" /> Dettaglio Ordine</div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-200 rounded-full"><X size={20}/></button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="text-center mb-6">
                <p className="text-gray-400 text-xs uppercase">Totale Ordine</p>
                <p className="text-3xl font-bold text-vinciguerra-gold">€ {selectedOrder.total_amount.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>
              <div className="space-y-3">
                {orderItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <p className="font-medium text-sm text-vinciguerra-dark">{item.vb_products.name}</p>
                      <p className="text-[10px] text-gray-400">{item.vb_products.packaging} x {item.quantity}</p>
                    </div>
                    <p className="font-bold text-sm">€ {(item.quantity * item.price_at_time).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex gap-3">
              <button onClick={() => setSelectedOrder(null)} className="flex-1 py-3 text-gray-500 font-medium">Chiudi</button>
              <button onClick={downloadOrderPDF} className="flex-1 bg-vinciguerra-gold text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"><Download size={18} /> PDF</button>
            </div>
          </div>
        </div>
      )}

      {currentTab === 'shop' && Object.keys(cart).length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
          <div className="bg-vinciguerra-dark text-white p-4 rounded-2xl shadow-2xl flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-vinciguerra-gold text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">{Object.values(cart).reduce((a, b) => a + b, 0)}</div>
              <div><p className="text-xs text-gray-400">Totale stimato</p><p className="font-bold text-lg">€ {Object.entries(cart).reduce((t, [id, q]) => t + (getFinalPrice(products.find(p => p.id === id)!) * q), 0).toFixed(2)}</p></div>
            </div>
            <button onClick={submitOrder} className="bg-vinciguerra-gold px-6 py-2 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2">Invia Ordine <ArrowRight size={18}/></button>
          </div>
        </div>
      )}
    </div>
  );
}