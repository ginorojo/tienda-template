import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Settings, 
  LogOut,
  Menu
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="drawer lg:drawer-open min-h-screen bg-base-200">
      <input id="admin-drawer" type="checkbox" className="drawer-toggle" />
      
      <div className="drawer-content flex flex-col">
        {/* Navbar for mobile */}
        <div className="navbar bg-base-100 lg:hidden shadow-sm">
          <div className="flex-none">
            <label htmlFor="admin-drawer" className="btn btn-square btn-ghost">
              <Menu size={24} />
            </label>
          </div>
          <div className="flex-1">
            <a className="btn btn-ghost text-xl">Admin Panel</a>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 l:p-8">
          {children}
        </main>
      </div>

      <div className="drawer-side z-40">
        <label htmlFor="admin-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
        <ul className="menu p-4 w-80 min-h-full bg-base-100 text-base-content flex flex-col">
          {/* Logo / Title */}
          <li className="mb-8 items-center bg-transparent!">
             <Link href="/admin" className="text-2xl font-bold text-primary flex items-center gap-2">
                Ecommerce Admin
             </Link>
          </li>
          
          {/* Menu Items */}
          <li>
            <Link href="/admin" className="flex items-center gap-3 py-3">
              <LayoutDashboard size={20} />
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/admin/products" className="flex items-center gap-3 py-3">
              <Package size={20} />
              Productos
            </Link>
          </li>
          <li>
            <Link href="/admin/orders" className="flex items-center gap-3 py-3">
              <ShoppingCart size={20} />
              Órdenes
            </Link>
          </li>
          
          <div className="divider"></div>
          
          <li>
            <Link href="/admin/settings" className="flex items-center gap-3 py-3">
              <Settings size={20} />
              Configuración
            </Link>
          </li>
          
          {/* Bottom push */}
          <li className="mt-auto">
            <button className="flex items-center gap-3 py-3 text-error">
              <LogOut size={20} />
              Cerrar Sesión
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
