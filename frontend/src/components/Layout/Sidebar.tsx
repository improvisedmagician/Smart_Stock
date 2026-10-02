import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Package, Truck, ArrowDownToLine, ArrowUpFromLine, ShoppingCart, Warehouse, X, Layers, Shield, Users } from 'lucide-react';

export const Sidebar: React.FC<{isOpen: boolean, setIsOpen: (v: boolean) => void}> = ({ isOpen, setIsOpen }) => {
  const { isGerente } = useAuth();
  
  const navItems = [
    ...(isGerente ? [{ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }] : []),
    { to: '/products', icon: Package, label: 'Produtos' },
    ...(isGerente ? [{ to: '/suppliers', icon: Truck, label: 'Fornecedores' }] : []),
    { to: '/batches', icon: Layers, label: 'Lotes & Validades' },
    { to: '/inbound', icon: ArrowDownToLine, label: 'Entrada de Mercadorias' },
    { to: '/outbound', icon: ArrowUpFromLine, label: 'Expedição FEFO' },
    ...(isGerente ? [{ to: '/purchase-orders', icon: ShoppingCart, label: 'Ordens de Compra' }] : []),
    ...(isGerente ? [{ to: '/users', icon: Users, label: 'Acessos' }] : []),
    ...(isGerente ? [{ to: '/audit', icon: Shield, label: 'Auditoria' }] : [])
  ];

  return (
    <>
      <div className={`fixed inset-0 z-20 transition-opacity bg-black bg-opacity-50 lg:hidden ${isOpen ? 'block' : 'hidden'}`} onClick={() => setIsOpen(false)} />
      <div className={`fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto transition duration-300 transform bg-slate-900 text-white lg:translate-x-0 lg:static lg:inset-0 ${isOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in'}`}>
        <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Warehouse className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">Smart Stock</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-300">
            <X size={24} />
          </button>
        </div>
        <nav className="mt-4 px-2 space-y-1">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} onClick={() => setIsOpen(false)} className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-primary text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};
