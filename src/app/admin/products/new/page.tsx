'use client';
export const dynamic = "force-dynamic";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  Image as ImageIcon,
  Loader2,
  Package,
  DollarSign,
  Truck,
  Box,
  CheckCircle2,
  AlertCircle,
  X,
  Info
} from 'lucide-react';
import Link from 'next/link';
import { uploadImage } from '@/services/cloudinary';
import { createClient } from '@/utils/supabase/client';

export default function NewProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    price: '',
    stock: '0',
    weight: '1.0',
    width: '10',
    height: '10',
    length: '10',
  });

  const supabase = createClient();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      let imageUrl = '';
      
      // 1. Upload to Cloudinary if file exists
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      // 2. Save to Supabase
      const { error } = await supabase.from('products').insert([
        {
          sku: formData.sku,
          name: formData.name,
          description: formData.description,
          price: parseInt(formData.price) || 0,
          stock: parseInt(formData.stock) || 0,
          weight: parseFloat(formData.weight) || 1.0,
          width: parseInt(formData.width) || 10,
          height: parseInt(formData.height) || 10,
          length: parseInt(formData.length) || 10,
          image_url: imageUrl,
        }
      ]);

      if (error) throw error;

      setStatus({ type: 'success', message: '¡Producto creado exitosamente! Redirigiendo...' });
      
      setTimeout(() => {
        router.push('/admin/products');
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setStatus({ type: 'error', message: `Error: ${err.message}` });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      {/* Header with Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-8 border-b mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="btn btn-circle btn-ghost bg-base-200 hover:bg-base-300 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
              <Package className="text-primary" /> Nuevo Producto
            </h1>
            <p className="text-gray-500 text-sm">Completa los detalles para añadir un nuevo artículo al catálogo.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
            <Link href="/admin/products" className="btn btn-ghost flex-1 md:flex-none">Cancelar</Link>
            <button 
                onClick={(e: any) => handleSubmit(e)}
                form="product-form"
                disabled={loading}
                className="btn btn-primary px-8 gap-2 flex-1 md:flex-none shadow-lg shadow-primary/20"
            >
                {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                {loading ? 'Guardando...' : 'Publicar Producto'}
            </button>
        </div>
      </div>

      {/* Status Messages */}
      {status.type && (
        <div className={`mb-8 alert ${status.type === 'success' ? 'alert-success' : 'alert-error'} shadow-sm animate-in fade-in slide-in-from-top-4 duration-300`}>
          {status.type === 'success' ? <CheckCircle2 /> : <AlertCircle />}
          <span>{status.message}</span>
        </div>
      )}

      <form id="product-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Main Form Area */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section: General Info */}
          <section className="card bg-base-100 border border-base-200 shadow-sm overflow-hidden">
             <div className="bg-base-50 px-6 py-4 border-b border-base-200 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Info className="text-primary" size={18} />
                </div>
                <h2 className="font-bold text-lg">Información General</h2>
             </div>
             
             <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-control w-full">
                    <label className="label">
                        <span className="label-text font-bold text-xs uppercase tracking-wider opacity-60">SKU del Producto</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ej. CAM-AZUL-01" 
                      className="input input-bordered w-full font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      value={formData.sku}
                      onChange={(e) => setFormData({...formData, sku: e.target.value.toUpperCase()})}
                    />
                    <label className="label">
                        <span className="label-text-alt text-gray-400 italic">Identificador único inventario</span>
                    </label>
                  </div>

                  <div className="form-control w-full">
                    <label className="label">
                        <span className="label-text font-bold text-xs uppercase tracking-wider opacity-60">Nombre Comercial</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ej. Polera Algodón Premium" 
                      className="input input-bordered w-full focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-bold text-xs uppercase tracking-wider opacity-60">Descripción Detallada</span>
                  </label>
                  <textarea 
                    className="textarea textarea-bordered h-40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all leading-relaxed" 
                    placeholder="Describe las características principales, materiales, y beneficios del producto..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  ></textarea>
                </div>
             </div>
          </section>

          {/* Section: Pricing & Inventory */}
          <section className="card bg-base-100 border border-base-200 shadow-sm overflow-hidden">
             <div className="bg-base-50 px-6 py-4 border-b border-base-200 flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                    <DollarSign className="text-success" size={18} />
                </div>
                <h2 className="font-bold text-lg">Precios e Inventario</h2>
             </div>
             
             <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="form-control">
                  <label className="label">
                    <span className="label-text font-bold text-xs uppercase tracking-wider opacity-60">Precio de Venta</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 font-bold">$</span>
                    <input 
                        type="number" 
                        required
                        className="input input-bordered w-full pl-8 font-bold text-lg" 
                        placeholder="0"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                    <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 text-xs">CLP</span>
                  </div>
               </div>

               <div className="form-control">
                  <label className="label">
                    <span className="label-text font-bold text-xs uppercase tracking-wider opacity-60">Stock Inicial</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <input 
                        type="number" 
                        className="input input-bordered flex-1 focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    />
                    <div className="badge badge-lg py-4 px-6 bg-base-200 border-none font-semibold">Unidades</div>
                  </div>
               </div>
             </div>
          </section>

          {/* Section: Shipping (Shipit) */}
          <section className="card bg-base-100 border border-base-200 shadow-sm overflow-hidden">
             <div className="bg-base-50 px-6 py-4 border-b border-base-200 flex items-center gap-3">
                <div className="p-2 bg-info/10 rounded-lg">
                    <Truck className="text-info" size={18} />
                </div>
                <h2 className="font-bold text-lg">Información de Envío</h2>
             </div>
             
             <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="form-control">
                    <label className="label"><span className="label-text text-xs font-bold uppercase opacity-60">Peso (kg)</span></label>
                    <input 
                      type="number" 
                      step="0.1"
                      className="input input-bordered w-full" 
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label"><span className="label-text text-xs font-bold uppercase opacity-60">Largo (cm)</span></label>
                    <input 
                      type="number" 
                      className="input input-bordered w-full" 
                      value={formData.length}
                      onChange={(e) => setFormData({...formData, length: e.target.value})}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label"><span className="label-text text-xs font-bold uppercase opacity-60">Ancho (cm)</span></label>
                    <input 
                      type="number" 
                      className="input input-bordered w-full" 
                      value={formData.width}
                      onChange={(e) => setFormData({...formData, width: e.target.value})}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label"><span className="label-text text-xs font-bold uppercase opacity-60">Alto (cm)</span></label>
                    <input 
                      type="number" 
                      className="input input-bordered w-full" 
                      value={formData.height}
                      onChange={(e) => setFormData({...formData, height: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex gap-2 p-3 bg-blue-50 rounded-lg text-blue-800 text-xs items-start">
                    <Info size={16} className="shrink-0 mt-0.5" />
                    <p>Estos datos son esenciales para calcular las tarifas de envío automáticas a través de Shipit.cl.</p>
                </div>
             </div>
          </section>

        </div>

        {/* RIGHT COLUMN: Media & Preview */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Section: Multimedia */}
          <section className="card bg-base-100 border border-base-200 shadow-sm overflow-hidden">
             <div className="bg-base-50 px-6 py-4 border-b border-base-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-warning/10 rounded-lg">
                        <ImageIcon className="text-warning" size={18} />
                    </div>
                    <h2 className="font-bold text-lg">Multimedia</h2>
                </div>
                {imagePreview && (
                    <button 
                        type="button"
                        onClick={removeImage}
                        className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                    >
                        <X size={14} /> Quitar
                    </button>
                )}
             </div>
             
             <div className="p-6">
                <div className="relative group overflow-hidden bg-base-100 border-2 border-dashed border-base-300 rounded-2xl hover:border-primary transition-colors cursor-pointer group">
                  {imagePreview ? (
                     <div className="relative aspect-square w-full">
                        <img src={imagePreview} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" alt="Vista previa" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <p className="text-white font-bold text-sm flex items-center gap-2"><Upload size={18} /> Cambiar Foto</p>
                        </div>
                     </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <div className="mb-4 p-4 bg-base-100 rounded-full shadow-inner ring-4 ring-base-50">
                            <Upload size={32} className="text-gray-300 group-hover:text-primary transition-colors" />
                        </div>
                        <p className="font-bold text-sm text-gray-600 mb-1">Click o arrastra para subir</p>
                        <p className="text-xs text-gray-400">Recomendado: 1000x1000px</p>
                    </div>
                  )}
                  <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                </div>
             </div>
          </section>

          {/* Section: Live Preview Card */}
          <div className="sticky top-8 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-center opacity-40">Vista Previa de Tienda</h3>
              <div className="card bg-white shadow-2xl border border-gray-100 overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
                  <div className="aspect-square w-full bg-gray-50 flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <Box size={60} className="text-gray-200" />
                    )}
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-xl leading-tight line-clamp-2">
                            {formData.name || 'Nombre del Producto'}
                        </h4>
                        <div className="badge badge-ghost text-[10px] font-mono shrink-0">{formData.sku || 'SKU-XXX'}</div>
                    </div>
                    <p className="text-gray-500 text-xs line-clamp-2 min-h-[32px]">
                        {formData.description || 'Aquí aparecerá la descripción detallada de tu producto una vez que la escribas...'}
                    </p>
                    <div className="flex items-center justify-between pt-2">
                        <span className="text-2xl font-black text-primary">
                            ${parseInt(formData.price || '0').toLocaleString('es-CL')}
                        </span>
                        <div className="badge badge-sm badge-success font-bold text-white px-3">En Stock</div>
                    </div>
                    <button type="button" className="btn btn-primary btn-block btn-sm mt-2 no-animation cursor-default pointer-events-none">
                        Añadir al Carrito
                    </button>
                  </div>
              </div>
              
              <div className="bg-warning/10 p-4 rounded-xl flex gap-3 text-warning-content text-xs">
                <AlertCircle size={20} className="shrink-0" />
                <p>Recuerda revisar que el precio y las dimensiones sean correctas antes de publicar. Una vez publicado, el producto estará disponible de inmediato.</p>
              </div>
          </div>

        </div>
      </form>
    </div>
  );
}
