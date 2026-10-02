import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AlertTriangle, CheckCircle, Clock, XCircle, RefreshCw, Download } from 'lucide-react';
import { batchesApi, productsApi } from '../services/api';
import { exportToCsv } from '../utils/exportCsv';

const STATUS_STYLES: Record<string, { icon: React.ReactNode; label: string; cls: string }> = {
  DISPONIVEL: { icon: <CheckCircle size={14} />, label: 'Disponível', cls: 'bg-green-100 text-green-700' },
  VENCIDO:    { icon: <XCircle    size={14} />, label: 'Vencido',    cls: 'bg-red-100 text-red-700' },
  ESGOTADO:   { icon: <XCircle    size={14} />, label: 'Esgotado',   cls: 'bg-gray-100 text-gray-600' },
};

function daysUntilExpiry(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function ExpiryBadge({ date }: { date: string }) {
  const days = daysUntilExpiry(date);
  if (days < 0)  return <span className="text-xs font-semibold text-red-600">Vencido há {Math.abs(days)}d</span>;
  if (days <= 30) return <span className="text-xs font-semibold text-orange-500 flex items-center gap-1"><AlertTriangle size={12}/>Vence em {days}d</span>;
  if (days <= 90) return <span className="text-xs font-semibold text-yellow-600 flex items-center gap-1"><Clock size={12}/>Vence em {days}d</span>;
  return <span className="text-xs text-gray-500">{days}d restantes</span>;
}

export default function Batches() {
  const [batches, setBatches]   = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [filter, setFilter]     = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [loading, setLoading]   = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bRes, pRes] = await Promise.all([
        batchesApi.list(),
        productsApi.list(),
      ]);
      const rawBatches = bRes.data?.data ?? bRes.data ?? [];
      const rawProducts = pRes.data?.data ?? pRes.data ?? [];
      setBatches(rawBatches);
      setProducts(rawProducts);
    } catch {
      toast.error('Erro ao carregar lotes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const productMap = Object.fromEntries(products.map((p: any) => [p.id, p]));

  // Sort by expiry date ascending (FEFO order)
  const sorted = [...batches].sort((a, b) =>
    new Date(a.expiryDate ?? a.expiry_date).getTime() - new Date(b.expiryDate ?? b.expiry_date).getTime()
  );

  const filtered = sorted.filter(b => {
    const product = productMap[b.productId ?? b.produto_id];
    const matchName = !filter || product?.name?.toLowerCase().includes(filter.toLowerCase()) || b.batchNumber?.toLowerCase().includes(filter.toLowerCase());
    
    let matchStatus = false;
    const isVencido = b.status === 'VENCIDO' || daysUntilExpiry(b.expiryDate ?? b.expiry_date) < 0;
    const isEsgotado = b.status === 'ESGOTADO';
    const isDisponivel = b.status === 'DISPONIVEL' && !isVencido;

    if (statusFilter === 'TODOS') matchStatus = true;
    else if (statusFilter === 'VENCIDO') matchStatus = isVencido;
    else if (statusFilter === 'ESGOTADO') matchStatus = isEsgotado;
    else if (statusFilter === 'DISPONIVEL') matchStatus = isDisponivel;

    return matchName && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rastreabilidade de Lotes</h1>
          <p className="text-sm text-gray-500 mt-1">Visão geral de todos os lotes ordenados por prioridade FEFO (vencimento mais próximo primeiro)</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => exportToCsv('lotes', filtered.map(b => ({
              'Produto': productMap[b.productId ?? b.produto_id]?.name || 'Desconhecido',
              'Lote': b.batchNumber,
              'Fabricação': new Date(b.manufactureDate ?? b.data_fabricacao).toLocaleDateString('pt-BR'),
              'Validade': new Date(b.expiryDate ?? b.data_validade).toLocaleDateString('pt-BR'),
              'Qtde Inicial': b.initialQuantity ?? b.quantidade_inicial,
              'Qtde Atual': b.currentQuantity ?? b.quantidade_disponivel,
              'Status': b.status
            })))}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <Download size={16}/> Exportar CSV
          </button>
          <button onClick={fetchAll} className="flex items-center gap-2 px-3 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50">
            <RefreshCw size={16}/> Atualizar
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Buscar por produto ou nº lote..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {['TODOS', 'DISPONIVEL', 'VENCIDO', 'ESGOTADO'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-2 text-sm rounded-lg border transition-colors ${statusFilter === s ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            {s === 'TODOS' ? 'Todos' : STATUS_STYLES[s]?.label}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total de Lotes', value: batches.length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Disponíveis', value: batches.filter(b => b.status === 'DISPONIVEL').length, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Vencendo em 30d', value: batches.filter(b => b.status === 'DISPONIVEL' && daysUntilExpiry(b.expiryDate ?? b.expiry_date) <= 30).length, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Vencidos', value: batches.filter(b => b.status === 'VENCIDO' || daysUntilExpiry(b.expiryDate ?? b.expiry_date) < 0).length, color: 'text-red-600', bg: 'bg-red-50' },
        ].map(card => (
          <div key={card.label} className={`${card.bg} rounded-xl p-4`}>
            <p className="text-xs text-gray-500 font-medium">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Batch table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-40 text-gray-400">Carregando lotes...</div>
        ) : filtered.length === 0 ? (
          <div className="flex justify-center items-center h-40 text-gray-400">Nenhum lote encontrado</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Prioridade FEFO', 'Nº Lote', 'Produto', 'Data Fabricação', 'Data Validade', 'Prazo', 'Qtd. Inicial', 'Qtd. Atual', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((batch, idx) => {
                const product = productMap[batch.productId ?? batch.produto_id];
                const expiryDate = batch.expiryDate ?? batch.expiry_date;
                const manufactureDate = batch.manufactureDate ?? batch.data_fabricacao;
                const days = daysUntilExpiry(expiryDate);
                const rowBg = days < 0 ? 'bg-red-50' : days <= 30 ? 'bg-orange-50' : '';
                return (
                  <tr key={batch.id} className={`${rowBg} hover:bg-gray-50 transition-colors`}>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${idx === 0 ? 'bg-red-500 text-white' : idx === 1 ? 'bg-orange-400 text-white' : 'bg-gray-200 text-gray-600'}`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm font-semibold text-gray-700">{batch.batchNumber ?? batch.numero_lote}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{product?.name ?? '—'}</div>
                      <div className="text-xs text-gray-400">{product?.category ?? product?.categoria ?? ''}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{manufactureDate ? new Date(manufactureDate).toLocaleDateString('pt-BR') : '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{expiryDate ? new Date(expiryDate).toLocaleDateString('pt-BR') : '—'}</td>
                    <td className="px-4 py-3"><ExpiryBadge date={expiryDate} /></td>
                    <td className="px-4 py-3 text-sm text-gray-600">{batch.initialQuantity ?? batch.quantidade_inicial}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold ${(batch.currentQuantity ?? batch.quantidade_atual) === 0 ? 'text-red-500' : 'text-gray-900'}`}>
                        {batch.currentQuantity ?? batch.quantidade_atual}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const isVencido = batch.status === 'VENCIDO' || days < 0;
                        const isEsgotado = batch.status === 'ESGOTADO';
                        const effectiveStatus = isVencido ? 'VENCIDO' : isEsgotado ? 'ESGOTADO' : 'DISPONIVEL';
                        const s = STATUS_STYLES[effectiveStatus] ?? STATUS_STYLES['DISPONIVEL'];
                        return (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${s.cls}`}>
                            {s.icon} {s.label}
                          </span>
                        );
                      })()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
