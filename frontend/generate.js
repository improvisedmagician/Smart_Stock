const fs = require('fs');
const path = require('path');

const baseDir = __dirname;

const files = {
  'package.json': `{
  "name": "smartstock-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.6.8",
    "lucide-react": "^0.368.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hot-toast": "^2.4.1",
    "react-router-dom": "^6.22.3",
    "recharts": "^2.12.3"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "typescript": "^5.2.2",
    "vite": "^5.2.0"
  }
}`,
  'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`,
  'tsconfig.node.json': `{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}`,
  'vite.config.ts': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.DOCKER ? 'http://backend:3001' : 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});`,
  'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        secondary: '#334155',
        accent: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B'
      }
    },
  },
  plugins: [],
}`,
  'postcss.config.js': `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
  'index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Smart Stock WMS</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
  'nginx.conf': `server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
    location /api {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}`,
  'Dockerfile': `FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`,
  'src/vite-env.d.ts': `/// <reference types="vite/client" />`,
  'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900 font-sans antialiased;
  }
}`,
  'src/types/index.ts': `export interface User {
  id: string;
  name: string;
  email: string;
  role: 'OPERADOR' | 'GERENTE';
}

export interface Supplier {
  id: string;
  cnpj: string;
  companyName: string;
  tradeName?: string;
  leadTimeDays: number;
  email?: string;
  phone?: string;
  active: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category?: string;
  unit: string;
  safetyStock: number;
  supplierId?: string;
  supplierName?: string;
  active: boolean;
  currentStock?: number;
  createdAt: string;
}

export interface Batch {
  id: string;
  productId: string;
  productName?: string;
  batchNumber: string;
  manufactureDate: string;
  expiryDate: string;
  initialQuantity: number;
  currentQuantity: number;
  status: 'DISPONIVEL' | 'VENCIDO' | 'ESGOTADO';
  createdAt: string;
}

export interface BatchAllocation {
  batchId: string;
  batchNumber: string;
  expiryDate: string;
  quantityToPick: number;
}

export interface PurchaseOrder {
  id: string;
  productId: string;
  productName?: string;
  supplierId: string;
  supplierName?: string;
  quantity: number;
  status: 'PENDENTE' | 'ENVIADA' | 'CONFIRMADA' | 'ENTREGUE' | 'CANCELADA' | 'FALHA';
  triggeredBy: 'SISTEMA' | 'MANUAL';
  createdAt: string;
}

export interface DashboardMetrics {
  totalProducts: number;
  totalSuppliers: number;
  pendingOrders: number;
  stockAlerts: number;
  expiringBatches: ExpiringBatch[];
  stockByCategory: CategoryStock[];
  expeditionTrend: ExpeditionTrend[];
  lowStockProducts: LowStockProduct[];
}

export interface ExpiringBatch {
  productName: string;
  batchNumber: string;
  expiryDate: string;
  currentQuantity: number;
  daysUntilExpiry: number;
}

export interface CategoryStock {
  category: string;
  totalQuantity: number;
}

export interface ExpeditionTrend {
  date: string;
  count: number;
}

export interface LowStockProduct {
  productName: string;
  sku: string;
  currentStock: number;
  safetyStock: number;
  percentage: number;
}`,
  'src/services/api.ts': `import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data: any) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

export const productsApi = {
  list: () => api.get('/products'),
  create: (data: any) => api.post('/products', data),
};

export const suppliersApi = {
  list: () => api.get('/suppliers'),
};

export default api;`,
  'src/contexts/AuthContext.tsx': `import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isGerente: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  
  useEffect(() => {
    if (token) {
      authApi.getProfile().then(res => {
        setUser(res.data);
      }).catch(() => {
        logout();
      });
    }
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user, token, login, logout, 
      isAuthenticated: !!token,
      isGerente: user?.role === 'GERENTE'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);`,
  'src/components/ProtectedRoute.tsx': `import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute: React.FC<{children: React.ReactNode, requireGerente?: boolean}> = ({ children, requireGerente }) => {
  const { isAuthenticated, isGerente, user } = useAuth();
  
  if (!isAuthenticated && localStorage.getItem('token') === null) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireGerente && !isGerente && user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};`,
  'src/components/Layout/MainLayout.tsx': `import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};`,
  'src/components/Layout/Sidebar.tsx': `import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Package, Truck, ArrowDownToLine, ArrowUpFromLine, ShoppingCart, Warehouse, X } from 'lucide-react';

