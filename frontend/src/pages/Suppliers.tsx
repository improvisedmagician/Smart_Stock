import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { suppliersApi } from '../services/api';

export default function Suppliers() {
  const { isGerente } = useAuth();
  const [search, setSearch] = useState('');
  const [suppliers, setSuppliers] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);

  const fetchSuppliers = async () => {
    try {
      const response = await suppliersApi.list();
      setSuppliers(response.data);
    } catch (error) {
      toast.error('Erro ao carregar fornecedores');
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const openCreateModal = () => {
    setEditingSupplier(null);
    setIsModalOpen(true);
  };

  const openEditModal = (supplier: any) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir?')) {
      try {
        await suppliersApi.delete(id);
        toast.success('Fornecedor excluído com sucesso');
        fetchSuppliers();
      } catch (error) {
        toast.error((error as any).response?.data?.error || 'Erro ao excluir fornecedor');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    data.leadTimeDays = Number(data.leadTimeDays);
    
    try {
      if (editingSupplier) {
        await suppliersApi.update(editingSupplier.id, data);
        toast.success('Fornecedor atualizado com sucesso!');
      } else {
        await suppliersApi.create(data);
        toast.success('Fornecedor criado com sucesso!');
      }
      setIsModalOpen(false);
      fetchSuppliers();
    } catch (error) {
      toast.error('Erro ao salvar fornecedor');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Fornecedores</h1>
        {isGerente && (
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Fornecedor
          </Button>
        )}
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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
              {suppliers.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="p-4 text-gray-900">{s.cnpj}</td>
                  <td className="p-4 text-gray-600">{s.companyName}</td>
                  <td className="p-4 text-gray-600">{s.leadTimeDays}</td>
                  <td className="p-4"><Badge variant={s.active ? 'success' : 'danger'}>{s.active ? 'Ativo' : 'Inativo'}</Badge></td>
                  <td className="p-4">
                    {isGerente && (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => openEditModal(s)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(s.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input name="cnpj" label="CNPJ" defaultValue={editingSupplier?.cnpj} required />
          <Input name="companyName" label="Razão Social" defaultValue={editingSupplier?.companyName} required />
          <Input name="leadTimeDays" label="Lead Time (dias)" type="number" defaultValue={editingSupplier?.leadTimeDays} required />
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Salvar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
