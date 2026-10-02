import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, LogOut } from 'lucide-react';

export const Header: React.FC<{toggleSidebar: () => void}> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
      <button onClick={toggleSidebar} className="p-2 text-gray-500 rounded-lg lg:hidden hover:bg-gray-100">
        <Menu size={24} />
      </button>
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-gray-700">{user?.name || 'Usuário'}</p>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{user?.role || 'OPERADOR'}</span>
        </div>
        <button onClick={logout} className="p-2 text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};