export const Sidebar: React.FC<{isOpen: boolean, setIsOpen: (v: boolean) => void}> = ({ isOpen, setIsOpen }) => {
  const { isGerente } = useAuth();
  
  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/products', icon: Package, label: 'Produtos' },
    { to: '/suppliers', icon: Truck, label: 'Fornecedores' },
    { to: '/inbound', icon: ArrowDownToLine, label: 'Entrada de Mercadorias' },
    { to: '/outbound', icon: ArrowUpFromLine, label: 'Expedição FEFO' },
    ...(isGerente ? [{ to: '/purchase-orders', icon: ShoppingCart, label: 'Ordens de Compra' }] : [])
  ];

  return (
    <>
      <div className={\`fixed inset-0 z-20 transition-opacity bg-black bg-opacity-50 lg:hidden \${isOpen ? 'block' : 'hidden'}\`} onClick={() => setIsOpen(false)} />
      <div className={\`fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto transition duration-300 transform bg-slate-900 text-white lg:translate-x-0 lg:static lg:inset-0 \${isOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in'}\`}>
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
            <NavLink key={item.to} to={item.to} onClick={() => setIsOpen(false)} className={({isActive}) => \`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors \${isActive ? 'bg-primary text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}\`}>
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};`,
  'src/components/Layout/Header.tsx': `import React from 'react';
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
};`,
  'src/main.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);`,
  'src/App.tsx': `import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './components/Layout/MainLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Suppliers from './pages/Suppliers';
import Inbound from './pages/Inbound';
import Outbound from './pages/Outbound';
import PurchaseOrders from './pages/PurchaseOrders';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="inbound" element={<Inbound />} />
            <Route path="outbound" element={<Outbound />} />
            <Route path="purchase-orders" element={<ProtectedRoute requireGerente><PurchaseOrders /></ProtectedRoute>} />
          </Route>
        </Routes>
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;`,
  'src/pages/Login.tsx': `import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Warehouse, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Mock login for now
      setTimeout(() => {
        login('mock-token', { id: '1', name: 'João Silva', email, role: email.includes('gerente') ? 'GERENTE' : 'OPERADOR' });
        toast.success('Login realizado com sucesso!');
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      toast.error('Erro ao fazer login.');
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md p-8 m-4 bg-white rounded-2xl shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 mb-4 bg-blue-50 rounded-full">
            <Warehouse className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Smart Stock WMS</h1>
          <p className="text-gray-500">Acesse sua conta para continuar</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" placeholder="seu@email.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}`,
  'src/pages/Dashboard.tsx': `import React from 'react';
import { Package, Truck, ShoppingCart, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

const mockExpiring = [
  { name: 'Semana 1', quantidade: 120 },
  { name: 'Semana 2', quantidade: 80 },
  { name: 'Semana 3', quantidade: 200 },
  { name: 'Semana 4', quantidade: 50 },
];

const mockTrend = [
  { date: '01/09', count: 45 }, { date: '05/09', count: 52 },
  { date: '10/09', count: 38 }, { date: '15/09', count: 65 },
  { date: '20/09', count: 48 }, { date: '25/09', count: 59 }
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[ 
          { label: 'Total Produtos', value: '1,245', icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Fornecedores Ativos', value: '48', icon: Truck, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Ordens Pendentes', value: '12', icon: ShoppingCart, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Alertas de Estoque', value: '7', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={\`p-3 rounded-lg \${stat.bg} \${stat.color}\`}><stat.icon size={24} /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Lotes a Vencer (30 dias)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockExpiring}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="quantidade" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Tendência de Expedição</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}`,
  'src/pages/Products.tsx': `import React from 'react';
export default function Products() {
  return <div className="p-4 bg-white rounded-xl shadow-sm"><h2 className="text-xl font-bold mb-4">Produtos</h2><p>Página em construção</p></div>;
}`,
  'src/pages/Suppliers.tsx': `import React from 'react';
export default function Suppliers() {
  return <div className="p-4 bg-white rounded-xl shadow-sm"><h2 className="text-xl font-bold mb-4">Fornecedores</h2><p>Página em construção</p></div>;
}`,
  'src/pages/Inbound.tsx': `import React from 'react';
export default function Inbound() {
  return <div className="p-4 bg-white rounded-xl shadow-sm"><h2 className="text-xl font-bold mb-4">Entrada de Mercadorias</h2><p>Página em construção</p></div>;
}`,
  'src/pages/Outbound.tsx': `import React from 'react';
export default function Outbound() {
  return <div className="p-4 bg-white rounded-xl shadow-sm"><h2 className="text-xl font-bold mb-4">Expedição FEFO</h2><p>Página em construção</p></div>;
}`,
  'src/pages/PurchaseOrders.tsx': `import React from 'react';
export default function PurchaseOrders() {
  return <div className="p-4 bg-white rounded-xl shadow-sm"><h2 className="text-xl font-bold mb-4">Ordens de Compra</h2><p>Página em construção</p></div>;
}`
};

Object.keys(files).forEach(file => {
  const filePath = path.join(baseDir, file);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, files[file]);
  console.log('Created:', file);
});
