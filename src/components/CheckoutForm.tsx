'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Truck, 
  MapPin, 
  ChevronRight,
  Info,
  Loader2
} from 'lucide-react';
import chileData from '@/data/chile.json';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
}

export default function CheckoutForm({ cartItems }: { cartItems: CartItem[] }) {
  const [loading, setLoading] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    region: '',
    comuna: '',
  });

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const [regions] = useState(chileData);
  const [comunas, setComunas] = useState<string[]>([]);

  // Update comunas when region changes
  useEffect(() => {
    if (formData.region) {
      const regionData = regions.find(r => r.region === formData.region);
      setComunas(regionData ? regionData.comunas : []);
      setFormData(prev => ({ ...prev, comuna: '' }));
      setShippingOptions([]);
      setSelectedQuote(null);
    }
  }, [formData.region, regions]);

  // Handle shipping quote
  const calculateShipping = async () => {
    if (!formData.comuna) return;
    
    setShippingLoading(true);
    setShippingOptions([]);
    setSelectedQuote(null);
    
    try {
      const response = await fetch('/api/shipping/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commune_name: formData.comuna,
          items: cartItems.map(i => ({ 
            amount: i.quantity, 
            weight: i.weight || 1, 
            length: i.length || 15, 
            width: i.width || 15, 
            height: i.height || 10 
          }))
        })
      });
      const data = await response.json();
      if (data.quotes && data.quotes.length > 0) {
        setShippingOptions(data.quotes);
        // Pre-seleccionar el primero o el más barato
        setSelectedQuote(data.quotes[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setShippingLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedQuote) return;
    
    setLoading(true);
    try {
      const total = subtotal + selectedQuote.total;
      
      const response = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          total,
          shipping_cost: selectedQuote.total,
          courier_id: selectedQuote.id,
          courier_name: selectedQuote.name,
          items: cartItems
        })
      });
      
      const { url } = await response.json();
      if (url) window.location.href = url;
    } catch (err) {
        console.error(err);
        alert('Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto p-4">
      {/* 1. Form Column */}
      <div className="space-y-6">
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body">
            <h2 className="card-title mb-4 flex items-center gap-2">
              <MapPin className="text-primary" /> Datos de Despacho
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="form-control">
                <label className="label"><span className="label-text">Nombre Completo</span></label>
                <input 
                    type="text" 
                    className="input input-bordered" 
                    placeholder="Juan Pérez"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">E-mail</span></label>
                <input 
                    type="email" 
                    className="input input-bordered" 
                    placeholder="juan@correo.com"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text">Teléfono</span></label>
                <input 
                    type="tel" 
                    className="input input-bordered" 
                    placeholder="+569 1234 5678"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Dirección y Número</span></label>
                <input 
                  type="text" 
                  placeholder="Ej. Av. Providencia 1234" 
                  className="input input-bordered" 
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text">Región</span></label>
                <select 
                    className="select select-bordered" 
                    value={formData.region}
                    onChange={e => setFormData({...formData, region: e.target.value})}
                >
                  <option value="">Selecciona Región</option>
                  {regions.map(r => <option key={r.region} value={r.region}>{r.region}</option>)}
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Comuna</span></label>
                <select 
                    className="select select-bordered" 
                    disabled={!formData.region}
                    value={formData.comuna}
                    onChange={e => setFormData({...formData, comuna: e.target.value})}
                    onBlur={calculateShipping}
                >
                  <option value="">Selecciona Comuna</option>
                  {comunas.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            
            {shippingLoading && (
                <div className="flex items-center justify-center p-4 gap-2 text-primary font-medium">
                    <Loader2 className="animate-spin" /> Consultando opciones de envío...
                </div>
            )}

            {!shippingLoading && shippingOptions.length > 0 && (
                <div className="mt-6 space-y-3">
                    <h3 className="text-sm font-bold opacity-70 flex items-center gap-2">
                        <Truck size={16} /> Selecciona tu método de envío
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                        {shippingOptions.map((option) => (
                            <div 
                                key={`${option.id}-${option.name}`}
                                onClick={() => setSelectedQuote(option)}
                                className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${
                                    selectedQuote?.id === option.id && selectedQuote?.name === option.name
                                    ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                                    : 'border-base-200 hover:border-primary/50'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="radio" 
                                        name="shipping" 
                                        className="radio radio-primary radio-sm"
                                        checked={selectedQuote?.id === option.id && selectedQuote?.name === option.name}
                                        onChange={() => setSelectedQuote(option)}
                                    />
                                    <div>
                                        <p className="font-bold text-sm">{option.name}</p>
                                        <p className="text-[10px] opacity-60">Llega en {option.days} día(s) aprox.</p>
                                    </div>
                                </div>
                                <span className="font-mono font-bold text-primary">
                                    ${option.total.toLocaleString('es-CL')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {shippingOptions.length === 0 && !shippingLoading && formData.comuna && (
                <button 
                    onClick={calculateShipping}
                    className="btn btn-ghost btn-outline btn-sm mt-4 gap-2"
                >
                    <Truck size={16} /> Calcular Costo de Envío
                </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Summary Column */}
      <div className="space-y-6">
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body">
            <h2 className="card-title mb-6">Resumen del Pedido</h2>
            
            <div className="space-y-4">
               {cartItems.map(item => (
                   <div key={item.id} className="flex justify-between items-center text-sm border-b pb-2">
                       <div>
                           <span className="font-semibold">{item.quantity}x</span> {item.name}
                       </div>
                       <span className="font-mono">${(item.price * item.quantity).toLocaleString('es-CL')}</span>
                   </div>
               ))}
            </div>

            <div className="divider my-4"></div>

            <div className="space-y-2">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between text-info">
                    <span className="flex items-center gap-1">Despacho (Shipit) <Truck size={14}/></span>
                    <span>{selectedQuote ? `$${selectedQuote.total.toLocaleString('es-CL')}` : '--'}</span>
                </div>
                {selectedQuote && (
                    <p className="text-[10px] text-info italic text-right">
                        Seleccionado: {selectedQuote.name}
                    </p>
                )}
                <div className="flex justify-between font-bold text-lg mt-4 border-t pt-4">
                    <span>Total a Pagar</span>
                    <span className="text-primary">${(subtotal + (selectedQuote?.total || 0)).toLocaleString('es-CL')}</span>
                </div>
            </div>

            <div className="card-actions mt-8">
              <button 
                onClick={handlePayment}
                disabled={loading || !selectedQuote || !formData.email || !formData.phone}
                className="btn btn-primary btn-block btn-lg gap-3"
              >
                {loading ? <Loader2 className="animate-spin" /> : <CreditCard size={20} />}
                Pagar con Flow (Webpay)
              </button>
              {!formData.phone && formData.email && (
                  <p className="text-[10px] text-error text-center w-full mt-2">
                      * Ingresa tu teléfono para continuar
                  </p>
              )}
              <p className="text-[10px] text-center w-full opacity-50 flex items-center justify-center gap-1 mt-2">
                  <Info size={10} /> Serás redirigido de forma segura a Flow.cl
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
