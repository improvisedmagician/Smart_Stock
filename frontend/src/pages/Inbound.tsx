import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';
import { productsApi, batchesApi } from '../services/api';

export default function Inbound() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    productsApi.list().then(res => setProducts(res.data)).catch(() => toast.error('Erro ao carregar produtos'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    data.quantity = Number(data.quantity);
    
    try {
      await batchesApi.register(data);
      toast.success('Entrada registrada com sucesso!');
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast.error('Erro ao registrar entrada');
    } finally {
      setLoading(false);
    }
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
              <select name="productId" required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
                <option value="">Selecione um produto...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número do Lote</label>
              <input name="batchNumber" type="text" required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
              <input name="quantity" type="number" min="1" required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Fabricação</label>
              <input name="manufacturingDate" type="date" required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Validade</label>
              <input name="expirationDate" type="date" required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary" />
            </div>
          </div>
          <div className="pt-4 flex justify-end">
            <Button type="submit" loading={loading}>Registrar Entrada</Button>
          </div>
        </form>
      </div>
    </div>
  );
}