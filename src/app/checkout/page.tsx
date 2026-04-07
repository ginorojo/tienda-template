'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import CheckoutForm from '@/components/CheckoutForm';
import { ShoppingBag, ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart, subtotal, removeFromCart, totalItems } = useCart();

  if (totalItems === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center px-4">
        <div className="p-8 bg-base-200 rounded-full text-gray-400">
           <ShoppingBag size={80} strokeWidth={1} />
        </div>
        <div className="space-y-2">
            <h2 className="text-3xl font-black">Tu carrito está vacío</h2>
            <p className="text-gray-500">¿Buscas algo especial? Explora nuestras categorías.</p>
        </div>
        <Link href="/" className="btn btn-primary btn-lg rounded-full px-12 mt-4">
            Volver a la Tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-base-50 min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-base-200 pb-8">
            <div>
                <h1 className="text-4xl font-black tracking-tight">Finalizar Compra</h1>
                <p className="opacity-50 flex items-center gap-2 mt-2">
                    <ShoppingBag size={18} /> Estás a un paso de completar tu pedido.
                </p>
            </div>
            <Link href="/" className="btn btn-ghost btn-sm gap-2">
                <ArrowLeft size={18} /> Seguir Comprando
            </Link>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
            
            {/* 1. Item List (Left) */}
            <div className="xl:col-span-1 space-y-4">
                <h3 className="text-xl font-bold px-2">Tu Selección</h3>
                <div className="space-y-3">
                    {cart.map((item) => (
                        <div key={item.id} className="card bg-base-100 shadow-sm border border-base-200 p-4 transition-all hover:border-primary/30">
                            <div className="flex gap-4 items-center">
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-base-200 flex-shrink-0">
                                    <img src={item.image_url || "https://via.placeholder.com/100"} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</h4>
                                    <p className="text-sm opacity-50">{item.quantity} unidad(es)</p>
                                    <p className="font-mono text-primary font-bold mt-1">${(item.price * item.quantity).toLocaleString('es-CL')}</p>
                                </div>
                                <button 
                                    onClick={() => removeFromCart(item.id)}
                                    className="btn btn-circle btn-ghost btn-xs text-error"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="card bg-primary text-primary-content p-6 rounded-2xl shadow-lg mt-8">
                    <div className="flex justify-between items-center">
                        <span className="font-medium opacity-80 italic">Subtotal actual:</span>
                        <span className="text-2xl font-black">${subtotal.toLocaleString('es-CL')}</span>
                    </div>
                </div>
            </div>

            {/* 2. Form (Right/Center) */}
            <div className="xl:col-span-2">
                <CheckoutForm cartItems={cart} />
            </div>

        </div>

      </div>
    </div>
  );
}
