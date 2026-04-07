'use client';
export const dynamic = "force-dynamic";

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Eye, 
  CheckCircle, 
  Clock, 
  XCircle,
  Truck,
  RefreshCw
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setOrders(data || []);
    }
    setLoading(false);
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <div className="badge badge-success gap-2 text-white"><CheckCircle size={14}/> Pagado</div>;
      case 'pending':
        return <div className="badge badge-warning gap-2 text-white"><Clock size={14}/> Pendiente</div>;
      case 'failed':
        return <div className="badge badge-error gap-2 text-white"><XCircle size={14}/> Fallido</div>;
      default:
        return <div className="badge badge-ghost gap-2">{status}</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingCart /> Órdenes
          </h1>
          <p className="text-gray-500">Monitorea los pedidos y pagos de Flow.cl</p>
        </div>
        <button onClick={fetchOrders} className="btn btn-ghost btn-outline btn-sm gap-2">
           <RefreshCw size={16} /> Actualizar
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-base-100 rounded-box shadow-sm border border-base-200 overflow-x-auto">
        {loading ? (
             <div className="p-12 text-center"><span className="loading loading-spinner loading-lg text-primary"></span></div>
        ) : orders.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No hay órdenes registradas.</div>
        ) : (
          <table className="table w-full">
            <thead>
              <tr className="bg-base-200">
                <th>Orden ID</th>
                <th>Cliente</th>
                <th>Comuna/Región</th>
                <th>Total (CLP)</th>
                <th>Estado Flow</th>
                <th>Fecha</th>
                <th className="text-right">Ver</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="hover">
                  <td className="font-mono text-sm">{order.flow_order_id || order.id.slice(0,8)}</td>
                  <td>
                    <div className="font-semibold">{order.customer_name}</div>
                    <div className="text-xs opacity-50">{order.customer_email}</div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Truck size={14} className="text-gray-400" />
                      <div>
                        <div className="text-sm">{order.comuna}</div>
                        <div className="text-xs opacity-50">{order.region}</div>
                      </div>
                    </div>
                  </td>
                  <td className="font-semibold">${order.total?.toLocaleString('es-CL')}</td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td className="text-sm">{new Date(order.created_at).toLocaleDateString('es-CL')}</td>
                  <td className="text-right">
                    <button className="btn btn-square btn-ghost btn-sm">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
