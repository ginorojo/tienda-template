'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Trash2, 
  Edit3, 
  Plus, 
  Search,
  AlertCircle,
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { parseExcelFile, ExcelProduct } from '@/services/excel';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<{
    created: number;
    updated: number;
    errors: string[];
    total: number;
  } | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setProducts(data || []);
    }
    setLoading(false);
  }

  async function deleteProduct(id: string) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) {
        setProducts(products.filter(p => p.id !== id));
      }
    }
  }

  async function handleExcelUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    setImportResult(null);

    try {
      const { products: excelProducts, errors: parseErrors } = await parseExcelFile(file);
      
      if (excelProducts.length === 0 && parseErrors.length > 0) {
        setImportResult({
          created: 0,
          updated: 0,
          errors: parseErrors,
          total: 0
        });
        return;
      }

      // Obtener SKUs existentes para diferenciar creados vs actualizados
      const { data: existingProducts } = await supabase
        .from('products')
        .select('sku');
      
      const existingSkus = new Set(existingProducts?.map(p => p.sku) || []);
      
      let createdCount = 0;
      let updatedCount = 0;

      excelProducts.forEach(p => {
        if (existingSkus.has(p.sku)) {
          updatedCount++;
        } else {
          createdCount++;
        }
      });

      // Realizar Upsert
      const { error: upsertError } = await supabase
        .from('products')
        .upsert(excelProducts, { onConflict: 'sku' });

      if (upsertError) throw upsertError;

      setImportResult({
        created: createdCount,
        updated: updatedCount,
        errors: parseErrors,
        total: excelProducts.length + parseErrors.length
      });

      fetchProducts();
    } catch (err: any) {
      setImportResult({
        created: 0,
        updated: 0,
        errors: [`Error de base de datos: ${err.message}`],
        total: 0
      });
    } finally {
      setImportLoading(false);
      // Reset input
      e.target.value = '';
    }
  }

  const filteredProducts = products.filter(p => 
    (p.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (p.sku?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package /> Productos
          </h1>
          <p className="text-gray-500">Gestión de inventario de tu tienda.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="btn btn-outline btn-md gap-2"
          >
            <FileSpreadsheet size={20} /> Importar Excel
          </button>
          <Link href="/admin/products/new" className="btn btn-primary btn-md">
            <Plus size={20} /> Nuevo Producto
          </Link>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </span>
          <input 
            type="text" 
            className="input input-bordered w-full pl-10" 
            placeholder="Buscar por nombre..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-base-100 rounded-box shadow-sm border border-base-200 overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center"><span className="loading loading-spinner loading-lg text-primary"></span></div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-4">
            <AlertCircle size={48} className="text-gray-300" />
            <p className="text-gray-500">No se encontraron productos.</p>
          </div>
        ) : (
          <table className="table table-zebra w-full">
            <thead>
              <tr className="bg-base-200">
                <th>SKU</th>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Precio (CLP)</th>
                <th>Stock</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td className="font-mono text-xs font-bold text-primary">{p.sku || '-'}</td>
                  <td>
                    <div className="avatar">
                      <div className="mask mask-squircle w-12 h-12">
                        <img 
                          src={p.image_url || 'https://via.placeholder.com/150'} 
                          alt={p.name} 
                        />
                      </div>
                    </div>
                  </td>
                  <td className="font-semibold text-base">{p.name}</td>
                  <td>${p.price?.toLocaleString('es-CL')}</td>
                  <td>
                    <div className={`badge badge-md ${p.stock < 5 ? 'badge-error' : 'badge-ghost'}`}>
                      {p.stock}
                    </div>
                  </td>
                  <td className="text-right flex justify-end gap-2">
                    <button className="btn btn-square btn-sm btn-ghost text-info">
                      <Edit3 size={18} />
                    </button>
                    <button 
                      className="btn btn-square btn-sm btn-ghost text-error"
                      onClick={() => deleteProduct(p.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-2xl flex items-center gap-2 mb-4">
              <FileSpreadsheet className="text-primary" /> Importar Productos
            </h3>
            
            {!importResult ? (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 text-sm text-blue-800">
                  <Info className="shrink-0" size={20} />
                  <div>
                    <p className="font-bold mb-1">Instrucciones para el Excel:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Columnas obligatorias: <code className="bg-blue-100 px-1 rounded">sku</code>, <code className="bg-blue-100 px-1 rounded">name</code>, <code className="bg-blue-100 px-1 rounded">price</code>, <code className="bg-blue-100 px-1 rounded">stock</code></li>
                      <li>Columnas opcionales: <code className="bg-blue-100 px-1 rounded">description</code>, <code className="bg-blue-100 px-1 rounded">image_url</code></li>
                      <li>Si el <strong>SKU</strong> ya existe, el producto se actualizará.</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-base-300 rounded-2xl cursor-pointer hover:bg-base-50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {importLoading ? (
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                      ) : (
                        <>
                          <Upload size={40} className="text-gray-400 mb-3" />
                          <p className="mb-2 text-sm text-gray-500 font-semibold text-center px-4">
                            Sube tu archivo .xlsx o drag and drop
                          </p>
                          <p className="text-xs text-gray-400">Excel (MAX. 5MB)</p>
                        </>
                      )}
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".xlsx, .xls"
                      onChange={handleExcelUpload}
                      disabled={importLoading}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-success/10 p-4 rounded-2xl text-center border border-success/20">
                    <p className="text-xs font-bold text-success uppercase tracking-wider mb-1">Nuevos</p>
                    <p className="text-3xl font-black text-success">{importResult.created}</p>
                  </div>
                  <div className="bg-info/10 p-4 rounded-2xl text-center border border-info/20">
                    <p className="text-xs font-bold text-info uppercase tracking-wider mb-1">Actualizados</p>
                    <p className="text-3xl font-black text-info">{importResult.updated}</p>
                  </div>
                  <div className="bg-error/10 p-4 rounded-2xl text-center border border-error/20">
                    <p className="text-xs font-bold text-error uppercase tracking-wider mb-1">Omitidos</p>
                    <p className="text-3xl font-black text-error">{importResult.errors.length}</p>
                  </div>
                </div>

                {importResult.errors.length > 0 && (
                  <div className="bg-error/5 border border-error/20 rounded-2xl p-4">
                    <h4 className="font-bold text-error flex items-center gap-2 mb-2">
                       <XCircle size={18} /> Detalles de errores:
                    </h4>
                    <div className="max-h-40 overflow-y-auto text-xs space-y-1 font-mono">
                      {importResult.errors.map((err, i) => (
                        <div key={i} className="text-error mb-1">• {err}</div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="alert alert-success shadow-lg text-sm text-white">
                  <CheckCircle2 />
                  <span>Proceso completado. Se procesaron {importResult.total} filas en total.</span>
                </div>
              </div>
            )}

            <div className="modal-action">
              <button 
                className="btn btn-ghost" 
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportResult(null);
                }}
                disabled={importLoading}
              >
                {importResult ? 'Cerrar' : 'Cancelar'}
              </button>
            </div>
          </div>
          <div className="modal-backdrop bg-black/50" onClick={() => !importLoading && setIsImportModalOpen(false)}></div>
        </div>
      )}
    </div>
  );
}
