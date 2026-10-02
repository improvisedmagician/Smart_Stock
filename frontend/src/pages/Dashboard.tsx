import { useState, useEffect } from 'react';
import { Package, Truck, ShoppingCart, AlertTriangle, Clock, PlayCircle, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import { dashboardApi } from '../services/api';
import { exportToCsv } from '../utils/exportCsv';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [expiring, setExpiring] = useState<any[]>([]);
  const [trend, setTrend] = useState<any[]>([]);
  const [losses, setLosses] = useState<any[]>([]);
  const [days, setDays] = useState(30);
  const [runningJob, setRunningJob] = useState(false);

  const loadAll = (d = days) => {
    Promise.all([
      dashboardApi.getMetrics(),
      dashboardApi.getExpiringBatches(d),
      dashboardApi.getTrend(),
      dashboardApi.getLosses()
    ]).then(([mRes, eRes, tRes, lRes]) => {
      setMetrics(mRes.data);
      setExpiring(eRes.data);
      setTrend(tRes.data);
      setLosses(lRes.data);
    }).catch(() => {
      toast.error('Erro ao carregar dados do dashboard');
    });
  };

  useEffect(() => { loadAll(days); }, [days]);

  const handleRunJob = async () => {
    setRunningJob(true);
    try {
      const res = await dashboardApi.runExpirationJob();
      toast.success(res.data.message || 'Job executado!');
      loadAll();
    } catch {
      toast.error('Erro ao executar o job de vencimento');
    } finally {
      setRunningJob(false);
    }
  };

  if (!metrics) return <div className="p-8 text-center text-gray-500">Carregando dashboard...</div>;

  const stats = [
    { label: 'Total Produtos', value: metrics.totalProducts || 0, icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Fornecedores Ativos', value: metrics.totalSuppliers || 0, icon: Truck, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Lotes em Estoque', value: metrics.totalBatches || 0, icon: ShoppingCart, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Alertas de Estoque', value: metrics.lowStockCount || 0, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
    { label: 'Lotes a Vencer (30d)', value: metrics.expiringSoonCount || 0, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  const totalLostUnits = losses.reduce((acc: number, l: any) => acc + (l.unidadesPerdidas || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Visão geral do estoque e indicadores de performance.</p>
        </div>
        <button
          onClick={handleRunJob}
          disabled={runningJob}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          title="Atualiza manualmente o status de todos os lotes vencidos no banco de dados"
        >
          <PlayCircle size={16} />
          {runningJob ? 'Executando...' : 'Atualizar Lotes Vencidos'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color} flex-shrink-0`}><stat.icon size={20} /></div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500 truncate">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiring Batches */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-800">Lotes a Vencer por Produto</h3>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="border border-gray-200 rounded-md px-3 py-1 text-sm focus:outline-none focus:border-primary"
            >
              <option value="7">7 dias</option>
              <option value="15">15 dias</option>
              <option value="30">30 dias</option>
              <option value="60">60 dias</option>
              <option value="90">90 dias</option>
            </select>
          </div>
          {expiring.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">
              ✅ Nenhum lote a vencer nesse período.
            </div>
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expiring} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RechartsTooltip />
                  <Bar dataKey="quantidade" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-base font-semibold mb-4 text-gray-800">Tendência de Expedição (7 dias)</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <RechartsTooltip />
                <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Losses Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-semibold text-gray-900">📉 Perdas por Vencimento</h3>
            <p className="text-xs text-gray-500 mt-0.5">Produtos com lotes vencidos no sistema — total: <strong className="text-red-600">{totalLostUnits} unidades perdidas</strong></p>
          </div>
          {losses.length > 0 && (
            <button
              onClick={() => exportToCsv('perdas_vencimento', losses.map(l => ({
                Produto: l.produto,
                Categoria: l.categoria,
                'Lotes Perdidos': l.lotesPerdidos,
                'Unidades Perdidas': l.unidadesPerdidas,
                'Último Vencimento': l.ultimoVencimento ? new Date(l.ultimoVencimento).toLocaleDateString('pt-BR') : ''
              })))}
              className="flex items-center gap-2 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <Download size={13} /> Exportar CSV
            </button>
          )}
        </div>
        {losses.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">✅ Nenhuma perda por vencimento registrada.</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 tracking-wider">
              <tr>
                <th className="px-6 py-3">Produto</th>
                <th className="px-6 py-3">Categoria</th>
                <th className="px-6 py-3">Lotes Perdidos</th>
                <th className="px-6 py-3">Unidades Perdidas</th>
                <th className="px-6 py-3">Último Vencimento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {losses.map((l: any, i: number) => (
                <tr key={i} className="hover:bg-red-50/30 transition-colors">
                  <td className="px-6 py-3 font-medium text-gray-900">{l.produto}</td>
                  <td className="px-6 py-3 text-gray-600">{l.categoria}</td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                      {l.lotesPerdidos} lote(s)
                    </span>
                  </td>
                  <td className="px-6 py-3 font-semibold text-red-600">{l.unidadesPerdidas} un.</td>
                  <td className="px-6 py-3 text-gray-600">
                    {l.ultimoVencimento ? new Date(l.ultimoVencimento).toLocaleDateString('pt-BR') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
