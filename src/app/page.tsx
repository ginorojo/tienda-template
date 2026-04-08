import React from 'react';
import Link from 'next/link';
import { ShoppingCart, ArrowRight, Truck, ShieldCheck, Zap } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';



export default async function Home() {
  let products: any[] = [];
  
  try {
    const supabase = await createClient();
    if (supabase && typeof supabase.from === 'function') {
      const { data } = await supabase
        .from('products')
        .select('*')
        .limit(8);
      products = data || [];
    }
  } catch (err) {
    console.error("❌ Error recuperando productos en Home:", err);
  }

  return (
    <div className="bg-base-100 flex flex-col min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="hero min-h-[70vh] bg-base-200 px-4">
        <div className="hero-content flex-col lg:flex-row-reverse gap-12 max-w-7xl mx-auto">
          <div className="lg:w-1/2">
             <img 
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop" 
                className="rounded-3xl shadow-2xl animate-float" 
                alt="Banner Ecommerce"
             />
          </div>
          <div className="lg:w-1/2 text-center lg:text-left space-y-6">
            <div className="badge badge-secondary badge-outline font-semibold gap-2 py-3 px-4 mb-4">
              <Zap size={16} /> Envío Express a todo Chile
            </div>
            <h1 className="text-5xl lg:text-6xl font-black leading-tight">
              Tus Productos Favoritos <br/>
              <span className="text-primary italic">A un Click de Distancia.</span>
            </h1>
            <p className="text-xl opacity-80 leading-relaxed max-w-lg">
                La tienda de confianza para comprar en Chile. Paga con Webpay de forma segura y recibe con Shipit en tiempo record.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
               <Link href="/products" className="btn btn-primary btn-lg rounded-full px-8 shadow-xl hover:scale-105 transition-transform duration-300">
                  Comenzar a Comprar <ArrowRight size={20} />
               </Link>
               <Link href="/about" className="btn btn-ghost btn-lg rounded-full px-8 border-base-300">
                  Nuestra Historia
               </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURES GRID */}
      <section className="py-16 bg-base-100 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4 p-6 rounded-2xl bg-base-200 border border-base-300">
                <div className="p-4 bg-primary/10 rounded-full text-primary"><Truck size={32}/></div>
                <div><h4 className="font-bold text-lg">Envíos a Todo Chile</h4><p className="text-sm opacity-70">Rastreo con Shipit en tiempo real.</p></div>
            </div>
            <div className="flex items-center gap-4 p-6 rounded-2xl bg-base-200 border border-base-300">
                <div className="p-4 bg-secondary/10 rounded-full text-secondary"><ShieldCheck size={32}/></div>
                <div><h4 className="font-bold text-lg">Pagos Seguros</h4><p className="text-sm opacity-70">Transbank / Webpay vía Flow.cl.</p></div>
            </div>
            <div className="flex items-center gap-4 p-6 rounded-2xl bg-base-200 border border-base-300">
                <div className="p-4 bg-info/10 rounded-full text-info"><ShoppingCart size={32}/></div>
                <div><h4 className="font-bold text-lg">Miles de Clientes</h4><p className="text-sm opacity-70">Confianza garantizada en cada compra.</p></div>
            </div>
        </div>
      </section>

      {/* 3. PRODUCTS GRID */}
      <section className="py-20 px-4 bg-white/50 dark:bg-black/20">
        <div className="max-w-7xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                   <h2 className="text-4xl font-black">Novedades de la Semana</h2>
                   <p className="text-lg opacity-60">Escogidos a mano para tu estilo.</p>
                </div>
                <Link href="/products" className="link link-primary font-bold flex items-center gap-1 group">
                   Ver todos los productos <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {products?.map((product: any) => (
                    <div key={product.id} className="card bg-base-100 shadow-xl group overflow-hidden hover:shadow-2xl transition-all duration-300">
                        <figure className="aspect-[4/5] overflow-hidden relative">
                            <img 
                                src={product.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop"} 
                                alt={product.name} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            {product.stock < 5 && (
                                <div className="absolute top-4 left-4 badge badge-error text-white font-bold animate-pulse">
                                    ¡Últimas unidades!
                                </div>
                            )}
                        </figure>
                        <div className="card-body p-6">
                            <div className="flex flex-col gap-1">
                                <h3 className="card-title text-xl font-bold">{product.name}</h3>
                                <p className="text-2xl font-black text-primary">${product.price?.toLocaleString('es-CL')}</p>
                            </div>
                            <div className="card-actions justify-end mt-4">
                                <Link href={`/products/${product.id}`} className="btn btn-primary btn-block rounded-lg gap-2">
                                    <ShoppingCart size={18} /> Ver Detalles
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}

                {(!products || products.length === 0) && (
                    <div className="col-span-full py-20 text-center opacity-40">
                         <p>No hay productos disponibles por ahora.</p>
                    </div>
                )}
            </div>
        </div>
      </section>

      {/* Footer Placeholder */}
      <footer className="footer footer-center p-10 bg-base-200 text-base-content rounded mt-auto">
        <aside>
          <p className="font-bold">TIENDA.CL <br/>E-commerce Boilerplate optimizado para Chile.</p> 
          <p>Copyright © 2026 - Todos los derechos reservados.</p>
        </aside>
      </footer>
    </div>
  );
}

function ChevronRight({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>;
}
