import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Plus, MoreVertical, Package, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { purchaseOrdersApi, productsApi, suppliersApi } from '../services/api';

export default function PurchaseOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // form state
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const loadData = () => {
    purchaseOrdersApi.list().then(res => setOrders(res.data?.data || res.data)).catch(() => toast.error('Erro ao carregar ordens de compra'));
    productsApi.list().then(res => setProducts(res.data?.data || res.data)).catch(() => console.error('Erro produtos'));
    suppliersApi.list().then(res => setSuppliers(res.data?.data || res.data)).catch(() => console.error('Erro fornecedores'));
  };

  useEffect(() => { loadData(); }, []);

  const productMap = Object.fromEntries(products.map(p => [p.id, p.name || p.nome]));
  const supplierMap = Object.fromEntries(suppliers.map(s => [s.id, s.tradeName || s.nome_fantasia || s.companyName || s.razao_social]));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const selectedProd = products.find(p => p.id === productId);
    if (!selectedProd) {
      toast.error('Produto inválido');
      setLoading(false);
      return;
    }
    
    try {
      await purchaseOrdersApi.create({
        productId,
        supplierId: selectedProd.supplierId || selectedProd.fornecedor_id,
        quantity: Number(quantity),
        notes,
        triggeredBy: 'MANUAL',
        unitPrice: 0 
      });
      toast.success('Ordem criada com sucesso!');
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao criar ordem de compra');
    } finally {
      setLoading(false);
    }
  };

  // Status transition helper
  const updateStatus = async (id: string, newStatus: string) => {
    toast.success(`Ordem ${id.split('-')[0]} movida para ${newStatus}`);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const getPriorityBadge = (qty: number) => {
    if (qty >= 500) return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded">URGENTE</span>;
    if (qty >= 200) return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded">MÉDIA</span>;
    return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded">BAIXA</span>;
  };

  const renderKanbanCard = (order: any) => (
    <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex flex-col gap-2">
      <div className="flex justify-between items-start">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">PO-{order.id.split('-')[0]}</span>
        {getPriorityBadge(order.quantity)}
      </div>
      <div className="flex items-center gap-2 mt-1">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
          <Package size={16} />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate" title={productMap[order.productId]}>{productMap[order.productId] || 'Desconhecido'}</p>
          <p className="text-xs text-gray-500 truncate">{supplierMap[order.supplierId] || 'Desconhecido'}</p>
        </div>
      </div>
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
        <span className="text-sm font-medium text-gray-700">{order.quantity} unid.</span>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          {order.status === 'PENDENTE' && (
            <button onClick={() => updateStatus(order.id, 'CONFIRMADA')} className="p-1 hover:bg-gray-100 rounded text-gray-600" title="Mover para Processando">
               <RefreshCw size={14} />
            </button>
          )}
          {order.status === 'CONFIRMADA' && (
            <button onClick={() => updateStatus(order.id, 'ENTREGUE')} className="p-1 hover:bg-gray-100 rounded text-gray-600" title="Marcar como Entregue">
               <CheckCircle2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const pending = orders.filter(o => o.status === 'PENDENTE');
  const processing = orders.filter(o => o.status === 'ENVIADA' || o.status === 'CONFIRMADA');
  const completed = orders.filter(o => o.status === 'ENTREGUE' || o.status === 'CONCLUIDA');

  return (
    <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">Quadro de Ordens</h1>
        <Button onClick={() => setIsModalOpen(true)}><Plus className="w-4 h-4 mr-2" />Nova Ordem Manual</Button>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 h-full min-w-[900px]">
          {/* PENDING COLUMN */}
          <div className="flex-1 bg-slate-50/80 rounded-2xl p-4 flex flex-col border border-slate-200">
            <div className="flex justify-between items-center mb-4 px-1">
              <h2 className="font-bold text-slate-700 flex items-center gap-2">
                <AlertCircle size={18} className="text-slate-400" />
                PENDENTES
              </h2>
              <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">{pending.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 px-1 custom-scrollbar">
              {pending.map(renderKanbanCard)}
              {pending.length === 0 && <p className="text-sm text-gray-400 text-center mt-10">Vazio</p>}
            </div>
          </div>

          {/* PROCESSING COLUMN */}
          <div className="flex-1 bg-blue-50/50 rounded-2xl p-4 flex flex-col border border-blue-100">
            <div className="flex justify-between items-center mb-4 px-1">
              <h2 className="font-bold text-blue-800 flex items-center gap-2">
                <RefreshCw size={18} className="text-blue-400" />
                PROCESSANDO
              </h2>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">{processing.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 px-1 custom-scrollbar">
              {processing.map(renderKanbanCard)}
              {processing.length === 0 && <p className="text-sm text-gray-400 text-center mt-10">Vazio</p>}
            </div>
          </div>

          {/* COMPLETED COLUMN */}
          <div className="flex-1 bg-emerald-50/50 rounded-2xl p-4 flex flex-col border border-emerald-100">
            <div className="flex justify-between items-center mb-4 px-1">
              <h2 className="font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-500" />
                CONCLUÍDO
              </h2>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">{completed.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 px-1 custom-scrollbar">
              {completed.map(renderKanbanCard)}
              {completed.length === 0 && <p className="text-sm text-gray-400 text-center mt-10">Vazio</p>}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Ordem Manual">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Produto</label>
            <select
              value={productId}
              onChange={e => setProductId(e.target.value)}
              className="w-full rounded-lg border-gray-300 border p-2 focus:ring-primary focus:border-primary"
              required
            >
              <option value="">Selecione um produto...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name || p.nome}</option>
              ))}
            </select>
          </div>
          <Input label="Quantidade" type="number" min="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))} required />
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Criar Ordem'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
