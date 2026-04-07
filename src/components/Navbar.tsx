'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, User, Menu, Search, Package } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const { totalItems } = useCart();

  return (
    <nav className="navbar bg-base-100 shadow-sm sticky top-0 z-50 px-4 md:px-8">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            <Menu size={20} />
          </label>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <li><Link href="/">Inicio</Link></li>
            <li><Link href="/products">Productos</Link></li>
            <li><Link href="/about">Nosotros</Link></li>
          </ul>
        </div>
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary tracking-tight">
          <Package className="text-secondary" /> TIENDA.CL
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 font-medium">
          <li><Link href="/">Inicio</Link></li>
          <li><Link href="/products">Productos</Link></li>
          <li><Link href="/about">Nosotros</Link></li>
        </ul>
      </div>

      <div className="navbar-end gap-2">
        <div className="hidden md:flex relative">
          <input type="text" placeholder="Buscar..." className="input input-bordered input-sm pr-10" />
          <Search size={14} className="absolute right-3 top-2.5 opacity-50" />
        </div>

        <Link href="/admin" className="btn btn-ghost btn-circle btn-sm">
           <User size={20} />
        </Link>

        {/* Cart Dropdown */}
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle">
            <div className="indicator">
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                  <span className="badge badge-sm badge-secondary indicator-item font-bold">
                    {totalItems}
                  </span>
              )}
            </div>
          </label>
          <div tabIndex={0} className="mt-3 z-[1] card card-compact dropdown-content w-52 bg-base-100 shadow-xl border border-base-200">
            <div className="card-body">
              <span className="font-bold text-lg">{totalItems} Productos</span>
              <div className="card-actions">
                <Link href="/checkout" className="btn btn-primary btn-block">Ver Carrito</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
