import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { productsApi, batchesApi, suppliersApi } from '../services/api';

export default function Products() {
  const { isGerente } = useAuth();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  
  const [products, setProducts] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const fetchAll = async () => {
    try {
      const [pRes, bRes, sRes] = await Promise.all([
        productsApi.list(),
        batchesApi.list(),
        suppliersApi.list()
      ]);
      setProducts(pRes.data?.data || pRes.data || []);
      setBatches(bRes.data?.data || bRes.data || []);
      setSuppliers(sRes.data?.data || sRes.data || []);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir?')) {
      try {
        await productsApi.delete(id);
        toast.success('Produto excluído com sucesso');
        fetchAll();
      } catch (error) {
        toast.error((error as any).response?.data?.error || 'Erro ao excluir produto');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    data.safetyStock = Number(data.safetyStock);
    
    try {
      if (editingProduct) {
        await productsApi.update(editingProduct.id, data);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await productsApi.create(data);
        toast.success('Produto criado com sucesso!');
      }
      setIsModalOpen(false);
      fetchAll();
    } catch (error) {
      toast.error('Erro ao salvar produto');
    }
  };

  const supplierMap = Object.fromEntries(suppliers.map(s => [s.id, s.tradeName || s.companyName || s.razao_social]));

  // Calculate stats for products
  const productsWithStats = products.map(p => {
    const pBatches = batches.filter(b => b.productId === p.id && b.status !== 'VENCIDO');
    const totalStock = pBatches.reduce((acc, b) => acc + (b.currentQuantity || 0), 0);
    const isOutOfStock = totalStock === 0;
    const isLowStock = totalStock > 0 && totalStock <= (p.safetyStock || 0);
    const hasExpiringSoon = pBatches.some(b => {
      const days = Math.ceil((new Date(b.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return days > 0 && days <= 30;
    });

    return { ...p, totalStock, isOutOfStock, isLowStock, hasExpiringSoon };
  });

  const filtered = productsWithStats.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filterType === 'AVAILABLE') return !p.isOutOfStock;
    if (filterType === 'OUT_OF_STOCK') return p.isOutOfStock;
    if (filterType === 'EXPIRING_SOON') return p.hasExpiringSoon;
    if (filterType === 'LOW_STOCK') return p.isLowStock;
    return true;
  });

  const getProgressBarColor = (p: any) => {
    if (p.isOutOfStock) return 'bg-red-500';
    if (p.isLowStock) return 'bg-orange-500';
    return 'bg-emerald-500';
  };

  const getProgressPercentage = (p: any) => {
    const safe = p.safetyStock || 1;
    // Visually cap at 100% or slightly more
    const pct = (p.totalStock / (safe * 2)) * 100;
    return Math.min(Math.max(pct, 0), 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventário</h1>
          <p className="text-sm text-gray-500 mt-1">Gestão visual de estoque e produtos.</p>
        </div>
        {isGerente && (
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Item
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Modern Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { id: 'ALL', label: `Todos (${products.length})`, cl: 'hover:bg-gray-100' },
            { id: 'AVAILABLE', label: `Disponível (${productsWithStats.filter(p => !p.isOutOfStock).length})`, cl: 'hover:bg-emerald-50 text-emerald-700 border-emerald-200' },
            { id: 'EXPIRING_SOON', label: `Vencendo (${productsWithStats.filter(p => p.hasExpiringSoon).length})`, cl: 'hover:bg-orange-50 text-orange-700 border-orange-200' },
            { id: 'OUT_OF_STOCK', label: `Esgotado (${productsWithStats.filter(p => p.isOutOfStock).length})`, cl: 'hover:bg-red-50 text-red-700 border-red-200' },
          ].map(f => (
            <button key={f.id} onClick={() => setFilterType(f.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
                filterType === f.id ? (f.id === 'ALL' ? 'bg-gray-900 text-white' : f.id === 'AVAILABLE' ? 'bg-emerald-500 text-white border-emerald-500' : f.id === 'EXPIRING_SOON' ? 'bg-orange-500 text-white border-orange-500' : 'bg-red-500 text-white border-red-500') 
                : `bg-white text-gray-600 ${f.cl}`
              }`}>
              {f.label}
            </button>
          ))}
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Buscar SKU, Nome..." 
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-full focus:ring-primary focus:border-primary shadow-sm" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="p-4 font-medium pl-6">SKU</th>
                <th className="p-4 font-medium">Produto</th>
                <th className="p-4 font-medium">Fornecedor</th>
                <th className="p-4 font-medium min-w-[200px]">Nível do Estoque</th>
                <th className="p-4 font-medium text-right pr-6">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="p-4 pl-6">
                    <span className="font-mono text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded">{p.sku}</span>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.category}</div>
                  </td>
                  <td className="p-4 text-gray-600">
                    {supplierMap[p.supplierId] || '—'}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className={p.isOutOfStock ? 'text-red-600' : p.isLowStock ? 'text-orange-600' : 'text-emerald-600'}>
                          {p.isOutOfStock ? '[Esgotado]' : p.isLowStock ? '[Baixo]' : '[Adequado]'}
                        </span>
                        <span className="text-gray-600">{p.totalStock} {p.unit}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${getProgressBarColor(p)}`} style={{ width: `${getProgressPercentage(p)}%` }}></div>
                      </div>
                      {p.hasExpiringSoon && <span className="text-[10px] text-orange-600 font-medium">Contém lotes a vencer</span>}
                    </div>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    {isGerente ? (
                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(p)} className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200">
                          <Edit2 size={12} /> Editar
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded border border-red-200">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ) : <span className="text-gray-400 text-xs">Sem acesso</span>}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">Nenhum produto encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProduct ? 'Editar Produto' : 'Novo Produto'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input name="sku" label="SKU" defaultValue={editingProduct?.sku} required />
          <Input name="name" label="Nome" defaultValue={editingProduct?.name} required />
          <Input name="category" label="Categoria" defaultValue={editingProduct?.category} required />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor</label>
            <select name="supplierId" defaultValue={editingProduct?.supplierId} className="w-full rounded-lg border-gray-300 border p-2 focus:ring-primary focus:border-primary" required>
              <option value="">Selecione...</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.tradeName || s.companyName || s.razao_social}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input name="unit" label="Unidade" defaultValue={editingProduct?.unit} required />
            <Input name="safetyStock" label="Estoque Seg." type="number" defaultValue={editingProduct?.safetyStock} required />
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
