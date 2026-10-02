const fs = require('fs');
const path = require('path');

const baseDir = __dirname;

const files = {
  'src/components/ui/Button.tsx': `import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const baseStyle = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
      primary: "bg-primary text-white hover:bg-blue-700 focus:ring-primary",
      secondary: "bg-secondary text-white hover:bg-slate-800 focus:ring-secondary",
      danger: "bg-danger text-white hover:bg-red-600 focus:ring-danger",
      outline: "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-primary"
    };
    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base"
    };

    return (
      <button ref={ref} disabled={disabled || loading} className={\`\${baseStyle} \${variants[variant]} \${sizes[size]} \${className}\`} {...props}>
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </button>
    );
  }
);`,
  'src/components/ui/Badge.tsx': `import React from 'react';

export const Badge: React.FC<{variant?: 'success'|'warning'|'danger'|'info'|'neutral', children: React.ReactNode}> = ({variant = 'neutral', children}) => {
  const styles = {
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    neutral: 'bg-gray-100 text-gray-800'
  };
  return <span className={\`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium \${styles[variant]}\`}>{children}</span>;
};`,
  'src/pages/Products.tsx': `import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';

const mockProducts = [
  { id: '1', sku: 'LEITE-INT-1L', name: 'Leite Integral 1L', category: 'Laticínios', unit: 'L', safetyStock: 100, supplierName: 'Laticínios São Paulo', active: true },
  { id: '2', sku: 'FRANGO-KG', name: 'Peito de Frango', category: 'Carnes', unit: 'KG', safetyStock: 50, supplierName: 'Distribuidora Alimentos', active: true }
];

export default function Products() {
  const { isGerente } = useAuth();
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Gestão de Produtos</h1>
        {isGerente && <Button><Plus className="w-4 h-4 mr-2" />Novo Produto</Button>}
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Buscar por SKU ou Nome..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="p-4 font-medium">SKU</th>
                <th className="p-4 font-medium">Nome</th>
                <th className="p-4 font-medium">Categoria</th>
                <th className="p-4 font-medium">Unidade</th>
                <th className="p-4 font-medium">Estoque Seg.</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {mockProducts.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{p.sku}</td>
                  <td className="p-4 text-gray-600">{p.name}</td>
                  <td className="p-4 text-gray-600">{p.category}</td>
                  <td className="p-4 text-gray-600">{p.unit}</td>
                  <td className="p-4 text-gray-600">{p.safetyStock}</td>
                  <td className="p-4"><Badge variant={p.active ? 'success' : 'danger'}>{p.active ? 'Ativo' : 'Inativo'}</Badge></td>
                  <td className="p-4">
                    {isGerente && (
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                        <button className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}`,
  'src/pages/Suppliers.tsx': `import React from 'react';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';

const mockSuppliers = [
  { id: '1', cnpj: '12.345.678/0001-90', companyName: 'Distribuidora Alimentos Ltda', leadTimeDays: 5, active: true },
  { id: '2', cnpj: '98.765.432/0001-10', companyName: 'Laticínios São Paulo S.A.', leadTimeDays: 3, active: true }
];

export default function Suppliers() {
  const { isGerente } = useAuth();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Fornecedores</h1>
        {isGerente && <Button><Plus className="w-4 h-4 mr-2" />Novo Fornecedor</Button>}
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Buscar..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="p-4 font-medium">CNPJ</th>
                <th className="p-4 font-medium">Razão Social</th>
                <th className="p-4 font-medium">Lead Time (dias)</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {mockSuppliers.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="p-4 text-gray-900">{s.cnpj}</td>
                  <td className="p-4 text-gray-600">{s.companyName}</td>
                  <td className="p-4 text-gray-600">{s.leadTimeDays}</td>
                  <td className="p-4"><Badge variant={s.active ? 'success' : 'danger'}>{s.active ? 'Ativo' : 'Inativo'}</Badge></td>
                  <td className="p-4">
                    {isGerente && (
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                        <button className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}`,
  'src/pages/Inbound.tsx': `import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function Inbound() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success('Entrada registrada com sucesso!');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Entrada de Mercadorias</h1>
        <p className="text-gray-500 mt-1">Registre a entrada de novos lotes informando os dados de fabricação e validade.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Produto</label>
              <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
                <option value="">Selecione um produto...</option>
                <option value="1">LEITE-INT-1L - Leite Integral 1L</option>
                <option value="2">FRANGO-KG - Peito de Frango</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número do Lote</label>
              <input type="text" required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
              <input type="number" min="1" required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Fabricação</label>
              <input type="date" required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Validade</label>
              <input type="date" required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary" />
            </div>
          </div>
          <div className="pt-4 flex justify-end">
            <Button type="submit" loading={loading}>Registrar Entrada</Button>
          </div>
        </form>
      </div>
    </div>
  );
}`,
  'src/pages/Outbound.tsx': `import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Outbound() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setStep(2);
      setLoading(false);
    }, 800);
  };

  const handleConfirm = () => {
    toast.success('Expedição confirmada!');
    setStep(1);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Expedição FEFO</h1>
        <p className="text-gray-500 mt-1">Solicite a saída de produtos. O sistema indica automaticamente quais lotes pegar baseado no FEFO.</p>
      </div>

      {step === 1 ? (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <form onSubmit={handleCalculate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Produto</label>
              <select required className="w-full p-2 border border-gray-300 rounded-lg">
                <option value="">Selecione...</option>
                <option value="1">LEITE-INT-1L - Leite Integral 1L</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade Solicitada</label>
              <input type="number" min="1" required className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
            <div className="pt-4">
              <Button type="submit" loading={loading} className="w-full sm:w-auto">Calcular FEFO</Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-900">Lotes para Expedição (FEFO)</h3>
            </div>
            <div className="p-0">
              <table className="w-full text-left text-sm">
                <thead className="bg-white">
                  <tr>
                    <th className="p-4 font-medium text-gray-500">Lote</th>
                    <th className="p-4 font-medium text-gray-500">Validade</th>
                    <th className="p-4 font-medium text-gray-500 text-right">Qtd. a Retirar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="p-4 font-medium text-gray-900">L-2023-01</td>
                    <td className="p-4"><Badge variant="danger">15/10/2026</Badge></td>
                    <td className="p-4 text-right font-bold text-primary">50</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-gray-900">L-2023-05</td>
                    <td className="p-4"><Badge variant="warning">30/11/2026</Badge></td>
                    <td className="p-4 text-right font-bold text-primary">30</td>
                  </tr>
                </tbody>
                <tfoot className="bg-gray-50 font-bold">
                  <tr>
                    <td colSpan={2} className="p-4 text-right">Total a Retirar:</td>
                    <td className="p-4 text-right text-lg text-gray-900">80</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 flex gap-3 text-amber-800">
            <AlertTriangle className="shrink-0" />
            <p className="text-sm">Atenção: O lote L-2023-01 está próximo do vencimento (menos de 30 dias).</p>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setStep(1)}>Cancelar</Button>
            <Button variant="primary" onClick={handleConfirm} className="flex-1 sm:flex-none">
              <CheckCircle2 className="w-4 h-4 mr-2" /> Confirmar Expedição
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}`,
  'src/pages/PurchaseOrders.tsx': `import React from 'react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Plus } from 'lucide-react';

const mockOrders = [
  { id: 'OC-1001', product: 'Leite Integral 1L', supplier: 'Laticínios São Paulo', qty: 500, trigger: 'SISTEMA', status: 'PENDENTE', date: '24/09/2026' },
  { id: 'OC-1002', product: 'Peito de Frango', supplier: 'Distribuidora Alimentos', qty: 200, trigger: 'MANUAL', status: 'CONFIRMADA', date: '23/09/2026' }
];

export default function PurchaseOrders() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDENTE': return <Badge variant="warning">Pendente</Badge>;
      case 'CONFIRMADA': return <Badge variant="success">Confirmada</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Ordens de Compra</h1>
        <Button><Plus className="w-4 h-4 mr-2" />Nova Ordem Manual</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 font-medium text-gray-600">ID</th>
                <th className="p-4 font-medium text-gray-600">Produto</th>
                <th className="p-4 font-medium text-gray-600">Fornecedor</th>
                <th className="p-4 font-medium text-gray-600">Quantidade</th>
                <th className="p-4 font-medium text-gray-600">Origem</th>
                <th className="p-4 font-medium text-gray-600">Status</th>
                <th className="p-4 font-medium text-gray-600">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{order.id}</td>
                  <td className="p-4 text-gray-600">{order.product}</td>
                  <td className="p-4 text-gray-600">{order.supplier}</td>
                  <td className="p-4 text-gray-600">{order.qty}</td>
                  <td className="p-4"><Badge variant={order.trigger === 'SISTEMA' ? 'info' : 'neutral'}>{order.trigger}</Badge></td>
                  <td className="p-4">{getStatusBadge(order.status)}</td>
                  <td className="p-4 text-gray-600">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}`
};

Object.keys(files).forEach(file => {
  const filePath = path.join(baseDir, file);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, files[file]);
  console.log('Updated:', file);
});
