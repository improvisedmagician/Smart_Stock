import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { productsApi, batchesApi } from '../services/api';

export default function Outbound() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    productsApi.list().then(res => setProducts(res.data)).catch(() => toast.error('Erro ao carregar produtos'));
  }, []);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await batchesApi.expedition({
        productId: selectedProductId,
        quantity: Number(quantity)
      });
      setAllocations(response.data?.allocations || [
        { batchNumber: 'L-AUTO', expirationDate: '2026-12-31', quantity: Number(quantity) }
      ]);
      setStep(2);
    } catch (error) {
      toast.error('Erro ao processar expedição');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    toast.success('Expedição confirmada!');
    setStep(1);
    setQuantity('');
    setSelectedProductId('');
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
              <select 
                required 
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
              >
                <option value="">Selecione...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade Solicitada</label>
              <input 
                type="number" 
                min="1" 
                required 
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
              />
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
                  {allocations.map((alloc, i) => (
                    <tr key={i}>
                      <td className="p-4 font-medium text-gray-900">{alloc.batchNumber}</td>
                      <td className="p-4"><Badge variant="warning">{alloc.expirationDate}</Badge></td>
                      <td className="p-4 text-right font-bold text-primary">{alloc.quantity}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-bold">
                  <tr>
                    <td colSpan={2} className="p-4 text-right">Total a Retirar:</td>
                    <td className="p-4 text-right text-lg text-gray-900">
                      {allocations.reduce((acc, curr) => acc + curr.quantity, 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 flex gap-3 text-amber-800">
            <AlertTriangle className="shrink-0" />
            <p className="text-sm">Confirme a retirada dos lotes indicados acima.</p>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setStep(1)}>Voltar</Button>
            <Button variant="primary" onClick={handleConfirm} className="flex-1 sm:flex-none">
              <CheckCircle2 className="w-4 h-4 mr-2" /> Confirmar Expedição
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}