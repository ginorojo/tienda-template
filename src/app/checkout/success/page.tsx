'use client';

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  CheckCircle2, 
  Package, 
  ArrowRight, 
  ShoppingBag,
  Download
} from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { clearCart } = useCart();

  useEffect(() => {
    // Cuando llegamos a esta página, el pago fue procesado o el usuario volvió de Flow
    clearCart();
  }, [clearCart]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="bg-success/10 p-8 rounded-full text-success mb-8 animate-bounce-slow">
        <CheckCircle2 size={100} strokeWidth={1.5} />
      </div>

      <div className="max-w-2xl space-y-6">
        <h1 className="text-4xl lg:text-5xl font-black text-base-content tracking-tight">
          ¡Gracias por tu compra!
        </h1>
        <p className="text-lg opacity-60 max-w-md mx-auto">
          Tu pedido ha sido procesado con éxito vía **Webpay**. Te hemos enviado un correo de confirmación con los detalles del despacho.
        </p>

        {orderId && (
            <div className="badge badge-lg badge-outline py-4 font-mono select-all cursor-pointer hover:bg-base-200 transition-colors">
                #ORDEN-{orderId.slice(0, 8).toUpperCase()}
            </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
            <Link href="/" className="btn btn-primary btn-lg rounded-full px-10 gap-2">
                Seguir Comprando <ArrowRight size={20}/>
            </Link>
            <button className="btn btn-ghost btn-lg rounded-full px-10 gap-2 border-base-300">
                <Download size={20}/> Descargar Boleta
            </button>
        </div>
      </div>

      {/* Info Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16 max-w-4xl w-full">
         <div className="card bg-base-100 border border-base-200 p-6 flex-row gap-4 items-start text-left shadow-sm">
            <div className="p-3 bg-secondary/10 text-secondary rounded-xl"><Package size={24}/></div>
            <div>
                <h4 className="font-bold">Despacho en Camino</h4>
                <p className="text-sm opacity-50">Tu pedido será gestionado vía **Shipit**. Recibirás el tracking pronto.</p>
            </div>
         </div>
         <div className="card bg-base-100 border border-base-200 p-6 flex-row gap-4 items-start text-left shadow-sm">
            <div className="p-3 bg-info/10 text-info rounded-xl"><ShoppingBag size={24}/></div>
            <div>
                <h4 className="font-bold">Soporte Continuo</h4>
                <p className="text-sm opacity-50">Contáctanos ante cualquier duda con tu número de orden.</p>
            </div>
         </div>
      </div>
    </div>
  );
}
