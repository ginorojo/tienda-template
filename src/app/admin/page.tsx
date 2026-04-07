import React from 'react';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign 
} from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Dashboard de Resumen</h1>
        <p className="text-gray-500">Bienvenido al panel de control de tu tienda.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat bg-base-100 shadow-sm rounded-box">
          <div className="stat-figure text-primary">
            <DollarSign size={32} />
          </div>
          <div className="stat-title">Ventas Totales</div>
          <div className="stat-value text-primary">$2,400,000</div>
          <div className="stat-desc">21% más que el mes pasado</div>
        </div>
        
        <div className="stat bg-base-100 shadow-sm rounded-box">
          <div className="stat-figure text-secondary">
            <ShoppingBag size={32} />
          </div>
          <div className="stat-title">Órdenes Nuevas</div>
          <div className="stat-value text-secondary">42</div>
          <div className="stat-desc">Desde el último pago de Flow</div>
        </div>
        
        <div className="stat bg-base-100 shadow-sm rounded-box">
          <div className="stat-figure text-accent">
            <TrendingUp size={32} />
          </div>
          <div className="stat-title">Stock Bajo</div>
          <div className="stat-value">5</div>
          <div className="stat-desc">Productos por agotar</div>
        </div>
        
        <div className="stat bg-base-100 shadow-sm rounded-box">
          <div className="stat-figure text-gray-400">
            <Users size={32} />
          </div>
          <div className="stat-title">Clientes</div>
          <div className="stat-value">128</div>
          <div className="stat-desc">Registrados con Supabase</div>
        </div>
      </div>

      {/* Recent Orders Table (Placeholder) */}
      <div className="bg-base-100 p-6 rounded-box shadow-sm mt-8">
        <h3 className="text-xl font-semibold mb-6">Últimas Órdenes</h3>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>ID Orden</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {/* Debería llenarse desde Supabase */}
              <tr>
                <td>#FLOW-1001</td>
                <td>Gino R.</td>
                <td>$45.000</td>
                <td><span className="badge badge-success text-white">Pagado</span></td>
                <td>hace 2 horas</td>
                <td><button className="btn btn-sm btn-ghost">Detalles</button></td>
              </tr>
              <tr>
                <td>#FLOW-1002</td>
                <td>María J.</td>
                <td>$32.500</td>
                <td><span className="badge badge-warning text-white">Pendiente</span></td>
                <td>hace 5 horas</td>
                <td><button className="btn btn-sm btn-ghost">Detalles</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
