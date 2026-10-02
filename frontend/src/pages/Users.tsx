import React, { useState, useEffect } from 'react';
import { Plus, Shield, ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { authApi } from '../services/api';

export default function Users() {
  const { isGerente } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await authApi.listUsers();
      setUsers(response.data);
    } catch (error) {
      toast.error('Erro ao carregar usuários');
    }
  };

  useEffect(() => {
    if (isGerente) {
      fetchUsers();
    }
  }, [isGerente]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    
    try {
      await authApi.register(data);
      toast.success('Usuário criado com sucesso!');
      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao criar usuário');
    } finally {
      setLoading(false);
    }
  };

  if (!isGerente) {
    return <div className="p-8 text-center text-gray-500">Acesso negado. Apenas gerentes podem gerenciar acessos.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Acessos</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie os operadores e permissões do sistema.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="p-4 font-medium pl-6">Nome</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Perfil</th>
                <th className="p-4 font-medium">Data de Criação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="p-4 pl-6 font-semibold text-gray-900">{u.name}</td>
                  <td className="p-4 text-gray-600">{u.email}</td>
                  <td className="p-4">
                    <Badge variant={u.role === 'GERENTE' ? 'warning' : 'info'}>
                      <span className="flex items-center gap-1">
                        {u.role === 'GERENTE' ? <ShieldAlert size={12} /> : <Shield size={12} />}
                        {u.role}
                      </span>
                    </Badge>
                  </td>
                  <td className="p-4 text-gray-600">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">Nenhum usuário encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Usuário">
        <form onSubmit={handleSave} className="space-y-4">
          <Input name="name" label="Nome Completo" required />
          <Input name="email" type="email" label="Email" required />
          <Input name="password" type="password" label="Senha (Provisória)" required minLength={6} />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nível de Acesso</label>
            <select name="role" className="w-full rounded-lg border-gray-300 border p-2 focus:ring-primary focus:border-primary" required defaultValue="OPERADOR">
              <option value="OPERADOR">Operador (Estoquista)</option>
              <option value="GERENTE">Gerente (Acesso Total)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">O Operador não tem acesso a auditoria, relatórios financeiros e gestão de acessos.</p>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Criar Acesso'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
