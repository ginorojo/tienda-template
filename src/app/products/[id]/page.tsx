'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ShoppingCart, 
  ArrowLeft, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2,
  Minus,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { createClient } from '@/utils/supabase/client';

export default function ProductDetail() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (!error && data) {
        setProduct(data);
      }
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">Producto no encontrado</h2>
        <Link href="/" className="btn btn-primary">Volver al inicio</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
      <Link href="/" className="btn btn-ghost btn-sm mb-8 gap-2">
        <ArrowLeft size={18} /> Volver a la Tienda
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        {/* Gallery */}
        <div className="space-y-4">
           <div className="aspect-square rounded-3xl overflow-hidden bg-base-200 border border-base-300">
              <img 
                src={product.image_url || "https://via.placeholder.com/600"} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
           </div>
        </div>

        {/* Info */}
        <div className="space-y-8 flex flex-col justify-center">
          <div className="space-y-4">
            <div className="badge badge-outline badge-lg opacity-60">Nuevo Ingreso 🇨🇱</div>
            <h1 className="text-4xl lg:text-5xl font-black">{product.name}</h1>
            <p className="text-3xl font-bold text-primary">${product.price?.toLocaleString('es-CL')} <span className="text-sm opacity-50 font-normal">incl. IVA</span></p>
          </div>

          <div className="divider"></div>

          <div className="space-y-6">
            <p className="text-lg opacity-70 leading-relaxed">
              {product.description || "Este producto es de alta calidad y cuenta con el respaldo de nuestra tienda."}
            </p>

            <div className="space-y-4">
               <h4 className="font-bold flex items-center gap-2 italic"><Truck className="text-secondary" size={20}/> Envío disponible a todo Chile</h4>
               <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm opacity-60">
                 <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-success"/> Pago Seguro con Flow</li>
                 <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-success"/> Retiro en sucursal</li>
                 <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-success"/> Soporte 24/7</li>
                 <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-success"/> Garantía de satisfacción</li>
               </ul>
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-8">
            <div className="flex items-center gap-4">
              <div className="join border border-base-300 rounded-lg overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="join-item btn btn-ghost btn-sm px-4"><Minus size={18}/></button>
                <span className="join-item flex items-center justify-center font-bold px-6 bg-base-100">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="join-item btn btn-ghost btn-sm px-4"><Plus size={18}/></button>
              </div>
              <button 
                onClick={handleAddToCart}
                className={`btn btn-primary btn-md flex-1 rounded-xl shadow-lg gap-2 tracking-wide ${added ? 'btn-success' : ''}`}
                disabled={product.stock === 0}
              >
                {added ? <CheckCircle2 /> : <ShoppingCart size={20} />}
                {added ? '¡Añadido!' : product.stock === 0 ? 'Sin Stock' : 'Añadir al Carrito'}
              </button>
            </div>
            {product.stock < 10 && product.stock > 0 && (
                <p className="text-error text-sm font-bold flex items-center gap-1 animate-pulse">
                   ¡Solo quedan {product.stock} unidades en bodega!
                </p>
            )}
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-base-200 pt-16 opacity-60">
        <div className="text-center space-y-2">
           <ShieldCheck size={40} className="mx-auto text-primary" />
           <h5 className="font-bold">Pago 100% Seguro</h5>
           <p className="text-xs">Tus transacciones están protegidas por Flow y Webpay.</p>
        </div>
        <div className="text-center space-y-2">
           <Truck size={40} className="mx-auto text-primary" />
           <h5 className="font-bold">Envíos Rápidos</h5>
           <p className="text-xs">Gracias a Shipit cubrimos cada rincón de Chile.</p>
        </div>
        <div className="text-center space-y-2">
           <CheckCircle2 size={40} className="mx-auto text-primary" />
           <h5 className="font-bold">Productos Garantizados</h5>
           <p className="text-xs">Calidad certificada para tu completa tranquilidad.</p>
        </div>
      </div>
    </div>
  );
}
